from __future__ import annotations

import importlib

from mikazuki.utils.runtime_sageattention import probe_runtime_sageattention
from mikazuki.utils.runtime_mode import infer_attention_runtime_mode
from mikazuki.utils.sagebwd_runtime import probe_runtime_sagebwd


def short_exc_message(exc) -> str:
    message = str(exc).strip()
    if not message:
        return exc.__class__.__name__
    return message.splitlines()[0]


def is_inconclusive_xformers_probe_error(reason: str) -> bool:
    lowered = reason.lower()
    return (
        "no operator found" in lowered
        or "memory_efficient_attention_forward" in lowered
        or "operator wasn't built" in lowered
        or "no kernel image is available for execution on the device" in lowered
        or "no kernel image available for execution on the device" in lowered
    )


def probe_sageattention_status(torch_module, is_xpu_available) -> dict:
    status = {
        "installed": False,
        "importable": False,
        "symbols_ok": False,
        "reason": "Not checked yet.",
    }

    probe = probe_runtime_sageattention()
    status["installed"] = bool(probe.get("importable"))
    status["importable"] = bool(probe.get("importable"))
    status["symbols_ok"] = bool(probe.get("ready"))
    if status["symbols_ok"]:
        source = str(probe.get("source", "") or "").strip()
        status["reason"] = f"ok ({source})" if source else "ok"
    else:
        status["reason"] = str(probe.get("reason", "") or "required SageAttention symbols are missing.")
        return status

    cuda_available = bool(torch_module.cuda.is_available())
    xpu_available = is_xpu_available(torch_module)
    if cuda_available and not getattr(torch_module.version, "hip", None):
        try:
            importlib.import_module("triton")
        except Exception as exc:
            status["symbols_ok"] = False
            status["reason"] = f"triton import failed: {short_exc_message(exc)}"
            return status

    if not cuda_available and not xpu_available and status["reason"] == "ok":
        status["reason"] = "No supported accelerator runtime is available."

    return status


def probe_flashattention_status(torch_module) -> dict:
    status = {
        "installed": False,
        "importable": False,
        "symbols_ok": False,
        "reason": "Not checked yet.",
    }

    if not bool(torch_module.cuda.is_available()):
        status["reason"] = "CUDA is not available."
        return status

    if bool(getattr(torch_module.version, "hip", None)):
        status["reason"] = "FlashAttention 2 is not supported on ROCm in this runtime."
        return status

    try:
        capability = torch_module.cuda.get_device_capability(torch_module.cuda.current_device())
    except Exception:
        capability = None

    if capability is not None and capability < (8, 0):
        status["reason"] = f"GPU capability {capability} is below SM80."
        return status

    try:
        importlib.import_module("flash_attn")
        flash_interface = importlib.import_module("flash_attn.flash_attn_interface")
    except Exception as exc:
        status["reason"] = f"flash-attn import failed: {short_exc_message(exc)}"
        return status

    status["installed"] = True
    status["importable"] = True

    missing_symbols = [
        symbol_name
        for symbol_name in ("flash_attn_func", "flash_attn_varlen_func")
        if getattr(flash_interface, symbol_name, None) is None
    ]
    if missing_symbols:
        status["reason"] = "required flash-attn symbols are missing: " + ", ".join(missing_symbols)
        return status

    status["symbols_ok"] = True
    status["reason"] = "ok"
    return status


