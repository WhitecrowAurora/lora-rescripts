
import argparse
import gc
import importlib
import json
import logging
import math
import re
from collections import deque
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

import torch

from lulynx.lisa import LulynxLisaScheduler
from lulynx.pcgrad import PCGradStepStats, resolve_pcgrad

logger = logging.getLogger(__name__)


def _coalesce(*values):
    for value in values:
        if value is None:
            continue
        if isinstance(value, str) and value.strip() == "":
            continue
        return value
    return None


def _to_bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"1", "true", "yes", "on"}:
            return True
        if lowered in {"0", "false", "no", "off"}:
            return False
    return bool(value)


def _to_optional_bool(value: Any) -> Optional[bool]:
    if value is None or value == "":
        return None
    return _to_bool(value, False)


def _to_int(value: Any, default: int) -> int:
    if value is None or value == "":
        return int(default)
    return int(value)


def _to_optional_int(value: Any, minimum: Optional[int] = None) -> Optional[int]:
    if value is None or value == "":
        return None
    result = int(value)
    if minimum is not None:
        result = max(minimum, result)
    return result


def _to_float(value: Any, default: float) -> float:
    if value is None or value == "":
        return float(default)
    return float(value)


def _to_optional_float(value: Any, minimum: Optional[float] = None, maximum: Optional[float] = None) -> Optional[float]:
    if value is None or value == "":
        return None
    result = float(value)
    if minimum is not None:
        result = max(minimum, result)
    if maximum is not None:
        result = min(maximum, result)
    return result


def _fit_float_list(weights: List[float], target_length: int, fill_value: float = 1.0) -> List[float]:
    if target_length <= 0:
        return []
    if len(weights) >= target_length:
        return weights[:target_length]
    return weights + [fill_value] * (target_length - len(weights))


def _parse_float_list(text: Optional[str]) -> Optional[List[float]]:
    if text is None:
        return None
    text = str(text).strip()
    if not text:
        return None

    values: List[float] = []
    for item in text.split(","):
        item = item.strip()
        if not item:
            values.append(0.0)
            continue
        values.append(float(item))
    return values


def _clean_device_cache(device: Optional[torch.device]) -> None:
    gc.collect()
    if device is None:
        return

    try:
        if device.type == "cuda" and torch.cuda.is_available():
            torch.cuda.empty_cache()
        elif device.type == "xpu" and hasattr(torch, "xpu") and torch.xpu.is_available():
            torch.xpu.empty_cache()
        elif device.type == "mps" and hasattr(torch, "mps"):
            torch.mps.empty_cache()
    except Exception as exc:
        logger.debug(f"Lulynx ResourceManager cache cleanup skipped: {exc}")


def _get_device_memory_stats(device: Optional[torch.device]) -> Optional[Dict[str, float]]:
    if device is None:
        return None

    try:
        if device.type == "cuda" and torch.cuda.is_available():
            index = device.index if device.index is not None else torch.cuda.current_device()
            props = torch.cuda.get_device_properties(index)
            total = float(props.total_memory)
            reserved = float(torch.cuda.memory_reserved(index))
            allocated = float(torch.cuda.memory_allocated(index))
            max_reserved = float(torch.cuda.max_memory_reserved(index))
        elif device.type == "xpu" and hasattr(torch, "xpu") and torch.xpu.is_available():
            index = device.index if device.index is not None else torch.xpu.current_device()
            props = torch.xpu.get_device_properties(index)
            total = float(props.total_memory)
            reserved = float(torch.xpu.memory_reserved(index))
            allocated = float(torch.xpu.memory_allocated(index))
            max_reserved = float(torch.xpu.max_memory_reserved(index))
        else:
            return None
    except Exception as exc:
        logger.debug(f"Lulynx ResourceManager failed to read device memory stats: {exc}")
        return None

    if total <= 0:
        return None

    return {
        "total": total,
        "reserved": reserved,
        "allocated": allocated,
        "max_reserved": max_reserved,
        "reserved_ratio": reserved / total,
        "allocated_ratio": allocated / total,
        "max_reserved_ratio": max_reserved / total,
    }


def _sync_scheduler_lrs(optimizer, lr_scheduler) -> None:
    if lr_scheduler is None:
        return

    current_lrs = [float(group.get("lr", 0.0)) for group in optimizer.param_groups]
    if hasattr(lr_scheduler, "base_lrs") and len(getattr(lr_scheduler, "base_lrs")) == len(current_lrs):
        lr_scheduler.base_lrs = current_lrs
    if hasattr(lr_scheduler, "_last_lr"):
        lr_scheduler._last_lr = current_lrs


