from enum import Enum
import glob
import os
import re
import sys
import json
from typing import Dict

from mikazuki.log import log

python_bin = sys.executable


class ModelType(Enum):
    UNKNOWN = -1
    SD15 = 1
    SD2 = 2
    SDXL = 3
    SD3 = 4
    FLUX = 5
    LUMINA = 6
    HUNYUAN_IMAGE = 7
    ANIMA = 8
    LoRA = 10


MODEL_SIGNATURE = [
    {
        "type": ModelType.HUNYUAN_IMAGE,
        "signature": [
            "byt5_in.",
            "txt_in.",
        ]
    },
    {
        "type": ModelType.ANIMA,
        "signature": [
            "llm_adapter.",
        ]
    },
    {
        "type": ModelType.LUMINA,
        "signature": [
            "cap_embedder.0.weight",
            "context_refiner.0.attention.k_norm.weight",
        ]
    },
    {
        "type": ModelType.FLUX,
        "signature": [
            "double_blocks.0.img_mlp.0.weight",
            "guidance_in.in_layer.weight",
            "model.diffusion_model.double_blocks",
            "double_blocks.0.img_attn.norm.query_norm.scale",
        ]
    },
    {
        "type": ModelType.SD3,
        "signature": [
            "model.diffusion_model.x_embedder.proj.weight",
            "model.diffusion_model.joint_blocks.0.context_block.attn.proj.weight"
        ]
    },
    {
        "type": ModelType.SDXL,
        "signature": [
            "conditioner.embedders.1.model.transformer.resblocks",
        ]
    },
    {
        "type": ModelType.SD15,
        "signature": [
            "model.diffusion_model",
            "cond_stage_model.transformer.text_model",
        ]
    },
    {
        "type": ModelType.LoRA,
        "signature": [
            "lora_te_text_model_encoder",
            "lora_unet_up_blocks",
            "lora_unet_input_blocks_4_1_transformer_blocks_0_attn1_to_k.alpha",
            "lora_unet_input_blocks_4_1_transformer_blocks_0_attn1_to_k.lora_up.weight",

            # more common signature
            "lora_unet",
            "lora_te",
            "lora_A.weight",
        ]
    }
]


TRAINER_ALLOWED_MODEL_TYPES = {
    "sd-lora": [ModelType.SD15, ModelType.SD2],
    "sd-dreambooth": [ModelType.SD15, ModelType.SD2],
    "sd-controlnet": [ModelType.SD15, ModelType.SD2],
    "sd-textual-inversion": [ModelType.SD15, ModelType.SD2],
    "sd-textual-inversion-xti": [ModelType.SD15, ModelType.SD2],
    "sdxl-lora": [ModelType.SDXL],
    "sdxl-finetune": [ModelType.SDXL],
    "sdxl-controlnet": [ModelType.SDXL],
    "sdxl-controlnet-lllite": [ModelType.SDXL],
    "sdxl-textual-inversion": [ModelType.SDXL],
    "sd3-lora": [ModelType.SD3],
    "sd3-finetune": [ModelType.SD3],
    "flux-lora": [ModelType.FLUX],
    "flux-finetune": [ModelType.FLUX],
    "flux-controlnet": [ModelType.FLUX],
    "lumina-lora": [ModelType.LUMINA],
    "lumina-finetune": [ModelType.LUMINA],
    "hunyuan-image-lora": [ModelType.HUNYUAN_IMAGE],
    "anima-lora": [ModelType.ANIMA],
    "anima-finetune": [ModelType.ANIMA],
}

ALLOW_UNKNOWN_MODEL_TYPE_TRAINERS = {
    "lumina-lora",
    "lumina-finetune",
    "hunyuan-image-lora",
    "anima-lora",
    "anima-finetune",
    "newbie-lora",
}

YOLO_MODEL_EXTENSIONS = {".pt", ".pth", ".yaml", ".yml"}


def is_promopt_like(s):
    for p in ["--n", "--s", "--l", "--d"]:
        if p in s:
            return True
    return False


