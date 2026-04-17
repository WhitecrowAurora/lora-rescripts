from __future__ import annotations

import math
from typing import Iterable

import torch
from peft import LoraConfig, VeraConfig, get_peft_model

try:
    from lycoris.wrapper import LycorisNetwork
except Exception:  # pragma: no cover
    LycorisNetwork = None

from .config import NewbieRuntimeConfig


DEFAULT_TARGET_MODULES = [
    'attention.qkv',
    'attention.out',
    'feed_forward.w2',
    'time_text_embed.1',
    'clip_text_pooled_proj.1',
]


def _normalize_target_modules(config: NewbieRuntimeConfig) -> list[str]:
    raw = getattr(config, 'newbie_target_modules', None)
    if raw is None:
        return list(DEFAULT_TARGET_MODULES)
    if isinstance(raw, (list, tuple, set)):
        result = [str(item).strip() for item in raw if str(item).strip()]
    else:
        text = str(raw).replace('\r\n', '\n').replace('\r', '\n').replace('\n', ',')
        result = [item.strip() for item in text.split(',') if item.strip()]
    return result or list(DEFAULT_TARGET_MODULES)


def _normalize_adapter_type(raw_value: str | None) -> str:
    normalized = str(raw_value or 'lora').strip().lower() or 'lora'
    if normalized in {'lora_fa', 'lora-fa', 'lorafa', 'fa'}:
        return 'lora_fa'
    if normalized in {'lokr', 'lyco_lokr', 'lycoris_lokr', 'lyco-lokr'}:
        return 'lyco_lokr'
    return normalized


def _get_peft_adapter_branch(container, adapter_name: str = 'default'):
    if container is None:
        return None
    if isinstance(container, dict):
        return container.get(adapter_name)
    try:
        return container[adapter_name]
    except Exception:
        return None


def _configure_newbie_lora_fa_training(peft_model, adapter_name: str = 'default') -> None:
    configured_modules = 0
    for module in peft_model.modules():
        lora_a = _get_peft_adapter_branch(getattr(module, 'lora_A', None), adapter_name)
        lora_b = _get_peft_adapter_branch(getattr(module, 'lora_B', None), adapter_name)
        if lora_a is None or lora_b is None:
            continue

        if hasattr(lora_a, 'weight') and hasattr(lora_b, 'weight'):
            in_dim = getattr(lora_a, 'in_features', None)
            rank = getattr(lora_a, 'out_features', None)
            if in_dim is not None and rank is not None:
                std = math.sqrt(2.0 / (float(in_dim) + float(rank)))
                torch.nn.init.normal_(lora_a.weight, std=std)
                torch.nn.init.zeros_(lora_b.weight)

        lora_a.requires_grad_(False)
        lora_b.requires_grad_(True)
        configured_modules += 1

    if configured_modules <= 0:
        raise RuntimeError('Failed to configure PEFT LoRA-FA adapters for Newbie: no lora_A/lora_B modules were found.')

    for name, param in peft_model.named_parameters():
        if 'lora_A' in name:
            param.requires_grad_(False)
        elif 'lora_B' in name:
            param.requires_grad_(True)

    peft_model._lora_fa_module_count = configured_modules


def _register_newbie_lisa_modules(peft_model, adapter_name: str = 'default') -> None:
    lisa_modules = []
    seen = set()

    for module in peft_model.modules():
        lora_a = _get_peft_adapter_branch(getattr(module, 'lora_A', None), adapter_name)
        lora_b = _get_peft_adapter_branch(getattr(module, 'lora_B', None), adapter_name)
        vera_lambda_b = _get_peft_adapter_branch(getattr(module, 'vera_lambda_b', None), adapter_name)
        vera_lambda_d = _get_peft_adapter_branch(getattr(module, 'vera_lambda_d', None), adapter_name)
        if lora_a is None and lora_b is None and vera_lambda_b is None and vera_lambda_d is None:
            continue

        module_id = id(module)
        if module_id in seen:
            continue
        seen.add(module_id)
        lisa_modules.append(module)

    for param in peft_model.parameters():
        if not param.requires_grad:
            setattr(param, '_lulynx_force_frozen', True)

    peft_model.unet_loras = lisa_modules
    peft_model._lulynx_lisa_module_count = len(lisa_modules)


