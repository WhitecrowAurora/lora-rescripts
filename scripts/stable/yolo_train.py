import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional

import toml
from mikazuki.plugins.training_hooks import (
    emit_after_optimizer_step_event,
    emit_after_loss_event,
    emit_before_forward_event,
    emit_before_optimizer_step_event,
)


YOLO_MODEL_EXTENSIONS = {".pt", ".pth", ".yaml", ".yml"}


def ensure_local_ultralytics_repo(repo_root: Path) -> Path:
    ultralytics_repo = repo_root / "scripts" / "stable" / "ultralytics"
    package_dir = ultralytics_repo / "ultralytics"
    if not ultralytics_repo.exists() or not package_dir.exists():
        raise FileNotFoundError(f"Bundled Ultralytics repo not found: {ultralytics_repo}")
    if str(ultralytics_repo) not in sys.path:
        sys.path.insert(0, str(ultralytics_repo))
    return ultralytics_repo


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


def safe_int(value, default: int) -> int:
    try:
        return int(round(float(value)))
    except (TypeError, ValueError):
        return default


def safe_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def resolve_path(repo_root: Path, raw_value: str, *, must_exist: bool = False, file_only: bool = False, dir_only: bool = False) -> Path:
    value = str(raw_value or "").strip()
    if not value:
        raise ValueError("Path value is empty.")

    path = Path(value).expanduser()
    if not path.is_absolute():
        path = (repo_root / path).resolve()
    else:
        path = path.resolve()

    if must_exist and not path.exists():
        raise FileNotFoundError(f"Path does not exist: {path}")
    if file_only and path.exists() and not path.is_file():
        raise ValueError(f"Expected a file path, got directory: {path}")
    if dir_only and path.exists() and not path.is_dir():
        raise ValueError(f"Expected a directory path, got file: {path}")
    return path


def resolve_model_source(repo_root: Path, raw_value: str) -> str:
    value = str(raw_value or "").strip()
    if not value:
        raise ValueError("pretrained_model_name_or_path is empty.")

    candidate = Path(value).expanduser()
    if candidate.exists():
        resolved = resolve_path(repo_root, value, must_exist=True, file_only=True)
        return resolved.as_posix()

    if any(sep in value for sep in ("/", "\\")):
        raise FileNotFoundError(f"YOLO model file not found: {value}")

    suffix = candidate.suffix.lower()
    if suffix in YOLO_MODEL_EXTENSIONS:
        return value

    raise FileNotFoundError(f"YOLO model file not found: {value}")


def build_generated_data_yaml(config: dict, config_path: Path, repo_root: Path) -> str:
    train_dir = resolve_path(repo_root, config.get("train_data_dir", ""), must_exist=True, dir_only=True)

    raw_val_dir = str(config.get("val_data_dir", "") or "").strip()
    if raw_val_dir:
        val_dir = resolve_path(repo_root, raw_val_dir, must_exist=True, dir_only=True)
    else:
        val_dir = train_dir

    class_names = normalize_text_list(config.get("class_names"))
    if not class_names:
        raise ValueError("class_names is empty. Provide at least one class name or fill yolo_data_config_path.")

    yaml_lines = [
        f"train: {json.dumps(train_dir.as_posix(), ensure_ascii=False)}",
        f"val: {json.dumps(val_dir.as_posix(), ensure_ascii=False)}",
        "names:",
    ]
    for idx, class_name in enumerate(class_names):
        yaml_lines.append(f"  {idx}: {json.dumps(class_name, ensure_ascii=False)}")

    yaml_path = config_path.with_name(f"{config_path.stem}.yolo-data.yaml")
    yaml_path.write_text("\n".join(yaml_lines) + "\n", encoding="utf-8")
    return yaml_path.as_posix()


def resolve_data_config(config: dict, config_path: Path, repo_root: Path) -> str:
    raw_value = str(config.get("yolo_data_config_path", "") or "").strip()
    if raw_value:
        resolved = resolve_path(repo_root, raw_value, must_exist=True, file_only=True)
        return resolved.as_posix()
    return build_generated_data_yaml(config, config_path, repo_root)


def resolve_device_argument(config: dict) -> Optional[str]:
    configured = str(config.get("device", "") or "").strip()
    if configured:
        return configured

    visible_devices = str(os.environ.get("CUDA_VISIBLE_DEVICES", "") or "").strip()
    if not visible_devices:
        return None

    device_ids = [item.strip() for item in visible_devices.split(",") if item.strip() != ""]
    if len(device_ids) <= 1:
        return None

    return ",".join(str(index) for index in range(len(device_ids)))