def match_model_type_legacy(sig_content: bytes):
    if b"model.diffusion_model.double_blocks" in sig_content or b"double_blocks.0.img_attn.norm.query_norm.scale" in sig_content:
        return ModelType.FLUX

    if b"model.diffusion_model.x_embedder.proj.weight" in sig_content:
        return ModelType.SD3

    if b"conditioner.embedders.1.model.transformer.resblocks" in sig_content:
        return ModelType.SDXL

    if b"model.diffusion_model" in sig_content or b"cond_stage_model.transformer.text_model" in sig_content:
        return ModelType.SD15

    if b"lora_unet" in sig_content or b"lora_te" in sig_content:
        return ModelType.LoRA

    return ModelType.UNKNOWN


def read_safetensors_metadata(path) -> Dict:
    if not os.path.exists(path):
        log.error(f"Can't find safetensors metadata file {path}")
        return None

    with open(path, "rb") as f:
        meta_length = int.from_bytes(f.read(8), "little")
        meta = f.read(meta_length)
        return json.loads(meta)


def guess_model_type(path):
    if path.endswith("safetensors"):
        metadata = read_safetensors_metadata(path)
        if metadata is None:
            return ModelType.UNKNOWN
        model_keys = "\n".join(metadata.keys())
        for m in MODEL_SIGNATURE:
            if any([k in model_keys for k in m["signature"]]):
                return m["type"]

        return ModelType.UNKNOWN

    if path.endswith("pt") or path.endswith("ckpt"):
        with open(path, "rb") as f:
            content = f.read(1024 * 1000)
            return match_model_type_legacy(content)


def validate_model(model_name: str, training_type: str = "sd-lora"):
    if training_type == "yolo":
        return validate_yolo_model_source(model_name)

    if os.path.exists(model_name):
        if os.path.isdir(model_name):
            files = os.listdir(model_name)
            if "model_index.json" in files or "unet" in model_name:
                return True, "ok"
            else:
                log.warning("Can't find model, is this a huggingface model folder?")
                return True, "ok"

        model_type = ModelType.UNKNOWN

        try:
            model_type = guess_model_type(model_name)
        except Exception as e:
            log.warning(f"model file {model_name} can't open: {e}")
            return True, ""

        if model_type == ModelType.UNKNOWN:
            log.error(f"Can't match model type from {model_name}")
            if training_type in ALLOW_UNKNOWN_MODEL_TYPE_TRAINERS:
                log.warning(
                    f"Allowing unknown model type for {training_type}. "
                    "This is a compatibility fallback for newer DiT-family checkpoints."
                )
                return True, "ok"

        allowed_model_types = TRAINER_ALLOWED_MODEL_TYPES.get(training_type)
        if allowed_model_types is not None:
            if model_type not in allowed_model_types:
                trainer_label = training_type.replace("-", " ").upper()
                return False, f"Pretrained model type does not match {trainer_label} / 校验失败：底模类型与当前训练种类 {training_type} 不匹配。"
        elif model_type not in [
            ModelType.SD15,
            ModelType.SD2,
            ModelType.SD3,
            ModelType.SDXL,
            ModelType.FLUX,
            ModelType.LUMINA,
            ModelType.HUNYUAN_IMAGE,
            ModelType.ANIMA,
        ]:
            return False, "Pretrained model is not a supported Stable Diffusion / DiT checkpoint / 校验失败：底模不是受支持的 Stable Diffusion / DiT 模型。"

        return True, "ok"

    # huggingface model repo
    if model_name.count("/") == 1 \
            and not model_name[0] in [".", "/"] \
            and not model_name.split(".")[-1] in ["pt", "pth", "ckpt", "safetensors"]:
        return True, "ok"

    return False, "model not found"


def validate_yolo_model_source(model_name: str):
    model_name = str(model_name or "").strip()
    if not model_name:
        return False, "YOLO 模型路径不能为空。"

    if os.path.exists(model_name):
        if os.path.isdir(model_name):
            return False, "YOLO 模型路径必须指向 .pt / .pth / .yaml / .yml 文件，不能是文件夹。"

        suffix = os.path.splitext(model_name)[1].lower()
        if suffix and suffix not in YOLO_MODEL_EXTENSIONS:
            return False, "YOLO 模型文件后缀必须是 .pt / .pth / .yaml / .yml。"
        return True, "ok"

    if any(sep in model_name for sep in ("/", "\\")):
        return False, f"YOLO 模型文件不存在: {model_name}"

    suffix = os.path.splitext(model_name)[1].lower()
    if suffix in YOLO_MODEL_EXTENSIONS:
        log.info(f"Allowing YOLO model alias / 允许 YOLO 官方模型名: {model_name}")
        return True, "ok"

    return False, f"YOLO 模型文件不存在: {model_name}"


