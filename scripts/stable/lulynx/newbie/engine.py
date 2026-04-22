from __future__ import annotations

import argparse
import math
import signal
from dataclasses import dataclass
from pathlib import Path
from time import perf_counter

import torch
from accelerate import Accelerator, DistributedDataParallelKwargs
from torch.utils.data import DataLoader
from tqdm.auto import tqdm

from library.device_utils import clean_memory_on_device
from mikazuki.plugins.training_hooks import (
    apply_modify_loss_event,
    emit_after_backward_event,
    emit_after_loss_event,
    emit_after_optimizer_step_event,
    emit_before_forward_event,
    emit_before_optimizer_step_event,
)
from lulynx.experimental_core import (
    PeakVramDiagnosticsRecorder,
    build_peak_vram_micro_batch_plan,
    create_lulynx_core,
    iter_training_micro_batches,
    normalize_lulynx_args,
)

from .adapter import attach_newbie_adapter, count_trainable_parameters
from .bridge import create_newbie_transport, instantiate_newbie_transformer
from .config import NewbieRuntimeConfig
from .dataset import (
    CaptionLengthBucketBatchSampler,
    NewbieCachedDataset,
    build_newbie_dataset_report,
    filter_cache_ready_records,
    newbie_cached_collate,
)
from .memory import (
    NewbieAdaptiveBlockSwapController,
    apply_newbie_memory_runtime_patch,
    get_newbie_max_swappable_blocks,
    maybe_apply_newbie_safe_fallback,
    move_newbie_trainable_params_to_device,
)
from .state import (
    create_newbie_optimizer,
    create_newbie_scheduler,
    load_newbie_checkpoint,
    save_newbie_adapter,
    save_newbie_checkpoint,
)


@dataclass(slots=True)
class NewbieTrainResult:
    global_step: int
    completed_epochs: int
    last_loss: float
    trainable_params: int
    total_params: int
    saved_adapter_path: str


class NewbieTrainRuntimeError(RuntimeError):
    pass


