"""Detect installed runtimes by scanning env/ directories."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

from launcher.config import RUNTIMES, RuntimeDef, get_repo_root


@dataclass
class RuntimeStatus:
    """Detection result for a single runtime."""
    runtime_id: str
    python_exists: bool
    deps_installed: bool
    installed: bool  # True if python.exe exists AND .deps_installed marker present
    python_path: Optional[Path] = None
    env_dir: Optional[Path] = None

    @property
    def status_text(self) -> str:
        """One of: 'installed', 'partial', 'missing'."""
        if self.installed:
            return "installed"
        if self.python_exists or self.env_dir is not None:
            return "partial"
        return "missing"


def detect_runtime(repo_root: Path, runtime_def: RuntimeDef) -> RuntimeStatus:
    """Detect a single runtime's installation status.

    Checks env/<dir_name>/python.exe and .deps_installed marker,
    falling back to root-level directories (matching PS1 precedence).
    """
    env_root = repo_root / "env"

    # Pass 1: look for python.exe
    for dir_name in runtime_def.env_dir_names:
        for base in [env_root, repo_root]:
            candidate_dir = base / dir_name
            python_path = candidate_dir / runtime_def.python_rel_path
            if python_path.exists():
                deps_marker = candidate_dir / ".deps_installed"
                return RuntimeStatus(
                    runtime_id=runtime_def.id,
                    python_exists=True,
                    deps_installed=deps_marker.exists(),
                    installed=deps_marker.exists(),
                    python_path=python_path,
                    env_dir=candidate_dir,
                )

    # Pass 2: directory exists but no python.exe (partially extracted)
    for dir_name in runtime_def.env_dir_names:
        for base in [env_root, repo_root]:
            candidate_dir = base / dir_name
            if candidate_dir.exists():
                return RuntimeStatus(
                    runtime_id=runtime_def.id,
                    python_exists=False,
                    deps_installed=False,
                    installed=False,
                    python_path=None,
                    env_dir=candidate_dir,
                )

    return RuntimeStatus(
        runtime_id=runtime_def.id,
        python_exists=False,
        deps_installed=False,
        installed=False,
        python_path=None,
        env_dir=None,
    )


def detect_all(repo_root: Optional[Path] = None) -> Dict[str, RuntimeStatus]:
    """Detect all runtimes. Returns {runtime_id: RuntimeStatus}."""
    if repo_root is None:
        repo_root = get_repo_root()
    result = {}
    for rt in RUNTIMES:
        result[rt.id] = detect_runtime(repo_root, rt)
    return result


def get_best_runtime(statuses: Dict[str, RuntimeStatus]) -> Optional[str]:
    """Auto-select the best available runtime.

    Priority: sageattention > sageattention2 > flashattention > standard
    Falls back to any installed runtime if the preferred ones are missing.
    """
    preference_order = ["sageattention", "sageattention2", "flashattention", "standard"]
    for rt_id in preference_order:
        if rt_id in statuses and statuses[rt_id].installed:
            return rt_id
    # Fallback: any installed runtime
    for rt in RUNTIMES:
        if statuses.get(rt.id, None) and statuses[rt.id].installed:
            return rt.id
    return None
