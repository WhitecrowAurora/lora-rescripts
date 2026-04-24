"""Advanced options page — Claymorphism sectioned form with shadow cards."""

from __future__ import annotations

from typing import Callable, Optional

import customtkinter as ctk

from launcher.assets import style as S
from launcher.config import DEFAULT_HOST, DEFAULT_PORT
from launcher.i18n import t


class SectionFrame(ctk.CTkFrame):
    """A grouped section with clay shadow and title label."""

    def __init__(self, master, title: str = ""):
        # Outer shadow
        self._shadow = ctk.CTkFrame(
            master, fg_color=S.SHADOW_CARD,
            corner_radius=S.CARD_CORNER_RADIUS + 2,
        )
        super().__init__(
            self._shadow, fg_color=S.BG_CARD,
            corner_radius=S.CARD_CORNER_RADIUS,
            border_width=1, border_color=S.BORDER_SUBTLE,
        )
        self.pack(padx=2, pady=2, fill="both", expand=True)
        self.grid_columnconfigure(0, weight=1)
        self._row = 0
        if title:
            ctk.CTkLabel(
                self, text=title, font=S.FONT_H3,
                text_color=S.TEXT_WHITE, anchor="w",
            ).grid(row=self._row, column=0, padx=20, pady=(16, 8), sticky="ew")
            self._row += 1

    @property
    def shadow(self) -> ctk.CTkFrame:
        return self._shadow

    def add_row(self, widget_factory) -> None:
        """Add a row widget. widget_factory receives (parent, row)."""
        widget_factory(self, self._row)
        self._row += 1