def add_lulynx_experimental_arguments(parser: argparse.ArgumentParser) -> None:
    group = parser.add_argument_group("Lulynx experimental core")

    group.add_argument(
        "--lulynx_experimental_core_enabled",
        action="store_true",
        default=None,
        help="enable Lulynx experimental core bridge / 启用 Lulynx 实验核心桥接",
    )

    group.add_argument(
        "--lulynx_safeguard_enabled",
        action="store_true",
        default=None,
        help="enable Lulynx SafeGuard bridge / 启用 Lulynx SafeGuard 桥接",
    )
    group.add_argument("--lulynx_safeguard_nan_check_interval", type=int, default=None)
    group.add_argument("--lulynx_safeguard_max_nan_count", type=int, default=None)
    group.add_argument("--lulynx_safeguard_loss_spike_threshold", type=float, default=None)
    group.add_argument("--lulynx_safeguard_loss_window_size", type=int, default=None)
    group.add_argument("--lulynx_safeguard_auto_reduce_lr", action="store_true", default=None)
    group.add_argument("--lulynx_safeguard_lr_reduction_factor", type=float, default=None)

    group.add_argument(
        "--lulynx_ema_enabled",
        action="store_true",
        default=None,
        help="enable Lulynx EMA bridge / 启用 Lulynx EMA 桥接",
    )
    group.add_argument("--lulynx_ema_decay", type=float, default=None)
    group.add_argument("--lulynx_ema_update_every", type=int, default=None)
    group.add_argument("--lulynx_ema_update_after_step", type=int, default=None)
    group.add_argument("--lulynx_ema_use_warmup", action="store_true", default=None)
    group.add_argument("--lulynx_ema_inv_gamma", type=float, default=None)
    group.add_argument("--lulynx_ema_power", type=float, default=None)

    group.add_argument(
        "--lulynx_resource_manager_enabled",
        action="store_true",
        default=None,
        help="enable Lulynx resource manager / 启用 Lulynx 资源管理器",
    )
    group.add_argument("--lulynx_resource_log_interval", type=int, default=None)
    group.add_argument("--lulynx_resource_warn_vram_ratio", type=float, default=None)
    group.add_argument("--lulynx_resource_critical_vram_ratio", type=float, default=None)
    group.add_argument("--lulynx_resource_clear_cache_every_n_steps", type=int, default=None)

    group.add_argument(
        "--lulynx_block_weight_enabled",
        action="store_true",
        default=None,
        help="enable Lulynx block weight manager / 启用 Lulynx 分层学习率管理器",
    )
    group.add_argument("--lulynx_down_lr_weight", type=str, default=None)
    group.add_argument("--lulynx_mid_lr_weight", type=str, default=None)
    group.add_argument("--lulynx_up_lr_weight", type=str, default=None)
    group.add_argument("--lulynx_block_lr_zero_threshold", type=float, default=None)
    group.add_argument("--lulynx_anima_block_lr_weights", type=str, default=None)
    group.add_argument("--lulynx_anima_llm_adapter_lr_weight", type=float, default=None)
    group.add_argument("--lulynx_anima_final_layer_lr_weight", type=float, default=None)
    group.add_argument("--lulynx_anima_norm_lr_weight", type=float, default=None)

    group.add_argument(
        "--lulynx_smart_rank_enabled",
        action="store_true",
        default=None,
        help="enable Lulynx SmartRank / 启用 Lulynx SmartRank",
    )
    group.add_argument("--lulynx_smart_rank_keep_ratio", type=float, default=None)
    group.add_argument("--lulynx_smart_rank_update_every", type=int, default=None)
    group.add_argument("--lulynx_smart_rank_start_step", type=int, default=None)
    group.add_argument("--lulynx_smart_rank_min_active_rank", type=int, default=None)
    group.add_argument("--lulynx_smart_rank_scope", type=str, default=None, choices=["all", "unet", "text_encoder"])

    group.add_argument(
        "--lulynx_auto_controller_enabled",
        action="store_true",
        default=None,
        help="enable Lulynx auto controller / 启用 Lulynx 自动控制器",
    )
    group.add_argument("--lulynx_auto_check_every", type=int, default=None)
    group.add_argument("--lulynx_auto_plateau_window", type=int, default=None)
    group.add_argument("--lulynx_auto_plateau_tolerance", type=float, default=None)
    group.add_argument("--lulynx_auto_lr_decay_factor", type=float, default=None)
    group.add_argument("--lulynx_auto_lr_patience", type=int, default=None)
    group.add_argument("--lulynx_auto_early_stop_patience", type=int, default=None)
    group.add_argument("--lulynx_auto_min_lr", type=float, default=None)
    group.add_argument("--lulynx_auto_freeze_text_encoder_on_plateau", action="store_true", default=None)

    group.add_argument(
        "--lulynx_lisa_enabled",
        action="store_true",
        default=None,
        help="enable experimental LISA scheduling / 启用实验性的 LISA 模块调度",
    )
    group.add_argument("--lulynx_lisa_active_ratio", type=float, default=None)
    group.add_argument("--lulynx_lisa_interval", type=int, default=None)

    group.add_argument(
        "--lulynx_pcgrad_enabled",
        action="store_true",
        default=None,
        help="enable experimental PCGrad on per-sample losses / 启用基于逐样本 loss 的实验性 PCGrad",
    )
    group.add_argument("--lulynx_pcgrad_conflict_threshold", type=float, default=None)

    group.add_argument(
        "--lulynx_pause_enabled",
        action="store_true",
        default=None,
        help="bridge Lulynx thermal pause controls to existing cooldown logic / 将 Lulynx 散热暂停桥接到现有 cooldown 逻辑",
    )
    group.add_argument("--lulynx_pause_every_n_epochs", type=int, default=None)
    group.add_argument("--lulynx_pause_minutes", type=float, default=None)
    group.add_argument("--lulynx_pause_until_temp_c", type=float, default=None)
    group.add_argument("--lulynx_pause_poll_seconds", type=int, default=None)

    group.add_argument(
        "--lulynx_prodigy_guard_enabled",
        action="store_true",
        default=None,
        help="enable Prodigy-specific runtime guardrails / 启用 Prodigy 专用护栏参数",
    )
    group.add_argument("--lulynx_prodigy_decouple", action="store_true", default=None)
    group.add_argument("--lulynx_prodigy_use_bias_correction", action="store_true", default=None)
    group.add_argument("--lulynx_prodigy_safeguard_warmup", action="store_true", default=None)
    group.add_argument("--lulynx_prodigy_growth_rate", type=float, default=None)
    group.add_argument("--lulynx_prodigy_lr_min", type=float, default=None)
    group.add_argument("--lulynx_prodigy_lr_max", type=float, default=None)

    group.add_argument(
        "--lulynx_advanced_stats_enabled",
        action="store_true",
        default=None,
        help="enable lightweight advanced stats logging / 启用轻量高级统计项",
    )
    group.add_argument("--lulynx_svd_sample_interval", type=int, default=None)

    group.add_argument("--enable_block_weights", action="store_true", default=None)
    group.add_argument("--down_lr_weight", type=str, default=None)
    group.add_argument("--mid_lr_weight", type=str, default=None)
    group.add_argument("--up_lr_weight", type=str, default=None)
    group.add_argument("--block_lr_zero_threshold", type=float, default=None)


def _apply_alias_arguments(args: argparse.Namespace, source_prefix: str, target_prefix: str, field_names: Iterable[str]) -> None:
    enabled = _to_bool(getattr(args, f"{source_prefix}_enabled", None), False)
    if not enabled:
        return

    setattr(args, f"{target_prefix}_enabled", True)
    for field_name in field_names:
        value = getattr(args, f"{source_prefix}_{field_name}", None)
        if value is not None:
            setattr(args, f"{target_prefix}_{field_name}", value)


