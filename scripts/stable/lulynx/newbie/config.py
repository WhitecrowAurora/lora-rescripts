from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import toml


class NewbieConfigError(ValueError):
    pass


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
DEFAULT_GEMMA_MAX_TOKEN_LENGTH = 256
DEFAULT_CLIP_MAX_TOKEN_LENGTH = 256
DEFAULT_CAPTION_BUCKET_SIZE = 32
SUPPORTED_NEWBIE_OPTIMIZERS = {"AdamW8bit", "AdamW"}
KNOWN_CONFIG_SECTIONS = (
    "Model",
    "Optimization",
    "Dataset",
    "General",
    "Training",
    "Advanced",
    "Lulynx",
)


def _resolve_path(base_dir: Path, raw_value: Any) -> Path | None:
    text = str(raw_value or "").strip()
    if not text:
        return None

    path = Path(text).expanduser()
    if not path.is_absolute():
        path = (base_dir / path).resolve()
    else:
        path = path.resolve()
    return path


def _parse_bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return bool(default)
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value != 0
    normalized = str(value).strip().lower()
    if normalized in {"", "none", "null"}:
        return bool(default)
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    return bool(value)


def _parse_int(value: Any, default: int, minimum: int | None = None) -> int:
    try:
        parsed = int(round(float(value)))
    except (TypeError, ValueError):
        parsed = int(default)
    if minimum is not None:
        parsed = max(minimum, parsed)
    return parsed


def _parse_float(value: Any, default: float, minimum: float | None = None) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        parsed = float(default)
    if minimum is not None:
        parsed = max(minimum, parsed)
    return parsed


