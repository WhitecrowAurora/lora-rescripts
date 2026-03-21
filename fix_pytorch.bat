@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Fix PyTorch Installation

echo ========================================
echo Fix PyTorch Installation
echo ========================================
echo.
echo This script repairs the PyTorch stack only.
echo It reinstalls torch / torchvision and optionally xformers.
echo It does not reinstall the full project dependency set.
echo.

cd /d "%~dp0"

set "MAIN_PYTHON_EXE=%~dp0python\python.exe"
set "MAIN_SITE_PACKAGES=%~dp0python\Lib\site-packages"
set "TAGEDITOR_PYTHON_EXE=%~dp0python_tageditor\python.exe"
set "TAGEDITOR_SITE_PACKAGES=%~dp0python_tageditor\Lib\site-packages"

echo Select target environment:
echo 1. Main portable Python [default]
echo 2. Tag editor portable Python
echo 3. Both
echo.
set /p "TARGET_CHOICE=Enter (1-3, default 1): "
if "%TARGET_CHOICE%"=="" set "TARGET_CHOICE=1"

set "FIX_MAIN=0"
set "FIX_TAGEDITOR=0"

if "%TARGET_CHOICE%"=="1" (
    set "FIX_MAIN=1"
) else if "%TARGET_CHOICE%"=="2" (
    set "FIX_TAGEDITOR=1"
) else if "%TARGET_CHOICE%"=="3" (
    set "FIX_MAIN=1"
    set "FIX_TAGEDITOR=1"
) else (
    echo [ERROR] Invalid option.
    echo.
    pause
    exit /b 1
)

if "%FIX_MAIN%"=="1" (
    if not exist "%MAIN_PYTHON_EXE%" (
        echo [ERROR] Main portable Python not found.
        echo.
        pause
        exit /b 1
    )
)

if "%FIX_TAGEDITOR%"=="1" (
    if not exist "%TAGEDITOR_PYTHON_EXE%" (
        if "%TARGET_CHOICE%"=="3" (
            echo [WARN] Tag editor portable Python not found, skipping it.
            set "FIX_TAGEDITOR=0"
        ) else (
            echo [ERROR] Tag editor portable Python not found.
            echo.
            pause
            exit /b 1
        )
    )
)

if "%FIX_MAIN%"=="0" if "%FIX_TAGEDITOR%"=="0" (
    echo [ERROR] No valid target environment selected.
    echo.
    pause
    exit /b 1
)

if "%FIX_MAIN%"=="1" (
    call :check_pip "%MAIN_PYTHON_EXE%" "main portable Python"
    if errorlevel 1 exit /b 1
)

if "%FIX_TAGEDITOR%"=="1" (
    call :check_pip "%TAGEDITOR_PYTHON_EXE%" "tag editor portable Python"
    if errorlevel 1 exit /b 1
)

echo.
echo Select PyTorch channel:
echo 1. CUDA 12.8 [default]
echo 2. CUDA 12.6
echo 3. CUDA 12.4
echo 4. CPU only
echo.
set /p "CUDA_CHOICE=Enter (1-4, default 1): "
if "%CUDA_CHOICE%"=="" set "CUDA_CHOICE=1"

if "%CUDA_CHOICE%"=="1" (
    set "INDEX_URL=https://download.pytorch.org/whl/cu128"
    set "CHANNEL_NAME=CUDA 12.8"
) else if "%CUDA_CHOICE%"=="2" (
    set "INDEX_URL=https://download.pytorch.org/whl/cu126"
    set "CHANNEL_NAME=CUDA 12.6"
) else if "%CUDA_CHOICE%"=="3" (
    set "INDEX_URL=https://download.pytorch.org/whl/cu124"
    set "CHANNEL_NAME=CUDA 12.4"
) else if "%CUDA_CHOICE%"=="4" (
    set "INDEX_URL=https://download.pytorch.org/whl/cpu"
    set "CHANNEL_NAME=CPU"
) else (
    echo [ERROR] Invalid option.
    echo.
    pause
    exit /b 1
)

