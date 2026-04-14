from __future__ import annotations

import os
from copy import deepcopy
from dataclasses import asdict
from pathlib import Path
from typing import Callable, Optional, TypeVar

from mikazuki.launch_utils import base_dir_path
from mikazuki.log import log
from mikazuki.utils import train_utils
from mikazuki.utils.dataset_cache_preflight import analyze_dataset_cache_preflight
from mikazuki.utils.dataset_analysis import analyze_dataset
from mikazuki.utils.distributed import resolve_distributed_runtime
from mikazuki.utils.distributed_sync import resolve_worker_sync_runtime
from mikazuki.utils.mixed_resolution import (
    build_mixed_resolution_plan,
    build_mixed_resolution_summary_text,
)
from mikazuki.utils.resume_guard import validate_resume_launch_guard
from mikazuki.utils.runtime_dependencies import analyze_training_runtime_dependencies
from mikazuki.utils.tensorboard_runs import apply_tensorboard_runtime_config
from mikazuki.utils.trainer_registry import get_trainer_definition


_T = TypeVar("_T")


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


def parse_optional_float(value) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return None
        return float(stripped)
    if isinstance(value, (list, tuple)):
        if len(value) == 0:
            return None
        return parse_optional_float(value[0])
    return None


def get_anima_adapter_type(payload: dict) -> str:
    adapter_type = str(payload.get("anima_adapter_type", "")).strip().lower()
    if adapter_type:
        return adapter_type

    network_args = payload.get("network_args")
    if isinstance(network_args, (list, tuple)):
        for item in network_args:
            item_str = str(item).strip()
            if item_str.startswith("anima_adapter_type="):
                return item_str.split("=", 1)[1].strip().lower()

    network_module = str(payload.get("network_module", "")).strip().lower()
    if network_module == "lycoris.kohya":
        return "lokr"

    return "lora"


def add_anima_preflight_guidance(payload: dict, training_type: str, errors: list[str], warnings: list[str], notes: list[str]) -> None:
    if not training_type.startswith("anima"):
        return

    qwen3_path = str(payload.get("qwen3", "")).strip()
    if not qwen3_path:
        errors.append("qwen3 is required for Anima training. / Anima 训练必须填写 Qwen3 文本模型路径。")
    elif not os.path.exists(qwen3_path):
        errors.append(f"Qwen3 path does not exist: {qwen3_path}")
    elif os.path.isdir(qwen3_path):
        notes.append("Qwen3 resource: using a local model directory.")
    else:
        notes.append("Qwen3 resource: using a single checkpoint file with bundled local configs.")

    vae_path = str(payload.get("vae", "")).strip()
    if not vae_path:
        errors.append(f"vae is required for {training_type}. / {training_type} 必须填写 VAE 路径。")
    elif not os.path.exists(vae_path):
        errors.append(f"VAE path does not exist: {vae_path}")
    elif not os.path.isfile(vae_path):
        errors.append(f"VAE path must point to a model file, not a directory: {vae_path}")
    else:
        notes.append("Anima VAE path detected.")

    llm_adapter_path = str(payload.get("llm_adapter_path", "")).strip()
    if llm_adapter_path:
        if not os.path.exists(llm_adapter_path):
            errors.append(f"LLM Adapter path does not exist: {llm_adapter_path}")
        else:
            notes.append("External LLM Adapter path detected. It will override adapter weights inside the checkpoint.")

    t5_tokenizer_path = str(payload.get("t5_tokenizer_path", "")).strip()
    if t5_tokenizer_path:
        if not os.path.exists(t5_tokenizer_path):
            errors.append(f"T5 tokenizer path does not exist: {t5_tokenizer_path}")
        else:
            notes.append("Custom T5 tokenizer path detected.")
    else:
        notes.append("T5 tokenizer path left empty; Anima will fall back to the bundled configs/t5_old tokenizer if available.")

    custom_attributes = payload.get("custom_attributes")
    prefer_json_caption = False
    if isinstance(custom_attributes, dict):
        prefer_json_caption = parse_boolish(custom_attributes.get("prefer_json_caption"))
    if not prefer_json_caption:
        prefer_json_caption = parse_boolish(payload.get("prefer_json_caption"))

    if prefer_json_caption:
        notes.append("Anima JSON caption priority is enabled. Same-name .json tags will be preferred before caption_extension fallback.")

    inline_sample_prompts = str(payload.get("sample_prompts", "")).strip()
    if inline_sample_prompts and "\n" in inline_sample_prompts:
        notes.append("Multi-prompt preview rotation detected. Inline sample_prompts will be written to a temporary prompt file at launch.")

    sample_scheduler = str(payload.get("sample_scheduler", "")).strip().lower()
    if sample_scheduler and sample_scheduler != "simple":
        warnings.append("Anima preview scheduler currently falls back to simple. / 当前 Anima 预览调度器仅支持 simple，其他值会自动回退。")

    sample_sampler = str(payload.get("sample_sampler", "")).strip().lower()
    normalized_sample_sampler = {"euler_a": "euler", "k_euler_a": "k_euler"}.get(sample_sampler, sample_sampler)
    if sample_sampler and normalized_sample_sampler != sample_sampler:
        warnings.append(
            f"Anima preview sampler '{sample_sampler}' currently maps to '{normalized_sample_sampler}'. "
            f"/ 当前 Anima 预览采样器 '{sample_sampler}' 会自动改用 '{normalized_sample_sampler}'。"
        )
    elif sample_sampler and normalized_sample_sampler not in {"euler", "k_euler"}:
        warnings.append(
            "Anima preview sampler currently only supports euler / k_euler; other values will fall back to euler. "
            "/ 当前 Anima 预览采样器目前仅支持 euler / k_euler，其他值会自动回退到 euler。"
        )

    if training_type == "anima-lora":
        adapter_type = get_anima_adapter_type(payload)
        if adapter_type == "lokr":
            notes.append("Anima adapter mode: LoKr (built-in linear-layer injection).")
            warnings.append(
                "Anima LoKr currently uses the built-in linear-layer injection path in lora_anima, not the kohya LyCORIS route. "
                "/ 当前 Anima LoKr 走的是内置线性层注入实现，不是 kohya 的 LyCORIS 训练链。"
            )
        else:
            notes.append("Anima adapter mode: LoRA.")


