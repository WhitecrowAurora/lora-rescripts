function Test-ROCmAmdRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected,
        [ref]$Message
    )

    $probe = Get-ROCmAmdRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        $Message.Value = "Could not probe AMD ROCm runtime details."
        return $false
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinor -and $probe.python_minor -ne $Expected.PythonMinor) {
        $issues.Add((Get-ConsoleText -Key 'issue_python_minor_mismatch' -Tokens @{ actual = $probe.python_minor; expected = $Expected.PythonMinor })) | Out-Null
    }
    if ($Expected.Torch -and $probe.torch_version -ne $Expected.Torch) {
        $issues.Add((Get-ConsoleText -Key 'issue_torch_mismatch' -Tokens @{ actual = $probe.torch_version; expected = $Expected.Torch })) | Out-Null
    }
    if ($Expected.TorchVision -and $probe.torchvision_version -ne $Expected.TorchVision) {
        $issues.Add((Get-ConsoleText -Key 'issue_torchvision_mismatch' -Tokens @{ actual = $probe.torchvision_version; expected = $Expected.TorchVision })) | Out-Null
    }
    if ($Expected.HipPrefix -and -not [string]::IsNullOrWhiteSpace($probe.hip_version) -and -not $probe.hip_version.StartsWith($Expected.HipPrefix)) {
        $issues.Add("HIP runtime is $($probe.hip_version), expected prefix $($Expected.HipPrefix)") | Out-Null
    }
    if (-not $probe.hip_available) {
        $issues.Add("Torch is not a ROCm build.") | Out-Null
    }
    if (-not $probe.cuda_available) {
        $issues.Add("ROCm GPU is not available to Torch.") | Out-Null
    }
    if ($probe.runtime_error) {
        $issues.Add($probe.runtime_error) | Out-Null
    }

    if ($issues.Count -gt 0) {
        $Message.Value = ($issues -join '; ')
        return $false
    }

    $Message.Value = Format-ROCmAmdRuntimeSummary -Probe $probe
    return $true
}

function Test-IntelXpuRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected,
        [ref]$Message
    )

    $probe = Get-IntelXpuRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        $Message.Value = "Could not probe Intel XPU runtime details."
        return $false
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinors -and $Expected.PythonMinors.Count -gt 0 -and $probe.python_minor -notin $Expected.PythonMinors) {
        $issues.Add((Get-ConsoleText -Key 'issue_python_minor_mismatch' -Tokens @{ actual = $probe.python_minor; expected = ($Expected.PythonMinors -join '/') })) | Out-Null
    }
    if ($Expected.Torch -and $probe.torch_version -ne $Expected.Torch) {
        $issues.Add((Get-ConsoleText -Key 'issue_torch_mismatch' -Tokens @{ actual = $probe.torch_version; expected = $Expected.Torch })) | Out-Null
    }
    if ($Expected.TorchVision -and $probe.torchvision_version -ne $Expected.TorchVision) {
        $issues.Add((Get-ConsoleText -Key 'issue_torchvision_mismatch' -Tokens @{ actual = $probe.torchvision_version; expected = $Expected.TorchVision })) | Out-Null
    }
    if (-not $probe.xpu_available) {
        $issues.Add("Intel XPU is not available to Torch.") | Out-Null
    }
    if ($probe.runtime_error) {
        $issues.Add($probe.runtime_error) | Out-Null
    }

    if ($issues.Count -gt 0) {
        $Message.Value = ($issues -join '; ')
        return $false
    }

    $Message.Value = Format-IntelXpuRuntimeSummary -Probe $probe
    return $true
}

function Test-IntelXpuSageRuntimeReady {
    param (
        [string]$PythonExe,
        [hashtable]$Expected,
        [ref]$Message
    )

    $probe = Get-IntelXpuSageRuntimeProbe -PythonExe $PythonExe
    if (-not $probe) {
        $Message.Value = "Could not probe Intel XPU Sage runtime details."
        return $false
    }

    $issues = New-Object System.Collections.Generic.List[string]
    if ($Expected.PythonMinors -and $Expected.PythonMinors.Count -gt 0 -and $probe.python_minor -notin $Expected.PythonMinors) {
        $issues.Add((Get-ConsoleText -Key 'issue_python_minor_mismatch' -Tokens @{ actual = $probe.python_minor; expected = ($Expected.PythonMinors -join '/') })) | Out-Null
    }
    if ($Expected.Torch -and $probe.torch_version -ne $Expected.Torch) {
        $issues.Add((Get-ConsoleText -Key 'issue_torch_mismatch' -Tokens @{ actual = $probe.torch_version; expected = $Expected.Torch })) | Out-Null
    }
    if ($Expected.TorchVision -and $probe.torchvision_version -ne $Expected.TorchVision) {
        $issues.Add((Get-ConsoleText -Key 'issue_torchvision_mismatch' -Tokens @{ actual = $probe.torchvision_version; expected = $Expected.TorchVision })) | Out-Null
    }
    if ($Expected.SageAttention -and $probe.sageattention_version -ne $Expected.SageAttention) {
        $issues.Add((Get-ConsoleText -Key 'issue_sageattention_mismatch' -Tokens @{ actual = $probe.sageattention_version; expected = $Expected.SageAttention })) | Out-Null
    }
    if ($Expected.Triton -and $probe.triton_version -ne $Expected.Triton) {
        $issues.Add((Get-ConsoleText -Key 'issue_triton_mismatch' -Tokens @{ actual = $probe.triton_version; expected = $Expected.Triton })) | Out-Null
    }
    if (-not $probe.xpu_available) {
        $issues.Add("Intel XPU is not available to Torch.") | Out-Null
    }
    if (-not $probe.triton_import_ok) {
        $issues.Add("Triton is not importable in the Intel XPU Sage runtime.") | Out-Null
    }
    if (-not $probe.sageattention_import_ok -or -not $probe.sageattention_symbols_ok) {
        $issues.Add("SageAttention is not importable in the Intel XPU Sage runtime.") | Out-Null
    }
    if ($probe.runtime_error) {
        $issues.Add($probe.runtime_error) | Out-Null
    }

    if ($issues.Count -gt 0) {
        $Message.Value = ($issues -join '; ')
        return $false
    }

    $Message.Value = Format-IntelXpuSageRuntimeSummary -Probe $probe
    return $true
}

