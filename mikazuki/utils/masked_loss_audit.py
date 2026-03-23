from __future__ import annotations

from pathlib import Path

from mikazuki.log import log
from mikazuki.utils.dataset_analysis import iter_image_files


def analyze_masked_loss_dataset(
    path: str,
    *,
    recursive: bool = True,
    sample_limit: int = 8,
) -> dict:
    root = Path(path).expanduser()
    if not root.exists():
        raise ValueError("Dataset path does not exist / 数据集路径不存在。")
    if not root.is_dir():
        raise ValueError("Dataset path must be a folder / 数据集路径必须是文件夹。")

    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError("Pillow is required for masked-loss inspection.") from exc

    summary = {
        "image_count": 0,
        "alpha_channel_image_count": 0,
        "usable_mask_image_count": 0,
        "soft_alpha_image_count": 0,
        "binary_alpha_image_count": 0,
        "fully_opaque_alpha_image_count": 0,
        "fully_transparent_image_count": 0,
        "no_alpha_image_count": 0,
        "broken_image_count": 0,
        "average_mask_coverage": 0.0,
        "average_alpha_weight": 0.0,
    }

    mask_coverage_total = 0.0
    alpha_weight_total = 0.0
    alpha_measurement_count = 0

    samples = {
        "usable_masks": [],
        "soft_alpha_masks": [],
        "fully_opaque_alpha": [],
        "no_alpha": [],
        "broken_images": [],
    }
    warnings: list[str] = []
    guidance: list[str] = []

    for image_path in iter_image_files(root, recursive=recursive):
        summary["image_count"] += 1
        try:
            with Image.open(image_path) as image:
                bands = image.getbands()
                if "A" not in bands:
                    summary["no_alpha_image_count"] += 1
                    append_sample(samples["no_alpha"], str(image_path.resolve()), sample_limit)
                    continue

                summary["alpha_channel_image_count"] += 1
                alpha = image.getchannel("A")
                histogram = alpha.histogram()
                total_pixels = max(alpha.size[0] * alpha.size[1], 1)
                transparent_pixels = histogram[0]
                opaque_pixels = histogram[255]
                non_opaque_pixels = total_pixels - opaque_pixels
                soft_pixels = total_pixels - transparent_pixels - opaque_pixels
                weighted_alpha_sum = sum(index * count for index, count in enumerate(histogram))

                alpha_measurement_count += 1
                mask_coverage_total += non_opaque_pixels / total_pixels
                alpha_weight_total += weighted_alpha_sum / (255.0 * total_pixels)

                if transparent_pixels == total_pixels:
                    summary["fully_transparent_image_count"] += 1
                    summary["usable_mask_image_count"] += 1
                    summary["binary_alpha_image_count"] += 1
                    append_sample(samples["usable_masks"], str(image_path.resolve()), sample_limit)
                elif opaque_pixels == total_pixels:
                    summary["fully_opaque_alpha_image_count"] += 1
                    append_sample(samples["fully_opaque_alpha"], str(image_path.resolve()), sample_limit)
                elif soft_pixels == 0:
                    summary["usable_mask_image_count"] += 1
                    summary["binary_alpha_image_count"] += 1
                    append_sample(samples["usable_masks"], str(image_path.resolve()), sample_limit)
                else:
                    summary["usable_mask_image_count"] += 1
                    summary["soft_alpha_image_count"] += 1
                    append_sample(samples["usable_masks"], str(image_path.resolve()), sample_limit)
                    append_sample(samples["soft_alpha_masks"], str(image_path.resolve()), sample_limit)
        except Exception as exc:
            log.warning(f"Masked-loss audit failed to inspect {image_path}: {exc}")
            summary["broken_image_count"] += 1
            append_sample(samples["broken_images"], str(image_path.resolve()), sample_limit)

    if summary["image_count"] == 0:
        raise ValueError("No images were found in the selected folder / 选中的目录中没有找到图片。")

    if alpha_measurement_count > 0:
        summary["average_mask_coverage"] = round(mask_coverage_total / alpha_measurement_count, 4)
        summary["average_alpha_weight"] = round(alpha_weight_total / alpha_measurement_count, 4)

    if summary["usable_mask_image_count"] == 0:
        warnings.append(
            "No usable alpha masks were detected. Turning on masked_loss by itself would likely behave like a no-op for a normal alpha dataset."
        )
    else:
        guidance.append(
            "Usable alpha masks were detected. Turn on alpha_mask in the training page if you want image alpha channels to influence loss."
        )

    if summary["fully_opaque_alpha_image_count"] > 0:
        warnings.append(
            f"{summary['fully_opaque_alpha_image_count']} files include an alpha channel but appear fully opaque, so they will not actually mask loss."
        )

    if summary["no_alpha_image_count"] > 0 and summary["usable_mask_image_count"] > 0:
        guidance.append(
            "The dataset mixes masked and non-masked images. Non-alpha images will behave like all-ones masks when alpha_mask is enabled."
        )

    if summary["soft_alpha_image_count"] > 0:
        guidance.append(
            "Soft alpha masks were found, so edge falloff or feathered transparency should be preserved instead of acting like a strict cutout."
        )

    if summary["broken_image_count"] > 0:
        warnings.append(
            f"{summary['broken_image_count']} images could not be inspected for alpha information."
        )

    guidance.append(
        "For ordinary LoRA training, alpha_mask is the critical switch for alpha-channel masking. masked_loss without alpha_mask or conditioning masks often does nothing."
    )

    return {
        "root_path": str(root.resolve()),
        "recursive": recursive,
        "summary": summary,
        "samples": samples,
        "warnings": dedupe_strings(warnings),
        "guidance": dedupe_strings(guidance),
    }


def append_sample(target: list[str], value: str, sample_limit: int) -> None:
    if len(target) < sample_limit and value not in target:
        target.append(value)


def dedupe_strings(items: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for item in items:
        normalized = item.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)
    return result
