"""Runtime definitions, constants, and path resolution for the SD-reScripts Launcher."""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple


APP_VERSION = "v1.5.1"


def get_repo_root() -> Path:
    """Resolve the project repo root.

    When running from launcher/ or from the project root, walk up to find
    the directory that contains gui.py.
    """
    candidate = Path(__file__).resolve().parent
    # If we're inside launcher/, go up one level
    if (candidate / "gui.py").exists():
        return candidate
    if (candidate.parent / "gui.py").exists():
        return candidate.parent
    # Fallback: assume parent of launcher/
    return candidate.parent


# ---------------------------------------------------------------------------
# Runtime definition
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class RuntimeDef:
    id: str
    name_zh: str
    name_en: str
    desc_zh: str
    desc_en: str
    preferred_runtime: str  # MIKAZUKI_PREFERRED_RUNTIME value (empty = not set)
    env_dir_names: Tuple[str, ...]  # directory names under env/ (searched in order)
    python_rel_path: str = "python.exe"
    env_vars: Dict[str, str] = field(default_factory=dict)
    install_scripts: Tuple[str, ...] = ()  # filenames in repo root
    attention_policy_default: str = ""  # if this runtime forces an attention policy
    experimental: bool = False  # show "experimental" badge
    category: str = "nvidia"  # nvidia, intel, amd


# ---------------------------------------------------------------------------
# All supported runtimes
# ---------------------------------------------------------------------------

RUNTIMES: List[RuntimeDef] = [
    RuntimeDef(
        id="standard",
        name_zh="NVIDIA 标准",
        name_en="NVIDIA Standard",
        desc_zh="标准 CUDA 运行时，适用于大多数 NVIDIA GPU",
        desc_en="Standard CUDA runtime for most NVIDIA GPUs",
        preferred_runtime="",
        env_dir_names=("python",),
        env_vars={},
        install_scripts=("install.ps1",),
        category="nvidia",
    ),
    RuntimeDef(
        id="sageattention",
        name_zh="SageAttention 1.x",
        name_en="SageAttention 1.x",
        desc_zh="SageAttention 1.x 加速，推荐 RTX 20/30/40 系列",
        desc_en="SageAttention 1.x acceleration, recommended for RTX 20/30/40",
        preferred_runtime="sageattention",
        env_dir_names=("python-sageattention", "python_sageattention"),
        env_vars={"MIKAZUKI_SAGEATTENTION_STARTUP": "1"},
        install_scripts=("install_sageattention.ps1",),
        category="nvidia",
    ),
    RuntimeDef(
        id="sageattention2",
        name_zh="SageAttention 2.x",
        name_en="SageAttention 2.x",
        desc_zh="SageAttention 2.x (Triton v2)，较新的注意力加速方案",
        desc_en="SageAttention 2.x (Triton v2), newer attention acceleration",
        preferred_runtime="sageattention2",
        env_dir_names=("python-sageattention2", "python_sageattention2"),
        env_vars={},
        install_scripts=("install_sageattention2.ps1",),
        category="nvidia",
    ),
    RuntimeDef(
        id="flashattention",
        name_zh="FlashAttention 2",
        name_en="FlashAttention 2",
        desc_zh="FlashAttention 2 加速，需单独 Python 环境",
        desc_en="FlashAttention 2 acceleration, separate Python environment",
        preferred_runtime="flashattention",
        env_dir_names=("python-flashattention", "python_flashattention"),
        env_vars={"MIKAZUKI_FLASHATTENTION_STARTUP": "1"},
        install_scripts=("install_flashattention.ps1",),
        category="nvidia",
    ),
    RuntimeDef(
        id="blackwell",
        name_zh="Blackwell (RTX 50)",
        name_en="Blackwell (RTX 50)",
        desc_zh="NVIDIA Blackwell 架构 (RTX 50 系列) 专用运行时",
        desc_en="Runtime for NVIDIA Blackwell architecture (RTX 50 series)",
        preferred_runtime="blackwell",
        env_dir_names=("python_blackwell",),
        env_vars={"MIKAZUKI_BLACKWELL_STARTUP": "1"},
        install_scripts=("install_blackwell.ps1",),
        category="nvidia",
    ),
    RuntimeDef(
        id="sageattention-blackwell",
        name_zh="Blackwell SageAttention",
        name_en="Blackwell SageAttention",
        desc_zh="Blackwell + SageAttention 组合运行时",
        desc_en="Blackwell + SageAttention combined runtime",
        preferred_runtime="sageattention-blackwell",
        env_dir_names=("python-sageattention-blackwell", "python_sagebwd_nvidia", "python-sagebwd-nvidia"),
        env_vars={
            "MIKAZUKI_SAGEATTENTION_STARTUP": "1",
            "MIKAZUKI_BLACKWELL_STARTUP": "1",
        },
        install_scripts=("install_blackwell.ps1", "install_sageattention.ps1"),
        category="nvidia",
    ),
    RuntimeDef(
        id="intel-xpu",
        name_zh="Intel XPU",
        name_en="Intel XPU",
        desc_zh="Intel Arc / Core Ultra GPU (XPU) 运行时",
        desc_en="Intel Arc / Core Ultra GPU (XPU) runtime",
        preferred_runtime="intel-xpu",
        env_dir_names=("python_xpu_intel",),
        env_vars={
            "MIKAZUKI_INTEL_XPU_STARTUP": "1",
            "MIKAZUKI_INTEL_XPU_EXPERIMENTAL": "1",
            "MIKAZUKI_STARTUP_ATTENTION_POLICY": "runtime_guarded",
            "MIKAZUKI_ALLOW_INTEL_XPU_SAGEATTN": "1",
            "IPEX_SDPA_SLICE_TRIGGER_RATE": "0.75",
            "IPEX_ATTENTION_SLICE_RATE": "0.4",
        },
        install_scripts=("install_intel_xpu.ps1",),
        experimental=True,
        category="intel",
    ),
    RuntimeDef(
        id="intel-xpu-sage",
        name_zh="Intel XPU SageAttention",
        name_en="Intel XPU SageAttention",
        desc_zh="Intel XPU + SageAttention 组合运行时",
        desc_en="Intel XPU + SageAttention combined runtime",
        preferred_runtime="intel-xpu-sage",
        env_dir_names=("python_xpu_intel_sage",),
        env_vars={
            "MIKAZUKI_INTEL_XPU_SAGE_STARTUP": "1",
            "MIKAZUKI_INTEL_XPU_EXPERIMENTAL": "1",
            "MIKAZUKI_INTEL_XPU_SAGE_EXPERIMENTAL": "1",
            "MIKAZUKI_STARTUP_ATTENTION_POLICY": "runtime_guarded",
            "MIKAZUKI_ALLOW_INTEL_XPU_SAGEATTN": "1",
        },
        install_scripts=("install_intel_xpu_sage.ps1",),
        experimental=True,
        category="intel",
    ),
    RuntimeDef(
        id="rocm-amd",
        name_zh="AMD ROCm",
        name_en="AMD ROCm",
        desc_zh="AMD GPU ROCm 运行时 (实验性)",
        desc_en="AMD GPU ROCm runtime (experimental)",
        preferred_runtime="rocm-amd",
        env_dir_names=("python_rocm_amd",),
        env_vars={
            "MIKAZUKI_ROCM_AMD_STARTUP": "1",
            "MIKAZUKI_AMD_EXPERIMENTAL": "1",
            "MIKAZUKI_STARTUP_ATTENTION_POLICY": "runtime_guarded",
            "MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB": "0.75",
            "MIKAZUKI_ROCM_SDPA_SLICE_GB": "0.35",
        },
        install_scripts=("install_rocm_amd.ps1",),
        experimental=True,
        category="amd",
    ),
]

