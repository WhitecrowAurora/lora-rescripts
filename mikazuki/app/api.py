import asyncio
import hashlib
import json
import os
import random
import re

from glob import glob
from datetime import datetime
from pathlib import Path
from typing import Tuple, Optional

import toml
from fastapi import APIRouter, BackgroundTasks, Request

import mikazuki.process as process
from mikazuki import launch_utils
from mikazuki.app.config import app_config
from mikazuki.app.models import (APIResponse, APIResponseFail,
                                 APIResponseSuccess, CaptionBackupListRequest,
                                 CaptionBackupRequest,
                                 CaptionBackupRestoreRequest,
                                 CaptionCleanupRequest,
                                 DatasetAnalysisRequest,
                                 MaskedLossAuditRequest,
                                 TaggerInterrogateRequest)
from mikazuki.log import log
from mikazuki.tagger.interrogator import (available_interrogators,
                                          on_interrogate)
from mikazuki.tasks import tm
from mikazuki.utils.caption_backup import (create_caption_backup,
                                           list_caption_backups,
                                           NO_CAPTIONS_TO_BACKUP_MESSAGE,
                                           restore_caption_backup)
from mikazuki.utils.caption_cleanup import (apply_caption_cleanup,
                                            preview_caption_cleanup)
from mikazuki.utils.training_preflight import analyze_training_preflight
from mikazuki.utils import train_utils
from mikazuki.utils.dataset_analysis import analyze_dataset
from mikazuki.utils.masked_loss_audit import analyze_masked_loss_dataset
from mikazuki.utils.devices import get_xformers_status, printable_devices
from mikazuki.utils.runtime_dependencies import (
    analyze_training_runtime_dependencies,
    build_runtime_status_payload,
)
from mikazuki.utils.tk_window import (open_directory_selector,
                                      open_file_selector)

router = APIRouter()

avaliable_scripts = [
    "networks/extract_lora_from_models.py",
    "networks/extract_lora_from_dylora.py",
    "networks/merge_lora.py",
    "networks/sdxl_merge_lora.py",
    "networks/svd_merge_lora.py",
    "networks/flux_extract_lora.py",
    "networks/resize_lora.py",
    "networks/lora_interrogator.py",
    "networks/flux_merge_lora.py",
    "networks/convert_flux_lora.py",
    "networks/convert_hunyuan_image_lora_to_comfy.py",
    "networks/convert_anima_lora_to_comfy.py",
    "networks/check_lora_weights.py",
    "tools/merge_models.py",
    "tools/merge_sd3_safetensors.py",
    "tools/convert_diffusers_to_flux.py",
    "tools/convert_diffusers20_original_sd.py",
    "tools/show_metadata.py",
    "tools/resize_images_to_resolution.py",
    "tools/canny.py",
    "tools/detect_face_rotate.py",
    "tools/latent_upscaler.py",
]

avaliable_schemas = []
avaliable_presets = []

script_positional_args = {
    "networks/convert_hunyuan_image_lora_to_comfy.py": ["src_path", "dst_path"],
    "networks/convert_anima_lora_to_comfy.py": ["src_path", "dst_path"],
    "networks/check_lora_weights.py": ["file"],
    "tools/resize_images_to_resolution.py": ["src_img_folder", "dst_img_folder"],
    "tools/convert_diffusers20_original_sd.py": ["model_to_load", "model_to_save"],
}

