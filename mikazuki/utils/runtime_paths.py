from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Iterable


ENV_RUNTIME_DIRNAME = "env"
RUNTIME_DIRECTORY_ALIASES: dict[str, tuple[str, ...]] = {
    "portable": ("python",),
    "flashattention": ("python-flashattention", "python_flashattention"),
    "blackwell": ("python_blackwell",),
    "intel-xpu": ("python_xpu_intel",),
    "intel-xpu-sage": ("python_xpu_intel_sage",),
    "rocm-amd": ("python_rocm_amd",),
    "sagebwd-nvidia": ("python_sagebwd_nvidia", "python-sagebwd-nvidia"),
    "sageattention": ("python-sageattention", "python_sageattention"),
    "sageattention2": ("python-sageattention2", "python_sageattention2"),
    "tageditor": ("python_tageditor",),
    "venv": ("venv",),
    "venv-tageditor": ("venv-tageditor",),
}
PROJECT_LOCAL_MAIN_RUNTIME_NAMES: tuple[str, ...] = (
    "portable",
    "flashattention",
    "blackwell",
    "intel-xpu",
    "intel-xpu-sage",
    "rocm-amd",
    "sagebwd-nvidia",
    "sageattention",
    "sageattention2",
    "venv",
)


def get_runtime_dir_names(runtime_name: str) -> tuple[str, ...]:
    normalized = str(runtime_name or "").strip().lower()
    return RUNTIME_DIRECTORY_ALIASES.get(normalized, (str(runtime_name),) if runtime_name else tuple())


def iter_runtime_dir_candidates(repo_root: Path, runtime_name: str | Iterable[str]) -> list[Path]:
    repo_root = Path(repo_root)
    dir_names = (
        tuple(runtime_name)
        if not isinstance(runtime_name, str)
        else get_runtime_dir_names(runtime_name)
    )
    env_root = repo_root / ENV_RUNTIME_DIRNAME
    return [*(env_root / name for name in dir_names), *(repo_root / name for name in dir_names)]


def resolve_runtime_dir(
    repo_root: Path,
    runtime_name: str | Iterable[str],
    *,
    preferred_dir_name: str | None = None,
) -> Path:
    repo_root = Path(repo_root)
    dir_names = (
        tuple(runtime_name)
        if not isinstance(runtime_name, str)
        else get_runtime_dir_names(runtime_name)
    )
    if not dir_names:
        raise ValueError("runtime_name must resolve to at least one directory name")

    for candidate in iter_runtime_dir_candidates(repo_root, dir_names):
        if candidate.exists():
            return candidate

    preferred = preferred_dir_name or dir_names[0]
    if (repo_root / ENV_RUNTIME_DIRNAME).exists():
        return repo_root / ENV_RUNTIME_DIRNAME / preferred
    return repo_root / preferred


def executable_matches_runtime(executable: str | os.PathLike[str] | None, runtime_name: str | Iterable[str]) -> bool:
    normalized_executable = str(executable or sys.executable).replace("\\", "/").lower()
    dir_names = (
        tuple(runtime_name)
        if not isinstance(runtime_name, str)
        else get_runtime_dir_names(runtime_name)
    )
    for dir_name in dir_names:
        normalized_name = str(dir_name).replace("\\", "/").strip("/").lower()
        if f"/{normalized_name}/" in normalized_executable or f"/{ENV_RUNTIME_DIRNAME}/{normalized_name}/" in normalized_executable:
            return True
    return False


def get_project_local_main_python_roots(repo_root: Path) -> list[Path]:
    repo_root = Path(repo_root)
    roots: list[Path] = []
    seen: set[Path] = set()
    for runtime_name in PROJECT_LOCAL_MAIN_RUNTIME_NAMES:
        for candidate in iter_runtime_dir_candidates(repo_root, runtime_name):
            resolved = Path(os.path.abspath(candidate))
            if resolved in seen:
                continue
            seen.add(resolved)
            roots.append(resolved)
    return roots


def get_tageditor_python_candidates(repo_root: Path) -> list[Path]:
    repo_root = Path(repo_root)
    candidates = [
        *[candidate / "python.exe" for candidate in iter_runtime_dir_candidates(repo_root, "tageditor")],
        *[candidate / "bin" / "python" for candidate in iter_runtime_dir_candidates(repo_root, "tageditor")],
        *[candidate / "Scripts" / "python.exe" for candidate in iter_runtime_dir_candidates(repo_root, "venv-tageditor")],
        *[candidate / "bin" / "python" for candidate in iter_runtime_dir_candidates(repo_root, "venv-tageditor")],
    ]
    deduped: list[Path] = []
    seen: set[Path] = set()
    for candidate in candidates:
        resolved = Path(os.path.abspath(candidate))
        if resolved in seen:
            continue
        seen.add(resolved)
        deduped.append(resolved)
    return deduped
