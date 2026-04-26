@echo off
chcp 65001 >nul 2>&1
title Run with New UI (LoRA ReScripts)
setlocal EnableDelayedExpansion

echo ========================================
echo Run LoRA ReScripts with New UI
echo ========================================
echo.

cd /d "%~dp0"

:: ============================
:: 路径配置
:: ============================
set "UI_PLUGIN_DIR=%~dp0plugin\lora-scripts-ui-main"
set "UI_DIR=%UI_PLUGIN_DIR%\ui"
set "RUNTIME_PATHS_PS=%~dp0tools\runtime\runtime_paths.ps1"

:: ============================
:: 检查新前端是否存在
:: ============================
if not exist "%UI_DIR%\package.json" (
    echo [X] 未找到新前端文件。
    echo.
    echo 请先初始化 git submodule:
    echo   git submodule update --init plugin/lora-scripts-ui-main
    echo.
    echo 或从 Release 页面下载完整包。
    pause
    exit /b 1
)

:: ============================
:: Step 1: 探测已安装的环境
:: ============================
echo [1/4] 探测已安装的 Python 环境...
echo.

:: 使用 PowerShell 探测环境，类似 install_newbie_support.ps1 的逻辑
set "PS_DETECT_SCRIPT=%TEMP%\detect_runtimes_%RANDOM%.ps1"
(
echo # PowerShell Detection Script
 echo $ErrorActionPreference = 'Stop'
 echo $repoRoot = '%CD%'
 echo . '%RUNTIME_PATHS_PS%'
 echo.
 echo $runtimeSpecs = @(
 echo     [pscustomobject]@{ Name = 'portable'; Label = 'Main Runtime / 主运行时' }
 echo     [pscustomobject]@{ Name = 'flashattention'; Label = 'FlashAttention2 Runtime / FlashAttention2 运行时' }
 echo     [pscustomobject]@{ Name = 'blackwell'; Label = 'Blackwell Runtime / Blackwell 运行时' }
 echo     [pscustomobject]@{ Name = 'sageattention'; Label = 'SageAttention Runtime / SageAttention 运行时' }
 echo     [pscustomobject]@{ Name = 'sageattention2'; Label = 'SageAttention2 Runtime / SageAttention2 运行时' }
 echo     [pscustomobject]@{ Name = 'intel-xpu'; Label = 'Intel XPU Runtime / Intel XPU 运行时' }
 echo     [pscustomobject]@{ Name = 'intel-xpu-sage'; Label = 'Intel XPU Sage Runtime / Intel XPU Sage 运行时' }
 echo     [pscustomobject]@{ Name = 'rocm-amd'; Label = 'AMD ROCm Runtime / AMD ROCm 运行时' }
 echo     [pscustomobject]@{ Name = 'sagebwd-nvidia'; Label = 'SageBwd Runtime / SageBwd 运行时' }
 echo )
 echo.
 echo function Get-PythonExe {
 echo     param([string]$RuntimeDir^)
 echo     $candidates = @(
 echo         (Join-Path $RuntimeDir 'python.exe'),
 echo         (Join-Path $RuntimeDir 'Scripts\python.exe')
 echo     ^)
 echo     foreach ($candidate in $candidates^) {
 echo         if (Test-Path $candidate^) { return $candidate }
 echo     }
 echo     return $null
 echo }
 echo.
 echo $installed = @(^)
 echo foreach ($spec in $runtimeSpecs^) {
 echo     $runtimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName $spec.Name
 echo     $pythonExe = Get-PythonExe -RuntimeDir $runtimeInfo.DirectoryPath
 echo     if ($pythonExe -and (Test-Path $pythonExe^)^) {
 echo         $depsMarker = Join-Path $runtimeInfo.DirectoryPath '.deps_installed'
 echo         if (Test-Path $depsMarker^) {
 echo             $installed += [pscustomobject]@{
 echo                 Name = $spec.Name
 echo                 Label = $spec.Label
 echo                 DirectoryPath = $runtimeInfo.DirectoryPath
 echo                 PythonExe = $pythonExe
 echo             }
 echo         }
 echo     }
 echo }
 echo.
 echo # 输出结果到 JSON 文件
 echo $outputFile = '%TEMP%\detected_runtimes_%RANDOM%.json'
 echo $installed ^| Select-Object Name, Label, DirectoryPath, PythonExe ^| ConvertTo-Json -AsArray ^| Set-Content $outputFile
 echo Write-Host $outputFile
) > "%PS_DETECT_SCRIPT%"

