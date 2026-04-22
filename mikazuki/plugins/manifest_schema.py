from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from mikazuki.plugins.training_protocol import normalize_training_type_name


PLUGIN_MANIFEST_FILE = "plugin_manifest.json"
_PLUGIN_ID_PATTERN = re.compile(r"^[A-Za-z0-9._:-]+$")


@dataclass(frozen=True)
class PluginSignature:
    scheme: str
    signer: str
    signature: str
    hash: str
    files: tuple[str, ...]


@dataclass(frozen=True)
class PluginHookBinding:
    event: str
    handler: str
    priority: int
    training_types: tuple[str, ...] = ()


@dataclass(frozen=True)
class PluginManifest:
    schema_version: str
    plugin_id: str
    name: str
    version: str
    entry: str
    description: str
    capabilities: tuple[str, ...]
    hooks: tuple[PluginHookBinding, ...]
    min_core_version: str
    signature: PluginSignature | None
    enabled_by_default: bool


def _read_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError(f"Plugin manifest must be a JSON object: {path}")
    return payload


def _normalize_string(value) -> str:
    return str(value or "").strip()


def _normalize_capabilities(raw_caps) -> tuple[str, ...]:
    if raw_caps is None:
        return tuple()
    if not isinstance(raw_caps, list):
        raise ValueError("manifest.capabilities must be an array")
    normalized: list[str] = []
    for item in raw_caps:
        item_text = _normalize_string(item)
        if not item_text:
            continue
        if item_text not in normalized:
            normalized.append(item_text)
    return tuple(normalized)


def _normalize_hooks(raw_hooks) -> tuple[PluginHookBinding, ...]:
    if raw_hooks is None:
        return tuple()
    if not isinstance(raw_hooks, list):
        raise ValueError("manifest.hooks must be an array")
    bindings: list[PluginHookBinding] = []
    for item in raw_hooks:
        if not isinstance(item, dict):
            raise ValueError("Each manifest.hooks item must be an object")
        event = _normalize_string(item.get("event"))
        handler = _normalize_string(item.get("handler"))
        if not event or not handler:
            raise ValueError("Each manifest.hooks item requires non-empty event and handler")
        try:
            priority = int(item.get("priority", 0) or 0)
        except (TypeError, ValueError):
            priority = 0
        training_types = _normalize_training_types(item.get("training_types"))
        bindings.append(
            PluginHookBinding(
                event=event,
                handler=handler,
                priority=priority,
                training_types=training_types,
            )
        )
    return tuple(bindings)


def _normalize_training_types(raw_training_types) -> tuple[str, ...]:
    if raw_training_types is None:
        return tuple()
    if not isinstance(raw_training_types, list):
        raise ValueError("manifest.hooks[*].training_types must be an array when provided")
    normalized: list[str] = []
    for item in raw_training_types:
        item_text = _normalize_string(item)
        if not item_text:
            continue
        if item_text in {"*", "all"}:
            return tuple()
        normalized_type = normalize_training_type_name(item_text)
        if not normalized_type:
            continue
        if normalized_type not in normalized:
            normalized.append(normalized_type)
    return tuple(normalized)


def _normalize_signature(raw_signature) -> PluginSignature | None:
    if raw_signature is None:
        return None
    if not isinstance(raw_signature, dict):
        raise ValueError("manifest.signature must be an object")
    files_raw = raw_signature.get("files", [])
    files: list[str] = []
    if isinstance(files_raw, list):
        for item in files_raw:
            item_text = _normalize_string(item).replace("\\", "/")
            if item_text:
                files.append(item_text)
    return PluginSignature(
        scheme=_normalize_string(raw_signature.get("scheme")) or "none",
        signer=_normalize_string(raw_signature.get("signer")),
        signature=_normalize_string(raw_signature.get("signature")),
        hash=_normalize_string(raw_signature.get("hash")),
        files=tuple(files),
    )


def load_plugin_manifest(manifest_path: Path) -> PluginManifest:
    payload = _read_json(manifest_path)

    plugin_id = _normalize_string(payload.get("id"))
    if not plugin_id:
        raise ValueError("manifest.id is required")
    if not _PLUGIN_ID_PATTERN.match(plugin_id):
        raise ValueError("manifest.id contains unsupported characters")

    version = _normalize_string(payload.get("version"))
    if not version:
        raise ValueError("manifest.version is required")

    return PluginManifest(
        schema_version=_normalize_string(payload.get("schema_version")) or "plugin-manifest-v1",
        plugin_id=plugin_id,
        name=_normalize_string(payload.get("name")) or plugin_id,
        version=version,
        entry=_normalize_string(payload.get("entry")) or "plugin.py",
        description=_normalize_string(payload.get("description")),
        capabilities=_normalize_capabilities(payload.get("capabilities")),
        hooks=_normalize_hooks(payload.get("hooks")),
        min_core_version=_normalize_string(payload.get("min_core_version")),
        signature=_normalize_signature(payload.get("signature")),
        enabled_by_default=bool(payload.get("enabled_by_default", True)),
    )


def build_plugin_identity_key(*, plugin_id: str, version: str, package_hash: str, signer: str) -> str:
    normalized_hash = _normalize_string(package_hash) or "unhashed"
    normalized_signer = _normalize_string(signer) or "unsigned"
    return f"{_normalize_string(plugin_id)}|{_normalize_string(version)}|{normalized_hash}|{normalized_signer}"
