from collections import namedtuple
import builtins
import json
import mimetypes
import os
from pathlib import Path
import signal
import sys
import time
import tempfile

from PIL import PngImagePlugin, Image

import gradio as gr
import gradio.routes
import gradio.utils

from dte_instance import dte_instance

import tab_main, tab_settings, cmd_args, utilities, logger, launch, settings
import paths
from shared_state import state


# ================================================================
# brought from AUTOMATIC1111/stable-diffusion-webui and modified


mimetypes.init()
mimetypes.add_type("application/javascript", ".js")

Savedfile = namedtuple("Savedfile", ["name"])
GradioTemplateResponseOriginal = gradio.routes.templates.TemplateResponse
git = "git"
stored_commit_hash = None
interface = None
STATUS_FILE = os.environ.get("MIKAZUKI_TAGEDITOR_STATUS_FILE", "")


def write_status(status: str, detail: str = ""):
    if not STATUS_FILE:
        return
    try:
        os.makedirs(os.path.dirname(STATUS_FILE), exist_ok=True)
        with open(STATUS_FILE, "w", encoding="utf-8") as f:
            json.dump({"status": status, "detail": detail}, f, ensure_ascii=False)
    except Exception:
        pass


def normalize_allowed_path(path: str | Path | None) -> str | None:
    if path is None:
        return None

    normalized = str(path).strip()
    if not normalized:
        return None

    try:
        return str(Path(normalized).expanduser().resolve())
    except Exception:
        return str(Path(normalized).expanduser().absolute())


def collect_allowed_paths() -> list[str]:
    allowed_paths: list[str] = []
    seen: set[str] = set()

    def add_path(path: str | Path | None):
        normalized = normalize_allowed_path(path)
        if not normalized or normalized in seen:
            return
        seen.add(normalized)
        allowed_paths.append(normalized)

    raw_allowed_paths = settings.current.allowed_paths.replace("\n", ",")
    for path in raw_allowed_paths.split(","):
        add_path(path)

    add_path(utilities.base_dir_path())
    add_path(state.temp_dir)

    try:
        general_cfg = tab_main.read_general_config()
        add_path(general_cfg.dataset_dir)
    except Exception as exc:
        logger.warn(f"Cannot read dataset directory from tag editor config: {exc}")

    return allowed_paths


def patch_gradio_schema_compat():
    try:
        from gradio_client import utils as client_utils
    except Exception:
        return

    if getattr(client_utils, "_mikazuki_bool_schema_patch", False):
        return

    original_json_schema_to_python_type = client_utils.json_schema_to_python_type
    original_internal_json_schema_to_python_type = client_utils._json_schema_to_python_type

    def _patched_internal_json_schema_to_python_type(schema, defs=None):
        # Pydantic may emit boolean schema nodes such as
        # `additionalProperties: false`, which older gradio-client versions
        # do not handle when building the API info page.
        if isinstance(schema, bool):
            return "Any"
        return original_internal_json_schema_to_python_type(schema, defs)

    def _patched_json_schema_to_python_type(schema):
        if isinstance(schema, bool):
            return "Any"
        return original_json_schema_to_python_type(schema)

    client_utils._json_schema_to_python_type = _patched_internal_json_schema_to_python_type
    client_utils.json_schema_to_python_type = _patched_json_schema_to_python_type
    client_utils._mikazuki_bool_schema_patch = True
    logger.warn("Applied Gradio JSON schema compatibility patch for boolean schema nodes.")


def shadow_gradio_print():
    import traceback

    original_print = builtins.print

    def _print(*args, **kwargs):
        stack = "".join(traceback.format_stack())
        if "gradio" in stack.lower():
            return
        original_print(*args, **kwargs)

    builtins.print = _print


def cleanup_tmpdr():
    if not state.temp_dir or not state.temp_dir.is_dir():
        return

    for p in state.temp_dir.glob("**/*.png"):
        if p.is_file():
            os.remove(p)


def register_tmp_file(gradio: gr.Blocks, filename):
    if hasattr(gradio, "temp_file_sets"):  # gradio >=3.15
        gradio.temp_file_sets[0] = gradio.temp_file_sets[0] | {
            os.path.abspath(filename)
        }


def save_pil_to_cache(pil_image: Image.Image, *args, **kwargs):
    already_saved_as = getattr(pil_image, "already_saved_as", None)
    if already_saved_as and os.path.isfile(already_saved_as):
        register_tmp_file(interface, already_saved_as)
        return str(Path(already_saved_as).resolve())
    
    tmpdir = state.temp_dir
    use_metadata = False
    metadata = PngImagePlugin.PngInfo()
    for key, value in pil_image.info.items():
        if isinstance(key, str) and isinstance(value, str):
            metadata.add_text(key, value)
            use_metadata = True

    if tmpdir:
        if not tmpdir.is_dir():
            tmpdir.mkdir(parents=True)
        file_obj = tempfile.NamedTemporaryFile(delete=False, suffix=".png", dir=tmpdir)
    else:
        file_obj = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    pil_image.save(file_obj, pnginfo=(metadata if use_metadata else None))

    pil_image.already_saved_as = file_obj.name
    register_tmp_file(interface, file_obj.name)
    
    return file_obj.name