def add_network_target_preflight_guidance(payload: dict, errors: list[str], warnings: list[str], notes: list[str]) -> None:
    if "network_train_unet_only" not in payload and "network_train_text_encoder_only" not in payload:
        return

    train_unet_only = parse_boolish(payload.get("network_train_unet_only"))
    train_text_encoder_only = parse_boolish(payload.get("network_train_text_encoder_only"))

    if train_unet_only and train_text_encoder_only:
        payload["network_train_unet_only"] = False
        payload["network_train_text_encoder_only"] = False
        warnings.append(
            "Both 'train DiT/U-Net only' and 'train text encoder only' were enabled. "
            "This build will automatically treat that combination as training both targets. "
            "/ 检测到同时勾选“仅训练 DiT/U-Net”和“仅训练文本编码器”，当前版本会自动按“两者都训练”处理。"
        )
        if parse_boolish(payload.get("cache_text_encoder_outputs")):
            payload["cache_text_encoder_outputs"] = False
            if "cache_text_encoder_outputs_to_disk" in payload:
                payload["cache_text_encoder_outputs_to_disk"] = False
            warnings.append(
                "Text encoder output caching was also disabled automatically because text encoder training is now active. "
                "/ 由于已自动改为训练文本编码器，文本编码器输出缓存也已自动关闭。"
            )
        train_unet_only = False
        train_text_encoder_only = False

    cache_text_encoder_outputs = parse_boolish(payload.get("cache_text_encoder_outputs"))

    if train_text_encoder_only:
        notes.append("Text encoder only training is enabled.")

    if cache_text_encoder_outputs and not train_unet_only:
        errors.append(
            "Text encoder training cannot be combined with cache_text_encoder_outputs. "
            "Disable text encoder output caching before training text encoder LoRA. "
            "/ 训练文本编码器时不能同时启用文本编码器输出缓存，请先关闭该缓存选项。"
        )


