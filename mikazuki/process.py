
import asyncio
import os
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import toml

from mikazuki.app.models import APIResponse
from mikazuki.launch_utils import base_dir_path
from mikazuki.log import log
from mikazuki.tasks import tm
from mikazuki.utils.batch_semantics import resolve_per_device_batch_from_global
from mikazuki.utils.distributed_sync import resolve_trainer_file_from_runtime_config
from mikazuki.utils.training_process_runtime import (
    apply_training_device_visibility,
    apply_training_process_sync_guards,
    resolve_mesh_network_interface,
    resolve_training_process_runtime,
)
from mikazuki.utils.resume_guard import validate_resume_launch_guard
from mikazuki.utils.sdxl_low_vram_probe import maybe_run_sdxl_low_vram_auto_resolution_probe
from mikazuki.utils.tensorboard_runs import (
    apply_tensorboard_runtime_config,
    cleanup_tensorboard_records_without_checkpoint,
    has_new_checkpoint_since,
    snapshot_tensorboard_event_files,
)
from mikazuki.utils.trainer_registry import get_trainer_definition_by_file
from mikazuki.utils.nvidia_smi import apply_gpu_power_limit, restore_gpu_power_limits


def ensure_repo_on_pythonpath(customize_env: dict):
    repo_root = str(base_dir_path())
    existing = customize_env.get("PYTHONPATH", "")
    parts = [part for part in existing.split(os.pathsep) if part]
    if repo_root not in parts:
        customize_env["PYTHONPATH"] = os.pathsep.join([repo_root, *parts]) if parts else repo_root


def prepare_python_script(script_path, environ=None):
    resolved_path = Path(script_path)
    if not resolved_path.is_absolute():
        resolved_path = base_dir_path() / resolved_path
    resolved_path = resolved_path.resolve()

    customize_env = (environ or os.environ).copy()
    ensure_repo_on_pythonpath(customize_env)
    return resolved_path, customize_env


def get_script_runner_path():
    return base_dir_path() / "mikazuki" / "script_runner.py"


def apply_windows_accelerate_env(customize_env: dict):
    if sys.platform == "win32":
        # Some Windows PyTorch wheels ship without libuv-enabled TCPStore support.
        customize_env["USE_LIBUV"] = "0"


