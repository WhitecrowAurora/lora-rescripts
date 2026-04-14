from __future__ import annotations

import os
import shutil
import subprocess
from typing import Optional, Sequence


NVIDIA_SMI_QUERY_TIMEOUT_SEC = 10
NVIDIA_SMI_SET_TIMEOUT_SEC = 15


def _which_nvidia_smi() -> Optional[str]:
    return shutil.which("nvidia-smi")


def _normalize_target_ids(target_ids: Optional[Sequence[object]]) -> list[str]:
    if not target_ids:
        return []
    result: list[str] = []
    for item in target_ids:
        value = str(item).strip()
        if value:
            result.append(value)
    return result


def _run_nvidia_smi(args: list[str], timeout_sec: int) -> tuple[bool, str, str]:
    executable = _which_nvidia_smi()
    if not executable:
        return False, "", "nvidia-smi was not found in PATH."

    try:
        completed = subprocess.run(
            [executable, *args],
            capture_output=True,
            text=True,
            timeout=timeout_sec,
            check=False,
            encoding="utf-8",
            errors="replace",
        )
    except Exception as exc:
        return False, "", f"nvidia-smi execution failed: {exc}"

    stdout = (completed.stdout or "").strip()
    stderr = (completed.stderr or "").strip()
    if completed.returncode != 0:
        message = stderr or stdout or f"nvidia-smi exited with code {completed.returncode}"
        return False, stdout, message
    return True, stdout, stderr


def resolve_visible_gpu_targets_from_env(environ: Optional[dict] = None) -> list[str]:
    env = environ or os.environ
    raw = str(env.get("CUDA_VISIBLE_DEVICES", "") or "").strip()
    if not raw:
        return []
    return [item.strip() for item in raw.split(",") if item.strip()]


def list_available_gpu_ids() -> dict:
    ok, stdout, error = _run_nvidia_smi(
        ["--query-gpu=index", "--format=csv,noheader,nounits"],
        timeout_sec=NVIDIA_SMI_QUERY_TIMEOUT_SEC,
    )
    if not ok:
        return {
            "ok": False,
            "error": error,
            "gpu_ids": [],
        }

    gpu_ids = [line.strip() for line in stdout.splitlines() if line.strip()]
    return {
        "ok": True,
        "error": "",
        "gpu_ids": gpu_ids,
    }


def _parse_numeric_value(value: str) -> Optional[float]:
    raw = str(value or "").strip()
    if not raw:
        return None
    lowered = raw.lower()
    if lowered in {"n/a", "[n/a]", "not supported", "[not supported]"}:
        return None
    try:
        return float(raw)
    except ValueError:
        return None


def query_gpu_metrics(target_ids: Optional[Sequence[object]] = None) -> dict:
    normalized_targets = _normalize_target_ids(target_ids)
    args = [
        "--query-gpu=index,temperature.gpu,power.draw,power.limit,min_power_limit,max_power_limit",
        "--format=csv,noheader,nounits",
    ]
    if normalized_targets:
        args.extend(["-i", ",".join(normalized_targets)])

    ok, stdout, error = _run_nvidia_smi(args, timeout_sec=NVIDIA_SMI_QUERY_TIMEOUT_SEC)
    if not ok:
        return {
            "ok": False,
            "error": error,
            "gpus": [],
        }

    gpu_rows: list[dict] = []
    for row in stdout.splitlines():
        if not row.strip():
            continue
        parts = [part.strip() for part in row.split(",")]
        while len(parts) < 6:
            parts.append("")
        gpu_rows.append(
            {
                "index": parts[0],
                "temperature_c": _parse_numeric_value(parts[1]),
                "power_draw_w": _parse_numeric_value(parts[2]),
                "power_limit_w": _parse_numeric_value(parts[3]),
                "min_power_limit_w": _parse_numeric_value(parts[4]),
                "max_power_limit_w": _parse_numeric_value(parts[5]),
            }
        )

    return {
        "ok": True,
        "error": "",
        "gpus": gpu_rows,
    }


def query_gpu_memory(target_ids: Optional[Sequence[object]] = None) -> dict:
    normalized_targets = _normalize_target_ids(target_ids)
    args = [
        "--query-gpu=index,memory.total,memory.used,memory.free",
        "--format=csv,noheader,nounits",
    ]
    if normalized_targets:
        args.extend(["-i", ",".join(normalized_targets)])

    ok, stdout, error = _run_nvidia_smi(args, timeout_sec=NVIDIA_SMI_QUERY_TIMEOUT_SEC)
    if not ok:
        return {
            "ok": False,
            "error": error,
            "gpus": [],
        }

    gpu_rows: list[dict] = []
    for row in stdout.splitlines():
        if not row.strip():
            continue
        parts = [part.strip() for part in row.split(",")]
        while len(parts) < 4:
            parts.append("")
        gpu_rows.append(
            {
                "index": parts[0],
                "memory_total_mb": _parse_numeric_value(parts[1]),
                "memory_used_mb": _parse_numeric_value(parts[2]),
                "memory_free_mb": _parse_numeric_value(parts[3]),
            }
        )

    return {
        "ok": True,
        "error": "",
        "gpus": gpu_rows,
    }


