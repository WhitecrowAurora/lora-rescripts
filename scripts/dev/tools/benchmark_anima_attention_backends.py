import argparse
import statistics
import sys
import time
from pathlib import Path

import torch
import torch.nn.functional as F


def add_project_paths() -> None:
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parents[2]
    stable_root = repo_root / "scripts" / "stable"
    for path in (repo_root, stable_root):
        path_str = str(path)
        if path_str not in sys.path:
            sys.path.insert(0, path_str)


add_project_paths()

try:
    import xformers.ops as xops
except ImportError:
    xops = None

try:
    from sageattention import sageattn
except ImportError:
    sageattn = None

from library import attention as project_attention


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Benchmark Anima-like attention backends.")
    parser.add_argument("--batch", type=int, default=2)
    parser.add_argument("--seq", type=int, default=4096)
    parser.add_argument("--heads", type=int, default=16)
    parser.add_argument("--head-dim", type=int, default=128)
    parser.add_argument("--dtype", choices=["fp16", "bf16"], default="bf16")
    parser.add_argument("--warmup", type=int, default=20)
    parser.add_argument("--steps", type=int, default=80)
    parser.add_argument("--device", type=str, default="cuda")
    return parser.parse_args()


def resolve_dtype(name: str) -> torch.dtype:
    return torch.float16 if name == "fp16" else torch.bfloat16


def make_qkv(batch: int, seq: int, heads: int, head_dim: int, dtype: torch.dtype, device: str):
    shape = (batch, seq, heads, head_dim)
    q = torch.randn(shape, device=device, dtype=dtype)
    k = torch.randn(shape, device=device, dtype=dtype)
    v = torch.randn(shape, device=device, dtype=dtype)
    return q, k, v


def measure(fn, warmup: int, steps: int) -> dict[str, float]:
    for _ in range(warmup):
        fn()
    torch.cuda.synchronize()

    durations = []
    for _ in range(steps):
        start = time.perf_counter()
        fn()
        torch.cuda.synchronize()
        durations.append((time.perf_counter() - start) * 1000.0)

    return {
        "mean_ms": statistics.mean(durations),
        "median_ms": statistics.median(durations),
        "min_ms": min(durations),
        "max_ms": max(durations),
    }


def main() -> int:
    args = parse_args()
    if not torch.cuda.is_available():
        print("CUDA is required for this benchmark.")
        return 1

    dtype = resolve_dtype(args.dtype)
    q_nhd, k_nhd, v_nhd = make_qkv(args.batch, args.seq, args.heads, args.head_dim, dtype, args.device)
    q_hnd = q_nhd.transpose(1, 2).contiguous()
    k_hnd = k_nhd.transpose(1, 2).contiguous()
    v_hnd = v_nhd.transpose(1, 2).contiguous()

    benchmarks = []

    benchmarks.append(
        (
            "sdpa_hnd",
            lambda: F.scaled_dot_product_attention(q_hnd, k_hnd, v_hnd, dropout_p=0.0, is_causal=False),
        )
    )

    if xops is not None:
        benchmarks.append(("xformers_nhd", lambda: xops.memory_efficient_attention(q_nhd, k_nhd, v_nhd, p=0.0)))

    if sageattn is not None:
        benchmarks.append(
            (
                "sage_nhd_direct",
                lambda: sageattn(q_nhd, k_nhd, v_nhd, tensor_layout="NHD", is_causal=False),
            )
        )
        benchmarks.append(
            (
                "sage_hnd_direct",
                lambda: sageattn(q_hnd, k_hnd, v_hnd, tensor_layout="HND", is_causal=False),
            )
        )

    params_sdpa = project_attention.AttentionParams.create_attention_params("torch", False)
    params_xformers = project_attention.AttentionParams.create_attention_params("xformers", False)
    params_sage = project_attention.AttentionParams.create_attention_params("sageattn", False)

    benchmarks.append(
        (
            "project_sdpa",
            lambda: project_attention.attention([q_nhd, k_nhd, v_nhd], attn_params=params_sdpa),
        )
    )

    if xops is not None:
        benchmarks.append(
            (
                "project_xformers",
                lambda: project_attention.attention([q_nhd, k_nhd, v_nhd], attn_params=params_xformers),
            )
        )

    if sageattn is not None:
        benchmarks.append(
            (
                "project_sage",
                lambda: project_attention.attention([q_nhd, k_nhd, v_nhd], attn_params=params_sage),
            )
        )

    print(
        f"device={args.device} dtype={args.dtype} batch={args.batch} seq={args.seq} heads={args.heads} head_dim={args.head_dim}"
    )
    for name, fn in benchmarks:
        stats = measure(fn, args.warmup, args.steps)
        print(
            f"{name:18s} mean={stats['mean_ms']:.3f}ms "
            f"median={stats['median_ms']:.3f}ms min={stats['min_ms']:.3f}ms max={stats['max_ms']:.3f}ms"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
