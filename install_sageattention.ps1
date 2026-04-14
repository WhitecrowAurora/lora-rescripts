param(
    [ValidateSet("triton-v1", "triton-v2")]
    [string]$Profile = "triton-v1",
    [string]$SageAttentionPackage = "",
    [string]$TritonPackage = "triton-windows==3.5.1.post24",
    [ValidateSet("general", "sageattention2", "latest")]
    [string]$RuntimeTarget = "general"
)

$ErrorActionPreference = "Stop"

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$null = . (Join-Path $repoRoot "tools\runtime\runtime_paths.ps1")
. (Join-Path $repoRoot "tools\runtime\mirror_env.ps1")

if (Test-MikazukiChinaMirrorMode) {
    Enable-MikazukiChinaMirrorMode -RepoRoot $repoRoot
}

$runtimeKey = if ($RuntimeTarget -in @("sageattention2", "latest")) { "sageattention2" } else { "sageattention" }
$isSageAttention2Runtime = $runtimeKey -eq "sageattention2"
$runtimeDisplayName = if ($isSageAttention2Runtime) { "SageAttention2" } else { "SageAttention" }

$sageAttentionRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName $runtimeKey
$sageAttentionRuntimeDirName = $sageAttentionRuntimeInfo.DirectoryName
$sageAttentionRuntimeDir = $sageAttentionRuntimeInfo.DirectoryPath
$sageAttentionPython = Join-Path $sageAttentionRuntimeDir "python.exe"
$sageAttentionMarker = Join-Path $sageAttentionRuntimeDir ".deps_installed"
$mainRequiredModules = @("accelerate", "torch", "fastapi", "toml", "transformers", "diffusers", "peft", "torchdiffeq", "timm", "lion_pytorch", "dadaptation", "schedulefree", "prodigyopt", "prodigyplus", "pytorch_optimizer")

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

