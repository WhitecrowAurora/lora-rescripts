"""Launch preflight checks for the launcher."""

from __future__ import annotations

import socket
from pathlib import Path
from typing import Any, Dict, List, Optional

from launcher.core.recommendation import recommend_runtime
from launcher.core.runtime_detector import RuntimeStatus


def _issue(
    code: str,
    severity: str,
    title_zh: str,
    title_en: str,
    message_zh: str,
    message_en: str,
    action_page: Optional[str] = None,
) -> Dict[str, Any]:
    return {
        "code": code,
        "severity": severity,
        "title_zh": title_zh,
        "title_en": title_en,
        "message_zh": message_zh,
        "message_en": message_en,
        "action_page": action_page,
    }


def _check_port_available(host: str, port: int) -> bool:
    try:
        infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except socket.gaierror:
        return False

    for family, socktype, proto, _, sockaddr in infos:
        try:
            with socket.socket(family, socktype, proto) as sock:
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.bind(sockaddr)
                return True
        except OSError:
            continue
    return False


def collect_launch_preflight(
    repo_root: Path,
    runtime_id: Optional[str],
    settings: Dict[str, Any],
    statuses: Dict[str, RuntimeStatus],
) -> Dict[str, Any]:
    """Collect launch issues that can be shown before starting gui.py."""

    issues: List[Dict[str, Any]] = []
    recommendation = recommend_runtime(statuses, repo_root=repo_root)

    gui_path = repo_root / "gui.py"
    if not gui_path.exists():
        issues.append(
            _issue(
                "missing_gui_py",
                "error",
                "缺少 gui.py",
                "Missing gui.py",
                "未在仓库根目录找到 gui.py，当前副本看起来不完整，无法启动训练器。",
                "The launcher could not find gui.py in the repository root. This copy looks incomplete and cannot start the trainer.",
            )
        )

    if not runtime_id:
        issues.append(
            _issue(
                "runtime_not_selected",
                "error",
                "未选择运行时",
                "No Runtime Selected",
                "请先选择一个可用的运行时，再启动训练器。",
                "Select an available runtime before launching the trainer.",
                action_page="runtime",
            )
        )
    else:
        status = statuses.get(runtime_id)
        if not status or not status.installed or not status.python_path:
            issues.append(
                _issue(
                    "runtime_not_ready",
                    "error",
                    "运行时未就绪",
                    "Runtime Not Ready",
                    f"当前选择的运行时 {runtime_id} 尚未安装完成，无法启动。",
                    f"The selected runtime {runtime_id} is not fully installed yet and cannot be used to launch the trainer.",
                    action_page="runtime",
                )
            )
        elif not status.python_path.exists():
            issues.append(
                _issue(
                    "runtime_python_missing",
                    "error",
                    "运行时 Python 缺失",
                    "Runtime Python Missing",
                    f"检测到了 {runtime_id} 的环境目录，但 Python 可执行文件不存在：{status.python_path}",
                    f"The launcher found the {runtime_id} environment directory, but the Python executable is missing: {status.python_path}",
                    action_page="runtime",
                )
            )

    host = str(settings.get("host") or "127.0.0.1").strip()
    if not host:
        issues.append(
            _issue(
                "host_empty",
                "error",
                "主机地址为空",
                "Empty Host",
                "主机地址不能为空。",
                "Host must not be empty.",
                action_page="advanced",
            )
        )

    raw_port = settings.get("port", 28000)
    try:
        port = int(raw_port)
    except (TypeError, ValueError):
        port = -1
    if port < 1 or port > 65535:
        issues.append(
            _issue(
                "port_invalid",
                "error",
                "端口无效",
                "Invalid Port",
                f"端口 {raw_port} 不在 1-65535 的有效范围内。",
                f"Port {raw_port} is outside the valid 1-65535 range.",
                action_page="advanced",
            )
        )
    else:
        bind_host = "0.0.0.0" if bool(settings.get("listen")) else host
        if not _check_port_available(bind_host, port):
            issues.append(
                _issue(
                    "port_in_use",
                    "error",
                    "端口已被占用",
                    "Port Already In Use",
                    f"{bind_host}:{port} 当前无法绑定，可能已经被其他程序占用。",
                    f"{bind_host}:{port} cannot be bound right now. Another process is probably already using it.",
                    action_page="advanced",
                )
            )

    recommended_runtime_id = recommendation.get("selected_runtime_id")
    if (
        runtime_id
        and recommended_runtime_id
        and runtime_id != recommended_runtime_id
        and statuses.get(recommended_runtime_id)
        and statuses[recommended_runtime_id].installed
    ):
        issues.append(
            _issue(
                "runtime_better_option_available",
                "warning",
                "检测到更合适的运行时",
                "A Better Runtime Is Available",
                f"当前机器更推荐使用 {recommended_runtime_id}，继续使用 {runtime_id} 也可以，但可能不是最佳选择。",
                f"This machine is better matched with {recommended_runtime_id}. You can still use {runtime_id}, but it may not be the best choice.",
                action_page="runtime",
            )
        )

    ready = not any(issue["severity"] == "error" for issue in issues)
    return {
        "ready": ready,
        "runtime_id": runtime_id,
        "issues": issues,
    }
