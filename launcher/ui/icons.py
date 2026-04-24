"""Styled icon widgets for the SD-reScripts Launcher.

Provides icon badges for sidebar navigation and status dots for runtime indicators.
All icons use CTkFrame-based containers for consistent, theme-matched appearance.
"""

from __future__ import annotations

import customtkinter as ctk

from launcher.assets import style as S


class IconBadge(ctk.CTkFrame):
    """Small icon badge — rounded square with a centered symbol.

    Claymorphism style: soft pastel background, generous radius.
    """

    def __init__(
        self,
        master,
        symbol: str,
        size: int = 30,
        bg_color: str = S.ACCENT_DIM,
        text_color: str = S.ACCENT,
        font_size: int = 12,
    ):
        super().__init__(
            master,
            width=size,
            height=size,
            corner_radius=9,
            fg_color=bg_color,
        )
        self.grid_propagate(False)
        self.pack_propagate(False)

        self._symbol = ctk.CTkLabel(
            self,
            text=symbol,
            font=(S.FONT_FAMILY, font_size),
            text_color=text_color,
        )
        self._symbol.place(relx=0.5, rely=0.5, anchor="center")

    def configure_style(
        self,
        bg_color: str | None = None,
        text_color: str | None = None,
    ) -> None:
        if bg_color is not None:
            self.configure(fg_color=bg_color)
        if text_color is not None:
            self._symbol.configure(text_color=text_color)


class StatusDot(ctk.CTkFrame):
    """Small colored circle for status indicators.

    Claymorphism: pill-shaped dot with soft colors.
    """

    def __init__(
        self,
        master,
        color: str = S.TEXT_DIM,
        size: int = 12,
    ):
        super().__init__(
            master,
            width=size,
            height=size,
            corner_radius=size // 2,
            fg_color=color,
        )
        self.grid_propagate(False)
        self.pack_propagate(False)

    def set_color(self, color: str) -> None:
        self.configure(fg_color=color)


# Icon symbols for sidebar navigation — all text-rendering characters (no emoji)
NAV_ICONS = {
    "launch": "►",
    "runtime": "◆",
    "advanced": "≡",
    "install": "↓",
    "extension": "+",
    "console": ">",
    "about": "i",
    "language": "Aa",
}
