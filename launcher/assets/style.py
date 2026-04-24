"""Claymorphism-style color scheme, typography, and dimension constants.

Design principles:
- Light pastel / macaron color palette — warm, soft, inviting
- Extreme roundness — buttons capsule-shaped, cards 20+ radius
- Simulated depth via layered borders and offset shadow frames
- Press-in button animations (shadow collapse on click)
- Matte clay texture — no sharp highlights, soft diffuse feel
"""

import customtkinter as ctk
import sys

# ---------------------------------------------------------------------------
# Color palette — Claymorphism light theme (macaron / pastel)
# ---------------------------------------------------------------------------

# Background layers (light → slightly deeper)
BG_APP = "#f0eef5"             # App root — soft lavender white
BG_SIDEBAR = "#e8e4f0"        # Sidebar — slightly deeper lavender
BG_SIDEBAR_HOVER = "#ddd8ec"
BG_SIDEBAR_ACTIVE = "#d4ceea"
BG_PAGE = "#f0eef5"           # Page background — same as app
BG_CARD = "#ffffff"           # Card — white, floating on pastel
BG_CARD_HOVER = "#f8f6fc"     # Card hover — barely deeper
BG_CARD_SELECTED = "#ece8f8"  # Selected/active card — tinted lavender
BG_INPUT = "#f5f3fa"          # Input fields — slightly recessed
BG_INPUT_FOCUS = "#ffffff"    # Input focus — pop to white

# Shadow simulation colors (for outer shadow frames)
SHADOW_OUTER = "#d8d2e8"      # Outer shadow — lavender gray
SHADOW_INNER_TOP = "#ffffff"  # Inner highlight top — simulated light
SHADOW_INNER_BOTTOM = "#e0dae8"  # Inner shadow bottom — depth

# Accent colors — soft purple-blue, clay-friendly
ACCENT = "#8b7cf6"            # Primary accent — pastel purple
ACCENT_HOVER = "#9d90f8"      # Lighter on hover
ACCENT_PRESSED = "#7568e0"    # Darker on press
ACCENT_DIM = "#c4bef0"        # Dimmed accent for inactive / icon badges

# Semantic colors — pastel versions
GREEN = "#6bcf8e"             # Installed / success — soft mint
GREEN_DIM = "#e0f5e8"         # Green badge background
YELLOW = "#f0c55b"            # Partial / warning — soft gold
YELLOW_DIM = "#fdf3da"        # Yellow badge background
RED = "#ef8080"               # Error / missing — soft coral
RED_DIM = "#fde0e0"           # Red badge background
ORANGE = "#f0a060"            # Experimental badge — soft amber
ORANGE_DIM = "#fdf0e0"        # Orange badge background

# Text hierarchy — on light background
TEXT_WHITE = "#2d2b3a"        # Primary text — deep charcoal (NOT white, despite name)
TEXT_PRIMARY = "#3d3a50"      # Normal body text
TEXT_SECONDARY = "#7a7694"    # Secondary text — muted purple-gray
TEXT_DIM = "#a8a4bc"          # Tertiary text — light purple-gray
TEXT_ACCENT = "#8b7cf6"       # Accent-colored text

# Borders & separators
BORDER_SUBTLE = "#e4e0f0"     # Very subtle borders
BORDER_CARD = "#d8d4ea"       # Card borders — slightly visible
BORDER_ACCENT = "#8b7cf6"     # Accent-colored borders (selected items)

# Shadows (simulated via frames)
SHADOW_CARD = "#d0cce0"       # Card drop shadow
SHADOW_CARD_INNER = "#eeeaf5" # Card inner highlight (top)

# ---------------------------------------------------------------------------
# Typography — Segoe UI on Windows
# ---------------------------------------------------------------------------

if sys.platform == "win32":
    FONT_FAMILY = "Segoe UI"
    FONT_FAMILY_CJK = "Microsoft YaHei UI"
    FONT_FAMILY_MONO = "Cascadia Code"
else:
    FONT_FAMILY = "Segoe UI"
    FONT_FAMILY_CJK = "Segoe UI"
    FONT_FAMILY_MONO = "Consolas"

