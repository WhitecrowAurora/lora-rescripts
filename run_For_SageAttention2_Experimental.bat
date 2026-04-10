@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo SD-rescripts SageAttention2 Startup
echo ========================================
echo.
echo SageAttention2 experimental mode:
echo - uses a dedicated python-sageattention2 runtime
echo - targets SageAttention 2.2 on a separate experimental environment
echo - intended for NVIDIA GPUs that want to try the newer sageattn stack
echo - keeps the existing SageAttention 1.x runtime untouched
echo - only affects routes that explicitly use this dedicated runtime
echo.

cd /d "%~dp0"
set "MIKAZUKI_PREFERRED_RUNTIME=sageattention2"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_gui.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Program execution failed.
    echo.
    pause
)

exit /b %ERRORLEVEL%
