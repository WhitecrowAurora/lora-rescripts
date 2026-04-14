from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from typing import Optional

from mikazuki import launch_utils
from mikazuki.utils import train_utils


AESTHETIC_TARGETS = {"aesthetic", "composition", "color", "sexual"}
YOLO_LOCAL_REPO = (launch_utils.base_dir_path() / "scripts" / "stable" / "ultralytics" / "ultralytics").resolve()
NEWBIE_UPSTREAM_REPO = (launch_utils.base_dir_path() / "scripts" / "dev" / "NewbieLoraTrainer").resolve()
NEWBIE_REQUIRED_RUNTIME_MODULES = ("peft", "torchdiffeq", "timm", "flash_attn")
NEWBIE_LOKR_RUNTIME_MODULE = "lycoris.wrapper"


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


def normalize_text_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        items = []
        for item in value:
            item_str = str(item).strip()
            if item_str:
                items.append(item_str)
        return items

    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    items = []
    for line in text.split("\n"):
        for chunk in line.split(","):
            item = chunk.strip()
            if item:
                items.append(item)
    return items


def get_yolo_data_config_path(config: dict) -> str:
    return str(config.get("yolo_data_config_path", "") or "").strip()


def _resolve_project_path(raw_path: str) -> Path:
    resolved = Path(str(raw_path or "").strip()).expanduser()
    if not resolved.is_absolute():
        resolved = (launch_utils.base_dir_path() / resolved).resolve()
    else:
        resolved = resolved.resolve()
    return resolved


def _module_available(module_name: str) -> bool:
    try:
        return importlib.util.find_spec(module_name) is not None
    except Exception:
        return False


def validate_yolo_runtime_config(config: dict) -> Optional[str]:
    if parse_boolish(config.get("enable_distributed_training")):
        return "当前 YOLO 接入暂不走 Mikazuki 分布式启动。多卡训练请直接使用 GPU 选择或 device 参数交给 Ultralytics 处理。"

    if not YOLO_LOCAL_REPO.exists() or not YOLO_LOCAL_REPO.is_dir():
        return f"未找到内置 Ultralytics 仓库目录: {YOLO_LOCAL_REPO}"

    resume_path = str(config.get("resume", "") or "").strip()
    if resume_path:
        resolved_resume = Path(resume_path).expanduser()
        if not resolved_resume.is_absolute():
            resolved_resume = (launch_utils.base_dir_path() / resolved_resume).resolve()
        else:
            resolved_resume = resolved_resume.resolve()

        if not resolved_resume.exists():
            return f"YOLO resume 检查点不存在: {resolved_resume}"
        if not resolved_resume.is_file():
            return f"YOLO resume 路径必须是 .pt / .pth 文件: {resolved_resume}"
        if resolved_resume.suffix.lower() not in {".pt", ".pth"}:
            return f"YOLO resume 路径必须是 .pt / .pth 文件: {resolved_resume}"

    yolo_data_config_path = get_yolo_data_config_path(config)
    if yolo_data_config_path:
        resolved_data_config = Path(yolo_data_config_path).expanduser()
        if not resolved_data_config.is_absolute():
            resolved_data_config = (launch_utils.base_dir_path() / resolved_data_config).resolve()
        else:
            resolved_data_config = resolved_data_config.resolve()
        if not resolved_data_config.exists():
            return f"YOLO 数据集 yaml 不存在: {resolved_data_config}"
        if not resolved_data_config.is_file():
            return f"YOLO 数据集 yaml 必须是文件: {resolved_data_config}"
        return None

    train_data_dir = str(config.get("train_data_dir", "") or "").strip()
    if not train_data_dir:
        return "YOLO 训练图像目录不能为空，或请直接填写自定义数据集 yaml。"
    if not train_utils.validate_yolo_data_dir(train_data_dir):
        return "YOLO 训练图像目录不存在或没有图片，请检查目录。"

    val_data_dir = str(config.get("val_data_dir", "") or "").strip()
    if val_data_dir and not train_utils.validate_yolo_data_dir(val_data_dir):
        return "YOLO 验证图像目录不存在或没有图片，请检查目录。"

    class_names = normalize_text_list(config.get("class_names"))
    if not class_names:
        return "YOLO 类别列表不能为空，或请直接填写自定义数据集 yaml。"

    return None


def build_yolo_start_warnings(config: dict) -> list[str]:
    if get_yolo_data_config_path(config):
        return ["当前 YOLO 训练将直接使用自定义数据集 yaml。"]
    if not str(config.get("val_data_dir", "") or "").strip():
        return ["YOLO 验证目录留空，本次将回退为训练目录。"]
    return []


