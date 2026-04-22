from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path


_AUDIT_LOCK = threading.Lock()


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def append_audit_event(
    audit_path: Path,
    *,
    event_type: str,
    level: str = "info",
    plugin_id: str = "",
    payload: dict | None = None,
) -> dict:
    record = {
        "ts": _utc_now_iso(),
        "event_type": str(event_type or "").strip() or "unknown",
        "level": str(level or "").strip() or "info",
        "plugin_id": str(plugin_id or "").strip(),
        "payload": payload or {},
    }
    audit_path.parent.mkdir(parents=True, exist_ok=True)
    with _AUDIT_LOCK:
        with open(audit_path, "a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False))
            handle.write("\n")
    return record


def list_recent_audit_events(audit_path: Path, *, limit: int = 200) -> list[dict]:
    if limit <= 0:
        return []
    if not audit_path.exists():
        return []

    lines = []
    with _AUDIT_LOCK:
        with open(audit_path, "r", encoding="utf-8", errors="ignore") as handle:
            lines = handle.readlines()

    selected = lines[-limit:]
    events: list[dict] = []
    for line in selected:
        stripped = line.strip()
        if not stripped:
            continue
        try:
            payload = json.loads(stripped)
        except Exception:
            continue
        if isinstance(payload, dict):
            events.append(payload)
    return events

