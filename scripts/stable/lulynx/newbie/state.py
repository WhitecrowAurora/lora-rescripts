from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

import torch
from diffusers.optimization import get_scheduler
from peft import get_peft_model_state_dict, set_peft_model_state_dict

try:
    import bitsandbytes as bnb
except Exception:  # pragma: no cover
    bnb = None

from .config import NewbieRuntimeConfig


@dataclass(slots=True)
class NewbieOptimizerBundle:
    optimizer: torch.optim.Optimizer
    scheduler: object
    total_training_steps: int


def create_newbie_optimizer(model, config: NewbieRuntimeConfig):
    adapter_type = getattr(model, '_adapter_type', 'lora')
    learning_rate = float(config.learning_rate)
    weight_decay = float(config.weight_decay)

    if adapter_type == 'lyco_lokr' and hasattr(model, '_lycoris_network'):
        trainable_params = model._lycoris_network.prepare_optimizer_params(learning_rate)
    else:
        trainable_params = [param for param in model.parameters() if param.requires_grad]

    optimizer_type = str(config.optimizer_type or 'AdamW8bit').strip()
    adam_kwargs = {
        'lr': learning_rate,
        'betas': (0.9, 0.999),
        'eps': 1e-8,
        'weight_decay': weight_decay,
    }

    if optimizer_type == 'AdamW8bit' and bnb is not None:
        return bnb.optim.AdamW8bit(trainable_params, **adam_kwargs)
    return torch.optim.AdamW(trainable_params, **adam_kwargs)


def create_newbie_scheduler(optimizer, config: NewbieRuntimeConfig, steps_per_epoch: int) -> NewbieOptimizerBundle:
    scheduler_type = str(getattr(config, 'lr_scheduler', 'cosine') or 'cosine').strip().lower()
    warmup_steps = int(getattr(config, 'lr_warmup_steps', 0) or 0)
    if int(config.max_train_steps) > 0:
        total_training_steps = int(config.max_train_steps)
    else:
        total_training_steps = max(1, int(config.max_train_epochs) * int(steps_per_epoch))

    scheduler = get_scheduler(
        name=scheduler_type,
        optimizer=optimizer,
        num_warmup_steps=warmup_steps,
        num_training_steps=total_training_steps,
    )
    return NewbieOptimizerBundle(optimizer=optimizer, scheduler=scheduler, total_training_steps=total_training_steps)


def save_newbie_checkpoint(output_dir: str | Path, model, optimizer, scheduler, step: int) -> Path:
    checkpoint_dir = Path(output_dir) / 'checkpoints'
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    checkpoint_path = checkpoint_dir / f'checkpoint_{step}.pt'
    temp_checkpoint_path = checkpoint_dir / f'checkpoint_{step}.pt.tmp'
    adapter_type = getattr(model, '_adapter_type', 'lora')

    if adapter_type == 'lyco_lokr':
        lyco_net = getattr(model, '_lycoris_network', None)
        if lyco_net is None:
            raise RuntimeError('LyCORIS network not initialized')
        adapter_state = {key: value.detach().cpu() for key, value in lyco_net.state_dict().items()}
    else:
        adapter_state = {key: value.detach().cpu() for key, value in get_peft_model_state_dict(model).items()}

    payload = {
        'step': int(step),
        'adapter_type': adapter_type,
        'adapter_state_dict': adapter_state,
        'optimizer_state_dict': optimizer.state_dict(),
        'scheduler_state_dict': scheduler.state_dict(),
    }
    torch.save(payload, temp_checkpoint_path)
    os.replace(temp_checkpoint_path, checkpoint_path)
    return checkpoint_path


def _discover_checkpoint_files(path: Path) -> list[Path]:
    if path.is_file() and path.suffix.lower() == '.pt':
        return [path]

    candidate_dirs: list[Path] = []
    if path.is_dir():
        if path.name.lower() == 'checkpoints':
            candidate_dirs.append(path)
        else:
            candidate_dirs.append(path / 'checkpoints')
            candidate_dirs.append(path)

    checkpoints: list[Path] = []
    for directory in candidate_dirs:
        if not directory.exists() or not directory.is_dir():
            continue
        checkpoints.extend(file for file in directory.glob('checkpoint_*.pt') if file.is_file())

    return sorted(
        checkpoints,
        key=lambda item: int(item.stem.split('_')[1]),
        reverse=True,
    )


