"""Advanced options page — Claymorphism sectioned form with shadow cards."""

from __future__ import annotations

from typing import Callable, Optional

import customtkinter as ctk

from launcher.assets import style as S
from launcher.config import DEFAULT_HOST, DEFAULT_PORT
from launcher.ui.animations import HoverAnimator
from launcher.i18n import t


class SectionFrame(ctk.CTkFrame):
    """A grouped section with clay shadow and title label."""

    def __init__(self, master, title: str = ""):
        self._shadow = ctk.CTkFrame(
            master,
            fg_color=S.SHADOW_CARD,
            corner_radius=S.CARD_CORNER_RADIUS + 2,
        )
        super().__init__(
            self._shadow,
            fg_color=S.BG_CARD,
            corner_radius=S.CARD_CORNER_RADIUS,
            border_width=1,
            border_color=S.BORDER_SUBTLE,
        )
        self.pack(padx=2, pady=2, fill="both", expand=True)
        self.grid_columnconfigure(0, weight=1)
        self._row = 0
        if title:
            ctk.CTkLabel(
                self,
                text=title,
                font=S.FONT_H3,
                text_color=S.TEXT_WHITE,
                anchor="w",
            ).grid(row=self._row, column=0, padx=S.INNER_PAD - 8, pady=(16, 8), sticky="ew")
            self._row += 1

        # Hover animator for clay depth feedback
        self._hover_anim = HoverAnimator(
            self,
            normal=S.BG_CARD,
            hover=S.BG_CARD_HOVER,
            border_normal=S.BORDER_SUBTLE,
            border_hover=S.BORDER_CARD,
            steps=5, interval=12,
        )
        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)
        for child in self.winfo_children():
            child.bind("<Enter>", self._on_enter)
            child.bind("<Leave>", self._on_leave)

    @property
    def shadow(self) -> ctk.CTkFrame:
        return self._shadow

    def _on_enter(self, event) -> None:
        self._hover_anim.on_enter()

    def _on_leave(self, event) -> None:
        self._hover_anim.on_leave()