class AdvancedPage(ctk.CTkScrollableFrame):
    """Advanced options page — Claymorphism style."""

    def __init__(self, master):
        super().__init__(master, fg_color="transparent")
        self.grid_columnconfigure(0, weight=1)
        self._on_change: Optional[Callable] = None

        row = 0

        # ===== Attention Policy Section =====
        sec_attention = SectionFrame(self, title=t("attention_policy"))
        sec_attention.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=(S.INNER_PAD, 10), sticky="ew")
        row += 1

        self._attention_var = ctk.StringVar(value="default")
        policies = [
            ("default", "attention_default", "attention_default_desc"),
            ("prefer_sage", "attention_prefer_sage", "attention_prefer_sage_desc"),
            ("force_sdpa", "attention_force_sdpa", "attention_force_sdpa_desc"),
        ]
        for i, (val, label_key, desc_key) in enumerate(policies):
            rb_row = sec_attention._row
            rb = ctk.CTkRadioButton(
                sec_attention, text=t(label_key), variable=self._attention_var,
                value=val, font=S.FONT_BODY, text_color=S.TEXT_PRIMARY,
                fg_color=S.ACCENT, hover_color=S.ACCENT_HOVER,
                border_color=S.BORDER_CARD,
                command=self._notify_change,
            )
            rb.grid(row=rb_row, column=0, padx=28, pady=4, sticky="w")
            sec_attention._row += 1

            desc = ctk.CTkLabel(
                sec_attention, text=t(desc_key), font=S.FONT_TINY,
                text_color=S.TEXT_DIM, anchor="w",
            )
            desc.grid(row=sec_attention._row, column=0, padx=48, pady=(0, 4), sticky="w")
            sec_attention._row += 1

        # ===== Toggles Section =====
        sec_toggles = SectionFrame(self)
        sec_toggles.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=10, sticky="ew")
        row += 1

        # Safe Mode
        self._safe_mode_var = ctk.BooleanVar(value=False)
        sm_frame = ctk.CTkFrame(sec_toggles, fg_color="transparent")
        sm_frame.grid(row=sec_toggles._row, column=0, padx=20, pady=8, sticky="ew")
        sm_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkSwitch(
            sm_frame, text=t("safe_mode"), variable=self._safe_mode_var,
            font=S.FONT_BODY, text_color=S.TEXT_PRIMARY,
            fg_color=S.BG_INPUT, progress_color=S.ACCENT,
            button_color="#ffffff", button_hover_color=S.ACCENT_HOVER,
            command=self._notify_change,
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkLabel(
            sm_frame, text=t("safe_mode_desc"), font=S.FONT_TINY,
            text_color=S.TEXT_DIM, anchor="w",
        ).grid(row=1, column=0, padx=28, sticky="w")
        sec_toggles._row += 1

        # CN Mirror
        self._cn_mirror_var = ctk.BooleanVar(value=False)
        cm_frame = ctk.CTkFrame(sec_toggles, fg_color="transparent")
        cm_frame.grid(row=sec_toggles._row, column=0, padx=20, pady=8, sticky="ew")
        cm_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkSwitch(
            cm_frame, text=t("cn_mirror"), variable=self._cn_mirror_var,
            font=S.FONT_BODY, text_color=S.TEXT_PRIMARY,
            fg_color=S.BG_INPUT, progress_color=S.ACCENT,
            button_color="#ffffff", button_hover_color=S.ACCENT_HOVER,
            command=self._notify_change,
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkLabel(
            cm_frame, text=t("cn_mirror_desc"), font=S.FONT_TINY,
            text_color=S.TEXT_DIM, anchor="w",
        ).grid(row=1, column=0, padx=28, sticky="w")
        sec_toggles._row += 1

        # ===== Network Section =====
        sec_network = SectionFrame(self)
        sec_network.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=10, sticky="ew")
        row += 1

        net_frame = ctk.CTkFrame(sec_network, fg_color="transparent")
        net_frame.grid(row=sec_network._row, column=0, padx=20, pady=12, sticky="ew")
        net_frame.grid_columnconfigure(1, weight=1)
        net_frame.grid_columnconfigure(3, weight=1)

        ctk.CTkLabel(
            net_frame, text=t("host"), font=S.FONT_SMALL,
            text_color=S.TEXT_SECONDARY, width=70,
        ).grid(row=0, column=0, padx=(0, 6))

        self._host_var = ctk.StringVar(value=DEFAULT_HOST)
        ctk.CTkEntry(
            net_frame, textvariable=self._host_var, font=S.FONT_SMALL,
            width=140, height=S.INPUT_HEIGHT, corner_radius=S.INPUT_CORNER_RADIUS,
            fg_color=S.BG_INPUT, border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_PRIMARY,
        ).grid(row=0, column=1, padx=(0, 16))

        ctk.CTkLabel(
            net_frame, text=t("port"), font=S.FONT_SMALL,
            text_color=S.TEXT_SECONDARY, width=40,
        ).grid(row=0, column=2, padx=(0, 6))

        self._port_var = ctk.StringVar(value=str(DEFAULT_PORT))
        ctk.CTkEntry(
            net_frame, textvariable=self._port_var, font=S.FONT_SMALL,
            width=80, height=S.INPUT_HEIGHT, corner_radius=S.INPUT_CORNER_RADIUS,
            fg_color=S.BG_INPUT, border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_PRIMARY,
        ).grid(row=0, column=3)
        sec_network._row += 1

        # Listen checkbox
        self._listen_var = ctk.BooleanVar(value=False)
        ctk.CTkCheckBox(
            sec_network, text=t("listen"), variable=self._listen_var,
            font=S.FONT_SMALL, text_color=S.TEXT_PRIMARY,
            fg_color=S.ACCENT, hover_color=S.ACCENT_HOVER,
            border_color=S.BORDER_CARD, corner_radius=6,
            command=self._notify_change,
        ).grid(row=sec_network._row, column=0, padx=28, pady=8, sticky="w")
        sec_network._row += 1

        # ===== Feature Toggles Section =====
        sec_features = SectionFrame(self)
        sec_features.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=10, sticky="ew")
        row += 1

        self._disable_tb_var = ctk.BooleanVar(value=False)
        ctk.CTkCheckBox(
            sec_features, text=t("disable_tensorboard"), variable=self._disable_tb_var,
            font=S.FONT_SMALL, text_color=S.TEXT_PRIMARY,
            fg_color=S.ACCENT, hover_color=S.ACCENT_HOVER,
            border_color=S.BORDER_CARD, corner_radius=6,
            command=self._notify_change,
        ).grid(row=sec_features._row, column=0, padx=28, pady=8, sticky="w")
        sec_features._row += 1

        self._disable_te_var = ctk.BooleanVar(value=False)
        ctk.CTkCheckBox(
            sec_features, text=t("disable_tageditor"), variable=self._disable_te_var,
            font=S.FONT_SMALL, text_color=S.TEXT_PRIMARY,
            fg_color=S.ACCENT, hover_color=S.ACCENT_HOVER,
            border_color=S.BORDER_CARD, corner_radius=6,
            command=self._notify_change,
        ).grid(row=sec_features._row, column=0, padx=28, pady=8, sticky="w")
        sec_features._row += 1

        self._disable_mirror_var = ctk.BooleanVar(value=False)
        ctk.CTkCheckBox(
            sec_features, text=t("disable_auto_mirror"), variable=self._disable_mirror_var,
            font=S.FONT_SMALL, text_color=S.TEXT_PRIMARY,
            fg_color=S.ACCENT, hover_color=S.ACCENT_HOVER,
            border_color=S.BORDER_CARD, corner_radius=6,
            command=self._notify_change,
        ).grid(row=sec_features._row, column=0, padx=28, pady=8, sticky="w")
        sec_features._row += 1

        self._dev_var = ctk.BooleanVar(value=False)
        ctk.CTkCheckBox(
            sec_features, text=t("dev_mode"), variable=self._dev_var,
            font=S.FONT_SMALL, text_color=S.TEXT_PRIMARY,
            fg_color=S.ACCENT, hover_color=S.ACCENT_HOVER,
            border_color=S.BORDER_CARD, corner_radius=6,
            command=self._notify_change,
        ).grid(row=sec_features._row, column=0, padx=28, pady=8, sticky="w")
        sec_features._row += 1

    def set_on_change(self, callback: Callable) -> None:
        self._on_change = callback

    def _notify_change(self) -> None:
        if self._on_change:
            self._on_change()

    # --- Getters / Setters ---

    @property
    def attention_policy(self) -> str: return self._attention_var.get()
    @attention_policy.setter
    def attention_policy(self, val: str) -> None: self._attention_var.set(val)

    @property
    def safe_mode(self) -> bool: return self._safe_mode_var.get()
    @safe_mode.setter
    def safe_mode(self, val: bool) -> None: self._safe_mode_var.set(val)

    @property
    def cn_mirror(self) -> bool: return self._cn_mirror_var.get()
    @cn_mirror.setter
    def cn_mirror(self, val: bool) -> None: self._cn_mirror_var.set(val)

    @property
    def host(self) -> str: return self._host_var.get()
    @host.setter
    def host(self, val: str) -> None: self._host_var.set(val)

    @property
    def port(self) -> int:
        try: return int(self._port_var.get())
        except ValueError: return DEFAULT_PORT
    @port.setter
    def port(self, val: int) -> None: self._port_var.set(str(val))

    @property
    def listen(self) -> bool: return self._listen_var.get()
    @listen.setter
    def listen(self, val: bool) -> None: self._listen_var.set(val)

    @property
    def disable_tensorboard(self) -> bool: return self._disable_tb_var.get()
    @disable_tensorboard.setter
    def disable_tensorboard(self, val: bool) -> None: self._disable_tb_var.set(val)

    @property
    def disable_tageditor(self) -> bool: return self._disable_te_var.get()
    @disable_tageditor.setter
    def disable_tageditor(self, val: bool) -> None: self._disable_te_var.set(val)

    @property
    def disable_auto_mirror(self) -> bool: return self._disable_mirror_var.get()
    @disable_auto_mirror.setter
    def disable_auto_mirror(self, val: bool) -> None: self._disable_mirror_var.set(val)

    @property
    def dev_mode(self) -> bool: return self._dev_var.get()
    @dev_mode.setter
    def dev_mode(self, val: bool) -> None: self._dev_var.set(val)

    def refresh_labels(self) -> None:
        pass