:: 执行探测
for /f "tokens=*" %%i in ('powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS_DETECT_SCRIPT%" 2^>nul') do set "RUNTIME_RESULT_FILE=%%i"
del "%PS_DETECT_SCRIPT%" 2>nul

:: 检查探测结果
if not exist "%RUNTIME_RESULT_FILE%" (
    echo [X] 环境探测失败。
    pause
    exit /b 1
)

:: 解析探测结果（简化处理，使用 PowerShell 来计数）
for /f %%i in ('powershell.exe -NoProfile -Command "(Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json).Count"') do set "RUNTIME_COUNT=%%i"

if "%RUNTIME_COUNT%"=="0" (
    echo [X] 未找到已安装的环境。
    echo.
    echo 请先运行安装脚本:
    echo   - install_venv_portable.ps1      (主环境)
    echo   - install_flashattention.ps1    (FlashAttention2)
    echo   - install_sageattention.ps1     (SageAttention)
    echo   - ...
    echo.
    del "%RUNTIME_RESULT_FILE%" 2>nul
    pause
    exit /b 1
)

echo   发现 %RUNTIME_COUNT% 个已安装环境

:: ============================
:: Step 2: 选择环境（多环境时）
:: ============================
echo.
echo [2/4] 选择运行环境...
echo.

if "%RUNTIME_COUNT%"=="1" (
    :: 单环境，直接读取
    for /f "tokens=*" %%i in ('powershell.exe -NoProfile -Command "(Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json).Name"') do set "SELECTED_RUNTIME=%%i"
    for /f "tokens=*" %%i in ('powershell.exe -NoProfile -Command "(Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json).Label"') do set "SELECTED_LABEL=%%i"
    for /f "tokens=*" %%i in ('powershell.exe -NoProfile -Command "(Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json).DirectoryPath"') do set "SELECTED_PYTHON_DIR=%%i"
    echo   单一环境: %SELECTED_LABEL%
) else (
    :: 多环境，显示选择菜单
    echo 检测到多个已安装环境:
    echo.
    echo   [0] 自动选择 (推荐)
    echo.

    set /a IDX=1
    for /f "delims=" %%i in ('powershell.exe -NoProfile -Command "(Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json) | %% { '[' + ($_.PSObject.Properties.Value[0] -join ',') + ']' }" 2^>nul') do (
        :: 解析每个环境的名字和标签
    )

    :: 重新用更简单的方式显示
    powershell.exe -NoProfile -Command "$runtimes = Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json; for($i=0; $i -lt $runtimes.Count; $i++){ Write-Host ('  [{0}] {1}' -f ($i+1), $runtimes[$i].Label) -ForegroundColor Green; Write-Host ('      路径: {0}' -f $runtimes[$i].DirectoryPath) -ForegroundColor DarkGray }"

    echo.
    set /p "CHOICE=请输入编号 [1-%RUNTIME_COUNT%] 或 0 自动选择: "

    if "!CHOICE!"=="0" (
        :: 自动选择：优先 FlashAttention，其次 portable
        for /f "tokens=*" %%i in ('powershell.exe -NoProfile -Command "$r = (Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json^); $fa = $r ^| Where-Object { $_.Name -eq 'flashattention' }; if($fa^) { $fa[0].Name } else { $r[0].Name }"') do set "SELECTED_RUNTIME=%%i"
    ) else (
        for /f "tokens=*" %%i in ('powershell.exe -NoProfile -Command "$r = Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json; if('!CHOICE!' -match '^\d+$' -and [int]'!CHOICE!' -ge 1 -and [int]'!CHOICE!' -le $r.Count^) { $r[[int]'!CHOICE!'-1].Name } else { $null }"') do set "SELECTED_RUNTIME=%%i"
    )

    if "!SELECTED_RUNTIME!"=="" (
        echo [X] 无效选择。
        del "%RUNTIME_RESULT_FILE%" 2>nul
        pause
        exit /b 1
    )

    :: 获取选中环境的详细信息
    for /f "tokens=*" %%i in ('powershell.exe -NoProfile -Command "$r = (Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json^) ^| Where-Object { $_.Name -eq '%SELECTED_RUNTIME%' }; $r.Label"') do set "SELECTED_LABEL=%%i"
    for /f "tokens=*" %%i in ('powershell.exe -NoProfile -Command "$r = (Get-Content '%RUNTIME_RESULT_FILE%' | ConvertFrom-Json^) ^| Where-Object { $_.Name -eq '%SELECTED_RUNTIME%' }; $r.DirectoryPath"') do set "SELECTED_PYTHON_DIR=%%i"

    echo.
    echo   已选择: %SELECTED_LABEL%
)