trainer_mapping = {
    "sd-lora": "./scripts/stable/train_network.py",
    "sdxl-lora": "./scripts/stable/sdxl_train_network.py",

    "sd-dreambooth": "./scripts/stable/train_db.py",
    "sdxl-finetune": "./scripts/stable/sdxl_train.py",
    "sd-controlnet": "./scripts/stable/train_control_net.py",
    "sdxl-controlnet": "./scripts/stable/sdxl_train_control_net.py",
    "sdxl-controlnet-lllite": "./scripts/stable/sdxl_train_control_net_lllite.py",
    "flux-controlnet": "./scripts/stable/flux_train_control_net.py",
    "sd-textual-inversion": "./scripts/stable/train_textual_inversion.py",
    "sd-textual-inversion-xti": "./scripts/stable/train_textual_inversion_XTI.py",
    "sdxl-textual-inversion": "./scripts/stable/sdxl_train_textual_inversion.py",

    "sd3-lora": "./scripts/dev/sd3_train_network.py",
    "sd3-finetune": "./scripts/stable/sd3_train.py",
    "flux-lora": "./scripts/dev/flux_train_network.py",
    "flux-finetune": "./scripts/dev/flux_train.py",
    "lumina-lora": "./scripts/stable/lumina_train_network.py",
    "lumina-finetune": "./scripts/stable/lumina_train.py",
    "hunyuan-image-lora": "./scripts/stable/hunyuan_image_train_network.py",
    "anima-lora": "./scripts/stable/anima_train_network.py",
    "anima-finetune": "./scripts/stable/anima_train.py",
}


async def load_schemas():
    avaliable_schemas.clear()

    schema_dir = Path(os.getcwd()) / "mikazuki" / "schema"
    schemas = sorted(p for p in schema_dir.iterdir() if p.is_file() and p.suffix == ".ts")

    def lambda_hash(x):
        return hashlib.md5(x.encode()).hexdigest()

    for schema_path in schemas:
        with open(schema_path, encoding="utf-8") as f:
            content = f.read()
            avaliable_schemas.append({
                "name": schema_path.stem,
                "schema": content,
                "hash": lambda_hash(content)
            })


async def load_presets():
    avaliable_presets.clear()

    preset_dir = Path(os.getcwd()) / "config" / "presets"
    if not preset_dir.exists():
        return
    presets = sorted(p for p in preset_dir.iterdir() if p.is_file() and p.suffix == ".toml")

    for preset_path in presets:
        with open(preset_path, encoding="utf-8") as f:
            content = f.read()
            avaliable_presets.append(toml.loads(content))


def get_sample_prompts(config: dict) -> Tuple[Optional[str], str]:
    # backward compatibility
    if "sample_prompts" in config and "positive_prompts" not in config:
        return None, config["sample_prompts"]

    train_data_dir = config["train_data_dir"]
    sub_dir = [dir for dir in glob(os.path.join(train_data_dir, '*')) if os.path.isdir(dir)]

    positive_prompts = config.pop('positive_prompts', None)
    negative_prompts = config.pop('negative_prompts', '')
    sample_width = config.pop('sample_width', 512)
    sample_height = config.pop('sample_height', 512)
    sample_cfg = config.pop('sample_cfg', 7)
    sample_seed = config.pop('sample_seed', 2333)
    sample_steps = config.pop('sample_steps', 24)
    randomly_choice_prompt = config.pop('randomly_choice_prompt', False)

    if randomly_choice_prompt:
        if len(sub_dir) != 1:
            raise ValueError('训练数据集下有多个子文件夹，无法启用随机选取 Prompt 功能')

        txt_files = glob(os.path.join(sub_dir[0], '*.txt'))
        if not txt_files:
            raise ValueError('训练数据集路径没有 txt 文件')
        try:
            sample_prompt_file = random.choice(txt_files)
            with open(sample_prompt_file, 'r', encoding='utf-8') as f:
                positive_prompts = f.read()
        except IOError:
            log.error(f"读取 {sample_prompt_file} 文件失败")

    return positive_prompts, f'{positive_prompts} --n {negative_prompts}  --w {sample_width} --h {sample_height} --l {sample_cfg}  --s {sample_steps}  --d {sample_seed}'


def read_prompt_text_file(path: str) -> str:
    return Path(path).read_text(encoding="utf-8", errors="ignore")


def build_sample_prompt_file_name(config: dict) -> str:
    base_name = str(config.get("output_name", "")).strip() or str(config.get("model_train_type", "")).strip() or "sample-prompts"
    safe_name = re.sub(r"[^0-9A-Za-z._-]+", "-", base_name).strip("._-") or "sample-prompts"
    return f"{safe_name}-sample-prompts.txt"


def build_prompt_preview_text(content: str, max_lines: int = 3) -> Tuple[str, int]:
    non_empty_lines = [line.strip() for line in content.splitlines() if line.strip()]
    if not non_empty_lines:
        return "(prompt text is empty)", 0
    return "\n".join(non_empty_lines[:max_lines]), len(non_empty_lines)


