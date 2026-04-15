param()

$ErrorActionPreference = "Stop"

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$null = . (Join-Path $repoRoot "tools\runtime\runtime_paths.ps1")

$intelRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "intel-xpu"
$intelRuntimeDirName = $intelRuntimeInfo.DirectoryName
$intelRuntimeDir = $intelRuntimeInfo.DirectoryPath
$intelPython = Join-Path $intelRuntimeDir "python.exe"
$intelMarker = Join-Path $intelRuntimeDir ".deps_installed"
$requirementsPath = Join-Path $repoRoot "requirements.txt"
$mainRequiredModules = @(
    "accelerate",
    "torch",
    "fastapi",
    "toml",
    "transformers",
    "diffusers",
    "lion_pytorch",
    "cv2",
    "tensorboard"
)
$incompatiblePackages = @(
    "bitsandbytes",
    "xformers",
    "sageattention",
    "triton",
    "triton-windows",
    "pytorch-triton-rocm"
)

$expectedRuntime = @{
    PythonMinors = @("3.10", "3.11")
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
            $normalizedRequirement -like "dadaptation*" -or
            $normalizedRequirement -like "schedulefree*" -or
            $normalizedRequirement -like "prodigyopt*" -or
            $normalizedRequirement -like "prodigy-plus-schedule-free*" -or
            $normalizedRequirement -like "pytorch-optimizer*"
        ) {
            continue
        }
        $line
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllLines($filteredPath, $filtered, $utf8NoBom)
    return $filteredPath
}

function Invoke-PythonRuntimeProbe {
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
    "xpu_available": False,
    "gpu_count": 0,
    "gpu_name": "",
    "ipex_version": "",
    "bf16_supported": None,
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
result["ipex_version"] = metadata_version("intel-extension-for-pytorch")

try:
    result["xpu_available"] = bool(hasattr(torch, "xpu") and torch.xpu.is_available())
    if result["xpu_available"]:
        result["gpu_count"] = int(torch.xpu.device_count())
    if result["xpu_available"] and torch.xpu.device_count() > 0:
        result["gpu_name"] = str(torch.xpu.get_device_name(0) or "")
    if hasattr(torch.xpu, "is_bf16_supported"):
        try:
            result["bf16_supported"] = bool(torch.xpu.is_bf16_supported())
        except Exception:
            result["bf16_supported"] = None
except Exception as exc:
    if not result["runtime_error"]:
        result["runtime_error"] = f"xpu probe failed: {exc}"

if not result["xpu_available"] and not result["runtime_error"]:
    result["runtime_error"] = "Torch XPU runtime is installed, but no Intel GPU is available to Torch."

print(json.dumps(result))
"@

    $tempPath = [System.IO.Path]::GetTempFileName()
    $tempPyPath = [System.IO.Path]::ChangeExtension($tempPath, ".py")
    Move-Item -LiteralPath $tempPath -Destination $tempPyPath -Force

    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($tempPyPath, $script, $utf8NoBom)
        $raw = & $PythonExe $tempPyPath 2>$null
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($raw)) {
            return $null
        }
        return (($raw | Select-Object -Last 1) | ConvertFrom-Json)
    }
    finally {
        Remove-Item -LiteralPath $tempPyPath -Force -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $intelPython)) {
    throw "Dedicated Intel XPU runtime not found: $intelPython"
}

if (-not (Test-PipReady -PythonExe $intelPython)) {
    Write-Host -ForegroundColor Yellow "$intelRuntimeDirName 尚未初始化，正在运行 setup_embeddable_python.bat..."
    & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto $intelRuntimeDirName
    if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $intelPython)) {
        throw "$intelRuntimeDirName 初始化失败，缺少可用的 pip。"
    }
}

Invoke-Step -Message "Upgrading pip / 升级 pip" -Action {
    & $intelPython -m pip install --upgrade pip setuptools wheel
}

