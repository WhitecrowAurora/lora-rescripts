from __future__ import annotations

from contextlib import nullcontext
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import torch
from PIL import Image
from safetensors.torch import load_file, save_file
from torchvision import transforms
from torchvision.transforms import InterpolationMode

from .bridge import (
    load_newbie_clip_model_and_tokenizer,
    load_newbie_text_encoder_and_tokenizer,
    load_newbie_vae,
    resolve_dtype,
)
from .config import NewbieRuntimeConfig
from .dataset import NewbieSampleRecord
from .memory import release_newbie_runtime_modules


@dataclass(slots=True)
class NewbieCachePhaseSummary:
    total_records: int
    generated_latent_cache: int
    generated_text_cache: int
    skipped_complete_cache: int
    failed_records: int
    failure_messages: list[str]


@dataclass(slots=True)
class NewbiePartialTextEncoding:
    cap_feats: torch.Tensor
    cap_mask: torch.Tensor


def _resize_image_to_bucket(image: Image.Image, target_width: int, target_height: int) -> torch.Tensor:
    bucket_ratio = target_width / target_height
    orig_ratio = image.size[0] / image.size[1]

    if orig_ratio > bucket_ratio:
        resize_height = target_height
        resize_width = int(resize_height * orig_ratio)
    else:
        resize_width = target_width
        resize_height = int(resize_width / orig_ratio)

    transform = transforms.Compose([
        transforms.Resize((resize_height, resize_width), interpolation=InterpolationMode.LANCZOS),
        transforms.CenterCrop((target_height, target_width)),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5]),
    ])
    return transform(image)


def _autocast_context(device: torch.device, dtype: torch.dtype):
    if device.type == 'cuda':
        return torch.autocast(device_type='cuda', dtype=dtype)
    return nullcontext()


def _read_caption_text(record: NewbieSampleRecord) -> str:
    if record.caption_path is None or not record.caption_path.exists():
        return ''
    try:
        return record.caption_path.read_text(encoding='utf-8').strip()
    except UnicodeDecodeError:
        return record.caption_path.read_text(encoding='latin-1').strip()


def _gemma_tmp_cache_path(record: NewbieSampleRecord) -> Path:
    return record.text_cache_path.with_name(record.text_cache_path.name + '.gemma_tmp.safetensors')


@torch.no_grad()
def encode_newbie_latent_cache_record(
    *,
    record: NewbieSampleRecord,
    vae,
    device: torch.device,
) -> bool:
    target_width, target_height = record.resolution_bucket
    image = Image.open(record.image_path).convert('RGB')
    pixel_values = _resize_image_to_bucket(image, target_width, target_height).unsqueeze(0).to(device)
    latents = vae.encode(pixel_values).latent_dist.mode()
    scaling_factor = getattr(vae.config, 'scaling_factor', 0.13025)
    latents = (latents * scaling_factor).squeeze(0).cpu()
    save_file(
        {
            'latents': latents,
            'width': torch.tensor(target_width),
            'height': torch.tensor(target_height),
        },
        str(record.latents_cache_path),
    )
    return True


@torch.no_grad()
def encode_newbie_gemma_text_record(
    *,
    record: NewbieSampleRecord,
    config: NewbieRuntimeConfig,
    text_encoder,
    tokenizer,
    device: torch.device,
) -> bool:
    caption = _read_caption_text(record)
    gemma_prefix = str(getattr(config, 'newbie_gemma_prompt_prefix', '') or '').strip()
    gemma_text = f'{gemma_prefix}{caption}' if gemma_prefix else caption
    target_dtype = resolve_dtype(config.mixed_precision)

    with _autocast_context(device, target_dtype):
        gemma_inputs = tokenizer(
            [gemma_text],
            padding=True,
            pad_to_multiple_of=8,
            truncation=True,
            max_length=config.newbie_gemma_max_token_length,
            return_tensors='pt',
        ).to(device)
        gemma_outputs = text_encoder(**gemma_inputs, output_hidden_states=True)
        cap_feats = gemma_outputs.hidden_states[-2].squeeze(0).to(dtype=target_dtype).cpu()
        cap_mask = gemma_inputs.attention_mask.squeeze(0).cpu()

    save_file(
        {
            'cap_feats': cap_feats,
            'cap_mask': cap_mask,
        },
        str(_gemma_tmp_cache_path(record)),
    )
    return True


