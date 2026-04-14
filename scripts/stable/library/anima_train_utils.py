# Anima Training Utilities

import argparse
import importlib
from collections import defaultdict
from functools import lru_cache
import gc
import math
import os
import sys
import time
from typing import Optional

import numpy as np
import torch
from accelerate import Accelerator
from tqdm import tqdm
from PIL import Image

from library.device_utils import init_ipex, clean_memory_on_device, synchronize_device
from library import anima_models, anima_utils, train_util, qwen_image_autoencoder_kl
from mikazuki.utils.runtime_sageattention import probe_runtime_sageattention
from mikazuki.utils.runtime_mode import infer_attention_runtime_mode
from mikazuki.utils.runtime_safe_preview import clamp_safe_preview_request

init_ipex()

from .utils import setup_logging

setup_logging()
import logging

logger = logging.getLogger(__name__)


# Anima-specific training arguments
ANIMA_SUPPORTED_ATTN_MODES = ("torch", "xformers", "sageattn", "flash")
ANIMA_SUPPORTED_PREVIEW_SAMPLERS = ("euler", "k_euler")
ANIMA_SUPPORTED_PREVIEW_SCHEDULERS = ("simple",)
ANIMA_PREVIEW_SAMPLER_ALIASES = {
    "euler_a": "euler",
    "k_euler_a": "k_euler",
}


@lru_cache(maxsize=64)
def _warn_once(message: str) -> None:
    logger.warning(message)


def normalize_anima_preview_sampling(
    sample_sampler: Optional[str],
    sample_scheduler: Optional[str],
    *,
    warn: bool = True,
) -> tuple[str, str]:
    scheduler = str(sample_scheduler or "simple").strip().lower() or "simple"
    if scheduler not in ANIMA_SUPPORTED_PREVIEW_SCHEDULERS:
        if warn:
            _warn_once(
                f"Anima preview scheduler '{scheduler}' is not implemented yet; falling back to 'simple'."
            )
        scheduler = "simple"

    raw_sampler = str(sample_sampler or "euler").strip().lower() or "euler"
    sampler = ANIMA_PREVIEW_SAMPLER_ALIASES.get(raw_sampler, raw_sampler)
    if raw_sampler in ANIMA_PREVIEW_SAMPLER_ALIASES:
        if warn:
            _warn_once(
                f"Anima preview sampler '{raw_sampler}' does not have a dedicated implementation yet; using '{sampler}' instead."
            )
    elif sampler not in ANIMA_SUPPORTED_PREVIEW_SAMPLERS:
        if warn:
            _warn_once(
                f"Anima preview sampler '{raw_sampler}' is not implemented yet; falling back to 'euler'."
            )
        sampler = "euler"

    return sampler, scheduler


class _AnimaTimingSection:
    def __init__(self, profiler, section_name: str, *, wall_only: bool, target: str):
        self.profiler = profiler
        self.section_name = section_name
        self.wall_only = wall_only
        self.target = target
        self.wall_start: Optional[float] = None
        self.start_event = None
        self.end_event = None

    def __enter__(self):
        if not self.profiler.enabled:
            return self

        self.wall_start = time.perf_counter()
        if self.profiler.use_cuda_events and not self.wall_only:
            self.start_event = torch.cuda.Event(enable_timing=True)
            self.end_event = torch.cuda.Event(enable_timing=True)
            self.start_event.record()
        return self

    def __exit__(self, exc_type, exc, tb):
        if not self.profiler.enabled or self.wall_start is None:
            return False

        wall_elapsed = time.perf_counter() - self.wall_start
        if self.profiler.use_cuda_events and not self.wall_only:
            self.end_event.record()
            self.profiler.queue_cuda_section(self.section_name, self.start_event, self.end_event, wall_elapsed, self.target)
        else:
            self.profiler.add_elapsed(self.section_name, wall_elapsed, target=self.target)
            if self.wall_only and self.target == "step":
                self.profiler.add_step_total(wall_elapsed)
        return False


class AnimaStepTimingProfiler:
    SECTION_ORDER = (
        "data/latents",
        "text_encoder_or_cached_text",
        "noise_prepare",
        "dit_forward",
        "loss",
        "backward",
        "optimizer_step",
        "preview",
        "save",
    )

    def __init__(self, args: argparse.Namespace, accelerator: Optional[Accelerator], *, route_label: str = "Anima"):
        window_size = int(getattr(args, "anima_profile_window", 0) or 0)
        self.window_size = max(window_size, 0)
        self.route_label = route_label
        self.device = accelerator.device if accelerator is not None else None
        self.enabled = bool(accelerator is not None and accelerator.is_local_main_process and self.window_size > 0)
        self.use_cuda_events = bool(
            self.enabled and self.device is not None and self.device.type == "cuda" and torch.cuda.is_available()
        )
        self._current_step_totals = defaultdict(float)
        self._window_totals = defaultdict(float)
        self._window_steps = 0
        self._micro_step_start: Optional[float] = None
        self._micro_step_wall_total = 0.0
        self._pending_cuda_sections: list[tuple[str, object, object, float, str]] = []

        if self.enabled:
            logger.info(
                f"{route_label}: step timing profiler enabled. Aggregated timing will be logged every {self.window_size} optimizer step(s)."
            )
            logger.info(
                f"{route_label}：已启用步骤耗时剖析器。每 {self.window_size} 个优化步会输出一次聚合耗时摘要。"
            )

    def begin_micro_step(self) -> None:
        if not self.enabled:
            return
        self._micro_step_start = time.perf_counter()

    def end_micro_step(self) -> None:
        if not self.enabled:
            return
        self.flush_cuda_sections()
        if self._micro_step_start is not None:
            self._micro_step_wall_total += time.perf_counter() - self._micro_step_start
            self._micro_step_start = None

    def queue_cuda_section(self, section_name: str, start_event, end_event, wall_elapsed: float, target: str) -> None:
        if not self.enabled:
            return
        self._pending_cuda_sections.append((section_name, start_event, end_event, wall_elapsed, target))

    def flush_cuda_sections(self) -> None:
        if not self.enabled or not self._pending_cuda_sections:
            return

        if self.use_cuda_events and self.device is not None:
            synchronize_device(self.device)

        pending_sections = self._pending_cuda_sections
        self._pending_cuda_sections = []
        for section_name, start_event, end_event, wall_elapsed, target in pending_sections:
            elapsed = wall_elapsed
            if self.use_cuda_events:
                try:
                    elapsed = float(start_event.elapsed_time(end_event)) / 1000.0
                except Exception:
                    elapsed = wall_elapsed
            self.add_elapsed(section_name, elapsed, target=target)

    def add_elapsed(self, section_name: str, elapsed_seconds: float, *, target: str = "step") -> None:
        if not self.enabled or elapsed_seconds < 0:
            return
        if target == "step":
            self._current_step_totals[section_name] += elapsed_seconds
        else:
            self._window_totals[section_name] += elapsed_seconds
            self._window_totals["step_total"] += elapsed_seconds

    def add_step_total(self, elapsed_seconds: float) -> None:
        if not self.enabled or elapsed_seconds < 0:
            return
        self._micro_step_wall_total += elapsed_seconds

    def step_section(self, section_name: str, *, wall_only: bool = False):
        return _AnimaTimingSection(self, section_name, wall_only=wall_only, target="step")

    def window_section(self, section_name: str, *, wall_only: bool = True):
        return _AnimaTimingSection(self, section_name, wall_only=wall_only, target="window")

    def finalize_optimizer_step(self, global_step: int) -> None:
        if not self.enabled:
            return

        self.flush_cuda_sections()
        self._window_totals["step_total"] += self._micro_step_wall_total
        for section_name, elapsed in self._current_step_totals.items():
            self._window_totals[section_name] += elapsed

        self._window_steps += 1
        self._current_step_totals = defaultdict(float)
        self._micro_step_wall_total = 0.0

        if self._window_steps >= self.window_size:
            self.log_window_summary(global_step)
            self._window_totals = defaultdict(float)
            self._window_steps = 0

    def discard_current_step(self) -> None:
        if not self.enabled:
            return
        self._pending_cuda_sections = []
        self._current_step_totals = defaultdict(float)
        self._micro_step_wall_total = 0.0
        self._micro_step_start = None

    def flush_remaining(self, global_step: int) -> None:
        if not self.enabled:
            return
        self.flush_cuda_sections()
        if self._window_steps > 0 and self._window_totals.get("step_total", 0.0) > 0:
            self.log_window_summary(global_step)
        self._window_totals = defaultdict(float)
        self._window_steps = 0

    def log_window_summary(self, global_step: int) -> None:
        if not self.enabled or self._window_steps <= 0:
            return

        total = float(self._window_totals.get("step_total", 0.0))
        if total <= 0:
            return

        avg_step_ms = total * 1000.0 / self._window_steps
        parts = [f"avg_step={avg_step_ms:.2f} ms"]
        parts_zh = [f"平均每步={avg_step_ms:.2f} ms"]
        for section_name in self.SECTION_ORDER:
            elapsed = float(self._window_totals.get(section_name, 0.0))
            if elapsed <= 0:
                continue
            avg_ms = elapsed * 1000.0 / self._window_steps
            ratio = elapsed / total * 100.0
            parts.append(f"{section_name}={avg_ms:.2f} ms ({ratio:.1f}%)")
            parts_zh.append(f"{section_name}={avg_ms:.2f} ms（{ratio:.1f}%）")

        logger.info(
            f"{self.route_label} step timing window @ step {global_step}: "
            + " | ".join(parts)
        )
        logger.info(
            f"{self.route_label} 步骤耗时窗口统计 @ step {global_step}："
            + " | ".join(parts_zh)
        )