# Size scale — lighter weights for clay feel
FONT_H1 = (FONT_FAMILY_CJK, 20, "bold")
FONT_H2 = (FONT_FAMILY_CJK, 15, "bold")
FONT_H3 = (FONT_FAMILY_CJK, 13, "bold")
FONT_BODY = (FONT_FAMILY, 13)
FONT_BODY_BOLD = (FONT_FAMILY, 13, "bold")
FONT_BODY_CJK = (FONT_FAMILY_CJK, 13)
FONT_BODY_CJK_BOLD = (FONT_FAMILY_CJK, 13, "bold")
FONT_SMALL = (FONT_FAMILY, 12)
FONT_SMALL_BOLD = (FONT_FAMILY, 12, "bold")
FONT_TINY = (FONT_FAMILY, 11)
FONT_TINY_CJK = (FONT_FAMILY_CJK, 11)
FONT_BUTTON = (FONT_FAMILY_CJK, 14, "bold")
FONT_BUTTON_SMALL = (FONT_FAMILY_CJK, 12)
FONT_SIDEBAR = (FONT_FAMILY_CJK, 13)
FONT_SIDEBAR_ACTIVE = (FONT_FAMILY_CJK, 13, "bold")
FONT_CONSOLE = (FONT_FAMILY_MONO, 12)
FONT_STATUS = (FONT_FAMILY, 12, "bold")
FONT_BADGE = (FONT_FAMILY, 10, "bold")

# ---------------------------------------------------------------------------
# Dimensions — Claymorphism: bigger radii, more padding
# ---------------------------------------------------------------------------

SIDEBAR_WIDTH = 220
SIDEBAR_ITEM_HEIGHT = 46
SIDEBAR_ITEM_PAD = 8
SIDEBAR_BOTTOM_PAD = 24

CARD_HEIGHT = 80
CARD_CORNER_RADIUS = 18
CARD_PAD_X = 16
CARD_PAD_Y = 12
CARD_GAP = 10

SECTION_GAP = 24
INNER_PAD = 28                 # More generous page padding

LAUNCH_BUTTON_HEIGHT = 54
LAUNCH_BUTTON_CORNER_RADIUS = 27  # Capsule shape
LAUNCH_BUTTON_FONT = (FONT_FAMILY_CJK, 15, "bold")

INPUT_HEIGHT = 38
INPUT_CORNER_RADIUS = 12
SWITCH_HEIGHT = 24

WINDOW_MIN_WIDTH = 900
WINDOW_MIN_HEIGHT = 620

# ---------------------------------------------------------------------------
# Claymorphism helper — shadow frame factory
# ---------------------------------------------------------------------------

def make_shadow_frame(master, child_widget=None, depth: int = 2, **grid_kwargs):
    """Create a shadow frame behind a widget for clay depth effect.

    Usage:
        shadow = make_shadow_frame(parent, grid_row=0, grid_column=0, sticky="ew")
        card = ctk.CTkFrame(shadow, ...)  # Put your card inside shadow
    """
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
# CTk appearance overrides — applied at startup
# ---------------------------------------------------------------------------

def apply_theme():
    """Apply the Claymorphism light theme to customtkinter."""
    ctk.set_appearance_mode("light")
    ctk.set_default_color_theme("blue")

    # Override widget defaults for light clay theme
    try:
        theme = ctk.ThemeManager.theme
        theme["CTkEntry"]["border_color"] = [BORDER_CARD, BORDER_CARD]
        theme["CTkEntry"]["fg_color"] = [BG_INPUT, BG_INPUT]
        theme["CTkEntry"]["text_color"] = [TEXT_PRIMARY, TEXT_PRIMARY]
        theme["CTkSwitch"]["progress_color"] = [ACCENT, ACCENT]
        theme["CTkSwitch"]["button_color"] = ["#ffffff", "#ffffff"]
        theme["CTkSwitch"]["button_hover_color"] = [ACCENT_HOVER, ACCENT_HOVER]
        theme["CTkCheckBox"]["checkmark_color"] = [ACCENT, ACCENT]
        theme["CTkCheckBox"]["fg_color"] = [BG_CARD, BG_CARD]
        theme["CTkCheckBox"]["border_color"] = [BORDER_CARD, BORDER_CARD]
        theme["CTkRadioButton"]["border_color"] = [BORDER_CARD, BORDER_CARD]
        theme["CTkRadioButton"]["checkmark_color"] = [ACCENT, ACCENT]
        theme["CTkRadioButton"]["fg_color"] = [BG_CARD, BG_CARD]
        theme["CTkScrollableFrame"]["fg_color"] = [BG_PAGE, BG_PAGE]
        theme["CTkTextbox"]["fg_color"] = [BG_INPUT, BG_INPUT]
        theme["CTkTextbox"]["border_color"] = [BORDER_CARD, BORDER_CARD]
        theme["CTkTextbox"]["text_color"] = [TEXT_PRIMARY, TEXT_PRIMARY]
        theme["CTkButton"]["fg_color"] = [ACCENT, ACCENT]
        theme["CTkButton"]["hover_color"] = [ACCENT_HOVER, ACCENT_HOVER]
        theme["CTkButton"]["text_color"] = ["#ffffff", "#ffffff"]
        theme["CTkButton"]["corner_radius"] = 12
    except Exception:
        pass
