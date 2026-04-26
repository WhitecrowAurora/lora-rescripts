"""Launcher task execution coordinator for launch/install/updater/stop flows."""

from __future__ import annotations

import shutil
import subprocess
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Optional

from launcher.config import RUNTIME_MAP
from launcher.core.api_result import error_result, ok_result
from launcher.core.runtime_initializer import initialize_runtime_environment
from launcher.core.task_history_store import TaskHistoryStore, TaskStateStore
from launcher.core.runtime_coordinator import RuntimeCoordinator
from launcher.core.task_plans import run_install_plan, run_launch_plan
from launcher.core.subprocess_utils import hidden_subprocess_kwargs
from launcher.core.task_state import (
    advance_task_state,
    begin_task_state,
    build_interrupted_task_result,
    build_idle_task_state,
    build_task_result,
    build_task_stage_event,
    finish_task_state,
    push_task_history,
)
from launcher.core.update_checker import run_updater
from launcher.i18n import get_language


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


_TASK_LOG_LIMIT = 200
_TASK_LOG_PERSIST_INTERVAL = 10


class LauncherTaskExecutor:
    """Coordinates long-running launcher tasks and their stage events."""

    def __init__(
        self,
        repo_root: Path,
        config_dir: Path,
        emit_callback: Callable[[str, Any], None],
        settings_provider: Callable[[], Dict[str, Any]],
        runtime_coordinator: RuntimeCoordinator,
    ) -> None:
        self._repo_root = repo_root
        self._history_store = TaskHistoryStore(config_dir)
        self._state_store = TaskStateStore(config_dir)
        self._emit = emit_callback
        self._settings_provider = settings_provider
        self._runtime_coordinator = runtime_coordinator
        self._process: Optional[subprocess.Popen] = None
        self._reader_thread: Optional[threading.Thread] = None
        self._installing = False
        self._task_state: Dict[str, Any] = build_idle_task_state()
        self._task_history: list[Dict[str, Any]] = self._history_store.load()
        self._task_stage_history: list[Dict[str, Any]] = []
        self._task_command_history: list[Dict[str, Any]] = []
        self._task_log_lines: list[str] = []
        self._task_log_dirty_count = 0
        self._recover_interrupted_task_if_needed()

    def _wait_for_runtime_detection(
        self,
        runtime_id: str,
        *,
        require_installed: bool,
        timeout_seconds: float = 6.0,
        poll_interval_seconds: float = 0.4,
    ) -> None:
        """Wait briefly for runtime filesystem markers to become visible to detector logic."""
        deadline = time.monotonic() + max(0.0, timeout_seconds)
        while time.monotonic() < deadline:
            status = self._runtime_coordinator.get_statuses().get(runtime_id)
            if not status:
                time.sleep(poll_interval_seconds)
                continue
            if require_installed:
                if status.installed:
                    return
            elif status.python_exists:
                return
            time.sleep(poll_interval_seconds)

    def get_task_state(self) -> Dict[str, Any]:
        return dict(self._task_state)

    def get_task_history(self) -> list[Dict[str, Any]]:
        return [dict(item) for item in self._task_history]

    def clear_task_history(self) -> Dict[str, Any]:
        self._task_history = []
        self._history_store.clear()
        self._emit("task_history_cleared", {"ok": True})
        return ok_result("task_history.cleared")

    def is_running(self) -> bool:
        return self._process is not None and self._process.poll() is None

    def is_installing(self) -> bool:
        return self._installing

    def run_updater(self) -> Dict[str, Any]:
        self._begin_task(
            "updater",
            "updater.request_received",
            "已收到更新请求",
            "Updater request received",
        )
        if self._process is not None and self._process.poll() is None:
            message = "Stop the running trainer backend before starting the updater."
            self._finish_task(
                success=False,
                stage_code="updater.blocked_trainer_running",
                stage_label_zh="更新器被训练进程阻止",
                stage_label_en="Updater blocked by running trainer",
                code="updater.blocked_trainer_running",
                error=message,
            )
            return error_result("updater.blocked_trainer_running", message)
        if self._installing:
            message = "Wait for the current runtime installation to finish before updating."
            self._finish_task(
                success=False,
                stage_code="updater.blocked_install_running",
                stage_label_zh="更新器被安装任务阻止",
                stage_label_en="Updater blocked by running install task",
                code="updater.blocked_install_running",
                error=message,
            )
            return error_result("updater.blocked_install_running", message)

        self._advance_task(
            "updater.starting_process",
            "正在启动更新器",
            "Starting updater",
        )
        result = run_updater(
            self._repo_root,
            use_cn_mirror=bool(self._settings_provider().get("cn_mirror", False)),
        )
        if not result.get("ok"):
            self._finish_task(
                success=False,
                stage_code="updater.start_failed",
                stage_label_zh="更新器启动失败",
                stage_label_en="Updater start failed",
                code=str(result.get("code") or "updater.start_failed"),
                error=result.get("error"),
                details=result.get("details"),
            )
            return error_result(
                str(result.get("code") or "updater.start_failed"),
                result.get("error") or "Failed to start updater.",
                details=result.get("details"),
            )

        self._finish_task(
            success=True,
            stage_code="updater.started",
            stage_label_zh="更新器已启动",
            stage_label_en="Updater started",
            result_code=str(result.get("result_code") or "updater.started"),
            details=result.get("details"),
        )
        return ok_result(
            str(result.get("result_code") or "updater.started"),
            details=result.get("details"),
        )

    def launch(self, runtime_id: str) -> Dict[str, Any]:
        self._begin_task(
            "launch",
            "launch.request_received",
            "已收到启动请求",
            "Launch request received",
            runtime_id=runtime_id,
        )
        if self._process is not None and self._process.poll() is None:
            self._finish_task(
                success=False,
                stage_code="trainer.already_running",
                stage_label_zh="训练器已在运行",
                stage_label_en="Trainer already running",
                code="trainer.already_running",
                error="Already running",
                details={"runtime_id": runtime_id},
            )
            return error_result("trainer.already_running", "Already running")

        if runtime_id not in RUNTIME_MAP:
            self._finish_task(
                success=False,
                stage_code="runtime.unknown",
                stage_label_zh="未知运行时",
                stage_label_en="Unknown runtime",
                code="runtime.unknown",
                error="Unknown runtime",
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime.unknown", "Unknown runtime", details={"runtime_id": runtime_id})

        self._advance_task(
            "launch.validating_runtime",
            "正在校验运行时",
            "Validating runtime",
            details={"runtime_id": runtime_id},
        )
        prepared = self._runtime_coordinator.prepare_launch(runtime_id)
        if prepared is None:
            self._finish_task(
                success=False,
                stage_code="runtime.unknown",
                stage_label_zh="未知运行时",
                stage_label_en="Unknown runtime",
                code="runtime.unknown",
                error="Unknown runtime",
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime.unknown", "Unknown runtime", details={"runtime_id": runtime_id})
        status = prepared.status
        if not status or not status.installed or not status.python_path:
            self._finish_task(
                success=False,
                stage_code="runtime.not_installed",
                stage_label_zh="运行时未安装",
                stage_label_en="Runtime not installed",
                code="runtime.not_installed",
                error="Runtime not installed",
                details={"runtime_id": runtime_id},
            )
            return error_result(
                "runtime.not_installed",
                "Runtime not installed",
                details={"runtime_id": runtime_id},
            )

        self._advance_task(
            "launch.running_preflight",
            "正在执行启动前检查",
            "Running launch preflight",
            details={"runtime_id": runtime_id},
        )
        preflight = prepared.preflight
        if not preflight.get("ready", False):
            lang = get_language()
            errors = [
                issue
                for issue in preflight.get("issues", [])
                if issue.get("severity") == "error"
            ]
            if errors:
                first = errors[0]
                message = first.get("message_en") if lang == "en" else first.get("message_zh")
                details = {
                    "runtime_id": runtime_id,
                    "blocking_issue_code": first.get("code"),
                    "action_page": first.get("action_page"),
                }
                self._finish_task(
                    success=False,
                    stage_code="launch.preflight_blocked",
                    stage_label_zh="启动前检查阻止启动",
                    stage_label_en="Launch blocked by preflight",
                    code="launch.preflight_blocked",
                    error=message or "Launch preflight failed.",
                    details=details,
                )
                return error_result(
                    "launch.preflight_blocked",
                    message or "Launch preflight failed.",
                    details=details,
                    preflight=preflight,
                )

        try:
            self._advance_task(
                "launch.building_plan",
                "正在构建启动计划",
                "Building launch plan",
                details={"runtime_id": runtime_id},
            )
            plan = prepared.build_plan()
            if plan is None:
                raise RuntimeError("Launch plan could not be built because python_path is missing.")
            self._advance_task(
                "launch.spawning_process",
                "正在启动训练进程",
                "Spawning trainer process",
                details={"runtime_id": runtime_id, "command_count": len(plan.commands)},
            )
            if plan.commands:
                self._record_command_started(
                    command=plan.commands[0],
                    index=1,
                    total=len(plan.commands),
                    command_kind="launch",
                )
            self._process = run_launch_plan(plan)
            self._record_launch_process_started(self._process.pid if self._process else None)
            self._reader_thread = threading.Thread(target=self._read_output, daemon=True)
            self._reader_thread.start()
            self._advance_task(
                "launch.process_running",
                "训练进程已启动",
                "Trainer process is running",
                details={"runtime_id": runtime_id, "pid": self._process.pid if self._process else None},
            )
            return ok_result("trainer.launch_started", runtime_id=runtime_id)
        except Exception as exc:
            if "plan" in locals() and plan and plan.commands:
                self._record_command_finished(
                    command=plan.commands[0],
                    index=1,
                    total=len(plan.commands),
                    command_kind="launch",
                    success=False,
                    error=str(exc),
                )
            self._finish_task(
                success=False,
                stage_code="launch.spawn_failed",
                stage_label_zh="训练进程启动失败",
                stage_label_en="Trainer process spawn failed",
                code="launch.spawn_failed",
                error=str(exc),
                details={"runtime_id": runtime_id},
            )
            return error_result(
                "launch.spawn_failed",
                str(exc),
                details={"runtime_id": runtime_id},
            )

    def stop(self) -> Dict[str, Any]:
        if self._process:
            self._begin_task(
                "stop",
                "trainer.stop_request_received",
                "已收到停止请求",
                "Stop request received",
            )
            self._advance_task(
                "trainer.stop_signal_sent",
                "已发送停止信号",
                "Stop signal sent",
                details={"pid": self._process.pid},
            )
            thread = threading.Thread(target=self._terminate_process, daemon=True)
            thread.start()
            return ok_result("trainer.stop_signal_sent")

        self._begin_task(
            "stop",
            "trainer.stop_request_received",
            "已收到停止请求",
            "Stop request received",
        )
        self._finish_task(
            success=True,
            stage_code="trainer.stop_no_process",
            stage_label_zh="当前没有可停止的进程",
            stage_label_en="No running process to stop",
            result_code="trainer.stop_no_process",
        )
        return ok_result("trainer.stop_no_process")

    def kill(self) -> Dict[str, Any]:
        if self._process:
            self._begin_task(
                "kill",
                "trainer.kill_request_received",
                "已收到强制结束请求",
                "Kill request received",
            )
            self._advance_task(
                "trainer.kill_signal_sent",
                "已发送强制结束信号",
                "Kill signal sent",
                details={"pid": self._process.pid},
            )
            thread = threading.Thread(target=self._force_kill_process, daemon=True)
            thread.start()
            return ok_result("trainer.kill_signal_sent")

        self._begin_task(
            "kill",
            "trainer.kill_request_received",
            "已收到强制结束请求",
            "Kill request received",
        )
        self._finish_task(
            success=True,
            stage_code="trainer.kill_no_process",
            stage_label_zh="当前没有可结束的进程",
            stage_label_en="No running process to kill",
            result_code="trainer.kill_no_process",
        )
        return ok_result("trainer.kill_no_process")

    def initialize_runtime(self, runtime_id: str) -> Dict[str, Any]:
        lang = get_language()
        self._begin_task(
            "initialize",
            "runtime_initialize.request_received",
            "已收到初始化请求",
            "Initialization request received",
            runtime_id=runtime_id,
        )
        if self._installing:
            message = "已有安装或初始化任务正在进行中。" if lang == "zh" else "Another install or initialization task is already in progress."
            self._finish_task(
                success=False,
                stage_code="runtime_initialize.already_running",
                stage_label_zh="已有初始化任务在运行",
                stage_label_en="Initialization task already running",
                code="runtime_initialize.already_running",
                error=message,
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime_initialize.already_running", message)
        if runtime_id not in RUNTIME_MAP:
            message = "未知的运行时。" if lang == "zh" else "Unknown runtime."
            self._finish_task(
                success=False,
                stage_code="runtime.unknown",
                stage_label_zh="未知运行时",
                stage_label_en="Unknown runtime",
                code="runtime.unknown",
                error=message,
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime.unknown", message, details={"runtime_id": runtime_id})

        prepared = self._runtime_coordinator.prepare_install(
            runtime_id,
            cn_mirror=bool(self._settings_provider().get("cn_mirror", False)),
        )
        if prepared is None:
            message = "未知的运行时。" if lang == "zh" else "Unknown runtime."
            self._finish_task(
                success=False,
                stage_code="runtime.unknown",
                stage_label_zh="未知运行时",
                stage_label_en="Unknown runtime",
                code="runtime.unknown",
                error=message,
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime.unknown", message, details={"runtime_id": runtime_id})

        if prepared.status.installed:
            message = "该运行时已经安装完成，无需再次初始化。" if lang == "zh" else "This runtime is already installed and does not need initialization."
            self._finish_task(
                success=True,
                stage_code="runtime_initialize.already_prepared",
                stage_label_zh="运行时已可用",
                stage_label_en="Runtime is already ready",
                result_code="runtime_initialize.already_prepared",
                details={"runtime_id": runtime_id},
            )
            return ok_result("runtime_initialize.already_prepared", runtime_id=runtime_id, message=message)

        self._installing = True

        def _run():
            success = False
            final_code = "runtime_initialize.failed"
            error_message = None
            try:
                self._advance_task(
                    "runtime_initialize.preparing_runtime",
                    "正在准备运行时目录",
                    "Preparing runtime directory",
                    details={"runtime_id": runtime_id},
                )
                initialize_runtime_environment(
                    prepared.runtime_def,
                    repo_root=self._repo_root,
                    statuses=prepared.statuses,
                    cn_mirror=prepared.cn_mirror,
                    log_callback=lambda line: self._append_task_log_line(line, event_name="install_log"),
                )
                success = True
                final_code = "runtime_initialize.completed"
            except Exception as exc:
                final_code = "runtime_initialize.execution_failed"
                error_message = str(exc)
                self._append_task_log_line(f"[Launcher] Runtime initialization failed: {exc}", event_name="install_log")
            finally:
                self._installing = False
                payload: Dict[str, Any] = {
                    "runtime_id": runtime_id,
                    "success": success,
                    "action": "initialize",
                }
                if success:
                    self._wait_for_runtime_detection(runtime_id, require_installed=False)
                    self._finish_task(
                        success=True,
                        stage_code="runtime_initialize.completed",
                        stage_label_zh="运行时初始化完成",
                        stage_label_en="Runtime initialization completed",
                        result_code=final_code,
                        details={"runtime_id": runtime_id},
                    )
                    payload["result_code"] = final_code
                else:
                    self._finish_task(
                        success=False,
                        stage_code=final_code,
                        stage_label_zh="运行时初始化失败",
                        stage_label_en="Runtime initialization failed",
                        code=final_code,
                        error=error_message,
                        details={"runtime_id": runtime_id},
                    )
                    payload["code"] = final_code
                    if error_message:
                        payload["error"] = error_message
                self._emit("install_done", payload)

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        return ok_result("runtime_initialize.started", runtime_id=runtime_id)

    def install_runtime(self, runtime_id: str) -> Dict[str, Any]:
        lang = get_language()
        self._begin_task(
            "install",
            "runtime_install.request_received",
            "已收到安装请求",
            "Install request received",
            runtime_id=runtime_id,
        )
        if self._installing:
            message = "已有安装任务正在进行中。" if lang == "zh" else "Another installation is already in progress."
            self._finish_task(
                success=False,
                stage_code="runtime_install.already_running",
                stage_label_zh="已有安装任务在运行",
                stage_label_en="Install task already running",
                code="runtime_install.already_running",
                error=message,
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime_install.already_running", message)
        if runtime_id not in RUNTIME_MAP:
            message = "未知的运行时。" if lang == "zh" else "Unknown runtime."
            self._finish_task(
                success=False,
                stage_code="runtime.unknown",
                stage_label_zh="未知运行时",
                stage_label_en="Unknown runtime",
                code="runtime.unknown",
                error=message,
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime.unknown", message, details={"runtime_id": runtime_id})

        self._advance_task(
            "runtime_install.validating_runtime",
            "正在校验安装前置条件",
            "Validating install prerequisites",
            details={"runtime_id": runtime_id},
        )
        if shutil.which("powershell.exe") is None:
            message = (
                "系统中未找到 PowerShell，无法启动运行时安装器。"
                if lang == "zh"
                else "PowerShell was not found on this system, so the runtime installer cannot start."
            )
            self._finish_task(
                success=False,
                stage_code="runtime_install.powershell_missing",
                stage_label_zh="系统缺少 PowerShell",
                stage_label_en="PowerShell is missing",
                code="runtime_install.powershell_missing",
                error=message,
            )
            return error_result("runtime_install.powershell_missing", message)

        runtime_def = RUNTIME_MAP[runtime_id]
        missing_scripts = [
            script_name
            for script_name in runtime_def.install_scripts
            if not (self._repo_root / script_name).exists()
        ]
        if missing_scripts:
            message = (
                f"缺少安装脚本：{', '.join(missing_scripts)}"
                if lang == "zh"
                else f"Missing install script(s): {', '.join(missing_scripts)}"
            )
            self._finish_task(
                success=False,
                stage_code="runtime_install.scripts_missing",
                stage_label_zh="安装脚本缺失",
                stage_label_en="Install scripts missing",
                code="runtime_install.scripts_missing",
                error=message,
                details={"missing_scripts": missing_scripts},
            )
            return error_result(
                "runtime_install.scripts_missing",
                message,
                details={"missing_scripts": missing_scripts},
            )

        prepared = self._runtime_coordinator.prepare_install(
            runtime_id,
            cn_mirror=bool(self._settings_provider().get("cn_mirror", False)),
        )
        if prepared is None:
            message = "未知的运行时。" if lang == "zh" else "Unknown runtime."
            self._finish_task(
                success=False,
                stage_code="runtime.unknown",
                stage_label_zh="未知运行时",
                stage_label_en="Unknown runtime",
                code="runtime.unknown",
                error=message,
                details={"runtime_id": runtime_id},
            )
            return error_result("runtime.unknown", message, details={"runtime_id": runtime_id})
        status = prepared.status
        if not status or not status.python_exists or not status.python_path:
            preferred_dirs = [f".\\env\\{name}" for name in prepared.runtime_def.env_dir_names]
            legacy_dirs = [f".\\{name}" for name in prepared.runtime_def.env_dir_names]
            suggested_locations = ", ".join(preferred_dirs + legacy_dirs)
            message = (
                (
                    "这个运行时在安装前需要先准备好项目内本地 Python 环境。"
                    f"请先放到以下任一位置：{suggested_locations}"
                )
                if lang == "zh"
                else (
                    "This runtime needs a prepared project-local Python environment before installation. "
                    f"Place it in one of these locations first: {suggested_locations}"
                )
            )
            details = {
                "preferred_dirs": preferred_dirs,
                "legacy_dirs": legacy_dirs,
                "runtime_id": runtime_id,
            }
            self._finish_task(
                success=False,
                stage_code="runtime_install.python_missing",
                stage_label_zh="缺少运行时 Python 环境",
                stage_label_en="Runtime Python environment missing",
                code="runtime_install.python_missing",
                error=message,
                details=details,
            )
            return error_result(
                "runtime_install.python_missing",
                message,
                details=details,
            )

        self._installing = True

        def _run():
            success = False
            final_code = "runtime_install.failed"
            error_message = None
            try:
                self._advance_task(
                    "runtime_install.building_plan",
                    "正在构建安装计划",
                    "Building install plan",
                    details={"runtime_id": runtime_id},
                )
                plan = prepared.build_plan()
                self._advance_task(
                    "runtime_install.executing_scripts",
                    "正在执行安装脚本",
                    "Executing install scripts",
                    details={"runtime_id": runtime_id, "script_count": len(plan.commands)},
                )
                success = run_install_plan(
                    plan,
                    log_callback=lambda line: self._append_task_log_line(line, event_name="install_log"),
                    stage_callback=lambda command, index, total: (
                        self._record_command_started(
                            command=command,
                            index=index,
                            total=total,
                            command_kind="install",
                        ),
                        self._advance_task(
                            "runtime_install.running_script",
                            f"正在执行安装脚本 {index}/{total}",
                            f"Running install script {index}/{total}",
                            details={
                                "runtime_id": runtime_id,
                                "script_index": index,
                                "script_total": total,
                                "command_label_zh": command.label_zh,
                                "command_label_en": command.label_en,
                                "command_preview": command.to_public_dict().get("command_preview"),
                            },
                        ),
                    ),
                    result_callback=lambda command, index, total, command_success: self._record_command_finished(
                        command=command,
                        index=index,
                        total=total,
                        command_kind="install",
                        success=command_success,
                    ),
                )
                if success:
                    final_code = "runtime_install.completed"
            except Exception as exc:
                final_code = "runtime_install.execution_failed"
                error_message = str(exc)
                self._append_task_log_line(f"[Launcher] Install plan failed: {exc}", event_name="install_log")
            finally:
                self._installing = False
                payload: Dict[str, Any] = {
                    "runtime_id": runtime_id,
                    "success": success,
                    "action": "install",
                }
                if success:
                    self._wait_for_runtime_detection(runtime_id, require_installed=True)
                    self._finish_task(
                        success=True,
                        stage_code="runtime_install.completed",
                        stage_label_zh="安装已完成",
                        stage_label_en="Installation completed",
                        result_code=final_code,
                        details={"runtime_id": runtime_id},
                    )
                    payload["result_code"] = final_code
                else:
                    self._finish_task(
                        success=False,
                        stage_code=final_code,
                        stage_label_zh="安装失败",
                        stage_label_en="Installation failed",
                        code=final_code,
                        error=error_message,
                        details={"runtime_id": runtime_id},
                    )
                    payload["code"] = final_code
                    if error_message:
                        payload["error"] = error_message
                self._emit("install_done", payload)

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        return ok_result("runtime_install.started", runtime_id=runtime_id)

    def _emit_task_snapshot(self, include_stage_event: bool = True) -> None:
        self._emit("task_state", dict(self._task_state))
        if include_stage_event and self._task_state.get("task_type") != "idle":
            event = build_task_stage_event(self._task_state)
            self._task_stage_history.append(event)
            if len(self._task_stage_history) > 64:
                self._task_stage_history = self._task_stage_history[-64:]
            self._emit("task_stage", event)

    def _active_task_snapshot(self) -> Dict[str, Any]:
        snapshot = dict(self._task_state)
        snapshot["stage_history"] = [dict(item) for item in self._task_stage_history]
        snapshot["command_records"] = [dict(item) for item in self._task_command_history]
        snapshot["log_lines"] = list(self._task_log_lines)
        return snapshot

    def _persist_active_task_state(self) -> None:
        if self._task_state.get("task_type") == "idle":
            return
        if self._task_state.get("state") not in {"pending", "running"}:
            return
        self._state_store.save(self._active_task_snapshot())

    def _find_command_record(self, command_preview: str, index: int) -> Optional[Dict[str, Any]]:
        for record in reversed(self._task_command_history):
            if record.get("command_preview") == command_preview and record.get("index") == index:
                return record
        return None

    def _record_command_started(
        self,
        *,
        command: Any,
        index: int,
        total: int,
        command_kind: str,
    ) -> None:
        public = command.to_public_dict()
        record = dict(public)
        record.update(
            {
                "index": index,
                "total": total,
                "command_kind": command_kind,
                "status": "running",
                "started_at": _now_iso(),
                "finished_at": None,
                "duration_ms": None,
                "exit_code": None,
                "pid": None,
                "error": None,
            }
        )
        self._task_command_history.append(record)
        if len(self._task_command_history) > 32:
            self._task_command_history = self._task_command_history[-32:]
        self._persist_active_task_state()

    def _record_command_finished(
        self,
        *,
        command: Any,
        index: int,
        success: bool,
        total: int = 1,
        command_kind: Optional[str] = None,
        exit_code: Optional[int] = None,
        pid: Optional[int] = None,
        error: Optional[str] = None,
    ) -> None:
        public = command.to_public_dict()
        record = self._find_command_record(public.get("command_preview", ""), index)
        if record is None:
            self._record_command_started(
                command=command,
                index=index,
                total=total,
                command_kind=command_kind or self._task_state.get("task_type", "task"),
            )
            record = self._find_command_record(public.get("command_preview", ""), index)
            if record is None:
                return
        record.update(
            {
                "status": "succeeded" if success else "failed",
                "finished_at": _now_iso(),
                "exit_code": exit_code,
                "pid": pid,
                "error": error,
            }
        )
        started_at = record.get("started_at")
        finished_at = record.get("finished_at")
        if isinstance(started_at, str) and isinstance(finished_at, str):
            try:
                started = datetime.fromisoformat(started_at)
                finished = datetime.fromisoformat(finished_at)
                record["duration_ms"] = max(0, int((finished - started).total_seconds() * 1000))
            except ValueError:
                record["duration_ms"] = None
        self._persist_active_task_state()

    def _record_launch_process_started(self, pid: Optional[int]) -> None:
        if not self._task_command_history:
            return
        self._task_command_history[-1].update({"pid": pid})
        self._persist_active_task_state()

    def _record_launch_process_exited(self, code: int) -> None:
        if not self._task_command_history:
            return
        self._task_command_history[-1].update(
            {
                "status": "succeeded" if code == 0 else "failed",
                "finished_at": _now_iso(),
                "exit_code": code,
                "error": None if code == 0 else f"Process exited with code {code}",
            }
        )
        started_at = self._task_command_history[-1].get("started_at")
        finished_at = self._task_command_history[-1].get("finished_at")
        if isinstance(started_at, str) and isinstance(finished_at, str):
            try:
                started = datetime.fromisoformat(started_at)
                finished = datetime.fromisoformat(finished_at)
                self._task_command_history[-1]["duration_ms"] = max(0, int((finished - started).total_seconds() * 1000))
            except ValueError:
                self._task_command_history[-1]["duration_ms"] = None

    def _append_task_log_line(self, line: str, *, event_name: str) -> None:
        self._emit(event_name, line)
        if self._task_state.get("task_type") == "idle":
            return
        self._task_log_lines.append(line)
        if len(self._task_log_lines) > _TASK_LOG_LIMIT:
            self._task_log_lines = self._task_log_lines[-_TASK_LOG_LIMIT:]
        self._task_log_dirty_count += 1
        if self._task_log_dirty_count >= _TASK_LOG_PERSIST_INTERVAL:
            self._task_log_dirty_count = 0
            self._persist_active_task_state()

    def _build_log_analysis(self) -> Dict[str, Any]:
        lines = list(self._task_log_lines)
        lowered_lines = [line.lower() for line in lines]
        warning_count = sum(1 for line in lowered_lines if "warning" in line or "deprecated" in line)
        error_count = sum(
            1
            for line in lowered_lines
            if "traceback" in line
            or "error" in line
            or "exception" in line
            or "failed" in line
            or "assertionerror" in line
            or "runtimeerror" in line
        )

        signal_specs = [
            (
                "log.traceback_detected",
                "error",
                "检测到 Traceback",
                "Traceback detected",
                ("traceback",),
            ),
            (
                "log.oom_detected",
                "error",
                "检测到显存/内存不足信号",
                "Out-of-memory signal detected",
                ("out of memory", "cuda out of memory", "oom"),
            ),
            (
                "log.checkpoint_mismatch",
                "error",
                "检测到梯度检查点重算不一致",
                "Checkpoint recomputation mismatch detected",
                ("checkpointerror", "a different number of tensors was saved"),
            ),
            (
                "log.runtime_error",
                "error",
                "检测到运行时错误",
                "Runtime error detected",
                ("runtimeerror", "assertionerror", "exception"),
            ),
            (
                "log.warning_detected",
                "warning",
                "检测到警告信息",
                "Warning detected",
                ("warning", "futurewarning", "deprecated"),
            ),
        ]

        signals: list[Dict[str, Any]] = []
        seen_codes: set[str] = set()
        for original, lowered in zip(lines, lowered_lines):
            for code, severity, title_zh, title_en, patterns in signal_specs:
                if code in seen_codes:
                    continue
                if any(pattern in lowered for pattern in patterns):
                    signals.append(
                        {
                            "code": code,
                            "severity": severity,
                            "title_zh": title_zh,
                            "title_en": title_en,
                            "matched_line": original,
                        }
                    )
                    seen_codes.add(code)

        last_warning = next(
            (line for line in reversed(lines) if "warning" in line.lower() or "deprecated" in line.lower()),
            None,
        )
        last_error = next(
            (
                line
                for line in reversed(lines)
                if "traceback" in line.lower()
                or "error" in line.lower()
                or "exception" in line.lower()
                or "failed" in line.lower()
            ),
            None,
        )

        return {
            "line_count": len(lines),
            "warning_count": warning_count,
            "error_count": error_count,
            "signal_count": len(signals),
            "last_warning": last_warning,
            "last_error": last_error,
            "signals": signals[:8],
        }

    def _begin_task(
        self,
        task_type: str,
        stage_code: str,
        stage_label_zh: str,
        stage_label_en: str,
        *,
        runtime_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self._task_stage_history = []
        self._task_command_history = []
        self._task_log_lines = []
        self._task_log_dirty_count = 0
        self._task_state = begin_task_state(
            task_type,
            stage_code,
            stage_label_zh,
            stage_label_en,
            runtime_id=runtime_id,
            details=details,
        )
        self._emit_task_snapshot(include_stage_event=True)
        self._persist_active_task_state()

    def _advance_task(
        self,
        stage_code: str,
        stage_label_zh: str,
        stage_label_en: str,
        *,
        state: str = "running",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self._task_state = advance_task_state(
            self._task_state,
            stage_code,
            stage_label_zh,
            stage_label_en,
            state=state,
            details=details,
        )
        self._emit_task_snapshot(include_stage_event=True)
        self._persist_active_task_state()

    def _finish_task(
        self,
        *,
        success: bool,
        stage_code: str,
        stage_label_zh: str,
        stage_label_en: str,
        code: Optional[str] = None,
        result_code: Optional[str] = None,
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self._task_state = finish_task_state(
            self._task_state,
            success=success,
            stage_code=stage_code,
            stage_label_zh=stage_label_zh,
            stage_label_en=stage_label_en,
            code=code,
            result_code=result_code,
            error=error,
            details=details,
        )
        self._state_store.clear()
        self._emit_task_snapshot(include_stage_event=True)
        if self._task_state.get("task_type") != "idle" and self._task_state.get("task_id"):
            result = build_task_result(self._task_state)
            result["stages"] = [dict(item) for item in self._task_stage_history]
            result["commands"] = [dict(item) for item in self._task_command_history]
            result["log_lines"] = list(self._task_log_lines)
            result["log_analysis"] = self._build_log_analysis()
            self._task_history = push_task_history(self._task_history, result)
            self._history_store.save(self._task_history)
            self._emit("task_result", result)

    def _recover_interrupted_task_if_needed(self) -> None:
        snapshot = self._state_store.load()
        if not snapshot:
            return
        if snapshot.get("task_type") == "idle":
            self._state_store.clear()
            return
        if snapshot.get("state") not in {"pending", "running"}:
            self._state_store.clear()
            return
        interrupted = build_interrupted_task_result(snapshot)
        stage_history = snapshot.get("stage_history")
        if isinstance(stage_history, list) and stage_history:
            interrupted["stages"] = [item for item in stage_history if isinstance(item, dict)]
        else:
            interrupted["stages"] = [build_task_stage_event(snapshot)]
        command_records = snapshot.get("command_records")
        if isinstance(command_records, list) and command_records:
            interrupted["commands"] = [item for item in command_records if isinstance(item, dict)]
        log_lines = snapshot.get("log_lines")
        if isinstance(log_lines, list) and log_lines:
            interrupted["log_lines"] = [line for line in log_lines if isinstance(line, str)]
            self._task_log_lines = interrupted["log_lines"]
            interrupted["log_analysis"] = self._build_log_analysis()
            self._task_log_lines = []
        self._task_history = push_task_history(self._task_history, interrupted)
        self._history_store.save(self._task_history)
        self._state_store.clear()

    def _read_output(self) -> None:
        if not self._process or not self._process.stdout:
            return
        try:
            for line in self._process.stdout:
                decoded = line.decode("utf-8", errors="replace").rstrip("\n\r")
                if decoded:
                    self._append_task_log_line(decoded, event_name="console_line")
        except Exception:
            pass
        finally:
            code = self._process.wait() if self._process else -1
            self._process = None
            self._reader_thread = None
            if self._task_state.get("task_type") == "stop":
                self._finish_task(
                    success=code == 0,
                    stage_code="trainer.stop_completed" if code == 0 else "trainer.stop_failed",
                    stage_label_zh="训练进程已停止" if code == 0 else "训练进程停止异常",
                    stage_label_en="Trainer process stopped" if code == 0 else "Trainer process stop failed",
                    code=None if code == 0 else "trainer.stop_failed",
                    result_code="trainer.stop_completed" if code == 0 else None,
                    error=None if code == 0 else f"Process exited with code {code}",
                    details={"exit_code": code},
                )
            elif self._task_state.get("task_type") == "launch":
                self._record_launch_process_exited(code)
                self._finish_task(
                    success=code == 0,
                    stage_code="trainer.process_exited_cleanly" if code == 0 else "trainer.process_exited_with_error",
                    stage_label_zh="训练进程已正常退出" if code == 0 else "训练进程异常退出",
                    stage_label_en="Trainer process exited cleanly" if code == 0 else "Trainer process exited with error",
                    code=None if code == 0 else "trainer.process_exited_with_error",
                    result_code="trainer.process_exited_cleanly" if code == 0 else None,
                    error=None if code == 0 else f"Process exited with code {code}",
                    details={"exit_code": code},
                )
            self._emit(
                "process_exit",
                {
                    "code": code,
                    "success": code == 0,
                    "result_code": "trainer.process_exited_cleanly" if code == 0 else "trainer.process_exited_with_error",
                },
            )

    def _terminate_process(self, timeout: float = 3.0) -> None:
        process = self._process
        if not process:
            return
        try:
            if process.poll() is not None:
                return
        except Exception:
            return
        try:
            process.terminate()
            process.wait(timeout=timeout)
            return
        except subprocess.TimeoutExpired:
            pass
        except Exception:
            return
        self._force_kill_process(process=process)

    def _force_kill_process(self, process: Optional[subprocess.Popen] = None) -> None:
        process = process or self._process
        if not process:
            return
        try:
            if process.poll() is None:
                if process.stdout:
                    try:
                        process.stdout.close()
                    except Exception:
                        pass
                if hasattr(subprocess, "CREATE_NEW_PROCESS_GROUP"):
                    subprocess.run(
                        ["taskkill", "/PID", str(process.pid), "/T", "/F"],
                        capture_output=True,
                        check=False,
                        text=True,
                        **hidden_subprocess_kwargs(),
                    )
                else:
                    process.kill()
                process.wait(timeout=2.0)
        except Exception:
            pass
