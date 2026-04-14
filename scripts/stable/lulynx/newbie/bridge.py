from __future__ import annotations

import importlib.util
import json
import sys
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import torch
from safetensors.torch import load_file
from transformers import AutoConfig, AutoModel, AutoTokenizer


@dataclass(slots=True)
class NewbieModelBlueprint:
    class_name: str
    in_channels: int
    cap_feat_dim: int
    clip_text_dim: int
    clip_img_dim: int
    dtype: torch.dtype
    transformer_weight_path: Path


def _load_package(package_name: str, package_dir: Path):
    init_path = package_dir / '__init__.py'
    if package_name in sys.modules:
        return sys.modules[package_name]
    spec = importlib.util.spec_from_file_location(
        package_name,
        init_path,
        submodule_search_locations=[str(package_dir)],
    )
    if spec is None or spec.loader is None:
        raise ImportError(f'Unable to load package from {package_dir}')
    module = importlib.util.module_from_spec(spec)
    sys.modules[package_name] = module
    spec.loader.exec_module(module)
    return module


@lru_cache(maxsize=1)
def load_newbie_models_package(repo_root: str | Path):
    root = Path(repo_root).resolve() / 'scripts' / 'dev' / 'NewbieLoraTrainer'
    return _load_package('lulynx_newbie_upstream_models', root / 'models')


@lru_cache(maxsize=1)
def load_newbie_transport_package(repo_root: str | Path):
    root = Path(repo_root).resolve() / 'scripts' / 'dev' / 'NewbieLoraTrainer'
    return _load_package('lulynx_newbie_upstream_transport', root / 'transport')


def load_newbie_upstream_packages(repo_root: str | Path):
    return load_newbie_models_package(repo_root), load_newbie_transport_package(repo_root)


def resolve_dtype(mixed_precision: str) -> torch.dtype:
    normalized = str(mixed_precision or 'bf16').strip().lower()
    if normalized == 'bf16':
        return torch.bfloat16
    if normalized == 'fp16':
        return torch.float16
    return torch.float32


def _resolve_component_weight_path(component_path: Path, preferred_names: list[str]) -> Path:
    for name in preferred_names:
        candidate = component_path / name
        if candidate.exists():
            return candidate

    safetensor_files = sorted(component_path.glob('*.safetensors'))
    if safetensor_files:
        return safetensor_files[0]

    bin_files = sorted(component_path.glob('*.bin'))
    if bin_files:
        return bin_files[0]

    raise FileNotFoundError(f'No supported weight file was found in {component_path}')


def _instantiate_auto_model_from_config_source(
    config_source: str | Path,
    *,
    mixed_precision: str,
    trust_remote_code: bool,
):
    dtype = resolve_dtype(mixed_precision)
    config = AutoConfig.from_pretrained(config_source, trust_remote_code=trust_remote_code)
    model = AutoModel.from_config(config, trust_remote_code=trust_remote_code)
    if dtype != torch.float32:
        model = model.to(dtype=dtype)
    return model


def _load_auto_model_from_local_component(
    component_path: Path,
    *,
    mixed_precision: str,
    trust_remote_code: bool,
    preferred_weight_names: list[str],
    fallback_remote_repo: str | None = None,
):
    weight_path = _resolve_component_weight_path(component_path, preferred_weight_names)
    last_error: Exception | None = None
    model = None

    config_sources: list[str | Path] = [component_path]
    if fallback_remote_repo:
        config_sources.append(fallback_remote_repo)

    for config_source in config_sources:
        try:
            model = _instantiate_auto_model_from_config_source(
                config_source,
                mixed_precision=mixed_precision,
                trust_remote_code=trust_remote_code,
            )
            break
        except Exception as exc:  # pragma: no cover - real runtime path
            last_error = exc

    if model is None:
        if last_error is not None:
            raise last_error
        raise RuntimeError(f'Failed to construct model for component: {component_path}')

    state_dict = load_file(str(weight_path), device='cpu')
    model.load_state_dict(state_dict, strict=False)
    return model, weight_path


def build_newbie_model_blueprint(
    *,
    repo_root: str | Path,
    base_model_path: str | Path,
    mixed_precision: str = 'bf16',
    trust_remote_code: bool = True,
) -> NewbieModelBlueprint:
    base_path = Path(base_model_path).resolve()
    transformer_config_path = base_path / 'transformer' / 'config.json'
    text_encoder_path = base_path / 'text_encoder'
    transformer_weight_path = base_path / 'transformer' / 'diffusion_pytorch_model.safetensors'

    if not transformer_config_path.exists():
        raise FileNotFoundError(f'Newbie transformer config not found: {transformer_config_path}')
    if not text_encoder_path.exists():
        raise FileNotFoundError(f'Newbie text encoder path not found: {text_encoder_path}')
    if not transformer_weight_path.exists():
        root_weight_path = base_path / 'diffusion_pytorch_model.safetensors'
        if root_weight_path.exists():
            transformer_weight_path = root_weight_path
        else:
            raise FileNotFoundError(f'Newbie transformer weights not found: {transformer_weight_path}')

    with transformer_config_path.open('r', encoding='utf-8') as handle:
        transformer_config = json.load(handle)

    text_encoder_config = AutoConfig.from_pretrained(text_encoder_path, trust_remote_code=trust_remote_code)
    cap_feat_dim = int(text_encoder_config.text_config.hidden_size)

    return NewbieModelBlueprint(
        class_name=str(transformer_config.get('_class_name', 'NextDiT_3B_GQA_patch2_Adaln_Refiner_WHIT_CLIP')),
        in_channels=int(transformer_config.get('in_channels', 16)),
        cap_feat_dim=cap_feat_dim,
        clip_text_dim=int(transformer_config.get('clip_text_dim', 1024)),
        clip_img_dim=int(transformer_config.get('clip_img_dim', 1024)),
        dtype=resolve_dtype(mixed_precision),
        transformer_weight_path=transformer_weight_path,
    )


