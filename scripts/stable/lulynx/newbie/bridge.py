from __future__ import annotations

import importlib.util
import json
import logging
import shutil
import sys
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import torch
from safetensors.torch import load_file
from transformers import AutoConfig, AutoModel, AutoTokenizer

logger = logging.getLogger(__name__)


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


def _call_hf_from_pretrained(factory, *args, low_cpu_mem_usage: bool = False, **kwargs):
    if low_cpu_mem_usage:
        try:
            return factory(*args, low_cpu_mem_usage=True, **kwargs)
        except TypeError:
            pass
    return factory(*args, **kwargs)


def _normalize_attn_implementation(value):
    normalized = str(value or '').strip().lower()
    if normalized in {'flash_attention_2', 'flash_attention', 'flash', 'fa2'}:
        return 'eager'
    return value


def _disable_flash_attention_flags(target, _visited: set[int] | None = None) -> None:
    if target is None:
        return

    if _visited is None:
        _visited = set()

    try:
        target_id = id(target)
    except Exception:
        target_id = None
    if target_id is not None:
        if target_id in _visited:
            return
        _visited.add(target_id)

    if isinstance(target, dict):
        if 'use_flash_attn' in target:
            target['use_flash_attn'] = False
        if 'use_text_flash_attn' in target:
            target['use_text_flash_attn'] = False
        if 'attn_implementation' in target:
            target['attn_implementation'] = _normalize_attn_implementation(target.get('attn_implementation'))
        for value in list(target.values()):
            _disable_flash_attention_flags(value, _visited)
        return

    if isinstance(target, (list, tuple)):
        for value in target:
            _disable_flash_attention_flags(value, _visited)
        return

    for attr_name in ('use_flash_attn', 'use_text_flash_attn'):
        if hasattr(target, attr_name):
            try:
                setattr(target, attr_name, False)
            except Exception:
                pass

    if hasattr(target, 'attn_implementation'):
        try:
            setattr(
                target,
                'attn_implementation',
                _normalize_attn_implementation(getattr(target, 'attn_implementation')),
            )
        except Exception:
            pass

    for attr_name in ('text_config', 'vision_config', 'hf_model_config_kwargs'):
        if hasattr(target, attr_name):
            try:
                value = getattr(target, attr_name)
            except Exception:
                continue
            _disable_flash_attention_flags(value, _visited)


def _iter_exception_chain(exc: Exception):
    seen: set[int] = set()
    current: Exception | None = exc
    while current is not None and id(current) not in seen:
        yield current
        seen.add(id(current))
        current = current.__cause__ or current.__context__


def _extract_missing_dynamic_module_path(exc: Exception) -> Path | None:
    for item in _iter_exception_chain(exc):
        if not isinstance(item, FileNotFoundError):
            continue
        filename = getattr(item, 'filename', None)
        if not filename:
            continue
        candidate = Path(filename)
        if 'transformers_modules' in str(candidate).replace('/', '\\').lower():
            return candidate
    return None


def _select_dynamic_module_cache_root(missing_path: Path) -> Path:
    target = missing_path.parent
    if target.name == '__pycache__':
        target = target.parent
    if len(target.name) >= 16 and all(ch in '0123456789abcdef' for ch in target.name.lower()):
        return target
    return target


def _call_with_dynamic_module_recovery(loader, *, context_label: str):
    try:
        return loader()
    except Exception as exc:
        missing_path = _extract_missing_dynamic_module_path(exc)
        if missing_path is None:
            raise

        purge_root = _select_dynamic_module_cache_root(missing_path)
        try:
            shutil.rmtree(purge_root, ignore_errors=True)
        except Exception:
            pass

        logger.warning(
            'Detected incomplete Hugging Face dynamic module cache while loading %s. Missing file: %s. Cleared %s and retrying once.',
            context_label,
            missing_path,
            purge_root,
        )
        return loader()


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
    def _load():
        dtype = resolve_dtype(mixed_precision)
        config = AutoConfig.from_pretrained(config_source, trust_remote_code=trust_remote_code, local_files_only=True)
        _disable_flash_attention_flags(config)
        model = AutoModel.from_config(config, trust_remote_code=trust_remote_code)
        if dtype != torch.float32:
            model = model.to(dtype=dtype)
        return model

    return _call_with_dynamic_module_recovery(
        _load,
        context_label=f'AutoModel.from_config({config_source})',
    )


