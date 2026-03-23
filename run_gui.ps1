$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$blackwellPython = Join-Path $repoRoot "python_blackwell\python.exe"
$blackwellDepsMarker = Join-Path $repoRoot "python_blackwell\.deps_installed"
$portablePython = Join-Path $repoRoot "python\python.exe"
$venvPython = Join-Path $repoRoot "venv\Scripts\python.exe"
$portableDepsMarker = Join-Path $repoRoot "python\.deps_installed"
$venvDepsMarker = Join-Path $repoRoot "venv\.deps_installed"
$portableTagEditorPython = Join-Path $repoRoot "python_tageditor\python.exe"
$venvTagEditorPython = Join-Path $repoRoot "venv-tageditor\Scripts\python.exe"
$allowExternalPython = $Env:MIKAZUKI_ALLOW_SYSTEM_PYTHON -eq "1"
$preferBlackwellRuntime = $Env:MIKAZUKI_PREFERRED_RUNTIME -eq "blackwell"
$mainRuntimeModules = @("accelerate", "torch", "fastapi", "toml", "transformers", "diffusers", "lion_pytorch", "dadaptation", "schedulefree", "prodigyopt", "prodigyplus", "pytorch_optimizer")

function Test-PipReady {
    param (
        [string]$PythonExe
    )

    & $PythonExe -m pip --version 1>$null 2>$null
    return $LASTEXITCODE -eq 0
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

    & $PythonExe -c $script @pairs 1>$null 2>$null
    return $LASTEXITCODE -eq 0
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

function Get-MainPythonSelection {
    if ($preferBlackwellRuntime -and (Test-Path $blackwellPython)) {
        Write-Host -ForegroundColor Green "Using Blackwell experimental Python..."
        if (-not (Test-PipReady -PythonExe $blackwellPython)) {
            Write-Host -ForegroundColor Yellow "python_blackwell is not initialized yet. Running setup_embeddable_python.bat..."
            & (Join-Path $repoRoot "setup_embeddable_python.bat") --auto python_blackwell
            if ($LASTEXITCODE -ne 0 -or -not (Test-PipReady -PythonExe $blackwellPython)) {
                throw "Blackwell experimental Python is incomplete: pip is not available."
            }
        }
        return @{
            PythonExe = $blackwellPython
            DepsMarker = $blackwellDepsMarker
            Runtime = "blackwell"
        }
    }

    if (Test-Path $portablePython) {
        Write-Host -ForegroundColor Green "Using portable Python..."
        if (-not (Test-PipReady -PythonExe $portablePython)) {
            throw "Portable Python is incomplete: pip is not available. Repair or replace the bundled python folder first."
        }
        return @{
            PythonExe = $portablePython
            DepsMarker = $portableDepsMarker
            Runtime = "portable"
        }
    }

    if (Test-Path $venvPython) {
        Write-Host -ForegroundColor Green "Using project virtual environment..."
        if (-not (Test-PipReady -PythonExe $venvPython)) {
            throw "Project virtual environment is incomplete: pip is not available. Repair or recreate .\venv first."
        }
        return @{
            PythonExe = $venvPython
            DepsMarker = $venvDepsMarker
            Runtime = "venv"
        }
    }

    if ($allowExternalPython) {
        Write-Host -ForegroundColor Yellow "No project-local Python found. MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 is set, bootstrapping a project-local venv via install.ps1..."
        & (Join-Path $repoRoot "install.ps1")
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to bootstrap a project-local Python environment."
        }

        if (Test-Path $portablePython) {
            return @{
                PythonExe = $portablePython
                DepsMarker = $portableDepsMarker
                Runtime = "portable"
            }
        }

        if (Test-Path $venvPython) {
            return @{
                PythonExe = $venvPython
                DepsMarker = $venvDepsMarker
                Runtime = "venv"
            }
        }

        throw "install.ps1 finished, but no project-local Python environment was created."
    }

    throw @"
No project-local Python environment was found.

This build is locked to project-local Python by default to avoid leaking installs into the host machine.

Expected one of:
- $portablePython
- $venvPython

Recommended fix:
1. Bundle a ready-to-run portable Python in .\python
2. Or create a project-local venv in .\venv for development

Developer override:
- Set MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 and rerun to bootstrap a project-local venv intentionally.
"@
}

