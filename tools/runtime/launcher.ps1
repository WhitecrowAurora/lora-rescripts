param(
    [ValidateSet('Auto', 'Manual')]
    [string]$Mode = 'Auto',
    [string]$Selection = '',
    [ValidateSet('auto', 'zh', 'ja', 'en')]
    [string]$Language = 'auto',
    [switch]$PrintSelectionOnly,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ForwardArgs
)

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$runGuiScript = Join-Path $repoRoot 'run_gui.ps1'
. (Join-Path $PSScriptRoot 'console_i18n.ps1')
. (Join-Path $PSScriptRoot 'runtime_paths.ps1')

function Get-FirstExistingPath {
    param(
        [string[]]$Candidates
    )

    foreach ($candidate in $Candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }
    return $null
}

function Get-LaunchProfileById {
    param(
        [string]$Id,
        [object[]]$Profiles
    )

    foreach ($profile in $Profiles) {
        if ($profile.Id -eq $Id) {
            return $profile
        }
    }
    throw (Get-ConsoleText -Key 'launcher_unknown_profile' -Tokens @{ id = $Id })
}

function Resolve-AutoLaunchProfile {
    param(
        [object[]]$Profiles,
        [string]$SagePython
    )

    if ($SagePython) {
        return Get-LaunchProfileById -Id 'sageattention' -Profiles $Profiles
    }
    return Get-LaunchProfileById -Id 'standard' -Profiles $Profiles
}

function Resolve-SelectionId {
    param(
        [string]$Value,
        [object[]]$Profiles
    )

    $normalized = ([string]$Value).Trim().ToLower()
    if ([string]::IsNullOrWhiteSpace($normalized)) {
        return $null
    }

    if ($normalized -match '^\d+$') {
        $index = [int]$normalized - 1
        if ($index -ge 0 -and $index -lt $Profiles.Count) {
            return $Profiles[$index].Id
        }
    }

    foreach ($profile in $Profiles) {
        if ($profile.Id -eq $normalized) {
            return $profile.Id
        }
    }

    return $null
}

function Show-SelectionMenu {
    param(
        [string]$Title,
        [string]$Hint,
        [object[]]$Options
    )

    if (-not $Host.UI.RawUI) {
        throw (Get-ConsoleText -Key 'launcher_manual_requires_interactive')
    }

    $selectedIndex = 0
    while ($true) {
        Clear-Host
        Write-Host $Title
        Write-Host
        Write-Host $Hint -ForegroundColor DarkGray
        Write-Host

        for ($index = 0; $index -lt $Options.Count; $index++) {
            $option = $Options[$index]
            $prefix = if ($index -eq $selectedIndex) { '> ' } else { '  ' }
            $color = if ($index -eq $selectedIndex) { 'Cyan' } else { 'Gray' }
            Write-Host "$prefix[$($index + 1)] $($option.Label)" -ForegroundColor $color
            if (-not [string]::IsNullOrWhiteSpace($option.Description)) {
                Write-Host "     $($option.Description)" -ForegroundColor DarkGray
            }
        }

        $key = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        switch ($key.VirtualKeyCode) {
            38 {
                if ($selectedIndex -gt 0) {
                    $selectedIndex--
                }
            }
            40 {
                if ($selectedIndex -lt ($Options.Count - 1)) {
                    $selectedIndex++
                }
            }
            13 {
                return $Options[$selectedIndex]
            }
            27 {
                throw (Get-ConsoleText -Key 'launcher_cancelled')
            }
        }
    }
}