def add_learning_rate_preflight_guidance(payload: dict, errors: list[str], warnings: list[str], notes: list[str]) -> None:
    if not any(
        key in payload
        for key in (
            "learning_rate",
            "unet_lr",
            "text_encoder_lr",
            "self_attn_lr",
            "cross_attn_lr",
            "mlp_lr",
            "mod_lr",
            "llm_adapter_lr",
        )
    ):
        return

    model_train_type = str(payload.get("model_train_type", "")).strip().lower()
    if model_train_type == "anima-finetune":
        base_lr = parse_optional_float(payload.get("learning_rate"))
        anima_group_specs = [
            ("learning_rate", "base"),
            ("self_attn_lr", "self_attn"),
            ("cross_attn_lr", "cross_attn"),
            ("mlp_lr", "mlp"),
            ("mod_lr", "mod"),
            ("llm_adapter_lr", "llm_adapter"),
        ]

        active_groups: list[str] = []
        for key, label in anima_group_specs:
            raw_value = parse_optional_float(payload.get(key))
            effective_lr = raw_value if key == "learning_rate" else (raw_value if raw_value is not None else base_lr)
            if effective_lr not in (None, 0):
                active_groups.append(label)

        if not active_groups:
            errors.append(
                "All active Anima component learning rates resolve to 0, so the optimizer would receive no trainable parameters. "
                "Please set learning_rate or at least one of self_attn_lr / cross_attn_lr / mlp_lr / mod_lr / llm_adapter_lr "
                "to a non-zero value. "
                "/ 当前所有生效的 Anima 分组学习率都为 0，会导致没有可训练参数，请将 learning_rate 或上述任一分组学习率设为非 0。"
            )
        else:
            notes.append(f"Anima finetune active LR groups: {', '.join(active_groups)}.")
        return

    train_unet_only = parse_boolish(payload.get("network_train_unet_only"))
    train_text_encoder_only = parse_boolish(payload.get("network_train_text_encoder_only"))
    train_unet = not train_text_encoder_only
    train_text_encoder = not train_unet_only

    base_lr = parse_optional_float(payload.get("learning_rate"))
    unet_lr = parse_optional_float(payload.get("unet_lr"))
    text_encoder_lr = parse_optional_float(payload.get("text_encoder_lr"))

    effective_unet_lr = unet_lr if unet_lr is not None else base_lr
    effective_text_encoder_lr = text_encoder_lr if text_encoder_lr is not None else base_lr

    if train_unet and not train_text_encoder and effective_unet_lr == 0:
        errors.append(
            "The active DiT / U-Net learning rate resolves to 0, so the optimizer would receive no trainable parameters. "
            "Please set learning_rate or unet_lr to a non-zero value. "
            "/ 当前生效的 DiT / U-Net 学习率为 0，会导致没有可训练参数，请将 learning_rate 或 unet_lr 设为非 0。"
        )
    elif train_text_encoder and not train_unet and effective_text_encoder_lr == 0:
        errors.append(
            "The active text encoder learning rate resolves to 0, so the optimizer would receive no trainable parameters. "
            "Please set text_encoder_lr or learning_rate to a non-zero value. "
            "/ 当前生效的文本编码器学习率为 0，会导致没有可训练参数，请将 text_encoder_lr 或 learning_rate 设为非 0。"
        )
    elif train_unet and train_text_encoder and effective_unet_lr == 0 and effective_text_encoder_lr == 0:
        errors.append(
            "Both active learning rates resolve to 0, so the optimizer would receive no trainable parameters. "
            "Please set at least one active target learning rate to a non-zero value. "
            "/ 当前所有生效学习率都为 0，会导致没有可训练参数，请至少为一个训练目标设置非 0 学习率。"
        )


def run_preflight_step(
    action: Callable[[], _T],
    *,
    warnings: list[str],
    log_message: str,
    warning_message: str,
    value_error_target: Optional[list[str]] = None,
) -> Optional[_T]:
    try:
        return action()
    except ValueError as exc:
        if value_error_target is not None:
            value_error_target.append(str(exc))
        else:
            log.warning(f"{log_message}: {exc}")
            warnings.append(warning_message)
    except Exception as exc:
        log.warning(f"{log_message}: {exc}")
        warnings.append(warning_message)
    return None


