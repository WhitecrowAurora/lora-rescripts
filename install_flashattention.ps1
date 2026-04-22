param(
    [string]$FlashAttentionWheel = "",
    [string]$FlashAttentionVersion = "2.8.3",
    [string]$ReleaseTag = "v0.7.13"
)

$ErrorActionPreference = "Stop"

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $repoRoot "tools\runtime\runtime_paths.ps1")
. (Join-Path $repoRoot "tools\runtime\mirror_env.ps1")

if (Test-MikazukiChinaMirrorMode) {
    Enable-MikazukiChinaMirrorMode -RepoRoot $repoRoot
}

$flashAttentionRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "flashattention"
$flashAttentionRuntimeDirName = $flashAttentionRuntimeInfo.DirectoryName
$flashAttentionRuntimeDir = $flashAttentionRuntimeInfo.DirectoryPath
$flashAttentionPython = Join-Path $flashAttentionRuntimeDir "python.exe"
$flashAttentionMarker = Join-Path $flashAttentionRuntimeDir ".deps_installed"
$mainRequiredModules = @("accelerate", "torch", "fastapi", "toml", "transformers", "diffusers", "peft", "torchdiffeq", "timm", "lion_pytorch", "dadaptation", "schedulefree", "prodigyopt", "prodigyplus", "pytorch_optimizer", "tensorboard", "pkg_resources", "flash_attn")

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
        & $PythonExe -c "import importlib, sys, warnings; warnings.filterwarnings('ignore', message='pkg_resources is deprecated as an API.*', category=UserWarning); failed=[];
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
    "python_minor": f"{sys.version_info.major}.{sys.version_info.minor}",
    "abi_tag": f"cp{sys.version_info.major}{sys.version_info.minor}",
}))
"@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $script
}

