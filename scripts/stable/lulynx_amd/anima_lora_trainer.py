from __future__ import annotations

from contextlib import contextmanager
import math

import torch
from library import anima_train_utils
from lulynx.anima_lora_trainer import AnimaNetworkTrainer as _BaseAnimaNetworkTrainer
from lulynx_amd.anima_monitor import AmdAnimaDiagnosticsMonitor, patch_anima_timing_profiler
from lulynx_amd.anima_runtime import (
    apply_anima_amd_experimental_policy,
    is_amd_rocm_runtime,
    log_anima_amd_experimental_banner,
)
from mikazuki.utils.runtime_safe_preview import temporary_anima_safe_preview_backend


@contextmanager
def _temporary_anima_amd_runtime_patches():
    original_should_use_pinned_memory = anima_train_utils.should_use_anima_pinned_memory
    original_should_use_non_blocking = anima_train_utils.should_use_anima_non_blocking

    try:
        anima_train_utils.should_use_anima_pinned_memory = lambda accelerator: False
        anima_train_utils.should_use_anima_non_blocking = lambda accelerator: False
        yield
    finally:
        anima_train_utils.should_use_anima_pinned_memory = original_should_use_pinned_memory
        anima_train_utils.should_use_anima_non_blocking = original_should_use_non_blocking


def _should_generate_sample_images(args, epoch, global_step) -> bool:
    if not getattr(args, "sample_prompts", None):
        return False

    if global_step == 0:
        return bool(getattr(args, "sample_at_first", False))

    sample_every_n_steps = getattr(args, "sample_every_n_steps", None)
    sample_every_n_epochs = getattr(args, "sample_every_n_epochs", None)
    if sample_every_n_steps is None and sample_every_n_epochs is None:
        return False

    if sample_every_n_epochs is not None:
        return epoch is not None and epoch % sample_every_n_epochs == 0

    return epoch is None and sample_every_n_steps is not None and global_step % sample_every_n_steps == 0


