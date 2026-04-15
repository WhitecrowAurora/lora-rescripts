from __future__ import annotations

import copy
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Callable, Optional

import psutil
import toml

from mikazuki.launch_utils import base_dir_path
from mikazuki.log import log
from mikazuki.utils.nvidia_smi import (
    list_available_gpu_ids,
    query_gpu_memory,
    resolve_visible_gpu_targets_from_env,
)


_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".gif",
    ".tif",
    ".tiff",
}
_DEFAULT_LIMIT_RATIO = 0.95
_DEFAULT_PROBE_STEPS = 3
_DEFAULT_EDGE_FLOOR = 512
_DEFAULT_EDGE_STEP = 64
_DEFAULT_POLL_INTERVAL_SEC = 0.75
_DEFAULT_TIMEOUT_SEC = 900
_DEFAULT_SHARED_USAGE_FAIL_BYTES = 128 * 1024 * 1024
_GPU_COUNTER_CLASS = "Win32_PerfFormattedData_GPUPerformanceCounters_GPUProcessMemory"
_MEMORY_FAILURE_PATTERNS = (
    "out of memory",
    "cuda out of memory",
    "cudnn_status_not_supported",
    "cublas_status_alloc_failed",
    "not enough memory",
    "alloc failed",
)
_PID_NAME_PATTERN = re.compile(r"pid_(\d+)_", re.IGNORECASE)
_POWERSHELL_CANDIDATES = ("powershell.exe", "powershell", "pwsh.exe", "pwsh")


