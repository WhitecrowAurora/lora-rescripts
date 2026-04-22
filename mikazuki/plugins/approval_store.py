from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

from mikazuki.plugins.manifest_schema import (
    PluginManifest,
    build_plugin_identity_key,
)


_APPROVAL_LOCK = threading.Lock()
APPROVAL_SCHEMA_VERSION = "plugin-approvals-v1"


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _default_store() -> dict:
    return {
        "schema": APPROVAL_SCHEMA_VERSION,
        "records": [],
    }


def load_approval_store(path: Path) -> dict:
    if not path.exists():
        return _default_store()
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except Exception:
        return _default_store()
    if not isinstance(payload, dict):
        return _default_store()
    records = payload.get("records", [])
    if not isinstance(records, list):
        records = []
    return {
        "schema": str(payload.get("schema") or APPROVAL_SCHEMA_VERSION),
        "records": [item for item in records if isinstance(item, dict)],
    }


def save_approval_store(path: Path, payload: dict) -> None:
    store = {
        "schema": str(payload.get("schema") or APPROVAL_SCHEMA_VERSION),
        "records": [item for item in payload.get("records", []) if isinstance(item, dict)],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    with _APPROVAL_LOCK:
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(store, handle, indent=2, ensure_ascii=False)


def list_approval_records(path: Path) -> list[dict]:
    return load_approval_store(path).get("records", [])


def build_manifest_approval_key(
    manifest: PluginManifest,
    *,
    package_hash: str,
    signer: str,
) -> str:
    return build_plugin_identity_key(
        plugin_id=manifest.plugin_id,
        version=manifest.version,
        package_hash=package_hash,
        signer=signer,
    )


def grant_plugin_approval(
    path: Path,
    *,
    manifest: PluginManifest,
    package_hash: str,
    signer: str,
    capabilities: list[str] | None = None,
    approved_by: str = "local-user",
) -> dict:
    approval_key = build_manifest_approval_key(
        manifest,
        package_hash=package_hash,
        signer=signer,
    )
    approved_caps = sorted(
        {str(item).strip() for item in (capabilities or list(manifest.capabilities)) if str(item).strip()}
    )

    store = load_approval_store(path)
    records = [item for item in store.get("records", []) if isinstance(item, dict)]
    records = [item for item in records if str(item.get("approval_key", "")) != approval_key]
    record = {
        "approval_key": approval_key,
        "plugin_id": manifest.plugin_id,
        "version": manifest.version,
        "package_hash": str(package_hash or "").strip(),
        "signer": str(signer or "").strip(),
        "capabilities": approved_caps,
        "approved_by": str(approved_by or "local-user"),
        "approved_at": _utc_now_iso(),
    }
    records.append(record)
    store["records"] = records
    save_approval_store(path, store)
    return record


def revoke_plugin_approval(path: Path, *, plugin_id: str, all_versions: bool = True) -> int:
    normalized_plugin_id = str(plugin_id or "").strip()
    if not normalized_plugin_id:
        return 0
    store = load_approval_store(path)
    original = [item for item in store.get("records", []) if isinstance(item, dict)]
    filtered: list[dict] = []
    removed = 0
    for item in original:
        if str(item.get("plugin_id", "")) != normalized_plugin_id:
            filtered.append(item)
            continue
        if all_versions:
            removed += 1
            continue
        if removed == 0:
            removed += 1
            continue
        filtered.append(item)
    store["records"] = filtered
    save_approval_store(path, store)
    return removed


def check_plugin_approval(
    path: Path,
    *,
    manifest: PluginManifest,
    package_hash: str,
    signer: str,
    required_capabilities: list[str],
) -> dict:
    approval_key = build_manifest_approval_key(
        manifest,
        package_hash=package_hash,
        signer=signer,
    )
    store = load_approval_store(path)
    records = [item for item in store.get("records", []) if isinstance(item, dict)]
    matched = None
    for item in records:
        if str(item.get("approval_key", "")) == approval_key:
            matched = item
            break

    if matched is None:
        return {
            "approved": False,
            "approval_key": approval_key,
            "missing_capabilities": sorted(set(required_capabilities)),
            "record": None,
            "reason": "no_approval_record",
        }

    approved_caps = {
        str(item).strip()
        for item in matched.get("capabilities", [])
        if str(item).strip()
    }
    missing_caps = sorted(
        {
            str(item).strip()
            for item in required_capabilities
            if str(item).strip() and str(item).strip() not in approved_caps
        }
    )
    return {
        "approved": len(missing_caps) == 0,
        "approval_key": approval_key,
        "missing_capabilities": missing_caps,
        "record": matched,
        "reason": "" if len(missing_caps) == 0 else "capability_not_approved",
    }

