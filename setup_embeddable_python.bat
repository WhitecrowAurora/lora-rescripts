@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "AUTO_MODE=0"
set "TARGET_DIR=python"

if /i "%~1"=="--auto" set "AUTO_MODE=1"
if /i "%~1"=="python_tageditor" set "TARGET_DIR=python_tageditor"
if /i "%~1"=="python" set "TARGET_DIR=python"
if /i "%~2"=="python_tageditor" set "TARGET_DIR=python_tageditor"
if /i "%~2"=="python" set "TARGET_DIR=python"

echo ========================================
echo Setup Portable Python
echo ========================================
echo.

cd /d "%~dp0"

set "PYTHON_DIR=%~dp0%TARGET_DIR%"
set "PYTHON_EXE=%PYTHON_DIR%\python.exe"
set "PTH_FILE="

if exist "%PYTHON_EXE%" goto python_ok
echo [ERROR] Portable Python not found.
echo Expected: %PYTHON_EXE%
echo.
if "%AUTO_MODE%"=="0" pause
exit /b 1

:python_ok

for %%F in ("%PYTHON_DIR%\python*._pth") do (
    set "PTH_FILE=%%~fF"
)

if defined PTH_FILE goto pth_ok
echo [ERROR] python*._pth file not found in %PYTHON_DIR%
echo.
if "%AUTO_MODE%"=="0" pause
exit /b 1

:pth_ok

if not exist "%PYTHON_DIR%\Lib" mkdir "%PYTHON_DIR%\Lib"
if not exist "%PYTHON_DIR%\Lib\site-packages" mkdir "%PYTHON_DIR%\Lib\site-packages"
if not exist "%PYTHON_DIR%\Scripts" mkdir "%PYTHON_DIR%\Scripts"

set /p ZIP_LINE=<"%PTH_FILE%"
if not defined ZIP_LINE set "ZIP_LINE=python.zip"

if not exist "%PTH_FILE%.bak" copy /y "%PTH_FILE%" "%PTH_FILE%.bak" >nul

(
echo !ZIP_LINE!
echo .
echo Lib
echo Lib\site-packages
echo.
echo import site
) > "%PTH_FILE%"

echo [1/3] Python path configured:
echo         %PTH_FILE%
echo.

echo [2/3] Checking pip...
"%PYTHON_EXE%" -m pip --version >nul 2>&1
if errorlevel 1 (
    set "GET_PIP=%TEMP%\get-pip.py"
    echo pip not found, downloading bootstrap script...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '!GET_PIP!'"
    if errorlevel 1 (
        echo [ERROR] Failed to download get-pip.py
        echo.
        if "%AUTO_MODE%"=="0" pause
        exit /b 1
    )

    "%PYTHON_EXE%" "!GET_PIP!"
    if errorlevel 1 (
        echo [ERROR] Failed to install pip
        echo.
        if "%AUTO_MODE%"=="0" pause
        exit /b 1
    )
)

echo [3/3] Upgrading build tools...
"%PYTHON_EXE%" -m pip install --upgrade pip setuptools wheel
if errorlevel 1 (
    echo [ERROR] Failed to upgrade pip/setuptools/wheel
    echo.
    if "%AUTO_MODE%"=="0" pause
    exit /b 1
)

echo.>"%PYTHON_DIR%\.portable_ready"

echo.
echo ========================================
echo Portable Python is ready
echo ========================================
echo.
"%PYTHON_EXE%" -m pip --version
echo.
if "%AUTO_MODE%"=="0" pause
exit /b 0
