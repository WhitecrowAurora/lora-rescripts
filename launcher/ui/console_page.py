"""Console page — Claymorphism terminal with soft dark inset and toolbar."""

from __future__ import annotations

import customtkinter as ctk

from launcher.assets import style as S
from launcher.i18n import t


class ConsolePage(ctk.CTkFrame):
    """Console/log output page with clay-style terminal inset."""

    def __init__(self, master):
        super().__init__(master, fg_color="transparent")
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Toolbar
        toolbar = ctk.CTkFrame(self, fg_color="transparent")
        toolbar.grid(row=0, column=0, padx=S.INNER_PAD, pady=(S.INNER_PAD, 6), sticky="ew")
        toolbar.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            toolbar, text=t("console_title"),
            font=S.FONT_H2, text_color=S.TEXT_WHITE, anchor="w",
        ).grid(row=0, column=0, sticky="w")

        btn_frame = ctk.CTkFrame(toolbar, fg_color="transparent")
        btn_frame.grid(row=0, column=1, sticky="e")

        self._copy_btn = ctk.CTkButton(
            btn_frame, text=t("console_copy"), font=S.FONT_TINY,
            width=60, height=26, corner_radius=10,
            fg_color=S.BG_INPUT, hover_color=S.ACCENT_DIM,
            border_width=1, border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_SECONDARY,
            command=self._copy,
        )
        self._copy_btn.pack(side="right", padx=(4, 0))

        self._clear_btn = ctk.CTkButton(
            btn_frame, text=t("console_clear"), font=S.FONT_TINY,
            width=60, height=26, corner_radius=10,
            fg_color=S.BG_INPUT, hover_color=S.ACCENT_DIM,
            border_width=1, border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_SECONDARY,
            command=self._clear,
        )
        self._clear_btn.pack(side="right", padx=(4, 0))

        # Console text area — dark inset with shadow frame
        shadow = ctk.CTkFrame(
            self, fg_color=S.SHADOW_CARD,
            corner_radius=S.CARD_CORNER_RADIUS + 2,
        )
        shadow.grid(row=1, column=0, padx=S.INNER_PAD, pady=(0, S.INNER_PAD), sticky="nsew")
        shadow.grid_columnconfigure(0, weight=1)
        shadow.grid_rowconfigure(0, weight=1)

        self._textbox = ctk.CTkTextbox(
            shadow,
            font=S.FONT_CONSOLE,
            fg_color="#1e1e2e",
            text_color="#cdd6f4",
            corner_radius=S.CARD_CORNER_RADIUS,
            border_width=1,
            border_color=S.BORDER_SUBTLE,
            wrap="word",
            activate_scrollbars=True,
        )
        self._textbox.grid(row=0, column=0, padx=2, pady=2, sticky="nsew")
        self._textbox.configure(state="disabled")

        self._placeholder = True
        self._append_text(t("console_empty") + "\n", dim=True)

    def append_line(self, line: str) -> None:
        if self._placeholder:
            self._textbox.configure(state="normal")
            self._textbox.delete("1.0", "end")
            self._placeholder = False

        self._textbox.configure(state="normal")
        self._textbox.insert("end", line + "\n")
        self._textbox.see("end")
        self._textbox.configure(state="disabled")

    def _append_text(self, text: str, dim: bool = False) -> None:
        self._textbox.configure(state="normal")
        self._textbox.insert("end", text)
        self._textbox.see("end")
        self._textbox.configure(state="disabled")

    def _clear(self) -> None:
        self._textbox.configure(state="normal")
        self._textbox.delete("1.0", "end")
        self._textbox.configure(state="disabled")
        self._placeholder = True
        self._append_text(t("console_empty") + "\n", dim=True)

    def _copy(self) -> None:
        self._textbox.configure(state="normal")
        text = self._textbox.get("1.0", "end")
        self._textbox.configure(state="disabled")
        self.clipboard_clear()
        self.clipboard_append(text)

    def refresh_labels(self) -> None:
        pass