def _infer_anima_runtime_mode() -> str:
    return infer_attention_runtime_mode()


def _has_working_sageattention() -> bool:
    cuda_available = bool(torch.cuda.is_available())
    xpu_available = bool(hasattr(torch, "xpu") and torch.xpu.is_available())
    if not cuda_available and not xpu_available:
        return False

    return bool(probe_runtime_sageattention().get("ready"))


def _has_importable_xformers() -> bool:
    if not torch.cuda.is_available():
        return False

    try:
        importlib.import_module("xformers")
        importlib.import_module("xformers.ops")
    except Exception:
        return False
    return True


def _has_importable_flashattention() -> bool:
    if not torch.cuda.is_available():
        return False
    if bool(getattr(torch.version, "hip", None)):
        return False

    try:
        device_index = torch.cuda.current_device()
        capability = torch.cuda.get_device_capability(device_index)
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


def resolve_default_anima_attn_mode() -> str:
    runtime_mode = _infer_anima_runtime_mode()
    if runtime_mode == "sageattention" and _has_working_sageattention():
        return "sageattn"
    if runtime_mode == "intel-xpu-sage" and _has_working_sageattention():
        return "sageattn"
    if runtime_mode == "flashattention" and _has_importable_flashattention():
        return "flash"
    if runtime_mode == "blackwell":
        return "torch"
    if runtime_mode in {"intel-xpu", "intel-xpu-sage", "rocm-amd"}:
        return "torch"
    if _has_importable_xformers():
        return "xformers"
    return "torch"


def _expand_local_path(raw_path: Optional[str]) -> str:
    return os.path.expandvars(os.path.expanduser(str(raw_path or "").strip()))


def _normalize_local_path(raw_path: Optional[str]) -> str:
    normalized = _expand_local_path(raw_path)
    if not normalized:
        return ""
    return os.path.abspath(normalized)


def _get_anima_path_bases(args: argparse.Namespace) -> list[str]:
    bases = [os.getcwd()]

    raw_config_path = getattr(args, "config_file", None)
    if raw_config_path:
        config_path = _normalize_local_path(raw_config_path)
        if config_path and not config_path.lower().endswith(".toml"):
            config_path = config_path + ".toml"
        config_dir = os.path.dirname(config_path)
        if config_dir:
            bases.append(config_dir)
            parent_dir = os.path.dirname(config_dir)
            if parent_dir:
                bases.append(parent_dir)

    stable_root = os.path.dirname(os.path.dirname(__file__))
    bases.append(stable_root)
    bases.append(os.path.dirname(stable_root))

    deduped: list[str] = []
    seen = set()
    for base in bases:
        normalized = _normalize_local_path(base)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        deduped.append(normalized)
    return deduped


def _resolve_local_path_candidates(raw_path: Optional[str], *, base_dirs: Optional[list[str]] = None) -> list[str]:
    normalized = _expand_local_path(raw_path)
    if not normalized:
        return []

    if os.path.isabs(normalized):
        return [os.path.abspath(normalized)]

    candidates = [os.path.abspath(normalized)]
    for base_dir in base_dirs or []:
        candidates.append(os.path.abspath(os.path.join(base_dir, normalized)))

    deduped: list[str] = []
    seen = set()
    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        deduped.append(candidate)
    return deduped


def _resolve_anima_path(
    raw_path: Optional[str],
    *,
    label: str,
    required_message: str,
    allow_file: bool,
    allow_directory: bool,
    base_dirs: Optional[list[str]] = None,
) -> str:
    candidates = _resolve_local_path_candidates(raw_path, base_dirs=base_dirs)

    if not candidates:
        raise ValueError(required_message)

    path = next((candidate for candidate in candidates if os.path.exists(candidate)), candidates[0])
    if not os.path.exists(path):
        raise ValueError(f"{label} path does not exist: {path}")
    if os.path.isfile(path):
        if not allow_file:
            raise ValueError(f"{label} path must point to a directory, not a file: {path}")
        return path
    if os.path.isdir(path):
        if not allow_directory:
            raise ValueError(f"{label} path must point to a model file, not a directory: {path}")
        return path

    raise ValueError(f"{label} path is neither a regular file nor a directory: {path}")


def resolve_optional_anima_path(
    raw_path: Optional[str],
    *,
    label: str,
    allow_file: bool,
    allow_directory: bool,
    base_dirs: Optional[list[str]] = None,
) -> Optional[str]:
    candidates = _resolve_local_path_candidates(raw_path, base_dirs=base_dirs)
    if not candidates:
        return None
    return _resolve_anima_path(
        candidates[0],
        label=label,
        required_message=f"{label} path is required.",
        allow_file=allow_file,
        allow_directory=allow_directory,
        base_dirs=base_dirs,
    )