function Invoke-NativeQuiet {
    param (
        [string]$FilePath,
        [string[]]$Arguments
    )

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $FilePath @Arguments 1>$null 2>$null
        return $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
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
        & $PythonExe -c "import importlib, sys; failed=[];
for name in sys.argv[1:]:
    try:
        importlib.import_module(name)
    except Exception:
        failed.append(name)
raise SystemExit(1 if failed else 0)" @Modules 1>$null 2>$null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
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

function Get-PythonRuntimeVersionInfo {
    param (
        [string]$PythonExe
    )

    $script = @"
import json
import sys

print(json.dumps({
    "major": sys.version_info.major,
    "minor": sys.version_info.minor,
    "micro": sys.version_info.micro,
    "version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
    "abi_tag": f"{sys.version_info.major}{sys.version_info.minor}",
}))
"@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $script
}

function Ensure-EmbeddablePythonDevFiles {
    param (
        [string]$PythonExe,
        [string]$RuntimeDir
    )

    $versionInfo = Get-PythonRuntimeVersionInfo -PythonExe $PythonExe
    if (-not $versionInfo) {
        throw "Could not determine Python runtime version for $RuntimeDir."
    }

    $pythonLibName = "python$($versionInfo.abi_tag).lib"
    $runtimeIncludeDir = Join-Path $RuntimeDir "Include"
    $runtimeLibDir = Join-Path $RuntimeDir "libs"
    $runtimePythonHeader = Join-Path $runtimeIncludeDir "Python.h"
    $runtimePythonLib = Join-Path $runtimeLibDir $pythonLibName

    if ((Test-Path $runtimePythonHeader) -and (Test-Path $runtimePythonLib)) {
        Write-Host -ForegroundColor Green "Python dev files already present for $sageAttentionRuntimeDirName"
        return
    }

    $devCacheRoot = Join-Path $repoRoot ".python-dev-cache"
    $nugetVersion = $versionInfo.version
    $packageFile = Join-Path $devCacheRoot "python.$nugetVersion.nupkg"
    $extractDir = Join-Path $devCacheRoot "python-$nugetVersion"
    $packageUrl = "https://www.nuget.org/api/v2/package/python/$nugetVersion"

    if (-not (Test-Path $devCacheRoot)) {
        New-Item -ItemType Directory -Path $devCacheRoot -Force | Out-Null
    }

    if (-not (Test-Path $packageFile)) {
        Write-Host -ForegroundColor Yellow "Downloading CPython dev package for $nugetVersion..."
        Invoke-WebRequest -Uri $packageUrl -OutFile $packageFile
    }

    $sourceIncludeDir = Join-Path $extractDir "tools\include"
    $sourcePythonLib = Join-Path $extractDir "tools\libs\$pythonLibName"

    if (-not (Test-Path $sourceIncludeDir) -or -not (Test-Path $sourcePythonLib)) {
        if (Test-Path $extractDir) {
            Remove-Item -LiteralPath $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        }

        Write-Host -ForegroundColor Yellow "Extracting CPython dev package for $nugetVersion..."
        $zipPackageFile = Join-Path $devCacheRoot "python.$nugetVersion.zip"
        Copy-Item -LiteralPath $packageFile -Destination $zipPackageFile -Force
        Expand-Archive -LiteralPath $zipPackageFile -DestinationPath $extractDir -Force
    }

    if (-not (Test-Path $sourceIncludeDir) -or -not (Test-Path $sourcePythonLib)) {
        throw "Downloaded CPython dev package does not contain the expected Include or $pythonLibName files."
    }

    if (-not (Test-Path $runtimeIncludeDir)) {
        New-Item -ItemType Directory -Path $runtimeIncludeDir -Force | Out-Null
    }
    if (-not (Test-Path $runtimeLibDir)) {
        New-Item -ItemType Directory -Path $runtimeLibDir -Force | Out-Null
    }

    Copy-Item -Path (Join-Path $sourceIncludeDir "*") -Destination $runtimeIncludeDir -Recurse -Force
    Copy-Item -LiteralPath $sourcePythonLib -Destination $runtimePythonLib -Force
    Write-Host -ForegroundColor Green "Provisioned Python dev files into $sageAttentionRuntimeDirName"
}

function Get-SageAttentionExpectedPackageVersions {
    param (
        [string]$SelectedProfile
    )

    switch ($SelectedProfile) {
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

function Get-SageAttentionInstalledPackageSnapshot {
    param (
        [string]$PythonExe
    )

    $script = @"
import json
import sys
import importlib.util
import importlib.metadata as md

def version(name):
    try:
        return md.version(name)
    except Exception:
        return ""

def has_module(name):
    try:
        return importlib.util.find_spec(name) is not None
    except Exception:
        return False

print(json.dumps({
    "python_minor": f"{sys.version_info.major}.{sys.version_info.minor}",
    "torch_version": version("torch"),
    "torchvision_version": version("torchvision"),
    "triton_version": version("triton-windows") or version("triton"),
    "sageattention_version": version("sageattention"),
    "sageattention_module_ok": has_module("sageattention"),
}))
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
    "sageattention_runtime_ok": False,
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

if result["sageattention_import_ok"] and result["sageattention_symbols_ok"] and result["cuda_available"]:
    try:
        q = torch.randn((1, 8, 64, 64), device="cuda", dtype=torch.float16)
        out = sageattn(q, q, q)
        torch.cuda.synchronize()
        result["sageattention_runtime_ok"] = tuple(out.shape) == tuple(q.shape)
        if not result["sageattention_runtime_ok"]:
            result["sageattention_error"] = f"sageattention runtime returned unexpected shape: {tuple(out.shape)}"
    except Exception as exc:
        result["sageattention_error"] = f"sageattention runtime probe failed: {exc}"

print(json.dumps(result))
"@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $script
}

function Assert-SageAttentionRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected
    )

    $probe = Get-SageAttentionRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        throw "Could not probe $sageAttentionRuntimeDirName runtime details after installation."
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinor -and $probe.python_minor -ne $Expected.PythonMinor) {
        $issues.Add("Python minor is $($probe.python_minor), expected $($Expected.PythonMinor)") | Out-Null
    }
    if ($Expected.Torch -and $probe.torch_version -ne $Expected.Torch) {
        $issues.Add("Torch is $($probe.torch_version), expected $($Expected.Torch)") | Out-Null
    }
    if ($Expected.TorchVision -and $probe.torchvision_version -ne $Expected.TorchVision) {
        $issues.Add("TorchVision is $($probe.torchvision_version), expected $($Expected.TorchVision)") | Out-Null
    }
    if ($Expected.SageAttention -and $probe.sageattention_version -ne $Expected.SageAttention) {
        $issues.Add("sageattention is $($probe.sageattention_version), expected $($Expected.SageAttention)") | Out-Null
    }
    if ($Expected.Triton -and $probe.triton_version -ne $Expected.Triton) {
        $issues.Add("triton is $($probe.triton_version), expected $($Expected.Triton)") | Out-Null
    }
    if (-not $probe.cuda_available) {
        $issues.Add("CUDA is not available") | Out-Null
    }
    if (-not $probe.triton_import_ok) {
        $issues.Add("triton import failed") | Out-Null
    }
    if (-not $probe.sageattention_import_ok -or -not $probe.sageattention_symbols_ok -or -not $probe.sageattention_runtime_ok) {
        $errorMessage = $probe.sageattention_error
        if ([string]::IsNullOrWhiteSpace($errorMessage)) {
            $errorMessage = "sageattention import, symbol, or runtime check failed"
        }
        elseif ($errorMessage -match "Python\\.h|Failed to find Python libs|lpython3\d+|python3\d+\\.lib") {
            $errorMessage = "sageattention runtime probe failed because the embeddable runtime is missing Python development headers or import libraries. Embeddable Python usually does not ship Include\\Python.h or python311.lib / python312.lib, so Triton cannot build its runtime helper."
        }
        elseif ($errorMessage -match "_fused|DLL load failed") {
            $errorMessage = "sageattention native extension failed to load (_fused). This usually means the installed SageAttention wheel does not match the current Torch/CUDA runtime stack, or the Microsoft Visual C++ x64 runtime is missing. On Windows this is commonly a binary compatibility issue, especially for SageAttention 2.x wheels."
        }
        $issues.Add($errorMessage) | Out-Null
    }

    if ($issues.Count -gt 0) {
        throw "SageAttention runtime verification failed: $($issues -join '; ')"
    }

    Write-Host -ForegroundColor Green "SageAttention runtime versions: Python $($probe.python_version); Torch $($probe.torch_version); TorchVision $($probe.torchvision_version); Triton $($probe.triton_version); SageAttention $($probe.sageattention_version)"
    Write-Host -ForegroundColor Green "CUDA available: $($probe.cuda_available)"
}

