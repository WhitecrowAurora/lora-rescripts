function Get-ExperimentalRuntimeDisplayName {
    param(
        [ValidateSet('intel-xpu', 'intel-xpu-sage', 'rocm-amd')]
        [string]$RuntimeName,
        [ValidateSet('status', 'python')]
        [string]$Kind = 'status'
    )

    $language = Get-ConsoleLanguage
    switch ($RuntimeName) {
        'intel-xpu' {
            if ($Kind -eq 'python') {
                if ($language -eq 'zh') { return 'Intel XPU 实验运行时 Python' }
                if ($language -eq 'ja') { return 'Intel XPU 実験ランタイム Python' }
                return 'Intel XPU experimental Python'
            }
            if ($language -eq 'zh') { return 'Intel XPU' }
            if ($language -eq 'ja') { return 'Intel XPU' }
            return 'Intel XPU'
        }
        'intel-xpu-sage' {
            if ($Kind -eq 'python') {
                if ($language -eq 'zh') { return 'Intel XPU Sage 实验运行时 Python' }
                if ($language -eq 'ja') { return 'Intel XPU Sage 実験ランタイム Python' }
                return 'Intel XPU Sage experimental Python'
            }
            if ($language -eq 'zh') { return 'Intel XPU Sage' }
            if ($language -eq 'ja') { return 'Intel XPU Sage' }
            return 'Intel XPU Sage'
        }
        'rocm-amd' {
            if ($Kind -eq 'python') {
                if ($language -eq 'zh') { return 'AMD ROCm 实验运行时 Python' }
                if ($language -eq 'ja') { return 'AMD ROCm 実験ランタイム Python' }
                return 'AMD ROCm experimental Python'
            }
            if ($language -eq 'zh') { return 'AMD ROCm' }
            if ($language -eq 'ja') { return 'AMD ROCm' }
            return 'AMD ROCm'
        }
    }
}

