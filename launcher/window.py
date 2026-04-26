"""Create the pywebview window and start the application."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import webview

from launcher.api import Api
from launcher.config import WINDOW_HEIGHT, WINDOW_WIDTH


def create_window() -> None:
    """Create the pywebview window and start the event loop."""
    api = Api()
    settings = api.get_settings()
    width = _sanitize_dimension(settings.get("window_width"), WINDOW_WIDTH)
    height = _sanitize_dimension(settings.get("window_height"), WINDOW_HEIGHT)

    # Determine URL: dev mode uses Vite dev server, production uses built files
    dev_mode = os.environ.get("LAUNCHER_DEV") == "1" or "--dev" in sys.argv

    if dev_mode:
        url = "http://localhost:5173"
    else:
        base = Path(__file__).parent
        url = str(base / "web" / "dist" / "index.html")

    # Try to load icon
    icon_path = Path(__file__).parent / "assets" / "icon.ico"
    if not icon_path.exists():
        fallback_icon = Path(__file__).parent / "assets" / "favicon.ico"
        if fallback_icon.exists():
            icon_path = fallback_icon

    window = webview.create_window(
        title="SD-reScripts Launcher",
        url=url,
        js_api=api,
        width=width,
        height=height,
        min_size=(900, 620),
        text_select=False,
    )

    # Set icon if available
    if icon_path.exists():
        try:
            # pywebview doesn't support icon in create_window on all platforms,
            # but we can set it after creation on Windows
            pass
        except Exception:
            pass

    api._window = window

    # Handle window close — terminate any running process
    window.events.closing += lambda window: _on_closing(api, window)

    webview.start(debug=dev_mode)


def _sanitize_dimension(value: object, fallback: int) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return fallback
    minimum = 900 if fallback == WINDOW_WIDTH else 620
    parsed = max(minimum, parsed)
    if fallback == WINDOW_HEIGHT:
        return max(WINDOW_HEIGHT, parsed)
    return parsed


def _on_closing(api: Api, window: webview.Window) -> None:
    """Clean up on window close without blocking the GUI shutdown path."""
    width = None
    height = None
    try:
        width = int(window.width)
    except Exception:
        pass
    try:
        height = int(window.height)
    except Exception:
        pass
    try:
        api.prepare_for_close(window_width=width, window_height=height)
    except Exception:
        pass
