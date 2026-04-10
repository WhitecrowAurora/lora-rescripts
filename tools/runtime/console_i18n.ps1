$script:ConsoleLanguage = $null
$script:ConsoleTextTable = @{
    en = @{
        launcher_unknown_profile = 'Unknown launch profile: {id}'
        launcher_manual_requires_interactive = 'Manual startup requires an interactive PowerShell console.'
        launcher_title = 'Lora-Rescripts Startup Selector'
        launcher_profile_menu_hint = 'Use Up/Down to move, Enter to confirm, Esc to cancel.'
        launcher_language_title = 'Console Language'
        launcher_language_menu_hint = 'Select the console language first. Use Up/Down to move, Enter to confirm, Esc to cancel.'
        launcher_cancelled = 'Startup cancelled by user.'
        launcher_selected_language = 'Console language: {language}'
        launcher_selected_profile = 'Selected startup profile: {profile}'
        launcher_attention_prefer_sage = 'Attention policy: default to SageAttention when the route supports it.'
        launcher_attention_force_sdpa = 'Attention policy: force SDPA only.'
        launcher_attention_keep_default = 'Attention policy: keep route defaults.'
        launcher_profile_auto_label = 'Auto (Recommended)'
        launcher_profile_auto_description = 'Prefer the SageAttention runtime; fall back to the standard runtime when SageAttention is not installed.'
        launcher_profile_sageattention_label = 'SageAttention'
        launcher_profile_sageattention_description = 'Use the SageAttention runtime and switch the default training attention backend to SageAttention.'
        launcher_profile_sageattention2_label = 'SageAttention2'
        launcher_profile_sageattention2_description = 'Use the dedicated SageAttention 2.2 runtime and switch the default training attention backend to SageAttention.'
        launcher_profile_flashattention_label = 'FlashAttention'
        launcher_profile_flashattention_description = 'Use the dedicated FlashAttention runtime. Supported routes can auto-prefer FlashAttention 2, and you can still force the flash backend per route when needed.'
        launcher_profile_standard_label = 'Standard'
        launcher_profile_standard_description = 'Use the standard runtime; prefer xformers and fall back to SDPA when needed.'
        launcher_profile_safe_sdpa_label = 'Safe Mode (SDPA Only)'
        launcher_profile_safe_sdpa_description = 'Disable SageAttention and xformers, then use SDPA only for compatibility checks.'
        launcher_profile_blackwell_label = 'Blackwell Runtime (Experimental)'
        launcher_profile_blackwell_description = 'Use the dedicated Blackwell runtime and keep the Blackwell xformers startup patch.'
        language_display_auto = 'System default'
        language_display_en = 'English'
        language_display_ja = 'Japanese'
        language_display_zh = 'Chinese'
        runtime_flashattention = 'FlashAttention'
        runtime_flashattention_python = 'FlashAttention experimental Python'
        runtime_blackwell = 'Blackwell'
        runtime_blackwell_python = 'Blackwell experimental Python'
        runtime_sageattention = 'SageAttention'
        runtime_sageattention_python = 'SageAttention experimental Python'
        runtime_sageattention2 = 'SageAttention2'
        runtime_sageattention2_python = 'SageAttention2 experimental Python'
        runtime_portable = 'Portable Python'
        runtime_portable_python = 'portable Python'
        runtime_venv = 'Project virtual environment'
        runtime_venv_python = 'project virtual environment'
        runtime_main = 'Main runtime'
        exclusive_runtime_preference_error = 'Only one dedicated runtime can be preferred at a time. Clear MIKAZUKI_PREFERRED_RUNTIME or choose flashattention / blackwell / sageattention / sageattention2.'
        cache_enabled_header = 'Persistent compile cache enabled for {runtime} runtime:'
        runtime_not_ready = '{runtime} runtime is not ready yet: {detail}'
        install_runtime_dependencies = '{runtime} dependencies are not installed yet. Running {script}...'
        install_main_dependencies = 'Project dependencies are not installed yet. Running install.ps1...'
        dependency_install_failed_with_runtime = 'Dependency installation failed. {runtime} runtime is still not ready: {detail}'
        dependency_install_failed = 'Dependency installation failed.'
        runtime_check_passed = '{runtime} runtime check passed: {detail}'
        probe_runtime_details_failed = 'Could not probe {runtime} runtime details.'
        issue_python_minor_mismatch = 'Python minor is {actual}, expected {expected}'
        issue_torch_mismatch = 'Torch is {actual}, expected {expected}'
        issue_torchvision_mismatch = 'TorchVision is {actual}, expected {expected}'
        issue_xformers_mismatch = 'xformers is {actual}, expected {expected}'
        issue_flashattention_mismatch = 'flash-attn is {actual}, expected {expected}'
        issue_sageattention_mismatch = 'sageattention is {actual}, expected {expected}'
        issue_triton_mismatch = 'triton is {actual}, expected {expected}'
        issue_cuda_unavailable = 'CUDA is not available'
        issue_xformers_import_failed = 'xformers import or ops binding check failed'
        issue_flash_import_failed = 'flash-attn import or runtime check failed'
        issue_triton_import_failed = 'triton import failed'
        issue_sage_import_failed = 'sageattention import or symbol check failed'
        issue_sage_symbols_missing = 'sageattention import succeeded but required symbols are missing'
        issue_sage_native_extension_failed = 'sageattention native extension failed to load (_fused). This usually means the installed SageAttention wheel does not match the current Torch/CUDA runtime stack, or the Microsoft Visual C++ x64 runtime is missing. On Windows this is commonly a binary compatibility issue, especially for SageAttention 2.x wheels.'
        runtime_summary_flashattention = 'Python {python}; Torch {torch}; TorchVision {torchvision}; FlashAttention {flashattention}'
        runtime_summary_blackwell = 'Python {python}; Torch {torch}; TorchVision {torchvision}; xformers {xformers}'
        runtime_summary_sage = 'Python {python}; Torch {torch}; TorchVision {torchvision}; Triton {triton}; SageAttention {sageattention}'
        missing_dedicated_runtime = @"
{runtime} startup was requested, but the dedicated runtime is missing.

Expected:
- {expected_path}

Recommended fix:
1. Extract a Python {python_minor} embeddable package into .\{runtime_dir}
2. Run {rerun_script} again
"@
        using_runtime_python = 'Using {runtime}...'
        runtime_python_not_initialized = '{runtime_dir} is not initialized yet. Running setup_embeddable_python.bat...'
        runtime_python_incomplete = '{runtime} is incomplete: pip is not available.'
        portable_python_incomplete = 'Portable Python is incomplete: pip is not available. Repair or replace the bundled python folder first.'
        venv_python_incomplete = 'Project virtual environment is incomplete: pip is not available. Repair or recreate .\venv first.'
        bootstrap_project_local_python = 'No project-local Python found. MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 is set, bootstrapping a project-local venv via install.ps1...'
        bootstrap_project_local_python_failed = 'Failed to bootstrap a project-local Python environment.'
        bootstrap_project_local_python_missing_after_install = 'install.ps1 finished, but no project-local Python environment was created.'
        no_project_local_python_found = @"
No project-local Python environment was found.

This build is locked to project-local Python by default to avoid leaking installs into the host machine.

Expected one of:
- {portable_path}
- {venv_path}

Recommended fix:
1. Bundle a ready-to-run portable Python in .\python
2. Or create a project-local venv in .\venv for development

Developer override:
- Set MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 and rerun to bootstrap a project-local venv intentionally.
"@
        runtime_startup_blackwell_patch_check = 'Blackwell startup mode enabled. Checking xformers FA3 compatibility...'
        runtime_startup_blackwell_patch_warning = 'Blackwell xformers patch step reported a warning. Continuing startup...'
        startup_mode_flashattention = 'FlashAttention startup mode enabled. Supported routes can now auto-prefer FlashAttention 2 in this runtime; you can still switch the route config manually if needed.'
        startup_mode_sageattention = 'SageAttention startup mode enabled. This runtime prepares SageAttention only; enable sageattn manually on supported routes.'
        startup_mode_sageattention2 = 'SageAttention2 startup mode enabled. This runtime prepares the dedicated SageAttention 2.2 environment; enable sageattn manually on supported routes when needed.'
        tag_editor_python_incomplete = 'Tag editor Python is incomplete: pip is not available.'
        tag_editor_dependencies_installing = 'Tag editor dependencies are missing or incompatible. Running install_tageditor.ps1...'
        tag_editor_dependency_install_failed = 'Tag editor dependency installation failed.'
    }
    zh = @{
        launcher_unknown_profile = '未知的启动配置：{id}'
        launcher_manual_requires_interactive = '手动启动模式需要可交互的 PowerShell 控制台。'
        launcher_title = 'Lora-Rescripts 启动配置选择'
        launcher_profile_menu_hint = '使用上下方向键移动，按回车确认，按 Esc 取消。'
        launcher_language_title = '控制台语言'
        launcher_language_menu_hint = '请先选择控制台语言。使用上下方向键移动，按回车确认，按 Esc 取消。'
        launcher_cancelled = '用户已取消启动。'
        launcher_selected_language = '控制台语言：{language}'
        launcher_selected_profile = '已选择启动配置：{profile}'
        launcher_attention_prefer_sage = 'Attention 策略：在支持的训练路线中默认优先使用 SageAttention。'
        launcher_attention_force_sdpa = 'Attention 策略：强制仅使用 SDPA。'
        launcher_attention_keep_default = 'Attention 策略：保持各训练路线的默认设置。'
        launcher_profile_auto_label = '自动（推荐）'
        launcher_profile_auto_description = '优先使用 SageAttention 运行时；如果本机没有安装 SageAttention 运行时，则回退到标准运行时。'
        launcher_profile_sageattention_label = 'SageAttention'
        launcher_profile_sageattention_description = '使用 SageAttention 运行时，并把训练默认 attention 后端切换到 SageAttention。'
        launcher_profile_sageattention2_label = 'SageAttention2'
        launcher_profile_sageattention2_description = '使用独立的 SageAttention 2.2 运行时，并把训练默认 attention 后端切换到 SageAttention。'
        launcher_profile_flashattention_label = 'FlashAttention'
        launcher_profile_flashattention_description = '使用 FlashAttention 专用运行时。支持的训练路线现在可以在这个运行时里自动优先尝试 FlashAttention 2；如有需要也可以继续手动指定后端。'
        launcher_profile_standard_label = '标准'
        launcher_profile_standard_description = '使用标准运行时；优先使用 xformers，不支持时自动回退到 SDPA。'
        launcher_profile_safe_sdpa_label = '安全模式（仅 SDPA）'
        launcher_profile_safe_sdpa_description = '禁用 SageAttention 和 xformers，全程仅使用 SDPA，适合兼容性排查。'
        launcher_profile_blackwell_label = 'Blackwell 运行时（实验性）'
        launcher_profile_blackwell_description = '使用 Blackwell 专用运行时，并保留 Blackwell xformers 启动补丁。'
        language_display_auto = '跟随系统'
        language_display_en = '英文'
        language_display_ja = '日文'
        language_display_zh = '中文'
        runtime_flashattention = 'FlashAttention'
        runtime_flashattention_python = 'FlashAttention 实验运行时 Python'
        runtime_blackwell = 'Blackwell'
        runtime_blackwell_python = 'Blackwell 实验运行时 Python'
        runtime_sageattention = 'SageAttention'
        runtime_sageattention_python = 'SageAttention 实验运行时 Python'
        runtime_sageattention2 = 'SageAttention2'
        runtime_sageattention2_python = 'SageAttention2 实验运行时 Python'
        runtime_portable = '便携版 Python'
        runtime_portable_python = '便携版 Python'
        runtime_venv = '项目虚拟环境'
        runtime_venv_python = '项目虚拟环境'
        runtime_main = '主运行时'
        exclusive_runtime_preference_error = '同一时间只能指定一个专用运行时。请清理 MIKAZUKI_PREFERRED_RUNTIME，或在 flashattention / blackwell / sageattention / sageattention2 中只保留一个。'
        cache_enabled_header = '已为 {runtime} 运行时启用持久化编译缓存：'
        runtime_not_ready = '{runtime} 运行时尚未就绪：{detail}'
        install_runtime_dependencies = '{runtime} 依赖尚未安装，正在运行 {script}...'
        install_main_dependencies = '项目依赖尚未安装，正在运行 install.ps1...'
        dependency_install_failed_with_runtime = '依赖安装失败。{runtime} 运行时仍未就绪：{detail}'
        dependency_install_failed = '依赖安装失败。'
        runtime_check_passed = '{runtime} 运行时检查通过：{detail}'
        probe_runtime_details_failed = '无法获取 {runtime} 运行时详情。'
        issue_python_minor_mismatch = 'Python 次版本为 {actual}，预期为 {expected}'
        issue_torch_mismatch = 'Torch 版本为 {actual}，预期为 {expected}'
        issue_torchvision_mismatch = 'TorchVision 版本为 {actual}，预期为 {expected}'
        issue_xformers_mismatch = 'xformers 版本为 {actual}，预期为 {expected}'
        issue_flashattention_mismatch = 'flash-attn 版本为 {actual}，预期为 {expected}'
        issue_sageattention_mismatch = 'sageattention 版本为 {actual}，预期为 {expected}'
        issue_triton_mismatch = 'triton 版本为 {actual}，预期为 {expected}'
        issue_cuda_unavailable = 'CUDA 不可用'
        issue_xformers_import_failed = 'xformers 导入或算子绑定检查失败'
        issue_flash_import_failed = 'flash-attn 导入或运行时检查失败'
        issue_triton_import_failed = 'triton 导入失败'
        issue_sage_import_failed = 'sageattention 导入或符号检查失败'
        issue_sage_symbols_missing = 'sageattention 导入成功，但缺少必需符号'
        issue_sage_native_extension_failed = 'sageattention 原生扩展加载失败（_fused）。这通常表示已安装的 SageAttention wheel 与当前 Torch/CUDA 运行时栈不匹配，或者系统缺少 Microsoft Visual C++ x64 运行库。在 Windows 下，这通常属于二进制兼容性问题，尤其常见于 SageAttention 2.x wheel。'
        runtime_summary_flashattention = 'Python {python}；Torch {torch}；TorchVision {torchvision}；FlashAttention {flashattention}'
        runtime_summary_blackwell = 'Python {python}；Torch {torch}；TorchVision {torchvision}；xformers {xformers}'
        runtime_summary_sage = 'Python {python}；Torch {torch}；TorchVision {torchvision}；Triton {triton}；SageAttention {sageattention}'
        missing_dedicated_runtime = @"
已请求使用 {runtime} 启动，但缺少对应的专用运行时。

期望路径：
- {expected_path}

建议修复：
1. 将 Python {python_minor} embeddable 包解压到 .\{runtime_dir}
2. 重新运行 {rerun_script}
"@
        using_runtime_python = '正在使用{runtime}...'
        runtime_python_not_initialized = '{runtime_dir} 尚未初始化，正在运行 setup_embeddable_python.bat...'
        runtime_python_incomplete = '{runtime}不完整：缺少可用的 pip。'
        portable_python_incomplete = '便携版 Python 不完整：缺少可用的 pip。请先修复或替换内置的 python 目录。'
        venv_python_incomplete = '项目虚拟环境不完整：缺少可用的 pip。请先修复或重新创建 .\venv。'
        bootstrap_project_local_python = '未找到项目本地 Python。检测到 MIKAZUKI_ALLOW_SYSTEM_PYTHON=1，正在通过 install.ps1 引导创建项目本地 venv...'
        bootstrap_project_local_python_failed = '引导创建项目本地 Python 环境失败。'
        bootstrap_project_local_python_missing_after_install = 'install.ps1 已执行完成，但仍未创建项目本地 Python 环境。'
        no_project_local_python_found = @"
未找到项目本地 Python 环境。

为避免把依赖泄漏到宿主系统，这个构建默认锁定为仅允许使用项目本地 Python。

期望路径之一：
- {portable_path}
- {venv_path}

建议修复：
1. 在 .\python 中放入可直接运行的便携版 Python
2. 或者在 .\venv 中创建项目本地虚拟环境，供开发使用

开发者覆盖方式：
- 设置 MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 后重新运行，用于有意引导创建项目本地 venv。
"@
        runtime_startup_blackwell_patch_check = '已启用 Blackwell 启动模式，正在检查 xformers FA3 兼容性...'
        runtime_startup_blackwell_patch_warning = 'Blackwell xformers 补丁步骤返回警告，启动将继续。'
        startup_mode_flashattention = '已启用 FlashAttention 启动模式。支持的训练路线现在会在这个运行时里自动优先尝试 FlashAttention 2；如有需要仍可手动切换路线后端。'
        startup_mode_sageattention = '已启用 SageAttention 启动模式。这个运行时只负责准备 SageAttention 环境；支持的训练路线仍需手动启用 sageattn。'
        startup_mode_sageattention2 = '已启用 SageAttention2 启动模式。这个运行时只负责准备独立的 SageAttention 2.2 环境；如有需要请在支持的训练路线里手动启用 sageattn。'
        tag_editor_python_incomplete = 'Tag Editor の Python 環境が不完全です: 利用可能な pip がありません。'
        tag_editor_dependencies_installing = 'Tag Editor 依赖缺失或版本不兼容，正在运行 install_tageditor.ps1...'
        tag_editor_dependency_install_failed = 'Tag Editor 依赖安装失败。'
    }
    ja = @{
        launcher_unknown_profile = '不明な起動プロファイルです: {id}'
        launcher_manual_requires_interactive = '手動起動モードには対話可能な PowerShell コンソールが必要です。'
        launcher_title = 'Lora-Rescripts 起動プロファイル選択'
        launcher_profile_menu_hint = '上下キーで移動し、Enter で確定、Esc でキャンセルします。'
        launcher_language_title = 'コンソール言語'
        launcher_language_menu_hint = '先にコンソール言語を選択してください。上下キーで移動し、Enter で確定、Esc でキャンセルします。'
        launcher_cancelled = 'ユーザーによって起動がキャンセルされました。'
        launcher_selected_language = 'コンソール言語: {language}'
        launcher_selected_profile = '選択した起動プロファイル: {profile}'
        launcher_attention_prefer_sage = 'Attention ポリシー: 対応ルートでは既定で SageAttention を優先します。'
        launcher_attention_force_sdpa = 'Attention ポリシー: SDPA のみを強制します。'
        launcher_attention_keep_default = 'Attention ポリシー: ルート既定の設定を維持します。'
        launcher_profile_auto_label = '自動（推奨）'
        launcher_profile_auto_description = 'SageAttention ランタイムを優先し、見つからない場合は標準ランタイムへ戻します。'
        launcher_profile_sageattention_label = 'SageAttention'
        launcher_profile_sageattention_description = 'SageAttention ランタイムを使用し、学習時の既定 attention バックエンドを SageAttention に切り替えます。'
        launcher_profile_sageattention2_label = 'SageAttention2'
        launcher_profile_sageattention2_description = 'SageAttention 2.2 専用ランタイムを使用し、学習時の既定 attention バックエンドを SageAttention に切り替えます。'
        launcher_profile_flashattention_label = 'FlashAttention'
        launcher_profile_flashattention_description = 'FlashAttention 専用ランタイムを使用します。対応ルートではこのランタイム上で FlashAttention 2 を自動優先でき、必要に応じて個別に手動指定もできます。'
        launcher_profile_standard_label = '標準'
        launcher_profile_standard_description = '標準ランタイムを使用し、まず xformers を試し、必要に応じて SDPA にフォールバックします。'
        launcher_profile_safe_sdpa_label = 'セーフモード（SDPA のみ）'
        launcher_profile_safe_sdpa_description = 'SageAttention と xformers を無効化し、互換性確認のため SDPA のみを使用します。'
        launcher_profile_blackwell_label = 'Blackwell ランタイム（実験的）'
        launcher_profile_blackwell_description = 'Blackwell 専用ランタイムを使用し、Blackwell xformers 起動パッチを維持します。'
        language_display_auto = 'システム既定'
        language_display_en = '英語'
        language_display_ja = '日本語'
        language_display_zh = '中国語'
        runtime_flashattention = 'FlashAttention'
        runtime_flashattention_python = 'FlashAttention 実験ランタイム Python'
        runtime_blackwell = 'Blackwell'
        runtime_blackwell_python = 'Blackwell 実験ランタイム Python'
        runtime_sageattention = 'SageAttention'
        runtime_sageattention_python = 'SageAttention 実験ランタイム Python'
        runtime_sageattention2 = 'SageAttention2'
        runtime_sageattention2_python = 'SageAttention2 実験ランタイム Python'
        runtime_portable = 'ポータブル Python'
        runtime_portable_python = 'ポータブル Python'
        runtime_venv = 'プロジェクト仮想環境'
        runtime_venv_python = 'プロジェクト仮想環境'
        runtime_main = 'メインランタイム'
        exclusive_runtime_preference_error = '専用ランタイムは同時に 1 つだけ指定できます。MIKAZUKI_PREFERRED_RUNTIME を消去するか、flashattention / blackwell / sageattention / sageattention2 のどれか 1 つだけを指定してください。'
        cache_enabled_header = '{runtime} ランタイムで永続コンパイルキャッシュを有効にしました:'
        runtime_not_ready = '{runtime} ランタイムはまだ準備できていません: {detail}'
        install_runtime_dependencies = '{runtime} の依存関係が未導入です。{script} を実行します...'
        install_main_dependencies = 'プロジェクト依存関係が未導入です。install.ps1 を実行します...'
        dependency_install_failed_with_runtime = '依存関係の導入に失敗しました。{runtime} ランタイムはまだ準備できていません: {detail}'
        dependency_install_failed = '依存関係の導入に失敗しました。'
        runtime_check_passed = '{runtime} ランタイムの確認に成功しました: {detail}'
        probe_runtime_details_failed = '{runtime} ランタイムの詳細を取得できませんでした。'
        issue_python_minor_mismatch = 'Python のマイナーバージョンは {actual} ですが、期待値は {expected} です'
        issue_torch_mismatch = 'Torch のバージョンは {actual} ですが、期待値は {expected} です'
        issue_torchvision_mismatch = 'TorchVision のバージョンは {actual} ですが、期待値は {expected} です'
        issue_xformers_mismatch = 'xformers のバージョンは {actual} ですが、期待値は {expected} です'
        issue_flashattention_mismatch = 'flash-attn は {actual} ですが、期待値は {expected} です'
        issue_sageattention_mismatch = 'sageattention のバージョンは {actual} ですが、期待値は {expected} です'
        issue_triton_mismatch = 'triton のバージョンは {actual} ですが、期待値は {expected} です'
        issue_cuda_unavailable = 'CUDA が利用できません'
        issue_xformers_import_failed = 'xformers の読み込みまたは演算子バインド確認に失敗しました'
        issue_flash_import_failed = 'flash-attn の読み込みまたはランタイム確認に失敗しました'
        issue_triton_import_failed = 'triton の読み込みに失敗しました'
        issue_sage_import_failed = 'sageattention の読み込みまたはシンボル確認に失敗しました'
        issue_sage_symbols_missing = 'sageattention の読み込みには成功しましたが、必要なシンボルが不足しています'
        issue_sage_native_extension_failed = 'sageattention のネイティブ拡張の読み込みに失敗しました（_fused）。通常は、インストール済みの SageAttention wheel が現在の Torch/CUDA ランタイム構成と一致していないか、Microsoft Visual C++ x64 ランタイムが不足しています。Windows では、特に SageAttention 2.x wheel で起きやすいバイナリ互換性の問題です。'
        runtime_summary_flashattention = 'Python {python}; Torch {torch}; TorchVision {torchvision}; FlashAttention {flashattention}'
        runtime_summary_blackwell = 'Python {python}; Torch {torch}; TorchVision {torchvision}; xformers {xformers}'
        runtime_summary_sage = 'Python {python}; Torch {torch}; TorchVision {torchvision}; Triton {triton}; SageAttention {sageattention}'
        missing_dedicated_runtime = @"
{runtime} 起動が要求されましたが、対応する専用ランタイムが見つかりません。

想定パス:
- {expected_path}

推奨される対処:
1. Python {python_minor} の embeddable package を .\{runtime_dir} に展開してください
2. {rerun_script} をもう一度実行してください
"@
        using_runtime_python = '{runtime} を使用します...'
        runtime_python_not_initialized = '{runtime_dir} はまだ初期化されていません。setup_embeddable_python.bat を実行します...'
        runtime_python_incomplete = '{runtime} が不完全です: 利用可能な pip がありません。'
        portable_python_incomplete = 'ポータブル Python が不完全です: 利用可能な pip がありません。まず同梱の python フォルダーを修復または置き換えてください。'
        venv_python_incomplete = 'プロジェクト仮想環境が不完全です: 利用可能な pip がありません。まず .\venv を修復または再作成してください。'
        bootstrap_project_local_python = 'プロジェクト内の Python が見つかりません。MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 が設定されているため、install.ps1 でプロジェクト用 venv を作成します...'
        bootstrap_project_local_python_failed = 'プロジェクト用 Python 環境の作成に失敗しました。'
        bootstrap_project_local_python_missing_after_install = 'install.ps1 は完了しましたが、プロジェクト用 Python 環境は作成されませんでした。'
        no_project_local_python_found = @"
プロジェクト内の Python 環境が見つかりません。

このビルドは、依存関係がホスト環境へ漏れるのを避けるため、既定でプロジェクト内 Python のみを使用します。

想定されるパス:
- {portable_path}
- {venv_path}

推奨される対処:
1. .\python にすぐ実行できるポータブル Python を配置してください
2. または開発用に .\venv にプロジェクト内仮想環境を作成してください

開発者向け上書き:
- MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 を設定して再実行すると、意図的にプロジェクト用 venv の作成を試みます。
"@
        runtime_startup_blackwell_patch_check = 'Blackwell 起動モードが有効です。xformers FA3 の互換性を確認しています...'
        runtime_startup_blackwell_patch_warning = 'Blackwell xformers パッチ手順で警告が出ましたが、起動は続行します。'
        startup_mode_flashattention = 'FlashAttention 起動モードが有効です。対応ルートではこのランタイム上で FlashAttention 2 を自動優先できますが、必要ならルート側の設定で手動切り替えも可能です。'
        startup_mode_sageattention = 'SageAttention 起動モードが有効です。このランタイムは SageAttention 環境の準備のみを行います。対応ルートでは sageattn を手動で有効化してください。'
        startup_mode_sageattention2 = 'SageAttention2 起動モードが有効です。このランタイムは SageAttention 2.2 専用環境の準備のみを行います。必要に応じて対応ルート側で sageattn を手動有効化してください。'
        tag_editor_python_incomplete = 'Tag Editor の Python 環境が不完全です: 利用可能な pip がありません。'
        tag_editor_dependencies_installing = 'Tag Editor の依存関係が不足しているか、互換性がありません。install_tageditor.ps1 を実行します...'
        tag_editor_dependency_install_failed = 'Tag Editor の依存関係の導入に失敗しました。'
    }
}