def install_yolo_plugin_callbacks(model, config: dict) -> None:
    state = {
        "global_step": 0,
        "batch_index": 0,
        "pending_global_step_increment": False,
        "current_batch_size": 1,
    }
    training_type = str(config.get("model_train_type", "yolo") or "yolo").strip() or "yolo"

    def _gradient_accumulation_steps(trainer) -> int:
        return max(1, safe_int(getattr(trainer, "accumulate", 1), 1))

    def _current_batch_size(trainer) -> int:
        return max(1, safe_int(getattr(trainer, "batch_size", 1), 1))

    def _current_loss(trainer) -> float:
        loss = getattr(trainer, "loss", None)
        if loss is None:
            return 0.0
        try:
            return float(loss.detach().item())
        except Exception:
            return safe_float(loss, 0.0)

    def _common_extra(trainer) -> dict:
        return {
            "epoch": safe_int(getattr(trainer, "epoch", 0), 0) + 1,
            "batch_index": int(state["batch_index"]),
            "ultralytics_accumulate": _gradient_accumulation_steps(trainer),
        }

    def _on_train_start(trainer):
        if getattr(trainer, "_mikazuki_plugin_patch_applied", False):
            return
        trainer._mikazuki_plugin_patch_applied = True
        original_optimizer_step = trainer.optimizer_step

        def _wrapped_optimizer_step():
            emit_before_optimizer_step_event(
                route="yolo",
                training_type=training_type,
                global_step=int(state["global_step"]),
                current_loss=_current_loss(trainer),
                optimizer=getattr(trainer, "optimizer", None),
                lr_scheduler=getattr(trainer, "scheduler", None),
                gradient_accumulation_steps=_gradient_accumulation_steps(trainer),
                sync_gradients=True,
                max_grad_norm=10.0,
                extra=_common_extra(trainer),
                source="yolo_train",
            )
            result = original_optimizer_step()
            emit_after_optimizer_step_event(
                route="yolo",
                training_type=training_type,
                global_step=int(state["global_step"]),
                current_loss=_current_loss(trainer),
                optimizer=getattr(trainer, "optimizer", None),
                lr_scheduler=getattr(trainer, "scheduler", None),
                gradient_accumulation_steps=_gradient_accumulation_steps(trainer),
                sync_gradients=True,
                max_grad_norm=10.0,
                optimizer_step_executed=True,
                scheduler_step_executed=False,
                zero_grad_called=True,
                extra=_common_extra(trainer),
                source="yolo_train",
            )
            state["pending_global_step_increment"] = True
            return result

        trainer.optimizer_step = _wrapped_optimizer_step

    def _on_train_batch_start(trainer):
        state["batch_index"] += 1
        state["current_batch_size"] = _current_batch_size(trainer)
        emit_before_forward_event(
            route="yolo",
            training_type=training_type,
            global_step=int(state["global_step"]),
            micro_batch_index=1,
            micro_batch_count=1,
            micro_batch_size=int(state["current_batch_size"]),
            gradient_accumulation_steps=_gradient_accumulation_steps(trainer),
            sync_gradients=bool(_gradient_accumulation_steps(trainer) <= 1),
            extra=_common_extra(trainer),
            source="yolo_train",
        )

    def _on_train_batch_end(trainer):
        current_loss = _current_loss(trainer)
        emit_after_loss_event(
            route="yolo",
            training_type=training_type,
            global_step=int(state["global_step"]),
            micro_batch_index=1,
            micro_batch_count=1,
            micro_batch_size=int(state["current_batch_size"]),
            loss_value=current_loss,
            loss_scale=1.0,
            weighted_loss=current_loss,
            gradient_accumulation_steps=_gradient_accumulation_steps(trainer),
            sync_gradients=bool(state["pending_global_step_increment"] or _gradient_accumulation_steps(trainer) <= 1),
            extra={
                **_common_extra(trainer),
                "loss_items": str(getattr(trainer, "loss_items", "")),
            },
            source="yolo_train",
        )
        if state["pending_global_step_increment"]:
            state["global_step"] += 1
            state["pending_global_step_increment"] = False

    model.add_callback("on_train_start", _on_train_start)
    model.add_callback("on_train_batch_start", _on_train_batch_start)
    model.add_callback("on_train_batch_end", _on_train_batch_end)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config_file", required=True)
    args = parser.parse_args()

    config_path = Path(args.config_file).expanduser().resolve()
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    repo_root = Path(__file__).resolve().parents[2]
    ensure_local_ultralytics_repo(repo_root)

    from ultralytics import YOLO

    config = toml.load(config_path)
    model_source = resolve_model_source(repo_root, config.get("pretrained_model_name_or_path", ""))
    data_config = resolve_data_config(config, config_path, repo_root)

    output_dir = resolve_path(repo_root, config.get("output_dir", "./output/yolo"), must_exist=False)
    output_dir.mkdir(parents=True, exist_ok=True)

    output_name = str(config.get("output_name", "exp") or "exp").strip() or "exp"
    resume_path = str(config.get("resume", "") or "").strip()
    if resume_path:
        resume_path = resolve_path(repo_root, resume_path, must_exist=True, file_only=True).as_posix()

    train_args = {
        "data": data_config,
        "epochs": max(1, safe_int(config.get("epochs", 100), 100)),
        "batch": max(1, safe_int(config.get("batch", 16), 16)),
        "imgsz": max(32, safe_int(config.get("imgsz", 640), 640)),
        "workers": max(0, safe_int(config.get("workers", 8), 8)),
        "project": output_dir.as_posix(),
        "name": output_name,
        "resume": resume_path or False,
    }

    device = resolve_device_argument(config)
    if device:
        train_args["device"] = device

    save_period = safe_int(config.get("save_every_n_epochs", -1), -1)
    if save_period > 0:
        train_args["save_period"] = save_period

    seed = safe_int(config.get("seed", -1), -1)
    if seed >= 0:
        train_args["seed"] = seed

    model_init_source = resume_path or model_source
    model = YOLO(model_init_source, task="detect")
    install_yolo_plugin_callbacks(model, config)

    print(f"[yolo] model: {model_source}")
    print(f"[yolo] data: {data_config}")
    print(f"[yolo] output: {output_dir.as_posix()}/{output_name}")
    if device:
        print(f"[yolo] device: {device}")
    if resume_path:
        print(f"[yolo] resume: {resume_path}")

    model.train(**train_args)


if __name__ == "__main__":
    main()
