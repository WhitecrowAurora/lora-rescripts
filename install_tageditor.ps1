$ErrorActionPreference = "Stop"

$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$tagEditorPortablePython = Join-Path $repoRoot "python_tageditor\python.exe"
$tagEditorVenvPython = Join-Path $repoRoot "venv-tageditor\Scripts\python.exe"
$portablePython = Join-Path $repoRoot "python\python.exe"
$venvPython = Join-Path $repoRoot "venv\Scripts\python.exe"
$tagEditorRequirements = Join-Path $repoRoot "mikazuki\dataset-tag-editor\requirements.txt"
$portableMarker = Join-Path $repoRoot "python_tageditor\.tageditor_installed"
$venvMarker = Join-Path $repoRoot "venv-tageditor\.tageditor_installed"

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

if (Test-Path $tagEditorPortablePython) {
    Write-Host -ForegroundColor Green "Using dedicated tag editor portable Python..."
    $pythonExe = $tagEditorPortablePython
    $markerPath = $portableMarker
}
elseif (Test-Path $tagEditorVenvPython) {
    Write-Host -ForegroundColor Green "Using dedicated tag editor virtual environment..."
    $pythonExe = $tagEditorVenvPython
    $markerPath = $venvMarker
}
elseif (Test-Path $portablePython) {
    Write-Host -ForegroundColor Green "Using main portable Python..."
    $pythonExe = $portablePython
    $markerPath = Join-Path $repoRoot "python\.tageditor_installed"
}
elseif (Test-Path $venvPython) {
    Write-Host -ForegroundColor Green "Using main virtual environment..."
    $pythonExe = $venvPython
    $markerPath = Join-Path $repoRoot "venv\.tageditor_installed"
}
else {
    throw "No project Python found. Please set up the main environment first."
}

if (-not (Test-Path $tagEditorRequirements)) {
    throw "Tag editor requirements file not found: $tagEditorRequirements"
}

Set-Location $repoRoot

$pythonVersion = & $pythonExe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
if ($LASTEXITCODE -ne 0) {
    throw "Failed to detect Python version for tag editor."
}

if ($pythonVersion -eq "3.13" -and -not (Test-Path $tagEditorPortablePython) -and -not (Test-Path $tagEditorVenvPython)) {
    throw @"
Tag editor installation is blocked on Python 3.13 in the main environment.

Reason:
- dataset-tag-editor currently depends on gradio 4.28.3
- that dependency chain falls back to NumPy 1.26.4
- NumPy 1.26.4 does not provide a ready Windows cp313 wheel here, so pip tries to build from source and fails

Recommended fix:
1. Prepare a separate Python 3.12 environment for the tag editor.
2. Put it in $repoRoot\python_tageditor
3. Run install_tageditor.ps1 again

This keeps the main trainer on Python 3.13, while restoring tag editor as a bundled core feature.
"@
}

$tagEditorPackageConstraints = @{
    "gradio" = "==4.28.3"
    "gradio-client" = "==0.16.0"
    "fastapi" = "<0.113"
    "starlette" = "<0.39"
    "pydantic" = "<2.11"
    "huggingface-hub" = "<1"
}

Invoke-Step "Upgrading pip tooling for tag editor..." {
    & $pythonExe -m pip install --upgrade pip "setuptools<81" wheel
}

Invoke-Step "Installing tag editor dependencies..." {
    & $pythonExe -m pip install --upgrade --upgrade-strategy eager --prefer-binary -r $tagEditorRequirements
}

if (-not (Test-PackageConstraints -PythonExe $pythonExe -Constraints $tagEditorPackageConstraints)) {
    throw @"
Tag editor dependency installation completed, but the resolved package versions are still incompatible.

Expected constraints:
- gradio == 4.28.3
- gradio-client == 0.16.0
- fastapi < 0.113
- starlette < 0.39
- pydantic < 2.11
- huggingface-hub < 1

Please rerun install_tageditor.ps1 after cleaning the tag editor environment, or replace python_tageditor with a fresh prepared runtime.
"@
}

Set-Content -Path $markerPath -Value "" -Encoding ASCII
Write-Host -ForegroundColor Green "Tag editor dependencies installed"
