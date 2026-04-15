from __future__ import annotations

from dataclasses import dataclass
from types import MethodType
from typing import Optional

import torch
import torch.nn as nn

from library import custom_offloading_utils
from library.device_utils import clean_memory_on_device


@dataclass(slots=True)
class NewbieAdaptiveBlockSwapController:
    device: torch.device
    current_blocks: int
    max_blocks: int
    min_blocks: int = 0
    allow_auto_release: bool = False
    high_watermark_ratio: float = 0.965
    low_watermark_ratio: float = 0.90
    cooldown_steps: int = 12
    stable_windows_before_reduce: int = 2
    enabled: bool = False
    _last_adjust_step: int = 0
    _stable_low_windows: int = 0
    _total_memory: int = 0

    def __post_init__(self) -> None:
        self.enabled = self.device.type == 'cuda' and self.max_blocks > 0
        self._last_adjust_step = 0
        self._stable_low_windows = 0
        self._total_memory = 0
        if self.enabled:
            self._total_memory = int(torch.cuda.get_device_properties(self.device).total_memory)
            torch.cuda.reset_peak_memory_stats(self.device)

    def on_optimizer_step(self, *, step: int, model) -> str | None:
        if not self.enabled or self._total_memory <= 0:
            return None

        peak_reserved = max(
            int(torch.cuda.max_memory_reserved(self.device)),
            int(torch.cuda.memory_reserved(self.device)),
        )
        usage_ratio = float(peak_reserved) / float(self._total_memory)
        next_blocks = self.current_blocks

        if step - self._last_adjust_step >= self.cooldown_steps:
            if usage_ratio >= self.high_watermark_ratio and self.current_blocks < self.max_blocks:
                next_blocks = min(self.max_blocks, self.current_blocks + 1)
                self._stable_low_windows = 0
            elif (
                self.allow_auto_release
                and usage_ratio <= self.low_watermark_ratio
                and self.current_blocks > self.min_blocks
            ):
                self._stable_low_windows += 1
                if self._stable_low_windows >= self.stable_windows_before_reduce:
                    next_blocks = max(self.min_blocks, self.current_blocks - 1)
                    self._stable_low_windows = 0
            else:
                self._stable_low_windows = 0

        torch.cuda.reset_peak_memory_stats(self.device)

        if next_blocks == self.current_blocks:
            return None

        model.reconfigure_block_swap(next_blocks, self.device)
        self._last_adjust_step = step
        previous = self.current_blocks
        self.current_blocks = next_blocks
        return (
            f'[newbie-train] adaptive block swap adjusted: '
            f'{previous} -> {next_blocks} '
            f'(peak_reserved_ratio={usage_ratio * 100.0:.1f}%)'
        )


def release_newbie_runtime_modules(*modules, device: Optional[torch.device] = None) -> None:
    for module in modules:
        if module is None:
            continue
        try:
            if hasattr(module, 'to'):
                module.to('cpu')
        except Exception:
            pass
        del module
    clean_memory_on_device(device)


def get_newbie_max_swappable_blocks(model) -> int:
    layers = getattr(model, 'layers', None)
    if layers is None:
        return 0
    return max(0, len(layers) - 2)


def move_newbie_trainable_params_to_device(model, device: torch.device) -> int:
    moved = 0
    for parameter in model.parameters():
        if not getattr(parameter, 'requires_grad', False):
            continue
        if parameter.data.device != device:
            parameter.data = parameter.data.to(device, non_blocking=True)
            moved += 1
        if parameter.grad is not None and parameter.grad.device != device:
            parameter.grad = parameter.grad.to(device, non_blocking=True)
    return moved


def _unwrap_newbie_model(model):
    base = getattr(model, 'base_model', None)
    if base is not None:
        candidate = getattr(base, 'model', None)
        if candidate is not None:
            return candidate
    return model


def _remove_offloader_hooks(offloader) -> None:
    if offloader is None:
        return
    for handle in list(getattr(offloader, 'remove_handles', []) or []):
        try:
            handle.remove()
        except Exception:
            pass
    for block_idx in list(getattr(offloader, 'futures', {}).keys()):
        try:
            offloader.wait_for_block(block_idx)
        except Exception:
            pass
    thread_pool = getattr(offloader, 'thread_pool', None)
    if thread_pool is not None:
        try:
            thread_pool.shutdown(wait=True, cancel_futures=False)
        except Exception:
            pass


