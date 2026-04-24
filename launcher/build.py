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

    PyInstaller.__main__.run([
        str(LAUNCHER_DIR / "main.py"),
        "--name=SD-reScripts-Launcher",
        "--onefile",
        "--windowed",
        f"--add-data={LAUNCHER_DIR / 'i18n'};i18n",
        f"--add-data={LAUNCHER_DIR / 'assets'};assets",
        "--hidden-import=customtkinter",
        "--hidden-import=PIL._tkinter_finder",
        "--clean",
        "--noconfirm",
        f"--distpath={PROJECT_ROOT / 'dist'}",
        f"--workpath={PROJECT_ROOT / 'build'}",
        f"--specpath={PROJECT_ROOT}",
    ] + icon_args)

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
