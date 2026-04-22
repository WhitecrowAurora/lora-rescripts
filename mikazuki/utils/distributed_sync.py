from __future__ import annotations

import shlex
import shutil
import subprocess
import tempfile
import re
from pathlib import Path, PurePosixPath
from typing import Callable, Optional

import toml

from mikazuki.log import log
from mikazuki.utils.distributed import parse_boolish, safe_int
from mikazuki.utils.resume_guard import resolve_local_path
from mikazuki.utils.trainer_registry import resolve_trainer_file_for_training_type

LEGACY_DEFAULT_SYNC_CONFIG_KEYS = (
    "train_batch_size,gradient_accumulation_steps,max_train_epochs,"
    "learning_rate,unet_lr,text_encoder_lr,resolution,optimizer_type,"
    "network_dim,network_alpha,save_every_n_epochs,save_model_as,mixed_precision,"
    "staged_resolution_ratio_512,staged_resolution_ratio_768,staged_resolution_ratio_1024,"
    "staged_resolution_ratio_2048_base_1024,staged_resolution_ratio_2048_base_1536,staged_resolution_ratio_2048_base_2048"
)
LEGACY_DEFAULT_SYNC_CONFIG_KEYS_OLD = (
    "train_batch_size,gradient_accumulation_steps,max_train_epochs,"
    "learning_rate,unet_lr,text_encoder_lr,resolution,optimizer_type,"
    "network_dim,network_alpha,save_every_n_epochs,save_model_as,mixed_precision,"
    "staged_resolution_ratio_512,staged_resolution_ratio_768,staged_resolution_ratio_1024"
)
DEFAULT_SYNC_CONFIG_KEYS = "*"
DEFAULT_SYNC_ASSET_KEYS = "pretrained_model_name_or_path,train_data_dir,reg_data_dir,vae,resume"
DATASET_DIR_KEYS = ("train_data_dir", "reg_data_dir")
WORKER_REQUIRED_SYNC_CONFIG_KEYS = (
    "model_train_type",
    "v2",
    "lr_scheduler_num_cycles",
    "clip_skip",
)
WORKER_SYNC_CONFIG_FALLBACK_WHEN_MAIN_MISSING = {
    "v2": False,
    "lr_scheduler_num_cycles": 1,
}
WORKER_SYNC_CONFIG_CLEAR_WHEN_MAIN_MISSING = ("clip_skip",)
WORKER_REQUIRED_SYNC_ASSET_KEYS = ("resume",)
PROTECTED_SYNC_CONFIG_KEYS = {
    "enable_distributed_training",
    "num_processes",
    "num_machines",
    "machine_rank",
    "main_process_ip",
    "main_process_port",
    "nccl_socket_ifname",
    "gloo_socket_ifname",
    "sync_config_from_main",
    "sync_config_keys_from_main",
    "sync_missing_assets_from_main",
    "sync_asset_keys",
    "sync_main_repo_dir",
    "sync_main_toml",
    "sync_ssh_user",
    "sync_ssh_port",
    "sync_use_password_auth",
    "sync_ssh_password",
    "clear_dataset_npz_before_train",
}
WORKER_OUTPUT_MARKER = "THIS_IS_WORKER_NODE_CHECK_MAIN_OUTPUTS"
MODEL_TRAIN_TYPE_TO_TRAINER_FILE = {
    "sd-lora": "./scripts/stable/train_network.py",
    "sdxl-lora": "./scripts/stable/sdxl_train_network.py",
    "yolo": "./scripts/stable/yolo_train.py",
    "aesthetic-scorer": "./scripts/stable/aesthetic_scorer_train.py",
    "sd-dreambooth": "./scripts/stable/train_db.py",
    "sdxl-finetune": "./scripts/stable/sdxl_train.py",
    "sd-controlnet": "./scripts/stable/train_control_net.py",
    "sdxl-controlnet": "./scripts/stable/sdxl_train_control_net.py",
    "sdxl-controlnet-lllite": "./scripts/stable/sdxl_train_control_net_lllite.py",
    "flux-controlnet": "./scripts/stable/flux_train_control_net.py",
    "sd-textual-inversion": "./scripts/stable/train_textual_inversion.py",
    "sd-textual-inversion-xti": "./scripts/stable/train_textual_inversion_XTI.py",
    "sdxl-textual-inversion": "./scripts/stable/sdxl_train_textual_inversion.py",
    "sd3-lora": "./scripts/dev/sd3_train_network.py",
    "sd3-finetune": "./scripts/stable/sd3_train.py",
    "flux-lora": "./scripts/dev/flux_train_network.py",
    "flux-finetune": "./scripts/dev/flux_train.py",
    "lumina-lora": "./scripts/stable/lumina_train_network.py",
    "lumina-finetune": "./scripts/stable/lumina_train.py",
    "hunyuan-image-lora": "./scripts/stable/hunyuan_image_train_network.py",
    "anima-lora": "./scripts/stable/anima_train_network.py",
    "anima-finetune": "./scripts/stable/anima_train.py",
}


def parse_csv(value, default_csv: str) -> list[str]:
    raw = str(value if value is not None else default_csv)
    return [item.strip() for item in raw.split(",") if item.strip()]


