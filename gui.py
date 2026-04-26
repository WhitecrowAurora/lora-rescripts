import argparse
import json
import importlib.util
import os
import platform
import subprocess
import sys
import time
import warnings
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

warnings.filterwarnings(
    "ignore",
    category=FutureWarning,
    message=r"Importing from timm\.models\.layers is deprecated, please import via timm\.layers",
)

from mikazuki.launch_utils import (base_dir_path, catch_exception, git_tag,
                                   prepare_environment, check_port_avaliable, find_avaliable_ports)
from mikazuki.log import log
from mikazuki.utils.backend_status import BACKEND_STATUS_FILE_ENV, write_backend_status
from mikazuki.utils.runtime_mode import infer_runtime_environment_name, is_amd_rocm_runtime, is_intel_xpu_runtime
from mikazuki.utils.runtime_paths import get_project_local_main_python_roots, get_tageditor_python_candidates

APP_NAME = "SD-reScripts"
APP_VERSION = "v1.5.3"
ALLOW_SYSTEM_PYTHON_ENV = "MIKAZUKI_ALLOW_SYSTEM_PYTHON"
REPO_ROOT = base_dir_path()
LOG_DIR = REPO_ROOT / "logs"
TAGEDITOR_ROOT = REPO_ROOT / "mikazuki" / "dataset-tag-editor"
TAGEDITOR_LAUNCH = TAGEDITOR_ROOT / "scripts" / "launch.py"
DEFAULT_TAGEDITOR_PORT = 28001
TAGEDITOR_FALLBACK_PORT_RANGE_END = DEFAULT_TAGEDITOR_PORT + 20
TAGEDITOR_PORT = DEFAULT_TAGEDITOR_PORT

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

TAGEDITOR_STATUS_FILE = REPO_ROOT / "tmp" / "tageditor_status.json"
BACKEND_STATUS_FILE = REPO_ROOT / "tmp" / "backend_status.json"
PROJECT_LOCAL_MAIN_PYTHON_ROOTS = [path.resolve() for path in get_project_local_main_python_roots(REPO_ROOT)]
DEDICATED_TAGEDITOR_PYTHONS = get_tageditor_python_candidates(REPO_ROOT)
TAGEDITOR_REQUIRED_MODULES = ["gradio", "transformers", "timm", "print_color"]


def write_tageditor_status(status: str, detail: str = ""):
    status_dir = TAGEDITOR_STATUS_FILE.parent
    status_dir.mkdir(parents=True, exist_ok=True)
    with open(TAGEDITOR_STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump({"status": status, "detail": detail}, f, ensure_ascii=False)


def path_is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def using_project_local_main_python() -> bool:
    executable = Path(sys.executable).resolve()
    return any(path_is_within(executable, root) for root in PROJECT_LOCAL_MAIN_PYTHON_ROOTS)


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
        "Launch it via run_gui.ps1/run_gui.sh after preparing one of the supported runtime folders under ./env/ (preferred) or the repo root: "
        "./python, ./python_blackwell, ./python_xpu_intel, ./python_xpu_intel_sage, ./python_rocm_amd, ./python_sagebwd_nvidia, ./python-sageattention, or ./venv. "
        "Legacy ./python-sagebwd-nvidia and ./python_sageattention folders are also accepted in either location. "
        "For development only, set MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 to override this guard intentionally."
    )


@catch_exception
def iter_tensorboard_python_candidates():
    seen = set()

    def register(candidate):
        if candidate is None:
            return
        path = Path(candidate)
        try:
            resolved = path.resolve()
        except Exception:
            resolved = path
        if not resolved.exists():
            return
        key = str(resolved).lower()
        if key in seen:
            return
        seen.add(key)
        yield str(resolved)

    yield from register(sys.executable)

    for runtime_root in PROJECT_LOCAL_MAIN_PYTHON_ROOTS:
        for candidate in (
            runtime_root / "python.exe",
            runtime_root / "Scripts" / "python.exe",
            runtime_root / "bin" / "python",
        ):
            yield from register(candidate)

    for candidate in DEDICATED_TAGEDITOR_PYTHONS:
        yield from register(candidate)