def apply_newbie_memory_runtime_patch(model):
    base_model = _unwrap_newbie_model(model)
    if getattr(base_model, '_newbie_memory_runtime_patch_applied', False):
        return model

    base_model._newbie_memory_runtime_patch_applied = True
    base_model.cpu_offload_checkpointing = False
    base_model.blocks_to_swap = 0
    base_model._newbie_block_offloader = None
    base_model._newbie_layer_forward_backups = {}
    base_model._newbie_runtime_device = None

    def _enable_gradient_checkpointing(self, cpu_offload: bool = False):
        self.gradient_checkpointing = True
        self.cpu_offload_checkpointing = bool(cpu_offload)

    def _disable_gradient_checkpointing(self):
        self.gradient_checkpointing = False
        self.cpu_offload_checkpointing = False

    def _restore_layer_forwards(self):
        backups = getattr(self, '_newbie_layer_forward_backups', {}) or {}
        for layer, original_forward in list(backups.items()):
            try:
                layer.forward = original_forward
            except Exception:
                pass
        self._newbie_layer_forward_backups = {}

    def _move_layers_to_runtime_device(self):
        runtime_device = getattr(self, '_newbie_runtime_device', None)
        if runtime_device is None:
            return
        target_device = torch.device(runtime_device)
        for layer in self.layers:
            try:
                layer.to(target_device)
            except Exception:
                pass
        clean_memory_on_device(target_device)

    def _disable_block_swap(self):
        _restore_layer_forwards(self)
        _remove_offloader_hooks(getattr(self, '_newbie_block_offloader', None))
        self._newbie_block_offloader = None
        self.blocks_to_swap = 0
        _move_layers_to_runtime_device(self)

    def _enable_block_swap(self, blocks_to_swap: int, device: torch.device, supports_backward: bool = True):
        requested = max(0, int(blocks_to_swap or 0))
        max_blocks = get_newbie_max_swappable_blocks(self)
        requested = min(requested, max_blocks)
        _disable_block_swap(self)
        if requested <= 0:
            return

        self._newbie_block_offloader = custom_offloading_utils.ModelOffloader(
            self.layers,
            requested,
            device,
            supports_backward=supports_backward,
        )
        self.blocks_to_swap = requested

        backups = {}
        for index, layer in enumerate(self.layers):
            original_forward = layer.forward
            backups[layer] = original_forward

            def wrapped_forward(layer_self, *args, __orig=original_forward, __index=index, **kwargs):
                offloader = getattr(self, '_newbie_block_offloader', None)
                if offloader is not None and getattr(self, 'blocks_to_swap', 0) > 0:
                    offloader.wait_for_block(__index)
                result = __orig(*args, **kwargs)
                if offloader is not None and getattr(self, 'blocks_to_swap', 0) > 0:
                    offloader.submit_move_blocks(self.layers, __index)
                return result

            layer.forward = MethodType(wrapped_forward, layer)

        self._newbie_layer_forward_backups = backups

    def _reconfigure_block_swap(self, blocks_to_swap: int, device: torch.device):
        requested = max(0, int(blocks_to_swap or 0))
        self._newbie_runtime_device = torch.device(device)
        if requested == int(getattr(self, 'blocks_to_swap', 0) or 0):
            return
        _enable_block_swap(self, requested, device, supports_backward=True)
        _prepare_block_swap_before_forward(self)

    def _move_to_device_except_swap_blocks(self, device: torch.device):
        self._newbie_runtime_device = torch.device(device)
        if getattr(self, 'blocks_to_swap', 0):
            saved_layers = self.layers
            self.layers = nn.ModuleList()
            self.to(device)
            self.layers = saved_layers
            return
        self.to(device)

    def _prepare_block_swap_before_forward(self):
        offloader = getattr(self, '_newbie_block_offloader', None)
        if offloader is None or getattr(self, 'blocks_to_swap', 0) <= 0:
            return
        offloader.prepare_block_devices_before_forward(self.layers)

    original_forward = base_model.forward

    def patched_forward(self, x, t, cap_feats, cap_mask, attn_bias=None, **kwargs):
        clip_text_pooled = kwargs.get('clip_text_pooled')
        clip_img_pooled = kwargs.get('clip_img_pooled')

        t_emb = self.t_embedder(t)
        adaln_input = t_emb
        cap_feats = self.cap_embedder(cap_feats)

        if clip_text_pooled is not None and hasattr(self, 'clip_text_pooled_proj') and hasattr(self, 'time_text_embed'):
            clip_emb = self.clip_text_pooled_proj(clip_text_pooled)
            combined_features = torch.cat([t_emb, clip_emb], dim=-1)
            adaln_input = self.time_text_embed(combined_features)

        if clip_img_pooled is not None and hasattr(self, 'clip_img_pooled_embedder'):
            clip_img_pooled_emb = self.clip_img_pooled_embedder(clip_img_pooled)
            adaln_input = adaln_input + clip_img_pooled_emb

        x_is_tensor = isinstance(x, torch.Tensor)
        x, mask, img_size, cap_size, freqs_cis = self.patchify_and_embed(x, cap_feats, cap_mask, adaln_input)
        freqs_cis = freqs_cis.to(x.device)

        for layer in self.layers:
            if self.gradient_checkpointing and self.training:
                forward_fn = layer
                if getattr(self, 'cpu_offload_checkpointing', False):
                    layer_device = next(layer.parameters()).device
                    forward_fn = custom_offloading_utils.create_cpu_offloading_wrapper(layer, layer_device)
                x = torch.utils.checkpoint.checkpoint(
                    forward_fn,
                    x,
                    mask,
                    freqs_cis,
                    adaln_input,
                    attn_bias,
                    use_reentrant=False,
                )
            else:
                x = layer(x, mask, freqs_cis, adaln_input, attn_bias)

        if getattr(self, 'cpu_offload_checkpointing', False) and isinstance(x, torch.Tensor) and x.device != adaln_input.device:
            x = x.to(adaln_input.device, non_blocking=True)

        x = self.final_layer(x, adaln_input)
        x = self.unpatchify(x, img_size, cap_size, return_tensor=x_is_tensor)
        return x

    base_model.enable_gradient_checkpointing = MethodType(_enable_gradient_checkpointing, base_model)
    base_model.disable_gradient_checkpointing = MethodType(_disable_gradient_checkpointing, base_model)
    base_model.disable_block_swap = MethodType(_disable_block_swap, base_model)
    base_model.enable_block_swap = MethodType(_enable_block_swap, base_model)
    base_model.reconfigure_block_swap = MethodType(_reconfigure_block_swap, base_model)
    base_model.move_to_device_except_swap_blocks = MethodType(_move_to_device_except_swap_blocks, base_model)
    base_model.prepare_block_swap_before_forward = MethodType(_prepare_block_swap_before_forward, base_model)
    base_model.forward = MethodType(patched_forward, base_model)
    base_model._newbie_original_forward = original_forward

    return model


