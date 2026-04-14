from __future__ import annotations

from typing import Iterable

import torch
from peft import LoraConfig, get_peft_model

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


def attach_newbie_adapter(model, config: NewbieRuntimeConfig):
    adapter_type = str(config.adapter_type or 'lora').strip().lower()
    target_modules = _normalize_target_modules(config)

    if adapter_type in {'lokr', 'lyco_lokr', 'lycoris_lokr', 'lyco-lokr'}:
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

    lora_config = LoraConfig(
        r=int(config.network_dim),
        lora_alpha=int(config.network_alpha),
        target_modules=target_modules,
        lora_dropout=float(config.network_dropout),
        bias='none',
    )
    peft_model = get_peft_model(model, lora_config)
    peft_model._adapter_type = 'lora'
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