def save_file_to_cache_nocache(file_path: str | Path, cache_dir: str) -> str:
    resolved_path = str(Path(file_path).resolve())
    if os.path.isfile(resolved_path):
        register_tmp_file(interface, resolved_path)
    return resolved_path


def save_file_to_cache_cacheonce(file_path: str | Path, cache_dir: str) -> str:
    """Returns a temporary file path for a copy of the given file path if it does
    not already exist. Otherwise returns the path to the existing temp file."""
    import hashlib
    filename = hashlib.md5(file_path.encode()).hexdigest()
    temp_dir = Path(cache_dir)
    temp_dir.mkdir(exist_ok=True, parents=True)
    
    from gradio_client import utils as client_utils
    import shutil

    filename = client_utils.strip_invalid_filename_characters(filename)
    full_temp_file_path = str(Path(temp_dir / filename).resolve())

    if not Path(full_temp_file_path).exists():
        shutil.copy2(file_path, full_temp_file_path)

    register_tmp_file(interface, full_temp_file_path)
    return full_temp_file_path


def webpath(fn: Path):
    path = str(fn.absolute()).replace("\\", "/")
    return f"file={path}?{os.path.getmtime(fn)}"


def read_localization():
    with open(utilities.base_dir_path() / "javascript" / "zh-Hans.json", "r", encoding="utf-8") as f:
        return f.read()


def javascript_html():
    js_path = utilities.base_dir_path() / "javascript"
    head = ""
    if cmd_args.opts.localization == "zh-Hans":
        head += f'<script type="text/javascript">var localization = {read_localization()}</script>\n'
    for p in sorted(js_path.glob("*.js")):
        if not p.is_file():
            continue
        head += f'<script type="text/javascript" src="{webpath(p)}"></script>\n'

    return head


def css_html():
    css_path = utilities.base_dir_path() / "css"
    head = ""

    for p in sorted(css_path.glob("*.css")):
        if not p.is_file():
            continue
        head += f'<link rel="stylesheet" property="stylesheet" href="{webpath(p)}">'

    return head


def reload_javascript():
    js = javascript_html()
    css = css_html()

    def template_response(*args, **kwargs):
        res = GradioTemplateResponseOriginal(*args, **kwargs)
        res.body = res.body.replace(b"</head>", f"{js}</head>".encode("utf8"))
        res.body = res.body.replace(b"</body>", f"{css}</body>".encode("utf8"))
        res.init_headers()
        return res

    gradio.routes.templates.TemplateResponse = template_response


def commit_hash():
    global stored_commit_hash

    if stored_commit_hash is not None:
        return stored_commit_hash

    try:
        command = f'cd "{utilities.base_dir()}" & {git} rev-parse HEAD'
        result = launch.run(command)
        stored_commit_hash = result.stdout.decode("utf-8").strip()
    except Exception:
        stored_commit_hash = "<none>"

    return stored_commit_hash


def versions_html():
    import torch

    python_version = ".".join([str(x) for x in sys.version_info[0:3]])
    commit = commit_hash()
    short_commit = commit[0:8]

    return f"""
python: <span title="{sys.version}">{python_version}</span>
 • 
torch: {getattr(torch, '__long_version__',torch.__version__)}
 • 
gradio: {gr.__version__}
 • 
commit: <a href="https://github.com/toshiaki1729/dataset-tag-editor-standalone/commit/{commit}">{short_commit}</a>
"""


def create_ui():
    reload_javascript()

    with gr.Blocks(analytics_enabled=False, title="Dataset Tag Editor") as gui:
        with gr.Tab("Main"):
            tab_main.on_ui_tabs()
        with gr.Tab("Settings"):
            tab_settings.on_ui_tabs()

        gr.Textbox(elem_id="ui_created", value="", visible=False)

        footer = f'<div class="versions">{versions_html()}</div>'
        gr.HTML(footer, elem_id="footer")
    return gui


def wait_on_server():
    global interface
    while True:
        time.sleep(0.5)
        if state.need_restart:
            state.need_restart = False
            if interface:
                time.sleep(0.25)
                interface.close()
                time.sleep(0.25)
            break


def ensure_gradio_localhost_no_proxy():
    entries = []
    seen = set()

    for key in ("NO_PROXY", "no_proxy"):
        current = os.environ.get(key, "")
        for item in current.split(","):
            item = item.strip()
            if not item:
                continue
            lowered = item.lower()
            if lowered in seen:
                continue
            seen.add(lowered)
            entries.append(item)

    changed = False
    for host in ("127.0.0.1", "localhost", "::1"):
        lowered = host.lower()
        if lowered not in seen:
            entries.append(host)
            seen.add(lowered)
            changed = True

    merged = ",".join(entries)
    for key in ("NO_PROXY", "no_proxy"):
        if os.environ.get(key) != merged:
            os.environ[key] = merged
            changed = True

    return merged, changed


