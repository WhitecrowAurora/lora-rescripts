from __future__ import annotations

import os
from copy import deepcopy
from pathlib import Path
from typing import Optional

from mikazuki.log import log
from mikazuki.utils import train_utils
from mikazuki.utils.dataset_analysis import analyze_dataset
from mikazuki.utils.runtime_dependencies import analyze_training_runtime_dependencies


def analyze_training_preflight(
    config: dict,
    *,
    training_type: str,
    trainer_supported: bool,
    conditioning_required: bool,
    sample_prompt_builder,
    attention_fallback_checker,
) -> dict:
    payload = deepcopy(config)
    train_utils.fix_config_types(payload)

    errors: list[str] = []
    warnings: list[str] = []
    notes: list[str] = []

    train_data_dir = str(payload.get("train_data_dir", "")).strip()
    conditioning_data_dir = str(payload.get("conditioning_data_dir", "")).strip()
    resume_path = str(payload.get("resume", "")).strip()
    model_path = str(payload.get("pretrained_model_name_or_path", "")).strip()

    if not trainer_supported:
        errors.append(f"Unsupported trainer type: {training_type}")

    dataset_summary = None
    if train_data_dir:
        try:
            dataset_report = analyze_dataset(train_data_dir, caption_extension=str(payload.get("caption_extension", ".txt")))
            dataset_summary = summarize_dataset_report(dataset_report)
            warnings.extend(dataset_report.get("warnings", []))
        except ValueError as exc:
            errors.append(str(exc))
        except Exception as exc:
            log.warning(f"Training preflight dataset analysis failed: {exc}")
            warnings.append("Dataset analysis could not complete during preflight.")
    else:
        errors.append("train_data_dir is empty.")

    conditioning_summary = None
    if conditioning_required:
        if not conditioning_data_dir:
            errors.append("conditioning_data_dir is required for this training type.")
        else:
            try:
                conditioning_report = analyze_dataset(conditioning_data_dir, caption_extension=str(payload.get("caption_extension", ".txt")))
                conditioning_summary = summarize_dataset_report(conditioning_report)
                warnings.extend([f"Conditioning dataset: {message}" for message in conditioning_report.get("warnings", [])])
            except ValueError as exc:
                errors.append(str(exc))
            except Exception as exc:
                log.warning(f"Training preflight conditioning dataset analysis failed: {exc}")
                warnings.append("Conditioning dataset analysis could not complete during preflight.")

    if model_path:
        validated, message = train_utils.validate_model(model_path, training_type)
        if not validated:
            errors.append(message or "Pretrained model validation failed.")
    else:
        errors.append("pretrained_model_name_or_path is empty.")

    if resume_path:
        if not os.path.exists(resume_path):
            errors.append("Resume path does not exist.")
        elif not os.path.isdir(resume_path):
            warnings.append("Resume path exists but is not a directory. Confirm this is a valid save_state folder.")
        else:
            notes.append(f"Resume path detected: {resume_path}")

    raw_validation_split = payload.get("validation_split", 0)
    try:
        validation_split = float(raw_validation_split or 0)
    except (TypeError, ValueError):
        validation_split = 0.0
        errors.append("validation_split must be a float value between 0 and 1. / validation_split 必须是 0 到 1 之间的浮点数。")

    if validation_split < 0 or validation_split > 1:
        errors.append("validation_split must be between 0 and 1. / validation_split 必须在 0 到 1 之间。")
    elif validation_split > 0:
        notes.append(f"Validation split enabled at {validation_split:.2%}.")
        if validation_split < 0.05:
            warnings.append("Validation split is very small and may produce noisy validation feedback.")
        if validation_split > 0.4:
            warnings.append("Validation split is large and may reduce the amount of actual training data too much.")

    if training_type.startswith("sdxl") and payload.get("clip_skip") not in (None, "", 0):
        warnings.append(
            "SDXL clip_skip is experimental in this build. Training and inference should use the same SDXL clip-skip behavior."
        )

    if bool(payload.get("masked_loss")):
        alpha_candidates = int(dataset_summary.get("alpha_capable_image_count", 0)) if dataset_summary else 0
        if alpha_candidates == 0 and train_data_dir:
            alpha_candidates = count_alpha_candidate_images(train_data_dir)
        notes.append(f"Masked loss enabled. Alpha-capable image candidates found: {alpha_candidates}.")
        if not bool(payload.get("alpha_mask")) and not conditioning_data_dir:
            warnings.append(
                "masked_loss is enabled, but alpha_mask is off. For ordinary alpha-channel datasets this often behaves like a no-op unless another mask source is present."
            )
        if alpha_candidates == 0:
            warnings.append("masked_loss is enabled, but the dataset does not appear to contain obvious alpha-capable image files.")

    if bool(payload.get("alpha_mask")):
        alpha_candidates = int(dataset_summary.get("alpha_capable_image_count", 0)) if dataset_summary else 0
        notes.append("alpha_mask is enabled, so image alpha channels will be loaded as loss masks when available.")
        if alpha_candidates == 0:
            warnings.append("alpha_mask is enabled, but the dataset does not appear to contain obvious PNG/WebP alpha candidates.")

    if bool(payload.get("save_state")):
        notes.append("save_state is enabled, so future resume points should be produced during training.")
    elif resume_path:
        notes.append("Resume is configured from an existing state, but the current run is not set to save new state snapshots.")

    sample_prompt = None
    try:
        sample_prompt = sample_prompt_builder(payload)
        if sample_prompt:
            warnings.extend([str(item) for item in sample_prompt.get("warnings", []) if str(item).strip()])
            notes.extend([str(item) for item in sample_prompt.get("notes", []) if str(item).strip()])
            if sample_prompt.get("warning"):
                warnings.append(str(sample_prompt["warning"]))
    except ValueError as exc:
        warnings.append(str(exc))
    except Exception as exc:
        log.warning(f"Training preflight sample prompt preview failed: {exc}")
        warnings.append("Sample prompt preview could not be generated.")

    attention_warning = attention_fallback_checker(payload)
    if attention_warning:
        warnings.append(attention_warning)

    dependency_report = analyze_training_runtime_dependencies(payload)
    for dependency in dependency_report["missing"]:
        package_label = dependency["display_name"]
        requirement = ", ".join(dependency.get("required_for", []))
        reason = dependency.get("reason") or "Package is not importable in the active runtime."
        errors.append(
            f"Required runtime dependency {package_label} is unavailable ({requirement}): {reason}"
        )

    for dependency in dependency_report["required"]:
        if dependency["importable"]:
            version = dependency.get("version") or "unknown"
            notes.append(
                f"{dependency['display_name']} {version} is ready for {', '.join(dependency.get('required_for', []))}."
            )

    return {
        "training_type": training_type,
        "can_start": len(errors) == 0,
        "errors": dedupe_strings(errors),
        "warnings": dedupe_strings(warnings),
        "notes": dedupe_strings(notes),
        "dataset": dataset_summary,
        "conditioning_dataset": conditioning_summary,
        "sample_prompt": sample_prompt,
        "dependencies": dependency_report,
    }


def summarize_dataset_report(report: dict) -> dict:
    summary = report.get("summary", {})
    return {
        "path": report.get("root_path", ""),
        "scan_mode": report.get("scan_mode", ""),
        "image_count": int(summary.get("image_count", 0)),
        "effective_image_count": int(summary.get("effective_image_count", 0)),
        "alpha_capable_image_count": int(summary.get("alpha_capable_image_count", 0)),
        "caption_coverage": float(summary.get("caption_coverage", 0)),
        "dataset_folder_count": int(summary.get("dataset_folder_count", 0)),
        "images_without_caption_count": int(summary.get("images_without_caption_count", 0)),
        "broken_image_count": int(summary.get("broken_image_count", 0)),
    }


def count_alpha_candidate_images(path: str) -> int:
    if not path or not os.path.isdir(path):
        return 0
    root = Path(path)
    count = 0
    for image_path in root.rglob("*"):
        if not image_path.is_file():
            continue
        if image_path.suffix.lower() in {".png", ".webp"}:
            count += 1
    return count


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