function ConvertTo-ConsoleLanguage {
    param(
        [string]$Language
    )

    $normalized = ([string]$Language).Trim().ToLowerInvariant()
    if ([string]::IsNullOrWhiteSpace($normalized)) {
        return 'auto'
    }

    switch -Regex ($normalized) {
        '^(auto|system|default)$' { return 'auto' }
        '^(zh|zh-cn|zh-sg|zh-hans|zh-hant|chs|cht|cn|chinese)$' { return 'zh' }
        '^(ja|ja-jp|jp|japanese)$' { return 'ja' }
        '^(en|en-us|en-gb|english)$' { return 'en' }
        default { return 'en' }
    }
}

function Get-SystemConsoleLanguage {
    $cultureName = [System.Globalization.CultureInfo]::CurrentUICulture.Name
    if ($cultureName -like 'zh*') {
        return 'zh'
    }
    if ($cultureName -like 'ja*') {
        return 'ja'
    }
    return 'en'
}

function Resolve-ConsoleLanguage {
    param(
        [string]$RequestedLanguage = 'auto'
    )

    $normalized = ConvertTo-ConsoleLanguage -Language $RequestedLanguage
    if ($normalized -eq 'auto') {
        return Get-SystemConsoleLanguage
    }
    return $normalized
}

function Set-ConsoleLanguage {
    param(
        [string]$Language = 'auto'
    )

    $resolved = Resolve-ConsoleLanguage -RequestedLanguage $Language
    $script:ConsoleLanguage = $resolved
    $Env:MIKAZUKI_CONSOLE_LANG = $resolved
    return $resolved
}