def load_newbie_checkpoint(output_dir: str | Path, model, optimizer, scheduler, resume_path: str | Path | None = None) -> int:
    checkpoints: list[Path]
    if resume_path is not None:
        resume_path = Path(resume_path)
        if not resume_path.exists():
            raise FileNotFoundError(f'Newbie resume checkpoint path not found: {resume_path}')
        checkpoints = _discover_checkpoint_files(resume_path)
    else:
        checkpoints = _discover_checkpoint_files(Path(output_dir))

    if not checkpoints:
        return 0

    explicit_file_resume = False
    if resume_path is not None:
        explicit_file_resume = Path(resume_path).is_file()

    load_errors: list[tuple[Path, Exception]] = []
    for checkpoint_path in checkpoints:
        try:
            checkpoint = torch.load(checkpoint_path, map_location='cpu')
            adapter_type = checkpoint.get('adapter_type', getattr(model, '_adapter_type', 'lora'))
            adapter_state = checkpoint.get('adapter_state_dict')
            if adapter_state is None:
                raise RuntimeError('missing adapter_state_dict')

            if adapter_type == 'lyco_lokr':
                lyco_net = getattr(model, '_lycoris_network', None)
                if lyco_net is None:
                    raise RuntimeError('LyCORIS network not initialized')
                lyco_net.load_state_dict(adapter_state)
            else:
                set_peft_model_state_dict(model, adapter_state)

            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            scheduler.load_state_dict(checkpoint['scheduler_state_dict'])

            if load_errors:
                skipped_paths = ', '.join(str(path) for path, _ in load_errors)
                print(
                    f'[newbie-train] skipped invalid checkpoint(s) before resume: {skipped_paths}. '
                    f'Resuming from {checkpoint_path}.'
                )
            return int(checkpoint.get('step', 0))
        except (RuntimeError, EOFError, OSError, KeyError, ValueError) as exc:
            load_errors.append((checkpoint_path, exc))
            continue

    if explicit_file_resume and load_errors:
        failed_path, failed_exc = load_errors[0]
        raise RuntimeError(f'Newbie resume checkpoint is invalid or corrupted: {failed_path} ({failed_exc})') from failed_exc

    if load_errors:
        skipped_paths = ', '.join(str(path) for path, _ in load_errors)
        print(f'[newbie-train] skipped invalid checkpoint(s) and started from scratch: {skipped_paths}.')
    return 0


def save_newbie_adapter(output_dir: str | Path, output_name: str, model, step: int | None = None) -> Path:
    output_root = Path(output_dir)
    output_root.mkdir(parents=True, exist_ok=True)
    save_dir = output_root / (f'{output_name}_step_{step}' if step else output_name)
    save_dir.mkdir(parents=True, exist_ok=True)

    adapter_type = getattr(model, '_adapter_type', 'lora')
    if adapter_type == 'lyco_lokr':
        lyco_net = getattr(model, '_lycoris_network', None)
        if lyco_net is None:
            raise RuntimeError('LyCORIS network not initialized')
        weights_path = save_dir / 'adapter_model.safetensors'
        metadata = {
            'adapter_type': 'lyco_lokr',
            'lora_rank': str(getattr(model, '_adapter_rank', '')),
            'lora_alpha': str(getattr(model, '_adapter_alpha', '')),
        }
        lyco_net.save_weights(str(weights_path), dtype=None, metadata=metadata)
        config_path = save_dir / 'adapter_config.json'
        config_path.write_text(
            json.dumps(
                {
                    'adapter_type': 'lyco_lokr',
                    'peft_type': 'LYCORIS',
                    'lycoris_type': 'lokr',
                    'r': getattr(model, '_adapter_rank', None),
                    'lora_alpha': getattr(model, '_adapter_alpha', None),
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding='utf-8',
        )
        return weights_path

    model.save_pretrained(str(save_dir), safe_serialization=True)
    return save_dir