def add_anima_training_arguments(parser: argparse.ArgumentParser):
    """Add Anima-specific training arguments to the parser."""
    parser.add_argument(
        "--qwen3",
        type=str,
        default=None,
        help="Path to Qwen3-0.6B model (safetensors file or directory)",
    )
    parser.add_argument(
        "--llm_adapter_path",
        type=str,
        default=None,
        help="Path to separate LLM adapter weights. If None, adapter is loaded from DiT file if present",
    )
    parser.add_argument(
        "--llm_adapter_lr",
        type=float,
        default=None,
        help="Learning rate for LLM adapter. None=same as base LR, 0=freeze adapter",
    )
    parser.add_argument(
        "--self_attn_lr",
        type=float,
        default=None,
        help="Learning rate for self-attention layers. None=same as base LR, 0=freeze",
    )
    parser.add_argument(
        "--cross_attn_lr",
        type=float,
        default=None,
        help="Learning rate for cross-attention layers. None=same as base LR, 0=freeze",
    )
    parser.add_argument(
        "--mlp_lr",
        type=float,
        default=None,
        help="Learning rate for MLP layers. None=same as base LR, 0=freeze",
    )
    parser.add_argument(
        "--mod_lr",
        type=float,
        default=None,
        help="Learning rate for AdaLN modulation layers. None=same as base LR, 0=freeze. Note: mod layers are not included in LoRA by default.",
    )
    parser.add_argument(
        "--t5_tokenizer_path",
        type=str,
        default=None,
        help="Path to T5 tokenizer directory. If None, uses default configs/t5_old/",
    )
    parser.add_argument(
        "--qwen3_max_token_length",
        type=int,
        default=512,
        help="Maximum token length for Qwen3 tokenizer (default: 512)",
    )
    parser.add_argument(
        "--t5_max_token_length",
        type=int,
        default=512,
        help="Maximum token length for T5 tokenizer (default: 512)",
    )
    parser.add_argument(
        "--discrete_flow_shift",
        type=float,
        default=3.0,
        help="Timestep distribution shift for rectified flow training (default: 3.0, matches the official Anima trainer)",
    )
    parser.add_argument(
        "--timestep_sampling",
        type=str,
        default="shift",
        choices=["sigma", "uniform", "sigmoid", "shift", "flux_shift"],
        help="Timestep sampling method (default: shift, matches the official Anima trainer)",
    )
    parser.add_argument(
        "--sigmoid_scale",
        type=float,
        default=1.0,
        help="Scale factor for sigmoid (logit_normal) timestep sampling (default: 1.0)",
    )
    parser.add_argument(
        "--attn_mode",
        choices=["torch", "xformers", "sageattn", "sdpa", "flash"],  # "sdpa" is a legacy compatibility value
        default=None,
        help="Attention implementation to use. Default is None (auto-resolve from the active runtime/startup script). xformers requires --split_attn. sageattn can be used when the active runtime has SageAttention installed. flash uses FlashAttention 2 when flash-attn is available; if the kernel call fails at runtime, training will warn and fall back to torch attention automatically. This option overrides --xformers or --sdpa."
        " / 使用するAttentionの実装。デフォルトは None（当前运行时 / 启动脚本自动决定）です。xformersは--split_attnの指定が必要です。sageattn は、当前运行时已安装 SageAttention 时可用于训练。flash 会在检测到 flash-attn 时启用 FlashAttention 2；若运行时内核调用失败，会给出警告并自动回退到 torch attention。这个选项会覆盖 --xformers 或 --sdpa。",
    )
    parser.add_argument(
        "--split_attn",
        action="store_true",
        help="split attention computation to reduce memory usage / メモリ使用量を減らすためにattention時にバッチを分割する",
    )
    parser.add_argument(
        "--vae_chunk_size",
        type=int,
        default=None,
        help="Spatial chunk size for VAE encoding/decoding to reduce memory usage. Must be even number. If not specified, chunking is disabled (official behavior)."
        + " / メモリ使用量を減らすためのVAEエンコード/デコードの空間チャンクサイズ。偶数である必要があります。未指定の場合、チャンク処理は無効になります（公式の動作）。",
    )
    parser.add_argument(
        "--vae_disable_cache",
        action="store_true",
        help="Disable internal VAE caching mechanism to reduce memory usage. Encoding / decoding will also be faster, but this differs from official behavior."
        + " / VAEのメモリ使用量を減らすために内部のキャッシュ機構を無効にします。エンコード/デコードも速くなりますが、公式の動作とは異なります。",
    )
    parser.add_argument(
        "--anima_component_cpu_offload",
        action="store_true",
        help="Keep frozen Anima helper components on CPU between training subphases when latents or text outputs are not cached. This can reduce VRAM, but it will slow training noticeably."
        + " / latents や text encoder outputs をキャッシュしていない場合、凍結済みの補助コンポーネント（Qwen3 / VAE）を学習の合間に CPU へ退避させます。VRAM は減りますが、学習速度はかなり低下します。",
    )
    parser.add_argument(
        "--sample_scheduler",
        type=str,
        default="simple",
        help="Sampling scheduler used by Anima preview generation during training. Currently 'simple' is supported."
        + " / Anima の学習中プレビュー生成で使用するサンプリング scheduler。現在は simple のみサポートします。",
    )
    parser.add_argument(
        "--anima_profile_window",
        type=int,
        default=0,
        help="Emit aggregated Anima training step timing every N optimizer steps. 0 disables profiling."
        + " / N ステップごとに Anima 学習の集計耗时を出力します。0 で無効です。"
        + " / 每 N 个优化步输出一次 Anima 训练耗时聚合日志，0 表示关闭。",
    )
    parser.add_argument(
        "--anima_nan_check_interval",
        type=int,
        default=0,
        help="Check Anima tensors for NaN every N training steps. 0 uses the runtime default."
        + " / N ステップごとに Anima テンソルの NaN を検査します。0 は実行時の自動設定です。"
        + " / 每 N 个训练步检查一次 Anima 张量中的 NaN，0 表示自动。",
    )


def resolve_required_anima_vae_path(args: argparse.Namespace, training_type: str) -> str:
    """Resolve and validate the external Qwen Image VAE path required by Anima trainers."""

    return _resolve_anima_path(
        getattr(args, "vae", None),
        label="Anima VAE",
        required_message=(
            f"{training_type} requires a Qwen Image VAE path. "
            "Please fill the VAE field in the UI or set `vae = \"...\"` in the config."
        ),
        allow_file=True,
        allow_directory=False,
        base_dirs=_get_anima_path_bases(args),
    )


def resolve_required_anima_transformer_path(args: argparse.Namespace, training_type: str) -> str:
    return _resolve_anima_path(
        getattr(args, "pretrained_model_name_or_path", None),
        label="Anima DiT / transformer",
        required_message=(
            f"{training_type} requires an Anima DiT / transformer checkpoint path. "
            "Please fill the main model field in the UI or set `pretrained_model_name_or_path = \"...\"` in the config."
        ),
        allow_file=True,
        allow_directory=False,
        base_dirs=_get_anima_path_bases(args),
    )


def resolve_required_anima_qwen3_path(args: argparse.Namespace, training_type: str) -> str:
    return _resolve_anima_path(
        getattr(args, "qwen3", None),
        label="Anima Qwen3 text model",
        required_message=(
            f"{training_type} requires a Qwen3 text model path. "
            "Please fill the Qwen3 field in the UI or set `qwen3 = \"...\"` in the config."
        ),
        allow_file=True,
        allow_directory=True,
        base_dirs=_get_anima_path_bases(args),
    )


