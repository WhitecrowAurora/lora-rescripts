from __future__ import annotations

import json
import os
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from mikazuki.utils.dataset_analysis import normalize_caption_extension, read_text_file

BACKUP_ROOT = Path("config") / "backups" / "captions"
MANIFEST_NAME = "manifest.json"
CAPTION_PREFIX = "captions/"
SAFE_ARCHIVE_NAME = re.compile(r"^[A-Za-z0-9._-]+\.zip$")
NO_CAPTIONS_TO_BACKUP_MESSAGE = "No caption files were found to back up / 没有找到可备份的 caption 文件。"


def create_caption_backup(
    path: str,
    caption_extension: str = ".txt",
    recursive: bool = True,
    snapshot_name: str = "",
) -> dict:
    root = validate_caption_root(path)
    normalized_caption_extension = normalize_caption_extension(caption_extension)
    caption_files = list(iter_caption_files(root, normalized_caption_extension, recursive))
    if not caption_files:
        raise ValueError(NO_CAPTIONS_TO_BACKUP_MESSAGE)

    backup_dir = (Path.cwd() / BACKUP_ROOT).resolve()
    backup_dir.mkdir(parents=True, exist_ok=True)

    created_at = datetime.now(timezone.utc).isoformat()
    archive_name = build_archive_name(root, snapshot_name)
    archive_path = backup_dir / archive_name

    manifest = {
        "version": 1,
        "created_at": created_at,
        "snapshot_name": snapshot_name.strip() or root.name or archive_name,
        "source_root": str(root.resolve()),
        "caption_extension": normalized_caption_extension,
        "recursive": recursive,
        "file_count": len(caption_files),
        "files": [
            {
                "relative_path": file_path.relative_to(root).as_posix(),
                "size": file_path.stat().st_size,
            }
            for file_path in caption_files
        ],
    }

    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(MANIFEST_NAME, json.dumps(manifest, ensure_ascii=False, indent=2))
        for file_path in caption_files:
            relative_path = file_path.relative_to(root).as_posix()
            archive.writestr(f"{CAPTION_PREFIX}{relative_path}", read_text_file(file_path))

    return build_backup_record(archive_path, manifest)


def list_caption_backups(path: str | None = None) -> list[dict]:
    backup_dir = (Path.cwd() / BACKUP_ROOT).resolve()
    if not backup_dir.exists():
        return []

    target_root = normalize_compare_path(path) if path else None
    records: list[dict] = []

    for archive_path in sorted(backup_dir.glob("*.zip"), reverse=True):
        try:
            manifest = read_backup_manifest(archive_path)
        except Exception:
            continue

        if target_root is not None and normalize_compare_path(manifest.get("source_root")) != target_root:
            continue

        records.append(build_backup_record(archive_path, manifest))

    records.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return records


def restore_caption_backup(
    path: str,
    archive_name: str,
    make_restore_backup: bool = True,
) -> dict:
    root = validate_caption_root(path)
    if not SAFE_ARCHIVE_NAME.match(archive_name):
        raise ValueError("Invalid backup archive name / 备份文件名无效。")

    archive_path = (Path.cwd() / BACKUP_ROOT / archive_name).resolve()
    if not archive_path.exists():
        raise ValueError("Backup archive was not found / 备份归档不存在。")

    manifest = read_backup_manifest(archive_path)
    source_root = manifest.get("source_root")
    if normalize_compare_path(source_root) != normalize_compare_path(root):
        raise ValueError("Backup archive does not belong to the selected folder / 备份不属于当前选中的文件夹。")

    current_backup = None
    if make_restore_backup:
        current_backup = create_caption_backup(
            path=str(root),
            caption_extension=manifest.get("caption_extension", ".txt"),
            recursive=bool(manifest.get("recursive", True)),
            snapshot_name=f"pre-restore-{manifest.get('snapshot_name', 'snapshot')}",
        )

    restored_file_count = 0
    overwritten_file_count = 0
    created_file_count = 0

    with zipfile.ZipFile(archive_path, "r") as archive:
        for file_info in manifest.get("files", []):
            relative_path = str(file_info.get("relative_path", "")).strip()
            if not relative_path:
                continue
            safe_relative = ensure_safe_relative_path(relative_path)
            target_path = root / safe_relative
            target_path.parent.mkdir(parents=True, exist_ok=True)
            caption_data = archive.read(f"{CAPTION_PREFIX}{safe_relative.as_posix()}").decode("utf-8")

            if target_path.exists():
                if read_text_file(target_path) != caption_data:
                    overwritten_file_count += 1
            else:
                created_file_count += 1

            target_path.write_text(caption_data, encoding="utf-8")
            restored_file_count += 1

    warnings = []
    if current_backup:
        warnings.append(f"Created a pre-restore backup: {current_backup['archive_name']}")
    warnings.append("Restore writes snapshot files back, but does not delete extra current caption files.")

    return {
        "archive_name": archive_name,
        "source_root": str(root.resolve()),
        "snapshot_name": manifest.get("snapshot_name") or archive_name,
        "restored_file_count": restored_file_count,
        "overwritten_file_count": overwritten_file_count,
        "created_file_count": created_file_count,
        "pre_restore_backup": current_backup,
        "warnings": warnings,
    }


def validate_caption_root(path: str) -> Path:
    root = Path(path).expanduser()
    if not root.exists():
        raise ValueError("Caption folder does not exist / Caption 文件夹不存在。")
    if not root.is_dir():
        raise ValueError("Caption path must be a folder / Caption 路径必须是文件夹。")
    return root.resolve()


def iter_caption_files(base: Path, caption_extension: str, recursive: bool) -> Iterable[Path]:
    iterator = base.rglob("*") if recursive else base.glob("*")
    for path in iterator:
        if path.is_file() and path.suffix.lower() == caption_extension:
            yield path


def build_archive_name(root: Path, snapshot_name: str) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    slug = slugify(snapshot_name.strip() or root.name or "captions")
    return f"{timestamp}-{slug}.zip"


def slugify(value: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-._")
    return slug[:80] or "captions"


def read_backup_manifest(archive_path: Path) -> dict:
    with zipfile.ZipFile(archive_path, "r") as archive:
        return json.loads(archive.read(MANIFEST_NAME).decode("utf-8"))


def build_backup_record(archive_path: Path, manifest: dict) -> dict:
    return {
        "archive_name": archive_path.name,
        "archive_path": str(archive_path),
        "created_at": manifest.get("created_at"),
        "snapshot_name": manifest.get("snapshot_name") or archive_path.stem,
        "source_root": manifest.get("source_root"),
        "caption_extension": manifest.get("caption_extension"),
        "recursive": bool(manifest.get("recursive", True)),
        "file_count": int(manifest.get("file_count", 0)),
        "archive_size": archive_path.stat().st_size,
    }


def normalize_compare_path(path: str | os.PathLike | None) -> str:
    if not path:
        return ""
    return os.path.normcase(str(Path(path).expanduser().resolve()))


def ensure_safe_relative_path(relative_path: str) -> Path:
    candidate = Path(relative_path)
    if candidate.is_absolute() or ".." in candidate.parts:
        raise ValueError("Backup archive contains an unsafe relative path / 备份中包含不安全的相对路径。")
    return candidate
