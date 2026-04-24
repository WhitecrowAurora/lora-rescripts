"""Run install scripts for runtimes from the GUI."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Callable, Optional

from launcher.config import RuntimeDef, get_repo_root


def install_runtime(
    runtime_def: RuntimeDef,
    cn_mirror: bool = False,
    repo_root: Optional[Path] = None,
    log_callback: Optional[Callable[[str], None]] = None,
) -> bool:
    """Run the install script(s) for a runtime.

    Args:
        runtime_def: The runtime to install.
        cn_mirror: Whether to enable CN mirror mode.
        repo_root: Project root directory.
        log_callback: Called with each line of output.

    Returns:
        True if all scripts completed successfully.
    """
    if repo_root is None:
        repo_root = get_repo_root()

    if not runtime_def.install_scripts:
        if log_callback:
            log_callback(f"No install script defined for {runtime_def.name_en}")
        return False

    env = _build_install_env(cn_mirror)
    all_success = True

    for script_name in runtime_def.install_scripts:
        script_path = repo_root / script_name
        if not script_path.exists():
            if log_callback:
                log_callback(f"Install script not found: {script_path}")
            all_success = False
            continue

        if log_callback:
            log_callback(f"Running: {script_name} ...")

        success = _run_powershell_script(script_path, env, repo_root, log_callback)
        if not success:
            all_success = False

    return all_success


def _build_install_env(cn_mirror: bool) -> dict:
    """Build environment for install scripts."""
    import os
    env = os.environ.copy()
    if cn_mirror:
        env["MIKAZUKI_CN_MIRROR"] = "1"
    else:
        env.pop("MIKAZUKI_CN_MIRROR", None)
    return env


def _run_powershell_script(
    script_path: Path,
    env: dict,
    cwd: Path,
    log_callback: Optional[Callable[[str], None]] = None,
) -> bool:
    """Run a PowerShell install script and capture output.

    Returns True if the script exited with code 0.
    """
    cmd = [
        "powershell.exe",
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", str(script_path),
    ]

    try:
        process = subprocess.Popen(
            cmd,
            cwd=str(cwd),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )

        if process.stdout:
            for line in process.stdout:
                line = line.rstrip("\n\r")
                if log_callback:
                    log_callback(line)

        process.wait()
        if log_callback:
            log_callback(f"Exit code: {process.returncode}")

        return process.returncode == 0

    except FileNotFoundError:
        if log_callback:
            log_callback("Error: PowerShell not found. Cannot run install scripts.")
        return False
    except Exception as e:
        if log_callback:
            log_callback(f"Error running script: {e}")
        return False
