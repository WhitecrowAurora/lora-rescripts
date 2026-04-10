$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$launchLogsDir = Join-Path $repoRoot "logs\launcher"
$launchTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$script:LaunchTranscriptPath = Join-Path $launchLogsDir ("run_gui-" + $launchTimestamp + ".log")
$script:LaunchTranscriptStarted = $false

function Start-LaunchTranscript {
    if ($script:LaunchTranscriptStarted) {
        return
    }

    New-Item -ItemType Directory -Force -Path $launchLogsDir | Out-Null
    try {
        Start-Transcript -Path $script:LaunchTranscriptPath -Append | Out-Null
        $script:LaunchTranscriptStarted = $true
    }
    catch {
        $script:LaunchTranscriptStarted = $false
    }
}

function Stop-LaunchTranscript {
    if (-not $script:LaunchTranscriptStarted) {
        return
    }

    try {
        Stop-Transcript | Out-Null
    }
    catch {
    }
    finally {
        $script:LaunchTranscriptStarted = $false
    }
}

Start-LaunchTranscript
$Env:MIKAZUKI_LAUNCH_LOG = $script:LaunchTranscriptPath
Write-Host -ForegroundColor DarkGray "Launcher log / 启动日志: $($script:LaunchTranscriptPath)"

trap {
    try {
        Write-Host -ForegroundColor Red "Launcher error / 启动错误: $($_.Exception.Message)"
        if ($script:LaunchTranscriptPath) {
            Write-Host -ForegroundColor Yellow "Launcher log saved to / 启动日志已保存到: $($script:LaunchTranscriptPath)"
        }
    }
    finally {
        Stop-LaunchTranscript
    }
    throw
}

. (Join-Path $repoRoot "tools\runtime\runtime_paths.ps1")

$flashAttentionRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "flashattention"
$flashAttentionRuntimeDirName = $flashAttentionRuntimeInfo.DirectoryName
$flashAttentionRuntimeDir = $flashAttentionRuntimeInfo.DirectoryPath
$flashAttentionPython = Join-Path $flashAttentionRuntimeDir "python.exe"
$flashAttentionDepsMarker = Join-Path $flashAttentionRuntimeDir ".deps_installed"

$blackwellRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "blackwell"
$blackwellRuntimeDir = $blackwellRuntimeInfo.DirectoryPath
$blackwellPython = Join-Path $blackwellRuntimeDir "python.exe"
$blackwellDepsMarker = Join-Path $blackwellRuntimeDir ".deps_installed"

$sageAttentionRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "sageattention"
$sageAttentionRuntimeDirName = $sageAttentionRuntimeInfo.DirectoryName
$sageAttentionRuntimeDir = $sageAttentionRuntimeInfo.DirectoryPath
$sageAttentionPython = Join-Path $sageAttentionRuntimeDir "python.exe"
$sageAttentionDepsMarker = Join-Path $sageAttentionRuntimeDir ".deps_installed"

$sageAttention2RuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "sageattention2"
$sageAttention2RuntimeDirName = $sageAttention2RuntimeInfo.DirectoryName
$sageAttention2RuntimeDir = $sageAttention2RuntimeInfo.DirectoryPath
$sageAttention2Python = Join-Path $sageAttention2RuntimeDir "python.exe"
$sageAttention2DepsMarker = Join-Path $sageAttention2RuntimeDir ".deps_installed"

$intelXpuRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "intel-xpu"
$intelXpuRuntimeDirName = $intelXpuRuntimeInfo.DirectoryName
$intelXpuRuntimeDir = $intelXpuRuntimeInfo.DirectoryPath
$intelXpuPython = Join-Path $intelXpuRuntimeDir "python.exe"
$intelXpuDepsMarker = Join-Path $intelXpuRuntimeDir ".deps_installed"

$intelXpuSageRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "intel-xpu-sage"
$intelXpuSageRuntimeDirName = $intelXpuSageRuntimeInfo.DirectoryName
$intelXpuSageRuntimeDir = $intelXpuSageRuntimeInfo.DirectoryPath
$intelXpuSagePython = Join-Path $intelXpuSageRuntimeDir "python.exe"
$intelXpuSageDepsMarker = Join-Path $intelXpuSageRuntimeDir ".deps_installed"

$rocmAmdRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "rocm-amd"
$rocmAmdRuntimeDirName = $rocmAmdRuntimeInfo.DirectoryName
$rocmAmdRuntimeDir = $rocmAmdRuntimeInfo.DirectoryPath
$rocmAmdPython = Join-Path $rocmAmdRuntimeDir "python.exe"
$rocmAmdDepsMarker = Join-Path $rocmAmdRuntimeDir ".deps_installed"

$portableRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "portable"
$portableRuntimeDir = $portableRuntimeInfo.DirectoryPath
$portablePython = Join-Path $portableRuntimeDir "python.exe"
$portableDepsMarker = Join-Path $portableRuntimeDir ".deps_installed"

$venvRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "venv"
$venvRuntimeDir = $venvRuntimeInfo.DirectoryPath
$venvPython = Join-Path $venvRuntimeDir "Scripts\python.exe"
$venvDepsMarker = Join-Path $venvRuntimeDir ".deps_installed"

$portableTagEditorRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "tageditor"
$portableTagEditorRuntimeDir = $portableTagEditorRuntimeInfo.DirectoryPath
$portableTagEditorPython = Join-Path $portableTagEditorRuntimeDir "python.exe"

$venvTagEditorRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "venv-tageditor"
$venvTagEditorRuntimeDir = $venvTagEditorRuntimeInfo.DirectoryPath
$venvTagEditorPython = Join-Path $venvTagEditorRuntimeDir "Scripts\python.exe"
$allowExternalPython = $Env:MIKAZUKI_ALLOW_SYSTEM_PYTHON -eq "1"
$preferFlashAttentionRuntime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "flashattention"
$preferBlackwellRuntime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "blackwell"
$preferSageAttentionRuntime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "sageattention"
$preferSageAttention2Runtime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "sageattention2"
$preferIntelXpuRuntime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "intel-xpu"
$preferIntelXpuSageRuntime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "intel-xpu-sage"
$preferRocmAmdRuntime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "rocm-amd"
$rocmAmdRecommendedGraphicsDriverVersion = "26.2.2"
$intelXpuRecommendedGraphicsDriverPackageVersion = "32.0.101.6127_101.6044"
$intelXpuRecommendedGraphicsDriverDiscreteVersion = "32.0.101.6127"
$intelXpuRecommendedGraphicsDriverIntegratedVersion = "32.0.101.6044"
$baseRuntimeModules = @("accelerate", "torch", "fastapi", "toml", "transformers", "diffusers")
$mainRuntimeModules = @($baseRuntimeModules + @("lion_pytorch", "dadaptation", "schedulefree", "prodigyopt", "prodigyplus", "pytorch_optimizer"))
$flashAttentionRuntimeModules = @($mainRuntimeModules + @("flash_attn"))
$intelRuntimeModules = @($baseRuntimeModules + @("lion_pytorch", "cv2"))
$intelSageRuntimeModules = @($intelRuntimeModules + @("sageattention"))
$amdRuntimeModules = @($baseRuntimeModules + @("cv2"))
$blackwellPreferredProfile = "czmahi-20250502"
$sageAttentionPreferredProfile = "triton-v1"
$sageAttention2PreferredProfile = "triton-v2"

. (Join-Path $repoRoot "tools\runtime\console_i18n.ps1")
Set-ConsoleLanguage -Language $(if ($Env:MIKAZUKI_CONSOLE_LANG) { $Env:MIKAZUKI_CONSOLE_LANG } else { 'auto' }) | Out-Null

$script:OriginalGetConsoleRuntimeDisplayName = (Get-Command Get-ConsoleRuntimeDisplayName -CommandType Function).ScriptBlock
. (Join-Path $repoRoot "tools\runtime\experimental_runtime.ps1")
. (Join-Path $repoRoot "tools\runtime\runtime_bootstrap.ps1")

function Get-ConsoleRuntimeDisplayName {
    param(
        [string]$RuntimeName,
        [ValidateSet('status', 'python')]
        [string]$Kind = 'status'
    )

    if ($RuntimeName -eq 'rocm-amd') {
        return Get-ExperimentalRuntimeDisplayName -RuntimeName 'rocm-amd' -Kind $Kind
    }
    if ($RuntimeName -eq 'intel-xpu-sage') {
        return Get-ExperimentalRuntimeDisplayName -RuntimeName 'intel-xpu-sage' -Kind $Kind
    }
    if ($RuntimeName -eq 'intel-xpu') {
        return Get-ExperimentalRuntimeDisplayName -RuntimeName 'intel-xpu' -Kind $Kind
    }

    return & $script:OriginalGetConsoleRuntimeDisplayName -RuntimeName $RuntimeName -Kind $Kind
}

