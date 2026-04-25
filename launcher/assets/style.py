"""Claymorphism-style color scheme, typography, and dimension constants.

Supports light and dark themes with runtime switching.
All color constants are module-level variables that update when set_theme() is called.
Existing code using S.BG_APP etc. continues to work — the values change in-place.
"""

import customtkinter as ctk
import sys
from dataclasses import dataclass, fields


# ---------------------------------------------------------------------------
# Theme configuration — all color values for one theme
# ---------------------------------------------------------------------------

@dataclass
class ThemeConfig:
    """All color constants for a single theme."""
    # Background layers
    BG_APP: str = "#f0eef5"
    BG_SIDEBAR: str = "#e8e4f0"
    BG_SIDEBAR_HOVER: str = "#ddd8ec"
    BG_SIDEBAR_ACTIVE: str = "#d4ceea"
    BG_PAGE: str = "#f0eef5"
    BG_CARD: str = "#ffffff"
    BG_CARD_HOVER: str = "#f8f6fc"
    BG_CARD_SELECTED: str = "#ece8f8"
    BG_INPUT: str = "#f5f3fa"
    BG_INPUT_FOCUS: str = "#ffffff"

    # Shadow simulation
    SHADOW_OUTER: str = "#d8d2e8"
    SHADOW_INNER_TOP: str = "#ffffff"
    SHADOW_INNER_BOTTOM: str = "#e0dae8"
    SHADOW_CARD: str = "#d0cce0"
    SHADOW_CARD_INNER: str = "#eeeaf5"

    # Accent
    ACCENT: str = "#8b7cf6"
    ACCENT_HOVER: str = "#9d90f8"
    ACCENT_PRESSED: str = "#7568e0"
    ACCENT_DIM: str = "#c4bef0"

    # Semantic
    GREEN: str = "#6bcf8e"
    GREEN_DIM: str = "#e0f5e8"
    YELLOW: str = "#f0c55b"
    YELLOW_DIM: str = "#fdf3da"
    RED: str = "#ef8080"
    RED_DIM: str = "#fde0e0"
    RED_HOVER: str = "#e06060"
    ORANGE: str = "#f0a060"
    ORANGE_DIM: str = "#fdf0e0"

    # Text
    TEXT_WHITE: str = "#2d2b3a"
    TEXT_PRIMARY: str = "#3d3a50"
    TEXT_SECONDARY: str = "#6e6a88"
    TEXT_DIM: str = "#9490ae"
    TEXT_ACCENT: str = "#8b7cf6"

    # Borders
    BORDER_SUBTLE: str = "#e4e0f0"
    BORDER_CARD: str = "#d8d4ea"
    BORDER_ACCENT: str = "#8b7cf6"

    # Console
    CONSOLE_BG: str = "#1e1e2e"
    CONSOLE_FG: str = "#cdd6f4"

    # Semantic white
    WHITE: str = "#ffffff"


LIGHT_THEME = ThemeConfig(
    BG_APP="#f0eef5",
    BG_SIDEBAR="#e8e4f0",
    BG_SIDEBAR_HOVER="#ddd8ec",
    BG_SIDEBAR_ACTIVE="#d4ceea",
    BG_PAGE="#f0eef5",
    BG_CARD="#ffffff",
    BG_CARD_HOVER="#f8f6fc",
    BG_CARD_SELECTED="#ece8f8",
    BG_INPUT="#f5f3fa",
    BG_INPUT_FOCUS="#ffffff",
    SHADOW_OUTER="#d8d2e8",
    SHADOW_INNER_TOP="#ffffff",
    SHADOW_INNER_BOTTOM="#e0dae8",
    SHADOW_CARD="#d0cce0",
    SHADOW_CARD_INNER="#eeeaf5",
    ACCENT="#8b7cf6",
    ACCENT_HOVER="#9d90f8",
    ACCENT_PRESSED="#7568e0",
    ACCENT_DIM="#c4bef0",
    GREEN="#6bcf8e",
    GREEN_DIM="#e0f5e8",
    YELLOW="#f0c55b",
    YELLOW_DIM="#fdf3da",
    RED="#ef8080",
    RED_DIM="#fde0e0",
    RED_HOVER="#e06060",
    ORANGE="#f0a060",
    ORANGE_DIM="#fdf0e0",
    TEXT_WHITE="#2d2b3a",
    TEXT_PRIMARY="#3d3a50",
    TEXT_SECONDARY="#6e6a88",
    TEXT_DIM="#9490ae",
    TEXT_ACCENT="#8b7cf6",
    BORDER_SUBTLE="#e4e0f0",
    BORDER_CARD="#d8d4ea",
    BORDER_ACCENT="#8b7cf6",
    CONSOLE_BG="#1e1e2e",
    CONSOLE_FG="#cdd6f4",
    WHITE="#ffffff",
)

