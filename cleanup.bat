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
set "BLACKWELL_PYTHON_EXE=%~dp0python_blackwell\python.exe"
set "MAIN_RUNTIME_DIR=python"
set "TAGEDITOR_RUNTIME_DIR=python_tageditor"
set "BLACKWELL_RUNTIME_DIR=python_blackwell"
set "SAGEATTENTION_DIR_PRIMARY=python-sageattention"
set "SAGEATTENTION_DIR_LEGACY=python_sageattention"
set "SAGEATTENTION2_DIR_PRIMARY=python-sageattention-latest"
set "SAGEATTENTION2_DIR_LEGACY=python_sageattention_latest"
set "SAGEATTENTION_BLACKWELL_DIR_PRIMARY=python-sageattention-blackwell"
set "SAGEATTENTION_BLACKWELL_DIR_LEGACY=python_sageattention_blackwell"

echo [1/7] Removing Python cache...
for /d /r %%D in (__pycache__) do @if exist "%%~fD" rmdir /s /q "%%~fD" 2>nul
del /s /q *.pyc *.pyo 2>nul
echo [Done]

echo.
echo [2/7] Resetting runtime folders to initial state...
if exist "logs" rmdir /s /q "logs" 2>nul
if exist "config\autosave" rmdir /s /q "config\autosave" 2>nul
if exist "tmp" rmdir /s /q "tmp" 2>nul
if exist "frontend\.vitepress\cache" rmdir /s /q "frontend\.vitepress\cache" 2>nul
call :clear_runtime_cache "%MAIN_RUNTIME_DIR%"
call :clear_runtime_cache "%TAGEDITOR_RUNTIME_DIR%"
call :clear_runtime_cache "%BLACKWELL_RUNTIME_DIR%"
call :clear_runtime_cache "%SAGEATTENTION_DIR_PRIMARY%"
call :clear_runtime_cache "%SAGEATTENTION_DIR_LEGACY%"
call :clear_runtime_cache "%SAGEATTENTION2_DIR_PRIMARY%"
call :clear_runtime_cache "%SAGEATTENTION2_DIR_LEGACY%"
call :clear_runtime_cache "%SAGEATTENTION_BLACKWELL_DIR_PRIMARY%"
call :clear_runtime_cache "%SAGEATTENTION_BLACKWELL_DIR_LEGACY%"

mkdir "logs" 2>nul
mkdir "config\autosave" 2>nul
mkdir "tmp" 2>nul
mkdir "huggingface" 2>nul
echo [Done]

echo.
echo [3/7] Optional data cleanup...
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
) else (
    echo [Keep] HuggingFace cache/config
)

echo.
echo [4/7] Slim bundled main Python packages for distribution? (Y/N, default N)
echo This will physically remove installed runtime packages like torch / torchvision / xformers / diffusers / transformers / numpy / scipy / onnxruntime.
echo It keeps only pip / setuptools / wheel bootstrap components so first startup can auto-install dependencies again.
echo It does not delete the python folder itself; only Lib\site-packages / Scripts / share payload is slimmed.
set /p "SLIM_MAIN=: "
if /i "%SLIM_MAIN%"=="Y" (
    if not exist "%PYTHON_EXE%" (
        echo [Skip] portable main Python not found
    ) else (
        call :slim_python_runtime "python" "Main" ".deps_installed .tageditor_installed"
    )
) else (
    echo [Keep] main Python packages
)

echo.
echo [5/7] Slim bundled tag editor Python packages too? (Y/N, default N)
echo This will physically remove gradio / transformers / timm / torch and other tag editor runtime packages.
echo It keeps only pip / setuptools / wheel bootstrap components.
echo It does not delete the python_tageditor folder itself; only runtime payload is slimmed.
set /p "SLIM_TAGEDITOR=: "
if /i "%SLIM_TAGEDITOR%"=="Y" (
    if not exist "%TAGEDITOR_PYTHON_EXE%" (
        echo [Skip] tag editor Python not found
    ) else (
        call :slim_python_runtime "python_tageditor" "TagEditor" ".tageditor_installed"
    )
) else (
    echo [Keep] tag editor Python packages
)

echo.
echo [6/7] Slim bundled Blackwell Python packages too? (Y/N, default N)
echo This will physically remove torch / torchvision / xformers and other Blackwell runtime packages.
echo It keeps only pip / setuptools / wheel bootstrap components.
echo It does not delete the python_blackwell folder itself; only runtime payload is slimmed.
set /p "SLIM_BLACKWELL=: "
if /i "%SLIM_BLACKWELL%"=="Y" (
    if not exist "%BLACKWELL_PYTHON_EXE%" (
        echo [Skip] Blackwell Python not found
    ) else (
        call :slim_python_runtime "python_blackwell" "Blackwell" ".deps_installed"
    )
) else (
    echo [Keep] Blackwell Python packages
)

