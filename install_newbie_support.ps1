# Keep this file encoded as UTF-8 with BOM for Windows PowerShell 5 compatibility.
$ErrorActionPreference = "Stop"

param(
    [string]$RuntimeName = "",
    [switch]$Force
)

$Env:HF_HOME = "huggingface"
$Env:PYTHONUTF8 = "1"
$Env:PIP_DISABLE_PIP_VERSION_CHECK = "1"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $repoRoot "tools\runtime\runtime_paths.ps1")
. (Join-Path $repoRoot "tools\runtime\mirror_env.ps1")

if (Test-MikazukiChinaMirrorMode) {
    Enable-MikazukiChinaMirrorMode -RepoRoot $repoRoot | Out-Null
}

$runtimeSpecs = @(
    [pscustomobject]@{ Name = "portable"; Label = "Main Runtime / 主运行时" }
    [pscustomobject]@{ Name = "flashattention"; Label = "FlashAttention Runtime / FlashAttention 运行时" }
    [pscustomobject]@{ Name = "blackwell"; Label = "Blackwell Runtime / Blackwell 运行时" }
    [pscustomobject]@{ Name = "sageattention"; Label = "SageAttention Runtime / SageAttention 运行时" }
    [pscustomobject]@{ Name = "sageattention2"; Label = "SageAttention2 Runtime / SageAttention2 运行时" }
    [pscustomobject]@{ Name = "intel-xpu"; Label = "Intel XPU Runtime / Intel XPU 运行时" }
    [pscustomobject]@{ Name = "intel-xpu-sage"; Label = "Intel XPU Sage Runtime / Intel XPU Sage 运行时" }
    [pscustomobject]@{ Name = "rocm-amd"; Label = "AMD ROCm Runtime / AMD ROCm 运行时" }
)

$newbieSupportPackages = @(
    "peft==0.18.1",
    "torchdiffeq==0.2.5",
    "timm==1.0.26",
    "lycoris-lora==3.2.0.post2"
)

$requiredRuntimeModules = @("peft", "torchdiffeq", "timm")
$optionalRuntimeModules = @("lycoris.wrapper", "flash_attn")

function Test-PipReady {
    param(
        [string]$PythonExe
    )

    if ([string]::IsNullOrWhiteSpace($PythonExe) -or -not (Test-Path $PythonExe)) {
        return $false
    }

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $PythonExe -m pip --version 1>$null 2>$null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-Step {
    param(
        [string]$Message,
        [scriptblock]$Action
    )

    Write-Host -ForegroundColor Green $Message
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "$Message failed with exit code $LASTEXITCODE."
    }
}

function Invoke-PythonJsonProbe {
    param(
        [string]$PythonExe,
        [string]$ScriptContent
    )

    if ([string]::IsNullOrWhiteSpace($PythonExe) -or -not (Test-Path $PythonExe)) {
        return $null
    }

    $tempPath = [System.IO.Path]::GetTempFileName()
    $tempPyPath = [System.IO.Path]::ChangeExtension($tempPath, ".py")
    Move-Item -LiteralPath $tempPath -Destination $tempPyPath -Force

    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($tempPyPath, $ScriptContent, $utf8NoBom)

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

        return $jsonLine | ConvertFrom-Json
    }
    catch {
        return $null
    }
    finally {
        Remove-Item -LiteralPath $tempPyPath -Force -ErrorAction SilentlyContinue
    }
}

