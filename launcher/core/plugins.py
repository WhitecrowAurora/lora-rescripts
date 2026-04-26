"""Plugin scanning and enable/disable — extracted from ui/extension_page.py for use by the API layer."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import List


@dataclass
class PluginInfo:
    """Lightweight plugin info for the UI."""
    plugin_id: str
    name: str
    version: str
    description: str
    dir_name: str
    enabled: bool
    enabled_by_default: bool
    has_override: bool
    capabilities: list
    hooks: list
    error: str


def scan_plugins(repo_root: Path, enabled_store_path: Path) -> List[PluginInfo]:
    """Scan plugin/backend/ for manifests and resolve enabled state."""
    plugin_root = repo_root / "plugin" / "backend"
    if not plugin_root.exists():
        return []

    enabled_store: dict = {}
    if enabled_store_path.exists():
        try:
            with open(enabled_store_path, "r", encoding="utf-8") as f:
                enabled_store = json.load(f)
        except Exception:
            pass

    records: list = enabled_store.get("records", []) if isinstance(enabled_store, dict) else []

    plugins: List[PluginInfo] = []
    for plugin_dir in sorted(plugin_root.iterdir(), key=lambda p: p.name.lower()):
        manifest_path = plugin_dir / "plugin_manifest.json"
        if not manifest_path.exists():
            continue
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
            if not isinstance(payload, dict):
                continue
        except Exception:
            plugins.append(PluginInfo(
                plugin_id=plugin_dir.name,
                name=plugin_dir.name,
                version="?",
                description="",
                dir_name=plugin_dir.name,
                enabled=False,
                enabled_by_default=True,
                has_override=False,
                capabilities=[],
                hooks=[],
                error="Invalid manifest",
            ))
            continue

        plugin_id = str(payload.get("id", "") or "").strip() or plugin_dir.name
        name = str(payload.get("name", "") or "").strip() or plugin_id
        version = str(payload.get("version", "") or "").strip() or "?"
        description = str(payload.get("description", "") or "").strip()
        enabled_by_default = bool(payload.get("enabled_by_default", True))
        caps = payload.get("capabilities", [])
        hooks_raw = payload.get("hooks", [])
        hooks = [str(h.get("event", "")) for h in hooks_raw if isinstance(h, dict)] if isinstance(hooks_raw, list) else []

        # Resolve enabled state from store
        matched = None
        for rec in records:
            if isinstance(rec, dict) and str(rec.get("plugin_id", "")).strip() == plugin_id:
                matched = rec
                break

        if matched is not None:
            has_override = True
            enabled = bool(matched.get("enabled", enabled_by_default))
        else:
            has_override = False
            enabled = enabled_by_default

        plugins.append(PluginInfo(
            plugin_id=plugin_id,
            name=name,
            version=version,
            description=description,
            dir_name=plugin_dir.name,
            enabled=enabled,
            enabled_by_default=enabled_by_default,
            has_override=has_override,
            capabilities=caps if isinstance(caps, list) else [],
            hooks=hooks,
            error="",
        ))

    return plugins


def set_plugin_enabled(repo_root: Path, plugin_id: str, enabled: bool) -> None:
    """Write enable override to config/plugins/enabled.json."""
    config_root = repo_root / "config" / "plugins"
    config_root.mkdir(parents=True, exist_ok=True)
    enabled_path = config_root / "enabled.json"

    store: dict = {"schema": "plugin-enabled-v1", "records": []}
    if enabled_path.exists():
        try:
            with open(enabled_path, "r", encoding="utf-8") as f:
                store = json.load(f)
            if not isinstance(store, dict):
                store = {"schema": "plugin-enabled-v1", "records": []}
        except Exception:
            pass

    records = store.get("records", [])
    if not isinstance(records, list):
        records = []

    # Remove existing entry
    records = [r for r in records if isinstance(r, dict) and str(r.get("plugin_id", "")).strip() != plugin_id]

    records.append({
        "plugin_id": plugin_id,
        "enabled": enabled,
        "updated_by": "launcher",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    store["records"] = records
    with open(enabled_path, "w", encoding="utf-8") as f:
        json.dump(store, f, indent=2, ensure_ascii=False)
