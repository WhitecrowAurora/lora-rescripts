from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path


_ENABLED_LOCK = threading.Lock()
ENABLED_SCHEMA_VERSION = "plugin-enabled-v1"


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    normalized = str(value).strip().lower()
    return normalized in {"1", "true", "yes", "on"}


def _default_store() -> dict:
    return {
        "schema": ENABLED_SCHEMA_VERSION,
        "records": [],
    }


def load_enabled_store(path: Path) -> dict:
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
        "schema": str(payload.get("schema") or ENABLED_SCHEMA_VERSION),
        "records": [item for item in records if isinstance(item, dict)],
    }


def save_enabled_store(path: Path, payload: dict) -> None:
    store = {
        "schema": str(payload.get("schema") or ENABLED_SCHEMA_VERSION),
        "records": [item for item in payload.get("records", []) if isinstance(item, dict)],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    with _ENABLED_LOCK:
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(store, handle, indent=2, ensure_ascii=False)


def list_enabled_records(path: Path) -> list[dict]:
    return load_enabled_store(path).get("records", [])


def resolve_plugin_enabled_state(
    store: dict,
    *,
    plugin_id: str,
    default_enabled: bool,
) -> dict:
    normalized_plugin_id = str(plugin_id or "").strip()
    records = [item for item in store.get("records", []) if isinstance(item, dict)]
    matched = None
    for item in records:
        if str(item.get("plugin_id", "")).strip() == normalized_plugin_id:
            matched = item
            break

    if matched is None:
        requested_enabled = bool(default_enabled)
        return {
            "requested_enabled": requested_enabled,
            "has_override": False,
            "source": "manifest_default",
            "reason": "enabled_by_manifest_default" if requested_enabled else "disabled_by_manifest_default",
            "updated_at": "",
            "updated_by": "",
        }

    requested_enabled = _to_bool(matched.get("enabled", False))
    return {
        "requested_enabled": requested_enabled,
        "has_override": True,
        "source": "user_override",
        "reason": "enabled_by_user" if requested_enabled else "disabled_by_user",
        "updated_at": str(matched.get("updated_at", "") or "").strip(),
        "updated_by": str(matched.get("updated_by", "") or "").strip(),
    }


def set_plugin_enabled_override(
    path: Path,
    *,
    plugin_id: str,
    enabled: bool,
    updated_by: str = "local-user",
) -> dict:
    normalized_plugin_id = str(plugin_id or "").strip()
    if not normalized_plugin_id:
        raise ValueError("plugin_id is required")

    store = load_enabled_store(path)
    records = [item for item in store.get("records", []) if isinstance(item, dict)]
    records = [item for item in records if str(item.get("plugin_id", "")).strip() != normalized_plugin_id]
    record = {
        "plugin_id": normalized_plugin_id,
        "enabled": bool(enabled),
        "updated_by": str(updated_by or "local-user").strip() or "local-user",
        "updated_at": _utc_now_iso(),
    }
    records.append(record)
    store["records"] = records
    save_enabled_store(path, store)
    return record


def clear_plugin_enabled_override(path: Path, *, plugin_id: str) -> int:
    normalized_plugin_id = str(plugin_id or "").strip()
    if not normalized_plugin_id:
        return 0

    store = load_enabled_store(path)
    original = [item for item in store.get("records", []) if isinstance(item, dict)]
    filtered: list[dict] = []
    removed = 0
    for item in original:
        if str(item.get("plugin_id", "")).strip() == normalized_plugin_id:
            removed += 1
            continue
        filtered.append(item)
    store["records"] = filtered
    save_enabled_store(path, store)
    return removed