def apply_gpu_power_limit(
    requested_limit_w: int,
    *,
    target_ids: Optional[Sequence[object]] = None,
    environ: Optional[dict] = None,
) -> dict:
    warnings: list[str] = []
    records: list[dict] = []
    restore_state: list[dict] = []

    try:
        requested_limit = int(round(float(requested_limit_w)))
    except (TypeError, ValueError):
        return {
            "applied": False,
            "warnings": ["GPU power limit is invalid and will be ignored."],
            "records": [],
            "restore_state": [],
            "target_ids": [],
        }

    if requested_limit <= 0:
        return {
            "applied": False,
            "warnings": [],
            "records": [],
            "restore_state": [],
            "target_ids": [],
        }

    normalized_targets = _normalize_target_ids(target_ids) or resolve_visible_gpu_targets_from_env(environ)
    if not normalized_targets:
        available = list_available_gpu_ids()
        if not available["ok"]:
            return {
                "applied": False,
                "warnings": [f"Unable to enumerate GPUs for power limiting: {available['error']}"],
                "records": [],
                "restore_state": [],
                "target_ids": [],
            }
        if len(available["gpu_ids"]) == 1:
            normalized_targets = available["gpu_ids"]
        else:
            return {
                "applied": False,
                "warnings": [
                    "GPU power limit was requested, but training GPU selection is ambiguous without explicit gpu_ids or CUDA_VISIBLE_DEVICES. Skipping whole-GPU power limit."
                ],
                "records": [],
                "restore_state": [],
                "target_ids": [],
            }

    metrics = query_gpu_metrics(normalized_targets)
    if not metrics["ok"]:
        return {
            "applied": False,
            "warnings": [f"Unable to query GPU power limits before applying: {metrics['error']}"],
            "records": [],
            "restore_state": [],
            "target_ids": normalized_targets,
        }

    for gpu in metrics["gpus"]:
        gpu_id = str(gpu.get("index", "") or "").strip()
        if not gpu_id:
            continue

        desired_limit = requested_limit
        min_limit = gpu.get("min_power_limit_w")
        max_limit = gpu.get("max_power_limit_w")
        current_limit = gpu.get("power_limit_w")

        if min_limit is not None:
            desired_limit = max(desired_limit, int(round(min_limit)))
        if max_limit is not None:
            desired_limit = min(desired_limit, int(round(max_limit)))

        if desired_limit != requested_limit:
            warnings.append(
                f"GPU {gpu_id} requested power limit {requested_limit}W is outside the supported range; clamped to {desired_limit}W."
            )

        ok, _, error = _run_nvidia_smi(
            ["-i", gpu_id, "-pl", str(int(desired_limit))],
            timeout_sec=NVIDIA_SMI_SET_TIMEOUT_SEC,
        )
        if not ok:
            warnings.append(f"Failed to apply GPU power limit on GPU {gpu_id}: {error}")
            continue

        record = {
            "gpu_id": gpu_id,
            "previous_power_limit_w": int(round(current_limit)) if current_limit is not None else None,
            "applied_power_limit_w": int(desired_limit),
        }
        records.append(record)
        if current_limit is not None:
            restore_state.append(
                {
                    "gpu_id": gpu_id,
                    "power_limit_w": int(round(current_limit)),
                }
            )

    return {
        "applied": len(records) > 0,
        "warnings": warnings,
        "records": records,
        "restore_state": restore_state,
        "target_ids": normalized_targets,
    }


def restore_gpu_power_limits(restore_state: Optional[Sequence[dict]]) -> dict:
    warnings: list[str] = []
    restored: list[dict] = []

    if not restore_state:
        return {
            "restored": restored,
            "warnings": warnings,
        }

    for item in restore_state:
        gpu_id = str(item.get("gpu_id", "") or "").strip()
        power_limit = item.get("power_limit_w")
        if not gpu_id or power_limit is None:
            continue

        ok, _, error = _run_nvidia_smi(
            ["-i", gpu_id, "-pl", str(int(power_limit))],
            timeout_sec=NVIDIA_SMI_SET_TIMEOUT_SEC,
        )
        if not ok:
            warnings.append(f"Failed to restore GPU {gpu_id} power limit to {power_limit}W: {error}")
            continue

        restored.append(
            {
                "gpu_id": gpu_id,
                "power_limit_w": int(power_limit),
            }
        )

    return {
        "restored": restored,
        "warnings": warnings,
    }
