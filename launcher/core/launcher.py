"""Build environment and launch gui.py with the selected runtime."""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Dict, List, Optional

from launcher.config import RuntimeDef, get_repo_root
from launcher.core.runtime_tasks import (
    LaunchOptions,
    build_launch_args,
    build_launch_command,
    build_launch_env,
    spawn_launch_process,
)


def launch(
    python_path: Path,
    runtime_def: RuntimeDef,
    options: LaunchOptions,
    repo_root: Optional[Path] = None,
) -> subprocess.Popen:
    """Launch gui.py with the given runtime and options."""

    if repo_root is None:
        repo_root = get_repo_root()

    env = build_launch_env(runtime_def, options)
    command = build_launch_command(python_path, options)
    return spawn_launch_process(command, env, repo_root=repo_root)


__all__ = [
    "LaunchOptions",
    "build_launch_args",
    "build_launch_command",
    "build_launch_env",
    "launch",
]