function Show-LanguageMenu {
    $options = @(
        [pscustomobject]@{
            Id = 'auto'
            Label = 'Auto / 跟随系统 / システムに従う'
            Description = 'Use the Windows display language / 使用 Windows 显示语言 / Windows の表示言語を使用'
        },
        [pscustomobject]@{
            Id = 'en'
            Label = 'English'
            Description = 'Show launcher and startup messages in English'
        },
        [pscustomobject]@{
            Id = 'ja'
            Label = '日本語'
            Description = 'コンソールの起動メッセージを日本語で表示します'
        },
        [pscustomobject]@{
            Id = 'zh'
            Label = '简体中文'
            Description = '控制台启动信息显示为简体中文'
        }
    )

    return Show-SelectionMenu `
        -Title 'Console Language / 控制台语言 / コンソール言語' `
        -Hint 'Use Up/Down to move, Enter to confirm, Esc to cancel. / 使用上下方向键移动，按回车确认，按 Esc 取消。 / 上下キーで移動し、Enter で確定、Esc でキャンセルします。' `
        -Options $options
}

function Get-LaunchProfiles {
    return @(
        [pscustomobject]@{
            Id = 'auto'
            Label = Get-ConsoleText -Key 'launcher_profile_auto_label'
            Description = Get-ConsoleText -Key 'launcher_profile_auto_description'
            PreferredRuntime = ''
            AttentionPolicy = ''
            EnableSageStartup = $false
            EnableBlackwellStartup = $false
            EnableFlashAttentionStartup = $false
        },
        [pscustomobject]@{
            Id = 'sageattention'
            Label = Get-ConsoleText -Key 'launcher_profile_sageattention_label'
            Description = Get-ConsoleText -Key 'launcher_profile_sageattention_description'
            PreferredRuntime = 'sageattention'
            AttentionPolicy = 'prefer_sage'
            EnableSageStartup = $true
            EnableBlackwellStartup = $false
            EnableFlashAttentionStartup = $false
        },
        [pscustomobject]@{
            Id = 'sageattention2'
            Label = Get-ConsoleText -Key 'launcher_profile_sageattention2_label'
            Description = Get-ConsoleText -Key 'launcher_profile_sageattention2_description'
            PreferredRuntime = 'sageattention2'
            AttentionPolicy = 'prefer_sage'
            EnableSageStartup = $false
            EnableBlackwellStartup = $false
            EnableFlashAttentionStartup = $false
        },
        [pscustomobject]@{
            Id = 'flashattention'
            Label = Get-ConsoleText -Key 'launcher_profile_flashattention_label'
            Description = Get-ConsoleText -Key 'launcher_profile_flashattention_description'
            PreferredRuntime = 'flashattention'
            AttentionPolicy = ''
            EnableSageStartup = $false
            EnableBlackwellStartup = $false
            EnableFlashAttentionStartup = $true
        },
        [pscustomobject]@{
            Id = 'standard'
            Label = Get-ConsoleText -Key 'launcher_profile_standard_label'
            Description = Get-ConsoleText -Key 'launcher_profile_standard_description'
            PreferredRuntime = ''
            AttentionPolicy = ''
            EnableSageStartup = $false
            EnableBlackwellStartup = $false
            EnableFlashAttentionStartup = $false
        },
        [pscustomobject]@{
            Id = 'safe-sdpa'
            Label = Get-ConsoleText -Key 'launcher_profile_safe_sdpa_label'
            Description = Get-ConsoleText -Key 'launcher_profile_safe_sdpa_description'
            PreferredRuntime = ''
            AttentionPolicy = 'force_sdpa'
            EnableSageStartup = $false
            EnableBlackwellStartup = $false
            EnableFlashAttentionStartup = $false
        },
        [pscustomobject]@{
            Id = 'blackwell'
            Label = Get-ConsoleText -Key 'launcher_profile_blackwell_label'
            Description = Get-ConsoleText -Key 'launcher_profile_blackwell_description'
            PreferredRuntime = 'blackwell'
            AttentionPolicy = ''
            EnableSageStartup = $false
            EnableBlackwellStartup = $true
            EnableFlashAttentionStartup = $false
        }
    )
}

function Show-LaunchProfileMenu {
    param(
        [object[]]$Profiles
    )

    return Show-SelectionMenu `
        -Title (Get-ConsoleText -Key 'launcher_title') `
        -Hint (Get-ConsoleText -Key 'launcher_profile_menu_hint') `
        -Options $Profiles
}

function Clear-LaunchEnvironmentOverrides {
    foreach ($name in @(
        'MIKAZUKI_PREFERRED_RUNTIME',
        'MIKAZUKI_FLASHATTENTION_STARTUP',
        'MIKAZUKI_SAGEATTENTION_STARTUP',
        'MIKAZUKI_BLACKWELL_STARTUP',
        'MIKAZUKI_STARTUP_ATTENTION_POLICY'
    )) {
        Remove-Item "Env:$name" -ErrorAction SilentlyContinue
    }
}

