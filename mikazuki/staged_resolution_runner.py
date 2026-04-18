from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import toml

from mikazuki.launch_utils import base_dir_path
from mikazuki.process import (
    apply_windows_accelerate_env,
    build_accelerate_launch_args,
    ensure_repo_on_pythonpath,
)
from mikazuki.utils.resume_guard import check_resume_state_dir_complete
from mikazuki.utils.mixed_resolution import (
    MIXED_RESOLUTION_AUTO_RESUME,
    build_mixed_resolution_summary_text,
    build_phase_run_configs,
    load_config_file,
)

DATASET_DIR_KEYS = ("train_data_dir", "reg_data_dir")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run staged mixed-resolution training phases sequentially.")
    parser.add_argument("--config_file", required=True, help="Base TOML config file")
    parser.add_argument("--trainer_file", required=True, help="Underlying trainer script path")
    parser.add_argument("--num_cpu_threads_per_process", type=int, default=2)
    parser.add_argument("--num_processes", type=int, default=1)
    parser.add_argument("--num_machines", type=int, default=1)
    parser.add_argument("--machine_rank", type=int, default=0)
    parser.add_argument("--main_process_ip", default="")
    parser.add_argument("--main_process_port", type=int, default=29500)
    parser.add_argument("--quiet", action="store_true")
    return parser.parse_args()


def resolve_trainer_path(script_arg: str) -> Path:
    target_path = Path(script_arg)
    if not target_path.is_absolute():
        target_path = base_dir_path() / target_path
    return target_path.resolve()


def resolve_local_path(path_value: str | Path, repo_root: Path) -> Path:
    target_path = Path(path_value)
    if not target_path.is_absolute():
        target_path = repo_root / target_path
    return target_path.resolve()


def safe_int(value: Any, default: int = -1) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def read_state_candidate(state_dir: Path, config: dict[str, Any] | None = None) -> dict[str, Any] | None:
    if not state_dir.exists() or not state_dir.is_dir():
        return None

    complete, reason = check_resume_state_dir_complete(state_dir, config=config)
    if not complete:
        print(
            f"[MixedResolution] Skip incomplete state dir: {state_dir} ({reason}). "
            "This state folder will not be used for staged resume.",
            flush=True,
        )
        return None

    train_state_file = state_dir / "train_state.json"
    state_payload: dict[str, Any] = {}
    if train_state_file.exists():
        try:
            with open(train_state_file, "r", encoding="utf-8") as handle:
                state_payload = json.load(handle)
        except Exception:
            state_payload = {}

    step_num = safe_int(state_payload.get("current_step"), -1)
    epoch_num = safe_int(state_payload.get("current_epoch"), -1)
    plan_id = str(state_payload.get("mixed_resolution_plan_id", "") or "").strip() or None
    phase_index = safe_int(state_payload.get("mixed_resolution_phase_index"), -1)
    target_step = safe_int(state_payload.get("mixed_resolution_phase_target_step"), -1)

    return {
        "path": state_dir,
        "step_num": step_num,
        "epoch_num": epoch_num,
        "plan_id": plan_id,
        "phase_index": phase_index,
        "target_step": target_step,
        "mtime": state_dir.stat().st_mtime,
        "is_last_state": state_dir.name.endswith("-state") and "-step" not in state_dir.name,
    }


def list_state_candidates(config: dict, repo_root: Path) -> list[dict[str, Any]]:
    output_dir_raw = str(config.get("output_dir", "") or "").strip()
    output_name = str(config.get("output_name", "") or "").strip() or "last"
    if not output_dir_raw:
        return []

    output_dir = resolve_local_path(output_dir_raw, repo_root)
    if not output_dir.exists() or not output_dir.is_dir():
        return []

    candidates: list[dict[str, Any]] = []
    for entry in output_dir.iterdir():
        if not entry.is_dir():
            continue
        if not entry.name.endswith("-state"):
            continue
        if entry.name != f"{output_name}-state" and not entry.name.startswith(f"{output_name}-"):
            continue

        candidate = read_state_candidate(entry, config=config)
        if candidate is None:
            continue
        candidates.append(candidate)

    return candidates