def build_attention_backend_summary(torch_module, xformers_info: dict, is_xpu_available) -> dict:
    runtime_mode = infer_attention_runtime_mode()
    sdpa_available = bool(
        (torch_module.cuda.is_available() or is_xpu_available(torch_module))
        and hasattr(torch_module.nn.functional, "scaled_dot_product_attention")
    )
    sageattention_status = probe_sageattention_status(torch_module, is_xpu_available)
    flashattention_status = probe_flashattention_status(torch_module)
    sagebwd_probe = probe_runtime_sagebwd() if runtime_mode == "sagebwd-nvidia" else None

    preferred_backend = "torch"
    if runtime_mode == "flashattention" and flashattention_status["symbols_ok"] and torch_module.cuda.is_available():
        preferred_backend = "flashattn"
    elif runtime_mode in {"sageattention", "sageattention2"} and sageattention_status["symbols_ok"] and torch_module.cuda.is_available():
        preferred_backend = "sageattn"
    elif runtime_mode == "intel-xpu-sage" and sageattention_status["symbols_ok"] and is_xpu_available(torch_module):
        preferred_backend = "sageattn"
    elif runtime_mode in {"intel-xpu", "intel-xpu-sage"} and sdpa_available:
        preferred_backend = "sdpa"
    elif runtime_mode == "rocm-amd" and sdpa_available:
        preferred_backend = "sdpa"
    elif xformers_info.get("supported"):
        preferred_backend = "xformers"
    elif sdpa_available:
        preferred_backend = "sdpa"

    if runtime_mode == "sagebwd-nvidia":
        native_ready = bool(sagebwd_probe and sagebwd_probe.get("native_backward"))
        detail = (
            "SageBwd NVIDIA pre-prepared runtime active. This environment is reserved for the future SageBwd integration "
            "once the official code is publicly available. The current build keeps Sage/SageBwd disabled here."
        )
        if sagebwd_probe and sagebwd_probe.get("importable"):
            detail += f" Current probe: source={sagebwd_probe.get('source', '') or 'unknown'}, native_backward={native_ready}."
        detail_zh = (
            "当前为 SageBwd NVIDIA 预准备运行时。这个环境只用于提前准备未来正式的 SageBwd 接入；"
            "在官方代码公开前，当前构建不会在这里开放 Sage / SageBwd。"
        )
        if sagebwd_probe and sagebwd_probe.get("importable"):
            detail_zh += (
                f" 当前探测结果：source={sagebwd_probe.get('source', '') or 'unknown'}，"
                f"native_backward={native_ready}。"
            )
    elif runtime_mode in {"sageattention", "sageattention2"} and preferred_backend == "sageattn":
        detail = (
            "SageAttention runtime active. Routes that explicitly enable sageattn will use SageAttention; "
            "other xformers configs will fall back to SDPA when supported."
        )
        detail_zh = (
            "当前为 SageAttention 专用运行时。显式启用 sageattn 的训练路由会使用 SageAttention；"
            "其他仍勾选 xformers 的配置在支持时会自动降级到 SDPA。"
        )
    elif runtime_mode == "flashattention" and preferred_backend == "flashattn":
        detail = (
            "FlashAttention runtime active. Supported SDXL routes will auto-prefer FlashAttention 2 during training; "
            "Anima routes can resolve to flash automatically or when attn_mode=flash. SDPA remains the safe fallback if a kernel call fails."
        )
        detail_zh = (
            "当前为 FlashAttention 专用运行时。支持的 SDXL 路线在训练时会自动优先尝试 FlashAttention 2；"
            "Anima 路线会在自动模式或 attn_mode=flash 时切到 flash。若内核调用失败，仍会自动回退到 SDPA。"
        )
    elif runtime_mode == "intel-xpu-sage" and preferred_backend == "sageattn":
        detail = "Intel XPU Sage runtime active. Anima routes will try SageAttention first and fall back to SDPA automatically if the kernel call fails."
        detail_zh = "当前为 Intel XPU Sage 实验运行时。Anima 路线会优先尝试 SageAttention；若内核调用失败，会自动回退到 SDPA。"
    elif preferred_backend == "xformers":
        detail = "xformers is currently the strongest verified attention backend in this runtime."
        detail_zh = "当前运行时里，xformers 是最优先且已验证可用的 attention 后端。"
    elif preferred_backend == "sdpa":
        if runtime_mode == "flashattention":
            detail = (
                "FlashAttention runtime is active, but flash-attn is not currently ready "
                f"({flashattention_status['reason']}). SDPA is being kept as the safe fallback backend."
            )
            detail_zh = (
                "当前为 FlashAttention 运行时，但 flash-attn 目前不可用"
                f"（{flashattention_status['reason']}），因此先保留 SDPA 作为安全回退后端。"
            )
        elif runtime_mode in {"intel-xpu", "intel-xpu-sage"}:
            detail = "Intel XPU currently defaults to SDPA. Experimental SageAttention requests will probe and then fall back automatically if needed."
            detail_zh = "当前 Intel XPU 运行时默认使用 SDPA。若显式请求实验性 SageAttention，会先探测，失败后自动回退。"
        elif runtime_mode == "rocm-amd":
            detail = "AMD ROCm currently defaults to SDPA. The old AMD SageAttention experimental route has been removed from this build."
            detail_zh = "当前 AMD ROCm 运行时默认使用 SDPA。本构建已移除旧的 AMD SageAttention 实验入口。"
        else:
            detail = "SDPA is currently the default fallback attention backend in this runtime."
            detail_zh = "当前运行时里，SDPA 是默认的回退 attention 后端。"
    else:
        detail = "Only the baseline torch attention path is currently available."
        detail_zh = "当前仅可使用基础的 torch attention 路径。"

    return {
        "runtime_mode": runtime_mode,
        "preferred_backend": preferred_backend,
        "sdpa_available": sdpa_available,
        "flashattention": flashattention_status,
        "sageattention": sageattention_status,
        "detail": detail,
        "detail_zh": detail_zh,
    }