def normalize_lulynx_args(args: argparse.Namespace, route_label: str, route_kind: str) -> None:
    args.lulynx_route_label = route_label
    args.lulynx_route_kind = route_kind

    legacy_block_weight_enabled = _to_bool(getattr(args, "enable_block_weights", None), False) or any(
        getattr(args, field_name, None) not in (None, "")
        for field_name in ("down_lr_weight", "mid_lr_weight", "up_lr_weight", "block_lr_zero_threshold")
    )
    if legacy_block_weight_enabled and getattr(args, "lulynx_block_weight_enabled", None) is None:
        args.lulynx_block_weight_enabled = True

    _apply_alias_arguments(
        args,
        "lulynx_safeguard",
        "safeguard",
        (
            "nan_check_interval",
            "max_nan_count",
            "loss_spike_threshold",
            "loss_window_size",
            "auto_reduce_lr",
            "lr_reduction_factor",
        ),
    )
    _apply_alias_arguments(
        args,
        "lulynx_ema",
        "ema",
        (
            "decay",
            "update_every",
            "update_after_step",
            "use_warmup",
            "inv_gamma",
            "power",
        ),
    )

    args.lulynx_safeguard_enabled = _to_bool(getattr(args, "lulynx_safeguard_enabled", None), False)
    args.lulynx_ema_enabled = _to_bool(getattr(args, "lulynx_ema_enabled", None), False)
    args.lulynx_resource_manager_enabled = _to_bool(getattr(args, "lulynx_resource_manager_enabled", None), False)
    args.lulynx_block_weight_enabled = _to_bool(getattr(args, "lulynx_block_weight_enabled", None), False)
    args.lulynx_smart_rank_enabled = _to_bool(getattr(args, "lulynx_smart_rank_enabled", None), False)
    args.lulynx_auto_controller_enabled = _to_bool(getattr(args, "lulynx_auto_controller_enabled", None), False)
    args.lulynx_lisa_enabled = _to_bool(getattr(args, "lulynx_lisa_enabled", None), False)
    args.lulynx_pcgrad_enabled = _to_bool(getattr(args, "lulynx_pcgrad_enabled", None), False)
    args.lulynx_advanced_stats_enabled = _to_bool(getattr(args, "lulynx_advanced_stats_enabled", None), False)

    pause_fields = (
        "lulynx_pause_every_n_epochs",
        "lulynx_pause_minutes",
        "lulynx_pause_until_temp_c",
        "lulynx_pause_poll_seconds",
    )
    prodigy_guard_fields = (
        "lulynx_prodigy_decouple",
        "lulynx_prodigy_use_bias_correction",
        "lulynx_prodigy_safeguard_warmup",
        "lulynx_prodigy_growth_rate",
        "lulynx_prodigy_lr_min",
        "lulynx_prodigy_lr_max",
    )

    args.lulynx_pause_enabled = _to_bool(getattr(args, "lulynx_pause_enabled", None), False) or any(
        getattr(args, field_name, None) not in (None, "") for field_name in pause_fields
    )
    args.lulynx_prodigy_guard_enabled = _to_bool(getattr(args, "lulynx_prodigy_guard_enabled", None), False) or any(
        getattr(args, field_name, None) not in (None, "") for field_name in prodigy_guard_fields
    )

    args.lulynx_resource_log_interval = max(1, _to_int(getattr(args, "lulynx_resource_log_interval", None), 25))
    args.lulynx_resource_warn_vram_ratio = min(
        max(_to_float(getattr(args, "lulynx_resource_warn_vram_ratio", None), 0.90), 0.10),
        0.999,
    )
    args.lulynx_resource_critical_vram_ratio = min(
        max(_to_float(getattr(args, "lulynx_resource_critical_vram_ratio", None), 0.96), args.lulynx_resource_warn_vram_ratio),
        0.9999,
    )
    args.lulynx_resource_clear_cache_every_n_steps = max(
        0, _to_int(getattr(args, "lulynx_resource_clear_cache_every_n_steps", None), 50)
    )

    args.lulynx_smart_rank_keep_ratio = min(
        max(_to_float(getattr(args, "lulynx_smart_rank_keep_ratio", None), 0.75), 0.05),
        1.0,
    )
    args.lulynx_smart_rank_update_every = max(1, _to_int(getattr(args, "lulynx_smart_rank_update_every", None), 100))
    args.lulynx_smart_rank_start_step = max(0, _to_int(getattr(args, "lulynx_smart_rank_start_step", None), 200))
    args.lulynx_smart_rank_min_active_rank = max(1, _to_int(getattr(args, "lulynx_smart_rank_min_active_rank", None), 1))
    args.lulynx_smart_rank_scope = str(getattr(args, "lulynx_smart_rank_scope", None) or "all").strip().lower()

    args.lulynx_auto_check_every = max(1, _to_int(getattr(args, "lulynx_auto_check_every", None), 50))
    args.lulynx_auto_plateau_window = max(2, _to_int(getattr(args, "lulynx_auto_plateau_window", None), 30))
    args.lulynx_auto_plateau_tolerance = min(
        max(_to_float(getattr(args, "lulynx_auto_plateau_tolerance", None), 0.01), 0.0),
        1.0,
    )
    args.lulynx_auto_lr_decay_factor = min(
        max(_to_float(getattr(args, "lulynx_auto_lr_decay_factor", None), 0.85), 0.01),
        1.0,
    )
    args.lulynx_auto_lr_patience = max(1, _to_int(getattr(args, "lulynx_auto_lr_patience", None), 2))
    args.lulynx_auto_early_stop_patience = max(1, _to_int(getattr(args, "lulynx_auto_early_stop_patience", None), 6))
    args.lulynx_auto_min_lr = max(_to_float(getattr(args, "lulynx_auto_min_lr", None), 1e-7), 0.0)
    args.lulynx_auto_freeze_text_encoder_on_plateau = _to_bool(
        getattr(args, "lulynx_auto_freeze_text_encoder_on_plateau", None), False
    )

    args.lulynx_lisa_active_ratio = min(
        max(_to_float(getattr(args, "lulynx_lisa_active_ratio", None), 0.2), 0.05),
        1.0,
    )
    args.lulynx_lisa_interval = max(1, _to_int(getattr(args, "lulynx_lisa_interval", None), 1))

    args.lulynx_pcgrad_conflict_threshold = min(
        max(_to_float(getattr(args, "lulynx_pcgrad_conflict_threshold", None), 0.0), -1.0),
        1.0,
    )

    args.lulynx_pause_every_n_epochs = _to_optional_int(getattr(args, "lulynx_pause_every_n_epochs", None), minimum=1)
    args.lulynx_pause_minutes = _to_optional_float(getattr(args, "lulynx_pause_minutes", None), minimum=0.0)
    args.lulynx_pause_until_temp_c = _to_optional_float(getattr(args, "lulynx_pause_until_temp_c", None), minimum=1.0)
    args.lulynx_pause_poll_seconds = _to_optional_int(getattr(args, "lulynx_pause_poll_seconds", None), minimum=1)
    if args.lulynx_pause_minutes is not None and args.lulynx_pause_minutes <= 0:
        args.lulynx_pause_minutes = None

    args.lulynx_prodigy_decouple = _to_optional_bool(getattr(args, "lulynx_prodigy_decouple", None))
    args.lulynx_prodigy_use_bias_correction = _to_optional_bool(getattr(args, "lulynx_prodigy_use_bias_correction", None))
    args.lulynx_prodigy_safeguard_warmup = _to_optional_bool(getattr(args, "lulynx_prodigy_safeguard_warmup", None))
    args.lulynx_prodigy_growth_rate = _to_optional_float(getattr(args, "lulynx_prodigy_growth_rate", None), minimum=0.0)
    args.lulynx_prodigy_lr_min = _to_optional_float(getattr(args, "lulynx_prodigy_lr_min", None), minimum=0.0)
    args.lulynx_prodigy_lr_max = _to_optional_float(getattr(args, "lulynx_prodigy_lr_max", None), minimum=0.0)
    if (
        args.lulynx_prodigy_lr_min is not None
        and args.lulynx_prodigy_lr_max is not None
        and args.lulynx_prodigy_lr_max < args.lulynx_prodigy_lr_min
    ):
        args.lulynx_prodigy_lr_max = args.lulynx_prodigy_lr_min

    args.lulynx_svd_sample_interval = max(1, _to_int(getattr(args, "lulynx_svd_sample_interval", None), 100))

    if args.lulynx_pause_enabled:
        if getattr(args, "cooldown_every_n_epochs", None) in (None, "") and args.lulynx_pause_every_n_epochs is not None:
            args.cooldown_every_n_epochs = args.lulynx_pause_every_n_epochs
        if getattr(args, "cooldown_minutes", None) in (None, "") and args.lulynx_pause_minutes is not None:
            args.cooldown_minutes = args.lulynx_pause_minutes
        if getattr(args, "cooldown_until_temp_c", None) in (None, "") and args.lulynx_pause_until_temp_c is not None:
            args.cooldown_until_temp_c = args.lulynx_pause_until_temp_c
        if getattr(args, "cooldown_poll_seconds", None) in (None, "") and args.lulynx_pause_poll_seconds is not None:
            args.cooldown_poll_seconds = args.lulynx_pause_poll_seconds
        if getattr(args, "cooldown_poll_seconds", None) in (None, ""):
            args.cooldown_poll_seconds = 15

    args.lulynx_experimental_core_enabled = _to_bool(getattr(args, "lulynx_experimental_core_enabled", None), False) or any(
        [
            args.lulynx_safeguard_enabled,
            args.lulynx_ema_enabled,
            args.lulynx_resource_manager_enabled,
            args.lulynx_block_weight_enabled,
            args.lulynx_smart_rank_enabled,
            args.lulynx_auto_controller_enabled,
            args.lulynx_lisa_enabled,
            args.lulynx_pcgrad_enabled,
            args.lulynx_pause_enabled,
            args.lulynx_prodigy_guard_enabled,
            args.lulynx_advanced_stats_enabled,
        ]
    )

    if args.lulynx_experimental_core_enabled:
        logger.info(
            f"Lulynx experimental core requested for {route_label}: "
            f"SafeGuard={args.lulynx_safeguard_enabled}, "
            f"EMA={args.lulynx_ema_enabled}, "
            f"ResourceManager={args.lulynx_resource_manager_enabled}, "
            f"BlockWeightManager={args.lulynx_block_weight_enabled}, "
            f"SmartRank={args.lulynx_smart_rank_enabled}, "
            f"AutoController={args.lulynx_auto_controller_enabled}, "
            f"LISA={args.lulynx_lisa_enabled}, "
            f"PCGrad={args.lulynx_pcgrad_enabled}, "
            f"Pause={args.lulynx_pause_enabled}, "
            f"ProdigyGuard={args.lulynx_prodigy_guard_enabled}, "
            f"AdvancedStats={args.lulynx_advanced_stats_enabled}"
        )


