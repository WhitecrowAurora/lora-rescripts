import argparse
import copy
import json
import math
import re
from pathlib import Path
from typing import Any

import toml

ROOT = Path(__file__).resolve().parents[2]
TARGETS = ("aesthetic", "composition", "color", "sexual")
ALLOWED_MODEL_FORMATS = ("safetensors", "pt", "pth", "ckpt")

DEFAULT_CONFIG: dict[str, Any] = {
    "data": {
        "annotations": "",
        "image_root": None,
        "train_split": None,
        "val_split": None,
    },
    "models": {
        "jtp3_model_id": "RedRocket/JTP-3",
        "jtp3_fallback_model_id": None,
        "hf_token_env": "HF_TOKEN",
        "waifu_clip_model_name": "ViT-L-14",
        "waifu_clip_pretrained": "openai",
        "waifu_v3_head_path": None,
        "freeze_extractors": True,
        "include_waifu_score": True,
    },
    "model_head": {
        "hidden_dims": [1024, 256],
        "dropout": 0.2,
    },
    "training": {
        "seed": 42,
        "device": "cuda",
        "batch_size": 8,
        "num_workers": 4,
        "val_ratio": 0.1,
        "epochs": 10,
        "lr": 0.0003,
        "weight_decay": 0.0001,
        "loss": "mse",
        "cls_loss_weight": 1.0,
        "cls_pos_weight": None,
        "target_dims": list(TARGETS),
        "output_dir": "./output/aesthetic-scorer",
        "model_name": "aesthetic-scorer-best",
        "model_format": "safetensors",
    },
}


def fmt_or_dash(v: float) -> str:
    return "-" if not math.isfinite(float(v)) else f"{float(v):.4f}"


def _selected_dim_mae_text(metrics: dict[str, Any], selected_dims: list[str]) -> str:
    per_dim = metrics.get("per_dim_mae") or []
    dim_to_value = {
        name: float(per_dim[index]) if index < len(per_dim) else float("nan")
        for index, name in enumerate(TARGETS)
    }
    return ", ".join(f"{name}:{fmt_or_dash(dim_to_value.get(name, float('nan')))}" for name in selected_dims)


def _normalize_split(v: Any) -> str | None:
    if v is None:
        return None
    s = str(v).strip()
    if not s or s.lower() in {"none", "null"}:
        return None
    return s


def _resolve_path(base_dir: Path, value: str | None) -> Path | None:
    if value in (None, "", "null"):
        return None
    p = Path(str(value))
    if not p.is_absolute():
        p = (base_dir / p).resolve()
    else:
        p = p.resolve()
    return p


def _parse_boolish(value: Any, default: bool = False) -> bool:
    if value is None:
        return bool(default)
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value != 0
    text = str(value).strip().lower()
    if text in {"", "none", "null"}:
        return bool(default)
    if text in {"1", "true", "yes", "on"}:
        return True
    if text in {"0", "false", "no", "off"}:
        return False
    return bool(value)


def _parse_hidden_dims(raw: Any) -> list[int]:
    if raw in (None, "", "null"):
        return [1024, 256]
    if isinstance(raw, (list, tuple)):
        parts = [str(item).strip() for item in raw if str(item).strip()]
    else:
        text = str(raw).replace("\r\n", "\n").replace("\r", "\n").replace("\n", ",")
        parts = [item.strip() for item in text.split(",") if item.strip()]
    dims = [int(part) for part in parts]
    dims = [dim for dim in dims if dim > 0]
    if not dims:
        raise ValueError("hidden_dims 至少需要一个正整数，例如 1024,256")
    return dims


def _parse_val_ratio(v: Any) -> float | None:
    if v in (None, "", "null"):
        return None
    fv = float(v)
    if not (0.0 < fv < 1.0):
        raise ValueError("val_ratio 必须在 (0,1) 区间，例如 0.1 或 0.15")
    return fv


