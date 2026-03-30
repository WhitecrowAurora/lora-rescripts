from __future__ import annotations

import os
import re
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, Mapping

from PIL import Image, ImageColor

DEFAULT_RESOLUTIONS: list[tuple[int, int]] = [
    (768, 1344),
    (832, 1216),
    (896, 1152),
    (1024, 1024),
    (1152, 896),
    (1216, 832),
    (1344, 768),
]

SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
SUPPORTED_METADATA_EXTENSIONS = {".txt", ".caption", ".json", ".yaml", ".yml"}
RESOLUTION_TOKEN_PATTERN = re.compile(r"(\d+)\s*[xX×,]\s*(\d+)")
RESAMPLING_LANCZOS = Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS


@dataclass(slots=True)
class ImagePreprocessorConfig:
    input_dir: Path
    output_dir: Path | None = None
    resolutions: list[tuple[int, int]] | None = None
    quality: int = 95
    target_format: str = "ORIGINAL"
    enable_resize: bool = True
    resize_mode: str = "fit"
    exact_size: bool = False
    crop_anchor_x: float = 0.5
    crop_anchor_y: float = 0.5
    pad_color: str = "#ffffff"
    recursive: bool = False
    rename: bool = False
    delete_original: bool = False
    sync_metadata: bool = True
    log_callback: Callable[[str], None] | None = None


def parse_resolution_list(raw_value: str | None, fallback: Iterable[tuple[int, int]] | None = None) -> list[tuple[int, int]]:
    raw_text = str(raw_value or "").replace("\r", "\n").replace(";", "\n").strip()
    result: list[tuple[int, int]] = []

    if raw_text:
        matches = list(RESOLUTION_TOKEN_PATTERN.finditer(raw_text))
        if not matches:
            raise ValueError(f"Invalid resolution list: {raw_text}")

        for match in matches:
            width = int(match.group(1))
            height = int(match.group(2))
            if width <= 0 or height <= 0:
                raise ValueError(f"Resolution must be positive: {match.group(0)}")
            result.append((width, height))

    if result:
        return list(dict.fromkeys(result))

    return list(fallback or DEFAULT_RESOLUTIONS)


def collect_images(directory: Path, recursive: bool = False) -> list[Path]:
    iterator = directory.rglob("*") if recursive else directory.iterdir()
    return sorted(
        path
        for path in iterator
        if path.is_file() and path.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS
    )


def find_closest_resolution(image_ratio: float, resolutions: Iterable[tuple[int, int]]) -> tuple[int, int]:
    candidates = list(resolutions)
    if not candidates:
        return 1024, 1024
    return min(candidates, key=lambda item: abs(image_ratio - (item[0] / item[1])))


def run_image_preprocessor(raw_config: Mapping[str, object] | ImagePreprocessorConfig) -> dict[str, object]:
    config = _coerce_config(raw_config)

    if not config.input_dir.exists():
        raise ValueError(f"Input directory does not exist: {config.input_dir}")
    if not config.input_dir.is_dir():
        raise ValueError(f"Input path is not a directory: {config.input_dir}")

    images = collect_images(config.input_dir, recursive=config.recursive)
    if not images:
        _log(config, f"[Image Preprocessor] no images found under {config.input_dir}")
        return {
            "processed": 0,
            "skipped": 0,
            "failed": 0,
            "metadata_synced": 0,
            "deleted_originals": 0,
        }

    if config.output_dir is not None:
        config.output_dir.mkdir(parents=True, exist_ok=True)

    summary = {
        "processed": 0,
        "skipped": 0,
        "failed": 0,
        "metadata_synced": 0,
        "deleted_originals": 0,
    }

    _log(
        config,
        (
            f"[Image Preprocessor] start input={config.input_dir} images={len(images)} "
            f"format={config.target_format} resize={config.enable_resize} exact={config.exact_size} "
            f"mode={config.resize_mode} anchor=({config.crop_anchor_x:.3f},{config.crop_anchor_y:.3f}) "
            f"pad_color={config.pad_color} recursive={config.recursive} rename={config.rename} "
            f"delete_original={config.delete_original} sync_metadata={config.sync_metadata}"
        ),
    )

    for index, image_path in enumerate(images, start=1):
        try:
            result = process_single_image(image_path, config)
            summary["processed"] += int(result["status"] == "success")
            summary["skipped"] += int(result["status"] == "skip")
            summary["failed"] += int(result["status"] == "fail")
            summary["metadata_synced"] += int(result.get("metadata_synced", 0))
            summary["deleted_originals"] += int(result.get("deleted_original", False))
            _log(config, f"[Image Preprocessor] [{index}/{len(images)}] {result['message']}")
        except Exception as exc:
            summary["failed"] += 1
            _log(config, f"[Image Preprocessor] [{index}/{len(images)}] failed {image_path.name}: {exc}")

    _log(config, f"[Image Preprocessor] finished summary={summary}")
    return summary


