import os
import platform
import subprocess
import tempfile
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


def _allow_foreground():
    """Tell Windows to let our process steal foreground focus."""
    if platform.system() != "Windows":
        return
    try:
        import ctypes
        ctypes.windll.user32.AllowSetForegroundWindow(-1)
    except Exception:
        pass


def _get_tk_root():
    _allow_foreground()
    root = tkinter.Tk()
    root.wm_attributes('-topmost', 1)
    root.withdraw()
    root.lift()
    root.focus_force()
    return root


def _quote_pwsh(value: str) -> str:
    return value.replace("'", "''")


def _run_powershell_dialog(script: str) -> str:
    """Execute a PowerShell script that shows a dialog.

    Writes the script to a temp .ps1 file and runs it with -File
    to avoid quoting issues. Prepends UTF-8 output encoding to
    fix Chinese path corruption.
    """
    _allow_foreground()
    fd, tmp_path = tempfile.mkstemp(suffix=".ps1", prefix="mika_dlg_")
    try:
        with os.fdopen(fd, "w", encoding="utf-8-sig") as f:
            # Force UTF-8 output so Python decodes Chinese paths correctly
            f.write("[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n")
            f.write(script)
        completed = subprocess.run(
            [
                "powershell.exe", "-STA",
                "-NoProfile", "-ExecutionPolicy", "Bypass",
                "-File", tmp_path,
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            check=False,
        )
        if completed.returncode != 0:
            log.warning(
                "PowerShell dialog failed (exit %d): %s",
                completed.returncode,
                completed.stderr.strip(),
            )
            return ""
        return completed.stdout.strip()
    except Exception as e:
        log.warning("PowerShell dialog exception: %s", e)
        return ""
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


# PowerShell preamble: creates a zero-size invisible owner Form and
# forces it to foreground so the subsequent ShowDialog inherits z-order.
_PWSH_OWNER = """Add-Type -AssemblyName System.Windows.Forms

$owner = New-Object System.Windows.Forms.Form
$owner.TopMost = $true
$owner.ShowInTaskbar = $false
$owner.Size = New-Object System.Drawing.Size(1, 1)
$owner.StartPosition = 'CenterScreen'
$owner.Opacity = 0
$owner.Show()
$owner.Activate()
try {
    [void][Win32.FgHelper]
} catch {
    $sig = @'
[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
[DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
[DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool attach);
[DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
'@
    Add-Type -MemberDefinition $sig -Name FgHelper -Namespace Win32
}
$fg = [Win32.FgHelper]::GetForegroundWindow()
$fgPid = [uint32]0
$fgT = [Win32.FgHelper]::GetWindowThreadProcessId($fg, [ref]$fgPid)
$myT = [Win32.FgHelper]::GetCurrentThreadId()
if ($fgT -ne $myT) {
    [Win32.FgHelper]::AttachThreadInput($myT, $fgT, $true)  | Out-Null
    [Win32.FgHelper]::SetForegroundWindow($owner.Handle)    | Out-Null
    [Win32.FgHelper]::AttachThreadInput($myT, $fgT, $false) | Out-Null
} else {
    [Win32.FgHelper]::SetForegroundWindow($owner.Handle) | Out-Null
}
"""


def _fallback_open_file_selector(initialdir: str, title: str, filetypes) -> str:
    filter_parts = []
    if isinstance(filetypes, (list, tuple)):
        for item in filetypes:
            if isinstance(item, (list, tuple)) and len(item) >= 2:
                patterns = str(item[1])
                filter_parts.append(
                    "{0} ({1})|{1}".format(item[0], patterns)
                )
    filter_text = "|".join(filter_parts) if filter_parts else "All files (*.*)|*.*"
    script = (
        _PWSH_OWNER + "$dlg = New-Object System.Windows.Forms.OpenFileDialog\n"
        + "$dlg.Title = '" + _quote_pwsh(title) + "'\n"
        + "$dlg.InitialDirectory = '" + _quote_pwsh(initialdir) + "'\n"
        + "$dlg.Filter = '" + _quote_pwsh(filter_text) + "'\n"
        + "$dlg.Multiselect = $false\n"
        + "$null = $dlg.ShowDialog($owner)\n"
        + "if ($dlg.FileName) { Write-Output $dlg.FileName }\n"
        + "$owner.Close(); $owner.Dispose()\n"
    )
    return _run_powershell_dialog(script)


def _fallback_open_directory_selector(initialdir: str) -> str:
    script = (
        _PWSH_OWNER
        + "$dlg = New-Object System.Windows.Forms.FolderBrowserDialog\n"
        + "$dlg.SelectedPath = '" + _quote_pwsh(initialdir) + "'\n"
        + "$dlg.ShowNewFolderButton = $true\n"
        + "$null = $dlg.ShowDialog($owner)\n"
        + "if ($dlg.SelectedPath) { Write-Output $dlg.SelectedPath }\n"
        + "$owner.Close(); $owner.Dispose()\n"
    )
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
            root = _get_tk_root()
            filename = askopenfilename(
                parent=root,
                initialdir=initialdir,
                title=title,
                filetypes=filetypes,
            )
            root.destroy()
        else:
            filename = _fallback_open_file_selector(initialdir, title, filetypes)
        last_dir = os.path.dirname(filename)
        return filename
    except Exception as e:
        log.warning("tk file selector failed, falling back to PowerShell: %s", e)
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
            root = _get_tk_root()
            directory = askdirectory(
                parent=root,
                initialdir=initialdir,
            )
            root.destroy()
        else:
            directory = _fallback_open_directory_selector(initialdir)
        last_dir = directory
        return directory
    except Exception as e:
        log.warning("tk directory selector failed, falling back to PowerShell: %s", e)
        directory = _fallback_open_directory_selector(initialdir)
        last_dir = directory if directory else last_dir
        return directory
