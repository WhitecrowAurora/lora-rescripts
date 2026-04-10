from __future__ import annotations

from functools import lru_cache
import logging
from typing import Any

import torch
from torch.nn import functional as F

from mikazuki.utils.runtime_mode import infer_attention_runtime_mode
from mikazuki.utils.runtime_sageattention import (
    load_runtime_sageattention_core_module,
    load_runtime_sageattention_symbols,
    load_runtime_sageattention_version,
)
from mikazuki.utils.sagebwd_runtime import is_sagebwd_nvidia_runtime, probe_runtime_sagebwd

logger = logging.getLogger(__name__)

try:
    _runtime_sageattn, _runtime_sageattn_varlen, _runtime_sageattention_source = load_runtime_sageattention_symbols()
except Exception:
    _runtime_sageattn = None
    _runtime_sageattn_varlen = None
    _runtime_sageattention_source = ""

try:
    _runtime_sageattention_version = load_runtime_sageattention_version()
except Exception:
    _runtime_sageattention_version = ""

try:
    _runtime_sageattention_core = load_runtime_sageattention_core_module()
except Exception:
    _runtime_sageattention_core = None

try:
    _runtime_attention_runtime_mode = infer_attention_runtime_mode()
except Exception:
    _runtime_attention_runtime_mode = ""


def _parse_major_version(version: str) -> int:
    prefix = (version or "").strip().split(".", 1)[0]
    digits = "".join(ch for ch in prefix if ch.isdigit())
    if not digits:
        return 0
    try:
        return int(digits)
    except ValueError:
        return 0


_runtime_sageattention_major_version = _parse_major_version(_runtime_sageattention_version)
_runtime_uses_sageattention2_profile = (
    _runtime_attention_runtime_mode == "sageattention2" or _runtime_sageattention_major_version >= 2
)


def get_runtime_sageattention_source() -> str:
    return _runtime_sageattention_source


def get_runtime_sageattention_symbols() -> tuple[Any, Any]:
    return _runtime_sageattn, _runtime_sageattn_varlen


def get_runtime_sageattention_version() -> str:
    return _runtime_sageattention_version


def is_runtime_sageattention2_profile() -> bool:
    return bool(_runtime_uses_sageattention2_profile)


def _runtime_label() -> str:
    if _runtime_uses_sageattention2_profile:
        return "SageAttention2"
    return "SageAttention"


@lru_cache(maxsize=2)
def _warn_backward_shim_once(source: str, runtime_label: str) -> None:
    runtime_source = source or "unknown"
    if is_sagebwd_nvidia_runtime():
        logger.warning(
            "SageBwd NVIDIA compatibility shim is active for source '%s': "
            "native backward is not ready, so forward uses Sage/SageBwd runtime while backward recomputes gradients with SDPA.",
            runtime_source,
        )
        return

    logger.warning(
        "%s training compatibility shim is active for source '%s': "
        "forward uses %s, backward recomputes gradients with SDPA.",
        runtime_label,
        runtime_source,
        runtime_label,
    )


def _runtime_prefers_native_backward() -> bool:
    if is_sagebwd_nvidia_runtime():
        try:
            probe = probe_runtime_sagebwd()
        except Exception:
            return False
        return bool(probe.get("native_backward"))
    return False


def _get_cuda_device_arch(tensor: torch.Tensor) -> str:
    if not tensor.is_cuda:
        return ""
    device_index = tensor.device.index
    if device_index is None:
        device_index = torch.cuda.current_device()
    major, minor = torch.cuda.get_device_capability(device_index)
    return f"sm{major}{minor}"


@lru_cache(maxsize=16)
def _info_runtime_dispatch_once(runtime_label: str, arch: str, kernel_name: str) -> None:
    version = _runtime_sageattention_version or "unknown"
    logger.info(
        "%s experimental dispatch active: version=%s, arch=%s, kernel=%s",
        runtime_label,
        version,
        arch or "unknown",
        kernel_name,
    )