$mainPython = Get-MainPythonSelection
$pythonExe = $mainPython.PythonExe
$depsMarker = $mainPython.DepsMarker
$runtimeName = $mainPython.Runtime
$mainModulesReady = Test-ModulesReady -PythonExe $pythonExe -Modules $mainRuntimeModules
if (-not (Test-Path $depsMarker) -or -not $mainModulesReady) {
    if ($runtimeName -eq "blackwell") {
        Write-Host -ForegroundColor Yellow "Blackwell experimental dependencies are not installed yet. Running install_blackwell.ps1..."
        & (Join-Path $repoRoot "install_blackwell.ps1") -TorchChannel "czmahi-20250502"
    }
    else {
        Write-Host -ForegroundColor Yellow "Dependencies are not installed yet. Running install.ps1..."
        & (Join-Path $repoRoot "install.ps1")
    }
    $mainPython = Get-MainPythonSelection
    $pythonExe = $mainPython.PythonExe
    $depsMarker = $mainPython.DepsMarker
    $runtimeName = $mainPython.Runtime
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $depsMarker) -or -not (Test-ModulesReady -PythonExe $pythonExe -Modules $mainRuntimeModules)) {
        throw "Dependency installation failed."
    }
}

if ($Env:MIKAZUKI_BLACKWELL_STARTUP -eq "1") {
    $blackwellPatchScript = Join-Path $repoRoot "mikazuki\scripts\patch_xformers_blackwell.py"
    if (Test-Path $blackwellPatchScript) {
        Write-Host -ForegroundColor Yellow "Blackwell startup mode enabled. Checking xformers FA3 compatibility..."
        & $pythonExe $blackwellPatchScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host -ForegroundColor Yellow "Blackwell xformers patch step reported a warning. Continuing startup..."
        }
    }
}

if (-not ($args -contains "--disable-tageditor")) {
    $tagEditorPython = $null
    $tagEditorMarker = $null

    if (Test-Path $portableTagEditorPython) {
        $tagEditorPython = $portableTagEditorPython
        $tagEditorMarker = Join-Path $repoRoot "python_tageditor\.tageditor_installed"
    }
    elseif (Test-Path $venvTagEditorPython) {
        $tagEditorPython = $venvTagEditorPython
        $tagEditorMarker = Join-Path $repoRoot "venv-tageditor\.tageditor_installed"
    }
    else {
        $fallbackMainPython = $null
        if ($runtimeName -eq "blackwell") {
            if (Test-Path $portablePython) {
                $fallbackMainPython = $portablePython
                $tagEditorMarker = Join-Path $repoRoot "python\.tageditor_installed"
            }
            elseif (Test-Path $venvPython) {
                $fallbackMainPython = $venvPython
                $tagEditorMarker = Join-Path $repoRoot "venv\.tageditor_installed"
            }
        }
        else {
            $fallbackMainPython = $pythonExe
            if (Test-Path $portablePython) {
                $tagEditorMarker = Join-Path $repoRoot "python\.tageditor_installed"
            }
            elseif (Test-Path $venvPython) {
                $tagEditorMarker = Join-Path $repoRoot "venv\.tageditor_installed"
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
                throw "Tag editor Python is incomplete: pip is not available."
            }

            Write-Host -ForegroundColor Yellow "Tag editor dependencies are missing or incompatible. Running install_tageditor.ps1..."
            & (Join-Path $repoRoot "install_tageditor.ps1")
            $tagEditorModulesReady = Test-ModulesReady -PythonExe $tagEditorPython -Modules @("gradio", "transformers", "timm", "print_color")
            $tagEditorVersionsReady = Test-PackageConstraints -PythonExe $tagEditorPython -Constraints $tagEditorPackageConstraints
            $tagEditorMarkerReady = (-not $tagEditorMarker) -or (Test-Path $tagEditorMarker)
            if ($LASTEXITCODE -ne 0 -or -not $tagEditorMarkerReady -or -not $tagEditorModulesReady -or -not $tagEditorVersionsReady) {
                throw "Tag editor dependency installation failed."
            }
        }
    }
}

Set-Location $repoRoot
& $pythonExe "gui.py" @args
