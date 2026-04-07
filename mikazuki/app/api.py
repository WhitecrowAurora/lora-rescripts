import asyncio
import hashlib
import json
import os
import random
import re

from glob import glob
from datetime import datetime
from dataclasses import asdict
from pathlib import Path
from typing import Tuple, Optional

import toml
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.responses import FileResponse

import mikazuki.process as process
from mikazuki import launch_utils
from mikazuki.app.config import app_config
from mikazuki.app.models import (APIResponse, APIResponseFail,
                                 APIResponseSuccess, CaptionBackupListRequest,
                                 CaptionBackupRequest,
                                 CaptionBackupRestoreRequest,
                                 CaptionCleanupRequest,
                                 DatasetAnalysisRequest,
                                 ImageResizeRequest,
                                 MaskedLossAuditRequest,
                                 TaggerInterrogateRequest)
from mikazuki.log import log
from mikazuki.tagger.llm import (
    LLM_INTERROGATORS,
    LLM_TEMPLATE_PRESETS,
    get_llm_interrogator_meta,
    is_llm_interrogator,
    run_llm_interrogate,
)
from mikazuki.tagger.interrogator import (available_interrogators,
                                          on_interrogate)
from mikazuki.tasks import tm, TaskStatus as _TaskStatus
from mikazuki.utils.caption_backup import (create_caption_backup,
                                           list_caption_backups,
                                           NO_CAPTIONS_TO_BACKUP_MESSAGE,
                                           restore_caption_backup)
from mikazuki.utils.caption_cleanup import (apply_caption_cleanup,
                                             preview_caption_cleanup)
