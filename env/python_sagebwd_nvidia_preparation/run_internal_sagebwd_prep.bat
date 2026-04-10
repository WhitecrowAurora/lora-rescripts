@echo off
setlocal

set "HF_HOME=huggingface"
set "PYTHONUTF8=1"
set "PIP_DISABLE_PIP_VERSION_CHECK=1"
set "MIKAZUKI_SAGEBWD_STARTUP=1"
set "MIKAZUKI_PREFERRED_RUNTIME=sagebwd-nvidia"

set "RUNTIME_ROOT=%~dp0"
pushd "%RUNTIME_ROOT%\.." >nul

set "RUNTIME_DIR=python_sagebwd_nvidia"
set "PYTHON_EXE=%CD%\%RUNTIME_DIR%\python.exe"
set "DEPS_MARKER=%CD%\%RUNTIME_DIR%\.deps_installed"
set "CACHE_ROOT=%CD%\%RUNTIME_DIR%\.cache"

echo ========================================
echo SD-reScripts SageBwd NVIDIA Internal Prep
echo ========================================
echo.
echo SageBwd pre-prepared mode:
echo - uses the dedicated python_sagebwd_nvidia runtime
echo - is kept inside the runtime folder on purpose
echo - is reserved for future official SageBwd integration
echo - does not expose Sage or SageBwd training in the current build
echo.

if not exist "%PYTHON_EXE%" (
    echo [ERROR] python_sagebwd_nvidia\python.exe was not found.
    goto :end
)

if not exist "%DEPS_MARKER%" (
    echo [WARN] %RUNTIME_DIR%\.deps_installed was not found.
    echo This runtime may still be incomplete. Continuing anyway...
    echo.
)

if not exist "%CACHE_ROOT%" mkdir "%CACHE_ROOT%" >nul 2>nul
if not exist "%CACHE_ROOT%\triton" mkdir "%CACHE_ROOT%\triton" >nul 2>nul
if not exist "%CACHE_ROOT%\torchinductor" mkdir "%CACHE_ROOT%\torchinductor" >nul 2>nul

set "TRITON_HOME=%CACHE_ROOT%"
set "TRITON_CACHE_DIR=%CACHE_ROOT%\triton"
set "TORCHINDUCTOR_CACHE_DIR=%CACHE_ROOT%\torchinductor"

"%PYTHON_EXE%" "gui.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Program execution failed.
)

:end
echo.
pause
popd >nul
endlocal
