param(
    [Parameter(Mandatory = $true)]
    [string]$RepoRoot,
    [string]$RequestedTarget = "python"
)

$repoRootPath = [System.IO.Path]::GetFullPath($RepoRoot)
$requested = ([string]$RequestedTarget).Trim().Replace("/", "\")
if ([string]::IsNullOrWhiteSpace($requested)) {
    $requested = "python"
}
if ($requested.StartsWith(".\")) {
    $requested = $requested.Substring(2)
}

if ($requested -like "env\*") {
    Write-Output $requested
    exit 0
}

. (Join-Path $PSScriptRoot "runtime_paths.ps1")

$requestedKey = $requested.ToLowerInvariant()
$aliasMap = @{
    "python" = @{ Preferred = "python"; Names = @("python") }
    "python_tageditor" = @{ Preferred = "python_tageditor"; Names = @("python_tageditor") }
    "python_blackwell" = @{ Preferred = "python_blackwell"; Names = @("python_blackwell") }
    "python_xpu_intel" = @{ Preferred = "python_xpu_intel"; Names = @("python_xpu_intel") }
    "python_xpu_intel_sage" = @{ Preferred = "python_xpu_intel_sage"; Names = @("python_xpu_intel_sage") }
    "python_rocm_amd" = @{ Preferred = "python_rocm_amd"; Names = @("python_rocm_amd") }
    "python-sageattention" = @{ Preferred = "python-sageattention"; Names = @("python-sageattention", "python_sageattention") }
    "python_sageattention" = @{ Preferred = "python-sageattention"; Names = @("python-sageattention", "python_sageattention") }
    "python-sageattention2" = @{ Preferred = "python-sageattention2"; Names = @("python-sageattention2", "python_sageattention2") }
    "python_sageattention2" = @{ Preferred = "python-sageattention2"; Names = @("python-sageattention2", "python_sageattention2") }
    "python_sagebwd_nvidia" = @{ Preferred = "python_sagebwd_nvidia"; Names = @("python_sagebwd_nvidia", "python-sagebwd-nvidia") }
    "python-sagebwd-nvidia" = @{ Preferred = "python_sagebwd_nvidia"; Names = @("python_sagebwd_nvidia", "python-sagebwd-nvidia") }
}

$entry = $aliasMap[$requestedKey]
$directoryNames = if ($entry) { @($entry.Names) } else { @($requested) }
$preferredDirectoryName = if ($entry) { [string]$entry.Preferred } else { [string]$requested }
$runtimeInfo = Resolve-RuntimeDirectoryInfo -RepoRoot $repoRootPath -RuntimeName $requestedKey -DirectoryNames $directoryNames -PreferredDirectoryName $preferredDirectoryName

$relativePath = $runtimeInfo.DirectoryPath.Substring($repoRootPath.Length).TrimStart("\", "/")
Write-Output ($relativePath -replace "/", "\")
