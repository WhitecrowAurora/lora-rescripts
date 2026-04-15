param()

$ErrorActionPreference = "Stop"

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$null = . (Join-Path $repoRoot "tools\runtime\runtime_paths.ps1")

$rocmAmdRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "rocm-amd"
$rocmAmdRuntimeDirName = $rocmAmdRuntimeInfo.DirectoryName
$rocmAmdRuntimeDir = $rocmAmdRuntimeInfo.DirectoryPath
$rocmAmdPython = Join-Path $rocmAmdRuntimeDir "python.exe"
$rocmAmdMarker = Join-Path $rocmAmdRuntimeDir ".deps_installed"
$requirementsPath = Join-Path $repoRoot "requirements.txt"
$mainRequiredModules = @(
    "accelerate",
    "torch",
    "fastapi",
    "toml",
    "transformers",
    "diffusers",
    "cv2",
    "tensorboard"
)

$expectedRuntime = @{
    PythonMinor = "3.12"
    TorchPrefix = "2.9.1+"
    TorchVisionPrefix = "0.24.1+"
    TorchAudioPrefix = "2.9.1+"
    HipPrefix = "7.2"
}

$rocmWheelBase = "https://repo.radeon.com/rocm/windows/rocm-rel-7.2"
$rocmSdkPackages = @(
    "$rocmWheelBase/rocm_sdk_core-7.2.0.dev0-py3-none-win_amd64.whl",
    "$rocmWheelBase/rocm_sdk_libraries_custom-7.2.0.dev0-py3-none-win_amd64.whl",
    "$rocmWheelBase/rocm_sdk_devel-7.2.0.dev0-py3-none-win_amd64.whl",
    "$rocmWheelBase/rocm-7.2.0.dev0.tar.gz"
)
$rocmTorchPackages = @(
    "$rocmWheelBase/torch-2.9.1+rocmsdk20260116-cp312-cp312-win_amd64.whl",
    "$rocmWheelBase/torchvision-0.24.1+rocmsdk20260116-cp312-cp312-win_amd64.whl",
    "$rocmWheelBase/torchaudio-2.9.1+rocmsdk20260116-cp312-cp312-win_amd64.whl"
)
$rocmTorchPythonDeps = @(
    "filelock",
    "typing-extensions>=4.10.0",
    "sympy>=1.13.3",
    "networkx>=2.5.1",
    "jinja2",
    "fsspec>=0.8.5"
)
$transformersConstraint = "transformers>=4.55.5,<5"
$incompatiblePackages = @(
    "bitsandbytes",
    "xformers",
    "sageattention",
    "triton",
    "triton-windows",
    "pytorch-triton-rocm"
)

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

function Invoke-Step {
    param (
        [string]$Message,
        [scriptblock]$Action
    )

    Write-Host -ForegroundColor Green $Message
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "$Message failed with exit code $LASTEXITCODE."
    }
}

function Invoke-OptionalStep {
    param (
        [string]$Message,
        [scriptblock]$Action,
        [string]$WarningMessage
    )

    Write-Host -ForegroundColor Green $Message
    & $Action
    if ($LASTEXITCODE -ne 0) {
        Write-Host -ForegroundColor Yellow $WarningMessage
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
failed=[];
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

function Get-MissingModulesReport {
    param (
        [string]$PythonExe,
        [string[]]$Modules
    )

    if (-not $Modules -or $Modules.Count -eq 0) {
        return @()
    }

    $report = @()
    foreach ($moduleName in $Modules) {
        $previousErrorActionPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = "Continue"
            $output = & $PythonExe -c "import importlib, sys;
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
importlib.import_module(sys.argv[2])" $repoRoot $moduleName 2>&1
            $exitCode = $LASTEXITCODE
        }
        finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }

        if ($exitCode -eq 0) {
            continue
        }

        $reason = ""
        if ($output) {
            $reason = (($output | ForEach-Object { [string]$_ }) -join " ").Trim()
        }
        if ([string]::IsNullOrWhiteSpace($reason)) {
            $reason = "python exited with code $exitCode while importing $moduleName"
        }

        $report += [pscustomobject]@{
            module = $moduleName
            reason = $reason
        }
    }

    return $report
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

        $text = if ($raw -is [System.Array]) {
            ($raw | ForEach-Object { [string]$_ }) -join [Environment]::NewLine
        }
        else {
            [string]$raw
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
    finally {
        Remove-Item -LiteralPath $tempPyPath -Force -ErrorAction SilentlyContinue
    }
}

function Get-ROCmAmdRuntimeProbe {
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
    "torchaudio_version": "",
    "hip_version": "",
    "gpu_name": "",
    "cuda_available": False,
    "hip_available": False,
    "runtime_error": "",
}

def metadata_version(name):
    try:
        return md.version(name)
    except Exception:
        return ""

try:
    import torch
except Exception as exc:
    result["runtime_error"] = f"torch import failed: {exc}"
    print(json.dumps(result))
    raise SystemExit(0)

result["torch_version"] = getattr(torch, "__version__", "")
result["torchvision_version"] = metadata_version("torchvision")
result["torchaudio_version"] = metadata_version("torchaudio")
result["cuda_available"] = bool(torch.cuda.is_available())
result["hip_version"] = str(getattr(torch.version, "hip", "") or "")
result["hip_available"] = bool(result["hip_version"])

try:
    if torch.cuda.is_available() and torch.cuda.device_count() > 0:
        result["gpu_name"] = str(torch.cuda.get_device_name(0) or "")
except Exception as exc:
    if not result["runtime_error"]:
        result["runtime_error"] = f"device probe failed: {exc}"

if not result["hip_available"] and not result["runtime_error"]:
    result["runtime_error"] = "Torch is not a ROCm build."
elif not result["cuda_available"] and not result["runtime_error"]:
    result["runtime_error"] = "ROCm runtime is installed, but no AMD GPU is available to Torch."

print(json.dumps(result))
"@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $script
}

