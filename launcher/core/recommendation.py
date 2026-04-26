"""Runtime recommendation helpers for the launcher."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from launcher.core.runtime_detector import RuntimeStatus, get_best_runtime
from launcher.core.subprocess_utils import hidden_subprocess_kwargs


def _detect_gpu_inventory() -> List[Dict[str, str]]:
    """Read Windows display adapter info for runtime recommendation."""

    if sys.platform != "win32":
        return []

    cmd = [
        "powershell.exe",
        "-NoProfile",
        "-Command",
        (
            "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; "
            "Get-CimInstance Win32_VideoController | "
            "Select-Object Name,AdapterCompatibility,DriverVersion | "
            "ConvertTo-Json -Compress"
        ),
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=6,
            check=False,
            encoding="utf-8",
            errors="replace",
            **hidden_subprocess_kwargs(),
        )
        if result.returncode != 0 or not result.stdout.strip():
            return []
        payload = json.loads(result.stdout)
    except Exception:
        return []

    records = payload if isinstance(payload, list) else [payload]
    adapters: List[Dict[str, str]] = []
    for item in records:
        if not isinstance(item, dict):
            continue
        name = str(item.get("Name") or "").strip()
        compat = str(item.get("AdapterCompatibility") or "").strip()
        driver = str(item.get("DriverVersion") or "").strip()
        if not name:
            continue
        lower_name = name.lower()
        lower_compat = compat.lower()
        vendor = "unknown"
        if "nvidia" in lower_name or "nvidia" in lower_compat:
            vendor = "nvidia"
        elif "intel" in lower_name or "intel" in lower_compat:
            vendor = "intel"
        elif any(token in lower_name for token in ("amd", "ati", "radeon")) or any(
            token in lower_compat for token in ("advanced micro devices", "amd", "ati")
        ):
            vendor = "amd"
        adapters.append(
            {
                "name": name,
                "vendor": vendor,
                "driver_version": driver,
            }
        )
    return adapters


def _choose_primary_adapter(adapters: List[Dict[str, str]]) -> Optional[Dict[str, str]]:
    """Prefer discrete NVIDIA first, then Intel, then AMD, then any non-basic adapter."""

    useful = [
        adapter
        for adapter in adapters
        if "microsoft basic" not in adapter.get("name", "").lower()
    ]
    if not useful:
        useful = adapters

    vendor_priority = {"nvidia": 0, "intel": 1, "amd": 2, "unknown": 3}
    useful.sort(key=lambda item: vendor_priority.get(item.get("vendor", "unknown"), 99))
    return useful[0] if useful else None


def _is_blackwell_name(name: str) -> bool:
    lower = name.lower()
    return any(token in lower for token in ("rtx 50", " 5090", " 5080", " 5070", " 5060", "blackwell"))


def _first_installed(statuses: Dict[str, RuntimeStatus], candidates: List[str]) -> Optional[str]:
    for runtime_id in candidates:
        status = statuses.get(runtime_id)
        if status and status.installed:
            return runtime_id
    return None


def recommend_runtime(statuses: Dict[str, RuntimeStatus], repo_root: Optional[Path] = None) -> Dict[str, Any]:
    """Return preferred and best-installed runtimes plus a human-readable reason."""

    adapters = _detect_gpu_inventory()
    primary = _choose_primary_adapter(adapters)

    preferred_runtime_id: Optional[str] = None
    selected_runtime_id: Optional[str] = None
    candidates: List[str] = []
    reason_zh = "未检测到可识别的 GPU，已回退到通用运行时优先级。"
    reason_en = "No recognizable GPU was detected. Falling back to the generic runtime priority."
    source = "fallback"
    gpu_name = ""
    gpu_vendor = "unknown"

    if primary is not None:
        gpu_name = primary.get("name", "")
        gpu_vendor = primary.get("vendor", "unknown")
        source = "gpu"

        if gpu_vendor == "nvidia":
            if _is_blackwell_name(gpu_name):
                candidates = [
                    "sageattention-blackwell",
                    "blackwell",
                    "sageattention2",
                    "sageattention",
                    "flashattention",
                    "standard",
                ]
                preferred_runtime_id = candidates[0]
                reason_zh = f"检测到 NVIDIA Blackwell GPU（{gpu_name}），优先推荐 Blackwell 专用线路。"
                reason_en = f"Detected an NVIDIA Blackwell GPU ({gpu_name}). Preferring the dedicated Blackwell runtime path."
            else:
                candidates = [
                    "sageattention2",
                    "sageattention",
                    "flashattention",
                    "standard",
                ]
                preferred_runtime_id = candidates[0]
                reason_zh = f"检测到 NVIDIA GPU（{gpu_name}），优先推荐 SageAttention / FlashAttention 加速线路。"
                reason_en = f"Detected an NVIDIA GPU ({gpu_name}). Preferring SageAttention / FlashAttention acceleration runtimes."
            selected_runtime_id = _first_installed(statuses, candidates)
        elif gpu_vendor == "intel":
            candidates = ["intel-xpu-sage", "intel-xpu"]
            preferred_runtime_id = candidates[0]
            reason_zh = f"检测到 Intel GPU（{gpu_name}），优先推荐 Intel XPU 运行时。"
            reason_en = f"Detected an Intel GPU ({gpu_name}). Preferring the Intel XPU runtimes."
            selected_runtime_id = _first_installed(statuses, candidates)
        elif gpu_vendor == "amd":
            candidates = ["rocm-amd"]
            preferred_runtime_id = candidates[0]
            reason_zh = f"检测到 AMD GPU（{gpu_name}），优先推荐 ROCm 运行时。"
            reason_en = f"Detected an AMD GPU ({gpu_name}). Preferring the ROCm runtime."
            selected_runtime_id = _first_installed(statuses, candidates)

    if not selected_runtime_id:
        fallback = get_best_runtime(statuses)
        if fallback:
            selected_runtime_id = fallback
            if source != "gpu":
                candidates = [fallback]
            elif not candidates:
                candidates = [fallback]

    preferred_installed = bool(
        preferred_runtime_id
        and preferred_runtime_id in statuses
        and statuses[preferred_runtime_id].installed
    )

    return {
        "preferred_runtime_id": preferred_runtime_id,
        "selected_runtime_id": selected_runtime_id,
        "preferred_installed": preferred_installed,
        "gpu_name": gpu_name,
        "gpu_vendor": gpu_vendor,
        "reason_zh": reason_zh,
        "reason_en": reason_en,
        "source": source,
        "candidates": candidates,
        "adapters": adapters,
    }
