from __future__ import annotations

import os
import sys
from functools import lru_cache
from typing import Any

from mikazuki.utils.runtime_sageattention import load_runtime_sageattention_symbols
from mikazuki.utils.runtime_mode import infer_attention_runtime_mode


_SAGEBWD_RUNTIME_NAMES = {"sagebwd-nvidia"}


def is_sagebwd_nvidia_runtime() -> bool:
    return infer_attention_runtime_mode() in _SAGEBWD_RUNTIME_NAMES


def _short_exc_message(exc: Exception) -> str:
    message = str(exc or "").strip()
    if not message:
        return exc.__class__.__name__
    return message.splitlines()[0]


@lru_cache(maxsize=1)
def probe_runtime_sagebwd() -> dict[str, Any]:
    result: dict[str, Any] = {
        "runtime_requested": is_sagebwd_nvidia_runtime(),
        "ready": False,
        "importable": False,
        "native_backward": False,
        "source": "",
        "reason": "",
        "backward_reason": "",
        "torch_version": "",
        "cuda_available": False,
        "device": "",
        "dtype": "",
    }

    if not result["runtime_requested"]:
        result["reason"] = "SageBwd NVIDIA runtime is not active."
        return result

    try:
        import torch
    except Exception as exc:
        result["reason"] = f"torch import failed: {_short_exc_message(exc)}"
        return result

    result["torch_version"] = str(getattr(torch, "__version__", "") or "")
    result["cuda_available"] = bool(torch.cuda.is_available()) and not bool(getattr(torch.version, "hip", None))
    if not result["cuda_available"]:
        result["reason"] = "CUDA is not available in the active SageBwd NVIDIA runtime."
        return result

    try:
        sageattn, sageattn_varlen, source = load_runtime_sageattention_symbols()
    except Exception as exc:
        result["reason"] = f"Sage runtime import failed: {_short_exc_message(exc)}"
        return result

    result["importable"] = callable(sageattn) and callable(sageattn_varlen)
    result["source"] = str(source or "")
    if not result["importable"]:
        result["reason"] = "Required Sage/SageBwd runtime symbols are missing."
        return result

    result["ready"] = True

    try:
        device_index = int(torch.cuda.current_device())
    except Exception:
        device_index = 0
    device = torch.device(f"cuda:{device_index}")
    result["device"] = str(device)

    # Keep the native-backward probe intentionally tiny to avoid long startup stalls.
    dtype = torch.float16
    result["dtype"] = str(dtype).replace("torch.", "")
    head_dim = 64
    heads = 2
    channels = head_dim * heads

    try:
        batch, seq_len = 1, 8
        to_q = torch.nn.Linear(channels, channels, bias=False, device=device, dtype=dtype)
        to_k = torch.nn.Linear(channels, channels, bias=False, device=device, dtype=dtype)
        to_v = torch.nn.Linear(channels, channels, bias=False, device=device, dtype=dtype)
        hidden = torch.randn((batch, seq_len, channels), device=device, dtype=dtype)
        context = torch.randn((batch, seq_len, channels), device=device, dtype=dtype)

        q = to_q(hidden).reshape(batch, seq_len, heads, head_dim).permute(0, 2, 1, 3).contiguous()
        k = to_k(context).reshape(batch, seq_len, heads, head_dim).permute(0, 2, 1, 3).contiguous()
        v = to_v(context).reshape(batch, seq_len, heads, head_dim).permute(0, 2, 1, 3).contiguous()
        out = sageattn(
            q,
            k,
            v,
            tensor_layout="HND",
            is_causal=False,
            sm_scale=head_dim**-0.5,
        )
        if not bool(getattr(out, "requires_grad", False)) or getattr(out, "grad_fn", None) is None:
            raise RuntimeError(
                "Sage runtime returned a tensor without autograd metadata; "
                "the current package appears to be forward-only for training."
            )
        loss = out.float().square().mean()
        loss.backward()

        gradients = [to_q.weight.grad, to_k.weight.grad, to_v.weight.grad]
        if not all(grad is not None for grad in gradients):
            raise RuntimeError("at least one gradient tensor is missing")
        if not all(bool(torch.isfinite(grad).all().item()) for grad in gradients):
            raise RuntimeError("non-finite gradients were produced")
    except Exception as exc:
        result["backward_reason"] = _short_exc_message(exc)
        result["reason"] = (
            "Native backward probe failed in the SageBwd NVIDIA runtime; "
            "the project will fall back to the SDPA backward shim."
        )
        return result

    result["native_backward"] = True
    result["reason"] = "Native backward probe passed."
    return result
