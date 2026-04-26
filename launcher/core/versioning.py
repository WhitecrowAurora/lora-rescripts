"""Project version parsing and detection helpers for the launcher."""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

from launcher.core.subprocess_utils import hidden_subprocess_kwargs

_VERSION_RE = re.compile(
    r"v?\s*(\d+)\.(\d+)\.(\d+)(?:[\s._-]*beta[\s._-]*(\d+))?",
    re.IGNORECASE,
)
_GUI_VERSION_RE = re.compile(r'APP_VERSION\s*=\s*"([^"]+)"')


@dataclass(frozen=True)
class ParsedVersion:
    """Normalized semantic-ish version used by this project."""

    major: int
    minor: int
    patch: int
    beta: Optional[int] = None
    raw: str = ""

    @property
    def is_beta(self) -> bool:
        return self.beta is not None

    @property
    def canonical(self) -> str:
        base = f"v{self.major}.{self.minor}.{self.patch}"
        if self.beta is None:
            return base
        return f"{base} Beta{self.beta}"

    @property
    def sort_key(self) -> tuple[int, int, int, int, int]:
        # Stable releases sort above beta releases with the same base version.
        return (
            self.major,
            self.minor,
            self.patch,
            0 if self.beta is not None else 1,
            self.beta or 0,
        )


def parse_version_text(text: str | None) -> Optional[ParsedVersion]:
    """Parse project versions like v1.5.0, v1.5.0 Beta40 or v1.5.0-Beta40."""

    if not text:
        return None
    match = _VERSION_RE.search(str(text).strip())
    if not match:
        return None
    major, minor, patch, beta = match.groups()
    return ParsedVersion(
        major=int(major),
        minor=int(minor),
        patch=int(patch),
        beta=int(beta) if beta is not None else None,
        raw=str(text).strip(),
    )


def compare_versions(left: ParsedVersion, right: ParsedVersion) -> int:
    """Return -1, 0, 1 depending on version ordering."""

    if left.sort_key < right.sort_key:
        return -1
    if left.sort_key > right.sort_key:
        return 1
    return 0


def detect_project_version(repo_root: Path) -> Dict[str, Any]:
    """Detect the current project version from git tags or gui.py."""

    git_value: Optional[str] = None
    try:
        git_value = (
            subprocess.check_output(
                ["git", "-C", str(repo_root), "describe", "--tags"],
                stderr=subprocess.DEVNULL,
                text=True,
                timeout=4,
                **hidden_subprocess_kwargs(),
            )
            .strip()
        )
    except Exception:
        git_value = None

    parsed = parse_version_text(git_value)
    if parsed is not None:
        return {
            "display": parsed.canonical,
            "raw": git_value,
            "normalized": parsed.canonical,
            "source": "git",
            "is_beta": parsed.is_beta,
        }

    gui_version_path = repo_root / "gui.py"
    if gui_version_path.exists():
        try:
            content = gui_version_path.read_text(encoding="utf-8", errors="replace")
            match = _GUI_VERSION_RE.search(content)
            if match:
                raw = match.group(1).strip()
                parsed = parse_version_text(raw)
                return {
                    "display": parsed.canonical if parsed else raw,
                    "raw": raw,
                    "normalized": parsed.canonical if parsed else None,
                    "source": "gui.py",
                    "is_beta": parsed.is_beta if parsed else None,
                }
        except OSError:
            pass

    return {
        "display": "Unknown",
        "raw": None,
        "normalized": None,
        "source": "unknown",
        "is_beta": None,
    }