RUNTIME_MAP: Dict[str, RuntimeDef] = {r.id: r for r in RUNTIMES}

# ---------------------------------------------------------------------------
# SafeMode vars to clear
# ---------------------------------------------------------------------------

SAFE_MODE_CLEAR_VARS: Tuple[str, ...] = (
    "PYTHONHOME",
    "PYTHONPATH",
    "PYTHONSTARTUP",
    "PYTHONUSERBASE",
    "PIP_REQUIRE_VIRTUALENV",
    "PIP_CONFIG_FILE",
    "VIRTUAL_ENV",
    "CONDA_PREFIX",
    "CONDA_DEFAULT_ENV",
    "CONDA_PROMPT_MODIFIER",
    "CONDA_EXE",
    "CONDA_PYTHON_EXE",
    "MIKAZUKI_ALLOW_SYSTEM_PYTHON",
    "MIKAZUKI_PREFERRED_RUNTIME",
    "MIKAZUKI_FLASHATTENTION_STARTUP",
    "MIKAZUKI_SAGEATTENTION_STARTUP",
    "MIKAZUKI_BLACKWELL_STARTUP",
    "MIKAZUKI_STARTUP_ATTENTION_POLICY",
)

# ---------------------------------------------------------------------------
# Standard env vars set by run_gui_core.ps1
# ---------------------------------------------------------------------------

STANDARD_ENV_VARS: Dict[str, str] = {
    "HF_HOME": "huggingface",
    "PYTHONUTF8": "1",
    "PIP_DISABLE_PIP_VERSION_CHECK": "1",
}

STANDARD_ENV_CLEAR_VARS: Tuple[str, ...] = (
    "PYTHONHOME",
    "PYTHONPATH",
)

# ---------------------------------------------------------------------------
# GUI.py arguments
# ---------------------------------------------------------------------------

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 28000
DEFAULT_TENSORBOARD_PORT = 6006

# ---------------------------------------------------------------------------
# Window
# ---------------------------------------------------------------------------

WINDOW_WIDTH = 960
WINDOW_HEIGHT = 640
SIDEBAR_WIDTH = 200

# ---------------------------------------------------------------------------
# Category labels
# ---------------------------------------------------------------------------

CATEGORY_LABELS = {
    "zh": {
        "nvidia": "NVIDIA",
        "intel": "Intel",
        "amd": "AMD",
    },
    "en": {
        "nvidia": "NVIDIA",
        "intel": "Intel",
        "amd": "AMD",
    },
}
