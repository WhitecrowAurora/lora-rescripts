from __future__ import annotations

import copy
import threading
import time
from dataclasses import dataclass
from types import MappingProxyType
from typing import Any, Callable

from mikazuki.log import log
from mikazuki.plugins.hook_catalog import get_hook_definition


def freeze_payload(data: Any) -> Any:
    if isinstance(data, dict):
        return MappingProxyType({key: freeze_payload(value) for key, value in data.items()})
    if isinstance(data, list):
        return tuple(freeze_payload(item) for item in data)
    if isinstance(data, tuple):
        return tuple(freeze_payload(item) for item in data)
    if isinstance(data, set):
        return tuple(freeze_payload(item) for item in data)
    return data


@dataclass
class EventHandlerRegistration:
    plugin_id: str
    event: str
    handler_name: str
    handler: Callable[[Any], Any]
    priority: int = 0
    mutable: bool = False
    predicate: Callable[[Any], bool] | None = None
    skip_reason: str = ""


class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandlerRegistration]] = {}
        self._lock = threading.RLock()

    def clear(self) -> None:
        with self._lock:
            self._handlers = {}

    def register_handler(
        self,
        *,
        plugin_id: str,
        event: str,
        handler_name: str,
        handler: Callable[[Any], Any],
        priority: int = 0,
        mutable: bool = False,
        predicate: Callable[[Any], bool] | None = None,
        skip_reason: str = "",
    ) -> None:
        registration = EventHandlerRegistration(
            plugin_id=str(plugin_id or "").strip(),
            event=str(event or "").strip(),
            handler_name=str(handler_name or "").strip(),
            handler=handler,
            priority=int(priority or 0),
            mutable=bool(mutable),
            predicate=predicate if callable(predicate) else None,
            skip_reason=str(skip_reason or "").strip(),
        )
        if not registration.event:
            raise ValueError("event must not be empty")
        with self._lock:
            self._handlers.setdefault(registration.event, []).append(registration)

    def has_handlers(self, event: str) -> bool:
        event_name = str(event or "").strip()
        if not event_name:
            return False
        with self._lock:
            return len(self._handlers.get(event_name, [])) > 0

    def emit(
        self,
        event: str,
        payload: dict | None = None,
        *,
        slow_handler_threshold_ms: float = 25.0,
        capture_result_payload: bool = False,
    ) -> dict:
        event_name = str(event or "").strip()
        hook_definition = get_hook_definition(event_name)
        with self._lock:
            handlers = list(self._handlers.get(event_name, []))
        handlers.sort(key=lambda item: int(item.priority), reverse=True)
        normalized_slow_threshold = max(0.0, float(slow_handler_threshold_ms or 0.0))
        report = {
            "event": event_name,
            "handled": 0,
            "errors": [],
            "skipped": [],
            "exclusive_conflict": False,
            "mutated": False,
            "elapsed_ms": 0.0,
            "slow_handler_threshold_ms": normalized_slow_threshold,
            "slow_handlers": 0,
            "handlers": [],
        }
        if not handlers:
            return report

        dispatch_start = time.perf_counter()
        if hook_definition is not None and hook_definition.exclusive and len(handlers) > 1:
            report["exclusive_conflict"] = True
            skipped_items = handlers[1:]
            for skipped in skipped_items:
                report["skipped"].append(
                    {
                        "plugin_id": skipped.plugin_id,
                        "handler": skipped.handler_name,
                        "reason": "exclusive_hook_conflict",
                    }
                )
            handlers = handlers[:1]

        event_payload = copy.deepcopy(payload or {})
        for handler in handlers:
            handler_start = time.perf_counter()
            status = "ok"
            error_message = ""
            try:
                if callable(handler.predicate) and not handler.predicate(event_payload):
                    status = "skipped"
                    report["skipped"].append(
                        {
                            "plugin_id": handler.plugin_id,
                            "handler": handler.handler_name,
                            "reason": handler.skip_reason or "predicate_filtered",
                        }
                    )
                else:
                    if hook_definition is not None and (hook_definition.read_only_payload or not hook_definition.allows_mutation):
                        handler_payload = freeze_payload(event_payload)
                        result = handler.handler(handler_payload)
                    else:
                        if not handler.mutable:
                            handler_payload = freeze_payload(event_payload)
                            result = handler.handler(handler_payload)
                        else:
                            before_payload = copy.deepcopy(event_payload)
                            handler_payload = event_payload
                            result = handler.handler(handler_payload)
                            if isinstance(result, dict):
                                event_payload = result
                            if event_payload != before_payload:
                                report["mutated"] = True
                    report["handled"] += 1
            except Exception as exc:
                status = "error"
                error_message = str(exc)
                log.warning(
                    "[plugin-event] handler failed: event=%s plugin=%s handler=%s err=%s",
                    event_name,
                    handler.plugin_id,
                    handler.handler_name,
                    exc,
                )
                report["errors"].append(
                    {
                        "plugin_id": handler.plugin_id,
                        "handler": handler.handler_name,
                        "error": error_message,
                    }
                )
            duration_ms = round((time.perf_counter() - handler_start) * 1000.0, 3)
            is_slow = normalized_slow_threshold > 0.0 and duration_ms >= normalized_slow_threshold
            if is_slow:
                report["slow_handlers"] += 1
            handler_report = {
                "plugin_id": handler.plugin_id,
                "handler": handler.handler_name,
                "priority": int(handler.priority),
                "mutable": bool(handler.mutable),
                "status": status,
                "duration_ms": duration_ms,
                "slow": is_slow,
            }
            if error_message:
                handler_report["error"] = error_message
            report["handlers"].append(handler_report)
        report["elapsed_ms"] = round((time.perf_counter() - dispatch_start) * 1000.0, 3)
        if capture_result_payload:
            report["result_payload"] = copy.deepcopy(event_payload)
        return report
