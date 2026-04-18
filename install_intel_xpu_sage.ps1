param()

$ErrorActionPreference = "Stop"

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$null = . (Join-Path $repoRoot "tools\runtime\runtime_paths.ps1")

$runtimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "intel-xpu-sage"
$runtimeDirName = $runtimeInfo.DirectoryName
$runtimeDir = $runtimeInfo.DirectoryPath
$runtimePython = Join-Path $runtimeDir "python.exe"
$runtimeMarker = Join-Path $runtimeDir ".deps_installed"
$selfTestScript = Join-Path $repoRoot "mikazuki\scripts\intel_xpu_sage_selftest.py"
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
    "tensorboard",
    "pkg_resources",
    "sageattention"
)
$incompatiblePackages = @(
    "bitsandbytes",
    "xformers",
    "triton-windows",
    "pytorch-triton-rocm",
    "intel-extension-for-pytorch"
)

$expectedRuntime = @{
    PythonMinors = @("3.10", "3.11")
    SageAttention = "1.0.6"
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
        & $PythonExe -c "import importlib, sys, warnings;
warnings.filterwarnings('ignore', message='pkg_resources is deprecated as an API.*', category=UserWarning)
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
            $normalizedRequirement -like "triton-windows*" -or
            $normalizedRequirement -like "pytorch-triton-rocm*" -or
            $normalizedRequirement -like "intel-extension-for-pytorch*" -or
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
    "triton_version": "",
    "sageattention_version": "",
    "xpu_available": False,
    "gpu_count": 0,
    "gpu_name": "",
    "bf16_supported": None,
    "triton_import_ok": False,
    "sageattention_import_ok": False,
    "sageattention_symbols_ok": False,
    "runtime_error": "",
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
    result["runtime_error"] = f"torch import failed: {exc}"
    print(json.dumps(result))
    raise SystemExit(0)

result["torch_version"] = getattr(torch, "__version__", "")
result["torchvision_version"] = metadata_version("torchvision")
result["triton_version"] = metadata_version("triton", "pytorch-triton-xpu")
result["sageattention_version"] = metadata_version("sageattention")

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

try:
    import triton  # noqa: F401
    result["triton_import_ok"] = True
except Exception as exc:
    if not result["runtime_error"]:
        result["runtime_error"] = f"triton import failed: {exc}"

try:
    from sageattention import sageattn, sageattn_varlen
    result["sageattention_import_ok"] = True
    result["sageattention_symbols_ok"] = callable(sageattn) and callable(sageattn_varlen)
    if not result["sageattention_symbols_ok"] and not result["runtime_error"]:
        result["runtime_error"] = "sageattention import succeeded but required symbols are missing"
except Exception as exc:
    if not result["runtime_error"]:
        result["runtime_error"] = f"sageattention import failed: {exc}"

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

if (-not (Test-Path $runtimePython)) {
    Write-Host -ForegroundColor Yellow "$runtimeDirName 未检测到 python.exe，正在尝试自动初始化..."
    & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto $runtimeDirName
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $runtimePython)) {
        throw "Dedicated Intel XPU Sage runtime not found: $runtimePython"
    }
}

if (-not (Test-PipReady -PythonExe $runtimePython)) {
    Write-Host -ForegroundColor Yellow "$runtimeDirName 尚未初始化，正在运行 setup_embeddable_python.bat..."
    & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto $runtimeDirName
    if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $runtimePython)) {
        throw "$runtimeDirName 初始化失败，缺少可用的 pip。"
    }
}

Invoke-Step -Message "Upgrading pip / 升级 pip" -Action {
    & $runtimePython -m pip install --upgrade pip setuptools wheel
}

Invoke-OptionalStep -Message "Removing conflicting packages / 移除可能冲突的依赖" -Action {
    & $runtimePython -m pip uninstall -y @incompatiblePackages
} -WarningMessage "移除冲突依赖时出现警告，继续执行。"

Invoke-Step -Message "Installing Intel XPU PyTorch / 安装 Intel XPU 版 PyTorch" -Action {
    & $runtimePython -m pip install --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/xpu
}

Write-Host -ForegroundColor Yellow "Intel XPU Sage 实验运行时不会主动安装 IPEX，以尽量避免与 Triton / SageAttention 实验链路互相污染。"
Write-Host -ForegroundColor Yellow "如果当前 PyTorch XPU 二进制未自带可用 Triton，这条路线仍可能无法通过验证；届时请先保留这条支线，不要覆盖现有 Intel 主线。"
Write-Host -ForegroundColor Yellow "PyTorch 当前公开的 Windows XPU 主支持范围主要是 Windows 11 上的 Arc A/B 与带 Arc Graphics 的 Core Ultra 平台。若使用其他 Intel GPU 或较旧系统，请按实验路线看待。"
Write-Host -ForegroundColor Yellow "PyTorch 官方当前说明：Windows 上若要自己尝试 torch.compile(XPU)，需要额外安装 MSVC 编译链；本项目 Intel Sage 实验路线默认会禁用 torch_compile。"
Write-Host -ForegroundColor Yellow "PyTorch 官方当前说明：Intel Arc A 系列在 fp16 AMP + GradScaler 下存在硬件限制；若训练时出现 AMP/GradScaler 异常，请优先改用 bf16。"

