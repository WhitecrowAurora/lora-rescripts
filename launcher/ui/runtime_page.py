"""Runtime selection page — Claymorphism cards with shadow depth and soft hover."""

from __future__ import annotations

from typing import Callable, Dict, Optional

import customtkinter as ctk

from launcher.assets import style as S
from launcher.config import RUNTIMES, RUNTIME_MAP, RuntimeDef
from launcher.core.runtime_detector import RuntimeStatus
from launcher.i18n import t
from launcher.ui.animations import HoverAnimator, StatusPulse, SlideIn
from launcher.ui.icons import StatusDot


class RuntimeCard(ctk.CTkFrame):
    """A runtime card with clay shadow, hover transition, and status pulse."""

    def __init__(
        self,
        master,
        runtime_def: RuntimeDef,
        status: RuntimeStatus,
        is_selected: bool,
        on_select: Callable[[str], None],
        on_install: Callable[[str], None],
    ):
        # Outer shadow frame for clay depth
        self._shadow = ctk.CTkFrame(
            master,
            fg_color=S.SHADOW_CARD,
            corner_radius=S.CARD_CORNER_RADIUS + 2,
        )

        super().__init__(
            self._shadow,
            fg_color=S.BG_CARD_SELECTED if is_selected else S.BG_CARD,
            corner_radius=S.CARD_CORNER_RADIUS,
            border_width=2 if is_selected else 1,
            border_color=S.BORDER_ACCENT if is_selected else S.BORDER_SUBTLE,
        )
        self.pack(padx=2, pady=2, fill="both", expand=True)
        self.grid_columnconfigure(1, weight=1)
        self._runtime_def = runtime_def
        self._status = status
        self._is_selected = is_selected
        self._on_select = on_select
        self._on_install = on_install

        # Status dot with pulse animation for installed runtimes
        dot_color = self._status_color()
        self._dot = StatusDot(self, color=dot_color, size=10)
        self._dot.grid(row=0, column=0, rowspan=2, padx=(16, 4), pady=16)

        # Pulse animation for installed status
        self._pulse: Optional[StatusPulse] = None
        if status.installed and is_selected:
            self._pulse = StatusPulse(self._dot, color=dot_color, dim_color=S.GREEN_DIM)
            self._pulse.start()

        # Name
        is_zh = t("app_title") == "SD-reScripts 启动器"
        name = runtime_def.name_zh if is_zh else runtime_def.name_en
        self._name_label = ctk.CTkLabel(
            self, text=name, font=S.FONT_BODY_CJK_BOLD,
            text_color=S.TEXT_WHITE, anchor="w",
        )
        self._name_label.grid(row=0, column=1, padx=(0, 8), pady=(14, 0), sticky="ew")

        # Description
        desc = runtime_def.desc_zh if is_zh else runtime_def.desc_en
        self._desc_label = ctk.CTkLabel(
            self, text=desc,
            font=S.FONT_TINY, text_color=S.TEXT_DIM, anchor="w",
        )
        self._desc_label.grid(row=1, column=1, padx=(0, 8), pady=(0, 14), sticky="ew")

        # Right side
        right_frame = ctk.CTkFrame(self, fg_color="transparent")
        right_frame.grid(row=0, column=2, rowspan=2, padx=(0, 16), pady=12)

        # Status badge
        badge_bg = self._status_bg_color()
        status_text = self._status_text()
        self._badge = ctk.CTkLabel(
            right_frame, text=status_text,
            font=S.FONT_BADGE, text_color=dot_color,
            fg_color=badge_bg, corner_radius=8,
            padx=10, pady=3,
        )
        self._badge.pack(pady=(0, 4))

        # Install button for non-installed
        if not status.installed:
            self._action_btn = ctk.CTkButton(
                right_frame, text=t("btn_install"), font=S.FONT_BUTTON_SMALL,
                width=56, height=24, corner_radius=8,
                fg_color=S.ACCENT_DIM, hover_color=S.ACCENT,
                text_color=S.ACCENT,
                command=lambda: self._on_install(self._runtime_def.id),
            )
            self._action_btn.pack()

        # Hover animator
        if not is_selected:
            self._hover_anim = HoverAnimator(
                self,
                normal=S.BG_CARD,
                hover=S.BG_CARD_HOVER,
                border_normal=S.BORDER_SUBTLE,
                border_hover=S.BORDER_CARD,
                steps=5, interval=12,
            )
        else:
            self._hover_anim = None

        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)
        self.bind("<Button-1>", self._on_click)
        for child in self.winfo_children():
            if child not in (right_frame, self._dot):
                child.bind("<Button-1>", self._on_click)

    @property
    def shadow(self) -> ctk.CTkFrame:
        return self._shadow

    def _status_color(self) -> str:
        if self._status.installed: return S.GREEN
        if self._status.python_exists or self._status.env_dir: return S.YELLOW
        return S.TEXT_DIM

    def _status_bg_color(self) -> str:
        if self._status.installed: return S.GREEN_DIM
        if self._status.python_exists or self._status.env_dir: return S.YELLOW_DIM
        return S.BG_INPUT

    def _status_text(self) -> str:
        if self._status.installed: return t("status_installed")
        if self._status.python_exists or self._status.env_dir: return t("status_partial")
        return t("status_missing")

    def _on_enter(self, event) -> None:
        if self._hover_anim:
            self._hover_anim.on_enter()

    def _on_leave(self, event) -> None:
        if self._hover_anim:
            self._hover_anim.on_leave()

    def _on_click(self, event) -> None:
        if self._status.installed:
            self._on_select(self._runtime_def.id)
        elif self._status.env_dir is not None:
            self._on_install(self._runtime_def.id)

    def destroy(self):
        if self._pulse:
            self._pulse.stop()
        self._shadow.destroy()
        super().destroy()