def _parse_target_dims(raw: Any) -> list[str]:
    if raw in (None, "", "null"):
        return list(TARGETS)
    if isinstance(raw, (list, tuple)):
        vals = [str(x).strip().lower() for x in raw if str(x).strip()]
    else:
        text = str(raw).replace("\r\n", "\n").replace("\r", "\n").replace("\n", ",")
        vals = [x.strip().lower() for x in text.split(",") if x.strip()]
    if not vals:
        return list(TARGETS)
    invalid = [x for x in vals if x not in TARGETS]
    if invalid:
        raise ValueError(f"target_dims 含非法维度: {invalid}，可选: {list(TARGETS)}")
    out = []
    seen = set()
    for value in vals:
        if value not in seen:
            out.append(value)
            seen.add(value)
    return out


def _normalize_model_format(raw: Any) -> str:
    fmt = str(raw or "").strip().lower().lstrip(".")
    if not fmt:
        return "safetensors"
    if fmt not in ALLOWED_MODEL_FORMATS:
        raise ValueError(f"model_format 不合法: {fmt}，可选: {list(ALLOWED_MODEL_FORMATS)}")
    return fmt


def _sanitize_model_name(raw: Any) -> str:
    name = str(raw or "").strip()
    if not name:
        return "best"
    name = Path(name).name
    if Path(name).suffix:
        name = Path(name).stem
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._-")
    return name or "best"


def _build_model_filename(name_raw: Any, fmt_raw: Any) -> str:
    name = _sanitize_model_name(name_raw)
    fmt = _normalize_model_format(fmt_raw)
    return f"{name}.{fmt}"


def _build_runtime_config(config_path: Path) -> tuple[dict[str, Any], Path]:
    raw = toml.load(config_path)
    cfg = copy.deepcopy(DEFAULT_CONFIG)
    config_base = ROOT

    data = cfg.setdefault("data", {})
    models = cfg.setdefault("models", {})
    model_head = cfg.setdefault("model_head", {})
    training = cfg.setdefault("training", {})

    data["annotations"] = raw.get("annotations", data.get("annotations"))
    data["image_root"] = raw.get("image_root", data.get("image_root"))
    data["train_split"] = _normalize_split(raw.get("train_split", data.get("train_split")))
    data["val_split"] = _normalize_split(raw.get("val_split", data.get("val_split")))

    models["jtp3_model_id"] = str(raw.get("jtp3_model_id", models.get("jtp3_model_id")) or models.get("jtp3_model_id"))
    models["jtp3_fallback_model_id"] = _normalize_split(raw.get("jtp3_fallback_model_id"))
    models["hf_token_env"] = str(raw.get("hf_token_env", models.get("hf_token_env", "HF_TOKEN")) or "HF_TOKEN")
    models["waifu_clip_model_name"] = str(
        raw.get("waifu_clip_model_name", models.get("waifu_clip_model_name", "ViT-L-14")) or "ViT-L-14"
    )
    models["waifu_clip_pretrained"] = str(
        raw.get("waifu_clip_pretrained", models.get("waifu_clip_pretrained", "openai")) or "openai"
    )
    models["waifu_v3_head_path"] = raw.get("waifu_v3_head_path", models.get("waifu_v3_head_path"))
    models["freeze_extractors"] = _parse_boolish(raw.get("freeze_extractors", models.get("freeze_extractors", True)), True)
    models["include_waifu_score"] = _parse_boolish(
        raw.get("include_waifu_score", models.get("include_waifu_score", True)),
        True,
    )

    model_head["hidden_dims"] = _parse_hidden_dims(raw.get("hidden_dims", model_head.get("hidden_dims")))
    model_head["dropout"] = float(raw.get("dropout", model_head.get("dropout", 0.2)) or 0.2)

    training["seed"] = int(raw.get("seed", training.get("seed", 42)) or 42)
    training["device"] = str(raw.get("device", training.get("device", "cuda")) or "cuda")
    training["batch_size"] = int(raw.get("batch_size", training.get("batch_size", 8)) or 8)
    training["num_workers"] = int(raw.get("num_workers", training.get("num_workers", 4)) or 4)
    training["epochs"] = int(raw.get("epochs", training.get("epochs", 10)) or 10)
    training["lr"] = float(raw.get("learning_rate", raw.get("lr", training.get("lr", 3e-4))) or 3e-4)
    training["weight_decay"] = float(raw.get("weight_decay", training.get("weight_decay", 1e-4)) or 1e-4)
    training["loss"] = str(raw.get("loss", training.get("loss", "mse")) or "mse").strip().lower()
    training["cls_loss_weight"] = float(raw.get("cls_loss_weight", training.get("cls_loss_weight", 1.0)) or 1.0)
    training["cls_pos_weight"] = raw.get("cls_pos_weight", training.get("cls_pos_weight"))
    training["val_ratio"] = raw.get("val_ratio", training.get("val_ratio"))
    training["target_dims"] = _parse_target_dims(raw.get("target_dims", training.get("target_dims")))
    training["model_name"] = str(
        raw.get("output_name", raw.get("model_name", training.get("model_name", "aesthetic-scorer-best")))
        or "aesthetic-scorer-best"
    )
    training["model_format"] = str(
        raw.get("save_model_as", raw.get("model_format", training.get("model_format", "safetensors"))) or "safetensors"
    )
    training["output_dir"] = raw.get("output_dir", training.get("output_dir", "./output/aesthetic-scorer"))

    ann = _resolve_path(config_base, data.get("annotations"))
    if ann is None:
        raise ValueError("annotations 不能为空，请填写 jsonl/csv/db 标注文件路径。")
    data["annotations"] = str(ann)

    img_root = _resolve_path(config_base, data.get("image_root"))
    data["image_root"] = str(img_root) if img_root is not None else None

    out_dir = _resolve_path(config_base, training.get("output_dir"))
    if out_dir is None:
        out_dir = (ROOT / "output" / "aesthetic-scorer").resolve()
    training["output_dir"] = str(out_dir)

    waifu_head = _resolve_path(config_base, models.get("waifu_v3_head_path"))
    if waifu_head is None:
        fallback = (ROOT / "model" / "_models" / "waifu-scorer-v3" / "model.safetensors").resolve()
        if fallback.exists():
            waifu_head = fallback
    models["waifu_v3_head_path"] = str(waifu_head) if waifu_head is not None else None

    val_ratio_raw = training.get("val_ratio")
    if val_ratio_raw in (None, "", "null"):
        training["val_ratio"] = None
    else:
        training["val_ratio"] = float(val_ratio_raw)

    return cfg, config_base


