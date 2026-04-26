@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo SD-rescripts FlashAttention2 Safe Mode
echo ========================================
echo.
echo FlashAttention2 safe mode:
echo - uses the dedicated python-flashattention runtime for FlashAttention 2
echo - clears inherited Python / pip / conda environment overrides first
echo - keeps the main runtime untouched
echo - intended for startup recovery and pollution-resistant launching
echo.

cd /d "%~dp0"

set "PYTHONHOME="
set "PYTHONPATH="
set "PYTHONSTARTUP="
set "PYTHONUSERBASE="
set "PYTHONNOUSERSITE=1"
set "PIP_REQUIRE_VIRTUALENV="
set "PIP_CONFIG_FILE="
set "VIRTUAL_ENV="
set "CONDA_PREFIX="
set "CONDA_DEFAULT_ENV="
set "CONDA_PROMPT_MODIFIER="
set "CONDA_EXE="
set "CONDA_PYTHON_EXE="
set "MIKAZUKI_ALLOW_SYSTEM_PYTHON="
set "MIKAZUKI_PREFERRED_RUNTIME="
set "MIKAZUKI_FLASHATTENTION_STARTUP="
set "MIKAZUKI_SAGEATTENTION_STARTUP="
set "MIKAZUKI_BLACKWELL_STARTUP="
set "MIKAZUKI_STARTUP_ATTENTION_POLICY="

set "MIKAZUKI_FLASHATTENTION_STARTUP=1"
set "MIKAZUKI_PREFERRED_RUNTIME=flashattention"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_gui.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Safe mode startup failed.
    echo.
    pause
)

exit /b %ERRORLEVEL%
