param(
    [string]$SageAttentionPackage = "",
    [string]$TritonPackage = "triton-windows==3.5.1.post24"
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$baseInstaller = Join-Path $scriptRoot "install_sageattention.ps1"

if (-not (Test-Path $baseInstaller)) {
    throw "Base SageAttention installer was not found: $baseInstaller"
}

& $baseInstaller -Profile "triton-v2" -RuntimeTarget "sageattention2" -SageAttentionPackage $SageAttentionPackage -TritonPackage $TritonPackage
exit $LASTEXITCODE