def build_sample_prompt_record(config: dict) -> Optional[dict]:
    enable_preview = bool(config.get("enable_preview"))
    notes: list[str] = []
    warnings: list[str] = []

    if not enable_preview:
        notes.append("Preview images are currently disabled. This prompt will only be used after enable_preview is turned on.")

    prompt_file = str(config.get("prompt_file", "")).strip()
    if prompt_file:
        if not os.path.exists(prompt_file):
            raise ValueError(f"Prompt 文件 {prompt_file} 不存在，请检查路径。")

        content = read_prompt_text_file(prompt_file)
        preview, line_count = build_prompt_preview_text(content)
        return {
            "enabled": enable_preview,
            "source": "prompt_file",
            "detail": prompt_file,
            "preview": preview,
            "content": content,
            "line_count": line_count,
            "suggested_file_name": Path(prompt_file).name or build_sample_prompt_file_name(config),
            "warnings": warnings,
            "notes": notes,
        }

    legacy_sample_prompts = str(config.get("sample_prompts", "")).strip()
    if legacy_sample_prompts and "positive_prompts" not in config:
        if os.path.isfile(legacy_sample_prompts):
            content = read_prompt_text_file(legacy_sample_prompts)
            preview, line_count = build_prompt_preview_text(content)
            return {
                "enabled": enable_preview,
                "source": "legacy_sample_prompts_file",
                "detail": legacy_sample_prompts,
                "preview": preview,
                "content": content,
                "line_count": line_count,
                "suggested_file_name": Path(legacy_sample_prompts).name or build_sample_prompt_file_name(config),
                "warnings": warnings,
                "notes": notes + ["Using imported legacy sample_prompts file."],
            }

        preview, line_count = build_prompt_preview_text(legacy_sample_prompts)
        return {
            "enabled": enable_preview,
            "source": "legacy_sample_prompts_inline",
            "detail": "Imported legacy sample_prompts value",
            "preview": preview,
            "content": legacy_sample_prompts,
            "line_count": line_count,
            "suggested_file_name": build_sample_prompt_file_name(config),
            "warnings": warnings,
            "notes": notes + ["Using imported legacy sample_prompts text."],
        }

    config_copy = dict(config)
    _, sample_prompt = get_sample_prompts(config_copy)
    if sample_prompt is None:
        return None

    source = "generated"
    detail = "Current positive / negative prompt fields"
    if config.get("randomly_choice_prompt"):
        source = "random_dataset_prompt_preview"
        detail = "Random caption-derived preview from dataset"

    preview, line_count = build_prompt_preview_text(sample_prompt)
    return {
        "enabled": enable_preview,
        "source": source,
        "detail": detail,
        "preview": preview,
        "content": sample_prompt,
        "line_count": line_count,
        "suggested_file_name": build_sample_prompt_file_name(config),
        "warnings": warnings,
        "notes": notes,
    }


def apply_attention_backend_fallback(config: dict, gpu_ids) -> Optional[str]:
    if config.get("mem_eff_attn", False):
        return None

    if not config.get("xformers", False):
        return None

    xformers_info = get_xformers_status(gpu_ids)
    if xformers_info.get("selected_supported", xformers_info.get("supported", False)):
        return None

    config["xformers"] = False

    if "sdpa" in config:
        config["sdpa"] = True
        message = (
            f"检测到当前显卡或环境暂不支持 xformers（{xformers_info['reason']}），"
            "已自动切换为 sdpa 训练。"
        )
    else:
        message = (
            f"检测到当前显卡或环境暂不支持 xformers（{xformers_info['reason']}），"
            "已自动禁用 xformers。"
        )

    log.warning(message)
    return message


def simulate_attention_backend_fallback_warning(config: dict, gpu_ids) -> Optional[str]:
    if config.get("mem_eff_attn", False):
        return None
    if not config.get("xformers", False):
        return None

    xformers_info = get_xformers_status(gpu_ids)
    if xformers_info.get("selected_supported", xformers_info.get("supported", False)):
        return None

    if "sdpa" in config:
        return (
            f"Current GPU/runtime would fall back from xformers to sdpa ({xformers_info['reason']})."
        )
    return f"Current GPU/runtime would disable xformers ({xformers_info['reason']})."


