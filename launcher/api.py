"""pywebview API class — exposes all backend logic to the React frontend."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from launcher.config import (
    APP_VERSION,
    DEFAULT_HOST,
    DEFAULT_PORT,
    get_repo_root,
)
from launcher.core.api_result import ok_result
from launcher.core.compatibility import build_runtime_compatibility_matrix
from launcher.core.runtime_catalog import build_runtime_catalog
from launcher.core.runtime_coordinator import RuntimeCoordinator
from launcher.core.gpu import get_gpu_stats
from launcher.core.plugins import PluginInfo, scan_plugins, set_plugin_enabled
from launcher.core.settings import Settings
from launcher.core.task_executor import LauncherTaskExecutor
from launcher.core.update_checker import UpdateChecker
from launcher.core.versioning import detect_project_version
from launcher import i18n
from launcher.i18n import detect_system_language, get_language, set_language


class Api:
    """Backend API exposed to JavaScript via pywebview.

    All public methods are callable from JS as window.pywebview.api.method_name().
    pywebview auto-serializes return values to JSON.
    """

    def __init__(self) -> None:
        self._repo_root = get_repo_root()
        self._config_dir = self._repo_root / "config"
        self._settings = Settings(self._config_dir)
        self._window = None  # set by window.py after creation
        self._shutting_down = False
        self._update_checker = UpdateChecker(self._repo_root)

        # Initialize language from settings or system
        lang = self._settings.get("language") or detect_system_language()
        set_language(lang)
        self._runtime_coordinator = RuntimeCoordinator(
            repo_root=self._repo_root,
            settings_provider=self.get_settings,
        )
        self._executor = LauncherTaskExecutor(
            repo_root=self._repo_root,
            config_dir=self._config_dir,
            emit_callback=self._emit,
            settings_provider=self.get_settings,
            runtime_coordinator=self._runtime_coordinator,
        )

    # ------------------------------------------------------------------
    # Runtime detection
    # ------------------------------------------------------------------

    def get_runtimes(self) -> Dict[str, Any]:
        """Detect all runtimes and return their statuses."""
        return self._runtime_coordinator.get_serialized_statuses()

    def get_runtime_defs(self) -> List[Dict[str, Any]]:
        """Return runtime definitions from the centralized runtime catalog."""
        return build_runtime_catalog(self._repo_root)

    def get_best_runtime(self) -> Optional[str]:
        """Auto-select the best available runtime ID."""
        return self._runtime_coordinator.get_best_runtime_id()

    def select_runtime(self, runtime_id: str) -> Dict[str, Any]:
        """Persist the selected runtime."""
        self._settings.set("last_runtime", runtime_id)
        return ok_result("runtime.selection_updated", runtime_id=runtime_id)

    # ------------------------------------------------------------------
    # Settings
    # ------------------------------------------------------------------

    def get_settings(self) -> Dict[str, Any]:
        """Return all settings as a dict."""
        language = self._settings.get("language") or get_language()
        return {
            "attention_policy": self._settings.get("attention_policy", "default"),
            "safe_mode": self._settings.get("safe_mode", False),
            "cn_mirror": self._settings.get("cn_mirror", False),
            "host": self._settings.get("host", DEFAULT_HOST),
            "port": self._settings.get("port", DEFAULT_PORT),
            "listen": self._settings.get("listen", False),
            "disable_tensorboard": self._settings.get("disable_tensorboard", False),
            "disable_tageditor": self._settings.get("disable_tageditor", False),
            "disable_auto_mirror": self._settings.get("disable_auto_mirror", False),
            "dev_mode": self._settings.get("dev_mode", False),
            "update_channel": self._settings.get("update_channel", "stable"),
            "theme": self._settings.get("theme", "light"),
            "language": language,
            "last_runtime": self._settings.get("last_runtime"),
            "window_width": self._settings.get("window_width"),
            "window_height": self._settings.get("window_height"),
            "onboarding_dismissed": self._settings.get("onboarding_dismissed", False),
        }

    def set_settings(self, values: Dict[str, Any]) -> Dict[str, Any]:
        """Batch update settings. Values is a dict of key→value pairs."""
        payload = dict(values or {})
        channel = str(payload.get("update_channel") or "").strip().lower()
        if channel:
            payload["update_channel"] = channel if channel in {"stable", "beta"} else "stable"
        theme = str(payload.get("theme") or "").strip().lower()
        if theme:
            payload["theme"] = theme if theme in {"light", "dark"} else "light"
        for dimension_key in ("window_width", "window_height"):
            if dimension_key in payload and payload[dimension_key] is not None:
                try:
                    payload[dimension_key] = max(640, int(payload[dimension_key]))
                except (TypeError, ValueError):
                    payload.pop(dimension_key, None)
        self._settings.update_many(payload)
        return ok_result("settings.updated", updated_keys=sorted(payload.keys()))

    # ------------------------------------------------------------------
    # Plugins
    # ------------------------------------------------------------------

    def scan_plugins(self) -> List[Dict[str, Any]]:
        """Scan plugin/backend/ for plugin manifests."""
        enabled_path = self._repo_root / "config" / "plugins" / "enabled.json"
        plugins = scan_plugins(self._repo_root, enabled_path)
        return [
            {
                "plugin_id": p.plugin_id,
                "name": p.name,
                "version": p.version,
                "description": p.description,
                "dir_name": p.dir_name,
                "enabled": p.enabled,
                "enabled_by_default": p.enabled_by_default,
                "has_override": p.has_override,
                "capabilities": p.capabilities,
                "hooks": p.hooks,
                "error": p.error,
            }
            for p in plugins
        ]

    def set_plugin_enabled(self, plugin_id: str, enabled: bool) -> Dict[str, Any]:
        """Toggle a plugin on/off."""
        set_plugin_enabled(self._repo_root, plugin_id, enabled)
        return ok_result("plugin.state_updated", plugin_id=plugin_id, enabled=enabled)

    # ------------------------------------------------------------------
    # Language / i18n
    # ------------------------------------------------------------------

    def get_language(self) -> str:
        return get_language()

    def set_language(self, lang: str) -> Dict[str, Any]:
        set_language(lang)
        self._settings.set("language", lang)
        return ok_result("language.updated", language=lang)

    def get_translations(self) -> Dict[str, str]:
        """Return all translation strings for the current language."""
        return dict(i18n._TRANSLATIONS.get(get_language(), {}))

    def get_app_version(self) -> str:
        return APP_VERSION

    def get_project_version(self) -> Dict[str, Any]:
        return detect_project_version(self._repo_root)

    def get_runtime_recommendation(self) -> Dict[str, Any]:
        return self._runtime_coordinator.get_runtime_recommendation()

    def get_runtime_compatibility(self) -> Dict[str, Any]:
        return build_runtime_compatibility_matrix()

    def get_launch_preflight(self, runtime_id: Optional[str], settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self._runtime_coordinator.get_launch_preflight(runtime_id, settings)

    def get_launch_plan(
        self,
        runtime_id: Optional[str],
        settings: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Return a structured launch plan for the selected runtime."""

        prepared = self._runtime_coordinator.prepare_launch(runtime_id, settings)
        if prepared is None or not prepared.status.python_path:
            return None
        plan = prepared.build_plan()
        if plan is None:
            return None
        return plan.to_public_dict()

    def get_install_plan(self, runtime_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Return a structured install plan for the selected runtime."""

        prepared = self._runtime_coordinator.prepare_install(
            runtime_id,
            cn_mirror=bool(self._settings.get("cn_mirror", False)),
        )
        if prepared is None:
            return None
        plan = prepared.build_plan()
        return plan.to_public_dict()

    def get_health_report(self, selected_runtime_id: Optional[str] = None) -> Dict[str, Any]:
        return self._runtime_coordinator.get_health_report(selected_runtime_id=selected_runtime_id)

    def get_task_state(self) -> Dict[str, Any]:
        return self._executor.get_task_state()

    def get_task_history(self) -> List[Dict[str, Any]]:
        return self._executor.get_task_history()

    def clear_task_history(self) -> Dict[str, Any]:
        return self._executor.clear_task_history()

    def check_for_updates(self, force: bool = False, channel: Optional[str] = None) -> Dict[str, Any]:
        channel_name = str(channel or self._settings.get("update_channel", "stable") or "stable")
        return self._update_checker.check(channel=channel_name, force=force)

    def run_updater(self) -> Dict[str, Any]:
        return self._executor.run_updater()

    # ------------------------------------------------------------------
    # GPU monitoring
    # ------------------------------------------------------------------

    def get_gpu_stats(self) -> Dict[str, Any]:
        return get_gpu_stats()

    # ------------------------------------------------------------------
    # Process state
    # ------------------------------------------------------------------

    def is_running(self) -> bool:
        return self._executor.is_running()

    def is_installing(self) -> bool:
        return self._executor.is_installing()

    # ------------------------------------------------------------------
    # Launch / Stop (async — runs in background thread, emits events)
    # ------------------------------------------------------------------

    def launch(self, runtime_id: str) -> Dict[str, Any]:
        """Launch gui.py with the selected runtime. Emits console_line and process_exit events."""
        return self._executor.launch(runtime_id)

    def stop(self) -> Dict[str, Any]:
        """Terminate the running process."""
        return self._executor.stop()

    # ------------------------------------------------------------------
    # Install (async — runs in background thread, emits events)
    # ------------------------------------------------------------------

    def install_runtime(self, runtime_id: str) -> Dict[str, Any]:
        """Run install scripts for a runtime. Emits install_log and install_done events."""
        return self._executor.install_runtime(runtime_id)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _emit(self, event: str, data: Any) -> None:
        """Emit an event to the JavaScript frontend.

        window.emit() must be called from the main thread in pywebview.
        From background threads, use window.evaluate_js() to call
        the global __launcher_event() handler instead.
        """
        if self._shutting_down or not self._window:
            return
        try:
            import json
            js_data = json.dumps(data, ensure_ascii=False)
            # Escape for embedding in JS string
            js_data_escaped = js_data.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')
            js_code = f"window.__launcher_event && window.__launcher_event('{event}', {js_data_escaped});"
            self._window.evaluate_js(js_code)
        except Exception:
            pass

    def flush_frontend_settings_on_close(self) -> None:
        """Pull the latest frontend settings snapshot before the window closes."""

        if not self._window:
            return

        try:
            snapshot = self._window.evaluate_js(
                "window.__launcher_state && window.__launcher_state.getSettingsSnapshot && window.__launcher_state.getSettingsSnapshot();"
            )
        except Exception:
            return

        if not snapshot:
            return

        try:
            if isinstance(snapshot, str):
                payload = json.loads(snapshot)
            elif isinstance(snapshot, dict):
                payload = snapshot
            else:
                return
        except Exception:
            return

        if not isinstance(payload, dict):
            return

        allowed_keys = {
            "attention_policy",
            "safe_mode",
            "cn_mirror",
            "host",
            "port",
            "listen",
            "disable_tensorboard",
            "disable_tageditor",
            "disable_auto_mirror",
            "dev_mode",
            "update_channel",
            "theme",
            "language",
            "last_runtime",
            "window_width",
            "window_height",
            "onboarding_dismissed",
        }
        filtered = {key: payload[key] for key in allowed_keys if key in payload}
        if filtered:
            self.set_settings(filtered)

    def prepare_for_close(
        self,
        *,
        window_width: Optional[int] = None,
        window_height: Optional[int] = None,
    ) -> None:
        """Perform non-blocking shutdown preparation for the native window."""

        self._shutting_down = True

        updates: Dict[str, Any] = {}
        if isinstance(window_width, int):
            updates["window_width"] = window_width
        if isinstance(window_height, int):
            updates["window_height"] = window_height
        if updates:
            try:
                self._settings.update_many(updates)
            except Exception:
                pass

        # Detach the JS bridge first so background threads stop trying to emit.
        self._window = None

        try:
            self._executor._terminate_process(timeout=0.5)
        except Exception:
            pass
