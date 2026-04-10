@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "AUTO_MODE=0"
set "TARGET_DIR=python"
set "REQUESTED_TARGET=%~1"

if /i "%REQUESTED_TARGET%"=="--auto" (
    set "AUTO_MODE=1"
    set "REQUESTED_TARGET=%~2"
)

if not defined REQUESTED_TARGET set "REQUESTED_TARGET=python"

for /f "usebackq delims=" %%I in (`"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\runtime\resolve_runtime_dir.ps1" -RepoRoot "%~dp0" -RequestedTarget "%REQUESTED_TARGET%"`) do set "TARGET_DIR=%%~I"

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
    echo pip not found, trying offline bootstrap from existing runtimes...
    call :copy_bootstrap_runtime_packages
    "%PYTHON_EXE%" -m pip --version >nul 2>&1
    if errorlevel 1 (
        set "GET_PIP=%TEMP%\get-pip.py"
        echo offline bootstrap unavailable, downloading bootstrap script...
        "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '!GET_PIP!'"
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
)

echo [3/3] Upgrading build tools...
"%PYTHON_EXE%" -m pip install --upgrade pip "setuptools<81" wheel
if errorlevel 1 (
    echo [WARN] Failed to upgrade pip/setuptools/wheel, keeping current bootstrap packages.
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

:copy_bootstrap_runtime_packages
set "BOOTSTRAP_CANDIDATES=python env\python python_tageditor env\python_tageditor python_blackwell env\python_blackwell python_xpu_intel env\python_xpu_intel python_xpu_intel_sage env\python_xpu_intel_sage python_rocm_amd env\python_rocm_amd python-sageattention env\python-sageattention python_sageattention env\python_sageattention python_sagebwd_nvidia env\python_sagebwd_nvidia python-sagebwd-nvidia env\python-sagebwd-nvidia"
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$repo = Get-Location;" ^
  "$targetDir = '%TARGET_DIR%';" ^
  "$targetSite = Join-Path (Join-Path $repo $targetDir) 'Lib\site-packages';" ^
  "$patterns = @('pip','pip-*','setuptools','setuptools-*','wheel','wheel-*','_distutils_hack','pkg_resources','distutils-precedence.pth');" ^
  "$candidates = @('env\python','python','env\python_tageditor','python_tageditor','env\python_blackwell','python_blackwell','env\python_xpu_intel','python_xpu_intel','env\python_xpu_intel_sage','python_xpu_intel_sage','env\python_rocm_amd','python_rocm_amd','env\python-sageattention','python-sageattention','env\python_sageattention','python_sageattention','env\python_sagebwd_nvidia','python_sagebwd_nvidia','env\python-sagebwd-nvidia','python-sagebwd-nvidia');" ^
  "$copied = $false;" ^
  "foreach($candidate in $candidates){" ^
  "  if($candidate -ieq $targetDir){ continue }" ^
  "  $candidateSite = Join-Path (Join-Path $repo $candidate) 'Lib\site-packages';" ^
  "  if(-not (Test-Path $candidateSite)){ continue }" ^
  "  if(-not (Test-Path (Join-Path $candidateSite 'pip'))){ continue }" ^
  "  Write-Host ('Using offline bootstrap packages from ' + $candidate);" ^
  "  foreach($item in Get-ChildItem -LiteralPath $candidateSite -Force){" ^
  "    $name = $item.Name;" ^
  "    $match = $false;" ^
  "    foreach($pattern in $patterns){ if($name -like $pattern){ $match = $true; break } }" ^
  "    if(-not $match){ continue }" ^
  "    if($item.PSIsContainer){ Copy-Item -LiteralPath $item.FullName -Destination (Join-Path $targetSite $name) -Recurse -Force } else { Copy-Item -LiteralPath $item.FullName -Destination $targetSite -Force }" ^
  "  }" ^
  "  $copied = $true;" ^
  "  break" ^
  "}" ^
  "if(-not $copied){ exit 1 }"
exit /b 0
