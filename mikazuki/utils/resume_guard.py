from __future__ import annotations

from pathlib import Path
from typing import Iterable

CKPT_EXTENSIONS = {".safetensors", ".ckpt", ".pt"}
YOLO_RESUME_EXTENSIONS = {".pt", ".pth"}
STATE_REQUIRED_FILES = ("train_state.json", "optimizer.bin", "scheduler.bin")
STATE_MODEL_FILE_CANDIDATES = ("model.safetensors", "pytorch_model.bin", "model.bin")


def resolve_local_path(path_value: str | Path, repo_root: Path) -> Path:
    target_path = Path(path_value).expanduser()
    if not target_path.is_absolute():
        target_path = repo_root / target_path
    return target_path.resolve()


def check_resume_state_dir_complete(state_dir: Path) -> tuple[bool, str]:
    for name in STATE_REQUIRED_FILES:
        if not (state_dir / name).is_file():
            return False, f"missing {name}"

    has_model_file = any((state_dir / name).is_file() for name in STATE_MODEL_FILE_CANDIDATES)
    if not has_model_file:
        has_model_file = bool(list(state_dir.glob("pytorch_model*.bin")))
    if not has_model_file:
        has_model_file = bool(list(state_dir.glob("model*.safetensors")))
    if not has_model_file:
        return False, "missing model state file"

    return True, ""


def iter_existing_output_artifacts(config: dict, repo_root: Path) -> Iterable[Path]:
    output_dir_raw = str(config.get("output_dir", "") or "").strip()
    if not output_dir_raw:
        return []

    output_dir = resolve_local_path(output_dir_raw, repo_root)
    if not output_dir.exists() or not output_dir.is_dir():
        return []

    output_name = str(config.get("output_name", "") or "").strip()

    def _name_matches(filename: str, is_dir: bool) -> bool:
        """Check if *filename* is an exact sd-scripts artifact for *output_name*.

        sd-scripts produces:
          files:  {output_name}.ext, {output_name}-000004.ext, {output_name}-e5.ext …
          dirs:   {output_name}-000004-state, {output_name}-state …
        A simple ``startswith(output_name)`` is too broad — e.g. output_name="xx"
        would wrongly match "xx2-000001.safetensors".  We require that the
        character immediately after *output_name* (if any) is ``-`` or ``.``.
        """
        if not output_name:
            return True
        if not filename.startswith(output_name):
            return False
        rest = filename[len(output_name):]
        if not rest:
            return True
        # The very next char must be '-' (epoch/state suffix'.' (extension)
        return rest[0] in ('-', '.')

    artifacts: list[Path] = []
    for child in output_dir.iterdir():
        if child.is_file():
            if child.suffix.lower() not in CKPT_EXTENSIONS:
                continue
            if not _name_matches(child.name, is_dir=False):
                continue
            artifacts.append(child)
            continue

        if child.is_dir() and child.name.endswith("-state"):
            if not _name_matches(child.name, is_dir=True):
                continue
            artifacts.append(child)

    return artifacts


def get_model_train_type(config: dict) -> str:
    return str(config.get("model_train_type", "") or "").strip().lower()


def validate_yolo_resume_checkpoint(config: dict, repo_root: Path) -> tuple[bool, str]:
    resume_path_raw = str(config.get("resume", "") or "").strip()
    if not resume_path_raw:
        return True, ""

    resume_file = resolve_local_path(resume_path_raw, repo_root)
    if not resume_file.exists():
        return False, f"YOLO resume 检查点不存在，已阻止启动。resume={resume_file}"
    if not resume_file.is_file():
        return False, f"YOLO resume 路径必须是 .pt / .pth 文件，已阻止启动。resume={resume_file}"
    if resume_file.suffix.lower() not in YOLO_RESUME_EXTENSIONS:
        return False, f"YOLO resume 路径必须是 .pt / .pth 文件，已阻止启动。resume={resume_file}"

    return True, ""


def validate_resume_launch_guard(config: dict, repo_root: Path) -> tuple[bool, str]:
    if get_model_train_type(config) == "yolo":
        return validate_yolo_resume_checkpoint(config, repo_root)

    existing_artifacts = list(iter_existing_output_artifacts(config, repo_root))
    if not existing_artifacts:
        return True, ""

    resume_path_raw = str(config.get("resume", "") or "").strip()
    if not resume_path_raw:
        return (
            False,
            "检测到输出目录已存在历史训练结果，当前未填写 resume state 路径，已阻止启动。"
            " 如需接续训练，请填写正确的 state 目录；如需重新开始，请更换 output_name 或 output_dir。",
        )

    resume_dir = resolve_local_path(resume_path_raw, repo_root)
    if not resume_dir.exists() or not resume_dir.is_dir():
        return False, f"resume 路径不存在或不是目录，已阻止启动。resume={resume_dir}"

    complete, incomplete_reason = check_resume_state_dir_complete(resume_dir)
    if not complete:
        return (
            False,
            "resume 路径指向的 state 目录不完整，已阻止启动。"
            f" resume={resume_dir}，原因: {incomplete_reason}。",
        )

    output_dir_raw = str(config.get("output_dir", "") or "").strip()
    if output_dir_raw:
        output_dir = resolve_local_path(output_dir_raw, repo_root)
        try:
            resume_dir.relative_to(output_dir)
        except ValueError:
            return (
                False,
                "检测到 output 与 resume 不属于同一个输出目录，已阻止启动。"
                f" output_dir={output_dir}，resume={resume_dir}",
            )

    return True, ""