@dataclass
class LulynxStepDecision:
    stop_training: bool = False
    reason: Optional[str] = None
    logs: Dict[str, float] = field(default_factory=dict)


class LulynxExperimentalCore:
    def __init__(self, args: argparse.Namespace, route_kind: str, route_label: str):
        self.args = args
        self.route_kind = route_kind
        self.route_label = route_label
        self.enabled = _to_bool(getattr(args, "lulynx_experimental_core_enabled", False), False)

        self.block_weight_enabled = _to_bool(getattr(args, "lulynx_block_weight_enabled", False), False)
        self.resource_manager_enabled = _to_bool(getattr(args, "lulynx_resource_manager_enabled", False), False)
        self.smart_rank_enabled = _to_bool(getattr(args, "lulynx_smart_rank_enabled", False), False)
        self.auto_controller_enabled = _to_bool(getattr(args, "lulynx_auto_controller_enabled", False), False)
        self.lisa_enabled = _to_bool(getattr(args, "lulynx_lisa_enabled", False), False)
        self.pcgrad_enabled = _to_bool(getattr(args, "lulynx_pcgrad_enabled", False), False)
        self.pause_enabled = _to_bool(getattr(args, "lulynx_pause_enabled", False), False)
        self.prodigy_guard_enabled = _to_bool(getattr(args, "lulynx_prodigy_guard_enabled", False), False)
        self.advanced_stats_enabled = _to_bool(getattr(args, "lulynx_advanced_stats_enabled", False), False)

        self.train_text_encoder = False
        self._auto_plateau_counter = 0
        self._auto_best_loss: Optional[float] = None
        self._auto_loss_history = deque(maxlen=max(2, args.lulynx_auto_plateau_window))
        self._auto_text_encoder_frozen = False
        self._resource_last_warning_step = 0
        self._resource_last_log_step = 0
        self._smart_rank_last_step = 0
        self._svd_module_cursor = 0
        self._warning_keys = set()
        self._lisa_scheduler: Optional[LulynxLisaScheduler] = None
        self._pcgrad_last_stats: Optional[PCGradStepStats] = None

    def _warn_once(self, key: str, message: str) -> None:
        if key in self._warning_keys:
            return
        self._warning_keys.add(key)
        logger.warning(message)

    def attach_runtime(self, train_text_encoder: bool, network=None) -> None:
        self.train_text_encoder = bool(train_text_encoder)
        if not self.enabled or not self.lisa_enabled or network is None:
            return

        modules = list(self._iter_adapter_modules(network))
        self._lisa_scheduler = LulynxLisaScheduler(
            modules,
            active_ratio=self.args.lulynx_lisa_active_ratio,
            interval=self.args.lulynx_lisa_interval,
        )
        self._lisa_scheduler.initialize()

    def requires_per_sample_losses(self) -> bool:
        return bool(self.enabled and self.pcgrad_enabled)

    def backward(self, loss, accelerator, optimizer, network, per_sample_losses: Optional[torch.Tensor] = None) -> None:
        if not self.enabled or not self.pcgrad_enabled:
            accelerator.backward(loss)
            return

        fallback_reason = None
        if network is None:
            fallback_reason = "network_unavailable"
        elif per_sample_losses is None or not isinstance(per_sample_losses, torch.Tensor):
            fallback_reason = "per_sample_loss_missing"
        elif accelerator.num_processes != 1:
            fallback_reason = "multi_process_unsupported"
        elif int(getattr(self.args, "gradient_accumulation_steps", 1) or 1) != 1:
            fallback_reason = "grad_accumulation_unsupported"
        elif per_sample_losses.numel() < 2:
            fallback_reason = "batch_too_small"

        if fallback_reason is not None:
            self._pcgrad_last_stats = PCGradStepStats(fallback_reason=fallback_reason)
            self._warn_once(
                f"pcgrad-fallback:{fallback_reason}",
                f"Lulynx PCGrad fell back to normal backward on {self.route_label}: {fallback_reason}.",
            )
            accelerator.backward(loss)
            return

        if hasattr(network, "get_trainable_params"):
            params = list(network.get_trainable_params())
        else:
            params = [param for param in network.parameters() if param.requires_grad]

        if len(params) == 0:
            self._pcgrad_last_stats = PCGradStepStats(fallback_reason="no_trainable_params")
            self._warn_once(
                "pcgrad-fallback:no_trainable_params",
                f"Lulynx PCGrad found no trainable params on {self.route_label}; using normal backward.",
            )
            accelerator.backward(loss)
            return

        try:
            flat_losses = per_sample_losses.reshape(-1)
            per_sample_grads = []
            optimizer.zero_grad(set_to_none=True)
            for index, sample_loss in enumerate(flat_losses):
                retain_graph = index < flat_losses.numel() - 1
                accelerator.backward(sample_loss, retain_graph=retain_graph)
                per_sample_grads.append([param.grad.detach().clone() if param.grad is not None else None for param in params])
                optimizer.zero_grad(set_to_none=True)

            merged_grads, stats = resolve_pcgrad(
                per_sample_grads,
                conflict_threshold=float(self.args.lulynx_pcgrad_conflict_threshold),
                reduction="mean",
            )
            for param, merged_grad in zip(params, merged_grads):
                if merged_grad is None:
                    param.grad = None
                else:
                    param.grad = merged_grad.to(device=param.device, dtype=param.dtype)
            self._pcgrad_last_stats = stats
        except Exception as exc:
            self._pcgrad_last_stats = PCGradStepStats(fallback_reason="runtime_error")
            self._warn_once(
                "pcgrad-runtime-error",
                f"Lulynx PCGrad failed on {self.route_label} and fell back to normal backward: {exc}",
            )
            optimizer.zero_grad(set_to_none=True)
            accelerator.backward(loss)

    def get_metadata(self) -> Dict[str, str]:
        if not self.enabled:
            return {}

        payload = {
            "route": self.route_label,
            "features": [
                name
                for name, enabled in [
                    ("SafeGuard", _to_bool(getattr(self.args, "lulynx_safeguard_enabled", False), False)),
                    ("EMA", _to_bool(getattr(self.args, "lulynx_ema_enabled", False), False)),
                    ("ResourceManager", self.resource_manager_enabled),
                    ("BlockWeightManager", self.block_weight_enabled),
                    ("SmartRank", self.smart_rank_enabled),
                    ("AutoController", self.auto_controller_enabled),
                    ("LISA", self.lisa_enabled),
                    ("PCGrad", self.pcgrad_enabled),
                    ("Pause", self.pause_enabled),
                    ("ProdigyGuard", self.prodigy_guard_enabled),
                    ("AdvancedStats", self.advanced_stats_enabled),
                ]
                if enabled
            ],
        }
        return {"ss_lulynx_core": json.dumps(payload, ensure_ascii=False)}

    def apply_pre_optimizer_settings(self, network) -> None:
        if not self.enabled or not self.block_weight_enabled:
            return

        if self.route_kind == "anima":
            self._apply_anima_block_weights(network)
        else:
            self._apply_stable_block_weights(network)

    def on_optimizer_step(self, global_step: int, current_loss: float, average_loss: Optional[float], optimizer, lr_scheduler, accelerator, network):
        if not self.enabled:
            return LulynxStepDecision()

        decision = LulynxStepDecision()

        if self.resource_manager_enabled:
            self._tick_resource_manager(global_step, accelerator)
        if self.smart_rank_enabled:
            self._tick_smart_rank(global_step, network)
        if self.lisa_enabled and self._lisa_scheduler is not None:
            self._lisa_scheduler.schedule_after_optimizer_step(global_step)
        if self.prodigy_guard_enabled:
            decision.logs.update(self._apply_prodigy_lr_clamp(global_step, optimizer, lr_scheduler))
        if self.advanced_stats_enabled:
            decision.logs.update(self._collect_advanced_stats(global_step, optimizer, accelerator, network))
        if self._pcgrad_last_stats is not None:
            decision.logs.update(self._pcgrad_logs(self._pcgrad_last_stats))
            self._pcgrad_last_stats = None
        if self.auto_controller_enabled:
            auto_decision = self._tick_auto_controller(global_step, current_loss, average_loss, optimizer, lr_scheduler, network)
            decision.logs.update(auto_decision.logs)
            if auto_decision.stop_training:
                decision.stop_training = True
                decision.reason = auto_decision.reason

        return decision

    def _apply_stable_block_weights(self, network) -> None:
        if not hasattr(network, "set_block_lr_weight"):
            logger.warning(
                f"Lulynx BlockWeightManager is enabled for {self.route_label}, "
                f"but network module {getattr(self.args, 'network_module', 'unknown')} does not support block LR weights."
            )
            return

        down_lr_weight = _coalesce(getattr(self.args, "lulynx_down_lr_weight", None), getattr(self.args, "down_lr_weight", None))
        mid_lr_weight = _coalesce(getattr(self.args, "lulynx_mid_lr_weight", None), getattr(self.args, "mid_lr_weight", None))
        up_lr_weight = _coalesce(getattr(self.args, "lulynx_up_lr_weight", None), getattr(self.args, "up_lr_weight", None))
        block_lr_zero_threshold = _coalesce(
            getattr(self.args, "lulynx_block_lr_zero_threshold", None),
            getattr(self.args, "block_lr_zero_threshold", None),
        )

        if down_lr_weight is None and mid_lr_weight is None and up_lr_weight is None:
            logger.warning("Lulynx BlockWeightManager was enabled, but no SD / SDXL block weights were provided.")
            return

        parse_kwargs = {
            "down_lr_weight": down_lr_weight,
            "mid_lr_weight": mid_lr_weight,
            "up_lr_weight": up_lr_weight,
            "block_lr_zero_threshold": 0.0 if block_lr_zero_threshold is None else float(block_lr_zero_threshold),
        }

        block_lr_weight = None
        try:
            lora_module = importlib.import_module("networks.lora")
            block_lr_weight = lora_module.parse_block_lr_kwargs(self.route_kind == "sdxl", parse_kwargs)
        except Exception as exc:
            logger.warning(f"Lulynx BlockWeightManager failed to parse SD / SDXL block LR weights: {exc}")

        if block_lr_weight is None:
            return

        network.set_block_lr_weight(block_lr_weight)
        logger.info(f"Lulynx BlockWeightManager applied {len(block_lr_weight)} block LR multipliers to {self.route_label}.")

    def _infer_anima_block_count(self, network) -> int:
        block_indices = []
        for lora in getattr(network, "unet_loras", []) or []:
            original_name = getattr(lora, "original_name", "")
            match = re.match(r"blocks\.(\d+)\.", original_name)
            if match:
                block_indices.append(int(match.group(1)))
        if block_indices:
            return max(block_indices) + 1
        return 28

    def _apply_anima_block_weights(self, network) -> None:
        if not hasattr(network, "reg_lrs"):
            logger.warning("Lulynx BlockWeightManager could not find reg_lrs on the Anima network.")
            return

        reg_lrs: Dict[str, float] = dict(getattr(network, "reg_lrs", None) or {})
        base_unet_lr = _to_float(_coalesce(getattr(self.args, "unet_lr", None), getattr(self.args, "learning_rate", None)), 0.0)
        if base_unet_lr <= 0:
            logger.warning("Lulynx BlockWeightManager skipped Anima block LR injection because the base U-Net LR is not positive.")
            return

        block_lr_weights = _parse_float_list(getattr(self.args, "lulynx_anima_block_lr_weights", None))
        if block_lr_weights is not None:
            block_count = self._infer_anima_block_count(network)
            block_lr_weights = _fit_float_list(block_lr_weights, block_count, 1.0)
            for block_index, weight in enumerate(block_lr_weights):
                reg_lrs[rf"blocks\.{block_index}\..*"] = max(0.0, base_unet_lr * float(weight))

        llm_adapter_weight = getattr(self.args, "lulynx_anima_llm_adapter_lr_weight", None)
        if llm_adapter_weight is not None:
            reg_lrs[r"llm_adapter\..*"] = max(0.0, base_unet_lr * float(llm_adapter_weight))

        final_layer_weight = getattr(self.args, "lulynx_anima_final_layer_lr_weight", None)
        if final_layer_weight is not None:
            reg_lrs[r"final_layer\..*"] = max(0.0, base_unet_lr * float(final_layer_weight))

        norm_weight = getattr(self.args, "lulynx_anima_norm_lr_weight", None)
        if norm_weight is not None:
            reg_lrs[r".*norm.*"] = max(0.0, base_unet_lr * float(norm_weight))

        if not reg_lrs:
            logger.warning("Lulynx BlockWeightManager was enabled for Anima, but no block-weight values were provided.")
            return

        network.reg_lrs = reg_lrs
        logger.info(f"Lulynx BlockWeightManager injected {len(reg_lrs)} regex LR overrides into the Anima network.")

    def _tick_resource_manager(self, global_step: int, accelerator) -> None:
        device = getattr(accelerator, "device", None)

        if self.args.lulynx_resource_clear_cache_every_n_steps > 0:
            if global_step % self.args.lulynx_resource_clear_cache_every_n_steps == 0:
                _clean_device_cache(device)

        stats = _get_device_memory_stats(device)
        if stats is None:
            return

        reserved_ratio = stats["reserved_ratio"]
        should_log = global_step == 1 or global_step % self.args.lulynx_resource_log_interval == 0
        if should_log and self._resource_last_log_step != global_step:
            self._resource_last_log_step = global_step
            logger.info(
                "Lulynx ResourceManager step %s: reserved %.1f%%, allocated %.1f%%, peak reserved %.1f%%",
                global_step,
                reserved_ratio * 100.0,
                stats["allocated_ratio"] * 100.0,
                stats["max_reserved_ratio"] * 100.0,
            )

        if reserved_ratio >= self.args.lulynx_resource_critical_vram_ratio:
            if self._resource_last_warning_step != global_step:
                self._resource_last_warning_step = global_step
                logger.warning(
                    "Lulynx ResourceManager reached critical memory pressure at step %s "
                    "(reserved %.1f%% >= %.1f%%). Clearing caches.",
                    global_step,
                    reserved_ratio * 100.0,
                    self.args.lulynx_resource_critical_vram_ratio * 100.0,
                )
            _clean_device_cache(device)
        elif reserved_ratio >= self.args.lulynx_resource_warn_vram_ratio and self._resource_last_warning_step != global_step:
            self._resource_last_warning_step = global_step
            logger.warning(
                "Lulynx ResourceManager warning at step %s: reserved %.1f%% >= %.1f%%.",
                global_step,
                reserved_ratio * 100.0,
                self.args.lulynx_resource_warn_vram_ratio * 100.0,
            )

    def _iter_adapter_modules(self, network):
        seen = set()
        for attr_name in ("text_encoder_loras", "unet_loras", "text_encoder_norms"):
            for module in getattr(network, attr_name, []) or []:
                module_id = id(module)
                if module_id in seen:
                    continue
                seen.add(module_id)
                yield module

    def _iter_rank_modules(self, network):
        scope = self.args.lulynx_smart_rank_scope
        if scope in ("all", "text_encoder"):
            for lora in getattr(network, "text_encoder_loras", []) or []:
                yield lora
        if scope in ("all", "unet"):
            for lora in getattr(network, "unet_loras", []) or []:
                yield lora

    def _tick_smart_rank(self, global_step: int, network) -> None:
        if global_step < self.args.lulynx_smart_rank_start_step:
            return
        if global_step % self.args.lulynx_smart_rank_update_every != 0:
            return
        if self._smart_rank_last_step == global_step:
            return

        self._smart_rank_last_step = global_step
        total_rank = 0
        kept_rank = 0
        affected_modules = 0

        with torch.no_grad():
            for lora in self._iter_rank_modules(network):
                lora_down = getattr(getattr(lora, "lora_down", None), "weight", None)
                lora_up = getattr(getattr(lora, "lora_up", None), "weight", None)
                if lora_down is None or lora_up is None:
                    continue

                rank = int(lora_down.shape[0])
                if rank <= 0 or lora_up.dim() < 2 or int(lora_up.shape[1]) != rank:
                    continue

                keep_rank = min(rank, max(self.args.lulynx_smart_rank_min_active_rank, int(math.ceil(rank * self.args.lulynx_smart_rank_keep_ratio))))
                total_rank += rank
                kept_rank += keep_rank

                if keep_rank >= rank:
                    continue

                down_energy = lora_down.detach().float().reshape(rank, -1).pow(2).mean(dim=1)
                up_energy = lora_up.detach().float().movedim(1, 0).reshape(rank, -1).pow(2).mean(dim=1)
                energy = down_energy * up_energy
                topk = torch.topk(energy, k=keep_rank, largest=True).indices

                mask = torch.zeros(rank, device=lora_down.device, dtype=lora_down.dtype)
                mask[topk] = 1
                lora_down.mul_(mask.view(rank, *([1] * (lora_down.dim() - 1))))
                lora_up.mul_(mask.view(1, rank, *([1] * (lora_up.dim() - 2))))
                affected_modules += 1

        if total_rank > 0:
            logger.info(
                "Lulynx SmartRank applied at step %s: kept %s/%s rank channels across %s modules.",
                global_step,
                kept_rank,
                total_rank,
                affected_modules,
            )

    def _freeze_text_encoder_modules(self, network) -> int:
        frozen_params = 0
        for attr_name in ("text_encoder_loras", "text_encoder_norms"):
            for module in getattr(network, attr_name, []) or []:
                for param in module.parameters():
                    if param.requires_grad:
                        setattr(param, "_lulynx_force_frozen", True)
                        param.requires_grad_(False)
                        param.grad = None
                        frozen_params += param.numel()
        return frozen_params

    def _reduce_learning_rates(self, optimizer, lr_scheduler) -> bool:
        reduced = False
        decay_factor = self.args.lulynx_auto_lr_decay_factor
        min_lr = self.args.lulynx_auto_min_lr

        for param_group in optimizer.param_groups:
            current_lr = param_group.get("lr")
            if current_lr is None:
                continue
            new_lr = max(float(current_lr) * decay_factor, min_lr)
            if new_lr < float(current_lr):
                param_group["lr"] = new_lr
                reduced = True

        if reduced:
            _sync_scheduler_lrs(optimizer, lr_scheduler)
        return reduced

    def _pcgrad_logs(self, stats: PCGradStepStats) -> Dict[str, float]:
        logs: Dict[str, float] = {
            "lulynx/pcgrad_sample_count": float(stats.sample_count),
        }
        if stats.total_pairs > 0:
            logs["lulynx/pcgrad_conflict_rate"] = float(stats.conflict_rate)
            logs["lulynx/pcgrad_projections"] = float(stats.projections_applied)
        if stats.fallback_reason:
            logs["lulynx/pcgrad_fallback"] = 1.0
        return logs

    def _apply_prodigy_lr_clamp(self, global_step: int, optimizer, lr_scheduler) -> Dict[str, float]:
        optimizer_type = str(getattr(self.args, "optimizer_type", "") or "").lower()
        if "prodigy" not in optimizer_type:
            return {}

        min_lr = getattr(self.args, "lulynx_prodigy_lr_min", None)
        max_lr = getattr(self.args, "lulynx_prodigy_lr_max", None)
        if min_lr is None and max_lr is None:
            return {}

        changed = False
        lr_values = []
        for param_group in optimizer.param_groups:
            current_lr = param_group.get("lr")
            if current_lr is None:
                continue
            new_lr = float(current_lr)
            if min_lr is not None:
                new_lr = max(new_lr, float(min_lr))
            if max_lr is not None:
                new_lr = min(new_lr, float(max_lr))
            if new_lr != float(current_lr):
                param_group["lr"] = new_lr
                changed = True
            lr_values.append(float(param_group.get("lr", new_lr)))

        if changed:
            _sync_scheduler_lrs(optimizer, lr_scheduler)
            logger.info(
                "Lulynx Prodigy guard clamped learning rates at step %s to [%.8f, %.8f].",
                global_step,
                min(lr_values) if lr_values else 0.0,
                max(lr_values) if lr_values else 0.0,
            )

        logs: Dict[str, float] = {}
        if lr_values:
            logs["lulynx/prodigy_lr_min"] = float(min(lr_values))
            logs["lulynx/prodigy_lr_max"] = float(max(lr_values))
        return logs

    def _resolve_svd_target(self, module) -> Tuple[Optional[torch.Tensor], Optional[str]]:
        lora_down = getattr(getattr(module, "lora_down", None), "weight", None)
        if isinstance(lora_down, torch.Tensor) and lora_down.numel() > 0 and lora_down.dim() >= 2:
            return lora_down.detach().float().reshape(lora_down.shape[0], -1), getattr(module, "original_name", module.__class__.__name__)

        for name, param in module.named_parameters(recurse=True):
            if param.numel() <= 0 or param.dim() < 2:
                continue
            return param.detach().float().reshape(param.shape[0], -1), name
        return None, None

    def _collect_advanced_stats(self, global_step: int, optimizer, accelerator, network) -> Dict[str, float]:
        interval = max(1, int(getattr(self.args, "lulynx_svd_sample_interval", 100) or 100))
        if global_step % interval != 0:
            return {}

        logs: Dict[str, float] = {}
        lr_values = [float(group.get("lr", 0.0)) for group in optimizer.param_groups if group.get("lr") is not None]
        if lr_values:
            logs["lulynx/lr_min"] = float(min(lr_values))
            logs["lulynx/lr_max"] = float(max(lr_values))

        memory_stats = _get_device_memory_stats(getattr(accelerator, "device", None))
        if memory_stats is not None:
            logs["lulynx/vram_reserved_ratio"] = float(memory_stats["reserved_ratio"])
            logs["lulynx/vram_allocated_ratio"] = float(memory_stats["allocated_ratio"])

        modules = list(self._iter_adapter_modules(network))
        if modules:
            active_count = sum(1 for module in modules if any(param.requires_grad for param in module.parameters(recurse=True)))
            logs["lulynx/adapter_modules_total"] = float(len(modules))
            logs["lulynx/adapter_modules_active"] = float(active_count)

            module = modules[self._svd_module_cursor % len(modules)]
            self._svd_module_cursor += 1
            matrix, module_label = self._resolve_svd_target(module)
            if matrix is not None and matrix.shape[0] > 0 and matrix.shape[1] > 0:
                try:
                    svd_values = torch.linalg.svdvals(matrix)
                    if svd_values.numel() > 0:
                        top_value = float(svd_values[0].item())
                        tail_value = float(svd_values[-1].item())
                        logs["lulynx/svd_top"] = top_value
                        logs["lulynx/svd_tail"] = tail_value
                        logs["lulynx/svd_condition"] = float(top_value / max(tail_value, 1e-12))
                        logger.info(
                            "Lulynx advanced stats step %s: sampled SVD on %s (top=%.6f, tail=%.6f, cond=%.6f).",
                            global_step,
                            module_label or module.__class__.__name__,
                            top_value,
                            tail_value,
                            logs["lulynx/svd_condition"],
                        )
                except Exception as exc:
                    self._warn_once("advanced-stats-svd-failed", f"Lulynx advanced SVD sampling failed: {exc}")

        return logs

    def _tick_auto_controller(
        self,
        global_step: int,
        current_loss: float,
        average_loss: Optional[float],
        optimizer,
        lr_scheduler,
        network,
    ) -> LulynxStepDecision:
        metric = float(average_loss if average_loss is not None else current_loss)
        if not math.isfinite(metric):
            return LulynxStepDecision()

        self._auto_loss_history.append(metric)
        if global_step % self.args.lulynx_auto_check_every != 0:
            return LulynxStepDecision()
        if len(self._auto_loss_history) < self._auto_loss_history.maxlen:
            return LulynxStepDecision()

        window_loss = float(sum(self._auto_loss_history) / len(self._auto_loss_history))
        if self._auto_best_loss is None:
            self._auto_best_loss = window_loss
            logger.info(f"Lulynx AutoController baseline established at step {global_step}: loss={window_loss:.6f}")
            return LulynxStepDecision()

        required_delta = max(abs(self._auto_best_loss) * self.args.lulynx_auto_plateau_tolerance, 1e-6)
        if window_loss <= self._auto_best_loss - required_delta:
            self._auto_best_loss = window_loss
            self._auto_plateau_counter = 0
            return LulynxStepDecision()

        self._auto_plateau_counter += 1
        logger.info(
            "Lulynx AutoController plateau %s/%s at step %s: window_loss=%.6f, best=%.6f",
            self._auto_plateau_counter,
            self.args.lulynx_auto_early_stop_patience,
            global_step,
            window_loss,
            self._auto_best_loss,
        )

        if (
            self.args.lulynx_auto_freeze_text_encoder_on_plateau
            and self.train_text_encoder
            and not self._auto_text_encoder_frozen
            and self._auto_plateau_counter >= self.args.lulynx_auto_lr_patience
        ):
            frozen_params = self._freeze_text_encoder_modules(network)
            if frozen_params > 0:
                self._auto_text_encoder_frozen = True
                logger.warning(
                    f"Lulynx AutoController froze text-encoder-side LoRA parameters after plateau detection "
                    f"(step {global_step}, params={frozen_params})."
                )

        logs: Dict[str, float] = {
            "lulynx/auto_plateau_counter": float(self._auto_plateau_counter),
        }

        if self._auto_plateau_counter % self.args.lulynx_auto_lr_patience == 0:
            if self._reduce_learning_rates(optimizer, lr_scheduler):
                logger.warning(
                    "Lulynx AutoController reduced learning rates by factor %.4f at step %s.",
                    self.args.lulynx_auto_lr_decay_factor,
                    global_step,
                )

        if self._auto_plateau_counter >= self.args.lulynx_auto_early_stop_patience:
            reason = (
                f"Lulynx AutoController stopped training at step {global_step} after "
                f"{self._auto_plateau_counter} consecutive plateau checks."
            )
            logger.warning(reason)
            return LulynxStepDecision(stop_training=True, reason=reason, logs=logs)

        return LulynxStepDecision(logs=logs)


def create_lulynx_core(args: argparse.Namespace, route_kind: str, route_label: str) -> Optional[LulynxExperimentalCore]:
    if not _to_bool(getattr(args, "lulynx_experimental_core_enabled", False), False):
        return None
    return LulynxExperimentalCore(args, route_kind=route_kind, route_label=route_label)
