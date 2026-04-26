"""Structured launch/install execution plans for the launcher."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

from launcher.config import (
    SAFE_MODE_CLEAR_VARS,
    STANDARD_ENV_CLEAR_VARS,
    STANDARD_ENV_VARS,
    RuntimeDef,
    get_repo_root,
)
from launcher.core.runtime_catalog import describe_runtime
from launcher.core.runtime_tasks import (
    LaunchOptions,
    build_install_commands,
    build_install_env,
    build_launch_command,
    build_launch_env,
    run_streamed_command,
    spawn_launch_process,
)


@dataclass
class PlannedCommand:
    label_zh: str
    label_en: str
    executable: str
    args: List[str]
    cwd: str

    def to_public_dict(self) -> Dict[str, Any]:
        command = [self.executable] + self.args
        return {
            "label_zh": self.label_zh,
            "label_en": self.label_en,
            "executable": self.executable,
            "args": list(self.args),
            "cwd": self.cwd,
            "command_preview": " ".join(command),
        }


@dataclass
class TaskPlan:
    action: str
    runtime_id: str
    title_zh: str
    title_en: str
    summary_zh: str
    summary_en: str
    steps: List[Dict[str, str]]
    commands: List[PlannedCommand]
    env_changes: List[Dict[str, Any]]
    notes: List[Dict[str, str]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    effective_env: Dict[str, str] = field(default_factory=dict)

    def to_public_dict(self) -> Dict[str, Any]:
        return {
            "action": self.action,
            "runtime_id": self.runtime_id,
            "title_zh": self.title_zh,
            "title_en": self.title_en,
            "summary_zh": self.summary_zh,
            "summary_en": self.summary_en,
            "steps": list(self.steps),
            "commands": [command.to_public_dict() for command in self.commands],
            "env_changes": list(self.env_changes),
            "notes": list(self.notes),
            "metadata": dict(self.metadata),
        }


def _set_change(key: str, value: str, source_zh: str, source_en: str) -> Dict[str, Any]:
    return {
        "mode": "set",
        "key": key,
        "value": value,
        "source_zh": source_zh,
        "source_en": source_en,
    }


def _clear_change(key: str, source_zh: str, source_en: str) -> Dict[str, Any]:
    return {
        "mode": "clear",
        "key": key,
        "value": None,
        "source_zh": source_zh,
        "source_en": source_en,
    }


def _collect_launch_env_changes(runtime_def: RuntimeDef, options: LaunchOptions) -> List[Dict[str, Any]]:
    changes: List[Dict[str, Any]] = []

    if options.safe_mode:
        for key in SAFE_MODE_CLEAR_VARS:
            changes.append(_clear_change(key, "安全模式清理", "Safe mode cleanup"))
        changes.append(_set_change("PYTHONNOUSERSITE", "1", "安全模式", "Safe mode"))

    for key in STANDARD_ENV_CLEAR_VARS:
        changes.append(_clear_change(key, "启动器标准环境", "Launcher standard environment"))
    for key, value in sorted(STANDARD_ENV_VARS.items()):
        changes.append(_set_change(key, value, "启动器标准环境", "Launcher standard environment"))

    if runtime_def.preferred_runtime:
        changes.append(
            _set_change(
                "MIKAZUKI_PREFERRED_RUNTIME",
                runtime_def.preferred_runtime,
                "运行时默认值",
                "Runtime default",
            )
        )
    else:
        changes.append(_clear_change("MIKAZUKI_PREFERRED_RUNTIME", "标准运行时", "Standard runtime"))

    for key, value in sorted(runtime_def.env_vars.items()):
        changes.append(_set_change(key, value, "运行时默认值", "Runtime default"))

    runtime_default_attention_policy = runtime_def.env_vars.get("MIKAZUKI_STARTUP_ATTENTION_POLICY")

    if options.attention_policy == "force_sdpa":
        changes.append(
            _set_change(
                "MIKAZUKI_STARTUP_ATTENTION_POLICY",
                "force_sdpa",
                "用户注意力策略",
                "User attention policy",
            )
        )
    elif runtime_default_attention_policy == "runtime_guarded":
        changes.append(
            _set_change(
                "MIKAZUKI_STARTUP_ATTENTION_POLICY",
                "runtime_guarded",
                "运行时默认值",
                "Runtime default",
            )
        )
    elif options.attention_policy == "prefer_flash":
        changes.append(
            _set_change(
                "MIKAZUKI_STARTUP_ATTENTION_POLICY",
                "prefer_flash",
                "用户注意力策略",
                "User attention policy",
            )
        )
    elif options.attention_policy == "prefer_sage":
        changes.append(
            _set_change(
                "MIKAZUKI_STARTUP_ATTENTION_POLICY",
                "prefer_sage",
                "用户注意力策略",
                "User attention policy",
            )
        )
    elif "MIKAZUKI_STARTUP_ATTENTION_POLICY" not in runtime_def.env_vars:
        changes.append(
            _clear_change(
                "MIKAZUKI_STARTUP_ATTENTION_POLICY",
                "按运行时默认值启动",
                "Clean runtime default",
            )
        )

    if options.cn_mirror:
        changes.append(_set_change("MIKAZUKI_CN_MIRROR", "1", "国内镜像", "CN mirror"))
    else:
        changes.append(_clear_change("MIKAZUKI_CN_MIRROR", "未启用国内镜像", "CN mirror disabled"))

    return changes


def _collect_install_env_changes(cn_mirror: bool) -> List[Dict[str, Any]]:
    if cn_mirror:
        return [_set_change("MIKAZUKI_CN_MIRROR", "1", "国内镜像", "CN mirror")]
    return [_clear_change("MIKAZUKI_CN_MIRROR", "未启用国内镜像", "CN mirror disabled")]


def build_launch_plan(
    runtime_def: RuntimeDef,
    python_path: Path,
    options: LaunchOptions,
    repo_root: Optional[Path] = None,
) -> TaskPlan:
    """Build a structured launch plan for the selected runtime."""

    if repo_root is None:
        repo_root = get_repo_root()

    catalog_entry = describe_runtime(runtime_def, repo_root=repo_root)
    env = build_launch_env(runtime_def, options)
    command = build_launch_command(python_path, options)

    notes = []
    if catalog_entry.get("notes_zh") or catalog_entry.get("notes_en"):
        notes.append(
            {
                "severity": "info",
                "message_zh": catalog_entry.get("notes_zh", ""),
                "message_en": catalog_entry.get("notes_en", ""),
            }
        )

    return TaskPlan(
        action="launch",
        runtime_id=runtime_def.id,
        title_zh=f"启动计划：{runtime_def.name_zh}",
        title_en=f"Launch plan: {runtime_def.name_en}",
        summary_zh=f"使用 {python_path} 启动 gui.py，并按当前设置拼装运行时环境。",
        summary_en=f"Launch gui.py with {python_path} and compose the runtime environment from the current launcher settings.",
        steps=[
            {
                "id": "resolve_runtime",
                "label_zh": "确认运行时 Python",
                "label_en": "Resolve runtime Python",
                "detail_zh": str(python_path),
                "detail_en": str(python_path),
            },
            {
                "id": "compose_env",
                "label_zh": "拼装环境变量",
                "label_en": "Compose environment variables",
                "detail_zh": f"{len(_collect_launch_env_changes(runtime_def, options))} 项变更",
                "detail_en": f"{len(_collect_launch_env_changes(runtime_def, options))} changes",
            },
            {
                "id": "run_gui",
                "label_zh": "启动训练器入口",
                "label_en": "Launch trainer entrypoint",
                "detail_zh": "gui.py",
                "detail_en": "gui.py",
            },
        ],
        commands=[
            PlannedCommand(
                label_zh="启动训练器",
                label_en="Launch trainer",
                executable=command[0],
                args=command[1:],
                cwd=str(repo_root),
            )
        ],
        env_changes=_collect_launch_env_changes(runtime_def, options),
        notes=notes,
        metadata={
            "runtime_name_zh": runtime_def.name_zh,
            "runtime_name_en": runtime_def.name_en,
            "entry_script": "gui.py",
            "category": runtime_def.category,
        },
        effective_env=env,
    )


def build_install_plan(
    runtime_def: RuntimeDef,
    cn_mirror: bool = False,
    repo_root: Optional[Path] = None,
) -> TaskPlan:
    """Build a structured install plan for the selected runtime."""

    if repo_root is None:
        repo_root = get_repo_root()

    catalog_entry = describe_runtime(runtime_def, repo_root=repo_root)
    env = build_install_env(cn_mirror)
    raw_commands = build_install_commands(runtime_def, repo_root=repo_root)

    commands = [
        PlannedCommand(
            label_zh=f"运行安装脚本：{script_name}",
            label_en=f"Run install script: {script_name}",
            executable=command[0],
            args=command[1:],
            cwd=str(repo_root),
        )
        for script_name, command in zip(runtime_def.install_scripts, raw_commands)
    ]

    notes = []
    if runtime_def.experimental:
        notes.append(
            {
                "severity": "warn",
                "message_zh": "该运行时仍属实验线路，建议安装后先做小样本验证。",
                "message_en": "This runtime is still experimental. Run a short validation job after installation.",
            }
        )
    if catalog_entry.get("notes_zh") or catalog_entry.get("notes_en"):
        notes.append(
            {
                "severity": "info",
                "message_zh": catalog_entry.get("notes_zh", ""),
                "message_en": catalog_entry.get("notes_en", ""),
            }
        )

    return TaskPlan(
        action="install",
        runtime_id=runtime_def.id,
        title_zh=f"安装计划：{runtime_def.name_zh}",
        title_en=f"Install plan: {runtime_def.name_en}",
        summary_zh=f"按顺序执行 {len(commands)} 个 PowerShell 安装脚本。",
        summary_en=f"Run {len(commands)} PowerShell installer script(s) in sequence.",
        steps=[
            {
                "id": "prepare_runtime_dir",
                "label_zh": "确认运行时目录",
                "label_en": "Confirm runtime directory",
                "detail_zh": ", ".join(catalog_entry.get("preferred_env_dirs", [])),
                "detail_en": ", ".join(catalog_entry.get("preferred_env_dirs", [])),
            },
            {
                "id": "apply_install_env",
                "label_zh": "拼装安装环境变量",
                "label_en": "Compose install environment",
                "detail_zh": f"{len(_collect_install_env_changes(cn_mirror))} 项变更",
                "detail_en": f"{len(_collect_install_env_changes(cn_mirror))} changes",
            },
            {
                "id": "run_install_scripts",
                "label_zh": "执行安装脚本",
                "label_en": "Run install scripts",
                "detail_zh": ", ".join(runtime_def.install_scripts),
                "detail_en": ", ".join(runtime_def.install_scripts),
            },
        ],
        commands=commands,
        env_changes=_collect_install_env_changes(cn_mirror),
        notes=notes,
        metadata={
            "runtime_name_zh": runtime_def.name_zh,
            "runtime_name_en": runtime_def.name_en,
            "category": runtime_def.category,
        },
        effective_env=env,
    )


def run_launch_plan(plan: TaskPlan):
    """Execute a launch plan and return the spawned process."""

    if not plan.commands:
        raise RuntimeError("Launch plan has no commands.")

    command = [plan.commands[0].executable] + plan.commands[0].args
    return spawn_launch_process(command, plan.effective_env, repo_root=Path(plan.commands[0].cwd))


def run_install_plan(
    plan: TaskPlan,
    log_callback: Optional[Callable[[str], None]] = None,
    stage_callback: Optional[Callable[[PlannedCommand, int, int], None]] = None,
    result_callback: Optional[Callable[[PlannedCommand, int, int, bool], None]] = None,
) -> bool:
    """Execute an install plan and stream output through the callback."""

    all_success = True
    total = len(plan.commands)
    for index, command in enumerate(plan.commands, start=1):
        argv = [command.executable] + command.args
        script_name = Path(command.args[-1]).name if command.args else command.executable
        if stage_callback:
            stage_callback(command, index, total)
        if log_callback:
            log_callback(f"Running: {script_name} ...")
        success = run_streamed_command(argv, plan.effective_env, Path(command.cwd), log_callback)
        if result_callback:
            result_callback(command, index, total, success)
        if not success:
            all_success = False
    return all_success
