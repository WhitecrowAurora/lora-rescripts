from __future__ import annotations

from contextlib import contextmanager
import math
import logging
from typing import Any, Iterator


logger = logging.getLogger(__name__)

SAFE_PREVIEW_BACKEND = "sdpa-safe"
_DEFAULT_SAFE_PREVIEW_MAX_WIDTH = 512
_DEFAULT_SAFE_PREVIEW_MAX_HEIGHT = 512
_DEFAULT_SAFE_PREVIEW_MAX_STEPS = 20
_DEFAULT_SAFE_PREVIEW_CFG_CAP = 6.0


def parse_boolish(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"", "0", "false", "no", "off", "none", "null"}:
            return False
        if normalized in {"1", "true", "yes", "on"}:
            return True
    return bool(value)


def _is_mapping_like(state: Any) -> bool:
    return isinstance(state, dict)


def get_state_value(state: Any, key: str, default=None):
    if _is_mapping_like(state):
        return state.get(key, default)
    return getattr(state, key, default)


def set_state_value(state: Any, key: str, value) -> None:
    if _is_mapping_like(state):
        state[key] = value
        return
    setattr(state, key, value)


def is_preview_requested(state: Any) -> bool:
    if parse_boolish(get_state_value(state, "enable_preview")):
        return True
    if parse_boolish(get_state_value(state, "sample_at_first")):
        return True

    for key in ("sample_every_n_steps", "sample_every_n_epochs"):
        raw_value = get_state_value(state, key)
        try:
            if raw_value is not None and int(raw_value) > 0:
                return True
        except (TypeError, ValueError):
            pass

    return False


def safe_preview_enabled(state: Any) -> bool:
    if parse_boolish(get_state_value(state, "_runtime_safe_preview_enabled", False)):
        return True
    backend = str(get_state_value(state, "_runtime_preview_backend", "") or "").strip().lower()
    return backend == SAFE_PREVIEW_BACKEND


def get_safe_preview_limits(state: Any) -> dict[str, Any]:
    return {
        "max_width": max(64, int(get_state_value(state, "_runtime_safe_preview_max_width", _DEFAULT_SAFE_PREVIEW_MAX_WIDTH) or _DEFAULT_SAFE_PREVIEW_MAX_WIDTH)),
        "max_height": max(64, int(get_state_value(state, "_runtime_safe_preview_max_height", _DEFAULT_SAFE_PREVIEW_MAX_HEIGHT) or _DEFAULT_SAFE_PREVIEW_MAX_HEIGHT)),
        "max_steps": max(1, int(get_state_value(state, "_runtime_safe_preview_max_steps", _DEFAULT_SAFE_PREVIEW_MAX_STEPS) or _DEFAULT_SAFE_PREVIEW_MAX_STEPS)),
        "cfg_cap": max(1.0, float(get_state_value(state, "_runtime_safe_preview_cfg_cap", _DEFAULT_SAFE_PREVIEW_CFG_CAP) or _DEFAULT_SAFE_PREVIEW_CFG_CAP)),
    }


def apply_runtime_safe_preview_policy(
    state: Any,
    *,
    runtime_label: str,
    messages: list[str],
    preview_requested_key: str | None = None,
    preview_forced_off_key: str | None = None,
) -> bool:
    preview_requested = is_preview_requested(state)
    if preview_requested_key:
        set_state_value(state, preview_requested_key, preview_requested)
    if preview_forced_off_key:
        set_state_value(state, preview_forced_off_key, False)

    if not preview_requested:
        set_state_value(state, "_runtime_safe_preview_enabled", False)
        return False

    set_state_value(state, "_runtime_safe_preview_enabled", True)
    set_state_value(state, "_runtime_preview_backend", SAFE_PREVIEW_BACKEND)
    set_state_value(state, "_runtime_safe_preview_max_width", _DEFAULT_SAFE_PREVIEW_MAX_WIDTH)
    set_state_value(state, "_runtime_safe_preview_max_height", _DEFAULT_SAFE_PREVIEW_MAX_HEIGHT)
    set_state_value(state, "_runtime_safe_preview_max_steps", _DEFAULT_SAFE_PREVIEW_MAX_STEPS)
    set_state_value(state, "_runtime_safe_preview_cfg_cap", _DEFAULT_SAFE_PREVIEW_CFG_CAP)

    messages.append(
        f"{runtime_label} 实验路线已把训练预览切到独立安全后端：preview backend={SAFE_PREVIEW_BACKEND}。"
        "训练 attention backend 与预览 attention backend 已解耦；即使训练切到 SageAttention，预览仍固定走 SDPA。"
    )
    messages.append(
        f"{runtime_label} 安全预览会把单张预览限制在不高于 {_DEFAULT_SAFE_PREVIEW_MAX_WIDTH}x{_DEFAULT_SAFE_PREVIEW_MAX_HEIGHT}、"
        f"{_DEFAULT_SAFE_PREVIEW_MAX_STEPS} steps、CFG 不高于 {_DEFAULT_SAFE_PREVIEW_CFG_CAP:g}。"
    )
    return True