def parse_sync_config_keys(value) -> list[str]:
    keys = parse_csv(value, DEFAULT_SYNC_CONFIG_KEYS)
    lowered = {key.strip().lower() for key in keys}
    if any(key in {"*", "__all__", "all"} for key in lowered):
        return ["*"]

    key_set = {key.strip().lower() for key in keys}
    legacy_sets = [
        {item.strip().lower() for item in LEGACY_DEFAULT_SYNC_CONFIG_KEYS.split(",")},
        {item.strip().lower() for item in LEGACY_DEFAULT_SYNC_CONFIG_KEYS_OLD.split(",")},
    ]
    if any(key_set == legacy for legacy in legacy_sets):
        log.info("[distributed-sync] detected legacy sync key list, upgrading to full sync mode")
        return ["*"]

    return keys


def resolve_trainer_file_from_runtime_config(runtime_train_config: dict, fallback_trainer_file: str) -> str:
    if not isinstance(runtime_train_config, dict):
        return fallback_trainer_file

    model_train_type = str(runtime_train_config.get("model_train_type", "") or "").strip().lower()
    if not model_train_type:
        return fallback_trainer_file

    resolved = MODEL_TRAIN_TYPE_TO_TRAINER_FILE.get(model_train_type, fallback_trainer_file)
    return resolve_trainer_file_for_training_type(model_train_type, resolved)


def count_dataset_files_without_npz(path: Path, *, missing_value: int, not_dir_value: int) -> int:
    if not path.exists():
        return missing_value
    if not path.is_dir():
        return not_dir_value

    count = 0
    for candidate in path.rglob("*"):
        if not candidate.is_file():
            continue
        if ".mikazuki-cache" in {part.lower() for part in candidate.parts}:
            continue
        if candidate.suffix.lower() != ".npz":
            count += 1
    return count


def resolve_worker_sync_runtime(config: dict, distributed_runtime: dict, repo_root: Path) -> dict:
    config = config if isinstance(config, dict) else {}
    runtime = distributed_runtime if isinstance(distributed_runtime, dict) else {}

    is_worker = bool(runtime.get("is_multi_machine")) and int(runtime.get("machine_rank", 0) or 0) > 0
    if not is_worker:
        return {
            "enabled": False,
            "is_worker": False,
            "warnings": [],
            "notes": [],
        }

    sync_config_from_main = parse_boolish(config.get("sync_config_from_main", True))
    sync_missing_assets_from_main = parse_boolish(config.get("sync_missing_assets_from_main", True))
    sync_config_keys = parse_sync_config_keys(config.get("sync_config_keys_from_main"))
    sync_asset_keys = parse_csv(config.get("sync_asset_keys"), DEFAULT_SYNC_ASSET_KEYS)

    seen_asset_keys = {item.strip().lower() for item in sync_asset_keys}
    for required_key in WORKER_REQUIRED_SYNC_ASSET_KEYS:
        if required_key.lower() not in seen_asset_keys:
            sync_asset_keys.append(required_key)
            seen_asset_keys.add(required_key.lower())

    sync_main_repo_dir_raw = str(config.get("sync_main_repo_dir", str(repo_root)) or str(repo_root)).strip() or str(repo_root)
    sync_main_toml = str(
        config.get("sync_main_toml", "./config/autosave/distributed-main-latest.toml")
        or "./config/autosave/distributed-main-latest.toml"
    ).strip()
    sync_ssh_user = str(config.get("sync_ssh_user", "") or "").strip()
    sync_ssh_port = safe_int(config.get("sync_ssh_port", 22), 22)
    sync_use_password_auth = parse_boolish(config.get("sync_use_password_auth", False))
    sync_ssh_password = str(config.get("sync_ssh_password", "") or "").strip()
    clear_dataset_npz_before_train = parse_boolish(config.get("clear_dataset_npz_before_train", False))

    shared_main_repo_root = None
    try:
        candidate_shared_root = resolve_local_path(sync_main_repo_dir_raw, repo_root)
        if candidate_shared_root.exists() and candidate_shared_root.is_dir():
            shared_main_repo_root = candidate_shared_root
    except Exception:
        shared_main_repo_root = None

    remote_host = ""
    main_process_ip = str(runtime.get("main_process_ip", "") or "").strip()
    if not shared_main_repo_root and main_process_ip:
        remote_host = f"{sync_ssh_user}@{main_process_ip}" if sync_ssh_user else main_process_ip

    notes: list[str] = []
    warnings: list[str] = []
    if shared_main_repo_root is not None:
        notes.append(f"Worker sync will read from shared main repo path: {shared_main_repo_root}")
    elif sync_config_from_main or sync_missing_assets_from_main:
        notes.append(f"Worker sync will use remote host {remote_host or '<missing-host>'} for config/assets.")
        warnings.append(
            "Remote sync mode is best-effort in this minimal build. On Windows multi-machine setups, a shared main repo path is recommended."
        )
    if sync_config_from_main:
        notes.append("Worker sync will align the local training TOML with the main node before launch.")
    if sync_missing_assets_from_main:
        notes.append("Worker sync will compare dataset/resource availability and pull missing assets from the main node when needed.")
    if clear_dataset_npz_before_train:
        notes.append(
            "clear_dataset_npz_before_train is enabled, so worker dataset latent caches (.safetensors / .npz) "
            "and metadata_cache.json will be cleared before launch."
        )

    if (sync_config_from_main or sync_missing_assets_from_main) and shared_main_repo_root is None:
        if not remote_host:
            raise ValueError("Worker sync is enabled, but no shared main repo path or remote host is available.")
        if shutil.which("ssh") is None:
            raise ValueError("Worker sync needs `ssh` when shared main repo path is unavailable, but `ssh` was not found.")
        if shutil.which("scp") is None:
            raise ValueError("Worker sync needs `scp` when shared main repo path is unavailable, but `scp` was not found.")
        if sync_use_password_auth and not sync_ssh_password:
            raise ValueError(
                "Password auth for worker sync is enabled, but sync_ssh_password is empty. "
                "Please provide a password or disable password auth."
            )
        if sync_use_password_auth and shutil.which("sshpass") is None:
            raise ValueError(
                "Password auth for worker sync requires `sshpass`, but it was not found. "
                "Please install sshpass or use key-based auth / shared path mode."
            )

    return {
        "enabled": bool(sync_config_from_main or sync_missing_assets_from_main),
        "is_worker": True,
        "shared_main_repo_root": shared_main_repo_root,
        "remote_host": remote_host,
        "sync_main_repo_dir": sync_main_repo_dir_raw,
        "sync_main_toml": sync_main_toml,
        "sync_config_from_main": sync_config_from_main,
        "sync_config_keys": sync_config_keys,
        "sync_missing_assets_from_main": sync_missing_assets_from_main,
        "sync_asset_keys": sync_asset_keys,
        "sync_ssh_port": sync_ssh_port,
        "sync_use_password_auth": sync_use_password_auth,
        "sync_ssh_password": sync_ssh_password,
        "clear_dataset_npz_before_train": clear_dataset_npz_before_train,
        "warnings": warnings,
        "notes": notes,
    }