function Assert-ROCmAmdRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected
    )

    $probe = Get-ROCmAmdRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        throw "Could not probe $rocmAmdRuntimeDirName runtime details after installation."
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinor -and $probe.python_minor -ne $Expected.PythonMinor) {
        $issues.Add("Python minor is $($probe.python_minor), expected $($Expected.PythonMinor)") | Out-Null
    }
    if ($Expected.TorchPrefix -and ([string]::IsNullOrWhiteSpace($probe.torch_version) -or -not $probe.torch_version.StartsWith($Expected.TorchPrefix))) {
        $issues.Add("Torch is $($probe.torch_version), expected prefix $($Expected.TorchPrefix)") | Out-Null
    }
    if ($Expected.TorchVisionPrefix -and ([string]::IsNullOrWhiteSpace($probe.torchvision_version) -or -not $probe.torchvision_version.StartsWith($Expected.TorchVisionPrefix))) {
        $issues.Add("TorchVision is $($probe.torchvision_version), expected prefix $($Expected.TorchVisionPrefix)") | Out-Null
    }
    if ($Expected.TorchAudioPrefix -and ([string]::IsNullOrWhiteSpace($probe.torchaudio_version) -or -not $probe.torchaudio_version.StartsWith($Expected.TorchAudioPrefix))) {
        $issues.Add("TorchAudio is $($probe.torchaudio_version), expected prefix $($Expected.TorchAudioPrefix)") | Out-Null
    }
    if ($Expected.HipPrefix -and ([string]::IsNullOrWhiteSpace($probe.hip_version) -or -not $probe.hip_version.StartsWith($Expected.HipPrefix))) {
        $issues.Add("HIP runtime is $($probe.hip_version), expected prefix $($Expected.HipPrefix)") | Out-Null
    }
    if (-not $probe.hip_available) {
        $issues.Add("Torch is not a ROCm build.") | Out-Null
    }
    if (-not $probe.cuda_available) {
        $issues.Add("ROCm GPU is not available to Torch.") | Out-Null
    }
    if ($probe.runtime_error) {
        $issues.Add($probe.runtime_error) | Out-Null
    }

    if ($issues.Count -gt 0) {
        throw "AMD ROCm runtime verification failed: $($issues -join '; ')"
    }

    Write-Host -ForegroundColor Green "AMD ROCm runtime versions: Python $($probe.python_version); Torch $($probe.torch_version); TorchVision $($probe.torchvision_version); TorchAudio $($probe.torchaudio_version)"
    Write-Host -ForegroundColor Green "HIP runtime: $($probe.hip_version); GPU: $($probe.gpu_name)"
}

function New-FilteredRequirementsFile {
    param (
        [string]$SourcePath
    )

    $tempPath = [System.IO.Path]::GetTempFileName()
    $filteredPath = [System.IO.Path]::ChangeExtension($tempPath, ".txt")
    Move-Item -LiteralPath $tempPath -Destination $filteredPath -Force

    $lines = Get-Content -LiteralPath $SourcePath
    $filtered = foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed.StartsWith("#") -or [string]::IsNullOrWhiteSpace($trimmed)) {
            $line
            continue
        }

        $normalizedRequirement = $trimmed.ToLowerInvariant()
        if (
            $normalizedRequirement -like "bitsandbytes*" -or
            $normalizedRequirement -like "xformers*" -or
            $normalizedRequirement -like "sageattention*" -or
            $normalizedRequirement -like "triton*" -or
            $normalizedRequirement -like "triton-windows*" -or
            $normalizedRequirement -like "pytorch-triton-rocm*" -or
            $normalizedRequirement -like "pytorch-optimizer*"
        ) {
            continue
        }
        if ($trimmed -like "transformers*") {
            continue
        }
        $line
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllLines($filteredPath, $filtered, $utf8NoBom)
    return $filteredPath
}

