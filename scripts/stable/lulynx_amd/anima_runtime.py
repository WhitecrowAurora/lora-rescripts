from __future__ import annotations

import importlib
import logging
import os
from argparse import Namespace

import torch
from mikazuki.utils.runtime_safe_preview import apply_runtime_safe_preview_policy


logger = logging.getLogger(__name__)

AMD_EXPERIMENTAL_ENV = "MIKAZUKI_AMD_EXPERIMENTAL"

_SAFE_OPTIMIZER_NAMES = {
    "adamw",
    "adafactor",
    "lion",
    "sgdnesterov",
}

_UNSAFE_OPTIMIZER_KEYWORDS = (
    "8bit",
    "paged",
    "bitsandbytes",
    "ademamix",
)

_AMD_RUNTIME_VRAM_PROFILES = (
    {
        "name": "vram-tight",
        "max_memory_mb": 8 * 1024,
        "empty_cache_interval": 8,
        "sdpa_slice_trigger_gb": 0.45,
        "sdpa_slice_target_gb": 0.20,
    },
    {
        "name": "vram-constrained",
        "max_memory_mb": 12 * 1024,
        "empty_cache_interval": 12,
        "sdpa_slice_trigger_gb": 0.60,
        "sdpa_slice_target_gb": 0.28,
    },
    {
        "name": "balanced-16g",
        "max_memory_mb": 16 * 1024,
        "empty_cache_interval": 16,
        "sdpa_slice_trigger_gb": 0.75,
        "sdpa_slice_target_gb": 0.35,
    },
    {
        "name": "balanced-24g",
        "max_memory_mb": 24 * 1024,
        "empty_cache_interval": 24,
        "sdpa_slice_trigger_gb": 1.00,
        "sdpa_slice_target_gb": 0.50,
    },
    {
        "name": "roomy-32g-plus",
        "max_memory_mb": None,
        "empty_cache_interval": 32,
        "sdpa_slice_trigger_gb": 1.25,
        "sdpa_slice_target_gb": 0.75,
    },
)

_AMD_ARCH_PROFILE_MODIFIERS = {
    "rdna2": {
        "empty_cache_scale": 0.75,
        "sdpa_slice_trigger_scale": 0.85,
        "sdpa_slice_target_scale": 0.85,
    },
    "rdna3": {
        "empty_cache_scale": 1.0,
        "sdpa_slice_trigger_scale": 1.0,
        "sdpa_slice_target_scale": 1.0,
    },
    "rdna4": {
        "empty_cache_scale": 1.25,
        "sdpa_slice_trigger_scale": 1.2,
        "sdpa_slice_target_scale": 1.15,
    },
    "unknown": {
        "empty_cache_scale": 1.0,
        "sdpa_slice_trigger_scale": 1.0,
        "sdpa_slice_target_scale": 1.0,
    },
}


def _get_device_visibility_hint() -> str:
    for key in ("HIP_VISIBLE_DEVICES", "CUDA_VISIBLE_DEVICES", "ROCR_VISIBLE_DEVICES"):
        value = str(os.environ.get(key, "") or "").strip()
        if value:
            return f"{key}={value}"
    return "all-visible"