def validate_yolo_data_dir(path):
    if not os.path.exists(path):
        log.error(f"YOLO data dir {path} not exists, check your params")
        return False

    if not os.path.isdir(path):
        log.error(f"YOLO data dir {path} is not a directory")
        return False

    imgs = get_total_images(path, True)
    if len(imgs) == 0:
        log.error(f"No image found in YOLO data dir {path}")
        return False

    return True


def validate_data_dir(path):
    if not os.path.exists(path):
        log.error(f"Data dir {path} not exists, check your params")
        return False

    if not os.path.isdir(path):
        log.error(f"Data dir {path} is not a directory")
        return False

    dir_content = os.listdir(path)

    if len(dir_content) == 0:
        log.error(f"Data dir {path} is empty, check your params")

    subdirs = [f for f in dir_content if os.path.isdir(os.path.join(path, f))]

    if len(subdirs) == 0:
        log.warning(f"No subdir found in data dir")

    ok_dir = [d for d in subdirs if re.findall(r"^\d+_.+", d)]

    if len(ok_dir) > 0:
        log.info(f"Found {len(ok_dir)} legal dataset")
        return True

    current_dir_is_dataset = bool(re.findall(r"^\d+_.+", os.path.basename(os.path.normpath(path))))
    imgs = get_total_images(path, False)
    captions = glob.glob(path + '/*.txt')
    log.info(f"{len(imgs)} images found, {len(captions)} captions found in current directory")

    if current_dir_is_dataset and len(imgs) > 0:
        log.info("Current train_data_dir looks like a legal dataset folder, accept it directly.")
        return True

    if len(imgs) > 0:
        log.warning(
            "Images were found directly under train_data_dir, but the directory name does not match 'num_name'. "
            "Please either point train_data_dir to the parent folder of dataset subfolders, or rename this folder like '8_character'."
        )
        return False

    log.error("No image found in data dir")
    return False

    return True


def suggest_num_repeat(img_count):
    if img_count <= 10:
        return 7
    elif 10 < img_count <= 50:
        return 5
    elif 50 < img_count <= 100:
        return 3

    return 1


def check_training_params(data):
    potential_path = [
        "train_data_dir", "reg_data_dir", "output_dir"
    ]
    file_paths = [
        "sample_prompts"
    ]
    for p in potential_path:
        if p in data and not os.path.exists(data[p]):
            return False

    for f in file_paths:
        if f in data and not os.path.exists(data[f]):
            return False
    return True


def get_total_images(path, recursive=True):
    if recursive:
        image_files = glob.glob(path + '/**/*.jpg', recursive=True)
        image_files += glob.glob(path + '/**/*.jpeg', recursive=True)
        image_files += glob.glob(path + '/**/*.png', recursive=True)
        image_files += glob.glob(path + '/**/*.webp', recursive=True)
        image_files += glob.glob(path + '/**/*.bmp', recursive=True)
    else:
        image_files = glob.glob(path + '/*.jpg')
        image_files += glob.glob(path + '/*.jpeg')
        image_files += glob.glob(path + '/*.png')
        image_files += glob.glob(path + '/*.webp')
        image_files += glob.glob(path + '/*.bmp')
    return image_files


def fix_config_types(config: dict):
    keep_float_params = [
        "guidance_scale",
        "sigmoid_scale",
        "discrete_flow_shift",
        "training_shift",
        "control_net_lr",
        "self_attn_lr",
        "cross_attn_lr",
        "mlp_lr",
        "mod_lr",
        "llm_adapter_lr",
        "learning_rate_te3",
    ]
    for k in keep_float_params:
        if k in config:
            config[k] = float(config[k])

    validation_float_defaults = {
        "validation_split": 0.0,
    }
    for key, default_value in validation_float_defaults.items():
        if key not in config:
            continue

        value = config[key]
        if value is None or (isinstance(value, str) and value.strip() == ""):
            config[key] = default_value
        else:
            config[key] = float(value)

    optional_validation_int_params = [
        "validation_seed",
        "validate_every_n_steps",
        "validate_every_n_epochs",
        "max_validation_steps",
    ]
    for key in optional_validation_int_params:
        if key not in config:
            continue

        value = config[key]
        if value is None or (isinstance(value, str) and value.strip() == ""):
            del config[key]
        else:
            config[key] = int(value)