def maybe_create_caption_backup(
    *,
    path: str,
    caption_extension: str,
    recursive: bool,
    snapshot_name: str,
    allow_missing_captions: bool = False,
) -> tuple[Optional[dict], list[str]]:
    warnings: list[str] = []
    try:
        backup = create_caption_backup(
            path=path,
            caption_extension=caption_extension,
            recursive=recursive,
            snapshot_name=snapshot_name,
        )
    except ValueError as exc:
        if allow_missing_captions and str(exc) == NO_CAPTIONS_TO_BACKUP_MESSAGE:
            warnings.append("No existing caption files were found, so no backup snapshot was created.")
            return None, warnings
        raise

    return backup, warnings


def build_sample_prompt_preview(config: dict) -> Optional[dict]:
    record = build_sample_prompt_record(config)
    if not record:
        return None
    return {
        "source": record["source"],
        "detail": record["detail"],
        "preview": record["preview"],
        "warnings": record.get("warnings", []),
        "notes": record.get("notes", []),
    }


@router.post("/run")
async def create_toml_file(request: Request):
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    toml_file = os.path.join(os.getcwd(), f"config", "autosave", f"{timestamp}.toml")
    json_data = await request.body()

    config: dict = json.loads(json_data.decode("utf-8"))
    try:
        train_utils.fix_config_types(config)
    except (TypeError, ValueError) as exc:
        return APIResponseFail(message=f"Invalid config value / 配置值无效: {exc}")

    gpu_ids = config.pop("gpu_ids", None)
    start_warnings = []

    suggest_cpu_threads = 8 if len(train_utils.get_total_images(config["train_data_dir"])) > 200 else 2
    model_train_type = config.pop("model_train_type", "sd-lora")
    if model_train_type not in trainer_mapping:
        return APIResponseFail(message=f"Unsupported trainer type: {model_train_type}")
    trainer_file = trainer_mapping[model_train_type]

    if model_train_type != "sdxl-finetune":
        if not train_utils.validate_data_dir(config["train_data_dir"]):
            return APIResponseFail(message="训练数据集路径不存在或没有图片，请检查目录。")

    if model_train_type in {"sd-controlnet", "sdxl-controlnet", "flux-controlnet"}:
        conditioning_data_dir = config.get("conditioning_data_dir", "")
        if not conditioning_data_dir or not train_utils.validate_data_dir(conditioning_data_dir):
            return APIResponseFail(message="条件图数据集路径不存在或没有图片，请检查目录。")

    validated, message = train_utils.validate_model(config["pretrained_model_name_or_path"], model_train_type)
    if not validated:
        return APIResponseFail(message=message)

    attention_fallback_message = apply_attention_backend_fallback(config, gpu_ids)
    if attention_fallback_message:
        start_warnings.append(attention_fallback_message)

    dependency_report = analyze_training_runtime_dependencies(config)
    if not dependency_report["ready"]:
        missing_details = []
        for dependency in dependency_report["missing"]:
            package_label = dependency["display_name"]
            reason = dependency.get("reason") or "Package is not importable."
            requirement = ", ".join(dependency.get("required_for", []))
            missing_details.append(f"{package_label} ({requirement}): {reason}")
        return APIResponseFail(
            message="Required runtime dependencies are missing or broken: " + " | ".join(missing_details)
        )

    if "prompt_file" in config and config["prompt_file"].strip() != "":
        prompt_file = config["prompt_file"].strip()
        if not os.path.exists(prompt_file):
            return APIResponseFail(message=f"Prompt 文件 {prompt_file} 不存在，请检查路径。")
        config["sample_prompts"] = prompt_file
    else:
        try:
            positive_prompt, sample_prompts_arg = get_sample_prompts(config=config)

            if positive_prompt is not None and train_utils.is_promopt_like(sample_prompts_arg):
                sample_prompts_file = os.path.join(os.getcwd(), f"config", "autosave", f"{timestamp}-prompt.txt")
                with open(sample_prompts_file, "w", encoding="utf-8") as f:
                    f.write(sample_prompts_arg)
                config["sample_prompts"] = sample_prompts_file
                log.info(f"Wrote prompts to file {sample_prompts_file}")

        except ValueError as e:
            log.error(f"Error while processing prompts: {e}")
            return APIResponseFail(message=str(e))

    with open(toml_file, "w", encoding="utf-8") as f:
        f.write(toml.dumps(config))

    result = process.run_train(toml_file, trainer_file, gpu_ids, suggest_cpu_threads)

    if start_warnings:
        result.data = result.data or {}
        result.data["warnings"] = start_warnings
        if result.message:
            result.message = f"{result.message} {' '.join(start_warnings)}"
        else:
            result.message = " ".join(start_warnings)

    return result