def _lookup_config_value(raw: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in raw and raw[key] is not None:
            return raw[key]

    for section_name in KNOWN_CONFIG_SECTIONS:
        section = raw.get(section_name)
        if not isinstance(section, dict):
            continue
        for key in keys:
            if key in section and section[key] is not None:
                return section[key]

    return default


def _parse_resolution(raw_value: Any) -> tuple[int, int]:
    text = str(raw_value or "1024,1024").strip()
    if not text:
        return 1024, 1024

    normalized = text.lower().replace("x", ",")
    parts = [part.strip() for part in normalized.split(",") if part.strip()]
    if len(parts) == 1:
        value = _parse_int(parts[0], 1024, minimum=64)
        return value, value
    if len(parts) >= 2:
        width = _parse_int(parts[0], 1024, minimum=64)
        height = _parse_int(parts[1], 1024, minimum=64)
        return width, height
    return 1024, 1024


def _parse_string_list(raw_value: Any) -> list[str] | None:
    if raw_value is None:
        return None
    if isinstance(raw_value, (list, tuple, set)):
        values = [str(item).strip() for item in raw_value if str(item).strip()]
        return values or None

    text = str(raw_value).strip()
    if not text:
        return None

    normalized = text.replace("\r\n", "\n").replace("\r", "\n").replace("\n", ",")
    values = [item.strip() for item in normalized.split(",") if item.strip()]
    return values or None


def _resolve_component_path(
    *,
    base_dir: Path,
    raw_value: Any,
    fallback_root: Path | None,
    fallback_name: str,
) -> Path | None:
    explicit = _resolve_path(base_dir, raw_value)
    if explicit is not None:
        return explicit
    if fallback_root is None:
        return None
    fallback_path = (fallback_root / fallback_name).resolve()
    if fallback_path.exists():
        return fallback_path
    return None


@dataclass(slots=True)
class NewbieRuntimeConfig:
    config_path: Path
    repo_root: Path
    model_train_type: str
    pretrained_model_name_or_path: Path
    transformer_path: Path | None
    gemma_model_path: Path | None
    clip_model_path: Path | None
    vae_path: Path | None
    train_data_dir: Path
    output_dir: Path
    output_name: str
    resume: Path | None
    resolution_width: int
    resolution_height: int
    enable_bucket: bool
    min_bucket_reso: int
    max_bucket_reso: int
    bucket_reso_step: int
    train_batch_size: int
    gradient_accumulation_steps: int
    max_train_epochs: int
    max_train_steps: int
    gradient_checkpointing: bool
    newbie_refiner_checkpointing: bool
    mixed_precision: str
    optimizer_type: str
    lr_scheduler: str
    lr_warmup_steps: int
    max_grad_norm: float
    save_every_n_steps: int
    learning_rate: float
    weight_decay: float
    seed: int
    adapter_type: str
    network_dim: int
    network_alpha: int
    network_dropout: float
    newbie_target_modules: Any
    lokr_rank: int
    lokr_alpha: int
    lokr_factor: int
    lokr_dropout: float
    lokr_rank_dropout: float
    lokr_module_dropout: float
    lokr_train_norm: bool
    caption_extension: str
    shuffle_caption: bool
    keep_tokens: int
    trust_remote_code: bool
    use_cache: bool
    newbie_force_cache_only: bool
    newbie_rebuild_cache: bool
    newbie_two_phase_execution: bool
    newbie_gemma_max_token_length: int
    newbie_clip_max_token_length: int
    newbie_caption_length_bucket_size: int
    blocks_to_swap: int
    cpu_offload_checkpointing: bool
    pytorch_cuda_expandable_segments: bool
    newbie_safe_fallback: bool
    enable_preview: bool
    lulynx_experimental_core_enabled: bool

    @property
    def model_resolution(self) -> int:
        return max(self.resolution_width, self.resolution_height)

    @property
    def effective_batch_size(self) -> int:
        return self.train_batch_size * self.gradient_accumulation_steps

    def describe(self) -> list[str]:
        return [
            f"model_type={self.model_train_type}",
            f"base_model={self.pretrained_model_name_or_path}",
            f"train_data_dir={self.train_data_dir}",
            f"output_dir={self.output_dir}",
            f"resolution={self.resolution_width}x{self.resolution_height}",
            (
                "batch="
                f"{self.train_batch_size} x grad_accum {self.gradient_accumulation_steps}"
                f" (effective={self.effective_batch_size})"
            ),
            (
                "cache="
                f"{'on' if self.use_cache else 'off'}, "
                f"force_cache_only={'on' if self.newbie_force_cache_only else 'off'}, "
                f"two_phase={'on' if self.newbie_two_phase_execution else 'off'}"
            ),
            (
                "caption_bucketing="
                f"{self.newbie_caption_length_bucket_size}, "
                f"gemma_max={self.newbie_gemma_max_token_length}, "
                f"clip_max={self.newbie_clip_max_token_length}"
            ),
            (
                "optimizer="
                f"{self.optimizer_type}, scheduler={self.lr_scheduler}, warmup={self.lr_warmup_steps}, "
                f"max_grad_norm={self.max_grad_norm}"
            ),
            (
                "adapter="
                f"{self.adapter_type}, rank={self.network_dim}, alpha={self.network_alpha}, "
                f"dropout={self.network_dropout}"
            ),
        ]


def load_newbie_runtime_config(config_path: str | Path) -> tuple[NewbieRuntimeConfig, list[str]]:
    resolved_config = Path(config_path).expanduser().resolve()
    if not resolved_config.exists():
        raise NewbieConfigError(f"Config file not found: {resolved_config}")

    raw = toml.load(resolved_config)
    repo_root = Path(__file__).resolve().parents[4]
    warnings: list[str] = []

    model_root = _resolve_path(
        repo_root,
        _lookup_config_value(raw, "pretrained_model_name_or_path", "base_model_path"),
    )
    if model_root is None:
        raise NewbieConfigError("pretrained_model_name_or_path 不能为空。")
    if not model_root.exists():
        raise NewbieConfigError(f"Newbie 基座目录不存在: {model_root}")
    if not model_root.is_dir():
        raise NewbieConfigError(f"Newbie 基座当前要求使用完整本地目录: {model_root}")

    resolution_width, resolution_height = _parse_resolution(
        _lookup_config_value(raw, "resolution", default="1024,1024")
    )
    if resolution_width != resolution_height:
        warnings.append(
            "Newbie 当前内部目标分辨率仍按最大边对齐做规划；非正方形训练会继续走 bucket，但模型侧会优先按最大边估算 token 压力。"
        )

    transformer_path = _resolve_component_path(
        base_dir=repo_root,
        raw_value=_lookup_config_value(raw, "transformer_path"),
        fallback_root=model_root,
        fallback_name="transformer",
    )
    gemma_model_path = _resolve_component_path(
        base_dir=repo_root,
        raw_value=_lookup_config_value(raw, "gemma_model_path"),
        fallback_root=model_root,
        fallback_name="text_encoder",
    )
    clip_model_path = _resolve_component_path(
        base_dir=repo_root,
        raw_value=_lookup_config_value(raw, "clip_model_path"),
        fallback_root=model_root,
        fallback_name="clip_model",
    )
    vae_path = _resolve_component_path(
        base_dir=repo_root,
        raw_value=_lookup_config_value(raw, "vae_path"),
        fallback_root=model_root,
        fallback_name="vae",
    )

    if transformer_path is None or not transformer_path.exists():
        raise NewbieConfigError("未找到 Newbie transformer 目录，请检查 pretrained_model_name_or_path 或 transformer_path。")
    if gemma_model_path is None or not gemma_model_path.exists():
        raise NewbieConfigError("未找到 Gemma 模型目录，请检查 pretrained_model_name_or_path 或 gemma_model_path。")
    if clip_model_path is None or not clip_model_path.exists():
        raise NewbieConfigError("未找到 Jina CLIP 模型目录，请检查 pretrained_model_name_or_path 或 clip_model_path。")
    if vae_path is None or not vae_path.exists():
        raise NewbieConfigError("未找到 VAE 目录，请检查 pretrained_model_name_or_path 或 vae_path。")

    train_data_dir = _resolve_path(repo_root, _lookup_config_value(raw, "train_data_dir"))
    if train_data_dir is None:
        raise NewbieConfigError("train_data_dir 不能为空。")
    if not train_data_dir.exists() or not train_data_dir.is_dir():
        raise NewbieConfigError(f"训练数据集目录不存在: {train_data_dir}")
    if not any(path.suffix.lower() in IMAGE_EXTENSIONS for path in train_data_dir.rglob("*")):
        raise NewbieConfigError(f"训练数据集目录中没有可用图片: {train_data_dir}")

    output_dir = _resolve_path(repo_root, _lookup_config_value(raw, "output_dir", default="./output/newbie")) or (
        repo_root / "output" / "newbie"
    )
    output_name = (
        str(_lookup_config_value(raw, "output_name", default="newbie-lora") or "newbie-lora").strip() or "newbie-lora"
    )
    resume = _resolve_path(repo_root, _lookup_config_value(raw, "resume"))

    if _parse_bool(_lookup_config_value(raw, "enable_preview", default=False), False):
        warnings.append("Newbie 新分支当前默认建议关闭训练中预览，以避免额外显存峰值。")
    if not _parse_bool(_lookup_config_value(raw, "use_cache", default=True), True):
        warnings.append("当前 Newbie 分支建议始终启用 cache；关闭 cache 会显著提高正式训练阶段显存峰值。")

    optimizer_type = str(_lookup_config_value(raw, "optimizer_type", default="AdamW8bit") or "AdamW8bit").strip()
    if optimizer_type not in SUPPORTED_NEWBIE_OPTIMIZERS:
        warnings.append(
            f"当前 Newbie 训练仅正式支持 AdamW8bit / AdamW；检测到优化器 {optimizer_type}，将自动回退为 AdamW8bit。"
        )
        optimizer_type = "AdamW8bit"

    adapter_type = (
        str(_lookup_config_value(raw, "adapter_type", "lora_type", default="lora") or "lora").strip().lower() or "lora"
    )
    network_dim = _parse_int(
        _lookup_config_value(raw, "network_dim", "lora_rank", default=16),
        16,
        minimum=1,
    )
    network_alpha = _parse_int(
        _lookup_config_value(raw, "network_alpha", "lora_alpha", default=network_dim),
        network_dim,
        minimum=1,
    )
    network_dropout = _parse_float(
        _lookup_config_value(raw, "network_dropout", "lora_dropout", default=0.0),
        0.0,
        minimum=0.0,
    )
    target_modules = _parse_string_list(
        _lookup_config_value(raw, "newbie_target_modules", "lora_target_modules")
    )
    lr_scheduler = (
        str(_lookup_config_value(raw, "lr_scheduler", default="cosine") or "cosine").strip().lower() or "cosine"
    )
    lr_warmup_steps = _parse_int(_lookup_config_value(raw, "lr_warmup_steps", default=0), 0, minimum=0)
    max_grad_norm = _parse_float(
        _lookup_config_value(raw, "max_grad_norm", "gradient_clip_norm", default=1.0),
        1.0,
        minimum=0.0,
    )
    save_every_n_steps = _parse_int(_lookup_config_value(raw, "save_every_n_steps", default=0), 0, minimum=0)
    lokr_rank = _parse_int(
        _lookup_config_value(raw, "lokr_rank", "lora_rank", default=network_dim),
        network_dim,
        minimum=1,
    )
    lokr_alpha = _parse_int(
        _lookup_config_value(raw, "lokr_alpha", "lora_alpha", default=lokr_rank),
        lokr_rank,
        minimum=1,
    )
    lokr_factor = _parse_int(_lookup_config_value(raw, "lokr_factor", default=-1), -1)
    lokr_dropout = _parse_float(
        _lookup_config_value(raw, "lokr_dropout", "lora_dropout", default=network_dropout),
        network_dropout,
        minimum=0.0,
    )
    lokr_rank_dropout = _parse_float(_lookup_config_value(raw, "lokr_rank_dropout", default=0.0), 0.0, minimum=0.0)
    lokr_module_dropout = _parse_float(
        _lookup_config_value(raw, "lokr_module_dropout", default=0.0),
        0.0,
        minimum=0.0,
    )
    lokr_train_norm = _parse_bool(_lookup_config_value(raw, "lokr_train_norm", default=False), False)

    config = NewbieRuntimeConfig(
        config_path=resolved_config,
        repo_root=repo_root,
        model_train_type=(
            str(_lookup_config_value(raw, "model_train_type", default="newbie-lora") or "newbie-lora").strip().lower()
            or "newbie-lora"
        ),
        pretrained_model_name_or_path=model_root,
        transformer_path=transformer_path,
        gemma_model_path=gemma_model_path,
        clip_model_path=clip_model_path,
        vae_path=vae_path,
        train_data_dir=train_data_dir,
        output_dir=output_dir,
        output_name=output_name,
        resume=resume,
        resolution_width=resolution_width,
        resolution_height=resolution_height,
        enable_bucket=_parse_bool(_lookup_config_value(raw, "enable_bucket", default=True), True),
        min_bucket_reso=_parse_int(_lookup_config_value(raw, "min_bucket_reso", default=256), 256, minimum=64),
        max_bucket_reso=_parse_int(_lookup_config_value(raw, "max_bucket_reso", default=2048), 2048, minimum=64),
        bucket_reso_step=_parse_int(
            _lookup_config_value(raw, "bucket_reso_steps", "bucket_reso_step", default=64),
            64,
            minimum=8,
        ),
        train_batch_size=_parse_int(_lookup_config_value(raw, "train_batch_size", default=1), 1, minimum=1),
        gradient_accumulation_steps=_parse_int(
            _lookup_config_value(raw, "gradient_accumulation_steps", default=1),
            1,
            minimum=1,
        ),
        max_train_epochs=_parse_int(
            _lookup_config_value(raw, "max_train_epochs", "num_epochs", default=10),
            10,
            minimum=1,
        ),
        max_train_steps=_parse_int(_lookup_config_value(raw, "max_train_steps", default=0), 0, minimum=0),
        gradient_checkpointing=_parse_bool(_lookup_config_value(raw, "gradient_checkpointing", default=True), True),
        newbie_refiner_checkpointing=_parse_bool(
            _lookup_config_value(raw, "newbie_refiner_checkpointing", default=True),
            True,
        ),
        mixed_precision=str(_lookup_config_value(raw, "mixed_precision", default="bf16") or "bf16").strip().lower()
        or "bf16",
        optimizer_type=optimizer_type or "AdamW8bit",
        lr_scheduler=lr_scheduler,
        lr_warmup_steps=lr_warmup_steps,
        max_grad_norm=max_grad_norm,
        save_every_n_steps=save_every_n_steps,
        learning_rate=_parse_float(_lookup_config_value(raw, "learning_rate", default="1e-4"), 1e-4, minimum=0.0),
        weight_decay=_parse_float(_lookup_config_value(raw, "weight_decay", default=0.0), 0.0, minimum=0.0),
        seed=_parse_int(_lookup_config_value(raw, "seed", default=1337), 1337, minimum=0),
        adapter_type=adapter_type,
        network_dim=network_dim,
        network_alpha=network_alpha,
        network_dropout=network_dropout,
        newbie_target_modules=target_modules,
        lokr_rank=lokr_rank,
        lokr_alpha=lokr_alpha,
        lokr_factor=lokr_factor,
        lokr_dropout=lokr_dropout,
        lokr_rank_dropout=lokr_rank_dropout,
        lokr_module_dropout=lokr_module_dropout,
        lokr_train_norm=lokr_train_norm,
        caption_extension=str(_lookup_config_value(raw, "caption_extension", default=".txt") or ".txt").strip()
        or ".txt",
        shuffle_caption=_parse_bool(_lookup_config_value(raw, "shuffle_caption", default=False), False),
        keep_tokens=_parse_int(_lookup_config_value(raw, "keep_tokens", default=0), 0, minimum=0),
        trust_remote_code=_parse_bool(_lookup_config_value(raw, "trust_remote_code", default=True), True),
        use_cache=_parse_bool(_lookup_config_value(raw, "use_cache", default=True), True),
        newbie_force_cache_only=_parse_bool(_lookup_config_value(raw, "newbie_force_cache_only", default=True), True),
        newbie_rebuild_cache=_parse_bool(_lookup_config_value(raw, "newbie_rebuild_cache", default=False), False),
        newbie_two_phase_execution=_parse_bool(_lookup_config_value(raw, "newbie_two_phase_execution", default=True), True),
        newbie_gemma_max_token_length=_parse_int(
            _lookup_config_value(raw, "newbie_gemma_max_token_length", default=DEFAULT_GEMMA_MAX_TOKEN_LENGTH),
            DEFAULT_GEMMA_MAX_TOKEN_LENGTH,
            minimum=32,
        ),
        newbie_clip_max_token_length=_parse_int(
            _lookup_config_value(raw, "newbie_clip_max_token_length", default=DEFAULT_CLIP_MAX_TOKEN_LENGTH),
            DEFAULT_CLIP_MAX_TOKEN_LENGTH,
            minimum=32,
        ),
        newbie_caption_length_bucket_size=_parse_int(
            _lookup_config_value(raw, "newbie_caption_length_bucket_size", default=DEFAULT_CAPTION_BUCKET_SIZE),
            DEFAULT_CAPTION_BUCKET_SIZE,
            minimum=1,
        ),
        blocks_to_swap=_parse_int(_lookup_config_value(raw, "blocks_to_swap", default=0), 0, minimum=0),
        cpu_offload_checkpointing=_parse_bool(_lookup_config_value(raw, "cpu_offload_checkpointing", default=False), False),
        pytorch_cuda_expandable_segments=_parse_bool(
            _lookup_config_value(raw, "pytorch_cuda_expandable_segments", default=True),
            True,
        ),
        newbie_safe_fallback=_parse_bool(_lookup_config_value(raw, "newbie_safe_fallback", default=True), True),
        enable_preview=_parse_bool(_lookup_config_value(raw, "enable_preview", default=False), False),
        lulynx_experimental_core_enabled=_parse_bool(
            _lookup_config_value(raw, "lulynx_experimental_core_enabled", default=False),
            False,
        ),
    )

    return config, warnings