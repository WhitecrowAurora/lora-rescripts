"""Install page — Claymorphism list with shadow cards and status dots."""

from __future__ import annotations

from typing import Callable, Dict

import customtkinter as ctk

from launcher.assets import style as S
from launcher.config import RUNTIMES, RUNTIME_MAP
from launcher.core.runtime_detector import RuntimeStatus
from launcher.i18n import t
from launcher.ui.icons import StatusDot


class InstallPage(ctk.CTkFrame):
    """Page for installing missing runtimes — Claymorphism style."""

    def __init__(
        self,
        master,
        on_install: Callable[[str], None],
        on_refresh: Callable[[], None],
    ):
        super().__init__(master, fg_color="transparent")
        self._on_install = on_install
        self._on_refresh = on_refresh
        self._installing = False

        self.grid_columnconfigure(0, weight=1)

        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, padx=S.INNER_PAD, pady=(S.INNER_PAD, 8), sticky="ew")
        header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            header, text=t("install_page_title"),
            font=S.FONT_H2, text_color=S.TEXT_WHITE, anchor="w",
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkButton(
            header, text=t("btn_refresh"), font=S.FONT_TINY,
            width=80, height=28, corner_radius=10,
            fg_color=S.BG_INPUT, hover_color=S.ACCENT_DIM,
            border_width=1, border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_SECONDARY,
            command=self._on_refresh,
        ).grid(row=0, column=1, padx=(8, 0))

        # Note
        self._note_label = ctk.CTkLabel(
            self, text=t("install_prerequisites"),
            font=S.FONT_SMALL, text_color=S.TEXT_DIM, anchor="w",
            wraplength=600,
        )
        self._note_label.grid(row=1, column=0, padx=S.INNER_PAD, pady=(0, 8), sticky="ew")

        # Scrollable list
        self._list_frame = ctk.CTkScrollableFrame(self, fg_color="transparent")
        self._list_frame.grid(row=2, column=0, padx=8, pady=4, sticky="nsew")
        self._list_frame.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        self._install_items: list[dict] = []

    def update_runtimes(self, statuses: Dict[str, RuntimeStatus]) -> None:
        for item in self._install_items:
            item["frame"].destroy()
        self._install_items.clear()

        row = 0
        for rt in RUNTIMES:
            status = statuses.get(rt.id)
            if status and status.installed:
                continue

            is_zh = t("app_title") == "SD-reScripts 启动器"
            name = rt.name_zh if is_zh else rt.name_en
            is_partial = status and (status.python_exists or status.env_dir)
            status_text = t("status_partial") if is_partial else t("status_missing")
            status_color = S.YELLOW if is_partial else S.TEXT_DIM
            status_bg = S.YELLOW_DIM if is_partial else S.BG_INPUT

            # Shadow frame for clay depth
            shadow = ctk.CTkFrame(
                self._list_frame, fg_color=S.SHADOW_CARD,
                corner_radius=S.CARD_CORNER_RADIUS + 2,
            )
            shadow.grid(row=row, column=0, padx=4, pady=3, sticky="ew")
            shadow.grid_columnconfigure(1, weight=1)

            frame = ctk.CTkFrame(
                shadow, fg_color=S.BG_CARD,
                corner_radius=S.CARD_CORNER_RADIUS, height=56,
                border_width=1, border_color=S.BORDER_SUBTLE,
            )
            frame.pack(padx=2, pady=2, fill="both", expand=True)
            frame.grid_columnconfigure(1, weight=1)

            # Status dot
            dot = StatusDot(frame, color=status_color, size=8)
            dot.grid(row=0, column=0, padx=(14, 8), pady=14)

            # Name
            ctk.CTkLabel(
                frame, text=name, font=S.FONT_BODY_CJK_BOLD,
                text_color=S.TEXT_PRIMARY, anchor="w",
            ).grid(row=0, column=1, padx=(0, 8), sticky="ew")

            # Experimental badge
            if rt.experimental:
                ctk.CTkLabel(
                    frame, text=t("experimental_badge"),
                    font=S.FONT_BADGE, text_color=S.ORANGE,
                    fg_color=S.ORANGE_DIM, corner_radius=8, padx=6, pady=2,
                ).grid(row=0, column=2, padx=(0, 4))

            # Install button
            install_btn = ctk.CTkButton(
                frame, text=t("btn_install"), font=S.FONT_BUTTON_SMALL,
                width=70, height=30, corner_radius=10,
                fg_color=S.ACCENT, hover_color=S.ACCENT_HOVER,
                text_color="#ffffff",
                command=lambda rt_id=rt.id: self._handle_install(rt_id),
            )
            install_btn.grid(row=0, column=3, padx=(0, 14), pady=10)

            self._install_items.append({
                "frame": shadow,
                "runtime_id": rt.id,
                "button": install_btn,
            })
            row += 1

        if not self._install_items:
            ctk.CTkLabel(
                self._list_frame,
                text=t("status_installed"),
                font=S.FONT_H3, text_color=S.GREEN,
            ).grid(row=0, column=0, padx=20, pady=40)

    def _handle_install(self, runtime_id: str) -> None:
        if self._installing:
            return
        self._on_install(runtime_id)

    def set_installing(self, runtime_id: str, installing: bool) -> None:
        self._installing = installing
        for item in self._install_items:
            if item["runtime_id"] == runtime_id:
                btn = item["button"]
                if installing:
                    btn.configure(
                        text=t("btn_installing"),
                        fg_color=S.ORANGE_DIM,
                        text_color=S.ORANGE,
                        state="disabled",
                    )
                else:
                    btn.configure(
                        text=t("btn_install"),
                        fg_color=S.ACCENT,
                        text_color="#ffffff",
                        state="normal",
                    )
                break

    def refresh_labels(self) -> None:
        self._note_label.configure(text=t("install_prerequisites"))
