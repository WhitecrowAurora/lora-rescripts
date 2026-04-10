# Unified attention function supporting various implementations

from dataclasses import dataclass, replace
from functools import lru_cache
import logging
import os
import sys
import torch
from typing import Optional, Union
from library.sageattention_compat import (
    call_sageattention,
    call_sageattention_varlen,
    get_runtime_sageattention_source,
    get_runtime_sageattention_symbols,
)
from mikazuki.utils.runtime_mode import infer_attention_runtime_mode

logger = logging.getLogger(__name__)

_runtime_attention_stats = {
    "flash_calls": 0,
    "flash_fallbacks": 0,
    "sage_calls": 0,
    "sage_fallbacks": 0,
}


def _increment_runtime_attention_stat(key: str, amount: int = 1) -> None:
    if key not in _runtime_attention_stats:
        _runtime_attention_stats[key] = 0
    _runtime_attention_stats[key] += int(amount)


def snapshot_runtime_attention_stats() -> dict:
    return {key: int(value) for key, value in _runtime_attention_stats.items()}

try:
    import flash_attn
    from flash_attn.flash_attn_interface import _flash_attn_forward
    from flash_attn.flash_attn_interface import flash_attn_varlen_func
    from flash_attn.flash_attn_interface import flash_attn_func
except ImportError:
    flash_attn = None
    flash_attn_varlen_func = None
    _flash_attn_forward = None
    flash_attn_func = None

try:
    sageattn, sageattn_varlen = get_runtime_sageattention_symbols()
    _sageattention_source = get_runtime_sageattention_source()
except Exception:
    sageattn_varlen = None
    sageattn = None
    _sageattention_source = ""

try:
    import xformers.ops as xops
except ImportError:
    xops = None


@lru_cache(maxsize=8)
def _get_cuda_device_capability(device_index: int) -> tuple[int, int]:
    return torch.cuda.get_device_capability(device_index)


@lru_cache(maxsize=256)
def _find_split_size(original_size: int, slice_block_size_gb: float, target_slice_gb: float) -> int:
    split_size = original_size
    while True:
        if (split_size * slice_block_size_gb) <= target_slice_gb and original_size % split_size == 0:
            return split_size
        split_size -= 1
        if split_size <= 1:
            return 1


@lru_cache(maxsize=128)
def _find_rocm_sdpa_slice_sizes(
    query_shape: tuple[int, ...],
    key_shape: tuple[int, ...],
    query_element_size: int,
    *,
    target_slice_gb: float,
    trigger_gb: float,
) -> tuple[bool, bool, bool, int, int, int]:
    batch_size, attn_heads, query_len, _ = query_shape
    _, _, key_len, _ = key_shape

    slice_batch_size_gb = attn_heads * query_len * key_len * query_element_size / 1024 / 1024 / 1024

    split_batch_size = batch_size
    split_head_size = attn_heads
    split_query_size = query_len

    do_batch_split = False
    do_head_split = False
    do_query_split = False

    if batch_size * slice_batch_size_gb >= trigger_gb:
        do_batch_split = True
        split_batch_size = _find_split_size(batch_size, slice_batch_size_gb, target_slice_gb)

        if split_batch_size * slice_batch_size_gb > target_slice_gb:
            slice_head_size_gb = split_batch_size * query_len * key_len * query_element_size / 1024 / 1024 / 1024
            do_head_split = True
            split_head_size = _find_split_size(attn_heads, slice_head_size_gb, target_slice_gb)

            if split_head_size * slice_head_size_gb > target_slice_gb:
                slice_query_size_gb = (
                    split_batch_size * split_head_size * key_len * query_element_size / 1024 / 1024 / 1024
                )
                do_query_split = True
                split_query_size = _find_split_size(query_len, slice_query_size_gb, target_slice_gb)

    return do_batch_split, do_head_split, do_query_split, split_batch_size, split_head_size, split_query_size


@lru_cache(maxsize=16)
def _warn_once(message: str) -> None:
    logger.warning(message)


@lru_cache(maxsize=16)
def _info_once(message: str) -> None:
    logger.info(message)


def _short_exc_message(exc: Exception) -> str:
    message = str(exc).strip()
    if not message:
        return exc.__class__.__name__
    return message.splitlines()[0]


