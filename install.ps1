$ErrorActionPreference = "Stop"

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$portablePython = Join-Path $repoRoot "python\python.exe"
$venvPython = Join-Path $repoRoot "venv\Scripts\python.exe"
$depsMarker = Join-Path $repoRoot "python\.deps_installed"

function Test-PipReady {
    param (
        [string]$PythonExe
    )

    $process = New-Object System.Diagnostics.Process
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $PythonExe
    $startInfo.Arguments = "-m pip --version"
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process.StartInfo = $startInfo

    try {
        $null = $process.Start()
        $process.WaitForExit()
        return $process.ExitCode -eq 0
    }
    finally {
        $process.Dispose()
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

if (Test-Path $portablePython) {
    Write-Host -ForegroundColor Green "Using portable Python..."
    if (-not (Test-PipReady -PythonExe $portablePython)) {
        throw @"
Portable Python is incomplete: pip is not available.

This project now assumes the bundled python folder is already a ready-to-run environment for packaging and distribution.
Normal installation will not auto-bootstrap embeddable Python anymore.

Recommended fix:
1. Replace the bundled python folder with a prepared portable Python environment.
2. If you are repairing a raw embeddable Python manually, run setup_embeddable_python.bat yourself.
"@
    }
    $pythonExe = $portablePython
}
elseif (Test-Path $venvPython) {
    Write-Host -ForegroundColor Green "Using existing virtual environment..."
    $pythonExe = $venvPython
}
else {
    Write-Host -ForegroundColor Green "Creating venv for system Python..."
    python -m venv (Join-Path $repoRoot "venv")
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create venv."
    }
    $pythonExe = $venvPython
}

Set-Location $repoRoot

Invoke-Step "Upgrading pip tooling..." {
    & $pythonExe -m pip install --upgrade pip "setuptools<81" wheel
}

Invoke-Step "Installing PyTorch and torchvision (CUDA 12.8 channel)..." {
    & $pythonExe -m pip install --upgrade torch torchvision --index-url https://download.pytorch.org/whl/cu128
}

Invoke-OptionalStep "Installing xformers (optional)..." {
    & $pythonExe -m pip install --upgrade --prefer-binary xformers
} "Optional xformers installation failed. The GUI will still work and training can fall back to SDPA."

Invoke-Step "Installing project dependencies..." {
    & $pythonExe -m pip install --upgrade --prefer-binary -r requirements.txt
}

if (Test-Path $portablePython) {
    Set-Content -Path $depsMarker -Value "" -Encoding ASCII
}

Write-Host -ForegroundColor Green "Install completed"
