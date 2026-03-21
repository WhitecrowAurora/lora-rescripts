$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$installScript = Join-Path $repoRoot "install.ps1"

if (-not (Test-Path $installScript)) {
    throw "install.ps1 not found."
}

$Env:PIP_INDEX_URL = "https://pypi.tuna.tsinghua.edu.cn/simple"
$Env:PIP_NO_CACHE_DIR = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"
$Env:PYTHONUTF8 = "1"

Write-Host -ForegroundColor Green "Using China mainland PyPI mirror..."
Write-Host -ForegroundColor Green "Delegating to install.ps1 so torch / torchvision / xformers and base dependencies follow the same maintained logic."

& $installScript
exit $LASTEXITCODE