def _get_tensor_runtime(q: torch.Tensor) -> str:
    device_type = q.device.type
    active_runtime = infer_attention_runtime_mode()
    if device_type == "xpu":
        if active_runtime == "intel-xpu-sage":
            return "intel-xpu-sage"
        return "intel-xpu"
    if device_type == "cuda" and bool(getattr(torch.version, "hip", None)):
        return "rocm-amd"
    if device_type == "cuda":
        return "cuda"
    return device_type


def _get_float_env(name: str, default: float) -> float:
    raw_value = str(os.environ.get(name, "") or "").strip()
    if not raw_value:
        return default
    try:
        return float(raw_value)
    except (TypeError, ValueError):
        return default


def _build_sageattn_call_kwargs(q: torch.Tensor, *, tensor_layout: str) -> dict:
    kwargs = {
        "tensor_layout": tensor_layout,
        "is_causal": False,
        "sm_scale": q.shape[-1] ** -0.5,
    }

    if _get_tensor_runtime(q) != "cuda":
        return kwargs

    try:
        device_index = q.device.index
        if device_index is None:
            return kwargs
        major, minor = _get_cuda_device_capability(device_index)
    except Exception:
        return kwargs

    # The official SageAttention sm86 route uses the Triton implementation by
    # default, but its own core implementation notes that the CUDA quantization
    # backend can perform better due to kernel fusion.
    if (major, minor) == (8, 6):
        kwargs["quantization_backend"] = "cuda"

    return kwargs


def _should_try_sageattention_fallback(q: torch.Tensor) -> bool:
    return _get_tensor_runtime(q) == "intel-xpu"


def _clone_attention_params(attn_params: "AttentionParams", *, attn_mode: str) -> "AttentionParams":
    return replace(attn_params, attn_mode=attn_mode)


def _log_sageattention_fallback(q: torch.Tensor, exc: Exception) -> None:
    runtime_name = _get_tensor_runtime(q)
    _warn_once(
        f"{runtime_name} 实验运行时中的 SageAttention 调用失败，已自动回退为 SDPA。"
        f"失败信息：{_short_exc_message(exc)}"
    )


def _log_flashattention_fallback(q: torch.Tensor, exc: Exception) -> None:
    runtime_name = _get_tensor_runtime(q)
    _warn_once(
        f"{runtime_name} 运行时中的 FlashAttention 调用失败，已自动回退为 torch attention。"
        f"失败信息：{_short_exc_message(exc)}"
    )


def _should_use_rocm_sliced_sdpa(q: torch.Tensor, k: torch.Tensor) -> bool:
    if _get_tensor_runtime(q) != "rocm-amd":
        return False
    if q.dim() != 4 or k.dim() != 4:
        return False

    default_trigger = 0.75 if os.name == "nt" else 0.0
    default_target = 0.35 if os.name == "nt" else 0.0
    trigger_gb = _get_float_env("MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB", default_trigger)
    target_slice_gb = _get_float_env("MIKAZUKI_ROCM_SDPA_SLICE_GB", default_target)
    if trigger_gb <= 0 or target_slice_gb <= 0:
        return False

    do_batch_split, do_head_split, do_query_split, _, _, _ = _find_rocm_sdpa_slice_sizes(
        tuple(q.shape),
        tuple(k.shape),
        q.element_size(),
        target_slice_gb=target_slice_gb,
        trigger_gb=trigger_gb,
    )
    return bool(do_batch_split or do_head_split or do_query_split)


