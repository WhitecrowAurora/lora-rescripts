"""Helpers for spawning background subprocesses without flashing console windows."""

from __future__ import annotations

import subprocess
import sys
from typing import Any, Dict


def hidden_subprocess_kwargs(*, creationflags: int = 0) -> Dict[str, Any]:
    """Return subprocess kwargs that keep helper processes hidden on Windows."""

    if sys.platform != "win32":
        return {"creationflags": creationflags} if creationflags else {}

    kwargs: Dict[str, Any] = {}
    combined_flags = creationflags | int(getattr(subprocess, "CREATE_NO_WINDOW", 0) or 0)
    if combined_flags:
        kwargs["creationflags"] = combined_flags

    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= int(getattr(subprocess, "STARTF_USESHOWWINDOW", 0) or 0)
    startupinfo.wShowWindow = int(getattr(subprocess, "SW_HIDE", 0) or 0)
    kwargs["startupinfo"] = startupinfo
    return kwargs
