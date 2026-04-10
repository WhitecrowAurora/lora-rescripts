from __future__ import annotations

import importlib
import os
from typing import Any

from mikazuki.utils.runtime_safe_preview import apply_runtime_safe_preview_policy


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

_PYTORCH_OPTIMIZER_PREFIX = "pytorch_optimizer."

_SUPPORTED_AMD_ANIMA_TRAINING_TYPES = {
    "anima-lora",
    "sdxl-lora",
    "sdxl-finetune",
}

_AMD_WINDOWS_OFFICIAL_GPU_PATTERNS = (
    "radeon rx 9070",
    "radeon rx 9070 xt",
    "radeon ai pro r9700",
    "radeon rx 9060 xt",
    "radeon rx 7900 xtx",
    "radeon rx 7700",
    "radeon pro w7900",
    "radeon pro w7900 dual slot",
)

_AMD_WINDOWS_BLOCKED_GPU_MARKERS = (
    "780m",
    "760m",
    "740m",
    "680m",
    "660m",
    "graphics",
    "vega",
    "polaris",
    "rx 580",
    "rx 570",
    "rx 560",
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


def is_amd_rocm_runtime_requested() -> bool:
    preferred_runtime = str(os.environ.get("MIKAZUKI_PREFERRED_RUNTIME", "") or "").strip().lower()
    if preferred_runtime == "rocm-amd":
        return True
    if str(os.environ.get("MIKAZUKI_ROCM_AMD_STARTUP", "") or "").strip() == "1":
        return True
    if str(os.environ.get("MIKAZUKI_AMD_EXPERIMENTAL", "") or "").strip() == "1":
        return True
    return False


def get_amd_rocm_runtime_probe() -> dict[str, Any]:
    result: dict[str, Any] = {
        "runtime_requested": is_amd_rocm_runtime_requested(),
        "torch_import_ok": False,
        "torch_error": "",
        "hip_version": "",
        "gpu_available": False,
        "gpu_count": 0,
        "gpu_names": [],
        "gpu_memory_mb": [],
        "bf16_supported": None,
    }

    if not result["runtime_requested"]:
        return result

    try:
        import torch
    except Exception as exc:
        result["torch_error"] = str(exc)
        return result

    result["torch_import_ok"] = True
    result["hip_version"] = str(getattr(torch.version, "hip", "") or "")

    try:
        result["gpu_available"] = bool(torch.cuda.is_available())
    except Exception as exc:
        result["torch_error"] = f"torch.cuda.is_available failed: {exc}"
        return result

    try:
        if result["gpu_available"]:
            result["gpu_count"] = int(torch.cuda.device_count())
            result["gpu_names"] = [str(torch.cuda.get_device_name(index) or "") for index in range(result["gpu_count"])]
            result["gpu_memory_mb"] = [
                int(getattr(torch.cuda.get_device_properties(index), "total_memory", 0) // (1024 * 1024))
                for index in range(result["gpu_count"])
            ]
    except Exception as exc:
        result["torch_error"] = f"torch.cuda device probe failed: {exc}"

    if len(result["gpu_memory_mb"]) != len(result["gpu_names"]):
        result["gpu_memory_mb"] = [0 for _ in result["gpu_names"]]

    try:
        if hasattr(torch.cuda, "is_bf16_supported"):
            result["bf16_supported"] = bool(torch.cuda.is_bf16_supported())
    except Exception:
        result["bf16_supported"] = None

    return result


def _normalize_optimizer_type(raw_value: str) -> tuple[str, str | None]:
    normalized = str(raw_value or "").strip()
    if not normalized:
        return "AdamW", "AMD 实验路线未指定 optimizer_type，已自动改用 AdamW。"

    lowered = normalized.lower()
    if lowered.startswith(_PYTORCH_OPTIMIZER_PREFIX):
        return (
            "AdamW",
            f"AMD 实验路线当前禁用 {normalized}。Windows ROCm 运行时里的 pytorch_optimizer 会依赖不完整的 torch.distributed，已自动回退为 AdamW。",
        )

    if lowered in _SAFE_OPTIMIZER_NAMES:
        return normalized, None

    if any(keyword in lowered for keyword in _UNSAFE_OPTIMIZER_KEYWORDS):
        return "AdamW", f"AMD 实验路线暂不启用 {normalized}，已自动回退为 AdamW。"

    if lowered.startswith("torch.optim."):
        return normalized, None

    return "AdamW", f"AMD 实验路线暂未验证 optimizer_type={normalized}，已自动回退为 AdamW。"


def apply_amd_runtime_optimizer_guard(config: dict) -> dict[str, Any]:
    result: dict[str, Any] = {
        "warnings": [],
        "notes": [],
        "errors": [],
    }

    if not is_amd_rocm_runtime_requested():
        return result

    if parse_boolish(config.get("use_8bit_adam")):
        config["use_8bit_adam"] = False
        result["warnings"].append("AMD 实验路线已自动禁用 use_8bit_adam。")

    normalized_optimizer, optimizer_warning = _normalize_optimizer_type(str(config.get("optimizer_type", "") or ""))
    config["optimizer_type"] = normalized_optimizer
    if optimizer_warning:
        result["warnings"].append(optimizer_warning)

    return result


def _is_anima_training_type(training_type: str) -> bool:
    return str(training_type or "").strip().lower().startswith("anima")


def _is_sdxl_training_type(training_type: str) -> bool:
    return str(training_type or "").strip().lower().startswith("sdxl")


def _is_runtime_guarded_training_type(training_type: str) -> bool:
    return _is_anima_training_type(training_type) or _is_sdxl_training_type(training_type)


def _is_supported_amd_anima_training_type(training_type: str) -> bool:
    return str(training_type or "").strip().lower() in _SUPPORTED_AMD_ANIMA_TRAINING_TYPES


def _pick_preferred_gpu_index(probe: dict[str, Any]) -> int:
    gpu_names = [str(name or "").strip() for name in probe.get("gpu_names", [])]
    gpu_memory_mb = [int(value or 0) for value in probe.get("gpu_memory_mb", [])]
    if not gpu_names:
        return 0

    best_index = 0
    best_score = (-1, -1)
    for index, gpu_name in enumerate(gpu_names):
        lowered = gpu_name.lower()
        is_discrete = int("radeon" in lowered and "graphics" not in lowered)
        memory_score = gpu_memory_mb[index] if index < len(gpu_memory_mb) else 0
        score = (is_discrete, memory_score)
        if score > best_score:
            best_score = score
            best_index = index
    return best_index


def _get_probe_gpu_memory_mb(probe: dict[str, Any], gpu_index: int) -> int:
    gpu_memory_mb = [int(value or 0) for value in probe.get("gpu_memory_mb", [])]
    if gpu_index < 0 or gpu_index >= len(gpu_memory_mb):
        return 0
    return gpu_memory_mb[gpu_index]


def _get_probe_gpu_name(probe: dict[str, Any], gpu_index: int) -> str:
    gpu_names = [str(value or "").strip() for value in probe.get("gpu_names", [])]
    if gpu_index < 0 or gpu_index >= len(gpu_names):
        return ""
    return gpu_names[gpu_index]


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


def _classify_amd_windows_support(gpu_name: str, architecture: str) -> str:
    lowered = str(gpu_name or "").strip().lower()
    normalized_architecture = str(architecture or "").strip().lower()

    if not lowered:
        return "unknown"

    if any(pattern in lowered for pattern in _AMD_WINDOWS_OFFICIAL_GPU_PATTERNS):
        return "official"

    if any(marker in lowered for marker in _AMD_WINDOWS_BLOCKED_GPU_MARKERS):
        return "blocked"

    if normalized_architecture in {"rdna2", "rdna3", "rdna4"}:
        return "experimental"

    return "blocked"


def _round_positive_int(value: float, *, minimum: int = 1) -> int:
    return max(minimum, int(round(value)))


def _round_positive_float(value: float, *, minimum: float = 0.05) -> float:
    return round(max(minimum, float(value)), 2)


def _resolve_amd_runtime_vram_profile(total_memory_mb: int) -> dict[str, Any]:
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


def _apply_amd_architecture_profile(profile: dict[str, Any], architecture: str) -> dict[str, Any]:
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


def _resolve_selected_amd_runtime_vram_profile(probe: dict[str, Any], gpu_ids: list[str] | None) -> dict[str, Any]:
    selected_indices: list[int] = []
    for raw_gpu_id in list(gpu_ids or []):
        try:
            selected_indices.append(int(raw_gpu_id))
        except (TypeError, ValueError):
            continue

    if not selected_indices:
        selected_indices = [_pick_preferred_gpu_index(probe)]

    selected_gpu_name = _get_probe_gpu_name(probe, selected_indices[0]) if selected_indices else ""
    selected_architecture = _infer_amd_architecture_from_gpu_name(selected_gpu_name)
    selected_memory_mb = max((_get_probe_gpu_memory_mb(probe, gpu_index) for gpu_index in selected_indices), default=0)
    profile = _resolve_amd_runtime_vram_profile(selected_memory_mb)
    profile = _apply_amd_architecture_profile(profile, selected_architecture)
    profile["selected_gpu_ids"] = [str(gpu_index) for gpu_index in selected_indices]
    profile["selected_gpu_name"] = selected_gpu_name
    return profile


def _format_amd_runtime_profile_summary(profile: dict[str, Any]) -> str:
    gpu_name = str(profile.get("selected_gpu_name", "") or "").strip() or "unknown"
    architecture = str(profile.get("architecture", "unknown") or "unknown")
    profile_name = str(profile.get("name", "unknown") or "unknown")
    total_memory_mb = int(profile.get("total_memory_mb", 0) or 0)
    total_memory_gb = round(total_memory_mb / 1024, 1) if total_memory_mb > 0 else 0
    empty_cache_interval = int(profile.get("empty_cache_interval", 0) or 0)
    sdpa_slice_trigger_gb = float(profile.get("sdpa_slice_trigger_gb", 0) or 0)
    sdpa_slice_target_gb = float(profile.get("sdpa_slice_target_gb", 0) or 0)
    return (
        f"已识别 AMD GPU：{gpu_name}。"
        f"架构判定={architecture}，显存约 {total_memory_gb}GB，"
        f"当前自动套用 {profile_name} 档位；"
        f"empty_cache_interval={empty_cache_interval}，"
        f"SDPA slice trigger={sdpa_slice_trigger_gb}GB，"
        f"target={sdpa_slice_target_gb}GB。"
    )


def _is_preview_requested(config: dict) -> bool:
    if parse_boolish(config.get("enable_preview")):
        return True
    if parse_boolish(config.get("sample_at_first")):
        return True

    for key in ("sample_every_n_steps", "sample_every_n_epochs"):
        raw_value = config.get(key)
        try:
            if raw_value is not None and int(raw_value) > 0:
                return True
        except (TypeError, ValueError):
            pass

    for key in ("prompt_file", "sample_prompts", "positive_prompts", "negative_prompts"):
        if str(config.get(key, "") or "").strip():
            return True

    return False


def _clear_preview_fields(config: dict) -> None:
    config["enable_preview"] = False
    config["sample_at_first"] = False
    for key in (
        "sample_every_n_steps",
        "sample_every_n_epochs",
        "prompt_file",
        "sample_prompts",
        "positive_prompts",
        "negative_prompts",
        "randomly_choice_prompt",
        "random_prompt_include_subdirs",
    ):
        config.pop(key, None)


def _apply_windows_micro_batch_safety_policy(config: dict, warnings: list[str]) -> None:
    if os.name != "nt":
        return

    raw_batch_size = config.get("train_batch_size")
    raw_grad_accum = config.get("gradient_accumulation_steps")

    try:
        train_batch_size = int(raw_batch_size or 0)
    except (TypeError, ValueError):
        train_batch_size = 0

    try:
        gradient_accumulation_steps = int(raw_grad_accum or 1)
    except (TypeError, ValueError):
        gradient_accumulation_steps = 1

    if gradient_accumulation_steps <= 0:
        gradient_accumulation_steps = 1

    if train_batch_size > 1:
        new_grad_accum = train_batch_size * gradient_accumulation_steps
        config["train_batch_size"] = 1
        config["gradient_accumulation_steps"] = new_grad_accum
        warnings.append(
            f"Windows AMD 实验路线已将 train_batch_size 从 {train_batch_size} 改为 1，并把 gradient_accumulation_steps 从 {gradient_accumulation_steps} 改为 {new_grad_accum}，以降低单次内核执行时间与 TDR 风险。"
        )


def apply_amd_anima_topology_guard(config: dict, gpu_ids: list[str] | None) -> dict[str, Any]:
    result: dict[str, Any] = {
        "gpu_ids": list(gpu_ids or []),
        "warnings": [],
        "notes": [],
        "errors": [],
        "probe": get_amd_rocm_runtime_probe(),
    }

    training_type = str(config.get("model_train_type", "") or "").strip().lower()
    if not result["probe"]["runtime_requested"] or not _is_runtime_guarded_training_type(training_type):
        return result

    if not _is_supported_amd_anima_training_type(training_type):
        supported = ", ".join(sorted(_SUPPORTED_AMD_ANIMA_TRAINING_TYPES))
        result["errors"].append(
            f"当前 AMD ROCm 实验运行时仅开放 {supported}。"
            f"检测到的是 {training_type}，为避免进入未完整接入 AMD 诊断与保护策略的训练路径，已阻止启动。"
        )
        return result

    probe = result["probe"]
    if not probe["torch_import_ok"]:
        result["errors"].append(f"AMD 实验运行时当前无法导入 torch：{probe['torch_error']}")
        return result

    if not probe["hip_version"]:
        result["errors"].append("当前运行时不是 ROCm 版 torch，AMD 实验训练无法启动。")
        return result

    if not probe["gpu_available"] or int(probe["gpu_count"] or 0) <= 0:
        result["errors"].append("当前 ROCm 运行时未检测到可用 AMD GPU，AMD 实验训练无法启动。")
        return result

    gpu_names = [name for name in probe.get("gpu_names", []) if str(name).strip()]
    gpu_summary = ", ".join(gpu_names) if gpu_names else f"{probe['gpu_count']} visible AMD GPU(s)"
    result["notes"].append(f"AMD ROCm 运行时：HIP {probe['hip_version']}；可见显卡：{gpu_summary}。")

    if parse_boolish(config.get("enable_distributed_training")):
        config["enable_distributed_training"] = False
        result["warnings"].append("AMD 实验路线当前按单卡安全模式运行，已自动关闭分布式训练。")

    selected_gpu_ids = list(result["gpu_ids"])
    if len(selected_gpu_ids) > 1:
        kept_gpu_id = selected_gpu_ids[0]
        selected_gpu_ids = [kept_gpu_id]
        result["warnings"].append(f"AMD 实验路线当前默认只保留单卡，已自动改为 GPU {kept_gpu_id}。")
    elif len(selected_gpu_ids) == 0:
        preferred_index = _pick_preferred_gpu_index(probe)
        selected_gpu_ids = [str(preferred_index)]
        result["warnings"].append(f"AMD 实验路线未显式指定 GPU，已自动优先选择显存更大的 AMD GPU {preferred_index}。")

    result["gpu_ids"] = selected_gpu_ids
    if selected_gpu_ids:
        config["gpu_ids"] = selected_gpu_ids
        result["notes"].append(f"AMD 实验路线最终使用 GPU: {', '.join(selected_gpu_ids)}。")
    else:
        config.pop("gpu_ids", None)

    runtime_vram_profile = _resolve_selected_amd_runtime_vram_profile(probe, selected_gpu_ids)
    result["notes"].append(_format_amd_runtime_profile_summary(runtime_vram_profile))

    selected_gpu_name = str(runtime_vram_profile.get("selected_gpu_name", "") or "").strip()
    selected_architecture = str(runtime_vram_profile.get("architecture", "unknown") or "unknown")
    windows_support = _classify_amd_windows_support(selected_gpu_name, selected_architecture)
    if os.name == "nt":
        if windows_support == "official":
            result["notes"].append("当前显卡命中 AMD 当前公开的 Windows ROCm 支持矩阵。")
        elif windows_support == "experimental":
            result["warnings"].append(
                "当前显卡属于 RDNA2/3/4，但不在 AMD 当前公开的 Windows ROCm 官方支持矩阵中。"
                "项目仍按实验路线继续，并会优先启用更保守的 fallback 与保护策略。"
            )
        elif windows_support == "blocked":
            result["errors"].append(
                f"当前 AMD GPU（{selected_gpu_name or 'unknown'}）不在项目当前的 Windows AMD 实验支持范围内。"
                "目前仅继续面向离散 RDNA2 / RDNA3 / RDNA4 做实验接入；"
                "对明显非目标设备（如旧 GCN / Vega / 集显）会直接阻止启动。"
            )
            return result

    raw_gpu_power_limit = config.get("gpu_power_limit_w")
    try:
        gpu_power_limit_w = int(round(float(raw_gpu_power_limit)))
    except (TypeError, ValueError):
        gpu_power_limit_w = 0
    if gpu_power_limit_w > 0:
        config["gpu_power_limit_w"] = 0
        result["warnings"].append("AMD 实验路线不支持 nvidia-smi 功率墙，已自动忽略 GPU 功率限制。")

    return result


def apply_amd_anima_runtime_config_guard(config: dict, runtime_probe: dict[str, Any] | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {
        "warnings": [],
        "notes": [],
        "errors": [],
        "skip_preview_prompt_prep": False,
    }

    training_type = str(config.get("model_train_type", "") or "").strip().lower()
    if not is_amd_rocm_runtime_requested() or not _is_runtime_guarded_training_type(training_type):
        return result

    if not _is_supported_amd_anima_training_type(training_type):
        supported = ", ".join(sorted(_SUPPORTED_AMD_ANIMA_TRAINING_TYPES))
        result["errors"].append(
            f"当前 AMD ROCm 实验运行时仅开放 {supported}。"
            f"检测到的是 {training_type}，已停止继续应用运行时改写。"
        )
        return result

    probe = runtime_probe if isinstance(runtime_probe, dict) else get_amd_rocm_runtime_probe()
    runtime_vram_profile = _resolve_selected_amd_runtime_vram_profile(
        probe,
        [str(gpu_id) for gpu_id in config.get("gpu_ids", [])] if isinstance(config.get("gpu_ids"), list) else None,
    )
    bf16_supported = probe.get("bf16_supported")
    if bf16_supported is True:
        result["notes"].append("当前 AMD ROCm 运行时报告 bf16 可用。")
    elif bf16_supported is False:
        result["notes"].append("当前 AMD ROCm 运行时未报告 bf16 可用。")
    else:
        result["notes"].append("当前 AMD ROCm 运行时无法确认 bf16 支持状态。")

    requested_attn_mode = str(config.get("attn_mode", "") or "").strip().lower()
    is_sdxl_route = _is_sdxl_training_type(training_type)
    requested_legacy_sage = (
        requested_attn_mode == "sageattn"
        or parse_boolish(config.get("sageattn"))
        or parse_boolish(config.get("use_sage_attn"))
    )
    if requested_attn_mode not in {"", "none", "null", "torch", "sdpa"}:
        result["warnings"].append(f"AMD 实验路线暂不启用 {requested_attn_mode} attention，已自动改用 SDPA。")

    config["attn_mode"] = "sdpa"
    config["sdpa"] = True

    for key, label in (
        ("xformers", "xformers"),
        ("mem_eff_attn", "mem_eff_attn"),
        ("torch_compile", "torch_compile"),
        ("full_fp16", "full_fp16"),
        ("full_bf16", "full_bf16"),
        ("use_8bit_adam", "use_8bit_adam"),
        ("fused_backward_pass", "fused_backward_pass"),
    ):
        if parse_boolish(config.get(key)):
            config[key] = False
            result["warnings"].append(f"AMD 实验路线已自动禁用 {label}。")

    if parse_boolish(config.get("sageattn")) or parse_boolish(config.get("use_sage_attn")):
        config["sageattn"] = False
        config["use_sage_attn"] = False
    if requested_legacy_sage:
        result["warnings"].append("当前构建已移除 AMD ROCm SageAttention 实验入口；本次训练已自动回退为 SDPA。")

    mixed_precision = str(config.get("mixed_precision", "") or "").strip().lower()
    if not mixed_precision:
        config["mixed_precision"] = "bf16" if bf16_supported is not False else "fp16"
        result["warnings"].append(f"AMD 实验路线未指定 mixed_precision，已自动改用 {config['mixed_precision']}。")
    elif mixed_precision == "bf16" and bf16_supported is False:
        config["mixed_precision"] = "fp16"
        result["warnings"].append("当前 AMD ROCm 运行时未报告 bf16 可用，已自动把 mixed_precision 从 bf16 回退为 fp16。")
    elif mixed_precision == "no":
        result["warnings"].append("当前 AMD 实验路线仍建议优先使用混合精度；若驱动和显卡稳定，通常优先测试 bf16。")

    if apply_runtime_safe_preview_policy(
        config,
        runtime_label="AMD 实验路线",
        messages=result["warnings"],
    ):
        result["skip_preview_prompt_prep"] = False

    try:
        max_workers = int(config.get("max_data_loader_n_workers", 0) or 0)
    except (TypeError, ValueError):
        max_workers = 0
    if max_workers > 0:
        config["max_data_loader_n_workers"] = 0
        result["warnings"].append("AMD 实验路线已自动把 max_data_loader_n_workers 改为 0。")

    if parse_boolish(config.get("persistent_data_loader_workers")):
        config["persistent_data_loader_workers"] = False
        result["warnings"].append("AMD 实验路线已自动关闭 persistent_data_loader_workers。")

    try:
        nan_interval = int(config.get("anima_nan_check_interval", 0) or 0)
    except (TypeError, ValueError):
        nan_interval = 0
    if nan_interval <= 0:
        config["anima_nan_check_interval"] = 1
        result["warnings"].append("AMD 实验路线已自动把 anima_nan_check_interval 改为 1。")

    empty_cache_interval = config.get("amd_empty_cache_interval")
    try:
        empty_cache_interval = int(empty_cache_interval or 0)
    except (TypeError, ValueError):
        empty_cache_interval = 0
    if empty_cache_interval <= 0:
        config["amd_empty_cache_interval"] = runtime_vram_profile["empty_cache_interval"]
        result["warnings"].append(
            f"AMD 实验路线已按显存档位 {runtime_vram_profile['name']} 自动把 amd_empty_cache_interval 改为 {config['amd_empty_cache_interval']}。"
        )

    if not str(config.get("amd_sdpa_slice_trigger_gb", "") or "").strip():
        config["amd_sdpa_slice_trigger_gb"] = runtime_vram_profile["sdpa_slice_trigger_gb"]
    if not str(config.get("amd_sdpa_slice_target_gb", "") or "").strip():
        config["amd_sdpa_slice_target_gb"] = runtime_vram_profile["sdpa_slice_target_gb"]
    try:
        sdpa_slice_trigger_gb = float(config.get("amd_sdpa_slice_trigger_gb") or 0)
    except (TypeError, ValueError):
        sdpa_slice_trigger_gb = 0.0
    try:
        sdpa_slice_target_gb = float(config.get("amd_sdpa_slice_target_gb") or 0)
    except (TypeError, ValueError):
        sdpa_slice_target_gb = 0.0
    if sdpa_slice_trigger_gb <= 0 and runtime_vram_profile["sdpa_slice_trigger_gb"] > 0:
        config["amd_sdpa_slice_trigger_gb"] = runtime_vram_profile["sdpa_slice_trigger_gb"]
        sdpa_slice_trigger_gb = runtime_vram_profile["sdpa_slice_trigger_gb"]
    if sdpa_slice_target_gb <= 0 and runtime_vram_profile["sdpa_slice_target_gb"] > 0:
        config["amd_sdpa_slice_target_gb"] = runtime_vram_profile["sdpa_slice_target_gb"]
        sdpa_slice_target_gb = runtime_vram_profile["sdpa_slice_target_gb"]
    if sdpa_slice_trigger_gb > 0 and sdpa_slice_target_gb > 0:
        result["notes"].append(
            f"AMD 实验路线已启用分片 SDPA 保护：profile={runtime_vram_profile['name']}，trigger={sdpa_slice_trigger_gb}GB，target={sdpa_slice_target_gb}GB。"
        )

    if is_sdxl_route:
        result["notes"].append("AMD ROCm 实验 SDXL 当前使用 SDPA，并复用主线 SDXL trainer。")
        if parse_boolish(config.get("_runtime_safe_preview_enabled", False)):
            result["notes"].append("AMD ROCm 实验 SDXL 的训练预览会使用独立的安全 SDPA 预览后端。")

    _apply_windows_micro_batch_safety_policy(config, result["warnings"])

    return result