def clamp_safe_preview_request(
    state: Any,
    *,
    width: int,
    height: int,
    steps: int,
    cfg: float,
) -> dict[str, Any]:
    result = {
        "width": width,
        "height": height,
        "steps": steps,
        "cfg": cfg,
        "changed": False,
        "changes": [],
    }
    if not safe_preview_enabled(state):
        return result

    limits = get_safe_preview_limits(state)
    scale = min(
        1.0,
        limits["max_width"] / max(1, int(result["width"])),
        limits["max_height"] / max(1, int(result["height"])),
    )
    if scale < 1.0:
        scaled_width = max(64, int(math.floor(result["width"] * scale / 8.0) * 8))
        scaled_height = max(64, int(math.floor(result["height"] * scale / 8.0) * 8))
        if scaled_width != result["width"] or scaled_height != result["height"]:
            result["width"] = scaled_width
            result["height"] = scaled_height
            result["changed"] = True
            result["changes"].append(f"size->{scaled_width}x{scaled_height}")

    if result["width"] > limits["max_width"]:
        result["width"] = limits["max_width"]
        result["changed"] = True
        result["changes"].append(f"width->{limits['max_width']}")
    if result["height"] > limits["max_height"]:
        result["height"] = limits["max_height"]
        result["changed"] = True
        result["changes"].append(f"height->{limits['max_height']}")
    if result["steps"] > limits["max_steps"]:
        result["steps"] = limits["max_steps"]
        result["changed"] = True
        result["changes"].append(f"steps->{limits['max_steps']}")
    if result["cfg"] > limits["cfg_cap"]:
        result["cfg"] = limits["cfg_cap"]
        result["changed"] = True
        result["changes"].append(f"cfg->{limits['cfg_cap']:g}")
    return result


def maybe_log_safe_preview_once(state: Any, *, route_label: str) -> None:
    if not safe_preview_enabled(state):
        return
    if parse_boolish(get_state_value(state, "_runtime_safe_preview_log_emitted", False)):
        return

    limits = get_safe_preview_limits(state)
    logger.info(
        f"{route_label}: safe preview backend active ({SAFE_PREVIEW_BACKEND}). "
        "Preview generation is decoupled from the training attention backend."
    )
    logger.info(
        f"{route_label}: safe preview limits: max_size={limits['max_width']}x{limits['max_height']}, "
        f"max_steps={limits['max_steps']}, cfg_cap={limits['cfg_cap']:g}."
    )
    set_state_value(state, "_runtime_safe_preview_log_emitted", True)


def _disable_all_unet_attention_toggles(unet: Any) -> None:
    if hasattr(unet, "set_use_memory_efficient_attention"):
        unet.set_use_memory_efficient_attention(False, False)
    if hasattr(unet, "set_use_sageattn"):
        unet.set_use_sageattn(False)
    if hasattr(unet, "set_use_sdpa"):
        unet.set_use_sdpa(False)


def _restore_unet_training_attention_backend(args: Any, unet: Any) -> None:
    restore_sage = parse_boolish(get_state_value(args, "sageattn")) or parse_boolish(get_state_value(args, "use_sage_attn"))
    restore_xformers = parse_boolish(get_state_value(args, "xformers"))
    restore_mem_eff = parse_boolish(get_state_value(args, "mem_eff_attn"))
    restore_sdpa = parse_boolish(get_state_value(args, "sdpa"))

    _disable_all_unet_attention_toggles(unet)
    if restore_sage and hasattr(unet, "set_use_sageattn"):
        unet.set_use_sageattn(True)
    elif (restore_xformers or restore_mem_eff) and hasattr(unet, "set_use_memory_efficient_attention"):
        unet.set_use_memory_efficient_attention(restore_xformers, restore_mem_eff)
    elif restore_sdpa and hasattr(unet, "set_use_sdpa"):
        unet.set_use_sdpa(True)


@contextmanager
def temporary_diffusion_safe_preview_backend(args: Any, unet: Any, *, route_label: str) -> Iterator[None]:
    if not safe_preview_enabled(args) or unet is None:
        yield
        return

    maybe_log_safe_preview_once(args, route_label=route_label)
    _disable_all_unet_attention_toggles(unet)
    if hasattr(unet, "set_use_sdpa"):
        unet.set_use_sdpa(True)

    try:
        yield
    finally:
        _restore_unet_training_attention_backend(args, unet)


@contextmanager
def temporary_anima_safe_preview_backend(args: Any, dit: Any, *, route_label: str) -> Iterator[None]:
    if not safe_preview_enabled(args) or dit is None:
        yield
        return

    maybe_log_safe_preview_once(args, route_label=route_label)
    original_attn_mode = getattr(dit, "attn_mode", None)
    original_split_attn = getattr(dit, "split_attn", None)
    try:
        if original_attn_mode is not None:
            dit.attn_mode = "torch"
        if original_split_attn is not None:
            dit.split_attn = False
        yield
    finally:
        if original_attn_mode is not None:
            dit.attn_mode = original_attn_mode
        if original_split_attn is not None:
            dit.split_attn = original_split_attn
