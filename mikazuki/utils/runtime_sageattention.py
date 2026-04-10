from __future__ import annotations

import importlib
import importlib.metadata as metadata
from typing import Any, Callable


def _load_package_sageattention_symbols() -> tuple[Callable[..., Any], Callable[..., Any]]:
    sage_module = importlib.import_module("sageattention")
    sageattn = getattr(sage_module, "sageattn", None)
    sageattn_varlen = getattr(sage_module, "sageattn_varlen", None)
    if not callable(sageattn) or not callable(sageattn_varlen):
        raise ImportError("required SageAttention symbols are missing")
    return sageattn, sageattn_varlen


def load_runtime_sageattention_version() -> str:
    try:
        return metadata.version("sageattention")
    except Exception:
        return ""


def load_runtime_sageattention_core_module() -> Any:
    return importlib.import_module("sageattention.core")


def load_runtime_sageattention_symbols() -> tuple[Callable[..., Any], Callable[..., Any], str]:
    try:
        sageattn, sageattn_varlen = _load_package_sageattention_symbols()
    except Exception as exc:
        raise ImportError(f"package import failed: {exc}") from exc
    return sageattn, sageattn_varlen, "package"


def probe_runtime_sageattention() -> dict[str, Any]:
    result: dict[str, Any] = {
        "ready": False,
        "importable": False,
        "source": "",
        "source_root": "",
        "reason": "",
    }

    try:
        sageattn, sageattn_varlen, source = load_runtime_sageattention_symbols()
    except Exception as exc:
        result["reason"] = str(exc)
        return result

    result["importable"] = True
    result["ready"] = callable(sageattn) and callable(sageattn_varlen)
    result["source"] = source
    if not result["ready"]:
        result["reason"] = "required SageAttention symbols are missing"
    return result