function Ensure-EmbeddedRuntimeRepoBootstrap {
    param(
        [string]$RuntimeDir,
        [string]$RuntimeName
    )

    if ([string]::IsNullOrWhiteSpace($RuntimeDir) -or -not (Test-Path $RuntimeDir)) {
        return
    }

    $pthFile = Get-ChildItem -Path $RuntimeDir -Filter 'python*._pth' -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $pthFile) {
        return
    }

    $rawLines = Get-Content -LiteralPath $pthFile.FullName -ErrorAction SilentlyContinue
    if (-not $rawLines) {
        return
    }

    $resolvedRepoRoot = $repoRoot
    if ([string]::IsNullOrWhiteSpace($resolvedRepoRoot)) {
        $resolvedRepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    }

    $runtimeFullPath = [System.IO.Path]::GetFullPath((Join-Path $RuntimeDir '.'))
    $repoFullPath = [System.IO.Path]::GetFullPath((Join-Path $resolvedRepoRoot '.'))
    $runtimeUri = New-Object System.Uri(($runtimeFullPath.TrimEnd('\') + '\'))
    $repoUri = New-Object System.Uri(($repoFullPath.TrimEnd('\') + '\'))
    $repoRelativePath = [System.Uri]::UnescapeDataString($runtimeUri.MakeRelativeUri($repoUri).ToString()).Replace('/', '\')
    if ([string]::IsNullOrWhiteSpace($repoRelativePath)) {
        $repoRelativePath = '.'
    }

    $normalizedLines = @($rawLines | ForEach-Object { [string]($_).Trim() })
    if ($normalizedLines -contains $repoRelativePath) {
        return
    }

    $insertIndex = $rawLines.Count
    for ($i = 0; $i -lt $rawLines.Count; $i++) {
        if ([string]($rawLines[$i]).Trim() -eq 'import site') {
            $insertIndex = $i
            break
        }
    }

    $newLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $insertIndex; $i++) {
        $null = $newLines.Add([string]$rawLines[$i])
    }
    $null = $newLines.Add($repoRelativePath)
    for ($i = $insertIndex; $i -lt $rawLines.Count; $i++) {
        $null = $newLines.Add([string]$rawLines[$i])
    }

    try {
        Set-Content -LiteralPath $pthFile.FullName -Value $newLines -Encoding ASCII
        switch (Get-ConsoleLanguage) {
            'zh' {
                Write-Host -ForegroundColor Yellow "已修正 $RuntimeName 的嵌入式 Python 路径白名单：自动加入仓库根目录，确保子进程也能加载运行时护栏。"
            }
            'ja' {
                Write-Host -ForegroundColor Yellow "$RuntimeName の埋め込み Python パス許可リストを修正しました。リポジトリルートを追加し、子プロセスでもランタイムガードを自動読込します。"
            }
            default {
                Write-Host -ForegroundColor Yellow "Patched $RuntimeName embedded Python path allowlist to include the repo root so subprocesses can auto-load runtime guards."
            }
        }
    }
    catch {
        switch (Get-ConsoleLanguage) {
            'zh' {
                Write-Host -ForegroundColor Yellow "警告：无法修正 $RuntimeName 的嵌入式 Python 路径白名单：$($_.Exception.Message)"
            }
            'ja' {
                Write-Host -ForegroundColor Yellow "警告: $RuntimeName の埋め込み Python パス許可リストを修正できませんでした: $($_.Exception.Message)"
            }
            default {
                Write-Host -ForegroundColor Yellow "Warning: failed to patch $RuntimeName embedded Python path allowlist: $($_.Exception.Message)"
            }
        }
    }
}

function Resolve-ExperimentalRuntimeRepoRoot {
    if (-not [string]::IsNullOrWhiteSpace($repoRoot)) {
        return [System.IO.Path]::GetFullPath((Join-Path $repoRoot '.'))
    }

    return [System.IO.Path]::GetFullPath((Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) '.'))
}

function Invoke-ExperimentalRuntimeJsonProbe {
    param(
        [string]$PythonExe,
        [string[]]$ScriptLines
    )

    if ([string]::IsNullOrWhiteSpace($PythonExe) -or -not (Test-Path $PythonExe)) {
        return $null
    }

    $scriptContent = (@($ScriptLines | ForEach-Object { [string]$_ }) -join "`n")
    if ([string]::IsNullOrWhiteSpace($scriptContent)) {
        return $null
    }

    $tempPath = [System.IO.Path]::GetTempFileName()
    $tempPyPath = [System.IO.Path]::ChangeExtension($tempPath, ".py")
    Move-Item -LiteralPath $tempPath -Destination $tempPyPath -Force

    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($tempPyPath, $scriptContent, $utf8NoBom)

        $previousErrorActionPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = "Continue"
            $raw = & $PythonExe $tempPyPath 2>$null
            $exitCode = $LASTEXITCODE
        }
        finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }

        if ($exitCode -ne 0 -or [string]::IsNullOrWhiteSpace($raw)) {
            return $null
        }

        $text = if ($raw -is [System.Array]) {
            ($raw | ForEach-Object { [string]$_ }) -join [Environment]::NewLine
        }
        else {
            [string]$raw
        }

        $jsonLine = $text -split "\r?\n" |
            ForEach-Object { $_.Trim() } |
            Where-Object { $_ -match '^[\{\[]' } |
            Select-Object -Last 1

        if ([string]::IsNullOrWhiteSpace($jsonLine)) {
            return $null
        }

        try {
            return $jsonLine | ConvertFrom-Json
        }
        catch {
            return $null
        }
    }
    finally {
        Remove-Item -LiteralPath $tempPyPath -Force -ErrorAction SilentlyContinue
    }
}

function Format-ROCmAmdRuntimeSummary {
    param(
        [object]$Probe
    )

    return "Python $($Probe.python_version); Torch $($Probe.torch_version); TorchVision $($Probe.torchvision_version); HIP $($Probe.hip_version); GPU $($Probe.gpu_name)"
}

function Format-IntelXpuRuntimeSummary {
    param(
        [object]$Probe
    )

    if ($null -eq $Probe.bf16_supported) {
        $bf16State = "unknown"
    } elseif ($Probe.bf16_supported) {
        $bf16State = "yes"
    } else {
        $bf16State = "no"
    }

    return "Python $($Probe.python_version); Torch $($Probe.torch_version); TorchVision $($Probe.torchvision_version); IPEX $($Probe.ipex_version); XPU count $($Probe.gpu_count); GPU $($Probe.gpu_name); BF16 $bf16State"
}

function Format-IntelXpuSageRuntimeSummary {
    param(
        [object]$Probe
    )

    if ($null -eq $Probe.bf16_supported) {
        $bf16State = "unknown"
    } elseif ($Probe.bf16_supported) {
        $bf16State = "yes"
    } else {
        $bf16State = "no"
    }

    return "Python $($Probe.python_version); Torch $($Probe.torch_version); TorchVision $($Probe.torchvision_version); Triton $($Probe.triton_version); SageAttention $($Probe.sageattention_version); XPU count $($Probe.gpu_count); GPU $($Probe.gpu_name); BF16 $bf16State"
}

function Get-MainRuntimeModulesForRuntime {
    param(
        [string]$RuntimeName
    )

    switch ($RuntimeName) {
        "flashattention" { return $flashAttentionRuntimeModules }
        "intel-xpu" { return $intelRuntimeModules }
        "intel-xpu-sage" { return $intelSageRuntimeModules }
        "rocm-amd" { return $amdRuntimeModules }
        default { return $mainRuntimeModules }
    }
}