function Ensure-EmbeddedRuntimeRepoBootstrap {
    param (
        [string]$RuntimeDir
    )

    $pthFile = Get-ChildItem -Path $RuntimeDir -Filter 'python*._pth' -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $pthFile) {
        return
    }

    $rawLines = Get-Content -LiteralPath $pthFile.FullName -ErrorAction SilentlyContinue
    if (-not $rawLines) {
        return
    }

    $runtimeFullPath = [System.IO.Path]::GetFullPath((Join-Path $RuntimeDir '.'))
    $repoFullPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot '.'))
    $runtimeUri = New-Object System.Uri(($runtimeFullPath.TrimEnd('\') + '\'))
    $repoUri = New-Object System.Uri(($repoFullPath.TrimEnd('\') + '\'))
    $repoRelativePath = [System.Uri]::UnescapeDataString($runtimeUri.MakeRelativeUri($repoUri).ToString()).Replace('/', '\')
    if ([string]::IsNullOrWhiteSpace($repoRelativePath)) {
        $repoRelativePath = '.'
    }

    $normalizedLines = @($rawLines | ForEach-Object { [string]($_).Trim() })
    if ($normalizedLines -contains $repoRelativePath) {
        return
    }

    $insertIndex = $rawLines.Count
    for ($i = 0; $i -lt $rawLines.Count; $i++) {
        if ([string]($rawLines[$i]).Trim() -eq 'import site') {
            $insertIndex = $i
            break
        }
    }

    $newLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $insertIndex; $i++) {
        $null = $newLines.Add([string]$rawLines[$i])
    }
    $null = $newLines.Add($repoRelativePath)
    for ($i = $insertIndex; $i -lt $rawLines.Count; $i++) {
        $null = $newLines.Add([string]$rawLines[$i])
    }

    Set-Content -LiteralPath $pthFile.FullName -Value $newLines -Encoding ASCII
}

function Get-FlashAttentionExpectedPackageVersions {
    return @{
        PythonMinor = ""
        Torch = "2.10.0+cu128"
        TorchVision = "0.25.0+cu128"
        FlashAttentionPrefix = $FlashAttentionVersion
    }
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

function Assert-FlashAttentionRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected
    )

    $probe = Get-FlashAttentionRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        throw "Could not probe $flashAttentionRuntimeDirName runtime details after installation."
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
    if ($Expected.FlashAttentionPrefix -and ([string]::IsNullOrWhiteSpace($probe.flashattention_version) -or -not $probe.flashattention_version.StartsWith($Expected.FlashAttentionPrefix))) {
        $issues.Add("flash-attn is $($probe.flashattention_version), expected $($Expected.FlashAttentionPrefix)*") | Out-Null
    }
    if (-not $probe.cuda_available) {
        $issues.Add("CUDA is not available") | Out-Null
    }
    if (-not $probe.flashattention_import_ok -or -not $probe.flashattention_runtime_ok) {
        $errorMessage = $probe.flashattention_error
        if ([string]::IsNullOrWhiteSpace($errorMessage)) {
            $errorMessage = "flash-attn import or runtime check failed"
        }
        $issues.Add($errorMessage) | Out-Null
    }

    if ($issues.Count -gt 0) {
        throw "FlashAttention runtime verification failed: $($issues -join '; ')"
    }

    Write-Host -ForegroundColor Green "FlashAttention runtime versions: Python $($probe.python_version); Torch $($probe.torch_version); TorchVision $($probe.torchvision_version); flash-attn $($probe.flashattention_version)"
    Write-Host -ForegroundColor Green "CUDA available: $($probe.cuda_available)"
}

function Resolve-FlashAttentionWheel {
    param (
        [string]$RequestedWheel,
        [string]$PythonExe
    )

    if ($RequestedWheel) {
        if (Test-Path $RequestedWheel) {
            return (Resolve-Path $RequestedWheel).Path
        }

        if (-not ($RequestedWheel -match '^https?://')) {
            throw "Specified FlashAttentionWheel path was not found: $RequestedWheel"
        }

        $downloadDir = Join-Path $repoRoot "flashattention-wheels"
        if (-not (Test-Path $downloadDir)) {
            New-Item -ItemType Directory -Path $downloadDir | Out-Null
        }

        $fileName = [System.IO.Path]::GetFileName(([System.Uri]$RequestedWheel).AbsolutePath)
        if ([string]::IsNullOrWhiteSpace($fileName)) {
            throw "Could not infer wheel filename from URL: $RequestedWheel"
        }

        $fileName = [System.Uri]::UnescapeDataString($fileName)
        $downloadPath = Join-Path $downloadDir $fileName
        Write-Host -ForegroundColor Yellow "Downloading FlashAttention wheel..."
        Invoke-WebRequest -Uri $RequestedWheel -OutFile $downloadPath
        return $downloadPath
    }

    $versionInfo = Get-PythonRuntimeVersionInfo -PythonExe $PythonExe
    if (-not $versionInfo) {
        throw "Could not determine Python ABI tag for $flashAttentionRuntimeDirName."
    }

    $abiTag = $versionInfo.abi_tag
    $fileName = "flash_attn-$FlashAttentionVersion+cu128torch2.10-$abiTag-$abiTag-win_amd64.whl"
    $searchRoots = @(
        $repoRoot,
        (Join-Path $repoRoot "flashattention-wheels"),
        (Join-Path $repoRoot "flashattention_wheels"),
        (Join-Path $repoRoot "wheels")
    )

    foreach ($root in $searchRoots) {
        if (-not (Test-Path $root)) {
            continue
        }

        $candidate = Join-Path $root $fileName
        if (Test-Path $candidate) {
            return (Resolve-Path $candidate).Path
        }
    }

    $encodedFileName = [System.Uri]::EscapeDataString($fileName)
    return "https://github.com/mjun0812/flash-attention-prebuild-wheels/releases/download/$ReleaseTag/$encodedFileName"
}

function Get-DefaultFlashAttentionWheelUrl {
    param(
        [string]$PythonExe
    )

    $versionInfo = Get-PythonRuntimeVersionInfo -PythonExe $PythonExe
    if (-not $versionInfo) {
        throw "Could not determine Python ABI tag for $flashAttentionRuntimeDirName."
    }

    $abiTag = $versionInfo.abi_tag
    $fileName = "flash_attn-$FlashAttentionVersion+cu128torch2.10-$abiTag-$abiTag-win_amd64.whl"
    $encodedFileName = [System.Uri]::EscapeDataString($fileName)
    return "https://github.com/mjun0812/flash-attention-prebuild-wheels/releases/download/$ReleaseTag/$encodedFileName"
}

function Test-IsManagedFlashAttentionWheelPath {
    param(
        [string]$WheelPath,
        [string]$PythonExe
    )

    if ([string]::IsNullOrWhiteSpace($WheelPath) -or ($WheelPath -match '^https?://')) {
        return $false
    }

    if (-not (Test-Path $WheelPath)) {
        return $false
    }

    try {
        $resolvedWheelPath = (Resolve-Path $WheelPath).Path
    }
    catch {
        return $false
    }

    $defaultWheelUrl = Get-DefaultFlashAttentionWheelUrl -PythonExe $PythonExe
    $expectedFileName = [System.IO.Path]::GetFileName(([System.Uri]$defaultWheelUrl).AbsolutePath)
    if ([System.IO.Path]::GetFileName($resolvedWheelPath) -ne $expectedFileName) {
        return $false
    }

    $managedRoots = @(
        $repoRoot,
        (Join-Path $repoRoot "flashattention-wheels"),
        (Join-Path $repoRoot "flashattention_wheels"),
        (Join-Path $repoRoot "wheels")
    )

    foreach ($root in $managedRoots) {
        if (-not (Test-Path $root)) {
            continue
        }
        try {
            $resolvedRoot = (Resolve-Path $root).Path
        }
        catch {
            continue
        }
        if ($resolvedWheelPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
    }

    return $false
}

function Get-GitHubMirrorCandidates {
    $candidates = @()

    $customMirror = ([string]$Env:MIKAZUKI_GITHUB_MIRROR_BASE).Trim()
    if (-not [string]::IsNullOrWhiteSpace($customMirror)) {
        if (-not $customMirror.EndsWith('/')) {
            $customMirror += '/'
        }
        $candidates += $customMirror
    }

    $defaultMirror = 'https://hub.gitmirror.com/https://github.com/'
    if (-not ($candidates -contains $defaultMirror)) {
        $candidates += $defaultMirror
    }

    return @($candidates)
}

function Join-GitHubMirrorUrl {
    param(
        [string]$MirrorBase,
        [string]$GitHubUrl
    )

    $normalizedMirrorBase = ([string]$MirrorBase).Trim()
    $normalizedGitHubUrl = ([string]$GitHubUrl).Trim()
    if ([string]::IsNullOrWhiteSpace($normalizedMirrorBase) -or [string]::IsNullOrWhiteSpace($normalizedGitHubUrl)) {
        return $normalizedGitHubUrl
    }

    if (-not $normalizedMirrorBase.EndsWith('/')) {
        $normalizedMirrorBase += '/'
    }

    $githubPrefix = 'https://github.com/'
    if (
        $normalizedGitHubUrl.StartsWith($githubPrefix, [System.StringComparison]::OrdinalIgnoreCase) -and
        $normalizedMirrorBase.EndsWith($githubPrefix, [System.StringComparison]::OrdinalIgnoreCase)
    ) {
        return ($normalizedMirrorBase + $normalizedGitHubUrl.Substring($githubPrefix.Length))
    }

    if ($normalizedGitHubUrl -match '^https?://') {
        return ($normalizedMirrorBase + $normalizedGitHubUrl)
    }

    return ($normalizedMirrorBase + $normalizedGitHubUrl.TrimStart('/'))
}

function Get-FlashAttentionWheelUrlCandidates {
    param(
        [string]$WheelUrl
    )

    if ([string]::IsNullOrWhiteSpace($WheelUrl)) {
        return @()
    }

    if (-not ($WheelUrl -match '^https?://')) {
        return @($WheelUrl)
    }

    $candidates = @()
    $isGitHubReleaseUrl = $WheelUrl.StartsWith('https://github.com/', [System.StringComparison]::OrdinalIgnoreCase)

    if ($isGitHubReleaseUrl) {
        $mirrorBases = Get-GitHubMirrorCandidates
        if (Test-MikazukiChinaMirrorMode) {
            foreach ($mirrorBase in $mirrorBases) {
                $candidates += (Join-GitHubMirrorUrl -MirrorBase $mirrorBase -GitHubUrl $WheelUrl)
            }
            $candidates += $WheelUrl
        }
        else {
            $candidates += $WheelUrl
            foreach ($mirrorBase in $mirrorBases) {
                $candidates += (Join-GitHubMirrorUrl -MirrorBase $mirrorBase -GitHubUrl $WheelUrl)
            }
        }
    }
    else {
        $candidates += $WheelUrl
    }

    return @($candidates | Select-Object -Unique)
}

function Download-FlashAttentionWheel {
    param(
        [string]$WheelUrl
    )

    if ([string]::IsNullOrWhiteSpace($WheelUrl) -or -not ($WheelUrl -match '^https?://')) {
        throw "Download-FlashAttentionWheel expects an HTTP(S) URL."
    }

    $downloadDir = Join-Path $repoRoot "flashattention-wheels"
    if (-not (Test-Path $downloadDir)) {
        New-Item -ItemType Directory -Path $downloadDir | Out-Null
    }

    $fileName = [System.IO.Path]::GetFileName(([System.Uri]$WheelUrl).AbsolutePath)
    if ([string]::IsNullOrWhiteSpace($fileName)) {
        throw "Could not infer wheel filename from URL: $WheelUrl"
    }

    $fileName = [System.Uri]::UnescapeDataString($fileName)
    $downloadPath = Join-Path $downloadDir $fileName

    foreach ($candidateUrl in (Get-FlashAttentionWheelUrlCandidates -WheelUrl $WheelUrl)) {
        Write-Host -ForegroundColor Yellow "Trying FlashAttention wheel download: $candidateUrl"
        $previousProgressPreference = $global:ProgressPreference
        try {
            $global:ProgressPreference = 'SilentlyContinue'
            Invoke-WebRequest -Uri $candidateUrl -OutFile $downloadPath -TimeoutSec 120 -UseBasicParsing
            if ((Test-Path $downloadPath) -and ((Get-Item -LiteralPath $downloadPath).Length -gt 0)) {
                return $downloadPath
            }
        }
        catch {
            Write-Host -ForegroundColor Yellow ("FlashAttention wheel download attempt failed: {0}" -f $_.Exception.Message)
        }
        finally {
            $global:ProgressPreference = $previousProgressPreference
        }

        Remove-Item -LiteralPath $downloadPath -Force -ErrorAction SilentlyContinue
    }

    throw @"
Failed to download the FlashAttention wheel from all candidate URLs.

You can also download the wheel manually and place it in one of these locations:
- $repoRoot
- $(Join-Path $repoRoot "flashattention-wheels")
- $(Join-Path $repoRoot "flashattention_wheels")
- $(Join-Path $repoRoot "wheels")
"@
}

if (-not (Test-Path $flashAttentionPython)) {
    throw @"
FlashAttention portable Python was not found.

Expected:
- $flashAttentionPython

Recommended fix:
1. Extract a Python 3.11 or 3.12 embeddable package into:
   - $flashAttentionRuntimeDir
2. Run install_flashattention.ps1 again
"@
}

if (-not (Test-PipReady -PythonExe $flashAttentionPython)) {
    Write-Host -ForegroundColor Yellow "$flashAttentionRuntimeDirName is not initialized yet. Running setup_embeddable_python.bat..."
    & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto $flashAttentionRuntimeDirName
    if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $flashAttentionPython)) {
        throw "Failed to initialize $flashAttentionRuntimeDirName."
    }
}

Ensure-EmbeddedRuntimeRepoBootstrap -RuntimeDir $flashAttentionRuntimeDir

Set-Location $repoRoot
$flashAttentionExpectedPackages = Get-FlashAttentionExpectedPackageVersions
$resolvedWheel = Resolve-FlashAttentionWheel -RequestedWheel $FlashAttentionWheel -PythonExe $flashAttentionPython

Invoke-Step "Upgrading pip tooling for FlashAttention environment..." {
    & $flashAttentionPython -m pip install --upgrade --no-warn-script-location pip "setuptools<81" wheel
}

Invoke-Step "Installing PyTorch and torchvision for FlashAttention environment..." {
    $mirrorArgs = @(
        "--upgrade",
        "--force-reinstall",
        "--no-warn-script-location",
        "--prefer-binary",
        "torch==2.10.0+cu128",
        "torchvision==0.25.0+cu128"
    )
    $fallbackArgs = $mirrorArgs + @("--extra-index-url", "https://download.pytorch.org/whl/cu128")
    Invoke-MirrorAwarePipInstall `
        -PythonExe $flashAttentionPython `
        -MirrorArgs $mirrorArgs `
        -FallbackArgs $fallbackArgs `
        -MirrorLabel "China mirror (PyPI + SJTU PyTorch wheel mirror)" `
        -FallbackLabel "official PyTorch CUDA 12.8 channel" | Out-Null
}

Invoke-Step "Installing project dependencies into $flashAttentionRuntimeDirName..." {
    & $flashAttentionPython -m pip install --upgrade --no-warn-script-location --prefer-binary -r requirements.txt
}

Invoke-Step "Re-enabling pkg_resources compatibility for TensorBoard in $flashAttentionRuntimeDirName..." {
    & $flashAttentionPython -m pip install --upgrade --no-warn-script-location --prefer-binary "setuptools<81" 2>&1
}

if (-not (Test-ModulesReady -PythonExe $flashAttentionPython -Modules @("accelerate", "torch", "fastapi", "toml", "transformers", "diffusers", "peft", "torchdiffeq", "timm"))) {
    throw "Project dependencies did not finish installing correctly in $flashAttentionRuntimeDirName. One or more required runtime modules are still missing."
}

Invoke-OptionalStep "Removing any existing flash-attn package..." {
    & $flashAttentionPython -m pip uninstall -y flash-attn flash_attn
} "Existing flash-attn cleanup reported a warning. Continuing with fresh install."

if ($resolvedWheel -match '^https?://') {
    Write-Host -ForegroundColor Yellow "Using FlashAttention wheel URL: $resolvedWheel"
    $resolvedWheel = Download-FlashAttentionWheel -WheelUrl $resolvedWheel
}

Write-Host -ForegroundColor Yellow "Using FlashAttention wheel: $resolvedWheel"
try {
    Invoke-Step "Installing FlashAttention wheel from local file..." {
        & $flashAttentionPython -m pip install --upgrade --no-warn-script-location --no-deps $resolvedWheel
    }
}
catch {
    $shouldRetryWithDownload = Test-IsManagedFlashAttentionWheelPath -WheelPath $resolvedWheel -PythonExe $flashAttentionPython
    if (-not $shouldRetryWithDownload) {
        throw
    }

    $fallbackWheelUrl = Get-DefaultFlashAttentionWheelUrl -PythonExe $flashAttentionPython
    Write-Host -ForegroundColor Yellow "Local FlashAttention wheel install failed. The bundled wheel may be corrupted or incomplete."
    Write-Host -ForegroundColor Yellow "Retrying with a fresh download from: $fallbackWheelUrl"
    Remove-Item -LiteralPath $resolvedWheel -Force -ErrorAction SilentlyContinue
    $resolvedWheel = Download-FlashAttentionWheel -WheelUrl $fallbackWheelUrl
    Write-Host -ForegroundColor Yellow "Using refreshed FlashAttention wheel: $resolvedWheel"
    Invoke-Step "Installing FlashAttention wheel from refreshed local file..." {
        & $flashAttentionPython -m pip install --upgrade --no-warn-script-location --no-deps $resolvedWheel
    }
}

if (-not (Test-ModulesReady -PythonExe $flashAttentionPython -Modules $mainRequiredModules)) {
    throw "FlashAttention dependencies did not finish installing correctly in $flashAttentionRuntimeDirName."
}

Invoke-Step "Verifying FlashAttention import/runtime bindings..." {
    & $flashAttentionPython -c "import flash_attn, torch; from flash_attn.flash_attn_interface import flash_attn_func; print('flash_attn:', getattr(flash_attn, '__version__', 'unknown')); print('torch:', torch.__version__)"
}

Invoke-Step "Verifying FlashAttention environment..." {
    Assert-FlashAttentionRuntimeReady -PythonExe $flashAttentionPython -Expected $flashAttentionExpectedPackages
}

Set-Content -Path $flashAttentionMarker -Value "" -Encoding ASCII
Write-Host -ForegroundColor Green "FlashAttention experimental environment is ready"