def _load_auto_config_with_dynamic_module_recovery(config_source: str | Path, *, trust_remote_code: bool):
    config = _call_with_dynamic_module_recovery(
        lambda: AutoConfig.from_pretrained(config_source, trust_remote_code=trust_remote_code, local_files_only=True),
        context_label=f'AutoConfig.from_pretrained({config_source})',
    )
    _disable_flash_attention_flags(config)
    return config


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

    text_encoder_config = _load_auto_config_with_dynamic_module_recovery(
        text_encoder_path,
        trust_remote_code=trust_remote_code,
    )
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
    text_encoder_config = _load_auto_config_with_dynamic_module_recovery(
        text_encoder_path,
        trust_remote_code=trust_remote_code,
    )
    try:
        text_encoder = _call_with_dynamic_module_recovery(
            lambda: _call_hf_from_pretrained(
                AutoModel.from_pretrained,
                text_encoder_path,
                config=text_encoder_config,
                torch_dtype=dtype,
                trust_remote_code=trust_remote_code,
                local_files_only=True,
                low_cpu_mem_usage=True,
            ),
            context_label=f'AutoModel.from_pretrained({text_encoder_path})',
        )
    except OSError:
        text_encoder, _ = _load_auto_model_from_local_component(
            text_encoder_path,
            mixed_precision=mixed_precision,
            trust_remote_code=trust_remote_code,
            preferred_weight_names=['model.safetensors', 'pytorch_model.bin', 'gemma3-4b-it.safetensors'],
        )
    tokenizer = _call_with_dynamic_module_recovery(
        lambda: AutoTokenizer.from_pretrained(text_encoder_path, trust_remote_code=trust_remote_code, local_files_only=True),
        context_label=f'AutoTokenizer.from_pretrained({text_encoder_path})',
    )
    tokenizer.padding_side = 'right'
    return text_encoder, tokenizer


def load_newbie_clip_model_and_tokenizer(base_model_path: str | Path, *, mixed_precision: str = 'bf16'):
    base_path = Path(base_model_path).resolve()
    clip_model_path = base_path / 'clip_model'
    clip_config = _load_auto_config_with_dynamic_module_recovery(
        clip_model_path,
        trust_remote_code=True,
    )
    try:
        clip_model = _call_with_dynamic_module_recovery(
            lambda: _call_hf_from_pretrained(
                AutoModel.from_pretrained,
                clip_model_path,
                config=clip_config,
                torch_dtype=resolve_dtype(mixed_precision),
                trust_remote_code=True,
                local_files_only=True,
                low_cpu_mem_usage=True,
            ),
            context_label=f'AutoModel.from_pretrained({clip_model_path})',
        )
    except Exception:
        clip_model, _ = _load_auto_model_from_local_component(
            clip_model_path,
            mixed_precision=mixed_precision,
            trust_remote_code=True,
            preferred_weight_names=['model.safetensors', 'pytorch_model.bin', 'jina-clip-v2.safetensors'],
            fallback_remote_repo='jinaai/jina-clip-v2',
        )
    try:
        clip_tokenizer = _call_with_dynamic_module_recovery(
            lambda: AutoTokenizer.from_pretrained(clip_model_path, trust_remote_code=True, local_files_only=True),
            context_label=f'AutoTokenizer.from_pretrained({clip_model_path})',
        )
    except Exception:
        clip_tokenizer = _call_with_dynamic_module_recovery(
            lambda: AutoTokenizer.from_pretrained('jinaai/jina-clip-v2', trust_remote_code=True, local_files_only=True),
            context_label='AutoTokenizer.from_pretrained(jinaai/jina-clip-v2)',
        )
    return clip_model, clip_tokenizer


def load_newbie_vae(base_model_path: str | Path, *, trust_remote_code: bool = True):
    from diffusers import AutoencoderKL

    base_path = Path(base_model_path).resolve()
    vae_path = base_path / 'vae'
    return _call_hf_from_pretrained(
        AutoencoderKL.from_pretrained,
        vae_path,
        torch_dtype=torch.float32,
        trust_remote_code=trust_remote_code,
        local_files_only=True,
        low_cpu_mem_usage=True,
    )


