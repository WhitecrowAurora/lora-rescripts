<div align="center">

<img src="https://github.com/Akegarasu/lora-scripts/assets/36563862/3b177f4a-d92a-4da4-85c8-a0d163061a40" width="200" height="200" alt="SD-reScripts" style="border-radius: 25px">

## 下载

<p align="center">
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/releases/">
    <img src="https://img.shields.io/badge/%E7%82%B9%E5%87%BB%E4%B8%8B%E8%BD%BD-%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC-2ea44f?style=for-the-badge&logo=github&logoColor=white" alt="点击下载最新版本">
  </a>
</p>

<p align="center">
  <strong><a href="https://github.com/WhitecrowAurora/lora-rescripts/releases/">进入 Releases 下载页</a></strong>
</p>

# SD-reScripts

_✨ 享受 Stable Diffusion 训练！ ✨_

**v1.4.6 Beta36**

Fork from 秋葉 `aaaki/lora-scripts`  
Modify By `Lulynx`

</div>

<p align="center">
  <a href="https://github.com/WhitecrowAurora/lora-rescripts" style="margin: 2px;">
    <img alt="GitHub 仓库星标" src="https://img.shields.io/github/stars/WhitecrowAurora/lora-rescripts">
  </a>
  <a href="https://github.com/WhitecrowAurora/lora-rescripts" style="margin: 2px;">
    <img alt="GitHub 仓库分支" src="https://img.shields.io/github/forks/WhitecrowAurora/lora-rescripts">
  </a>
  <a href="https://raw.githubusercontent.com/WhitecrowAurora/lora-rescripts/main/LICENSE" style="margin: 2px;">
    <img src="https://img.shields.io/github/license/WhitecrowAurora/lora-rescripts" alt="许可证">
  </a>
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/releases" style="margin: 2px;">
    <img src="https://img.shields.io/github/v/release/WhitecrowAurora/lora-rescripts?color=blueviolet&include_prereleases" alt="发布版本">
  </a>
</p>

<p align="center">
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/releases">下载</a>
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/README.md">文档</a>
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/README-zh.md">中文README</a>
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/AGENTS.md">协作约束</a>
  ·
  <a href="https://github.com/WhitecrowAurora/lora-rescripts/blob/main/FRONTEND.md">前端补丁规范</a>
</p>

SD-reScripts 是基于 LoRA-scripts（又名 SD-Trainer）继续维护的分支版本。

这是一个实验性的项目,目前处于beta阶段,有成吨的问题

LoRA & Dreambooth 训练图形界面 & 脚本预设 & 一键训练环境，用于 [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts.git)

## 近期更新

### v1.4.6 Beta36

- 新增通用 `weight_decay` 选项：当 `optimizer_args` 未显式覆盖时，会自动注入优化器参数
- 新增 `anima_debug_mode`：按需开启 Anima 详细诊断日志（默认关闭）
- 新增 `anima_rope_mismatch_mode`（`strict` / `resample`）：可控制 Anima 与 TLoRA 路径的 RoPE 不匹配处理策略
- 新增 Anima 分桶预检查与 `anima_rope_max_seq_tokens` 上限保护，训练前可拦截超长 token 桶配置
- 提升 Anima 预览稳定性与兼容性（fp32 预览采样链路、prompt 字典解析兼容、text encoder unwrap 处理）

## ✨新特性: 训练 WebUI

Stable Diffusion 训练工作台。一切集成于一个 WebUI 中。

按照下面的安装指南安装 GUI，然后运行 `run_gui.ps1`(Windows) 或 `run_gui.sh`(Linux) 来启动 GUI。

![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/d3fcf5ad-fb8f-4e1d-81f9-c903376c19c6)

