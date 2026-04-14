# Keep this file encoded as UTF-8 with BOM for Windows PowerShell 5 compatibility.
function Test-MikazukiChinaMirrorMode {
    return $Env:MIKAZUKI_CN_MIRROR -eq "1"
}

function Get-MikazukiChinaMirrorPresets {
    return @(
        [pscustomobject]@{
            Id = "tsinghua"
            Label = "Tsinghua / 清华"
            Description = "Recommended default / 默认推荐"
            PipIndexUrl = "https://pypi.tuna.tsinghua.edu.cn/simple"
            PipFindLinks = "https://mirror.sjtu.edu.cn/pytorch-wheels/torch_stable.html"
            HfEndpoint = "https://hf-mirror.com"
        },
        [pscustomobject]@{
            Id = "ustc"
            Label = "USTC / 中科大"
            Description = "Alternative PyPI mirror / 备用 PyPI 源"
            PipIndexUrl = "https://pypi.mirrors.ustc.edu.cn/simple"
            PipFindLinks = "https://mirror.sjtu.edu.cn/pytorch-wheels/torch_stable.html"
            HfEndpoint = "https://hf-mirror.com"
        },
        [pscustomobject]@{
            Id = "aliyun"
            Label = "Aliyun / 阿里云"
            Description = "Alternative PyPI mirror / 备用 PyPI 源"
            PipIndexUrl = "https://mirrors.aliyun.com/pypi/simple/"
            PipFindLinks = "https://mirror.sjtu.edu.cn/pytorch-wheels/torch_stable.html"
            HfEndpoint = "https://hf-mirror.com"
        },
        [pscustomobject]@{
            Id = "baidu"
            Label = "Baidu / 百度"
            Description = "Alternative PyPI mirror / 备用 PyPI 源"
            PipIndexUrl = "https://mirror.baidu.com/pypi/simple"
            PipFindLinks = "https://mirror.sjtu.edu.cn/pytorch-wheels/torch_stable.html"
            HfEndpoint = "https://hf-mirror.com"
        }
    )
}

function Get-MikazukiChinaMirrorPresetById {
    param(
        [string]$Id
    )

    $normalized = ([string]$Id).Trim().ToLower()
    if ([string]::IsNullOrWhiteSpace($normalized)) {
        return $null
    }

    foreach ($preset in (Get-MikazukiChinaMirrorPresets)) {
        if ($preset.Id -eq $normalized) {
            return $preset
        }
    }

    return $null
}

function Get-MikazukiDefaultChinaMirrorPreset {
    return Get-MikazukiChinaMirrorPresetById -Id "tsinghua"
}

function Get-MikazukiChinaMirrorConfigPath {
    param(
        [string]$RepoRoot
    )

    return Join-Path $RepoRoot "config\china_mirror.json"
}

function Test-MikazukiInteractiveConsole {
    try {
        return ($null -ne $Host) -and ($null -ne $Host.UI) -and ($null -ne $Host.UI.RawUI)
    }
    catch {
        return $false
    }
}

function Read-MikazukiChinaMirrorSelection {
    param(
        [string]$RepoRoot
    )

    $configPath = Get-MikazukiChinaMirrorConfigPath -RepoRoot $RepoRoot
    if (-not (Test-Path $configPath)) {
        return $null
    }

    try {
        $raw = Get-Content -Path $configPath -Raw -ErrorAction Stop
        $parsed = $raw | ConvertFrom-Json -ErrorAction Stop
        return Get-MikazukiChinaMirrorPresetById -Id $parsed.selected_id
    }
    catch {
        return $null
    }
}

function Write-MikazukiChinaMirrorSelection {
    param(
        [string]$RepoRoot,
        [object]$Preset
    )

    if (-not $RepoRoot -or -not $Preset) {
        return
    }

    $configPath = Get-MikazukiChinaMirrorConfigPath -RepoRoot $RepoRoot
    $configDir = Split-Path -Parent $configPath
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    $payload = [ordered]@{
        selected_id = $Preset.Id
        selected_label = $Preset.Label
        pip_index_url = $Preset.PipIndexUrl
        pip_find_links = $Preset.PipFindLinks
        hf_endpoint = $Preset.HfEndpoint
        updated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }

    $payload | ConvertTo-Json | Set-Content -Path $configPath -Encoding UTF8
}

