from __future__ import annotations

import importlib
import os
from typing import Optional

from mikazuki.log import log
from mikazuki.utils.devices import get_attention_runtime_mode, get_xformers_status


SAGEATTENTION_SUPPORTED_TRAINING_TYPES = {
    "sdxl-lora",
    "sdxl-finetune",
    "sdxl-controlnet",
    "sdxl-controlnet-lllite",
    "sdxl-textual-inversion",
}

FLASHATTENTION_SUPPORTED_TRAINING_TYPES = {
    "sdxl-lora",
    "sdxl-finetune",
    "sdxl-controlnet",
    "sdxl-controlnet-lllite",
    "sdxl-textual-inversion",
}


def _flag_enabled(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return bool(value)
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _has_importable_flashattention() -> bool:
    try:
        import torch
    except Exception:
        return False

    if not torch.cuda.is_available():
        return False
    if bool(getattr(torch.version, "hip", None)):
        return False

    try:
        capability = torch.cuda.get_device_capability(torch.cuda.current_device())
    except Exception:
        capability = None

    if capability is not None and capability < (8, 0):
        return False

    try:
        importlib.import_module("flash_attn")
        flash_interface = importlib.import_module("flash_attn.flash_attn_interface")
    except Exception:
        return False

    return all(
        getattr(flash_interface, symbol_name, None) is not None
        for symbol_name in ("flash_attn_func", "flash_attn_varlen_func")
    )


def resolve_anima_runtime_attention_backend(gpu_ids=None) -> str:
    runtime_mode = get_attention_runtime_mode()
    if runtime_mode in {"sageattention", "sageattention2", "sagebwd-nvidia", "intel-xpu-sage"}:
        return "sageattn"
    if runtime_mode == "flashattention":
        return "flash" if _has_importable_flashattention() else "torch"
    if runtime_mode == "blackwell":
        return "torch"
    if runtime_mode in {"intel-xpu", "rocm-amd"}:
        return "torch"

    xformers_info = get_xformers_status(gpu_ids)
    if xformers_info.get("selected_supported", xformers_info.get("supported", False)):
        return "xformers"
    return "torch"


def apply_anima_runtime_attention_backend(config: dict, gpu_ids=None) -> None:
    model_train_type = str(config.get("model_train_type", "")).strip().lower()
    if not model_train_type.startswith("anima"):
        return

    requested_backend = str(config.get("attn_mode", "") or "").strip().lower()
    if requested_backend in {"sdpa"}:
        resolved_backend = "torch"
    elif requested_backend in {"torch", "xformers", "sageattn", "flash"}:
        resolved_backend = requested_backend
    else:
        resolved_backend = resolve_anima_runtime_attention_backend(gpu_ids)
    config["attn_mode"] = resolved_backend

    if "xformers" in config:
        config["xformers"] = resolved_backend == "xformers"
    if "sdpa" in config:
        config["sdpa"] = resolved_backend == "torch"
    if "sageattn" in config:
        config["sageattn"] = resolved_backend == "sageattn"
    if "use_sage_attn" in config:
        config["use_sage_attn"] = resolved_backend == "sageattn"


def apply_sdxl_runtime_attention_backend(config: dict, gpu_ids=None) -> Optional[str]:
    training_type = str(config.get("model_train_type", "") or "").strip().lower()
    if training_type not in FLASHATTENTION_SUPPORTED_TRAINING_TYPES:
        return None
    if get_attention_runtime_mode() != "flashattention":
        return None
    if not _has_importable_flashattention():
        return None
    if _flag_enabled(config.get("mem_eff_attn")):
        return None
    if is_sageattention_requested(config):
        return None
    if not _flag_enabled(config.get("xformers")) and _flag_enabled(config.get("sdpa")):
        return None

    changed = False
    if "xformers" in config and _flag_enabled(config.get("xformers")):
        config["xformers"] = False
        changed = True
    if "sdpa" in config and _flag_enabled(config.get("sdpa")):
        config["sdpa"] = False
        changed = True
    if "sageattn" in config and _flag_enabled(config.get("sageattn")):
        config["sageattn"] = False
        changed = True
    if "use_sage_attn" in config and _flag_enabled(config.get("use_sage_attn")):
        config["use_sage_attn"] = False
        changed = True
    if not _flag_enabled(config.get("flashattn")):
        config["flashattn"] = True
        changed = True

    if not changed:
        return None

    return "当前为 FlashAttention 运行时；本次 SDXL 训练已自动优先切到 FlashAttention 2。若内核调用失败，训练进程会自动回退到 SDPA。"


def is_sageattention_requested(config: dict) -> bool:
    attn_mode = str(config.get("attn_mode", "") or "").strip().lower()
    return (
        str(config.get("sageattn", "")).strip().lower() in {"1", "true", "yes", "on"}
        or str(config.get("use_sage_attn", "")).strip().lower() in {"1", "true", "yes", "on"}
        or attn_mode == "sageattn"
    )


def training_type_supports_sageattention(training_type: str) -> bool:
    normalized = str(training_type or "").strip().lower()
    if normalized in SAGEATTENTION_SUPPORTED_TRAINING_TYPES:
        return True
    if normalized.startswith("anima"):
        return True
    return False


def apply_sagebwd_runtime_guard(config: dict, parse_boolish) -> Optional[str]:
    runtime_mode = get_attention_runtime_mode()
    if runtime_mode != "sagebwd-nvidia":
        return None

    requested_sage = is_sageattention_requested(config)
    changed = False

    if "sageattn" in config and parse_boolish(config.get("sageattn", False)):
        config["sageattn"] = False
        changed = True
    if "use_sage_attn" in config and parse_boolish(config.get("use_sage_attn", False)):
        config["use_sage_attn"] = False
        changed = True
    if "attn_mode" in config and str(config.get("attn_mode", "") or "").strip().lower() == "sageattn":
        config["attn_mode"] = "sdpa" if "sdpa" in config else "torch"
        changed = True

    if not requested_sage and not changed:
        return (
            "当前为 SageBwd NVIDIA 预备环境。该运行时目前仅用于提前准备依赖与隔离未来的 SageBwd 适配，"
            "当前构建不会在这里开放 Sage / SageBwd 训练入口。"
        )

    return (
        "当前为 SageBwd NVIDIA 预备环境。由于官方 SageBwd 代码尚未正式开源，"
        "本环境里的 Sage / SageBwd 训练入口已临时关闭；本次训练将继续使用常规 attention 路线。"
    )


def apply_sageattention_route_guard(config: dict) -> Optional[str]:
    training_type = str(config.get("model_train_type", "") or "").strip().lower()
    if not is_sageattention_requested(config):
        return None
    if training_type_supports_sageattention(training_type):
        return None

    if "sageattn" in config:
        config["sageattn"] = False
    if "use_sage_attn" in config:
        config["use_sage_attn"] = False
    if "attn_mode" in config and str(config.get("attn_mode", "") or "").strip().lower() == "sageattn":
        config["attn_mode"] = "sdpa" if "sdpa" in config else "torch"
    if "sdpa" in config:
        config["sdpa"] = True

    message = (
        f"当前训练种类 {training_type or '(unknown)'} 还没有接好 SageAttention 路径，"
        "已自动回退为 SDPA / torch。当前只对 SDXL 路线与 Anima 路线开放 SageAttention。"
    )
    log.warning(message)
    return message


def get_startup_attention_policy() -> str:
    return str(os.environ.get("MIKAZUKI_STARTUP_ATTENTION_POLICY", "") or "").strip().lower()


def apply_startup_attention_policy(config: dict, parse_boolish) -> Optional[str]:
    policy = get_startup_attention_policy()
    if not policy:
        return None

    if policy == "runtime_guarded":
        runtime_mode = get_attention_runtime_mode()
        if runtime_mode not in {"intel-xpu", "intel-xpu-sage", "rocm-amd"}:
            return None

        changed = False
        if parse_boolish(config.get("mem_eff_attn", False)):
            config["mem_eff_attn"] = False
            changed = True
        if parse_boolish(config.get("xformers", False)):
            config["xformers"] = False
            changed = True

        if not changed:
            return None

        if runtime_mode in {"intel-xpu", "intel-xpu-sage"}:
            message = "Intel XPU 专用启动模式已自动禁用 xformers / mem_eff_attn。若显式请求 SageAttention，将在训练时按实验方式探测，并在失败后自动回退为 SDPA。"
        else:
            message = "AMD ROCm 专用启动模式已自动禁用 xformers / mem_eff_attn，并固定走 SDPA 兼容主线。"
        log.warning(message)
        return message

    if policy == "force_sdpa":
        changed = False
        if parse_boolish(config.get("mem_eff_attn", False)):
            config["mem_eff_attn"] = False
            changed = True
        if parse_boolish(config.get("xformers", False)):
            config["xformers"] = False
            changed = True
        if "sdpa" in config and not parse_boolish(config.get("sdpa", False)):
            config["sdpa"] = True
            changed = True
        if "sageattn" in config and parse_boolish(config.get("sageattn", False)):
            config["sageattn"] = False
            changed = True
        if "use_sage_attn" in config and parse_boolish(config.get("use_sage_attn", False)):
            config["use_sage_attn"] = False
            changed = True
        if "attn_mode" in config:
            attn_mode = str(config.get("attn_mode", "") or "").strip().lower()
            if attn_mode != "sdpa":
                config["attn_mode"] = "sdpa"
                changed = True
        if changed:
            message = "启动器当前处于 SDPA 安全模式，本次训练已自动禁用 SageAttention / xformers，并改用 SDPA。"
            log.warning(message)
            return message
        return None

    runtime_mode = get_attention_runtime_mode()
    if policy != "prefer_sage" or runtime_mode not in {"sageattention", "sageattention2", "sagebwd-nvidia", "intel-xpu-sage"}:
        return None

    if parse_boolish(config.get("mem_eff_attn", False)):
        return None

    changed = False
    if parse_boolish(config.get("xformers", False)):
        config["xformers"] = False
        changed = True
    if "sdpa" in config and parse_boolish(config.get("sdpa", False)):
        config["sdpa"] = False
        changed = True
    if "sageattn" in config and not parse_boolish(config.get("sageattn", False)):
        config["sageattn"] = True
        changed = True
    if "use_sage_attn" in config and not parse_boolish(config.get("use_sage_attn", False)):
        config["use_sage_attn"] = True
        changed = True
    if "attn_mode" in config:
        attn_mode = str(config.get("attn_mode", "") or "").strip().lower()
        if attn_mode != "sageattn":
            config["attn_mode"] = "sageattn"
            changed = True

    if changed:
        if runtime_mode == "sagebwd-nvidia":
            message = "启动器当前处于 SageBwd NVIDIA 实验模式。本次训练会先沿用现有 SageAttention 兼容路径，并为后续 SageBwd 接入预留运行时标记。"
        elif runtime_mode == "intel-xpu-sage":
            message = "启动器当前处于 Intel XPU Sage 实验模式，本次训练已自动优先尝试 SageAttention。若内核调用失败，运行时会自动回退到 SDPA。"
        else:
            message = "启动器当前处于 SageAttention 默认模式，本次训练已自动优先使用 SageAttention。"
        log.info(message)
        return message
    return None


def apply_sageattention_runtime_override(config: dict, parse_boolish) -> Optional[str]:
    runtime_mode = get_attention_runtime_mode()
    if runtime_mode not in {"sageattention", "sageattention2", "sagebwd-nvidia"}:
        return None

    if parse_boolish(config.get("mem_eff_attn", False)):
        return None

    uses_xformers_flag = parse_boolish(config.get("xformers", False))
    attn_mode = str(config.get("attn_mode", "")).strip().lower()
    uses_xformers_attn_mode = attn_mode == "xformers"
    wants_sageattention = (
        parse_boolish(config.get("sageattn", False))
        or parse_boolish(config.get("use_sage_attn", False))
        or attn_mode == "sageattn"
    )

    if not uses_xformers_flag and not uses_xformers_attn_mode:
        return None

    if uses_xformers_flag:
        config["xformers"] = False

    if uses_xformers_attn_mode:
        config["attn_mode"] = "sageattn" if wants_sageattention else "sdpa"

    if wants_sageattention:
        if "sdpa" in config:
            config["sdpa"] = False
        if runtime_mode == "sagebwd-nvidia":
            message = (
                "检测到当前为 SageBwd NVIDIA 实验运行时，已自动忽略 xformers，"
                "本次训练会先沿用现有 SageAttention 兼容路径。"
            )
        else:
            message = (
                "检测到当前为 SageAttention 专用运行时，已自动忽略 xformers，"
                "本次训练将优先使用 SageAttention。"
            )
        log.info(message)
        return message

    if "sdpa" in config:
        config["sdpa"] = True
        if runtime_mode == "sagebwd-nvidia":
            message = (
                "检测到当前为 SageBwd NVIDIA 实验运行时，已自动忽略 xformers。"
                "由于当前配置未启用 SageAttention 兼容路径，本次训练将改用 sdpa。"
            )
        else:
            message = (
                "检测到当前为 SageAttention 专用运行时，已自动忽略 xformers。"
                "由于当前配置未启用 SageAttention，本次训练将改用 sdpa。"
            )
    else:
        if runtime_mode == "sagebwd-nvidia":
            message = (
                "检测到当前为 SageBwd NVIDIA 实验运行时，已自动忽略 xformers。"
                "若希望本次训练使用当前兼容路径，请启用 sageattn。"
            )
        else:
            message = (
                "检测到当前为 SageAttention 专用运行时，已自动忽略 xformers。"
                "若希望本次训练直接使用 SageAttention，请启用 sageattn。"
            )
    log.warning(message)
    return message
