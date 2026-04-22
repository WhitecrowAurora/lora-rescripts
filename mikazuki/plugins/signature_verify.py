from __future__ import annotations

import hashlib
import json
from pathlib import Path

from mikazuki.plugins.manifest_schema import PluginManifest, PLUGIN_MANIFEST_FILE


TRUST_SCHEMA_VERSION = "plugin-trust-v1"


def _default_trust_store() -> dict:
    return {
        "schema": TRUST_SCHEMA_VERSION,
        "allowlist": [],
        "deny_hashes": [],
        "revoked_signers": [],
    }


def load_trust_store(path: Path) -> dict:
    if not path.exists():
        return _default_trust_store()
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except Exception:
        return _default_trust_store()
    if not isinstance(payload, dict):
        return _default_trust_store()
    return {
        "schema": str(payload.get("schema") or TRUST_SCHEMA_VERSION),
        "allowlist": [item for item in payload.get("allowlist", []) if isinstance(item, dict)],
        "deny_hashes": [str(item).strip() for item in payload.get("deny_hashes", []) if str(item).strip()],
        "revoked_signers": [str(item).strip() for item in payload.get("revoked_signers", []) if str(item).strip()],
    }


def save_trust_store(path: Path, payload: dict) -> None:
    data = {
        "schema": str(payload.get("schema") or TRUST_SCHEMA_VERSION),
        "allowlist": [item for item in payload.get("allowlist", []) if isinstance(item, dict)],
        "deny_hashes": [str(item).strip() for item in payload.get("deny_hashes", []) if str(item).strip()],
        "revoked_signers": [str(item).strip() for item in payload.get("revoked_signers", []) if str(item).strip()],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)


def _safe_rel_path(path: str) -> str:
    normalized = str(path or "").replace("\\", "/").strip()
    if normalized.startswith("/"):
        normalized = normalized[1:]
    if not normalized:
        raise ValueError("Empty file path in signature files list")
    parts = [item for item in normalized.split("/") if item not in {"", "."}]
    if any(item == ".." for item in parts):
        raise ValueError(f"Path traversal is not allowed in signature files list: {path}")
    return "/".join(parts)


def _default_signature_files(plugin_root: Path, manifest: PluginManifest) -> list[str]:
    candidates = [PLUGIN_MANIFEST_FILE]
    entry = str(manifest.entry or "").replace("\\", "/").strip()
    if entry and not entry.endswith("/"):
        candidates.append(entry)

    for filename in ("requirements.lock", "requirements.txt", "pyproject.toml"):
        if (plugin_root / filename).exists():
            candidates.append(filename)

    normalized: list[str] = []
    for item in candidates:
        try:
            normalized_item = _safe_rel_path(item)
        except ValueError:
            continue
        if normalized_item not in normalized:
            normalized.append(normalized_item)
    return normalized


def compute_canonical_package_hash(
    plugin_root: Path,
    manifest: PluginManifest,
) -> tuple[str, list[str], list[str]]:
    files = list(manifest.signature.files) if manifest.signature is not None and manifest.signature.files else []
    if not files:
        files = _default_signature_files(plugin_root, manifest)

    normalized_files = sorted({_safe_rel_path(item) for item in files})
    digest = hashlib.sha256()
    missing: list[str] = []

    for rel_path in normalized_files:
        abs_path = (plugin_root / rel_path).resolve()
        try:
            abs_path.relative_to(plugin_root.resolve())
        except ValueError:
            missing.append(rel_path)
            continue
        if not abs_path.exists() or not abs_path.is_file():
            missing.append(rel_path)
            continue
        digest.update(rel_path.encode("utf-8"))
        digest.update(b"\0")
        with open(abs_path, "rb") as handle:
            while True:
                chunk = handle.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)
        digest.update(b"\0")

    return f"sha256:{digest.hexdigest()}", normalized_files, missing


def verify_signature(
    *,
    manifest: PluginManifest,
    package_hash: str,
) -> dict:
    signature = manifest.signature
    if signature is None:
        return {
            "ok": True,
            "scheme": "none",
            "signer": "",
            "reason": "unsigned",
        }

    scheme = str(signature.scheme or "").strip().lower()
    signer = str(signature.signer or "").strip()
    declared_hash = str(signature.hash or "").strip()

    if scheme in {"none", ""}:
        return {
            "ok": True,
            "scheme": "none",
            "signer": signer,
            "reason": "unsigned",
        }

    if scheme in {"community-attestation-v1", "attested-hash-v1"}:
        if not declared_hash:
            return {
                "ok": False,
                "scheme": scheme,
                "signer": signer,
                "reason": "missing_declared_hash",
            }
        if declared_hash != package_hash:
            return {
                "ok": False,
                "scheme": scheme,
                "signer": signer,
                "reason": "declared_hash_mismatch",
            }
        return {
            "ok": True,
            "scheme": scheme,
            "signer": signer,
            "reason": "attested_hash_match",
        }

    if scheme == "ed25519":
        return {
            "ok": False,
            "scheme": scheme,
            "signer": signer,
            "reason": "ed25519_verifier_unavailable",
        }

    return {
        "ok": False,
        "scheme": scheme,
        "signer": signer,
        "reason": "unsupported_signature_scheme",
    }


def evaluate_trust_policy(
    *,
    trust_store: dict,
    manifest: PluginManifest,
    package_hash: str,
    signer: str,
    required_tier: int,
) -> dict:
    denied_hashes = set(trust_store.get("deny_hashes", []))
    revoked_signers = set(trust_store.get("revoked_signers", []))
    allowlist = [item for item in trust_store.get("allowlist", []) if isinstance(item, dict)]

    if package_hash in denied_hashes:
        return {
            "ok": False,
            "reason": "hash_denied",
            "matched_allowlist": None,
        }

    if signer and signer in revoked_signers:
        return {
            "ok": False,
            "reason": "signer_revoked",
            "matched_allowlist": None,
        }

    if required_tier < 3:
        return {
            "ok": True,
            "reason": "not_required",
            "matched_allowlist": None,
        }

    for item in allowlist:
        if str(item.get("plugin_id", "")).strip() != manifest.plugin_id:
            continue
        if str(item.get("version", "")).strip() != manifest.version:
            continue
        if str(item.get("hash", "")).strip() != package_hash:
            continue
        if str(item.get("signer", "")).strip() != str(signer or "").strip():
            continue
        return {
            "ok": True,
            "reason": "allowlist_match",
            "matched_allowlist": item,
        }

    return {
        "ok": False,
        "reason": "allowlist_miss",
        "matched_allowlist": None,
    }