function Select-MikazukiChinaMirrorPreset {
    $presets = Get-MikazukiChinaMirrorPresets
    $defaultPreset = Get-MikazukiDefaultChinaMirrorPreset

    if (-not (Test-MikazukiInteractiveConsole)) {
        return $defaultPreset
    }

    Write-Host
    Write-Host "China Mirror Source Selection / 国内镜像源选择" -ForegroundColor Cyan
    Write-Host "首次使用 CN 启动脚本时可选择一个 PyPI 镜像源，直接回车默认使用清华源。" -ForegroundColor DarkGray
    Write-Host "Git / Hugging Face / PyTorch wheel mirror helpers will stay enabled in CN mode." -ForegroundColor DarkGray
    Write-Host

    for ($index = 0; $index -lt $presets.Count; $index++) {
        $preset = $presets[$index]
        $defaultTag = if ($preset.Id -eq $defaultPreset.Id) { " (default)" } else { "" }
        Write-Host ("[{0}] {1}{2}" -f ($index + 1), $preset.Label, $defaultTag) -ForegroundColor Green
        Write-Host ("    {0}" -f $preset.PipIndexUrl) -ForegroundColor DarkGray
    }

    while ($true) {
        $answer = Read-Host "Select mirror [1]"
        if ([string]::IsNullOrWhiteSpace($answer)) {
            return $defaultPreset
        }

        $normalized = $answer.Trim().ToLower()
        if ($normalized -match '^\d+$') {
            $selectedIndex = [int]$normalized - 1
            if ($selectedIndex -ge 0 -and $selectedIndex -lt $presets.Count) {
                return $presets[$selectedIndex]
            }
        }

        $preset = Get-MikazukiChinaMirrorPresetById -Id $normalized
        if ($preset) {
            return $preset
        }

        Write-Host "Invalid selection. Press Enter for Tsinghua, or enter 1-$($presets.Count)." -ForegroundColor Yellow
    }
}

function Resolve-MikazukiChinaMirrorPreset {
    param(
        [string]$RepoRoot,
        [switch]$PromptOnFirstUse,
        [switch]$PersistSelection
    )

    $envPreset = Get-MikazukiChinaMirrorPresetById -Id $Env:MIKAZUKI_CN_MIRROR_PRESET
    if ($envPreset) {
        if ($PersistSelection) {
            Write-MikazukiChinaMirrorSelection -RepoRoot $RepoRoot -Preset $envPreset
        }
        return $envPreset
    }

    $savedPreset = Read-MikazukiChinaMirrorSelection -RepoRoot $RepoRoot
    if ($savedPreset) {
        return $savedPreset
    }

    if ($PromptOnFirstUse) {
        $selectedPreset = Select-MikazukiChinaMirrorPreset
    }
    else {
        $selectedPreset = Get-MikazukiDefaultChinaMirrorPreset
    }

    if ($PersistSelection) {
        Write-MikazukiChinaMirrorSelection -RepoRoot $RepoRoot -Preset $selectedPreset
    }

    return $selectedPreset
}

