from __future__ import annotations

import json
import math
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from mikazuki.log import log
from mikazuki.plugins.training_protocol import (
    build_after_backward_payload,
    build_after_loss_payload,
    build_after_optimizer_step_payload,
    build_before_forward_payload,
    build_before_optimizer_step_payload,
    build_modify_loss_payload,
    resolve_training_identity,
)
from mikazuki.plugins.runtime import plugin_runtime


_RUNTIME_INIT_LOCK = threading.Lock()
_RUNTIME_READY = False
_RUNTIME_FAILED = False
_FASTPATH_PROBE_LOCK = threading.Lock()
_FASTPATH_PROBED = False
_FASTPATH_HAS_ACTIVE_HOOKS: bool | None = None
_FASTPATH_ACTIVE_EVENTS: frozenset[str] | None = None
_FASTPATH_UNRESTRICTED_EVENTS: frozenset[str] | None = None
_FASTPATH_EVENT_TRAINING_TYPES: dict[str, frozenset[str]] | None = None
_TRAINING_HOOK_FASTPATH_SCHEMA = "plugin-training-fastpath-v1"


@dataclass(frozen=True)
class LossMutationResult:
    loss: Any
    raw_loss_value: float
    final_loss_value: float
    scale: float
    bias: float
    modified: bool
    reason: str
    metadata: dict[str, Any]
    dispatch: dict


def _empty_dispatch(event: str, *, result_payload: dict | None = None) -> dict:
    dispatch = {
        "event": str(event or "").strip(),
        "handled": 0,
        "errors": [],
        "skipped": [],
        "exclusive_conflict": False,
        "mutated": False,
        "elapsed_ms": 0.0,
        "slow_handler_threshold_ms": 0.0,
        "slow_handlers": 0,
        "handlers": [],
    }
    if result_payload is not None:
        dispatch["result_payload"] = result_payload
    return dispatch


def _to_finite_float(value: Any, default: float) -> float:
    try:
        normalized = float(value)
    except (TypeError, ValueError):
        return float(default)
    if not math.isfinite(normalized):
        return float(default)
    return normalized


def _training_hook_fastpath_state_path() -> Path:
    return plugin_runtime.training_hook_fastpath_path


def _plugin_root_has_manifests() -> bool:
    plugin_root = plugin_runtime.plugin_root
    if not plugin_root.exists() or not plugin_root.is_dir():
        return False
    try:
        for item in plugin_root.iterdir():
            if item.is_dir() and (item / "plugin_manifest.json").exists():
                return True
    except Exception:
        return True
    return False


def _is_training_hook_fastpath_snapshot_stale(snapshot_path: Path) -> bool:
    try:
        snapshot_mtime = float(snapshot_path.stat().st_mtime)
    except OSError:
        return True

    candidate_paths = [
        plugin_runtime.enabled_store_path,
        plugin_runtime.approval_store_path,
        plugin_runtime.trust_store_path,
        plugin_runtime.repo_root / "assets" / "config.json",
    ]

    plugin_root = plugin_runtime.plugin_root
    if plugin_root.exists() and plugin_root.is_dir():
        try:
            for item in plugin_root.iterdir():
                if item.is_dir():
                    candidate_paths.append(item / "plugin_manifest.json")
        except Exception:
            return True

    for candidate in candidate_paths:
        try:
            if candidate.exists() and float(candidate.stat().st_mtime) > snapshot_mtime:
                return True
        except OSError:
            return True
    return False


def _normalize_fastpath_training_type_map(raw_value: Any) -> dict[str, frozenset[str]]:
    if not isinstance(raw_value, dict):
        return {}
    normalized: dict[str, frozenset[str]] = {}
    for key, value in raw_value.items():
        event_name = str(key or "").strip()
        if not event_name:
            continue
        if not isinstance(value, (list, tuple, set, frozenset)):
            continue
        normalized[event_name] = frozenset(
            str(item).strip()
            for item in value
            if str(item).strip()
        )
    return normalized