function Get-SageRuntimeDisplayNameFromDirName {
    param(
        [string]$RuntimeDirName
    )

    if ($RuntimeDirName -in (Get-RuntimeDirectoryNames -RuntimeName 'sageattention2')) {
        return Get-ConsoleRuntimeDisplayName -RuntimeName 'sageattention2'
    }
    return Get-ConsoleRuntimeDisplayName -RuntimeName 'sageattention'
}

function Convert-BlackwellRuntimeErrorMessage {
    param(
        [string]$Message
    )

    if ([string]::IsNullOrWhiteSpace($Message)) {
        return Get-ConsoleText -Key 'issue_xformers_import_failed'
    }
    if ($Message -match '^torch import failed:\s*(.*)$') {
        return (Get-ConsoleText -Key 'issue_torch_import_failed') + ": $($Matches[1])"
    }
    return $Message
}

function Convert-SageAttentionRuntimeErrorMessage {
    param(
        [string]$Message
    )

    if ([string]::IsNullOrWhiteSpace($Message)) {
        return Get-ConsoleText -Key 'issue_sage_import_failed'
    }
    if ($Message -eq 'sageattention import succeeded but required symbols are missing') {
        return Get-ConsoleText -Key 'issue_sage_symbols_missing'
    }
    if ($Message -match '^torch import failed:\s*(.*)$') {
        return (Get-ConsoleText -Key 'issue_torch_import_failed') + ": $($Matches[1])"
    }
    if ($Message -match '^triton import failed:\s*(.*)$') {
        return (Get-ConsoleText -Key 'issue_triton_import_failed') + ": $($Matches[1])"
    }
    if ($Message -match '_fused|DLL load failed') {
        return Get-ConsoleText -Key 'issue_sage_native_extension_failed'
    }
    return $Message
}

function Convert-FlashAttentionRuntimeErrorMessage {
    param(
        [string]$Message
    )

    if ([string]::IsNullOrWhiteSpace($Message)) {
        return Get-ConsoleText -Key 'issue_flash_import_failed'
    }
    if ($Message -match '^torch import failed:\s*(.*)$') {
        return (Get-ConsoleText -Key 'issue_torch_import_failed') + ": $($Matches[1])"
    }
    if ($Message -eq 'flash-attn import succeeded but required symbols are missing') {
        return Get-ConsoleText -Key 'issue_flash_import_failed'
    }
    if ($Message -match '^flash-attn runtime probe failed:\s*(.*)$') {
        return (Get-ConsoleText -Key 'issue_flash_import_failed') + ": $($Matches[1])"
    }
    return $Message
}

function Format-BlackwellRuntimeSummary {
    param(
        [object]$Probe
    )

    return Get-ConsoleText -Key 'runtime_summary_blackwell' -Tokens @{
        python = $Probe.python_version
        torch = $Probe.torch_version
        torchvision = $Probe.torchvision_version
        xformers = $Probe.xformers_version
    }
}

function Format-SageAttentionRuntimeSummary {
    param(
        [object]$Probe
    )

    return Get-ConsoleText -Key 'runtime_summary_sage' -Tokens @{
        python = $Probe.python_version
        torch = $Probe.torch_version
        torchvision = $Probe.torchvision_version
        triton = $Probe.triton_version
        sageattention = $Probe.sageattention_version
    }
}

function Format-FlashAttentionRuntimeSummary {
    param(
        [object]$Probe
    )

    return Get-ConsoleText -Key 'runtime_summary_flashattention' -Tokens @{
        python = $Probe.python_version
        torch = $Probe.torch_version
        torchvision = $Probe.torchvision_version
        flashattention = $Probe.flashattention_version
    }
}