def instantiate_newbie_transformer(
    *,
    repo_root: str | Path,
    base_model_path: str | Path,
    mixed_precision: str = 'bf16',
    trust_remote_code: bool = True,
    load_weights_to_cpu: bool = True,
):
    blueprint = build_newbie_model_blueprint(
        repo_root=repo_root,
        base_model_path=base_model_path,
        mixed_precision=mixed_precision,
        trust_remote_code=trust_remote_code,
    )
    models_pkg = load_newbie_models_package(repo_root)
    model_factory = getattr(models_pkg, blueprint.class_name)
    model = model_factory(
        in_channels=blueprint.in_channels,
        qk_norm=True,
        cap_feat_dim=blueprint.cap_feat_dim,
        clip_text_dim=blueprint.clip_text_dim,
        clip_img_dim=blueprint.clip_img_dim,
    )
    state_dict = load_file(str(blueprint.transformer_weight_path), device='cpu' if load_weights_to_cpu else 'cuda')
    model.load_state_dict(state_dict, strict=False)
    if blueprint.dtype != torch.float32:
        model = model.to(dtype=blueprint.dtype)
    model.train()
    return model, blueprint


def estimate_newbie_transport_seq_len(resolution: int) -> int:
    return (int(resolution) // 16) ** 2


def create_newbie_transport(
    *,
    repo_root: str | Path,
    resolution: int,
):
    transport_pkg = load_newbie_transport_package(repo_root)
    seq_len = estimate_newbie_transport_seq_len(resolution)
    transport = transport_pkg.create_transport(
        path_type='Linear',
        prediction='velocity',
        snr_type='lognorm',
        do_shift=True,
        seq_len=seq_len,
    )
    return transport, seq_len


def load_newbie_text_encoder_and_tokenizer(base_model_path: str | Path, *, mixed_precision: str = 'bf16', trust_remote_code: bool = True):
    base_path = Path(base_model_path).resolve()
    text_encoder_path = base_path / 'text_encoder'
    dtype = resolve_dtype(mixed_precision)
    try:
        text_encoder = AutoModel.from_pretrained(
            text_encoder_path,
            torch_dtype=dtype,
            trust_remote_code=trust_remote_code,
        )
    except OSError:
        text_encoder, _ = _load_auto_model_from_local_component(
            text_encoder_path,
            mixed_precision=mixed_precision,
            trust_remote_code=trust_remote_code,
            preferred_weight_names=['model.safetensors', 'pytorch_model.bin', 'gemma3-4b-it.safetensors'],
        )
    tokenizer = AutoTokenizer.from_pretrained(text_encoder_path, trust_remote_code=trust_remote_code)
    tokenizer.padding_side = 'right'
    return text_encoder, tokenizer


def load_newbie_clip_model_and_tokenizer(base_model_path: str | Path, *, mixed_precision: str = 'bf16'):
    base_path = Path(base_model_path).resolve()
    clip_model_path = base_path / 'clip_model'
    try:
        clip_model = AutoModel.from_pretrained(clip_model_path, torch_dtype=resolve_dtype(mixed_precision), trust_remote_code=True)
    except Exception:
        clip_model, _ = _load_auto_model_from_local_component(
            clip_model_path,
            mixed_precision=mixed_precision,
            trust_remote_code=True,
            preferred_weight_names=['model.safetensors', 'pytorch_model.bin', 'jina-clip-v2.safetensors'],
            fallback_remote_repo='jinaai/jina-clip-v2',
        )
    try:
        clip_tokenizer = AutoTokenizer.from_pretrained(clip_model_path, trust_remote_code=True)
    except Exception:
        clip_tokenizer = AutoTokenizer.from_pretrained('jinaai/jina-clip-v2', trust_remote_code=True)
    return clip_model, clip_tokenizer


def load_newbie_vae(base_model_path: str | Path, *, trust_remote_code: bool = True):
    from diffusers import AutoencoderKL

    base_path = Path(base_model_path).resolve()
    vae_path = base_path / 'vae'
    return AutoencoderKL.from_pretrained(vae_path, torch_dtype=torch.float32, trust_remote_code=trust_remote_code)