DARK_THEME = ThemeConfig(
    BG_APP="#0B0D11",
    BG_SIDEBAR="#12151C",
    BG_SIDEBAR_HOVER="#1A1D26",
    BG_SIDEBAR_ACTIVE="#242933",
    BG_PAGE="#0B0D11",
    BG_CARD="#1A1D26",
    BG_CARD_HOVER="#22262F",
    BG_CARD_SELECTED="#2D323E",
    BG_INPUT="#161920",
    BG_INPUT_FOCUS="#1E222B",
    SHADOW_OUTER="#080A0F",
    SHADOW_INNER_TOP="#1A1D26",
    SHADOW_INNER_BOTTOM="#080A0F",
    SHADOW_CARD="#080A0F",
    SHADOW_CARD_INNER="#1A1D26",
    ACCENT="#F59E0B",
    ACCENT_HOVER="#FBBF24",
    ACCENT_PRESSED="#D97706",
    ACCENT_DIM="#3D2A06",
    GREEN="#10B981",
    GREEN_DIM="#064E3B",
    YELLOW="#FBBF24",
    YELLOW_DIM="#422006",
    RED="#EF4444",
    RED_DIM="#450A0A",
    RED_HOVER="#DC2626",
    ORANGE="#F59E0B",
    ORANGE_DIM="#451A03",
    TEXT_WHITE="#F1F5F9",
    TEXT_PRIMARY="#E2E8F0",
    TEXT_SECONDARY="#94A3B8",
    TEXT_DIM="#64748B",
    TEXT_ACCENT="#FBBF24",
    BORDER_SUBTLE="#1E222B",
    BORDER_CARD="#2D323E",
    BORDER_ACCENT="#F59E0B",
    CONSOLE_BG="#080A0F",
    CONSOLE_FG="#FBBF24",
    WHITE="#ffffff",
)

# ---------------------------------------------------------------------------
# Theme switching — module-level constants update in-place
# ---------------------------------------------------------------------------

_current_theme_name: str = "light"
_current_theme: ThemeConfig = LIGHT_THEME

# Initialize module-level constants from light theme (backward compat)
# These will be overwritten by _reexport_constants() on theme switch.
for _f in fields(ThemeConfig):
    globals()[_f.name] = getattr(LIGHT_THEME, _f.name)


def _reexport_constants() -> None:
    """Update module-level color constants to match the current theme."""
    for f in fields(ThemeConfig):
        globals()[f.name] = getattr(_current_theme, f.name)


def set_theme(name: str) -> None:
    """Switch the active theme and update all module-level constants."""
    global _current_theme_name, _current_theme
    _current_theme_name = "dark" if name == "dark" else "light"
    _current_theme = DARK_THEME if _current_theme_name == "dark" else LIGHT_THEME
    _reexport_constants()


def get_theme() -> str:
    """Return the current theme name ('light' or 'dark')."""
    return _current_theme_name


# ---------------------------------------------------------------------------
# Font detection — prefer round sans-serif with weight variants
# ---------------------------------------------------------------------------