from mikazuki.utils.dataset_cache_preflight import analyze_dataset_cache_preflight
from mikazuki.utils.distributed import resolve_distributed_runtime
from mikazuki.utils.distributed_sync import resolve_worker_sync_runtime
from mikazuki.utils.mixed_resolution import (
    build_mixed_resolution_plan,
    build_mixed_resolution_summary_text,
)
from mikazuki.utils.training_preflight import analyze_training_preflight
from mikazuki.utils import train_utils
from mikazuki.utils.dataset_analysis import analyze_dataset
from mikazuki.utils.masked_loss_audit import analyze_masked_loss_dataset
from mikazuki.utils.image_resize_runtime import (
    build_image_resize_preview_manifest,
    resolve_image_resize_file,
    resolve_image_resize_path,
    run_image_resize_job,
)
from mikazuki.utils.devices import (
    get_attention_runtime_mode,
    get_xformers_status,
    printable_devices,
)
from mikazuki.utils.runtime_dependencies import (
    analyze_training_runtime_dependencies,
    build_runtime_status_payload,
)
from mikazuki.utils.trainer_registry import get_trainer_definition
from mikazuki.utils.backend_status import (
    read_backend_status,
    request_backend_restart,
)
from mikazuki.utils.yolo_runtime import (
    build_yolo_runtime_payload,
    start_yolo_dependency_install,
)
from mikazuki.utils.aesthetic_runtime import (
    build_aesthetic_runtime_payload,
    start_aesthetic_dependency_install,
)
from mikazuki.utils.aesthetic_infer_runtime import aesthetic_infer_manager
from mikazuki.utils.frontend_profiles import (
    PLUGIN_ROOT,
    install_github_frontend_plugin,
    list_frontend_profiles,
    parse_github_repo_url,
    resolve_frontend_profile,
    resolve_frontend_profile_id,
    uninstall_frontend_plugin,
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

async def load_schemas():
    avaliable_schemas.clear()

    schema_dir = launch_utils.base_dir_path() / "mikazuki" / "schema"
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

    preset_dir = launch_utils.base_dir_path() / "config" / "presets"
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
    sub_dirs = [dir for dir in glob(os.path.join(train_data_dir, '*')) if os.path.isdir(dir)]
    sub_dirs_with_txt = [dir for dir in sub_dirs if glob(os.path.join(dir, '*.txt'))]
    root_txt_files = glob(os.path.join(train_data_dir, '*.txt'))

    enable_preview = parse_boolish(config.get('enable_preview', False))
    positive_prompts = config.pop('positive_prompts', None)
    negative_prompts = config.pop('negative_prompts', '')
    sample_width = config.pop('sample_width', 512)
    sample_height = config.pop('sample_height', 512)
    sample_cfg = config.pop('sample_cfg', 7)
    sample_seed = config.pop('sample_seed', 2333)
    sample_steps = config.pop('sample_steps', 24)
    randomly_choice_prompt = parse_boolish(config.pop('randomly_choice_prompt', False))
    random_prompt_include_subdirs = parse_boolish(config.pop('random_prompt_include_subdirs', False))

    # random prompt sampling is only meaningful for preview generation
    if not enable_preview:
        randomly_choice_prompt = False

    if randomly_choice_prompt:
        txt_files = []
        if random_prompt_include_subdirs:
            # Root-level captions should still be valid for flat datasets.
            txt_files.extend(root_txt_files)
            # collect captions from all direct dataset subdirectories first
            prompt_source_dirs = [dir_path for dir_path in sub_dirs if glob(os.path.join(dir_path, '*.txt'))]
            if not prompt_source_dirs:
                # fallback to current directory to support flat datasets
                prompt_source_dirs = [train_data_dir]
            for dir_path in prompt_source_dirs:
                txt_files.extend(glob(os.path.join(dir_path, '*.txt')))
        else:
            # Prefer the dataset root when it already contains captions. This
            # keeps flat datasets working even if unrelated helper folders also
            # exist beside the images.
            if root_txt_files:
                txt_files = root_txt_files
            else:
                if len(sub_dirs_with_txt) > 1:
                    raise ValueError('训练数据集下有多个包含 txt 标注的子文件夹，请启用“从所有子目录随机选择 Prompt”。')

                prompt_source_dir = train_data_dir
                if len(sub_dirs_with_txt) == 1:
                    prompt_source_dir = sub_dirs_with_txt[0]
                txt_files = glob(os.path.join(prompt_source_dir, '*.txt'))

        if not txt_files:
            raise ValueError('训练数据集路径没有 txt 文件')
        try:
            sample_prompt_file = random.choice(txt_files)
            with open(sample_prompt_file, 'r', encoding='utf-8') as f:
                positive_prompts = f.read()
        except IOError:
            log.error(f"读取 {sample_prompt_file} 文件失败")

    sample_prompt = f'{positive_prompts} --n {negative_prompts}  --w {sample_width} --h {sample_height} --l {sample_cfg}  --s {sample_steps}'
    normalized_seed = _normalize_preview_seed_value(sample_seed)
    if normalized_seed is not None:
        sample_prompt += f"  --d {normalized_seed}"
    return positive_prompts, sample_prompt


def read_prompt_text_file(path: str) -> str:
    return Path(path).read_text(encoding="utf-8", errors="ignore")


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


def is_yolo_training_type(training_type: str) -> bool:
    return str(training_type or "").strip().lower() == "yolo"


def normalize_conflicting_network_target_flags(config: dict) -> list[str]:
    if "network_train_unet_only" not in config or "network_train_text_encoder_only" not in config:
        return []

    train_unet_only = parse_boolish(config.get("network_train_unet_only"))
    train_text_encoder_only = parse_boolish(config.get("network_train_text_encoder_only"))
    if not train_unet_only or not train_text_encoder_only:
        return []

    config["network_train_unet_only"] = False
    config["network_train_text_encoder_only"] = False

    warnings = [
        "检测到“仅训练 DiT/U-Net”和“仅训练文本编码器”被同时勾选。"
        "这通常表示你想训练两者，因此本次已自动改为“同时训练 DiT/U-Net 和文本编码器”。"
    ]

    if parse_boolish(config.get("cache_text_encoder_outputs")):
        config["cache_text_encoder_outputs"] = False
        if "cache_text_encoder_outputs_to_disk" in config:
            config["cache_text_encoder_outputs_to_disk"] = False
        warnings.append(
            "由于已自动切换为同时训练文本编码器，文本编码器输出缓存也已自动关闭。"
        )

    return warnings


def apply_anima_ui_overrides(config: dict) -> None:
    model_train_type = str(config.get("model_train_type", "")).strip().lower()
    if not model_train_type.startswith("anima"):
        return

    def normalize_network_args(*values):
        items = []
        for value in values:
            if value is None:
                continue
            if isinstance(value, (list, tuple)):
                for item in value:
                    item_str = str(item).strip()
                    if item_str:
                        items.append(item_str)
            else:
                item_str = str(value).strip()
                if item_str:
                    items.append(item_str)
        return items

    def upsert_network_arg(args_list, key, value):
        prefix = f"{key}="
        filtered = [item for item in args_list if not str(item).startswith(prefix)]
        if value is not None and str(value).strip() != "":
            filtered.append(f"{key}={value}")
        return filtered

    def get_network_arg_value(args_list, key):
        prefix = f"{key}="
        for item in reversed(args_list):
            item_str = str(item).strip()
            if item_str.startswith(prefix):
                return item_str.split("=", 1)[1].strip()
        return None

    lora_type = str(config.pop("lora_type", "")).strip().lower()
    network_args = normalize_network_args(config.get("network_args"), config.pop("network_args_custom", None))
    raw_train_norm = config.pop("train_norm", None)
    if raw_train_norm is None:
        existing_train_norm = get_network_arg_value(network_args, "train_norm")
        train_norm_enabled = parse_boolish(existing_train_norm) if existing_train_norm is not None else None
    else:
        train_norm_enabled = parse_boolish(raw_train_norm)

    if model_train_type == "anima-lora" and not lora_type:
        legacy_network_module = str(config.get("network_module", "")).strip().lower()
        if legacy_network_module == "networks.tlora_anima":
            lora_type = "tlora"
        elif legacy_network_module == "lycoris.kohya":
            lora_type = "lokr"
        elif str(get_network_arg_value(network_args, "algo") or "").strip().lower() == "lokr":
            lora_type = "lokr"
        else:
            lora_type = "lora"

    if model_train_type == "anima-lora" and lora_type:
        config.pop("lycoris_algo", None)

        if lora_type == "lokr":
            config["network_module"] = "networks.lora_anima"
            config["anima_adapter_type"] = "lokr"
            legacy_factor = get_network_arg_value(network_args, "factor")
            if legacy_factor not in (None, "") and "lokr_factor" not in config:
                config["lokr_factor"] = legacy_factor
            network_args = upsert_network_arg(network_args, "anima_adapter_type", "lokr")
            network_args = upsert_network_arg(network_args, "lokr_factor", int(config.get("lokr_factor", 8) or 8))
            if "dropout" in config:
                config["network_dropout"] = config.get("dropout")
            elif get_network_arg_value(network_args, "dropout") not in (None, ""):
                try:
                    config["network_dropout"] = float(get_network_arg_value(network_args, "dropout"))
                except (TypeError, ValueError):
                    config["network_dropout"] = 0
            elif "network_dropout" not in config:
                config["network_dropout"] = 0
            for key in ("conv_dim", "conv_alpha"):
                config.pop(key, None)
            stale_prefixes = (
                "algo=",
                "factor=",
                "conv_dim=",
                "conv_alpha=",
                "train_norm=",
                "dropout=",
                "tlora_min_rank=",
                "tlora_rank_schedule=",
                "tlora_orthogonal_init=",
            )
            network_args = [item for item in network_args if not str(item).startswith(stale_prefixes)]
        elif lora_type == "tlora":
            config["network_module"] = "networks.tlora_anima"
            config["anima_adapter_type"] = "tlora"
            stale_prefixes = (
                "algo=",
                "factor=",
                "conv_dim=",
                "conv_alpha=",
                "train_norm=",
                "dropout=",
                "lokr_factor=",
                "tlora_min_rank=",
                "tlora_rank_schedule=",
                "tlora_orthogonal_init=",
            )
            network_args = [item for item in network_args if not str(item).startswith(stale_prefixes)]
            network_args = upsert_network_arg(network_args, "anima_adapter_type", "tlora")

            try:
                network_dim = int(config.get("network_dim", 0) or 0)
            except (TypeError, ValueError):
                network_dim = 0

            try:
                min_rank = int(config.get("tlora_min_rank", 1) or 1)
            except (TypeError, ValueError):
                min_rank = 1

            if network_dim > 0:
                min_rank = max(1, min(min_rank, network_dim))
            else:
                min_rank = max(1, min_rank)

            config["tlora_min_rank"] = min_rank
            network_args = upsert_network_arg(network_args, "tlora_min_rank", min_rank)

            rank_schedule = str(config.get("tlora_rank_schedule", "cosine") or "cosine").strip().lower() or "cosine"
            if rank_schedule not in {"linear", "cosine"}:
                rank_schedule = "cosine"
            config["tlora_rank_schedule"] = rank_schedule
            network_args = upsert_network_arg(network_args, "tlora_rank_schedule", rank_schedule)

            orthogonal_init = parse_boolish(config.get("tlora_orthogonal_init", False))
            config["tlora_orthogonal_init"] = orthogonal_init
            network_args = upsert_network_arg(network_args, "tlora_orthogonal_init", "True" if orthogonal_init else "False")

            for key in ("lokr_factor", "conv_dim", "conv_alpha", "dropout"):
                config.pop(key, None)
        else:
            config["network_module"] = "networks.lora_anima"
            config["anima_adapter_type"] = "lora"
            network_args = upsert_network_arg(network_args, "anima_adapter_type", "lora")
            network_args = [
                item
                for item in network_args
                if not str(item).startswith(("lokr_factor=", "tlora_min_rank=", "tlora_rank_schedule=", "tlora_orthogonal_init="))
            ]
            for key in ("lokr_factor", "conv_dim", "conv_alpha", "dropout"):
                config.pop(key, None)

        if train_norm_enabled is not None:
            network_args = upsert_network_arg(network_args, "train_norm", "True" if train_norm_enabled else "False")

    if network_args:
        config["network_args"] = network_args
    else:
        config.pop("network_args", None)

    if "prefer_json_caption" in config:
        custom_attributes = config.get("custom_attributes")
        if not isinstance(custom_attributes, dict):
            custom_attributes = {}
        custom_attributes["prefer_json_caption"] = parse_boolish(config.pop("prefer_json_caption"))
        config["custom_attributes"] = custom_attributes


def apply_flux_tlora_ui_overrides(config: dict) -> None:
    model_train_type = str(config.get("model_train_type", "")).strip().lower()
    if model_train_type != "flux-lora":
        return

    def normalize_network_args(*values):
        items = []
        for value in values:
            if value is None:
                continue
            if isinstance(value, (list, tuple)):
                for item in value:
                    item_str = str(item).strip()
                    if item_str:
                        items.append(item_str)
            else:
                item_str = str(value).strip()
                if item_str:
                    items.append(item_str)
        return items

    def upsert_network_arg(args_list, key, value):
        prefix = f"{key}="
        filtered = [item for item in args_list if not str(item).startswith(prefix)]
        if value is not None and str(value).strip() != "":
            filtered.append(f"{key}={value}")
        return filtered

    network_args = normalize_network_args(config.get("network_args"), config.pop("network_args_custom", None))
    network_module = str(config.get("network_module", "") or "").strip().lower()
    stale_prefixes = ("tlora_min_rank=", "tlora_rank_schedule=", "tlora_orthogonal_init=")
    network_args = [item for item in network_args if not str(item).startswith(stale_prefixes)]

    if network_module == "networks.tlora_flux":
        try:
            network_dim = int(config.get("network_dim", 0) or 0)
        except (TypeError, ValueError):
            network_dim = 0

        try:
            min_rank = int(config.get("tlora_min_rank", 1) or 1)
        except (TypeError, ValueError):
            min_rank = 1

        if network_dim > 0:
            min_rank = max(1, min(min_rank, network_dim))
        else:
            min_rank = max(1, min_rank)

        config["tlora_min_rank"] = min_rank
        network_args = upsert_network_arg(network_args, "tlora_min_rank", min_rank)

        rank_schedule = str(config.get("tlora_rank_schedule", "cosine") or "cosine").strip().lower() or "cosine"
        if rank_schedule not in {"linear", "cosine"}:
            rank_schedule = "cosine"
        config["tlora_rank_schedule"] = rank_schedule
        network_args = upsert_network_arg(network_args, "tlora_rank_schedule", rank_schedule)

        orthogonal_init = parse_boolish(config.get("tlora_orthogonal_init", False))
        config["tlora_orthogonal_init"] = orthogonal_init
        network_args = upsert_network_arg(network_args, "tlora_orthogonal_init", "True" if orthogonal_init else "False")

    if network_args:
        config["network_args"] = network_args
    else:
        config.pop("network_args", None)

    sample_scheduler = str(config.get("sample_scheduler", "") or "").strip()
    if sample_scheduler == "":
        config["sample_scheduler"] = "simple"


def apply_stable_tlora_ui_overrides(config: dict) -> None:
    model_train_type = str(config.get("model_train_type", "")).strip().lower()
    if model_train_type not in {"sd-lora", "sdxl-lora"}:
        return

    def normalize_network_args(*values):
        items = []
        for value in values:
            if value is None:
                continue
            if isinstance(value, (list, tuple)):
                for item in value:
                    item_str = str(item).strip()
                    if item_str:
                        items.append(item_str)
            else:
                item_str = str(value).strip()
                if item_str:
                    items.append(item_str)
        return items

    def upsert_network_arg(args_list, key, value):
        prefix = f"{key}="
        filtered = [item for item in args_list if not str(item).startswith(prefix)]
        if value is not None and str(value).strip() != "":
            filtered.append(f"{key}={value}")
        return filtered

    network_args = normalize_network_args(config.get("network_args"), config.pop("network_args_custom", None))
    network_module = str(config.get("network_module", "") or "").strip().lower()
    stale_prefixes = ("tlora_min_rank=", "tlora_rank_schedule=", "tlora_orthogonal_init=")
    network_args = [item for item in network_args if not str(item).startswith(stale_prefixes)]

    if network_module == "networks.tlora":
        try:
            network_dim = int(config.get("network_dim", 0) or 0)
        except (TypeError, ValueError):
            network_dim = 0

        try:
            min_rank = int(config.get("tlora_min_rank", 1) or 1)
        except (TypeError, ValueError):
            min_rank = 1

        if network_dim > 0:
            min_rank = max(1, min(min_rank, network_dim))
        else:
            min_rank = max(1, min_rank)

        config["tlora_min_rank"] = min_rank
        network_args = upsert_network_arg(network_args, "tlora_min_rank", min_rank)

        rank_schedule = str(config.get("tlora_rank_schedule", "cosine") or "cosine").strip().lower() or "cosine"
        if rank_schedule not in {"linear", "cosine"}:
            rank_schedule = "cosine"
        config["tlora_rank_schedule"] = rank_schedule
        network_args = upsert_network_arg(network_args, "tlora_rank_schedule", rank_schedule)

        orthogonal_init = parse_boolish(config.get("tlora_orthogonal_init", False))
        config["tlora_orthogonal_init"] = orthogonal_init
        network_args = upsert_network_arg(network_args, "tlora_orthogonal_init", "True" if orthogonal_init else "False")

    if network_args:
        config["network_args"] = network_args
    else:
        config.pop("network_args", None)


def resolve_anima_runtime_attention_backend(gpu_ids=None) -> str:
    runtime_mode = get_attention_runtime_mode()
    if runtime_mode == "sageattention":
        return "sageattn"
    if runtime_mode == "blackwell":
        return "torch"

    xformers_info = get_xformers_status(gpu_ids)
    if xformers_info.get("selected_supported", xformers_info.get("supported", False)):
        return "xformers"
    return "torch"


def apply_anima_runtime_attention_backend(config: dict, gpu_ids=None) -> None:
    model_train_type = str(config.get("model_train_type", "")).strip().lower()
    if not model_train_type.startswith("anima"):
        return

    resolved_backend = resolve_anima_runtime_attention_backend(gpu_ids)
    config["attn_mode"] = resolved_backend

    if "xformers" in config:
        config["xformers"] = resolved_backend == "xformers"
    if "sdpa" in config:
        config["sdpa"] = resolved_backend == "torch"
    if "sageattn" in config:
        config["sageattn"] = resolved_backend == "sageattn"
    if "use_sage_attn" in config:
        config["use_sage_attn"] = resolved_backend == "sageattn"


def apply_sageattention_runtime_override(config: dict) -> Optional[str]:
    if get_attention_runtime_mode() != "sageattention":
        return None

    if parse_boolish(config.get("mem_eff_attn", False)):
        return None

    uses_xformers_flag = parse_boolish(config.get("xformers", False))
    attn_mode = str(config.get("attn_mode", "")).strip().lower()
    uses_xformers_attn_mode = attn_mode == "xformers"
    wants_sageattention = (
        parse_boolish(config.get("sageattn", False))
        or parse_boolish(config.get("use_sage_attn", False))
        or attn_mode == "sageattn"
    )

    if not uses_xformers_flag and not uses_xformers_attn_mode:
        return None

    if uses_xformers_flag:
        config["xformers"] = False

    if uses_xformers_attn_mode:
        config["attn_mode"] = "sageattn" if wants_sageattention else "sdpa"

    if wants_sageattention:
        if "sdpa" in config:
            config["sdpa"] = False
        message = (
            "检测到当前为 SageAttention 专用运行时，已自动忽略 xformers，"
            "本次训练将优先使用 SageAttention。"
        )
        log.info(message)
        return message

    if "sdpa" in config:
        config["sdpa"] = True
        message = (
            "检测到当前为 SageAttention 专用运行时，已自动忽略 xformers。"
            "由于当前配置未启用 SageAttention，本次训练将改用 sdpa。"
        )
    else:
        message = (
            "检测到当前为 SageAttention 专用运行时，已自动忽略 xformers。"
            "若希望本次训练直接使用 SageAttention，请启用 sageattn。"
        )
    log.warning(message)
    return message


def build_sample_prompt_file_name(config: dict) -> str:
    base_name = str(config.get("output_name", "")).strip() or str(config.get("model_train_type", "")).strip() or "sample-prompts"
    safe_name = re.sub(r"[^0-9A-Za-z._-]+", "-", base_name).strip("._-") or "sample-prompts"
    return f"{safe_name}-sample-prompts.txt"


def build_prompt_preview_text(content: str, max_lines: int = 3) -> Tuple[str, int]:
    non_empty_lines = [line.strip() for line in content.splitlines() if line.strip()]
    if not non_empty_lines:
        return "(prompt text is empty)", 0
    return "\n".join(non_empty_lines[:max_lines]), len(non_empty_lines)


def _has_prompt_cli_arg(line: str, flag: str) -> bool:
    return re.search(rf"(?:^|\s)--{re.escape(flag)}(?:\s|$)", line, flags=re.IGNORECASE) is not None


def should_use_inline_sample_prompts(sample_prompts: str, config: dict) -> bool:
    sample_prompts = str(sample_prompts or "").strip()
    if not sample_prompts:
        return False
    if os.path.isfile(sample_prompts):
        return True

    lines = [line.strip() for line in sample_prompts.splitlines() if line.strip()]
    if not lines:
        return False
    if len(lines) > 1:
        return True

    line = lines[0]
    if " --" in line or line.startswith("--"):
        return True

    # A single plain prompt line is usually legacy/stale state when the user is
    # actually using the dedicated positive/negative prompt fields below.
    return not str(config.get("positive_prompts", "") or "").strip()


def _normalize_preview_seed_value(value):
    if value is None:
        return None
    try:
        seed = int(value)
    except (TypeError, ValueError):
        return None
    return None if seed == 0 else seed


def enrich_inline_sample_prompts(sample_prompts: str, config: dict) -> str:
    lines = [line.strip() for line in str(sample_prompts or "").splitlines() if line.strip()]
    if not lines:
        return ""

    negative_prompt = str(config.get("negative_prompts", "") or "").strip()
    sample_sampler = str(config.get("sample_sampler", "") or "").strip()
    flow_shift = config.get("discrete_flow_shift", None)

    try:
        sample_width = int(config.get("sample_width", 0) or 0)
    except (TypeError, ValueError):
        sample_width = 0
    try:
        sample_height = int(config.get("sample_height", 0) or 0)
    except (TypeError, ValueError):
        sample_height = 0
    try:
        sample_cfg = float(config.get("sample_cfg", 0) or 0)
    except (TypeError, ValueError):
        sample_cfg = 0
    try:
        sample_steps = int(config.get("sample_steps", 0) or 0)
    except (TypeError, ValueError):
        sample_steps = 0

    sample_seed = _normalize_preview_seed_value(config.get("sample_seed", None))

    normalized_lines = []
    for line in lines:
        entry = line
        if negative_prompt and not _has_prompt_cli_arg(entry, "n"):
            entry += f" --n {negative_prompt}"
        if sample_width > 0 and not _has_prompt_cli_arg(entry, "w"):
            entry += f" --w {sample_width}"
        if sample_height > 0 and not _has_prompt_cli_arg(entry, "h"):
            entry += f" --h {sample_height}"
        if sample_cfg > 0 and not _has_prompt_cli_arg(entry, "l"):
            entry += f" --l {sample_cfg:g}"
        if sample_steps > 0 and not _has_prompt_cli_arg(entry, "s"):
            entry += f" --s {sample_steps}"
        if sample_seed is not None and not _has_prompt_cli_arg(entry, "d"):
            entry += f" --d {sample_seed}"
        if sample_sampler and not _has_prompt_cli_arg(entry, "ss"):
            entry += f" --ss {sample_sampler}"
        if flow_shift not in (None, "") and not _has_prompt_cli_arg(entry, "fs"):
            entry += f" --fs {flow_shift}"
        normalized_lines.append(entry)

    return "\n".join(normalized_lines)


def build_sample_prompt_record(config: dict) -> Optional[dict]:
    enable_preview = parse_boolish(config.get("enable_preview"))
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
    if legacy_sample_prompts and should_use_inline_sample_prompts(legacy_sample_prompts, config):
        if str(config.get("positive_prompts", "")).strip():
            notes.append("多提示词轮换已启用，单提示词输入框会被忽略。")
        if os.path.isfile(legacy_sample_prompts):
            content = read_prompt_text_file(legacy_sample_prompts)
            preview, line_count = build_prompt_preview_text(content)
            return {
                "enabled": enable_preview,
                "source": "sample_prompts_file",
                "detail": legacy_sample_prompts,
                "preview": preview,
                "content": content,
                "line_count": line_count,
                "suggested_file_name": Path(legacy_sample_prompts).name or build_sample_prompt_file_name(config),
                "warnings": warnings,
                "notes": notes + ["Using sample_prompts file."],
            }

        enriched_sample_prompts = enrich_inline_sample_prompts(legacy_sample_prompts, config)
        preview, line_count = build_prompt_preview_text(enriched_sample_prompts)
        return {
            "enabled": enable_preview,
            "source": "sample_prompts_inline",
            "detail": "Inline multi-prompt rotation",
            "preview": preview,
            "content": enriched_sample_prompts,
            "line_count": line_count,
            "suggested_file_name": build_sample_prompt_file_name(config),
            "warnings": warnings,
            "notes": notes + ["Using inline sample_prompts text with current preview defaults merged in when missing."],
        }
    elif legacy_sample_prompts:
        notes.append("检测到单行 sample_prompts 旧值；当前将优先使用下方单提示词字段，避免被残留值覆盖。")

    config_copy = dict(config)
    _, sample_prompt = get_sample_prompts(config_copy)
    if sample_prompt is None:
        return None

    source = "generated"
    detail = "Current positive / negative prompt fields"
    if parse_boolish(config.get("randomly_choice_prompt")):
        if parse_boolish(config.get("random_prompt_include_subdirs")):
            source = "random_dataset_prompt_preview_all_subdirs"
            detail = "Random caption-derived preview from all dataset subdirectories"
        else:
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


def normalize_requested_gpu_ids(raw_gpu_ids) -> tuple[list[str], Optional[str]]:
    def _extract_ids(value):
        if value is None:
            return []
        if isinstance(value, bool):
            return []
        if isinstance(value, (int, float)):
            return [str(int(value))]
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []

            gpu_matches = re.findall(r"\bGPU\s*(\d+)\b", stripped, flags=re.IGNORECASE)
            if gpu_matches:
                return gpu_matches

            if stripped.isdigit():
                return [stripped]

            tokens = [token for token in re.split(r"[\s,\[\]\(\)\"']+", stripped) if token]
            return [token for token in tokens if token.isdigit()]

        if isinstance(value, (list, tuple, set)):
            normalized = []
            for item in value:
                normalized.extend(_extract_ids(item))
            return normalized

        return []

    parsed_ids = _extract_ids(raw_gpu_ids)
    unique_ids = []
    seen = set()
    for gpu_id in parsed_ids:
        if gpu_id in seen:
            continue
        seen.add(gpu_id)
        unique_ids.append(gpu_id)

    max_available = len(printable_devices) if printable_devices else None
    if max_available is None:
        try:
            import torch

            if torch.cuda.is_available():
                max_available = int(torch.cuda.device_count())
        except Exception:
            max_available = None
    valid_ids = []
    dropped_ids = []
    for gpu_id in unique_ids:
        try:
            gpu_index = int(gpu_id)
        except (TypeError, ValueError):
            dropped_ids.append(str(gpu_id))
            continue

        if gpu_index < 0 or (max_available is not None and gpu_index >= max_available):
            dropped_ids.append(str(gpu_id))
            continue

        valid_ids.append(str(gpu_index))

    warning = None
    if dropped_ids:
        warning = (
            "已自动忽略不可用或非 CUDA 的 GPU 选择："
            + ", ".join(dropped_ids)
            + "。当前只会使用可被 PyTorch CUDA 识别的训练显卡。"
        )

    return valid_ids, warning


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
    autosave_dir = launch_utils.base_dir_path() / "config" / "autosave"
    autosave_dir.mkdir(parents=True, exist_ok=True)
    toml_file = str(autosave_dir / f"{timestamp}.toml")
    json_data = await request.body()

    config: dict = json.loads(json_data.decode("utf-8"))
    try:
        train_utils.fix_config_types(config)
    except (TypeError, ValueError) as exc:
        return APIResponseFail(message=f"Invalid config value / 配置值无效: {exc}")

    apply_anima_ui_overrides(config)
    apply_flux_tlora_ui_overrides(config)
    apply_stable_tlora_ui_overrides(config)
    start_warnings = []
    start_warnings.extend(normalize_conflicting_network_target_flags(config))

    cooldown_every_n_epochs = config.get("cooldown_every_n_epochs")
    cooldown_minutes = config.get("cooldown_minutes")
    cooldown_until_temp_c = config.get("cooldown_until_temp_c")
    cooldown_poll_seconds = config.get("cooldown_poll_seconds")
    try:
        cooldown_every_n_epochs_value = int(round(float(cooldown_every_n_epochs)))
    except (TypeError, ValueError):
        cooldown_every_n_epochs_value = None
    try:
        cooldown_minutes_value = float(cooldown_minutes)
    except (TypeError, ValueError):
        cooldown_minutes_value = None
    try:
        cooldown_until_temp_c_value = int(round(float(cooldown_until_temp_c)))
    except (TypeError, ValueError):
        cooldown_until_temp_c_value = None
    try:
        cooldown_poll_seconds_value = int(round(float(cooldown_poll_seconds)))
    except (TypeError, ValueError):
        cooldown_poll_seconds_value = 15

    if cooldown_every_n_epochs_value is not None and cooldown_every_n_epochs_value > 0 and (
        (cooldown_minutes_value is not None and cooldown_minutes_value > 0)
        or (cooldown_until_temp_c_value is not None and cooldown_until_temp_c_value > 0)
    ):
        cooldown_details = [f"每 {cooldown_every_n_epochs_value} 个 epoch 在该轮保存与预览完成后暂停一次"]
        if cooldown_minutes_value is not None and cooldown_minutes_value > 0:
            cooldown_details.append(f"至少等待 {cooldown_minutes_value:g} 分钟")
        if cooldown_until_temp_c_value is not None and cooldown_until_temp_c_value > 0:
            poll_seconds = cooldown_poll_seconds_value or 15
            cooldown_details.append(f"并等待显卡温度降到 {cooldown_until_temp_c_value}°C 以下（每 {poll_seconds} 秒轮询一次）")
        start_warnings.append("散热冷却已启用：" + "，".join(cooldown_details) + "。")

    gpu_power_limit_w = config.get("gpu_power_limit_w")
    try:
        gpu_power_limit_w_value = int(round(float(gpu_power_limit_w)))
    except (TypeError, ValueError):
        gpu_power_limit_w_value = None
    if gpu_power_limit_w_value is not None and gpu_power_limit_w_value > 0:
        start_warnings.append(
            f"已请求 GPU 功率墙：{gpu_power_limit_w_value}W。该限制作用于整张显卡，不是单个训练进程；依赖 nvidia-smi、驱动与管理员/root 权限，不支持时会自动跳过。"
        )

    raw_gpu_ids = config.pop("gpu_ids", None)
    gpu_ids, gpu_filter_warning = normalize_requested_gpu_ids(raw_gpu_ids)
    if gpu_filter_warning:
        start_warnings.append(gpu_filter_warning)
    if gpu_ids:
        start_warnings.append(f"本次训练将使用 GPU: {', '.join(gpu_ids)}")
    else:
        start_warnings.append("本次训练未显式指定 GPU，默认使用当前 PyTorch 可见的主训练显卡。")
    model_train_type = str(config.get("model_train_type", "sd-lora") or "sd-lora").strip().lower()
    trainer_definition = get_trainer_definition(model_train_type)
    if trainer_definition is None:
        return APIResponseFail(message=f"Unsupported trainer type: {model_train_type}")
    yolo_training = is_yolo_training_type(model_train_type)
    direct_python_training = bool(trainer_definition.direct_python)

    if direct_python_training:
        if parse_boolish(config.get("enable_distributed_training")):
            return APIResponseFail(
                message="当前训练种类暂不走 Mikazuki 分布式启动。"
            )
        distributed_runtime = {
            "total_num_processes": 1,
            "warnings": [],
            "notes": [],
            "summary": "当前训练种类直接由独立 Python 训练器启动，不走 accelerate 分布式包装。",
        }
        worker_sync_runtime = {
            "warnings": [],
            "notes": [],
        }
        if yolo_training and len(gpu_ids) > 1:
            start_warnings.append("已为 YOLO 保留多张可见 GPU；若未手动填写 device，Ultralytics 会按当前可见显卡自行决定多卡训练方式。")
    else:
        try:
            distributed_runtime = resolve_distributed_runtime(config, gpu_ids)
        except ValueError as exc:
            return APIResponseFail(message=str(exc))
        except Exception:
            log.exception("Distributed runtime resolution failed unexpectedly")
            return APIResponseFail(message="分布式运行时解析失败，请查看日志。")
        start_warnings.extend(distributed_runtime.get("warnings", []))
        start_warnings.extend(distributed_runtime.get("notes", []))
        if int(distributed_runtime.get("total_num_processes", 1) or 1) > 1:
            start_warnings.append(
                "当前为多进程/分布式训练：train_batch_size 将按全局 batch 解释，启动时会自动换算成每卡 batch。"
            )
        try:
            worker_sync_runtime = resolve_worker_sync_runtime(config, distributed_runtime, launch_utils.base_dir_path())
        except ValueError as exc:
            return APIResponseFail(message=str(exc))
        except Exception:
            log.exception("Worker sync runtime resolution failed unexpectedly")
            return APIResponseFail(message="分布式同步运行时解析失败，请查看日志。")
        start_warnings.extend(worker_sync_runtime.get("warnings", []))
        start_warnings.extend(worker_sync_runtime.get("notes", []))
    apply_anima_runtime_attention_backend(config, gpu_ids)

    model_train_type = str(config.pop("model_train_type", "sd-lora") or "sd-lora").strip().lower()
    train_data_dir = str(config.get("train_data_dir", "") or "").strip()
    suggest_cpu_threads = 8 if train_data_dir and len(train_utils.get_total_images(train_data_dir)) > 200 else 2
    trainer_file = trainer_definition.trainer_file

    # Windows + multiprocessing dataloader is more fragile on Anima routes.
    # If the user did not choose these explicitly, default to safer single-process loading.
    if model_train_type in {"anima-lora", "anima-finetune"}:
        config.setdefault("max_data_loader_n_workers", 0)
        config.setdefault("persistent_data_loader_workers", False)

    if trainer_definition.config_validator is not None:
        config_error = trainer_definition.config_validator(config)
        if config_error:
            return APIResponseFail(message=config_error)

    if trainer_definition.start_warning_builder is not None:
        start_warnings.extend(trainer_definition.start_warning_builder(config))
    if not direct_python_training and model_train_type != "sdxl-finetune":
        if not train_utils.validate_data_dir(config["train_data_dir"]):
            return APIResponseFail(message="训练数据集路径不存在或没有图片，请检查目录。")

    if not direct_python_training and model_train_type in {"sd-controlnet", "sdxl-controlnet", "flux-controlnet"}:
        conditioning_data_dir = config.get("conditioning_data_dir", "")
        if not conditioning_data_dir or not train_utils.validate_data_dir(conditioning_data_dir):
            return APIResponseFail(message="条件图数据集路径不存在或没有图片，请检查目录。")

    try:
        if direct_python_training:
            mixed_resolution_plan = None
        else:
            planning_config = dict(config)
            planning_config["num_processes"] = int(distributed_runtime.get("total_num_processes", 1) or 1)
            mixed_resolution_plan = build_mixed_resolution_plan(planning_config, training_type=model_train_type)
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Mixed-resolution planning failed unexpectedly")
        return APIResponseFail(message="阶段分辨率训练规划失败，请查看日志。")

    mixed_resolution_payload = None
    if mixed_resolution_plan is not None and mixed_resolution_plan.enabled:
        mixed_resolution_payload = asdict(mixed_resolution_plan)
        start_warnings.append(
            f"已启用阶段分辨率训练：共 {len(mixed_resolution_plan.phases)} 个阶段，将按顺序自动切换分辨率与 batch。"
        )

    try:
        if direct_python_training:
            cache_preflight = {"errors": [], "warnings": [], "notes": []}
        else:
            cache_preflight = analyze_dataset_cache_preflight(config, training_type=model_train_type)
    except Exception:
        log.exception("Dataset cache preflight failed unexpectedly")
        return APIResponseFail(message="数据集缓存预检失败，请查看日志。")

    if cache_preflight.get("errors"):
        return APIResponseFail(message="\n".join(cache_preflight["errors"]))

    start_warnings.extend(cache_preflight.get("warnings", []))

    if not trainer_definition.skip_model_validation:
        validated, message = train_utils.validate_model(config["pretrained_model_name_or_path"], model_train_type)
        if not validated:
            return APIResponseFail(message=message)

    sageattention_override_message = apply_sageattention_runtime_override(config)
    if sageattention_override_message:
        start_warnings.append(sageattention_override_message)

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

    if direct_python_training:
        config.pop("prompt_file", None)
        config.pop("sample_prompts", None)
    else:
        prompt_file = str(config.get("prompt_file", "") or "").strip()
        inline_sample_prompts = str(config.get("sample_prompts", "") or "").strip()

        if prompt_file:
            if not os.path.exists(prompt_file):
                return APIResponseFail(message=f"Prompt 文件 {prompt_file} 不存在，请检查路径。")
            config["sample_prompts"] = prompt_file
        elif inline_sample_prompts and should_use_inline_sample_prompts(inline_sample_prompts, config):
            if os.path.isfile(inline_sample_prompts):
                config["sample_prompts"] = inline_sample_prompts
            else:
                sample_prompts_file = str(autosave_dir / build_sample_prompt_file_name(config))
                with open(sample_prompts_file, "w", encoding="utf-8") as f:
                    normalized = enrich_inline_sample_prompts(inline_sample_prompts, config)
                    f.write(normalized)
                config["sample_prompts"] = sample_prompts_file
                log.info(f"Wrote inline sample_prompts to file {sample_prompts_file}")
        else:
            try:
                positive_prompt, sample_prompts_arg = get_sample_prompts(config=config)

                if positive_prompt is not None and train_utils.is_promopt_like(sample_prompts_arg):
                    sample_prompts_file = str(autosave_dir / f"{timestamp}-prompt.txt")
                    with open(sample_prompts_file, "w", encoding="utf-8") as f:
                        f.write(sample_prompts_arg)
                    config["sample_prompts"] = sample_prompts_file
                    log.info(f"Wrote prompts to file {sample_prompts_file}")

            except ValueError as e:
                log.error(f"Error while processing prompts: {e}")
                return APIResponseFail(message=str(e))

        config.pop("prompt_file", None)

    with open(toml_file, "w", encoding="utf-8") as f:
        f.write(toml.dumps(config))

    result = process.run_train(toml_file, trainer_file, gpu_ids, suggest_cpu_threads)

    if mixed_resolution_payload is not None:
        result.data = result.data or {}
        result.data["mixed_resolution"] = mixed_resolution_payload

    tensorboard_run_dir = ""
    tensorboard_resume_merge = False
    tensorboard_reused_from_state = False
    if result.data:
        tensorboard_run_dir = str(result.data.get("tensorboard_run_dir", "") or "").strip()
        tensorboard_resume_merge = bool(result.data.get("tensorboard_resume_merge"))
        tensorboard_reused_from_state = bool(result.data.get("tensorboard_reused_from_state"))
        distributed_active = bool(result.data.get("distributed_active"))
        distributed_summary = str(result.data.get("distributed_summary", "") or "").strip()
        if distributed_active and distributed_summary and distributed_summary not in start_warnings:
            start_warnings.append(f"分布式摘要：{distributed_summary}")
    if tensorboard_run_dir:
        start_warnings.append(f"TensorBoard 日志目录：{tensorboard_run_dir}")
        if tensorboard_reused_from_state:
            start_warnings.append("TensorBoard 将继续写入 resume state 中记录的原日志目录。")
        elif tensorboard_resume_merge:
            start_warnings.append("TensorBoard 将复用当前模型最近一次已有的日志目录。")

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

    apply_anima_ui_overrides(config)
    apply_flux_tlora_ui_overrides(config)
    apply_stable_tlora_ui_overrides(config)
    normalize_conflicting_network_target_flags(config)

    raw_gpu_ids = config.get("gpu_ids")
    gpu_ids, gpu_filter_warning = normalize_requested_gpu_ids(raw_gpu_ids)
    if gpu_ids:
        config["gpu_ids"] = gpu_ids
    else:
        config.pop("gpu_ids", None)
    apply_anima_runtime_attention_backend(config, gpu_ids)
    training_type = str(config.get("model_train_type", "sd-lora"))

    result = analyze_training_preflight(
        config,
        training_type=training_type,
        trainer_supported=get_trainer_definition(training_type) is not None,
        conditioning_required=training_type in {"sd-controlnet", "sdxl-controlnet", "flux-controlnet"},
        sample_prompt_builder=build_sample_prompt_preview,
        attention_fallback_checker=lambda payload: simulate_attention_backend_fallback_warning(payload, gpu_ids),
    )

    if gpu_filter_warning:
        result["warnings"] = result.get("warnings", []) + [gpu_filter_warning]

    return APIResponseSuccess(data=result)


@router.post("/train/sample_prompt")
async def training_sample_prompt(request: Request) -> APIResponse:
    json_data = await request.body()
    config: dict = json.loads(json_data.decode("utf-8"))
    try:
        train_utils.fix_config_types(config)
    except (TypeError, ValueError) as exc:
        return APIResponseFail(message=f"Invalid config value / 配置值无效: {exc}")

    apply_anima_ui_overrides(config)
    apply_flux_tlora_ui_overrides(config)
    apply_stable_tlora_ui_overrides(config)
    normalize_conflicting_network_target_flags(config)

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
async def run_script(request: Request):
    paras = await request.body()
    j = json.loads(paras.decode("utf-8"))
    script_name = j["script_name"]
    if script_name not in avaliable_scripts:
        return APIResponseFail(message="Script not found")
    del j["script_name"]

    repo_root = launch_utils.base_dir_path()
    script_path = repo_root / "scripts" / script_name
    if not script_path.exists():
        for candidate_root in ["stable", "dev"]:
            candidate = repo_root / "scripts" / candidate_root / script_name
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

    # Use TaskManager so output is captured and visible via /api/task_output/{id}
    task = tm.create_task(cmd, script_env, cwd=str(repo_root))
    if not task:
        return APIResponseFail(message="Cannot create script task (another task may be running)")

    def _run_script_task():
        try:
            task.execute()
            task.process.wait()
            # Give the output reader thread time to flush remaining buffered output
            import time; time.sleep(0.3)
            task.status = _TaskStatus.FINISHED if task.status == _TaskStatus.RUNNING else task.status
            rc = task.process.returncode if task.process else -1
            if rc != 0:
                log.warning(f"Script {script_name} exited with code {rc}")
            else:
                log.info(f"Script {script_name} finished successfully")
        except Exception as exc:
            log.error(f"Script {script_name} failed: {exc}")

    coro = asyncio.to_thread(_run_script_task)
    asyncio.create_task(coro)

    return APIResponseSuccess(data={"task_id": task.task_id})


@router.get("/image_resize/preview")
async def get_image_resize_preview(input_dir: str, recursive: bool = False, limit: int = 8) -> APIResponse:
    try:
        manifest = build_image_resize_preview_manifest(
            input_dir,
            recursive=recursive,
            limit=limit,
        )
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Image resize preview manifest failed")
        return APIResponseFail(message="Failed to load image preprocess preview / 图像预处理预览加载失败，请查看日志。")

    return APIResponseSuccess(data=manifest)


@router.get("/image_resize/file")
async def get_image_resize_file(path: str):
    try:
        file_path = resolve_image_resize_file(path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f'Image not found: {exc.args[0]}') from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return FileResponse(file_path)


@router.post("/image_resize")
async def run_image_resize(req: ImageResizeRequest, background_tasks: BackgroundTasks):
    try:
        input_dir = resolve_image_resize_path(req.input_dir)
    except ValueError:
        return APIResponseFail(message="Input folder is empty / 输入目录不能为空。")

    if not input_dir.exists():
        return APIResponseFail(message=f"Input folder does not exist / 输入目录不存在：{input_dir}")
    if not input_dir.is_dir():
        return APIResponseFail(message=f"Input path is not a folder / 输入路径不是文件夹：{input_dir}")

    output_dir_raw = req.output_dir.strip()
    if output_dir_raw:
        try:
            output_dir = resolve_image_resize_path(output_dir_raw)
        except ValueError:
            return APIResponseFail(message="Output folder is invalid / 输出目录无效。")
        if output_dir.exists() and not output_dir.is_dir():
            return APIResponseFail(message=f"Output path is not a folder / 输出路径不是文件夹：{output_dir}")

    payload = req.model_dump()
    if 'resize_mode' not in req.model_fields_set and req.exact_size:
        payload['resize_mode'] = 'crop'
    background_tasks.add_task(run_image_resize_job, payload)
    return APIResponseSuccess(message="Image preprocessing task submitted / 图像预处理任务已提交。")


@router.post("/interrogate")
async def run_interrogate(req: TaggerInterrogateRequest, background_tasks: BackgroundTasks):
    batch_path = req.path.strip()
    if not batch_path:
        return APIResponseFail(message="Input folder is empty / 输入的图片文件夹为空。")
    if not os.path.isdir(batch_path):
        return APIResponseFail(message="Input path is not a valid folder / 输入路径不是有效文件夹。")

    use_llm_interrogator = is_llm_interrogator(req.interrogator_model)
    if not use_llm_interrogator:
        try:
            import onnxruntime  # noqa: F401
        except ImportError:
            return APIResponseFail(message="onnxruntime is not installed, please reinstall dependencies and try again.")

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

    if use_llm_interrogator:
        llm_meta = get_llm_interrogator_meta(req.interrogator_model)
        llm_api_key = req.llm_api_key.strip()
        llm_model = req.llm_model.strip()
        if not llm_api_key:
            return APIResponseFail(message="LLM API Key is empty / LLM API Key 不能为空。")
        if not llm_model:
            return APIResponseFail(message="LLM model is empty / LLM 模型名称不能为空。")
        if req.interrogator_model == "llm-custom" and not req.llm_api_base.strip():
            return APIResponseFail(message="Custom API Base URL is empty / 自定义 API 地址不能为空。")

        background_tasks.add_task(run_llm_interrogate, req.model_dump())
        llm_api_style = req.llm_api_style if req.interrogator_model == "llm-custom" else llm_meta.get("api_style", req.interrogator_model)
        llm_template_preset = (req.llm_template_preset or "anime-tags").strip() or "anime-tags"
        message = (
            f"LLM batch interrogate started for {batch_path} "
            f"({llm_api_style} / {llm_model} / preset={llm_template_preset})"
        )
        if req.llm_output_mode == "raw_text":
            response_warnings.append(
                "LLM raw_text mode writes the model response directly and does not apply tag post-processing."
            )
    else:
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
        "interrogators": (
            [
                {
                    "name": name,
                    "kind": "cl" if name.startswith("cl_") else "wd",
                    "repo_id": getattr(interrogator, "repo_id", None),
                    "is_default": name == default_interrogator,
                }
                for name, interrogator in available_interrogators.items()
            ]
            + [
                {
                    "name": name,
                    "kind": meta["kind"],
                    "repo_id": None,
                    "api_style": meta["api_style"],
                    "default_api_base": meta["default_api_base"],
                    "is_default": False,
                }
                for name, meta in LLM_INTERROGATORS.items()
            ]
        ),
        "llm_template_presets": [
            {
                "id": preset["id"],
                "label": preset["label"],
                "output_mode": preset["output_mode"],
            }
            for preset in LLM_TEMPLATE_PRESETS.values()
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
    if picker_type in ("folder", "output-folder"):
        coro = asyncio.to_thread(open_directory_selector, "")
    elif picker_type in ("model-file", "output-model-file"):
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


@router.get("/backend/status", response_model_exclude_none=True)
async def get_backend_status() -> APIResponse:
    return APIResponseSuccess(data=read_backend_status())


@router.post("/backend/restart", response_model_exclude_none=True)
async def restart_backend() -> APIResponse:
    ok, message = request_backend_restart()
    if not ok:
        return APIResponseFail(message=message)
    return APIResponseSuccess(message=message, data={"status": read_backend_status()})


@router.get("/yolo/runtime_status", response_model_exclude_none=True)
async def get_yolo_runtime_status() -> APIResponse:
    return APIResponseSuccess(data=build_yolo_runtime_payload())


@router.post("/yolo/install_dependencies", response_model_exclude_none=True)
async def install_yolo_dependencies() -> APIResponse:
    ok, message, payload = start_yolo_dependency_install()
    if not ok:
        return APIResponseFail(message=message, data=payload)
    return APIResponseSuccess(message=message, data=payload)


@router.get("/aesthetic/runtime_status", response_model_exclude_none=True)
async def get_aesthetic_runtime_status() -> APIResponse:
    return APIResponseSuccess(data=build_aesthetic_runtime_payload())


@router.post("/aesthetic/install_dependencies", response_model_exclude_none=True)
async def install_aesthetic_dependencies() -> APIResponse:
    ok, message, payload = start_aesthetic_dependency_install()
    if not ok:
        return APIResponseFail(message=message, data=payload)
    return APIResponseSuccess(message=message, data=payload)


@router.get("/aesthetic_infer/runtime_status", response_model_exclude_none=True)
async def get_aesthetic_infer_runtime_status() -> APIResponse:
    return APIResponseSuccess(data=aesthetic_infer_manager.get_runtime_payload())


@router.get("/aesthetic_infer/status", response_model_exclude_none=True)
async def get_aesthetic_infer_status() -> APIResponse:
    return APIResponseSuccess(data=aesthetic_infer_manager.get_status())


@router.get("/aesthetic_infer/logs", response_model_exclude_none=True)
async def get_aesthetic_infer_logs(since_id: int = 0, limit: int = 300) -> APIResponse:
    return APIResponseSuccess(data=aesthetic_infer_manager.get_logs(since_id=since_id, limit=limit))


@router.post("/aesthetic_infer/start", response_model_exclude_none=True)
async def start_aesthetic_infer(request: Request) -> APIResponse:
    try:
        payload = await request.json()
    except Exception:
        return APIResponseFail(message="请求体不是合法的 JSON。")
    if not isinstance(payload, dict):
        return APIResponseFail(message="请求体必须是 JSON 对象。")
    ok, message, data = aesthetic_infer_manager.start(payload)
    if not ok:
        return APIResponseFail(message=message, data=data)
    return APIResponseSuccess(message=message, data=data)


@router.post("/aesthetic_infer/stop", response_model_exclude_none=True)
async def stop_aesthetic_infer() -> APIResponse:
    ok, message, data = aesthetic_infer_manager.stop()
    if not ok:
        return APIResponseFail(message=message, data=data)
    return APIResponseSuccess(message=message, data=data)


@router.get("/aesthetic_infer/results", response_model_exclude_none=True)
async def get_aesthetic_infer_results(
    output_dir: str = "",
    page: int = 1,
    page_size: int = 24,
    q: str = "",
    special_filter: str = "all",
    sort_by: str = "",
    sort_order: str = "desc",
) -> APIResponse:
    ok, message, data = aesthetic_infer_manager.get_results(
        output_dir_raw=output_dir,
        page=page,
        page_size=page_size,
        keyword=q,
        special_filter=special_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    if not ok:
        return APIResponseFail(message=message)
    return APIResponseSuccess(data=data)


@router.get("/aesthetic_infer/file")
async def get_aesthetic_infer_file(output_dir: str, kind: str):
    path = aesthetic_infer_manager.resolve_output_file(output_dir, kind)
    if path is None:
        raise HTTPException(status_code=404, detail="file not found")
    return FileResponse(str(path))


@router.get("/aesthetic_infer/image")
async def get_aesthetic_infer_image(path: str):
    resolved_path = aesthetic_infer_manager.resolve_image_path(path)
    if resolved_path is None:
        raise HTTPException(status_code=404, detail="image not found")
    return FileResponse(str(resolved_path))


@router.get("/tasks/terminate/{task_id}", response_model_exclude_none=True)
async def terminate_task(task_id: str):
    tm.terminate_task(task_id)
    return APIResponseSuccess()


@router.get("/task_output/{task_id}")
async def get_task_output(task_id: str, tail: int = 50):
    """Return recent output lines from a running/finished task."""
    if task_id not in tm.tasks:
        return APIResponseFail(message="Task not found")
    task = tm.tasks[task_id]
    lines = task.output_lines[-tail:] if hasattr(task, 'output_lines') else []
    total = len(task.output_lines) if hasattr(task, 'output_lines') else 0
    return APIResponseSuccess(data={"lines": lines, "total": total})


@router.get("/gpu_status")
async def get_gpu_status() -> APIResponse:
    """Return real-time GPU VRAM usage."""
    try:
        import torch
        if not torch.cuda.is_available():
            return APIResponseSuccess(data={"available": False})
        gpus = []
        for i in range(torch.cuda.device_count()):
            props = torch.cuda.get_device_properties(i)
            total = props.total_memory
            allocated = torch.cuda.memory_allocated(i)
            reserved = torch.cuda.memory_reserved(i)
            gpus.append({
                "index": i,
                "name": props.name,
                "total_mb": round(total / 1048576),
                "allocated_mb": round(allocated / 1048576),
                "reserved_mb": round(reserved / 1048576),
                "utilization_pct": round(allocated / total * 100, 1) if total > 0 else 0,
            })
        return APIResponseSuccess(data={"available": True, "gpus": gpus})
    except Exception as exc:
        return APIResponseSuccess(data={"available": False, "error": str(exc)})


@router.get("/dataset/list_images")
async def list_dataset_images(folder: str, limit: int = 8) -> APIResponse:
    """List image files in a dataset folder for thumbnail preview."""
    try:
        folder_path = Path(folder).expanduser().resolve()
        if not folder_path.is_dir():
            return APIResponseFail(message="Folder not found")
        exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        all_images = sorted(
            [p for p in folder_path.iterdir() if p.is_file() and p.suffix.lower() in exts],
            key=lambda p: p.name.lower(),
        )
        images = [str(p.resolve()) for p in all_images[:limit]]
        first_tag = ""
        for img_path in all_images[:1]:
            txt_path = img_path.with_suffix(".txt")
            if txt_path.is_file():
                try:
                    content = txt_path.read_text(encoding="utf-8-sig").strip()
                    if content:
                        first_tag = content.split(",")[0].strip()
                except Exception:
                    pass
                break
        return APIResponseSuccess(data={"images": images, "total": len(all_images), "first_tag": first_tag})
    except Exception as exc:
        return APIResponseFail(message=str(exc))



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
        "active_ui_profile": resolve_frontend_profile_id(app_config["active_ui_profile"]),
        "config_path": str(app_config.path),
    })


@router.get("/ui_profiles")
async def get_ui_profiles() -> APIResponse:
    requested_profile_id = app_config["active_ui_profile"]
    active_profile = resolve_frontend_profile(requested_profile_id)
    return APIResponseSuccess(data={
        "profiles": [
            {
                "id": profile["id"],
                "kind": profile["kind"],
                "name": profile["name"],
                "version": profile["version"],
                "source_path": profile["source_path"],
                "plugin_path": profile["plugin_path"],
                "source_url": profile["source_url"],
                "available": profile["available"],
                "removable": profile["removable"],
                "remove_block_reason": profile["remove_block_reason"],
            }
            for profile in list_frontend_profiles()
        ],
        "active_profile_id": active_profile["id"],
        "plugin_root": str(PLUGIN_ROOT),
        "config_path": str(app_config.path),
    })


@router.post("/ui_profiles/activate")
async def activate_ui_profile(request: Request) -> APIResponse:
    payload = json.loads((await request.body()).decode("utf-8"))
    profile_id = str(payload.get("profile_id", "")).strip()
    if not profile_id:
        return APIResponseFail(message="profile_id is required")

    profile = resolve_frontend_profile(profile_id)
    if profile["id"] != profile_id:
        return APIResponseFail(message=f"UI not found: {profile_id}")
    if not profile.get("available", False):
        return APIResponseFail(message=f"UI is not ready yet: {profile_id}")

    app_config["active_ui_profile"] = profile["id"]
    app_config.save_config()

    return APIResponseSuccess(
        message=f"Switched active UI to {profile['name']}",
        data={
            "active_profile_id": profile["id"],
            "reload_required": True,
        },
    )


@router.post("/ui_profiles/install")
async def install_ui_profile(request: Request) -> APIResponse:
    payload = json.loads((await request.body()).decode("utf-8"))
    repo_url = str(payload.get("repo_url", "")).strip()
    replace_existing = bool(payload.get("replace_existing", False))

    if not repo_url:
        return APIResponseFail(message="repo_url is required")

    parsed_repo = parse_github_repo_url(repo_url)
    if parsed_repo is None:
        return APIResponseFail(message="Only standard GitHub repository URLs are supported right now.")

    try:
        profile = await asyncio.to_thread(
            install_github_frontend_plugin,
            repo_url,
            replace_existing=replace_existing,
        )
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Failed to install community UI from GitHub")
        return APIResponseFail(message="Failed to download or install the GitHub community UI. Check the logs for details.")

    return APIResponseSuccess(
        message=f"Installed community UI {profile['name']}",
        data={
            "installed_profile": {
                "id": profile["id"],
                "name": profile["name"],
                "kind": profile["kind"],
                "version": profile["version"],
                "plugin_path": profile["plugin_path"],
                "source_path": profile["source_path"],
            },
            "plugin_root": str(PLUGIN_ROOT),
        },
    )


@router.post("/ui_profiles/uninstall")
async def uninstall_ui_profile(request: Request) -> APIResponse:
    payload = json.loads((await request.body()).decode("utf-8"))
    profile_id = str(payload.get("profile_id", "")).strip()
    if not profile_id:
        return APIResponseFail(message="profile_id is required")

    try:
        removed_profile = await asyncio.to_thread(uninstall_frontend_plugin, profile_id)
    except ValueError as exc:
        return APIResponseFail(message=str(exc))
    except Exception:
        log.exception("Failed to uninstall community UI")
        return APIResponseFail(message="Failed to uninstall the selected community UI. Check the logs for details.")

    if app_config["active_ui_profile"] == removed_profile["id"]:
        app_config["active_ui_profile"] = resolve_frontend_profile_id(None)
        app_config.save_config()

    return APIResponseSuccess(
        message=f"Removed community UI {removed_profile['name']}",
        data={
            "removed_profile_id": removed_profile["id"],
            "active_profile_id": resolve_frontend_profile_id(app_config["active_ui_profile"]),
            "reload_required": True,
        },
    )


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