def apply_worker_sync_from_main(toml_path: str, sync_runtime: dict, repo_root: Path) -> tuple[bool, str]:
    if not sync_runtime.get("is_worker"):
        return True, ""

    if sync_runtime.get("sync_config_from_main"):
        ok, message = sync_config_from_main(toml_path, sync_runtime, repo_root)
        if not ok:
            return False, message

    if sync_runtime.get("sync_missing_assets_from_main"):
        ok, message = sync_missing_assets_from_main(toml_path, sync_runtime, repo_root)
        if not ok:
            return False, message

    if sync_runtime.get("enabled"):
        ok, message = sync_datasets_when_count_mismatch_from_main(toml_path, sync_runtime, repo_root)
        if not ok:
            return False, message

    if sync_runtime.get("clear_dataset_npz_before_train"):
        ok, message = clear_dataset_npz_cache(toml_path, repo_root)
        if not ok:
            return False, message

    ok, message = enforce_distributed_output_policy(toml_path, sync_runtime, repo_root)
    if not ok:
        return False, message

    return True, ""


def sync_config_from_main(toml_path: str, sync_runtime: dict, repo_root: Path) -> tuple[bool, str]:
    try:
        local_config = toml.load(toml_path)
    except Exception as exc:
        return False, f"Failed to read local training config: {toml_path} ({exc})"

    main_config, source_label, error_message = load_main_config_for_sync(toml_path, sync_runtime, repo_root)
    if main_config is None:
        return False, error_message

    log.info(f"[distributed-sync] using main config source: {source_label}")

    sync_keys = list(sync_runtime.get("sync_config_keys") or ["*"])
    sync_all = any(str(key).strip().lower() in {"*", "__all__", "all"} for key in sync_keys)
    keys_to_sync = list(main_config.keys()) if sync_all else sync_keys
    if sync_all:
        log.info(f"[distributed-sync] full config sync enabled: syncing all {len(keys_to_sync)} top-level keys")
    else:
        seen_keys = {str(key).strip().lower() for key in keys_to_sync}
        for required_key in WORKER_REQUIRED_SYNC_CONFIG_KEYS:
            if required_key.lower() in seen_keys:
                continue
            if required_key not in main_config:
                continue
            keys_to_sync.append(required_key)
            seen_keys.add(required_key.lower())

    changed = 0
    for key in keys_to_sync:
        normalized_key = str(key).strip()
        if normalized_key.lower() in PROTECTED_SYNC_CONFIG_KEYS:
            continue
        if normalized_key not in main_config:
            log.warning(f"[distributed-sync] main config does not contain key: {normalized_key}")
            continue
        old_value = local_config.get(normalized_key)
        new_value = main_config.get(normalized_key)
        if old_value != new_value:
            local_config[normalized_key] = new_value
            changed += 1
            log.info(f"[distributed-sync] config {normalized_key}: {old_value} -> {new_value}")

    for key, fallback in WORKER_SYNC_CONFIG_FALLBACK_WHEN_MAIN_MISSING.items():
        if key.lower() in PROTECTED_SYNC_CONFIG_KEYS:
            continue
        if key in main_config or key not in local_config:
            continue
        old_value = local_config.get(key)
        if old_value != fallback:
            local_config[key] = fallback
            changed += 1
            log.info(f"[distributed-sync] config {key}: main missing, fallback {old_value} -> {fallback}")

    for key in WORKER_SYNC_CONFIG_CLEAR_WHEN_MAIN_MISSING:
        if key.lower() in PROTECTED_SYNC_CONFIG_KEYS:
            continue
        if key in main_config or key not in local_config:
            continue
        old_value = local_config.pop(key)
        changed += 1
        log.info(f"[distributed-sync] config {key}: main missing, cleared stale value {old_value}")

    if changed > 0:
        with open(toml_path, "w", encoding="utf-8") as handle:
            handle.write(toml.dumps(local_config))
        log.info(f"[distributed-sync] wrote {changed} synced config key(s) to {toml_path}")
    else:
        log.info("[distributed-sync] config sync completed with no changes")

    return True, ""


