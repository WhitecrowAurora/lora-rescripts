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

$portableRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "portable"
$portableRuntimeDir = $portableRuntimeInfo.DirectoryPath
$portablePython = Join-Path $portableRuntimeDir "python.exe"
$portableMarker = Join-Path $portableRuntimeDir ".deps_installed"

$venvRuntimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName "venv"
$venvRuntimeDir = $venvRuntimeInfo.DirectoryPath
$venvPython = Join-Path $venvRuntimeDir "Scripts\python.exe"
$venvMarker = Join-Path $venvRuntimeDir ".deps_installed"
$allowExternalPython = $Env:MIKAZUKI_ALLOW_SYSTEM_PYTHON -eq "1"
$mainRequiredModules = @("accelerate", "torch", "fastapi", "toml", "transformers", "diffusers", "peft", "torchdiffeq", "timm", "lion_pytorch", "dadaptation", "schedulefree", "prodigyopt", "prodigyplus", "pytorch_optimizer")

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

function Test-ModulesReady {
    param (
        [string]$PythonExe,
        [string[]]$Modules
    )

    if (-not $Modules -or $Modules.Count -eq 0) {
        return $true
    }

    & $PythonExe -c "import importlib, sys; failed=[]; 
for name in sys.argv[1:]:
    try:
        importlib.import_module(name)
    except Exception:
        failed.append(name)
raise SystemExit(1 if failed else 0)" @Modules 1>$null 2>$null
    return $LASTEXITCODE -eq 0
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
    $markerPath = $portableMarker
}
elseif (Test-Path $venvPython) {
    Write-Host -ForegroundColor Green "Using existing project virtual environment..."
    if (-not (Test-PipReady -PythonExe $venvPython)) {
        throw "Project virtual environment is incomplete: pip is not available. Repair or recreate .\venv first."
    }
    $pythonExe = $venvPython
    $markerPath = $venvMarker
}
elseif ($allowExternalPython) {
    Write-Host -ForegroundColor Yellow "No project-local Python found. MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 is set, creating a project-local venv from system Python..."
    $venvParentDir = Split-Path -Parent $venvRuntimeDir
    if (-not (Test-Path $venvParentDir)) {
        New-Item -ItemType Directory -Path $venvParentDir -Force | Out-Null
    }
    python -m venv $venvRuntimeDir
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create venv."
    }
    $pythonExe = $venvPython
    $markerPath = $venvMarker
}
else {
    throw @"
No project-local Python environment was found.

This installer is locked to project-local Python by default to avoid leaking packages into the host machine.

Expected one of:
- $portablePython
- $venvPython

Recommended fix:
1. Bundle a ready-to-run portable Python in .\env\python or the legacy .\python
2. Or set MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 once to bootstrap a project-local .\env\venv or legacy .\venv for development
"@
}

Set-Location $repoRoot

Invoke-Step "Upgrading pip tooling..." {
    & $pythonExe -m pip install --upgrade --no-warn-script-location pip "setuptools<81" wheel
}

Invoke-Step "Installing PyTorch and torchvision (CUDA 12.8 channel)..." {
    $mirrorArgs = @(
        "--upgrade",
        "--no-warn-script-location",
        "--prefer-binary",
        "torch==2.10.0+cu128",
        "torchvision==0.25.0+cu128"
    )
    $fallbackArgs = $mirrorArgs + @("--extra-index-url", "https://download.pytorch.org/whl/cu128")
    Invoke-MirrorAwarePipInstall `
        -PythonExe $pythonExe `
        -MirrorArgs $mirrorArgs `
        -FallbackArgs $fallbackArgs `
        -MirrorLabel "China mirror (PyPI + SJTU PyTorch wheel mirror)" `
        -FallbackLabel "official PyTorch CUDA 12.8 channel" | Out-Null
}

Invoke-OptionalStep "Installing xformers (optional)..." {
    $mirrorArgs = @(
        "--upgrade",
        "--no-warn-script-location",
        "--only-binary",
        "xformers",
        "xformers>=0.0.34"
    )
    $fallbackArgs = $mirrorArgs + @("--index-url", "https://download.pytorch.org/whl/cu128")
    Invoke-MirrorAwarePipInstall `
        -PythonExe $pythonExe `
        -MirrorArgs $mirrorArgs `
        -FallbackArgs $fallbackArgs `
        -MirrorLabel "China mirror (PyPI + SJTU PyTorch wheel mirror)" `
        -FallbackLabel "official PyTorch CUDA 12.8 xformers channel" | Out-Null
} "Optional xformers installation failed. The GUI will still work and training can fall back to SDPA."

Invoke-Step "Installing project dependencies..." {
    & $pythonExe -m pip install --upgrade --no-warn-script-location --prefer-binary -r requirements.txt
}

if (-not (Test-ModulesReady -PythonExe $pythonExe -Modules $mainRequiredModules)) {
    throw "Project dependencies did not finish installing correctly. One or more required runtime modules are still missing."
}

if ($markerPath) {
    Set-Content -Path $markerPath -Value "" -Encoding ASCII
}

Write-Host -ForegroundColor Green "Install completed"