def _build_runtime_sageattention2_fixed_dispatch(
    q: torch.Tensor,
) -> tuple[Any, dict[str, Any], str, str]:
    if _runtime_sageattention_core is None or _runtime_sageattn is None:
        return _runtime_sageattn, {}, "", "sageattn"

    arch = _get_cuda_device_arch(q)
    if not arch:
        return _runtime_sageattn, {}, arch, "sageattn"

    kernel_name = ""
    kernel_kwargs: dict[str, Any] = {}
    if arch == "sm80":
        kernel_name = "sageattn_qk_int8_pv_fp16_cuda"
        kernel_kwargs["pv_accum_dtype"] = "fp32"
    elif arch == "sm86":
        kernel_name = "sageattn_qk_int8_pv_fp16_triton"
    elif arch == "sm89":
        kernel_name = "sageattn_qk_int8_pv_fp8_cuda"
        kernel_kwargs["pv_accum_dtype"] = "fp32+fp16"
    elif arch == "sm90":
        kernel_name = "sageattn_qk_int8_pv_fp8_cuda_sm90"
        kernel_kwargs["pv_accum_dtype"] = "fp32+fp32"
    elif arch == "sm120":
        kernel_name = "sageattn_qk_int8_pv_fp8_cuda"
        kernel_kwargs["qk_quant_gran"] = "per_warp"
        kernel_kwargs["pv_accum_dtype"] = "fp32+fp16"

    if not kernel_name:
        return _runtime_sageattn, {}, arch, "sageattn"

    kernel_fn = getattr(_runtime_sageattention_core, kernel_name, None)
    if not callable(kernel_fn):
        return _runtime_sageattn, {}, arch, "sageattn"

    return kernel_fn, kernel_kwargs, arch, kernel_name


def _build_runtime_sageattention_fixed_call(
    q: torch.Tensor,
    *,
    tensor_layout: str,
    is_causal: bool,
    sm_scale: float | None,
    runtime_kwargs: dict[str, Any] | None = None,
) -> tuple[Any, dict[str, Any]]:
    if _runtime_sageattn is None:
        raise ImportError("No SageAttention runtime is available")

    call_kwargs: dict[str, Any] = {
        "tensor_layout": tensor_layout,
        "is_causal": is_causal,
        "sm_scale": sm_scale,
    }
    runtime_kwargs = dict(runtime_kwargs or {})

    if _runtime_uses_sageattention2_profile:
        forward_fn, kernel_kwargs, arch, kernel_name = _build_runtime_sageattention2_fixed_dispatch(q)
        call_kwargs.update(kernel_kwargs)
        call_kwargs.update(runtime_kwargs)
        _info_runtime_dispatch_once(_runtime_label(), arch, kernel_name)
        return forward_fn, call_kwargs

    call_kwargs.update(runtime_kwargs)
    return _runtime_sageattn, call_kwargs


def _build_runtime_sageattention_varlen_call(
    q: torch.Tensor,
    *,
    is_causal: bool,
    sm_scale: float | None,
    runtime_kwargs: dict[str, Any] | None = None,
) -> tuple[Any, dict[str, Any]]:
    if _runtime_sageattn_varlen is None:
        raise ImportError("No SageAttention varlen runtime is available")

    call_kwargs: dict[str, Any] = {
        "is_causal": is_causal,
        "sm_scale": sm_scale,
    }
    if runtime_kwargs:
        call_kwargs.update(runtime_kwargs)

    if _runtime_uses_sageattention2_profile:
        _info_runtime_dispatch_once(_runtime_label(), _get_cuda_device_arch(q), "sageattn_varlen")

    return _runtime_sageattn_varlen, call_kwargs


def _call_runtime_sageattention_fixed(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    *,
    tensor_layout: str,
    is_causal: bool,
    sm_scale: float | None,
    runtime_kwargs: dict[str, Any] | None = None,
) -> torch.Tensor:
    forward_fn, call_kwargs = _build_runtime_sageattention_fixed_call(
        q,
        tensor_layout=tensor_layout,
        is_causal=is_causal,
        sm_scale=sm_scale,
        runtime_kwargs=runtime_kwargs,
    )
    return forward_fn(q, k, v, **call_kwargs)


def _call_runtime_sageattention_varlen(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    *,
    cu_seqlens_q: torch.Tensor,
    cu_seqlens_k: torch.Tensor,
    max_seqlen_q: int,
    max_seqlen_k: int,
    is_causal: bool,
    sm_scale: float | None,
    runtime_kwargs: dict[str, Any] | None = None,
) -> torch.Tensor:
    forward_fn, call_kwargs = _build_runtime_sageattention_varlen_call(
        q,
        is_causal=is_causal,
        sm_scale=sm_scale,
        runtime_kwargs=runtime_kwargs,
    )
    return forward_fn(
        q,
        k,
        v,
        cu_seqlens_q,
        cu_seqlens_k,
        max_seqlen_q,
        max_seqlen_k,
        **call_kwargs,
    )