def sync_missing_assets_from_main(toml_path: str, sync_runtime: dict, repo_root: Path) -> tuple[bool, str]:
    try:
        config = toml.load(toml_path)
    except Exception as exc:
        return False, f"Failed to read local training config: {toml_path} ({exc})"

    for key in list(sync_runtime.get("sync_asset_keys") or []):
        value = config.get(key)
        if not isinstance(value, str) or not value.strip():
            continue

        local_path = resolve_local_path(value, repo_root)
        force_refresh_if_exists = str(key).strip().lower() == "resume"
        if local_path.exists() and not force_refresh_if_exists:
            log.info(f"[distributed-sync] asset exists locally, skip: {key} -> {local_path}")
            continue

        ok, message = copy_asset_from_main(value, local_path, sync_runtime, repo_root)
        if not ok:
            return False, f"Asset sync failed for {key}: {message}"

        if not local_path.exists():
            return False, f"Asset sync finished but local path is still missing: {local_path}"
        log.info(f"[distributed-sync] asset synced: {key} -> {local_path}")

    return True, ""


def get_dataset_dirs_from_toml(toml_path: str, repo_root: Path) -> list[tuple[str, str, Path]]:
    try:
        config = toml.load(toml_path)
    except Exception:
        return []

    dataset_dirs: list[tuple[str, str, Path]] = []
    for key in DATASET_DIR_KEYS:
        raw_value = str(config.get(key, "") or "").strip()
        if not raw_value:
            continue
        dataset_dirs.append((key, raw_value, resolve_local_path(raw_value, repo_root)))
    return dataset_dirs


def count_local_dataset_files_without_npz(local_dir: Path) -> int:
    return count_dataset_files_without_npz(local_dir, missing_value=0, not_dir_value=-1)


def count_source_dataset_files_without_npz(source_dir: Path) -> int:
    return count_dataset_files_without_npz(source_dir, missing_value=-1, not_dir_value=-2)


def sync_dataset_dir_if_needed(
    *,
    key: str,
    local_dir: Path,
    local_count: int,
    main_count: int,
    main_dir_label: str | Path,
    sync_action: Callable[[], tuple[bool, str]],
) -> tuple[bool, str]:
    log.info(
        f"[dataset-sync] {key}: local_count={local_count}, main_count={main_count}, "
        f"local_dir={local_dir}, main_dir={main_dir_label}"
    )
    if local_count == main_count:
        log.info(f"[dataset-sync] {key}: file count already matched, skip sync")
        return True, ""

    log.warning(
        f"[dataset-sync] {key}: count mismatch detected, syncing dataset from main "
        f"(local={local_count}, main={main_count})"
    )
    ok, message = sync_action()
    if not ok:
        return False, message

    local_after = count_local_dataset_files_without_npz(local_dir)
    if local_after != main_count:
        return False, f"数据集同步后文件数仍不一致: {key}, local_after={local_after}, main={main_count}"

    log.info(f"[dataset-sync] {key}: sync completed, count={local_after}")
    return True, ""


def sync_datasets_when_count_mismatch_from_main(toml_path: str, sync_runtime: dict, repo_root: Path) -> tuple[bool, str]:
    dataset_dirs = get_dataset_dirs_from_toml(toml_path, repo_root)
    if not dataset_dirs:
        log.info("[dataset-sync] no dataset dir found in toml, skip count sync")
        return True, ""

    shared_main_repo_root = sync_runtime.get("shared_main_repo_root")
    for key, raw_value, local_dir in dataset_dirs:
        local_count = count_local_dataset_files_without_npz(local_dir)
        if local_count < 0:
            return False, f"本地数据集路径不是目录: {local_dir}"

        if isinstance(shared_main_repo_root, Path):
            source_dir = resolve_local_path(raw_value, shared_main_repo_root)
            source_count = count_source_dataset_files_without_npz(source_dir)
            if source_count < 0:
                return False, f"主节点共享数据集目录不存在或不是目录: {key} -> {source_dir}"
            ok, message = sync_dataset_dir_if_needed(
                key=key,
                local_dir=local_dir,
                local_count=local_count,
                main_count=source_count,
                main_dir_label=source_dir,
                sync_action=lambda: sync_dataset_dir_from_shared_source(source_dir, local_dir),
            )
            if not ok:
                return False, message
            continue

        remote_repo_root = str(sync_runtime.get("sync_main_repo_dir", "") or "").strip()
        remote_dir = resolve_remote_sync_path(raw_value, remote_repo_root)
        remote_count = count_remote_dataset_files_without_npz(remote_dir, sync_runtime)
        if remote_count < 0:
            return False, f"无法统计主节点数据集文件数量: {remote_dir}"
        ok, message = sync_dataset_dir_if_needed(
            key=key,
            local_dir=local_dir,
            local_count=local_count,
            main_count=remote_count,
            main_dir_label=remote_dir,
            sync_action=lambda: sync_dataset_dir_from_remote(remote_dir, local_dir, sync_runtime),
        )
        if not ok:
            return False, message

    return True, ""