def _build_train_val_datasets(
    *,
    annotations_path: Path,
    image_root: Path | None,
    train_split: str | None,
    val_split: str | None,
    val_ratio: float | None,
    seed: int,
    torch_mod,
    RatingDatasetCls,
) -> tuple[Any, Any, dict[str, Any]]:
    base_ds = RatingDatasetCls(annotation_file=annotations_path, image_root=image_root, split=None)
    has_split_field = bool(getattr(base_ds, "has_split_field", False))
    requested_split = bool(train_split is not None or val_split is not None)

    if has_split_field and requested_split:
        train_ds = RatingDatasetCls(annotation_file=annotations_path, image_root=image_root, split=train_split)
        val_ds = RatingDatasetCls(annotation_file=annotations_path, image_root=image_root, split=val_split)
        meta = {
            "strategy": "split_field",
            "train_size": len(train_ds),
            "val_size": len(val_ds),
            "val_ratio": None,
        }
        return train_ds, val_ds, meta

    if val_ratio is not None:
        total = len(base_ds)
        if total < 2:
            raise ValueError("样本数不足，无法按比例切分验证集（至少需要 2 条）。")
        val_n = int(round(total * float(val_ratio)))
        val_n = max(1, min(total - 1, val_n))
        generator = torch_mod.Generator().manual_seed(int(seed))
        perm = torch_mod.randperm(total, generator=generator).tolist()
        val_indices = perm[:val_n]
        train_indices = perm[val_n:]
        train_ds = torch_mod.utils.data.Subset(base_ds, train_indices)
        val_ds = torch_mod.utils.data.Subset(base_ds, val_indices)
        meta = {
            "strategy": "random_ratio",
            "train_size": len(train_indices),
            "val_size": len(val_indices),
            "val_ratio": float(val_n) / float(total),
        }
        return train_ds, val_ds, meta

    train_ds = RatingDatasetCls(annotation_file=annotations_path, image_root=image_root, split=train_split)
    val_ds = RatingDatasetCls(annotation_file=annotations_path, image_root=image_root, split=val_split)
    meta = {
        "strategy": "shared_dataset" if len(train_ds) == len(val_ds) else "split_fallback",
        "train_size": len(train_ds),
        "val_size": len(val_ds),
        "val_ratio": None,
    }
    return train_ds, val_ds, meta