function Get-NormalizedSemanticVersionString {
    param(
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    $match = [regex]::Match($Value, '\d+\.\d+\.\d+(?:\.\d+)?')
    if (-not $match.Success) {
        return $null
    }

    $parts = $match.Value.Split('.')
    if ($parts.Count -lt 3) {
        return $null
    }

    return ($parts[0..2] -join '.')
}

function Test-SemanticVersionAtLeast {
    param(
        [string]$CurrentVersion,
        [string]$MinimumVersion
    )

    $currentNormalized = Get-NormalizedSemanticVersionString -Value $CurrentVersion
    $minimumNormalized = Get-NormalizedSemanticVersionString -Value $MinimumVersion
    if ([string]::IsNullOrWhiteSpace($currentNormalized) -or [string]::IsNullOrWhiteSpace($minimumNormalized)) {
        return $false
    }

    return ([Version]$currentNormalized) -ge ([Version]$minimumNormalized)
}

function Get-UniqueNonEmptyValues {
    param(
        [object[]]$Values
    )

    $result = New-Object System.Collections.Generic.List[string]
    foreach ($value in ($Values | Where-Object { $null -ne $_ })) {
        $text = [string]$value
        if ([string]::IsNullOrWhiteSpace($text)) {
            continue
        }
        $trimmed = $text.Trim()
        if ($trimmed -and -not $result.Contains($trimmed)) {
            $result.Add($trimmed) | Out-Null
        }
    }
    return $result
}

function New-MissingDedicatedRuntimeMessage {
    param(
        [string]$RuntimeName,
        [string]$ExpectedPath,
        [string]$PythonMinor,
        [string]$RuntimeDirName,
        [string]$RuntimeDirPath,
        [string]$RerunScript
    )

    $runtimeDirDisplay = $RuntimeDirName
    if (-not [string]::IsNullOrWhiteSpace($RuntimeDirPath)) {
        try {
            $repoRootPath = [System.IO.Path]::GetFullPath($repoRoot)
            $runtimeDirFullPath = [System.IO.Path]::GetFullPath($RuntimeDirPath)
            if ($runtimeDirFullPath.StartsWith($repoRootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
                $relativeDir = $runtimeDirFullPath.Substring($repoRootPath.Length).TrimStart('\', '/')
                if (-not [string]::IsNullOrWhiteSpace($relativeDir)) {
                    $runtimeDirDisplay = $relativeDir -replace '/', '\'
                }
            }
        }
        catch {
        }
    }

    return Get-ConsoleText -Key 'missing_dedicated_runtime' -Tokens @{
        runtime = Get-ConsoleRuntimeDisplayName -RuntimeName $RuntimeName
        expected_path = $ExpectedPath
        python_minor = $PythonMinor
        runtime_dir = $runtimeDirDisplay
        rerun_script = $RerunScript
    }
}

if ((@($preferFlashAttentionRuntime, $preferBlackwellRuntime, $preferSageAttentionRuntime, $preferSageAttention2Runtime, $preferIntelXpuRuntime, $preferIntelXpuSageRuntime, $preferRocmAmdRuntime) | Where-Object { $_ }).Count -gt 1) {
    switch (Get-ConsoleLanguage) {
        'zh' {
            throw '同一时间只能指定一个专用运行时。请清理 MIKAZUKI_PREFERRED_RUNTIME，或在 flashattention / blackwell / sageattention / sageattention2 / intel-xpu / intel-xpu-sage / rocm-amd 中只保留一个。'
        }
        'ja' {
            throw '専用ランタイムは同時に 1 つだけ指定できます。MIKAZUKI_PREFERRED_RUNTIME を消去するか、flashattention / blackwell / sageattention / sageattention2 / intel-xpu / intel-xpu-sage / rocm-amd のどれか 1 つだけを指定してください。'
        }
        default {
            throw 'Only one dedicated runtime can be preferred at a time. Clear MIKAZUKI_PREFERRED_RUNTIME or choose flashattention / blackwell / sageattention / sageattention2 / intel-xpu / intel-xpu-sage / rocm-amd.'
        }
    }
}

function Test-PipReady {
    param (
        [string]$PythonExe
    )

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $PythonExe -m pip --version 1>$null 2>$null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Test-PythonPackageInstalled {
    param (
        [string]$PythonExe,
        [string]$PackageName
    )

    if ([string]::IsNullOrWhiteSpace($PackageName)) {
        return $false
    }

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $PythonExe -c "import importlib.metadata as md, sys
names = [sys.argv[1], sys.argv[1].replace('-', '_'), sys.argv[1].replace('_', '-')]
for name in names:
    try:
        md.version(name)
        raise SystemExit(0)
    except Exception:
        pass
raise SystemExit(1)" $PackageName 1>$null 2>$null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Remove-AmdRuntimeIncompatiblePackageSafeguard {
    param (
        [string]$PythonExe,
        [string]$RuntimeName
    )

    if ($RuntimeName -notin @("rocm-amd")) {
        return
    }
    if (-not (Test-PipReady -PythonExe $PythonExe)) {
        return
    }

    $candidatePackages = @("bitsandbytes", "bitsandbytes-rocm", "pytorch_optimizer")
    $installedPackages = @(
        $candidatePackages | Where-Object {
            Test-PythonPackageInstalled -PythonExe $PythonExe -PackageName $_
        }
    )

    if (-not $installedPackages -or $installedPackages.Count -eq 0) {
        return
    }

    switch (Get-ConsoleLanguage) {
        'zh' {
            Write-Host -ForegroundColor Yellow "检测到当前 AMD ROCm 运行时里残留了不兼容包：$($installedPackages -join ', ')。"
            Write-Host -ForegroundColor Yellow "为避免 A+N 双显卡或混合环境把不适合 AMD 的优化器包污染进当前 AMD 运行时，启动器将先自动卸载这些包；不会影响其他 Python 环境。"
        }
        'ja' {
            Write-Host -ForegroundColor Yellow "現在の AMD ROCm ランタイム内に互換性のないパッケージが残っています: $($installedPackages -join ', ')。"
            Write-Host -ForegroundColor Yellow "A+N 混在環境で AMD に適さない optimizer パッケージが現在の AMD ランタイムへ混入した場合の起動障害を避けるため、起動前に自動アンインストールします。他の Python 環境には影響しません。"
        }
        default {
            Write-Host -ForegroundColor Yellow "Detected incompatible packages inside the current AMD ROCm runtime: $($installedPackages -join ', ')."
            Write-Host -ForegroundColor Yellow "To avoid mixed A+N environments polluting the current AMD runtime with optimizer packages that are not suitable for AMD, the launcher will uninstall them before startup. Other Python environments are not affected."
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        $null = & $PythonExe -m pip uninstall -y @installedPackages 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($exitCode -ne 0) {
        switch (Get-ConsoleLanguage) {
            'zh' {
                Write-Host -ForegroundColor Yellow "警告：AMD ROCm 启动前自动卸载不兼容包失败。若后续仍有相关报错，请在当前 AMD 运行时里手动执行 pip uninstall -y bitsandbytes bitsandbytes-rocm pytorch_optimizer。"
            }
            'ja' {
                Write-Host -ForegroundColor Yellow "警告: AMD ROCm 起動前の互換性のないパッケージ自動アンインストールに失敗しました。関連エラーが続く場合は、この AMD ランタイムで pip uninstall -y bitsandbytes bitsandbytes-rocm pytorch_optimizer を手動実行してください。"
            }
            default {
                Write-Host -ForegroundColor Yellow "Warning: automatic uninstall of incompatible packages failed before AMD ROCm startup. If related errors continue, run pip uninstall -y bitsandbytes bitsandbytes-rocm pytorch_optimizer manually in the current AMD runtime."
            }
        }
    }
}

function Test-ModulesReady {
    param (
        [string]$PythonExe,
        [string[]]$Modules
    )

    if (-not $Modules -or $Modules.Count -eq 0) {
        return $true
    }

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $PythonExe -c "import importlib, sys;
repo_root = sys.argv[1]
if repo_root and repo_root not in sys.path:
    sys.path.insert(0, repo_root)
try:
    from mikazuki.utils.runtime_import_guards import install_experimental_runtime_import_guards
except Exception:
    install_experimental_runtime_import_guards = None
if install_experimental_runtime_import_guards is not None:
    try:
        install_experimental_runtime_import_guards()
    except Exception:
        pass
failed=[]
for name in sys.argv[2:]:
    try:
        importlib.import_module(name)
    except Exception:
        failed.append(name)
raise SystemExit(1 if failed else 0)" $repoRoot @Modules 1>$null 2>$null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Test-PackageConstraints {
    param (
        [string]$PythonExe,
        [hashtable]$Constraints
    )

    if (-not $Constraints -or $Constraints.Count -eq 0) {
        return $true
    }

    $pairs = @()
    foreach ($entry in $Constraints.GetEnumerator()) {
        $pairs += "$($entry.Key)$([char]31)$($entry.Value)"
    }

    $script = @"
import sys
import importlib.metadata as md
from pip._vendor.packaging.specifiers import SpecifierSet
from pip._vendor.packaging.version import Version

ok = True
for item in sys.argv[1:]:
    name, spec = item.split(chr(31), 1)
    try:
        version = md.version(name)
    except md.PackageNotFoundError:
        ok = False
        continue
    if spec and Version(version) not in SpecifierSet(spec):
        ok = False

raise SystemExit(0 if ok else 1)
"@

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $PythonExe -c $script @pairs 1>$null 2>$null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Get-PythonMinorVersion {
    param (
        [string]$PythonExe
    )

    $version = & $PythonExe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }
    return $version.Trim()
}

function Set-DedicatedRuntimeCaches {
    param (
        [string]$RuntimeName,
        [string]$PythonExe
    )

    if ($RuntimeName -notin @("flashattention", "blackwell", "sageattention", "sageattention2", "intel-xpu", "intel-xpu-sage", "rocm-amd")) {
        return
    }

    $runtimeRoot = Split-Path -Parent $PythonExe
    if ([string]::IsNullOrWhiteSpace($runtimeRoot) -or -not (Test-Path $runtimeRoot)) {
        return
    }

    $cacheRoot = Join-Path $runtimeRoot ".cache"
    if ($RuntimeName -in @("rocm-amd", "intel-xpu", "intel-xpu-sage")) {
        $torchInductorCacheDir = if ($Env:TORCHINDUCTOR_CACHE_DIR) { $Env:TORCHINDUCTOR_CACHE_DIR } else { Join-Path $cacheRoot "torchinductor" }
        foreach ($path in @($cacheRoot, $torchInductorCacheDir)) {
            if (-not (Test-Path $path)) {
                New-Item -ItemType Directory -Path $path -Force | Out-Null
            }
        }
        if (-not $Env:TORCHINDUCTOR_CACHE_DIR) {
            $Env:TORCHINDUCTOR_CACHE_DIR = $torchInductorCacheDir
        }

        Write-ConsoleText -Key 'cache_enabled_header' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName $RuntimeName) } -ForegroundColor 'DarkGray'
        Write-Host -ForegroundColor DarkGray "- TORCHINDUCTOR_CACHE_DIR=$torchInductorCacheDir"
        return
    }

    $tritonCacheDir = if ($Env:TRITON_CACHE_DIR) { $Env:TRITON_CACHE_DIR } else { Join-Path $cacheRoot "triton" }
    $torchInductorCacheDir = if ($Env:TORCHINDUCTOR_CACHE_DIR) { $Env:TORCHINDUCTOR_CACHE_DIR } else { Join-Path $cacheRoot "torchinductor" }

    foreach ($path in @($cacheRoot, $tritonCacheDir, $torchInductorCacheDir)) {
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
        }
    }

    if (-not $Env:TRITON_CACHE_DIR) {
        $Env:TRITON_CACHE_DIR = $tritonCacheDir
    }
    if (-not $Env:TORCHINDUCTOR_CACHE_DIR) {
        $Env:TORCHINDUCTOR_CACHE_DIR = $torchInductorCacheDir
    }

    if (-not $Env:TRITON_HOME) {
        $Env:TRITON_HOME = $cacheRoot
    }

    Write-ConsoleText -Key 'cache_enabled_header' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName $RuntimeName) } -ForegroundColor 'DarkGray'
    Write-Host -ForegroundColor DarkGray "- TRITON_CACHE_DIR=$tritonCacheDir"
    Write-Host -ForegroundColor DarkGray "- TORCHINDUCTOR_CACHE_DIR=$torchInductorCacheDir"
}

function Get-BlackwellExpectedPackageVersions {
    param (
        [string]$Profile
    )

    switch ($Profile) {
        "czmahi-20250502" {
            return @{
                PythonMinor = "3.12"
                Torch = "2.8.0.dev20250501+cu128"
                TorchVision = "0.22.0.dev20250502+cu128"
                Xformers = "0.0.31+8fc8ec5a.d20250503"
            }
        }
        "panchovix-20250321" {
            return @{
                PythonMinor = "3.12"
                Torch = "2.8.0.dev20250320+cu128"
                TorchVision = "0.22.0.dev20250321+cu128"
                Xformers = "0.0.30+9a2cd3ef.d20250321"
            }
        }
        default {
            return @{
                PythonMinor = "3.12"
                Torch = ""
                TorchVision = ""
                Xformers = ""
            }
        }
    }
}

function Get-SageAttentionExpectedPackageVersions {
    param (
        [string]$Profile
    )

    switch ($Profile) {
        "triton-v1" {
            return @{
                PythonMinor = ""
                Torch = "2.10.0+cu128"
                TorchVision = "0.25.0+cu128"
                SageAttention = ""
                Triton = ""
            }
        }
        "triton-v2" {
            return @{
                PythonMinor = "3.12"
                Torch = "2.6.0+cu124"
                TorchVision = "0.21.0+cu124"
                SageAttention = "2.2.0"
                Triton = "3.5.1.post24"
            }
        }
        default {
            return @{
                PythonMinor = ""
                Torch = ""
                TorchVision = ""
                SageAttention = ""
                Triton = ""
            }
        }
    }
}

function Get-FlashAttentionExpectedPackageVersions {
    return @{
        PythonMinor = ""
        TorchPrefix = "2.10.0+cu128"
        TorchVisionPrefix = "0.25.0+cu128"
        FlashAttentionPrefix = "2.8.3"
    }
}

function ConvertFrom-PythonJsonTail {
    param (
        [object]$Raw
    )

    if ($null -eq $Raw) {
        return $null
    }

    $text = if ($Raw -is [System.Array]) {
        ($Raw | ForEach-Object { [string]$_ }) -join [Environment]::NewLine
    }
    else {
        [string]$Raw
    }

    if ([string]::IsNullOrWhiteSpace($text)) {
        return $null
    }

    $jsonLine = $text -split "\r?\n" |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ -match '^[\{\[]' } |
        Select-Object -Last 1

    if ([string]::IsNullOrWhiteSpace($jsonLine)) {
        return $null
    }

    try {
        return $jsonLine | ConvertFrom-Json
    }
    catch {
        return $null
    }
}