def python_supports_tensorboard(python_exe: str) -> bool:
    try:
        result = subprocess.run(
            [
                python_exe,
                "-c",
                "import tensorboard.main",
            ],
            cwd=REPO_ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        return result.returncode == 0
    except Exception:
        return False


def resolve_tensorboard_python():
    for python_exe in iter_tensorboard_python_candidates():
        if python_supports_tensorboard(python_exe):
            source = "current runtime" if Path(python_exe).resolve() == Path(sys.executable).resolve() else "fallback runtime"
            return python_exe, source
    return None, ""


def run_tensorboard():
    tensorboard_python, runtime_source = resolve_tensorboard_python()
    if not tensorboard_python:
        log.warning(
            "TensorBoard is not installed in the current runtime or any project-local fallback runtime. "
            "Run install.ps1 or the dedicated runtime installer again if you need the built-in TensorBoard page."
        )
        return

    tensorboard_log_dir = LOG_DIR / "launcher"
    tensorboard_log_dir.mkdir(parents=True, exist_ok=True)
    tensorboard_log_path = tensorboard_log_dir / f"tensorboard-{int(time.time())}.log"
    log.info(f"Starting tensorboard with {tensorboard_python} ({runtime_source}). Log: {tensorboard_log_path}")
    tb_log = open(tensorboard_log_path, "a", encoding="utf-8")
    process = subprocess.Popen(
        [
            tensorboard_python,
            "-m",
            "tensorboard.main",
            "--logdir",
            str(LOG_DIR),
            "--host",
            args.tensorboard_host,
            "--port",
            str(args.tensorboard_port),
        ],
        cwd=REPO_ROOT,
        stdout=tb_log,
        stderr=subprocess.STDOUT,
    )
    tb_log.close()
    return process


def update_tageditor_status(status: str, detail: str = "") -> None:
    os.environ["MIKAZUKI_TAGEDITOR_STATUS"] = status
    write_tageditor_status(status, detail)


def resolve_tag_editor_python():
    dedicated_python = next((path for path in DEDICATED_TAGEDITOR_PYTHONS if path.exists()), None)
    if dedicated_python is not None:
        return str(dedicated_python), "dedicated", ""

    runtime_name = infer_runtime_environment_name()
    if is_amd_rocm_runtime(runtime_name) or is_intel_xpu_runtime(runtime_name):
        runtime_label = "AMD ROCm" if is_amd_rocm_runtime(runtime_name) else "Intel XPU"
        detail = (
            f"Dedicated tag editor runtime required for {runtime_label} experimental mode. "
            "Run install_tageditor.ps1 (Windows) or install_tageditor.sh (Linux) to prepare env/python_tageditor, env/venv-tageditor, or the legacy root folders.\n"
            f"{runtime_label} 实验运行时下，标签编辑器需要单独的运行时。"
            "请运行 install_tageditor.ps1（Windows）或 install_tageditor.sh（Linux）准备 env/python_tageditor、env/venv-tageditor，或旧的根目录运行时。"
        )
        return None, "dedicated_runtime_required", detail

    missing_modules = [name for name in TAGEDITOR_REQUIRED_MODULES if importlib.util.find_spec(name) is None]
    if missing_modules:
        return None, "missing_dependencies", f"Missing modules: {', '.join(missing_modules)}"

    return sys.executable, "main", ""


@catch_exception
def run_tag_editor():
    if not TAGEDITOR_LAUNCH.exists():
        log.warning("tag editor launcher is missing, skip starting tag editor.")
        update_tageditor_status("missing_launcher", "Tag editor launcher is missing.")
        return

    python_exe, runtime_kind, detail = resolve_tag_editor_python()
    if python_exe is None:
        if runtime_kind == "missing_dependencies":
            log.warning(
                "tag editor dependencies are missing (%s), run install_tageditor.ps1 (Windows) or install_tageditor.sh (Linux) first.",
                detail.removeprefix("Missing modules: "),
            )
        else:
            log.warning("tag editor startup skipped: %s", detail)
        update_tageditor_status(runtime_kind, detail)
        return

    os.environ["MIKAZUKI_TAGEDITOR_RUNTIME"] = runtime_kind
    log.info("Starting tageditor...")
    update_tageditor_status("starting", f"Launching tag editor subprocess on port {TAGEDITOR_PORT}...")
    cmd = [
        python_exe,
        TAGEDITOR_LAUNCH,
        "--port", str(TAGEDITOR_PORT),
        "--shadow-gradio-output",
        "--root-path", "/proxy/tageditor"
    ]
    localization = args.localization or "zh-Hans"
    cmd.extend(["--localization", localization])
    subprocess.Popen(cmd, cwd=TAGEDITOR_ROOT)


def apply_listen_host_overrides() -> None:
    if args.listen:
        args.host = "0.0.0.0"
        args.tensorboard_host = "0.0.0.0"


def resolve_server_port() -> None:
    if check_port_avaliable(args.port):
        return

    avaliable = find_avaliable_ports(30000, 30000 + 20)
    if avaliable:
        args.port = avaliable
    else:
        log.error("port finding fallback error")


def resolve_tag_editor_port() -> None:
    global TAGEDITOR_PORT

    if check_port_avaliable(DEFAULT_TAGEDITOR_PORT):
        TAGEDITOR_PORT = DEFAULT_TAGEDITOR_PORT
        return

    fallback_port = find_avaliable_ports(DEFAULT_TAGEDITOR_PORT + 1, TAGEDITOR_FALLBACK_PORT_RANGE_END + 1)
    if fallback_port is None:
        TAGEDITOR_PORT = DEFAULT_TAGEDITOR_PORT
        log.warning(
            "Tag editor default port %s is already in use and no fallback port was found in %s-%s.",
            DEFAULT_TAGEDITOR_PORT,
            DEFAULT_TAGEDITOR_PORT + 1,
            TAGEDITOR_FALLBACK_PORT_RANGE_END,
        )
        return

    TAGEDITOR_PORT = fallback_port
    log.warning(
        "Tag editor default port %s is already in use. Falling back to port %s for this launch.",
        DEFAULT_TAGEDITOR_PORT,
        TAGEDITOR_PORT,
    )
    log.warning(
        "标签编辑器默认端口 %s 已被占用，本次启动将改用端口 %s。",
        DEFAULT_TAGEDITOR_PORT,
        TAGEDITOR_PORT,
    )


def apply_runtime_environment() -> None:
    os.environ["MIKAZUKI_HOST"] = args.host
    os.environ["MIKAZUKI_PORT"] = str(args.port)
    os.environ["MIKAZUKI_TENSORBOARD_HOST"] = args.tensorboard_host
    os.environ["MIKAZUKI_TENSORBOARD_PORT"] = str(args.tensorboard_port)
    os.environ["MIKAZUKI_TAGEDITOR_HOST"] = "127.0.0.1"
    os.environ["MIKAZUKI_TAGEDITOR_PORT"] = str(TAGEDITOR_PORT)
    os.environ["MIKAZUKI_DEV"] = "1" if args.dev else "0"
    os.environ["MIKAZUKI_TAGEDITOR_STATUS_FILE"] = str(TAGEDITOR_STATUS_FILE)
    os.environ[BACKEND_STATUS_FILE_ENV] = str(BACKEND_STATUS_FILE)


def initialize_launch_statuses() -> None:
    write_backend_status("starting", "后端启动中，正在加载运行环境与前端资源。")
    if args.disable_tageditor:
        update_tageditor_status("disabled", "Tag editor is disabled for this launch.")
    else:
        update_tageditor_status("queued", "Tag editor will be started shortly.")


def start_optional_services() -> None:
    if not args.disable_tageditor:
        run_tag_editor()

    if not args.disable_tensorboard:
        run_tensorboard()


def launch():
    ensure_project_local_main_python()
    log.info(f"Starting {APP_NAME} Mikazuki GUI...")
    log.info(f"Base directory: {REPO_ROOT}, Working directory: {os.getcwd()}")
    log.info(f"{platform.system()} Python {platform.python_version()} {sys.executable}")

    apply_listen_host_overrides()

    if not args.skip_prepare_environment:
        prepare_environment(
            disable_auto_mirror=args.disable_auto_mirror,
            prepare_onnxruntime=not args.skip_prepare_onnxruntime,
        )

    try:
        from mikazuki.utils.runtime_import_guards import install_experimental_runtime_import_guards

        install_experimental_runtime_import_guards()
    except Exception:
        pass

    resolve_server_port()
    resolve_tag_editor_port()

    git_version = git_tag(REPO_ROOT)
    version_suffix = f" ({git_version})" if git_version != "<none>" else ""
    log.info(f"{APP_NAME} Version: {APP_VERSION}{version_suffix}")

    apply_runtime_environment()
    initialize_launch_statuses()
    start_optional_services()

    import uvicorn
    log.info(f"Server started at http://{args.host}:{args.port}")
    uvicorn.run("mikazuki.app:app", host=args.host, port=args.port, log_level="error", reload=args.dev)


if __name__ == "__main__":
    args, _ = parser.parse_known_args()
    launch()
