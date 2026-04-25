"""About page — Claymorphism centered layout with shadow card and project info."""

from __future__ import annotations

import webbrowser

import customtkinter as ctk

from launcher.assets import style as S
from launcher.config import APP_VERSION
from launcher.i18n import t


class AboutPage(ctk.CTkFrame):
    """About page with clay shadow card and version info."""

    def __init__(self, master, version: str = APP_VERSION):
        super().__init__(master, fg_color="transparent")
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        self._version = version
        self._build_ui()

    def _build_ui(self) -> None:
        for child in self.winfo_children():
            child.destroy()

        center = ctk.CTkFrame(self, fg_color="transparent")
        center.grid(row=0, column=0, sticky="nsew")
        center.grid_columnconfigure(0, weight=1)
        center.grid_rowconfigure(0, weight=1)

        # Inner container that vertically centers content
        inner = ctk.CTkFrame(center, fg_color="transparent")
        inner.grid(row=0, column=0)

        ctk.CTkLabel(
            inner, text="SD-reScripts",
            font=S.FONT_H1, text_color=S.ACCENT,
        ).grid(row=0, column=0, pady=(0, 2))

        ctk.CTkLabel(
            inner, text=self._version,
            font=S.FONT_SMALL, text_color=S.TEXT_SECONDARY,
        ).grid(row=1, column=0, pady=(0, 32))

        shadow = ctk.CTkFrame(
            inner, fg_color=S.SHADOW_CARD,
            corner_radius=S.CARD_CORNER_RADIUS + 2,
        )
        shadow.grid(row=2, column=0, sticky="ew")

        info_card = ctk.CTkFrame(
            shadow, fg_color=S.BG_CARD, corner_radius=S.CARD_CORNER_RADIUS,
            border_width=1, border_color=S.BORDER_SUBTLE,
        )
        info_card.pack(padx=2, pady=2, fill="both", expand=True)
        info_card.grid_columnconfigure(1, weight=1)

        info_items = [
            (t("about_version"), self._version),
            (t("about_project"), "SD-reScripts"),
            (t("about_fork"), "Akegarasu/lora-scripts"),
        ]

        for i, (label, value) in enumerate(info_items):
            ctk.CTkLabel(
                info_card, text=label, font=S.FONT_SMALL,
                text_color=S.TEXT_DIM, width=120, anchor="w",
            ).grid(row=i, column=0, padx=(S.CARD_INNER_PAD + 6, 12), pady=14)

            ctk.CTkLabel(
                info_card, text=value, font=S.FONT_BODY_BOLD,
                text_color=S.TEXT_PRIMARY, anchor="w",
            ).grid(row=i, column=1, padx=(0, S.CARD_INNER_PAD + 6), pady=14, sticky="ew")

            if i < len(info_items) - 1:
                ctk.CTkFrame(
                    info_card, fg_color=S.BORDER_SUBTLE, height=1,
                ).grid(row=i, column=0, columnspan=2, padx=S.CARD_INNER_PAD + 6, sticky="ew")

        # Clickable GitHub link
        github_url = "https://github.com/WhitecrowAurora/lora-rescripts"
        self._link_label = ctk.CTkLabel(
            inner,
            text=github_url,
            font=S.FONT_SMALL, text_color=S.ACCENT,
            cursor="hand2",
        )
        self._link_label.grid(row=3, column=0, pady=(28, 0))
        self._link_label.bind("<Button-1>", lambda e: webbrowser.open(github_url))

        ctk.CTkLabel(
            inner,
            text=t("about_footer"),
            font=S.FONT_TINY, text_color=S.TEXT_DIM,
        ).grid(row=4, column=0, pady=(6, 0))

    def refresh_labels(self) -> None:
        self._build_ui()
