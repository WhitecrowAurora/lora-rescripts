@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "AUTO_MODE=0"
set "TARGET_DIR=python"

if /i "%~1"=="--auto" set "AUTO_MODE=1"
if /i "%~1"=="python_tageditor" set "TARGET_DIR=python_tageditor"
if /i "%~1"=="python_blackwell" set "TARGET_DIR=python_blackwell"
if /i "%~1"=="python-sageattention" set "TARGET_DIR=python-sageattention"
if /i "%~1"=="python_sageattention" set "TARGET_DIR=python_sageattention"
if /i "%~1"=="python-sageattention-latest" set "TARGET_DIR=python-sageattention-latest"
if /i "%~1"=="python_sageattention_latest" set "TARGET_DIR=python_sageattention_latest"
if /i "%~1"=="python-sageattention-blackwell" set "TARGET_DIR=python-sageattention-blackwell"
if /i "%~1"=="python_sageattention_blackwell" set "TARGET_DIR=python_sageattention_blackwell"
if /i "%~1"=="python" set "TARGET_DIR=python"
if /i "%~2"=="python_tageditor" set "TARGET_DIR=python_tageditor"
if /i "%~2"=="python_blackwell" set "TARGET_DIR=python_blackwell"
if /i "%~2"=="python-sageattention" set "TARGET_DIR=python-sageattention"
if /i "%~2"=="python_sageattention" set "TARGET_DIR=python_sageattention"
if /i "%~2"=="python-sageattention-latest" set "TARGET_DIR=python-sageattention-latest"
if /i "%~2"=="python_sageattention_latest" set "TARGET_DIR=python_sageattention_latest"
if /i "%~2"=="python-sageattention-blackwell" set "TARGET_DIR=python-sageattention-blackwell"
if /i "%~2"=="python_sageattention_blackwell" set "TARGET_DIR=python_sageattention_blackwell"
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
"%PYTHON_EXE%" -m pip install --upgrade pip setuptools wheel
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
set "BOOTSTRAP_CANDIDATES=python python_tageditor python_blackwell python-sageattention python_sageattention python-sageattention-latest python_sageattention_latest python-sageattention-blackwell python_sageattention_blackwell"
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$repo = Get-Location;" ^
  "$targetDir = '%TARGET_DIR%';" ^
  "$targetSite = Join-Path (Join-Path $repo $targetDir) 'Lib\site-packages';" ^
  "$patterns = @('pip','pip-*','setuptools','setuptools-*','wheel','wheel-*','_distutils_hack','pkg_resources','distutils-precedence.pth');" ^
  "$candidates = @('python','python_tageditor','python_blackwell','python-sageattention','python_sageattention','python-sageattention-latest','python_sageattention_latest','python-sageattention-blackwell','python_sageattention_blackwell');" ^
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