def _detect_best_fonts() -> tuple:
    """Detect the best available CJK font on the system."""
    try:
        import tkinter as _tk
        import tkinter.font as _tkfont
        _root = _tk.Tk()
        _root.withdraw()
        _families = set(_tkfont.families(_root))
        _root.destroy()
    except Exception:
        return ("Segoe UI", "Microsoft YaHei UI", False)

    if "Noto Sans SC" in _families:
        return ("Segoe UI", "Noto Sans SC", True)
    if "Microsoft YaHei UI" in _families:
        return ("Segoe UI", "Microsoft YaHei UI", False)
    if sys.platform == "darwin" and "PingFang SC" in _families:
        return ("SF Pro Display", "PingFang SC", False)
    return ("Segoe UI", "Segoe UI", False)


_FONT_LATIN, FONT_FAMILY_CJK, _HAS_NOTO = _detect_best_fonts()
FONT_FAMILY = _FONT_LATIN

if sys.platform == "win32":
    FONT_FAMILY_MONO = "Cascadia Code"
else:
    FONT_FAMILY_MONO = "Consolas"

# ---------------------------------------------------------------------------
# Typography — weight-optimized for Claymorphism
# ---------------------------------------------------------------------------

if _HAS_NOTO:
    _CJK_HEADING = "Noto Sans SC Medium"
    _CJK_BODY = "Noto Sans SC DemiLight"
    _CJK_BODY_BOLD = "Noto Sans SC Medium"
    _CJK_LIGHT = "Noto Sans SC Light"
    _CJK_BUTTON = "Noto Sans SC Medium"
else:
    _CJK_HEADING = FONT_FAMILY_CJK
    _CJK_BODY = FONT_FAMILY_CJK
    _CJK_BODY_BOLD = FONT_FAMILY_CJK
    _CJK_LIGHT = FONT_FAMILY_CJK
    _CJK_BUTTON = FONT_FAMILY_CJK

if sys.platform == "win32":
    _LATIN_HEADING = "Segoe UI Semibold"
    _LATIN_BODY = "Segoe UI Semilight"
else:
    _LATIN_HEADING = FONT_FAMILY
    _LATIN_BODY = FONT_FAMILY

# Heading fonts
FONT_H1 = (_CJK_HEADING, 20)
FONT_H2 = (_CJK_HEADING, 15)
FONT_H3 = (_CJK_HEADING, 13)

# Body text
FONT_BODY = (_LATIN_BODY, 13)
FONT_BODY_BOLD = (_LATIN_HEADING, 13)
FONT_BODY_CJK = (_CJK_BODY, 13)
FONT_BODY_CJK_BOLD = (_CJK_BODY_BOLD, 13)

# Small text
FONT_SMALL = (_LATIN_BODY, 12)
FONT_SMALL_BOLD = (_LATIN_HEADING, 12)
FONT_TINY = (_LATIN_BODY, 11)
FONT_TINY_CJK = (_CJK_LIGHT, 11)

# Interactive elements
FONT_BUTTON = (_CJK_BUTTON, 14)
FONT_BUTTON_SMALL = (_CJK_BODY, 12)
FONT_SIDEBAR = (_CJK_BODY, 13)
FONT_SIDEBAR_ACTIVE = (_CJK_HEADING, 13)

# Utility
FONT_CONSOLE = (FONT_FAMILY_MONO, 12)
FONT_STATUS = (_LATIN_HEADING, 12)
FONT_BADGE = (_CJK_BODY_BOLD, 10)

# ---------------------------------------------------------------------------
# Dimensions — Claymorphism: bigger radii, more padding
# ---------------------------------------------------------------------------

SIDEBAR_WIDTH = 220
SIDEBAR_ITEM_HEIGHT = 46
SIDEBAR_ITEM_PAD = 8
SIDEBAR_BOTTOM_PAD = 24
SIDEBAR_BUTTON_RADIUS = 12

CARD_HEIGHT = 80
CARD_CORNER_RADIUS = 18
CARD_MINI_RADIUS = 14
CARD_PAD_X = 16
CARD_PAD_Y = 12
CARD_GAP = 10
CARD_INNER_PAD = 14

