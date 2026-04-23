@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo SD-rescripts Blackwell SageAttention Startup
echo ========================================
echo.
echo Blackwell SageAttention experimental mode:
echo - uses a dedicated python-sageattention-blackwell runtime
echo - intended for RTX 50 and RTX PRO Blackwell GPUs
echo - keeps the main and xformers runtimes untouched
echo - only affects routes that explicitly enable sageattn
echo.

cd /d "%~dp0"
set "MIKAZUKI_SAGEATTENTION_STARTUP=1"
set "MIKAZUKI_PREFERRED_RUNTIME=sageattention-blackwell"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_gui.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Program execution failed.
    echo.
    pause
)

exit /b %ERRORLEVEL%
