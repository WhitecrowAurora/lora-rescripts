@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo SD-rescripts AMD ROCm Startup
echo ========================================
echo.
echo AMD ROCm experimental mode:
echo - uses the dedicated python_rocm_amd runtime
echo - defaults to the guarded SDPA training path
echo - currently isolates the AMD experimental route to Anima LoRA
echo - keeps the main runtime and NVIDIA paths untouched
echo.

cd /d "%~dp0"
set "MIKAZUKI_AMD_EXPERIMENTAL=1"
set "MIKAZUKI_ROCM_AMD_STARTUP=1"
set "MIKAZUKI_PREFERRED_RUNTIME=rocm-amd"
set "MIKAZUKI_STARTUP_ATTENTION_POLICY=runtime_guarded"
set "MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB=0.75"
set "MIKAZUKI_ROCM_SDPA_SLICE_GB=0.35"

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_gui.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Program execution failed.
    echo.
    pause
)

exit /b %ERRORLEVEL%
