@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo Install Newbie Runtime Support (CN)
echo ========================================
echo.
echo China mirror mode will be enabled for this installer.
echo 这个安装脚本会启用国内镜像模式。
echo.

cd /d "%~dp0"
set "MIKAZUKI_CN_MIRROR=1"

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