function Invoke-PythonJsonProbe {
    param (
        [string]$PythonExe,
        [string]$ScriptContent
    )

    $tempPath = [System.IO.Path]::GetTempFileName()
    $tempPyPath = [System.IO.Path]::ChangeExtension($tempPath, ".py")
    Move-Item -LiteralPath $tempPath -Destination $tempPyPath -Force

    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($tempPyPath, $ScriptContent, $utf8NoBom)
        $previousErrorActionPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = "Continue"
            $raw = & $PythonExe $tempPyPath 2>$null
        }
        finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }

        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($raw)) {
            return $null
        }

        return ConvertFrom-PythonJsonTail -Raw $raw
    }
    finally {
        Remove-Item -LiteralPath $tempPyPath -Force -ErrorAction SilentlyContinue
    }
}

function Get-BlackwellRuntimeProbe {
    param (
        [string]$PythonExe
    )

    $script = @"
import json
import sys
import importlib.metadata as md

result = {
    "python_version": sys.version.split()[0],
    "python_minor": f"{sys.version_info.major}.{sys.version_info.minor}",
    "torch_version": "",
    "torchvision_version": "",
    "xformers_version": "",
    "cuda_available": False,
    "xformers_import_ok": False,
    "xformers_ops_ok": False,
    "xformers_error": "",
}

try:
    import torch
except Exception as exc:
    result["xformers_error"] = f"torch import failed: {exc}"
    print(json.dumps(result))
    raise SystemExit(0)

result["torch_version"] = getattr(torch, "__version__", "")
result["cuda_available"] = bool(torch.cuda.is_available())

try:
    result["torchvision_version"] = md.version("torchvision")
except Exception:
    result["torchvision_version"] = ""

try:
    result["xformers_version"] = md.version("xformers")
except Exception:
    result["xformers_version"] = ""

try:
    import xformers
    result["xformers_import_ok"] = True
    _ = xformers.__version__
    from xformers.ops import memory_efficient_attention  # noqa: F401
    result["xformers_ops_ok"] = True
except Exception as exc:
    result["xformers_error"] = str(exc)

print(json.dumps(result))
"@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $script
}

function Get-SageAttentionRuntimeProbe {
    param (
        [string]$PythonExe
    )

    $script = @"
import json
import sys
import importlib.metadata as md

result = {
    "python_version": sys.version.split()[0],
    "python_minor": f"{sys.version_info.major}.{sys.version_info.minor}",
    "torch_version": "",
    "torchvision_version": "",
    "sageattention_version": "",
    "triton_version": "",
    "cuda_available": False,
    "triton_import_ok": False,
    "sageattention_import_ok": False,
    "sageattention_symbols_ok": False,
    "sageattention_error": "",
}

def metadata_version(*names):
    for name in names:
        try:
            return md.version(name)
        except Exception:
            continue
    return ""

try:
    import torch
except Exception as exc:
    result["sageattention_error"] = f"torch import failed: {exc}"
    print(json.dumps(result))
    raise SystemExit(0)

result["torch_version"] = getattr(torch, "__version__", "")
result["cuda_available"] = bool(torch.cuda.is_available())
result["torchvision_version"] = metadata_version("torchvision")
result["sageattention_version"] = metadata_version("sageattention")
result["triton_version"] = metadata_version("triton-windows", "triton")

try:
    import triton  # noqa: F401
    result["triton_import_ok"] = True
except Exception as exc:
    result["sageattention_error"] = f"triton import failed: {exc}"
    print(json.dumps(result))
    raise SystemExit(0)

try:
    from sageattention import sageattn, sageattn_varlen
    result["sageattention_import_ok"] = True
    result["sageattention_symbols_ok"] = callable(sageattn) and callable(sageattn_varlen)
    if not result["sageattention_symbols_ok"]:
        result["sageattention_error"] = "sageattention import succeeded but required symbols are missing"
except Exception as exc:
    result["sageattention_error"] = str(exc)

print(json.dumps(result))
"@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $script
}

function Get-FlashAttentionRuntimeProbe {
    param (
        [string]$PythonExe
    )

    $script = @"
import json
import sys
import importlib.metadata as md

result = {
    "python_version": sys.version.split()[0],
    "python_minor": f"{sys.version_info.major}.{sys.version_info.minor}",
    "torch_version": "",
    "torchvision_version": "",
    "flashattention_version": "",
    "cuda_available": False,
    "flashattention_import_ok": False,
    "flashattention_runtime_ok": False,
    "flashattention_error": "",
}

def metadata_version(*names):
    for name in names:
        try:
            return md.version(name)
        except Exception:
            continue
    return ""

try:
    import torch
except Exception as exc:
    result["flashattention_error"] = f"torch import failed: {exc}"
    print(json.dumps(result))
    raise SystemExit(0)

result["torch_version"] = getattr(torch, "__version__", "")
result["cuda_available"] = bool(torch.cuda.is_available())
result["torchvision_version"] = metadata_version("torchvision")
result["flashattention_version"] = metadata_version("flash-attn", "flash_attn")

try:
    import flash_attn  # noqa: F401
    from flash_attn.flash_attn_interface import flash_attn_func
    result["flashattention_import_ok"] = callable(flash_attn_func)
    if not result["flashattention_import_ok"]:
        result["flashattention_error"] = "flash-attn import succeeded but required symbols are missing"
except Exception as exc:
    result["flashattention_error"] = str(exc)

if result["flashattention_import_ok"] and result["cuda_available"]:
    try:
        q = torch.randn((1, 32, 4, 64), device="cuda", dtype=torch.float16)
        out = flash_attn_func(q, q, q, 0.0)
        torch.cuda.synchronize()
        result["flashattention_runtime_ok"] = tuple(out.shape) == tuple(q.shape)
        if not result["flashattention_runtime_ok"]:
            result["flashattention_error"] = f"flash-attn runtime returned unexpected shape: {tuple(out.shape)}"
    except Exception as exc:
        result["flashattention_error"] = f"flash-attn runtime probe failed: {exc}"

print(json.dumps(result))
"@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $script
}

function Test-BlackwellRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected,
        [ref]$Message
    )

    $probe = Get-BlackwellRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        $Message.Value = Get-ConsoleText -Key 'probe_runtime_details_failed' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'blackwell') }
        return $false
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinor -and $probe.python_minor -ne $Expected.PythonMinor) {
        $issues.Add((Get-ConsoleText -Key 'issue_python_minor_mismatch' -Tokens @{ actual = $probe.python_minor; expected = $Expected.PythonMinor })) | Out-Null
    }
    if ($Expected.TorchPrefix -and ([string]::IsNullOrWhiteSpace($probe.torch_version) -or -not $probe.torch_version.StartsWith($Expected.TorchPrefix))) {
        $issues.Add((Get-ConsoleText -Key 'issue_torch_mismatch' -Tokens @{ actual = $probe.torch_version; expected = "$($Expected.TorchPrefix)*" })) | Out-Null
    }
    if ($Expected.TorchVisionPrefix -and ([string]::IsNullOrWhiteSpace($probe.torchvision_version) -or -not $probe.torchvision_version.StartsWith($Expected.TorchVisionPrefix))) {
        $issues.Add((Get-ConsoleText -Key 'issue_torchvision_mismatch' -Tokens @{ actual = $probe.torchvision_version; expected = "$($Expected.TorchVisionPrefix)*" })) | Out-Null
    }
    if ($Expected.Xformers -and $probe.xformers_version -ne $Expected.Xformers) {
        $issues.Add((Get-ConsoleText -Key 'issue_xformers_mismatch' -Tokens @{ actual = $probe.xformers_version; expected = $Expected.Xformers })) | Out-Null
    }
    if (-not $probe.xformers_import_ok -or -not $probe.xformers_ops_ok) {
        $issues.Add((Convert-BlackwellRuntimeErrorMessage -Message $probe.xformers_error)) | Out-Null
    }

    if ($issues.Count -gt 0) {
        $Message.Value = ($issues -join '; ')
        return $false
    }

    $Message.Value = Format-BlackwellRuntimeSummary -Probe $probe
    return $true
}

