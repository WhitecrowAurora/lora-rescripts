"""Extension management page — Claymorphism cards with enable/disable toggles.

Reads plugin manifests from plugin/backend/ and persisted enable state from
config/plugins/enabled.json, using the same logic as the main project's
PluginRuntime.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Dict, List, Optional

import customtkinter as ctk

from launcher.assets import style as S
from launcher.i18n import t
from launcher.ui.icons import StatusDot


@dataclass
class PluginInfo:
    """Lightweight plugin info for the UI."""
    plugin_id: str
    name: str
    version: str
    description: str
    dir_name: str
    enabled: bool
    enabled_by_default: bool
    has_override: bool
    capabilities: list
    hooks: list
    error: str


def scan_plugins(repo_root: Path, enabled_store_path: Path) -> List[PluginInfo]:
    """Scan plugin/backend/ for manifests and resolve enabled state."""
    plugin_root = repo_root / "plugin" / "backend"
    if not plugin_root.exists():
        return []

    enabled_store: dict = {}
    if enabled_store_path.exists():
        try:
            with open(enabled_store_path, "r", encoding="utf-8") as f:
                enabled_store = json.load(f)
        except Exception:
            pass

    records: list = enabled_store.get("records", []) if isinstance(enabled_store, dict) else []

    plugins: List[PluginInfo] = []
    for plugin_dir in sorted(plugin_root.iterdir(), key=lambda p: p.name.lower()):
        manifest_path = plugin_dir / "plugin_manifest.json"
        if not manifest_path.exists():
            continue
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
            if not isinstance(payload, dict):
                continue
        except Exception:
            plugins.append(PluginInfo(
                plugin_id=plugin_dir.name,
                name=plugin_dir.name,
                version="?",
                description="",
                dir_name=plugin_dir.name,
                enabled=False,
                enabled_by_default=True,
                has_override=False,
                capabilities=[],
                hooks=[],
                error="Invalid manifest",
            ))
            continue

        plugin_id = str(payload.get("id", "") or "").strip() or plugin_dir.name
        name = str(payload.get("name", "") or "").strip() or plugin_id
        version = str(payload.get("version", "") or "").strip() or "?"
        description = str(payload.get("description", "") or "").strip()
        enabled_by_default = bool(payload.get("enabled_by_default", True))
        caps = payload.get("capabilities", [])
        hooks_raw = payload.get("hooks", [])
        hooks = [str(h.get("event", "")) for h in hooks_raw if isinstance(h, dict)] if isinstance(hooks_raw, list) else []

        # Resolve enabled state from store
        matched = None
        for rec in records:
            if isinstance(rec, dict) and str(rec.get("plugin_id", "")).strip() == plugin_id:
                matched = rec
                break

        if matched is not None:
            has_override = True
            enabled = bool(matched.get("enabled", enabled_by_default))
        else:
            has_override = False
            enabled = enabled_by_default

        plugins.append(PluginInfo(
            plugin_id=plugin_id,
            name=name,
            version=version,
            description=description,
            dir_name=plugin_dir.name,
            enabled=enabled,
            enabled_by_default=enabled_by_default,
            has_override=has_override,
            capabilities=caps if isinstance(caps, list) else [],
            hooks=hooks,
            error="",
        ))

    return plugins


def set_plugin_enabled(repo_root: Path, plugin_id: str, enabled: bool) -> None:
    """Write enable override to config/plugins/enabled.json."""
    config_root = repo_root / "config" / "plugins"
    config_root.mkdir(parents=True, exist_ok=True)
    enabled_path = config_root / "enabled.json"

    store: dict = {"schema": "plugin-enabled-v1", "records": []}
    if enabled_path.exists():
        try:
            with open(enabled_path, "r", encoding="utf-8") as f:
                store = json.load(f)
            if not isinstance(store, dict):
                store = {"schema": "plugin-enabled-v1", "records": []}
        except Exception:
            pass

    records = store.get("records", [])
    if not isinstance(records, list):
        records = []

    # Remove existing entry
    records = [r for r in records if isinstance(r, dict) and str(r.get("plugin_id", "")).strip() != plugin_id]

    records.append({
        "plugin_id": plugin_id,
        "enabled": enabled,
        "updated_by": "launcher",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    store["records"] = records
    with open(enabled_path, "w", encoding="utf-8") as f:
        json.dump(store, f, indent=2, ensure_ascii=False)


class PluginCard(ctk.CTkFrame):
    """A single plugin card with enable/disable toggle."""

    def __init__(
        self,
        master,
        plugin: PluginInfo,
        on_toggle: Callable[[str, bool], None],
    ):
        # Shadow frame
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
            border_color=S.BORDER_ACCENT if plugin.enabled else S.BORDER_SUBTLE,
        )
        self.pack(padx=2, pady=2, fill="both", expand=True)
        self.grid_columnconfigure(1, weight=1)

        self._plugin = plugin
        self._on_toggle = on_toggle

        # Status dot
        dot_color = S.GREEN if plugin.enabled else S.TEXT_DIM
        self._dot = StatusDot(self, color=dot_color, size=10)
        self._dot.grid(row=0, column=0, rowspan=2, padx=(16, 4), pady=14)

        # Name + version
        name_frame = ctk.CTkFrame(self, fg_color="transparent")
        name_frame.grid(row=0, column=1, padx=(0, 8), pady=(12, 0), sticky="ew")
        name_frame.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            name_frame, text=plugin.name, font=S.FONT_BODY_CJK_BOLD,
            text_color=S.TEXT_WHITE if plugin.enabled else S.TEXT_SECONDARY, anchor="w",
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkLabel(
            name_frame, text=plugin.version, font=S.FONT_TINY,
            text_color=S.TEXT_DIM, anchor="w",
        ).grid(row=0, column=1, padx=(6, 0))

        # Description
        desc_text = plugin.description if plugin.description else (plugin.error or "")
        desc_color = S.TEXT_DIM if not plugin.error else S.RED
        ctk.CTkLabel(
            self, text=desc_text, font=S.FONT_TINY,
            text_color=desc_color, anchor="w", wraplength=400,
        ).grid(row=1, column=1, padx=(0, 8), pady=(0, 12), sticky="ew")

        # Hooks/capabilities badges
        if plugin.hooks or plugin.capabilities:
            badge_frame = ctk.CTkFrame(self, fg_color="transparent")
            badge_frame.grid(row=2, column=1, padx=(0, 8), pady=(0, 10), sticky="ew")

            for cap in plugin.capabilities[:3]:
                ctk.CTkLabel(
                    badge_frame, text=cap, font=S.FONT_BADGE,
                    text_color=S.ACCENT, fg_color=S.ACCENT_DIM,
                    corner_radius=6, padx=6, pady=1,
                ).pack(side="left", padx=(0, 4))

            for hook in plugin.hooks[:3]:
                ctk.CTkLabel(
                    badge_frame, text=hook, font=S.FONT_BADGE,
                    text_color=S.TEXT_SECONDARY, fg_color=S.BG_INPUT,
                    corner_radius=6, padx=6, pady=1,
                ).pack(side="left", padx=(0, 4))

            if len(plugin.hooks) + len(plugin.capabilities) > 6:
                extra = len(plugin.hooks) + len(plugin.capabilities) - 6
                ctk.CTkLabel(
                    badge_frame, text=f"+{extra}", font=S.FONT_BADGE,
                    text_color=S.TEXT_DIM,
                ).pack(side="left", padx=(4, 0))

        # Enable/disable switch
        right_frame = ctk.CTkFrame(self, fg_color="transparent")
        right_frame.grid(row=0, column=2, rowspan=2, padx=(0, 16), pady=10)

        self._switch_var = ctk.BooleanVar(value=plugin.enabled)
        self._switch = ctk.CTkSwitch(
            right_frame, text="", variable=self._switch_var,
            font=S.FONT_SMALL, text_color=S.TEXT_PRIMARY,
            fg_color=S.BG_INPUT, progress_color=S.ACCENT,
            button_color="#ffffff", button_hover_color=S.ACCENT_HOVER,
            width=40, command=self._on_switch,
        )
        self._switch.pack()

    @property
    def shadow(self) -> ctk.CTkFrame:
        return self._shadow

    def _on_switch(self) -> None:
        enabled = self._switch_var.get()
        self._dot.set_color(S.GREEN if enabled else S.TEXT_DIM)
        border = S.BORDER_ACCENT if enabled else S.BORDER_SUBTLE
        self.configure(border_color=border)
        self._on_toggle(self._plugin.plugin_id, enabled)

    def destroy(self):
        self._shadow.destroy()
        super().destroy()


class ExtensionPage(ctk.CTkScrollableFrame):
    """Extension management page — list of plugin cards with enable/disable."""

    def __init__(
        self,
        master,
        repo_root: Path,
        on_toggle: Optional[Callable[[str, bool], None]] = None,
    ):
        super().__init__(master, fg_color="transparent")
        self._repo_root = repo_root
        self._enabled_store_path = repo_root / "config" / "plugins" / "enabled.json"
        self._on_toggle_callback = on_toggle
        self._cards: list[PluginCard] = []
        self._empty_label: Optional[ctk.CTkLabel] = None
        self.grid_columnconfigure(0, weight=1)

        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, padx=S.INNER_PAD, pady=(S.INNER_PAD, 8), sticky="ew")
        header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            header, text=t("extension_title"),
            font=S.FONT_H2, text_color=S.TEXT_WHITE, anchor="w",
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkButton(
            header, text=t("btn_refresh"), font=S.FONT_TINY,
            width=80, height=28, corner_radius=10,
            fg_color=S.BG_INPUT, hover_color=S.ACCENT_DIM,
            border_width=1, border_color=S.BORDER_SUBTLE,
            text_color=S.TEXT_SECONDARY,
            command=self.refresh,
        ).grid(row=0, column=1, padx=(8, 0))

        # Note
        self._note_label = ctk.CTkLabel(
            self, text=t("extension_note"),
            font=S.FONT_SMALL, text_color=S.TEXT_DIM, anchor="w",
            wraplength=600,
        )
        self._note_label.grid(row=1, column=0, padx=S.INNER_PAD, pady=(0, 8), sticky="ew")

        # Plugin list container
        self._list_row = 2
        self._plugins: List[PluginInfo] = []

        # Initial scan
        self.refresh()

    def refresh(self) -> None:
        """Rescan plugins and rebuild card list."""
        for card in self._cards:
            card.destroy()
        self._cards.clear()
        if self._empty_label:
            self._empty_label.destroy()
            self._empty_label = None

        self._plugins = scan_plugins(self._repo_root, self._enabled_store_path)

        if not self._plugins:
            self._empty_label = ctk.CTkLabel(
                self,
                text=t("extension_no_plugins"),
                font=S.FONT_H3, text_color=S.TEXT_DIM,
            )
            self._empty_label.grid(row=self._list_row, column=0, padx=20, pady=40)
            return

        for i, plugin in enumerate(self._plugins):
            card = PluginCard(
                self,
                plugin=plugin,
                on_toggle=self._handle_toggle,
            )
            card.shadow.grid(row=self._list_row + i, column=0, padx=S.INNER_PAD, pady=4, sticky="ew")
            self._cards.append(card)

    def _handle_toggle(self, plugin_id: str, enabled: bool) -> None:
        set_plugin_enabled(self._repo_root, plugin_id, enabled)
        if self._on_toggle_callback:
            self._on_toggle_callback(plugin_id, enabled)

    def refresh_labels(self) -> None:
        self._note_label.configure(text=t("extension_note"))