echo.
echo [7/7] Slim bundled SageAttention Python packages too? (Y/N, default N)
echo This will physically remove torch / torchvision / triton / sageattention and other SageAttention runtime packages.
echo It keeps only pip / setuptools / wheel bootstrap components.
echo It does not delete the SageAttention runtime folders themselves; only runtime payload is slimmed.
echo If both hyphen and legacy underscore runtime folders exist, all detected SageAttention runtimes will be slimmed here.
set /p "SLIM_SAGEATTENTION=: "
if /i "%SLIM_SAGEATTENTION%"=="Y" (
    call :slim_python_runtime "%SAGEATTENTION_DIR_PRIMARY%" "SageAttention"
    if /i not "%SAGEATTENTION_DIR_PRIMARY%"=="%SAGEATTENTION_DIR_LEGACY%" call :slim_python_runtime "%SAGEATTENTION_DIR_LEGACY%" "SageAttention Legacy"
    call :slim_python_runtime "%SAGEATTENTION2_DIR_PRIMARY%" "SageAttention2"
    if /i not "%SAGEATTENTION2_DIR_PRIMARY%"=="%SAGEATTENTION2_DIR_LEGACY%" call :slim_python_runtime "%SAGEATTENTION2_DIR_LEGACY%" "SageAttention2 Legacy"
    call :slim_python_runtime "%SAGEATTENTION_BLACKWELL_DIR_PRIMARY%" "SageAttention Blackwell"
    if /i not "%SAGEATTENTION_BLACKWELL_DIR_PRIMARY%"=="%SAGEATTENTION_BLACKWELL_DIR_LEGACY%" call :slim_python_runtime "%SAGEATTENTION_BLACKWELL_DIR_LEGACY%" "SageAttention Blackwell Legacy"
) else (
    echo [Keep] SageAttention Python packages
)

echo.
echo Cleanup summary:
echo - Always cleared: __pycache__, *.pyc, logs, config\autosave, tmp, frontend\.vitepress\cache, embedded runtime .cache / torch_compile_debug
echo - Optional: output, huggingface cache/config, main python deps, tag editor deps, blackwell python deps, SageAttention python deps
echo - Main/Blackwell python slimming also removes xformers and will require reinstall on next startup
echo - SageAttention python slimming removes triton / sageattention and will require reinstall on next startup
echo - Main remaining bulky folder should drop massively after choosing Y for main python slimming
echo.
pause
exit /b 0

:clear_runtime_cache
set "CACHE_RUNTIME_DIR=%~1"
if "%CACHE_RUNTIME_DIR%"=="" exit /b 0
if not exist "%~dp0%CACHE_RUNTIME_DIR%" exit /b 0
if exist "%CACHE_RUNTIME_DIR%\.cache" rmdir /s /q "%CACHE_RUNTIME_DIR%\.cache" 2>nul
if exist "%CACHE_RUNTIME_DIR%\torch_compile_debug" rmdir /s /q "%CACHE_RUNTIME_DIR%\torch_compile_debug" 2>nul
exit /b 0

:slim_python_runtime
set "RUNTIME_DIR=%~1"
set "RUNTIME_LABEL=%~2"
set "RUNTIME_MARKERS=%~3"

if "%RUNTIME_DIR%"=="" exit /b 0
if not exist "%~dp0%RUNTIME_DIR%\python.exe" (
    echo [Skip] %RUNTIME_LABEL% Python not found: %RUNTIME_DIR%
    exit /b 0
)

call :runtime_is_in_use "%RUNTIME_DIR%"
if errorlevel 7 (
    echo [Warn] %RUNTIME_LABEL% Python is currently in use.
    call :runtime_list_processes "%RUNTIME_DIR%"
    echo Force close related processes under %RUNTIME_DIR% and continue cleanup? (Y/N, default N)
    set "FORCE_CLOSE_RUNTIME="
    set /p "FORCE_CLOSE_RUNTIME=: "
    if /i not "%FORCE_CLOSE_RUNTIME%"=="Y" (
        echo [Skip] %RUNTIME_LABEL% Python slimming skipped because the runtime is in use.
        exit /b 0
    )
    call :runtime_force_close "%RUNTIME_DIR%"
    timeout /t 2 /nobreak >nul
    call :runtime_is_in_use "%RUNTIME_DIR%"
    if errorlevel 7 (
        echo [Fail] %RUNTIME_LABEL% Python is still in use after the forced close attempt.
        exit /b 1
    )
)

