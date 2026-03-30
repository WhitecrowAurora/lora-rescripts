from __future__ import annotations

from pathlib import Path
from typing import Mapping

from PIL import Image, UnidentifiedImageError

from mikazuki.launch_utils import base_dir_path
from mikazuki.log import log
from mikazuki.utils.resume_guard import resolve_local_path
from scripts.stable.lulynx.image_preprocessor import (
    SUPPORTED_IMAGE_EXTENSIONS,
    collect_images,
    run_image_preprocessor,
)


IMAGE_PREVIEW_DEFAULT_LIMIT = 8
IMAGE_PREVIEW_MAX_LIMIT = 24


def resolve_image_resize_path(raw_path: str) -> Path:
    cleaned = str(raw_path or "").strip()
    if not cleaned:
        raise ValueError("Path is empty")
    return resolve_local_path(cleaned, base_dir_path())


def resolve_image_resize_file(raw_path: str) -> Path:
    path = resolve_image_resize_path(raw_path)
    if not path.exists():
        raise FileNotFoundError(path)
    if not path.is_file():
        raise ValueError(f"Path is not a file: {path}")
    if path.suffix.lower() not in SUPPORTED_IMAGE_EXTENSIONS:
        raise ValueError(f"Unsupported image file: {path.name}")
    return path


def build_image_resize_preview_manifest(raw_input_dir: str, recursive: bool = False, limit: int = IMAGE_PREVIEW_DEFAULT_LIMIT) -> dict[str, object]:
    input_dir = resolve_image_resize_path(raw_input_dir)
    if not input_dir.exists():
        raise ValueError(f"Input folder does not exist: {input_dir}")
    if not input_dir.is_dir():
        raise ValueError(f"Input path is not a folder: {input_dir}")

    safe_limit = max(1, min(int(limit or IMAGE_PREVIEW_DEFAULT_LIMIT), IMAGE_PREVIEW_MAX_LIMIT))
    images = collect_images(input_dir, recursive=recursive)
    items: list[dict[str, object]] = []
    skipped = 0

    for image_path in images:
        if len(items) >= safe_limit:
            break
        try:
            with Image.open(image_path) as image:
                width, height = image.size
        except (FileNotFoundError, OSError, UnidentifiedImageError):
            skipped += 1
            continue

        try:
            relative_path = image_path.relative_to(input_dir)
        except ValueError:
            relative_path = Path(image_path.name)

        items.append(
            {
                "path": str(image_path),
                "name": image_path.name,
                "relative_path": str(relative_path).replace("\\", "/"),
                "width": width,
                "height": height,
                "aspect_ratio": round(width / height, 6) if height else 1,
            }
        )

    return {
        "input_dir": str(input_dir),
        "recursive": bool(recursive),
        "total_count": len(images),
        "limit": safe_limit,
        "preview_count": len(items),
        "skipped_count": skipped,
        "items": items,
        "samples": items,
    }


def run_image_resize_job(raw_config: Mapping[str, object]) -> dict[str, object]:
    payload = dict(raw_config)
    input_dir = resolve_image_resize_path(str(payload.get("input_dir", "") or ""))

    output_dir_raw = str(payload.get("output_dir", "") or "").strip()
    output_dir: Path | None = resolve_image_resize_path(output_dir_raw) if output_dir_raw else None

    payload["input_dir"] = str(input_dir)
    payload["output_dir"] = str(output_dir) if output_dir is not None else ""
    payload["log_callback"] = log.info

    log.info(
        "Starting lulynx image preprocessor: "
        f"input={input_dir} output={output_dir or '[in-place]'} "
        f"format={payload.get('format', 'ORIGINAL')} resize={payload.get('enable_resize', True)} "
        f"mode={payload.get('resize_mode', 'fit')} recursive={payload.get('recursive', False)}"
    )
    log.info(
        "开始执行 lulynx 图像预处理："
        f"输入目录={input_dir}，输出目录={output_dir or '原地处理'}，"
        f"输出格式={payload.get('format', 'ORIGINAL')}，"
        f"启用缩放={payload.get('enable_resize', True)}，"
        f"模式={payload.get('resize_mode', 'fit')}，"
        f"递归处理={payload.get('recursive', False)}"
    )

    try:
        summary = run_image_preprocessor(payload)
    except Exception:
        log.exception("lulynx image preprocessor failed")
        raise

    log.info(f"lulynx image preprocessor finished: {summary}")
    log.info(f"lulynx 图像预处理完成：{summary}")
    return summary
