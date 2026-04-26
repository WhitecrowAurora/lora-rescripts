# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['H:\\lora-rescripts\\launcher\\main.py'],
    pathex=['H:\\lora-rescripts'],
    binaries=[],
    datas=[('H:\\lora-rescripts\\launcher\\i18n', 'launcher/i18n'), ('H:\\lora-rescripts\\launcher\\assets', 'launcher/assets'), ('H:\\lora-rescripts\\launcher\\web\\dist', 'launcher/web/dist')],
    hiddenimports=['webview', 'launcher', 'launcher.main', 'launcher.config', 'launcher.i18n', 'launcher.api', 'launcher.window', 'launcher.core', 'launcher.core.launcher', 'launcher.core.installer', 'launcher.core.runtime_detector', 'launcher.core.settings', 'launcher.core.plugins', 'launcher.core.gpu', 'launcher.core.preflight', 'launcher.core.recommendation', 'launcher.core.api_result', 'launcher.core.compatibility', 'launcher.core.diagnostics', 'launcher.core.task_history_store', 'launcher.core.runtime_coordinator', 'launcher.core.runtime_catalog', 'launcher.core.runtime_tasks', 'launcher.core.task_executor', 'launcher.core.task_state', 'launcher.core.task_plans', 'launcher.core.update_checker', 'launcher.core.versioning'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['torch', 'torchvision', 'torchaudio', 'transformers', 'diffusers', 'xformers', 'tensorflow', 'tensorboard', 'pandas', 'numpy', 'scipy', 'matplotlib', 'sklearn', 'onnxruntime', 'cv2'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='SD-reScripts-Launcher',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['H:\\lora-rescripts\\launcher\\assets\\favicon.ico'],
)