def attach_newbie_adapter(model, config: NewbieRuntimeConfig):
    adapter_type = _normalize_adapter_type(config.adapter_type)
    target_modules = _normalize_target_modules(config)

    if adapter_type == 'lyco_lokr':
        if LycorisNetwork is None:
            raise ImportError('lycoris-lora is required for Newbie LoKr support')

        lokr_rank = int(getattr(config, 'lokr_rank', config.network_dim))
        lokr_alpha = int(getattr(config, 'lokr_alpha', config.network_alpha))
        lokr_dropout = float(getattr(config, 'lokr_dropout', config.network_dropout))
        lokr_rank_dropout = float(getattr(config, 'lokr_rank_dropout', 0.0))
        lokr_module_dropout = float(getattr(config, 'lokr_module_dropout', 0.0))
        lokr_factor = int(getattr(config, 'lokr_factor', -1))
        lokr_train_norm = bool(getattr(config, 'lokr_train_norm', False))
        target_patterns = [name if ('*' in name or '?' in name) else f'*{name}' for name in target_modules]

        LycorisNetwork.apply_preset(
            {
                'enable_conv': True,
                'target_module': [],
                'target_name': target_patterns,
                'use_fnmatch': True,
                'exclude_name': [],
            }
        )
        network = LycorisNetwork(
            model,
            multiplier=1.0,
            lora_dim=lokr_rank,
            conv_lora_dim=lokr_rank,
            alpha=lokr_alpha,
            conv_alpha=lokr_alpha,
            dropout=lokr_dropout,
            rank_dropout=lokr_rank_dropout,
            module_dropout=lokr_module_dropout,
            network_module='lokr',
            train_norm=lokr_train_norm,
            factor=lokr_factor,
        )
        network.apply_to()
        device = next(model.parameters()).device
        network.to(device)
        model._adapter_type = 'lyco_lokr'
        model._lycoris_network = network
        model._adapter_rank = lokr_rank
        model._adapter_alpha = lokr_alpha
        return model

    if adapter_type == 'vera':
        peft_model = get_peft_model(
            model,
            VeraConfig(
                r=int(config.network_dim),
                target_modules=target_modules,
                vera_dropout=float(config.network_dropout),
                bias='none',
                projection_prng_key=int(getattr(config, 'vera_projection_prng_key', 0)),
                save_projection=bool(getattr(config, 'vera_save_projection', True)),
                d_initial=float(getattr(config, 'vera_d_initial', 0.1)),
            ),
        )
        peft_model._adapter_type = 'vera'
        _register_newbie_lisa_modules(peft_model)
        peft_model._adapter_rank = int(config.network_dim)
        peft_model._adapter_alpha = int(config.network_alpha)
        return peft_model

    lora_config = LoraConfig(
        r=int(config.network_dim),
        lora_alpha=int(config.network_alpha),
        target_modules=target_modules,
        lora_dropout=float(config.network_dropout),
        bias='none',
    )
    peft_model = get_peft_model(model, lora_config)
    if adapter_type == 'lora_fa':
        _configure_newbie_lora_fa_training(peft_model)
        peft_model._adapter_type = 'lora_fa'
    else:
        peft_model._adapter_type = 'lora'
    _register_newbie_lisa_modules(peft_model)
    peft_model._adapter_rank = int(config.network_dim)
    peft_model._adapter_alpha = int(config.network_alpha)
    return peft_model


def iter_newbie_trainable_params(model) -> Iterable[torch.nn.Parameter]:
    adapter_type = getattr(model, '_adapter_type', 'lora')
    if adapter_type == 'lyco_lokr' and hasattr(model, '_lycoris_network'):
        yield from (p for p in model.parameters() if p.requires_grad)
        return
    yield from (p for p in model.parameters() if p.requires_grad)


def count_trainable_parameters(model) -> tuple[int, int]:
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    return trainable, total