BADGE_CORNER_RADIUS = 8
BUTTON_CORNER_RADIUS = 10
ICON_CORNER_RADIUS = 9
CHECKBOX_CORNER_RADIUS = 6

SECTION_GAP = 24
INNER_PAD = 28

LAUNCH_BUTTON_HEIGHT = 54
LAUNCH_BUTTON_CORNER_RADIUS = 27
LAUNCH_BUTTON_FONT = (_CJK_BUTTON, 15)

INPUT_HEIGHT = 38
INPUT_CORNER_RADIUS = 12
SWITCH_HEIGHT = 24

WINDOW_MIN_WIDTH = 900
WINDOW_MIN_HEIGHT = 620

# ---------------------------------------------------------------------------
# Claymorphism helper — shadow frame factory
# ---------------------------------------------------------------------------

def make_shadow_frame(master, child_widget=None, depth: int = 2, **grid_kwargs):
    """Create a shadow frame behind a widget for clay depth effect."""
    shadow = ctk.CTkFrame(
        master,
        corner_radius=CARD_CORNER_RADIUS + depth,
        fg_color=SHADOW_CARD,
        border_width=0,
    )
    if grid_kwargs:
        shadow.grid(**grid_kwargs)
    shadow.grid_columnconfigure(0, weight=1)
    return shadow


# ---------------------------------------------------------------------------
# CTk appearance overrides — applied on theme switch
# ---------------------------------------------------------------------------

def apply_theme(theme_name: str | None = None):
    """Apply the current (or specified) theme to customtkinter.

    Args:
        theme_name: "light" or "dark". If None, uses the current theme.
    """
    if theme_name:
        set_theme(theme_name)

    mode = "dark" if _current_theme_name == "dark" else "light"
    ctk.set_appearance_mode(mode)
    ctk.set_default_color_theme("blue")

    try:
        t = _current_theme
        theme = ctk.ThemeManager.theme
        theme["CTkEntry"]["border_color"] = [t.BORDER_CARD, t.BORDER_CARD]
        theme["CTkEntry"]["fg_color"] = [t.BG_INPUT, t.BG_INPUT]
        theme["CTkEntry"]["text_color"] = [t.TEXT_PRIMARY, t.TEXT_PRIMARY]
        theme["CTkSwitch"]["progress_color"] = [t.ACCENT, t.ACCENT]
        theme["CTkSwitch"]["button_color"] = [t.WHITE, t.WHITE]
        theme["CTkSwitch"]["button_hover_color"] = [t.ACCENT_HOVER, t.ACCENT_HOVER]
        theme["CTkCheckBox"]["checkmark_color"] = [t.ACCENT, t.ACCENT]
        theme["CTkCheckBox"]["fg_color"] = [t.BG_CARD, t.BG_CARD]
        theme["CTkCheckBox"]["border_color"] = [t.BORDER_CARD, t.BORDER_CARD]
        theme["CTkRadioButton"]["border_color"] = [t.BORDER_CARD, t.BORDER_CARD]
        theme["CTkRadioButton"]["checkmark_color"] = [t.ACCENT, t.ACCENT]
        theme["CTkRadioButton"]["fg_color"] = [t.BG_CARD, t.BG_CARD]
        theme["CTkScrollableFrame"]["fg_color"] = [t.BG_PAGE, t.BG_PAGE]
        theme["CTkTextbox"]["fg_color"] = [t.BG_INPUT, t.BG_INPUT]
        theme["CTkTextbox"]["border_color"] = [t.BORDER_CARD, t.BORDER_CARD]
        theme["CTkTextbox"]["text_color"] = [t.TEXT_PRIMARY, t.TEXT_PRIMARY]
        theme["CTkButton"]["fg_color"] = [t.ACCENT, t.ACCENT]
        theme["CTkButton"]["hover_color"] = [t.ACCENT_HOVER, t.ACCENT_HOVER]
        theme["CTkButton"]["text_color"] = [t.WHITE, t.WHITE]
        theme["CTkButton"]["corner_radius"] = BUTTON_CORNER_RADIUS
    except Exception:
        pass