def _parse_boolish(value, *, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value != 0
    normalized = str(value).strip().lower()
    if normalized in {"", "0", "false", "no", "off", "none", "null"}:
        return False
    if normalized in {"1", "true", "yes", "on"}:
        return True
    return bool(value)


def _normalize_limit_ratio(value) -> float:
    try:
        limit_ratio = float(value)
    except (TypeError, ValueError):
        limit_ratio = _DEFAULT_LIMIT_RATIO
    return min(0.99, max(0.05, limit_ratio))


def _normalize_int(value, default: int, minimum: int) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = default
    return max(minimum, parsed)


def _safe_name(value: str) -> str:
    normalized = re.sub(r"[^0-9A-Za-z._-]+", "-", str(value or "").strip())
    return normalized.strip("._-") or "sdxl-low-vram-probe"


def _resolve_train_data_dir(config_data: dict) -> Path:
    raw = str(config_data.get("train_data_dir", "") or "").strip()
    candidate = Path(raw)
    if not candidate.is_absolute():
        candidate = (base_dir_path() / candidate).resolve()
    return candidate


def _find_source_records(dataset_root: Path, caption_extension: str, limit: int) -> list[tuple[Path, Optional[Path]]]:
    normalized_caption_extension = str(caption_extension or ".txt").strip() or ".txt"
    if not normalized_caption_extension.startswith("."):
        normalized_caption_extension = f".{normalized_caption_extension}"

    records: list[tuple[Path, Optional[Path]]] = []
    for current_root, _dirs, files in os.walk(dataset_root):
        root_path = Path(current_root)
        for filename in sorted(files):
            image_path = root_path / filename
            if image_path.suffix.lower() not in _IMAGE_EXTENSIONS:
                continue
            caption_path = image_path.with_suffix(normalized_caption_extension)
            records.append((image_path, caption_path if caption_path.exists() else None))
            if len(records) >= limit:
                return records
    return records


def _build_probe_dataset(config_data: dict, probe_root: Path, probe_steps: int) -> Path:
    dataset_root = _resolve_train_data_dir(config_data)
    if not dataset_root.exists():
        raise FileNotFoundError(f"训练数据集路径不存在: {dataset_root}")

    train_batch_size = _normalize_int(config_data.get("train_batch_size", 1), default=1, minimum=1)
    gradient_accumulation_steps = _normalize_int(
        config_data.get("gradient_accumulation_steps", 1),
        default=1,
        minimum=1,
    )
    sample_count = max(1, train_batch_size * gradient_accumulation_steps * max(1, probe_steps))
    caption_extension = str(config_data.get("caption_extension", ".txt") or ".txt")

    source_records = _find_source_records(dataset_root, caption_extension, sample_count)
    if not source_records:
        raise FileNotFoundError(f"未在训练数据集中找到可用于 probe 的图片: {dataset_root}")

    subset_dir = probe_root / "dataset" / "1_probe"
    subset_dir.mkdir(parents=True, exist_ok=True)

    normalized_caption_extension = caption_extension if str(caption_extension).startswith(".") else f".{caption_extension}"
    for index in range(sample_count):
        src_image, src_caption = source_records[index % len(source_records)]
        dst_image = subset_dir / f"probe_{index + 1:04d}{src_image.suffix.lower()}"
        shutil.copy2(src_image, dst_image)
        if src_caption is not None and src_caption.exists():
            dst_caption = subset_dir / f"{dst_image.stem}{normalized_caption_extension}"
            shutil.copy2(src_caption, dst_caption)

    return subset_dir.parent


def _collect_candidate_edges(start_edge: int) -> list[int]:
    normalized_start = max(_DEFAULT_EDGE_STEP, int(math.floor(start_edge / _DEFAULT_EDGE_STEP) * _DEFAULT_EDGE_STEP))
    candidates: list[int] = []
    current = normalized_start
    while current >= _DEFAULT_EDGE_FLOOR:
        candidates.append(current)
        current -= _DEFAULT_EDGE_STEP
    if _DEFAULT_EDGE_FLOOR not in candidates:
        candidates.append(_DEFAULT_EDGE_FLOOR)
    return candidates


def _resolve_current_target_edge(config_data: dict) -> int:
    try:
        target_edge = int(config_data.get("sdxl_bucket_target_edge", 0) or 0)
    except (TypeError, ValueError):
        target_edge = 0
    if target_edge > 0:
        return target_edge

    raw_resolution = str(config_data.get("resolution", "1024,1024") or "1024,1024").lower().replace("x", ",")
    parts = [part.strip() for part in raw_resolution.split(",") if part.strip()]
    try:
        width = int(float(parts[0]))
        height = int(float(parts[1]))
    except (IndexError, TypeError, ValueError):
        width = 1024
        height = 1024

    resolution_mode = str(config_data.get("sdxl_bucket_resolution_mode", "long_edge") or "long_edge").strip().lower()
    resolved = min(width, height) if resolution_mode == "short_edge" else max(width, height)
    return max(_DEFAULT_EDGE_STEP, int(resolved))


def _resolve_primary_gpu_id(customize_env: dict, gpu_ids: Optional[list]) -> Optional[str]:
    normalized_targets = [str(item).strip() for item in (gpu_ids or []) if str(item).strip()]
    if normalized_targets:
        return normalized_targets[0]

    visible_targets = resolve_visible_gpu_targets_from_env(customize_env)
    if visible_targets:
        return visible_targets[0]

    available = list_available_gpu_ids()
    if not available.get("ok"):
        return None
    gpu_id_list = available.get("gpu_ids") or []
    return str(gpu_id_list[0]).strip() if gpu_id_list else None


def _resolve_primary_gpu_memory_mb(customize_env: dict, gpu_ids: Optional[list]) -> Optional[int]:
    primary_gpu_id = _resolve_primary_gpu_id(customize_env, gpu_ids)
    if not primary_gpu_id:
        return None

    memory_info = query_gpu_memory([primary_gpu_id])
    if not memory_info.get("ok"):
        return None
    for gpu in memory_info.get("gpus", []):
        if str(gpu.get("index", "")).strip() == str(primary_gpu_id):
            total_mb = gpu.get("memory_total_mb")
            if total_mb is None:
                return None
            return int(total_mb)
    return None


def _find_powershell_executable() -> Optional[str]:
    for candidate in _POWERSHELL_CANDIDATES:
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return None


def _query_windows_gpu_process_memory_records() -> list[dict]:
    executable = _find_powershell_executable()
    if not executable:
        return []

    command = (
        f"$items = Get-CimInstance -ClassName {_GPU_COUNTER_CLASS} | "
        "Select-Object Name,DedicatedUsage,SharedUsage,TotalCommitted;"
        "if ($items) { $items | ConvertTo-Json -Compress }"
    )
    try:
        completed = subprocess.run(
            [executable, "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", command],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
            encoding="utf-8",
            errors="replace",
        )
    except Exception:
        return []

    if completed.returncode != 0:
        return []

    raw = (completed.stdout or "").strip()
    if not raw:
        return []

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return []

    if isinstance(parsed, dict):
        return [parsed]
    if isinstance(parsed, list):
        return [item for item in parsed if isinstance(item, dict)]
    return []


def _iter_process_tree_pids(root_pid: int) -> set[int]:
    pids = {int(root_pid)}
    try:
        root_process = psutil.Process(root_pid)
        for child in root_process.children(recursive=True):
            pids.add(int(child.pid))
    except (psutil.Error, ValueError):
        pass
    return pids


def _select_dominant_gpu_record(records: list[dict], tracked_pids: set[int]) -> Optional[dict]:
    matched_records: list[dict] = []
    for item in records:
        name = str(item.get("Name", "") or "")
        pid_match = _PID_NAME_PATTERN.search(name)
        if not pid_match:
            continue
        try:
            item_pid = int(pid_match.group(1))
        except (TypeError, ValueError):
            continue
        if item_pid not in tracked_pids:
            continue

        def _to_int(key: str) -> int:
            try:
                return int(item.get(key, 0) or 0)
            except (TypeError, ValueError):
                return 0

        matched_records.append(
            {
                "pid": item_pid,
                "instance_name": name,
                "dedicated_bytes": _to_int("DedicatedUsage"),
                "shared_bytes": _to_int("SharedUsage"),
                "total_committed_bytes": _to_int("TotalCommitted"),
            }
        )

    if not matched_records:
        return None

    return max(
        matched_records,
        key=lambda record: (
            int(record["dedicated_bytes"]) + int(record["shared_bytes"]),
            int(record["total_committed_bytes"]),
            int(record["pid"]),
        ),
    )


def _kill_process_tree(root_pid: int) -> None:
    try:
        root_process = psutil.Process(root_pid)
    except psutil.Error:
        return

    children = root_process.children(recursive=True)
    for child in children:
        try:
            child.kill()
        except psutil.Error:
            pass
    psutil.wait_procs(children, timeout=3)

    try:
        root_process.kill()
        root_process.wait(3)
    except psutil.Error:
        pass


def _tail_log_text(path: Path, max_chars: int = 12000) -> str:
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""
    if len(content) <= max_chars:
        return content
    return content[-max_chars:]


def _looks_like_memory_failure(log_text: str) -> bool:
    normalized = str(log_text or "").lower()
    return any(pattern in normalized for pattern in _MEMORY_FAILURE_PATTERNS)


def _format_gib(byte_value: int) -> str:
    gib = float(byte_value) / float(1024 ** 3)
    return f"{gib:.2f} GiB"


def _build_probe_config(
    config_data: dict,
    *,
    probe_root: Path,
    dataset_root: Path,
    target_edge: int,
    probe_steps: int,
) -> dict:
    probe_config = copy.deepcopy(config_data)
    probe_config["train_data_dir"] = str(dataset_root)
    probe_config["output_dir"] = str((probe_root / "output").resolve())
    probe_config["logging_dir"] = str((probe_root / "logs").resolve())
    probe_config["output_name"] = f"{_safe_name(probe_config.get('output_name', 'sdxl-probe'))}-probe-{target_edge}"
    probe_config["enable_preview"] = False
    probe_config["sample_at_first"] = False
    probe_config["sample_every_n_epochs"] = 0
    probe_config["save_every_n_epochs"] = 999999
    probe_config["save_state"] = False
    probe_config["save_state_on_train_end"] = False
    probe_config["validation_split"] = 0.0
    probe_config["max_train_steps"] = probe_steps
    probe_config["max_train_epochs"] = 1
    probe_config["persistent_data_loader_workers"] = False
    probe_config["max_data_loader_n_workers"] = 0
    probe_config["sdxl_bucket_target_edge"] = int(target_edge)
    probe_config["sdxl_low_vram_auto_resolution_probe"] = False
    probe_config["_runtime_safe_preview_enabled"] = False
    probe_config.pop("sample_every_n_steps", None)
    return probe_config


def _run_single_candidate_probe(
    *,
    launch_args: list[str],
    customize_env: dict,
    cwd: Path,
    log_path: Path,
    total_gpu_memory_mb: int,
    dedicated_limit_ratio: float,
) -> dict:
    peak_dedicated_bytes = 0
    peak_shared_bytes = 0
    peak_instance_name = ""
    timed_out = False

    with open(log_path, "wb") as log_handle:
        process = subprocess.Popen(
            launch_args,
            env=customize_env,
            cwd=str(cwd),
            stdout=log_handle,
            stderr=subprocess.STDOUT,
        )

        started_at = time.time()
        try:
            while process.poll() is None:
                tracked_pids = _iter_process_tree_pids(process.pid)
                dominant_record = _select_dominant_gpu_record(
                    _query_windows_gpu_process_memory_records(),
                    tracked_pids,
                )
                if dominant_record is not None:
                    peak_dedicated_bytes = max(peak_dedicated_bytes, int(dominant_record["dedicated_bytes"]))
                    peak_shared_bytes = max(peak_shared_bytes, int(dominant_record["shared_bytes"]))
                    if (
                        int(dominant_record["dedicated_bytes"]) + int(dominant_record["shared_bytes"])
                        >= peak_dedicated_bytes + peak_shared_bytes
                    ):
                        peak_instance_name = str(dominant_record["instance_name"])

                if time.time() - started_at > _DEFAULT_TIMEOUT_SEC:
                    timed_out = True
                    _kill_process_tree(process.pid)
                    break

                time.sleep(_DEFAULT_POLL_INTERVAL_SEC)
        finally:
            if process.poll() is None:
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    _kill_process_tree(process.pid)

    raw_return_code = process.returncode
    if raw_return_code is None and timed_out:
        raw_return_code = -9
    return_code = int(raw_return_code or 0)
    total_gpu_bytes = int(total_gpu_memory_mb) * 1024 * 1024
    dedicated_ratio = (float(peak_dedicated_bytes) / float(total_gpu_bytes)) if total_gpu_bytes > 0 else 0.0
    log_text = _tail_log_text(log_path)
    memory_failure_in_log = _looks_like_memory_failure(log_text)

    unsafe_reasons: list[str] = []
    if peak_shared_bytes > _DEFAULT_SHARED_USAGE_FAIL_BYTES:
        unsafe_reasons.append(f"共享显存峰值 {_format_gib(peak_shared_bytes)}")
    if dedicated_ratio > dedicated_limit_ratio:
        unsafe_reasons.append(
            f"专用显存峰值 {_format_gib(peak_dedicated_bytes)} 超过阈值 {dedicated_limit_ratio * 100:.0f}%"
        )
    if timed_out:
        unsafe_reasons.append("预探测超时")
    if return_code != 0 and memory_failure_in_log:
        unsafe_reasons.append("probe 进程以显存相关错误退出")

    fatal_error = return_code != 0 and not unsafe_reasons

    return {
        "return_code": return_code,
        "peak_dedicated_bytes": peak_dedicated_bytes,
        "peak_shared_bytes": peak_shared_bytes,
        "peak_instance_name": peak_instance_name,
        "dedicated_ratio": dedicated_ratio,
        "memory_failure_in_log": memory_failure_in_log,
        "fatal_error": fatal_error,
        "unsafe_reasons": unsafe_reasons,
        "log_path": str(log_path),
    }


def _can_fallback_to_min_edge(probe_outcome: Optional[dict], dedicated_limit_ratio: float) -> bool:
    if not isinstance(probe_outcome, dict):
        return False
    if probe_outcome.get("fatal_error"):
        return False
    if probe_outcome.get("memory_failure_in_log"):
        return False

    unsafe_reasons = [str(item) for item in (probe_outcome.get("unsafe_reasons") or []) if str(item).strip()]
    if not unsafe_reasons:
        return False
    if any("预探测超时" in reason for reason in unsafe_reasons):
        return False

    try:
        dedicated_ratio = float(probe_outcome.get("dedicated_ratio", 0.0) or 0.0)
    except (TypeError, ValueError):
        return False
    if dedicated_ratio > float(dedicated_limit_ratio):
        return False

    return all("共享显存峰值" in reason for reason in unsafe_reasons)


def maybe_run_sdxl_low_vram_auto_resolution_probe(
    *,
    config_data: dict,
    customize_env: dict,
    cwd: Path,
    gpu_ids: Optional[list],
    distributed_runtime: Optional[dict],
    launch_args_builder: Callable[[str], list[str]],
) -> dict:
    model_train_type = str(config_data.get("model_train_type", "") or "").strip().lower()
    if model_train_type != "sdxl-lora":
        return {"status": "skipped", "message": "not sdxl-lora"}

    if not _parse_boolish(config_data.get("sdxl_low_vram_optimization"), default=False):
        return {"status": "skipped", "message": "low vram optimization disabled"}

    if not _parse_boolish(config_data.get("sdxl_low_vram_auto_resolution_probe", True), default=True):
        return {"status": "skipped", "message": "auto resolution probe disabled"}

    if sys.platform != "win32":
        log.info("[low-vram-probe] skipped: current auto resolution probe is only enabled on Windows + NVIDIA for now.")
        return {"status": "skipped", "message": "unsupported platform"}

    runtime = distributed_runtime if isinstance(distributed_runtime, dict) else {}
    if int(runtime.get("total_num_processes", 1) or 1) > 1 or runtime.get("is_multi_machine"):
        log.info("[low-vram-probe] skipped: distributed training is not supported by the startup auto resolution probe yet.")
        return {"status": "skipped", "message": "distributed unsupported"}

    if _parse_boolish(config_data.get("enable_mixed_resolution_training"), default=False):
        log.info("[low-vram-probe] skipped: mixed-resolution training is not supported by the startup auto resolution probe yet.")
        return {"status": "skipped", "message": "mixed resolution unsupported"}

    total_gpu_memory_mb = _resolve_primary_gpu_memory_mb(customize_env, gpu_ids)
    if total_gpu_memory_mb is None or total_gpu_memory_mb <= 0:
        log.warning("[low-vram-probe] skipped: unable to resolve total dedicated GPU memory via nvidia-smi.")
        return {"status": "skipped", "message": "missing gpu memory telemetry"}

    dedicated_limit_ratio = _normalize_limit_ratio(
        config_data.get("sdxl_low_vram_probe_dedicated_limit_ratio", _DEFAULT_LIMIT_RATIO)
    )
    config_data["sdxl_low_vram_probe_dedicated_limit_ratio"] = dedicated_limit_ratio

    current_target_edge = _resolve_current_target_edge(config_data)
    candidate_edges = _collect_candidate_edges(current_target_edge)
    probe_steps = _DEFAULT_PROBE_STEPS

    timestamp = time.strftime("%Y%m%d-%H%M%S")
    probe_root = base_dir_path() / "logs" / "low_vram_probe" / f"{timestamp}-{_safe_name(config_data.get('output_name', 'sdxl'))}"
    probe_root.mkdir(parents=True, exist_ok=True)

    try:
        dataset_root = _build_probe_dataset(config_data, probe_root, probe_steps)
    except Exception as exc:
        log.warning(f"[low-vram-probe] skipped: failed to prepare probe dataset: {exc}")
        return {"status": "skipped", "message": f"probe dataset preparation failed: {exc}"}

    log.info(
        "[low-vram-probe] startup auto probe enabled: mode=%s start_edge=%s dedicated_limit=%.0f%% probe_steps=%s log_dir=%s",
        str(config_data.get("sdxl_bucket_resolution_mode", "long_edge") or "long_edge"),
        int(current_target_edge),
        dedicated_limit_ratio * 100.0,
        int(probe_steps),
        probe_root,
    )

    last_probe_outcome: Optional[dict] = None
    selected_edge: Optional[int] = None
    for candidate_edge in candidate_edges:
        candidate_root = probe_root / f"edge_{candidate_edge}"
        candidate_root.mkdir(parents=True, exist_ok=True)
        candidate_config = _build_probe_config(
            config_data,
            probe_root=candidate_root,
            dataset_root=dataset_root,
            target_edge=candidate_edge,
            probe_steps=probe_steps,
        )
        candidate_config_path = candidate_root / "probe-config.toml"
        with open(candidate_config_path, "w", encoding="utf-8") as file_handle:
            toml.dump(candidate_config, file_handle)

        candidate_log_path = candidate_root / "probe.log"
        log.info("[low-vram-probe] probing target edge %s ...", int(candidate_edge))
        probe_outcome = _run_single_candidate_probe(
            launch_args=launch_args_builder(str(candidate_config_path)),
            customize_env=customize_env,
            cwd=cwd,
            log_path=candidate_log_path,
            total_gpu_memory_mb=int(total_gpu_memory_mb),
            dedicated_limit_ratio=dedicated_limit_ratio,
        )
        last_probe_outcome = probe_outcome

        if probe_outcome["fatal_error"]:
            log.warning(
                "[low-vram-probe] probe aborted at edge %s because the child process failed for a non-memory reason. "
                "Keeping the original resolution. probe_log=%s",
                int(candidate_edge),
                probe_outcome["log_path"],
            )
            return {
                "status": "skipped",
                "message": "probe child failed unexpectedly",
                "probe_root": str(probe_root),
                "log_path": probe_outcome["log_path"],
            }

        if probe_outcome["unsafe_reasons"]:
            log.warning(
                "[low-vram-probe] edge %s rejected: %s | dedicated=%.1f%% (%s) | shared=%s | probe_log=%s",
                int(candidate_edge),
                "；".join(str(item) for item in probe_outcome["unsafe_reasons"]),
                float(probe_outcome["dedicated_ratio"]) * 100.0,
                _format_gib(int(probe_outcome["peak_dedicated_bytes"])),
                _format_gib(int(probe_outcome["peak_shared_bytes"])),
                probe_outcome["log_path"],
            )
            continue

        selected_edge = int(candidate_edge)
        log.info(
            "[low-vram-probe] accepted edge %s | dedicated=%.1f%% (%s) | shared=%s | dominant_process=%s",
            int(candidate_edge),
            float(probe_outcome["dedicated_ratio"]) * 100.0,
            _format_gib(int(probe_outcome["peak_dedicated_bytes"])),
            _format_gib(int(probe_outcome["peak_shared_bytes"])),
            str(probe_outcome["peak_instance_name"] or "n/a"),
        )
        break

    if selected_edge is None:
        fallback_edge = int(candidate_edges[-1]) if candidate_edges else int(current_target_edge)
        if _can_fallback_to_min_edge(last_probe_outcome, dedicated_limit_ratio):
            config_data["sdxl_bucket_target_edge"] = fallback_edge
            log.warning(
                "[low-vram-probe] no fully safe edge was found, but the minimum edge %s stayed within the dedicated VRAM limit. "
                "Windows shared memory telemetry still reached %s, so the run will continue with a best-effort fallback. "
                "Expect slower training and consider disabling preview or lowering batch / rank further. probe_dir=%s",
                int(fallback_edge),
                _format_gib(int(last_probe_outcome.get("peak_shared_bytes", 0) or 0)),
                probe_root,
            )
            return {
                "status": "fallback",
                "message": (
                    f"no fully safe edge found; continuing with minimum edge {fallback_edge} "
                    "because dedicated VRAM remained within threshold"
                ),
                "selected_edge": int(fallback_edge),
                "changed": int(fallback_edge) != int(current_target_edge),
                "probe_root": str(probe_root),
                "log_path": str(last_probe_outcome.get("log_path") or ""),
            }

        failure_message = (
            f"自动分辨率探测未能找到安全边长。即使降到 512 仍会触发共享显存或超过 {dedicated_limit_ratio * 100:.0f}% 专用显存阈值，"
            "建议手动降低原始训练分辨率、batch size 或 rank。"
        )
        if last_probe_outcome is not None and last_probe_outcome.get("log_path"):
            failure_message += f" probe 日志: {last_probe_outcome['log_path']}"
        return {
            "status": "failed",
            "message": failure_message,
            "probe_root": str(probe_root),
        }

    changed = int(selected_edge) != int(current_target_edge)
    config_data["sdxl_bucket_target_edge"] = int(selected_edge)

    if changed:
        log.warning(
            "[low-vram-probe] auto resolution probe reduced target edge: %s -> %s. "
            "The final training run will use the downgraded edge. probe_dir=%s",
            int(current_target_edge),
            int(selected_edge),
            probe_root,
        )
    else:
        log.info(
            "[low-vram-probe] auto resolution probe kept the current target edge at %s. probe_dir=%s",
            int(selected_edge),
            probe_root,
        )

    return {
        "status": "applied",
        "message": f"selected_edge={selected_edge}",
        "selected_edge": int(selected_edge),
        "changed": changed,
        "probe_root": str(probe_root),
    }