@torch.no_grad()
def encode_newbie_clip_text_record(
    *,
    record: NewbieSampleRecord,
    config: NewbieRuntimeConfig,
    clip_model,
    clip_tokenizer,
    device: torch.device,
) -> bool:
    gemma_tmp_path = _gemma_tmp_cache_path(record)
    partial = load_file(str(gemma_tmp_path))
    caption = _read_caption_text(record)
    target_dtype = resolve_dtype(config.mixed_precision)

    with _autocast_context(device, target_dtype):
        clip_inputs = clip_tokenizer(
            [caption],
            padding=True,
            truncation=True,
            max_length=config.newbie_clip_max_token_length,
            return_tensors='pt',
        ).to(device)
        clip_text_pooled = clip_model.get_text_features(**clip_inputs).squeeze(0).to(dtype=target_dtype).cpu()

    save_file(
        {
            'cap_feats': partial['cap_feats'],
            'cap_mask': partial['cap_mask'],
            'clip_text_pooled': clip_text_pooled,
        },
        str(record.text_cache_path),
    )
    try:
        gemma_tmp_path.unlink(missing_ok=True)
    except Exception:
        pass
    return True


def _record_failure(failure_keys: set[str], failure_messages: list[str], record: NewbieSampleRecord, exc: Exception) -> None:
    key = record.image_path.as_posix()
    failure_keys.add(key)
    failure_messages.append(f'{record.image_path}: {exc}')


def cache_missing_newbie_records(
    *,
    config: NewbieRuntimeConfig,
    records: Iterable[NewbieSampleRecord],
    device: str | torch.device = 'cuda',
) -> NewbieCachePhaseSummary:
    target_device = torch.device(device)
    selected_records = list(records)
    failure_messages: list[str] = []
    failure_keys: set[str] = set()
    generated_latent_cache = 0
    generated_text_cache = 0
    skipped_complete_cache = 0

    records_need_latents: list[NewbieSampleRecord] = []
    records_need_text: list[NewbieSampleRecord] = []
    for record in selected_records:
        if record.has_latents_cache and record.has_text_cache and not config.newbie_rebuild_cache:
            skipped_complete_cache += 1
            continue
        if not record.has_latents_cache or config.newbie_rebuild_cache:
            records_need_latents.append(record)
        if not record.has_text_cache or config.newbie_rebuild_cache:
            records_need_text.append(record)

    if records_need_latents:
        vae = load_newbie_vae(config.pretrained_model_name_or_path, trust_remote_code=config.trust_remote_code).to(target_device)
        vae.eval()
        vae.requires_grad_(False)
        for record in records_need_latents:
            try:
                generated_latent_cache += int(encode_newbie_latent_cache_record(record=record, vae=vae, device=target_device))
            except Exception as exc:  # pragma: no cover - real runtime path
                _record_failure(failure_keys, failure_messages, record, exc)
        release_newbie_runtime_modules(vae, device=target_device)

    text_candidates = [record for record in records_need_text if record.image_path.as_posix() not in failure_keys]
    if text_candidates:
        text_encoder, tokenizer = load_newbie_text_encoder_and_tokenizer(
            config.pretrained_model_name_or_path,
            mixed_precision=config.mixed_precision,
            trust_remote_code=config.trust_remote_code,
        )
        text_encoder = text_encoder.to(target_device)
        text_encoder.eval()
        text_encoder.requires_grad_(False)
        for record in text_candidates:
            try:
                encode_newbie_gemma_text_record(
                    record=record,
                    config=config,
                    text_encoder=text_encoder,
                    tokenizer=tokenizer,
                    device=target_device,
                )
            except Exception as exc:  # pragma: no cover - real runtime path
                _record_failure(failure_keys, failure_messages, record, exc)
        release_newbie_runtime_modules(text_encoder, device=target_device)
        tokenizer = None

        clip_candidates = [record for record in text_candidates if record.image_path.as_posix() not in failure_keys]
        if clip_candidates:
            clip_model, clip_tokenizer = load_newbie_clip_model_and_tokenizer(
                config.pretrained_model_name_or_path,
                mixed_precision=config.mixed_precision,
            )
            clip_model = clip_model.to(target_device)
            clip_model.eval()
            clip_model.requires_grad_(False)
            for record in clip_candidates:
                try:
                    generated_text_cache += int(
                        encode_newbie_clip_text_record(
                            record=record,
                            config=config,
                            clip_model=clip_model,
                            clip_tokenizer=clip_tokenizer,
                            device=target_device,
                        )
                    )
                except Exception as exc:  # pragma: no cover - real runtime path
                    _record_failure(failure_keys, failure_messages, record, exc)
                finally:
                    try:
                        _gemma_tmp_cache_path(record).unlink(missing_ok=True)
                    except Exception:
                        pass
            release_newbie_runtime_modules(clip_model, device=target_device)
            clip_tokenizer = None

    return NewbieCachePhaseSummary(
        total_records=len(selected_records),
        generated_latent_cache=generated_latent_cache,
        generated_text_cache=generated_text_cache,
        skipped_complete_cache=skipped_complete_cache,
        failed_records=len(failure_keys),
        failure_messages=failure_messages,
    )