function Resolve-SageAttentionPackage {
    param (
        [string]$RequestedPackage
    )

    $wheelSearchDirs = if ($isSageAttention2Runtime) {
        @(
            (Join-Path $repoRoot "wheel")
            (Join-Path $repoRoot "sageattention-wheels")
            (Join-Path $repoRoot "sageattention_wheels")
        )
    }
    else {
        @(
            (Join-Path $repoRoot "sageattention-wheels")
            (Join-Path $repoRoot "sageattention_wheels")
        )
    }

    if ([string]::IsNullOrWhiteSpace($RequestedPackage)) {
        $localWheel = $null
        foreach ($wheelDir in $wheelSearchDirs) {
            if (-not (Test-Path $wheelDir)) {
                continue
            }

            $patterns = if ($isSageAttention2Runtime) {
                if ([string]::IsNullOrWhiteSpace($runtimePythonAbiTag)) {
                    @()
                }
                else {
                    @("*$runtimePythonAbiTag*win_amd64.whl", "*$runtimePythonAbiTag*.whl")
                }
            }
            else {
                @("*blackwell*.whl", "*sm120*.whl", "*.whl")
            }

            foreach ($pattern in $patterns) {
                $candidate = Get-ChildItem -LiteralPath $wheelDir -Filter $pattern -File -ErrorAction SilentlyContinue |
                    Where-Object { $_.Name -like "sageattention*.whl" } |
                    Sort-Object LastWriteTime -Descending |
                    Select-Object -First 1
                if (-not $candidate) {
                    continue
                }

                if ($isSageAttention2Runtime) {
                    if (
                        $candidate.Name -match [regex]::Escape($runtimePythonAbiTag) `
                        -and $candidate.Name -match 'win_amd64' `
                        -and $candidate.Name -notmatch 'linux'
                    ) {
                        $localWheel = $candidate
                        break
                    }
                }
                elseif ($candidate.Name -notmatch "blackwell|sm120") {
                    $localWheel = $candidate
                    break
                }
            }

            if ($localWheel) {
                break
            }
        }

        if ($localWheel) {
            Write-Host -ForegroundColor Yellow "Using local SageAttention wheel: $($localWheel.FullName)"
            return [pscustomobject]@{
                Kind = "file"
                Value = $localWheel.FullName
            }
        }
    }

    if ([string]::IsNullOrWhiteSpace($RequestedPackage)) {
        return [pscustomobject]@{
            Kind = "spec"
            Value = $(if ($isSageAttention2Runtime) { "sageattention==2.2.0" } else { "sageattention==1.0.6" })
        }
    }

    if (Test-Path $RequestedPackage) {
        return [pscustomobject]@{
            Kind = "file"
            Value = (Resolve-Path $RequestedPackage).Path
        }
    }

    if ($RequestedPackage -match '^https?://') {
        $downloadDir = Join-Path $repoRoot "sageattention-wheels"
        if (-not (Test-Path $downloadDir)) {
            New-Item -ItemType Directory -Path $downloadDir | Out-Null
        }

        $fileName = [System.IO.Path]::GetFileName(([System.Uri]$RequestedPackage).AbsolutePath)
        if ([string]::IsNullOrWhiteSpace($fileName)) {
            throw "Could not infer wheel filename from URL: $RequestedPackage"
        }

        $fileName = [System.Uri]::UnescapeDataString($fileName)
        $downloadPath = Join-Path $downloadDir $fileName
        Write-Host -ForegroundColor Yellow "Downloading SageAttention package..."
        Invoke-WebRequest -Uri $RequestedPackage -OutFile $downloadPath
        return [pscustomobject]@{
            Kind = "file"
            Value = $downloadPath
        }
    }

    return [pscustomobject]@{
        Kind = "spec"
        Value = $RequestedPackage
    }
}