def process_single_image(image_path: Path, config: ImagePreprocessorConfig) -> dict[str, object]:
    save_format, output_ext = _normalize_output_format(config.target_format, image_path)
    resize_mode = _normalize_resize_mode(config.resize_mode, config.exact_size)

    with Image.open(image_path) as image:
        prepared_image = _prepare_image_mode(image, save_format)
        original_width, original_height = prepared_image.size
        final_image = prepared_image

        if config.enable_resize:
            target_resolution = find_closest_resolution(
                original_width / original_height,
                config.resolutions or DEFAULT_RESOLUTIONS,
            )
            if resize_mode == "crop":
                final_image = _resize_and_crop_with_anchor(
                    prepared_image,
                    target_resolution,
                    anchor_x=config.crop_anchor_x,
                    anchor_y=config.crop_anchor_y,
                )
            elif resize_mode == "pad":
                final_image = _resize_and_pad(
                    prepared_image,
                    target_resolution,
                    anchor_x=config.crop_anchor_x,
                    anchor_y=config.crop_anchor_y,
                    pad_color=config.pad_color,
                )
            else:
                final_image = _resize_keep_ratio(prepared_image, target_resolution)

        final_width, final_height = final_image.size
        target_path = _build_target_path(
            source=image_path,
            input_root=config.input_dir,
            output_root=config.output_dir,
            output_ext=output_ext,
            rename=config.rename,
            final_size=(final_width, final_height),
            enable_resize=config.enable_resize,
        )

        no_resize_happened = (final_width, final_height) == (original_width, original_height)
        same_format = output_ext == image_path.suffix.lower()
        same_target = target_path == image_path
        if same_target and same_format and no_resize_happened and not config.delete_original:
            return {
                "status": "skip",
                "message": f"skip {image_path.name} (no changes needed)",
                "metadata_synced": 0,
                "deleted_original": False,
            }

        _save_image_atomic(final_image, target_path, save_format, config.quality)
        metadata_synced = 0
        if config.sync_metadata:
            metadata_synced = _sync_metadata_files(
                source=image_path,
                target=target_path,
                delete_original=config.delete_original,
            )

        deleted_original = False
        if config.delete_original and target_path != image_path:
            try:
                image_path.unlink()
                deleted_original = True
            except FileNotFoundError:
                deleted_original = False

        return {
            "status": "success",
            "message": (
                f"processed {image_path.name}: {original_width}x{original_height} -> "
                f"{final_width}x{final_height} | mode={resize_mode} | saved as {target_path.name}"
            ),
            "metadata_synced": metadata_synced,
            "deleted_original": deleted_original,
        }


