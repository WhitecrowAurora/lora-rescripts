from __future__ import annotations

import copy
import json
import os
import threading
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from mikazuki.log import log
from mikazuki.plugins.approval_store import (
    check_plugin_approval,
    grant_plugin_approval,
    revoke_plugin_approval,
)
from mikazuki.plugins.audit_log import append_audit_event, list_recent_audit_events
from mikazuki.plugins.capabilities import list_capabilities
from mikazuki.plugins.enabled_store import (
    clear_plugin_enabled_override,
    load_enabled_store,
    resolve_plugin_enabled_state,
    set_plugin_enabled_override,
)
from mikazuki.plugins.event_bus import EventBus
from mikazuki.plugins.hook_catalog import get_hook_definition, list_hooks
from mikazuki.plugins.manifest_schema import (
    PLUGIN_MANIFEST_FILE,
    PluginManifest,
    load_plugin_manifest,
)
from mikazuki.plugins.policy import (
    PolicyDecision,
    collect_required_capabilities,
    evaluate_policy,
    infer_required_tier,
)
from mikazuki.plugins.training_protocol import (
    TRAINING_EVENT_PROTOCOL_VERSION,
    get_training_event_protocol,
    list_training_event_protocols,
    resolve_training_identity,
)
from mikazuki.plugins.signature_verify import (
    compute_canonical_package_hash,
    evaluate_trust_policy,
    load_trust_store,
    verify_signature,
)
from mikazuki.plugins.tier1_api import Tier1PluginContext, Tier1PluginLogger
from mikazuki.plugins.tier1_loader import invoke_plugin_callable, load_tier1_plugin_source

_SUPPORTED_MUTATION_HOOKS = frozenset({"modify_loss"})
_RUNTIME_EXECUTION_MODE = "tier1-tier2-readonly+tier3-modify-loss-mvp"
_TRAINING_HOOK_FASTPATH_SCHEMA = "plugin-training-fastpath-v1"


def _to_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    normalized = str(value).strip().lower()
    return normalized in {"1", "true", "yes", "on"}


def _to_non_negative_float(value, default: float) -> float:
    try:
        normalized = float(value)
    except (TypeError, ValueError):
        return float(default)
    if normalized < 0:
        return float(default)
    return normalized


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_training_type_filters(values: Any) -> frozenset[str]:
    if not isinstance(values, (list, tuple, set, frozenset)):
        return frozenset()
    normalized: list[str] = []
    for item in values:
        item_text = str(item or "").strip().lower()
        if not item_text:
            continue
        if item_text not in normalized:
            normalized.append(item_text)
    return frozenset(normalized)


def _payload_training_type_matches(payload: Any, allowed_training_types: frozenset[str]) -> bool:
    if not allowed_training_types:
        return True
    if not isinstance(payload, dict):
        return False
    identity = resolve_training_identity(
        route=payload.get("route"),
        training_type=payload.get("training_type") or payload.get("declared_training_type"),
    )
    return str(identity.get("training_type", "")).strip() in allowed_training_types


def _new_dispatch_summary() -> dict[str, Any]:
    return {
        "event_count": 0,
        "handler_calls": 0,
        "error_count": 0,
        "slow_handler_count": 0,
        "exclusive_conflict_count": 0,
        "total_elapsed_ms": 0.0,
        "avg_elapsed_ms": 0.0,
        "max_elapsed_ms": 0.0,
        "last_event": "",
        "last_source": "",
        "last_ts": "",
    }


def _new_event_dispatch_stats(event: str) -> dict[str, Any]:
    return {
        "event": str(event or "").strip(),
        "count": 0,
        "handler_calls": 0,
        "error_count": 0,
        "slow_handler_count": 0,
        "exclusive_conflict_count": 0,
        "total_elapsed_ms": 0.0,
        "avg_elapsed_ms": 0.0,
        "max_elapsed_ms": 0.0,
        "last_elapsed_ms": 0.0,
        "last_source": "",
        "last_ts": "",
    }


def _new_plugin_dispatch_stats(plugin_id: str) -> dict[str, Any]:
    return {
        "plugin_id": str(plugin_id or "").strip(),
        "handler_calls": 0,
        "ok_count": 0,
        "error_count": 0,
        "slow_count": 0,
        "total_duration_ms": 0.0,
        "avg_duration_ms": 0.0,
        "max_duration_ms": 0.0,
        "last_event": "",
        "last_source": "",
        "last_handler": "",
        "last_status": "",
        "last_duration_ms": 0.0,
        "last_ts": "",
    }


@dataclass
class RuntimePluginRecord:
    manifest: PluginManifest
    root_dir: Path
    manifest_path: Path
    package_hash: str
    signature_result: dict
    trust_result: dict
    approval_result: dict
    policy_decision: PolicyDecision
    required_capabilities: list[str]
    hash_file_list: list[str]
    hash_missing_files: list[str]
    enabled_state: dict[str, Any] | None = None
    entry_path: Path | None = None
    execution_allowed: bool = False
    module_name: str = ""
    load_error: str = ""
    loaded: bool = False
    registered_hooks: list[dict] | None = None


