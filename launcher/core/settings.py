"""JSON-based settings persistence for the SD-reScripts Launcher."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional

from launcher.config import DEFAULT_HOST, DEFAULT_PORT

_SETTINGS_FILE = "launcher_settings.json"

_DEFAULTS: Dict[str, Any] = {
    "language": "zh",
    "last_runtime": "standard",
    "safe_mode": False,
    "cn_mirror": False,
    "attention_policy": "default",  # "default", "prefer_sage", "force_sdpa"
    "host": DEFAULT_HOST,
    "port": DEFAULT_PORT,
    "listen": False,
    "disable_tensorboard": False,
    "disable_tageditor": False,
    "disable_auto_mirror": False,
    "dev_mode": False,
    "window_width": None,
    "window_height": None,
}


class Settings:
    """Persistent settings stored in config/launcher_settings.json."""

    def __init__(self, config_dir: Path) -> None:
        self._path = config_dir / _SETTINGS_FILE
        self._data: Dict[str, Any] = dict(_DEFAULTS)
        self.load()

    def load(self) -> None:
        """Load settings from disk. Missing keys get default values."""
        if self._path.exists():
            try:
                with open(self._path, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                # Merge: saved values override defaults, unknown keys are kept
                for key, value in saved.items():
                    self._data[key] = value
            except (json.JSONDecodeError, OSError):
                pass  # Use defaults on corrupt file

    def save(self) -> None:
        """Save current settings to disk."""
        self._path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, ensure_ascii=False)
        except OSError:
            pass

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        old = self._data.get(key)
        self._data[key] = value
        if old != value:
            self.save()

    def __getattr__(self, name: str) -> Any:
        if name.startswith("_"):
            raise AttributeError(name)
        return self._data.get(name, _DEFAULTS.get(name))

    def __setattr__(self, name: str, value: Any) -> None:
        if name.startswith("_"):
            super().__setattr__(name, value)
        else:
            self.set(name, value)
