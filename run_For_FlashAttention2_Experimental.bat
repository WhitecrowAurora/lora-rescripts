@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo SD-rescripts FlashAttention2 Startup
echo ========================================
echo.
echo FlashAttention2 experimental mode:
echo - uses a dedicated python-flashattention runtime for FlashAttention 2
echo - intended for NVIDIA GPUs that want to try FA2
echo - keeps the main runtime untouched
echo - only affects routes that explicitly enable flash attention
echo.

cd /d "%~dp0"
set "MIKAZUKI_FLASHATTENTION_STARTUP=1"
set "MIKAZUKI_PREFERRED_RUNTIME=flashattention"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_gui.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Program execution failed.
    echo.
    pause
)

exit /b %ERRORLEVEL%
