"""Build script — package the launcher as a single EXE using PyInstaller."""

import shutil
import sys
from pathlib import Path

import PyInstaller.__main__

LAUNCHER_DIR = Path(__file__).parent
PROJECT_ROOT = LAUNCHER_DIR.parent

EXCLUDED_MODULES = [
    "torch",
    "torchvision",
    "torchaudio",
    "transformers",
    "diffusers",
    "xformers",
    "tensorflow",
    "tensorboard",
    "pandas",
    "numpy",
    "scipy",
    "matplotlib",
    "sklearn",
    "onnxruntime",
    "cv2",
]


def build():
    print(f"[Launcher Build] Python: {sys.executable}")
    icon_path = LAUNCHER_DIR / "assets" / "icon.ico"
    if not icon_path.exists():
        fallback_icon = LAUNCHER_DIR / "assets" / "favicon.ico"
        if fallback_icon.exists():
            icon_path = fallback_icon
    icon_args = [f"--icon={icon_path}"] if icon_path.exists() else []

    # Web dist directory (built React SPA)
    web_dist = LAUNCHER_DIR / "web" / "dist"

    # Collect all launcher submodules as hidden imports
    hidden_imports = [
        "--hidden-import=webview",
        "--hidden-import=launcher",
        "--hidden-import=launcher.main",
        "--hidden-import=launcher.config",
        "--hidden-import=launcher.i18n",
        "--hidden-import=launcher.api",
        "--hidden-import=launcher.window",
        "--hidden-import=launcher.core",
        "--hidden-import=launcher.core.launcher",
        "--hidden-import=launcher.core.installer",
        "--hidden-import=launcher.core.runtime_detector",
        "--hidden-import=launcher.core.settings",
        "--hidden-import=launcher.core.plugins",
        "--hidden-import=launcher.core.gpu",
        "--hidden-import=launcher.core.preflight",
        "--hidden-import=launcher.core.recommendation",
        "--hidden-import=launcher.core.api_result",
        "--hidden-import=launcher.core.compatibility",
        "--hidden-import=launcher.core.diagnostics",
        "--hidden-import=launcher.core.task_history_store",
        "--hidden-import=launcher.core.runtime_coordinator",
        "--hidden-import=launcher.core.runtime_catalog",
        "--hidden-import=launcher.core.runtime_tasks",
        "--hidden-import=launcher.core.task_executor",
        "--hidden-import=launcher.core.task_state",
        "--hidden-import=launcher.core.task_plans",
        "--hidden-import=launcher.core.update_checker",
        "--hidden-import=launcher.core.versioning",
    ]
    exclude_args = [f"--exclude-module={name}" for name in EXCLUDED_MODULES]

    args = [
        str(LAUNCHER_DIR / "main.py"),
        "--name=SD-reScripts-Launcher",
        "--onefile",
        "--windowed",
        f"--add-data={LAUNCHER_DIR / 'i18n'};launcher/i18n",
        f"--add-data={LAUNCHER_DIR / 'assets'};launcher/assets",
        f"--paths={PROJECT_ROOT}",
    ] + hidden_imports + exclude_args + icon_args + [
        "--clean",
        "--noconfirm",
        f"--distpath={PROJECT_ROOT / 'dist'}",
        f"--workpath={PROJECT_ROOT / 'build'}",
        f"--specpath={PROJECT_ROOT}",
    ]

    # Include web dist if it exists
    if web_dist.exists():
        args.append(f"--add-data={web_dist};launcher/web/dist")

    PyInstaller.__main__.run(args)

    # Copy the EXE to project root for convenience
    exe_src = PROJECT_ROOT / "dist" / "SD-reScripts-Launcher.exe"
    exe_dst = PROJECT_ROOT / "SD-reScripts-Launcher.exe"
    if exe_src.exists():
        try:
            shutil.copy2(str(exe_src), str(exe_dst))
            print(f"\nCopied: {exe_src} -> {exe_dst}")
            print(f"Ready to use: double-click {exe_dst}")
        except PermissionError:
            print(f"\nBuild succeeded, but {exe_dst} is currently in use and could not be overwritten.")
            print(f"Close the running launcher, then copy this file manually: {exe_src}")
    else:
        print(f"\nWarning: {exe_src} not found. Build may have failed.")


if __name__ == "__main__":
    build()