set "INSTALL_MAIN_XFORMERS=N"
if "%FIX_MAIN%"=="1" (
    echo.
    echo Install xformers for the main environment too? (Y/N, default Y)
    set /p "INSTALL_MAIN_XFORMERS=: "
    if /i "%INSTALL_MAIN_XFORMERS%"=="" set "INSTALL_MAIN_XFORMERS=Y"
)

if "%FIX_MAIN%"=="1" (
    call :repair_env "Main" "%MAIN_PYTHON_EXE%" "%MAIN_SITE_PACKAGES%" "%INSTALL_MAIN_XFORMERS%"
    if errorlevel 1 exit /b 1
)

if "%FIX_TAGEDITOR%"=="1" (
    call :repair_env "TagEditor" "%TAGEDITOR_PYTHON_EXE%" "%TAGEDITOR_SITE_PACKAGES%" "N"
    if errorlevel 1 exit /b 1
)

echo.
echo Done.
echo.
pause
exit /b 0

:check_pip
set "CHECK_PYTHON=%~1"
set "CHECK_LABEL=%~2"
if not exist "%CHECK_PYTHON%" (
    echo [ERROR] %CHECK_LABEL% not found.
    echo.
    pause
    exit /b 1
)

"%CHECK_PYTHON%" -m pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not ready in %CHECK_LABEL%.
    echo Run setup_embeddable_python.bat first or replace that bundled Python with a ready-to-run one.
    echo.
    pause
    exit /b 1
)
exit /b 0

:repair_env
set "ENV_NAME=%~1"
set "PYTHON_EXE=%~2"
set "SITE_PACKAGES=%~3"
set "INSTALL_XFORMERS=%~4"

echo.
echo ========================================
echo Repairing %ENV_NAME% environment
echo ========================================
echo Channel: %CHANNEL_NAME%
echo Python: %PYTHON_EXE%

echo Cleaning existing PyTorch packages in %ENV_NAME%...
for %%D in (torch torchvision xformers) do (
    if exist "%SITE_PACKAGES%\%%D" rmdir /s /q "%SITE_PACKAGES%\%%D" 2>nul
    if exist "%SITE_PACKAGES%\~%%D" rmdir /s /q "%SITE_PACKAGES%\~%%D" 2>nul
)
for /d %%D in ("%SITE_PACKAGES%\torch-*.dist-info" "%SITE_PACKAGES%\torchvision-*.dist-info" "%SITE_PACKAGES%\xformers-*.dist-info") do (
    if exist "%%~fD" rmdir /s /q "%%~fD" 2>nul
)

echo Installing torch and torchvision from %CHANNEL_NAME% for %ENV_NAME%...
"%PYTHON_EXE%" -m pip install --upgrade --force-reinstall --no-cache-dir torch torchvision --index-url %INDEX_URL%
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install torch/torchvision for %ENV_NAME%.
    echo.
    pause
    exit /b 1
)

if /i "%INSTALL_XFORMERS%"=="Y" (
    echo Installing xformers for %ENV_NAME%...
    "%PYTHON_EXE%" -m pip install --upgrade --no-cache-dir xformers
    if errorlevel 1 (
        echo [WARN] xformers installation failed in %ENV_NAME%. This environment can still fall back if supported by the app.
    )
)

echo Verifying %ENV_NAME% environment...
"%PYTHON_EXE%" -c "import torch; print('Torch:', torch.__version__); print('CUDA available:', torch.cuda.is_available()); print('CUDA runtime:', torch.version.cuda)"
if errorlevel 1 (
    echo.
    echo [ERROR] Verification failed for %ENV_NAME%.
    echo.
    pause
    exit /b 1
)

if /i "%INSTALL_XFORMERS%"=="Y" (
    "%PYTHON_EXE%" -c "import importlib.util; raise SystemExit(0 if importlib.util.find_spec('xformers') else 1)"
    if errorlevel 1 (
        echo [WARN] xformers is still not importable in %ENV_NAME%.
    ) else (
        echo xformers is importable in %ENV_NAME%.
    )
)

exit /b 0
