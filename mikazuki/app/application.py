import asyncio
import mimetypes
import os
import sys
import webbrowser
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse

from mikazuki.app.config import app_config
from mikazuki.app.api import load_schemas, load_presets
from mikazuki.app.api import router as api_router
from mikazuki.app.aesthetic_labeling_api import router as aesthetic_labeling_router
# from mikazuki.app.ipc import router as ipc_router
from mikazuki.app.proxy import router as proxy_router
from mikazuki.plugins.runtime import plugin_runtime
from mikazuki.utils.devices import check_torch_gpu
from mikazuki.utils.frontend_profiles import BUILTIN_PROFILE_ID, resolve_frontend_profile
from mikazuki.utils.backend_status import write_backend_status

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")


def _get_requested_ui_profile_id() -> str:
    env_profile = os.environ.get("MIKAZUKI_UI_PROFILE", "").strip()
    if env_profile:
        return env_profile
    return str(app_config["active_ui_profile"] or BUILTIN_PROFILE_ID)


def _get_current_frontend_profile() -> dict:
    requested_profile_id = _get_requested_ui_profile_id()
    profile = resolve_frontend_profile(requested_profile_id)
    entry_dir = Path(profile["entry_dir"]).resolve()
    entry_file = str(profile.get("entry_file") or "index.html")
    if (entry_dir / entry_file).exists():
        return profile
    return resolve_frontend_profile(BUILTIN_PROFILE_ID)


def _resolve_frontend_file(request_path: str) -> Path:
    profile = _get_current_frontend_profile()
    root_dir = Path(profile["entry_dir"]).resolve()
    entry_file = str(profile.get("entry_file") or "index.html")
    normalized = request_path.strip("/")

    if not normalized:
        return root_dir / entry_file

    candidate = (root_dir / normalized).resolve()
    try:
        candidate.relative_to(root_dir)
    except ValueError:
        return root_dir / entry_file

    if candidate.exists() and candidate.is_file():
        return candidate

    return root_dir / entry_file


async def app_startup():
    write_backend_status("loading", "正在加载配置、数据结构与运行时信息。")
    app_config.load_config()
    plugin_runtime.initialize_from_config(app_config)

    await load_schemas()
    await load_presets()
    await asyncio.to_thread(check_torch_gpu)
    plugin_runtime.emit_event(
        "on_app_start",
        {
            "active_ui_profile": _get_requested_ui_profile_id(),
            "plugin_developer_mode": bool(app_config["plugin_developer_mode"]),
        },
        source="app_startup",
    )
    write_backend_status("ready", "后端已就绪。")

    if sys.platform == "win32" and os.environ.get("MIKAZUKI_DEV", "0") != "1":
        browser_host = os.environ.get("MIKAZUKI_HOST", "127.0.0.1")
        if browser_host == "0.0.0.0":
            browser_host = "127.0.0.1"
        webbrowser.open(f'http://{browser_host}:{os.environ["MIKAZUKI_PORT"]}')


@asynccontextmanager
async def lifespan(app: FastAPI):
    await app_startup()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(proxy_router)


cors_config = os.environ.get("MIKAZUKI_APP_CORS", "")
if cors_config != "":
    if cors_config == "1":
        cors_config = ["http://localhost:8004", "*"]
    else:
        cors_config = cors_config.split(";")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_config,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.middleware("http")
async def add_cache_control_header(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "max-age=0"
    return response

app.include_router(api_router, prefix="/api")
app.include_router(aesthetic_labeling_router, prefix="/api")
# app.include_router(ipc_router, prefix="/ipc")


@app.get("/")
async def index():
    return FileResponse(_resolve_frontend_file(""))


@app.get("/index.md")
@app.get("/index.html")
async def home_alias():
    return RedirectResponse(url="/", status_code=307)


@app.get("/workspace")
@app.get("/workspace/")
async def workspace_index():
    return RedirectResponse(url="/", status_code=307)


@app.get("/favicon.ico", response_class=FileResponse)
async def favicon():
    return FileResponse("assets/favicon.ico")


@app.get("/{full_path:path}")
async def frontend_static(full_path: str):
    return FileResponse(_resolve_frontend_file(full_path))
