@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

echo ========================================
echo Cleanup Launcher State
echo ========================================
echo.
echo This will remove launcher-only state files so the packaged launcher
echo starts in a clean default state on another machine.
echo.

call :delete_file "config\launcher_settings.json"
call :delete_file "config\launcher_task_history.json"
call :delete_file "config\launcher_task_state.json"
call :delete_file "config\managed\catalog_cache.json"
call :delete_file "config\managed\import_state.json"
call :delete_file "config\plugins\enabled.json"
call :delete_file "config\plugins\audit.jsonl"
call :delete_file "config\plugins\training_hooks_state.json"
call :delete_file "assets\config.json"
call :delete_file "assets\ui_state\managed_import_pending.json"

call :delete_dir "config\managed\covers"
call :delete_dir "assets\ui_state"

echo.
echo Launcher state cleanup finished.
echo You can now rebuild / package the launcher with a clean state.
echo.
pause
goto :eof

:delete_file
if exist "%~1" (
    del /f /q "%~1" >nul 2>nul
    if exist "%~1" (
        echo [Warn] Failed to delete file: %~1
    ) else (
        echo [Deleted] %~1
    )
) else (
    echo [Skip] File not found: %~1
)
goto :eof

:delete_dir
if exist "%~1" (
    rmdir /s /q "%~1" >nul 2>nul
    if exist "%~1" (
        echo [Warn] Failed to delete directory: %~1
    ) else (
        echo [Deleted] %~1
    )
) else (
    echo [Skip] Directory not found: %~1
)
goto :eof