def sync_dataset_dir_from_shared_source(source_dir: Path, local_dir: Path) -> tuple[bool, str]:
    try:
        synchronize_local_dir_without_npz(source_dir, local_dir)
    except Exception as exc:
        return False, f"共享数据集同步失败: {exc}"
    return True, ""


def synchronize_local_dir_without_npz(source_dir: Path, local_dir: Path) -> None:
    local_dir.mkdir(parents=True, exist_ok=True)

    source_files: set[Path] = set()
    source_dirs: set[Path] = {Path(".")}
    for path in source_dir.rglob("*"):
        relative = path.relative_to(source_dir)
        if ".mikazuki-cache" in {part.lower() for part in relative.parts}:
            continue
        if path.is_dir():
            source_dirs.add(relative)
            continue
        if path.suffix.lower() == ".npz":
            continue
        source_files.add(relative)
        source_dirs.add(relative.parent)
        target = local_dir / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)

    for local_file in local_dir.rglob("*"):
        if not local_file.is_file():
            continue
        relative = local_file.relative_to(local_dir)
        if ".mikazuki-cache" in {part.lower() for part in relative.parts}:
            continue
        if local_file.suffix.lower() == ".npz":
            continue
        if relative not in source_files:
            local_file.unlink()

    removable_dirs = sorted([p for p in local_dir.rglob("*") if p.is_dir()], key=lambda item: len(item.parts), reverse=True)
    for directory in removable_dirs:
        relative = directory.relative_to(local_dir)
        if relative in source_dirs:
            continue
        try:
            directory.rmdir()
        except OSError:
            continue


def count_remote_dataset_files_without_npz(remote_dir: str, sync_runtime: dict) -> int:
    remote_host = str(sync_runtime.get("remote_host", "") or "").strip()
    result, error_message = run_ssh_command(
        remote_host,
        f"find {shlex.quote(remote_dir)} \\( -type d -name '.mikazuki-cache' -prune \\) -o "
        f"\\( -type f ! -iname '*.npz' ! -iname '*.NPZ' -print \\) | wc -l",
        sync_runtime,
    )
    if result is None:
        log.warning(f"[dataset-sync] failed to count remote dataset files: {error_message}")
        return -2
    lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if not lines:
        return -2
    try:
        return int(lines[-1])
    except Exception:
        return -2


def build_rsync_ssh_exec(sync_runtime: dict) -> str:
    return " ".join(
        [
            "ssh",
            "-p",
            str(int(sync_runtime.get("sync_ssh_port", 22) or 22)),
            *build_ssh_options(sync_runtime),
        ]
    )


def build_rsync_dir_command(
    remote_host: str,
    remote_path: str,
    local_path: Path,
    sync_runtime: dict,
    *,
    delete: bool = False,
    exclude_npz: bool = False,
) -> list[str]:
    cmd = ["rsync", "-a", "--partial"]
    if delete:
        cmd.append("--delete")
    if exclude_npz:
        cmd.extend(["--exclude", "*.npz", "--exclude", "*.NPZ", "--exclude", ".mikazuki-cache/"])
    cmd.extend(
        [
            "-e",
            build_rsync_ssh_exec(sync_runtime),
            f"{remote_host}:{remote_path.rstrip('/')}/",
            f"{str(local_path)}/",
        ]
    )
    return cmd


def sync_dataset_dir_from_remote(remote_dir: str, local_dir: Path, sync_runtime: dict) -> tuple[bool, str]:
    remote_host = str(sync_runtime.get("remote_host", "") or "").strip()
    if shutil.which("rsync") is not None:
        cmd = build_rsync_dir_command(
            remote_host,
            remote_dir,
            local_dir,
            sync_runtime,
            delete=True,
            exclude_npz=True,
        )
        if sync_runtime.get("sync_use_password_auth"):
            cmd = build_sshpass_wrapper(cmd, sync_runtime)
            if cmd is None:
                return False, "无法构建密码认证 rsync 命令"
        local_dir.mkdir(parents=True, exist_ok=True)
        result = subprocess.run(cmd, text=True, capture_output=True)
        if result.returncode == 0:
            return True, ""
        log.warning(f"[dataset-sync] rsync failed, fallback to scp: {result.stderr.strip() or result.stdout.strip() or '<empty>'}")

    remote_basename = PurePosixPath(str(remote_dir).replace("\\", "/").rstrip("/")).name or "remote-dataset"
    with tempfile.TemporaryDirectory(prefix="mikazuki-remote-dataset-") as temp_dir:
        staging_root = Path(temp_dir)
        staged_target = staging_root / remote_basename
        ok, message = scp_remote_dir(remote_host, remote_dir, staged_target, sync_runtime)
        if not ok:
            return False, message

        source_dir = staged_target
        if not source_dir.exists() or not source_dir.is_dir():
            candidate_dirs = [path for path in staging_root.iterdir() if path.is_dir()]
            if len(candidate_dirs) == 1:
                source_dir = candidate_dirs[0]
            else:
                return False, f"远端数据集下载完成，但无法定位临时目录中的源文件夹: {staging_root}"

        try:
            synchronize_local_dir_without_npz(source_dir, local_dir)
        except Exception as exc:
            return False, f"远端数据集镜像同步失败: {exc}"
    return True, ""


