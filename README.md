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

**v1.1.5 Beta10**

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

## Recent Updates

### v1.1.5 Beta10

- improved Anima training throughput and runtime stability with lighter cache handling, better tensor transfer paths, and clearer runtime diagnostics
- improved SageAttention real-world performance visibility for Anima, with step profiler support and more transparent backend summary logging
- fixed multiple Anima edge cases around preview prompts, empty token paths, legacy text cache rebuilding, and `save_every_n_epochs=0`
- added advanced Anima debug options for profiler window and NaN check interval tuning

### v1.0.9

- added SafeGuard and EMA training options across the main training routes, with save-time EMA checkpoint export support
- fixed Anima startup failures caused by missing VAE paths by aligning the UI field, preflight validation, and backend runtime checks
- improved save / training stability consistency across SD / SDXL / Flux / SD3 / Lumina / Anima / ControlNet / Textual Inversion workflows
- refreshed homepage copy, version metadata, and release documentation for the current build

### v1.0.8 Beta3

- added native Anima training pages and backend integration for Anima LoRA / finetune workflows
- added friendly Anima LoRA / LoKr switching, JSON caption priority, and improved preview prompt flow
- added experimental SageAttention 2 startup scripts and improved attention backend detection / fallback behavior
- improved staged mixed-resolution stability, distributed / mixed-GPU launch handling, and training preflight checks

### v1.0.6 Beta2

- added experimental SageAttention startup support for supported NVIDIA environments
- improved Blackwell / RTX 50 / RTX PRO compatibility and reduced startup failures on newer GPUs
- improved xformers / SDPA / SageAttention fallback logic and runtime troubleshooting visibility
- improved mixed GPU selection, dataset cache preflight, and training option coverage
- added experimental staged mixed-resolution training and expanded optimizer / scheduler integration

### v1.0.2

- polished portable startup and project-local Python handling
- fixed tag editor startup, dependency compatibility, and UI theme consistency
- improved config parsing, SDXL checkpoint loading, and general training compatibility

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

## Open-source Credits

This project stands on the work of multiple open-source communities. Respect and thanks to:

- [aaaki/lora-scripts](https://github.com/aaaki/lora-scripts): direct upstream fork base for this repository.
- [Akegarasu/lora-scripts](https://github.com/Akegarasu/lora-scripts): earlier foundation of the script-first and GUI workflow.
- [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts): core training backend used by this project.
- [kozistr/pytorch_optimizer](https://github.com/kozistr/pytorch_optimizer): optimizer and scheduler collection used for the extended optimizer/scheduler options in this project.

## Acknowledgements

Special thanks to <p><a href="https://github.com/DrRelax599">DrRelax599</a></p> for testing the project and helping improve stability during development.
