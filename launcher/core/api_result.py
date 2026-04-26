"""Small helpers for structured launcher API results."""

from __future__ import annotations

from typing import Any, Dict, Optional


def ok_result(result_code: str, **payload: Any) -> Dict[str, Any]:
    result: Dict[str, Any] = {
        "ok": True,
        "result_code": result_code,
    }
    result.update(payload)
    return result


def error_result(
    code: str,
    error: str,
    *,
    details: Optional[Dict[str, Any]] = None,
    **payload: Any,
) -> Dict[str, Any]:
    result: Dict[str, Any] = {
        "ok": False,
        "code": code,
        "error": error,
    }
    if details is not None:
        result["details"] = details
    result.update(payload)
    return result

