param(
    [switch]$UseChinaMirror,
    [switch]$PromptOnFirstUse
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$mirrorHelperPath = Join-Path $PSScriptRoot 'mirror_env.ps1'
$defaultRepoUrl = 'https://github.com/WhitecrowAurora/lora-rescripts'
$defaultBranch = 'main'

function Write-Section {
    param(
        [string]$Title
    )

    Write-Host
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan
}

function Get-GitText {
    param(
        [string[]]$Args
    )

    $output = & git @Args 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }

    return (($output | ForEach-Object { [string]$_ }) -join "`n").Trim()
}

function Get-GitHubMirrorCandidates {
    $candidates = New-Object 'System.Collections.Generic.List[string]'

    $customMirror = ([string]$Env:MIKAZUKI_GITHUB_MIRROR_BASE).Trim()
    if (-not [string]::IsNullOrWhiteSpace($customMirror)) {
        if (-not $customMirror.EndsWith('/')) {
            $customMirror += '/'
        }
        $candidates.Add($customMirror)
    }

    $defaultMirror = 'https://hub.gitmirror.com/https://github.com/'
    if (-not $candidates.Contains($defaultMirror)) {
        $candidates.Add($defaultMirror)
    }

    return $candidates
}

function Join-GitHubMirrorUrl {
    param(
        [string]$MirrorBase,
        [string]$GitHubUrl
    )

    $normalizedMirrorBase = ([string]$MirrorBase).Trim()
    $normalizedGitHubUrl = ([string]$GitHubUrl).Trim()
    if ([string]::IsNullOrWhiteSpace($normalizedMirrorBase) -or [string]::IsNullOrWhiteSpace($normalizedGitHubUrl)) {
        return $normalizedGitHubUrl
    }

    if (-not $normalizedMirrorBase.EndsWith('/')) {
        $normalizedMirrorBase += '/'
    }

    $githubPrefix = 'https://github.com/'
    if (
        $normalizedGitHubUrl.StartsWith($githubPrefix, [System.StringComparison]::OrdinalIgnoreCase) -and
        $normalizedMirrorBase.EndsWith($githubPrefix, [System.StringComparison]::OrdinalIgnoreCase)
    ) {
        return ($normalizedMirrorBase + $normalizedGitHubUrl.Substring($githubPrefix.Length))
    }

    if ($normalizedGitHubUrl -match '^https?://') {
        return ($normalizedMirrorBase + $normalizedGitHubUrl)
    }

    return ($normalizedMirrorBase + $normalizedGitHubUrl.TrimStart('/'))
}

function Get-NormalizedRepoHttpUrl {
    param(
        [string]$RepoUrl
    )

    $normalized = ([string]$RepoUrl).Trim()
    if ([string]::IsNullOrWhiteSpace($normalized)) {
        return $defaultRepoUrl
    }

    if ($normalized -match '^(https?://.+?)(?:\.git)?/?$') {
        return $matches[1]
    }

    if ($normalized -match '^git@github\.com:(.+?)(?:\.git)?$') {
        return ('https://github.com/' + $matches[1].Trim('/'))
    }

    return $defaultRepoUrl
}

function Get-ArchiveUrlCandidates {
    param(
        [string]$RepoUrl,
        [string]$Branch
    )

    $normalizedRepoUrl = Get-NormalizedRepoHttpUrl -RepoUrl $RepoUrl
    $archiveUrl = ($normalizedRepoUrl.TrimEnd('/') + "/archive/refs/heads/$Branch.zip")
    $candidates = New-Object 'System.Collections.Generic.List[string]'

    if ($UseChinaMirror) {
        foreach ($mirrorBase in (Get-GitHubMirrorCandidates)) {
            $candidate = Join-GitHubMirrorUrl -MirrorBase $mirrorBase -GitHubUrl $archiveUrl
            if (-not $candidates.Contains($candidate)) {
                $candidates.Add($candidate)
            }
        }
    }

    if (-not $candidates.Contains($archiveUrl)) {
        $candidates.Add($archiveUrl)
    }

    if (-not $UseChinaMirror) {
        foreach ($mirrorBase in (Get-GitHubMirrorCandidates)) {
            $candidate = Join-GitHubMirrorUrl -MirrorBase $mirrorBase -GitHubUrl $archiveUrl
            if (-not $candidates.Contains($candidate)) {
                $candidates.Add($candidate)
            }
        }
    }

    return $candidates
}

