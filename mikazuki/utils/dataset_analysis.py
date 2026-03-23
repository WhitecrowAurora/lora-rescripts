from __future__ import annotations

import re
from collections import Counter
from pathlib import Path
from typing import Iterable

from mikazuki.log import log

DATASET_DIR_PATTERN = re.compile(r"^(?P<repeats>\d+)_.+")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
IGNORED_DIR_NAMES = {".git", ".hg", ".svn", "__pycache__", ".ipynb_checkpoints"}
TEXT_ENCODINGS = ("utf-8-sig", "utf-8", "gb18030", "cp932")


def analyze_dataset(
    path: str,
    caption_extension: str = ".txt",
    top_tags: int = 40,
    sample_limit: int = 8,
) -> dict:
    root = Path(path).expanduser()
    if not root.exists():
        raise ValueError("Dataset path does not exist / 数据集路径不存在。")
    if not root.is_dir():
        raise ValueError("Dataset path must be a folder / 数据集路径必须是文件夹。")

    normalized_caption_extension = normalize_caption_extension(caption_extension)
    dataset_folders, scan_mode, warnings = discover_dataset_folders(root)

    summary = {
        "dataset_folder_count": len(dataset_folders),
        "image_count": 0,
        "effective_image_count": 0,
        "alpha_capable_image_count": 0,
        "caption_count": 0,
        "caption_file_count": 0,
        "caption_coverage": 0.0,
        "images_without_caption_count": 0,
        "orphan_caption_count": 0,
        "empty_caption_count": 0,
        "broken_image_count": 0,
        "unique_tag_count": 0,
        "average_tags_per_caption": 0.0,
    }

    folders: list[dict] = []
    image_extension_counts: Counter[str] = Counter()
    resolution_counts: Counter[str] = Counter()
    orientation_counts: Counter[str] = Counter()
    tag_counts: Counter[str] = Counter()

    images_without_caption_samples: list[str] = []
    orphan_caption_samples: list[str] = []
    broken_image_samples: list[str] = []

    total_tag_instances = 0
    caption_cache: dict[Path, list[str]] = {}

    for folder in dataset_folders:
        repeats = parse_dataset_repeats(folder.name)
        image_files = sorted(iter_image_files(folder))
        caption_files = sorted(iter_caption_files(folder, normalized_caption_extension))
        image_pairs = {(image.parent.resolve(), image.stem.lower()) for image in image_files}

        matched_captions = 0
        missing_captions = 0
        empty_captions = 0
        broken_images = 0
        alpha_capable_images = 0

        for image_path in image_files:
            summary["image_count"] += 1
            summary["effective_image_count"] += repeats or 1
            image_extension_counts[image_path.suffix.lower()] += 1
            if image_path.suffix.lower() in {".png", ".webp"}:
                alpha_capable_images += 1
                summary["alpha_capable_image_count"] += 1

            width, height, size_probe_available = read_image_size(image_path)
            if width and height:
                resolution_counts[f"{width}x{height}"] += 1
                orientation_counts[classify_orientation(width, height)] += 1
            elif size_probe_available:
                broken_images += 1
                summary["broken_image_count"] += 1
                append_sample(broken_image_samples, str(image_path.resolve()), sample_limit)

            caption_path = find_caption_for_image(image_path, normalized_caption_extension)
            if caption_path is None:
                missing_captions += 1
                summary["images_without_caption_count"] += 1
                append_sample(images_without_caption_samples, str(image_path.resolve()), sample_limit)
                continue

            matched_captions += 1
            summary["caption_count"] += 1

            tags = caption_cache.get(caption_path)
            if tags is None:
                tags = parse_caption_tags(read_text_file(caption_path))
                caption_cache[caption_path] = tags

            if not tags:
                empty_captions += 1
                summary["empty_caption_count"] += 1
            else:
                tag_counts.update(tags)
                total_tag_instances += len(tags)

        orphan_captions = 0
        for caption_path in caption_files:
            summary["caption_file_count"] += 1
            caption_key = (caption_path.parent.resolve(), caption_path.stem.lower())
            if caption_key in image_pairs:
                continue
            orphan_captions += 1
            summary["orphan_caption_count"] += 1
            append_sample(orphan_caption_samples, str(caption_path.resolve()), sample_limit)

        folder_record = {
            "name": folder.name,
            "path": str(folder.resolve()),
            "repeats": repeats,
            "image_count": len(image_files),
            "effective_image_count": len(image_files) * (repeats or 1),
            "alpha_capable_image_count": alpha_capable_images,
            "caption_count": matched_captions,
            "caption_file_count": len(caption_files),
            "caption_coverage": round(matched_captions / len(image_files), 4) if image_files else 0.0,
            "missing_caption_count": missing_captions,
            "orphan_caption_count": orphan_captions,
            "empty_caption_count": empty_captions,
            "broken_image_count": broken_images,
        }
        folders.append(folder_record)

    if summary["image_count"] == 0:
        raise ValueError("No images were found in the selected folder / 选中的目录中没有找到图片。")

    summary["caption_coverage"] = round(summary["caption_count"] / summary["image_count"], 4)
    summary["unique_tag_count"] = len(tag_counts)
    if summary["caption_count"] > 0:
        summary["average_tags_per_caption"] = round(total_tag_instances / summary["caption_count"], 2)

    warnings.extend(build_summary_warnings(root, scan_mode, summary))

    return {
        "root_path": str(root.resolve()),
        "scan_mode": scan_mode,
        "caption_extension": normalized_caption_extension,
        "summary": summary,
        "folders": folders,
        "image_extensions": format_counter(image_extension_counts),
        "top_resolutions": format_counter(resolution_counts, limit=12),
        "orientation_counts": format_counter(orientation_counts),
        "top_tags": format_counter(tag_counts, limit=top_tags),
        "warnings": warnings,
        "samples": {
            "images_without_caption": images_without_caption_samples,
            "orphan_captions": orphan_caption_samples,
            "broken_images": broken_image_samples,
        },
    }