def _coerce_config(raw_config: Mapping[str, object] | ImagePreprocessorConfig) -> ImagePreprocessorConfig:
    if isinstance(raw_config, ImagePreprocessorConfig):
        return raw_config

    input_dir = Path(str(raw_config.get("input_dir", "") or "")).expanduser()
    output_dir_raw = str(raw_config.get("output_dir", "") or "").strip()
    output_dir = Path(output_dir_raw).expanduser() if output_dir_raw else None
    resolutions = parse_resolution_list(str(raw_config.get("resolutions", "") or ""))
    quality = int(raw_config.get("quality", 95) or 95)
    quality = max(1, min(100, quality))
    exact_size = bool(raw_config.get("exact_size", False))

    return ImagePreprocessorConfig(
        input_dir=input_dir,
        output_dir=output_dir,
        resolutions=resolutions,
        quality=quality,
        target_format=str(raw_config.get("format", "ORIGINAL") or "ORIGINAL"),
        enable_resize=bool(raw_config.get("enable_resize", True)),
        resize_mode=_normalize_resize_mode(raw_config.get("resize_mode"), exact_size),
        exact_size=exact_size,
        crop_anchor_x=_normalize_anchor(raw_config.get("crop_anchor_x", 0.5)),
        crop_anchor_y=_normalize_anchor(raw_config.get("crop_anchor_y", 0.5)),
        pad_color=_normalize_pad_color(raw_config.get("pad_color", "#ffffff")),
        recursive=bool(raw_config.get("recursive", False)),
        rename=bool(raw_config.get("rename", False)),
        delete_original=bool(raw_config.get("delete_original", False)),
        sync_metadata=bool(raw_config.get("sync_metadata", True)),
        log_callback=raw_config.get("log_callback") if callable(raw_config.get("log_callback")) else None,
    )


def _normalize_output_format(target_format: str, source_path: Path) -> tuple[str, str]:
    normalized = str(target_format or "ORIGINAL").strip().upper()
    if normalized == "JPEG":
        return "JPEG", ".jpg"
    if normalized == "WEBP":
        return "WEBP", ".webp"
    if normalized == "PNG":
        return "PNG", ".png"

    suffix = source_path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        return "JPEG", ".jpg"
    if suffix == ".webp":
        return "WEBP", ".webp"
    if suffix == ".bmp":
        return "BMP", ".bmp"
    return "PNG", ".png"


def _prepare_image_mode(image: Image.Image, save_format: str) -> Image.Image:
    if save_format == "JPEG":
        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            alpha_ready = image.convert("RGBA")
            background = Image.new("RGB", alpha_ready.size, (255, 255, 255))
            background.paste(alpha_ready, mask=alpha_ready.split()[-1])
            return background
        if image.mode != "RGB":
            return image.convert("RGB")
        return image.copy()

    if save_format == "WEBP":
        if image.mode == "P":
            return image.convert("RGBA")
        if image.mode not in ("RGB", "RGBA"):
            return image.convert("RGBA" if "A" in image.mode else "RGB")
        return image.copy()

    if image.mode == "P":
        return image.convert("RGBA")
    return image.copy()


def _normalize_resize_mode(raw_mode: object, exact_size: bool) -> str:
    normalized = str(raw_mode or "").strip().lower()
    if normalized in {"fit", "crop", "pad"}:
        return normalized
    return "crop" if exact_size else "fit"


def _normalize_anchor(value: object) -> float:
    try:
        anchor = float(value)
    except (TypeError, ValueError):
        anchor = 0.5
    return max(0.0, min(1.0, anchor))


def _normalize_pad_color(value: object) -> str:
    color = str(value or "").strip() or "#ffffff"
    try:
        ImageColor.getrgb(color)
    except ValueError:
        return "#ffffff"
    return color


def _resolve_pad_fill(image: Image.Image, pad_color: str) -> tuple[int, ...] | int:
    rgb = ImageColor.getrgb(_normalize_pad_color(pad_color))
    if image.mode == "RGBA":
        return rgb + (255,)
    if image.mode == "LA":
        gray = int(round((rgb[0] + rgb[1] + rgb[2]) / 3))
        return gray, 255
    if image.mode == "L":
        return int(round((rgb[0] + rgb[1] + rgb[2]) / 3))
    return rgb


def _resize_and_crop_with_anchor(
    image: Image.Image,
    target: tuple[int, int],
    *,
    anchor_x: float,
    anchor_y: float,
) -> Image.Image:
    width, height = image.size
    target_width, target_height = target
    scale_ratio = max(target_width / width, target_height / height)
    scaled_width = max(1, int(round(width * scale_ratio)))
    scaled_height = max(1, int(round(height * scale_ratio)))
    resized = image.resize((scaled_width, scaled_height), resample=RESAMPLING_LANCZOS)
    extra_width = max(0, scaled_width - target_width)
    extra_height = max(0, scaled_height - target_height)
    left = int(round(extra_width * _normalize_anchor(anchor_x)))
    top = int(round(extra_height * _normalize_anchor(anchor_y)))
    left = max(0, min(extra_width, left))
    top = max(0, min(extra_height, top))
    return resized.crop((left, top, left + target_width, top + target_height))