def validate_anima_resolution_settings(args: argparse.Namespace) -> None:
    raw_resolution = getattr(args, "resolution", None)
    if raw_resolution is None:
        return

    if isinstance(raw_resolution, str):
        values = [segment.strip() for segment in raw_resolution.split(",") if segment.strip()]
    elif isinstance(raw_resolution, (tuple, list)):
        values = list(raw_resolution)
    else:
        values = [raw_resolution]

    if not values:
        return

    try:
        parsed = [int(value) for value in values]
    except Exception:
        return

    invalid = [value for value in parsed if value <= 0 or value % 64 != 0]
    if invalid:
        raise ValueError(
            "Anima training expects the configured resolution to be a positive multiple of 64. "
            f"Got: {raw_resolution}"
        )


def normalize_anima_attn_mode(attn_mode: Optional[str], fallback: Optional[str] = None) -> str:
    """Normalize Anima attention mode values coming from UI/config files."""

    normalized_fallback = str(fallback or resolve_default_anima_attn_mode()).strip().lower() or "torch"
    if normalized_fallback == "sdpa":
        normalized_fallback = "torch"
    if normalized_fallback not in ANIMA_SUPPORTED_ATTN_MODES:
        raise ValueError(f"Unsupported Anima attention fallback: {fallback}")

    normalized = str(attn_mode or "").strip().lower()
    if normalized in {"", "none", "null"}:
        return normalized_fallback
    if normalized == "sdpa":
        return "torch"
    if normalized not in ANIMA_SUPPORTED_ATTN_MODES:
        raise ValueError(
            f"Unsupported Anima attention mode: {attn_mode}. "
            f"Supported modes: {', '.join(ANIMA_SUPPORTED_ATTN_MODES)}"
        )
    return normalized


def log_anima_runtime_summary(args: argparse.Namespace, *, route_label: str = "Anima") -> None:
    attn_mode = str(getattr(args, "attn_mode", "") or "").strip().lower() or "torch"
    split_attn = bool(getattr(args, "split_attn", False))
    cache_text_encoder_outputs = bool(getattr(args, "cache_text_encoder_outputs", False))
    cache_latents = bool(getattr(args, "cache_latents", False))
    enable_preview = bool(getattr(args, "enable_preview", False))
    component_cpu_offload = bool(getattr(args, "anima_component_cpu_offload", False))
    profile_window = int(getattr(args, "anima_profile_window", 0) or 0)
    nan_check_interval = resolve_anima_nan_check_interval(args)

    logger.info(
        f"{route_label} runtime summary: "
        f"attn_mode={attn_mode} | "
        f"split_attn={split_attn} | "
        f"cache_text_encoder_outputs={cache_text_encoder_outputs} | "
        f"cache_latents={cache_latents} | "
        f"anima_component_cpu_offload={component_cpu_offload} | "
        f"enable_preview={enable_preview} | "
        f"anima_profile_window={profile_window} | "
        f"anima_nan_check_interval={nan_check_interval}"
    )
    logger.info(
        f"{route_label} 运行摘要："
        f"attn_mode={attn_mode}，"
        f"split_attn={split_attn}，"
        f"cache_text_encoder_outputs={cache_text_encoder_outputs}，"
        f"cache_latents={cache_latents}，"
        f"anima_component_cpu_offload={component_cpu_offload}，"
        f"enable_preview={enable_preview}，"
        f"anima_profile_window={profile_window}，"
        f"anima_nan_check_interval={nan_check_interval}"
    )

    if attn_mode == "sageattn" and split_attn:
        logger.warning(
            f"{route_label}: SageAttention + split_attn prioritizes lower VRAM usage over speed. "
            "If VRAM is sufficient, disabling split_attn is usually faster."
        )
        logger.warning(
            f"{route_label}：当前为 SageAttention + split_attn 组合。该组合会优先降低显存占用，而不是追求速度；"
            "如果显存足够，通常关闭 split_attn 会更快。"
        )

    if enable_preview:
        logger.info(
            f"{route_label}: training previews are enabled. Preview generation can noticeably increase wall-clock training time."
        )
        logger.info(
            f"{route_label}：当前已启用训练预览图。预览生成会明显增加整体训练耗时。"
        )


def should_use_anima_pinned_memory(accelerator: Optional[Accelerator]) -> bool:
    if accelerator is None:
        return False

    runtime_mode = _infer_anima_runtime_mode()
    if runtime_mode == "rocm-amd" and os.name == "nt":
        return False

    return bool(accelerator.device.type == "cuda" and torch.cuda.is_available())


def should_use_anima_non_blocking(accelerator: Optional[Accelerator]) -> bool:
    return should_use_anima_pinned_memory(accelerator)


def should_use_anima_component_cpu_offload(args: argparse.Namespace) -> bool:
    return bool(getattr(args, "anima_component_cpu_offload", False))


def move_anima_module(
    module: Optional[torch.nn.Module],
    device: Optional[torch.device | str],
    *,
    dtype: Optional[torch.dtype] = None,
    non_blocking: bool = False,
):
    if module is None or device is None:
        return module

    target_device = torch.device(device)
    try:
        if dtype is None:
            module.to(target_device, non_blocking=non_blocking)
        else:
            module.to(target_device, dtype=dtype, non_blocking=non_blocking)
    except TypeError:
        if dtype is None:
            module.to(target_device)
        else:
            module.to(target_device, dtype=dtype)
    return module


def resolve_anima_dataloader_prefetch_factor(args: argparse.Namespace, n_workers: int) -> Optional[int]:
    if n_workers <= 0:
        return None
    return 4 if bool(getattr(args, "cache_latents", False)) else 2


def resolve_anima_nan_check_interval(args: argparse.Namespace) -> int:
    configured = int(getattr(args, "anima_nan_check_interval", 0) or 0)
    if configured > 0:
        return configured

    mixed_precision = str(getattr(args, "mixed_precision", "") or "").strip().lower()
    if mixed_precision in {"fp16", "bf16"} and torch.cuda.is_available():
        return 4
    return 1


def should_run_anima_nan_check(args: argparse.Namespace, step_index: int) -> bool:
    interval = resolve_anima_nan_check_interval(args)
    if interval <= 1:
        return True
    return step_index <= 1 or step_index % interval == 0


def move_anima_tensor(
    tensor: Optional[torch.Tensor],
    device: Optional[torch.device],
    *,
    dtype: Optional[torch.dtype] = None,
    non_blocking: bool = False,
) -> Optional[torch.Tensor]:
    if tensor is None or not isinstance(tensor, torch.Tensor) or device is None:
        return tensor

    target_dtype = dtype or tensor.dtype
    if tensor.device == device and tensor.dtype == target_dtype:
        return tensor
    return tensor.to(device=device, dtype=target_dtype, non_blocking=non_blocking)


def maybe_apply_anima_channels_last(args: argparse.Namespace, tensor: Optional[torch.Tensor]):
    if not getattr(args, "opt_channels_last", False):
        return tensor
    if tensor is None or not isinstance(tensor, torch.Tensor):
        return tensor
    if tensor.ndim == 5:
        if tensor.is_contiguous(memory_format=torch.channels_last_3d):
            return tensor
        return tensor.contiguous(memory_format=torch.channels_last_3d)
    if tensor.ndim == 4:
        if tensor.is_contiguous(memory_format=torch.channels_last):
            return tensor
        return tensor.contiguous(memory_format=torch.channels_last)
    return tensor