class AnimaNetworkTrainer(_BaseAnimaNetworkTrainer):
    def __init__(self):
        super().__init__()
        self._amd_monitor = None
        self._amd_empty_cache_interval = 0

    def _get_amd_monitor(self):
        if not is_amd_rocm_runtime():
            return None
        return self._amd_monitor

    def _cleanup_amd_runtime_memory(self) -> None:
        if not is_amd_rocm_runtime():
            return
        if not torch.cuda.is_available():
            return
        try:
            torch.cuda.empty_cache()
        except Exception:
            return

    def cache_text_encoder_outputs_if_needed(
        self,
        args,
        accelerator,
        text_encoders,
        dataset,
        tokenize_strategy,
        text_encoding_strategy,
    ):
        result = super().cache_text_encoder_outputs_if_needed(
            args,
            accelerator,
            text_encoders,
            dataset,
            tokenize_strategy,
            text_encoding_strategy,
        )
        monitor = self._get_amd_monitor()
        if monitor is not None:
            monitor.record_event(
                "文本编码缓存阶段已完成。",
                extra={
                    "cache_text_encoder_outputs": bool(getattr(args, "cache_text_encoder_outputs", False)),
                    "cache_text_encoder_outputs_to_disk": bool(getattr(args, "cache_text_encoder_outputs_to_disk", False)),
                },
            )
            monitor.record_memory_snapshot(label="text_encoder_cache")
        self._cleanup_amd_runtime_memory()
        return result

    def process_batch(
        self,
        batch,
        text_encoders,
        unet,
        network,
        vae,
        noise_scheduler,
        vae_dtype,
        weight_dtype,
        accelerator,
        args,
        text_encoding_strategy,
        tokenize_strategy,
        train_text_encoder=True,
        profiler=None,
        use_non_blocking: bool = False,
        run_nan_check: bool = True,
        return_per_sample_loss: bool = False,
    ):
        batch_result = super().process_batch(
            batch,
            text_encoders,
            unet,
            network,
            vae,
            noise_scheduler,
            vae_dtype,
            weight_dtype,
            accelerator,
            args,
            text_encoding_strategy,
            tokenize_strategy,
            train_text_encoder=train_text_encoder,
            profiler=profiler,
            use_non_blocking=use_non_blocking,
            run_nan_check=run_nan_check,
            return_per_sample_loss=return_per_sample_loss,
        )
        if return_per_sample_loss:
            loss, per_sample_losses = batch_result
        else:
            loss = batch_result
        monitor = self._get_amd_monitor()
        if monitor is not None:
            try:
                monitor.record_loss(float(loss.detach().item()))
            except Exception:
                monitor.record_loss(float("nan"))
        return (loss, per_sample_losses) if return_per_sample_loss else loss

    def all_reduce_network(self, accelerator, network):
        super().all_reduce_network(accelerator, network)

        monitor = self._get_amd_monitor()
        if monitor is None:
            return

        next_global_step = monitor.optimizer_steps_observed + 1
        monitor.note_optimizer_step(next_global_step=next_global_step)
        grad_norm, non_finite_grad_count = monitor.capture_grad_norm_from_network(network)

        if non_finite_grad_count > 0 or (grad_norm is not None and not math.isfinite(grad_norm)):
            monitor.record_event(
                "检测到非有限梯度，训练已触发熔断。",
                level="error",
                extra={
                    "global_step": next_global_step,
                    "grad_norm": grad_norm,
                    "non_finite_grad_count": non_finite_grad_count,
                },
            )
            monitor.record_memory_snapshot(label="non_finite_grad", global_step=next_global_step)
            raise RuntimeError("AMD 实验核心检测到非有限梯度，已中止当前训练并导出诊断信息。")

        if self._amd_empty_cache_interval > 0 and next_global_step % self._amd_empty_cache_interval == 0:
            self._cleanup_amd_runtime_memory()
            monitor.record_event(
                "已按周期执行 empty_cache，以缓解 AMD 显存碎片化。",
                extra={
                    "global_step": next_global_step,
                    "amd_empty_cache_interval": self._amd_empty_cache_interval,
                },
            )
            monitor.record_memory_snapshot(label="periodic_empty_cache", global_step=next_global_step)

    def sample_images(
        self,
        accelerator,
        args,
        epoch,
        global_step,
        vae,
        text_encoder,
        dit,
        tokenize_strategy,
        text_encoding_strategy,
        network=None,
    ):
        should_track_preview = _should_generate_sample_images(args, epoch, global_step)
        unwrapped_dit = accelerator.unwrap_model(dit)
        with temporary_anima_safe_preview_backend(args, unwrapped_dit, route_label="AMD Anima preview"):
            result = super().sample_images(
                accelerator,
                args,
                epoch,
                global_step,
                vae,
                text_encoder,
                dit,
                tokenize_strategy,
                text_encoding_strategy,
                network=network,
            )
        monitor = self._get_amd_monitor()
        if monitor is not None and should_track_preview:
            monitor.note_preview(epoch=epoch, global_step=global_step)
            monitor.record_event(
                "训练预览阶段已完成。",
                extra={
                    "epoch": epoch,
                    "global_step": global_step,
                },
            )
            monitor.record_memory_snapshot(label="preview", global_step=global_step)
        self._cleanup_amd_runtime_memory()
        return result

    def train(self, args):
        self._amd_monitor = None
        self._amd_empty_cache_interval = 0
        policy_messages = apply_anima_amd_experimental_policy(args)
        monitor = None
        if is_amd_rocm_runtime():
            try:
                self._amd_empty_cache_interval = int(getattr(args, "amd_empty_cache_interval", 0) or 0)
            except (TypeError, ValueError):
                self._amd_empty_cache_interval = 0
            policy_messages.append("AMD 实验核心已自动禁用 DataLoader pin_memory / non_blocking。")
            if self._amd_empty_cache_interval > 0:
                policy_messages.append(
                    f"AMD 实验核心会在文本编码缓存、训练预览以及每 {self._amd_empty_cache_interval} 次优化器更新后主动执行 empty_cache。"
                )
            else:
                policy_messages.append("AMD 实验核心会在文本编码缓存和训练预览后主动执行 empty_cache。")
            monitor = AmdAnimaDiagnosticsMonitor(args, route_label="Anima AMD experimental")
            self._amd_monitor = monitor
            args._amd_diagnostics_monitor = monitor
            args._amd_diagnostics_snapshot_dir = str(monitor.snapshot_dir)
            monitor.record_event("AMD 实验核心训练启动。")
            monitor.record_memory_snapshot(label="startup", global_step=0)
            startup_report_path = monitor.write_report(reason="startup")
            policy_messages.append(f"AMD 诊断目录：{monitor.snapshot_dir}")
            policy_messages.append(f"AMD 启动诊断文件：{startup_report_path}")
        log_anima_amd_experimental_banner(args, policy_messages)
        if not is_amd_rocm_runtime():
            return super().train(args)

        completed = False
        try:
            with _temporary_anima_amd_runtime_patches(), patch_anima_timing_profiler():
                result = super().train(args)
            completed = True
            return result
        except BaseException as exc:
            if monitor is not None:
                reason = "interrupted" if isinstance(exc, KeyboardInterrupt) else "failure"
                monitor.record_event(
                    "训练异常结束。",
                    level="error",
                    extra={
                        "reason": reason,
                        "exception_type": type(exc).__name__,
                        "exception_message": str(exc),
                    },
                )
                monitor.record_memory_snapshot(label=reason)
                monitor.write_report(reason=reason, exception=exc)
            raise
        finally:
            if completed and monitor is not None:
                monitor.record_event(
                    "训练已正常结束。",
                    extra={
                        "last_global_step_hint": monitor.last_global_step_hint,
                        "optimizer_steps_observed": monitor.optimizer_steps_observed,
                    },
                )
                monitor.record_memory_snapshot(label="completed")
                monitor.write_report(reason="completed")
            args._amd_diagnostics_monitor = None
            self._amd_monitor = None
            self._amd_empty_cache_interval = 0