@router.post("/train/preflight")
async def training_preflight(request: Request) -> APIResponse:
    json_data = await request.body()
    config: dict = json.loads(json_data.decode("utf-8"))
    try:
        train_utils.fix_config_types(config)
    except (TypeError, ValueError) as exc:
        return APIResponseFail(message=f"Invalid config value / 配置值无效: {exc}")

    gpu_ids = config.get("gpu_ids")
    training_type = str(config.get("model_train_type", "sd-lora"))

    result = analyze_training_preflight(
        config,
        training_type=training_type,
        trainer_supported=training_type in trainer_mapping,
        conditioning_required=training_type in {"sd-controlnet", "sdxl-controlnet", "flux-controlnet"},
        sample_prompt_builder=build_sample_prompt_preview,
        attention_fallback_checker=lambda payload: simulate_attention_backend_fallback_warning(payload, gpu_ids),
    )

    return APIResponseSuccess(data=result)


@router.post("/train/sample_prompt")
async def training_sample_prompt(request: Request) -> APIResponse:
    json_data = await request.body()
    config: dict = json.loads(json_data.decode("utf-8"))
    try:
        train_utils.fix_config_types(config)
    except (TypeError, ValueError) as exc:
        return APIResponseFail(message=f"Invalid config value / 配置值无效: {exc}")

    try:
        result = build_sample_prompt_record(config)
        if not result:
            return APIResponseFail(message="Current config does not expose a sample prompt preview.")
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Training sample prompt preview failed")
        return APIResponseFail(message="Sample prompt preview failed.")

    return APIResponseSuccess(data=result)


@router.post("/run_script")
async def run_script(request: Request, background_tasks: BackgroundTasks):
    paras = await request.body()
    j = json.loads(paras.decode("utf-8"))
    script_name = j["script_name"]
    if script_name not in avaliable_scripts:
        return APIResponseFail(message="Script not found")
    del j["script_name"]

    script_path = Path(os.getcwd()) / "scripts" / script_name
    if not script_path.exists():
        for candidate_root in ["stable", "dev"]:
            candidate = Path(os.getcwd()) / "scripts" / candidate_root / script_name
            if candidate.exists():
                script_path = candidate
                break

    if not script_path.exists():
        return APIResponseFail(message=f"Script path not found: {script_name}")

    script_path, script_env = process.prepare_python_script(script_path)
    cmd = [str(launch_utils.python_bin), str(process.get_script_runner_path()), str(script_path)]

    positional_args = script_positional_args.get(script_name, [])
    for arg_name in positional_args:
        value = j.pop(arg_name, None)
        if value is not None and value != "":
            cmd.append(str(value))

    for k, v in j.items():
        if isinstance(v, bool):
            if v:
                cmd.append(f"--{k}")
        elif isinstance(v, list):
            if len(v) > 0:
                cmd.append(f"--{k}")
                cmd.extend(str(item) for item in v)
        else:
            if v is None or v == "":
                continue
            cmd.append(f"--{k}")
            cmd.append(str(v))
    background_tasks.add_task(launch_utils.run, cmd, custom_env=script_env)
    return APIResponseSuccess()