def _print_train_args(cfg: dict[str, Any], split_meta: dict[str, Any], target_dims: list[str]) -> None:
    data = cfg["data"]
    training = cfg["training"]
    print("\n========== 美学评分训练参数 ==========")
    print(f"标注文件: {data['annotations']}")
    print(f"图片根目录: {data.get('image_root') or '(按标注中的路径解析)'}")
    print(f"训练 split: {data.get('train_split')}")
    print(f"验证 split: {data.get('val_split')}")
    print(
        "验证集策略: "
        f"{split_meta.get('strategy')} "
        f"(train_n={split_meta.get('train_size')}, val_n={split_meta.get('val_size')}, "
        f"val_ratio={split_meta.get('val_ratio')})"
    )
    print(f"设备: {training.get('device')}")
    print(f"批量大小: {training.get('batch_size')}")
    print(f"训练轮数: {training.get('epochs')}")
    print(f"学习率: {training.get('lr')}")
    print(f"权重衰减: {training.get('weight_decay')}")
    print(f"训练维度: {', '.join(target_dims)}")
    print(f"输出目录: {training.get('output_dir')}")


def make_loader(dataset, batch_size: int, num_workers: int, shuffle: bool):
    from torch.utils.data import DataLoader
    from lulynx.aesthetic_fusion.data import collate_pil_batch

    return DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=num_workers,
        collate_fn=collate_pil_batch,
        pin_memory=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Train aesthetic fusion scorer from Mikazuki TOML config.")
    parser.add_argument("--config_file", required=True, help="Mikazuki TOML config path")
    args = parser.parse_args()

    import torch

    from lulynx.aesthetic_fusion.data import RatingDataset
    from lulynx.aesthetic_fusion.extractors import JTP3FeatureExtractor, WaifuV3ClipFeatureExtractor
    from lulynx.aesthetic_fusion.model import FusionMultiTaskHead
    from lulynx.aesthetic_fusion.train_utils import run_epoch, save_checkpoint, set_seed

    config_path = Path(args.config_file).expanduser().resolve()
    if not config_path.exists():
        raise FileNotFoundError(f"配置文件不存在: {config_path}")

    cfg, _ = _build_runtime_config(config_path)
    set_seed(int(cfg["training"]["seed"]))

    annotations_path = Path(str(cfg["data"]["annotations"])).resolve()
    if not annotations_path.exists():
        raise FileNotFoundError(f"标注文件不存在: {annotations_path}")

    image_root = None
    if cfg["data"].get("image_root"):
        image_root = Path(str(cfg["data"]["image_root"])).resolve()
        if not image_root.exists():
            raise FileNotFoundError(f"image_root 不存在: {image_root}")

    train_split = _normalize_split(cfg["data"].get("train_split"))
    val_split = _normalize_split(cfg["data"].get("val_split"))
    val_ratio = _parse_val_ratio(cfg["training"].get("val_ratio"))
    target_dims = _parse_target_dims(cfg["training"].get("target_dims"))
    cfg["training"]["target_dims"] = list(target_dims)

    model_filename = _build_model_filename(
        cfg["training"].get("model_name"),
        cfg["training"].get("model_format"),
    )
    cfg["training"]["model_name"] = Path(model_filename).stem
    cfg["training"]["model_format"] = Path(model_filename).suffix.lstrip(".").lower()

    device = str(cfg["training"].get("device", "cuda" if torch.cuda.is_available() else "cpu"))
    if device.startswith("cuda") and not torch.cuda.is_available():
        print("[警告] 请求使用 CUDA，但当前不可用。已自动切换为 CPU。")
        device = "cpu"
    cfg["training"]["device"] = device

    target_dims_set = set(target_dims)
    target_mask = torch.tensor(
        [1.0 if name in target_dims_set else 0.0 for name in TARGETS],
        dtype=torch.float32,
        device=device,
    )

    train_ds, val_ds, split_meta = _build_train_val_datasets(
        annotations_path=annotations_path,
        image_root=image_root,
        train_split=train_split,
        val_split=val_split,
        val_ratio=val_ratio,
        seed=int(cfg["training"]["seed"]),
        torch_mod=torch,
        RatingDatasetCls=RatingDataset,
    )
    _print_train_args(cfg, split_meta, target_dims)
    if split_meta.get("strategy") == "shared_dataset":
        print("[提示] 当前 train/val 数据相同。建议设置 split，或填写 val_ratio 做随机验证切分。")

    train_loader = make_loader(
        train_ds,
        batch_size=int(cfg["training"]["batch_size"]),
        num_workers=int(cfg["training"].get("num_workers", 4)),
        shuffle=True,
    )
    val_loader = make_loader(
        val_ds,
        batch_size=int(cfg["training"]["batch_size"]),
        num_workers=int(cfg["training"].get("num_workers", 4)),
        shuffle=False,
    )

    jtp = JTP3FeatureExtractor(
        model_id=cfg["models"]["jtp3_model_id"],
        device=device,
        hf_token_env=cfg["models"].get("hf_token_env", "HF_TOKEN"),
        freeze=bool(cfg["models"].get("freeze_extractors", True)),
        fallback_model_id=cfg["models"].get("jtp3_fallback_model_id"),
    )
    print(
        f"[JTP] backend={getattr(jtp, 'backend', 'unknown')} "
        f"loaded_model={getattr(jtp, 'loaded_model_id', cfg['models']['jtp3_model_id'])}"
    )
    waifu = WaifuV3ClipFeatureExtractor(
        clip_model_name=cfg["models"].get("waifu_clip_model_name", "ViT-L-14"),
        clip_pretrained=cfg["models"].get("waifu_clip_pretrained", "openai"),
        waifu_head_path=cfg["models"].get("waifu_v3_head_path"),
        device=device,
        freeze=bool(cfg["models"].get("freeze_extractors", True)),
        include_waifu_score=bool(cfg["models"].get("include_waifu_score", True)),
    )
    if not (getattr(jtp, "freeze", True) and getattr(waifu, "freeze", True)):
        raise NotImplementedError("当前接入仅训练 fusion head，请保持 freeze_extractors=true。")

    images0, _, _, _, _, _ = next(iter(train_loader))
    with torch.no_grad():
        dim_jtp = int(jtp(images0[:2]).shape[-1])
        dim_waifu = int(waifu(images0[:2]).shape[-1])
    input_dim = dim_jtp + dim_waifu

    fusion_head = FusionMultiTaskHead(
        input_dim=input_dim,
        hidden_dims=cfg["model_head"]["hidden_dims"],
        dropout=float(cfg["model_head"].get("dropout", 0.2)),
    ).to(device)

    optimizer = torch.optim.AdamW(
        fusion_head.parameters(),
        lr=float(cfg["training"]["lr"]),
        weight_decay=float(cfg["training"].get("weight_decay", 1e-4)),
    )

    out_dir = Path(str(cfg["training"].get("output_dir", "./output/aesthetic-scorer"))).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    best_path = out_dir / model_filename
    history_path = out_dir / "history.json"

    history = {"train": [], "val": []}
    best_val_objective = float("inf")
    epochs = int(cfg["training"]["epochs"])
    loss_name = str(cfg["training"].get("loss", "mse")).lower()
    cls_loss_weight = float(cfg["training"].get("cls_loss_weight", 1.0))
    cls_pos_weight_raw = cfg["training"].get("cls_pos_weight")
    cls_pos_weight = None if cls_pos_weight_raw in (None, "", "null") else float(cls_pos_weight_raw)
    global_step = 0

    for epoch in range(1, epochs + 1):
        train_metrics = run_epoch(
            train=True,
            loader=train_loader,
            jtp_extractor=jtp,
            waifu_extractor=waifu,
            fusion_head=fusion_head,
            optimizer=optimizer,
            device=device,
            loss_name=loss_name,
            cls_loss_weight=cls_loss_weight,
            cls_pos_weight=cls_pos_weight,
            target_mask=target_mask,
            route="aesthetic-scorer",
            training_type="aesthetic-scorer",
            source="aesthetic_scorer_train",
            global_step_offset=global_step,
            epoch_index=epoch,
        )
        global_step += int(train_metrics.get("steps", 0) or 0)
        val_metrics = run_epoch(
            train=False,
            loader=val_loader,
            jtp_extractor=jtp,
            waifu_extractor=waifu,
            fusion_head=fusion_head,
            optimizer=optimizer,
            device=device,
            loss_name=loss_name,
            cls_loss_weight=cls_loss_weight,
            cls_pos_weight=cls_pos_weight,
            target_mask=target_mask,
            route="aesthetic-scorer",
            training_type="aesthetic-scorer",
            source="aesthetic_scorer_train",
            global_step_offset=global_step,
            epoch_index=epoch,
        )

        history["train"].append(train_metrics)
        history["val"].append(val_metrics)
        history_path.write_text(json.dumps(history, indent=2, ensure_ascii=False), encoding="utf-8")

        train_dim = _selected_dim_mae_text(train_metrics, target_dims)
        val_dim = _selected_dim_mae_text(val_metrics, target_dims)
        print(
            f"[第 {epoch}/{epochs} 轮] "
            f"train_loss={fmt_or_dash(float(train_metrics['loss']))} "
            f"train_mae={fmt_or_dash(train_metrics['mae'])} "
            f"train_cls_acc={fmt_or_dash(train_metrics['cls_acc'])} | "
            f"val_loss={fmt_or_dash(float(val_metrics['loss']))} "
            f"val_mae={fmt_or_dash(val_metrics['mae'])} "
            f"val_cls_acc={fmt_or_dash(val_metrics['cls_acc'])}"
        )
        print(
            "  "
            f"train 回归loss={fmt_or_dash(float(train_metrics['score_loss']))} "
            f"cls_loss={fmt_or_dash(float(train_metrics['cls_loss']))} "
            f"score_n={train_metrics['score_n']} cls_n={train_metrics['cls_n']}"
        )
        print(
            "  "
            f"val   回归loss={fmt_or_dash(float(val_metrics['score_loss']))} "
            f"cls_loss={fmt_or_dash(float(val_metrics['cls_loss']))} "
            f"score_n={val_metrics['score_n']} cls_n={val_metrics['cls_n']}"
        )
        print(f"  train 各维度MAE: [{train_dim}]")
        print(f"  val   各维度MAE: [{val_dim}]")

        val_objective = float(val_metrics["loss"])
        if math.isfinite(val_objective) and val_objective < best_val_objective:
            best_val_objective = val_objective
            save_checkpoint(
                best_path,
                fusion_head=fusion_head,
                input_dim=input_dim,
                hidden_dims=cfg["model_head"]["hidden_dims"],
                dropout=float(cfg["model_head"].get("dropout", 0.2)),
                config=cfg,
                epoch=epoch,
                val_mae=float(val_metrics["mae"]),
                val_loss=float(val_metrics["loss"]),
                val_cls_acc=float(val_metrics["cls_acc"]),
                cls_loss_weight=cls_loss_weight,
            )
            print(f"  已保存最佳模型: {best_path} (val_loss={fmt_or_dash(best_val_objective)})")

    print(f"\n训练完成。最佳 val_loss={fmt_or_dash(best_val_objective)}")
    print(f"最佳模型: {best_path}")
    print(f"训练历史: {history_path}")


if __name__ == "__main__":
    main()
