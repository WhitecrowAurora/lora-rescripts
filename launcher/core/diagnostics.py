"""Lightweight launcher health checks."""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional

from launcher.core.recommendation import recommend_runtime
from launcher.core.runtime_detector import RuntimeStatus


def _check(
    code: str,
    status: str,
    title_zh: str,
    title_en: str,
    message_zh: str,
    message_en: str,
) -> Dict[str, str]:
    return {
        "code": code,
        "status": status,
        "title_zh": title_zh,
        "title_en": title_en,
        "message_zh": message_zh,
        "message_en": message_en,
    }


def _finding(
    code: str,
    severity: str,
    title_zh: str,
    title_en: str,
    message_zh: str,
    message_en: str,
    next_step_zh: str,
    next_step_en: str,
    action_page: Optional[str] = None,
) -> Dict[str, str | None]:
    return {
        "code": code,
        "severity": severity,
        "title_zh": title_zh,
        "title_en": title_en,
        "message_zh": message_zh,
        "message_en": message_en,
        "next_step_zh": next_step_zh,
        "next_step_en": next_step_en,
        "action_page": action_page,
    }


def collect_health_report(
    repo_root: Path,
    statuses: Dict[str, RuntimeStatus],
    selected_runtime_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Collect a lightweight launcher health summary."""

    checks: List[Dict[str, str]] = []
    recommendation = recommend_runtime(statuses, repo_root=repo_root)
    installed_runtime_count = sum(1 for status in statuses.values() if status.installed)
    prepared_runtime_count = sum(1 for status in statuses.values() if status.python_exists)
    findings: List[Dict[str, str | None]] = []

    gui_path = repo_root / "gui.py"
    if gui_path.exists():
        checks.append(
            _check(
                "repo_complete",
                "pass",
                "仓库入口完整",
                "Repository entry is present",
                "检测到了 gui.py，训练器主入口存在。",
                "gui.py is present, so the trainer entrypoint exists.",
            )
        )
    else:
        checks.append(
            _check(
                "repo_complete",
                "fail",
                "仓库入口缺失",
                "Repository entry is missing",
                "未检测到 gui.py，这份副本当前无法用于启动训练器。",
                "gui.py is missing, so this copy cannot start the trainer right now.",
            )
        )
        findings.append(
            _finding(
                "missing_gui_py",
                "critical",
                "缺少训练器入口",
                "Trainer entrypoint is missing",
                "当前仓库副本里没有 gui.py，启动器无法拉起训练器。",
                "gui.py is missing from this repository copy, so the launcher cannot start the trainer.",
                "请先确认当前副本完整，或重新更新 / 解压项目。",
                "Confirm that this copy is complete, or re-update / re-extract the project.",
            )
        )

    if shutil.which("powershell.exe"):
        checks.append(
            _check(
                "powershell_available",
                "pass",
                "PowerShell 可用",
                "PowerShell is available",
                "运行时安装脚本可以正常调用 PowerShell。",
                "Runtime install scripts can call PowerShell normally.",
            )
        )
    else:
        checks.append(
            _check(
                "powershell_available",
                "warn",
                "PowerShell 不可用",
                "PowerShell is unavailable",
                "无法找到 PowerShell，运行时安装功能会受到影响。",
                "PowerShell could not be found, so runtime installation will be affected.",
            )
        )
        findings.append(
            _finding(
                "powershell_missing",
                "warn",
                "PowerShell 不可用",
                "PowerShell is unavailable",
                "运行时安装功能当前无法调用 PowerShell。",
                "Runtime installation cannot currently invoke PowerShell.",
                "如果你需要安装运行时，请先恢复系统 PowerShell 环境。",
                "Restore PowerShell on this system before installing runtimes.",
                "install",
            )
        )

    if installed_runtime_count > 0:
        checks.append(
            _check(
                "installed_runtime_available",
                "pass",
                "已安装运行时可用",
                "Installed runtime available",
                f"当前检测到 {installed_runtime_count} 个已安装运行时。",
                f"{installed_runtime_count} installed runtime(s) were detected.",
            )
        )
    else:
        checks.append(
            _check(
                "installed_runtime_available",
                "warn",
                "尚无已安装运行时",
                "No installed runtime yet",
                "当前还没有已安装完成的运行时，需要先准备并安装一条运行时线路。",
                "No runtime is fully installed yet. Prepare and install one first.",
            )
        )
        findings.append(
            _finding(
                "no_installed_runtime",
                "warn",
                "还没有可直接启动的运行时",
                "No launch-ready runtime yet",
                "当前没有已安装完成的运行时，所以还不能直接启动训练器。",
                "No runtime is fully installed yet, so the trainer cannot be launched directly.",
                "先准备本地 Python 环境，再去安装页完成一条运行时安装。",
                "Prepare a local Python runtime first, then finish installing one runtime on the Install page.",
                "install",
            )
        )

    if prepared_runtime_count > 0:
        checks.append(
            _check(
                "prepared_python_available",
                "pass",
                "检测到本地 Python 环境",
                "Prepared local Python detected",
                f"当前检测到 {prepared_runtime_count} 个已准备好的本地 Python 运行时目录。",
                f"{prepared_runtime_count} prepared local Python runtime folder(s) were detected.",
            )
        )
    else:
        checks.append(
            _check(
                "prepared_python_available",
                "warn",
                "尚未检测到本地 Python 环境",
                "No prepared local Python detected",
                "当前没有检测到可用的本地 Python 运行时目录。",
                "No usable local Python runtime folder is currently detected.",
            )
        )
        findings.append(
            _finding(
                "no_prepared_python",
                "warn",
                "还没有准备好本地 Python 环境",
                "No prepared local Python runtime yet",
                "启动器没有检测到可用的项目内 Python 运行时目录。",
                "The launcher could not detect a usable project-local Python runtime folder.",
                "把准备好的嵌入式 / 本地 Python 运行时放到对应的 env 目录后再安装。",
                "Place a prepared embedded/local Python runtime in the expected env folder before installation.",
                "runtime",
            )
        )

    recommended_runtime_id = recommendation.get("selected_runtime_id")
    if recommended_runtime_id and statuses.get(recommended_runtime_id) and statuses[recommended_runtime_id].installed:
        checks.append(
            _check(
                "recommended_runtime_ready",
                "pass",
                "推荐运行时已就绪",
                "Recommended runtime is ready",
                f"推荐运行时 {recommended_runtime_id} 已安装完成。",
                f"The recommended runtime {recommended_runtime_id} is installed and ready.",
            )
        )
    elif recommended_runtime_id:
        checks.append(
            _check(
                "recommended_runtime_ready",
                "warn",
                "推荐运行时尚未就绪",
                "Recommended runtime is not ready",
                f"推荐运行时 {recommended_runtime_id} 还未安装完成。",
                f"The recommended runtime {recommended_runtime_id} is not fully installed yet.",
            )
        )
        findings.append(
            _finding(
                "recommended_runtime_not_ready",
                "info",
                "推荐运行时尚未安装完成",
                "Recommended runtime is not installed yet",
                f"当前机器更适合 {recommended_runtime_id}，但这条运行时还未安装完成。",
                f"This machine is better matched with {recommended_runtime_id}, but that runtime is not installed yet.",
                "如果你准备走推荐线路，可以优先完成它的本地环境准备和安装。",
                "If you want the recommended path, prepare and install that runtime first.",
                "runtime",
            )
        )

    if selected_runtime_id:
        selected_status = statuses.get(selected_runtime_id)
        if selected_status and selected_status.installed:
            checks.append(
                _check(
                    "selected_runtime_ready",
                    "pass",
                    "当前选择运行时可用",
                    "Selected runtime is ready",
                    f"当前选择的运行时 {selected_runtime_id} 已安装完成，可以直接启动。",
                    f"The currently selected runtime {selected_runtime_id} is installed and ready to launch.",
                )
            )
        else:
            checks.append(
                _check(
                    "selected_runtime_ready",
                    "warn",
                    "当前选择运行时未就绪",
                    "Selected runtime is not ready",
                    f"当前选择的运行时 {selected_runtime_id} 尚未安装完成。",
                    f"The currently selected runtime {selected_runtime_id} is not fully installed yet.",
                )
            )
            findings.append(
                _finding(
                    "selected_runtime_not_ready",
                    "warn",
                    "当前选中的运行时尚未就绪",
                    "The selected runtime is not ready",
                    f"当前选择的是 {selected_runtime_id}，但它还没有安装完成。",
                    f"{selected_runtime_id} is currently selected, but it is not fully installed yet.",
                    "可以先完成这条运行时安装，或切换到另一条已经安装好的运行时。",
                    "Finish installing this runtime first, or switch to another runtime that is already installed.",
                    "runtime",
                )
            )
    else:
        checks.append(
            _check(
                "selected_runtime_ready",
                "info",
                "尚未选择运行时",
                "No runtime selected yet",
                "当前还没有选中的运行时。",
                "No runtime is currently selected.",
            )
        )

    updater_ok = (repo_root / "update.bat").exists() or (repo_root / "update_cn.bat").exists()
    checks.append(
        _check(
            "updater_available",
            "pass" if updater_ok else "warn",
            "更新脚本可用" if updater_ok else "更新脚本缺失",
            "Updater is available" if updater_ok else "Updater script is missing",
            "至少检测到一个项目更新脚本。" if updater_ok else "未检测到项目更新脚本，自动更新入口会受影响。",
            "At least one project updater script was found." if updater_ok else "No project updater script was found, so update actions will be limited.",
        )
    )

    statuses_seen = {check["status"] for check in checks}
    if "fail" in statuses_seen:
        overall_status = "critical"
        summary_zh = "检测到会直接影响启动器使用的关键问题。"
        summary_en = "Critical issues were detected that directly affect launcher usability."
    elif "warn" in statuses_seen:
        overall_status = "attention"
        summary_zh = "检测到一些需要注意的问题，但启动器仍可继续使用。"
        summary_en = "Some attention points were detected, but the launcher can still be used."
    else:
        overall_status = "healthy"
        summary_zh = "当前启动器状态良好，未检测到明显阻塞项。"
        summary_en = "The launcher looks healthy and no obvious blockers were detected."

    return {
        "overall_status": overall_status,
        "summary_zh": summary_zh,
        "summary_en": summary_en,
        "installed_runtime_count": installed_runtime_count,
        "prepared_runtime_count": prepared_runtime_count,
        "recommended_runtime_id": recommended_runtime_id,
        "selected_runtime_id": selected_runtime_id,
        "primary_findings": findings[:4],
        "checks": checks,
    }
