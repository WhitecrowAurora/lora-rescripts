"""Build script — package the launcher as a single EXE using PyInstaller."""

import PyInstaller.__main__
import os
import sys
from pathlib import Path

LAUNCHER_DIR = Path(__file__).parent
PROJECT_ROOT = LAUNCHER_DIR.parent


def build():
    icon_path = LAUNCHER_DIR / "assets" / "icon.ico"
    icon_args = [f"--icon={icon_path}"] if icon_path.exists() else []

    # Collect all launcher submodules as hidden imports
    hidden_imports = [
        "--hidden-import=customtkinter",
        "--hidden-import=PIL._tkinter_finder",
        "--hidden-import=launcher",
        "--hidden-import=launcher.app",
        "--hidden-import=launcher.config",
        "--hidden-import=launcher.i18n",
        "--hidden-import=launcher.main",
        "--hidden-import=launcher.assets",
        "--hidden-import=launcher.assets.style",
        "--hidden-import=launcher.core",
        "--hidden-import=launcher.core.launcher",
        "--hidden-import=launcher.core.installer",
        "--hidden-import=launcher.core.runtime_detector",
        "--hidden-import=launcher.core.settings",
        "--hidden-import=launcher.ui",
        "--hidden-import=launcher.ui.sidebar",
        "--hidden-import=launcher.ui.launch_page",
        "--hidden-import=launcher.ui.runtime_page",
        "--hidden-import=launcher.ui.advanced_page",
        "--hidden-import=launcher.ui.install_page",
        "--hidden-import=launcher.ui.extension_page",
        "--hidden-import=launcher.ui.console_page",
        "--hidden-import=launcher.ui.about_page",
        "--hidden-import=launcher.ui.icons",
        "--hidden-import=launcher.ui.animations",
    ]

    PyInstaller.__main__.run([
        str(LAUNCHER_DIR / "main.py"),
        "--name=SD-reScripts-Launcher",
        "--onefile",
        "--windowed",
        f"--add-data={LAUNCHER_DIR / 'i18n'};launcher/i18n",
        f"--add-data={LAUNCHER_DIR / 'assets'};launcher/assets",
        f"--paths={PROJECT_ROOT}",
    ] + hidden_imports + icon_args + [
        "--clean",
        "--noconfirm",
        f"--distpath={PROJECT_ROOT / 'dist'}",
        f"--workpath={PROJECT_ROOT / 'build'}",
        f"--specpath={PROJECT_ROOT}",
    ])

    # Copy the EXE to project root for convenience
    exe_src = PROJECT_ROOT / "dist" / "SD-reScripts-Launcher.exe"
    exe_dst = PROJECT_ROOT / "SD-reScripts-Launcher.exe"
    if exe_src.exists():
        import shutil
        shutil.copy2(str(exe_src), str(exe_dst))
        print(f"\nCopied: {exe_src} -> {exe_dst}")
        print(f"Ready to use: double-click {exe_dst}")
    else:
        print(f"\nWarning: {exe_src} not found. Build may have failed.")


if __name__ == "__main__":
    build()
