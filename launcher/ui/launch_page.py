"""Launch page — Claymorphism style with animated launch button and status pulse."""

from __future__ import annotations

from typing import Callable, Optional

import customtkinter as ctk

from launcher.assets import style as S
from launcher.config import RUNTIME_MAP
from launcher.core.runtime_detector import RuntimeStatus
from launcher.i18n import t
from launcher.ui.animations import PulseAnimation, StatusPulse
from launcher.ui.icons import StatusDot


class LaunchPage(ctk.CTkFrame):
    """Home page with runtime info and animated launch button."""

    def __init__(
        self,
        master,
        on_launch: Callable[[], None],
        on_stop: Callable[[], None],
        on_page_switch: Callable[[str], None],
    ):
        super().__init__(master, fg_color="transparent")
        self._on_launch = on_launch
        self._on_stop = on_stop
        self._on_page_switch = on_page_switch
        self._is_running = False
        self._selected_runtime: Optional[str] = None
        self._selected_runtime_status: Optional[RuntimeStatus] = None
        self._pulse: Optional[PulseAnimation] = None

        self.grid_columnconfigure(0, weight=1)

        # --- Current runtime card (with clay shadow) ---
        self._shadow_frame = ctk.CTkFrame(
            self, fg_color=S.SHADOW_CARD, corner_radius=S.CARD_CORNER_RADIUS + 2,
        )
        self._shadow_frame.grid(row=0, column=0, padx=S.INNER_PAD, pady=(S.INNER_PAD, 12), sticky="ew")

        self._info_frame = ctk.CTkFrame(
            self._shadow_frame, fg_color=S.BG_CARD, corner_radius=S.CARD_CORNER_RADIUS,
            border_width=1, border_color=S.BORDER_SUBTLE,
        )
        self._info_frame.pack(padx=2, pady=2, fill="both", expand=True)
        self._info_frame.grid_columnconfigure(1, weight=1)

        # Status dot
        self._status_dot = StatusDot(self._info_frame, color=S.TEXT_DIM, size=12)
        self._status_dot.grid(row=0, column=0, rowspan=2, padx=(20, 8), pady=20)

        # Status pulse for "installed" state
        self._dot_pulse: Optional[StatusPulse] = None

        # Runtime name
        self._runtime_name = ctk.CTkLabel(
            self._info_frame, text="--",
            font=S.FONT_H3, text_color=S.TEXT_WHITE, anchor="w",
        )
        self._runtime_name.grid(row=0, column=1, padx=(0, 20), pady=(20, 0), sticky="ew")

        # Status text
        self._runtime_status_label = ctk.CTkLabel(
            self._info_frame, text="",
            font=S.FONT_SMALL, text_color=S.TEXT_DIM, anchor="w",
        )
        self._runtime_status_label.grid(row=1, column=1, padx=(0, 20), pady=(0, 20), sticky="ew")

        # --- Quick info row ---
        info_row = ctk.CTkFrame(self, fg_color="transparent")
        info_row.grid(row=1, column=0, padx=S.INNER_PAD, pady=4, sticky="ew")
        info_row.grid_columnconfigure((0, 1, 2), weight=1)

        self._info_cards: dict[str, ctk.CTkLabel] = {}
        for i, (key, default) in enumerate([("host", "127.0.0.1"), ("port", "28000"), ("mode", "--")]):
            card = ctk.CTkFrame(
                info_row, fg_color=S.BG_CARD, corner_radius=14,
                border_width=1, border_color=S.BORDER_SUBTLE, height=64,
            )
            card.grid(row=0, column=i, padx=4, pady=4, sticky="ew")
            card.grid_columnconfigure(0, weight=1)
            card.grid_propagate(True)

            ctk.CTkLabel(
                card, text=key.upper(), font=S.FONT_TINY, text_color=S.TEXT_DIM,
            ).grid(row=0, column=0, padx=14, pady=(10, 2))

            lbl = ctk.CTkLabel(
                card, text=default, font=S.FONT_BODY_BOLD, text_color=S.TEXT_PRIMARY,
            )
            lbl.grid(row=1, column=0, padx=14, pady=(0, 10))
            self._info_cards[key] = lbl

        # --- Launch button (capsule shape) ---
        self._launch_btn = ctk.CTkButton(
            self,
            text=t("btn_launch"),
            font=S.LAUNCH_BUTTON_FONT,
            fg_color=S.ACCENT,
            hover_color=S.ACCENT_HOVER,
            text_color="#ffffff",
            height=S.LAUNCH_BUTTON_HEIGHT,
            corner_radius=S.LAUNCH_BUTTON_CORNER_RADIUS,
            command=self._handle_launch,
        )
        self._launch_btn.grid(row=2, column=0, padx=S.INNER_PAD, pady=(24, 8), sticky="ew")

        # --- Status message ---
        self._status_label = ctk.CTkLabel(
            self, text="", font=S.FONT_SMALL, text_color=S.TEXT_DIM,
        )
        self._status_label.grid(row=3, column=0, padx=S.INNER_PAD, pady=(0, 4))

        # --- Hint ---
        self._hint_label = ctk.CTkLabel(
            self, text="", font=S.FONT_TINY, text_color=S.TEXT_DIM,
        )
        self._hint_label.grid(row=4, column=0, padx=S.INNER_PAD, pady=(0, 8))

    def update_runtime(
        self,
        runtime_id: Optional[str],
        status: Optional[RuntimeStatus],
        auto_runtime: Optional[str] = None,
    ) -> None:
        self._selected_runtime = runtime_id
        self._selected_runtime_status = status

        # Stop any existing pulse
        if self._dot_pulse:
            self._dot_pulse.stop()
            self._dot_pulse = None

        if runtime_id and runtime_id in RUNTIME_MAP:
            rt = RUNTIME_MAP[runtime_id]
            is_zh = t("app_title") == "SD-reScripts 启动器"
            name = rt.name_zh if is_zh else rt.name_en
            self._runtime_name.configure(text=name)
        else:
            self._runtime_name.configure(text="--")

        if status:
            if status.installed:
                self._status_dot.set_color(S.GREEN)
                self._runtime_status_label.configure(
                    text=t("status_installed"), text_color=S.GREEN,
                )
                # Pulse the dot for installed runtimes
                self._dot_pulse = StatusPulse(
                    self._status_dot, color=S.GREEN, dim_color=S.GREEN_DIM,
                    steps=12, interval=50,
                )
                self._dot_pulse.start()
            elif status.python_exists or status.env_dir:
                self._status_dot.set_color(S.YELLOW)
                self._runtime_status_label.configure(
                    text=t("status_partial"), text_color=S.YELLOW,
                )
            else:
                self._status_dot.set_color(S.TEXT_DIM)
                self._runtime_status_label.configure(
                    text=t("status_missing"), text_color=S.TEXT_DIM,
                )
        else:
            self._status_dot.set_color(S.TEXT_DIM)
            self._runtime_status_label.configure(text="", text_color=S.TEXT_DIM)

        self._update_hint()

    def update_connection_info(self, host: str, port: int, mode: str) -> None:
        self._info_cards["host"].configure(text=host)
        self._info_cards["port"].configure(text=str(port))
        self._info_cards["mode"].configure(text=mode)

    def set_running(self, running: bool) -> None:
        self._is_running = running
        # Stop launch button pulse if running
        if self._pulse:
            self._pulse.stop()
            self._pulse = None

        if running:
            self._launch_btn.configure(
                text=t("stop"),
                fg_color=S.RED,
                hover_color="#e06060",
                command=self._on_stop,
            )
            self._status_label.configure(text=t("status_running"), text_color=S.GREEN)
        else:
            self._launch_btn.configure(
                text=t("btn_launch"),
                fg_color=S.ACCENT,
                hover_color=S.ACCENT_HOVER,
                command=self._handle_launch,
            )
            self._status_label.configure(text="", text_color=S.TEXT_DIM)

    def set_status(self, text: str, color: str = S.TEXT_DIM) -> None:
        self._status_label.configure(text=text, text_color=color)

    def _update_hint(self) -> None:
        if not self._selected_runtime or not self._selected_runtime_status:
            self._hint_label.configure(
                text=t("select_runtime_first"), text_color=S.ORANGE,
            )
        elif not self._selected_runtime_status.installed:
            self._hint_label.configure(
                text=t("no_runtime_installed"), text_color=S.RED,
            )
        else:
            self._hint_label.configure(text="", text_color=S.TEXT_DIM)

    def _handle_launch(self) -> None:
        self._on_launch()

    def refresh_labels(self) -> None:
        self._launch_btn.configure(text=t("btn_launch") if not self._is_running else t("stop"))
        if self._selected_runtime and self._selected_runtime in RUNTIME_MAP:
            rt = RUNTIME_MAP[self._selected_runtime]
            is_zh = t("app_title") == "SD-reScripts 启动器"
            name = rt.name_zh if is_zh else rt.name_en
            self._runtime_name.configure(text=name)
        self._update_hint()