def _iter_named_floating_tensors(module: torch.nn.Module):
    for name, param in module.named_parameters(recurse=True):
        if param is not None and param.is_floating_point() and param.ndim in (4, 5):
            yield name, param
    for name, buf in module.named_buffers(recurse=True):
        if buf is not None and buf.is_floating_point() and buf.ndim in (4, 5):
            yield name, buf


def apply_opt_channels_last_for_anima(args: argparse.Namespace, *named_models):
    if not getattr(args, "opt_channels_last", False):
        return []

    applied: list[str] = []
    skipped: list[str] = []

    for item in named_models:
        if isinstance(item, tuple):
            display_name, model = item
        else:
            display_name, model = type(item).__name__, item

        if model is None:
            continue

        tensor_count = 0
        converted_4d = 0
        converted_5d = 0

        with torch.no_grad():
            for _, tensor in _iter_named_floating_tensors(model):
                tensor_count += 1
                if tensor.ndim == 5:
                    if not tensor.is_contiguous(memory_format=torch.channels_last_3d):
                        tensor.data = tensor.data.contiguous(memory_format=torch.channels_last_3d)
                        converted_5d += 1
                elif tensor.ndim == 4:
                    if not tensor.is_contiguous(memory_format=torch.channels_last):
                        tensor.data = tensor.data.contiguous(memory_format=torch.channels_last)
                        converted_4d += 1

        if tensor_count == 0:
            skipped.append(display_name)
            continue

        applied.append(display_name)
        logger.info(
            f"channels_last applied to {display_name}: 4D tensors={converted_4d}, 5D tensors={converted_5d}"
        )

    if applied:
        logger.info("Enable channels_last memory format for Anima training")
        logger.info(f"当前已为 Anima 路线启用 channels_last：{', '.join(applied)}")
    elif skipped:
        logger.info("channels_last was requested for Anima, but no 4D/5D floating tensors were found in the selected models.")
        logger.info("当前已请求为 Anima 启用 channels_last，但未在当前模型中检测到可切换的 4D/5D 浮点张量。")

    return applied


_ANIMA_PADDING_MASK_CACHE: dict[tuple[str, str, int, int, int, bool], torch.Tensor] = {}


def get_cached_anima_padding_mask(
    batch_size: int,
    latent_height: int,
    latent_width: int,
    *,
    device: torch.device,
    dtype: torch.dtype,
    use_channels_last: bool,
) -> torch.Tensor:
    key = (str(device), str(dtype), int(batch_size), int(latent_height), int(latent_width), bool(use_channels_last))
    cached = _ANIMA_PADDING_MASK_CACHE.get(key)
    if cached is None or cached.device != device:
        cached = torch.zeros(batch_size, 1, latent_height, latent_width, dtype=dtype, device=device)
        if use_channels_last:
            cached = cached.contiguous(memory_format=torch.channels_last)
        _ANIMA_PADDING_MASK_CACHE[key] = cached
    else:
        cached.zero_()
    return cached


# Loss weighting


def compute_loss_weighting_for_anima(weighting_scheme: str, sigmas: torch.Tensor) -> torch.Tensor:
    """Compute loss weighting for Anima training.

    Same schemes as SD3 but can add Anima-specific ones if needed in future.
    """
    if weighting_scheme == "sigma_sqrt":
        weighting = (sigmas**-2.0).float()
    elif weighting_scheme == "cosmap":
        bot = 1 - 2 * sigmas + 2 * sigmas**2
        weighting = 2 / (math.pi * bot)
    elif weighting_scheme == "none" or weighting_scheme is None:
        weighting = torch.ones_like(sigmas)
    else:
        weighting = torch.ones_like(sigmas)
    return weighting


# Parameter groups (6 groups with separate LRs)
def get_anima_param_groups(
    dit,
    base_lr: float,
    self_attn_lr: Optional[float] = None,
    cross_attn_lr: Optional[float] = None,
    mlp_lr: Optional[float] = None,
    mod_lr: Optional[float] = None,
    llm_adapter_lr: Optional[float] = None,
):
    """Create parameter groups for Anima training with separate learning rates.

    Args:
        dit: Anima model
        base_lr: Base learning rate
        self_attn_lr: LR for self-attention layers (None = base_lr, 0 = freeze)
        cross_attn_lr: LR for cross-attention layers
        mlp_lr: LR for MLP layers
        mod_lr: LR for AdaLN modulation layers
        llm_adapter_lr: LR for LLM adapter

    Returns:
        List of parameter group dicts for optimizer
    """
    if self_attn_lr is None:
        self_attn_lr = base_lr
    if cross_attn_lr is None:
        cross_attn_lr = base_lr
    if mlp_lr is None:
        mlp_lr = base_lr
    if mod_lr is None:
        mod_lr = base_lr
    if llm_adapter_lr is None:
        llm_adapter_lr = base_lr

    base_params = []
    self_attn_params = []
    cross_attn_params = []
    mlp_params = []
    mod_params = []
    llm_adapter_params = []

    for name, p in dit.named_parameters():
        # Store original name for debugging
        p.original_name = name
        p.requires_grad_(False)

        if "llm_adapter" in name:
            llm_adapter_params.append(p)
        elif ".self_attn" in name:
            self_attn_params.append(p)
        elif ".cross_attn" in name:
            cross_attn_params.append(p)
        elif ".mlp" in name:
            mlp_params.append(p)
        elif ".adaln_modulation" in name:
            mod_params.append(p)
        else:
            base_params.append(p)

    logger.info(f"Parameter groups:")
    logger.info(f"  base_params: {len(base_params)} (lr={base_lr})")
    logger.info(f"  self_attn_params: {len(self_attn_params)} (lr={self_attn_lr})")
    logger.info(f"  cross_attn_params: {len(cross_attn_params)} (lr={cross_attn_lr})")
    logger.info(f"  mlp_params: {len(mlp_params)} (lr={mlp_lr})")
    logger.info(f"  mod_params: {len(mod_params)} (lr={mod_lr})")
    logger.info(f"  llm_adapter_params: {len(llm_adapter_params)} (lr={llm_adapter_lr})")

    param_groups = []
    for lr, params, name in [
        (base_lr, base_params, "base"),
        (self_attn_lr, self_attn_params, "self_attn"),
        (cross_attn_lr, cross_attn_params, "cross_attn"),
        (mlp_lr, mlp_params, "mlp"),
        (mod_lr, mod_params, "mod"),
        (llm_adapter_lr, llm_adapter_params, "llm_adapter"),
    ]:
        if lr == 0:
            logger.info(f"  Frozen {name} params ({len(params)} parameters)")
        elif len(params) > 0:
            for p in params:
                p.requires_grad_(True)
            param_groups.append({"params": params, "lr": lr})

    total_trainable = sum(p.numel() for group in param_groups for p in group["params"] if p.requires_grad)
    logger.info(f"Total trainable parameters: {total_trainable:,}")

    return param_groups


