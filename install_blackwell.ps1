param(
    [ValidateSet("stable", "nightly")]
    [string]$TorchChannel = "stable",
    [string]$XformersWheel = "",
    [switch]$SkipXformers,
    [switch]$AllowOfficialXformersFallback
)

$ErrorActionPreference = "Stop"

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$blackwellPython = Join-Path $repoRoot "python_blackwell\python.exe"
$blackwellMarker = Join-Path $repoRoot "python_blackwell\.deps_installed"

function Test-PipReady {
    param (
        [string]$PythonExe
    )

    & $PythonExe -m pip --version 1>$null 2>$null
    return $LASTEXITCODE -eq 0
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

function Resolve-XformersWheel {
    param (
        [string]$RequestedWheel
    )

    if ($RequestedWheel -and (Test-Path $RequestedWheel)) {
        return (Resolve-Path $RequestedWheel).Path
    }

    if ($RequestedWheel -and ($RequestedWheel -match '^https?://')) {
        $downloadDir = Join-Path $repoRoot "blackwell-wheels"
        if (-not (Test-Path $downloadDir)) {
            New-Item -ItemType Directory -Path $downloadDir | Out-Null
        }

        $fileName = [System.IO.Path]::GetFileName(([System.Uri]$RequestedWheel).AbsolutePath)
        if ([string]::IsNullOrWhiteSpace($fileName)) {
            throw "Could not infer wheel filename from URL: $RequestedWheel"
        }

        $fileName = [System.Uri]::UnescapeDataString($fileName)
        $downloadPath = Join-Path $downloadDir $fileName
        Write-Host -ForegroundColor Yellow "Downloading Blackwell xformers wheel..."
        Invoke-WebRequest -Uri $RequestedWheel -OutFile $downloadPath
        return $downloadPath
    }

    $searchRoots = @(
        $repoRoot,
        (Join-Path $repoRoot "blackwell-wheels"),
        (Join-Path $repoRoot "wheels")
    )

    foreach ($root in $searchRoots) {
        if (-not (Test-Path $root)) {
            continue
        }

        $wheel = Get-ChildItem -Path $root -Filter "xformers-*.whl" -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "cp312" } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

        if ($wheel) {
            return $wheel.FullName
        }
    }

    return $null
}

if (-not (Test-Path $blackwellPython)) {
    throw @"
Blackwell portable Python was not found.

Expected:
- $blackwellPython

Recommended fix:
1. Extract a Python 3.12 embeddable package into .\python_blackwell
2. Run install_blackwell.ps1 again
"@
}

if (-not (Test-PipReady -PythonExe $blackwellPython)) {
    Write-Host -ForegroundColor Yellow "python_blackwell is not initialized yet. Running setup_embeddable_python.bat..."
    & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto python_blackwell
    if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $blackwellPython)) {
        throw "Failed to initialize python_blackwell."
    }
}

Set-Location $repoRoot

$torchInstallArgs = @()
if ($TorchChannel -eq "nightly") {
    $torchInstallArgs = @(
        "-m", "pip", "install", "--upgrade", "--no-warn-script-location", "--pre",
        "torch", "torchvision",
        "--index-url", "https://download.pytorch.org/whl/nightly/cu128"
    )
}
else {
    $torchInstallArgs = @(
        "-m", "pip", "install", "--upgrade", "--no-warn-script-location", "--prefer-binary",
        "torch==2.10.0+cu128", "torchvision==0.25.0+cu128",
        "--extra-index-url", "https://download.pytorch.org/whl/cu128"
    )
}

Invoke-Step "Upgrading pip tooling for Blackwell environment..." {
    & $blackwellPython -m pip install --upgrade --no-warn-script-location pip "setuptools<81" wheel
}

Invoke-Step "Installing PyTorch and torchvision for Blackwell environment ($TorchChannel)..." {
    & $blackwellPython @torchInstallArgs
}

Invoke-Step "Installing project dependencies into python_blackwell..." {
    & $blackwellPython -m pip install --upgrade --no-warn-script-location --prefer-binary -r requirements.txt
}

if (-not $SkipXformers) {
    $resolvedWheel = Resolve-XformersWheel -RequestedWheel $XformersWheel
    if ($resolvedWheel) {
        Invoke-Step "Installing Blackwell xformers wheel from local file..." {
            & $blackwellPython -m pip install --upgrade --no-warn-script-location --no-deps $resolvedWheel
        }
    }
    elseif ($AllowOfficialXformersFallback) {
        Invoke-OptionalStep "Installing official xformers wheel as fallback..." {
            & $blackwellPython -m pip install --upgrade --no-warn-script-location --only-binary xformers --index-url https://download.pytorch.org/whl/cu128 "xformers>=0.0.34"
        } "Official xformers installation failed. Blackwell users can still use SDPA or install a community cp312 wheel later."
    }
    else {
        Write-Host -ForegroundColor Yellow "No Blackwell-specific xformers wheel was provided."
        Write-Host -ForegroundColor Yellow "Skipping xformers installation to avoid silently falling back to the official wheel."
        Write-Host -ForegroundColor Yellow "You can still use SDPA, or rerun install_blackwell.ps1 with -XformersWheel <path-or-url>."
    }
}

Invoke-Step "Verifying Blackwell environment..." {
    & $blackwellPython -c "import torch; print('Torch:', torch.__version__); print('CUDA available:', torch.cuda.is_available()); print('CUDA runtime:', torch.version.cuda)"
}

Set-Content -Path $blackwellMarker -Value "" -Encoding ASCII
Write-Host -ForegroundColor Green "Blackwell experimental environment is ready"