function Apply-LaunchProfile {
    param(
        $Profile
    )

    Clear-LaunchEnvironmentOverrides

    if (-not [string]::IsNullOrWhiteSpace($Profile.PreferredRuntime)) {
        $Env:MIKAZUKI_PREFERRED_RUNTIME = $Profile.PreferredRuntime
    }
    if ($Profile.EnableSageStartup) {
        $Env:MIKAZUKI_SAGEATTENTION_STARTUP = '1'
    }
    if ($Profile.EnableFlashAttentionStartup) {
        $Env:MIKAZUKI_FLASHATTENTION_STARTUP = '1'
    }
    if ($Profile.EnableBlackwellStartup) {
        $Env:MIKAZUKI_BLACKWELL_STARTUP = '1'
    }
    if (-not [string]::IsNullOrWhiteSpace($Profile.AttentionPolicy)) {
        $Env:MIKAZUKI_STARTUP_ATTENTION_POLICY = $Profile.AttentionPolicy
    }
}

$flashAttentionPython = Get-FirstExistingPath @((Get-RuntimeFileCandidates -RepoRoot $repoRoot -RuntimeName 'flashattention' -RelativeFilePath 'python.exe').Path)
$sagePython = Get-FirstExistingPath @((Get-RuntimeFileCandidates -RepoRoot $repoRoot -RuntimeName 'sageattention' -RelativeFilePath 'python.exe').Path)
$sage2Python = Get-FirstExistingPath @((Get-RuntimeFileCandidates -RepoRoot $repoRoot -RuntimeName 'sageattention2' -RelativeFilePath 'python.exe').Path)
$blackwellPython = Get-FirstExistingPath @((Get-RuntimeFileCandidates -RepoRoot $repoRoot -RuntimeName 'blackwell' -RelativeFilePath 'python.exe').Path)

$requestedConsoleLanguage = $Language
if ($Mode -eq 'Manual' -and -not $PSBoundParameters.ContainsKey('Language')) {
    $requestedConsoleLanguage = (Show-LanguageMenu).Id
}
Set-ConsoleLanguage -Language $requestedConsoleLanguage | Out-Null
$profiles = Get-LaunchProfiles

$selectedProfile = $null
$selectionId = Resolve-SelectionId -Value $Selection -Profiles $profiles
if ($selectionId) {
    $selectedProfile = Get-LaunchProfileById -Id $selectionId -Profiles $profiles
}
elseif ($Mode -eq 'Manual') {
    $selectedProfile = Show-LaunchProfileMenu -Profiles $profiles
}
else {
    $selectedProfile = Get-LaunchProfileById -Id 'auto' -Profiles $profiles
}

if ($selectedProfile.Id -eq 'auto') {
    $selectedProfile = Resolve-AutoLaunchProfile -Profiles $profiles -SagePython $sagePython
}

Apply-LaunchProfile -Profile $selectedProfile

$selectionPayload = [ordered]@{
    selected_id = $selectedProfile.Id
    selected_label = $selectedProfile.Label
    preferred_runtime = $selectedProfile.PreferredRuntime
    attention_policy = $selectedProfile.AttentionPolicy
    console_language = Get-ConsoleLanguage
    flashattention_runtime_detected = [bool]$flashAttentionPython
    sage_runtime_detected = [bool]$sagePython
    sage2_runtime_detected = [bool]$sage2Python
    blackwell_runtime_detected = [bool]$blackwellPython
}

if ($PrintSelectionOnly) {
    $selectionPayload | ConvertTo-Json -Compress
    exit 0
}

Write-ConsoleText -Key 'launcher_selected_language' -Tokens @{ language = (Get-ConsoleLanguageDisplayName -LanguageCode (Get-ConsoleLanguage)) } -ForegroundColor 'DarkGray'
Write-ConsoleText -Key 'launcher_selected_profile' -Tokens @{ profile = $selectedProfile.Label } -ForegroundColor 'Green'
if ($selectedProfile.AttentionPolicy -eq 'prefer_sage') {
    Write-ConsoleText -Key 'launcher_attention_prefer_sage' -ForegroundColor 'DarkGray'
}
elseif ($selectedProfile.AttentionPolicy -eq 'force_sdpa') {
    Write-ConsoleText -Key 'launcher_attention_force_sdpa' -ForegroundColor 'DarkGray'
}
else {
    Write-ConsoleText -Key 'launcher_attention_keep_default' -ForegroundColor 'DarkGray'
}

Set-Location $repoRoot
& $runGuiScript @ForwardArgs
exit $LASTEXITCODE
