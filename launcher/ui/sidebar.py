"""Sidebar navigation — Claymorphism style with soft hover transitions and accent bar."""

from __future__ import annotations

from typing import Callable, Optional

import customtkinter as ctk

from launcher.assets import style as S
from launcher.i18n import t
from launcher.ui.animations import HoverAnimator, lerp_color
from launcher.ui.icons import IconBadge, NAV_ICONS


class SidebarItem:
    """Data for a single sidebar navigation item."""
    def __init__(self, page_id: str, icon_symbol: str, label_key: str):
        self.page_id = page_id
        self.icon_symbol = icon_symbol
        self.label_key = label_key


NAV_ITEMS = [
    SidebarItem("launch", NAV_ICONS["launch"], "launch"),
    SidebarItem("runtime", NAV_ICONS["runtime"], "runtime"),
    SidebarItem("advanced", NAV_ICONS["advanced"], "advanced"),
    SidebarItem("install", NAV_ICONS["install"], "install"),
    SidebarItem("extension", NAV_ICONS["extension"], "extension"),
    SidebarItem("console", NAV_ICONS["console"], "console"),
    SidebarItem("about", NAV_ICONS["about"], "about"),
]


class SidebarButton(ctk.CTkFrame):
    """Sidebar nav button with clay-style hover transition."""

    def __init__(
        self,
        master,
        icon_symbol: str,
        text: str,
        active: bool = False,
        on_click: Optional[Callable] = None,
        page_id: str = "",
    ):
        super().__init__(
            master,
            height=S.SIDEBAR_ITEM_HEIGHT,
            corner_radius=12,
            fg_color=S.BG_SIDEBAR_ACTIVE if active else S.BG_SIDEBAR,
        )
        self._on_click = on_click
        self._page_id = page_id
        self._active = active

        self.grid_columnconfigure(1, weight=1)

        # Icon badge — pastel clay look
        icon_bg = S.ACCENT if active else S.ACCENT_DIM
        icon_fg = "#ffffff" if active else S.ACCENT
        self._icon = IconBadge(
            self, symbol=icon_symbol, size=30,
            bg_color=icon_bg, text_color=icon_fg, font_size=11,
        )
        self._icon.grid(row=0, column=0, padx=(12, 8), pady=8)

        self._text_label = ctk.CTkLabel(
            self,
            text=text,
            font=S.FONT_SIDEBAR_ACTIVE if active else S.FONT_SIDEBAR,
            anchor="w",
            text_color=S.TEXT_WHITE if active else S.TEXT_SECONDARY,
        )
        self._text_label.grid(row=0, column=1, padx=(0, 14), pady=10, sticky="ew")

        # Left accent bar
        self._accent_bar = ctk.CTkFrame(
            self, width=3, corner_radius=2,
            fg_color=S.ACCENT if active else "transparent",
        )
        self._accent_bar.place(x=0, rely=0.5, anchor="w", relx=0)

        # Smooth hover animator
        self._hover_anim = HoverAnimator(
            self,
            normal=S.BG_SIDEBAR,
            hover=S.BG_SIDEBAR_HOVER,
            border_normal=S.BG_SIDEBAR,
            border_hover=S.BG_SIDEBAR_HOVER,
            steps=5, interval=12,
        )
        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)
        self.bind("<Button-1>", self._on_button_click)
        for child in self.winfo_children():
            if child != self._accent_bar:
                child.bind("<Button-1>", self._on_button_click)

    def set_active(self, active: bool) -> None:
        self._active = active
        # Cancel any in-flight hover animation to avoid color conflicts
        if self._hover_anim and self._hover_anim._after_id:
            try:
                self.after_cancel(self._hover_anim._after_id)
            except Exception:
                pass
            self._hover_anim._progress = 0.0
            self._hover_anim._after_id = None
        self._accent_bar.configure(fg_color=S.ACCENT if active else "transparent")
        self._update_style()

    def update_text(self, text: str) -> None:
        self._text_label.configure(text=text)

    def _update_style(self) -> None:
        if self._active:
            self.configure(fg_color=S.BG_SIDEBAR_ACTIVE)
            self._icon.configure_style(bg_color=S.ACCENT, text_color="#ffffff")
            self._text_label.configure(text_color=S.TEXT_WHITE, font=S.FONT_SIDEBAR_ACTIVE)
            # Force end hover state
            if self._hover_anim:
                self._hover_anim._progress = 0.0
        else:
            self.configure(fg_color=S.BG_SIDEBAR)
            self._icon.configure_style(bg_color=S.ACCENT_DIM, text_color=S.ACCENT)
            self._text_label.configure(text_color=S.TEXT_SECONDARY, font=S.FONT_SIDEBAR)

    def _on_enter(self, event) -> None:
        if not self._active:
            self._hover_anim.on_enter()
            self._icon.configure_style(text_color=S.TEXT_WHITE)
            self._text_label.configure(text_color=S.TEXT_PRIMARY)

    def _on_leave(self, event) -> None:
        if not self._active:
            self._hover_anim.on_leave()
            self._icon.configure_style(text_color=S.ACCENT)
            self._text_label.configure(text_color=S.TEXT_SECONDARY)

    def _on_button_click(self, event) -> None:
        if self._on_click:
            self._on_click(self._page_id)