def maybe_apply_newbie_safe_fallback(config, model, device: torch.device) -> list[str]:
    notes: list[str] = []
    if device.type != 'cuda' or not bool(getattr(config, 'newbie_safe_fallback', False)):
        return notes

    total_vram_gb = float(torch.cuda.get_device_properties(device).total_memory) / float(1024 ** 3)
    max_swappable_blocks = get_newbie_max_swappable_blocks(_unwrap_newbie_model(model))

    if getattr(config, 'cpu_offload_checkpointing', False) and getattr(config, 'blocks_to_swap', 0):
        config.cpu_offload_checkpointing = False
        notes.append('[newbie-train] safe fallback disabled cpu_offload_checkpointing because it cannot be combined with blocks_to_swap.')

    if getattr(config, 'cpu_offload_checkpointing', False) and not getattr(config, 'gradient_checkpointing', False):
        config.gradient_checkpointing = True
        notes.append('[newbie-train] safe fallback enabled gradient_checkpointing because cpu_offload_checkpointing requires it.')

    if total_vram_gb <= 16.5 and config.model_resolution >= 1024 and getattr(config, 'blocks_to_swap', 0) <= 0 and not getattr(config, 'cpu_offload_checkpointing', False):
        auto_blocks = min(4, max_swappable_blocks)
        if auto_blocks > 0:
            config.blocks_to_swap = auto_blocks
            notes.append(
                f'[newbie-train] safe fallback enabled initial block swap={auto_blocks} for {total_vram_gb:.1f}GB VRAM at {config.model_resolution}px.'
            )

    return notes






