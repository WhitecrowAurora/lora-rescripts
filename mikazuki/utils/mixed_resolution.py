from __future__ import annotations

import hashlib
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import toml

from mikazuki.utils.dataset_analysis import analyze_dataset
from mikazuki.utils.batch_semantics import resolve_per_device_batch_from_global


MIXED_RESOLUTION_UI_KEYS = (
    "enable_mixed_resolution_training",
    "num_processes",
    "staged_resolution_ratio_512",
    "staged_resolution_ratio_768",
    "staged_resolution_ratio_1024",
    "staged_resolution_ratio_1536",
    "staged_resolution_ratio_2048",
)

MIXED_RESOLUTION_AUTO_RESUME = "__MIXED_RESOLUTION_AUTO_RESUME__"

STAGE_SCHEDULES = {
    512: (512,),
    768: (512, 768),
    1024: (512, 768, 1024),
    2048: (1024, 1536, 2048),
}
SUPPORTED_STAGE_BASE_SIDES = tuple(STAGE_SCHEDULES.keys())
DEFAULT_STAGE_RATIOS = {
    512: {
        512: 100.0,
    },
    768: {
        512: 40.0,
        768: 60.0,
    },
    1024: {
        512: 20.0,
        768: 30.0,
        1024: 50.0,
    },
    2048: {
        1024: 20.0,
        1536: 30.0,
        2048: 50.0,
    },
}


@dataclass(frozen=True)
class MixedResolutionPhasePlan:
    phase_index: int
    key: str
    label: str
    stage_side: int
    resolution: tuple[int, int]
    ratio_percent: float
    train_batch_size: int
    batch_size_global: int
    batch_per_gpu: int
    batch_size_per_device: int
    world_size: int
    gradient_accumulation_steps: int
    steps_per_epoch: int
    raw_epochs: int
    actual_epochs: int
    epoch_rounding_multiple: int
    epoch_scale_factor: float
    save_every_n_epochs: Optional[int]
    sample_every_n_epochs: Optional[int]
    phase_steps: int
    start_step: int
    cumulative_steps: int
    start_epoch: int
    cumulative_epochs: int
    loop_epoch_base: int
    epoch_display_offset: int


@dataclass(frozen=True)
class MixedResolutionPlan:
    enabled: bool
    plan_id: str
    world_size: int
    total_samples: int
    base_resolution: tuple[int, int]
    base_batch_size: int
    base_batch_size_global: int
    base_batch_size_per_device: int
    base_gradient_accumulation_steps: int
    base_save_every_n_epochs: Optional[int]
    base_sample_every_n_epochs: Optional[int]
    alignment_epochs: int
    total_ratio_percent: float
    total_mixed_epochs: int
    total_mixed_steps: int
    phases: tuple[MixedResolutionPhasePlan, ...]
    warnings: tuple[str, ...]
    notes: tuple[str, ...]