function Get-RelativePathText {
    param(
        [string]$BasePath,
        [string]$TargetPath
    )

    $baseUri = New-Object System.Uri(([System.IO.Path]::GetFullPath($BasePath).TrimEnd('\') + '\'))
    $targetUri = New-Object System.Uri([System.IO.Path]::GetFullPath($TargetPath))
    return [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString()).Replace('/', '\')
}

function Normalize-RelativePath {
    param(
        [string]$Path
    )

    return (([string]$Path).Replace('/', '\').TrimStart('\')).ToLowerInvariant()
}

function Test-PreservedRelativePath {
    param(
        [string]$RelativePath,
        [string[]]$PreserveRelativePaths
    )

    $normalizedRelative = Normalize-RelativePath -Path $RelativePath
    foreach ($preservePath in @($PreserveRelativePaths)) {
        $normalizedPreserve = Normalize-RelativePath -Path $preservePath
        if (
            $normalizedRelative -eq $normalizedPreserve -or
            $normalizedRelative.StartsWith($normalizedPreserve + '\')
        ) {
            return $true
        }
    }

    return $false
}

function Copy-RepoOverlay {
    param(
        [string]$SourceRoot,
        [string]$DestinationRoot,
        [string[]]$PreserveRelativePaths
    )

    foreach ($item in (Get-ChildItem -LiteralPath $SourceRoot -Recurse -Force | Sort-Object FullName)) {
        $relativePath = Get-RelativePathText -BasePath $SourceRoot -TargetPath $item.FullName
        if (Test-PreservedRelativePath -RelativePath $relativePath -PreserveRelativePaths $PreserveRelativePaths) {
            continue
        }

        $destinationPath = Join-Path $DestinationRoot $relativePath
        if ($item.PSIsContainer) {
            if (-not (Test-Path -LiteralPath $destinationPath)) {
                New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null
            }
            continue
        }

        $destinationDir = Split-Path -Parent $destinationPath
        if (-not [string]::IsNullOrWhiteSpace($destinationDir) -and -not (Test-Path -LiteralPath $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }

        Copy-Item -LiteralPath $item.FullName -Destination $destinationPath -Force
    }
}

function Invoke-DownloadFileWithProgress {
    param(
        [string]$Uri,
        [string]$OutFile,
        [int]$TimeoutSec = 120,
        [string]$Label = "Downloading archive"
    )

    if (Test-Path -LiteralPath $OutFile) {
        Remove-Item -LiteralPath $OutFile -Force -ErrorAction SilentlyContinue
    }

    $outputDir = Split-Path -Parent $OutFile
    if (-not [string]::IsNullOrWhiteSpace($outputDir) -and -not (Test-Path -LiteralPath $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }

    $request = [System.Net.HttpWebRequest]::Create($Uri)
    $request.Method = "GET"
    $request.Timeout = $TimeoutSec * 1000
    $request.ReadWriteTimeout = $TimeoutSec * 1000
    $request.UserAgent = "lora-rescripts-updater"

    $response = $null
    $responseStream = $null
    $fileStream = $null

    try {
        $response = $request.GetResponse()
        $responseStream = $response.GetResponseStream()
        if (-not $responseStream) {
            throw "Unable to open response stream."
        }

        $fileStream = [System.IO.File]::Open($OutFile, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::Read)
        $buffer = New-Object byte[] 262144
        $totalBytes = [int64]$response.ContentLength
        $downloadedBytes = [int64]0
        $lastReport = [DateTime]::UtcNow.AddSeconds(-1)

        while ($true) {
            $bytesRead = $responseStream.Read($buffer, 0, $buffer.Length)
            if ($bytesRead -le 0) {
                break
            }

            $fileStream.Write($buffer, 0, $bytesRead)
            $downloadedBytes += [int64]$bytesRead

            $now = [DateTime]::UtcNow
            if (($now - $lastReport).TotalSeconds -ge 0.5) {
                if ($totalBytes -gt 0) {
                    $percent = [Math]::Min(100, [Math]::Round(($downloadedBytes * 100.0) / $totalBytes, 1))
                    $downloadedMb = [Math]::Round($downloadedBytes / 1MB, 2)
                    $totalMb = [Math]::Round($totalBytes / 1MB, 2)
                    Write-Host ("{0}: {1}% ({2} MB / {3} MB)" -f $Label, $percent, $downloadedMb, $totalMb) -ForegroundColor DarkGray
                }
                else {
                    $downloadedMb = [Math]::Round($downloadedBytes / 1MB, 2)
                    Write-Host ("{0}: {1} MB downloaded" -f $Label, $downloadedMb) -ForegroundColor DarkGray
                }
                $lastReport = $now
            }
        }

        if ($totalBytes -gt 0) {
            $totalMb = [Math]::Round($totalBytes / 1MB, 2)
            Write-Host ("{0}: 100% ({1} MB / {1} MB)" -f $Label, $totalMb) -ForegroundColor DarkGray
        }
        else {
            $downloadedMb = [Math]::Round($downloadedBytes / 1MB, 2)
            Write-Host ("{0}: completed ({1} MB)" -f $Label, $downloadedMb) -ForegroundColor DarkGray
        }
    }
    finally {
        if ($fileStream) {
            $fileStream.Dispose()
        }
        if ($responseStream) {
            $responseStream.Dispose()
        }
        if ($response) {
            $response.Dispose()
        }
    }
}

function Invoke-ArchiveOverlayUpdate {
    param(
        [string]$RepoUrl,
        [string]$Branch
    )

    Write-Section 'Archive Update'
    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('lora-rescripts-update-' + [guid]::NewGuid().ToString('N'))
    $zipPath = Join-Path $tempRoot 'repo.zip'
    $extractRoot = Join-Path $tempRoot 'extract'
    $preserveRelativePaths = @(
        '.git',
        'config\autosave',
        'config\china_mirror.json'
    )

    try {
        New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
        New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null

        $downloaded = $false
        foreach ($candidateUrl in (Get-ArchiveUrlCandidates -RepoUrl $RepoUrl -Branch $Branch)) {
            Write-Host ("Trying source archive: {0}" -f $candidateUrl) -ForegroundColor Yellow
            try {
                Invoke-DownloadFileWithProgress -Uri $candidateUrl -OutFile $zipPath -TimeoutSec 120 -Label "Archive download"
                if ((Test-Path -LiteralPath $zipPath) -and ((Get-Item -LiteralPath $zipPath).Length -gt 0)) {
                    $downloaded = $true
                    break
                }
            }
            catch {
                Write-Host ("Archive download failed: {0}" -f $_.Exception.Message) -ForegroundColor Yellow
            }
        }

        if (-not $downloaded) {
            throw 'Failed to download the update archive from GitHub.'
        }

        Expand-Archive -LiteralPath $zipPath -DestinationPath $extractRoot -Force
        $sourceRoot = Get-ChildItem -LiteralPath $extractRoot -Directory | Select-Object -First 1
        if (-not $sourceRoot) {
            throw 'The downloaded archive did not contain a valid source folder.'
        }

        Copy-RepoOverlay -SourceRoot $sourceRoot.FullName -DestinationRoot $repoRoot -PreserveRelativePaths $preserveRelativePaths
        Write-Host 'Archive overlay update completed.' -ForegroundColor Green
        Write-Host 'Preserved local paths: .git, config\\autosave, config\\china_mirror.json' -ForegroundColor DarkGray
    }
    finally {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-GitDirect {
    param(
        [string[]]$Args,
        [switch]$AllowFailure
    )

    Write-Host ('git ' + ($Args -join ' ')) -ForegroundColor DarkGray
    & git @Args
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0 -and -not $AllowFailure) {
        throw "git command failed (exit $exitCode): git $($Args -join ' ')"
    }

    return $exitCode
}

function Invoke-GitMirrorAware {
    param(
        [string[]]$Args,
        [switch]$AllowFailure
    )

    foreach ($mirrorBase in (Get-GitHubMirrorCandidates)) {
        Write-Host ("Trying GitHub mirror: {0}" -f $mirrorBase) -ForegroundColor Yellow
        Write-Host ('git -c ' + ('"url.{0}.insteadOf=https://github.com/" ' -f $mirrorBase) + ($Args -join ' ')) -ForegroundColor DarkGray
        & git '-c' ("url.$mirrorBase.insteadOf=https://github.com/") @Args
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) {
            return 0
        }

        Write-Host ("Mirror attempt failed with exit code {0}." -f $exitCode) -ForegroundColor Yellow
    }

    Write-Host 'Falling back to direct GitHub remote...' -ForegroundColor Yellow
    return Invoke-GitDirect -Args $Args -AllowFailure:$AllowFailure
}

function Invoke-GitCommand {
    param(
        [string[]]$Args,
        [switch]$AllowFailure
    )

    if ($UseChinaMirror) {
        return Invoke-GitMirrorAware -Args $Args -AllowFailure:$AllowFailure
    }

    return Invoke-GitDirect -Args $Args -AllowFailure:$AllowFailure
}

try {
    Write-Section 'Lora-rescripts Updater'
    Write-Host ("Repo root: {0}" -f $repoRoot) -ForegroundColor DarkGray

    $gitCommand = Get-Command git -ErrorAction SilentlyContinue
    if (-not $gitCommand) {
        throw 'git was not found in PATH. Please install Git first.'
    }

    Push-Location $repoRoot
    try {
        $gitRoot = Get-GitText -Args @('rev-parse', '--show-toplevel')
        if (-not $gitRoot) {
            Write-Host 'The current folder is not a Git repository.' -ForegroundColor Yellow
            Write-Host 'Falling back to source archive update from GitHub...' -ForegroundColor Yellow
            Invoke-ArchiveOverlayUpdate -RepoUrl $defaultRepoUrl -Branch $defaultBranch

            Write-Section 'Done'
            Write-Host 'Update completed successfully via archive overlay.' -ForegroundColor Green
            exit 0
        }

        if ($UseChinaMirror) {
            if (-not (Test-Path $mirrorHelperPath)) {
                throw "CN mirror helper not found: $mirrorHelperPath"
            }

            . $mirrorHelperPath
            Initialize-MikazukiChinaMirrorMode -RepoRoot $repoRoot -PromptOnFirstUse:$PromptOnFirstUse | Out-Null
        }

        $currentBranch = Get-GitText -Args @('branch', '--show-current')
        if (-not $currentBranch) {
            throw 'Unable to determine the current branch.'
        }

        $remoteName = Get-GitText -Args @('config', '--get', ("branch.{0}.remote" -f $currentBranch))
        if (-not $remoteName) {
            $remoteName = 'origin'
        }

        $mergeRef = Get-GitText -Args @('config', '--get', ("branch.{0}.merge" -f $currentBranch))
        $remoteBranch = $currentBranch
        if ($mergeRef -and $mergeRef.StartsWith('refs/heads/')) {
            $remoteBranch = $mergeRef.Substring(11)
        }
        elseif (-not [string]::IsNullOrWhiteSpace($mergeRef)) {
            $remoteBranch = $mergeRef
        }

        Write-Host ("Tracking: {0}/{1}" -f $remoteName, $remoteBranch) -ForegroundColor Green

        $dirtyStatus = Get-GitText -Args @('status', '--short', '--untracked-files=no')
        if (-not [string]::IsNullOrWhiteSpace($dirtyStatus)) {
            Write-Host 'Tracked local changes detected. The updater will still try a fast-forward pull.' -ForegroundColor Yellow
            Write-Host 'If Git says files would be overwritten, back up or commit those files first.' -ForegroundColor Yellow
            foreach ($line in (($dirtyStatus -split "`n") | Select-Object -First 20)) {
                Write-Host ("  {0}" -f $line) -ForegroundColor DarkGray
            }
        }

        Write-Section 'Fetch'
        Invoke-GitCommand -Args @('fetch', '--tags', '--prune', $remoteName) | Out-Null

        Write-Section 'Pull'
        Invoke-GitCommand -Args @('pull', '--ff-only', $remoteName, $remoteBranch) | Out-Null

        Write-Section 'Submodules'
        Invoke-GitCommand -Args @('submodule', 'sync', '--recursive') | Out-Null
        Invoke-GitCommand -Args @('submodule', 'update', '--init', '--recursive') | Out-Null

        $headShort = Get-GitText -Args @('rev-parse', '--short', 'HEAD')
        $headSubject = Get-GitText -Args @('log', '-1', '--pretty=%s')

        Write-Section 'Done'
        if ($headShort) {
            Write-Host ("HEAD: {0}" -f $headShort) -ForegroundColor Green
        }
        if ($headSubject) {
            Write-Host ("Latest commit: {0}" -f $headSubject) -ForegroundColor Green
        }
        Write-Host 'Update completed successfully.' -ForegroundColor Green
        exit 0
    }
    finally {
        Pop-Location
    }
}
catch {
    Write-Host
    Write-Host ("Update failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
    Write-Host 'If the pull was blocked by local changes, back them up or commit them first and run the updater again.' -ForegroundColor Yellow
    exit 1
}