function Test-SageAttentionRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected,
        [string]$RuntimeDirName = $sageAttentionRuntimeDirName,
        [ref]$Message
    )

    $probe = Get-SageAttentionRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        $Message.Value = Get-ConsoleText -Key 'probe_runtime_details_failed' -Tokens @{ runtime = (Get-SageRuntimeDisplayNameFromDirName -RuntimeDirName $RuntimeDirName) }
        return $false
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinor -and $probe.python_minor -ne $Expected.PythonMinor) {
        $issues.Add((Get-ConsoleText -Key 'issue_python_minor_mismatch' -Tokens @{ actual = $probe.python_minor; expected = $Expected.PythonMinor })) | Out-Null
    }
    if ($Expected.TorchPrefix -and ([string]::IsNullOrWhiteSpace($probe.torch_version) -or -not $probe.torch_version.StartsWith($Expected.TorchPrefix))) {
        $issues.Add((Get-ConsoleText -Key 'issue_torch_mismatch' -Tokens @{ actual = $probe.torch_version; expected = "$($Expected.TorchPrefix)*" })) | Out-Null
    }
    if ($Expected.TorchVisionPrefix -and ([string]::IsNullOrWhiteSpace($probe.torchvision_version) -or -not $probe.torchvision_version.StartsWith($Expected.TorchVisionPrefix))) {
        $issues.Add((Get-ConsoleText -Key 'issue_torchvision_mismatch' -Tokens @{ actual = $probe.torchvision_version; expected = "$($Expected.TorchVisionPrefix)*" })) | Out-Null
    }
    if ($Expected.SageAttention -and $probe.sageattention_version -ne $Expected.SageAttention) {
        $issues.Add((Get-ConsoleText -Key 'issue_sageattention_mismatch' -Tokens @{ actual = $probe.sageattention_version; expected = $Expected.SageAttention })) | Out-Null
    }
    if ($Expected.Triton -and $probe.triton_version -ne $Expected.Triton) {
        $issues.Add((Get-ConsoleText -Key 'issue_triton_mismatch' -Tokens @{ actual = $probe.triton_version; expected = $Expected.Triton })) | Out-Null
    }
    if (-not $probe.cuda_available) {
        $issues.Add((Get-ConsoleText -Key 'issue_cuda_unavailable')) | Out-Null
    }
    if (-not $probe.triton_import_ok) {
        $issues.Add((Convert-SageAttentionRuntimeErrorMessage -Message $probe.sageattention_error)) | Out-Null
    }
    elseif (-not $probe.sageattention_import_ok -or -not $probe.sageattention_symbols_ok) {
        $issues.Add((Convert-SageAttentionRuntimeErrorMessage -Message $probe.sageattention_error)) | Out-Null
    }

    if ($issues.Count -gt 0) {
        $Message.Value = ($issues -join '; ')
        return $false
    }

    $Message.Value = Format-SageAttentionRuntimeSummary -Probe $probe
    return $true
}

function Test-FlashAttentionRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected,
        [ref]$Message
    )

    $probe = Get-FlashAttentionRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        $Message.Value = Get-ConsoleText -Key 'probe_runtime_details_failed' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'flashattention') }
        return $false
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinor -and $probe.python_minor -ne $Expected.PythonMinor) {
        $issues.Add((Get-ConsoleText -Key 'issue_python_minor_mismatch' -Tokens @{ actual = $probe.python_minor; expected = $Expected.PythonMinor })) | Out-Null
    }
    if ($Expected.TorchPrefix -and ([string]::IsNullOrWhiteSpace($probe.torch_version) -or -not $probe.torch_version.StartsWith($Expected.TorchPrefix))) {
        $issues.Add((Get-ConsoleText -Key 'issue_torch_mismatch' -Tokens @{ actual = $probe.torch_version; expected = "$($Expected.TorchPrefix)*" })) | Out-Null
    }
    if ($Expected.TorchVisionPrefix -and ([string]::IsNullOrWhiteSpace($probe.torchvision_version) -or -not $probe.torchvision_version.StartsWith($Expected.TorchVisionPrefix))) {
        $issues.Add((Get-ConsoleText -Key 'issue_torchvision_mismatch' -Tokens @{ actual = $probe.torchvision_version; expected = "$($Expected.TorchVisionPrefix)*" })) | Out-Null
    }
    if ($Expected.FlashAttentionPrefix -and ([string]::IsNullOrWhiteSpace($probe.flashattention_version) -or -not $probe.flashattention_version.StartsWith($Expected.FlashAttentionPrefix))) {
        $issues.Add((Get-ConsoleText -Key 'issue_flashattention_mismatch' -Tokens @{ actual = $probe.flashattention_version; expected = "$($Expected.FlashAttentionPrefix)*" })) | Out-Null
    }
    if (-not $probe.cuda_available) {
        $issues.Add((Get-ConsoleText -Key 'issue_cuda_unavailable')) | Out-Null
    }
    if (-not $probe.flashattention_import_ok -or -not $probe.flashattention_runtime_ok) {
        $issues.Add((Convert-FlashAttentionRuntimeErrorMessage -Message $probe.flashattention_error)) | Out-Null
    }

    if ($issues.Count -gt 0) {
        $Message.Value = ($issues -join '; ')
        return $false
    }

    $Message.Value = Format-FlashAttentionRuntimeSummary -Probe $probe
    return $true
}

