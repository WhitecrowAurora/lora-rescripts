$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$coreScript = Join-Path $repoRoot "run_gui.ps1"
$mirrorHelper = Join-Path $repoRoot "tools\runtime\mirror_env.ps1"

if (-not (Test-Path $coreScript)) {
    throw "run_gui.ps1 was not found next to run_gui_cn.ps1."
}

. $mirrorHelper
$Env:MIKAZUKI_CN_MIRROR = "1"

& $coreScript @args
exit $LASTEXITCODE