def select_latest_state(
    config: dict,
    repo_root: Path,
    *,
    max_step: int | None = None,
    min_step_exclusive: int | None = None,
    plan_id: str | None = None,
) -> dict[str, Any] | None:
    candidates = list_state_candidates(config, repo_root)
    filtered: list[dict[str, Any]] = []
    for candidate in candidates:
        step_num = safe_int(candidate.get("step_num"), -1)
        candidate_plan_id = candidate.get("plan_id")
        if plan_id and candidate_plan_id not in {None, "", plan_id}:
            continue
        if max_step is not None and step_num >= 0 and step_num > max_step:
            continue
        if min_step_exclusive is not None and step_num >= 0 and step_num <= min_step_exclusive:
            continue
        filtered.append(candidate)

    if not filtered:
        if candidates:
            print(
                f"[MixedResolution] Found {len(candidates)} state candidate(s), "
                "but none matched the current staged resume filters.",
                flush=True,
            )
        return None

    filtered.sort(
        key=lambda item: (
            1 if (not plan_id or item.get("plan_id") == plan_id) else 0,
            safe_int(item.get("step_num"), -1),
            safe_int(item.get("epoch_num"), -1),
            safe_int(item.get("target_step"), -1),
            float(item.get("mtime", 0.0)),
            1 if item.get("is_last_state") else 0,
        ),
        reverse=True,
    )
    return filtered[0]


def infer_resume_context(plan, phase_configs: list[dict], repo_root: Path) -> dict[str, Any]:
    phases = list(plan.phases)
    if not phases:
        return {
            "start_pos": 0,
            "completed": False,
            "resume_state_dir": None,
            "resume_step": None,
            "intra_phase_resume": False,
            "ignore_existing_completed_state": False,
        }

    first_phase_config = phase_configs[0]
    explicit_resume_value = str(first_phase_config.get("resume", "") or "").strip()
    explicit_resume = bool(explicit_resume_value and explicit_resume_value != MIXED_RESOLUTION_AUTO_RESUME)

    latest_state = None
    if explicit_resume:
        explicit_resume_path = resolve_local_path(explicit_resume_value, repo_root)
        if explicit_resume_path.exists() and explicit_resume_path.is_dir():
            latest_state = read_state_candidate(explicit_resume_path, config=first_phase_config)

    if latest_state is None:
        latest_state = select_latest_state(
            first_phase_config,
            repo_root,
            max_step=phases[-1].cumulative_steps,
            plan_id=plan.plan_id or None,
        )

    if latest_state is None:
        return {
            "start_pos": 0,
            "completed": False,
            "resume_state_dir": None,
            "resume_step": None,
            "intra_phase_resume": False,
            "ignore_existing_completed_state": False,
        }

    step_num = safe_int(latest_state.get("step_num"), -1)
    if step_num < 0:
        return {
            "start_pos": 0,
            "completed": False,
            "resume_state_dir": str(latest_state["path"]),
            "resume_step": None,
            "intra_phase_resume": True,
            "ignore_existing_completed_state": False,
        }

    previous_target = 0
    start_pos = None
    for index, phase in enumerate(phases):
        if step_num < phase.cumulative_steps:
            start_pos = index
            break
        previous_target = phase.cumulative_steps

    if start_pos is None:
        if explicit_resume:
            return {
                "start_pos": len(phases),
                "completed": True,
                "resume_state_dir": str(latest_state["path"]),
                "resume_step": step_num,
                "intra_phase_resume": False,
                "ignore_existing_completed_state": False,
            }
        return {
            "start_pos": 0,
            "completed": False,
            "resume_state_dir": None,
            "resume_step": step_num,
            "intra_phase_resume": False,
            "ignore_existing_completed_state": True,
        }

    return {
        "start_pos": int(start_pos),
        "completed": False,
        "resume_state_dir": str(latest_state["path"]),
        "resume_step": step_num,
        "intra_phase_resume": bool(step_num > previous_target),
        "ignore_existing_completed_state": False,
    }


