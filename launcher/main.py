"""Entry point for the SD-reScripts Launcher."""

import sys
import os

# When running as a PyInstaller bundle, _MEIPASS points to the temp extract dir.
# Otherwise, add the project root so that `launcher.xxx` imports work
# whether we run from the project root or from the launcher/ directory.
if getattr(sys, 'frozen', False):
    _root = os.path.dirname(sys.executable)
else:
    _launcher_dir = os.path.dirname(os.path.abspath(__file__))
    _root = os.path.dirname(_launcher_dir)
if _root not in sys.path:
    sys.path.insert(0, _root)


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
