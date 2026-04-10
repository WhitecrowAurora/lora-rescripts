$script:ExperimentalRuntimeModuleFiles = @{
    common = 'experimental_runtime.common.ps1'
    amd = 'experimental_runtime.amd.ps1'
    intel = 'experimental_runtime.intel.ps1'
}

function Assert-PowerShellModuleSyntax {
    param(
        [string]$Path,
        [string]$Label = 'PowerShell module'
    )

    $tokens = $null
    $parseErrors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($Path, [ref]$tokens, [ref]$parseErrors)

    if ($parseErrors -and $parseErrors.Count -gt 0) {
        $firstError = $parseErrors[0]
        $line = if ($firstError.Extent) { $firstError.Extent.StartLineNumber } else { '?' }
        $column = if ($firstError.Extent) { $firstError.Extent.StartColumnNumber } else { '?' }
        throw "$Label failed syntax validation at ${Path}:${line}:${column} - $($firstError.Message)"
    }
}

function Get-ExperimentalRuntimeModulePath {
    param(
        [ValidateSet('common', 'amd', 'intel')]
        [string]$Name
    )

    $moduleFile = $script:ExperimentalRuntimeModuleFiles[$Name]
    if ([string]::IsNullOrWhiteSpace($moduleFile)) {
        throw "Unknown runtime helper module name: $Name"
    }

    return Join-Path $PSScriptRoot $moduleFile
}

$commonModulePath = Get-ExperimentalRuntimeModulePath -Name 'common'
if (-not (Test-Path $commonModulePath)) {
    throw "Runtime helper module not found: $commonModulePath"
}

Assert-PowerShellModuleSyntax -Path $commonModulePath -Label 'Runtime helper module'
. $commonModulePath
