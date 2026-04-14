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

**v1.2.1 Beta16**

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
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/AGENTS.md">AGENTS</a>
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/FRONTEND.md">FRONTEND</a>
</p>

SD-reScripts is a maintained fork / continuation of LoRA-scripts (a.k.a. SD-Trainer).

This is an experimental project currently in beta, and there are tons of bugs.

LoRA & Dreambooth training GUI & scripts preset & one key training environment for [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts.git)

## Recent Updates

### v1.2.1 Beta16

- added experimental dedicated runtime routes for SageAttention, Intel XPU, AMD ROCm, and AMD ROCm / Intel XPU Sage startup flows on Windows, with clearer launcher checks and isolated runtime selection
- improved training startup safety with runtime-aware attention fallback guards, dependency preflight, resume-state protection, dataset cache checks, and more explicit startup warnings
- improved external config import compatibility by keeping legacy field mapping, filling known missing values with safer defaults, and reducing layout breakage from non-native config files
- added laptop-friendly cooldown controls and optional `nvidia-smi` GPU power limit support for long-running training sessions on thermally constrained devices
- added YOLO workflow integration with local Ultralytics support, runtime dependency installers, custom or auto-generated dataset yaml handling, and better startup validation
- added aesthetic scorer training, inference, and labeling-related backend support, together with runtime dependency management and workflow-side preparation tools
- refactored large parts of the training launch path into smaller runtime helper modules to make future hardware adaptation and bug fixing easier to maintain

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

Run `run_For_≤RTX40series.bat` or `run_For_SageAttention_Experimental.bat`.

- If a ready-to-run `python` folder already exists in the repo root, the installer will use it first
- Otherwise it falls back to creating a virtual environment
- `setup_embeddable_python.bat` is now mainly a repair helper for broken raw embeddable Python installs, not a normal first-run requirement

#### Train

run `run_gui.ps1`, then program will open [http://127.0.0.1:28000](http://127.0.0.1:28000) automanticlly

#### SageAttention Experimental Startup

If you want to try `sageattn`, there are now dedicated experimental startup scripts on Windows:

- `run_For_SageAttention_Experimental.bat`: general SageAttention runtime for NVIDIA GPUs
- `run_For_NVIDIA_SageAttention_Experimental.bat`: compatibility alias for the same general SageAttention runtime
- `run_For_Only_Blackwell_SageAttention_Experimental.bat`: recommended experimental path for RTX 50 / RTX PRO Blackwell users when xformers is unreliable

Notes:

- the first run will automatically prepare a dedicated runtime and keep the main `python` / `python_blackwell` / xformers environments untouched
- SageAttention only affects routes and configs that explicitly enable `sageattn`; launching with a SageAttention script does not force every trainer to stop using `sdpa` or `xformers`
- you can verify the runtime with `check_sageattention_env.bat` or `check_sageattention_env.bat --blackwell`
- if you want to provide a prebuilt local wheel, place it in `sageattention-wheels` or `sageattention_wheels`
- for the Blackwell runtime, wheel names containing `blackwell` or `sm120` are preferred automatically

Current validated experimental base stack:

- Python `3.11.9`
- Torch `2.10.0+cu128`
- TorchVision `0.25.0+cu128`
- Triton Windows `3.5.1.post24`
- SageAttention `1.0.6`

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
- on Windows, use `run_gui_cn.bat`, `run_auto_cn.bat`, or `run_manual_cn.bat`
- dedicated experimental routes also provide matching `_cn.bat` launchers
- the first CN startup will let you choose a PyPI mirror; pressing Enter keeps the default Tsinghua preset and saves it to `config/china_mirror.json`

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

## Open-source Credits

This project stands on the work of multiple open-source communities. Respect and thanks to:

- [aaaki/lora-scripts](https://github.com/aaaki/lora-scripts): direct upstream fork base for this repository.
- [Akegarasu/lora-scripts](https://github.com/Akegarasu/lora-scripts): earlier foundation of the script-first and GUI workflow.
- [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts): core training backend used by this project.
- [kozistr/pytorch_optimizer](https://github.com/kozistr/pytorch_optimizer): optimizer and scheduler collection used for the extended optimizer/scheduler options in this project.

## Acknowledgements

Special thanks to <p><a href="https://github.com/DrRelax599">DrRelax599</a></p> for testing the project and helping improve stability during development.