@router.post("/interrogate")
async def run_interrogate(req: TaggerInterrogateRequest, background_tasks: BackgroundTasks):
    try:
        import onnxruntime  # noqa: F401
    except ImportError:
        return APIResponseFail(message="onnxruntime is not installed, please reinstall dependencies and try again.")

    batch_path = req.path.strip()
    if not batch_path:
        return APIResponseFail(message="Input folder is empty / 输入的图片文件夹为空。")
    if not os.path.isdir(batch_path):
        return APIResponseFail(message="Input path is not a valid folder / 输入路径不是有效文件夹。")

    response_warnings: list[str] = []
    backup_result = None
    if req.create_backup_before_write and req.batch_output_action_on_conflict != "ignore":
        backup_result, backup_warnings = maybe_create_caption_backup(
            path=batch_path,
            caption_extension=".txt",
            recursive=req.batch_input_recursive,
            snapshot_name=req.backup_snapshot_name.strip() or f"pre-batch-tagger-{req.interrogator_model}",
            allow_missing_captions=True,
        )
        response_warnings.extend(backup_warnings)

    interrogator = available_interrogators.get(req.interrogator_model, available_interrogators["wd14-convnextv2-v2"])
    background_tasks.add_task(
        on_interrogate,
        image=None,
        batch_input_glob=batch_path,
        batch_input_recursive=req.batch_input_recursive,
        batch_output_dir="",
        batch_output_filename_format="[name].[output_extension]",
        batch_output_action_on_conflict=req.batch_output_action_on_conflict,
        batch_remove_duplicated_tag=True,
        batch_output_save_json=False,
        interrogator=interrogator,
        threshold=req.threshold,
        character_threshold=req.character_threshold,
        add_rating_tag=req.add_rating_tag,
        add_model_tag=req.add_model_tag,
        additional_tags=req.additional_tags,
        exclude_tags=req.exclude_tags,
        sort_by_alphabetical_order=False,
        add_confident_as_weight=False,
        replace_underscore=req.replace_underscore,
        replace_underscore_excludes=req.replace_underscore_excludes,
        escape_tag=req.escape_tag,
        unload_model_after_running=True
    )
    message = f"Batch interrogate started for {batch_path}"
    if backup_result is not None:
        message = f"{message} Created backup {backup_result['archive_name']} first."
    elif response_warnings:
        message = f"{message} {response_warnings[0]}"

    data = {}
    if backup_result is not None:
        data["backup"] = backup_result
    if response_warnings:
        data["warnings"] = response_warnings

    return APIResponseSuccess(message=message, data=data or None)


@router.post("/dataset/analyze")
async def dataset_analyze(req: DatasetAnalysisRequest) -> APIResponse:
    try:
        result = analyze_dataset(
            path=req.path,
            caption_extension=req.caption_extension,
            top_tags=req.top_tags,
            sample_limit=req.sample_limit,
        )
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Dataset analysis failed")
        return APIResponseFail(message="Dataset analysis failed / 数据集分析失败，请查看日志。")

    return APIResponseSuccess(data=result)


@router.post("/dataset/masked_loss_audit")
async def dataset_masked_loss_audit(req: MaskedLossAuditRequest) -> APIResponse:
    try:
        result = analyze_masked_loss_dataset(
            path=req.path,
            recursive=req.recursive,
            sample_limit=req.sample_limit,
        )
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Masked-loss dataset audit failed")
        return APIResponseFail(message="Masked-loss dataset audit failed / 蒙版损失数据集检查失败，请查看日志。")

    return APIResponseSuccess(data=result)


@router.get("/interrogators")
async def get_interrogators() -> APIResponse:
    default_interrogator = TaggerInterrogateRequest.model_fields["interrogator_model"].default
    return APIResponseSuccess(data={
        "default": default_interrogator,
        "interrogators": [
            {
                "name": name,
                "kind": "cl" if name.startswith("cl_") else "wd",
                "repo_id": getattr(interrogator, "repo_id", None),
                "is_default": name == default_interrogator,
            }
            for name, interrogator in available_interrogators.items()
        ],
    })