function Get-RuntimePythonPath {
    param(
        [string]$RuntimeDirectory
    )

    $candidates = @(
        (Join-Path $RuntimeDirectory "python.exe"),
        (Join-Path $RuntimeDirectory "Scripts\python.exe")
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

function Get-NewbieRuntimeProbe {
    param(
        [string]$PythonExe
    )

    $probeScript = @'
import importlib.util
import json

modules = ["peft", "torchdiffeq", "timm", "lycoris.wrapper", "flash_attn"]
result = {}
for name in modules:
    try:
        result[name] = importlib.util.find_spec(name) is not None
    except Exception:
        result[name] = False
print(json.dumps(result))
'@

    return Invoke-PythonJsonProbe -PythonExe $PythonExe -ScriptContent $probeScript
}

function Get-InstalledRuntimeTargets {
    $targets = New-Object System.Collections.Generic.List[object]

    foreach ($spec in $runtimeSpecs) {
        $runtimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRoot -RuntimeName $spec.Name
        $pythonExe = Get-RuntimePythonPath -RuntimeDirectory $runtimeInfo.DirectoryPath
        if (-not $pythonExe) {
            continue
        }

        $depsMarkerPath = Join-Path $runtimeInfo.DirectoryPath ".deps_installed"
        if (-not (Test-Path $depsMarkerPath)) {
            continue
        }

        if (-not (Test-PipReady -PythonExe $pythonExe)) {
            continue
        }

        $probe = Get-NewbieRuntimeProbe -PythonExe $pythonExe
        $newbieMarkerPath = Join-Path $runtimeInfo.DirectoryPath ".newbie_support_installed.json"

        $targets.Add([pscustomobject]@{
                Name = $spec.Name
                Label = $spec.Label
                DirectoryName = $runtimeInfo.DirectoryName
                DirectoryPath = $runtimeInfo.DirectoryPath
                PythonExe = $pythonExe
                DepsMarkerPath = $depsMarkerPath
                NewbieMarkerPath = $newbieMarkerPath
                NewbieMarkerExists = Test-Path $newbieMarkerPath
                HasPeft = [bool]($probe.peft)
                HasTorchdiffeq = [bool]($probe.torchdiffeq)
                HasTimm = [bool]($probe.timm)
                HasLycoris = [bool]($probe.'lycoris.wrapper')
                HasFlashAttention = [bool]($probe.flash_attn)
            }) | Out-Null
    }

    return @($targets)
}

function Select-NewbieRuntimeTarget {
    param(
        [object[]]$Targets,
        [string]$RequestedRuntimeName
    )

    if (-not $Targets -or $Targets.Count -eq 0) {
        throw "No installed embeddable runtime with .deps_installed marker was found."
    }

    $normalizedRequest = ([string]$RequestedRuntimeName).Trim().ToLowerInvariant()
    if (-not [string]::IsNullOrWhiteSpace($normalizedRequest)) {
        foreach ($target in $Targets) {
            $aliasNames = @($target.Name, $target.DirectoryName) + @(Get-RuntimeDirectoryNames -RuntimeName $target.Name)
            foreach ($alias in $aliasNames) {
                if (([string]$alias).Trim().ToLowerInvariant() -eq $normalizedRequest) {
                    return $target
                }
            }
        }

        throw "Requested runtime was not found among installed targets: $RequestedRuntimeName"
    }

    if ($Targets.Count -eq 1) {
        return $Targets[0]
    }

    $recommendedTarget = $Targets | Where-Object { $_.HasFlashAttention } | Select-Object -First 1
    if (-not $recommendedTarget) {
        $recommendedTarget = $Targets | Where-Object { $_.Name -eq "portable" } | Select-Object -First 1
    }
    if (-not $recommendedTarget) {
        $recommendedTarget = $Targets[0]
    }

    Write-Host
    Write-Host "Detected installed runtimes / 检测到已完成基础安装的运行时：" -ForegroundColor Cyan
    Write-Host

    for ($index = 0; $index -lt $Targets.Count; $index++) {
        $target = $Targets[$index]
        $recommendedSuffix = if ($target.DirectoryPath -eq $recommendedTarget.DirectoryPath) { " (Recommended)" } else { "" }
        $flashState = if ($target.HasFlashAttention) { "flash_attn=yes" } else { "flash_attn=no" }
        $newbieState = if ($target.NewbieMarkerExists -and $target.HasPeft -and $target.HasTorchdiffeq -and $target.HasTimm) { "newbie=installed" } else { "newbie=missing" }
        Write-Host ("[{0}] {1}{2}" -f ($index + 1), $target.Label, $recommendedSuffix) -ForegroundColor Green
        Write-Host ("    path={0}" -f $target.DirectoryPath) -ForegroundColor DarkGray
        Write-Host ("    {0} | {1}" -f $flashState, $newbieState) -ForegroundColor DarkGray
    }

    $defaultIndex = [Math]::Max(1, (([System.Array]::IndexOf($Targets, $recommendedTarget)) + 1))
    while ($true) {
        $answer = Read-Host "Select runtime [$defaultIndex]"
        if ([string]::IsNullOrWhiteSpace($answer)) {
            return $recommendedTarget
        }
        if ($answer -match '^\d+$') {
            $selectedIndex = [int]$answer - 1
            if ($selectedIndex -ge 0 -and $selectedIndex -lt $Targets.Count) {
                return $Targets[$selectedIndex]
            }
        }
        Write-Host "Invalid selection. Please enter 1-$($Targets.Count)." -ForegroundColor Yellow
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Install Newbie Runtime Support" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host
Write-Host "This script only installs Newbie support packages into an existing runtime." -ForegroundColor DarkGray
Write-Host "它不会新建专用 Newbie Python，只会给已完成基础安装的运行时补装 Newbie 支持。" -ForegroundColor DarkGray
Write-Host

$targets = Get-InstalledRuntimeTargets
$selectedTarget = Select-NewbieRuntimeTarget -Targets $targets -RequestedRuntimeName $RuntimeName

Write-Host
Write-Host ("Selected runtime: {0}" -f $selectedTarget.Label) -ForegroundColor Green
Write-Host ("Runtime path: {0}" -f $selectedTarget.DirectoryPath) -ForegroundColor DarkGray
Write-Host

$alreadyReady = $selectedTarget.HasPeft -and $selectedTarget.HasTorchdiffeq -and $selectedTarget.HasTimm -and $selectedTarget.HasLycoris
if ($alreadyReady -and -not $Force) {
    Write-Host -ForegroundColor Green "Newbie support packages already look complete in this runtime."
    if ($selectedTarget.HasFlashAttention) {
        Write-Host -ForegroundColor Green "flash_attn is also available in this runtime."
    }
    else {
        Write-Host -ForegroundColor Yellow "flash_attn is not available in this runtime."
        Write-Host -ForegroundColor Yellow "Current upstream Newbie model still hard-depends on flash_attn, so training is not directly usable here yet."
    }
    exit 0
}

$installArgs = @(
    "--upgrade",
    "--no-warn-script-location",
    "--prefer-binary"
) + $newbieSupportPackages

Invoke-Step "Installing Newbie support packages..." {
    Invoke-MirrorAwarePipInstall `
        -PythonExe $selectedTarget.PythonExe `
        -MirrorArgs $installArgs `
        -FallbackArgs $installArgs `
        -MirrorLabel "China PyPI mirror" `
        -FallbackLabel "official PyPI" | Out-Null
}

$postProbe = Get-NewbieRuntimeProbe -PythonExe $selectedTarget.PythonExe
if (-not $postProbe) {
    throw "Failed to probe runtime after installing Newbie support packages."
}

foreach ($moduleName in $requiredRuntimeModules) {
    if (-not [bool]$postProbe.$moduleName) {
        throw "Newbie support installation finished, but required module is still missing: $moduleName"
    }
}

$markerPayload = [ordered]@{
    runtime_name = $selectedTarget.Name
    runtime_label = $selectedTarget.Label
    runtime_path = $selectedTarget.DirectoryPath
    python_exe = $selectedTarget.PythonExe
    installed_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    packages = $newbieSupportPackages
    modules = [ordered]@{
        peft = [bool]$postProbe.peft
        torchdiffeq = [bool]$postProbe.torchdiffeq
        timm = [bool]$postProbe.timm
        lycoris_wrapper = [bool]$postProbe.'lycoris.wrapper'
        flash_attn = [bool]$postProbe.flash_attn
    }
}

$markerPayload | ConvertTo-Json | Set-Content -Path $selectedTarget.NewbieMarkerPath -Encoding UTF8

Write-Host
Write-Host -ForegroundColor Green "Newbie support packages are ready."
Write-Host -ForegroundColor Green ("Marker written: {0}" -f $selectedTarget.NewbieMarkerPath)
if (-not [bool]$postProbe.'lycoris.wrapper') {
    Write-Host -ForegroundColor Yellow "lycoris.wrapper is still unavailable. Newbie LoKr mode may not work in this runtime."
}
if (-not [bool]$postProbe.flash_attn) {
    Write-Host -ForegroundColor Yellow "flash_attn is not available in this runtime."
    Write-Host -ForegroundColor Yellow "Current upstream Newbie model still hard-depends on flash_attn, so this runtime now has the shared Newbie support packages, but cannot directly run Newbie training yet."
}
else {
    Write-Host -ForegroundColor Green "flash_attn is available in this runtime."
}
