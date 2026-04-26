"""Structured launcher task state snapshots, stage events, and result records."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _duration_ms(started_at: Optional[str], finished_at: Optional[str]) -> Optional[int]:
    if not started_at or not finished_at:
        return None
    try:
        started = datetime.fromisoformat(started_at)
        finished = datetime.fromisoformat(finished_at)
    except ValueError:
        return None
    return max(0, int((finished - started).total_seconds() * 1000))


def build_idle_task_state() -> Dict[str, Any]:
    now = _now_iso()
    return {
        "task_id": None,
        "task_type": "idle",
        "state": "idle",
        "runtime_id": None,
        "stage_code": "idle",
        "stage_label_zh": "空闲",
        "stage_label_en": "Idle",
        "started_at": None,
        "updated_at": now,
        "finished_at": now,
        "code": None,
        "result_code": None,
        "error": None,
        "details": {},
    }


def begin_task_state(
    task_type: str,
    stage_code: str,
    stage_label_zh: str,
    stage_label_en: str,
    *,
    runtime_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    now = _now_iso()
    return {
        "task_id": uuid4().hex,
        "task_type": task_type,
        "state": "pending",
        "runtime_id": runtime_id,
        "stage_code": stage_code,
        "stage_label_zh": stage_label_zh,
        "stage_label_en": stage_label_en,
        "started_at": now,
        "updated_at": now,
        "finished_at": None,
        "code": None,
        "result_code": None,
        "error": None,
        "details": dict(details or {}),
    }


def advance_task_state(
    current: Dict[str, Any],
    stage_code: str,
    stage_label_zh: str,
    stage_label_en: str,
    *,
    state: str = "running",
    details: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    next_state = dict(current)
    next_state.update(
        {
            "state": state,
            "stage_code": stage_code,
            "stage_label_zh": stage_label_zh,
            "stage_label_en": stage_label_en,
            "updated_at": _now_iso(),
            "details": dict(details or {}),
        }
    )
    return next_state


def finish_task_state(
    current: Dict[str, Any],
    *,
    success: bool,
    stage_code: str,
    stage_label_zh: str,
    stage_label_en: str,
    code: Optional[str] = None,
    result_code: Optional[str] = None,
    error: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    now = _now_iso()
    next_state = dict(current)
    next_state.update(
        {
            "state": "succeeded" if success else "failed",
            "stage_code": stage_code,
            "stage_label_zh": stage_label_zh,
            "stage_label_en": stage_label_en,
            "updated_at": now,
            "finished_at": now,
            "code": code,
            "result_code": result_code,
            "error": error,
            "details": dict(details or {}),
        }
    )
    return next_state


def build_task_stage_event(current: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "task_id": current.get("task_id"),
        "task_type": current.get("task_type"),
        "state": current.get("state"),
        "runtime_id": current.get("runtime_id"),
        "stage_code": current.get("stage_code"),
        "stage_label_zh": current.get("stage_label_zh"),
        "stage_label_en": current.get("stage_label_en"),
        "timestamp": current.get("updated_at") or _now_iso(),
        "code": current.get("code"),
        "result_code": current.get("result_code"),
        "error": current.get("error"),
        "details": dict(current.get("details") or {}),
    }


def build_task_result(current: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "task_id": current.get("task_id"),
        "task_type": current.get("task_type"),
        "runtime_id": current.get("runtime_id"),
        "state": current.get("state"),
        "stage_code": current.get("stage_code"),
        "stage_label_zh": current.get("stage_label_zh"),
        "stage_label_en": current.get("stage_label_en"),
        "started_at": current.get("started_at"),
        "finished_at": current.get("finished_at"),
        "duration_ms": _duration_ms(current.get("started_at"), current.get("finished_at")),
        "code": current.get("code"),
        "result_code": current.get("result_code"),
        "error": current.get("error"),
        "details": dict(current.get("details") or {}),
    }


def build_interrupted_task_result(current: Dict[str, Any]) -> Dict[str, Any]:
    now = _now_iso()
    interrupted_details = dict(current.get("details") or {})
    interrupted_details.update(
        {
            "interrupted_stage_code": current.get("stage_code"),
            "interrupted_stage_label_zh": current.get("stage_label_zh"),
            "interrupted_stage_label_en": current.get("stage_label_en"),
        }
    )
    return {
        "task_id": current.get("task_id"),
        "task_type": current.get("task_type"),
        "runtime_id": current.get("runtime_id"),
        "state": "interrupted",
        "stage_code": "task.interrupted",
        "stage_label_zh": "任务被中断",
        "stage_label_en": "Task interrupted",
        "started_at": current.get("started_at"),
        "finished_at": now,
        "duration_ms": _duration_ms(current.get("started_at"), now),
        "code": "task.interrupted",
        "result_code": None,
        "error": "Launcher was closed before the task finished.",
        "details": interrupted_details,
    }


def push_task_history(
    history: List[Dict[str, Any]],
    record: Dict[str, Any],
    *,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    next_history = [entry for entry in history if entry.get("task_id") != record.get("task_id")]
    next_history.insert(0, record)
    return next_history[:limit]