if (-not (Test-Path $rocmAmdPython)) {
    throw @"
$rocmAmdRuntimeDirName\python.exe was not found.

Expected path:
- $rocmAmdPython

Recommended fix:
1. Prepare a dedicated Python 3.12 runtime in $rocmAmdRuntimeDir
2. Rerun this installer
"@
}

Set-Location $repoRoot

if (-not (Test-PipReady -PythonExe $rocmAmdPython)) {
    Write-Host -ForegroundColor Yellow "$rocmAmdRuntimeDirName 尚未完成 pip 初始化，正在尝试自动修复。"
    & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto $rocmAmdRuntimeDirName
    if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $rocmAmdPython)) {
        throw "$rocmAmdRuntimeDirName pip 初始化失败，请先修复该运行时。"
    }
}

if (-not (Test-Path $requirementsPath)) {
    throw "requirements.txt was not found: $requirementsPath"
}

Write-Host -ForegroundColor Yellow "AMD 官方当前仍将 Windows ROCm 训练标记为实验/不支持状态。本安装器仅为项目实验性 AMD 训练壳提供独立运行时。"
Write-Host -ForegroundColor Yellow "AMD 官方当前公开的 Windows PyTorch 安装页会随 ROCm Windows 7.2 系列更新包名与版本后缀；本安装器已按当前公开索引适配。AMD 显卡驱动至少请保持在官方文档要求之上。"
Write-Host -ForegroundColor Yellow "如果系统同时暴露了核显和独显，训练启动时请优先确认最终选中了显存更大的离散 AMD GPU。当前实验路线会默认尝试自动选这张卡。"
Write-Host -ForegroundColor Yellow "官方参考："
Write-Host -ForegroundColor Yellow "- https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installryz/windows/install-pytorch.html"
Write-Host -ForegroundColor Yellow "- https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/limitations/limitationsrad.html"

$filteredRequirementsPath = $null

try {
    Remove-Item -LiteralPath $rocmAmdMarker -Force -ErrorAction SilentlyContinue

    Invoke-Step "Upgrading pip tooling..." {
        & $rocmAmdPython -m pip install --upgrade --no-warn-script-location pip "setuptools<81" wheel
    }

    Invoke-OptionalStep "Removing incompatible NVIDIA-only packages from AMD runtime..." {
        & $rocmAmdPython -m pip uninstall -y @incompatiblePackages
    } "Skipping incompatible package cleanup because pip uninstall returned a non-zero exit code."

    Invoke-Step "Installing AMD ROCm SDK wheels for Windows..." {
        & $rocmAmdPython -m pip install --upgrade --force-reinstall --no-warn-script-location --prefer-binary @rocmSdkPackages
    }

    Invoke-Step "Installing shared Python dependencies required by ROCm PyTorch wheels..." {
        & $rocmAmdPython -m pip install --upgrade --no-warn-script-location --prefer-binary @rocmTorchPythonDeps
    }

    Invoke-Step "Installing PyTorch ROCm wheels for AMD runtime..." {
        & $rocmAmdPython -m pip install --upgrade --force-reinstall --no-deps --no-warn-script-location --prefer-binary @rocmTorchPackages
    }

    $filteredRequirementsPath = New-FilteredRequirementsFile -SourcePath $requirementsPath

    Invoke-Step "Installing project dependencies for AMD runtime..." {
        & $rocmAmdPython -m pip install --upgrade --no-warn-script-location --prefer-binary -r $filteredRequirementsPath
    }

    Invoke-Step "Upgrading transformers for AMD runtime compatibility..." {
        & $rocmAmdPython -m pip install --upgrade --no-warn-script-location --prefer-binary $transformersConstraint
    }

    if (-not (Test-ModulesReady -PythonExe $rocmAmdPython -Modules $mainRequiredModules)) {
        $missingModules = @(Get-MissingModulesReport -PythonExe $rocmAmdPython -Modules $mainRequiredModules)
        if ($missingModules.Count -gt 0) {
            $details = $missingModules | ForEach-Object {
                $moduleName = [string]$_.module
                $reason = [string]$_.reason
                if ([string]::IsNullOrWhiteSpace($reason)) {
                    $moduleName
                }
                else {
                    "${moduleName}: ${reason}"
                }
            }
            throw "Project dependencies did not finish installing correctly in $rocmAmdRuntimeDirName. Missing/broken modules: $($details -join '; ')"
        }
        throw "Project dependencies did not finish installing correctly in $rocmAmdRuntimeDirName. One or more required runtime modules are still missing."
    }

    Assert-ROCmAmdRuntimeReady -PythonExe $rocmAmdPython -Expected $expectedRuntime

    Set-Content -Path $rocmAmdMarker -Value "" -Encoding ASCII
    Write-Host -ForegroundColor Green "AMD ROCm experimental runtime install completed"
}
finally {
    if ($filteredRequirementsPath -and (Test-Path $filteredRequirementsPath)) {
        Remove-Item -LiteralPath $filteredRequirementsPath -Force -ErrorAction SilentlyContinue
    }
}
