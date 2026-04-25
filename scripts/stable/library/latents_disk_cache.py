import json
import os
import time
from dataclasses import dataclass
from typing import Any, Optional

import safetensors


LATENTS_DISK_CACHE_FORMATS = {"npz", "safetensors", "auto", "hdf5"}


@dataclass
class LatentsDiskCacheRef:
    format: str
    path: str
    entry_key: Optional[str] = None


def normalize_latents_disk_cache_format(value: Any, *, default_value: str = "safetensors") -> str:
    raw_value = str(value or "").strip().lower()
    if not raw_value:
        return default_value
    if raw_value not in LATENTS_DISK_CACHE_FORMATS:
        return default_value
    if raw_value == "auto":
        return default_value
    return raw_value


def resolve_latents_cache_root(absolute_path: str, dataset_root: Optional[str] = None) -> str:
    candidate_root = str(dataset_root or "").strip()
    if candidate_root:
        return os.path.abspath(candidate_root)
    return os.path.abspath(os.path.dirname(absolute_path))


def build_latents_cache_image_key(
    absolute_path: str,
    cache_root: str,
    *,
    image_size: Optional[tuple[int, int]] = None,
    bucket_reso: Optional[tuple[int, int]] = None,
    flip_aug: Optional[bool] = None,
    alpha_mask: Optional[bool] = None,
) -> str:
    absolute_path = os.path.abspath(absolute_path)
    cache_root = os.path.abspath(cache_root)
    try:
        relative_path = os.path.relpath(absolute_path, cache_root)
    except ValueError:
        relative_path = absolute_path
    normalized_path = relative_path.replace("\\", "/")

    variant_parts = []
    if image_size is not None and len(image_size) >= 2:
        variant_parts.append(f"orig={int(image_size[0])}x{int(image_size[1])}")
    if bucket_reso is not None and len(bucket_reso) >= 2:
        variant_parts.append(f"bucket={int(bucket_reso[0])}x{int(bucket_reso[1])}")
    if flip_aug is not None:
        variant_parts.append(f"flip={1 if flip_aug else 0}")
    if alpha_mask is not None:
        variant_parts.append(f"alpha={1 if alpha_mask else 0}")

    if not variant_parts:
        return normalized_path
    return normalized_path + "#" + "#".join(variant_parts)


def build_safetensors_cache_dir(cache_root: str, namespace: str) -> str:
    return os.path.join(cache_root, ".mikazuki-cache", "latents", namespace)


def build_safetensors_shard_stem(
    bucket_reso: tuple[int, int],
    *,
    flip_aug: bool,
    alpha_mask: bool,
    unique_suffix: Optional[str] = None,
) -> str:
    suffix = unique_suffix or f"{time.time_ns()}_{os.getpid()}"
    return (
        f"bucket_{int(bucket_reso[0])}x{int(bucket_reso[1])}"
        f"__flip{1 if flip_aug else 0}"
        f"__alpha{1 if alpha_mask else 0}"
        f"__part_{suffix}"
    )


def save_safetensors_shard_manifest(manifest_path: str, payload: dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def load_safetensors_shard_manifest(manifest_path: str) -> dict[str, Any]:
    with open(manifest_path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def build_safetensors_sidecar_path(shard_path: str) -> str:
    return os.path.splitext(shard_path)[0] + ".json"


def safe_open_torch_cpu(path: str):
    return safetensors.safe_open(path, framework="pt", device="cpu")