def build_mixed_resolution_plan(config: dict, *, training_type: str) -> MixedResolutionPlan:
    enabled = parse_boolish(config.get("enable_mixed_resolution_training", False))
    if not enabled:
        return MixedResolutionPlan(
            enabled=False,
            plan_id="",
            world_size=resolve_world_size(config),
            total_samples=0,
            base_resolution=parse_resolution(config.get("resolution")) or (0, 0),
            base_batch_size=int(config.get("train_batch_size", 1) or 1),
            base_batch_size_global=int(config.get("train_batch_size", 1) or 1),
            base_batch_size_per_device=int(config.get("train_batch_size", 1) or 1),
            base_gradient_accumulation_steps=int(config.get("gradient_accumulation_steps", 1) or 1),
            base_save_every_n_epochs=None,
            base_sample_every_n_epochs=None,
            alignment_epochs=1,
            total_ratio_percent=0.0,
            total_mixed_epochs=0,
            total_mixed_steps=0,
            phases=(),
            warnings=(),
            notes=(),
        )

    training_type = str(training_type or "").strip().lower()
    if training_type not in {"sdxl-lora", "sdxl-finetune", "anima-lora", "anima-finetune"}:
        raise ValueError(
            "阶段分辨率训练当前仅对 SDXL / Anima 的 LoRA / FineTune 路线开放。"
        )

    base_resolution = parse_resolution(config.get("resolution"))
    if base_resolution is None:
        raise ValueError("阶段分辨率训练需要有效的 resolution。")

    base_side = max(base_resolution)
    if base_side not in SUPPORTED_STAGE_BASE_SIDES:
        raise ValueError(
            "阶段分辨率训练当前仅支持最大边为 512 / 768 / 1024 / 2048 的分辨率。"
        )

    if int(config.get("bucket_reso_steps", 64) or 64) not in {32, 64}:
        raise ValueError("阶段分辨率训练当前仅支持 bucket_reso_steps 为 32 或 64。")

    if parse_boolish(config.get("skip_cache_check", False)):
        raise ValueError(
            "阶段分辨率训练不能与 skip_cache_check 同时开启，否则切换阶段时可能复用错误的 latent 缓存。"
        )

    if parse_boolish(config.get("cache_latents_to_disk", False)) and not parse_boolish(config.get("cache_latents", False)):
        raise ValueError("开启 cache_latents_to_disk 时必须同时开启 cache_latents。")

    world_size = resolve_world_size(config)
    base_batch_size = int(config.get("train_batch_size", 1) or 1)
    base_gradient_accumulation_steps = int(config.get("gradient_accumulation_steps", 1) or 1)
    if base_batch_size < 1:
        raise ValueError("train_batch_size 必须大于 0。")
    if base_gradient_accumulation_steps < 1:
        raise ValueError("gradient_accumulation_steps 必须大于 0。")
    ok_batch, base_batch_size_per_device, batch_error = resolve_per_device_batch_from_global(base_batch_size, world_size)
    if not ok_batch:
        raise ValueError(f"阶段分辨率训练的批大小配置不合法: {batch_error}")

    total_samples = resolve_total_samples(config)
    if total_samples <= 0:
        raise ValueError("无法从当前数据集估算训练样本数。")

    alignment_epochs = resolve_alignment_epochs(config)
    base_save_every_n_epochs = int(config.get("save_every_n_epochs", 0) or 0) or None
    base_sample_every_n_epochs = None
    if parse_boolish(config.get("enable_preview", False)):
        base_sample_every_n_epochs = int(config.get("sample_every_n_epochs", 0) or 0) or None
    validate_every_n_epochs = int(config.get("validate_every_n_epochs", 0) or 0) or None

    stage_ratios = extract_stage_ratios(config, base_side)
    total_ratio_percent = sum(ratio for _, ratio in stage_ratios)
    if total_ratio_percent <= 0:
        raise ValueError("阶段分辨率训练至少需要一个阶段占比大于 0。")
    if total_ratio_percent > 100:
        raise ValueError("阶段分辨率训练各阶段占比总和不能超过 100%。")

    base_epochs = int(config.get("max_train_epochs", 0) or 0)
    if base_epochs < 1:
        raise ValueError("阶段分辨率训练需要有效的 max_train_epochs。")

    plan_signature_payload = {
        "training_type": training_type,
        "base_resolution": list(base_resolution),
        "world_size": world_size,
        "base_batch_size": base_batch_size,
        "base_batch_size_global": base_batch_size,
        "base_batch_size_per_device": base_batch_size_per_device,
        "base_gradient_accumulation_steps": base_gradient_accumulation_steps,
        "base_save_every_n_epochs": base_save_every_n_epochs,
        "base_sample_every_n_epochs": base_sample_every_n_epochs,
        "base_epochs": base_epochs,
        "alignment_epochs": alignment_epochs,
        "stage_ratios": [
            {
                "stage_side": int(stage_side),
                "ratio_percent": float(ratio_percent),
            }
            for stage_side, ratio_percent in stage_ratios
        ],
    }
    plan_id = hashlib.sha1(
        json.dumps(plan_signature_payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()[:16]

    phases: list[MixedResolutionPhasePlan] = []
    cumulative_steps = 0
    cumulative_epochs = 0
    warnings: list[str] = []
    notes: list[str] = []
    dynamic_epoch_schedule = False

    for phase_index, (stage_side, ratio_percent) in enumerate(stage_ratios, start=1):
        resolution = scale_resolution_to_side(base_resolution, stage_side)
        batch_size_global = max(
            1,
            int(math.floor(base_batch_size * resolution_area(base_resolution) / resolution_area(resolution))),
        )
        ok_phase_batch, batch_size_per_device, phase_batch_error = resolve_per_device_batch_from_global(
            batch_size_global, world_size
        )
        if not ok_phase_batch:
            raise ValueError(
                f"阶段 {phase_index}（{resolution[0]}x{resolution[1]}）批大小配置不合法: "
                f"{phase_batch_error}（当前阶段全局 batch={batch_size_global}）"
            )
        per_epoch_batches = math.ceil(total_samples / batch_size_global)
        steps_per_epoch = math.ceil(per_epoch_batches / base_gradient_accumulation_steps)

        phase_start_step = cumulative_steps
        phase_start_epoch = cumulative_epochs
        epoch_scale_factor = resolution_area(base_resolution) / max(1, resolution_area(resolution))
        phase_save_every_n_epochs = (
            scale_epoch_interval(base_save_every_n_epochs, epoch_scale_factor) if base_save_every_n_epochs else None
        )
        phase_sample_every_n_epochs = (
            scale_epoch_interval(base_sample_every_n_epochs, epoch_scale_factor) if base_sample_every_n_epochs else None
        )
        epoch_rounding_multiple = 1
        if phase_save_every_n_epochs:
            epoch_rounding_multiple = lcm(epoch_rounding_multiple, phase_save_every_n_epochs)
        if phase_sample_every_n_epochs:
            epoch_rounding_multiple = lcm(epoch_rounding_multiple, phase_sample_every_n_epochs)
        if validate_every_n_epochs:
            epoch_rounding_multiple = lcm(epoch_rounding_multiple, validate_every_n_epochs)
        raw_epochs = int(math.ceil(base_epochs * (ratio_percent / 100.0) * (batch_size_global / base_batch_size)))
        actual_epochs = round_up_to_multiple(max(1, raw_epochs), epoch_rounding_multiple)
        phase_steps = steps_per_epoch * actual_epochs
        loop_epoch_base = phase_start_step // steps_per_epoch if steps_per_epoch > 0 else 0
        epoch_display_offset = phase_start_epoch - loop_epoch_base
        cumulative_steps += phase_steps
        cumulative_epochs += actual_epochs
        if phase_save_every_n_epochs != base_save_every_n_epochs or phase_sample_every_n_epochs != base_sample_every_n_epochs:
            dynamic_epoch_schedule = True

        phases.append(
            MixedResolutionPhasePlan(
                phase_index=phase_index,
                key=f"stage_{stage_side}",
                label=f"{resolution[0]}x{resolution[1]}",
                stage_side=stage_side,
                resolution=resolution,
                ratio_percent=ratio_percent,
                train_batch_size=batch_size_global,
                batch_size_global=batch_size_global,
                batch_per_gpu=batch_size_per_device,
                batch_size_per_device=batch_size_per_device,
                world_size=world_size,
                gradient_accumulation_steps=base_gradient_accumulation_steps,
                steps_per_epoch=steps_per_epoch,
                raw_epochs=raw_epochs,
                actual_epochs=actual_epochs,
                epoch_rounding_multiple=epoch_rounding_multiple,
                epoch_scale_factor=epoch_scale_factor,
                save_every_n_epochs=phase_save_every_n_epochs,
                sample_every_n_epochs=phase_sample_every_n_epochs,
                phase_steps=phase_steps,
                start_step=phase_start_step,
                cumulative_steps=cumulative_steps,
                start_epoch=phase_start_epoch,
                cumulative_epochs=cumulative_epochs,
                loop_epoch_base=loop_epoch_base,
                epoch_display_offset=epoch_display_offset,
            )
        )

    if parse_boolish(config.get("cache_latents_to_disk", False)):
        notes.append(
            "阶段切换时会按新分辨率重新校验 / 重建磁盘 latent 缓存，因此切阶段时缓存重建属于预期行为。"
        )

    if dynamic_epoch_schedule:
        notes.append(
            "阶段保存 / 预览周期会按分辨率阶段动态缩放，低分辨率阶段通常会更晚触发保存与预览。"
        )
    elif alignment_epochs > 1:
        notes.append(
            f"阶段 epoch 已按 {alignment_epochs} 的倍数向上对齐，以兼容保存 / 预览触发节奏。"
        )

    return MixedResolutionPlan(
        enabled=True,
        plan_id=plan_id,
        world_size=world_size,
        total_samples=total_samples,
        base_resolution=base_resolution,
        base_batch_size=base_batch_size,
        base_batch_size_global=base_batch_size,
        base_batch_size_per_device=base_batch_size_per_device,
        base_gradient_accumulation_steps=base_gradient_accumulation_steps,
        base_save_every_n_epochs=base_save_every_n_epochs,
        base_sample_every_n_epochs=base_sample_every_n_epochs,
        alignment_epochs=alignment_epochs,
        total_ratio_percent=total_ratio_percent,
        total_mixed_epochs=cumulative_epochs,
        total_mixed_steps=cumulative_steps,
        phases=tuple(phases),
        warnings=tuple(warnings),
        notes=tuple(notes),
    )


def build_mixed_resolution_summary_text(plan: MixedResolutionPlan) -> str:
    if not plan.enabled:
        return "阶段分辨率训练未启用。"

    multi_process = int(plan.world_size or 1) > 1
    lines = [
        "阶段分辨率训练计划：",
        f"- 基准分辨率: {plan.base_resolution[0]}x{plan.base_resolution[1]}",
        f"- 数据集样本数（含 repeats）: {plan.total_samples}",
        (
            f"- 基准 batch(全局): {plan.base_batch_size_global}"
            if multi_process
            else f"- 基准 batch: {plan.base_batch_size_global}"
        ),
        (f"- 基准 batch(每卡): {plan.base_batch_size_per_device}" if multi_process else None),
        f"- world_size: {plan.world_size}",
        f"- 梯度累加: {plan.base_gradient_accumulation_steps}",
        f"- 基准保存周期: {plan.base_save_every_n_epochs or 'disabled'} epoch",
        f"- 基准预览周期: {plan.base_sample_every_n_epochs or 'disabled'} epoch",
        f"- 阶段占比总和: {plan.total_ratio_percent:.2f}%",
    ]
    lines = [line for line in lines if line is not None]

    for phase in plan.phases:
        lines.append(
            (
                f"- {phase.label}: 占比 {phase.ratio_percent:.2f}% | "
                f"batch_global {phase.batch_size_global} | batch_per_device {phase.batch_size_per_device} | "
                f"steps/epoch {phase.steps_per_epoch} | raw_epoch {phase.raw_epochs} | "
                f"actual_epoch {phase.actual_epochs} | save_every {phase.save_every_n_epochs or 'disabled'} | "
                f"sample_every {phase.sample_every_n_epochs or 'disabled'} | phase_steps {phase.phase_steps} | "
                f"target_max_steps {phase.cumulative_steps} | target_epoch_end {phase.cumulative_epochs}"
            )
            if multi_process
            else (
                f"- {phase.label}: 占比 {phase.ratio_percent:.2f}% | "
                f"batch {phase.batch_size_global} | steps/epoch {phase.steps_per_epoch} | "
                f"raw_epoch {phase.raw_epochs} | actual_epoch {phase.actual_epochs} | "
                f"save_every {phase.save_every_n_epochs or 'disabled'} | "
                f"sample_every {phase.sample_every_n_epochs or 'disabled'} | phase_steps {phase.phase_steps} | "
                f"target_max_steps {phase.cumulative_steps} | target_epoch_end {phase.cumulative_epochs}"
            )
        )

    for note in plan.notes:
        lines.append(f"- 说明: {note}")
    for warning in plan.warnings:
        lines.append(f"- 警告: {warning}")

    return "\n".join(lines)


def build_phase_run_configs(config: dict, *, training_type: str) -> tuple[MixedResolutionPlan, list[dict]]:
    plan = build_mixed_resolution_plan(config, training_type=training_type)
    if not plan.enabled:
        return plan, [strip_mixed_resolution_fields(config)]

    phase_configs: list[dict] = []
    resume_path = str(config.get("resume", "")).strip() or None
    output_dir = str(config.get("output_dir", "")).strip()
    output_name = str(config.get("output_name", "")).strip() or "last"

    for phase in plan.phases:
        phase_config = strip_mixed_resolution_fields(config)
        phase_config["resolution"] = f"{phase.resolution[0]},{phase.resolution[1]}"
        phase_config["train_batch_size"] = phase.batch_size_per_device
        phase_config["gradient_accumulation_steps"] = phase.gradient_accumulation_steps
        phase_config["max_train_steps"] = phase.cumulative_steps
        phase_config.pop("max_train_epochs", None)
        if phase.save_every_n_epochs:
            phase_config["save_every_n_epochs"] = phase.save_every_n_epochs
        else:
            phase_config.pop("save_every_n_epochs", None)
        if phase.sample_every_n_epochs:
            phase_config["sample_every_n_epochs"] = phase.sample_every_n_epochs
        else:
            phase_config.pop("sample_every_n_epochs", None)
        phase_config["save_state"] = True
        phase_config["save_state_on_train_end"] = True
        phase_config["mixed_resolution_plan_id"] = plan.plan_id
        phase_config["mixed_resolution_phase_index"] = phase.phase_index
        phase_config["mixed_resolution_phase_count"] = len(plan.phases)
        phase_config["mixed_resolution_phase_label"] = phase.label
        phase_config["mixed_resolution_phase_start_step"] = phase.start_step
        phase_config["mixed_resolution_phase_target_step"] = phase.cumulative_steps
        phase_config["mixed_resolution_phase_start_epoch"] = phase.start_epoch
        phase_config["mixed_resolution_phase_target_epoch"] = phase.cumulative_epochs
        phase_config["mixed_resolution_loop_epoch_base"] = phase.loop_epoch_base
        phase_config["mixed_resolution_epoch_display_offset"] = phase.epoch_display_offset
        phase_config["mixed_resolution_phase_save_every_n_epochs"] = phase.save_every_n_epochs
        phase_config["mixed_resolution_phase_sample_every_n_epochs"] = phase.sample_every_n_epochs
        phase_config["mixed_resolution_phase_epoch_rounding_multiple"] = phase.epoch_rounding_multiple
        phase_config["training_comment"] = merge_training_comment(
            phase_config.get("training_comment"),
            (
                f"mixed-resolution phase {phase.label} ratio={phase.ratio_percent:.2f}% "
                f"target_max_steps={phase.cumulative_steps} target_epoch_end={phase.cumulative_epochs} "
                f"save_every={phase.save_every_n_epochs or 'disabled'} sample_every={phase.sample_every_n_epochs or 'disabled'}"
            ),
        )
        if phase.phase_index == 1 and resume_path:
            phase_config["resume"] = resume_path
        elif phase.phase_index > 1:
            phase_config["resume"] = MIXED_RESOLUTION_AUTO_RESUME
        else:
            phase_config.pop("resume", None)

        phase_configs.append(phase_config)
        resume_path = str(Path(output_dir) / f"{output_name}-state")

    return plan, phase_configs


def strip_mixed_resolution_fields(config: dict) -> dict:
    payload = dict(config)
    for key in MIXED_RESOLUTION_UI_KEYS:
        payload.pop(key, None)
    return payload


def parse_boolish(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"", "0", "false", "no", "off", "none", "null"}:
            return False
        if normalized in {"1", "true", "yes", "on"}:
            return True
    return bool(value)


def parse_resolution(value) -> Optional[tuple[int, int]]:
    if value is None:
        return None
    if isinstance(value, str):
        parts = [item.strip() for item in value.replace("x", ",").split(",") if item.strip()]
        if len(parts) == 1:
            side = int(parts[0])
            return side, side
        if len(parts) >= 2:
            return int(parts[0]), int(parts[1])
        return None
    if isinstance(value, (list, tuple)):
        if len(value) == 1:
            side = int(value[0])
            return side, side
        if len(value) >= 2:
            return int(value[0]), int(value[1])
    if isinstance(value, (int, float)):
        side = int(value)
        return side, side
    return None


def resolve_world_size(config: dict) -> int:
    num_processes = config.get("num_processes")
    try:
        if num_processes is not None and int(num_processes) > 0:
            return int(num_processes)
    except (TypeError, ValueError):
        pass

    gpu_ids = config.get("gpu_ids")
    if isinstance(gpu_ids, list) and gpu_ids:
        return len(gpu_ids)
    return 1


def resolve_total_samples(config: dict) -> int:
    train_data_dir = str(config.get("train_data_dir", "")).strip()
    caption_extension = str(config.get("caption_extension", ".txt"))
    if not train_data_dir:
        return 0
    report = analyze_dataset(train_data_dir, caption_extension=caption_extension)
    return int(report.get("summary", {}).get("effective_image_count", 0))


def resolve_alignment_epochs(config: dict) -> int:
    alignment = 1
    save_every_n_epochs = int(config.get("save_every_n_epochs", 0) or 0)
    if save_every_n_epochs > 0:
        alignment = lcm(alignment, save_every_n_epochs)

    if parse_boolish(config.get("enable_preview", False)):
        sample_every_n_epochs = int(config.get("sample_every_n_epochs", 0) or 0)
        if sample_every_n_epochs > 0:
            alignment = lcm(alignment, sample_every_n_epochs)

    validate_every_n_epochs = int(config.get("validate_every_n_epochs", 0) or 0)
    if validate_every_n_epochs > 0:
        alignment = lcm(alignment, validate_every_n_epochs)

    return max(1, alignment)


def scale_epoch_interval(base_value: Optional[int], factor: float) -> Optional[int]:
    if base_value is None:
        return None
    normalized = int(base_value)
    if normalized <= 0:
        return None
    return max(1, int(math.ceil(normalized * float(factor))))


def extract_stage_ratios(config: dict, base_side: int) -> list[tuple[int, float]]:
    ratios: list[tuple[int, float]] = []
    default_schedule = DEFAULT_STAGE_RATIOS.get(base_side, {})
    for stage_side in STAGE_SCHEDULES.get(base_side, ()):
        key = f"staged_resolution_ratio_{stage_side}"
        value = float(config.get(key, default_schedule.get(stage_side, 0.0)) or 0.0)
        if value <= 0:
            continue
        ratios.append((stage_side, value))
    return ratios


def scale_resolution_to_side(base_resolution: tuple[int, int], target_max_side: int) -> tuple[int, int]:
    base_width, base_height = base_resolution
    base_side = max(base_resolution)
    if base_side <= 0:
        return base_resolution

    scale = target_max_side / base_side
    width = round_to_multiple(max(64, base_width * scale), 64)
    height = round_to_multiple(max(64, base_height * scale), 64)
    return int(width), int(height)


def round_to_multiple(value: float, step: int) -> int:
    rounded = int(value + step / 2)
    rounded = rounded - rounded % step
    return max(step, rounded)


def resolution_area(resolution: tuple[int, int]) -> int:
    return int(resolution[0]) * int(resolution[1])


def lcm(a: int, b: int) -> int:
    return abs(a * b) // math.gcd(a, b) if a and b else max(a, b)


def round_up_to_multiple(value: int, multiple: int) -> int:
    if multiple <= 1:
        return value
    return int(math.ceil(value / multiple) * multiple)


def merge_training_comment(existing, addition: str) -> str:
    existing_text = str(existing or "").strip()
    if not existing_text:
        return addition
    if addition in existing_text:
        return existing_text
    return f"{existing_text}\n{addition}"


def load_config_file(path: str | Path) -> dict:
    return toml.load(Path(path))
