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
                                 APIResponseSuccess, TaggerInterrogateRequest)
from mikazuki.log import log
from mikazuki.tagger.interrogator import (available_interrogators,
                                          on_interrogate)
from mikazuki.tasks import tm
from mikazuki.utils import train_utils
from mikazuki.utils.devices import get_xformers_status, printable_devices
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


@router.post("/run")
async def create_toml_file(request: Request):
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    toml_file = os.path.join(os.getcwd(), f"config", "autosave", f"{timestamp}.toml")
    json_data = await request.body()

    config: dict = json.loads(json_data.decode("utf-8"))
    train_utils.fix_config_types(config)

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

    interrogator = available_interrogators.get(req.interrogator_model, available_interrogators["wd14-convnextv2-v2"])
    background_tasks.add_task(
        on_interrogate,
        image=None,
        batch_input_glob=req.path,
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
    return APIResponseSuccess()


@router.get("/pick_file")
async def pick_file(picker_type: str):
    if picker_type == "folder":
        coro = asyncio.to_thread(open_directory_selector, "")
    elif picker_type == "model-file":
        file_types = [("checkpoints", "*.safetensors;*.ckpt;*.pt"), ("all files", "*.*")]
        coro = asyncio.to_thread(open_file_selector, "", "Select file", file_types)
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
    if not printable_devices:
        return APIResponse(status="pending", message="GPU detection is still in progress.")

    xformers_info = get_xformers_status()
    return APIResponseSuccess(data={
        "cards": printable_devices,
        "xformers": {
            "installed": xformers_info["installed"],
            "supported": xformers_info["supported"],
            "reason": xformers_info["reason"],
        }
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