def write_phase_config(phase_toml: Path, phase_config: dict) -> None:
    with open(phase_toml, "w", encoding="utf-8") as handle:
        toml.dump(phase_config, handle)


def clear_dataset_npz_cache_by_config(config: dict, repo_root: Path) -> None:
    total_npz_removed = 0
    total_metadata_removed = 0
    for key in DATASET_DIR_KEYS:
        value = str(config.get(key, "") or "").strip()
        if not value:
            continue

        local_dir = resolve_local_path(value, repo_root)
        if not local_dir.exists() or not local_dir.is_dir():
            continue

        removed_npz = 0
        for npz_file in local_dir.rglob("*.npz"):
            try:
                npz_file.unlink()
                removed_npz += 1
            except Exception as exc:
                raise RuntimeError(f"Failed to remove dataset cache {npz_file}: {exc}") from exc

        total_npz_removed += removed_npz
        removed_metadata = 0
        metadata_cache = local_dir / "metadata_cache.json"
        if metadata_cache.exists():
            try:
                metadata_cache.unlink()
                removed_metadata = 1
            except Exception as exc:
                raise RuntimeError(f"Failed to remove dataset cache {metadata_cache}: {exc}") from exc
        total_metadata_removed += removed_metadata
        print(
            f"[MixedResolution] Cache reset for {key}: removed={removed_npz} *.npz file(s), metadata_cache={removed_metadata} under {local_dir}",
            flush=True,
        )

    print(
        f"[MixedResolution] Cache reset finished: total npz removed={total_npz_removed}, total metadata_cache removed={total_metadata_removed}.",
        flush=True,
    )


def print_overall_progress(plan, *, step_num: int | None, epoch_num: int | None, context: str) -> None:
    total_steps = safe_int(getattr(plan.phases[-1], "cumulative_steps", 0), 0) if getattr(plan, "phases", None) else 0
    total_epochs = safe_int(getattr(plan.phases[-1], "cumulative_epochs", 0), 0) if getattr(plan, "phases", None) else 0
    step_value = max(0, safe_int(step_num, 0))
    epoch_value = max(0, safe_int(epoch_num, 0))

    if total_steps > 0:
        percent = min(100.0, max(0.0, (step_value / total_steps) * 100.0))
        step_summary = f"{step_value}/{total_steps} steps"
    else:
        percent = 0.0
        step_summary = f"{step_value} steps"

    if total_epochs > 0:
        epoch_summary = f"{epoch_value}/{total_epochs} epochs"
    else:
        epoch_summary = f"{epoch_value} epochs"

    print(
        f"[MixedResolution] Overall progress ({context}): {percent:.1f}% | {step_summary} | {epoch_summary}",
        flush=True,
    )


def resolve_final_artifact_paths(config: dict, repo_root: Path) -> tuple[Path | None, Path | None]:
    output_dir_raw = str(config.get("output_dir", "") or "").strip()
    if not output_dir_raw:
        return None, None

    output_dir = resolve_local_path(output_dir_raw, repo_root)
    output_name = str(config.get("output_name", "") or "").strip() or "last"
    save_model_as = str(config.get("save_model_as", "") or "").strip().lower() or "safetensors"

    if save_model_as not in {"ckpt", "pt", "safetensors"}:
        save_model_as = "safetensors"

    final_model_path = output_dir / f"{output_name}.{save_model_as}"
    final_state_path = output_dir / f"{output_name}-state"
    return final_model_path, final_state_path


