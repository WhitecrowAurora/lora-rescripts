from __future__ import annotations

import math
import random
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Iterator

import torch
from PIL import Image
from safetensors.torch import load_file
from torch.utils.data import Dataset

try:
    from safetensors import safe_open
except Exception:  # pragma: no cover
    safe_open = None


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
DEFAULT_ASPECT_RATIOS = ((1, 1), (3, 4), (4, 3), (2, 3), (3, 2), (9, 16), (16, 9))
REPEAT_DIR_PATTERN = re.compile(r"^(?P<count>\d+)_")


def estimate_caption_token_length(caption_text: str) -> int:
    text = str(caption_text or "").strip()
    if not text:
        return 0

    normalized = re.sub(r"[\r\n\t]+", " ", text)
    normalized = normalized.replace(",", " ")
    tokens = [item for item in normalized.split(" ") if item]
    return len(tokens)


def parse_repeat_count(image_path: Path, train_data_dir: Path) -> int:
    try:
        relative_parent = image_path.parent.relative_to(train_data_dir)
    except ValueError:
        relative_parent = image_path.parent

    dir_name = relative_parent.parts[0] if relative_parent.parts else image_path.parent.name
    match = REPEAT_DIR_PATTERN.match(dir_name)
    if match is None:
        return 1
    return max(1, int(match.group('count')))


def read_cached_caption_length(cache_path: Path) -> int | None:
    if safe_open is None or not cache_path.exists():
        return None

    try:
        with safe_open(str(cache_path), framework="pt", device="cpu") as handle:
            if "cap_mask" not in handle.keys():
                return None
            cap_mask = handle.get_tensor("cap_mask")
            return int(cap_mask.sum().item())
    except Exception:
        return None


def read_image_size(image_path: Path) -> tuple[int, int]:
    with Image.open(image_path) as image:
        return int(image.width), int(image.height)


