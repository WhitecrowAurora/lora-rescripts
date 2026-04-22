from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from mikazuki.log import log


@dataclass(frozen=True)
class Tier1PluginLogger:
    plugin_id: str

    def _render(self, message) -> str:
        return f"[plugin:{self.plugin_id}] {str(message)}"

    def debug(self, message) -> None:
        log.debug(self._render(message))

    def info(self, message) -> None:
        log.info(self._render(message))

    def warning(self, message) -> None:
        log.warning(self._render(message))

    def error(self, message) -> None:
        log.error(self._render(message))


@dataclass(frozen=True)
class Tier1PluginContext:
    plugin_id: str
    name: str
    version: str
    plugin_root: str
    data_root: str
    manifest_path: str
    entry_path: str
    package_hash: str
    capabilities: tuple[str, ...]
    hooks: tuple[str, ...]
    logger: Tier1PluginLogger
    _audit_callback: Callable[..., dict]

    def plugin_path(self, *parts: str) -> str:
        base = Path(self.plugin_root)
        return str((base.joinpath(*parts)).resolve())

    def data_path(self, *parts: str) -> str:
        base = Path(self.data_root)
        return str((base.joinpath(*parts)).resolve())

    def emit_audit(self, event_type: str, *, level: str = "info", payload: dict | None = None) -> dict:
        return self._audit_callback(
            event_type=event_type,
            level=level,
            payload=payload or {},
        )

    def to_public_dict(self) -> dict:
        return {
            "plugin_id": self.plugin_id,
            "name": self.name,
            "version": self.version,
            "plugin_root": self.plugin_root,
            "data_root": self.data_root,
            "manifest_path": self.manifest_path,
            "entry_path": self.entry_path,
            "package_hash": self.package_hash,
            "capabilities": list(self.capabilities),
            "hooks": list(self.hooks),
        }