def append_preflight_messages(report: Optional[dict], warnings: list[str], notes: list[str]) -> None:
    if report is None:
        return
    warnings.extend(report.get("warnings", []))
    notes.extend(report.get("notes", []))


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
    caption_extension = str(payload.get("caption_extension", ".txt"))
    root_dir = base_dir_path()
    trainer_definition = get_trainer_definition(training_type)
    direct_python_training = bool(trainer_definition and trainer_definition.direct_python)
    raw_gpu_ids = payload.get("gpu_ids")
    gpu_ids = [str(item) for item in raw_gpu_ids] if isinstance(raw_gpu_ids, list) else []
    distributed_runtime = None
    worker_sync_runtime = None

    if not trainer_supported:
        errors.append(f"Unsupported trainer type: {training_type}")

    dataset_summary = None
    if trainer_definition and trainer_definition.preflight_builder is not None:
        dataset_summary = trainer_definition.preflight_builder(payload, errors, warnings, notes)
    elif train_data_dir:
        dataset_report = run_preflight_step(
            lambda: analyze_dataset(train_data_dir, caption_extension=caption_extension),
            warnings=warnings,
            log_message="Training preflight dataset analysis failed",
            warning_message="Dataset analysis could not complete during preflight.",
            value_error_target=errors,
        )
        if dataset_report is not None:
            dataset_summary = summarize_dataset_report(dataset_report)
            warnings.extend(dataset_report.get("warnings", []))
    else:
        errors.append("train_data_dir is empty.")

    conditioning_summary = None
    if conditioning_required:
        if not conditioning_data_dir:
            errors.append("conditioning_data_dir is required for this training type.")
        else:
            conditioning_report = run_preflight_step(
                lambda: analyze_dataset(conditioning_data_dir, caption_extension=caption_extension),
                warnings=warnings,
                log_message="Training preflight conditioning dataset analysis failed",
                warning_message="Conditioning dataset analysis could not complete during preflight.",
                value_error_target=errors,
            )
            if conditioning_report is not None:
                conditioning_summary = summarize_dataset_report(conditioning_report)
                warnings.extend([f"Conditioning dataset: {message}" for message in conditioning_report.get("warnings", [])])

    if trainer_definition and trainer_definition.skip_model_validation:
        pass
    elif model_path:
        validated, message = train_utils.validate_model(model_path, training_type)
        if not validated:
            errors.append(message or "Pretrained model validation failed.")
    else:
        errors.append("pretrained_model_name_or_path is empty.")

    if resume_path:
        if not (trainer_definition and trainer_definition.preflight_handles_resume):
            if not os.path.exists(resume_path):
                errors.append("Resume path does not exist.")
            elif not os.path.isdir(resume_path):
                warnings.append("Resume path exists but is not a directory. Confirm this is a valid save_state folder.")
            else:
                notes.append(f"Resume path detected: {resume_path}")

    resume_guard = run_preflight_step(
        lambda: validate_resume_launch_guard(payload, root_dir),
        warnings=warnings,
        log_message="Training preflight resume guard failed",
        warning_message="Resume/output guard could not complete during preflight.",
    )
    if resume_guard is not None:
        guard_ok, guard_message = resume_guard
        if not guard_ok:
            errors.append(guard_message)

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

    if training_type.startswith("sdxl"):
        raw_clip_skip = payload.get("clip_skip")
        try:
            clip_skip = int(raw_clip_skip)
        except (TypeError, ValueError):
            clip_skip = 0

        if clip_skip > 1:
            warnings.append(
                f"SDXL clip_skip={clip_skip} is experimental in this build. It may cause preview artifacts or a mismatch between training and inference. "
                "Use the same SDXL clip-skip setting during inference, and revert to clip_skip=1 if you do not explicitly need this behavior. "
                "/ 当前构建中的 SDXL clip_skip>1 仍属实验性组合，可能导致预览异常，或让训练与推理表现不一致；"
                "若没有明确需求，建议改回 clip_skip=1。"
            )

    if bool(payload.get("sageattn")):
        if training_type in {"sdxl-lora", "sdxl-finetune", "sdxl-controlnet", "sdxl-controlnet-lllite", "sdxl-textual-inversion"}:
            warnings.append(
                "SDXL SageAttention is experimental in this build and requires the SageAttention runtime. / "
                "当前构建中的 SDXL SageAttention 仍属实验功能，并且需要 SageAttention 专用环境。"
            )
        elif training_type.startswith("anima"):
            warnings.append(
                "Anima SageAttention is experimental in this build and should be verified with sample previews first. / "
                "当前构建中的 Anima SageAttention 仍属实验功能，建议先用预览图验证。"
            )
        else:
            warnings.append(
                "Current trainer does not have a stable SageAttention path. The launch layer will automatically fall back to SDPA / torch. / "
                "当前训练种类尚未接好稳定的 SageAttention 路径，启动时会自动回退为 SDPA / torch。"
            )

    if bool(payload.get("torch_compile")):
        backend = str(payload.get("dynamo_backend", "inductor") or "inductor").strip() or "inductor"
        notes.append(
            f"torch.compile enabled with backend '{backend}'. The first launch and first few steps may be slower while graphs compile."
        )

    if bool(payload.get("opt_channels_last")):
        notes.append("channels_last optimization is enabled.")
        if training_type.startswith(("flux", "sd3", "anima", "lumina", "hunyuan")):
            warnings.append(
                "channels_last mainly helps convolution-heavy U-Net routes such as SD1.5 / SDXL / ControlNet. "
                "The current trainer is more transformer-heavy, so the speed gain may be limited."
            )

    add_network_target_preflight_guidance(payload, errors, warnings, notes)
    add_learning_rate_preflight_guidance(payload, errors, warnings, notes)
    add_anima_preflight_guidance(payload, training_type, errors, warnings, notes)

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

    if bool(payload.get("clear_dataset_npz_before_train")):
        notes.append(
            "clear_dataset_npz_before_train is enabled, so train/reg dataset .npz caches and metadata_cache.json will be cleared before launch."
        )

    if not direct_python_training:
        distributed_runtime = run_preflight_step(
            lambda: resolve_distributed_runtime(payload, gpu_ids),
            warnings=warnings,
            log_message="Training preflight distributed runtime analysis failed",
            warning_message="Distributed runtime analysis could not complete during preflight.",
            value_error_target=errors,
        )
        if distributed_runtime is not None:
            append_preflight_messages(distributed_runtime, warnings, notes)
            if int(distributed_runtime.get("total_num_processes", 1) or 1) > 1:
                notes.append("当前为多进程/分布式训练：train_batch_size 将按全局 batch 解释，启动时会自动换算成每卡 batch。")
            worker_sync_runtime = run_preflight_step(
                lambda: resolve_worker_sync_runtime(payload, distributed_runtime, root_dir),
                warnings=warnings,
                log_message="Training preflight worker sync analysis failed",
                warning_message="Worker sync analysis could not complete during preflight.",
                value_error_target=errors,
            )
            if worker_sync_runtime is not None:
                append_preflight_messages(worker_sync_runtime, warnings, notes)

    tensorboard_runtime = run_preflight_step(
        lambda: apply_tensorboard_runtime_config(payload, root_dir),
        warnings=warnings,
        log_message="Training preflight tensorboard runtime analysis failed",
        warning_message="TensorBoard run directory analysis could not complete during preflight.",
    )
    if tensorboard_runtime is not None:
        if tensorboard_runtime.get("enabled") and tensorboard_runtime.get("run_dir") is not None:
            notes.append(f"TensorBoard 日志预计写入: {tensorboard_runtime['run_dir']}")
            if tensorboard_runtime.get("reused_from_state"):
                notes.append("TensorBoard 将沿用 resume state 中记录的原日志目录。")
            elif tensorboard_runtime.get("resume_merge"):
                notes.append("TensorBoard 将复用当前模型最近一次已有的日志目录。")
            else:
                notes.append("TensorBoard 将创建新的日志运行目录。")

    mixed_resolution = None
    if not direct_python_training:
        def build_current_mixed_resolution():
            mixed_resolution_payload = dict(payload)
            if distributed_runtime is not None:
                mixed_resolution_payload["num_processes"] = int(distributed_runtime.get("total_num_processes", 1) or 1)
            return build_mixed_resolution_plan(mixed_resolution_payload, training_type=training_type)

        mixed_resolution = run_preflight_step(
            build_current_mixed_resolution,
            warnings=warnings,
            log_message="Training preflight mixed-resolution analysis failed",
            warning_message="Mixed-resolution planning could not complete during preflight.",
            value_error_target=errors,
        )
        if mixed_resolution is not None and mixed_resolution.enabled:
            notes.append(build_mixed_resolution_summary_text(mixed_resolution))

    cache_preflight = None
    if not direct_python_training:
        cache_preflight = run_preflight_step(
            lambda: analyze_dataset_cache_preflight(payload, training_type=training_type),
            warnings=warnings,
            log_message="Training preflight cache analysis failed",
            warning_message="Dataset cache audit could not complete during preflight.",
        )
        if cache_preflight is not None:
            errors.extend(cache_preflight.get("errors", []))
            append_preflight_messages(cache_preflight, warnings, notes)

    sample_prompt = None
    if not direct_python_training:
        sample_prompt = run_preflight_step(
            lambda: sample_prompt_builder(payload),
            warnings=warnings,
            log_message="Training preflight sample prompt preview failed",
            warning_message="Sample prompt preview could not be generated.",
            value_error_target=warnings,
        )
        if sample_prompt:
            warnings.extend([str(item) for item in sample_prompt.get("warnings", []) if str(item).strip()])
            notes.extend([str(item) for item in sample_prompt.get("notes", []) if str(item).strip()])
            if sample_prompt.get("warning"):
                warnings.append(str(sample_prompt["warning"]))

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
        "distributed": distributed_runtime,
        "distributed_sync": worker_sync_runtime,
        "mixed_resolution": asdict(mixed_resolution) if mixed_resolution is not None else None,
        "cache": cache_preflight,
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