def build_fixed_resolution_buckets(
    *,
    max_resolution: int,
    min_bucket_reso: int,
    max_bucket_reso: int,
    bucket_reso_step: int,
) -> list[tuple[int, int]]:
    max_area = max_resolution * max_resolution
    buckets: set[tuple[int, int]] = set()

    def quantize(value: int) -> int:
        clamped = max(min_bucket_reso, min(max_bucket_reso, value))
        return max(bucket_reso_step, (clamped // bucket_reso_step) * bucket_reso_step)

    for aspect_width, aspect_height in DEFAULT_ASPECT_RATIOS:
        scale = math.sqrt(max_area / float(aspect_width * aspect_height))
        width = quantize(int(scale * aspect_width))
        height = quantize(int(scale * aspect_height))

        while width * height > max_area and (width > min_bucket_reso or height > min_bucket_reso):
            if width >= height and width > min_bucket_reso:
                width = max(min_bucket_reso, width - bucket_reso_step)
            elif height > min_bucket_reso:
                height = max(min_bucket_reso, height - bucket_reso_step)
            else:
                break

        buckets.add((width, height))

    return sorted(buckets, key=lambda item: item[0] / item[1])


def assign_resolution_bucket(
    image_size: tuple[int, int],
    bucket_resolutions: Iterable[tuple[int, int]],
) -> tuple[int, int]:
    width, height = image_size
    aspect_ratio = float(width) / float(max(1, height))
    return min(bucket_resolutions, key=lambda item: abs((item[0] / item[1]) - aspect_ratio))


def caption_bucket_key(token_length: int, bucket_size: int) -> int:
    if token_length <= 0:
        return 0
    return int(math.ceil(token_length / float(bucket_size)) * bucket_size)


@dataclass(slots=True)
class NewbieSampleRecord:
    image_path: Path
    caption_path: Path | None
    latents_cache_path: Path
    text_cache_path: Path
    image_size: tuple[int, int]
    resolution_bucket: tuple[int, int]
    caption_length: int
    caption_length_bucket: int
    repeats: int
    has_latents_cache: bool
    has_text_cache: bool


@dataclass(slots=True)
class NewbieDatasetReport:
    train_data_dir: Path
    total_images: int
    total_repeated_images: int
    missing_caption_count: int
    complete_cache_count: int
    missing_cache_count: int
    max_caption_length: int
    average_caption_length: float
    long_caption_count: int
    cache_complete: bool
    records: list[NewbieSampleRecord]
    resolution_buckets: dict[str, int]
    caption_buckets: dict[str, int]


def discover_training_records(
    *,
    train_data_dir: Path,
    caption_extension: str,
    max_resolution: int,
    min_bucket_reso: int,
    max_bucket_reso: int,
    bucket_reso_step: int,
    caption_length_bucket_size: int,
) -> list[NewbieSampleRecord]:
    image_paths = sorted(
        path
        for path in train_data_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )

    bucket_resolutions = build_fixed_resolution_buckets(
        max_resolution=max_resolution,
        min_bucket_reso=min_bucket_reso,
        max_bucket_reso=max_bucket_reso,
        bucket_reso_step=bucket_reso_step,
    )

    records: list[NewbieSampleRecord] = []
    for image_path in image_paths:
        caption_path = image_path.with_suffix(caption_extension)
        if not caption_path.exists():
            caption_path = None

        latents_cache_path = Path(f"{image_path}.safetensors")
        text_cache_path = Path(f"{image_path.with_suffix('')}.txt.safetensors")
        image_size = read_image_size(image_path)
        resolution_bucket = assign_resolution_bucket(image_size, bucket_resolutions)
        repeats = parse_repeat_count(image_path, train_data_dir)

        cached_caption_length = read_cached_caption_length(text_cache_path)
        if cached_caption_length is None:
            caption_text = ""
            if caption_path is not None:
                try:
                    caption_text = caption_path.read_text(encoding="utf-8")
                except UnicodeDecodeError:
                    caption_text = caption_path.read_text(encoding="latin-1")
            caption_length = estimate_caption_token_length(caption_text)
        else:
            caption_length = cached_caption_length

        records.append(
            NewbieSampleRecord(
                image_path=image_path,
                caption_path=caption_path,
                latents_cache_path=latents_cache_path,
                text_cache_path=text_cache_path,
                image_size=image_size,
                resolution_bucket=resolution_bucket,
                caption_length=caption_length,
                caption_length_bucket=caption_bucket_key(caption_length, caption_length_bucket_size),
                repeats=repeats,
                has_latents_cache=latents_cache_path.exists(),
                has_text_cache=text_cache_path.exists(),
            )
        )

    return records


def build_newbie_dataset_report(
    *,
    train_data_dir: Path,
    caption_extension: str,
    max_resolution: int,
    min_bucket_reso: int,
    max_bucket_reso: int,
    bucket_reso_step: int,
    caption_length_bucket_size: int,
    long_caption_threshold: int,
) -> NewbieDatasetReport:
    records = discover_training_records(
        train_data_dir=train_data_dir,
        caption_extension=caption_extension,
        max_resolution=max_resolution,
        min_bucket_reso=min_bucket_reso,
        max_bucket_reso=max_bucket_reso,
        bucket_reso_step=bucket_reso_step,
        caption_length_bucket_size=caption_length_bucket_size,
    )

    total_images = len(records)
    total_repeated_images = sum(item.repeats for item in records)
    missing_caption_count = sum(1 for item in records if item.caption_path is None)
    complete_cache_count = sum(1 for item in records if item.has_latents_cache and item.has_text_cache)
    missing_cache_count = total_images - complete_cache_count
    max_caption_length = max((item.caption_length for item in records), default=0)
    average_caption_length = (
        float(sum(item.caption_length for item in records)) / float(total_images)
        if total_images > 0
        else 0.0
    )
    long_caption_count = sum(1 for item in records if item.caption_length > long_caption_threshold)
    cache_complete = total_images > 0 and complete_cache_count == total_images

    resolution_buckets: dict[str, int] = {}
    caption_buckets: dict[str, int] = {}
    for item in records:
        resolution_key = f"{item.resolution_bucket[0]}x{item.resolution_bucket[1]}"
        resolution_buckets[resolution_key] = resolution_buckets.get(resolution_key, 0) + item.repeats

        caption_key = str(item.caption_length_bucket)
        caption_buckets[caption_key] = caption_buckets.get(caption_key, 0) + item.repeats

    return NewbieDatasetReport(
        train_data_dir=train_data_dir,
        total_images=total_images,
        total_repeated_images=total_repeated_images,
        missing_caption_count=missing_caption_count,
        complete_cache_count=complete_cache_count,
        missing_cache_count=missing_cache_count,
        max_caption_length=max_caption_length,
        average_caption_length=average_caption_length,
        long_caption_count=long_caption_count,
        cache_complete=cache_complete,
        records=records,
        resolution_buckets=resolution_buckets,
        caption_buckets=caption_buckets,
    )


def filter_cache_ready_records(records: Iterable[NewbieSampleRecord]) -> list[NewbieSampleRecord]:
    return [record for record in records if record.has_latents_cache and record.has_text_cache]


class NewbieCachedDataset(Dataset):
    def __init__(self, records: list[NewbieSampleRecord]):
        self.records = list(records)

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, index: int) -> dict[str, object]:
        record = self.records[index]
        vae_data = load_file(str(record.latents_cache_path))
        text_data = load_file(str(record.text_cache_path))
        return {
            'latents': vae_data['latents'],
            'cap_feats': text_data['cap_feats'],
            'cap_mask': text_data['cap_mask'],
            'clip_text_pooled': text_data['clip_text_pooled'],
            'record_index': index,
            'image_path': record.image_path.as_posix(),
            'resolution_bucket': record.resolution_bucket,
            'caption_length_bucket': record.caption_length_bucket,
            'cached': True,
        }


class CaptionLengthBucketBatchSampler:
    def __init__(
        self,
        records: list[NewbieSampleRecord],
        *,
        batch_size: int,
        shuffle: bool = True,
        seed: int = 42,
    ) -> None:
        self.records = records
        self.batch_size = max(1, int(batch_size))
        self.shuffle = bool(shuffle)
        self.seed = int(seed)
        self.epoch = 0
        self._first_epoch_sorted = False

        self.bucket_to_indices: dict[tuple[tuple[int, int], int], list[int]] = {}
        for index, item in enumerate(records):
            key = (item.resolution_bucket, item.caption_length_bucket)
            self.bucket_to_indices.setdefault(key, [])
            for _ in range(max(1, item.repeats)):
                self.bucket_to_indices[key].append(index)

    def __iter__(self) -> Iterator[list[int]]:
        rng = random.Random(self.seed + self.epoch)
        bucket_batches: list[dict[str, object]] = []

        for key, indices in self.bucket_to_indices.items():
            resolution_bucket, caption_bucket = key
            local_indices = list(indices)
            if self.shuffle:
                rng.shuffle(local_indices)

            area = resolution_bucket[0] * resolution_bucket[1]
            for start_index in range(0, len(local_indices), self.batch_size):
                batch = local_indices[start_index:start_index + self.batch_size]
                bucket_batches.append(
                    {
                        'area': area,
                        'caption_bucket': caption_bucket,
                        'batch': batch,
                    }
                )

        if self.shuffle:
            if not self._first_epoch_sorted:
                bucket_batches.sort(
                    key=lambda item: (int(item['area']), int(item['caption_bucket'])),
                    reverse=True,
                )
                self._first_epoch_sorted = True
            else:
                rng.shuffle(bucket_batches)

        for item in bucket_batches:
            yield list(item['batch'])

    def __len__(self) -> int:
        return sum(math.ceil(len(indices) / float(self.batch_size)) for indices in self.bucket_to_indices.values())

    def set_epoch(self, epoch: int) -> None:
        self.epoch = int(epoch)


def newbie_cached_collate(batch: list[dict[str, object]]) -> dict[str, object]:
    max_cap_len = max(int(example['cap_feats'].shape[0]) for example in batch)

    cap_feats_list = []
    cap_mask_list = []
    for example in batch:
        cap_feat = example['cap_feats']
        cap_mask = example['cap_mask']
        current_len = int(cap_feat.shape[0])
        if current_len < max_cap_len:
            pad_len = max_cap_len - current_len
            cap_feat = torch.cat([cap_feat, torch.zeros(pad_len, cap_feat.shape[1], dtype=cap_feat.dtype)], dim=0)
            cap_mask = torch.cat([cap_mask, torch.zeros(pad_len, dtype=cap_mask.dtype)], dim=0)
        cap_feats_list.append(cap_feat)
        cap_mask_list.append(cap_mask)

    return {
        'latents': torch.stack([example['latents'] for example in batch]),
        'cap_feats': torch.stack(cap_feats_list),
        'cap_mask': torch.stack(cap_mask_list),
        'clip_text_pooled': torch.stack([example['clip_text_pooled'] for example in batch]),
        'record_indices': [int(example['record_index']) for example in batch],
        'image_paths': [str(example['image_path']) for example in batch],
        'cached': True,
    }
