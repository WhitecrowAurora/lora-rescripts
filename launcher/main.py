"""Entry point for the SD-reScripts Launcher."""

import sys
import os

# Add the project root to sys.path so that `launcher.xxx` imports work
# whether we run from the project root or from the launcher/ directory.
_launcher_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_launcher_dir)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)
if _launcher_dir not in sys.path:
    sys.path.insert(0, _launcher_dir)


def main():
    import customtkinter as ctk
    from launcher.app import App

    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("dark-blue")

    app = App()
    app.protocol("WM_DELETE_WINDOW", app._on_close)
    app.mainloop()


if __name__ == "__main__":
    main()