def normalize_caption_extension(caption_extension: str) -> str:
    value = (caption_extension or ".txt").strip()
    if not value:
        value = ".txt"
    if not value.startswith("."):
        value = f".{value}"
    return value.lower()


def discover_dataset_folders(root: Path) -> tuple[list[Path], str, list[str]]:
    warnings: list[str] = []
    direct_subdirs = sorted(
        [path for path in root.iterdir() if path.is_dir() and path.name not in IGNORED_DIR_NAMES],
        key=lambda item: item.name.lower(),
    )
    dataset_subdirs = [path for path in direct_subdirs if parse_dataset_repeats(path.name) is not None]

    if dataset_subdirs:
        return dataset_subdirs, "dataset_parent", warnings

    direct_images = list(iter_image_files(root, recursive=False))
    if direct_images:
        if parse_dataset_repeats(root.name) is None:
            warnings.append(
                "Images were found directly under this folder, but its name does not match the training-style "
                "'num_name' pattern. Some training entries may reject it unless you rename it like "
                "'8_character' or point train_data_dir at its parent folder."
            )
        return [root], "single_folder", warnings

    recursive_images = list(iter_image_files(root, recursive=True))
    if recursive_images:
        warnings.append(
            "No legal 'num_name' dataset subfolders were found, so the analyzer fell back to a recursive scan. "
            "This is useful for diagnostics, but some trainers may expect a stricter folder layout."
        )
        return [root], "recursive_scan", warnings

    return [root], "empty_folder", warnings


def iter_image_files(base: Path, recursive: bool = True) -> Iterable[Path]:
    iterator = base.rglob("*") if recursive else base.glob("*")
    for path in iterator:
        if not path.is_file():
            continue
        if is_ignored_path(path):
            continue
        if path.suffix.lower() in IMAGE_EXTENSIONS:
            yield path


def iter_caption_files(base: Path, caption_extension: str) -> Iterable[Path]:
    for path in base.rglob("*"):
        if not path.is_file():
            continue
        if is_ignored_path(path):
            continue
        if path.suffix.lower() == caption_extension:
            yield path


def is_ignored_path(path: Path) -> bool:
    return any(part in IGNORED_DIR_NAMES for part in path.parts)


def parse_dataset_repeats(name: str) -> int | None:
    match = DATASET_DIR_PATTERN.match(name)
    if not match:
        return None
    return int(match.group("repeats"))


def read_text_file(path: Path) -> str:
    for encoding in TEXT_ENCODINGS:
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
        except OSError as exc:
            log.warning(f"Failed to read caption file {path}: {exc}")
            return ""
    return path.read_text(encoding="utf-8", errors="replace")


def parse_caption_tags(text: str) -> list[str]:
    if not text:
        return []
    tags = []
    for raw_tag in re.split(r"[\n,]+", text):
        tag = raw_tag.strip()
        if tag:
            tags.append(tag)
    return tags


def find_caption_for_image(image_path: Path, caption_extension: str) -> Path | None:
    direct_match = image_path.with_suffix(caption_extension)
    if direct_match.exists():
        return direct_match

    for candidate in image_path.parent.glob(f"{image_path.stem}.*"):
        if candidate.is_file() and candidate.suffix.lower() == caption_extension:
            return candidate

    return None


def read_image_size(path: Path) -> tuple[int | None, int | None, bool]:
    try:
        from PIL import Image
    except ImportError:
        return None, None, False

    try:
        with Image.open(path) as image:
            width, height = image.size
            return width, height, True
    except Exception as exc:
        log.warning(f"Failed to read image size for {path}: {exc}")
        return None, None, True


def classify_orientation(width: int, height: int) -> str:
    if width == height:
        return "square"
    if width > height:
        return "landscape"
    return "portrait"


def format_counter(counter: Counter[str], limit: int | None = None) -> list[dict]:
    items = sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    if limit is not None:
        items = items[:limit]
    return [{"name": name, "count": count} for name, count in items]


def append_sample(target: list[str], value: str, sample_limit: int) -> None:
    if len(target) < sample_limit and value not in target:
        target.append(value)


def build_summary_warnings(root: Path, scan_mode: str, summary: dict) -> list[str]:
    warnings: list[str] = []

    if scan_mode == "empty_folder":
        warnings.append(
            "The selected folder does not contain any supported images. Supported extensions are "
            ".jpg, .jpeg, .png, .webp, and .bmp."
        )

    if summary["caption_count"] == 0:
        warnings.append("No matching caption files were found for this dataset.")
    elif summary["images_without_caption_count"] > 0:
        warnings.append(
            f"{summary['images_without_caption_count']} images do not have a matching caption file "
            f"({summary['caption_coverage'] * 100:.1f}% coverage)."
        )

    if summary["orphan_caption_count"] > 0:
        warnings.append(
            f"{summary['orphan_caption_count']} caption files do not have a matching image stem."
        )

    if summary["empty_caption_count"] > 0:
        warnings.append(
            f"{summary['empty_caption_count']} caption files are empty after tag parsing."
        )

    if summary["broken_image_count"] > 0:
        warnings.append(
            f"{summary['broken_image_count']} images could not be opened to read their dimensions."
        )

    if scan_mode == "single_folder" and parse_dataset_repeats(root.name) is None:
        warnings.append(
            "This folder is analyzable, but the current training validator may still prefer a parent directory "
            "containing 'num_name' dataset folders."
        )

    return warnings
