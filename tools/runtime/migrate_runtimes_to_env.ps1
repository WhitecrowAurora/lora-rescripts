param(
    [switch]$Apply,
    [switch]$IncludeVenvs,
    [switch]$RemoveCompatibilityLinks,
    [string[]]$RuntimeNames
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
. (Join-Path $PSScriptRoot "runtime_paths.ps1")

$runtimeSpecs = @(
    [pscustomobject]@{ Name = "portable"; Primary = "python"; Aliases = @("python"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "tageditor"; Primary = "python_tageditor"; Aliases = @("python_tageditor"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "blackwell"; Primary = "python_blackwell"; Aliases = @("python_blackwell"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "flashattention"; Primary = "python-flashattention"; Aliases = @("python-flashattention", "python_flashattention"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "intel-xpu"; Primary = "python_xpu_intel"; Aliases = @("python_xpu_intel"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "intel-xpu-sage"; Primary = "python_xpu_intel_sage"; Aliases = @("python_xpu_intel_sage"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "rocm-amd"; Primary = "python_rocm_amd"; Aliases = @("python_rocm_amd"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "sagebwd-nvidia"; Primary = "python_sagebwd_nvidia"; Aliases = @("python_sagebwd_nvidia", "python-sagebwd-nvidia"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "sageattention"; Primary = "python-sageattention"; Aliases = @("python-sageattention", "python_sageattention"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "sageattention2"; Primary = "python-sageattention2"; Aliases = @("python-sageattention2", "python_sageattention2"); IncludeByDefault = $true },
    [pscustomobject]@{ Name = "venv"; Primary = "venv"; Aliases = @("venv"); IncludeByDefault = $false },
    [pscustomobject]@{ Name = "venv-tageditor"; Primary = "venv-tageditor"; Aliases = @("venv-tageditor"); IncludeByDefault = $false }
)

function Write-PlanLine {
    param(
        [string]$Message,
        [string]$Color = "Gray"
    )

    Write-Host -ForegroundColor $Color $Message
}

function Ensure-Directory {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-CanonicalPathOrNull {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        return $null
    }

    try {
        return [System.IO.Path]::GetFullPath((Get-Item -LiteralPath $Path -Force).FullName)
    }
    catch {
        return $null
    }
}

function Get-DirectorySizeBytes {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        return [int64]0
    }

    $size = (Get-ChildItem -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($null -eq $size) {
        return [int64]0
    }
    return [int64]$size
}

function Get-RootRuntimeEntries {
    param(
        [object]$Spec
    )

    $entries = New-Object System.Collections.Generic.List[object]
    foreach ($alias in $Spec.Aliases) {
        $path = Join-Path $repoRoot $alias
        if (-not (Test-Path $path)) {
            continue
        }

        $item = Get-Item -LiteralPath $path -Force
        $entries.Add([pscustomobject]@{
                Alias = $alias
                Path = $item.FullName
                IsReparsePoint = [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
                SizeBytes = Get-DirectorySizeBytes -Path $item.FullName
                HasDepsMarker = Test-Path (Join-Path $item.FullName ".deps_installed")
                HasTagEditorMarker = Test-Path (Join-Path $item.FullName ".tageditor_installed")
            }) | Out-Null
    }

    return [object[]]$entries.ToArray()
}

function Select-PrimaryRootEntry {
    param(
        [object[]]$Entries,
        [object]$Spec
    )

    if (-not $Entries -or $Entries.Count -eq 0) {
        return $null
    }

    return $Entries |
        Sort-Object `
            @{ Expression = { if ($_.HasDepsMarker) { 0 } elseif ($_.HasTagEditorMarker) { 1 } else { 2 } } }, `
            @{ Expression = { if ($_.Alias -eq $Spec.Primary) { 0 } else { 1 } } }, `
            @{ Expression = { -1 * $_.SizeBytes } } |
        Select-Object -First 1
}

function Get-BackupRoot {
    param(
        [string]$SessionId
    )

    return Join-Path $repoRoot ("env\_legacy_runtime_backups\" + $SessionId)
}

function Get-CompatibilityTargetPath {
    param(
        [string]$TargetPath,
        [string]$AliasName
    )

    return [System.IO.Path]::GetRelativePath((Split-Path -Parent (Join-Path $repoRoot $AliasName)), $TargetPath)
}

function Test-DirectoryInUse {
    param(
        [string]$Path
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $matches = @(
        Get-CimInstance Win32_Process |
            Where-Object { $_.ExecutablePath } |
            Where-Object {
                try {
                    [System.IO.Path]::GetFullPath($_.ExecutablePath).StartsWith($fullPath, [System.StringComparison]::OrdinalIgnoreCase)
                }
                catch {
                    $false
                }
            }
    )

    return @($matches)
}

function Remove-ExistingCompatibilityLink {
    param(
        [string]$LinkPath
    )

    if (-not (Test-Path $LinkPath)) {
        return
    }

    Remove-Item -LiteralPath $LinkPath -Force -Recurse
}

function Set-PathHiddenState {
    param(
        [string]$Path,
        [bool]$Hidden = $true,
        [switch]$DoApply
    )

    $actionLabel = if ($Hidden) { "hide-link" } else { "show-link" }
    if (-not $DoApply) {
        Write-PlanLine "  ${actionLabel}: $Path" "DarkGray"
        return
    }

    if (-not (Test-Path $Path)) {
        return
    }

    $item = Get-Item -LiteralPath $Path -Force
    $attributesValue = [int]$item.Attributes
    $hiddenFlag = [int][IO.FileAttributes]::Hidden
    if ($Hidden) {
        $attributesValue = $attributesValue -bor $hiddenFlag
    }
    else {
        $attributesValue = $attributesValue -band (-bnot $hiddenFlag)
    }

    [System.IO.File]::SetAttributes($item.FullName, [IO.FileAttributes]$attributesValue)
}

function Ensure-CompatibilityLink {
    param(
        [string]$LinkPath,
        [string]$TargetPath,
        [switch]$DoApply
    )

    if (-not $DoApply) {
        Write-PlanLine "  link: $LinkPath -> $TargetPath" "DarkGray"
        Set-PathHiddenState -Path $LinkPath -Hidden:$true -DoApply:$DoApply
        return
    }

    if (Test-Path $LinkPath) {
        Remove-ExistingCompatibilityLink -LinkPath $LinkPath
    }

    New-Item -ItemType Junction -Path $LinkPath -Target $TargetPath | Out-Null
    Set-PathHiddenState -Path $LinkPath -Hidden:$true -DoApply:$DoApply
}

function Move-ToBackup {
    param(
        [string]$SourcePath,
        [string]$BackupRoot,
        [string]$RelativeName,
        [switch]$DoApply
    )

    $backupPath = Join-Path $BackupRoot $RelativeName
    if (-not $DoApply) {
        Write-PlanLine "  backup: $SourcePath -> $backupPath" "Yellow"
        return
    }

    Ensure-Directory -Path (Split-Path -Parent $backupPath)
    if (Test-Path $backupPath) {
        throw "Backup target already exists: $backupPath"
    }
    Move-Item -LiteralPath $SourcePath -Destination $backupPath
}

function Invoke-RuntimeMigration {
    param(
        [object]$Spec,
        [string]$SessionId,
        [switch]$DoApply,
        [switch]$DropCompatibilityLinks
    )

    $envTarget = Join-Path (Join-Path $repoRoot "env") $Spec.Primary
    $backupRoot = Get-BackupRoot -SessionId $SessionId
    $rootEntries = @(Get-RootRuntimeEntries -Spec $Spec)
    $realEntries = @($rootEntries | Where-Object { -not $_.IsReparsePoint })

    Write-PlanLine ""
    Write-PlanLine "[$($Spec.Name)]" "Cyan"

    if ($DropCompatibilityLinks) {
        $removedAny = $false
        foreach ($entry in @($rootEntries | Where-Object { $_.IsReparsePoint })) {
            $removedAny = $true
            if ($DoApply) {
                Remove-ExistingCompatibilityLink -LinkPath $entry.Path
            }
            Write-PlanLine "  remove-link: $($entry.Path)" "Yellow"
        }

        if (-not $removedAny) {
            Write-PlanLine "  no root compatibility links to remove" "DarkGray"
        }
        return
    }

    foreach ($entry in $realEntries) {
        $inUse = @(Test-DirectoryInUse -Path $entry.Path)
        if ($inUse.Count -gt 0) {
            throw "Runtime '$($Spec.Name)' is currently in use: $($entry.Path)"
        }
    }

    $envTargetExists = Test-Path $envTarget
    $selectedSource = $null
    if (-not $envTargetExists -and $realEntries.Count -gt 0) {
        $selectedSource = Select-PrimaryRootEntry -Entries $realEntries -Spec $Spec
        Write-PlanLine "  source: $($selectedSource.Path) -> $envTarget" "Green"
    }
    elseif ($envTargetExists) {
        Write-PlanLine "  env target already present: $envTarget" "Green"
    }
    else {
        Write-PlanLine "  no runtime directory found, skipping" "DarkGray"
        return
    }

    foreach ($entry in $realEntries) {
        if ($selectedSource -and $entry.Path -eq $selectedSource.Path) {
            continue
        }
        Move-ToBackup -SourcePath $entry.Path -BackupRoot $backupRoot -RelativeName (Join-Path $Spec.Name $entry.Alias) -DoApply:$DoApply
    }

    if ($selectedSource) {
        if (-not $DoApply) {
            Write-PlanLine "  move: $($selectedSource.Path) -> $envTarget" "Green"
        }
        else {
            Ensure-Directory -Path (Split-Path -Parent $envTarget)
            Move-Item -LiteralPath $selectedSource.Path -Destination $envTarget
        }
    }

    foreach ($alias in $Spec.Aliases) {
        $rootAliasPath = Join-Path $repoRoot $alias
        Ensure-CompatibilityLink -LinkPath $rootAliasPath -TargetPath $envTarget -DoApply:$DoApply
    }
}

$selectedSpecs = @($runtimeSpecs)
if (-not $IncludeVenvs) {
    $selectedSpecs = @($selectedSpecs | Where-Object { $_.IncludeByDefault })
}

if ($RuntimeNames -and $RuntimeNames.Count -gt 0) {
    $requested = @($RuntimeNames | ForEach-Object { ([string]$_).Trim().ToLowerInvariant() } | Where-Object { $_ })
    $selectedSpecs = @($selectedSpecs | Where-Object { $_.Name -in $requested })
    if ($selectedSpecs.Count -eq 0) {
        throw "No runtime specifications matched: $($RuntimeNames -join ', ')"
    }
}

$sessionId = Get-Date -Format "yyyyMMdd-HHmmss"
Write-PlanLine "Runtime migration root: $repoRoot" "DarkGray"
Write-PlanLine ("Mode: " + $(if ($Apply) { "apply" } else { "dry-run" })) "DarkGray"
if ($RemoveCompatibilityLinks) {
    Write-PlanLine "Action: remove root compatibility junctions only" "DarkYellow"
}
else {
    Write-PlanLine "Action: move runtime directories into env and recreate root junctions" "DarkYellow"
}

foreach ($spec in $selectedSpecs) {
    Invoke-RuntimeMigration -Spec $spec -SessionId $sessionId -DoApply:$Apply -DropCompatibilityLinks:$RemoveCompatibilityLinks
}

Write-PlanLine ""
Write-PlanLine "Migration script completed." "Green"