def validate_aesthetic_scorer_runtime_config(config: dict) -> Optional[str]:
    if parse_boolish(config.get("enable_distributed_training")):
        return "当前美学评分训练暂不走 Mikazuki 分布式启动。"

    annotations_path = str(config.get("annotations", "") or "").strip()
    if not annotations_path:
        return "美学评分标注文件不能为空。"

    resolved_annotations = Path(annotations_path).expanduser()
    if not resolved_annotations.is_absolute():
        resolved_annotations = (launch_utils.base_dir_path() / resolved_annotations).resolve()
    else:
        resolved_annotations = resolved_annotations.resolve()

    if not resolved_annotations.exists():
        return f"美学评分标注文件不存在: {resolved_annotations}"
    if not resolved_annotations.is_file():
        return f"美学评分标注路径必须是文件: {resolved_annotations}"
    if resolved_annotations.suffix.lower() not in {".jsonl", ".csv", ".db"}:
        return "美学评分标注文件后缀必须是 .jsonl / .csv / .db。"

    image_root = str(config.get("image_root", "") or "").strip()
    if image_root:
        resolved_image_root = Path(image_root).expanduser()
        if not resolved_image_root.is_absolute():
            resolved_image_root = (launch_utils.base_dir_path() / resolved_image_root).resolve()
        else:
            resolved_image_root = resolved_image_root.resolve()
        if not resolved_image_root.exists():
            return f"美学评分 image_root 不存在: {resolved_image_root}"
        if not resolved_image_root.is_dir():
            return f"美学评分 image_root 必须是目录: {resolved_image_root}"

    val_ratio_raw = config.get("val_ratio")
    if val_ratio_raw not in (None, "", "null"):
        try:
            val_ratio = float(val_ratio_raw)
        except (TypeError, ValueError):
            return "美学评分 val_ratio 必须是 0 到 1 之间的浮点数。"
        if not (0.0 < val_ratio < 1.0):
            return "美学评分 val_ratio 必须在 (0,1) 区间。"

    target_dims = normalize_text_list(config.get("target_dims"))
    if not target_dims:
        return "美学评分训练维度不能为空。"
    invalid_dims = [item for item in target_dims if item not in AESTHETIC_TARGETS]
    if invalid_dims:
        return f"美学评分训练维度包含非法项: {invalid_dims}"

    if not parse_boolish(config.get("freeze_extractors", True)):
        return "当前美学评分第一版仅支持冻结特征提取器，请保持 freeze_extractors 开启。"

    return None


def build_aesthetic_scorer_start_warnings(_config: dict) -> list[str]:
    return []


def validate_newbie_runtime_config(config: dict) -> Optional[str]:
    if parse_boolish(config.get("enable_distributed_training")):
        return "当前 Newbie 训练暂不走 Mikazuki 分布式启动。"

    if not NEWBIE_UPSTREAM_REPO.exists() or not NEWBIE_UPSTREAM_REPO.is_dir():
        return f"未找到 Newbie 上游训练核心目录: {NEWBIE_UPSTREAM_REPO}"

    model_path = str(config.get("pretrained_model_name_or_path", "") or "").strip()
    if not model_path:
        return "Newbie 底模目录不能为空。"
    resolved_model_path = _resolve_project_path(model_path)
    if not resolved_model_path.exists():
        return f"Newbie 底模目录不存在: {resolved_model_path}"
    if not resolved_model_path.is_dir():
        return f"Newbie 当前要求使用完整本地模型目录: {resolved_model_path}"

    train_data_dir = str(config.get("train_data_dir", "") or "").strip()
    if not train_data_dir:
        return "Newbie 训练图像目录不能为空。"
    if not train_utils.validate_data_dir(train_data_dir):
        return "Newbie 训练图像目录不存在或没有图片，请检查目录。"

    resume_path = str(config.get("resume", "") or "").strip()
    if resume_path:
        resolved_resume = _resolve_project_path(resume_path)
        if not resolved_resume.exists():
            return f"Newbie resume 路径不存在: {resolved_resume}"

    adapter_type = str(config.get("adapter_type", config.get("lora_type", "lora")) or "lora").strip().lower()
    missing_modules = [module_name for module_name in NEWBIE_REQUIRED_RUNTIME_MODULES if not _module_available(module_name)]
    if adapter_type in {"lokr", "lyco_lokr", "lycoris_lokr", "lyco-lokr"} and not _module_available(NEWBIE_LOKR_RUNTIME_MODULE):
        missing_modules.append(NEWBIE_LOKR_RUNTIME_MODULE)

    if missing_modules:
        missing_text = ", ".join(missing_modules)
        return (
            "当前运行时缺少 Newbie 训练所需依赖: "
            f"{missing_text}。"
            "请运行 install_newbie_support.bat 后重启客户端再试。"
            "Newbie 现在会直接复用你当前启动 GUI 的 Python，不会再切到独立 Newbie 运行时。"
            "另外，上游 Newbie 模型当前会硬依赖 flash_attn；如果当前运行时没有 flash_attn，就算公共依赖补齐也还不能直接训练。"
        )

    return None


