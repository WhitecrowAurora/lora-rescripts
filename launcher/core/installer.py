"""Run install scripts for runtimes from the GUI."""

from __future__ import annotations

from pathlib import Path
from typing import Callable, Optional

from launcher.config import RuntimeDef, get_repo_root
from launcher.core.runtime_tasks import (
    build_install_commands,
    build_install_env,
    run_streamed_command,
)


def install_runtime(
    runtime_def: RuntimeDef,
    cn_mirror: bool = False,
    repo_root: Optional[Path] = None,
    log_callback: Optional[Callable[[str], None]] = None,
) -> bool:
    """Run the install script(s) for a runtime."""

    if repo_root is None:
        repo_root = get_repo_root()

    if not runtime_def.install_scripts:
        if log_callback:
            log_callback(f"No install script defined for {runtime_def.name_en}")
        return False

    env = build_install_env(cn_mirror)
    commands = build_install_commands(runtime_def, repo_root=repo_root)
    all_success = True

    for script_name, command in zip(runtime_def.install_scripts, commands):
        script_path = repo_root / script_name
        if not script_path.exists():
            if log_callback:
                log_callback(f"Install script not found: {script_path}")
            all_success = False
            continue

        if log_callback:
            log_callback(f"Running: {script_name} ...")

        success = run_streamed_command(command, env, repo_root, log_callback)
        if not success:
            all_success = False

    return all_success


__all__ = [
    "build_install_commands",
    "build_install_env",
    "install_runtime",
]

