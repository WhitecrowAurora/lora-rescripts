import argparse
import json
import importlib.util
import locale
import os
import platform
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mikazuki.launch_utils import (base_dir_path, catch_exception, git_tag,
                                   prepare_environment, check_port_avaliable, find_avaliable_ports)
from mikazuki.log import log

APP_NAME = "SD-reScripts"
APP_VERSION = "v1.1.5 Beta10"
ALLOW_SYSTEM_PYTHON_ENV = "MIKAZUKI_ALLOW_SYSTEM_PYTHON"

parser = argparse.ArgumentParser(description="GUI for stable diffusion training")
parser.add_argument("--host", type=str, default="127.0.0.1")
parser.add_argument("--port", type=int, default=28000, help="Port to run the server on")
parser.add_argument("--listen", action="store_true")
parser.add_argument("--skip-prepare-environment", action="store_true")
parser.add_argument("--skip-prepare-onnxruntime", action="store_true")
parser.add_argument("--disable-tensorboard", action="store_true")
parser.add_argument("--disable-tageditor", action="store_true")
parser.add_argument("--disable-auto-mirror", action="store_true")
parser.add_argument("--tensorboard-host", type=str, default="127.0.0.1", help="Port to run the tensorboard")
parser.add_argument("--tensorboard-port", type=int, default=6006, help="Port to run the tensorboard")
parser.add_argument("--localization", type=str)
parser.add_argument("--dev", action="store_true")

TAGEDITOR_STATUS_FILE = base_dir_path() / "tmp" / "tageditor_status.json"