function Get-ConsoleLanguage {
    if ([string]::IsNullOrWhiteSpace($script:ConsoleLanguage)) {
        $requested = if ($Env:MIKAZUKI_CONSOLE_LANG) { $Env:MIKAZUKI_CONSOLE_LANG } else { 'auto' }
        Set-ConsoleLanguage -Language $requested | Out-Null
    }
    return $script:ConsoleLanguage
}

function Get-ConsoleText {
    param(
        [string]$Key,
        [hashtable]$Tokens
    )

    $language = Get-ConsoleLanguage
    $text = $script:ConsoleTextTable[$language][$Key]
    if (-not $text) {
        $text = $script:ConsoleTextTable.en[$Key]
    }
    if (-not $text) {
        return $Key
    }

    if ($Tokens) {
        foreach ($entry in $Tokens.GetEnumerator()) {
            $text = $text.Replace("{$($entry.Key)}", [string]$entry.Value)
        }
    }

    return $text
}

function Write-ConsoleText {
    param(
        [string]$Key,
        [hashtable]$Tokens,
        [string]$ForegroundColor
    )

    $message = Get-ConsoleText -Key $Key -Tokens $Tokens
    if ($PSBoundParameters.ContainsKey('ForegroundColor')) {
        Write-Host $message -ForegroundColor $ForegroundColor
        return
    }
    Write-Host $message
}

function Get-ConsoleLanguageDisplayName {
    param(
        [string]$LanguageCode
    )

    $normalized = ConvertTo-ConsoleLanguage -Language $LanguageCode
    if ($normalized -eq 'auto') {
        return Get-ConsoleText -Key 'language_display_auto'
    }
    return Get-ConsoleText -Key "language_display_$normalized"
}

function Get-ConsoleRuntimeDisplayName {
    param(
        [string]$RuntimeName,
        [ValidateSet('status', 'python')]
        [string]$Kind = 'status'
    )

    $suffix = if ($Kind -eq 'python') { '_python' } else { '' }
    switch ($RuntimeName) {
        'flashattention' { return Get-ConsoleText -Key "runtime_flashattention$suffix" }
        'blackwell' { return Get-ConsoleText -Key "runtime_blackwell$suffix" }
        'sageattention' { return Get-ConsoleText -Key "runtime_sageattention$suffix" }
        'sageattention2' { return Get-ConsoleText -Key "runtime_sageattention2$suffix" }
        'portable' { return Get-ConsoleText -Key "runtime_portable$suffix" }
        'venv' { return Get-ConsoleText -Key "runtime_venv$suffix" }
        default { return Get-ConsoleText -Key 'runtime_main' }
    }
}