Invoke-OptionalStep -Message "Removing incompatible packages / 移除不兼容依赖" -Action {
    & $intelPython -m pip uninstall -y @incompatiblePackages
} -WarningMessage "移除不兼容依赖时出现警告，继续执行。"

Invoke-Step -Message "Installing Intel XPU PyTorch / 安装 Intel XPU 版 PyTorch" -Action {
    & $intelPython -m pip install --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/xpu
}

Invoke-OptionalStep -Message "Installing optional Intel Extension for PyTorch / 安装可选 IPEX" -Action {
    & $intelPython -m pip install --upgrade intel-extension-for-pytorch --extra-index-url https://pytorch-extension.intel.com/release-whl/stable/xpu/us/
} -WarningMessage "IPEX 安装失败，当前脚本继续保留纯 PyTorch XPU 运行时。"

Write-Host -ForegroundColor Yellow "Intel XPU 社区当前常见现象是首次启动和前几步会明显更慢，因为底层图和内核需要先完成初始化。"
Write-Host -ForegroundColor Yellow "本安装器已把 Torch XPU 与 IPEX 分开安装，以尽量避开版本联动导致的依赖冲突。"
Write-Host -ForegroundColor Yellow "PyTorch 当前公开的 Windows XPU 主支持范围主要是 Windows 11 上的 Arc A/B 与带 Arc Graphics 的 Core Ultra 平台。若使用其他 Intel GPU 或较旧系统，请按实验路线看待。"
Write-Host -ForegroundColor Yellow "PyTorch 官方当前说明：Windows 上若要自己尝试 torch.compile(XPU)，需要额外安装 MSVC 编译链；本项目 Intel 实验路线默认会禁用 torch_compile。"
Write-Host -ForegroundColor Yellow "PyTorch 官方当前说明：Intel Arc A 系列在 fp16 AMP + GradScaler 下存在硬件限制；若训练时出现 AMP/GradScaler 异常，请优先改用 bf16。"

$filteredRequirements = New-FilteredRequirementsFile -SourcePath $requirementsPath
try {
    Invoke-Step -Message "Installing project requirements / 安装项目依赖" -Action {
        & $intelPython -m pip install -r $filteredRequirements
    }
}
finally {
    Remove-Item -LiteralPath $filteredRequirements -Force -ErrorAction SilentlyContinue
}

if (-not (Test-ModulesReady -PythonExe $intelPython -Modules $mainRequiredModules)) {
    throw "Intel XPU 运行时依赖仍不完整，请检查 pip 安装日志。"
}

Invoke-Step -Message "Verifying Intel XPU runtime / 校验 Intel XPU 运行时" -Action {
    $probe = Invoke-PythonRuntimeProbe -PythonExe $intelPython
    if (-not $probe) {
        throw "无法读取 $intelRuntimeDirName 运行时信息。"
    }
    if ($expectedRuntime.PythonMinors -and $expectedRuntime.PythonMinors.Count -gt 0 -and $probe.python_minor -notin $expectedRuntime.PythonMinors) {
        throw "Intel XPU runtime uses Python $($probe.python_minor), but the current supported target is $($expectedRuntime.PythonMinors -join '/')."
    }
    if ($probe.runtime_error) {
        throw "Intel XPU runtime verification failed: $($probe.runtime_error)"
    }
    if (-not $probe.xpu_available) {
        throw "Torch XPU runtime is not available."
    }
    $bf16State = if ($null -eq $probe.bf16_supported) { "unknown" } elseif ($probe.bf16_supported) { "yes" } else { "no" }
    Write-Host -ForegroundColor Green "Intel XPU runtime: Python $($probe.python_version); Torch $($probe.torch_version); TorchVision $($probe.torchvision_version); IPEX $($probe.ipex_version); XPU count $($probe.gpu_count); BF16 $bf16State"
    Write-Host -ForegroundColor Green "Intel XPU visible GPU: $($probe.gpu_name)"
}

Set-Content -Path $intelMarker -Value "ok" -Encoding ASCII
Write-Host -ForegroundColor Green "Intel XPU runtime dependencies are ready."