@router.post("/captions/cleanup/preview")
async def captions_cleanup_preview(req: CaptionCleanupRequest) -> APIResponse:
    try:
        preview_payload = req.model_dump(exclude={"create_backup_before_apply", "backup_snapshot_name"})
        result = preview_caption_cleanup(**preview_payload)
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Caption cleanup preview failed")
        return APIResponseFail(message="Caption cleanup preview failed / Caption 清洗预览失败，请查看日志。")

    return APIResponseSuccess(data=result)


@router.post("/captions/cleanup/apply")
async def captions_cleanup_apply(req: CaptionCleanupRequest) -> APIResponse:
    try:
        backup_result = None
        backup_warnings: list[str] = []
        if req.create_backup_before_apply:
            backup_result, backup_warnings = maybe_create_caption_backup(
                path=req.path,
                caption_extension=req.caption_extension,
                recursive=req.recursive,
                snapshot_name=req.backup_snapshot_name.strip() or "pre-caption-cleanup",
            )

        cleanup_payload = req.model_dump(exclude={"create_backup_before_apply", "backup_snapshot_name"})
        result = apply_caption_cleanup(**cleanup_payload)
        if backup_result is not None:
            result["backup"] = backup_result
        if backup_warnings:
            result["warnings"] = [*result.get("warnings", []), *backup_warnings]
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Caption cleanup apply failed")
        return APIResponseFail(message="Caption cleanup apply failed / Caption 清洗应用失败，请查看日志。")

    message = f"Updated {result['summary']['changed_file_count']} caption files."
    if backup_result is not None:
        message = f"{message} Created backup {backup_result['archive_name']} first."
    return APIResponseSuccess(message=message, data=result)


@router.post("/captions/backups/create")
async def captions_backup_create(req: CaptionBackupRequest) -> APIResponse:
    try:
        result = create_caption_backup(**req.model_dump())
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Caption backup creation failed")
        return APIResponseFail(message="Caption backup creation failed / Caption 备份创建失败，请查看日志。")

    return APIResponseSuccess(message=f"Created caption backup {result['archive_name']}", data=result)


@router.post("/captions/backups/list")
async def captions_backup_list(req: CaptionBackupListRequest) -> APIResponse:
    try:
        result = list_caption_backups(path=req.path.strip() or None)
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Caption backup listing failed")
        return APIResponseFail(message="Caption backup listing failed / Caption 备份列表读取失败，请查看日志。")

    return APIResponseSuccess(data={"backups": result})


@router.post("/captions/backups/restore")
async def captions_backup_restore(req: CaptionBackupRestoreRequest) -> APIResponse:
    try:
        result = restore_caption_backup(**req.model_dump())
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Caption backup restore failed")
        return APIResponseFail(message="Caption backup restore failed / Caption 备份恢复失败，请查看日志。")

    return APIResponseSuccess(message=f"Restored {result['restored_file_count']} caption files.", data=result)


@router.get("/pick_file")
async def pick_file(picker_type: str):
    if picker_type == "folder":
        coro = asyncio.to_thread(open_directory_selector, "")
    elif picker_type == "model-file":
        file_types = [("checkpoints", "*.safetensors;*.ckpt;*.pt"), ("all files", "*.*")]
        coro = asyncio.to_thread(open_file_selector, "", "Select file", file_types)
    elif picker_type == "text-file":
        file_types = [("text files", "*.txt;*.text;*.prompt"), ("all files", "*.*")]
        coro = asyncio.to_thread(open_file_selector, "", "Select prompt file", file_types)
    else:
        return APIResponseFail(message="Invalid picker type")

    result = await coro
    if result == "":
        return APIResponseFail(message="用户取消选择")

    return APIResponseSuccess(data={
        "path": result
    })


