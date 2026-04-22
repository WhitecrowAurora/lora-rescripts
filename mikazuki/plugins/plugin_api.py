from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from mikazuki.plugins.audit_log import append_audit_event


@dataclass(frozen=True)
class ReadonlyPluginContext:
    plugin_id: str
    plugin_name: str
    plugin_version: str
    plugin_root: str
    audit_log_path: str

    def to_dict(self) -> dict:
        return {
            "plugin_id": self.plugin_id,
            "plugin_name": self.plugin_name,
            "plugin_version": self.plugin_version,
            "plugin_root": self.plugin_root,
            "audit_log_path": self.audit_log_path,
        }

    def audit(
        self,
        *,
        event_type: str,
        level: str = "info",
        payload: dict | None = None,
    ) -> dict:
        return append_audit_event(
            Path(self.audit_log_path),
            event_type=event_type,
            level=level,
            plugin_id=self.plugin_id,
            payload=payload or {},
        )