def main() -> int:
    args = parse_args()

    repo_root = base_dir_path()
    base_config_path = Path(args.config_file).resolve()
    trainer_path = resolve_trainer_path(args.trainer_file)
    script_runner = repo_root / "mikazuki" / "script_runner.py"

    if not base_config_path.exists():
        raise SystemExit(f"Base config file not found: {base_config_path}")
    if not trainer_path.exists():
        raise SystemExit(f"Trainer script not found: {trainer_path}")

    base_config = load_config_file(base_config_path)
    if args.num_processes and args.num_processes > 1:
        base_config["num_processes"] = args.num_processes
    training_type = str(base_config.get("model_train_type", "sdxl-lora"))

    plan, phase_configs = build_phase_run_configs(base_config, training_type=training_type)
    if not plan.enabled:
        raise SystemExit("Mixed-resolution training is not enabled in this config.")

    print(build_mixed_resolution_summary_text(plan), flush=True)
    print(
        "[MixedResolution] Note: staged mixed-resolution training launches one trainer subprocess per phase. "
        "Each phase has its own progress bar, so old percentages may remain in the console after phase switches. "
        "Please use the phase start/finish lines and the final completion line as the source of truth.",
        flush=True,
    )

    autosave_dir = repo_root / "config" / "autosave"
    autosave_dir.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    ensure_repo_on_pythonpath(env)
    apply_windows_accelerate_env(env)
    distributed_runtime = {
        "total_num_processes": max(1, int(args.num_processes or 1)),
        "num_machines": max(1, int(args.num_machines or 1)),
        "machine_rank": max(0, int(args.machine_rank or 0)),
        "main_process_ip": str(args.main_process_ip or "").strip(),
        "main_process_port": int(args.main_process_port or 29500),
    }

    resume_ctx = infer_resume_context(plan, phase_configs, repo_root)
    if resume_ctx.get("ignore_existing_completed_state"):
        print(
            "[MixedResolution] Existing staged state already reached the final target. "
            "No explicit resume was provided, so this run will restart from phase 1.",
            flush=True,
        )
    if resume_ctx.get("completed"):
        print(
            "[MixedResolution] Existing resume state already completed all configured phases. Nothing to do.",
            flush=True,
        )
        return 0

    start_pos = safe_int(resume_ctx.get("start_pos"), 0)
    auto_resume_state_dir = None
    previous_phase_resolution = str(plan.phases[start_pos - 1].label if start_pos > 0 else "")

    if resume_ctx.get("resume_state_dir"):
        print(
            f"[MixedResolution] Resume detected: start_phase={start_pos + 1} "
            f"| resume_step={resume_ctx.get('resume_step')} "
            f"| intra_phase_resume={'yes' if resume_ctx.get('intra_phase_resume') else 'no'} "
            f"| resume_state={resume_ctx.get('resume_state_dir')}",
            flush=True,
        )
        print_overall_progress(
            plan,
            step_num=resume_ctx.get("resume_step"),
            epoch_num=None,
            context="resume checkpoint",
        )

    for pos, (phase, phase_config_template) in enumerate(zip(plan.phases, phase_configs)):
        if pos < start_pos:
            continue

        phase_config = dict(phase_config_template)
        phase_resolution = f"{phase.resolution[0]}x{phase.resolution[1]}"
        resume_value = str(phase_config.get("resume", "") or "").strip()
        should_clear_cache = pos > 0 and previous_phase_resolution and previous_phase_resolution != phase_resolution
        if should_clear_cache:
            if pos == start_pos and resume_ctx.get("intra_phase_resume"):
                pass
            else:
                print(
                    f"[MixedResolution] Resolution switched {previous_phase_resolution} -> {phase_resolution}, "
                    "resetting dataset npz cache before this phase.",
                    flush=True,
                )
                clear_dataset_npz_cache_by_config(phase_config, repo_root)

        if pos == start_pos and resume_ctx.get("resume_state_dir"):
            phase_config["resume"] = str(resume_ctx["resume_state_dir"])
        elif resume_value == MIXED_RESOLUTION_AUTO_RESUME:
            if not auto_resume_state_dir:
                print(
                    f"[MixedResolution] Phase {phase.phase_index} cannot determine a previous phase state to resume from.",
                    flush=True,
                )
                return 2
            phase_config["resume"] = str(auto_resume_state_dir)
        elif not resume_value:
            phase_config.pop("resume", None)

        phase_toml = autosave_dir / f"{base_config_path.stem}.mixed-phase-{phase.phase_index:02d}-{phase.resolution[0]}x{phase.resolution[1]}.toml"
        write_phase_config(phase_toml, phase_config)

        phase_resume = str(phase_config.get("resume", "") or "").strip()
        if phase_resume:
            print(
                f"[MixedResolution] Phase {phase.phase_index} runtime config ready: "
                f"toml={phase_toml} | resume={phase_resume}",
                flush=True,
            )
        else:
            print(
                f"[MixedResolution] Phase {phase.phase_index} runtime config ready: "
                f"toml={phase_toml} | resume=<fresh start>",
                flush=True,
            )

        print(
            f"[MixedResolution] Starting phase {phase.phase_index}/{len(plan.phases)}: "
            + (
                f"{phase.label} | batch_global={phase.batch_size_global} | batch_per_device={phase.batch_size_per_device} | "
                if int(plan.world_size or 1) > 1
                else f"{phase.label} | batch={phase.batch_size_global} | "
            )
            + f"steps/epoch={phase.steps_per_epoch} | actual_epoch={phase.actual_epochs} | "
            + f"save_every={phase.save_every_n_epochs or 'disabled'} | "
            + f"sample_every={phase.sample_every_n_epochs or 'disabled'} | "
            + f"target_epoch_end={phase.cumulative_epochs} | target_max_steps={phase.cumulative_steps}",
            flush=True,
        )

        command = build_accelerate_launch_args(
            script_runner,
            trainer_path,
            str(phase_toml),
            args.num_cpu_threads_per_process,
            quiet=args.quiet,
            num_processes=max(1, int(args.num_processes or 1)),
            distributed_runtime=distributed_runtime,
            launch_config=phase_config,
        )

        result = subprocess.run(command, env=env, cwd=repo_root)
        if result.returncode != 0:
            print(
                f"[MixedResolution] Phase {phase.phase_index} failed with exit code {result.returncode}. "
                f"toml={phase_toml} | trainer={trainer_path}",
                flush=True,
            )
            return result.returncode

        previous_phase_resolution = phase_resolution

        if pos >= len(plan.phases) - 1:
            print(
                f"[MixedResolution] Phase {phase.phase_index} finished (last phase). "
                "Any older percentage bar left on screen can be ignored.",
                flush=True,
            )
            continue

        latest_state = select_latest_state(
            phase_config,
            repo_root,
            max_step=phase.cumulative_steps,
            min_step_exclusive=phase.start_step if phase.start_step > 0 else None,
            plan_id=plan.plan_id or None,
        )
        if latest_state is None:
            print(
                f"[MixedResolution] Phase {phase.phase_index} finished but no usable state directory was found for the next phase.",
                flush=True,
            )
            return 2

        auto_resume_state_dir = str(latest_state["path"])
        print_overall_progress(
            plan,
            step_num=latest_state.get("step_num"),
            epoch_num=latest_state.get("epoch_num"),
            context=f"after phase {phase.phase_index}",
        )
        print(
            f"[MixedResolution] Phase {phase.phase_index} finished. "
            f"Next phase will resume from {auto_resume_state_dir} "
            f"(step={latest_state.get('step_num')}, epoch={latest_state.get('epoch_num')}, "
            f"phase_index={latest_state.get('phase_index')}).",
            flush=True,
        )

    print_overall_progress(
        plan,
        step_num=plan.phases[-1].cumulative_steps if plan.phases else 0,
        epoch_num=plan.phases[-1].cumulative_epochs if plan.phases else 0,
        context="final",
    )
    final_model_path, final_state_path = resolve_final_artifact_paths(base_config, repo_root)
    if final_model_path is not None:
        print(
            f"[MixedResolution] Final model path: {final_model_path}",
            flush=True,
        )
    if final_state_path is not None:
        print(
            f"[MixedResolution] Final state path: {final_state_path}",
            flush=True,
        )
    print("[MixedResolution] All phases completed successfully.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
