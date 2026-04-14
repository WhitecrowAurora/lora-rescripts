@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo SD-rescripts China Mirror Startup
echo ========================================
echo.
echo China mainland mirror mode:
echo - enables PyPI / Hugging Face / Git mirror helpers
echo - keeps official upstream fallback for packages that mirrors cannot satisfy
echo - intended to reduce first-install bandwidth pressure on restricted networks
echo.

cd /d "%~dp0"
set "MIKAZUKI_CN_MIRROR=1"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_gui_cn.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Program execution failed.
    echo.
    pause
)

exit /b %ERRORLEVEL%
