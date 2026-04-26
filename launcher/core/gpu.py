"""GPU monitoring via nvidia-smi polling."""

from __future__ import annotations

import subprocess
import sys
from typing import Dict, Any

from launcher.core.subprocess_utils import hidden_subprocess_kwargs


def get_gpu_stats() -> Dict[str, Any]:
    """Query nvidia-smi for GPU load and VRAM usage.

    Returns:
        dict with keys:
            available (bool): Whether nvidia-smi is accessible
            gpu_load (int): GPU utilization percentage (0-100)
            vram_usage (int): VRAM usage percentage (0-100)
            vram_used_mb (int): VRAM used in MB
            vram_total_mb (int): Total VRAM in MB
            gpu_name (str): GPU name if available
    """
    result: Dict[str, Any] = {
        "available": False,
        "gpu_load": 0,
        "vram_usage": 0,
        "vram_used_mb": 0,
        "vram_total_mb": 0,
        "gpu_name": "",
    }

    if sys.platform != "win32":
        # nvidia-smi may exist on Linux too, but this launcher is Windows-only
        # for now; allow it to work if nvidia-smi is on PATH
        pass

    try:
        output = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=gpu_name,utilization.gpu,memory.used,memory.total",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            timeout=5,
            **hidden_subprocess_kwargs(),
        )
        if output.returncode != 0:
            return result

        lines = output.stdout.strip().split("\n")
        if not lines:
            return result

        # Take the first GPU
        parts = lines[0].split(",")
        if len(parts) < 4:
            return result

        result["gpu_name"] = parts[0].strip()
        result["gpu_load"] = int(parts[1].strip())
        result["vram_used_mb"] = int(parts[2].strip())
        result["vram_total_mb"] = int(parts[3].strip())

        if result["vram_total_mb"] > 0:
            result["vram_usage"] = round(result["vram_used_mb"] / result["vram_total_mb"] * 100)

        result["available"] = True

    except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        pass

    return result