if (-not (Test-Path $sageAttentionPython)) {
    $expectedPythonLine = if ($isSageAttention2Runtime) { "1. Extract a Python 3.11+ embeddable package into $sageAttentionRuntimeDir" } else { "1. Extract a Python 3.11 embeddable package into $sageAttentionRuntimeDir" }
    $rerunInstallerLine = if ($isSageAttention2Runtime) { "2. Run install_sageattention2.ps1 again" } else { "2. Run install_sageattention.ps1 again" }
throw @"
$runtimeDisplayName portable Python was not found.

Expected:
- $sageAttentionPython

Recommended fix:
${expectedPythonLine}
${rerunInstallerLine}
"@
}

if (-not (Test-PipReady -PythonExe $sageAttentionPython)) {
    Write-Host -ForegroundColor Yellow "$sageAttentionRuntimeDirName is not initialized yet. Running setup_embeddable_python.bat..."
    & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto $sageAttentionRuntimeDirName
    if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $sageAttentionPython)) {
        throw "Failed to initialize $sageAttentionRuntimeDirName."
    }
}

$runtimeVersionInfo = Get-PythonRuntimeVersionInfo -PythonExe $sageAttentionPython
$runtimePythonMinor = if ($runtimeVersionInfo) { "$($runtimeVersionInfo.major).$($runtimeVersionInfo.minor)" } else { "" }
$runtimePythonAbiTag = if ($runtimeVersionInfo) { "cp$($runtimeVersionInfo.major)$($runtimeVersionInfo.minor)" } else { "" }
if ($isSageAttention2Runtime) {
    if (-not $runtimeVersionInfo) {
        throw "Could not determine the Python version in $sageAttentionRuntimeDirName."
    }
    if ($runtimeVersionInfo.major -lt 3 -or ($runtimeVersionInfo.major -eq 3 -and $runtimeVersionInfo.minor -lt 11)) {
        throw "SageAttention2 requires Python 3.11 or newer, but $sageAttentionRuntimeDirName is using $($runtimeVersionInfo.version)."
    }
}

Invoke-Step "Provisioning Python dev files required by Triton..." {
    Ensure-EmbeddablePythonDevFiles -PythonExe $sageAttentionPython -RuntimeDir $sageAttentionRuntimeDir
}

Set-Location $repoRoot
$expectedPackages = Get-SageAttentionExpectedPackageVersions -SelectedProfile $Profile
$resolvedSageAttentionPackage = Resolve-SageAttentionPackage -RequestedPackage $SageAttentionPackage
$packageSnapshot = Get-SageAttentionInstalledPackageSnapshot -PythonExe $sageAttentionPython
$mainModulesInstalled = Test-ModulesReady -PythonExe $sageAttentionPython -Modules $mainRequiredModules
$torchPackagesReady = $packageSnapshot -and
    (-not $expectedPackages.PythonMinor -or $packageSnapshot.python_minor -eq $expectedPackages.PythonMinor) -and
    (-not $expectedPackages.Torch -or $packageSnapshot.torch_version -eq $expectedPackages.Torch) -and
    (-not $expectedPackages.TorchVision -or $packageSnapshot.torchvision_version -eq $expectedPackages.TorchVision)
$tritonPackageReady = $packageSnapshot -and -not [string]::IsNullOrWhiteSpace($packageSnapshot.triton_version)
$sageAttentionPackageReady = $packageSnapshot -and $packageSnapshot.sageattention_module_ok -and -not [string]::IsNullOrWhiteSpace($packageSnapshot.sageattention_version)

Invoke-Step "Upgrading pip tooling for SageAttention environment..." {
    & $sageAttentionPython -m pip install --upgrade --no-warn-script-location pip "setuptools<81" wheel
}