# Save functions
def save_anima_model_on_train_end(
    args: argparse.Namespace,
    save_dtype: torch.dtype,
    epoch: int,
    global_step: int,
    dit: anima_models.Anima,
):
    """Save Anima model at the end of training."""

    def sd_saver(ckpt_file, epoch_no, global_step):
        sai_metadata = train_util.get_sai_model_spec_dataclass(
            None, args, False, False, False, is_stable_diffusion_ckpt=True, anima="preview"
        ).to_metadata_dict()
        dit_sd = dit.state_dict()
        # Save with 'net.' prefix for ComfyUI compatibility
        anima_utils.save_anima_model(ckpt_file, dit_sd, sai_metadata, save_dtype)

    train_util.save_sd_model_on_train_end_common(args, True, True, epoch, global_step, sd_saver, None)


def save_anima_model_on_epoch_end_or_stepwise(
    args: argparse.Namespace,
    on_epoch_end: bool,
    accelerator: Accelerator,
    save_dtype: torch.dtype,
    epoch: int,
    num_train_epochs: int,
    global_step: int,
    dit: anima_models.Anima,
):
    """Save Anima model at epoch end or specific steps."""

    def sd_saver(ckpt_file, epoch_no, global_step):
        sai_metadata = train_util.get_sai_model_spec_dataclass(
            None, args, False, False, False, is_stable_diffusion_ckpt=True, anima="preview"
        ).to_metadata_dict()
        dit_sd = dit.state_dict()
        anima_utils.save_anima_model(ckpt_file, dit_sd, sai_metadata, save_dtype)

    train_util.save_sd_model_on_epoch_end_or_stepwise_common(
        args,
        on_epoch_end,
        accelerator,
        True,
        True,
        epoch,
        num_train_epochs,
        global_step,
        sd_saver,
        None,
    )


# Sampling (Euler discrete for rectified flow)
def do_sample(
    height: int,
    width: int,
    seed: Optional[int],
    dit: anima_models.Anima,
    crossattn_emb: torch.Tensor,
    steps: int,
    dtype: torch.dtype,
    device: torch.device,
    guidance_scale: float = 1.0,
    flow_shift: float = 3.0,
    neg_crossattn_emb: Optional[torch.Tensor] = None,
    sample_sampler: str = "euler",
    sample_scheduler: str = "simple",
) -> torch.Tensor:
    """Generate a sample using Euler discrete sampling for rectified flow.

    Args:
        height, width: Output image dimensions
        seed: Random seed (None for random)
        dit: Anima model
        crossattn_emb: Cross-attention embeddings (B, N, D)
        steps: Number of sampling steps
        dtype: Compute dtype
        device: Compute device
        guidance_scale: CFG scale (1.0 = no guidance)
        flow_shift: Flow shift parameter for rectified flow
        neg_crossattn_emb: Negative cross-attention embeddings for CFG
        sample_sampler: Preview sampler name from UI/config
        sample_scheduler: Preview scheduler name from UI/config

    Returns:
        Denoised latents
    """
    sample_sampler, sample_scheduler = normalize_anima_preview_sampling(
        sample_sampler,
        sample_scheduler,
        warn=False,
    )

    # Latent shape: (1, 16, 1, H/8, W/8) for single image
    latent_h = height // 8
    latent_w = width // 8
    latent = torch.zeros(1, 16, 1, latent_h, latent_w, device=device, dtype=dtype)

    # UI treats seed=0 as random preview generation.
    if seed == 0:
        seed = None

    # Generate noise
    if seed is not None:
        generator = torch.manual_seed(seed)
    else:
        generator = None
    noise = torch.randn(latent.size(), dtype=torch.float32, generator=generator, device="cpu").to(dtype).to(device)

    # Timestep schedule: linear from 1.0 to 0.0
    sigmas = torch.linspace(1.0, 0.0, steps + 1, device=device, dtype=dtype)
    flow_shift = float(flow_shift)
    if flow_shift != 1.0:
        sigmas = (sigmas * flow_shift) / (1 + (flow_shift - 1) * sigmas)

    # Start from pure noise
    x = noise.clone()

    # Padding mask (zeros = no padding) — resized in prepare_embedded_sequence to match latent dims
    padding_mask = torch.zeros(1, 1, latent_h, latent_w, dtype=dtype, device=device)

    use_cfg = guidance_scale > 1.0 and neg_crossattn_emb is not None

    for i in tqdm(range(steps), desc="Sampling"):
        sigma = sigmas[i]
        t = sigma.unsqueeze(0)  # (1,)

        if use_cfg:
            # CFG: two separate passes to reduce memory usage
            pos_out = dit(x, t, crossattn_emb, padding_mask=padding_mask)
            pos_out = pos_out.float()
            neg_out = dit(x, t, neg_crossattn_emb, padding_mask=padding_mask)
            neg_out = neg_out.float()

            model_output = neg_out + guidance_scale * (pos_out - neg_out)
        else:
            model_output = dit(x, t, crossattn_emb, padding_mask=padding_mask)
            model_output = model_output.float()

        # Euler step: x_{t-1} = x_t - (sigma_t - sigma_{t-1}) * model_output
        dt = sigmas[i + 1] - sigma
        x = x + model_output * dt
        x = x.to(dtype)

    return x


def load_sample_prompts_flexible(sample_prompts: str):
    sample_prompts = str(sample_prompts or "").strip()
    if not sample_prompts:
        return []

    if os.path.isfile(sample_prompts):
        return train_util.load_prompts(sample_prompts)

    lines = [line.strip() for line in sample_prompts.splitlines() if line.strip()]
    if not lines:
        return []

    return [{"prompt": line} for line in lines]


def sample_images(
    accelerator: Accelerator,
    args: argparse.Namespace,
    epoch,
    steps,
    dit: anima_models.Anima,
    vae,
    text_encoder,
    tokenize_strategy,
    text_encoding_strategy,
    sample_prompts_te_outputs=None,
    prompt_replacement=None,
):
    """Generate sample images during training.

    This is a simplified sampler for Anima - it generates images using the current model state.
    """
    if steps == 0:
        if not args.sample_at_first:
            return
    else:
        if args.sample_every_n_steps is None and args.sample_every_n_epochs is None:
            return
        if args.sample_every_n_epochs is not None:
            if epoch is None or epoch % args.sample_every_n_epochs != 0:
                return
        else:
            if steps % args.sample_every_n_steps != 0 or epoch is not None:
                return

    logger.info(f"Generating sample images at step {steps}")
    prompts = load_sample_prompts_flexible(args.sample_prompts)
    if len(prompts) == 0:
        logger.error(f"No sample prompts available: {args.sample_prompts}")
        return

    # Unwrap models
    dit = accelerator.unwrap_model(dit)
    if text_encoder is not None:
        text_encoder = accelerator.unwrap_model(text_encoder)

    dit.switch_block_swap_for_inference()

    save_dir = os.path.join(args.output_dir, "sample")
    os.makedirs(save_dir, exist_ok=True)

    # Save RNG state
    rng_state = torch.get_rng_state()
    cuda_rng_state = None
    try:
        cuda_rng_state = torch.cuda.get_rng_state() if torch.cuda.is_available() else None
    except Exception:
        pass

    with torch.no_grad(), accelerator.autocast():
        for prompt_dict in prompts:
            dit.prepare_block_swap_before_forward()
            _sample_image_inference(
                accelerator,
                args,
                dit,
                text_encoder,
                vae,
                tokenize_strategy,
                text_encoding_strategy,
                save_dir,
                prompt_dict,
                epoch,
                steps,
                sample_prompts_te_outputs,
                prompt_replacement,
            )

    # Restore RNG state
    torch.set_rng_state(rng_state)
    if cuda_rng_state is not None:
        torch.cuda.set_rng_state(cuda_rng_state)

    dit.switch_block_swap_for_training()
    clean_memory_on_device(accelerator.device)


