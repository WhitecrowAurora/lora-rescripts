"""Helpers for preparing a project-local portable Python runtime."""

from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, Optional

from launcher.config import RuntimeDef, RUNTIMES, get_repo_root
from launcher.core.runtime_detector import RuntimeStatus, detect_runtime
from launcher.core.runtime_tasks import build_install_env, run_streamed_command

LogCallback = Optional[Callable[[str], None]]

_TOP_LEVEL_SKIP_NAMES = {
    ".deps_installed",
    ".portable_ready",
    ".cache",
    "__pycache__",
    "Scripts",
}

_LIB_SKIP_NAMES = {
    "site-packages",
    "__pycache__",
}

_SOURCE_PRIORITY = [
    "standard",
    "flashattention",
    "sageattention",
    "sageattention2",
    "blackwell",
    "sageattention-blackwell",
    "intel-xpu",
    "intel-xpu-sage",
    "rocm-amd",
]


@dataclass
class RuntimeInitializationResult:
    runtime_id: str
    target_dir: Path
    python_path: Path
    source_runtime_id: Optional[str] = None
    source_dir: Optional[Path] = None


def _log(log_callback: LogCallback, message: str) -> None:
    if log_callback:
        log_callback(message)


def _resolve_target_dir(repo_root: Path, runtime_def: RuntimeDef, status: Optional[RuntimeStatus]) -> Path:
    if status and status.env_dir:
        return status.env_dir

    env_root = repo_root / "env"
    preferred_name = runtime_def.env_dir_names[0] if runtime_def.env_dir_names else runtime_def.id
    if env_root.exists():
        return env_root / preferred_name
    return repo_root / preferred_name


def _copy_portable_tree(source_dir: Path, target_dir: Path) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)

    for item in source_dir.iterdir():
        if item.name in _TOP_LEVEL_SKIP_NAMES:
            continue

        destination = target_dir / item.name
        if item.is_dir():
            if item.name == "Lib":
                _copy_lib_tree(item, destination)
            else:
                shutil.copytree(item, destination, dirs_exist_ok=True)
            continue

        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, destination)


def _copy_lib_tree(source_dir: Path, target_dir: Path) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)

    for item in source_dir.iterdir():
        if item.name in _LIB_SKIP_NAMES:
            continue

        destination = target_dir / item.name
        if item.is_dir():
            shutil.copytree(item, destination, dirs_exist_ok=True)
        else:
            shutil.copy2(item, destination)


def _find_source_runtime(
    runtime_id: str,
    statuses: Dict[str, RuntimeStatus],
) -> tuple[Optional[str], Optional[RuntimeStatus]]:
    candidate_ids = [rt_id for rt_id in _SOURCE_PRIORITY if rt_id != runtime_id]
    candidate_ids.extend(
        rt.id
        for rt in RUNTIMES
        if rt.id not in candidate_ids and rt.id != runtime_id
    )

    for candidate_id in candidate_ids:
        status = statuses.get(candidate_id)
        if not status or not status.python_exists or not status.env_dir:
            continue
        return candidate_id, status

    return None, None


def _clear_install_marker(target_dir: Path) -> None:
    marker_path = target_dir / ".deps_installed"
    if marker_path.exists():
        marker_path.unlink()


def initialize_runtime_environment(
    runtime_def: RuntimeDef,
    *,
    repo_root: Optional[Path] = None,
    statuses: Optional[Dict[str, RuntimeStatus]] = None,
    cn_mirror: bool = False,
    log_callback: LogCallback = None,
) -> RuntimeInitializationResult:
    if repo_root is None:
        repo_root = get_repo_root()

    if statuses is None:
        statuses = {
            runtime.id: detect_runtime(repo_root, runtime)
            for runtime in RUNTIMES
        }

    current_status = statuses.get(runtime_def.id)
    if current_status is None:
        current_status = detect_runtime(repo_root, runtime_def)

    target_dir = _resolve_target_dir(repo_root, runtime_def, current_status)
    python_path = target_dir / runtime_def.python_rel_path
    source_runtime_id: Optional[str] = None
    source_dir: Optional[Path] = None

    if not python_path.exists():
        source_runtime_id, source_status = _find_source_runtime(runtime_def.id, statuses)
        if source_status is None or source_status.env_dir is None:
            expected_locations = ", ".join(f".\\env\\{name}" for name in runtime_def.env_dir_names)
            raise RuntimeError(
                "未找到可用于一键初始化的 portable Python 来源。"
                f"请先准备一个已初始化的运行时（例如 .\\env\\python），或手动把 Python 放到 {expected_locations}。"
            )

        source_dir = source_status.env_dir
        _log(
            log_callback,
            f"[Launcher] Cloning portable Python skeleton from '{source_runtime_id}' -> '{target_dir}'.",
        )
        _copy_portable_tree(source_dir, target_dir)
        _clear_install_marker(target_dir)

    if not python_path.exists():
        raise RuntimeError(f"初始化后仍未找到 portable Python：{python_path}")

    init_script = repo_root / "setup_embeddable_python.bat"
    if not init_script.exists():
        raise RuntimeError(f"缺少初始化脚本：{init_script}")

    _clear_install_marker(target_dir)
    _log(
        log_callback,
        f"[Launcher] Preparing portable Python in '{target_dir.name}'...",
    )
    command = ["cmd.exe", "/c", str(init_script), "--auto", target_dir.name]
    env = build_install_env(cn_mirror)
    success = run_streamed_command(command, env, repo_root, log_callback)
    if not success:
        raise RuntimeError(f"{runtime_def.name_zh} 的 portable Python 初始化失败。")

    _clear_install_marker(target_dir)
    return RuntimeInitializationResult(
        runtime_id=runtime_def.id,
        target_dir=target_dir,
        python_path=python_path,
        source_runtime_id=source_runtime_id,
        source_dir=source_dir,
    )