function Initialize-MikazukiChinaMirrorMode {
    param(
        [string]$RepoRoot,
        [switch]$PromptOnFirstUse,
        [switch]$Silent
    )

    $selectedPreset = Resolve-MikazukiChinaMirrorPreset `
        -RepoRoot $RepoRoot `
        -PromptOnFirstUse:$PromptOnFirstUse `
        -PersistSelection

    $Env:MIKAZUKI_CN_MIRROR = "1"
    $Env:MIKAZUKI_CN_MIRROR_PRESET = $selectedPreset.Id
    if (-not $Env:HF_HOME) {
        $Env:HF_HOME = "huggingface"
    }
    $Env:HF_ENDPOINT = $selectedPreset.HfEndpoint
    $Env:PIP_INDEX_URL = $selectedPreset.PipIndexUrl
    $Env:PIP_FIND_LINKS = $selectedPreset.PipFindLinks
    $Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"
    $Env:GIT_TERMINAL_PROMPT = "false"

    if ($RepoRoot) {
        $gitConfigPath = Join-Path $RepoRoot "assets\gitconfig-cn"
        if (Test-Path $gitConfigPath) {
            $Env:GIT_CONFIG_GLOBAL = $gitConfigPath
        }
    }

    if (-not $Silent) {
        Write-Host -ForegroundColor Green "China mainland mirror mode enabled."
        Write-Host -ForegroundColor Green "Selected PyPI mirror preset: $($selectedPreset.Label)"
        Write-Host -ForegroundColor DarkGray "HF_ENDPOINT=$($Env:HF_ENDPOINT)"
        Write-Host -ForegroundColor DarkGray "PIP_INDEX_URL=$($Env:PIP_INDEX_URL)"
        Write-Host -ForegroundColor DarkGray "PIP_FIND_LINKS=$($Env:PIP_FIND_LINKS)"
        if ($Env:GIT_CONFIG_GLOBAL) {
            Write-Host -ForegroundColor DarkGray "GIT_CONFIG_GLOBAL=$($Env:GIT_CONFIG_GLOBAL)"
        }
    }

    return $selectedPreset
}

function Enable-MikazukiChinaMirrorMode {
    param(
        [string]$RepoRoot,
        [switch]$Silent
    )

    return Initialize-MikazukiChinaMirrorMode -RepoRoot $RepoRoot -Silent:$Silent
}

function Test-MikazukiChinaMirrorShouldSkipTorchProbe {
    param(
        [string[]]$FallbackArgs
    )

    if (-not (Test-MikazukiChinaMirrorMode)) {
        return $false
    }

    $joinedArgs = (($FallbackArgs | ForEach-Object { [string]$_ }) -join " ").ToLowerInvariant()
    if ([string]::IsNullOrWhiteSpace($joinedArgs)) {
        return $false
    }

    return (
        $joinedArgs.Contains("download.pytorch.org/whl/cu124") -or
        $joinedArgs.Contains("download.pytorch.org/whl/cu128") -or
        $joinedArgs.Contains("download.pytorch.org/whl/nightly/")
    )
}

function Invoke-MirrorAwarePipInstall {
    param(
        [string]$PythonExe,
        [string[]]$MirrorArgs,
        [string[]]$FallbackArgs,
        [string]$MirrorLabel = "China mirror",
        [string]$FallbackLabel = "official upstream",
        [switch]$NoFallback
    )

    if (-not (Test-MikazukiChinaMirrorMode)) {
        & $PythonExe -m pip install @FallbackArgs
        return $LASTEXITCODE
    }

    if (Test-MikazukiChinaMirrorShouldSkipTorchProbe -FallbackArgs $FallbackArgs) {
        Write-Host -ForegroundColor Yellow (
            "$MirrorLabel does not currently mirror the requested PyTorch CUDA/nightly wheel channel. " +
            "Skipping the mirror probe and using $FallbackLabel directly while keeping the selected PyPI mirror for other packages."
        )
        & $PythonExe -m pip install @FallbackArgs
        return $LASTEXITCODE
    }

    Write-Host -ForegroundColor Yellow "Trying $MirrorLabel first..."
    & $PythonExe -m pip install @MirrorArgs
    $mirrorExitCode = $LASTEXITCODE
    if ($mirrorExitCode -eq 0 -or $NoFallback) {
        return $mirrorExitCode
    }

    Write-Host -ForegroundColor Yellow "$MirrorLabel did not complete successfully. Retrying via $FallbackLabel..."
    & $PythonExe -m pip install @FallbackArgs
    return $LASTEXITCODE
}
