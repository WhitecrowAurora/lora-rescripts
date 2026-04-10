from __future__ import annotations

import os
from typing import Mapping

from mikazuki.utils.runtime_paths import executable_matches_runtime


RUNTIME_ENVIRONMENT_ALIASES = {}

INTEL_XPU_RUNTIME_NAMES = {"intel-xpu", "intel-xpu-sage"}
AMD_ROCM_RUNTIME_NAMES = {"rocm-amd"}
SAGEATTENTION_RUNTIME_NAMES = {"sageattention", "sageattention2"}


def normalize_runtime_name(runtime_name: str) -> str:
    normalized = str(runtime_name or "").strip().lower()
    return RUNTIME_ENVIRONMENT_ALIASES.get(normalized, normalized)


def infer_runtime_environment_name(executable: str | None = None) -> str:
    if executable_matches_runtime(executable, "sagebwd-nvidia"):
        return "sagebwd-nvidia"
    if executable_matches_runtime(executable, "flashattention"):
        return "flashattention"
    if executable_matches_runtime(executable, "intel-xpu-sage"):
        return "intel-xpu-sage"
    if executable_matches_runtime(executable, "intel-xpu"):
        return "intel-xpu"
    if executable_matches_runtime(executable, "rocm-amd"):
        return "rocm-amd"
    if executable_matches_runtime(executable, "blackwell"):
        return "blackwell"
    if executable_matches_runtime(executable, "sageattention2"):
        return "sageattention2"
    if executable_matches_runtime(executable, "sageattention"):
        return "sageattention"
    if executable_matches_runtime(executable, "tageditor") or executable_matches_runtime(executable, "venv-tageditor"):
        return "tageditor"
    if executable_matches_runtime(executable, "venv"):
        return "venv"
    if executable_matches_runtime(executable, "portable"):
        return "portable"
    return "system"


def infer_attention_runtime_mode(environ: Mapping[str, str] | None = None, executable: str | None = None) -> str:
    env = environ if environ is not None else os.environ

    if str(env.get("MIKAZUKI_SAGEBWD_STARTUP", "") or "").strip() == "1":
        return "sagebwd-nvidia"
    if str(env.get("MIKAZUKI_FLASHATTENTION_STARTUP", "") or "").strip() == "1":
        return "flashattention"
    if str(env.get("MIKAZUKI_SAGEATTENTION_STARTUP", "") or "").strip() == "1":
        return "sageattention"
    if str(env.get("MIKAZUKI_BLACKWELL_STARTUP", "") or "").strip() == "1":
        return "blackwell"
    if str(env.get("MIKAZUKI_INTEL_XPU_SAGE_STARTUP", "") or "").strip() == "1":
        return "intel-xpu-sage"
    if str(env.get("MIKAZUKI_INTEL_XPU_STARTUP", "") or "").strip() == "1":
        return "intel-xpu"
    if str(env.get("MIKAZUKI_ROCM_AMD_STARTUP", "") or "").strip() == "1":
        return "rocm-amd"

    return normalize_runtime_name(infer_runtime_environment_name(executable=executable))


def resolve_preferred_runtime(environ: Mapping[str, str] | None = None) -> str:
    env = environ if environ is not None else os.environ
    return str(env.get("MIKAZUKI_PREFERRED_RUNTIME", "") or "").strip().lower()


def is_intel_xpu_runtime(runtime_name: str) -> bool:
    return str(runtime_name or "").strip().lower() in INTEL_XPU_RUNTIME_NAMES


def is_amd_rocm_runtime(runtime_name: str) -> bool:
    return str(runtime_name or "").strip().lower() in AMD_ROCM_RUNTIME_NAMES