if ($torchPackagesReady) {
    Write-Host -ForegroundColor Green "PyTorch and torchvision already match the expected SageAttention profile."
}
else {
    Invoke-Step "Installing PyTorch and torchvision for SageAttention environment ($Profile)..." {
        $mirrorArgs = @(
            "--upgrade",
            "--force-reinstall",
            "--no-warn-script-location",
            "--prefer-binary"
        )
        if ($Profile -eq "triton-v2") {
            $mirrorArgs = $mirrorArgs + @("torch==2.6.0+cu124", "torchvision==0.21.0+cu124")
            $fallbackArgs = $mirrorArgs + @("--index-url", "https://download.pytorch.org/whl/cu124")
        }
        else {
            $mirrorArgs = $mirrorArgs + @("torch==2.10.0+cu128", "torchvision==0.25.0+cu128")
            $fallbackArgs = $mirrorArgs + @("--extra-index-url", "https://download.pytorch.org/whl/cu128")
        }
        Invoke-MirrorAwarePipInstall `
            -PythonExe $sageAttentionPython `
            -MirrorArgs $mirrorArgs `
            -FallbackArgs $fallbackArgs `
            -MirrorLabel "China mirror (PyPI + SJTU PyTorch wheel mirror)" `
            -FallbackLabel "official PyTorch channel" | Out-Null
    }
}

if ($mainModulesInstalled) {
    Write-Host -ForegroundColor Green "Project dependencies already look complete in $sageAttentionRuntimeDirName."
}
else {
    Invoke-Step "Installing project dependencies into $sageAttentionRuntimeDirName..." {
        & $sageAttentionPython -m pip install --upgrade --no-warn-script-location --prefer-binary -r requirements.txt
    }
}

if (-not (Test-ModulesReady -PythonExe $sageAttentionPython -Modules $mainRequiredModules)) {
    throw "Project dependencies did not finish installing correctly in $sageAttentionRuntimeDirName. One or more required runtime modules are still missing."
}

if ($tritonPackageReady) {
    Write-Host -ForegroundColor Green "Triton runtime is already installed in $sageAttentionRuntimeDirName."
}
else {
    Invoke-Step "Installing Triton runtime for SageAttention..." {
        & $sageAttentionPython -m pip install --upgrade --no-warn-script-location --prefer-binary $TritonPackage
    }
}

if ($sageAttentionPackageReady) {
    Write-Host -ForegroundColor Green "SageAttention package is already installed in $sageAttentionRuntimeDirName."
}
else {
    Invoke-OptionalStep "Removing any existing SageAttention package..." {
        & $sageAttentionPython -m pip uninstall -y sageattention
    } "Existing SageAttention cleanup reported a warning. Continuing with fresh install."

    if ($resolvedSageAttentionPackage.Kind -eq "file") {
        Write-Host -ForegroundColor Yellow "Using SageAttention package file: $($resolvedSageAttentionPackage.Value)"
        Invoke-Step "Installing SageAttention package from local file..." {
            & $sageAttentionPython -m pip install --upgrade --no-warn-script-location --no-deps $resolvedSageAttentionPackage.Value
        }
    }
    else {
        Invoke-Step "Installing SageAttention package..." {
            & $sageAttentionPython -m pip install --upgrade --no-warn-script-location --prefer-binary $resolvedSageAttentionPackage.Value
        }
    }
}

Invoke-Step "Verifying SageAttention import/runtime bindings..." {
    & $sageAttentionPython -c "import importlib.metadata as md; import torch, triton; from sageattention import sageattn, sageattn_varlen; print('torch:', torch.__version__); print('triton:', getattr(triton, '__version__', 'unknown')); print('sageattention:', md.version('sageattention')); print('cuda:', torch.cuda.is_available()); print('symbols:', callable(sageattn), callable(sageattn_varlen))"
}

Invoke-Step "Verifying SageAttention environment..." {
    $verified = $false
    for ($attempt = 1; $attempt -le 2 -and -not $verified; $attempt++) {
        try {
            Assert-SageAttentionRuntimeReady -PythonExe $sageAttentionPython -Expected $expectedPackages
            $verified = $true
        }
        catch {
            if ($attempt -ge 2) {
                throw
            }

            Write-Host -ForegroundColor Yellow "SageAttention runtime verification hit a transient error on attempt $attempt. Retrying once..."
            Start-Sleep -Seconds 2
        }
    }
}

Set-Content -Path $sageAttentionMarker -Value "" -Encoding ASCII
Write-Host -ForegroundColor Green "$runtimeDisplayName experimental environment is ready"