def _decoded_tensor_to_pil_image(decoded: torch.Tensor) -> Image.Image:
    image = decoded.float()
    image = torch.clamp((image + 1.0) / 2.0, min=0.0, max=1.0)[0]
    if image.ndim == 4:
        image = image[:, 0, :, :]
    decoded_np = 255.0 * np.moveaxis(image.cpu().numpy(), 0, 2)
    decoded_np = decoded_np.astype(np.uint8)
    return Image.fromarray(decoded_np)


def _analyze_decoded_image_health(decoded: torch.Tensor) -> dict:
    image = decoded.detach().float()
    image = torch.clamp((image + 1.0) / 2.0, min=0.0, max=1.0)
    if image.ndim == 5:
        image = image[:, :, 0, :, :]
    if image.ndim == 4:
        image = image[0]

    min_value = float(image.min().item())
    max_value = float(image.max().item())
    mean_value = float(image.mean().item())
    std_value = float(image.std(unbiased=False).item())
    dynamic_range = max_value - min_value
    low_ratio = float((image < 0.08).float().mean().item())
    high_ratio = float((image > 0.92).float().mean().item())

    suspicious_reasons = []
    if std_value < 0.045:
        suspicious_reasons.append(f"very_low_std={std_value:.4f}")
    if dynamic_range < 0.18:
        suspicious_reasons.append(f"low_dynamic_range={dynamic_range:.4f}")
    if low_ratio > 0.88:
        suspicious_reasons.append(f"mostly_dark={low_ratio:.2%}")
    if high_ratio > 0.88:
        suspicious_reasons.append(f"mostly_bright={high_ratio:.2%}")

    return {
        "min": min_value,
        "max": max_value,
        "mean": mean_value,
        "std": std_value,
        "dynamic_range": dynamic_range,
        "low_ratio": low_ratio,
        "high_ratio": high_ratio,
        "suspicious": len(suspicious_reasons) > 0,
        "reasons": suspicious_reasons,
    }


def _warn_if_preview_looks_suspicious(args: argparse.Namespace, image_stats: dict, *, context: str, likely_early: bool = False) -> None:
    if not image_stats.get("suspicious", False):
        return

    warned_count = int(getattr(args, "_anima_preview_health_warning_count", 0) or 0)
    if warned_count >= 3:
        if warned_count == 3:
            logger.warning(
                "More suspicious Anima preview images were detected. Additional warnings will be suppressed for this run."
            )
            setattr(args, "_anima_preview_health_warning_count", warned_count + 1)
        return

    reason_text = ", ".join(image_stats.get("reasons", [])) or "low-detail image statistics"
    early_note = " This may happen very early in training, but" if likely_early else ""
    logger.warning(
        f"Suspicious Anima preview image detected ({context}): {reason_text}."
        f"{early_note} if this keeps happening, please check VAE compatibility, clear latent/text cache, and verify preview sampling settings."
    )
    setattr(args, "_anima_preview_health_warning_count", warned_count + 1)


def run_vae_roundtrip_self_check(
    args: argparse.Namespace,
    accelerator: Accelerator,
    vae: qwen_image_autoencoder_kl.AutoencoderKLQwenImage,
    train_dataset_group,
    vae_dtype: torch.dtype,
) -> None:
    if not accelerator.is_main_process:
        accelerator.wait_for_everyone()
        return

    try:
        if len(train_dataset_group) == 0:
            return

        example = train_dataset_group[0]
        images = example.get("images") if isinstance(example, dict) else None
        if images is None or len(images) == 0:
            logger.warning("VAE roundtrip self-check skipped because the dataset did not provide decoded image tensors.")
            return

        pixels = images[:1].to(accelerator.device, dtype=vae_dtype)
        org_vae_device = vae.device
        org_vae_dtype = vae.dtype

        with torch.no_grad():
            vae.to(accelerator.device, dtype=vae_dtype)
            latents = vae.encode_pixels_to_latents(pixels)
            if not torch.isfinite(latents).all():
                raise RuntimeError("VAE roundtrip produced non-finite latents")

            recon = vae.decode_to_pixels(latents)
            if not torch.isfinite(recon).all():
                raise RuntimeError("VAE roundtrip produced non-finite decoded pixels")

        mse = torch.mean((recon.float() - pixels.float()) ** 2).item()
        recon_stats = _analyze_decoded_image_health(recon)
        save_dir = os.path.join(args.output_dir, "sample")
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, "vae_roundtrip.png")
        _decoded_tensor_to_pil_image(recon).save(save_path)
        logger.info(f"VAE roundtrip self-check saved: {save_path} (mse={mse:.6f})")

        suspicious_vae = mse > 0.08 or recon_stats["suspicious"]
        if suspicious_vae:
            reason_parts = [f"mse={mse:.6f}"]
            reason_parts.extend(recon_stats.get("reasons", []))
            logger.warning(
                "VAE roundtrip self-check looks suspicious: "
                + ", ".join(reason_parts)
                + ". If training previews or saved samples look blurry / blocky / washed out, please first verify that the selected VAE matches the Anima base model and clear stale latent caches before retraining."
            )
    except Exception as e:
        logger.warning(f"VAE roundtrip self-check failed. If training previews or samples look corrupted, please check the VAE first: {e}")
    finally:
        try:
            vae.to(org_vae_device, dtype=org_vae_dtype)
        except Exception:
            pass
        clean_memory_on_device(accelerator.device)
        accelerator.wait_for_everyone()


def resolve_preview_size(args: argparse.Namespace, width: int, height: int) -> tuple[int, int]:
    if width > 0 and height > 0:
        return width, height

    fallback_width = 1024
    fallback_height = 1024
    resolution = getattr(args, "resolution", None)
    if isinstance(resolution, str):
        parts = [part.strip() for part in resolution.split(",") if part.strip()]
        if len(parts) >= 2:
            try:
                fallback_width = int(parts[0])
                fallback_height = int(parts[1])
            except ValueError:
                pass
        elif len(parts) == 1:
            try:
                fallback_width = int(parts[0])
                fallback_height = int(parts[0])
            except ValueError:
                pass
    elif isinstance(resolution, (int, float)):
        fallback_width = int(resolution)
        fallback_height = int(resolution)

    resolved_width = width if width > 0 else fallback_width
    resolved_height = height if height > 0 else fallback_height
    return resolved_width, resolved_height