def _run_rocm_sliced_sdpa(
    query: torch.Tensor,
    key: torch.Tensor,
    value: torch.Tensor,
    *,
    attn_mask: Optional[torch.Tensor],
    drop_rate: float,
) -> torch.Tensor:
    trigger_gb = _get_float_env("MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB", 0.75 if os.name == "nt" else 0.0)
    target_slice_gb = _get_float_env("MIKAZUKI_ROCM_SDPA_SLICE_GB", 0.35 if os.name == "nt" else 0.0)
    do_batch_split, do_head_split, do_query_split, split_batch_size, split_head_size, split_query_size = (
        _find_rocm_sdpa_slice_sizes(
            tuple(query.shape),
            tuple(key.shape),
            query.element_size(),
            target_slice_gb=target_slice_gb,
            trigger_gb=trigger_gb,
        )
    )

    if not (do_batch_split or do_head_split or do_query_split):
        return torch.nn.functional.scaled_dot_product_attention(
            query,
            key,
            value,
            attn_mask=attn_mask,
            dropout_p=drop_rate,
        )

    _warn_once(
        "AMD ROCm 实验运行时已启用分片 SDPA，以降低单次 attention 内核峰值占用并缓解驱动超时风险。"
    )

    batch_size, attn_heads, query_len, _ = query.shape
    _, _, _, head_dim = value.shape
    hidden_states = torch.zeros((batch_size, attn_heads, query_len, head_dim), device=query.device, dtype=query.dtype)
    expanded_mask = attn_mask
    if expanded_mask is not None:
        expanded_mask = expanded_mask.expand((query.shape[0], query.shape[1], query.shape[2], key.shape[-2]))

    for batch_index in range(batch_size // split_batch_size):
        start_idx = batch_index * split_batch_size
        end_idx = (batch_index + 1) * split_batch_size
        if do_head_split:
            for head_index in range(attn_heads // split_head_size):
                start_idx_h = head_index * split_head_size
                end_idx_h = (head_index + 1) * split_head_size
                if do_query_split:
                    for query_index in range(query_len // split_query_size):
                        start_idx_q = query_index * split_query_size
                        end_idx_q = (query_index + 1) * split_query_size
                        hidden_states[start_idx:end_idx, start_idx_h:end_idx_h, start_idx_q:end_idx_q, :] = (
                            torch.nn.functional.scaled_dot_product_attention(
                                query[start_idx:end_idx, start_idx_h:end_idx_h, start_idx_q:end_idx_q, :],
                                key[start_idx:end_idx, start_idx_h:end_idx_h, :, :],
                                value[start_idx:end_idx, start_idx_h:end_idx_h, :, :],
                                attn_mask=(
                                    expanded_mask[start_idx:end_idx, start_idx_h:end_idx_h, start_idx_q:end_idx_q, :]
                                    if expanded_mask is not None
                                    else None
                                ),
                                dropout_p=drop_rate,
                            )
                        )
                else:
                    hidden_states[start_idx:end_idx, start_idx_h:end_idx_h, :, :] = (
                        torch.nn.functional.scaled_dot_product_attention(
                            query[start_idx:end_idx, start_idx_h:end_idx_h, :, :],
                            key[start_idx:end_idx, start_idx_h:end_idx_h, :, :],
                            value[start_idx:end_idx, start_idx_h:end_idx_h, :, :],
                            attn_mask=(
                                expanded_mask[start_idx:end_idx, start_idx_h:end_idx_h, :, :]
                                if expanded_mask is not None
                                else None
                            ),
                            dropout_p=drop_rate,
                        )
                    )
        else:
            hidden_states[start_idx:end_idx, :, :, :] = torch.nn.functional.scaled_dot_product_attention(
                query[start_idx:end_idx, :, :, :],
                key[start_idx:end_idx, :, :, :],
                value[start_idx:end_idx, :, :, :],
                attn_mask=expanded_mask[start_idx:end_idx, :, :, :] if expanded_mask is not None else None,
                dropout_p=drop_rate,
            )

    return hidden_states


@dataclass
class AttentionParams:
    attn_mode: Optional[str] = None
    split_attn: bool = False
    img_len: Optional[int] = None
    attention_mask: Optional[torch.Tensor] = None
    seqlens: Optional[torch.Tensor] = None
    cu_seqlens: Optional[torch.Tensor] = None
    max_seqlen: Optional[int] = None

    @property
    def supports_fp32(self) -> bool:
        return self.attn_mode not in ["flash", "sageattn"]

    @property
    def requires_same_dtype(self) -> bool:
        return self.attn_mode in ["xformers", "sageattn"]

    @staticmethod
    def create_attention_params(attn_mode: Optional[str], split_attn: bool) -> "AttentionParams":
        return AttentionParams(attn_mode, split_attn)

    @staticmethod
    def create_attention_params_from_mask(
        attn_mode: Optional[str], split_attn: bool, img_len: Optional[int], attention_mask: Optional[torch.Tensor]
    ) -> "AttentionParams":
        if attention_mask is None:
            # No attention mask provided: assume all tokens are valid
            return AttentionParams(attn_mode, split_attn, None, None, None, None, None)
        else:
            # Note: attention_mask is only for text tokens, not including image tokens
            seqlens = attention_mask.sum(dim=1).to(torch.int32) + img_len  # [B]
            max_seqlen = attention_mask.shape[1] + img_len

            if split_attn:
                # cu_seqlens is not needed for split attention
                return AttentionParams(attn_mode, split_attn, img_len, attention_mask, seqlens, None, max_seqlen)

            # Convert attention mask to cumulative sequence lengths for flash attention
            batch_size = attention_mask.shape[0]
            cu_seqlens = torch.zeros([2 * batch_size + 1], dtype=torch.int32, device=attention_mask.device)
            for i in range(batch_size):
                cu_seqlens[2 * i + 1] = i * max_seqlen + seqlens[i]  # end of valid tokens for query
                cu_seqlens[2 * i + 2] = (i + 1) * max_seqlen  # end of all tokens for query

            # Expand attention mask to include image tokens
            attention_mask = torch.nn.functional.pad(attention_mask, (img_len, 0), value=1)  # [B, img_len + L]

            if attn_mode == "xformers":
                seqlens_list = seqlens.cpu().tolist()
                attention_mask = xops.fmha.attn_bias.BlockDiagonalMask.from_seqlens(
                    seqlens_list, seqlens_list, device=attention_mask.device
                )
            elif attn_mode == "torch":
                attention_mask = attention_mask[:, None, None, :].to(torch.bool)  # [B, 1, 1, img_len + L]

            return AttentionParams(attn_mode, split_attn, img_len, attention_mask, seqlens, cu_seqlens, max_seqlen)


def _execute_attention_impl(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    attn_params: AttentionParams,
    drop_rate: float,
) -> torch.Tensor:
    # Determine tensor layout based on attention implementation.
    # For SageAttention fixed-length paths, keep the native NHD layout to avoid
    # extra transpose overhead in DiT-style models such as Anima.
    if attn_params.attn_mode == "torch":
        transpose_fn = lambda x: x.transpose(1, 2)  # [B, H, L, D] for SDPA
        # pad on sequence length dimension
        pad_fn = lambda x, pad_to: torch.nn.functional.pad(x, (0, 0, 0, pad_to - x.shape[-2]), value=0)
    else:
        transpose_fn = lambda x: x  # [B, L, H, D] for other implementations
        # pad on sequence length dimension
        pad_fn = lambda x, pad_to: torch.nn.functional.pad(x, (0, 0, 0, 0, 0, pad_to - x.shape[-3]), value=0)

    # Process each batch element with its valid sequence lengths
    if attn_params.split_attn:
        if attn_params.seqlens is None:
            # If no seqlens provided, assume all tokens are valid
            attn_params = AttentionParams.create_attention_params(attn_params.attn_mode, True)  # do not in-place modify
            attn_params.seqlens = torch.tensor([q.shape[1]] * q.shape[0], device=q.device)
            attn_params.max_seqlen = q.shape[1]
        q = [transpose_fn(q[i : i + 1, : attn_params.seqlens[i]]) for i in range(len(q))]
        k = [transpose_fn(k[i : i + 1, : attn_params.seqlens[i]]) for i in range(len(k))]
        v = [transpose_fn(v[i : i + 1, : attn_params.seqlens[i]]) for i in range(len(v))]
    else:
        q = transpose_fn(q)
        k = transpose_fn(k)
        v = transpose_fn(v)

    if attn_params.attn_mode == "torch":
        if attn_params.split_attn:
            x = []
            for i in range(len(q)):
                x_i = torch.nn.functional.scaled_dot_product_attention(q[i], k[i], v[i], dropout_p=drop_rate)
                q[i] = None
                k[i] = None
                v[i] = None
                x.append(pad_fn(x_i, attn_params.max_seqlen))  # B, H, L, D
            x = torch.cat(x, dim=0)
            del q, k, v
        else:
            if _should_use_rocm_sliced_sdpa(q, k):
                x = _run_rocm_sliced_sdpa(
                    q,
                    k,
                    v,
                    attn_mask=attn_params.attention_mask,
                    drop_rate=drop_rate,
                )
            else:
                x = torch.nn.functional.scaled_dot_product_attention(
                    q,
                    k,
                    v,
                    attn_mask=attn_params.attention_mask,
                    dropout_p=drop_rate,
                )
            del q, k, v

    elif attn_params.attn_mode == "xformers":
        if attn_params.split_attn:
            x = []
            for i in range(len(q)):
                x_i = xops.memory_efficient_attention(q[i], k[i], v[i], p=drop_rate)
                q[i] = None
                k[i] = None
                v[i] = None
                x.append(pad_fn(x_i, attn_params.max_seqlen))  # B, L, H, D
            x = torch.cat(x, dim=0)
            del q, k, v
        else:
            x = xops.memory_efficient_attention(q, k, v, attn_bias=attn_params.attention_mask, p=drop_rate)
            del q, k, v

    elif attn_params.attn_mode == "sageattn":
        _increment_runtime_attention_stat("sage_calls")
        if attn_params.split_attn:
            x = []
            for i in range(len(q)):
                sage_kwargs = _build_sageattn_call_kwargs(q[i], tensor_layout="NHD")
                x_i = call_sageattention(
                    q[i],
                    k[i],
                    v[i],
                    **sage_kwargs,
                )  # B, L, H, D. No dropout support
                q[i] = None
                k[i] = None
                v[i] = None
                x.append(pad_fn(x_i, attn_params.max_seqlen))  # B, L, H, D
            x = torch.cat(x, dim=0)
            del q, k, v
        elif attn_params.cu_seqlens is None:  # all tokens are valid
            sage_kwargs = _build_sageattn_call_kwargs(q, tensor_layout="NHD")
            x = call_sageattention(
                q,
                k,
                v,
                **sage_kwargs,
            )  # B, L, H, D. No dropout support
            del q, k, v
        else:
            # Reshape to [(bxs), a, d]
            batch_size, seqlen = q.shape[0], q.shape[1]
            q = q.reshape(q.shape[0] * q.shape[1], *q.shape[2:])  # [B*L, H, D]
            k = k.reshape(k.shape[0] * k.shape[1], *k.shape[2:])  # [B*L, H, D]
            v = v.reshape(v.shape[0] * v.shape[1], *v.shape[2:])  # [B*L, H, D]
            sage_kwargs = _build_sageattn_call_kwargs(q, tensor_layout="HND")

            # Assume cu_seqlens_q == cu_seqlens_kv and max_seqlen_q == max_seqlen_kv. No dropout support
            x = call_sageattention_varlen(
                q,
                k,
                v,
                attn_params.cu_seqlens,
                attn_params.cu_seqlens,
                attn_params.max_seqlen,
                attn_params.max_seqlen,
                is_causal=sage_kwargs["is_causal"],
                sm_scale=sage_kwargs["sm_scale"],
            )
            del q, k, v

            # Reshape x with shape [(bxs), a, d] to [b, s, a, d]
            x = x.view(batch_size, seqlen, x.shape[-2], x.shape[-1])  # B, L, H, D

    elif attn_params.attn_mode == "flash":
        _increment_runtime_attention_stat("flash_calls")
        _info_once(
            "Unified attention backend active: flash / 公共 attention 已进入 FlashAttention 内核路径。"
        )
        if attn_params.split_attn:
            x = []
            for i in range(len(q)):
                # HND seems to cause an error
                x_i = flash_attn_func(q[i], k[i], v[i], drop_rate)  # B, L, H, D
                q[i] = None
                k[i] = None
                v[i] = None
                x.append(pad_fn(x_i, attn_params.max_seqlen))  # B, L, H, D
            x = torch.cat(x, dim=0)
            del q, k, v
        elif attn_params.cu_seqlens is None:  # all tokens are valid
            x = flash_attn_func(q, k, v, drop_rate)  # B, L, H, D
            del q, k, v
        else:
            # Reshape to [(bxs), a, d]
            batch_size, seqlen = q.shape[0], q.shape[1]
            q = q.view(q.shape[0] * q.shape[1], *q.shape[2:])  # [B*L, H, D]
            k = k.view(k.shape[0] * k.shape[1], *k.shape[2:])  # [B*L, H, D]
            v = v.view(v.shape[0] * v.shape[1], *v.shape[2:])  # [B*L, H, D]

            # Assume cu_seqlens_q == cu_seqlens_kv and max_seqlen_q == max_seqlen_kv
            x = flash_attn_varlen_func(
                q, k, v, attn_params.cu_seqlens, attn_params.cu_seqlens, attn_params.max_seqlen, attn_params.max_seqlen, drop_rate
            )
            del q, k, v

            # Reshape x with shape [(bxs), a, d] to [b, s, a, d]
            x = x.view(batch_size, seqlen, x.shape[-2], x.shape[-1])  # B, L, H, D

    else:
        raise ValueError(f"Unsupported attention mode: {attn_params.attn_mode}")

    x = transpose_fn(x)  # [B, L, H, D]
    x = x.reshape(x.shape[0], x.shape[1], -1)  # [B, L, H*D]
    return x


def attention(
    qkv_or_q: Union[torch.Tensor, list],
    k: Optional[torch.Tensor] = None,
    v: Optional[torch.Tensor] = None,
    attn_params: Optional[AttentionParams] = None,
    drop_rate: float = 0.0,
) -> torch.Tensor:
    """
    Compute scaled dot-product attention with variable sequence lengths.

    Handles batches with different sequence lengths by splitting and
    processing each sequence individually.

    Args:
        qkv_or_q: Query tensor [B, L, H, D]. or list of such tensors.
        k: Key tensor [B, L, H, D].
        v: Value tensor [B, L, H, D].
        attn_params: Attention parameters including mask and sequence lengths.
        drop_rate: Attention dropout rate.

    Returns:
        Attention output tensor [B, L, H*D].
    """
    if isinstance(qkv_or_q, list):
        q, k, v = qkv_or_q
        q: torch.Tensor = q
        qkv_or_q.clear()
        del qkv_or_q
    else:
        q: torch.Tensor = qkv_or_q
        del qkv_or_q
        assert k is not None and v is not None, "k and v must be provided if qkv_or_q is a tensor"
    if attn_params is None:
        attn_params = AttentionParams.create_attention_params("torch", False)

    # If split attn is False, attention mask is provided and all sequence lengths are same, we can trim the sequence
    seqlen_trimmed = False
    if not attn_params.split_attn and attn_params.attention_mask is not None and attn_params.seqlens is not None:
        if torch.all(attn_params.seqlens == attn_params.seqlens[0]):
            seqlen = attn_params.seqlens[0].item()
            q = q[:, :seqlen]
            k = k[:, :seqlen]
            v = v[:, :seqlen]
            max_seqlen = attn_params.max_seqlen
            attn_params = AttentionParams.create_attention_params(attn_params.attn_mode, False)  # do not in-place modify
            attn_params.max_seqlen = max_seqlen  # keep max_seqlen for padding
            seqlen_trimmed = True

    try:
        x = _execute_attention_impl(q, k, v, attn_params, drop_rate)
    except Exception as exc:
        if attn_params.attn_mode == "flash":
            _increment_runtime_attention_stat("flash_fallbacks")
            _log_flashattention_fallback(q, exc)
            fallback_params = _clone_attention_params(attn_params, attn_mode="torch")
            x = _execute_attention_impl(q, k, v, fallback_params, drop_rate)
        elif attn_params.attn_mode == "sageattn" and _should_try_sageattention_fallback(q):
            _increment_runtime_attention_stat("sage_fallbacks")
            _log_sageattention_fallback(q, exc)
            fallback_params = _clone_attention_params(attn_params, attn_mode="torch")
            x = _execute_attention_impl(q, k, v, fallback_params, drop_rate)
        else:
            raise

    if seqlen_trimmed:
        x = torch.nn.functional.pad(x, (0, 0, 0, attn_params.max_seqlen - x.shape[1]), value=0)  # pad back to max_seqlen

    return x
