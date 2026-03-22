<div align="center">

<img src="https://github.com/Akegarasu/lora-scripts/assets/36563862/3b177f4a-d92a-4da4-85c8-a0d163061a40" width="200" height="200" alt="SD-reScripts" style="border-radius: 25px">

## Download 

<p align="center">
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/releases/">
    <img src="https://img.shields.io/badge/Download-Latest%20Release-2ea44f?style=for-the-badge&logo=github&logoColor=white" alt="Download Latest Release">
  </a>
</p>

<p align="center">
  <strong><a href="https://github.com/WhitecrowAurora/lora-rescripts/releases/">Open Releases Download Page</a></strong>
</p>

# SD-reScripts

_✨ Enjoy Stable Diffusion Train！ ✨_

**v1.0.2**

Fork from 秋葉 `aaaki/lora-scripts`  
Modify By `Lulynx`

</div>

<p align="center">
  <a href="https://github.com/WhitecrowAurora/lora-rescripts" style="margin: 2px;">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/WhitecrowAurora/lora-rescripts">
  </a>
  <a href="https://github.com/WhitecrowAurora/lora-rescripts" style="margin: 2px;">
    <img alt="GitHub forks" src="https://img.shields.io/github/forks/WhitecrowAurora/lora-rescripts">
  </a>
  <a href="https://raw.githubusercontent.com/WhitecrowAurora/lora-rescripts/main/LICENSE" style="margin: 2px;">
    <img src="https://img.shields.io/github/license/WhitecrowAurora/lora-rescripts" alt="license">
  </a>
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/releases" style="margin: 2px;">
    <img src="https://img.shields.io/github/v/release/WhitecrowAurora/lora-rescripts?color=blueviolet&include_prereleases" alt="release">
  </a>
</p>

<p align="center">
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/releases">Download</a>
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/README.md">Documents</a>
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/README-zh.md">中文README</a>
</p>

SD-reScripts is a maintained fork / continuation of LoRA-scripts (a.k.a. SD-Trainer).

LoRA & Dreambooth training GUI & scripts preset & one key training environment for [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts.git)

## v1.0.2

Current maintenance notes for this fork:

- polished portable startup and project-local Python handling
- fixed tag editor startup, dependency compatibility, and UI theme consistency
- improved training compatibility for config parsing, SDXL checkpoint loading, and xformers to sdpa fallback
- refreshed packaging details, docs, and download guidance

## ✨NEW: Train WebUI

The **REAL** Stable Diffusion Training Studio. Everything in one WebUI.

Follow the installation guide below to install the GUI, then run `run_gui.ps1`(windows) or `run_gui.sh`(linux) to start the GUI.

![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/d3fcf5ad-fb8f-4e1d-81f9-c903376c19c6)

| Tensorboard | WD 1.4 Tagger | Tag Editor |
| ------------ | ------------ | ------------ |
| ![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/b2ac5c36-3edf-43a6-9719-cb00b757fc76) | ![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/9504fad1-7d77-46a7-a68f-91fbbdbc7407) | ![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/4597917b-caa8-4e90-b950-8b01738996f2) |


# Usage

### Required Dependencies

If you use the bundled portable Python runtime in the repo root, system Python is optional.

Otherwise you need:

- Python 3.10+
- Git

### Clone repo with submodules

```sh
git clone --recurse-submodules https://github.com/WhitecrowAurora/lora-rescripts.git
```

## ✨ SD-reScripts GUI

### Windows

#### Installation

Run `install.ps1`.
If you are in China mainland, please use `install-cn.ps1`.

- If a ready-to-run `python` folder already exists in the repo root, the installer will use it first
- Otherwise it falls back to creating a virtual environment
- `setup_embeddable_python.bat` is now mainly a repair helper for broken raw embeddable Python installs, not a normal first-run requirement

#### Train

run `run_gui.ps1`, then program will open [http://127.0.0.1:28000](http://127.0.0.1:28000) automanticlly

### Linux

#### Installation

Run `install.bash`.

- if `python/bin/python` already exists, the installer will use it first
- otherwise it will use `venv/bin/python` if present
- otherwise it will create `venv` automatically unless you explicitly pass `--disable-venv`
- it now installs the same base PyTorch / dependency stack as the current Windows installer

#### Train

Run `bash run_gui.sh`, then program will open [http://127.0.0.1:28000](http://127.0.0.1:28000) automatically.

- `run_gui.sh` now auto-detects `python/bin/python`, `venv/bin/python`, or system python
- if base dependencies are missing, it will run `install.bash` for you
- if tag editor dependencies are missing and the current Python is compatible, it will run `install_tageditor.sh`
- for mainland China mirror settings, use `bash run_gui_cn.sh`

## Legacy Manual Scripts

These old script-first entry points are no longer the recommended workflow for normal users.
Most of them have already been moved out of the repo root during cleanup and are kept only as reference material.

The recommended path is:
- install with `install.ps1` / `install-cn.ps1` / `install.bash`
- launch with `run_gui.ps1` / `run_gui.sh` / `run_gui_cn.sh` / `run.bat`

If you specifically need old notebooks or manual script references, check the `.delete` quarantine folder first.

#### TensorBoard

TensorBoard is already integrated into the GUI startup path.

## Program arguments

| Parameter Name                | Type  | Default Value | Description                                      |
|-------------------------------|-------|---------------|--------------------------------------------------|
| `--host`                      | str   | "127.0.0.1"   | Hostname for the server                          |
| `--port`                      | int   | 28000         | Port to run the server                           |
| `--listen`                    | bool  | false         | Enable listening mode for the server             |
| `--skip-prepare-environment`  | bool  | false         | Skip the environment preparation step            |
| `--disable-tensorboard`       | bool  | false         | Disable TensorBoard                              |
| `--disable-tageditor`         | bool  | false         | Disable tag editor                               |
| `--tensorboard-host`          | str   | "127.0.0.1"   | Host to run TensorBoard                          |
| `--tensorboard-port`          | int   | 6006          | Port to run TensorBoard                          |
| `--localization`              | str   |               | Localization settings for the interface          |
| `--dev`                       | bool  | false         | Developer mode to disale some checks             |