del "%RUNTIME_RESULT_FILE%" 2>nul

:: ============================
:: Step 3: 检查/安装 Node.js 依赖
:: ============================
echo.
echo [3/4] 检查前端依赖...

:: 检查 node_modules 是否存在且包含 vite
if exist "%UI_DIR%\node_modules\vite\package.json" (
    echo   依赖已安装，跳过安装步骤。
) else (
    echo   依赖未安装，开始安装...
    echo.

    :: 检查 Node.js
    where node >nul 2>&1
    if !errorlevel! neq 0 (
        echo [X] 未找到 Node.js。
        echo.
        echo 请先安装 Node.js: https://nodejs.org/
        echo 或使用以下脚本安装依赖:
        echo   install_new_ui_node_modules.bat
        pause
        exit /b 1
    )

    cd /d "%UI_DIR%"
    call npm install --registry=https://registry.npmmirror.com

    if !errorlevel! neq 0 (
        echo [X] npm install 失败。
        pause
        exit /b 1
    )

    echo.
    echo [OK] 依赖安装完成。
)

:: ============================
:: Step 4: 启动后端 + 新前端
:: ============================
echo.
echo [4/4] 启动服务...
echo.
echo   运行环境: %SELECTED_LABEL%
echo   后端地址: http://127.0.0.1:28000
echo   前端地址: http://localhost:3006
echo.

:: 设置环境变量
set "HF_HOME=huggingface"
set "HF_HUB_DISABLE_SYMLINKS_WARNING=1"
set "MIKAZUKI_UI_MODE=workspace"

:: 根据选择的 runtime 设置对应的环境变量
if /i "%SELECTED_RUNTIME%"=="sageattention" (
    set "MIKAZUKI_SAGEATTENTION_STARTUP=1"
) else if /i "%SELECTED_RUNTIME%"=="sageattention2" (
    set "MIKAZUKI_SAGEATTENTION2_STARTUP=1"
) else if /i "%SELECTED_RUNTIME%"=="flashattention" (
    set "MIKAZUKI_FLASHATTENTION_STARTUP=1"
) else if /i "%SELECTED_RUNTIME%"=="blackwell" (
    set "MIKAZUKI_BLACKWELL_STARTUP=1"
) else if /i "%SELECTED_RUNTIME%"=="intel-xpu" (
    set "MIKAZUKI_INTEL_XPU_STARTUP=1"
    set "MIKAZUKI_INTEL_XPU_EXPERIMENTAL=1"
    set "MIKAZUKI_STARTUP_ATTENTION_POLICY=runtime_guarded"
) else if /i "%SELECTED_RUNTIME%"=="intel-xpu-sage" (
    set "MIKAZUKI_INTEL_XPU_SAGE_STARTUP=1"
    set "MIKAZUKI_INTEL_XPU_EXPERIMENTAL=1"
    set "MIKAZUKI_INTEL_XPU_SAGE_EXPERIMENTAL=1"
    set "MIKAZUKI_STARTUP_ATTENTION_POLICY=runtime_guarded"
) else if /i "%SELECTED_RUNTIME%"=="rocm-amd" (
    set "MIKAZUKI_ROCM_AMD_STARTUP=1"
    set "MIKAZUKI_AMD_EXPERIMENTAL=1"
    set "MIKAZUKI_STARTUP_ATTENTION_POLICY=runtime_guarded"
) else if /i "%SELECTED_RUNTIME%"=="sagebwd-nvidia" (
    set "MIKAZUKI_SAGEBWD_STARTUP=1"
)