def build_newbie_start_warnings(config: dict) -> list[str]:
    warnings: list[str] = [
        "Newbie 训练会直接复用当前 GUI 所在运行时，不会切换到独立 Newbie Python 环境。"
    ]
    if parse_boolish(config.get("enable_preview")):
        warnings.append("Newbie 新分支当前仍建议关闭训练中预览，以避免额外显存峰值。")
    if not parse_boolish(config.get("use_cache", True)):
        warnings.append("当前 Newbie 分支建议保持 use_cache 开启；关闭后正式训练阶段显存峰值会明显更高。")
    return warnings


def build_newbie_runtime_payload() -> dict:
    modules = {
        "peft": _module_available("peft"),
        "torchdiffeq": _module_available("torchdiffeq"),
        "timm": _module_available("timm"),
        "lycoris_wrapper": _module_available(NEWBIE_LOKR_RUNTIME_MODULE),
        "flash_attn": _module_available("flash_attn"),
    }
    shared_support_ready = bool(modules["peft"] and modules["torchdiffeq"] and modules["timm"])
    train_ready = bool(shared_support_ready and modules["flash_attn"])

    warnings: list[str] = []
    errors: list[str] = []
    notes: list[str] = []

    if not shared_support_ready:
        missing = [name for name in ("peft", "torchdiffeq", "timm") if not modules[name]]
        errors.append(
            "当前运行时缺少 Newbie 公共依赖: "
            f"{', '.join(missing)}。请运行 install_newbie_support.bat 后重启客户端再试。"
        )
    if shared_support_ready and not modules["flash_attn"]:
        warnings.append(
            "当前运行时没有 flash_attn。上游 Newbie 模型目前仍硬依赖 flash_attn，"
            "因此即使公共依赖已补齐，这个运行时也还不能直接开始 Newbie 训练。"
        )
    if not modules["lycoris_wrapper"]:
        notes.append("lycoris.wrapper 当前不可用；Newbie LoKr 模式会不可用，但普通 LoRA 模式不受影响。")

    return {
        "python_executable": sys.executable,
        "upstream_repo_found": bool(NEWBIE_UPSTREAM_REPO.exists() and NEWBIE_UPSTREAM_REPO.is_dir()),
        "shared_support_ready": shared_support_ready,
        "train_ready": train_ready,
        "modules": modules,
        "warnings": warnings,
        "errors": errors,
        "notes": notes,
    }


def build_yolo_preflight_summary(
    payload: dict,
    errors: list[str],
    warnings: list[str],
    notes: list[str],
) -> dict | None:
    if parse_boolish(payload.get("enable_distributed_training")):
        errors.append("当前 YOLO 接入暂不走 Mikazuki 分布式启动。多卡训练请直接使用 GPU 选择或 device 参数交给 Ultralytics 处理。")

    if not YOLO_LOCAL_REPO.exists() or not YOLO_LOCAL_REPO.is_dir():
        errors.append(f"未找到内置 Ultralytics 仓库目录: {YOLO_LOCAL_REPO}")
    else:
        notes.append(f"Ultralytics 本地仓库: {YOLO_LOCAL_REPO}")

    device = str(payload.get("device", "") or "").strip()
    if device:
        notes.append(f"YOLO device 参数: {device}")

    resume_path = str(payload.get("resume", "") or "").strip()
    if resume_path:
        resolved_resume = _resolve_project_path(resume_path)
        if not resolved_resume.exists():
            errors.append(f"YOLO resume 检查点不存在: {resolved_resume}")
        elif not resolved_resume.is_file():
            errors.append(f"YOLO resume 路径必须是 .pt / .pth 文件: {resolved_resume}")
        elif resolved_resume.suffix.lower() not in {".pt", ".pth"}:
            errors.append(f"YOLO resume 路径必须是 .pt / .pth 文件: {resolved_resume}")
        else:
            notes.append(f"YOLO resume 检查点: {resolved_resume}")

    yolo_data_config_path = get_yolo_data_config_path(payload)
    if yolo_data_config_path:
        resolved_data_config = _resolve_project_path(yolo_data_config_path)
        if not resolved_data_config.exists():
            errors.append(f"YOLO 数据集 yaml 不存在: {resolved_data_config}")
            return None
        if not resolved_data_config.is_file():
            errors.append(f"YOLO 数据集 yaml 必须是文件: {resolved_data_config}")
            return None

        notes.append(f"YOLO 数据集配置: {resolved_data_config}")
        warnings.append("当前 YOLO 训练将直接使用自定义数据集 yaml，下方训练/验证目录与类别列表不会参与自动生成。")
        return {
            "mode": "custom_data_yaml",
            "data_config_path": resolved_data_config.as_posix(),
        }

    train_data_dir = str(payload.get("train_data_dir", "") or "").strip()
    train_image_count = 0
    if not train_data_dir:
        errors.append("YOLO 训练图像目录不能为空，或请直接填写自定义数据集 yaml。")
    elif not train_utils.validate_yolo_data_dir(train_data_dir):
        errors.append("YOLO 训练图像目录不存在或没有图片，请检查目录。")
    else:
        train_image_count = len(train_utils.get_total_images(train_data_dir))
        notes.append(f"YOLO 训练图像数量: {train_image_count}")

    val_data_dir = str(payload.get("val_data_dir", "") or "").strip()
    val_image_count = train_image_count
    if val_data_dir:
        if not train_utils.validate_yolo_data_dir(val_data_dir):
            errors.append("YOLO 验证图像目录不存在或没有图片，请检查目录。")
        else:
            val_image_count = len(train_utils.get_total_images(val_data_dir))
            notes.append(f"YOLO 验证图像数量: {val_image_count}")
    else:
        warnings.append("YOLO 验证目录留空，将回退为训练目录。")

    class_names = normalize_text_list(payload.get("class_names"))
    if not class_names:
        errors.append("YOLO 类别列表不能为空，或请直接填写自定义数据集 yaml。")
    else:
        notes.append(f"YOLO 类别数: {len(class_names)}")

    if train_image_count <= 0:
        return None

    return {
        "mode": "image_folder",
        "image_count": train_image_count,
        "val_image_count": val_image_count,
        "class_count": len(class_names),
    }