def clear_dataset_npz_cache(toml_path: str, repo_root: Path) -> tuple[bool, str]:
    dataset_dirs = get_dataset_dirs_from_toml(toml_path, repo_root)
    if not dataset_dirs:
        log.info("[cache-reset] no dataset dir found in toml, skip npz cleanup")
        return True, ""

    total_npz_removed = 0
    total_safetensors_removed = 0
    total_cache_manifest_removed = 0
    total_other_cache_files_removed = 0
    total_metadata_removed = 0
    for key, _, local_dir in dataset_dirs:
        if not local_dir.exists():
            log.info(f"[cache-reset] {key}: dataset dir not found, skip npz cleanup: {local_dir}")
            continue
        if not local_dir.is_dir():
            return False, f"数据集路径不是目录，无法清理 npz: {local_dir}"

        removed_npz = 0
        for npz_file in local_dir.rglob("*.npz"):
            try:
                npz_file.unlink()
                removed_npz += 1
            except Exception as exc:
                return False, f"删除缓存失败: {npz_file} ({exc})"
        total_npz_removed += removed_npz

        removed_safetensors = 0
        removed_cache_manifests = 0
        removed_other_cache_files = 0
        latents_cache_dir = local_dir / ".mikazuki-cache" / "latents"
        if latents_cache_dir.exists():
            if not latents_cache_dir.is_dir():
                return False, f"latent 缓存路径不是目录，无法清理: {latents_cache_dir}"
            for cache_file in latents_cache_dir.rglob("*"):
                if not cache_file.is_file():
                    continue
                suffix = cache_file.suffix.lower()
                if suffix == ".safetensors":
                    removed_safetensors += 1
                elif suffix == ".json":
                    removed_cache_manifests += 1
                else:
                    removed_other_cache_files += 1
            try:
                shutil.rmtree(latents_cache_dir)
            except Exception as exc:
                return False, f"删除缓存失败: {latents_cache_dir} ({exc})"
            mikazuki_cache_dir = latents_cache_dir.parent
            if mikazuki_cache_dir.exists():
                try:
                    mikazuki_cache_dir.rmdir()
                except OSError:
                    pass
        total_safetensors_removed += removed_safetensors
        total_cache_manifest_removed += removed_cache_manifests
        total_other_cache_files_removed += removed_other_cache_files

        metadata_cache = local_dir / "metadata_cache.json"
        removed_metadata = 0
        if metadata_cache.exists():
            try:
                metadata_cache.unlink()
                removed_metadata = 1
            except Exception as exc:
                return False, f"删除缓存失败: {metadata_cache} ({exc})"
        total_metadata_removed += removed_metadata

        log.info(
            f"[cache-reset] {key}: removed {removed_npz} npz files, {removed_safetensors} safetensors shard files, "
            f"{removed_cache_manifests} cache manifests, {removed_other_cache_files} other cache files, "
            f"and {removed_metadata} metadata cache files under {local_dir}"
        )

    log.info(
        f"[cache-reset] removed total npz files: {total_npz_removed}, total safetensors shard files: {total_safetensors_removed}, "
        f"total cache manifests: {total_cache_manifest_removed}, total other cache files: {total_other_cache_files_removed}, "
        f"total metadata cache files: {total_metadata_removed}"
    )
    return True, ""


def enforce_distributed_output_policy(toml_path: str, sync_runtime: dict, repo_root: Path) -> tuple[bool, str]:
    if not sync_runtime.get("is_worker"):
        log.info("[output-policy] skipped (single-machine or main node)")
        return True, ""

    try:
        config = toml.load(toml_path)
    except Exception as exc:
        return False, f"读取训练配置失败: {toml_path} ({exc})"

    output_dir = resolve_local_path(str(config.get("output_dir", "./output") or "./output"), repo_root)
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        marker_path = output_dir / WORKER_OUTPUT_MARKER
        marker_path.touch(exist_ok=True)
    except Exception as exc:
        return False, f"worker 输出策略写入失败: {exc}"

    log.info(f"[output-policy] worker marker created: {marker_path}")
    log.info("[output-policy] worker native save is enabled (no checkpoint/save_state override)")
    return True, ""