def _sample_image_inference(
    accelerator,
    args,
    dit,
    text_encoder,
    vae: qwen_image_autoencoder_kl.AutoencoderKLQwenImage,
    tokenize_strategy,
    text_encoding_strategy,
    save_dir,
    prompt_dict,
    epoch,
    steps,
    sample_prompts_te_outputs,
    prompt_replacement,
):
    """Generate a single sample image."""
    prompt = prompt_dict.get("prompt", "")
    negative_prompt = prompt_dict.get("negative_prompt", "")
    sample_steps = prompt_dict.get("sample_steps", getattr(args, "sample_steps", 30))
    width = prompt_dict.get("width", getattr(args, "sample_width", 512))
    height = prompt_dict.get("height", getattr(args, "sample_height", 512))
    scale = prompt_dict.get("scale", getattr(args, "sample_cfg", 7.5))
    seed = prompt_dict.get("seed")
    if seed == 0:
        seed = None
    flow_shift = prompt_dict.get("flow_shift", getattr(args, "discrete_flow_shift", 3.0) or 3.0)
    sample_sampler = prompt_dict.get("sample_sampler", getattr(args, "sample_sampler", "euler"))
    sample_scheduler = getattr(args, "sample_scheduler", "simple")
    sample_sampler, sample_scheduler = normalize_anima_preview_sampling(sample_sampler, sample_scheduler, warn=True)

    safe_preview_request = clamp_safe_preview_request(
        args,
        width=int(width),
        height=int(height),
        steps=int(sample_steps),
        cfg=float(scale),
    )
    width = safe_preview_request["width"]
    height = safe_preview_request["height"]
    sample_steps = safe_preview_request["steps"]
    scale = safe_preview_request["cfg"]
    if safe_preview_request["changed"]:
        logger.info(
            "Safe preview adjusted the current Anima preview request: %s",
            ", ".join(safe_preview_request["changes"]),
        )

    if prompt_replacement is not None:
        prompt = prompt.replace(prompt_replacement[0], prompt_replacement[1])
        if negative_prompt:
            negative_prompt = negative_prompt.replace(prompt_replacement[0], prompt_replacement[1])

    if seed is not None:
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)  # seed all CUDA devices for multi-GPU

    width, height = resolve_preview_size(args, int(width), int(height))
    height = max(64, height - height % 16)
    width = max(64, width - width % 16)

    logger.info(
        f"  prompt: {prompt}, size: {width}x{height}, steps: {sample_steps}, scale: {scale}, flow_shift: {flow_shift}, seed: {seed}, sampler: {sample_sampler}, scheduler: {sample_scheduler}"
    )

    # Encode prompt
    def encode_prompt(prpt):
        if sample_prompts_te_outputs and prpt in sample_prompts_te_outputs:
            return sample_prompts_te_outputs[prpt]
        if text_encoder is not None:
            tokens = tokenize_strategy.tokenize(prpt)
            encoded = text_encoding_strategy.encode_tokens(tokenize_strategy, [text_encoder], tokens)
            return encoded
        return None

    encoded = encode_prompt(prompt)
    if encoded is None:
        logger.warning("Cannot encode prompt, skipping sample")
        return

    prompt_embeds, attn_mask, t5_input_ids, t5_attn_mask = encoded

    # Convert to tensors if numpy
    if isinstance(prompt_embeds, np.ndarray):
        prompt_embeds = torch.from_numpy(prompt_embeds).unsqueeze(0)
        attn_mask = torch.from_numpy(attn_mask).unsqueeze(0)
        t5_input_ids = torch.from_numpy(t5_input_ids).unsqueeze(0)
        t5_attn_mask = torch.from_numpy(t5_attn_mask).unsqueeze(0)

    prompt_embeds = prompt_embeds.to(accelerator.device, dtype=dit.dtype)
    attn_mask = attn_mask.to(accelerator.device)
    t5_input_ids = t5_input_ids.to(accelerator.device, dtype=torch.long)
    t5_attn_mask = t5_attn_mask.to(accelerator.device)

    # Process through LLM adapter if available
    if dit.use_llm_adapter:
        crossattn_emb = dit.llm_adapter(
            source_hidden_states=prompt_embeds,
            target_input_ids=t5_input_ids,
            target_attention_mask=t5_attn_mask,
            source_attention_mask=attn_mask,
        )
        crossattn_emb[~t5_attn_mask.bool()] = 0
    else:
        crossattn_emb = prompt_embeds

    # Encode negative prompt for CFG
    neg_crossattn_emb = None
    if scale > 1.0 and negative_prompt is not None:
        neg_encoded = encode_prompt(negative_prompt)
        if neg_encoded is not None:
            neg_pe, neg_am, neg_t5_ids, neg_t5_am = neg_encoded
            if isinstance(neg_pe, np.ndarray):
                neg_pe = torch.from_numpy(neg_pe).unsqueeze(0)
                neg_am = torch.from_numpy(neg_am).unsqueeze(0)
                neg_t5_ids = torch.from_numpy(neg_t5_ids).unsqueeze(0)
                neg_t5_am = torch.from_numpy(neg_t5_am).unsqueeze(0)

            neg_pe = neg_pe.to(accelerator.device, dtype=dit.dtype)
            neg_am = neg_am.to(accelerator.device)
            neg_t5_ids = neg_t5_ids.to(accelerator.device, dtype=torch.long)
            neg_t5_am = neg_t5_am.to(accelerator.device)

            if dit.use_llm_adapter:
                neg_crossattn_emb = dit.llm_adapter(
                    source_hidden_states=neg_pe,
                    target_input_ids=neg_t5_ids,
                    target_attention_mask=neg_t5_am,
                    source_attention_mask=neg_am,
                )
                neg_crossattn_emb[~neg_t5_am.bool()] = 0
            else:
                neg_crossattn_emb = neg_pe

    # Generate sample
    clean_memory_on_device(accelerator.device)
    latents = do_sample(
        height,
        width,
        seed,
        dit,
        crossattn_emb,
        sample_steps,
        dit.dtype,
        accelerator.device,
        scale,
        flow_shift,
        neg_crossattn_emb,
        sample_sampler=sample_sampler,
        sample_scheduler=sample_scheduler,
    )

    # Decode latents
    gc.collect()
    synchronize_device(accelerator.device)
    clean_memory_on_device(accelerator.device)
    org_vae_device = vae.device
    vae.to(accelerator.device)
    decoded = vae.decode_to_pixels(latents)
    vae.to(org_vae_device)
    clean_memory_on_device(accelerator.device)

    # Convert to image
    image_stats = _analyze_decoded_image_health(decoded)
    image = _decoded_tensor_to_pil_image(decoded)

    ts_str = time.strftime("%Y%m%d%H%M%S", time.localtime())
    num_suffix = f"e{epoch:06d}" if epoch is not None else f"{steps:06d}"
    seed_suffix = "" if seed is None else f"_{seed}"
    i = prompt_dict.get("enum", 0)
    img_filename = f"{'' if args.output_name is None else args.output_name + '_'}{num_suffix}_{i:02d}_{ts_str}{seed_suffix}.png"
    image.save(os.path.join(save_dir, img_filename))

    max_train_steps = int(getattr(args, "max_train_steps", 0) or 0)
    likely_early = bool(max_train_steps > 0 and steps is not None and steps <= max(20, int(max_train_steps * 0.15)))
    _warn_if_preview_looks_suspicious(
        args,
        image_stats,
        context=f"step={steps}, file={img_filename}",
        likely_early=likely_early,
    )

    # Log to wandb if enabled
    if "wandb" in [tracker.name for tracker in accelerator.trackers]:
        wandb_tracker = accelerator.get_tracker("wandb")
        import wandb

        wandb_tracker.log({f"sample_{i}": wandb.Image(image, caption=prompt)}, commit=False)
