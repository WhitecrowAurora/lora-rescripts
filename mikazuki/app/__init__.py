"""Lazy exports for the mikazuki.app package.

This package is imported by the launcher for config access, so importing it
must not eagerly require FastAPI or the backend application stack.
"""

from __future__ import annotations

from typing import Any

__all__ = ["app"]


def __getattr__(name: str) -> Any:
    if name == "app":
        from .application import app

        return app
    raise AttributeError(name)