def build_launch_kwargs(allowed_paths, server_name_override=None):
    server_name = server_name_override
    if server_name is None:
        server_name = cmd_args.opts.server_name
    if not server_name:
        server_name = "127.0.0.1"

    return {
        "server_port": cmd_args.opts.port,
        "server_name": server_name,
        "share": cmd_args.opts.share,
        "auth": [tuple(cred.split(":")) for cred in cmd_args.opts.auth]
        if cmd_args.opts.auth
        else None,
        "ssl_keyfile": cmd_args.opts.tls_key,
        "ssl_certfile": cmd_args.opts.tls_cert,
        "debug": cmd_args.opts.gradio_debug,
        "prevent_thread_lock": True,
        "allowed_paths": allowed_paths,
        "root_path": cmd_args.opts.root_path or None,
    }


def launch_interface_with_localhost_fallback(allowed_paths):
    global interface

    _, proxy_updated = ensure_gradio_localhost_no_proxy()
    if proxy_updated:
        logger.warn("Added localhost / 127.0.0.1 to NO_PROXY for Gradio local launch compatibility.")
        logger.warn("已将 localhost / 127.0.0.1 加入 NO_PROXY，以提高 Gradio 本地启动兼容性。")

    launch_kwargs = build_launch_kwargs(allowed_paths)
    try:
        return interface.launch(**launch_kwargs)
    except ValueError as exc:
        error_text = str(exc)
        if "localhost is not accessible" not in error_text.lower():
            write_status("failed", error_text)
            raise

        write_status("starting_server", "Localhost probe failed, retrying with 127.0.0.1 and NO_PROXY bypass...")
        logger.warn("Gradio localhost probe failed. Retrying tag editor launch with server_name=127.0.0.1.")
        logger.warn("Gradio 的 localhost 探测失败，正在改用 server_name=127.0.0.1 重试标签编辑器。")

        try:
            interface.close()
            time.sleep(0.25)
        except Exception:
            pass

        retry_kwargs = build_launch_kwargs(allowed_paths, server_name_override="127.0.0.1")
        try:
            return interface.launch(**retry_kwargs)
        except Exception as retry_exc:
            retry_text = str(retry_exc)
            write_status("failed", retry_text)
            logger.error(
                "Tag editor retry still failed. Make sure localhost / 127.0.0.1 bypasses proxy, "
                "or launch with --share if internet sharing is acceptable."
            )
            logger.error(
                "标签编辑器重试后仍然失败。请确认 localhost / 127.0.0.1 不走系统代理；"
                "若可以接受公网分享，再手动使用 --share 启动。"
            )
            raise


# ================================================================


def main():
    global interface

    def sigint_handler(sig, frame):
        print(f"Interrupted with signal {sig} in {frame}")
        os._exit(0)

    signal.signal(signal.SIGINT, sigint_handler)

    if cmd_args.opts.shadow_gradio_output:
        shadow_gradio_print()

    while True:
        state.begin()
        write_status("loading_settings", "Loading tag editor settings...")
        patch_gradio_schema_compat()
        
        settings.load()
        paths.paths = paths.Paths()

        state.temp_dir = (utilities.base_dir_path() / "temp").absolute()
        if settings.current.use_temp_files and settings.current.temp_directory != "":
            state.temp_dir = Path(settings.current.temp_directory)
        
        os.environ['GRADIO_TEMP_DIR'] = str(state.temp_dir)
        
        # override save function to prevent from making anonying temporaly files
        gr.gradio.processing_utils.save_pil_to_cache = save_pil_to_cache

        if settings.current.use_temp_files:
            gr.gradio.processing_utils.save_file_to_cache = save_file_to_cache_cacheonce
        else:
            gr.gradio.processing_utils.save_file_to_cache = save_file_to_cache_nocache

        if settings.current.cleanup_tmpdir:
            cleanup_tmpdr()

        write_status("loading_interrogators", "Loading interrogator registry...")
        dte_instance.load_interrogators()

        write_status("building_ui", "Building Gradio blocks...")
        interface = create_ui().queue(64)

        allowed_paths = collect_allowed_paths()
        logger.write(f"Gradio allowed_paths = {allowed_paths}")
        write_status("starting_server", "Starting Gradio server on port 28001...")
        app, _, _ = launch_interface_with_localhost_fallback(allowed_paths)
        write_status("ready", "Tag editor service is ready.")

        # Disable a very open middleware as Stable Diffusion web UI does
        app.user_middleware = [
            x for x in app.user_middleware if x.cls.__name__ != "CORSMiddleware"
        ]

        wait_on_server()
        logger.write("Restarting UI...")
