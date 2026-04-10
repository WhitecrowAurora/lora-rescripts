$moduleFiles = @(
    'runtime_bootstrap.validation.ps1',
    'runtime_bootstrap.actions.ps1'
)

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

foreach ($moduleFile in $moduleFiles) {
    $modulePath = Join-Path $PSScriptRoot $moduleFile
    if (-not (Test-Path $modulePath)) {
        throw "Runtime bootstrap helper module not found: $modulePath"
    }

    Assert-PowerShellModuleSyntax -Path $modulePath -Label 'Runtime bootstrap helper module'
    . $modulePath
}