def load_main_config_for_sync(toml_path: str, sync_runtime: dict, repo_root: Path) -> tuple[Optional[dict], str, str]:
    local_toml_name = Path(toml_path).name
    candidate_relative_paths = []
    sync_main_toml = str(sync_runtime.get("sync_main_toml", "") or "").strip()
    if sync_main_toml:
        candidate_relative_paths.append(sync_main_toml)

    shared_main_repo_root = sync_runtime.get("shared_main_repo_root")
    if isinstance(shared_main_repo_root, Path):
        latest_shared_toml = find_latest_shared_main_toml(shared_main_repo_root)
        if latest_shared_toml:
            candidate_relative_paths.append(str(latest_shared_toml))

    if not isinstance(shared_main_repo_root, Path) and str(sync_runtime.get("remote_host", "") or "").strip():
        latest_remote_toml, latest_remote_error = find_latest_remote_main_toml(sync_runtime)
        if latest_remote_toml:
            candidate_relative_paths.append(latest_remote_toml)
        elif latest_remote_error:
            log.info(f"[distributed-sync] latest remote autosave discovery skipped: {latest_remote_error}")

    candidate_relative_paths.extend(
        [
            "./config/autosave/distributed-main-latest.toml",
            f"./config/autosave/{local_toml_name}",
            "./config/default.toml",
            "./config/lora.toml",
        ]
    )

    dedup_candidates: list[str] = []
    seen: set[str] = set()
    for candidate in candidate_relative_paths:
        normalized = str(candidate or "").strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        dedup_candidates.append(normalized)

    if isinstance(shared_main_repo_root, Path):
        for candidate in dedup_candidates:
            shared_path = resolve_local_path(candidate, shared_main_repo_root)
            if not shared_path.exists() or not shared_path.is_file():
                continue
            try:
                return toml.loads(shared_path.read_text(encoding="utf-8")), str(shared_path), ""
            except Exception as exc:
                log.warning(f"[distributed-sync] failed to parse shared main config {shared_path}: {exc}")

    remote_host = str(sync_runtime.get("remote_host", "") or "").strip()
    remote_repo_root = str(sync_runtime.get("sync_main_repo_dir", "") or "").strip()
    errors: list[str] = []
    for candidate in dedup_candidates:
        remote_path = resolve_remote_sync_path(candidate, remote_repo_root)
        path_type = probe_remote_path_type(remote_host, remote_path, sync_runtime)
        if path_type != "file":
            errors.append(f"{remote_path} ({path_type})")
            continue
        text, error_message = read_remote_text_file(remote_host, remote_path, sync_runtime)
        if text is None:
            errors.append(f"{remote_path} ({error_message})")
            continue
        try:
            return toml.loads(text), remote_path, ""
        except Exception as exc:
            errors.append(f"{remote_path} (toml parse failed: {exc})")

    return None, "", (
        "Unable to load main training config for worker sync. "
        f"Tried: {'; '.join(errors) if errors else '<no candidates>'}"
    )


def copy_asset_from_main(remote_value: str, local_path: Path, sync_runtime: dict, repo_root: Path) -> tuple[bool, str]:
    shared_main_repo_root = sync_runtime.get("shared_main_repo_root")
    if isinstance(shared_main_repo_root, Path):
        source_path = resolve_local_path(remote_value, shared_main_repo_root)
        if not source_path.exists():
            return False, f"shared source path does not exist: {source_path}"
        return copy_local_path(source_path, local_path)

    remote_repo_root = str(sync_runtime.get("sync_main_repo_dir", "") or "").strip()
    remote_path = resolve_remote_sync_path(remote_value, remote_repo_root)
    return copy_remote_path(remote_path, local_path, sync_runtime)


def resolve_remote_sync_path(path_value: str, remote_repo_root: str) -> str:
    raw_value = str(path_value or "").strip()
    if not raw_value:
        return str(remote_repo_root or "").strip()

    if re.match(r"^[A-Za-z]:[\\/]", raw_value):
        return raw_value

    normalized_value = raw_value.replace("\\", "/")
    if normalized_value.startswith("/") or normalized_value.startswith("~/"):
        return normalized_value

    normalized_root = str(remote_repo_root or "").strip().replace("\\", "/")
    if not normalized_root:
        return normalized_value
    return str(PurePosixPath(normalized_root) / normalized_value)


def find_latest_shared_main_toml(shared_main_repo_root: Path) -> Optional[str]:
    autosave_dir = shared_main_repo_root / "config" / "autosave"
    if not autosave_dir.exists() or not autosave_dir.is_dir():
        return None

    try:
        candidates = sorted(
            [path for path in autosave_dir.glob("*.toml") if path.is_file()],
            key=lambda item: item.stat().st_mtime,
            reverse=True,
        )
    except Exception as exc:
        log.warning(f"[distributed-sync] failed to scan shared autosave dir {autosave_dir}: {exc}")
        return None

    if not candidates:
        return None
    return str(candidates[0])


def build_ssh_command(remote_host: str, remote_command: str, sync_runtime: dict) -> Optional[list[str]]:
    if not remote_host:
        return None

    cmd = [
        "ssh",
        "-p",
        str(int(sync_runtime.get("sync_ssh_port", 22) or 22)),
        *build_ssh_options(sync_runtime),
        remote_host,
        remote_command,
    ]
    return build_sshpass_wrapper(cmd, sync_runtime)


def run_ssh_command(remote_host: str, remote_command: str, sync_runtime: dict) -> tuple[Optional[subprocess.CompletedProcess], str]:
    cmd = build_ssh_command(remote_host, remote_command, sync_runtime)
    if cmd is None:
        return None, "failed to build ssh command"

    result = subprocess.run(cmd, text=True, capture_output=True)
    if result.returncode != 0:
        return None, result.stderr.strip() or result.stdout.strip() or "<empty>"
    return result, ""


def find_latest_remote_main_toml(sync_runtime: dict) -> tuple[Optional[str], str]:
    remote_host = str(sync_runtime.get("remote_host", "") or "").strip()
    remote_repo_root = str(sync_runtime.get("sync_main_repo_dir", "") or "").strip()
    if not remote_host:
        return None, "remote host is empty"
    if not remote_repo_root:
        return None, "sync_main_repo_dir is empty"

    autosave_dir = resolve_remote_sync_path("./config/autosave", remote_repo_root)
    remote_command = f"ls -1t {shlex.quote(str(autosave_dir))}/*.toml 2>/dev/null | head -n 1"
    result, error_message = run_ssh_command(remote_host, remote_command, sync_runtime)
    if result is None:
        return None, error_message

    path = str(result.stdout or "").strip()
    if not path:
        return None, "no remote autosave toml found"
    return path.splitlines()[0].strip(), ""


