"""Persistence for launcher task history and active task snapshot."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


_TASK_HISTORY_FILE = "launcher_task_history.json"
_TASK_STATE_FILE = "launcher_task_state.json"


class TaskHistoryStore:
    """JSON-backed store for recent launcher task records."""

    def __init__(self, config_dir: Path) -> None:
        self._path = config_dir / _TASK_HISTORY_FILE

    def load(self) -> List[Dict[str, Any]]:
        if not self._path.exists():
            return []
        try:
            with open(self._path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if isinstance(payload, list):
                return [item for item in payload if isinstance(item, dict)]
        except (json.JSONDecodeError, OSError):
            return []
        return []

    def save(self, records: List[Dict[str, Any]]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(self._path, "w", encoding="utf-8") as handle:
                json.dump(records, handle, indent=2, ensure_ascii=False)
        except OSError:
            pass

    def clear(self) -> None:
        self.save([])


class TaskStateStore:
    """JSON-backed store for the currently active launcher task snapshot."""

    def __init__(self, config_dir: Path) -> None:
        self._path = config_dir / _TASK_STATE_FILE

    def load(self) -> Dict[str, Any]:
        if not self._path.exists():
            return {}
        try:
            with open(self._path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if isinstance(payload, dict):
                return payload
        except (json.JSONDecodeError, OSError):
            return {}
        return {}

    def save(self, snapshot: Dict[str, Any]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(self._path, "w", encoding="utf-8") as handle:
                json.dump(snapshot, handle, indent=2, ensure_ascii=False)
        except OSError:
            pass

    def clear(self) -> None:
        self.save({})