@router.get("/get_files")
async def get_files(pick_type) -> APIResponse:
    pick_preset = {
        "model-file": {
            "type": "file",
            "path": "./sd-models",
            "filter": "(.safetensors|.ckpt|.pt)"
        },
        "model-saved-file": {
            "type": "file",
            "path": "./output",
            "filter": "(.safetensors|.ckpt|.pt)"
        },
        "train-dir": {
            "type": "folder",
            "path": "./train",
            "filter": None
        },
    }

    folder_blacklist = [".ipynb_checkpoints", ".DS_Store"]

    def list_path_or_files(preset_info):
        path = Path(preset_info["path"])
        file_type = preset_info["type"]
        regex_filter = preset_info["filter"]
        result_list = []

        if not path.exists():
            return result_list

        if file_type == "file":
            if regex_filter:
                pattern = re.compile(regex_filter)
                files = [f for f in path.glob("**/*") if f.is_file() and pattern.search(f.name)]
            else:
                files = [f for f in path.glob("**/*") if f.is_file()]
            for file in files:
                result_list.append({
                    "path": str(file.resolve().absolute()).replace("\\", "/"),
                    "name": file.name,
                    "size": f"{round(file.stat().st_size / (1024**3),2)} GB"
                })
        elif file_type == "folder":
            folders = [f for f in path.iterdir() if f.is_dir()]
            for folder in folders:
                if folder.name in folder_blacklist:
                    continue
                result_list.append({
                    "path": str(folder.resolve().absolute()).replace("\\", "/"),
                    "name": folder.name,
                    "size": 0
                })

        return result_list

    if pick_type not in pick_preset:
        return APIResponseFail(message="Invalid request")

    dirs = list_path_or_files(pick_preset[pick_type])
    return APIResponseSuccess(data={
        "files": dirs
    })


@router.get("/tasks", response_model_exclude_none=True)
async def get_tasks() -> APIResponse:
    return APIResponseSuccess(data={
        "tasks": tm.dump()
    })


@router.get("/tasks/terminate/{task_id}", response_model_exclude_none=True)
async def terminate_task(task_id: str):
    tm.terminate_task(task_id)
    return APIResponseSuccess()


@router.get("/graphic_cards")
async def list_avaliable_cards() -> APIResponse:
    runtime_info = build_runtime_status_payload()
    if not printable_devices:
        return APIResponse(
            status="pending",
            message="GPU detection is still in progress.",
            data={
                "cards": [],
                "xformers": {
                    "version": None,
                    "installed": False,
                    "supported": False,
                    "reason": "GPU detection is still in progress.",
                },
                "runtime": runtime_info,
            },
        )

    xformers_info = get_xformers_status()
    return APIResponseSuccess(data={
        "cards": printable_devices,
        "xformers": {
            "version": xformers_info.get("version"),
            "installed": xformers_info["installed"],
            "supported": xformers_info["supported"],
            "reason": xformers_info["reason"],
        },
        "runtime": runtime_info,
    })


@router.get("/schemas/hashes")
async def list_schema_hashes() -> APIResponse:
    if os.environ.get("MIKAZUKI_SCHEMA_HOT_RELOAD", "0") == "1":
        log.info("Hot reloading schemas")
        await load_schemas()

    return APIResponseSuccess(data={
        "schemas": [
            {
                "name": schema["name"],
                "hash": schema["hash"]
            }
            for schema in avaliable_schemas
        ]
    })


@router.get("/schemas/all")
async def get_all_schemas() -> APIResponse:
    return APIResponseSuccess(data={
        "schemas": avaliable_schemas
    })


@router.get("/presets")
async def get_presets() -> APIResponse:
    if os.environ.get("MIKAZUKI_SCHEMA_HOT_RELOAD", "0") == "1":
        log.info("Hot reloading presets")
        await load_presets()

    return APIResponseSuccess(data={
        "presets": avaliable_presets
    })


@router.get("/config/saved_params")
async def get_saved_params() -> APIResponse:
    saved_params = app_config["saved_params"]
    return APIResponseSuccess(data=saved_params)


@router.get("/config/summary")
async def get_config_summary() -> APIResponse:
    return APIResponseSuccess(data={
        "last_path": app_config["last_path"] or "",
        "saved_param_keys": sorted((app_config["saved_params"] or {}).keys()),
        "saved_param_count": len(app_config["saved_params"] or {}),
        "config_path": str(app_config.path),
    })


@router.get("/scripts")
async def get_available_scripts() -> APIResponse:
    return APIResponseSuccess(data={
        "scripts": [
            {
                "name": script_name,
                "positional_args": script_positional_args.get(script_name, []),
                "category": script_name.split("/", 1)[0] if "/" in script_name else "misc",
            }
            for script_name in avaliable_scripts
        ]
    })