def copy_local_path(source_path: Path, local_path: Path) -> tuple[bool, str]:
    try:
        if source_path.is_dir():
            local_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(source_path, local_path, dirs_exist_ok=True)
        else:
            local_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_path, local_path)
    except Exception as exc:
        return False, str(exc)
    return True, ""


def read_remote_text_file(remote_host: str, remote_path: str, sync_runtime: dict) -> tuple[Optional[str], str]:
    result, error_message = run_ssh_command(
        remote_host,
        f"cat {shlex.quote(remote_path)}",
        sync_runtime,
    )
    if result is None:
        return None, error_message
    return str(result.stdout or ""), ""


def probe_remote_path_type(remote_host: str, remote_path: str, sync_runtime: dict) -> str:
    result, error_message = run_ssh_command(
        remote_host,
        (
            f"if [ -d {shlex.quote(remote_path)} ]; then echo dir; "
            f"elif [ -f {shlex.quote(remote_path)} ]; then echo file; "
            "else echo missing; fi"
        ),
        sync_runtime,
    )
    if result is None:
        log.warning(f"[distributed-sync] failed to probe remote path {remote_path}: {error_message}")
        return "error"

    lines = [line.strip() for line in str(result.stdout or "").splitlines() if line.strip()]
    if not lines:
        return "error"
    candidate = lines[-1]
    return candidate if candidate in {"file", "dir", "missing"} else "error"


def copy_remote_path(remote_path: str, local_path: Path, sync_runtime: dict) -> tuple[bool, str]:
    remote_host = str(sync_runtime.get("remote_host", "") or "").strip()
    path_type = probe_remote_path_type(remote_host, remote_path, sync_runtime)
    if path_type == "missing":
        return False, f"remote path does not exist: {remote_path}"
    if path_type == "error":
        return False, f"failed to probe remote path type: {remote_path}"

    if path_type == "file":
        return scp_remote_file(remote_host, remote_path, local_path, sync_runtime)

    if shutil.which("rsync") is not None:
        cmd = build_rsync_dir_command(remote_host, remote_path, local_path, sync_runtime)
        cmd = build_sshpass_wrapper(cmd, sync_runtime)
        if cmd is not None:
            local_path.mkdir(parents=True, exist_ok=True)
            result = subprocess.run(cmd, text=True, capture_output=True)
            if result.returncode == 0:
                return True, ""
            log.warning(
                f"[distributed-sync] rsync failed for {remote_path}, fallback to scp: "
                f"{result.stderr.strip() or result.stdout.strip() or '<empty>'}"
            )

    return scp_remote_dir(remote_host, remote_path, local_path, sync_runtime)


def scp_remote_file(remote_host: str, remote_path: str, local_path: Path, sync_runtime: dict) -> tuple[bool, str]:
    local_path.parent.mkdir(parents=True, exist_ok=True)
    remote_spec = build_remote_spec(remote_host, remote_path)
    cmd = build_scp_command(remote_spec, str(local_path), sync_runtime, recursive=False)
    if cmd is None:
        return False, "failed to build scp command"
    result = subprocess.run(cmd, text=True, capture_output=True)
    if result.returncode != 0:
        return False, result.stderr.strip() or result.stdout.strip() or "<empty>"
    return True, ""


def scp_remote_dir(remote_host: str, remote_path: str, local_path: Path, sync_runtime: dict) -> tuple[bool, str]:
    local_path.parent.mkdir(parents=True, exist_ok=True)
    remote_spec = build_remote_spec(remote_host, remote_path.rstrip("/"))
    cmd = build_scp_command(remote_spec, str(local_path.parent), sync_runtime, recursive=True)
    if cmd is None:
        return False, "failed to build scp command"
    result = subprocess.run(cmd, text=True, capture_output=True)
    if result.returncode != 0:
        return False, result.stderr.strip() or result.stdout.strip() or "<empty>"
    return True, ""


def build_remote_spec(remote_host: str, remote_path: str) -> str:
    escaped_path = str(remote_path or "").replace('"', '\\"')
    return f'{remote_host}:"{escaped_path}"'


def build_sshpass_wrapper(cmd: list[str], sync_runtime: dict) -> Optional[list[str]]:
    if not sync_runtime.get("sync_use_password_auth"):
        return cmd

    if shutil.which("sshpass") is None:
        return None

    password = str(sync_runtime.get("sync_ssh_password", "") or "").strip()
    if not password:
        return None

    return ["sshpass", "-p", password, *cmd]


def build_ssh_options(sync_runtime: dict) -> list[str]:
    options = ["-o", "StrictHostKeyChecking=accept-new"]
    if sync_runtime.get("sync_use_password_auth"):
        options.extend(
            [
                "-o",
                "PubkeyAuthentication=no",
                "-o",
                "PreferredAuthentications=password,keyboard-interactive",
            ]
        )
    return options


def build_scp_command(remote_spec: str, destination: str, sync_runtime: dict, *, recursive: bool) -> Optional[list[str]]:
    cmd = [
        "scp",
        "-P",
        str(int(sync_runtime.get("sync_ssh_port", 22) or 22)),
        *build_ssh_options(sync_runtime),
    ]
    if recursive:
        cmd.append("-r")
    cmd.extend([remote_spec, destination])
    return build_sshpass_wrapper(cmd, sync_runtime)