def build_aesthetic_scorer_preflight_summary(
    payload: dict,
    errors: list[str],
    warnings: list[str],
    notes: list[str],
) -> dict | None:
    if parse_boolish(payload.get("enable_distributed_training")):
        errors.append("当前美学评分训练暂不走 Mikazuki 分布式启动。")

    resume_path = str(payload.get("resume", "") or "").strip()
    if resume_path:
        warnings.append("当前美学评分第一版暂未开放 resume 接入，已忽略 resume 校验。")

    annotations_path = str(payload.get("annotations", "") or "").strip()
    resolved_annotations: Path | None = None
    if not annotations_path:
        errors.append("美学评分标注文件不能为空。")
    else:
        resolved_annotations = _resolve_project_path(annotations_path)
        if not resolved_annotations.exists():
            errors.append(f"美学评分标注文件不存在: {resolved_annotations}")
        elif not resolved_annotations.is_file():
            errors.append(f"美学评分标注路径必须是文件: {resolved_annotations}")
        elif resolved_annotations.suffix.lower() not in {".jsonl", ".csv", ".db"}:
            errors.append("美学评分标注文件后缀必须是 .jsonl / .csv / .db。")
        else:
            notes.append(f"美学评分标注文件: {resolved_annotations}")

    image_root = str(payload.get("image_root", "") or "").strip()
    resolved_image_root: Path | None = None
    if image_root:
        resolved_image_root = _resolve_project_path(image_root)
        if not resolved_image_root.exists():
            errors.append(f"美学评分 image_root 不存在: {resolved_image_root}")
        elif not resolved_image_root.is_dir():
            errors.append(f"美学评分 image_root 必须是目录: {resolved_image_root}")
        else:
            notes.append(f"美学评分 image_root: {resolved_image_root}")

    val_ratio_raw = payload.get("val_ratio")
    if val_ratio_raw not in (None, "", "null"):
        try:
            val_ratio = float(val_ratio_raw)
        except (TypeError, ValueError):
            errors.append("美学评分 val_ratio 必须是 0 到 1 之间的浮点数。")
        else:
            if not (0.0 < val_ratio < 1.0):
                errors.append("美学评分 val_ratio 必须在 (0,1) 区间。")

    target_dims = normalize_text_list(payload.get("target_dims"))
    if not target_dims:
        errors.append("美学评分训练维度不能为空。")
    else:
        invalid_dims = [item for item in target_dims if item not in AESTHETIC_TARGETS]
        if invalid_dims:
            errors.append(f"美学评分训练维度包含非法项: {invalid_dims}")
        else:
            notes.append(f"美学评分训练维度: {', '.join(target_dims)}")

    if not parse_boolish(payload.get("freeze_extractors", True)):
        errors.append("当前美学评分第一版仅支持冻结特征提取器，请保持 freeze_extractors 开启。")

    if resolved_annotations is None:
        return None

    return {
        "mode": "annotation_file",
        "annotations": resolved_annotations.as_posix(),
        "image_root": resolved_image_root.as_posix() if resolved_image_root is not None else "",
        "target_dims": target_dims,
    }
