@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo Cleanup SD-rescripts Workspace
echo ========================================
echo.

cd /d "%~dp0"

set "PYTHON_EXE=%~dp0python\python.exe"
set "TAGEDITOR_PYTHON_EXE=%~dp0python_tageditor\python.exe"

echo [1/5] Removing Python cache...
for /d /r %%D in (__pycache__) do @if exist "%%~fD" rmdir /s /q "%%~fD" 2>nul
del /s /q *.pyc *.pyo 2>nul
echo [Done]

echo.
echo [2/5] Resetting runtime folders to initial state...
if exist "logs" rmdir /s /q "logs" 2>nul
if exist "config\autosave" rmdir /s /q "config\autosave" 2>nul
if exist "tmp" rmdir /s /q "tmp" 2>nul
if exist "frontend\.vitepress\cache" rmdir /s /q "frontend\.vitepress\cache" 2>nul

mkdir "logs" 2>nul
mkdir "config\autosave" 2>nul
mkdir "tmp" 2>nul
mkdir "huggingface" 2>nul
echo [Done]

echo.
echo [3/5] Optional data cleanup...
echo Delete output folder? (Y/N, default N)
set /p "DEL_OUTPUT=: "
if /i "%DEL_OUTPUT%"=="Y" (
    if exist "output" rmdir /s /q "output" 2>nul
    echo [Deleted] output
) else (
    echo [Keep] output
)

echo.
echo Delete HuggingFace cache/config folders? (Y/N, default N)
echo This can free a lot of space, but model/download cache will be rebuilt later.
set /p "DEL_HF=: "
if /i "%DEL_HF%"=="Y" (
    if exist "huggingface\hub" rmdir /s /q "huggingface\hub" 2>nul
    if exist "huggingface\accelerate" rmdir /s /q "huggingface\accelerate" 2>nul
    if exist "huggingface\datasets" rmdir /s /q "huggingface\datasets" 2>nul
    if exist "huggingface\modules" rmdir /s /q "huggingface\modules" 2>nul
    if exist "huggingface\xet" rmdir /s /q "huggingface\xet" 2>nul
    if exist "huggingface\assets" rmdir /s /q "huggingface\assets" 2>nul
    del /q "huggingface\token" "huggingface\stored_tokens" 2>nul
    mkdir "huggingface" 2>nul
    echo [Deleted] HuggingFace cache/config
    echo Includes: hub, accelerate, datasets, modules, xet, assets, token files
)
else (
    echo [Keep] HuggingFace cache/config
)

echo.
echo [4/5] Slim bundled main Python packages for distribution? (Y/N, default N)
echo This will physically remove installed runtime packages like torch / torchvision / xformers / diffusers / transformers / numpy / scipy / onnxruntime.
echo It keeps only pip / setuptools / wheel bootstrap components so first startup can auto-install dependencies again.
set /p "SLIM_MAIN=: "
if /i "%SLIM_MAIN%"=="Y" (
    if not exist "%PYTHON_EXE%" (
        echo [Skip] portable main Python not found
    ) else (
        echo [Main] Removing site-packages, scripts and share payload while keeping bootstrap tools...
        powershell -NoProfile -ExecutionPolicy Bypass -Command ^
          "$ErrorActionPreference='Stop';" ^
          "$site = Join-Path (Get-Location) 'python\Lib\site-packages';" ^
          "$scripts = Join-Path (Get-Location) 'python\Scripts';" ^
          "$share = Join-Path (Get-Location) 'python\share';" ^
          "$keepPatterns = @('pip','pip-*','setuptools','setuptools-*','wheel','wheel-*','_distutils_hack','pkg_resources','distutils-precedence.pth');" ^
          "if(Test-Path $site){ Get-ChildItem -LiteralPath $site -Force | Where-Object { $name = $_.Name; -not ($keepPatterns | ForEach-Object { $name -like $_ } | Where-Object { $_ } | Select-Object -First 1) } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue };" ^
          "if(Test-Path $scripts){ Get-ChildItem -LiteralPath $scripts -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue };" ^
          "if(Test-Path $share){ Get-ChildItem -LiteralPath $share -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue }"
        del /q "python\.deps_installed" 2>nul
        del /q "python\.tageditor_installed" 2>nul
        echo [Done] main Python slimmed
    )
) else (
    echo [Keep] main Python packages
)

echo.
echo [5/5] Slim bundled tag editor Python packages too? (Y/N, default N)
echo This will physically remove gradio / transformers / timm / torch and other tag editor runtime packages.
echo It keeps only pip / setuptools / wheel bootstrap components.
set /p "SLIM_TAGEDITOR=: "
if /i "%SLIM_TAGEDITOR%"=="Y" (
    if not exist "%TAGEDITOR_PYTHON_EXE%" (
        echo [Skip] tag editor Python not found
    ) else (
        echo [TagEditor] Removing site-packages, scripts and share payload while keeping bootstrap tools...
        powershell -NoProfile -ExecutionPolicy Bypass -Command ^
          "$ErrorActionPreference='Stop';" ^
          "$site = Join-Path (Get-Location) 'python_tageditor\Lib\site-packages';" ^
          "$scripts = Join-Path (Get-Location) 'python_tageditor\Scripts';" ^
          "$share = Join-Path (Get-Location) 'python_tageditor\share';" ^
          "$keepPatterns = @('pip','pip-*','setuptools','setuptools-*','wheel','wheel-*','_distutils_hack','pkg_resources','distutils-precedence.pth');" ^
          "if(Test-Path $site){ Get-ChildItem -LiteralPath $site -Force | Where-Object { $name = $_.Name; -not ($keepPatterns | ForEach-Object { $name -like $_ } | Where-Object { $_ } | Select-Object -First 1) } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue };" ^
          "if(Test-Path $scripts){ Get-ChildItem -LiteralPath $scripts -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue };" ^
          "if(Test-Path $share){ Get-ChildItem -LiteralPath $share -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue }"
        del /q "python_tageditor\.tageditor_installed" 2>nul
        echo [Done] tag editor Python slimmed
    )
) else (
    echo [Keep] tag editor Python packages
)

echo.
echo Cleanup summary:
echo - Always cleared: __pycache__, *.pyc, logs, config\autosave, tmp, frontend\.vitepress\cache
echo - Optional: output, huggingface cache/config, main python deps, tag editor deps
echo - Main python slimming also removes xformers and will require reinstall on next startup
echo - Main remaining bulky folder should drop massively after choosing Y for main python slimming
echo.
pause
exit /b 0
