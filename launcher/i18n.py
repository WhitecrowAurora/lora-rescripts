"""Bilingual (zh/en) translation system for the SD-reScripts Launcher."""

from __future__ import annotations

import json
import ctypes
import locale
from pathlib import Path
from typing import Dict, Optional

_LANG_DIR = Path(__file__).parent / "i18n"
_TRANSLATIONS: Dict[str, Dict[str, str]] = {}
_current_lang: str = "zh"


def _load_translations() -> None:
    """Load all translation files from the i18n/ directory."""
    global _TRANSLATIONS
    for lang_file in _LANG_DIR.glob("*.json"):
        lang_code = lang_file.stem
        with open(lang_file, "r", encoding="utf-8") as f:
            _TRANSLATIONS[lang_code] = json.load(f)


def detect_system_language() -> str:
    """Detect the system UI language. Returns 'zh' for Chinese, 'en' otherwise."""
    try:
        if hasattr(ctypes, "windll"):
            lang_id = ctypes.windll.kernel32.GetUserDefaultUILanguage()
            # Chinese language IDs: 0x0804 (zh-CN), 0x0404 (zh-TW), etc.
            if (lang_id & 0xFF) == 0x04 or lang_id in (0x0804, 0x0404, 0x0C04, 0x1004, 0x1404):
                return "zh"
    except Exception:
        pass
    try:
        sys_lang = locale.getdefaultlocale()[0] or ""
        if sys_lang.lower().startswith("zh"):
            return "zh"
    except Exception:
        pass
    return "en"


def set_language(lang: str) -> None:
    """Set the current language. Supported: 'zh', 'en'."""
    global _current_lang
    if lang in _TRANSLATIONS:
        _current_lang = lang


def get_language() -> str:
    """Return the current language code."""
    return _current_lang


def available_languages() -> list:
    """Return list of available language codes."""
    return list(_TRANSLATIONS.keys())


def t(key: str, **kwargs) -> str:
    """Translate a key using the current language.

    Format tokens like {runtime} in translations are filled via str.format_map().
    Falls back to the key itself if no translation is found.
    """
    lang_dict = _TRANSLATIONS.get(_current_lang, {})
    text = lang_dict.get(key)
    if text is None:
        # Fallback to English
        text = _TRANSLATIONS.get("en", {}).get(key, key)
    if kwargs:
        try:
            return text.format_map(kwargs)
        except (KeyError, IndexError):
            return text
    return text


def reload() -> None:
    """Reload translations from disk (useful after language file changes)."""
    _load_translations()


# Load on import
_load_translations()
