"""Shared runtime task helpers for launch/install flows."""

from __future__ import annotations

import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, List, Optional

from launcher.config import (
    SAFE_MODE_CLEAR_VARS,
    STANDARD_ENV_CLEAR_VARS,
    STANDARD_ENV_VARS,
    RuntimeDef,
    get_repo_root,
)
from launcher.core.subprocess_utils import hidden_subprocess_kwargs


@dataclass
class LaunchOptions:
    """User-configurable launch options."""

    runtime_id: str = "standard"
    safe_mode: bool = False
    cn_mirror: bool = False
    attention_policy: str = "default"  # "default", "prefer_sage", "force_sdpa"
    host: str = "127.0.0.1"
    port: int = 28000
    listen: bool = False
    disable_tensorboard: bool = False
    disable_tageditor: bool = False
    disable_auto_mirror: bool = False
    dev_mode: bool = False
    localization: str = ""


def build_launch_env(
    runtime_def: RuntimeDef,
    options: LaunchOptions,
) -> Dict[str, str]:
    """Build the environment dictionary for launching gui.py."""

    env = os.environ.copy()

    if options.safe_mode:
        for var in SAFE_MODE_CLEAR_VARS:
            env.pop(var, None)
        env["PYTHONNOUSERSITE"] = "1"

    for var in STANDARD_ENV_CLEAR_VARS:
        env.pop(var, None)

    for key, value in STANDARD_ENV_VARS.items():
        env[key] = value

    if runtime_def.preferred_runtime:
        env["MIKAZUKI_PREFERRED_RUNTIME"] = runtime_def.preferred_runtime
    else:
        env.pop("MIKAZUKI_PREFERRED_RUNTIME", None)

    for key, value in runtime_def.env_vars.items():
        env[key] = value

    if options.attention_policy == "force_sdpa":
        env["MIKAZUKI_STARTUP_ATTENTION_POLICY"] = "force_sdpa"
    elif options.attention_policy == "prefer_sage":
        if "MIKAZUKI_STARTUP_ATTENTION_POLICY" not in runtime_def.env_vars:
            env.pop("MIKAZUKI_STARTUP_ATTENTION_POLICY", None)
    else:
        if "MIKAZUKI_STARTUP_ATTENTION_POLICY" not in runtime_def.env_vars:
            env.pop("MIKAZUKI_STARTUP_ATTENTION_POLICY", None)

    if options.cn_mirror:
        env["MIKAZUKI_CN_MIRROR"] = "1"
    else:
        env.pop("MIKAZUKI_CN_MIRROR", None)

    return env


def build_launch_args(options: LaunchOptions) -> List[str]:
    """Build the command-line arguments for gui.py."""

    args = ["gui.py"]

    if options.host and options.host != "127.0.0.1":
        args.extend(["--host", options.host])

    if options.port != 28000:
        args.extend(["--port", str(options.port)])

    if options.listen:
        args.append("--listen")

    if options.disable_tensorboard:
        args.append("--disable-tensorboard")

    if options.disable_tageditor:
        args.append("--disable-tageditor")

    if options.disable_auto_mirror:
        args.append("--disable-auto-mirror")

    if options.dev_mode:
        args.append("--dev")

    if options.localization:
        args.extend(["--localization", options.localization])

    return args


def build_launch_command(python_path: Path, options: LaunchOptions) -> List[str]:
    """Build the full launch command."""

    return [str(python_path)] + build_launch_args(options)


def spawn_launch_process(
    command: List[str],
    env: Dict[str, str],
    repo_root: Optional[Path] = None,
) -> subprocess.Popen:
    """Spawn the launcher process for gui.py."""

    if repo_root is None:
        repo_root = get_repo_root()

    return subprocess.Popen(
        command,
        cwd=str(repo_root),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        **hidden_subprocess_kwargs(
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
        ),
    )


def build_install_env(cn_mirror: bool = False) -> Dict[str, str]:
    """Build environment for runtime install scripts."""

    env = os.environ.copy()
    if cn_mirror:
        env["MIKAZUKI_CN_MIRROR"] = "1"
    else:
        env.pop("MIKAZUKI_CN_MIRROR", None)
    return env


def build_install_commands(
    runtime_def: RuntimeDef,
    repo_root: Optional[Path] = None,
) -> List[List[str]]:
    """Build PowerShell commands for runtime install scripts."""

    if repo_root is None:
        repo_root = get_repo_root()

    commands: List[List[str]] = []
    for script_name in runtime_def.install_scripts:
        script_path = repo_root / script_name
        commands.append(
            [
                "powershell.exe",
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(script_path),
            ]
        )
    return commands


def run_streamed_command(
    command: List[str],
    env: Dict[str, str],
    cwd: Path,
    log_callback: Optional[Callable[[str], None]] = None,
) -> bool:
    """Run a command while streaming merged stdout/stderr."""

    try:
        process = subprocess.Popen(
            command,
            cwd=str(cwd),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
            **hidden_subprocess_kwargs(),
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
            log_callback(f"Error: executable not found: {command[0]}")
        return False
    except Exception as exc:
        if log_callback:
            log_callback(f"Error running command: {exc}")
        return False