def _flag_enabled(value, *, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


PYTORCH_ALLOC_CONF_ENV = "PYTORCH_ALLOC_CONF"
PYTORCH_CUDA_ALLOC_CONF_ENV = "PYTORCH_CUDA_ALLOC_CONF"


def merge_pytorch_cuda_alloc_conf(existing_conf: str, *, expandable_segments_enabled: bool) -> str:
    passthrough_tokens: list[str] = []
    keyed_tokens: dict[str, str] = {}

    for raw_part in str(existing_conf or "").split(","):
        part = raw_part.strip()
        if not part:
            continue
        if ":" in part:
            key, value = part.split(":", 1)
            key = key.strip()
            value = value.strip()
            if key:
                keyed_tokens[key] = value
                continue
        passthrough_tokens.append(part)

    keyed_tokens["expandable_segments"] = "True" if expandable_segments_enabled else "False"
    rendered_tokens = [*passthrough_tokens, *(f"{key}:{value}" for key, value in keyed_tokens.items())]
    return ",".join(rendered_tokens)


def apply_training_memory_allocator_env(customize_env: dict, config_data: dict) -> None:
    expandable_segments_enabled = _flag_enabled(
        config_data.get("pytorch_cuda_expandable_segments"),
        default=True,
    )
    existing_conf = customize_env.get(PYTORCH_ALLOC_CONF_ENV) or customize_env.get(PYTORCH_CUDA_ALLOC_CONF_ENV, "")
    merged_conf = merge_pytorch_cuda_alloc_conf(
        existing_conf,
        expandable_segments_enabled=expandable_segments_enabled,
    )
    customize_env[PYTORCH_ALLOC_CONF_ENV] = merged_conf
    customize_env.pop(PYTORCH_CUDA_ALLOC_CONF_ENV, None)

    if expandable_segments_enabled:
        log.info(
            "[memory] enabled PyTorch CUDA expandable_segments to reduce fragmentation-related OOM. "
            f"{PYTORCH_ALLOC_CONF_ENV}={merged_conf}"
        )
    else:
        log.info(
            "[memory] PyTorch CUDA expandable_segments disabled by training config. "
            f"{PYTORCH_ALLOC_CONF_ENV}={merged_conf}"
        )


def ensure_main_distributed_autosave(toml_path: str, distributed_runtime: Optional[dict]) -> tuple[bool, str]:
    runtime = distributed_runtime if isinstance(distributed_runtime, dict) else {}
    if not runtime.get("is_multi_machine") or int(runtime.get("machine_rank", 0) or 0) != 0:
        return True, ""

    src = Path(toml_path)
    if not src.exists():
        return False, f"主节点分布式 autosave 源文件不存在: {src}"

    autosave_dir = base_dir_path() / "config" / "autosave"
    autosave_dir.mkdir(parents=True, exist_ok=True)
    latest_file = autosave_dir / "distributed-main-latest.toml"
    timestamp_file = autosave_dir / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-distributed-main.toml"

    try:
        shutil.copy2(src, latest_file)
        shutil.copy2(src, timestamp_file)
    except Exception as exc:
        return False, f"主节点分布式 autosave 写入失败: {exc}"

    log.info(f"[distributed] main autosave updated: {latest_file}")
    log.info(f"[distributed] main autosave snapshot: {timestamp_file}")
    return True, ""


def build_accelerate_launch_args(
    script_runner: Path,
    trainer_path: Path,
    toml_path: str,
    cpu_threads: int,
    *,
    quiet: bool = True,
    num_processes: int = 1,
    distributed_runtime: Optional[dict] = None,
    trainer_cli_args: Optional[list[str]] = None,
):
    runtime = distributed_runtime if isinstance(distributed_runtime, dict) else {}
    total_num_processes = int(runtime.get("total_num_processes", num_processes) or num_processes or 1)
    num_machines = int(runtime.get("num_machines", 1) or 1)
    machine_rank = int(runtime.get("machine_rank", 0) or 0)
    main_process_ip = str(runtime.get("main_process_ip", "") or "").strip()
    main_process_port = int(runtime.get("main_process_port", 29500) or 29500)

    args = [
        sys.executable,
        "-m",
        "accelerate.commands.launch",
        "--num_cpu_threads_per_process",
        str(cpu_threads),
    ]

    if total_num_processes > 1 or num_machines > 1:
        args.extend(["--multi_gpu", "--num_processes", str(total_num_processes)])
        if num_machines > 1:
            args.extend(
                [
                    "--num_machines",
                    str(num_machines),
                    "--machine_rank",
                    str(machine_rank),
                    "--main_process_ip",
                    str(main_process_ip),
                    "--main_process_port",
                    str(main_process_port),
                ]
            )
        if sys.platform == "win32":
            args.extend(["--rdzv_backend", "c10d"])

    if quiet:
        args.append("--quiet")

    args.extend(
        [
            str(script_runner),
            str(trainer_path),
            "--config_file",
            toml_path,
        ]
    )
    if trainer_cli_args:
        args.extend([str(arg) for arg in trainer_cli_args if str(arg).strip() != ""])
    return args


def build_staged_resolution_runner_args(
    runner_path: Path,
    trainer_path: Path,
    toml_path: str,
    cpu_threads: int,
    *,
    quiet: bool = True,
    num_processes: int = 1,
    distributed_runtime: Optional[dict] = None,
):
    runtime = distributed_runtime if isinstance(distributed_runtime, dict) else {}
    total_num_processes = int(runtime.get("total_num_processes", num_processes) or num_processes or 1)
    num_machines = int(runtime.get("num_machines", 1) or 1)
    machine_rank = int(runtime.get("machine_rank", 0) or 0)
    main_process_ip = str(runtime.get("main_process_ip", "") or "").strip()
    main_process_port = int(runtime.get("main_process_port", 29500) or 29500)

    args = [
        sys.executable,
        str(runner_path),
        "--config_file",
        toml_path,
        "--trainer_file",
        str(trainer_path),
        "--num_cpu_threads_per_process",
        str(cpu_threads),
        "--num_processes",
        str(total_num_processes),
        "--num_machines",
        str(num_machines),
        "--machine_rank",
        str(machine_rank),
        "--main_process_ip",
        str(main_process_ip),
        "--main_process_port",
        str(main_process_port),
    ]
    if quiet:
        args.append("--quiet")
    return args


def run_train(
    toml_path: str,
    trainer_file: str = "./scripts/train_network.py",
    gpu_ids: Optional[list] = None,
    cpu_threads: Optional[int] = 2,
):
    log.info(f"Training started with config file / 训练开始，使用配置文件: {toml_path}")
    customize_env = os.environ.copy()
    trainer_definition = get_trainer_definition_by_file(trainer_file)
    direct_python_trainer = bool(trainer_definition and trainer_definition.direct_python)

    try:
        config_data = toml.load(toml_path)
    except Exception:
        config_data = {}

    customize_env["ACCELERATE_DISABLE_RICH"] = "1"
    customize_env["PYTHONUNBUFFERED"] = "1"
    customize_env["PYTHONWARNINGS"] = "ignore::FutureWarning,ignore::UserWarning"
    ensure_repo_on_pythonpath(customize_env)
    apply_windows_accelerate_env(customize_env)
    apply_training_memory_allocator_env(customize_env, config_data)

    direct_launch_summary = (
        trainer_definition.direct_launch_summary
        if trainer_definition and trainer_definition.direct_launch_summary
        else "当前训练直接由独立 Python 训练器启动，不走 accelerate 分布式包装。"
    )
    distributed_runtime, worker_sync_runtime, runtime_error = resolve_training_process_runtime(
        config_data,
        gpu_ids,
        direct_python_trainer=direct_python_trainer,
        direct_launch_summary=direct_launch_summary,
        customize_env=customize_env,
    )
    if runtime_error is not None:
        return runtime_error

    config_data, sync_error = apply_training_process_sync_guards(toml_path, config_data, worker_sync_runtime)
    if sync_error is not None:
        return sync_error

    guard_ok, guard_message = validate_resume_launch_guard(config_data, base_dir_path())
    if not guard_ok:
        log.warning(f"[resume-guard] {guard_message}")
        return APIResponse(status="error", message=guard_message)

    tensorboard_runtime = apply_tensorboard_runtime_config(config_data, base_dir_path())
    tensorboard_run_dir = tensorboard_runtime.get("run_dir") if tensorboard_runtime.get("enabled") else None
    tensorboard_run_dir_existed_before = bool(tensorboard_run_dir and Path(tensorboard_run_dir).exists())
    tensorboard_event_snapshot = snapshot_tensorboard_event_files(tensorboard_run_dir)
    if tensorboard_runtime.get("changed"):
        with open(toml_path, "w", encoding="utf-8") as f:
            toml.dump(config_data, f)
        config_data = toml.load(toml_path)
    if tensorboard_runtime.get("enabled"):
        log.info(
            f"[tensorboard] resolved run dir: {tensorboard_run_dir} "
            f"(resume_merge={'yes' if tensorboard_runtime.get('resume_merge') else 'no'}, "
            f"from_state={'yes' if tensorboard_runtime.get('reused_from_state') else 'no'})"
        )

    autosave_ok, autosave_message = ensure_main_distributed_autosave(toml_path, distributed_runtime)
    if not autosave_ok:
        log.warning(f"[distributed] {autosave_message}")
        return APIResponse(status="error", message=autosave_message)

    resolved_trainer_file = resolve_trainer_file_from_runtime_config(config_data, trainer_file)
    if resolved_trainer_file != trainer_file:
        log.info(f"[distributed-sync] trainer file updated from synced config: {trainer_file} -> {resolved_trainer_file}")
    trainer_path, _ = prepare_python_script(resolved_trainer_file, customize_env)
    trainer_definition = get_trainer_definition_by_file(str(trainer_path))
    direct_python_trainer = bool(trainer_definition and trainer_definition.direct_python)

    world_size_for_batch = max(1, int(distributed_runtime.get("total_num_processes", 1) or 1))
    launch_train_batch_override = None
    if not direct_python_trainer:
        try:
            configured_global_batch = int(config_data.get("train_batch_size", 1) or 1)
        except (TypeError, ValueError):
            configured_global_batch = 0
        ok_batch, per_device_batch, batch_error = resolve_per_device_batch_from_global(
            configured_global_batch, world_size_for_batch
        )
        if not ok_batch:
            return APIResponse(status="error", message=f"训练批大小配置错误: {batch_error}")
        launch_train_batch_override = int(per_device_batch)

        try:
            grad_accum_steps = int(config_data.get("gradient_accumulation_steps", 1) or 1)
        except (TypeError, ValueError):
            grad_accum_steps = 1
        if grad_accum_steps <= 0:
            grad_accum_steps = 1
        world_effective_batch = int(configured_global_batch) * int(grad_accum_steps)
        if world_size_for_batch > 1:
            log.info(
                "[batch-semantics] user_global_batch=%s world_size=%s per_device_batch=%s grad_accum=%s world_effective_batch=%s",
                int(configured_global_batch),
                int(world_size_for_batch),
                int(per_device_batch),
                int(grad_accum_steps),
                int(world_effective_batch),
            )

    apply_training_device_visibility(customize_env, gpu_ids)

    def build_launch_args_for_toml(active_toml_path: str) -> list[str]:
        if direct_python_trainer:
            script_runner = get_script_runner_path()
            resolved_args = [
                sys.executable,
                str(script_runner),
                str(trainer_path),
                "--config_file",
                active_toml_path,
            ]
            if trainer_definition and trainer_definition.direct_cli_args:
                resolved_args.extend(list(trainer_definition.direct_cli_args))
            return resolved_args

        if bool(config_data.get("enable_mixed_resolution_training")):
            runner_path = base_dir_path() / "mikazuki" / "staged_resolution_runner.py"
            return build_staged_resolution_runner_args(
                runner_path,
                trainer_path,
                active_toml_path,
                int(cpu_threads),
                quiet=True,
                num_processes=int(distributed_runtime.get("total_num_processes", 1) or 1),
                distributed_runtime=distributed_runtime,
            )

        script_runner = get_script_runner_path()
        return build_accelerate_launch_args(
            script_runner,
            trainer_path,
            active_toml_path,
            int(cpu_threads),
            quiet=True,
            num_processes=int(distributed_runtime.get("total_num_processes", 1) or 1),
            distributed_runtime=distributed_runtime,
            trainer_cli_args=["--train_batch_size", str(int(launch_train_batch_override))],
        )

    low_vram_probe_result = maybe_run_sdxl_low_vram_auto_resolution_probe(
        config_data=config_data,
        customize_env=customize_env,
        cwd=base_dir_path(),
        gpu_ids=gpu_ids,
        distributed_runtime=distributed_runtime,
        launch_args_builder=build_launch_args_for_toml,
    )
    if low_vram_probe_result.get("status") == "failed":
        log.error(f"[low-vram-probe] {str(low_vram_probe_result.get('message') or 'SDXL low-VRAM auto probe failed')}")
        return APIResponse(
            status="error",
            message=str(low_vram_probe_result.get("message") or "SDXL low-VRAM auto probe failed"),
        )
    if low_vram_probe_result.get("changed"):
        with open(toml_path, "w", encoding="utf-8") as f:
            toml.dump(config_data, f)

    args = build_launch_args_for_toml(toml_path)

    resolve_mesh_network_interface(customize_env, distributed_runtime)

    if not (task := tm.create_task(args, customize_env, cwd=base_dir_path())):
        return APIResponse(status="error", message="Failed to create task / 无法创建训练任务")

    def _run():
        power_limit_restore_state = []
        try:
            requested_gpu_power_limit_w = config_data.get("gpu_power_limit_w")
            try:
                requested_gpu_power_limit_w = int(round(float(requested_gpu_power_limit_w)))
            except (TypeError, ValueError):
                requested_gpu_power_limit_w = 0

            if requested_gpu_power_limit_w > 0:
                power_limit_result = apply_gpu_power_limit(
                    requested_gpu_power_limit_w,
                    target_ids=gpu_ids,
                    environ=customize_env,
                )
                for warning in power_limit_result.get("warnings", []):
                    log.warning(f"[power-limit] {warning}")
                power_limit_restore_state = power_limit_result.get("restore_state", []) or []
                if power_limit_result.get("applied"):
                    applied_records = power_limit_result.get("records", []) or []
                    applied_summary = ", ".join(
                        [f"GPU {item['gpu_id']}={item['applied_power_limit_w']}W" for item in applied_records]
                    )
                    log.info(f"[power-limit] applied whole-GPU power limit: {applied_summary}")

            run_started_at = time.time()
            task.execute()
            result = task.communicate()
            checkpoint_generated = has_new_checkpoint_since(config_data, base_dir_path(), run_started_at)
            if tensorboard_run_dir is not None and not checkpoint_generated:
                cleanup_tensorboard_records_without_checkpoint(
                    tensorboard_run_dir,
                    tensorboard_run_dir_existed_before,
                    tensorboard_event_snapshot,
                )
                log.info(f"[tensorboard] cleaned run dir without checkpoint: {tensorboard_run_dir}")
            elif tensorboard_run_dir is not None:
                log.info(f"[tensorboard] checkpoint detected, keep run dir: {tensorboard_run_dir}")
            if result.returncode != 0:
                log.error("Training failed / 训练失败")
            else:
                log.info("Training finished / 训练完成")
        except Exception as exc:
            log.error(f"An error occurred when training / 训练出现致命错误: {exc}")
        finally:
            if power_limit_restore_state:
                restore_result = restore_gpu_power_limits(power_limit_restore_state)
                restored_records = restore_result.get("restored", []) or []
                if restored_records:
                    restored_summary = ", ".join(
                        [f"GPU {item['gpu_id']}={item['power_limit_w']}W" for item in restored_records]
                    )
                    log.info(f"[power-limit] restored GPU power limit: {restored_summary}")
                for warning in restore_result.get("warnings", []):
                    log.warning(f"[power-limit] {warning}")

    coro = asyncio.to_thread(_run)
    asyncio.create_task(coro)

    return APIResponse(
        status="success",
        message=f"Training started / 训练开始 ID: {task.task_id}",
        data={
            "task_id": task.task_id,
            "tensorboard_run_dir": str(tensorboard_run_dir) if tensorboard_run_dir is not None else "",
            "tensorboard_resume_merge": bool(tensorboard_runtime.get("resume_merge")),
            "tensorboard_reused_from_state": bool(tensorboard_runtime.get("reused_from_state")),
            "distributed_summary": str(distributed_runtime.get("summary", "") or ""),
            "distributed_active": bool(int(distributed_runtime.get("total_num_processes", 1) or 1) > 1),
            "distributed_is_multi_machine": bool(distributed_runtime.get("is_multi_machine")),
            "sdxl_low_vram_probe": low_vram_probe_result,
        },
    )