function Get-MainPythonSelection {
    if ($preferFlashAttentionRuntime -and -not (Test-Path $flashAttentionPython)) {
        throw (New-MissingDedicatedRuntimeMessage -RuntimeName 'flashattention' -ExpectedPath $flashAttentionPython -PythonMinor '3.11/3.12' -RuntimeDirName $flashAttentionRuntimeDirName -RuntimeDirPath $flashAttentionRuntimeDir -RerunScript 'run_For_FlashAttention_Experimental.bat')
    }

    if ($preferBlackwellRuntime -and -not (Test-Path $blackwellPython)) {
        throw (New-MissingDedicatedRuntimeMessage -RuntimeName 'blackwell' -ExpectedPath $blackwellPython -PythonMinor '3.12' -RuntimeDirName $blackwellRuntimeInfo.DirectoryName -RuntimeDirPath $blackwellRuntimeDir -RerunScript 'run_For_Only_Blackwell.bat')
    }

    if ($preferSageAttentionRuntime -and -not (Test-Path $sageAttentionPython)) {
        throw (New-MissingDedicatedRuntimeMessage -RuntimeName 'sageattention' -ExpectedPath $sageAttentionPython -PythonMinor '3.11' -RuntimeDirName $sageAttentionRuntimeDirName -RuntimeDirPath $sageAttentionRuntimeDir -RerunScript 'run_For_SageAttention_Experimental.bat')
    }

    if ($preferSageAttention2Runtime -and -not (Test-Path $sageAttention2Python)) {
        throw (New-MissingDedicatedRuntimeMessage -RuntimeName 'sageattention2' -ExpectedPath $sageAttention2Python -PythonMinor '3.11+' -RuntimeDirName $sageAttention2RuntimeDirName -RuntimeDirPath $sageAttention2RuntimeDir -RerunScript 'run_For_SageAttention2_Experimental.bat')
    }

    if ($preferIntelXpuRuntime -and -not (Test-Path $intelXpuPython)) {
        throw (New-MissingDedicatedRuntimeMessage -RuntimeName 'intel-xpu' -ExpectedPath $intelXpuPython -PythonMinor '3.10/3.11' -RuntimeDirName $intelXpuRuntimeDirName -RuntimeDirPath $intelXpuRuntimeDir -RerunScript 'run_For_Intel_XPU_Experimental.bat')
    }

    if ($preferIntelXpuSageRuntime -and -not (Test-Path $intelXpuSagePython)) {
        throw (New-MissingDedicatedRuntimeMessage -RuntimeName 'intel-xpu-sage' -ExpectedPath $intelXpuSagePython -PythonMinor '3.10/3.11' -RuntimeDirName $intelXpuSageRuntimeDirName -RuntimeDirPath $intelXpuSageRuntimeDir -RerunScript 'run_For_Intel_XPU_SageAttention_Experimental.bat')
    }

    if ($preferRocmAmdRuntime -and -not (Test-Path $rocmAmdPython)) {
        throw (New-MissingDedicatedRuntimeMessage -RuntimeName 'rocm-amd' -ExpectedPath $rocmAmdPython -PythonMinor '3.12' -RuntimeDirName $rocmAmdRuntimeDirName -RuntimeDirPath $rocmAmdRuntimeDir -RerunScript 'run_For_AMD_ROCm_Experimental.bat')
    }

    if ($preferFlashAttentionRuntime -and (Test-Path $flashAttentionPython)) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'flashattention' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $flashAttentionPython)) {
            Write-ConsoleText -Key 'runtime_python_not_initialized' -Tokens @{ runtime_dir = $flashAttentionRuntimeDirName } -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot 'setup_embeddable_python.bat') --auto $flashAttentionRuntimeDirName
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $flashAttentionPython)) {
                throw (Get-ConsoleText -Key 'runtime_python_incomplete' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'flashattention' -Kind 'python') })
            }
        }
        return @{
            PythonExe = $flashAttentionPython
            DepsMarker = $flashAttentionDepsMarker
            Runtime = 'flashattention'
        }
    }

    if ($preferBlackwellRuntime -and (Test-Path $blackwellPython)) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'blackwell' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $blackwellPython)) {
            Write-ConsoleText -Key 'runtime_python_not_initialized' -Tokens @{ runtime_dir = $blackwellRuntimeInfo.DirectoryName } -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot 'setup_embeddable_python.bat') --auto $blackwellRuntimeInfo.DirectoryName
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $blackwellPython)) {
                throw (Get-ConsoleText -Key 'runtime_python_incomplete' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'blackwell' -Kind 'python') })
            }
        }
        return @{
            PythonExe = $blackwellPython
            DepsMarker = $blackwellDepsMarker
            Runtime = 'blackwell'
        }
    }

    if ($preferSageAttentionRuntime -and (Test-Path $sageAttentionPython)) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'sageattention' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $sageAttentionPython)) {
            Write-ConsoleText -Key 'runtime_python_not_initialized' -Tokens @{ runtime_dir = $sageAttentionRuntimeDirName } -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot 'setup_embeddable_python.bat') --auto $sageAttentionRuntimeDirName
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $sageAttentionPython)) {
                throw (Get-ConsoleText -Key 'runtime_python_incomplete' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'sageattention' -Kind 'python') })
            }
        }
        return @{
            PythonExe = $sageAttentionPython
            DepsMarker = $sageAttentionDepsMarker
            Runtime = 'sageattention'
        }
    }

    if ($preferSageAttention2Runtime -and (Test-Path $sageAttention2Python)) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'sageattention2' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $sageAttention2Python)) {
            Write-ConsoleText -Key 'runtime_python_not_initialized' -Tokens @{ runtime_dir = $sageAttention2RuntimeDirName } -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot 'setup_embeddable_python.bat') --auto $sageAttention2RuntimeDirName
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $sageAttention2Python)) {
                throw (Get-ConsoleText -Key 'runtime_python_incomplete' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'sageattention2' -Kind 'python') })
            }
        }
        return @{
            PythonExe = $sageAttention2Python
            DepsMarker = $sageAttention2DepsMarker
            Runtime = 'sageattention2'
        }
    }

    if ($preferIntelXpuRuntime -and (Test-Path $intelXpuPython)) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'intel-xpu' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $intelXpuPython)) {
            Write-ConsoleText -Key 'runtime_python_not_initialized' -Tokens @{ runtime_dir = $intelXpuRuntimeDirName } -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot 'setup_embeddable_python.bat') --auto $intelXpuRuntimeDirName
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $intelXpuPython)) {
                throw (Get-ConsoleText -Key 'runtime_python_incomplete' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'intel-xpu' -Kind 'python') })
            }
        }
        return @{
            PythonExe = $intelXpuPython
            DepsMarker = $intelXpuDepsMarker
            Runtime = 'intel-xpu'
        }
    }

    if ($preferIntelXpuSageRuntime -and (Test-Path $intelXpuSagePython)) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'intel-xpu-sage' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $intelXpuSagePython)) {
            Write-ConsoleText -Key 'runtime_python_not_initialized' -Tokens @{ runtime_dir = $intelXpuSageRuntimeDirName } -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot 'setup_embeddable_python.bat') --auto $intelXpuSageRuntimeDirName
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $intelXpuSagePython)) {
                throw (Get-ConsoleText -Key 'runtime_python_incomplete' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'intel-xpu-sage' -Kind 'python') })
            }
        }
        return @{
            PythonExe = $intelXpuSagePython
            DepsMarker = $intelXpuSageDepsMarker
            Runtime = 'intel-xpu-sage'
        }
    }

    if ($preferRocmAmdRuntime -and (Test-Path $rocmAmdPython)) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'rocm-amd' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $rocmAmdPython)) {
            Write-ConsoleText -Key 'runtime_python_not_initialized' -Tokens @{ runtime_dir = $rocmAmdRuntimeDirName } -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot 'setup_embeddable_python.bat') --auto $rocmAmdRuntimeDirName
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $rocmAmdPython)) {
                throw (Get-ConsoleText -Key 'runtime_python_incomplete' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'rocm-amd' -Kind 'python') })
            }
        }
        return @{
            PythonExe = $rocmAmdPython
            DepsMarker = $rocmAmdDepsMarker
            Runtime = 'rocm-amd'
        }
    }

    if (Test-Path $portablePython) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'portable' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $portablePython)) {
            throw (Get-ConsoleText -Key 'portable_python_incomplete')
        }
        return @{
            PythonExe = $portablePython
            DepsMarker = $portableDepsMarker
            Runtime = 'portable'
        }
    }

    if (Test-Path $venvPython) {
        Write-ConsoleText -Key 'using_runtime_python' -Tokens @{ runtime = (Get-ConsoleRuntimeDisplayName -RuntimeName 'venv' -Kind 'python') } -ForegroundColor 'Green'
        if (-not (Test-PipReady -PythonExe $venvPython)) {
            throw (Get-ConsoleText -Key 'venv_python_incomplete')
        }
        return @{
            PythonExe = $venvPython
            DepsMarker = $venvDepsMarker
            Runtime = 'venv'
        }
    }

    if ($allowExternalPython) {
        Write-ConsoleText -Key 'bootstrap_project_local_python' -ForegroundColor 'Yellow'
        & (Join-Path $repoRoot 'install.ps1')
        if ($LASTEXITCODE -ne 0) {
            throw (Get-ConsoleText -Key 'bootstrap_project_local_python_failed')
        }

        if (Test-Path $portablePython) {
            return @{
                PythonExe = $portablePython
                DepsMarker = $portableDepsMarker
                Runtime = 'portable'
            }
        }

        if (Test-Path $venvPython) {
            return @{
                PythonExe = $venvPython
                DepsMarker = $venvDepsMarker
                Runtime = 'venv'
            }
        }

        throw (Get-ConsoleText -Key 'bootstrap_project_local_python_missing_after_install')
    }

    throw (Get-ConsoleText -Key 'no_project_local_python_found' -Tokens @{ portable_path = $portablePython; venv_path = $venvPython })
}

