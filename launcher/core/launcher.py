"""Build environment and launch gui.py with the selected runtime."""

from __future__ import annotations

import os
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from launcher.config import (
    SAFE_MODE_CLEAR_VARS,
    STANDARD_ENV_CLEAR_VARS,
    STANDARD_ENV_VARS,
    RuntimeDef,
    get_repo_root,
)


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
    """Build the environment dictionary for launching gui.py.

    Replicates the env-var setup from run_gui_core.ps1 / run_gui_runtime.ps1.
    """
    env = os.environ.copy()

    # --- SafeMode: clear Python pollution vars ---
    if options.safe_mode:
        for var in SAFE_MODE_CLEAR_VARS:
            env.pop(var, None)
        env["PYTHONNOUSERSITE"] = "1"

    # --- Standard env vars (always set) ---
    for var in STANDARD_ENV_CLEAR_VARS:
        env.pop(var, None)

    for key, value in STANDARD_ENV_VARS.items():
        env[key] = value

    # --- Runtime-specific env vars ---
    if runtime_def.preferred_runtime:
        env["MIKAZUKI_PREFERRED_RUNTIME"] = runtime_def.preferred_runtime
    else:
        # Standard runtime: clear any stale preferred runtime
        env.pop("MIKAZUKI_PREFERRED_RUNTIME", None)

    for key, value in runtime_def.env_vars.items():
        env[key] = value

    # --- Attention policy ---
    # If the runtime itself sets an attention policy (Intel XPU, AMD ROCm),
    # the runtime's env_vars already include MIKAZUKI_STARTUP_ATTENTION_POLICY.
    # User override only takes effect for runtimes that don't force one.
    if options.attention_policy == "force_sdpa":
        env["MIKAZUKI_STARTUP_ATTENTION_POLICY"] = "force_sdpa"
    elif options.attention_policy == "prefer_sage":
        # "prefer_sage" is a UI concept — only set if the runtime doesn't
        # already have a guarded policy.
        if "MIKAZUKI_STARTUP_ATTENTION_POLICY" not in runtime_def.env_vars:
            env.pop("MIKAZUKI_STARTUP_ATTENTION_POLICY", None)
    # "default": don't set anything extra

    # --- CN Mirror ---
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


def launch(
    python_path: Path,
    runtime_def: RuntimeDef,
    options: LaunchOptions,
    repo_root: Optional[Path] = None,
) -> subprocess.Popen:
    """Launch gui.py with the given runtime and options.

    Returns the Popen process object.
    """
    if repo_root is None:
        repo_root = get_repo_root()

    env = build_launch_env(runtime_def, options)
    args = build_launch_args(options)

    cmd = [str(python_path)] + args

    process = subprocess.Popen(
        cmd,
        cwd=str(repo_root),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
    )

    return process