def write_tageditor_status(status: str, detail: str = ""):
    status_dir = TAGEDITOR_STATUS_FILE.parent
    status_dir.mkdir(parents=True, exist_ok=True)
    with open(TAGEDITOR_STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump({"status": status, "detail": detail}, f, ensure_ascii=False)


def get_system_locale():
    try:
        system_locale = locale.getlocale()[0]
    except (ValueError, TypeError):
        system_locale = None
    return system_locale


def path_is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def using_project_local_main_python() -> bool:
    repo_root = base_dir_path().resolve()
    executable = Path(sys.executable).resolve()
    allowed_roots = [
        (repo_root / "python").resolve(),
        (repo_root / "python_blackwell").resolve(),
        (repo_root / "python-sageattention").resolve(),
        (repo_root / "python-sageattention-latest").resolve(),
        (repo_root / "python-sageattention-blackwell").resolve(),
        (repo_root / "python_sageattention").resolve(),
        (repo_root / "python_sageattention_latest").resolve(),
        (repo_root / "python_sageattention_blackwell").resolve(),
        (repo_root / "venv").resolve(),
    ]
    return any(path_is_within(executable, root) for root in allowed_roots)


def ensure_project_local_main_python():
    if os.environ.get(ALLOW_SYSTEM_PYTHON_ENV, "") == "1":
        log.warning(
            "%s=1 is set. Allowing a non-project Python runtime for development.",
            ALLOW_SYSTEM_PYTHON_ENV,
        )
        return

    if using_project_local_main_python():
        return

    raise RuntimeError(
        "This build is locked to project-local Python by default. "
        "Launch it via run_gui.ps1/run_gui.sh after preparing ./python, ./python_blackwell, ./python-sageattention, ./python-sageattention-latest, ./python-sageattention-blackwell, or ./venv. "
        "Legacy ./python_sageattention, ./python_sageattention_latest, and ./python_sageattention_blackwell folders are also accepted. "
        "For development only, set MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 to override this guard intentionally."
    )


@catch_exception
def run_tensorboard():
    if importlib.util.find_spec("pkg_resources") is None:
        log.warning("pkg_resources is not available, skipping tensorboard startup. Reinstall with setuptools<81 if you need tensorboard.")
        return

    log.info("Starting tensorboard...")
    subprocess.Popen(
        [
            sys.executable,
            "-m",
            "tensorboard.main",
            "--logdir",
            str(base_dir_path() / "logs"),
            "--host",
            args.tensorboard_host,
            "--port",
            str(args.tensorboard_port),
        ],
        cwd=base_dir_path(),
    )


@catch_exception
def run_tag_editor():
    tag_editor_root = base_dir_path() / "mikazuki/dataset-tag-editor"
    tag_editor_launch = base_dir_path() / "mikazuki/dataset-tag-editor/scripts/launch.py"
    dedicated_tag_editor_pythons = [
        base_dir_path() / "python_tageditor/python.exe",
        base_dir_path() / "python_tageditor/bin/python",
        base_dir_path() / "venv-tageditor/Scripts/python.exe",
        base_dir_path() / "venv-tageditor/bin/python",
    ]
    if not tag_editor_launch.exists():
        log.warning("tag editor launcher is missing, skip starting tag editor.")
        os.environ["MIKAZUKI_TAGEDITOR_STATUS"] = "missing_launcher"
        write_tageditor_status("missing_launcher", "Tag editor launcher is missing.")
        return

    python_exe = sys.executable
    dedicated_python = next((path for path in dedicated_tag_editor_pythons if path.exists()), None)
    if dedicated_python is not None:
        python_exe = str(dedicated_python)
        os.environ["MIKAZUKI_TAGEDITOR_RUNTIME"] = "dedicated"
    else:
        required_modules = ["gradio", "transformers", "timm", "print_color"]
        missing_modules = [name for name in required_modules if importlib.util.find_spec(name) is None]
        if missing_modules:
            log.warning(
                "tag editor dependencies are missing (%s), run install_tageditor.ps1 (Windows) or install_tageditor.sh (Linux) first.",
                ", ".join(missing_modules),
            )
            os.environ["MIKAZUKI_TAGEDITOR_STATUS"] = "missing_dependencies"
            write_tageditor_status("missing_dependencies", f"Missing modules: {', '.join(missing_modules)}")
            return
        os.environ["MIKAZUKI_TAGEDITOR_RUNTIME"] = "main"

    log.info("Starting tageditor...")
    os.environ["MIKAZUKI_TAGEDITOR_STATUS"] = "starting"
    write_tageditor_status("starting", "Launching tag editor subprocess...")
    cmd = [
        python_exe,
        tag_editor_launch,
        "--port", "28001",
        "--shadow-gradio-output",
        "--root-path", "/proxy/tageditor"
    ]
    localization = args.localization or "zh-Hans"
    cmd.extend(["--localization", localization])
    subprocess.Popen(cmd, cwd=tag_editor_root)


def launch():
    ensure_project_local_main_python()
    log.info(f"Starting {APP_NAME} Mikazuki GUI...")
    log.info(f"Base directory: {base_dir_path()}, Working directory: {os.getcwd()}")
    log.info(f"{platform.system()} Python {platform.python_version()} {sys.executable}")

    if args.listen:
        args.host = "0.0.0.0"
        args.tensorboard_host = "0.0.0.0"

    if not args.skip_prepare_environment:
        prepare_environment(
            disable_auto_mirror=args.disable_auto_mirror,
            prepare_onnxruntime=not args.skip_prepare_onnxruntime,
        )

    if not check_port_avaliable(args.port):
        avaliable = find_avaliable_ports(30000, 30000+20)
        if avaliable:
            args.port = avaliable
        else:
            log.error("port finding fallback error")

    git_version = git_tag(base_dir_path())
    version_suffix = f" ({git_version})" if git_version != "<none>" else ""
    log.info(f"{APP_NAME} Version: {APP_VERSION}{version_suffix}")

    os.environ["MIKAZUKI_HOST"] = args.host
    os.environ["MIKAZUKI_PORT"] = str(args.port)
    os.environ["MIKAZUKI_TENSORBOARD_HOST"] = args.tensorboard_host
    os.environ["MIKAZUKI_TENSORBOARD_PORT"] = str(args.tensorboard_port)
    os.environ["MIKAZUKI_TAGEDITOR_HOST"] = "127.0.0.1"
    os.environ["MIKAZUKI_TAGEDITOR_PORT"] = "28001"
    os.environ["MIKAZUKI_DEV"] = "1" if args.dev else "0"
    os.environ["MIKAZUKI_TAGEDITOR_STATUS_FILE"] = str(TAGEDITOR_STATUS_FILE)
    os.environ["MIKAZUKI_TAGEDITOR_STATUS"] = "disabled" if args.disable_tageditor else "unknown"
    if args.disable_tageditor:
        write_tageditor_status("disabled", "Tag editor is disabled for this launch.")
    else:
        write_tageditor_status("queued", "Tag editor will be started shortly.")

    if not args.disable_tageditor:
        run_tag_editor()

    if not args.disable_tensorboard:
        run_tensorboard()

    import uvicorn
    log.info(f"Server started at http://{args.host}:{args.port}")
    uvicorn.run("mikazuki.app:app", host=args.host, port=args.port, log_level="error", reload=args.dev)


if __name__ == "__main__":
    args, _ = parser.parse_known_args()
    launch()