| Tensorboard | WD 1.4 标签器 | 标签编辑器 |
| ------------ | ------------ | ------------ |
| ![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/b2ac5c36-3edf-43a6-9719-cb00b757fc76) | ![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/9504fad1-7d77-46a7-a68f-91fbbdbc7407) | ![image](https://github.com/Akegarasu/lora-scripts/assets/36563862/4597917b-caa8-4e90-b950-8b01738996f2) |


# 使用方法

### 必要依赖

如果你使用仓库内已经准备好的便携 Python，可以不依赖系统 Python。

否则需要：

- Python 3.10+
- Git

### 克隆带子模块的仓库

```sh
git clone --recurse-submodules https://github.com/WhitecrowAurora/lora-rescripts.git
```

## ✨ SD-reScripts GUI

### Windows

#### 安装

运行 `run_For_≤RTX40series.bat` 或 `run_For_SageAttention_Experimental.bat`。

- 如果根目录已经有可直接运行的 `python` 文件夹，安装脚本会优先使用它
- 如果没有，脚本会按原有方式创建虚拟环境并安装依赖
- `setup_embeddable_python.bat` 现在主要用于修复“原始嵌入式 Python 缺少 pip”这类异常情况，不再是正常安装的必经步骤

#### 训练

运行 `run_gui.ps1`，程序将自动打开 [http://127.0.0.1:28000](http://127.0.0.1:28000)

#### SageAttention 实验启动

如果你想尝试 `sageattn`，Windows 现在提供了专用的实验性启动脚本：

- `run_For_SageAttention_Experimental.bat`：面向 NVIDIA 显卡的通用 SageAttention 运行时
- `run_For_NVIDIA_SageAttention_Experimental.bat`：与上面相同运行时的兼容别名
- `run_For_Only_Blackwell_SageAttention_Experimental.bat`：更推荐给 RTX 50 / RTX PRO Blackwell 用户使用的实验入口，适合在 xformers 不稳定时尝试

说明：

- 首次运行会自动准备一个独立运行时，不会污染主 `python` / `python_blackwell` / xformers 环境
- SageAttention 只会影响那些明确启用了 `sageattn` 的训练路由或配置；仅仅换成 SageAttention 启动脚本，并不会强制所有训练器停止使用 `sdpa` 或 `xformers`
- 可以使用 `check_sageattention_env.bat` 或 `check_sageattention_env.bat --blackwell` 检查运行时是否就绪
- 如果你想使用本地预编译 wheel，可以放到 `sageattention-wheels` 或 `sageattention_wheels` 目录中
- Blackwell 专用运行时会优先选择文件名中带有 `blackwell` 或 `sm120` 的 wheel

当前已经验证通过的一组实验环境依赖：

- Python `3.11.9`
- Torch `2.10.0+cu128`
- TorchVision `0.25.0+cu128`
- Triton Windows `3.5.1.post24`
- SageAttention `1.0.6`

### Linux

#### 安装

运行 `install.bash`。

- 如果已经存在 `python/bin/python`，安装脚本会优先使用环境Python
- 否则如果存在 `venv/bin/python`，会优先使用现有虚拟环境
- 如果两者都没有，则默认自动创建 `venv`，除非你明确传入 `--disable-venv`
- 现在它会与当前 Windows 安装器尽量保持同一套基础 PyTorch / 依赖策略

#### 训练

运行 `bash run_gui.sh`，程序将自动打开 [http://127.0.0.1:28000](http://127.0.0.1:28000)。

- `run_gui.sh` 现在会自动检测 `python/bin/python`、`venv/bin/python` 或系统 Python
- 如果基础依赖缺失，它会自动调用 `install.bash`
- 如果标签编辑器依赖缺失且当前 Python 版本兼容，它会自动调用 `install_tageditor.sh`
- 中国大陆镜像环境可使用 `bash run_gui_cn.sh`
- Windows 用户可使用 `run_gui_cn.bat`、`run_auto_cn.bat`、`run_manual_cn.bat`
- 各实验路线也已提供对应的 `_cn.bat` 启动入口，可在原脚本名后追加 `_cn`
- 首次使用 CN 启动脚本时会让你选择 PyPI 镜像源，直接回车默认清华，选择会保存到 `config/china_mirror.json`

#### TensorBoard

TensorBoard 已经集成到 GUI 启动流程中。

## 程序参数

| 参数名称                     | 类型  | 默认值       | 描述                                            |
|------------------------------|-------|--------------|-------------------------------------------------|
| `--host`                     | str   | "127.0.0.1"  | 服务器的主机名                                  |
| `--port`                     | int   | 28000        | 运行服务器的端口                                |
| `--listen`                   | bool  | false        | 启用服务器的监听模式                            |
| `--skip-prepare-environment` | bool  | false        | 跳过环境准备步骤                                |
| `--disable-tensorboard`      | bool  | false        | 禁用 TensorBoard                                |
| `--disable-tageditor`        | bool  | false        | 禁用标签编辑器                                  |
| `--tensorboard-host`         | str   | "127.0.0.1"  | 运行 TensorBoard 的主机                         |
| `--tensorboard-port`         | int   | 6006         | 运行 TensorBoard 的端口                          |
| `--localization`             | str   |              | 界面的本地化设置                                |
| `--dev`                      | bool  | false        | 开发者模式，用于禁用某些检查                     |

## 开源致敬

本项目基于多个开源社区的成果，向以下项目与维护者致敬：

- [aaaki/lora-scripts](https://github.com/aaaki/lora-scripts)：本仓库的直接上游 Fork 基础。
- [Akegarasu/lora-scripts](https://github.com/Akegarasu/lora-scripts)：早期脚本工作流与 GUI 形态的重要基础。
- [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts)：本项目所使用的核心训练后端。
- [kozistr/pytorch_optimizer](https://github.com/kozistr/pytorch_optimizer)：本项目扩展优化器与调度器选项所使用的核心集合来源。

## 鸣谢

特别感谢<p><a href="https://github.com/DrRelax599">DrRelax599</a></p> 在开发过程中参与测试，并帮助改进稳定性。
