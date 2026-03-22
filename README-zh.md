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

**v1.0.2**

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
</p>

SD-reScripts 是基于 LoRA-scripts（又名 SD-Trainer）继续维护的分支版本。

LoRA & Dreambooth 训练图形界面 & 脚本预设 & 一键训练环境，用于 [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts.git)

## v1.0.2

当前这个分支的接手维护说明如下：

- 优化了便携启动流程和项目内 Python 运行时处理
- 修复了标签编辑器启动、依赖兼容和界面主题一致性问题
- 改进了训练兼容性，包括配置解析、SDXL 检查点加载以及 xformers 到 sdpa 的自动降级
- 更新了打包分发说明、文档和下载引导

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

运行 `install-cn.ps1` 或 `install.ps1`。

- 如果根目录已经有可直接运行的 `python` 文件夹，安装脚本会优先使用它
- 如果没有，脚本会按原有方式创建虚拟环境并安装依赖
- `setup_embeddable_python.bat` 现在主要用于修复“原始嵌入式 Python 缺少 pip”这类异常情况，不再是正常安装的必经步骤

#### 训练

运行 `run_gui.ps1`，程序将自动打开 [http://127.0.0.1:28000](http://127.0.0.1:28000)

### Linux

#### 安装

运行 `install.bash`。

- 如果已经存在 `python/bin/python`，安装脚本会优先使用它
- 否则如果存在 `venv/bin/python`，会优先使用现有虚拟环境
- 如果两者都没有，则默认自动创建 `venv`，除非你明确传入 `--disable-venv`
- 现在它会与当前 Windows 安装器尽量保持同一套基础 PyTorch / 依赖策略

#### 训练

运行 `bash run_gui.sh`，程序将自动打开 [http://127.0.0.1:28000](http://127.0.0.1:28000)。

- `run_gui.sh` 现在会自动检测 `python/bin/python`、`venv/bin/python` 或系统 Python
- 如果基础依赖缺失，它会自动调用 `install.bash`
- 如果标签编辑器依赖缺失且当前 Python 版本兼容，它会自动调用 `install_tageditor.sh`
- 中国大陆镜像环境可使用 `bash run_gui_cn.sh`

### Docker

#### 编译镜像

```bash
# 国内镜像优化版本
# 其中 akegarasu_lora-scripts:latest 为镜像及其 tag 名，根据镜像托管服务商实际进行修改
docker build -t akegarasu_lora-scripts:latest -f Dockfile-for-Mainland-China .
docker push akegarasu_lora-scripts:latest
```

#### 使用镜像

> 提供一个本人已打包好并推送到 `aliyuncs` 上的镜像，此镜像压缩归档大小约 `10G` 左右，请耐心等待拉取。

```bash
docker run --gpus all -p 28000:28000 -p 6006:6006 registry.cn-hangzhou.aliyuncs.com/go-to-mirror/akegarasu_lora-scripts:latest 
```

或者使用 `docker-compose.yaml` 。

```yaml
services:
  lora-scripts:
    container_name: lora-scripts
    build:
      context: .
      dockerfile: Dockerfile-for-Mainland-China
    image: "registry.cn-hangzhou.aliyuncs.com/go-to-mirror/akegarasu_lora-scripts:latest"
    ports:
      - "28000:28000"
      - "6006:6006"  
    # 共享本地文件夹（请根据实际修改）
    #volumes:
      # - "/data/srv/lora-scripts:/app/lora-scripts"
      # 共享 comfyui 大模型
      # - "/data/srv/comfyui/models/checkpoints:/app/lora-scripts/sd-models/comfyui"
      # 共享 sd-webui 大模型
      # - "/data/srv/stable-diffusion-webui/models/Stable-diffusion:/app/lora-scripts/sd-models/sd-webui"
    environment:
      - HF_HOME=huggingface
      - PYTHONUTF8=1
    security_opt:
      - "label=type:nvidia_container_t"
    runtime: nvidia
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']
              capabilities: [gpu]
```
 
关于容器使用 GPU 相关依赖安装问题，请自行搜索查阅资料解决。

## 传统手动脚本入口

这些旧的脚本式工作流，已经不再适合作为普通用户的主流程。
其中大部分也已经在整理过程中从根目录移走，仅保留为参考资料。

推荐方式是：
- 使用 `install.ps1` / `install-cn.ps1` / `install.bash` 安装
- 使用 `run_gui.ps1` / `run_gui.sh` / `run_gui_cn.sh` / `run.bat` 启动

如果你确实需要查看旧 notebook 或旧脚本入口，请先到 `.delete` 隔离目录里找。

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