def get_amd_runtime_probe() -> dict[str, object]:
    hip_version = str(getattr(torch.version, "hip", "") or "")
    gpu_names: list[str] = []
    gpu_count = 0
    gpu_memory_mb: list[int] = []
    bf16_supported = None

    try:
        if torch.cuda.is_available():
            gpu_count = int(torch.cuda.device_count())
            gpu_names = [str(torch.cuda.get_device_name(index) or "").strip() for index in range(gpu_count)]
            gpu_memory_mb = [
                int(getattr(torch.cuda.get_device_properties(index), "total_memory", 0) // (1024 * 1024))
                for index in range(gpu_count)
            ]
    except Exception:
        gpu_count = 0
        gpu_names = []
        gpu_memory_mb = []

    try:
        if hasattr(torch.cuda, "is_bf16_supported"):
            bf16_supported = bool(torch.cuda.is_bf16_supported())
    except Exception:
        bf16_supported = None

    return {
        "hip_version": hip_version,
        "gpu_count": gpu_count,
        "gpu_names": gpu_names,
        "gpu_memory_mb": gpu_memory_mb,
        "bf16_supported": bf16_supported,
    }


def is_amd_rocm_runtime() -> bool:
    try:
        return bool(getattr(torch.version, "hip", None))
    except Exception:
        return False


def get_amd_runtime_label() -> str:
    probe = get_amd_runtime_probe()
    hip_version = probe["hip_version"]
    if not hip_version:
        return "non-amd"

    device_name = ""
    gpu_names = probe["gpu_names"]
    if gpu_names:
        device_name = str(gpu_names[0] or "").strip()

    if device_name:
        return f"AMD ROCm HIP {hip_version} / {device_name}"
    return f"AMD ROCm HIP {hip_version}"


def _infer_amd_architecture_from_gpu_name(gpu_name: str) -> str:
    lowered = str(gpu_name or "").strip().lower()
    if not lowered:
        return "unknown"

    architecture_patterns = (
        ("rdna4", ("rx 90", "rx 9070", "rx 9060", "rx 9050", "w90", "w8900", "w8800", "radeon ai pro")),
        ("rdna3", ("rx 79", "rx 78", "rx 77", "rx 76", "rx 75", "rx 74", "rx 73", "rx 7", "w79", "w78", "w77", "w76", "w75", "780m", "760m", "740m")),
        ("rdna2", ("rx 69", "rx 68", "rx 67", "rx 66", "rx 65", "rx 64", "rx 63", "rx 6", "w69", "w68", "w67", "w66", "680m", "660m")),
    )
    for architecture, markers in architecture_patterns:
        if any(marker in lowered for marker in markers):
            return architecture
    return "unknown"


def _round_positive_int(value: float, *, minimum: int = 1) -> int:
    return max(minimum, int(round(value)))


def _round_positive_float(value: float, *, minimum: float = 0.05) -> float:
    return round(max(minimum, float(value)), 2)


def _resolve_amd_runtime_vram_profile(total_memory_mb: int) -> dict[str, object]:
    normalized_memory_mb = max(0, int(total_memory_mb or 0))
    for profile in _AMD_RUNTIME_VRAM_PROFILES:
        max_memory_mb = profile["max_memory_mb"]
        if max_memory_mb is None or normalized_memory_mb <= max_memory_mb:
            return {
                "name": profile["name"],
                "total_memory_mb": normalized_memory_mb,
                "empty_cache_interval": int(profile["empty_cache_interval"]),
                "sdpa_slice_trigger_gb": float(profile["sdpa_slice_trigger_gb"]),
                "sdpa_slice_target_gb": float(profile["sdpa_slice_target_gb"]),
            }
    fallback = _AMD_RUNTIME_VRAM_PROFILES[-1]
    return {
        "name": fallback["name"],
        "total_memory_mb": normalized_memory_mb,
        "empty_cache_interval": int(fallback["empty_cache_interval"]),
        "sdpa_slice_trigger_gb": float(fallback["sdpa_slice_trigger_gb"]),
        "sdpa_slice_target_gb": float(fallback["sdpa_slice_target_gb"]),
    }


def _apply_amd_architecture_profile(profile: dict[str, object], architecture: str) -> dict[str, object]:
    normalized_architecture = str(architecture or "unknown").strip().lower()
    modifier = _AMD_ARCH_PROFILE_MODIFIERS.get(normalized_architecture, _AMD_ARCH_PROFILE_MODIFIERS["unknown"])
    profile_name = str(profile.get("name", "unknown"))

    adjusted = dict(profile)
    adjusted["architecture"] = normalized_architecture
    adjusted["profile_base_name"] = profile_name
    adjusted["name"] = f"{profile_name}-{normalized_architecture}" if normalized_architecture != "unknown" else profile_name
    adjusted["empty_cache_interval"] = _round_positive_int(
        float(adjusted["empty_cache_interval"]) * float(modifier["empty_cache_scale"])
    )
    adjusted["sdpa_slice_trigger_gb"] = _round_positive_float(
        float(adjusted["sdpa_slice_trigger_gb"]) * float(modifier["sdpa_slice_trigger_scale"])
    )
    adjusted["sdpa_slice_target_gb"] = _round_positive_float(
        float(adjusted["sdpa_slice_target_gb"]) * float(modifier["sdpa_slice_target_scale"])
    )
    return adjusted


def _resolve_selected_amd_runtime_vram_profile(runtime_probe: dict[str, object]) -> dict[str, object]:
    gpu_memory_mb = [int(value or 0) for value in runtime_probe.get("gpu_memory_mb", [])]
    gpu_names = [str(value or "").strip() for value in runtime_probe.get("gpu_names", [])]
    selected_memory_mb = max(gpu_memory_mb, default=0)
    selected_gpu_name = gpu_names[0] if gpu_names else ""
    selected_architecture = _infer_amd_architecture_from_gpu_name(selected_gpu_name)
    profile = _resolve_amd_runtime_vram_profile(selected_memory_mb)
    profile = _apply_amd_architecture_profile(profile, selected_architecture)
    profile["selected_gpu_name"] = selected_gpu_name
    return profile


def _format_amd_runtime_profile_summary(profile: dict[str, object]) -> str:
    gpu_name = str(profile.get("selected_gpu_name", "") or "").strip() or "unknown"
    architecture = str(profile.get("architecture", "unknown") or "unknown")
    profile_name = str(profile.get("name", "unknown") or "unknown")
    total_memory_mb = int(profile.get("total_memory_mb", 0) or 0)
    total_memory_gb = round(total_memory_mb / 1024, 1) if total_memory_mb > 0 else 0
    empty_cache_interval = int(profile.get("empty_cache_interval", 0) or 0)
    sdpa_slice_trigger_gb = float(profile.get("sdpa_slice_trigger_gb", 0) or 0)
    sdpa_slice_target_gb = float(profile.get("sdpa_slice_target_gb", 0) or 0)
    return (
        f"AMD GPU={gpu_name} | arch={architecture} | VRAM≈{total_memory_gb}GB | "
        f"profile={profile_name} | empty_cache_interval={empty_cache_interval} | "
        f"sdpa_slice_trigger={sdpa_slice_trigger_gb}GB | sdpa_slice_target={sdpa_slice_target_gb}GB"
    )


def _normalize_optimizer_type(raw_value: str) -> tuple[str, str | None]:
    normalized = str(raw_value or "").strip()
    if not normalized:
        return "AdamW", "AMD 实验核心未指定 optimizer_type，已自动改用 AdamW。"

    lowered = normalized.lower()
    if lowered.startswith("pytorch_optimizer."):
        return (
            "AdamW",
            f"AMD 实验核心当前禁用 {normalized}。Windows ROCm 运行时里的 pytorch_optimizer 会依赖不完整的 torch.distributed，已自动回退为 AdamW。",
        )

    if lowered in _SAFE_OPTIMIZER_NAMES:
        return normalized, None

    if any(keyword in lowered for keyword in _UNSAFE_OPTIMIZER_KEYWORDS):
        return "AdamW", f"AMD 实验核心暂不启用 {normalized}，已自动回退为 AdamW。"

    if lowered.startswith("torch.optim."):
        return normalized, None

    return "AdamW", f"AMD 实验核心暂未验证 optimizer_type={normalized}，已自动回退为 AdamW。"


def _apply_safe_preview_settings(args: Namespace, messages: list[str]) -> None:
    apply_runtime_safe_preview_policy(
        args,
        runtime_label="AMD 实验核心",
        messages=messages,
        preview_requested_key="_amd_preview_requested",
        preview_forced_off_key="_amd_preview_forced_off",
    )


def _apply_mixed_precision_policy(args: Namespace, messages: list[str], runtime_probe: dict[str, object]) -> None:
    bf16_supported = runtime_probe.get("bf16_supported")
    mixed_precision = str(getattr(args, "mixed_precision", "") or "").strip().lower()
    args._amd_requested_mixed_precision = mixed_precision or "auto"

    if not mixed_precision:
        args.mixed_precision = "bf16" if bf16_supported is not False else "fp16"
        messages.append(f"AMD 实验核心未指定 mixed_precision，已自动改用 {args.mixed_precision}。")
        return

    if mixed_precision == "bf16" and bf16_supported is False:
        args.mixed_precision = "fp16"
        messages.append("AMD 实验核心当前未检测到 bf16 支持，已自动把 mixed_precision 从 bf16 回退为 fp16。")
        return

    if mixed_precision == "no":
        messages.append("AMD 实验核心当前仍建议优先测试混合精度；若驱动和显卡稳定，通常优先使用 bf16。")


def _apply_safeguard_policy(args: Namespace, messages: list[str]) -> None:
    if not bool(getattr(args, "safeguard_enabled", False)):
        args.safeguard_enabled = True
        messages.append("AMD 实验核心已自动启用 SafeGuard 训练保护。")

    try:
        safeguard_nan_check_interval = int(getattr(args, "safeguard_nan_check_interval", 0) or 0)
    except (TypeError, ValueError):
        safeguard_nan_check_interval = 0
    if safeguard_nan_check_interval <= 0:
        args.safeguard_nan_check_interval = 1
        messages.append("AMD 实验核心已自动把 safeguard_nan_check_interval 改为 1。")

    try:
        safeguard_max_nan_count = int(getattr(args, "safeguard_max_nan_count", 0) or 0)
    except (TypeError, ValueError):
        safeguard_max_nan_count = 0
    if safeguard_max_nan_count <= 0:
        args.safeguard_max_nan_count = 3
        messages.append("AMD 实验核心已自动把 safeguard_max_nan_count 改为 3。")

    try:
        safeguard_loss_window_size = int(getattr(args, "safeguard_loss_window_size", 0) or 0)
    except (TypeError, ValueError):
        safeguard_loss_window_size = 0
    if safeguard_loss_window_size <= 0:
        args.safeguard_loss_window_size = 20
        messages.append("AMD 实验核心已自动把 safeguard_loss_window_size 改为 20。")

    if not bool(getattr(args, "safeguard_auto_reduce_lr", False)):
        args.safeguard_auto_reduce_lr = True
        messages.append("AMD 实验核心已自动启用 safeguard_auto_reduce_lr。")

    try:
        safeguard_lr_reduction_factor = float(getattr(args, "safeguard_lr_reduction_factor", 0.0) or 0.0)
    except (TypeError, ValueError):
        safeguard_lr_reduction_factor = 0.0
    if safeguard_lr_reduction_factor <= 0.0 or safeguard_lr_reduction_factor >= 1.0:
        args.safeguard_lr_reduction_factor = 0.5
        messages.append("AMD 实验核心已自动把 safeguard_lr_reduction_factor 改为 0.5。")


def _apply_diagnostics_policy(args: Namespace, messages: list[str]) -> None:
    try:
        profile_window = int(getattr(args, "anima_profile_window", 0) or 0)
    except (TypeError, ValueError):
        profile_window = 0
    if profile_window <= 0:
        args.anima_profile_window = 20
        messages.append("AMD 实验核心已自动把 anima_profile_window 改为 20。")

    messages.append("AMD 实验核心会在输出目录下写入 amd_diagnostics 诊断包。")


def _apply_windows_micro_batch_safety_policy(args: Namespace, messages: list[str]) -> None:
    if os.name != "nt":
        return

    try:
        train_batch_size = int(getattr(args, "train_batch_size", 0) or 0)
    except (TypeError, ValueError):
        train_batch_size = 0

    try:
        gradient_accumulation_steps = int(getattr(args, "gradient_accumulation_steps", 1) or 1)
    except (TypeError, ValueError):
        gradient_accumulation_steps = 1

    if gradient_accumulation_steps <= 0:
        gradient_accumulation_steps = 1

    args._amd_requested_train_batch_size = train_batch_size
    args._amd_requested_gradient_accumulation_steps = gradient_accumulation_steps

    if train_batch_size > 1:
        new_grad_accum = train_batch_size * gradient_accumulation_steps
        args.train_batch_size = 1
        args.gradient_accumulation_steps = new_grad_accum
        messages.append(
            f"Windows AMD 实验核心已将 train_batch_size 从 {train_batch_size} 改为 1，并把 gradient_accumulation_steps 从 {gradient_accumulation_steps} 改为 {new_grad_accum}，以降低单次内核执行时间与 TDR 风险。"
        )


def _apply_memory_fragmentation_policy(args: Namespace, messages: list[str]) -> None:
    runtime_probe = get_amd_runtime_probe()
    vram_profile = _resolve_selected_amd_runtime_vram_profile(runtime_probe)
    args._amd_runtime_profile_name = str(vram_profile["name"])
    args._amd_runtime_profile_memory_mb = int(vram_profile["total_memory_mb"])
    args._amd_runtime_profile_architecture = str(vram_profile["architecture"])
    args._amd_runtime_profile_gpu_name = str(vram_profile.get("selected_gpu_name", "") or "")

    try:
        empty_cache_interval = int(getattr(args, "amd_empty_cache_interval", 0) or 0)
    except (TypeError, ValueError):
        empty_cache_interval = 0
    if empty_cache_interval <= 0:
        args.amd_empty_cache_interval = int(vram_profile["empty_cache_interval"])
        messages.append(
            f"AMD 实验核心已按显存档位 {vram_profile['name']} 自动把 amd_empty_cache_interval 改为 {args.amd_empty_cache_interval}。"
        )

    if int(vram_profile["total_memory_mb"]) > 0:
        messages.append("AMD 实验核心显存策略：" + _format_amd_runtime_profile_summary(vram_profile))


def _apply_rocm_attention_guard(args: Namespace, messages: list[str]) -> None:
    runtime_probe = get_amd_runtime_probe()
    vram_profile = _resolve_selected_amd_runtime_vram_profile(runtime_probe)
    args._amd_runtime_profile_name = str(vram_profile["name"])
    args._amd_runtime_profile_memory_mb = int(vram_profile["total_memory_mb"])
    args._amd_runtime_profile_architecture = str(vram_profile["architecture"])
    args._amd_runtime_profile_gpu_name = str(vram_profile.get("selected_gpu_name", "") or "")

    trigger_gb = str(getattr(args, "amd_sdpa_slice_trigger_gb", "") or "").strip()
    target_gb = str(getattr(args, "amd_sdpa_slice_target_gb", "") or "").strip()
    if not trigger_gb:
        args.amd_sdpa_slice_trigger_gb = float(vram_profile["sdpa_slice_trigger_gb"])
        trigger_gb = str(args.amd_sdpa_slice_trigger_gb)
    if not target_gb:
        args.amd_sdpa_slice_target_gb = float(vram_profile["sdpa_slice_target_gb"])
        target_gb = str(args.amd_sdpa_slice_target_gb)

    os.environ.setdefault("MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB", str(args.amd_sdpa_slice_trigger_gb))
    os.environ.setdefault("MIKAZUKI_ROCM_SDPA_SLICE_GB", str(args.amd_sdpa_slice_target_gb))
    messages.append(
        f"AMD 实验核心已配置分片 SDPA 保护：profile={vram_profile['name']}，trigger={os.environ['MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB']}GB，target={os.environ['MIKAZUKI_ROCM_SDPA_SLICE_GB']}GB。"
    )


def apply_anima_amd_experimental_policy(args: Namespace) -> list[str]:
    messages: list[str] = []

    if not is_amd_rocm_runtime():
        return messages

    os.environ[AMD_EXPERIMENTAL_ENV] = "1"
    runtime_probe = get_amd_runtime_probe()
    _apply_rocm_attention_guard(args, messages)

    requested_attn_mode = str(getattr(args, "attn_mode", "") or "").strip().lower()
    requested_legacy_sage = bool(
        requested_attn_mode == "sageattn" or getattr(args, "sageattn", False) or getattr(args, "use_sage_attn", False)
    )
    args._amd_requested_attn_mode = requested_attn_mode or "auto"
    args._amd_device_visibility_hint = _get_device_visibility_hint()
    if requested_attn_mode not in {"", "none", "null", "torch", "sdpa"}:
        messages.append(f"AMD 实验核心暂不启用 {requested_attn_mode} attention，已强制改用 SDPA。")
    args.attn_mode = "torch"

    if bool(getattr(args, "xformers", False)):
        args.xformers = False
        messages.append("AMD 实验核心已自动禁用 xformers。")

    if bool(getattr(args, "mem_eff_attn", False)):
        args.mem_eff_attn = False
        messages.append("AMD 实验核心已自动禁用 mem_eff_attn。")

    if bool(getattr(args, "use_8bit_adam", False)):
        args.use_8bit_adam = False
        messages.append("AMD 实验核心已自动禁用 use_8bit_adam。")

    normalized_optimizer, optimizer_message = _normalize_optimizer_type(getattr(args, "optimizer_type", ""))
    args.optimizer_type = normalized_optimizer
    if optimizer_message:
        messages.append(optimizer_message)

    if bool(getattr(args, "fused_backward_pass", False)):
        args.fused_backward_pass = False
        messages.append("AMD 实验核心已自动禁用 fused_backward_pass。")

    if bool(getattr(args, "full_fp16", False)):
        args.full_fp16 = False
        messages.append("AMD 实验核心暂不启用 full_fp16，已自动关闭。")

    if bool(getattr(args, "full_bf16", False)):
        args.full_bf16 = False
        messages.append("AMD 实验核心暂不启用 full_bf16，已自动关闭。")

    if os.name == "nt" and bool(getattr(args, "torch_compile", False)):
        args.torch_compile = False
        messages.append("Windows AMD 实验核心已自动禁用 torch_compile。")

    try:
        max_workers = int(getattr(args, "max_data_loader_n_workers", 0) or 0)
    except (TypeError, ValueError):
        max_workers = 0
    if max_workers > 0:
        args.max_data_loader_n_workers = 0
        messages.append("AMD 实验核心已自动把 max_data_loader_n_workers 改为 0。")

    if bool(getattr(args, "persistent_data_loader_workers", False)):
        args.persistent_data_loader_workers = False
        messages.append("AMD 实验核心已自动关闭 persistent_data_loader_workers。")

    try:
        nan_check_interval = int(getattr(args, "anima_nan_check_interval", 0) or 0)
    except (TypeError, ValueError):
        nan_check_interval = 0
    if nan_check_interval <= 0:
        args.anima_nan_check_interval = 1
        messages.append("AMD 实验核心已自动把 anima_nan_check_interval 改为 1。")

    if bool(getattr(args, "sageattn", False)):
        args.sageattn = False
    if hasattr(args, "use_sage_attn") and bool(getattr(args, "use_sage_attn", False)):
        args.use_sage_attn = False
    if hasattr(args, "sdpa"):
        args.sdpa = True
    if requested_legacy_sage:
        messages.append("当前构建已移除 AMD ROCm SageAttention 实验入口；AMD 实验核心已自动回退为 SDPA。")

    _apply_safe_preview_settings(args, messages)
    _apply_mixed_precision_policy(args, messages, runtime_probe)
    _apply_safeguard_policy(args, messages)
    _apply_diagnostics_policy(args, messages)
    _apply_windows_micro_batch_safety_policy(args, messages)
    _apply_memory_fragmentation_policy(args, messages)

    return messages


def log_anima_amd_experimental_banner(args: Namespace, messages: list[str]) -> None:
    if not is_amd_rocm_runtime():
        return

    runtime_probe = get_amd_runtime_probe()
    mixed_precision = str(getattr(args, "mixed_precision", "no") or "no").strip().lower()
    gpu_names = [name for name in runtime_probe.get("gpu_names", []) if str(name).strip()]
    gpu_summary = ", ".join(gpu_names) if gpu_names else "unknown"
    logger.warning(
        f"Anima AMD experimental core active: runtime={get_amd_runtime_label()} | "
        f"device_visibility={getattr(args, '_amd_device_visibility_hint', _get_device_visibility_hint())} | "
        f"requested_attn_mode={getattr(args, '_amd_requested_attn_mode', 'auto')} | "
        f"attn_mode={getattr(args, 'attn_mode', 'torch')} | "
        f"optimizer_type={getattr(args, 'optimizer_type', 'AdamW')} | "
        f"requested_mixed_precision={getattr(args, '_amd_requested_mixed_precision', 'auto')} | "
        f"mixed_precision={mixed_precision} | "
        f"visible_gpu_count={runtime_probe.get('gpu_count', 0)} | "
        f"visible_gpus={gpu_summary} | "
        f"runtime_profile={getattr(args, '_amd_runtime_profile_name', 'unknown')} | "
        f"runtime_profile_memory_mb={getattr(args, '_amd_runtime_profile_memory_mb', 0)} | "
        f"runtime_profile_architecture={getattr(args, '_amd_runtime_profile_architecture', 'unknown')} | "
        f"runtime_profile_gpu={getattr(args, '_amd_runtime_profile_gpu_name', '')} | "
        f"bf16_supported={runtime_probe.get('bf16_supported')} | "
        f"preview_requested={bool(getattr(args, '_amd_preview_requested', False))} | "
        f"preview_forced_off={bool(getattr(args, '_amd_preview_forced_off', False))} | "
        f"preview_backend={getattr(args, '_runtime_preview_backend', '')} | "
        f"sample_at_first={bool(getattr(args, 'sample_at_first', False))} | "
        f"sample_every_n_steps={getattr(args, 'sample_every_n_steps', None)} | "
        f"sample_every_n_epochs={getattr(args, 'sample_every_n_epochs', None)} | "
        f"requested_train_batch_size={getattr(args, '_amd_requested_train_batch_size', getattr(args, 'train_batch_size', 0))} | "
        f"train_batch_size={getattr(args, 'train_batch_size', 0)} | "
        f"requested_gradient_accumulation_steps={getattr(args, '_amd_requested_gradient_accumulation_steps', getattr(args, 'gradient_accumulation_steps', 1))} | "
        f"gradient_accumulation_steps={getattr(args, 'gradient_accumulation_steps', 1)} | "
        f"max_data_loader_n_workers={getattr(args, 'max_data_loader_n_workers', 0)} | "
        f"persistent_data_loader_workers={bool(getattr(args, 'persistent_data_loader_workers', False))} | "
        f"anima_nan_check_interval={getattr(args, 'anima_nan_check_interval', 0)} | "
        f"safeguard_enabled={bool(getattr(args, 'safeguard_enabled', False))} | "
        f"safeguard_nan_check_interval={getattr(args, 'safeguard_nan_check_interval', 0)} | "
        f"safeguard_max_nan_count={getattr(args, 'safeguard_max_nan_count', 0)} | "
        f"safeguard_auto_reduce_lr={bool(getattr(args, 'safeguard_auto_reduce_lr', False))} | "
        f"anima_profile_window={getattr(args, 'anima_profile_window', 0)} | "
        f"amd_empty_cache_interval={getattr(args, 'amd_empty_cache_interval', 0)} | "
        f"amd_sdpa_slice_trigger_gb={os.environ.get('MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB', '')} | "
        f"amd_sdpa_slice_target_gb={os.environ.get('MIKAZUKI_ROCM_SDPA_SLICE_GB', '')}"
    )
    logger.warning(
        "Anima AMD profile summary: "
        + _format_amd_runtime_profile_summary(
            {
                "selected_gpu_name": getattr(args, "_amd_runtime_profile_gpu_name", ""),
                "architecture": getattr(args, "_amd_runtime_profile_architecture", "unknown"),
                "name": getattr(args, "_amd_runtime_profile_name", "unknown"),
                "total_memory_mb": getattr(args, "_amd_runtime_profile_memory_mb", 0),
                "empty_cache_interval": getattr(args, "amd_empty_cache_interval", 0),
                "sdpa_slice_trigger_gb": os.environ.get("MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB", ""),
                "sdpa_slice_target_gb": os.environ.get("MIKAZUKI_ROCM_SDPA_SLICE_GB", ""),
            }
        )
    )
    logger.warning(
        "当前已进入 Anima AMD 实验核心。该路由仅面向 ROCm 环境，优先保证可训练与可回退，不追求极限性能。"
    )

    if mixed_precision == "no":
        logger.warning("AMD 实验核心当前未启用混合精度。若设备稳定支持，通常建议优先测试 bf16。")

    for message in messages:
        logger.warning(message)