class Sidebar(ctk.CTkFrame):
    """Left sidebar navigation panel — Claymorphism style."""

    def __init__(
        self,
        master,
        on_page_select: Callable[[str], None],
        on_language_toggle: Callable[[], None],
        current_lang: str = "zh",
    ):
        super().__init__(
            master,
            width=S.SIDEBAR_WIDTH,
            corner_radius=0,
            fg_color=S.BG_SIDEBAR,
            border_width=0,
        )
        self.grid_rowconfigure(99, weight=1)
        self._on_page_select = on_page_select
        self._on_language_toggle = on_language_toggle
        self._current_page = "launch"
        self._current_lang = current_lang

        # Brand header
        brand_frame = ctk.CTkFrame(self, fg_color="transparent", height=56)
        brand_frame.grid(row=0, column=0, padx=20, pady=(24, 16), sticky="ew")
        brand_frame.grid_propagate(False)

        self._brand_label = ctk.CTkLabel(
            brand_frame,
            text="SD-reScripts",
            font=S.FONT_H2,
            text_color=S.TEXT_WHITE,
            anchor="w",
        )
        self._brand_label.pack(side="left")

        self._version_label = ctk.CTkLabel(
            brand_frame,
            text="v1.4.8",
            font=S.FONT_TINY,
            text_color=S.TEXT_DIM,
            anchor="w",
        )
        self._version_label.pack(side="left", padx=(8, 0), pady=(6, 0))

        # Separator
        ctk.CTkFrame(
            self, height=1, fg_color=S.BORDER_SUBTLE,
        ).grid(row=1, column=0, padx=16, pady=(0, 8), sticky="ew")

        # Primary nav items
        self._buttons: dict[str, SidebarButton] = {}
        for i, item in enumerate(NAV_ITEMS):
            btn = SidebarButton(
                self,
                icon_symbol=item.icon_symbol,
                text=t(item.label_key),
                active=(item.page_id == self._current_page),
                on_click=self._handle_click,
                page_id=item.page_id,
            )
            btn.grid(row=i + 2, column=0, padx=S.SIDEBAR_ITEM_PAD, pady=2, sticky="ew")
            self._buttons[item.page_id] = btn

        # Language toggle
        self._lang_btn = SidebarButton(
            self,
            icon_symbol=NAV_ICONS["language"],
            text=self._lang_display(),
            on_click=self._handle_lang_click,
            page_id="language",
        )
        self._lang_btn.grid(row=100, column=0, padx=S.SIDEBAR_ITEM_PAD, pady=(4, S.SIDEBAR_BOTTOM_PAD), sticky="ew")

    def _lang_display(self) -> str:
        return "中文 / EN" if self._current_lang == "zh" else "EN / 中文"

    def _handle_click(self, page_id: str) -> None:
        if page_id == self._current_page:
            return
        self._current_page = page_id
        for pid, btn in self._buttons.items():
            btn.set_active(pid == page_id)
        self._on_page_select(page_id)

    def _handle_lang_click(self, page_id: str) -> None:
        self._current_lang = "en" if self._current_lang == "zh" else "zh"
        self._lang_btn.update_text(self._lang_display())
        self._on_language_toggle()

    def refresh_labels(self) -> None:
        for item in NAV_ITEMS:
            if item.page_id in self._buttons:
                self._buttons[item.page_id].update_text(t(item.label_key))
        self._lang_btn.update_text(self._lang_display())

    def set_active_page(self, page_id: str) -> None:
        self._current_page = page_id
        for pid, btn in self._buttons.items():
            btn.set_active(pid == page_id)