$mainPython = Get-MainPythonSelection
$pythonExe = $mainPython.PythonExe
$depsMarker = $mainPython.DepsMarker
$runtimeName = $mainPython.Runtime
switch ($runtimeName) {
    'rocm-amd' {
        $runtimeHelperPath = Get-ExperimentalRuntimeModulePath -Name 'amd'
        Assert-PowerShellModuleSyntax -Path $runtimeHelperPath -Label 'Runtime helper module'
        . $runtimeHelperPath
    }
    'intel-xpu' {
        $runtimeHelperPath = Get-ExperimentalRuntimeModulePath -Name 'intel'
        Assert-PowerShellModuleSyntax -Path $runtimeHelperPath -Label 'Runtime helper module'
        . $runtimeHelperPath
    }
    'intel-xpu-sage' {
        $runtimeHelperPath = Get-ExperimentalRuntimeModulePath -Name 'intel'
        Assert-PowerShellModuleSyntax -Path $runtimeHelperPath -Label 'Runtime helper module'
        . $runtimeHelperPath
    }
}
$flashAttentionExpectedPackages = Get-FlashAttentionExpectedPackageVersions
$blackwellExpectedPackages = Get-BlackwellExpectedPackageVersions -Profile $blackwellPreferredProfile
$selectedSageAttentionProfile = if ($runtimeName -eq 'sageattention2') { $sageAttention2PreferredProfile } else { $sageAttentionPreferredProfile }
$sageAttentionExpectedPackages = Get-SageAttentionExpectedPackageVersions -Profile $selectedSageAttentionProfile
$intelXpuExpectedPackages = if ($runtimeName -in @('intel-xpu', 'intel-xpu-sage')) { Get-IntelXpuExpectedPackageVersions } else { @{} }
$intelXpuSageExpectedPackages = if ($runtimeName -eq 'intel-xpu-sage') { Get-IntelXpuSageExpectedPackageVersions } else { @{} }
$rocmAmdExpectedPackages = if ($runtimeName -eq 'rocm-amd') { Get-ROCmAmdExpectedPackageVersions } else { @{} }
switch ($runtimeName) {
    'flashattention' { Ensure-EmbeddedRuntimeRepoBootstrap -RuntimeDir $flashAttentionRuntimeDir -RuntimeName $runtimeName }
    'sageattention' { Ensure-EmbeddedRuntimeRepoBootstrap -RuntimeDir $sageAttentionRuntimeDir -RuntimeName $runtimeName }
    'sageattention2' { Ensure-EmbeddedRuntimeRepoBootstrap -RuntimeDir $sageAttention2RuntimeDir -RuntimeName $runtimeName }
    'rocm-amd' { Ensure-EmbeddedRuntimeRepoBootstrap -RuntimeDir $rocmAmdRuntimeDir -RuntimeName $runtimeName }
    'intel-xpu' { Ensure-EmbeddedRuntimeRepoBootstrap -RuntimeDir $intelXpuRuntimeDir -RuntimeName $runtimeName }
    'intel-xpu-sage' { Ensure-EmbeddedRuntimeRepoBootstrap -RuntimeDir $intelXpuSageRuntimeDir -RuntimeName $runtimeName }
}
if ($runtimeName -eq "rocm-amd") {
    if (-not $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY) {
        $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY = "runtime_guarded"
    }
    if (-not $Env:MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB) {
        $Env:MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB = "0.75"
    }
    if (-not $Env:MIKAZUKI_ROCM_SDPA_SLICE_GB) {
        $Env:MIKAZUKI_ROCM_SDPA_SLICE_GB = "0.35"
    }
    Write-ROCmAmdGraphicsDriverNotice -MinimumVersion $rocmAmdRecommendedGraphicsDriverVersion
    Write-ROCmAmdWindowsPrereqNotice
}
elseif ($runtimeName -eq "intel-xpu") {
    if (-not $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY) {
        $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY = "runtime_guarded"
    }
    if (-not $Env:MIKAZUKI_ALLOW_INTEL_XPU_SAGEATTN) {
        $Env:MIKAZUKI_ALLOW_INTEL_XPU_SAGEATTN = "1"
    }
    if (-not $Env:IPEX_SDPA_SLICE_TRIGGER_RATE) {
        $Env:IPEX_SDPA_SLICE_TRIGGER_RATE = "0.75"
    }
    if (-not $Env:IPEX_ATTENTION_SLICE_RATE) {
        $Env:IPEX_ATTENTION_SLICE_RATE = "0.4"
    }
    Write-IntelXpuGraphicsDriverNotice `
        -RecommendedPackageVersion $intelXpuRecommendedGraphicsDriverPackageVersion `
        -DiscreteMinimumVersion $intelXpuRecommendedGraphicsDriverDiscreteVersion `
        -IntegratedMinimumVersion $intelXpuRecommendedGraphicsDriverIntegratedVersion
    Write-IntelXpuWindowsPrereqNotice
}
elseif ($runtimeName -eq "intel-xpu-sage") {
    if (-not $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY) {
        $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY = "runtime_guarded"
    }
    if (-not $Env:MIKAZUKI_ALLOW_INTEL_XPU_SAGEATTN) {
        $Env:MIKAZUKI_ALLOW_INTEL_XPU_SAGEATTN = "1"
    }
    Write-IntelXpuGraphicsDriverNotice `
        -RecommendedPackageVersion $intelXpuRecommendedGraphicsDriverPackageVersion `
        -DiscreteMinimumVersion $intelXpuRecommendedGraphicsDriverDiscreteVersion `
        -IntegratedMinimumVersion $intelXpuRecommendedGraphicsDriverIntegratedVersion
    Write-IntelXpuWindowsPrereqNotice
}
Set-DedicatedRuntimeCaches -RuntimeName $runtimeName -PythonExe $pythonExe
Remove-AmdRuntimeIncompatiblePackageSafeguard -PythonExe $pythonExe -RuntimeName $runtimeName
$selectedMainRuntimeModules = Get-MainRuntimeModulesForRuntime -RuntimeName $runtimeName
$runtimeState = Get-SelectedRuntimeValidationState `
    -PythonExe $pythonExe `
    -RuntimeName $runtimeName `
    -MainModules $selectedMainRuntimeModules `
    -FlashAttentionExpected $flashAttentionExpectedPackages `
    -BlackwellExpected $blackwellExpectedPackages `
    -SageAttentionExpected $sageAttentionExpectedPackages `
    -IntelXpuExpected $intelXpuExpectedPackages `
    -IntelXpuSageExpected $intelXpuSageExpectedPackages `
    -ROCmAmdExpected $rocmAmdExpectedPackages
Write-SelectedRuntimeNotReadyNotice -RuntimeName $runtimeName -State $runtimeState
if (-not (Test-SelectedRuntimeBootstrapReady -DepsMarker $depsMarker -State $runtimeState)) {
    Install-SelectedRuntimeDependencies `
        -RuntimeName $runtimeName `
        -BlackwellProfile $blackwellPreferredProfile `
        -SageAttentionProfile $sageAttentionPreferredProfile
    $mainPython = Get-MainPythonSelection
    $pythonExe = $mainPython.PythonExe
    $depsMarker = $mainPython.DepsMarker
    $runtimeName = $mainPython.Runtime
    Set-DedicatedRuntimeCaches -RuntimeName $runtimeName -PythonExe $pythonExe
    Remove-AmdRuntimeIncompatiblePackageSafeguard -PythonExe $pythonExe -RuntimeName $runtimeName
    $selectedMainRuntimeModules = Get-MainRuntimeModulesForRuntime -RuntimeName $runtimeName
    $selectedSageAttentionProfile = if ($runtimeName -eq 'sageattention2') { $sageAttention2PreferredProfile } else { $sageAttentionPreferredProfile }
    $sageAttentionExpectedPackages = Get-SageAttentionExpectedPackageVersions -Profile $selectedSageAttentionProfile
    $runtimeState = Get-SelectedRuntimeValidationState `
        -PythonExe $pythonExe `
        -RuntimeName $runtimeName `
        -MainModules $selectedMainRuntimeModules `
        -FlashAttentionExpected $flashAttentionExpectedPackages `
        -BlackwellExpected $blackwellExpectedPackages `
        -SageAttentionExpected $sageAttentionExpectedPackages `
        -IntelXpuExpected $intelXpuExpectedPackages `
        -IntelXpuSageExpected $intelXpuSageExpectedPackages `
        -ROCmAmdExpected $rocmAmdExpectedPackages
    if ($LASTEXITCODE -ne 0 -or -not (Test-SelectedRuntimeBootstrapReady -DepsMarker $depsMarker -State $runtimeState)) {
        throw (Get-SelectedRuntimeInstallFailureMessage -RuntimeName $runtimeName -State $runtimeState)
    }
}
Write-SelectedRuntimeReadyNotice -RuntimeName $runtimeName -State $runtimeState

if ($Env:MIKAZUKI_BLACKWELL_STARTUP -eq "1") {
    $blackwellPatchScript = Join-Path $repoRoot "mikazuki\scripts\patch_xformers_blackwell.py"
    if (Test-Path $blackwellPatchScript) {
        Write-ConsoleText -Key 'runtime_startup_blackwell_patch_check' -ForegroundColor 'Yellow'
        & $pythonExe $blackwellPatchScript
        if ($LASTEXITCODE -ne 0) {
            Write-ConsoleText -Key 'runtime_startup_blackwell_patch_warning' -ForegroundColor 'Yellow'
        }
    }
}

if ($Env:MIKAZUKI_FLASHATTENTION_STARTUP -eq "1" -or $runtimeName -eq "flashattention") {
    Write-ConsoleText -Key 'startup_mode_flashattention' -ForegroundColor 'Yellow'
}

if ($runtimeName -eq "sageattention2") {
    Write-ConsoleText -Key 'startup_mode_sageattention2' -ForegroundColor 'Yellow'
}
elseif ($Env:MIKAZUKI_SAGEATTENTION_STARTUP -eq "1" -or $runtimeName -eq "sageattention") {
    Write-ConsoleText -Key 'startup_mode_sageattention' -ForegroundColor 'Yellow'
}

if ($Env:MIKAZUKI_ROCM_AMD_STARTUP -eq "1" -or $runtimeName -eq "rocm-amd") {
    switch (Get-ConsoleLanguage) {
        'zh' {
            Write-Host -ForegroundColor Yellow "已启用 AMD ROCm 启动模式。这个运行时只负责准备 AMD ROCm 专用环境，并保持 AMD 实验训练路线与主运行时隔离。"
            Write-Host -ForegroundColor Yellow "ROCm attention guard：startup policy=$($Env:MIKAZUKI_STARTUP_ATTENTION_POLICY)；slice trigger=$($Env:MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB)GB；slice target=$($Env:MIKAZUKI_ROCM_SDPA_SLICE_GB)GB。"
        }
        'ja' {
            Write-Host -ForegroundColor Yellow "AMD ROCm 起動モードが有効です。このランタイムは AMD ROCm 専用環境の準備のみを行い、AMD 実験学習ルートをメインランタイムから分離します。"
            Write-Host -ForegroundColor Yellow "ROCm attention guard: startup policy=$($Env:MIKAZUKI_STARTUP_ATTENTION_POLICY); slice trigger=$($Env:MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB)GB; slice target=$($Env:MIKAZUKI_ROCM_SDPA_SLICE_GB)GB."
        }
        default {
            Write-Host -ForegroundColor Yellow "AMD ROCm startup mode enabled. This runtime prepares the dedicated ROCm environment and keeps the AMD experimental training route isolated from the main runtime."
            Write-Host -ForegroundColor Yellow "ROCm attention guard: startup policy=$($Env:MIKAZUKI_STARTUP_ATTENTION_POLICY); slice trigger=$($Env:MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB)GB; slice target=$($Env:MIKAZUKI_ROCM_SDPA_SLICE_GB)GB."
        }
    }
}

if ($Env:MIKAZUKI_INTEL_XPU_STARTUP -eq "1" -or $runtimeName -eq "intel-xpu") {
    switch (Get-ConsoleLanguage) {
        'zh' {
            Write-Host -ForegroundColor Yellow "已启用 Intel XPU 启动模式。这个运行时只负责准备 Intel XPU 专用环境，并保持 Intel 实验训练路线与主运行时隔离。"
            Write-Host -ForegroundColor Yellow "IPEX attention slicing：trigger=$($Env:IPEX_SDPA_SLICE_TRIGGER_RATE)，slice=$($Env:IPEX_ATTENTION_SLICE_RATE)。"
        }
        'ja' {
            Write-Host -ForegroundColor Yellow "Intel XPU 起動モードが有効です。このランタイムは Intel XPU 専用環境の準備のみを行い、Intel 実験学習ルートをメインランタイムから分離します。"
            Write-Host -ForegroundColor Yellow "IPEX attention slicing: trigger=$($Env:IPEX_SDPA_SLICE_TRIGGER_RATE), slice=$($Env:IPEX_ATTENTION_SLICE_RATE)."
        }
        default {
            Write-Host -ForegroundColor Yellow "Intel XPU startup mode enabled. This runtime prepares the dedicated Intel XPU environment and keeps the Intel experimental training route isolated from the main runtime."
            Write-Host -ForegroundColor Yellow "IPEX attention slicing: trigger=$($Env:IPEX_SDPA_SLICE_TRIGGER_RATE), slice=$($Env:IPEX_ATTENTION_SLICE_RATE)."
        }
    }
}

if ($Env:MIKAZUKI_INTEL_XPU_SAGE_STARTUP -eq "1" -or $runtimeName -eq "intel-xpu-sage") {
    switch (Get-ConsoleLanguage) {
        'zh' {
            Write-Host -ForegroundColor Yellow "已启用 Intel XPU Sage 启动模式。这个运行时会把 Intel Sage 实验链路隔离到单独的 $intelXpuSageRuntimeDirName 环境，不影响现有 Intel 主线。"
            Write-Host -ForegroundColor Yellow "注意：这条路线会优先验证 Triton + SageAttention 1.0.6 的可导入性，不保证与现有 IPEX 稳定线兼容。"
        }
        'ja' {
            Write-Host -ForegroundColor Yellow "Intel XPU Sage 起動モードが有効です。このランタイムは Intel Sage 実験ルートを専用の $intelXpuSageRuntimeDirName 環境へ分離し、既存の Intel 安定ルートには影響しません。"
            Write-Host -ForegroundColor Yellow "注意: このルートは Triton + SageAttention 1.0.6 の読み込み検証を優先します。既存の IPEX 安定ルートとの互換性は保証されません。"
        }
        default {
            Write-Host -ForegroundColor Yellow "Intel XPU Sage startup mode enabled. This runtime isolates the Intel Sage experiment in $intelXpuSageRuntimeDirName and leaves the current Intel stable runtime untouched."
            Write-Host -ForegroundColor Yellow "Note: this route prioritizes Triton + SageAttention 1.0.6 importability checks and does not guarantee compatibility with the existing IPEX-based stable path."
        }
    }
}

if (
    -not ($args -contains "--disable-tageditor") `
    -and $runtimeName -in @("intel-xpu", "intel-xpu-sage", "rocm-amd") `
    -and -not (Test-Path $portableTagEditorPython) `
    -and -not (Test-Path $venvTagEditorPython)
) {
    switch (Get-ConsoleLanguage) {
        'zh' {
            Write-Host -ForegroundColor Yellow "检测到实验运行时且未准备单独的 Tag Editor 运行时，已自动禁用标签编辑器启动。"
            Write-Host -ForegroundColor Yellow "如需使用标签编辑器，请先运行 install_tageditor.ps1 准备 env/python_tageditor、env/venv-tageditor，或旧的根目录运行时。"
        }
        'ja' {
            Write-Host -ForegroundColor Yellow "実験ランタイムで専用 Tag Editor ランタイムが見つからないため、タグエディタの自動起動を無効化しました。"
            Write-Host -ForegroundColor Yellow "タグエディタを使う場合は、先に install_tageditor.ps1 で env/python_tageditor、env/venv-tageditor、または従来のルート配置を準備してください。"
        }
        default {
            Write-Host -ForegroundColor Yellow "Experimental runtime detected without a dedicated Tag Editor runtime. Tag Editor auto-start has been disabled."
            Write-Host -ForegroundColor Yellow "If you need Tag Editor, run install_tageditor.ps1 first to prepare env/python_tageditor, env/venv-tageditor, or the legacy root folders."
        }
    }
    $args = @($args) + @("--disable-tageditor")
}

