param(
    [Parameter(Mandatory = $true)]
    [string]$PreferredRuntime,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ForwardArgs
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$coreScript = Join-Path $repoRoot "run_gui_core.ps1"

if (-not (Test-Path $coreScript)) {
    throw "run_gui_core.ps1 was not found next to run_gui_runtime.ps1."
}

$runtimeEnvVars = @(
    "MIKAZUKI_PREFERRED_RUNTIME",
    "MIKAZUKI_FLASHATTENTION_STARTUP",
    "MIKAZUKI_BLACKWELL_STARTUP",
    "MIKAZUKI_SAGEATTENTION_STARTUP",
    "MIKAZUKI_SAGEBWD_STARTUP",
    "MIKAZUKI_INTEL_XPU_STARTUP",
    "MIKAZUKI_INTEL_XPU_SAGE_STARTUP",
    "MIKAZUKI_ROCM_AMD_STARTUP",
    "MIKAZUKI_STARTUP_ATTENTION_POLICY",
    "MIKAZUKI_ROCM_SDPA_SLICE_TRIGGER_GB",
    "MIKAZUKI_ROCM_SDPA_SLICE_GB",
    "MIKAZUKI_ALLOW_INTEL_XPU_SAGEATTN",
    "IPEX_SDPA_SLICE_TRIGGER_RATE",
    "IPEX_ATTENTION_SLICE_RATE",
    "MIKAZUKI_LAUNCH_LOG"
)

$previousValues = @{}
foreach ($envName in $runtimeEnvVars) {
    $previousValues[$envName] = [Environment]::GetEnvironmentVariable($envName, "Process")
    Remove-Item -Path ("Env:" + $envName) -ErrorAction SilentlyContinue
}

$Env:MIKAZUKI_PREFERRED_RUNTIME = $PreferredRuntime

$exitCode = 0
try {
    & $coreScript @ForwardArgs
    $exitCode = $LASTEXITCODE
}
finally {
    foreach ($envName in $runtimeEnvVars) {
        $previousValue = $previousValues[$envName]
        if ($null -eq $previousValue) {
            Remove-Item -Path ("Env:" + $envName) -ErrorAction SilentlyContinue
        }
        else {
            [Environment]::SetEnvironmentVariable($envName, $previousValue, "Process")
        }
    }
}

exit $exitCode
