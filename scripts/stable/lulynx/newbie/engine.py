from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from time import perf_counter

import torch
from accelerate import Accelerator, DistributedDataParallelKwargs
from torch.utils.data import DataLoader
from tqdm.auto import tqdm

from library.device_utils import clean_memory_on_device

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
            raise NewbieTrainRuntimeError('当前没有可用的缓存样本；请先运行 cache phase。')
        if self.config.newbie_force_cache_only and len(ready_records) != len(dataset_report.records):
            raise NewbieTrainRuntimeError('force_cache_only 已开启，但仍有样本缺少缓存；请先完成 cache phase。')

        dataset = NewbieCachedDataset(ready_records)
        sampler = CaptionLengthBucketBatchSampler(
            ready_records,
            batch_size=self.config.train_batch_size,
            shuffle=True,
            seed=self.config.seed,
        )
        dataloader = DataLoader(
            dataset,
            batch_sampler=sampler,
            collate_fn=newbie_cached_collate,
            num_workers=0,
            pin_memory=torch.cuda.is_available(),
        )
        return dataset_report, ready_records, dataset, sampler, dataloader

    @staticmethod
    def _is_cuda_oom_error(exc: Exception) -> bool:
        message = str(exc or '').lower()
        return 'out of memory' in message or 'cuda error: out of memory' in message

    def train(self) -> NewbieTrainResult:
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
        model = apply_newbie_memory_runtime_patch(model)
        model = attach_newbie_adapter(model, self.config)

        fallback_notes = maybe_apply_newbie_safe_fallback(self.config, model, accelerator.device)
        for note in fallback_notes:
            if accelerator.is_main_process:
                print(note)

        if getattr(self.config, 'blocks_to_swap', 0) and getattr(self.config, 'cpu_offload_checkpointing', False):
            raise NewbieTrainRuntimeError('blocks_to_swap 不能与 cpu_offload_checkpointing 同时启用。')

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

        is_swapping_blocks = int(getattr(self.config, 'blocks_to_swap', 0) or 0) > 0
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

        adaptive_controller = None
        if accelerator.device.type == 'cuda' and int(getattr(unwrapped_model, 'blocks_to_swap', 0) or 0) > 0:
            adaptive_controller = NewbieAdaptiveBlockSwapController(
                device=accelerator.device,
                current_blocks=int(getattr(unwrapped_model, 'blocks_to_swap', 0) or 0),
                max_blocks=get_newbie_max_swappable_blocks(unwrapped_model),
                allow_auto_release=bool(getattr(self.config, 'newbie_auto_swap_release', False)),
            )

        global_step = start_step
        last_loss = 0.0
        completed_epochs = 0
        max_train_steps = scheduler_bundle.total_training_steps
        max_train_epochs = self.config.max_train_epochs if self.config.max_train_epochs > 0 else 1
        save_every = max(0, int(getattr(self.config, 'save_every_n_steps', 0) or 0))
        start_epoch = min(max_train_epochs - 1, start_step // optimizer_steps_per_epoch) if start_step > 0 else 0
        resume_micro_step = 0
        if start_step > 0:
            resume_micro_step = (start_step % optimizer_steps_per_epoch) * max(1, int(self.config.gradient_accumulation_steps))
            if accelerator.is_main_process:
                print(
                    f"[newbie-train] resume detected | start_step={start_step} | "
                    f"start_epoch={start_epoch + 1} | skip_micro_batches={resume_micro_step}"
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

        for epoch in range(start_epoch, max_train_epochs):
            if hasattr(sampler, 'set_epoch'):
                sampler.set_epoch(epoch)
            epoch_start = perf_counter()
            for batch_index, batch in enumerate(dataloader):
                if epoch == start_epoch and resume_micro_step > 0 and batch_index < resume_micro_step:
                    continue
                if global_step >= max_train_steps:
                    break

                batch_retry = 0
                while True:
                    try:
                        if getattr(unwrapped_model, 'blocks_to_swap', 0):
                            unwrapped_model.prepare_block_swap_before_forward()

                        with accelerator.accumulate(model):
                            latents = batch['latents'].to(accelerator.device)
                            cap_feats = batch['cap_feats'].to(accelerator.device)
                            cap_mask = batch['cap_mask'].to(accelerator.device)
                            clip_text_pooled = batch['clip_text_pooled'].to(accelerator.device)
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
                            accelerator.backward(loss)
                            if getattr(unwrapped_model, 'blocks_to_swap', 0):
                                move_newbie_trainable_params_to_device(unwrapped_model, accelerator.device)
                            if accelerator.sync_gradients and getattr(self.config, 'max_grad_norm', 1.0) not in (0, 0.0, None):
                                accelerator.clip_grad_norm_(model.parameters(), float(getattr(self.config, 'max_grad_norm', 1.0)))
                            optimizer.step()
                            scheduler.step()
                            optimizer.zero_grad(set_to_none=True)
                        break
                    except RuntimeError as exc:
                        if not self._is_cuda_oom_error(exc) or not bool(getattr(self.config, 'newbie_safe_fallback', False)) or accelerator.device.type != 'cuda' or batch_retry >= 2:
                            raise

                        optimizer.zero_grad(set_to_none=True)
                        clean_memory_on_device(accelerator.device)
                        current_blocks = int(getattr(unwrapped_model, 'blocks_to_swap', 0) or 0)
                        max_blocks = get_newbie_max_swappable_blocks(unwrapped_model)

                        if not getattr(self.config, 'cpu_offload_checkpointing', False) and current_blocks < max_blocks:
                            next_blocks = min(max_blocks, max(current_blocks + 2, 2))
                            unwrapped_model.reconfigure_block_swap(next_blocks, accelerator.device)
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
                    last_loss = float(loss.detach().item())
                    accelerator.log(
                        {
                            'loss': last_loss,
                            'learning_rate': float(scheduler.get_last_lr()[0]),
                            'epoch': epoch + 1,
                        },
                        step=global_step,
                    )
                    if progress_bar is not None:
                        current_lr = scheduler.get_last_lr()[0]
                        progress_bar.update(1)
                        progress_bar.set_postfix(
                            loss=f"{last_loss:.4f}",
                            lr=f"{float(current_lr):.2e}",
                            epoch=f"{epoch + 1}/{max_train_epochs}",
                        )
                    if adaptive_controller is not None:
                        adaptive_note = adaptive_controller.on_optimizer_step(
                            step=global_step,
                            model=unwrapped_model,
                        )
                        self.config.blocks_to_swap = adaptive_controller.current_blocks
                        if adaptive_note and accelerator.is_main_process:
                            print(adaptive_note)
                    if save_every > 0 and global_step % save_every == 0 and accelerator.is_main_process:
                        save_newbie_checkpoint(self.config.output_dir, accelerator.unwrap_model(model), optimizer, scheduler, global_step)
                        save_newbie_adapter(self.config.output_dir, self.config.output_name, accelerator.unwrap_model(model), global_step)

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
        accelerator.end_training()
        return NewbieTrainResult(
            global_step=global_step,
            completed_epochs=completed_epochs,
            last_loss=last_loss,
            trainable_params=trainable_params,
            total_params=total_params,
            saved_adapter_path=str(final_adapter_path),
        )



