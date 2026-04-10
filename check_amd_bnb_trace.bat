@echo off
chcp 65001 >nul
setlocal
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"

cd /d "%~dp0"

set "PYTHON_EXE=%~dp0env\python_rocm_amd\python.exe"
set "RUNTIME_LABEL=env\python_rocm_amd"

if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=%~dp0python_rocm_amd\python.exe"
    set "RUNTIME_LABEL=python_rocm_amd"
)

if not exist "%PYTHON_EXE%" (
    echo ========================================
    echo SD-rescripts AMD bitsandbytes Trace Check
    echo ========================================
    echo.
    echo [ERROR] env\python_rocm_amd or python_rocm_amd not found.
    echo Expected runtime under: %~dp0
    echo.
    pause
    exit /b 1
)

echo ========================================
echo SD-rescripts AMD bitsandbytes Trace Check
echo ========================================
echo.

echo Active runtime: %RUNTIME_LABEL%
echo.
echo Running AMD ROCm bitsandbytes trace diagnostics...
echo.

"%PYTHON_EXE%" "%~dp0mikazuki\scripts\amd_rocm_bnb_trace.py"
if errorlevel 1 goto failed

echo.
echo Trace diagnostics completed.
echo Please send the full output and the generated JSON report back to the maintainer.
echo.
pause
exit /b 0

:failed
echo.
echo [ERROR] AMD ROCm bitsandbytes trace diagnostics reported one or more failures.
echo Please send the full output and the generated JSON report back to the maintainer.
echo.
pause
exit /b 1