:: 生成并启动后端 PowerShell 脚本（最小化窗口）
set "BE_PS_SCRIPT=%TEMP%\new_ui_backend_%RANDOM%.ps1"
(
echo $ErrorActionPreference = 'Continue'
echo Set-Location '%CD%'
echo $Env:HF_HOME = 'huggingface'
echo $Env:HF_HUB_DISABLE_SYMLINKS_WARNING = '1'
echo $Env:MIKAZUKI_UI_MODE = 'workspace'
if defined MIKAZUKI_SAGEATTENTION_STARTUP echo $Env:MIKAZUKI_SAGEATTENTION_STARTUP = '1'
if defined MIKAZUKI_SAGEATTENTION2_STARTUP echo $Env:MIKAZUKI_SAGEATTENTION2_STARTUP = '1'
if defined MIKAZUKI_FLASHATTENTION_STARTUP echo $Env:MIKAZUKI_FLASHATTENTION_STARTUP = '1'
if defined MIKAZUKI_BLACKWELL_STARTUP echo $Env:MIKAZUKI_BLACKWELL_STARTUP = '1'
if defined MIKAZUKI_INTEL_XPU_STARTUP echo $Env:MIKAZUKI_INTEL_XPU_STARTUP = '1'
if defined MIKAZUKI_INTEL_XPU_EXPERIMENTAL echo $Env:MIKAZUKI_INTEL_XPU_EXPERIMENTAL = '1'
if defined MIKAZUKI_INTEL_XPU_SAGE_STARTUP echo $Env:MIKAZUKI_INTEL_XPU_SAGE_STARTUP = '1'
if defined MIKAZUKI_INTEL_XPU_SAGE_EXPERIMENTAL echo $Env:MIKAZUKI_INTEL_XPU_SAGE_EXPERIMENTAL = '1'
if defined MIKAZUKI_ROCM_AMD_STARTUP echo $Env:MIKAZUKI_ROCM_AMD_STARTUP = '1'
if defined MIKAZUKI_AMD_EXPERIMENTAL echo $Env:MIKAZUKI_AMD_EXPERIMENTAL = '1'
if defined MIKAZUKI_SAGEBWD_STARTUP echo $Env:MIKAZUKI_SAGEBWD_STARTUP = '1'
if defined MIKAZUKI_STARTUP_ATTENTION_POLICY echo $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY = '%MIKAZUKI_STARTUP_ATTENTION_POLICY%'
echo.
echo try {
echo     ^& '%CD%\tools\runtime\launcher.ps1' -Mode Auto -Selection '%SELECTED_RUNTIME%' -ForwardArgs '--port','28000','--dev'
echo } catch {
echo     Write-Host -ForegroundColor Red 'Backend error: $_'
echo }
echo Write-Host ''
echo Write-Host '[Backend stopped / Press any key to close]'
echo $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
) > "%BE_PS_SCRIPT%"

:: 在最小化窗口中启动后端
start "LoRA-Backend" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%BE_PS_SCRIPT%"

:: 等待后端就绪
echo   等待后端启动...
set "BE_READY=0"
for /L %%i in (1,1,30) do (
    if "!BE_READY!"=="0" (
        timeout /t 2 /nobreak >nul
        curl -s -o nul -w "" http://127.0.0.1:28000/ >nul 2>&1
        if !errorlevel! equ 0 (
            set "BE_READY=1"
            echo   [OK] 后端已就绪。
        ) else (
            echo     ...等待中 %%i/30
        )
    )
)
if "!BE_READY!"=="0" (
    echo.
    echo [!] 后端可能尚未就绪。请稍等或检查最小化的 LoRA-Backend 窗口。
    echo     按任意键继续启动前端...
    pause >nul
)

:: 启动前端
echo.
echo   启动新前端...
cd /d "%UI_DIR%"
set "LORA_SCRIPTS_ROOT=%~dp0"
call npx vite --port 3006 --open

:: 清理
del "%BE_PS_SCRIPT%" 2>nul

echo.
echo ========================================
echo 服务已停止
pause
exit /b 0
