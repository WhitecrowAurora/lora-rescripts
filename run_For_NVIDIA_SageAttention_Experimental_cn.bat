@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"
set "MIKAZUKI_CN_MIRROR=1"
echo [CN Mirror] PyPI / Hugging Face / Git mirror helpers enabled.

call "%~dp0run_For_NVIDIA_SageAttention_Experimental.bat" %*
exit /b %ERRORLEVEL%