def _parse_training_hook_fastpath_payload(
    payload: dict,
) -> tuple[bool, frozenset[str], frozenset[str], dict[str, frozenset[str]]]:
    events_raw = payload.get("active_training_hooks", [])
    if not isinstance(events_raw, list):
        events_raw = []
    active_events = frozenset(
        str(item).strip()
        for item in events_raw
        if str(item).strip()
    )
    unrestricted_raw = payload.get("active_training_unrestricted_hooks", [])
    if not isinstance(unrestricted_raw, list):
        unrestricted_raw = []
    unrestricted_events = frozenset(
        str(item).strip()
        for item in unrestricted_raw
        if str(item).strip()
    )
    event_training_types = _normalize_fastpath_training_type_map(
        payload.get("active_training_hook_training_types", {})
    )
    has_active_hooks = bool(payload.get("has_active_training_hooks", len(active_events) > 0))
    return has_active_hooks, active_events, unrestricted_events, event_training_types


def _load_training_hook_fastpath_probe() -> tuple[
    bool | None,
    frozenset[str] | None,
    frozenset[str] | None,
    dict[str, frozenset[str]] | None,
]:
    snapshot_path = _training_hook_fastpath_state_path()
    if snapshot_path.exists() and not _is_training_hook_fastpath_snapshot_stale(snapshot_path):
        try:
            with open(snapshot_path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if isinstance(payload, dict) and str(payload.get("schema", "")).strip() == _TRAINING_HOOK_FASTPATH_SCHEMA:
                return _parse_training_hook_fastpath_payload(payload)
        except Exception:
            pass

    if not _plugin_root_has_manifests():
        return False, frozenset(), frozenset(), {}

    return None, None, None, None


def _ensure_training_hook_fastpath_state() -> None:
    global _FASTPATH_PROBED, _FASTPATH_HAS_ACTIVE_HOOKS, _FASTPATH_ACTIVE_EVENTS
    global _FASTPATH_UNRESTRICTED_EVENTS, _FASTPATH_EVENT_TRAINING_TYPES
    if _FASTPATH_PROBED:
        return

    with _FASTPATH_PROBE_LOCK:
        if _FASTPATH_PROBED:
            return
        (
            _FASTPATH_HAS_ACTIVE_HOOKS,
            _FASTPATH_ACTIVE_EVENTS,
            _FASTPATH_UNRESTRICTED_EVENTS,
            _FASTPATH_EVENT_TRAINING_TYPES,
        ) = _load_training_hook_fastpath_probe()
        _FASTPATH_PROBED = True


def _refresh_training_hook_fastpath_from_runtime() -> None:
    global _FASTPATH_PROBED, _FASTPATH_HAS_ACTIVE_HOOKS, _FASTPATH_ACTIVE_EVENTS
    global _FASTPATH_UNRESTRICTED_EVENTS, _FASTPATH_EVENT_TRAINING_TYPES
    try:
        payload = plugin_runtime.get_training_hook_fastpath_state()
    except Exception:
        return
    if not isinstance(payload, dict):
        return

    (
        _FASTPATH_HAS_ACTIVE_HOOKS,
        _FASTPATH_ACTIVE_EVENTS,
        _FASTPATH_UNRESTRICTED_EVENTS,
        _FASTPATH_EVENT_TRAINING_TYPES,
    ) = _parse_training_hook_fastpath_payload(payload)
    _FASTPATH_PROBED = True


def _training_event_maybe_active(event: str, *, route: Any, training_type: Any) -> bool | None:
    event_name = str(event or "").strip()
    if not event_name:
        return False

    _ensure_training_hook_fastpath_state()
    if _FASTPATH_HAS_ACTIVE_HOOKS is False:
        return False
    if _FASTPATH_HAS_ACTIVE_HOOKS is True:
        if event_name not in (_FASTPATH_ACTIVE_EVENTS or frozenset()):
            return False
        if event_name in (_FASTPATH_UNRESTRICTED_EVENTS or frozenset()):
            return True
        event_training_types = (_FASTPATH_EVENT_TRAINING_TYPES or {}).get(event_name)
        if event_training_types is None:
            return True
        identity = resolve_training_identity(route=route, training_type=training_type)
        return str(identity.get("training_type", "")).strip() in event_training_types
    return None


def _ensure_training_runtime_ready() -> bool:
    global _RUNTIME_READY, _RUNTIME_FAILED
    if _RUNTIME_READY:
        return True
    if _RUNTIME_FAILED:
        return False

    with _RUNTIME_INIT_LOCK:
        if _RUNTIME_READY:
            return True
        if _RUNTIME_FAILED:
            return False
        try:
            from mikazuki.app.config import app_config

            app_config.load_config()
            plugin_runtime.initialize_from_config(app_config)
            _refresh_training_hook_fastpath_from_runtime()
            _RUNTIME_READY = True
            return True
        except Exception as exc:
            _RUNTIME_FAILED = True
            log.warning("[plugin-training] failed to initialize plugin runtime in training process: %s", exc)
            return False


def _emit_training_event(
    event: str,
    payload_factory: Callable[[], dict],
    *,
    source: str,
    route: Any,
    training_type: Any,
) -> dict:
    event_name = str(event or "").strip()
    if not event_name:
        return _empty_dispatch(event_name)
    if _training_event_maybe_active(event_name, route=route, training_type=training_type) is False:
        return _empty_dispatch(event_name)
    if not _ensure_training_runtime_ready():
        return _empty_dispatch(event_name)

    try:
        if not plugin_runtime.has_handlers(event_name):
            return _empty_dispatch(event_name)
        payload = payload_factory() or {}
        return plugin_runtime.emit_event(event_name, payload, source=source, audit=False)
    except Exception as exc:
        log.warning("[plugin-training] failed to emit event=%s source=%s err=%s", event_name, source, exc)
        return _empty_dispatch(event_name)


def _emit_training_mutation_event(
    event: str,
    payload_factory: Callable[[], dict],
    *,
    source: str,
    route: Any,
    training_type: Any,
) -> dict:
    event_name = str(event or "").strip()
    if not event_name:
        return _empty_dispatch(event_name)
    if _training_event_maybe_active(event_name, route=route, training_type=training_type) is False:
        return _empty_dispatch(event_name)
    if not _ensure_training_runtime_ready():
        return _empty_dispatch(event_name)

    try:
        if not plugin_runtime.has_handlers(event_name):
            return _empty_dispatch(event_name)
        payload = payload_factory() or {}
        dispatch = plugin_runtime.emit_mutation_event(event_name, payload, source=source, audit=False)
        if "result_payload" not in dispatch:
            dispatch["result_payload"] = payload
        return dispatch
    except Exception as exc:
        log.warning("[plugin-training] failed to emit mutation event=%s source=%s err=%s", event_name, source, exc)
        return _empty_dispatch(event_name)


def emit_before_forward_event(
    *,
    route: str,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    def _payload() -> dict:
        return build_before_forward_payload(
            route=route,
            training_type=training_type,
            global_step=global_step,
            micro_batch_index=micro_batch_index,
            micro_batch_count=micro_batch_count,
            micro_batch_size=micro_batch_size,
            gradient_accumulation_steps=gradient_accumulation_steps,
            sync_gradients=sync_gradients,
            extra=extra,
            source=source,
        )

    return _emit_training_event("before_forward", _payload, source=source, route=route, training_type=training_type)


def emit_after_loss_event(
    *,
    route: str,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    loss_value: Any,
    loss_scale: Any,
    weighted_loss: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    def _payload() -> dict:
        return build_after_loss_payload(
            route=route,
            training_type=training_type,
            global_step=global_step,
            micro_batch_index=micro_batch_index,
            micro_batch_count=micro_batch_count,
            micro_batch_size=micro_batch_size,
            loss_value=loss_value,
            loss_scale=loss_scale,
            weighted_loss=weighted_loss,
            gradient_accumulation_steps=gradient_accumulation_steps,
            sync_gradients=sync_gradients,
            extra=extra,
            source=source,
        )

    return _emit_training_event("after_loss", _payload, source=source, route=route, training_type=training_type)


def apply_modify_loss_event(
    *,
    loss,
    route: str,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    loss_value: Any,
    loss_scale: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> LossMutationResult:
    raw_loss_value = _to_finite_float(loss_value, 0.0)

    def _payload() -> dict:
        return build_modify_loss_payload(
            route=route,
            training_type=training_type,
            global_step=global_step,
            micro_batch_index=micro_batch_index,
            micro_batch_count=micro_batch_count,
            micro_batch_size=micro_batch_size,
            loss_value=raw_loss_value,
            loss_scale=loss_scale,
            gradient_accumulation_steps=gradient_accumulation_steps,
            sync_gradients=sync_gradients,
            extra=extra,
            source=source,
        )

    dispatch = _emit_training_mutation_event(
        "modify_loss",
        _payload,
        source=source,
        route=route,
        training_type=training_type,
    )
    result_payload = dispatch.get("result_payload")
    mutation = result_payload.get("mutation") if isinstance(result_payload, dict) else {}
    if not isinstance(mutation, dict):
        mutation = {}

    scale = _to_finite_float(mutation.get("scale"), 1.0)
    bias = _to_finite_float(mutation.get("bias"), 0.0)
    reason = str(mutation.get("reason", "") or "").strip()[:256]
    metadata = mutation.get("metadata") if isinstance(mutation.get("metadata"), dict) else {}
    modified = abs(scale - 1.0) > 1e-12 or abs(bias) > 1e-12
    final_loss = loss if not modified else (loss * scale + bias)

    try:
        final_loss_value = _to_finite_float(final_loss.detach().item(), raw_loss_value * scale + bias)
    except Exception:
        final_loss_value = _to_finite_float(raw_loss_value * scale + bias, raw_loss_value)

    return LossMutationResult(
        loss=final_loss,
        raw_loss_value=raw_loss_value,
        final_loss_value=final_loss_value,
        scale=scale,
        bias=bias,
        modified=modified,
        reason=reason,
        metadata=dict(metadata),
        dispatch=dispatch,
    )


def emit_after_backward_event(
    *,
    route: str,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    loss_value: Any,
    loss_scale: Any,
    backward_loss: Any,
    weighted_loss: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    def _payload() -> dict:
        return build_after_backward_payload(
            route=route,
            training_type=training_type,
            global_step=global_step,
            micro_batch_index=micro_batch_index,
            micro_batch_count=micro_batch_count,
            micro_batch_size=micro_batch_size,
            loss_value=loss_value,
            loss_scale=loss_scale,
            backward_loss=backward_loss,
            weighted_loss=weighted_loss,
            gradient_accumulation_steps=gradient_accumulation_steps,
            sync_gradients=sync_gradients,
            extra=extra,
            source=source,
        )

    return _emit_training_event("after_backward", _payload, source=source, route=route, training_type=training_type)


def emit_before_optimizer_step_event(
    *,
    route: str,
    training_type: Any,
    global_step: Any,
    current_loss: Any,
    optimizer,
    lr_scheduler,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    max_grad_norm: Any,
    extra: dict | None = None,
    source: str,
) -> dict:
    def _payload() -> dict:
        return build_before_optimizer_step_payload(
            route=route,
            training_type=training_type,
            global_step=global_step,
            current_loss=current_loss,
            optimizer=optimizer,
            lr_scheduler=lr_scheduler,
            gradient_accumulation_steps=gradient_accumulation_steps,
            sync_gradients=sync_gradients,
            max_grad_norm=max_grad_norm,
            extra=extra,
            source=source,
        )

    return _emit_training_event(
        "before_optimizer_step",
        _payload,
        source=source,
        route=route,
        training_type=training_type,
    )


def emit_after_optimizer_step_event(
    *,
    route: str,
    training_type: Any,
    global_step: Any,
    current_loss: Any,
    optimizer,
    lr_scheduler,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    max_grad_norm: Any,
    optimizer_step_executed: bool,
    scheduler_step_executed: bool,
    zero_grad_called: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    def _payload() -> dict:
        return build_after_optimizer_step_payload(
            route=route,
            training_type=training_type,
            global_step=global_step,
            current_loss=current_loss,
            optimizer=optimizer,
            lr_scheduler=lr_scheduler,
            gradient_accumulation_steps=gradient_accumulation_steps,
            sync_gradients=sync_gradients,
            max_grad_norm=max_grad_norm,
            optimizer_step_executed=optimizer_step_executed,
            scheduler_step_executed=scheduler_step_executed,
            zero_grad_called=zero_grad_called,
            extra=extra,
            source=source,
        )

    return _emit_training_event(
        "after_optimizer_step",
        _payload,
        source=source,
        route=route,
        training_type=training_type,
    )