def _run_sdpa_attention(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    *,
    tensor_layout: str,
    is_causal: bool,
    sm_scale: float | None,
) -> torch.Tensor:
    if tensor_layout == "HND":
        q_sdpa = q
        k_sdpa = k
        v_sdpa = v
    elif tensor_layout == "NHD":
        q_sdpa = q.permute(0, 2, 1, 3).contiguous()
        k_sdpa = k.permute(0, 2, 1, 3).contiguous()
        v_sdpa = v.permute(0, 2, 1, 3).contiguous()
    else:
        raise ValueError(f"Unsupported SageAttention tensor_layout: {tensor_layout}")

    sdpa_kwargs = {
        "attn_mask": None,
        "dropout_p": 0.0,
        "is_causal": is_causal,
    }
    if sm_scale is not None:
        sdpa_kwargs["scale"] = sm_scale

    out = F.scaled_dot_product_attention(q_sdpa, k_sdpa, v_sdpa, **sdpa_kwargs)

    if tensor_layout == "NHD":
        out = out.permute(0, 2, 1, 3).contiguous()
    return out


def _run_sdpa_attention_varlen(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    *,
    cu_seqlens_q: torch.Tensor,
    cu_seqlens_k: torch.Tensor,
    is_causal: bool,
    sm_scale: float | None,
) -> torch.Tensor:
    q_offsets = [int(x) for x in cu_seqlens_q.detach().to(device="cpu", dtype=torch.int64).tolist()]
    k_offsets = [int(x) for x in cu_seqlens_k.detach().to(device="cpu", dtype=torch.int64).tolist()]

    outputs: list[torch.Tensor] = []
    for batch_index in range(len(q_offsets) - 1):
        q_start = q_offsets[batch_index]
        q_end = q_offsets[batch_index + 1]
        k_start = k_offsets[batch_index]
        k_end = k_offsets[batch_index + 1]

        if q_end <= q_start:
            outputs.append(q.new_empty((0, q.shape[1], q.shape[2])))
            continue

        q_slice = q[q_start:q_end]
        k_slice = k[k_start:k_end]
        v_slice = v[k_start:k_end]

        q_hnd = q_slice.permute(1, 0, 2).unsqueeze(0).contiguous()
        k_hnd = k_slice.permute(1, 0, 2).unsqueeze(0).contiguous()
        v_hnd = v_slice.permute(1, 0, 2).unsqueeze(0).contiguous()

        out_hnd = _run_sdpa_attention(
            q_hnd,
            k_hnd,
            v_hnd,
            tensor_layout="HND",
            is_causal=is_causal,
            sm_scale=sm_scale,
        )
        outputs.append(out_hnd.squeeze(0).permute(1, 0, 2).contiguous())

    if not outputs:
        return q.new_empty((0, q.shape[1], q.shape[2]))
    return torch.cat(outputs, dim=0)


class _SageAttentionWithSdpaBackward(torch.autograd.Function):
    @staticmethod
    def forward(
        ctx,
        q: torch.Tensor,
        k: torch.Tensor,
        v: torch.Tensor,
        tensor_layout: str,
        is_causal: bool,
        sm_scale: float | None,
    ) -> torch.Tensor:
        if _runtime_sageattn is None:
            raise ImportError("No SageAttention runtime is available")

        ctx.tensor_layout = tensor_layout
        ctx.is_causal = is_causal
        ctx.sm_scale = sm_scale
        ctx.save_for_backward(q, k, v)

        return _call_runtime_sageattention_fixed(
            q,
            k,
            v,
            tensor_layout=tensor_layout,
            is_causal=is_causal,
            sm_scale=sm_scale,
        )

    @staticmethod
    def backward(ctx, grad_out: torch.Tensor):
        q, k, v = ctx.saved_tensors

        with torch.enable_grad():
            q_re = q.detach().requires_grad_(ctx.needs_input_grad[0])
            k_re = k.detach().requires_grad_(ctx.needs_input_grad[1])
            v_re = v.detach().requires_grad_(ctx.needs_input_grad[2])

            out = _run_sdpa_attention(
                q_re,
                k_re,
                v_re,
                tensor_layout=ctx.tensor_layout,
                is_causal=ctx.is_causal,
                sm_scale=ctx.sm_scale,
            )

        grad_inputs = torch.autograd.grad(
            out,
            (q_re, k_re, v_re),
            grad_out,
            allow_unused=True,
        )

        return grad_inputs[0], grad_inputs[1], grad_inputs[2], None, None, None


