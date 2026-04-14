@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo Install Newbie Runtime Support
echo ========================================
echo.
echo This will detect installed runtimes and add Newbie support packages.
echo 这会自动检测已完成基础安装的运行时，并继续补装 Newbie 支持。
echo.

cd /d "%~dp0"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0install_newbie_support.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Newbie support installation failed.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Done.
echo.
pause
exit /b 0
