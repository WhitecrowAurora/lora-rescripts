"""Project update detection helpers."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

from launcher.core.versioning import compare_versions, detect_project_version, parse_version_text


DEFAULT_RELEASE_FEED = "https://api.github.com/repos/WhitecrowAurora/lora-rescripts/releases?per_page=20"
UPDATE_CHANNELS = {"stable", "beta"}


def _iter_feed_urls() -> Iterable[str]:
    raw = os.environ.get("MIKAZUKI_UPDATE_FEED_URL", "").strip()
    if raw:
        for chunk in raw.replace("\n", ";").split(";"):
            candidate = chunk.strip()
            if candidate:
                yield candidate
    yield DEFAULT_RELEASE_FEED


def _fetch_json(url: str, timeout: float = 6.0) -> Any:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "sd-rescripts-launcher",
            "Accept": "application/vnd.github+json, application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        payload = response.read().decode(charset, errors="replace")
    return json.loads(payload)


def _normalize_release_feed(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, dict):
        if "releases" in payload and isinstance(payload["releases"], list):
            return [item for item in payload["releases"] if isinstance(item, dict)]
        return [payload]
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    return []


def _pick_latest_release(channel: str, releases: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    best_release: Optional[Dict[str, Any]] = None
    best_version = None

    for release in releases:
        if bool(release.get("draft")):
            continue

        raw_version = (
            str(release.get("name") or "").strip()
            or str(release.get("tag_name") or "").strip()
        )
        parsed = parse_version_text(raw_version)
        if parsed is None:
            continue
        if channel == "stable" and parsed.is_beta:
            continue

        if best_version is None or compare_versions(parsed, best_version) > 0:
            best_version = parsed
            best_release = release

    if best_release is None or best_version is None:
        return None

    return {
        "display": best_version.canonical,
        "raw": (
            str(best_release.get("name") or "").strip()
            or str(best_release.get("tag_name") or "").strip()
        ),
        "normalized": best_version.canonical,
        "is_beta": best_version.is_beta,
        "release_url": str(best_release.get("html_url") or "").strip() or None,
        "published_at": str(best_release.get("published_at") or "").strip() or None,
        "release_notes": str(best_release.get("body") or "").strip(),
        "source": "feed",
    }


def run_updater(repo_root: Path, use_cn_mirror: bool = False) -> Dict[str, Any]:
    """Start the project's existing updater script in a detached process."""

    script_name = "update_cn.bat" if use_cn_mirror else "update.bat"
    script_path = repo_root / script_name
    if not script_path.exists():
        return {
            "ok": False,
            "code": "updater.script_missing",
            "error": f"Updater script not found: {script_path}",
            "details": {"script_path": str(script_path)},
        }

    try:
        if sys.platform == "win32":
            creationflags = (
                getattr(subprocess, "DETACHED_PROCESS", 0)
                | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
            )
            subprocess.Popen(
                [str(script_path)],
                cwd=str(repo_root),
                shell=True,
                creationflags=creationflags,
            )
        else:
            subprocess.Popen([str(script_path)], cwd=str(repo_root), start_new_session=True)
    except Exception as exc:
        return {
            "ok": False,
            "code": "updater.start_failed",
            "error": str(exc),
            "details": {"script_path": str(script_path)},
        }

    return {
        "ok": True,
        "result_code": "updater.started",
        "details": {
            "script": script_name,
            "script_path": str(script_path),
        },
    }


class UpdateChecker:
    """Small cached update checker for the launcher process."""

    def __init__(self, repo_root: Path, ttl_seconds: int = 900) -> None:
        self._repo_root = repo_root
        self._ttl_seconds = ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}

    def check(self, channel: str = "stable", force: bool = False) -> Dict[str, Any]:
        channel_name = channel if channel in UPDATE_CHANNELS else "stable"
        now = time.time()
        cached = self._cache.get(channel_name)
        if (
            not force
            and cached is not None
            and now - float(cached.get("_cached_at", 0)) < self._ttl_seconds
        ):
            return {key: value for key, value in cached.items() if key != "_cached_at"}

        current = detect_project_version(self._repo_root)
        result: Dict[str, Any] = {
            "channel": channel_name,
            "current": current,
            "checked_at": None,
            "has_update": False,
            "latest": None,
            "release_url": None,
            "release_notes": "",
            "published_at": None,
            "error": None,
        }

        feed_error: Optional[str] = None
        for url in _iter_feed_urls():
            try:
                payload = _fetch_json(url)
                releases = _normalize_release_feed(payload)
                latest = _pick_latest_release(channel_name, releases)
                result["checked_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                if latest is None:
                    result["error"] = "No matching release was found in the update feed."
                    break

                result["latest"] = {
                    "display": latest["display"],
                    "raw": latest["raw"],
                    "normalized": latest["normalized"],
                    "source": latest["source"],
                    "is_beta": latest["is_beta"],
                }
                result["release_url"] = latest["release_url"]
                result["release_notes"] = latest["release_notes"]
                result["published_at"] = latest["published_at"]

                current_parsed = parse_version_text(current.get("display"))
                latest_parsed = parse_version_text(latest["display"])
                if current_parsed is not None and latest_parsed is not None:
                    result["has_update"] = compare_versions(latest_parsed, current_parsed) > 0
                elif current.get("display") != latest["display"]:
                    result["has_update"] = True
                result["error"] = None
                break
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
                feed_error = str(exc)
                continue

        if result["checked_at"] is None:
            result["checked_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        if result["latest"] is None and result["error"] is None:
            result["error"] = feed_error or "Unable to fetch update information."

        self._cache[channel_name] = {"_cached_at": now, **result}
        return result
