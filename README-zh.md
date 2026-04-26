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

**v1.5.3**

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

### v1.5.3

- latent 磁盘缓存新增 `safetensors` 支持
- 补齐新 UI 所需的后端 API
- 修复 Anima 在 SageAttention 下使用梯度检查点时，前向与重算保存张量数量不一致导致的旧崩溃问题
- 改进 Anima / TLoRA 运行时兼容性
- 改进 FlashAttention 运行时安装稳健性

## ✨ 新特性：SD-reScripts 启动器

现在项目已经内置了新的桌面启动器，用来完成运行时安装、启动控制、环境诊断、托管参数导入与更安全的日常启动流程。

![SD-reScripts 启动器（中文）](./assets/launcher-cn.png)

## ✨ 新特性：训练 WebUI

Stable Diffusion 训练工作台。一切集成于一个 WebUI 中。

按照下面的安装指南安装 GUI，然后运行 `run_gui.ps1` (Windows) 或 `run_gui.sh` (Linux) 来启动 GUI。

![训练 WebUI](https://github.com/Akegarasu/lora-scripts/assets/36563862/d3fcf5ad-fb8f-4e1d-81f9-c903376c19c6)

| Tensorboard | WD 1.4 标签器 | 标签编辑器 |
| ------------ | ------------ | ------------ |
| ![Tensorboard](https://github.com/Akegarasu/lora-scripts/assets/36563862/b2ac5c36-3edf-43a6-9719-cb00b757fc76) | ![WD 1.4 标签器](https://github.com/Akegarasu/lora-scripts/assets/36563862/9504fad1-7d77-46a7-a68f-91fbbdbc7407) | ![标签编辑器](https://github.com/Akegarasu/lora-scripts/assets/36563862/4597917b-caa8-4e90-b950-8b01738996f2) |

## ✨ NEW：UI Design

项目也支持重新设计过的新前端 UI，可以通过启动器里的前端界面切换功能，或你当前配置的前端 profile 机制来启用。

![新 UI 设计](./assets/new-ui-cn.png)


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

## 托管参数站 / 一键导入

启动器里的 `托管` 页面可以连接在线参数站，实现训练参数的 24 小时本地缓存、一键导入和导入回滚。

对应仓库：

- [WhitecrowAurora/lulynx-lora-share](https://github.com/WhitecrowAurora/lulynx-lora-share)

推荐的 Linux 依赖：

- `git`
- `Node.js 20+`
- `npm 10+`
- 如果原生模块需要本地编译：`build-essential`、`python3`、`pkg-config`、`libvips-dev`

### Linux 快速部署

```sh
git clone https://github.com/WhitecrowAurora/lulynx-lora-share.git
cd lulynx-lora-share
```

安装后端依赖：

```sh
cd backend
npm install
```

安装前端依赖：

```sh
cd ../frontend
npm install
```

本地启动后端：

```sh
cd ../backend
PORT=3000 CORS_ORIGIN=http://127.0.0.1:5173 npm run start
```

本地启动前端开发环境：

```sh
cd ../frontend
VITE_API_URL=http://127.0.0.1:3000/api npm run dev -- --host 0.0.0.0 --port 5173
```

生成前端生产构建：

```sh
cd frontend
VITE_API_URL=https://你的域名.example/api npm run build
```

随后让反向代理去托管 `frontend/dist`，并把 `/api` 转发到后端服务即可。

网站上线后，在 LORA Share 站内创建 API Key，把服务器地址和 API Key 填进启动器的 `托管` 页面即可使用一键导入。

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
