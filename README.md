<div align="center">

<img src="https://github.com/Akegarasu/lora-scripts/assets/36563862/3b177f4a-d92a-4da4-85c8-a0d163061a40" width="200" height="200" alt="SD-reScripts" style="border-radius: 25px">

# SD-reScripts

_✨ Enjoy Stable Diffusion Train！ ✨_

**v1.0.1**

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

## v1.0.1

Current maintenance notes for this fork:

- Fork from 秋葉 `aaaki/lora-scripts` and continue maintenance in this branch
- syncing newer kohya / sd-scripts core pieces into the current repo layout
- restoring training entries for Flux, SD3 / SD3.5, Lumina, HunyuanImage, Anima, ControlNet, Textual Inversion, and XTI
- expanding the LoRA tools page with more merge, conversion, inspection, and dataset utilities
- supporting ready-to-run portable Python in the repo root for Windows packaging builds
- supporting a dedicated `python_tageditor` runtime for the tag editor
- automatically falling back to `sdpa` when a trainer enables `xformers` but the current environment or GPU does not support it

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

Run `install.bash` will create a venv and install necessary deps. 

#### Train

run `bash run_gui.sh`, then program will open [http://127.0.0.1:28000](http://127.0.0.1:28000) automanticlly

## Legacy training through run script manually

### Windows

#### Installation

Run `install.ps1` will automatically create a venv for you and install necessary deps.

#### Train

Edit `train.ps1`, and run it.

### Linux

#### Installation

Run `install.bash` will create a venv and install necessary deps.

#### Train

Training script `train.sh` **will not** activate venv for you. You should activate venv first.

```sh
source venv/bin/activate
```

Edit `train.sh`, and run it.

#### TensorBoard

Run `tensorboard.ps1` will start TensorBoard at http://localhost:6006/

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