class PluginRuntime:
    def __init__(self, repo_root: Path | None = None) -> None:
        self.repo_root = (repo_root or Path(__file__).resolve().parents[2]).resolve()
        self.plugin_root = self.repo_root / "plugin" / "backend"
        self.config_root = self.repo_root / "config" / "plugins"
        self.approval_store_path = self.config_root / "approvals.json"
        self.enabled_store_path = self.config_root / "enabled.json"
        self.trust_store_path = self.config_root / "community_trust.json"
        self.audit_log_path = self.config_root / "audit.jsonl"
        self.training_hook_fastpath_path = self.config_root / "training_hooks_state.json"
        self.execution_mode = _RUNTIME_EXECUTION_MODE
        self.supported_mutation_hooks = _SUPPORTED_MUTATION_HOOKS
        self.developer_mode = False
        self.slow_handler_threshold_ms = _to_non_negative_float(
            os.environ.get("MIKAZUKI_PLUGIN_SLOW_HANDLER_MS"),
            25.0,
        )
        self._records: dict[str, RuntimePluginRecord] = {}
        self._training_hook_fastpath_state = {
            "schema": _TRAINING_HOOK_FASTPATH_SCHEMA,
            "generated_at": "",
            "developer_mode": False,
            "execution_mode": self.execution_mode,
            "has_active_training_hooks": False,
            "active_training_hooks": [],
            "active_training_hook_counts": {},
            "active_training_unrestricted_hooks": [],
            "active_training_hook_training_types": {},
            "active_training_hook_training_type_counts": {},
            "active_training_handler_count": 0,
            "active_training_plugin_ids": [],
        }
        self._dispatch_diagnostics = {
            "slow_handler_threshold_ms": self.slow_handler_threshold_ms,
            "summary": _new_dispatch_summary(),
            "events": {},
            "plugins": {},
            "recent_anomalies": [],
        }
        self._dispatch_anomaly_cooldowns: dict[str, float] = {}
        self._lock = threading.Lock()
        self.event_bus = EventBus()

    def initialize_from_config(self, app_config) -> None:
        self.developer_mode = _to_bool(app_config["plugin_developer_mode"])
        self.reload()
        append_audit_event(
            self.audit_log_path,
            event_type="plugin_runtime_initialized",
            payload={
                "developer_mode": self.developer_mode,
                "execution_mode": self.execution_mode,
                "plugin_root": str(self.plugin_root),
            },
        )

    def set_developer_mode(self, enabled: bool) -> None:
        self.developer_mode = bool(enabled)
        append_audit_event(
            self.audit_log_path,
            event_type="plugin_developer_mode_changed",
            level="warning" if self.developer_mode else "info",
            payload={"enabled": self.developer_mode},
        )
        self.reload()

    def _scan_plugin_dirs(self) -> list[Path]:
        if not self.plugin_root.exists():
            return []
        return sorted(
            [item for item in self.plugin_root.iterdir() if item.is_dir()],
            key=lambda item: item.name.lower(),
        )

    def _resolve_entry_path(self, plugin_dir: Path, manifest: PluginManifest) -> Path:
        entry_rel = str(manifest.entry or "").replace("\\", "/").strip() or "plugin.py"
        entry_path = (plugin_dir / entry_rel).resolve()
        try:
            entry_path.relative_to(plugin_dir.resolve())
        except ValueError as exc:
            raise ValueError(f"entry path escapes plugin root: {entry_rel}") from exc
        if not entry_path.exists() or not entry_path.is_file():
            raise ValueError(f"entry file not found: {entry_rel}")
        if entry_path.suffix.lower() != ".py":
            raise ValueError("Plugin entry must be a Python file")
        return entry_path

    def _build_module_name(self, manifest: PluginManifest, package_hash: str) -> str:
        del package_hash
        return f"plugin-inline:{manifest.plugin_id}"

    def _build_plugin_context(self, record: RuntimePluginRecord) -> Tier1PluginContext:
        manifest = record.manifest
        plugin_data_dir = self.config_root / "data" / manifest.plugin_id.replace(":", "_")
        plugin_data_dir.mkdir(parents=True, exist_ok=True)
        logger = Tier1PluginLogger(manifest.plugin_id)

        def _audit_callback(*, event_type: str, level: str = "info", payload: dict | None = None) -> dict:
            return append_audit_event(
                self.audit_log_path,
                event_type=f"plugin_user_event:{str(event_type or '').strip() or 'unknown'}",
                level=level,
                plugin_id=manifest.plugin_id,
                payload=payload or {},
            )

        return Tier1PluginContext(
            plugin_id=manifest.plugin_id,
            name=manifest.name,
            version=manifest.version,
            plugin_root=str(record.root_dir),
            data_root=str(plugin_data_dir),
            manifest_path=str(record.manifest_path),
            entry_path=str(record.entry_path or ""),
            package_hash=record.package_hash,
            capabilities=tuple(record.manifest.capabilities),
            hooks=tuple(item.event for item in record.manifest.hooks),
            logger=logger,
            _audit_callback=_audit_callback,
        )

    def _is_hook_runtime_supported(self, event: str) -> bool:
        hook_definition = get_hook_definition(event)
        if hook_definition is None:
            return False
        if int(hook_definition.tier) <= 2:
            return True
        return bool(hook_definition.allows_mutation) and str(event or "").strip() in self.supported_mutation_hooks

    def _is_hook_runtime_mutable(self, event: str) -> bool:
        hook_definition = get_hook_definition(event)
        if hook_definition is None:
            return False
        return bool(hook_definition.allows_mutation) and str(event or "").strip() in self.supported_mutation_hooks

    def _activate_plugin(self, record: RuntimePluginRecord) -> RuntimePluginRecord:
        if record.policy_decision.unknown_capabilities or record.policy_decision.unknown_hooks:
            record.load_error = "unknown_capabilities_or_hooks"
            return record
        if not record.policy_decision.enabled:
            reasons = [str(item).strip() for item in record.policy_decision.reasons if str(item).strip()]
            record.load_error = reasons[0] if reasons else "policy_disabled"
            return record
        unsupported_runtime_hooks = [
            hook.event
            for hook in record.manifest.hooks
            if not self._is_hook_runtime_supported(hook.event)
        ]
        if unsupported_runtime_hooks:
            record.load_error = f"unsupported_runtime_hooks:{','.join(sorted(set(unsupported_runtime_hooks)))}"
            return record

        try:
            record.entry_path = self._resolve_entry_path(record.root_dir, record.manifest)
            record.execution_allowed = True
            record.module_name = self._build_module_name(record.manifest, record.package_hash)
            context = self._build_plugin_context(record)
            plugin_exports = load_tier1_plugin_source(
                entry_path=record.entry_path,
                context=context,
            )
            setup_handler = plugin_exports.get("setup_plugin")
            if callable(setup_handler):
                invoke_plugin_callable(
                    setup_handler,
                    payload=None,
                    context=context,
                    phase="setup",
                )
            registered_hooks: list[dict] = []

            for hook in record.manifest.hooks:
                hook_definition = get_hook_definition(hook.event)
                handler = plugin_exports.get(hook.handler)
                if handler is None or not callable(handler):
                    raise ValueError(f"hook handler not found or not callable: {hook.handler}")
                allowed_training_types = _normalize_training_type_filters(hook.training_types)
                if allowed_training_types and get_training_event_protocol(hook.event) is None:
                    raise ValueError(
                        f"training_types filter is only supported for training hooks: {hook.event}"
                    )
                handler_wrapper = (
                    lambda payload, _handler=handler, _context=context: invoke_plugin_callable(
                        _handler,
                        payload=payload,
                        context=_context,
                        phase="event",
                    )
                )
                handler_predicate = None
                if allowed_training_types:
                    handler_predicate = (
                        lambda payload, _allowed_training_types=allowed_training_types: _payload_training_type_matches(
                            payload,
                            _allowed_training_types,
                        )
                    )
                self.event_bus.register_handler(
                    plugin_id=record.manifest.plugin_id,
                    event=hook.event,
                    handler_name=hook.handler,
                    handler=handler_wrapper,
                    priority=int(hook.priority),
                    mutable=bool(hook_definition is not None and self._is_hook_runtime_mutable(hook.event)),
                    predicate=handler_predicate,
                    skip_reason="training_type_filtered",
                )
                registered_hooks.append(
                    {
                        "event": hook.event,
                        "handler": hook.handler,
                        "priority": int(hook.priority),
                        "mutable": bool(hook_definition is not None and self._is_hook_runtime_mutable(hook.event)),
                        "training_types": sorted(allowed_training_types),
                    }
                )

            if len(registered_hooks) <= 0:
                raise ValueError("no Tier1 handlers were registered")

            record.loaded = True
            record.load_error = ""
            record.registered_hooks = registered_hooks
            append_audit_event(
                self.audit_log_path,
                event_type="plugin_loaded",
                plugin_id=record.manifest.plugin_id,
                payload={
                    "version": record.manifest.version,
                    "entry_path": str(record.entry_path),
                    "registered_hooks": registered_hooks,
                },
            )
            context.emit_audit(
                event_type="plugin_context_ready",
                payload={
                    "registered_hook_count": len(registered_hooks),
                },
            )
            return record
        except Exception as exc:
            record.loaded = False
            record.load_error = str(exc)
            record.registered_hooks = []
            append_audit_event(
                self.audit_log_path,
                event_type="plugin_load_failed",
                level="error",
                plugin_id=record.manifest.plugin_id,
                payload={
                    "version": record.manifest.version,
                    "error": str(exc),
                },
            )
            return record

    def _activate_executable_plugins(self, discovered: dict[str, RuntimePluginRecord]) -> dict[str, RuntimePluginRecord]:
        activated: dict[str, RuntimePluginRecord] = {}
        for plugin_id, record in discovered.items():
            activated[plugin_id] = self._activate_plugin(record)
        return activated

    def _build_training_hook_fastpath_state(self) -> dict:
        active_event_counts: dict[str, int] = {}
        active_event_training_type_counts: dict[str, dict[str, int]] = {}
        active_unrestricted_events: set[str] = set()
        active_plugin_ids: list[str] = []

        for record in self._records.values():
            if not record.loaded:
                continue

            plugin_has_training_hooks = False
            for hook in list(record.registered_hooks or []):
                event = str(hook.get("event", "")).strip()
                if not event or get_training_event_protocol(event) is None:
                    continue
                active_event_counts[event] = int(active_event_counts.get(event, 0) or 0) + 1
                hook_training_types = _normalize_training_type_filters(hook.get("training_types", []))
                if hook_training_types:
                    event_training_type_counts = active_event_training_type_counts.setdefault(event, {})
                    for training_type in hook_training_types:
                        event_training_type_counts[training_type] = (
                            int(event_training_type_counts.get(training_type, 0) or 0) + 1
                        )
                else:
                    active_unrestricted_events.add(event)
                plugin_has_training_hooks = True

            if plugin_has_training_hooks:
                active_plugin_ids.append(record.manifest.plugin_id)

        return {
            "schema": _TRAINING_HOOK_FASTPATH_SCHEMA,
            "generated_at": _utc_now_iso(),
            "developer_mode": bool(self.developer_mode),
            "execution_mode": self.execution_mode,
            "has_active_training_hooks": len(active_event_counts) > 0,
            "active_training_hooks": sorted(active_event_counts),
            "active_training_hook_counts": {
                key: int(active_event_counts[key]) for key in sorted(active_event_counts)
            },
            "active_training_unrestricted_hooks": sorted(active_unrestricted_events),
            "active_training_hook_training_types": {
                event: sorted(active_event_training_type_counts.get(event, {}))
                for event in sorted(active_event_training_type_counts)
            },
            "active_training_hook_training_type_counts": {
                event: {
                    training_type: int(active_event_training_type_counts[event][training_type])
                    for training_type in sorted(active_event_training_type_counts[event])
                }
                for event in sorted(active_event_training_type_counts)
            },
            "active_training_handler_count": sum(int(value) for value in active_event_counts.values()),
            "active_training_plugin_ids": sorted(active_plugin_ids),
        }

    def _persist_training_hook_fastpath_state(self) -> None:
        payload = dict(self._training_hook_fastpath_state or {})
        payload.setdefault("schema", _TRAINING_HOOK_FASTPATH_SCHEMA)
        try:
            self.config_root.mkdir(parents=True, exist_ok=True)
            with open(self.training_hook_fastpath_path, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, indent=2, ensure_ascii=False)
        except Exception as exc:
            log.warning("[plugin-runtime] failed to persist training hook fastpath state: %s", exc)

    def get_training_hook_fastpath_state(self) -> dict:
        with self._lock:
            return copy.deepcopy(self._training_hook_fastpath_state)

    def reload(self) -> dict:
        with self._lock:
            self.config_root.mkdir(parents=True, exist_ok=True)
            self.plugin_root.mkdir(parents=True, exist_ok=True)
            self.event_bus.clear()
            trust_store = load_trust_store(self.trust_store_path)
            enabled_store = load_enabled_store(self.enabled_store_path)
            discovered: dict[str, RuntimePluginRecord] = {}
            errors: list[dict] = []

            for plugin_dir in self._scan_plugin_dirs():
                manifest_path = plugin_dir / PLUGIN_MANIFEST_FILE
                if not manifest_path.exists():
                    continue
                try:
                    manifest = load_plugin_manifest(manifest_path)
                except Exception as exc:
                    error = {
                        "plugin_path": str(plugin_dir),
                        "reason": f"manifest_invalid:{exc}",
                    }
                    errors.append(error)
                    append_audit_event(
                        self.audit_log_path,
                        event_type="plugin_manifest_invalid",
                        level="error",
                        payload=error,
                    )
                    continue

                package_hash, file_list, missing_files = compute_canonical_package_hash(plugin_dir, manifest)
                signature_result = verify_signature(manifest=manifest, package_hash=package_hash)

                required_capabilities = collect_required_capabilities(manifest)
                required_tier, _, _ = infer_required_tier(manifest)
                signer = str(signature_result.get("signer", "") or "").strip()
                approval_result = check_plugin_approval(
                    self.approval_store_path,
                    manifest=manifest,
                    package_hash=package_hash,
                    signer=signer,
                    required_capabilities=required_capabilities,
                )
                trust_result = evaluate_trust_policy(
                    trust_store=trust_store,
                    manifest=manifest,
                    package_hash=package_hash,
                    signer=signer,
                    required_tier=required_tier,
                )
                if required_tier >= 3 and not bool(signature_result.get("ok")):
                    trust_result = {
                        "ok": False,
                        "reason": f"signature_invalid:{signature_result.get('reason', 'unknown')}",
                        "matched_allowlist": None,
                    }
                if missing_files:
                    trust_result = {
                        "ok": False if required_tier >= 3 else trust_result.get("ok", False),
                        "reason": "signature_file_missing",
                        "matched_allowlist": None,
                    }

                enabled_state = resolve_plugin_enabled_state(
                    enabled_store,
                    plugin_id=manifest.plugin_id,
                    default_enabled=manifest.enabled_by_default,
                )
                policy_decision = evaluate_policy(
                    manifest=manifest,
                    approval_result=approval_result,
                    trust_result=trust_result,
                    developer_mode=self.developer_mode,
                    activation_enabled=bool(enabled_state.get("requested_enabled", True)),
                    activation_reason=str(enabled_state.get("reason", "") or ""),
                )
                record = RuntimePluginRecord(
                    manifest=manifest,
                    root_dir=plugin_dir,
                    manifest_path=manifest_path,
                    package_hash=package_hash,
                    signature_result=signature_result,
                    trust_result=trust_result,
                    approval_result=approval_result,
                    policy_decision=policy_decision,
                    required_capabilities=required_capabilities,
                    hash_file_list=file_list,
                    hash_missing_files=missing_files,
                    enabled_state=enabled_state,
                    registered_hooks=[],
                )
                discovered[manifest.plugin_id] = record

                append_audit_event(
                    self.audit_log_path,
                    event_type="plugin_policy_evaluated",
                    level="info" if policy_decision.enabled else "warning",
                    plugin_id=manifest.plugin_id,
                    payload={
                        "version": manifest.version,
                        "tier": policy_decision.required_tier,
                        "enabled": policy_decision.enabled,
                        "requested_enabled": bool(enabled_state.get("requested_enabled", True)),
                        "activation_source": str(enabled_state.get("source", "") or ""),
                        "reasons": list(policy_decision.reasons),
                        "developer_mode": self.developer_mode,
                    },
                )

            discovered = self._activate_executable_plugins(discovered)
            self._records = discovered
            self._training_hook_fastpath_state = self._build_training_hook_fastpath_state()
            self._persist_training_hook_fastpath_state()
            summary = {
                "plugin_root": str(self.plugin_root),
                "discovered_plugins": len(self._records),
                "enabled_plugins": len([item for item in self._records.values() if item.policy_decision.enabled]),
                "loaded_plugins": len([item for item in self._records.values() if item.loaded]),
                "developer_mode": self.developer_mode,
                "execution_mode": self.execution_mode,
                "training_hook_fastpath": copy.deepcopy(self._training_hook_fastpath_state),
                "errors": errors,
            }
            append_audit_event(
                self.audit_log_path,
                event_type="plugin_runtime_reloaded",
                payload=summary,
            )
            return summary

    def get_status(self) -> dict:
        with self._lock:
            plugins = [self._serialize_record(item) for item in self._records.values()]
        plugins.sort(key=lambda item: str(item.get("plugin_id", "")).lower())
        return {
            "plugin_root": str(self.plugin_root),
            "config_root": str(self.config_root),
            "enabled_store_path": str(self.enabled_store_path),
            "developer_mode": self.developer_mode,
            "execution_mode": self.execution_mode,
            "supported_mutation_hooks": sorted(self.supported_mutation_hooks),
            "training_hook_fastpath": self.get_training_hook_fastpath_state(),
            "training_event_protocol": self.get_training_event_protocol_status(),
            "dispatch_diagnostics": self.get_dispatch_diagnostics(),
            "plugins": plugins,
            "enabled_count": len([item for item in plugins if item.get("enabled")]),
            "loaded_count": len([item for item in plugins if item.get("loaded")]),
            "total_count": len(plugins),
        }

    def _serialize_record(self, record: RuntimePluginRecord) -> dict:
        manifest = record.manifest
        return {
            "plugin_id": manifest.plugin_id,
            "name": manifest.name,
            "version": manifest.version,
            "description": manifest.description,
            "path": str(record.root_dir),
            "manifest_path": str(record.manifest_path),
            "entry": manifest.entry,
            "entry_path": str(record.entry_path) if record.entry_path is not None else "",
            "enabled": record.policy_decision.enabled,
            "manifest_enabled_by_default": bool(manifest.enabled_by_default),
            "activation": dict(record.enabled_state or {}),
            "execution_allowed": record.execution_allowed,
            "loaded": record.loaded,
            "load_error": record.load_error,
            "module_name": record.module_name,
            "tier": record.policy_decision.required_tier,
            "capabilities": list(manifest.capabilities),
            "required_capabilities": list(record.required_capabilities),
            "hooks": [
                {
                    "event": hook.event,
                    "handler": hook.handler,
                    "priority": hook.priority,
                    "training_types": list(hook.training_types),
                }
                for hook in manifest.hooks
            ],
            "registered_hooks": list(record.registered_hooks or []),
            "registered_handler_count": len(record.registered_hooks or []),
            "package_hash": record.package_hash,
            "hash_files": list(record.hash_file_list),
            "hash_missing_files": list(record.hash_missing_files),
            "signature": dict(record.signature_result),
            "trust": dict(record.trust_result),
            "approval": dict(record.approval_result),
            "policy": {
                "activation_enabled": record.policy_decision.activation_enabled,
                "activation_reason": record.policy_decision.activation_reason,
                "requires_user_approval": record.policy_decision.requires_user_approval,
                "requires_trust_verification": record.policy_decision.requires_trust_verification,
                "approved": record.policy_decision.approved,
                "trust_ok": record.policy_decision.trust_ok,
                "reasons": list(record.policy_decision.reasons),
                "unknown_capabilities": list(record.policy_decision.unknown_capabilities),
                "unknown_hooks": list(record.policy_decision.unknown_hooks),
            },
        }

    def approve_plugin(self, plugin_id: str, *, approved_by: str = "local-user") -> dict:
        normalized = str(plugin_id or "").strip()
        if not normalized:
            raise ValueError("plugin_id is required")
        with self._lock:
            record = self._records.get(normalized)
        if record is None:
            raise ValueError(f"Plugin not found: {normalized}")

        signer = str(record.signature_result.get("signer", "") or "").strip()
        approval_record = grant_plugin_approval(
            self.approval_store_path,
            manifest=record.manifest,
            package_hash=record.package_hash,
            signer=signer,
            capabilities=record.required_capabilities,
            approved_by=approved_by,
        )
        append_audit_event(
            self.audit_log_path,
            event_type="plugin_approval_granted",
            plugin_id=normalized,
            payload=approval_record,
        )
        self.reload()
        return approval_record

    def set_plugin_enabled(self, plugin_id: str, *, enabled: bool, updated_by: str = "local-user") -> dict:
        normalized = str(plugin_id or "").strip()
        if not normalized:
            raise ValueError("plugin_id is required")
        with self._lock:
            record = self._records.get(normalized)
        if record is None:
            raise ValueError(f"Plugin not found: {normalized}")

        enabled_record = set_plugin_enabled_override(
            self.enabled_store_path,
            plugin_id=normalized,
            enabled=bool(enabled),
            updated_by=updated_by,
        )
        append_audit_event(
            self.audit_log_path,
            event_type="plugin_enabled_state_changed",
            plugin_id=normalized,
            payload={
                **enabled_record,
                "manifest_enabled_by_default": bool(record.manifest.enabled_by_default),
            },
        )
        self.reload()
        return enabled_record

    def reset_plugin_enabled(self, plugin_id: str, *, updated_by: str = "local-user") -> dict:
        normalized = str(plugin_id or "").strip()
        if not normalized:
            raise ValueError("plugin_id is required")
        with self._lock:
            record = self._records.get(normalized)
        if record is None:
            raise ValueError(f"Plugin not found: {normalized}")

        removed = clear_plugin_enabled_override(
            self.enabled_store_path,
            plugin_id=normalized,
        )
        append_audit_event(
            self.audit_log_path,
            event_type="plugin_enabled_state_reset",
            plugin_id=normalized,
            payload={
                "plugin_id": normalized,
                "removed": removed,
                "updated_by": str(updated_by or "local-user").strip() or "local-user",
                "manifest_enabled_by_default": bool(record.manifest.enabled_by_default),
            },
        )
        self.reload()
        with self._lock:
            refreshed = self._records.get(normalized)
        return {
            "plugin_id": normalized,
            "removed": removed,
            "manifest_enabled_by_default": bool(record.manifest.enabled_by_default),
            "enabled": bool(refreshed.policy_decision.enabled) if refreshed is not None else False,
            "activation": dict((refreshed.enabled_state or {}) if refreshed is not None else {}),
        }

    def revoke_plugin_approval(self, plugin_id: str) -> int:
        normalized = str(plugin_id or "").strip()
        removed = revoke_plugin_approval(
            self.approval_store_path,
            plugin_id=normalized,
            all_versions=True,
        )
        append_audit_event(
            self.audit_log_path,
            event_type="plugin_approval_revoked",
            plugin_id=normalized,
            payload={"removed": removed},
        )
        self.reload()
        return removed

    def has_handlers(self, event: str) -> bool:
        return self.event_bus.has_handlers(event)

    def emit_event(
        self,
        event: str,
        payload: dict | None = None,
        *,
        source: str = "core",
        audit: bool = True,
    ) -> dict:
        dispatch = self.event_bus.emit(
            event,
            payload or {},
            slow_handler_threshold_ms=self.slow_handler_threshold_ms,
        )
        self._record_dispatch_diagnostics(
            event=event,
            source=source,
            dispatch=dispatch,
        )
        if audit:
            append_audit_event(
                self.audit_log_path,
                event_type="plugin_event_emitted",
                payload={
                    "event": str(event or "").strip(),
                    "source": str(source or "").strip() or "core",
                    "dispatch": dispatch,
                },
            )
        elif self._should_audit_dispatch_anomaly(event=event, source=source, dispatch=dispatch):
            append_audit_event(
                self.audit_log_path,
                event_type="plugin_event_diagnostic",
                level="warning",
                payload=self._build_dispatch_anomaly_payload(
                    event=event,
                    source=source,
                    dispatch=dispatch,
                ),
            )
        return dispatch

    def emit_mutation_event(
        self,
        event: str,
        payload: dict | None = None,
        *,
        source: str = "core",
        audit: bool = True,
    ) -> dict:
        dispatch = self.event_bus.emit(
            event,
            payload or {},
            slow_handler_threshold_ms=self.slow_handler_threshold_ms,
            capture_result_payload=True,
        )
        dispatch_for_logs = copy.deepcopy(dispatch)
        dispatch_for_logs.pop("result_payload", None)
        self._record_dispatch_diagnostics(
            event=event,
            source=source,
            dispatch=dispatch_for_logs,
        )
        if audit:
            append_audit_event(
                self.audit_log_path,
                event_type="plugin_mutation_event_emitted",
                payload={
                    "event": str(event or "").strip(),
                    "source": str(source or "").strip() or "core",
                    "dispatch": dispatch_for_logs,
                },
            )
        elif self._should_audit_dispatch_anomaly(event=event, source=source, dispatch=dispatch_for_logs):
            append_audit_event(
                self.audit_log_path,
                event_type="plugin_mutation_event_diagnostic",
                level="warning",
                payload=self._build_dispatch_anomaly_payload(
                    event=event,
                    source=source,
                    dispatch=dispatch_for_logs,
                ),
            )
        return dispatch

    def list_recent_audit(self, *, limit: int = 200) -> list[dict]:
        return list_recent_audit_events(self.audit_log_path, limit=limit)

    def list_capability_catalog(self) -> list[dict]:
        return list_capabilities()

    def list_hook_catalog(self) -> list[dict]:
        hooks = list_hooks()
        for hook in hooks:
            hook["runtime_supported"] = self._is_hook_runtime_supported(hook.get("event", ""))
            hook["runtime_mutable"] = self._is_hook_runtime_mutable(hook.get("event", ""))
            protocol = get_training_event_protocol(hook.get("event", ""))
            if protocol is not None:
                hook["payload_protocol"] = protocol
        return hooks

    def get_training_event_protocol_status(self) -> dict:
        return {
            "protocol_version": TRAINING_EVENT_PROTOCOL_VERSION,
            "events": list_training_event_protocols(),
        }

    def get_dispatch_diagnostics(self) -> dict:
        with self._lock:
            return copy.deepcopy(self._dispatch_diagnostics)

    def _record_dispatch_diagnostics(self, *, event: str, source: str, dispatch: dict) -> None:
        event_name = str(event or "").strip()
        source_name = str(source or "").strip() or "core"
        ts = _utc_now_iso()
        handlers = list(dispatch.get("handlers") or [])
        elapsed_ms = float(dispatch.get("elapsed_ms", 0.0) or 0.0)
        error_count = len(dispatch.get("errors") or [])
        slow_handler_count = int(dispatch.get("slow_handlers", 0) or 0)
        exclusive_conflict = bool(dispatch.get("exclusive_conflict"))

        with self._lock:
            summary = self._dispatch_diagnostics["summary"]
            summary["event_count"] += 1
            summary["handler_calls"] += len(handlers)
            summary["error_count"] += error_count
            summary["slow_handler_count"] += slow_handler_count
            if exclusive_conflict:
                summary["exclusive_conflict_count"] += 1
            summary["total_elapsed_ms"] = round(float(summary["total_elapsed_ms"]) + elapsed_ms, 3)
            summary["avg_elapsed_ms"] = round(
                float(summary["total_elapsed_ms"]) / max(1, int(summary["event_count"])),
                3,
            )
            summary["max_elapsed_ms"] = round(max(float(summary["max_elapsed_ms"]), elapsed_ms), 3)
            summary["last_event"] = event_name
            summary["last_source"] = source_name
            summary["last_ts"] = ts

            event_stats = self._dispatch_diagnostics["events"].setdefault(
                event_name,
                _new_event_dispatch_stats(event_name),
            )
            event_stats["count"] += 1
            event_stats["handler_calls"] += len(handlers)
            event_stats["error_count"] += error_count
            event_stats["slow_handler_count"] += slow_handler_count
            if exclusive_conflict:
                event_stats["exclusive_conflict_count"] += 1
            event_stats["total_elapsed_ms"] = round(float(event_stats["total_elapsed_ms"]) + elapsed_ms, 3)
            event_stats["avg_elapsed_ms"] = round(
                float(event_stats["total_elapsed_ms"]) / max(1, int(event_stats["count"])),
                3,
            )
            event_stats["max_elapsed_ms"] = round(max(float(event_stats["max_elapsed_ms"]), elapsed_ms), 3)
            event_stats["last_elapsed_ms"] = round(elapsed_ms, 3)
            event_stats["last_source"] = source_name
            event_stats["last_ts"] = ts

            for handler in handlers:
                plugin_id = str(handler.get("plugin_id", "")).strip() or "unknown"
                handler_duration_ms = float(handler.get("duration_ms", 0.0) or 0.0)
                handler_status = str(handler.get("status", "")).strip() or "ok"
                plugin_stats = self._dispatch_diagnostics["plugins"].setdefault(
                    plugin_id,
                    _new_plugin_dispatch_stats(plugin_id),
                )
                plugin_stats["handler_calls"] += 1
                if handler_status == "error":
                    plugin_stats["error_count"] += 1
                else:
                    plugin_stats["ok_count"] += 1
                if bool(handler.get("slow")):
                    plugin_stats["slow_count"] += 1
                plugin_stats["total_duration_ms"] = round(
                    float(plugin_stats["total_duration_ms"]) + handler_duration_ms,
                    3,
                )
                plugin_stats["avg_duration_ms"] = round(
                    float(plugin_stats["total_duration_ms"]) / max(1, int(plugin_stats["handler_calls"])),
                    3,
                )
                plugin_stats["max_duration_ms"] = round(
                    max(float(plugin_stats["max_duration_ms"]), handler_duration_ms),
                    3,
                )
                plugin_stats["last_event"] = event_name
                plugin_stats["last_source"] = source_name
                plugin_stats["last_handler"] = str(handler.get("handler", "")).strip()
                plugin_stats["last_status"] = handler_status
                plugin_stats["last_duration_ms"] = round(handler_duration_ms, 3)
                plugin_stats["last_ts"] = ts

            anomaly_entries = self._build_recent_anomaly_entries(
                event=event_name,
                source=source_name,
                dispatch=dispatch,
                ts=ts,
            )
            if anomaly_entries:
                recent_anomalies = self._dispatch_diagnostics["recent_anomalies"]
                recent_anomalies.extend(anomaly_entries)
                overflow = len(recent_anomalies) - 50
                if overflow > 0:
                    del recent_anomalies[:overflow]

    def _build_recent_anomaly_entries(self, *, event: str, source: str, dispatch: dict, ts: str) -> list[dict]:
        entries: list[dict] = []
        handlers = list(dispatch.get("handlers") or [])
        for handler in handlers:
            if not bool(handler.get("slow")) and str(handler.get("status", "")).strip() != "error":
                continue
            entries.append(
                {
                    "ts": ts,
                    "event": event,
                    "source": source,
                    "plugin_id": str(handler.get("plugin_id", "")).strip(),
                    "handler": str(handler.get("handler", "")).strip(),
                    "status": str(handler.get("status", "")).strip() or "ok",
                    "slow": bool(handler.get("slow")),
                    "duration_ms": round(float(handler.get("duration_ms", 0.0) or 0.0), 3),
                    "error": str(handler.get("error", "")).strip(),
                }
            )
        if bool(dispatch.get("exclusive_conflict")):
            entries.append(
                {
                    "ts": ts,
                    "event": event,
                    "source": source,
                    "plugin_id": "",
                    "handler": "",
                    "status": "exclusive_conflict",
                    "slow": False,
                    "duration_ms": round(float(dispatch.get("elapsed_ms", 0.0) or 0.0), 3),
                    "error": "",
                    "skipped": list(dispatch.get("skipped") or []),
                }
            )
        return entries

    def _has_dispatch_anomaly(self, dispatch: dict) -> bool:
        return bool(dispatch.get("exclusive_conflict")) or bool(dispatch.get("errors")) or int(
            dispatch.get("slow_handlers", 0) or 0
        ) > 0

    def _should_audit_dispatch_anomaly(self, *, event: str, source: str, dispatch: dict) -> bool:
        if not self._has_dispatch_anomaly(dispatch):
            return False

        if bool(dispatch.get("errors")) or bool(dispatch.get("exclusive_conflict")):
            cooldown_seconds = 5.0
            anomaly_kind = "error"
        else:
            cooldown_seconds = 30.0
            anomaly_kind = "slow"

        cooldown_key = f"{anomaly_kind}:{str(event or '').strip()}:{str(source or '').strip() or 'core'}"
        now = time.monotonic()
        with self._lock:
            last_ts = float(self._dispatch_anomaly_cooldowns.get(cooldown_key, 0.0) or 0.0)
            if now - last_ts < cooldown_seconds:
                return False
            self._dispatch_anomaly_cooldowns[cooldown_key] = now
        return True

    def _build_dispatch_anomaly_payload(self, *, event: str, source: str, dispatch: dict) -> dict:
        anomalous_handlers = [
            {
                "plugin_id": str(handler.get("plugin_id", "")).strip(),
                "handler": str(handler.get("handler", "")).strip(),
                "status": str(handler.get("status", "")).strip() or "ok",
                "duration_ms": round(float(handler.get("duration_ms", 0.0) or 0.0), 3),
                "slow": bool(handler.get("slow")),
                "error": str(handler.get("error", "")).strip(),
            }
            for handler in list(dispatch.get("handlers") or [])
            if bool(handler.get("slow")) or str(handler.get("status", "")).strip() == "error"
        ]
        return {
            "event": str(event or "").strip(),
            "source": str(source or "").strip() or "core",
            "elapsed_ms": round(float(dispatch.get("elapsed_ms", 0.0) or 0.0), 3),
            "slow_handler_threshold_ms": float(dispatch.get("slow_handler_threshold_ms", 0.0) or 0.0),
            "slow_handlers": int(dispatch.get("slow_handlers", 0) or 0),
            "exclusive_conflict": bool(dispatch.get("exclusive_conflict")),
            "errors": list(dispatch.get("errors") or []),
            "skipped": list(dispatch.get("skipped") or []),
            "handlers": anomalous_handlers,
        }

    def ensure_runtime_ready(self) -> None:
        if not self.config_root.exists():
            self.config_root.mkdir(parents=True, exist_ok=True)
        if not self.plugin_root.exists():
            self.plugin_root.mkdir(parents=True, exist_ok=True)

    def resolve_plugin(self, plugin_id: str) -> RuntimePluginRecord | None:
        with self._lock:
            return self._records.get(str(plugin_id or "").strip())


plugin_runtime = PluginRuntime()
