$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$installScript = Join-Path $repoRoot "install.ps1"
$mirrorHelper = Join-Path $repoRoot "tools\runtime\mirror_env.ps1"

if (-not (Test-Path $installScript)) {
    throw "install.ps1 not found."
}

$Env:PIP_NO_CACHE_DIR = "1"
$Env:PYTHONUTF8 = "1"

. $mirrorHelper
Initialize-MikazukiChinaMirrorMode -RepoRoot $repoRoot -PromptOnFirstUse | Out-Null

Write-Host -ForegroundColor Green "Delegating to install.ps1 so torch / torchvision / xformers and base dependencies follow the same maintained logic."

& $installScript
exit $LASTEXITCODE