def probe_xformers_runtime(torch_module, device):
    import xformers.ops as xops

    last_reason = ""
    tested_shapes = []
    probe_shapes = [
        (1, 32, 8, 64),
        (1, 256, 8, 64),
        (1, 1024, 8, 64),
    ]

    for dtype in (torch_module.float16, torch_module.bfloat16):
        for shape in probe_shapes:
            tested_shapes.append(f"{str(dtype).replace('torch.', '')}:{shape}")
            try:
                q = torch_module.randn(shape, device=device, dtype=dtype)
                k = torch_module.randn(shape, device=device, dtype=dtype)
                v = torch_module.randn(shape, device=device, dtype=dtype)
                xops.memory_efficient_attention(q, k, v, attn_bias=None)
                torch_module.cuda.synchronize(device)
                return {
                    "supported": True,
                    "verified": True,
                    "reason": f"ok ({str(dtype).replace('torch.', '')}, shape={shape})",
                }
            except Exception as exc:
                last_reason = short_exc_message(exc)

    capability = torch_module.cuda.get_device_capability(device)
    if capability[0] >= 12 and is_inconclusive_xformers_probe_error(last_reason):
        return {
            "supported": True,
            "verified": False,
            "reason": (
                "runtime probe was inconclusive on this newer GPU architecture "
                f"(tested: {', '.join(tested_shapes)}; last error: {last_reason})"
            ),
        }

    return {
        "supported": False,
        "verified": False,
        "reason": last_reason or f"runtime probe failed for {', '.join(tested_shapes)}",
    }


def select_xformers_status(xformers_status: dict, gpu_ids=None) -> dict:
    selected_gpu_ids = []
    if gpu_ids:
        for gpu_id in gpu_ids:
            try:
                selected_gpu_ids.append(int(gpu_id))
            except (TypeError, ValueError):
                continue
    elif xformers_status["per_gpu"]:
        selected_gpu_ids = [min(xformers_status["per_gpu"].keys())]

    if not selected_gpu_ids:
        return {
            **xformers_status,
            "selected_gpu_ids": [],
        }

    selected_info = [
        xformers_status["per_gpu"].get(gpu_id, {
            "name": f"GPU {gpu_id}",
            "supported": False,
            "verified": False,
            "reason": "GPU status not found.",
        })
        for gpu_id in selected_gpu_ids
    ]

    selected_supported = all(info["supported"] for info in selected_info)
    selected_verified = all(info.get("verified", False) for info in selected_info)
    reason = "ok" if selected_supported else next(
        f"GPU {gpu_id} ({info['name']}): {info['reason']}"
        for gpu_id, info in zip(selected_gpu_ids, selected_info)
        if not info["supported"]
    )
    if selected_supported and not selected_verified:
        reason = next(
            f"GPU {gpu_id} ({info['name']}): {info['reason']}"
            for gpu_id, info in zip(selected_gpu_ids, selected_info)
            if not info.get("verified", False)
        )

    return {
        **xformers_status,
        "selected_gpu_ids": selected_gpu_ids,
        "selected_supported": selected_supported,
        "selected_verified": selected_verified,
        "reason": reason,
    }