class NewbieCachedTrainer:
    def __init__(self, config: NewbieRuntimeConfig) -> None:
        self.config = config

    def _should_enable_auto_memory_runtime(self, device: torch.device) -> bool:
        if device.type != 'cuda':
            return False
        if not bool(getattr(self.config, 'newbie_safe_fallback', False)):
            return False
        total_vram_gb = float(torch.cuda.get_device_properties(device).total_memory) / float(1024 ** 3)
        return total_vram_gb <= 16.5 and self.config.model_resolution >= 1024

    def _should_use_optimized_runtime(self, device: torch.device) -> bool:
        explicit_runtime_features = (
            int(getattr(self.config, 'blocks_to_swap', 0) or 0) > 0
            or bool(getattr(self.config, 'cpu_offload_checkpointing', False))
        )
        return explicit_runtime_features or self._should_enable_auto_memory_runtime(device)

    def _build_cached_dataloader(self):
        dataset_report = build_newbie_dataset_report(
            train_data_dir=self.config.train_data_dir,
            caption_extension=self.config.caption_extension,
            max_resolution=self.config.model_resolution,
            min_bucket_reso=self.config.min_bucket_reso,
            max_bucket_reso=self.config.max_bucket_reso,
            bucket_reso_step=self.config.bucket_reso_step,
            caption_length_bucket_size=self.config.newbie_caption_length_bucket_size,
            long_caption_threshold=self.config.newbie_gemma_max_token_length,
        )
        ready_records = filter_cache_ready_records(dataset_report.records)
        if not ready_records:
            raise NewbieTrainRuntimeError('No cache-ready samples are available. Please run the cache phase first.')
        if self.config.newbie_force_cache_only and len(ready_records) != len(dataset_report.records):
            raise NewbieTrainRuntimeError('No cache-ready samples are available. Please run the cache phase first.')

        dataset = NewbieCachedDataset(ready_records)
        sampler = CaptionLengthBucketBatchSampler(
            ready_records,
            batch_size=self.config.train_batch_size,
            shuffle=True,
            seed=self.config.seed,
        )
        dataloader_workers = max(0, int(getattr(self.config, "dataloader_num_workers", 0) or 0))
        dataloader = DataLoader(
            dataset,
            batch_sampler=sampler,
            collate_fn=newbie_cached_collate,
            num_workers=dataloader_workers,
            pin_memory=torch.cuda.is_available(),
            persistent_workers=True if dataloader_workers > 0 else False,
            prefetch_factor=2 if dataloader_workers > 0 else None,
        )
        return dataset_report, ready_records, dataset, sampler, dataloader

    @staticmethod
    def _is_cuda_oom_error(exc: Exception) -> bool:
        message = str(exc or '').lower()
        return 'out of memory' in message or 'cuda error: out of memory' in message

    def train(self) -> NewbieTrainResult:
        lulynx_args = argparse.Namespace(
            **{field_name: getattr(self.config, field_name) for field_name in self.config.__dataclass_fields__}
        )
        normalize_lulynx_args(lulynx_args, route_label='Newbie LoRA', route_kind='newbie')
        lulynx_core = create_lulynx_core(lulynx_args, route_kind='newbie', route_label='Newbie LoRA')

        ddp_kwargs = DistributedDataParallelKwargs(find_unused_parameters=True)
        accelerator = Accelerator(
            mixed_precision=self.config.mixed_precision,
            gradient_accumulation_steps=self.config.gradient_accumulation_steps,
            kwargs_handlers=[ddp_kwargs],
            log_with='tensorboard',
            project_dir=str(self.config.output_dir),
        )

        dataset_report, ready_records, dataset, sampler, dataloader = self._build_cached_dataloader()
        micro_batches_per_epoch = max(1, len(dataloader))
        optimizer_steps_per_epoch = max(
            1,
            math.ceil(micro_batches_per_epoch / max(1, int(self.config.gradient_accumulation_steps))),
        )

        model, _ = instantiate_newbie_transformer(
            repo_root=self.config.repo_root,
            base_model_path=self.config.pretrained_model_name_or_path,
            mixed_precision=self.config.mixed_precision,
            trust_remote_code=self.config.trust_remote_code,
            load_weights_to_cpu=True,
        )
        model = attach_newbie_adapter(model, self.config)

        use_optimized_runtime = self._should_use_optimized_runtime(accelerator.device)
        if use_optimized_runtime:
            model = apply_newbie_memory_runtime_patch(model)
            fallback_notes = maybe_apply_newbie_safe_fallback(self.config, model, accelerator.device)
            for note in fallback_notes:
                if accelerator.is_main_process:
                    print(note)
            if accelerator.is_main_process:
                print('[newbie-train] using optimized runtime path (memory patch enabled).')
        elif accelerator.is_main_process:
            print('[newbie-train] using official-compatible runtime path (custom memory patch disabled).')

        if getattr(self.config, 'blocks_to_swap', 0) and getattr(self.config, 'cpu_offload_checkpointing', False):
            raise NewbieTrainRuntimeError('blocks_to_swap cannot be enabled together with cpu_offload_checkpointing.')

        if self.config.gradient_checkpointing:
            if hasattr(model, 'enable_gradient_checkpointing'):
                model.enable_gradient_checkpointing(cpu_offload=bool(getattr(self.config, 'cpu_offload_checkpointing', False)))
            elif hasattr(model, 'gradient_checkpointing_enable'):
                model.gradient_checkpointing_enable()

        if getattr(self.config, 'blocks_to_swap', 0) > 0:
            model.enable_block_swap(int(self.config.blocks_to_swap), accelerator.device, supports_backward=True)

        transport, _ = create_newbie_transport(
            repo_root=self.config.repo_root,
            resolution=self.config.model_resolution,
        )
        optimizer = create_newbie_optimizer(model, self.config)
        scheduler_bundle = create_newbie_scheduler(optimizer, self.config, optimizer_steps_per_epoch)

        is_swapping_blocks = use_optimized_runtime and int(getattr(self.config, 'blocks_to_swap', 0) or 0) > 0
        if is_swapping_blocks:
            model = accelerator.prepare(model, device_placement=[False])
            optimizer, dataloader, scheduler = accelerator.prepare(
                optimizer,
                dataloader,
                scheduler_bundle.scheduler,
            )
            accelerator.unwrap_model(model).move_to_device_except_swap_blocks(accelerator.device)
            accelerator.unwrap_model(model).prepare_block_swap_before_forward()
        else:
            model, optimizer, dataloader, scheduler = accelerator.prepare(
                model,
                optimizer,
                dataloader,
                scheduler_bundle.scheduler,
            )

        if accelerator.is_main_process:
            accelerator.init_trackers('newbie_lora_train')

        unwrapped_model = accelerator.unwrap_model(model)
        start_step = load_newbie_checkpoint(
            self.config.output_dir,
            unwrapped_model,
            optimizer,
            scheduler,
            resume_path=self.config.resume,
        )
        trainable_params, total_params = count_trainable_parameters(unwrapped_model)
        if lulynx_core is not None:
            lulynx_core.attach_runtime(train_text_encoder=False, network=unwrapped_model)


        adaptive_controller = None
        if accelerator.device.type == 'cuda' and int(getattr(unwrapped_model, 'blocks_to_swap', 0) or 0) > 0:
            adaptive_controller = NewbieAdaptiveBlockSwapController(
                device=accelerator.device,
                current_blocks=int(getattr(unwrapped_model, 'blocks_to_swap', 0) or 0),
                max_blocks=get_newbie_max_swappable_blocks(unwrapped_model),
                allow_auto_release=bool(getattr(self.config, 'newbie_auto_swap_release', False)),
            )
        peak_vram_diagnostics = PeakVramDiagnosticsRecorder(
            self.config,
            route_label='newbie',
            device=accelerator.device,
        )

        startup_guard_release_step = max(0, int(getattr(self.config, 'peak_vram_startup_guard_steps', 0) or 0))
        startup_guard_release_blocks = int(getattr(self.config, 'peak_vram_startup_guard_release_blocks', 0) or 0)
        startup_guard_release_done = startup_guard_release_step <= 0 or startup_guard_release_blocks == int(
            getattr(unwrapped_model, 'blocks_to_swap', 0) or 0
        )

        global_step = start_step
        last_loss = 0.0
        completed_epochs = 0
        stop_training_requested = False
        stop_training_reason = None
        max_train_steps = scheduler_bundle.total_training_steps
        max_train_epochs = self.config.max_train_epochs if self.config.max_train_epochs > 0 else 1
        save_every_steps = max(0, int(getattr(self.config, 'save_every_n_steps', 0) or 0))
        save_every_epochs = max(0, int(getattr(self.config, 'save_every_n_epochs', 0) or 0))
        last_periodic_save_step = -1
        start_epoch = min(max_train_epochs - 1, start_step // optimizer_steps_per_epoch) if start_step > 0 else 0
        resume_micro_step = 0
        if start_step > 0:
            resume_micro_step = (start_step % optimizer_steps_per_epoch) * max(1, int(self.config.gradient_accumulation_steps))
            if accelerator.is_main_process:
                print(
                    f"[newbie-train] resume detected | start_step={start_step} | "
                    f"start_epoch={start_epoch + 1} | skip_micro_batches={resume_micro_step}"
                )

        def _save_periodic_artifacts(step: int, reason: str, epoch_index: int) -> None:
            nonlocal last_periodic_save_step
            if not accelerator.is_main_process:
                return
            if step <= 0 or step == last_periodic_save_step:
                return
            checkpoint_path = save_newbie_checkpoint(
                self.config.output_dir,
                accelerator.unwrap_model(model),
                optimizer,
                scheduler,
                step,
            )
            adapter_path = save_newbie_adapter(
                self.config.output_dir,
                self.config.output_name,
                accelerator.unwrap_model(model),
                step,
            )
            last_periodic_save_step = step
            print(
                f"[newbie-train] periodic save ({reason}) | "
                f"epoch={epoch_index + 1}/{max_train_epochs} | global_step={step} | "
                f"checkpoint={checkpoint_path} | adapter={adapter_path}"
            )

        progress_bar = None
        if accelerator.is_main_process:
            print(
                f"[newbie-train] entering optimization loop | total_steps={max_train_steps} | "
                f"steps_per_epoch={optimizer_steps_per_epoch} | epochs={max_train_epochs}"
            )
            progress_bar = tqdm(
                total=max_train_steps,
                initial=start_step,
                desc='newbie-steps',
                dynamic_ncols=True,
                leave=True,
            )
        graceful_interrupt = {"signal": None}
        previous_signal_handlers = {}
        def _format_interrupt_signal(signum) -> str:
            try:
                return signal.Signals(int(signum)).name
            except Exception:
                return f"signal-{signum}"
        def _request_graceful_stop(signum, _frame):
            signal_name = _format_interrupt_signal(signum)
            if graceful_interrupt["signal"] is None:
                graceful_interrupt["signal"] = int(signum)
                if accelerator.is_main_process:
                    print(
                        f"[newbie-train] received {signal_name}; requesting graceful shutdown after the current unit of work. "
                        "A resumable checkpoint will be written before exit."
                    )
            elif accelerator.is_main_process:
                print(f"[newbie-train] received {signal_name} again while graceful shutdown is already pending.")
        def _graceful_stop_requested() -> bool:
            return graceful_interrupt["signal"] is not None
        def _graceful_stop_reason() -> str:
            return f"Training interrupted by {_format_interrupt_signal(graceful_interrupt['signal'])}."
        for candidate_signum in (signal.SIGINT, getattr(signal, "SIGTERM", None)):
            if candidate_signum is None:
                continue
            previous_signal_handlers[candidate_signum] = signal.getsignal(candidate_signum)
            signal.signal(candidate_signum, _request_graceful_stop)
        for epoch in range(start_epoch, max_train_epochs):
            if _graceful_stop_requested():
                stop_training_reason = _graceful_stop_reason()
                stop_training_requested = True
                break
            if hasattr(sampler, 'set_epoch'):
                sampler.set_epoch(epoch)
            epoch_start = perf_counter()
            for batch_index, batch in enumerate(dataloader):
                if epoch == start_epoch and resume_micro_step > 0 and batch_index < resume_micro_step:
                    continue
                if _graceful_stop_requested():
                    stop_training_reason = _graceful_stop_reason()
                    stop_training_requested = True
                    break
                if global_step >= max_train_steps:
                    break
                batch_retry = 0
                current_loss = last_loss
                while True:
                    try:
                        if is_swapping_blocks and getattr(unwrapped_model, 'blocks_to_swap', 0):
                            unwrapped_model.prepare_block_swap_before_forward()

                        with accelerator.accumulate(model):
                            micro_batch_plan = build_peak_vram_micro_batch_plan(self.config, batch)
                            peak_vram_diagnostics.start_step(
                                global_step + 1,
                                batch_size=micro_batch_plan.actual_batch_size,
                                micro_batch_size=micro_batch_plan.micro_batch_size,
                                split_count=micro_batch_plan.split_count,
                            )
                            weighted_loss = 0.0

                            micro_batch_count = max(1, int(micro_batch_plan.split_count or 1))
                            for micro_batch_index, (micro_batch, sub_batch_size, loss_scale) in enumerate(
                                iter_training_micro_batches(batch, micro_batch_plan),
                                start=1,
                            ):
                                emit_before_forward_event(
                                    route='newbie',
                                    training_type=getattr(self.config, 'model_train_type', ''),
                                    global_step=global_step,
                                    micro_batch_index=micro_batch_index,
                                    micro_batch_count=micro_batch_count,
                                    micro_batch_size=sub_batch_size,
                                    gradient_accumulation_steps=getattr(self.config, 'gradient_accumulation_steps', 1),
                                    sync_gradients=bool(accelerator.sync_gradients),
                                    extra={
                                        'uses_lulynx_core': lulynx_core is not None,
                                        'optimized_runtime': bool(use_optimized_runtime),
                                        'block_swap_active': bool(is_swapping_blocks),
                                    },
                                    source='newbie_engine',
                                )
                                latents = micro_batch['latents'].to(accelerator.device, non_blocking=True)
                                cap_feats = micro_batch['cap_feats'].to(accelerator.device, non_blocking=True)
                                cap_mask = micro_batch['cap_mask'].to(accelerator.device, non_blocking=True)
                                clip_text_pooled = micro_batch['clip_text_pooled'].to(
                                    accelerator.device,
                                    non_blocking=True,
                                )
                                loss_dict = transport.training_losses(
                                    model,
                                    latents,
                                    model_kwargs={
                                        'cap_feats': cap_feats,
                                        'cap_mask': cap_mask,
                                        'clip_text_pooled': clip_text_pooled,
                                    },
                                )
                                loss = loss_dict['loss'].mean()
                                peak_vram_diagnostics.capture('forward')
                                raw_loss_value = float(loss.detach().item())
                                emit_after_loss_event(
                                    route='newbie',
                                    training_type=getattr(self.config, 'model_train_type', ''),
                                    global_step=global_step,
                                    micro_batch_index=micro_batch_index,
                                    micro_batch_count=micro_batch_count,
                                    micro_batch_size=sub_batch_size,
                                    loss_value=raw_loss_value,
                                    loss_scale=loss_scale,
                                    weighted_loss=weighted_loss + (raw_loss_value * loss_scale),
                                    gradient_accumulation_steps=getattr(self.config, 'gradient_accumulation_steps', 1),
                                    sync_gradients=bool(accelerator.sync_gradients),
                                    extra={
                                        'uses_lulynx_core': lulynx_core is not None,
                                        'optimized_runtime': bool(use_optimized_runtime),
                                        'block_swap_active': bool(is_swapping_blocks),
                                        'modify_loss_runtime_supported': True,
                                    },
                                    source='newbie_engine',
                                )
                                loss_mutation = apply_modify_loss_event(
                                    loss=loss,
                                    route='newbie',
                                    training_type=getattr(self.config, 'model_train_type', ''),
                                    global_step=global_step,
                                    micro_batch_index=micro_batch_index,
                                    micro_batch_count=micro_batch_count,
                                    micro_batch_size=sub_batch_size,
                                    loss_value=raw_loss_value,
                                    loss_scale=loss_scale,
                                    gradient_accumulation_steps=getattr(self.config, 'gradient_accumulation_steps', 1),
                                    sync_gradients=bool(accelerator.sync_gradients),
                                    extra={
                                        'uses_lulynx_core': lulynx_core is not None,
                                        'optimized_runtime': bool(use_optimized_runtime),
                                        'block_swap_active': bool(is_swapping_blocks),
                                    },
                                    source='newbie_engine',
                                )
                                loss = loss_mutation.loss
                                loss_value = loss_mutation.final_loss_value
                                weighted_loss += loss_value * loss_scale
                                scaled_loss = loss * loss_scale
                                if lulynx_core is not None:
                                    lulynx_core.backward(
                                        loss=scaled_loss,
                                        accelerator=accelerator,
                                        optimizer=optimizer,
                                        network=unwrapped_model,
                                        per_sample_losses=None,
                                    )
                                else:
                                    accelerator.backward(scaled_loss)
                                peak_vram_diagnostics.capture('backward')
                                emit_after_backward_event(
                                    route='newbie',
                                    training_type=getattr(self.config, 'model_train_type', ''),
                                    global_step=global_step,
                                    micro_batch_index=micro_batch_index,
                                    micro_batch_count=micro_batch_count,
                                    micro_batch_size=sub_batch_size,
                                    loss_value=loss_value,
                                    loss_scale=loss_scale,
                                    backward_loss=loss_value * float(loss_scale),
                                    weighted_loss=weighted_loss,
                                    gradient_accumulation_steps=getattr(self.config, 'gradient_accumulation_steps', 1),
                                    sync_gradients=bool(accelerator.sync_gradients),
                                    extra={
                                        'uses_lulynx_core': lulynx_core is not None,
                                        'optimized_runtime': bool(use_optimized_runtime),
                                        'block_swap_active': bool(is_swapping_blocks),
                                        'raw_loss': raw_loss_value,
                                        'loss_modified': bool(loss_mutation.modified),
                                        'loss_modifier_scale': float(loss_mutation.scale),
                                        'loss_modifier_bias': float(loss_mutation.bias),
                                        'modify_loss_exclusive_conflict': bool(loss_mutation.dispatch.get('exclusive_conflict')),
                                        'modify_loss_error_count': len(loss_mutation.dispatch.get('errors') or []),
                                        **(
                                            {'loss_modifier_reason': loss_mutation.reason}
                                            if loss_mutation.reason
                                            else {}
                                        ),
                                    },
                                    source='newbie_engine',
                                )
                                if is_swapping_blocks and getattr(unwrapped_model, 'blocks_to_swap', 0):
                                    move_newbie_trainable_params_to_device(unwrapped_model, accelerator.device)

                            if accelerator.sync_gradients and getattr(self.config, 'max_grad_norm', 1.0) not in (0, 0.0, None):
                                accelerator.clip_grad_norm_(model.parameters(), float(getattr(self.config, 'max_grad_norm', 1.0)))
                            emit_before_optimizer_step_event(
                                route='newbie',
                                training_type=getattr(self.config, 'model_train_type', ''),
                                global_step=global_step,
                                current_loss=weighted_loss,
                                optimizer=optimizer,
                                lr_scheduler=scheduler,
                                gradient_accumulation_steps=getattr(self.config, 'gradient_accumulation_steps', 1),
                                sync_gradients=bool(accelerator.sync_gradients),
                                max_grad_norm=getattr(self.config, 'max_grad_norm', 0.0),
                                extra={
                                    'uses_lulynx_core': lulynx_core is not None,
                                    'optimized_runtime': bool(use_optimized_runtime),
                                    'block_swap_active': bool(is_swapping_blocks),
                                },
                                source='newbie_engine',
                            )
                            optimizer.step()
                            scheduler.step()
                            optimizer.zero_grad(set_to_none=True)
                            peak_vram_diagnostics.capture('optimizer')
                            emit_after_optimizer_step_event(
                                route='newbie',
                                training_type=getattr(self.config, 'model_train_type', ''),
                                global_step=global_step,
                                current_loss=weighted_loss,
                                optimizer=optimizer,
                                lr_scheduler=scheduler,
                                gradient_accumulation_steps=getattr(self.config, 'gradient_accumulation_steps', 1),
                                sync_gradients=bool(accelerator.sync_gradients),
                                max_grad_norm=getattr(self.config, 'max_grad_norm', 0.0),
                                optimizer_step_executed=True,
                                scheduler_step_executed=True,
                                zero_grad_called=True,
                                extra={
                                    'uses_lulynx_core': lulynx_core is not None,
                                    'optimized_runtime': bool(use_optimized_runtime),
                                    'block_swap_active': bool(is_swapping_blocks),
                                },
                                source='newbie_engine',
                            )
                            current_loss = weighted_loss
                        break
                    except RuntimeError as exc:
                        if (
                            not use_optimized_runtime
                            or not self._is_cuda_oom_error(exc)
                            or not bool(getattr(self.config, 'newbie_safe_fallback', False))
                            or accelerator.device.type != 'cuda'
                            or batch_retry >= 2
                        ):
                            raise

                        optimizer.zero_grad(set_to_none=True)
                        clean_memory_on_device(accelerator.device)
                        current_blocks = int(getattr(unwrapped_model, 'blocks_to_swap', 0) or 0)
                        max_blocks = get_newbie_max_swappable_blocks(unwrapped_model)

                        if not getattr(self.config, 'cpu_offload_checkpointing', False) and current_blocks < max_blocks:
                            next_blocks = min(max_blocks, max(current_blocks + 2, 2))
                            try:
                                unwrapped_model.reconfigure_block_swap(next_blocks, accelerator.device)
                            except Exception as reconfigure_exc:
                                clean_memory_on_device(accelerator.device)
                                raise NewbieTrainRuntimeError(
                                    'Newbie failed to strengthen block swap after an OOM. '
                                    f'Current blocks_to_swap={current_blocks}, target={next_blocks}. '
                                    'Please restart training with a higher blocks_to_swap, or reduce batch size / resolution. '
                                    f'Original reconfigure error: {reconfigure_exc}'
                                ) from reconfigure_exc
                            self.config.blocks_to_swap = next_blocks
                            if adaptive_controller is not None:
                                adaptive_controller.current_blocks = next_blocks
                            if accelerator.is_main_process:
                                print(
                                    f'[newbie-train] safe fallback retried current batch with stronger block swap: '
                                    f'{current_blocks} -> {next_blocks}'
                                )
                            batch_retry += 1
                            continue

                        if not getattr(self.config, 'cpu_offload_checkpointing', False):
                            self.config.cpu_offload_checkpointing = True
                            self.config.gradient_checkpointing = True
                            unwrapped_model.enable_gradient_checkpointing(cpu_offload=True)
                            if current_blocks > 0:
                                unwrapped_model.disable_block_swap()
                                self.config.blocks_to_swap = 0
                                if adaptive_controller is not None:
                                    adaptive_controller.current_blocks = 0
                            if accelerator.is_main_process:
                                print('[newbie-train] safe fallback retried current batch with cpu_offload_checkpointing enabled.')
                            batch_retry += 1
                            continue

                        raise

                if accelerator.sync_gradients:
                    global_step += 1
                    last_loss = float(current_loss)
                    peak_vram_logs, peak_vram_message = peak_vram_diagnostics.finish_step()
                    if peak_vram_message and accelerator.is_main_process:
                        print(peak_vram_message)

                    step_logs = {
                        'loss': last_loss,
                        'learning_rate': float(scheduler.get_last_lr()[0]),
                        'epoch': epoch + 1,
                    }
                    if peak_vram_logs:
                        step_logs.update(peak_vram_logs)
                    if progress_bar is not None:
                        current_lr = scheduler.get_last_lr()[0]
                        progress_bar.update(1)
                        progress_bar.set_postfix(
                            loss=f"{last_loss:.4f}",
                            lr=f"{float(current_lr):.2e}",
                            epoch=f"{epoch + 1}/{max_train_epochs}",
                        )
                    if not startup_guard_release_done and global_step >= startup_guard_release_step:
                        current_blocks = int(getattr(unwrapped_model, 'blocks_to_swap', 0) or 0)
                        if startup_guard_release_blocks != current_blocks:
                            try:
                                unwrapped_model.reconfigure_block_swap(startup_guard_release_blocks, accelerator.device)
                                self.config.blocks_to_swap = startup_guard_release_blocks
                                if adaptive_controller is not None:
                                    adaptive_controller.current_blocks = startup_guard_release_blocks
                                if accelerator.is_main_process:
                                    print(
                                        f"[newbie-train] startup peak guard released block swap: "
                                        f"{current_blocks} -> {startup_guard_release_blocks} "
                                        f"at step {global_step}"
                                    )
                            except Exception as release_exc:
                                if accelerator.is_main_process:
                                    print(
                                        f"[newbie-train] warning: startup peak guard release skipped at step {global_step}: {release_exc}"
                                    )
                        startup_guard_release_done = True

                    if adaptive_controller is not None:
                        adaptive_note = adaptive_controller.on_optimizer_step(
                            step=global_step,
                            model=unwrapped_model,
                        )
                        self.config.blocks_to_swap = adaptive_controller.current_blocks
                        if adaptive_note and accelerator.is_main_process:
                            print(adaptive_note)
                    if lulynx_core is not None:
                        lulynx_decision = lulynx_core.on_optimizer_step(
                            global_step=global_step,
                            current_loss=last_loss,
                            average_loss=None,
                            optimizer=optimizer,
                            lr_scheduler=scheduler,
                            accelerator=accelerator,
                            network=unwrapped_model,
                        )
                        if lulynx_decision.logs:
                            step_logs.update(lulynx_decision.logs)
                        if lulynx_decision.stop_training and not stop_training_requested:
                            stop_training_reason = lulynx_decision.reason or 'Lulynx experimental core requested stop.'
                            stop_training_requested = True
                    accelerator.log(step_logs, step=global_step)
                    if not stop_training_requested and _graceful_stop_requested():
                        stop_training_reason = _graceful_stop_reason()
                        stop_training_requested = True
                    if save_every_steps > 0 and global_step % save_every_steps == 0:
                        _save_periodic_artifacts(global_step, f"every_{save_every_steps}_steps", epoch)
                    if stop_training_requested:
                        break

            resume_micro_step = 0
            completed_epochs = epoch + 1
            epoch_seconds = perf_counter() - epoch_start
            if accelerator.is_main_process:
                print(
                    f"[newbie-train] epoch {completed_epochs}/{max_train_epochs} done | "
                    f"global_step={global_step} | loss={last_loss:.6f} | "
                    f"epoch_time={epoch_seconds:.2f}s | cache_ready={len(ready_records)}/{dataset_report.total_images} | "
                    f"blocks_to_swap={getattr(unwrapped_model, 'blocks_to_swap', 0)} | cpu_offload={'on' if getattr(self.config, 'cpu_offload_checkpointing', False) else 'off'}"
                )
            if save_every_epochs == 0:
                _save_periodic_artifacts(global_step, "every_epoch", epoch)
            elif completed_epochs % save_every_epochs == 0:
                _save_periodic_artifacts(global_step, f"every_{save_every_epochs}_epochs", epoch)
            if stop_training_requested:
                if accelerator.is_main_process:
                    print(f"[newbie-train] stopped early by Lulynx experimental core: {stop_training_reason}")
                break
            if global_step >= max_train_steps:
                break
        if progress_bar is not None:
            progress_bar.close()

        accelerator.wait_for_everyone()
        final_adapter_path = Path(self.config.output_dir) / self.config.output_name
        if accelerator.is_main_process:
            final_adapter_path = Path(
                save_newbie_adapter(
                    self.config.output_dir,
                    self.config.output_name,
                    accelerator.unwrap_model(model),
                    None,
                )
            )
            save_newbie_checkpoint(self.config.output_dir, accelerator.unwrap_model(model), optimizer, scheduler, global_step)
        for signum, previous_handler in previous_signal_handlers.items():
            signal.signal(signum, previous_handler)
        accelerator.end_training()
        return NewbieTrainResult(
            global_step=global_step,
            completed_epochs=completed_epochs,
            last_loss=last_loss,
            trainable_params=trainable_params,
            total_params=total_params,
            saved_adapter_path=str(final_adapter_path),
        )








