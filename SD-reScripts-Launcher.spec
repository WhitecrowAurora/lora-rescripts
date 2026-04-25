# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['H:\\lora-rescripts\\launcher\\main.py'],
    pathex=['H:\\lora-rescripts'],
    binaries=[],
    datas=[('H:\\lora-rescripts\\launcher\\i18n', 'launcher/i18n'), ('H:\\lora-rescripts\\launcher\\assets', 'launcher/assets')],
    hiddenimports=['customtkinter', 'PIL._tkinter_finder', 'launcher', 'launcher.app', 'launcher.config', 'launcher.i18n', 'launcher.main', 'launcher.assets', 'launcher.assets.style', 'launcher.core', 'launcher.core.launcher', 'launcher.core.installer', 'launcher.core.runtime_detector', 'launcher.core.settings', 'launcher.ui', 'launcher.ui.sidebar', 'launcher.ui.launch_page', 'launcher.ui.runtime_page', 'launcher.ui.advanced_page', 'launcher.ui.install_page', 'launcher.ui.extension_page', 'launcher.ui.console_page', 'launcher.ui.about_page', 'launcher.ui.icons', 'launcher.ui.animations'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
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
    icon=['H:\\lora-rescripts\\launcher\\assets\\icon.ico'],
)