class AdvancedPage(ctk.CTkScrollableFrame):
    """Advanced options page — Claymorphism style."""

    def __init__(self, master):
        super().__init__(master, fg_color="transparent")
        self.grid_columnconfigure(0, weight=1)
        self._on_change: Optional[Callable] = None

        self._attention_var = ctk.StringVar(value="default")
        self._safe_mode_var = ctk.BooleanVar(value=False)
        self._cn_mirror_var = ctk.BooleanVar(value=False)
        self._host_var = ctk.StringVar(value=DEFAULT_HOST)
        self._port_var = ctk.StringVar(value=str(DEFAULT_PORT))
        self._listen_var = ctk.BooleanVar(value=False)
        self._disable_tb_var = ctk.BooleanVar(value=False)
        self._disable_te_var = ctk.BooleanVar(value=False)
        self._disable_mirror_var = ctk.BooleanVar(value=False)
        self._dev_var = ctk.BooleanVar(value=False)

        self._bind_variable_traces()
        self._build_ui()

    def _bind_variable_traces(self) -> None:
        self._host_var.trace_add("write", self._on_text_change)
        self._port_var.trace_add("write", self._on_text_change)

    def _on_text_change(self, *_args) -> None:
        self._notify_change()

    def _build_ui(self) -> None:
        for child in self.winfo_children():
            child.destroy()

        row = 0

        sec_attention = SectionFrame(self, title=t("attention_policy"))
        sec_attention.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=(S.INNER_PAD, 10), sticky="ew")
        row += 1

        policies = [
            ("default", "attention_default", "attention_default_desc"),
            ("prefer_sage", "attention_prefer_sage", "attention_prefer_sage_desc"),
            ("prefer_flash", "attention_prefer_flash", "attention_prefer_flash_desc"),
            ("force_sdpa", "attention_force_sdpa", "attention_force_sdpa_desc"),
        ]
        for val, label_key, desc_key in policies:
            rb_row = sec_attention._row
            ctk.CTkRadioButton(
                sec_attention,
                text=t(label_key),
                variable=self._attention_var,
                value=val,
                font=S.FONT_BODY,
                text_color=S.TEXT_PRIMARY,
                fg_color=S.ACCENT,
                hover_color=S.ACCENT_HOVER,
                border_color=S.BORDER_CARD,
                command=self._notify_change,
            ).grid(row=rb_row, column=0, padx=28, pady=4, sticky="w")
            sec_attention._row += 1

            ctk.CTkLabel(
                sec_attention,
                text=t(desc_key),
                font=S.FONT_TINY,
                text_color=S.TEXT_DIM,
                anchor="w",
            ).grid(row=sec_attention._row, column=0, padx=48, pady=(0, 4), sticky="w")
            sec_attention._row += 1

        sec_toggles = SectionFrame(self)
        sec_toggles.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=10, sticky="ew")
        row += 1

        safe_mode_frame = ctk.CTkFrame(sec_toggles, fg_color="transparent")
        safe_mode_frame.grid(row=sec_toggles._row, column=0, padx=20, pady=8, sticky="ew")
        safe_mode_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkSwitch(
            safe_mode_frame,
            text=t("safe_mode"),
            variable=self._safe_mode_var,
            font=S.FONT_BODY,
            text_color=S.TEXT_PRIMARY,
            fg_color=S.BG_INPUT,
            progress_color=S.ACCENT,
            button_color=S.WHITE,
            button_hover_color=S.ACCENT_HOVER,
            command=self._notify_change,
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkLabel(
            safe_mode_frame,
            text=t("safe_mode_desc"),
            font=S.FONT_TINY,
            text_color=S.TEXT_DIM,
            anchor="w",
        ).grid(row=1, column=0, padx=28, sticky="w")
        sec_toggles._row += 1

        cn_mirror_frame = ctk.CTkFrame(sec_toggles, fg_color="transparent")
        cn_mirror_frame.grid(row=sec_toggles._row, column=0, padx=20, pady=8, sticky="ew")
        cn_mirror_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkSwitch(
            cn_mirror_frame,
            text=t("cn_mirror"),
            variable=self._cn_mirror_var,
            font=S.FONT_BODY,
            text_color=S.TEXT_PRIMARY,
            fg_color=S.BG_INPUT,
            progress_color=S.ACCENT,
            button_color=S.WHITE,
            button_hover_color=S.ACCENT_HOVER,
            command=self._notify_change,
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkLabel(
            cn_mirror_frame,
            text=t("cn_mirror_desc"),
            font=S.FONT_TINY,
            text_color=S.TEXT_DIM,
            anchor="w",
        ).grid(row=1, column=0, padx=28, sticky="w")
        sec_toggles._row += 1

        sec_network = SectionFrame(self)
        sec_network.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=10, sticky="ew")
        row += 1

        net_frame = ctk.CTkFrame(sec_network, fg_color="transparent")
        net_frame.grid(row=sec_network._row, column=0, padx=20, pady=12, sticky="ew")
        net_frame.grid_columnconfigure(1, weight=1)
        net_frame.grid_columnconfigure(3, weight=1)

        ctk.CTkLabel(
            net_frame,
            text=t("host"),
            font=S.FONT_SMALL,
            text_color=S.TEXT_SECONDARY,
            width=70,
        ).grid(row=0, column=0, padx=(0, 6))

        ctk.CTkEntry(
            net_frame,
            textvariable=self._host_var,
            font=S.FONT_SMALL,
            width=140,
            height=S.INPUT_HEIGHT,
            corner_radius=S.INPUT_CORNER_RADIUS,
            fg_color=S.BG_INPUT,
            border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_PRIMARY,
        ).grid(row=0, column=1, padx=(0, 16))

        ctk.CTkLabel(
            net_frame,
            text=t("port"),
            font=S.FONT_SMALL,
            text_color=S.TEXT_SECONDARY,
            width=40,
        ).grid(row=0, column=2, padx=(0, 6))

        ctk.CTkEntry(
            net_frame,
            textvariable=self._port_var,
            font=S.FONT_SMALL,
            width=80,
            height=S.INPUT_HEIGHT,
            corner_radius=S.INPUT_CORNER_RADIUS,
            fg_color=S.BG_INPUT,
            border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_PRIMARY,
        ).grid(row=0, column=3)
        sec_network._row += 1

        ctk.CTkCheckBox(
            sec_network,
            text=t("listen"),
            variable=self._listen_var,
            font=S.FONT_SMALL,
            text_color=S.TEXT_PRIMARY,
            fg_color=S.ACCENT,
            hover_color=S.ACCENT_HOVER,
            border_color=S.BORDER_CARD,
            corner_radius=S.CHECKBOX_CORNER_RADIUS,
            command=self._notify_change,
        ).grid(row=sec_network._row, column=0, padx=28, pady=8, sticky="w")
        sec_network._row += 1

        sec_features = SectionFrame(self)
        sec_features.shadow.grid(row=row, column=0, padx=S.INNER_PAD, pady=10, sticky="ew")

        feature_specs = [
            (self._disable_tb_var, "disable_tensorboard"),
            (self._disable_te_var, "disable_tageditor"),
            (self._disable_mirror_var, "disable_auto_mirror"),
            (self._dev_var, "dev_mode"),
        ]
        for var, label_key in feature_specs:
            ctk.CTkCheckBox(
                sec_features,
                text=t(label_key),
                variable=var,
                font=S.FONT_SMALL,
                text_color=S.TEXT_PRIMARY,
                fg_color=S.ACCENT,
                hover_color=S.ACCENT_HOVER,
                border_color=S.BORDER_CARD,
                corner_radius=S.CHECKBOX_CORNER_RADIUS,
                command=self._notify_change,
            ).grid(row=sec_features._row, column=0, padx=28, pady=8, sticky="w")
            sec_features._row += 1

    def set_on_change(self, callback: Callable) -> None:
        self._on_change = callback

    def _notify_change(self) -> None:
        if self._on_change:
            self._on_change()

    @property
    def attention_policy(self) -> str:
        return self._attention_var.get()

    @attention_policy.setter
    def attention_policy(self, val: str) -> None:
        self._attention_var.set(val)

    @property
    def safe_mode(self) -> bool:
        return self._safe_mode_var.get()

    @safe_mode.setter
    def safe_mode(self, val: bool) -> None:
        self._safe_mode_var.set(val)

    @property
    def cn_mirror(self) -> bool:
        return self._cn_mirror_var.get()

    @cn_mirror.setter
    def cn_mirror(self, val: bool) -> None:
        self._cn_mirror_var.set(val)

    @property
    def host(self) -> str:
        return self._host_var.get()

    @host.setter
    def host(self, val: str) -> None:
        self._host_var.set(val)

    @property
    def port(self) -> int:
        try:
            return int(self._port_var.get())
        except ValueError:
            return DEFAULT_PORT

    @port.setter
    def port(self, val: int) -> None:
        self._port_var.set(str(val))

    @property
    def listen(self) -> bool:
        return self._listen_var.get()

    @listen.setter
    def listen(self, val: bool) -> None:
        self._listen_var.set(val)

    @property
    def disable_tensorboard(self) -> bool:
        return self._disable_tb_var.get()

    @disable_tensorboard.setter
    def disable_tensorboard(self, val: bool) -> None:
        self._disable_tb_var.set(val)

    @property
    def disable_tageditor(self) -> bool:
        return self._disable_te_var.get()

    @disable_tageditor.setter
    def disable_tageditor(self, val: bool) -> None:
        self._disable_te_var.set(val)

    @property
    def disable_auto_mirror(self) -> bool:
        return self._disable_mirror_var.get()

    @disable_auto_mirror.setter
    def disable_auto_mirror(self, val: bool) -> None:
        self._disable_mirror_var.set(val)

    @property
    def dev_mode(self) -> bool:
        return self._dev_var.get()

    @dev_mode.setter
    def dev_mode(self, val: bool) -> None:
        self._dev_var.set(val)

    def refresh_labels(self) -> None:
        self._build_ui()