if (-not ($args -contains "--disable-tageditor")) {
    $tagEditorPython = $null
    $tagEditorMarker = $null

    if (Test-Path $portableTagEditorPython) {
        $tagEditorPython = $portableTagEditorPython
        $tagEditorMarker = Join-Path $portableTagEditorRuntimeDir ".tageditor_installed"
    }
    elseif (Test-Path $venvTagEditorPython) {
        $tagEditorPython = $venvTagEditorPython
        $tagEditorMarker = Join-Path $venvTagEditorRuntimeDir ".tageditor_installed"
    }
    else {
        $fallbackMainPython = $null
        if ($runtimeName -in @("flashattention", "blackwell", "sageattention", "sageattention2", "intel-xpu", "intel-xpu-sage", "rocm-amd")) {
            if (Test-Path $portablePython) {
                $fallbackMainPython = $portablePython
                $tagEditorMarker = Join-Path $portableRuntimeDir ".tageditor_installed"
            }
            elseif (Test-Path $venvPython) {
                $fallbackMainPython = $venvPython
                $tagEditorMarker = Join-Path $venvRuntimeDir ".tageditor_installed"
            }
        }
        else {
            $fallbackMainPython = $pythonExe
            if (Test-Path $portablePython) {
                $tagEditorMarker = Join-Path $portableRuntimeDir ".tageditor_installed"
            }
            elseif (Test-Path $venvPython) {
                $tagEditorMarker = Join-Path $venvRuntimeDir ".tageditor_installed"
            }
        }

        $mainPythonVersion = $null
        if ($fallbackMainPython) {
            $mainPythonVersion = Get-PythonMinorVersion -PythonExe $fallbackMainPython
        }
        if ($mainPythonVersion -and $mainPythonVersion -ne "3.13") {
            $tagEditorPython = $fallbackMainPython
        }
    }

    if ($tagEditorPython) {
        $tagEditorPackageConstraints = @{
            "gradio" = "==4.28.3"
            "gradio-client" = "==0.16.0"
            "fastapi" = "<0.113"
            "starlette" = "<0.39"
            "pydantic" = "<2.11"
            "huggingface-hub" = "<1"
        }
        $tagEditorModulesReady = Test-ModulesReady -PythonExe $tagEditorPython -Modules @("gradio", "transformers", "timm", "print_color")
        $tagEditorVersionsReady = Test-PackageConstraints -PythonExe $tagEditorPython -Constraints $tagEditorPackageConstraints
        $tagEditorMarkerReady = (-not $tagEditorMarker) -or (Test-Path $tagEditorMarker)
        if (-not $tagEditorMarkerReady -or -not $tagEditorModulesReady -or -not $tagEditorVersionsReady) {
            if (-not (Test-PipReady -PythonExe $tagEditorPython)) {
                throw (Get-ConsoleText -Key 'tag_editor_python_incomplete')
            }

            Write-ConsoleText -Key 'tag_editor_dependencies_installing' -ForegroundColor 'Yellow'
            & (Join-Path $repoRoot "install_tageditor.ps1")
            $tagEditorModulesReady = Test-ModulesReady -PythonExe $tagEditorPython -Modules @("gradio", "transformers", "timm", "print_color")
            $tagEditorVersionsReady = Test-PackageConstraints -PythonExe $tagEditorPython -Constraints $tagEditorPackageConstraints
            $tagEditorMarkerReady = (-not $tagEditorMarker) -or (Test-Path $tagEditorMarker)
            if ($LASTEXITCODE -ne 0 -or -not $tagEditorMarkerReady -or -not $tagEditorModulesReady -or -not $tagEditorVersionsReady) {
                throw (Get-ConsoleText -Key 'tag_editor_dependency_install_failed')
            }
        }
    }
}

$Env:MIKAZUKI_SKIP_REQUIREMENTS_VALIDATION = "1"
Set-Location $repoRoot
try {
    & $pythonExe "gui.py" @args
}
finally {
    if ($script:LaunchTranscriptPath) {
        Write-Host -ForegroundColor DarkGray "Launcher log saved to / 启动日志已保存到: $($script:LaunchTranscriptPath)"
    }
    Stop-LaunchTranscript
}