def _resize_keep_ratio(image: Image.Image, target: tuple[int, int]) -> Image.Image:
    width, height = image.size
    target_width, target_height = target
    scale_ratio = min(target_width / width, target_height / height)
    scaled_width = max(1, int(round(width * scale_ratio)))
    scaled_height = max(1, int(round(height * scale_ratio)))
    if scaled_width == width and scaled_height == height:
        return image.copy()
    return image.resize((scaled_width, scaled_height), resample=RESAMPLING_LANCZOS)


def _resize_and_pad(
    image: Image.Image,
    target: tuple[int, int],
    *,
    anchor_x: float,
    anchor_y: float,
    pad_color: str,
) -> Image.Image:
    width, height = image.size
    target_width, target_height = target
    scale_ratio = min(target_width / width, target_height / height)
    scaled_width = max(1, int(round(width * scale_ratio)))
    scaled_height = max(1, int(round(height * scale_ratio)))
    if scaled_width == width and scaled_height == height:
        resized = image.copy()
    else:
        resized = image.resize((scaled_width, scaled_height), resample=RESAMPLING_LANCZOS)

    left_space = max(0, target_width - scaled_width)
    top_space = max(0, target_height - scaled_height)
    left = int(round(left_space * _normalize_anchor(anchor_x)))
    top = int(round(top_space * _normalize_anchor(anchor_y)))
    left = max(0, min(left_space, left))
    top = max(0, min(top_space, top))

    canvas = Image.new(resized.mode, (target_width, target_height), _resolve_pad_fill(resized, pad_color))
    paste_mask = resized if "A" in resized.getbands() else None
    canvas.paste(resized, (left, top), paste_mask)
    return canvas


def _build_target_path(
    *,
    source: Path,
    input_root: Path,
    output_root: Path | None,
    output_ext: str,
    rename: bool,
    final_size: tuple[int, int],
    enable_resize: bool,
) -> Path:
    relative_parent = source.parent.relative_to(input_root)
    target_parent = (output_root / relative_parent) if output_root is not None else source.parent
    target_parent.mkdir(parents=True, exist_ok=True)

    if rename:
        suffix = f"+{final_size[0]}x{final_size[1]}" if enable_resize else "+converted"
        target_name = f"{source.stem}{suffix}{output_ext}"
    else:
        target_name = f"{source.stem}{output_ext}"

    return target_parent / target_name


def _save_image_atomic(image: Image.Image, target_path: Path, save_format: str, quality: int) -> None:
    target_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = target_path.with_name(f".{target_path.stem}.{uuid.uuid4().hex}{target_path.suffix}")
    save_kwargs: dict[str, object] = {"optimize": True}
    if save_format in {"JPEG", "WEBP"}:
        save_kwargs["quality"] = quality
    if save_format == "WEBP":
        save_kwargs["method"] = 6

    try:
        image.save(temp_path, format=save_format, **save_kwargs)
        os.replace(temp_path, target_path)
    finally:
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)


def _sync_metadata_files(source: Path, target: Path, delete_original: bool) -> int:
    copied_count = 0
    for metadata_source in source.parent.glob(f"{source.stem}.*"):
        if metadata_source == source:
            continue
        if metadata_source.suffix.lower() not in SUPPORTED_METADATA_EXTENSIONS:
            continue
        metadata_target = target.with_name(f"{target.stem}{metadata_source.suffix.lower()}")
        if metadata_target == metadata_source:
            continue
        shutil.copy2(metadata_source, metadata_target)
        copied_count += 1
        if delete_original:
            metadata_source.unlink(missing_ok=True)
    return copied_count


def _log(config: ImagePreprocessorConfig, message: str) -> None:
    if config.log_callback:
        config.log_callback(message)
    else:
        print(message)