class RuntimePage(ctk.CTkScrollableFrame):
    """Runtime selection page with clay-style shadow cards."""

    def __init__(
        self,
        master,
        on_select: Callable[[str], None],
        on_install: Callable[[str], None],
        on_refresh: Callable[[], None],
    ):
        super().__init__(master, fg_color="transparent")
        self._on_select = on_select
        self._on_install = on_install
        self._on_refresh = on_refresh
        self._selected_runtime: Optional[str] = None
        self._cards: list[RuntimeCard] = []
        self._category_labels: dict[str, ctk.CTkLabel] = {}

        self.grid_columnconfigure(0, weight=1)

        # Header with clay card
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, padx=S.INNER_PAD, pady=(S.INNER_PAD, 8), sticky="ew")
        header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            header, text=t("runtime_selection"),
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

        self._content_row = 1

    def update_runtimes(
        self,
        statuses: Dict[str, RuntimeStatus],
        selected: Optional[str] = None,
    ) -> None:
        for card in self._cards:
            card.destroy()
        self._cards.clear()
        for label in self._category_labels.values():
            label.destroy()
        self._category_labels.clear()

        self._selected_runtime = selected
        row = self._content_row

        categories: dict[str, list[RuntimeDef]] = {}
        for rt in RUNTIMES:
            categories.setdefault(rt.category, []).append(rt)

        category_order = ["nvidia", "intel", "amd"]
        card_index = 0
        for cat in category_order:
            if cat not in categories:
                continue

            cat_label = ctk.CTkLabel(
                self, text=t(f"category_{cat}"),
                font=S.FONT_SMALL_BOLD, text_color=S.TEXT_SECONDARY, anchor="w",
            )
            cat_label.grid(row=row, column=0, padx=S.INNER_PAD, pady=(18, 6), sticky="ew")
            self._category_labels[cat] = cat_label
            row += 1

            grid_frame = ctk.CTkFrame(self, fg_color="transparent")
            grid_frame.grid(row=row, column=0, padx=0, pady=(0, 4), sticky="ew")
            grid_frame.grid_columnconfigure((0, 1), weight=1)
            row += 1

            for i, rt in enumerate(categories[cat]):
                status = statuses.get(
                    rt.id,
                    RuntimeStatus(runtime_id=rt.id, python_exists=False, deps_installed=False, installed=False),
                )
                card = RuntimeCard(
                    grid_frame,
                    runtime_def=rt,
                    status=status,
                    is_selected=(rt.id == selected),
                    on_select=self._on_select,
                    on_install=self._on_install,
                )
                col = i % 2
                card_grid_row = i // 2
                card.shadow.grid(row=card_grid_row, column=col, padx=6, pady=4, sticky="ew")

                # Slide-in animation with stagger
                anim = SlideIn(card.shadow, direction="left", offset=20, steps=8, interval=14)
                self.after(card_index * 40, anim.start)
                card_index += 1

                self._cards.append(card)

    def refresh_labels(self) -> None:
        for cat, label in self._category_labels.items():
            label.configure(text=t(f"category_{cat}"))
