import os
import subprocess
from mikazuki.log import log
try:
    import tkinter
    from tkinter.filedialog import askdirectory, askopenfilename
except ImportError:
    tkinter = None
    askdirectory = None
    askopenfilename = None
    log.warning("tkinter not found, falling back to Windows native file dialogs.")

last_dir = ""


def tk_window():
    window = tkinter.Tk()
    window.wm_attributes('-topmost', 1)
    window.withdraw()


def _run_powershell_dialog(script: str) -> str:
    try:
        completed = subprocess.run(
            ["powershell.exe", "-STA", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            check=False,
        )
        if completed.returncode != 0:
            log.warning(f"PowerShell dialog failed: {completed.stderr.strip()}")
            return ""
        return completed.stdout.strip()
    except Exception as e:
        log.warning(f"PowerShell dialog exception: {e}")
        return ""


def _quote_pwsh_string(value: str) -> str:
    return value.replace("'", "''")


def _fallback_open_file_selector(initialdir: str, title: str, filetypes) -> str:
    filter_parts = []
    if isinstance(filetypes, (list, tuple)):
        for item in filetypes:
            if isinstance(item, (list, tuple)) and len(item) >= 2:
                patterns = str(item[1]).replace(";", ";")
                filter_parts.append(f"{item[0]} ({patterns})|{patterns}")
    filter_text = "|".join(filter_parts) if filter_parts else "All files (*.*)|*.*"
    script = f"""
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = '{_quote_pwsh_string(title)}'
$dialog.InitialDirectory = '{_quote_pwsh_string(initialdir)}'
$dialog.Filter = '{_quote_pwsh_string(filter_text)}'
$dialog.Multiselect = $false
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {{
    Write-Output $dialog.FileName
}}
"""
    return _run_powershell_dialog(script)


def _fallback_open_directory_selector(initialdir: str) -> str:
    script = f"""
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.SelectedPath = '{_quote_pwsh_string(initialdir)}'
$dialog.ShowNewFolderButton = $true
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {{
    Write-Output $dialog.SelectedPath
}}
"""
    return _run_powershell_dialog(script)


def open_file_selector(
        initialdir="",
        title="Select a file",
        filetypes="*") -> str:
    global last_dir
    if last_dir != "":
        initialdir = last_dir
    elif initialdir == "":
        initialdir = os.getcwd()
    try:
        if tkinter is not None and askopenfilename is not None:
            tk_window()
            filename = askopenfilename(
                initialdir=initialdir, title=title,
                filetypes=filetypes
            )
        else:
            filename = _fallback_open_file_selector(initialdir, title, filetypes)
        last_dir = os.path.dirname(filename)
        return filename
    except Exception as e:
        log.warning(f"tk file selector failed, falling back to PowerShell dialog: {e}")
        filename = _fallback_open_file_selector(initialdir, title, filetypes)
        last_dir = os.path.dirname(filename) if filename else last_dir
        return filename


def open_directory_selector(initialdir) -> str:
    global last_dir
    if last_dir != "":
        initialdir = last_dir
    elif initialdir == "":
        initialdir = os.getcwd()
    try:
        if tkinter is not None and askdirectory is not None:
            tk_window()
            directory = askdirectory(
                initialdir=initialdir
            )
        else:
            directory = _fallback_open_directory_selector(initialdir)
        last_dir = directory
        return directory
    except Exception as e:
        log.warning(f"tk directory selector failed, falling back to PowerShell dialog: {e}")
        directory = _fallback_open_directory_selector(initialdir)
        last_dir = directory if directory else last_dir
        return directory
