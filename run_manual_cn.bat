@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"
set "MIKAZUKI_CN_MIRROR=1"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\runtime\launcher.ps1" -Mode Manual %*
if errorlevel 1 (
    echo.
    echo [ERROR] Program execution failed.
    echo.
    pause
)

exit /b %ERRORLEVEL%