class _SageAttentionVarlenWithSdpaBackward(torch.autograd.Function):
    @staticmethod
    def forward(
        ctx,
        q: torch.Tensor,
        k: torch.Tensor,
        v: torch.Tensor,
        cu_seqlens_q: torch.Tensor,
        cu_seqlens_k: torch.Tensor,
        max_seqlen_q: int,
        max_seqlen_k: int,
        is_causal: bool,
        sm_scale: float | None,
    ) -> torch.Tensor:
        if _runtime_sageattn_varlen is None:
            raise ImportError("No SageAttention varlen runtime is available")

        ctx.is_causal = is_causal
        ctx.sm_scale = sm_scale
        ctx.max_seqlen_q = int(max_seqlen_q)
        ctx.max_seqlen_k = int(max_seqlen_k)
        ctx.save_for_backward(q, k, v, cu_seqlens_q, cu_seqlens_k)

        return _call_runtime_sageattention_varlen(
            q,
            k,
            v,
            cu_seqlens_q=cu_seqlens_q,
            cu_seqlens_k=cu_seqlens_k,
            max_seqlen_q=max_seqlen_q,
            max_seqlen_k=max_seqlen_k,
            is_causal=is_causal,
            sm_scale=sm_scale,
        )

    @staticmethod
    def backward(ctx, grad_out: torch.Tensor):
        q, k, v, cu_seqlens_q, cu_seqlens_k = ctx.saved_tensors

        with torch.enable_grad():
            q_re = q.detach().requires_grad_(ctx.needs_input_grad[0])
            k_re = k.detach().requires_grad_(ctx.needs_input_grad[1])
            v_re = v.detach().requires_grad_(ctx.needs_input_grad[2])

            out = _run_sdpa_attention_varlen(
                q_re,
                k_re,
                v_re,
                cu_seqlens_q=cu_seqlens_q,
                cu_seqlens_k=cu_seqlens_k,
                is_causal=ctx.is_causal,
                sm_scale=ctx.sm_scale,
            )

        grad_inputs = torch.autograd.grad(
            out,
            (q_re, k_re, v_re),
            grad_out,
            allow_unused=True,
        )

        return grad_inputs[0], grad_inputs[1], grad_inputs[2], None, None, None, None, None, None


def call_sageattention(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    *,
    tensor_layout: str,
    is_causal: bool = False,
    sm_scale: float | None = None,
    prefer_native_backward: bool = True,
    **runtime_kwargs: Any,
):
    if _runtime_sageattn is None:
        raise ImportError("No SageAttention runtime is available")

    if prefer_native_backward and _runtime_prefers_native_backward():
        return _call_runtime_sageattention_fixed(
            q,
            k,
            v,
            tensor_layout=tensor_layout,
            is_causal=is_causal,
            sm_scale=sm_scale,
            runtime_kwargs=runtime_kwargs,
        )

    needs_backward = torch.is_grad_enabled() and any(t.requires_grad for t in (q, k, v))
    if not needs_backward:
        return _call_runtime_sageattention_fixed(
            q,
            k,
            v,
            tensor_layout=tensor_layout,
            is_causal=is_causal,
            sm_scale=sm_scale,
            runtime_kwargs=runtime_kwargs,
        )

    _warn_backward_shim_once(_runtime_sageattention_source, _runtime_label())
    return _SageAttentionWithSdpaBackward.apply(q, k, v, tensor_layout, is_causal, sm_scale)


def call_sageattention_varlen(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    cu_seqlens_q: torch.Tensor,
    cu_seqlens_k: torch.Tensor,
    max_seqlen_q: int,
    max_seqlen_k: int,
    *,
    is_causal: bool = False,
    sm_scale: float | None = None,
    prefer_native_backward: bool = True,
    **runtime_kwargs: Any,
) -> torch.Tensor:
    if _runtime_sageattn_varlen is None:
        raise ImportError("No SageAttention varlen runtime is available")

    if prefer_native_backward and _runtime_prefers_native_backward():
        return _call_runtime_sageattention_varlen(
            q,
            k,
            v,
            cu_seqlens_q=cu_seqlens_q,
            cu_seqlens_k=cu_seqlens_k,
            max_seqlen_q=max_seqlen_q,
            max_seqlen_k=max_seqlen_k,
            is_causal=is_causal,
            sm_scale=sm_scale,
            runtime_kwargs=runtime_kwargs,
        )

    needs_backward = torch.is_grad_enabled() and any(t.requires_grad for t in (q, k, v))
    if not needs_backward:
        return _call_runtime_sageattention_varlen(
            q,
            k,
            v,
            cu_seqlens_q=cu_seqlens_q,
            cu_seqlens_k=cu_seqlens_k,
            max_seqlen_q=max_seqlen_q,
            max_seqlen_k=max_seqlen_k,
            is_causal=is_causal,
            sm_scale=sm_scale,
            runtime_kwargs=runtime_kwargs,
        )

    _warn_backward_shim_once(_runtime_sageattention_source, _runtime_label())
    return _SageAttentionVarlenWithSdpaBackward.apply(
        q,
        k,
        v,
        cu_seqlens_q,
        cu_seqlens_k,
        max_seqlen_q,
        max_seqlen_k,
        is_causal,
        sm_scale,
    )