function Get-SelectedRuntimeValidationState {
    param (
        [string]$PythonExe,
        [string]$RuntimeName,
        [string[]]$MainModules,
        [hashtable]$FlashAttentionExpected,
        [hashtable]$BlackwellExpected,
        [hashtable]$SageAttentionExpected,
        [hashtable]$IntelXpuExpected,
        [hashtable]$IntelXpuSageExpected,
        [hashtable]$ROCmAmdExpected
    )

    $state = @{
        MainModulesReady = Test-ModulesReady -PythonExe $PythonExe -Modules $MainModules
        FlashAttentionRuntimeReady = $true
        FlashAttentionRuntimeMessage = ""
        BlackwellXformersReady = $true
        BlackwellRuntimeMessage = ""
        SageAttentionRuntimeReady = $true
        SageAttentionRuntimeMessage = ""
        IntelXpuRuntimeReady = $true
        IntelXpuRuntimeMessage = ""
        IntelXpuSageRuntimeReady = $true
        IntelXpuSageRuntimeMessage = ""
        ROCmAmdRuntimeReady = $true
        ROCmAmdRuntimeMessage = ""
    }

    switch ($RuntimeName) {
        "flashattention" {
            $message = ""
            $state.FlashAttentionRuntimeReady = Test-FlashAttentionRuntimeReady -PythonExe $PythonExe -Expected $FlashAttentionExpected -Message ([ref]$message)
            $state.FlashAttentionRuntimeMessage = $message
        }
        "blackwell" {
            $message = ""
            $state.BlackwellXformersReady = Test-BlackwellRuntimeReady -PythonExe $PythonExe -Expected $BlackwellExpected -Message ([ref]$message)
            $state.BlackwellRuntimeMessage = $message
        }
        "sageattention" {
            $message = ""
            $state.SageAttentionRuntimeReady = Test-SageAttentionRuntimeReady -PythonExe $PythonExe -Expected $SageAttentionExpected -RuntimeDirName $sageAttentionRuntimeDirName -Message ([ref]$message)
            $state.SageAttentionRuntimeMessage = $message
        }
        "sageattention2" {
            $message = ""
            $state.SageAttentionRuntimeReady = Test-SageAttentionRuntimeReady -PythonExe $PythonExe -Expected $SageAttentionExpected -RuntimeDirName $sageAttention2RuntimeDirName -Message ([ref]$message)
            $state.SageAttentionRuntimeMessage = $message
        }
        "intel-xpu" {
            $message = ""
            $state.IntelXpuRuntimeReady = Test-IntelXpuRuntimeReady -PythonExe $PythonExe -Expected $IntelXpuExpected -Message ([ref]$message)
            $state.IntelXpuRuntimeMessage = $message
        }
        "intel-xpu-sage" {
            $message = ""
            $state.IntelXpuSageRuntimeReady = Test-IntelXpuSageRuntimeReady -PythonExe $PythonExe -Expected $IntelXpuSageExpected -Message ([ref]$message)
            $state.IntelXpuSageRuntimeMessage = $message
        }
        "rocm-amd" {
            $message = ""
            $state.ROCmAmdRuntimeReady = Test-ROCmAmdRuntimeReady -PythonExe $PythonExe -Expected $ROCmAmdExpected -Message ([ref]$message)
            $state.ROCmAmdRuntimeMessage = $message
        }
    }

    return $state
}

function Test-SelectedRuntimeBootstrapReady {
    param (
        [string]$DepsMarker,
        [hashtable]$State
    )

    return (
        (Test-Path $DepsMarker) `
        -and $State.MainModulesReady `
        -and $State.FlashAttentionRuntimeReady `
        -and $State.BlackwellXformersReady `
        -and $State.SageAttentionRuntimeReady `
        -and $State.IntelXpuRuntimeReady `
        -and $State.IntelXpuSageRuntimeReady `
        -and $State.ROCmAmdRuntimeReady
    )
}
