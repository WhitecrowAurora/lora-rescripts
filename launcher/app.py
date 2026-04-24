"""Main application window — assembles sidebar and page frames."""

from __future__ import annotations

import subprocess
import threading
from pathlib import Path
from typing import Dict, Optional

import customtkinter as ctk

from launcher.assets import style as S
from launcher.config import (
    DEFAULT_HOST,
    DEFAULT_PORT,
    RUNTIME_MAP,
    RUNTIMES,
    get_repo_root,
)
from launcher.core.installer import install_runtime
from launcher.core.launcher import launch as do_launch
from launcher.core.launcher import LaunchOptions as CoreLaunchOptions
from launcher.core.runtime_detector import RuntimeStatus, detect_all, get_best_runtime
from launcher.core.settings import Settings
from launcher.i18n import t, set_language, get_language, detect_system_language
from launcher.ui.sidebar import Sidebar
from launcher.ui.launch_page import LaunchPage
from launcher.ui.runtime_page import RuntimePage
from launcher.ui.advanced_page import AdvancedPage
from launcher.ui.install_page import InstallPage
from launcher.ui.extension_page import ExtensionPage
from launcher.ui.console_page import ConsolePage
from launcher.ui.about_page import AboutPage


class App(ctk.CTk):
    """Main application window."""

    def __init__(self):
        super().__init__()

        self._repo_root = get_repo_root()
        self._config_dir = self._repo_root / "config"
        self._settings = Settings(self._config_dir)

        # Initialize language
        lang = self._settings.get("language") or detect_system_language()
        set_language(lang)

        # Runtime state
        self._statuses: Dict[str, RuntimeStatus] = {}
        self._selected_runtime: Optional[str] = self._settings.get("last_runtime")
        self._process: Optional[subprocess.Popen] = None
        self._reader_thread: Optional[threading.Thread] = None
        self._installing = False

        # Window setup
        S.apply_theme()
        self.title(t("app_title"))
        self.geometry(f"{S.WINDOW_MIN_WIDTH}x{S.WINDOW_MIN_HEIGHT}")
        self.minsize(S.WINDOW_MIN_WIDTH, S.WINDOW_MIN_HEIGHT)
        self.configure(fg_color=S.BG_APP)

        # Try to set icon
        icon_path = Path(__file__).parent / "assets" / "icon.ico"
        if icon_path.exists():
            try:
                self.iconbitmap(str(icon_path))
            except Exception:
                pass

        # Grid layout: sidebar | content
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Sidebar
        self._sidebar = Sidebar(
            self,
            on_page_select=self._on_page_select,
            on_language_toggle=self._on_language_toggle,
            current_lang=get_language(),
        )
        self._sidebar.grid(row=0, column=0, sticky="ns")

        # Content area — matches page background
        self._content = ctk.CTkFrame(self, fg_color=S.BG_PAGE, corner_radius=0)
        self._content.grid(row=0, column=1, sticky="nsew", padx=(1, 0))
        self._content.grid_columnconfigure(0, weight=1)
        self._content.grid_rowconfigure(0, weight=1)

        # Pages
        self._pages: dict[str, ctk.CTkFrame] = {}
        self._current_page = "launch"

        self._launch_page = LaunchPage(
            self._content,
            on_launch=self._on_launch,
            on_stop=self._on_stop,
            on_page_switch=self._on_page_select,
        )
        self._pages["launch"] = self._launch_page

        self._runtime_page = RuntimePage(
            self._content,
            on_select=self._on_runtime_select,
            on_install=self._on_install_runtime,
            on_refresh=self._on_refresh,
        )
        self._pages["runtime"] = self._runtime_page

        self._advanced_page = AdvancedPage(self._content)
        self._advanced_page.set_on_change(self._on_settings_change)
        self._pages["advanced"] = self._advanced_page

        self._install_page = InstallPage(
            self._content,
            on_install=self._on_install_runtime,
            on_refresh=self._on_refresh,
        )
        self._pages["install"] = self._install_page

        self._extension_page = ExtensionPage(
            self._content,
            repo_root=self._repo_root,
        )
        self._pages["extension"] = self._extension_page

        self._console_page = ConsolePage(self._content)
        self._pages["console"] = self._console_page

        self._about_page = AboutPage(self._content)
        self._pages["about"] = self._about_page

        # Load settings into UI
        self._load_settings()

        # Show launch page
        self._show_page("launch")

        # Detect runtimes on startup
        self.after(100, self._on_refresh)

    def _show_page(self, page_id: str) -> None:
        for pid, page in self._pages.items():
            page.grid_forget()
        page = self._pages.get(page_id)
        if page:
            page.grid(row=0, column=0, sticky="nsew")
            self._current_page = page_id

    def _on_page_select(self, page_id: str) -> None:
        self._show_page(page_id)
        self._sidebar.set_active_page(page_id)

    def _on_language_toggle(self) -> None:
        new_lang = "en" if get_language() == "zh" else "zh"
        set_language(new_lang)
        self._settings.set("language", new_lang)
        self.title(t("app_title"))
        self._sidebar.refresh_labels()
        self._launch_page.refresh_labels()
        self._runtime_page.refresh_labels()
        self._advanced_page.refresh_labels()
        self._install_page.refresh_labels()
        self._extension_page.refresh_labels()
        self._console_page.refresh_labels()
        self._about_page.refresh_labels()

    def _on_runtime_select(self, runtime_id: str) -> None:
        status = self._statuses.get(runtime_id)
        if status and status.installed:
            self._selected_runtime = runtime_id
            self._settings.set("last_runtime", runtime_id)
            self._update_launch_page()
            # Auto-switch to launch page after selection
            self._on_page_select("launch")

    def _on_refresh(self) -> None:
        self._statuses = detect_all(self._repo_root)
        if not self._selected_runtime or self._selected_runtime not in self._statuses or not self._statuses[self._selected_runtime].installed:
            best = get_best_runtime(self._statuses)
            self._selected_runtime = best
        self._update_launch_page()
        self._runtime_page.update_runtimes(self._statuses, self._selected_runtime)
        self._install_page.update_runtimes(self._statuses)
        self._extension_page.refresh()

    def _update_launch_page(self) -> None:
        status = self._statuses.get(self._selected_runtime) if self._selected_runtime else None
        auto = get_best_runtime(self._statuses)
        self._launch_page.update_runtime(self._selected_runtime, status, auto)
        self._launch_page.update_connection_info(
            self._advanced_page.host or DEFAULT_HOST,
            self._advanced_page.port or DEFAULT_PORT,
            "Safe" if self._advanced_page.safe_mode else "Normal",
        )

    def _load_settings(self) -> None:
        self._advanced_page.attention_policy = self._settings.get("attention_policy", "default")
        self._advanced_page.safe_mode = self._settings.get("safe_mode", False)
        self._advanced_page.cn_mirror = self._settings.get("cn_mirror", False)
        self._advanced_page.host = self._settings.get("host", DEFAULT_HOST)
        self._advanced_page.port = self._settings.get("port", DEFAULT_PORT)
        self._advanced_page.listen = self._settings.get("listen", False)
        self._advanced_page.disable_tensorboard = self._settings.get("disable_tensorboard", False)
        self._advanced_page.disable_tageditor = self._settings.get("disable_tageditor", False)
        self._advanced_page.disable_auto_mirror = self._settings.get("disable_auto_mirror", False)
        self._advanced_page.dev_mode = self._settings.get("dev_mode", False)

    def _save_settings(self) -> None:
        self._settings.set("attention_policy", self._advanced_page.attention_policy)
        self._settings.set("safe_mode", self._advanced_page.safe_mode)
        self._settings.set("cn_mirror", self._advanced_page.cn_mirror)
        self._settings.set("host", self._advanced_page.host)
        self._settings.set("port", self._advanced_page.port)
        self._settings.set("listen", self._advanced_page.listen)
        self._settings.set("disable_tensorboard", self._advanced_page.disable_tensorboard)
        self._settings.set("disable_tageditor", self._advanced_page.disable_tageditor)
        self._settings.set("disable_auto_mirror", self._advanced_page.disable_auto_mirror)
        self._settings.set("dev_mode", self._advanced_page.dev_mode)
        if self._selected_runtime:
            self._settings.set("last_runtime", self._selected_runtime)

    def _on_settings_change(self) -> None:
        self._save_settings()
        self._update_launch_page()

    def _on_launch(self) -> None:
        if self._process is not None:
            return

        if not self._selected_runtime or self._selected_runtime not in RUNTIME_MAP:
            self._launch_page.set_status(t("select_runtime_first"), S.ORANGE)
            return

        status = self._statuses.get(self._selected_runtime)
        if not status or not status.installed or not status.python_path:
            self._launch_page.set_status(t("no_runtime_installed"), S.RED)
            return

        runtime_def = RUNTIME_MAP[self._selected_runtime]
        options = CoreLaunchOptions(
            runtime_id=self._selected_runtime,
            safe_mode=self._advanced_page.safe_mode,
            cn_mirror=self._advanced_page.cn_mirror,
            attention_policy=self._advanced_page.attention_policy,
            host=self._advanced_page.host,
            port=self._advanced_page.port,
            listen=self._advanced_page.listen,
            disable_tensorboard=self._advanced_page.disable_tensorboard,
            disable_tageditor=self._advanced_page.disable_tageditor,
            disable_auto_mirror=self._advanced_page.disable_auto_mirror,
            dev_mode=self._advanced_page.dev_mode,
        )

        self._save_settings()
        self._launch_page.set_running(True)
        self._launch_page.set_status(t("launching"), S.ACCENT)

        self._show_page("console")
        self._sidebar.set_active_page("console")

        try:
            self._process = do_launch(
                python_path=status.python_path,
                runtime_def=runtime_def,
                options=options,
                repo_root=self._repo_root,
            )
            self._launch_page.set_status(t("launch_success"), S.GREEN)
            self._console_page.append_line(f"> Launching with {runtime_def.name_en}...")
            self._console_page.append_line(f"> Python: {status.python_path}")
            self._console_page.append_line(f"> Host: {options.host}:{options.port}")
            self._console_page.append_line("")

            self._reader_thread = threading.Thread(target=self._read_output, daemon=True)
            self._reader_thread.start()

        except Exception as e:
            self._launch_page.set_running(False)
            self._launch_page.set_status(t("launch_failed"), S.RED)
            self._console_page.append_line(f"ERROR: {e}")

    def _read_output(self) -> None:
        if not self._process or not self._process.stdout:
            return
        try:
            for line in self._process.stdout:
                decoded = line.decode("utf-8", errors="replace").rstrip("\n\r")
                if decoded:
                    self.after(0, self._console_page.append_line, decoded)
        except Exception:
            pass
        finally:
            code = self._process.wait() if self._process else -1
            self.after(0, self._on_process_exit, code)

    def _on_process_exit(self, code: int) -> None:
        self._process = None
        self._reader_thread = None
        self._launch_page.set_running(False)
        msg = t("process_exited").format(code=code)
        self._launch_page.set_status(msg, S.TEXT_SECONDARY)
        self._console_page.append_line(f"\n{msg}")

    def _on_stop(self) -> None:
        if self._process:
            try:
                self._process.terminate()
                self._console_page.append_line("> Sending terminate signal...")
            except Exception as e:
                self._console_page.append_line(f"> Error stopping: {e}")

    def _on_install_runtime(self, runtime_id: str) -> None:
        if self._installing:
            return
        if runtime_id not in RUNTIME_MAP:
            return

        runtime_def = RUNTIME_MAP[runtime_id]
        cn_mirror = self._advanced_page.cn_mirror

        self._installing = True
        self._install_page.set_installing(runtime_id, True)

        self._show_page("console")
        self._sidebar.set_active_page("console")
        self._console_page.append_line(f"> Installing {runtime_def.name_en}...")

        def _run_install():
            success = install_runtime(
                runtime_def=runtime_def,
                cn_mirror=cn_mirror,
                repo_root=self._repo_root,
                log_callback=lambda line: self.after(0, self._console_page.append_line, line),
            )
            self.after(0, self._on_install_done, runtime_id, success)

        thread = threading.Thread(target=_run_install, daemon=True)
        thread.start()

    def _on_install_done(self, runtime_id: str, success: bool) -> None:
        self._installing = False
        self._install_page.set_installing(runtime_id, False)

        runtime_def = RUNTIME_MAP.get(runtime_id)
        name = runtime_def.name_en if runtime_def else runtime_id

        if success:
            self._console_page.append_line(f"> {name} installation complete!")
            self._on_refresh()
        else:
            self._console_page.append_line(f"> {name} installation failed.")

    def _on_close(self) -> None:
        self._save_settings()
        self.destroy()