echo [%RUNTIME_LABEL%] Removing site-packages, scripts and share payload while keeping bootstrap tools... (%RUNTIME_DIR%)
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$runtime = Join-Path (Get-Location) '%RUNTIME_DIR%';" ^
  "$site = Join-Path $runtime 'Lib\site-packages';" ^
  "$scripts = Join-Path $runtime 'Scripts';" ^
  "$share = Join-Path $runtime 'share';" ^
  "$keepPatterns = @('pip','pip-*','setuptools','setuptools-*','wheel','wheel-*','_distutils_hack','pkg_resources','distutils-precedence.pth');" ^
  "$failed = New-Object System.Collections.Generic.List[string];" ^
  "if(Test-Path $site){ foreach($item in Get-ChildItem -LiteralPath $site -Force){ $name = $item.Name; $keep = $false; foreach($pattern in $keepPatterns){ if($name -like $pattern){ $keep = $true; break } }; if(-not $keep){ try { Remove-Item -LiteralPath $item.FullName -Recurse -Force -ErrorAction Stop } catch { $failed.Add($item.FullName) } } } };" ^
  "if(Test-Path $scripts){ foreach($item in Get-ChildItem -LiteralPath $scripts -Force){ try { Remove-Item -LiteralPath $item.FullName -Recurse -Force -ErrorAction Stop } catch { $failed.Add($item.FullName) } } };" ^
  "if(Test-Path $share){ foreach($item in Get-ChildItem -LiteralPath $share -Force){ try { Remove-Item -LiteralPath $item.FullName -Recurse -Force -ErrorAction Stop } catch { $failed.Add($item.FullName) } } };" ^
  "if($failed.Count -gt 0){ Write-Host ('FAILED:' + ($failed -join '; ')); exit 1 }"
if errorlevel 1 (
    echo [Fail] %RUNTIME_LABEL% Python slimming failed. Close any running processes using %RUNTIME_DIR% and try again.
    exit /b 1
)
for %%M in (%RUNTIME_MARKERS%) do del /q "%RUNTIME_DIR%\%%~M" 2>nul
echo [Done] %RUNTIME_LABEL% Python slimmed (%RUNTIME_DIR%)
exit /b 0

:runtime_is_in_use
set "CHECK_RUNTIME_DIR=%~1"
if "%CHECK_RUNTIME_DIR%"=="" exit /b 0
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$runtime=[System.IO.Path]::GetFullPath((Join-Path (Get-Location) '%CHECK_RUNTIME_DIR%'));" ^
  "$found=$false;" ^
  "foreach($proc in Get-CimInstance Win32_Process){ if($proc.ExecutablePath){ try{ $exe=[System.IO.Path]::GetFullPath($proc.ExecutablePath) } catch { $exe=$proc.ExecutablePath }; if($exe.StartsWith($runtime,[System.StringComparison]::OrdinalIgnoreCase)){ $found=$true; break } } };" ^
  "if($found){ exit 7 } else { exit 0 }"
exit /b %errorlevel%

:runtime_list_processes
set "CHECK_RUNTIME_DIR=%~1"
if "%CHECK_RUNTIME_DIR%"=="" exit /b 0
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$runtime=[System.IO.Path]::GetFullPath((Join-Path (Get-Location) '%CHECK_RUNTIME_DIR%'));" ^
  "Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath } | ForEach-Object { try { $exe=[System.IO.Path]::GetFullPath($_.ExecutablePath) } catch { $exe=$_.ExecutablePath }; if($exe.StartsWith($runtime,[System.StringComparison]::OrdinalIgnoreCase)){ Write-Host ('  PID=' + $_.ProcessId + ' Name=' + $_.Name + ' Path=' + $_.ExecutablePath) } }"
exit /b 0

:runtime_force_close
set "CHECK_RUNTIME_DIR=%~1"
if "%CHECK_RUNTIME_DIR%"=="" exit /b 0
echo [Action] Force closing processes under %CHECK_RUNTIME_DIR%...
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$runtime=[System.IO.Path]::GetFullPath((Join-Path (Get-Location) '%CHECK_RUNTIME_DIR%'));" ^
  "$targets = Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath } | ForEach-Object { try { $exe=[System.IO.Path]::GetFullPath($_.ExecutablePath) } catch { $exe=$_.ExecutablePath }; if($exe.StartsWith($runtime,[System.StringComparison]::OrdinalIgnoreCase)){ $_ } };" ^
  "foreach($proc in $targets){ try { Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop; Write-Host ('  Stopped PID=' + $proc.ProcessId + ' Name=' + $proc.Name) } catch { Write-Host ('  Failed PID=' + $proc.ProcessId + ' Name=' + $proc.Name + ' :: ' + $_.Exception.Message) } }"
exit /b 0