$filteredRequirements = New-FilteredRequirementsFile -SourcePath $requirementsPath
try {
    Invoke-Step -Message "Installing project requirements / 安装项目依赖" -Action {
        & $runtimePython -m pip install -r $filteredRequirements
    }
}
finally {
    Remove-Item -LiteralPath $filteredRequirements -Force -ErrorAction SilentlyContinue
}

Invoke-Step -Message "Installing SageAttention 1.0.6 / 安装 SageAttention 1.0.6" -Action {
    & $runtimePython -m pip install --upgrade --no-warn-script-location sageattention==1.0.6
}

Invoke-Step -Message "Re-enabling pkg_resources compatibility for TensorBoard / 修复 TensorBoard 对 pkg_resources 的兼容性" -Action {
    & $runtimePython -m pip install --upgrade --no-warn-script-location --prefer-binary "setuptools<81" 2>&1
}

if (-not (Test-ModulesReady -PythonExe $runtimePython -Modules $mainRequiredModules)) {
    throw "Intel XPU Sage 运行时依赖仍不完整，请检查 pip 安装日志。"
}

Invoke-Step -Message "Verifying Intel XPU Sage runtime / 校验 Intel XPU Sage 运行时" -Action {
    $probe = Invoke-PythonRuntimeProbe -PythonExe $runtimePython
    if (-not $probe) {
        throw "无法读取 $runtimeDirName 运行时信息。"
    }
    if ($expectedRuntime.PythonMinors -and $expectedRuntime.PythonMinors.Count -gt 0 -and $probe.python_minor -notin $expectedRuntime.PythonMinors) {
        throw "Intel XPU Sage runtime uses Python $($probe.python_minor), but the current supported target is $($expectedRuntime.PythonMinors -join '/')."
    }
    if ($probe.runtime_error) {
        throw "Intel XPU Sage runtime verification failed: $($probe.runtime_error)"
    }
    if (-not $probe.xpu_available) {
        throw "Torch XPU runtime is not available."
    }
    if (-not $probe.triton_import_ok) {
        throw "Triton is not importable in $runtimeDirName."
    }
    if (-not $probe.sageattention_import_ok -or -not $probe.sageattention_symbols_ok) {
        throw "SageAttention is not importable in $runtimeDirName."
    }
    if ($expectedRuntime.SageAttention -and $probe.sageattention_version -ne $expectedRuntime.SageAttention) {
        throw "Intel XPU Sage runtime installed SageAttention $($probe.sageattention_version), expected $($expectedRuntime.SageAttention)."
    }
    $bf16State = if ($null -eq $probe.bf16_supported) { "unknown" } elseif ($probe.bf16_supported) { "yes" } else { "no" }
    Write-Host -ForegroundColor Green "Intel XPU Sage runtime: Python $($probe.python_version); Torch $($probe.torch_version); TorchVision $($probe.torchvision_version); Triton $($probe.triton_version); SageAttention $($probe.sageattention_version); XPU count $($probe.gpu_count); BF16 $bf16State"
    Write-Host -ForegroundColor Green "Intel XPU Sage visible GPU: $($probe.gpu_name)"
}

Invoke-Step -Message "Running Intel XPU Sage self-test / 运行 Intel XPU Sage 最小自检" -Action {
    if (-not (Test-Path $selfTestScript)) {
        throw "Intel XPU Sage self-test script was not found: $selfTestScript"
    }

    $raw = & $runtimePython $selfTestScript
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($raw)) {
        throw "Intel XPU Sage self-test did not return a readable result."
    }

    $probe = (($raw | Select-Object -Last 1) | ConvertFrom-Json)
    if (-not $probe.success) {
        $detail = [string]$probe.runtime_error
        if (-not [string]::IsNullOrWhiteSpace([string]$probe.traceback_tail)) {
            $detail = "$detail | $($probe.traceback_tail)"
        }
        throw "Intel XPU Sage self-test failed: $detail"
    }

    Write-Host -ForegroundColor Green "Intel XPU Sage self-test passed: dtype=$($probe.tested_dtype); layout=$($probe.tested_layout); variants=$($probe.tested_variants -join ','); shape=$($probe.output_shape -join 'x'); finite=$($probe.all_finite); max_abs_diff_vs_sdpa=$($probe.max_abs_diff_vs_sdpa); backward_ok=$($probe.backward_ok)"
}

Set-Content -Path $runtimeMarker -Value "ok" -Encoding ASCII
Write-Host -ForegroundColor Green "Intel XPU Sage runtime dependencies are ready."
