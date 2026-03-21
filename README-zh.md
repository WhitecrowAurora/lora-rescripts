<div align="center">

<img src="https://github.com/Akegarasu/lora-scripts/assets/36563862/3b177f4a-d92a-4da4-85c8-a0d163061a40" width="200" height="200" alt="SD-reScripts" style="border-radius: 25px">

## 下载

**[点击下载](https://github.com/WhitecrowAurora/lora-rescripts/releases/)**

# SD-reScripts

_✨ 享受 Stable Diffusion 训练！ ✨_

**v1.0.1**

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

## v1.0.1

当前这个分支的接手维护说明如下：

- Fork from 秋葉 `aaaki/lora-scripts`，并在当前分支继续维护
- 同步并迁移了较新的 kohya / sd-scripts 核心到当前仓库结构
- 补回了 Flux、SD3 / SD3.5、Lumina、HunyuanImage、Anima、ControlNet、Textual Inversion、XTI 等训练入口
- 扩展了 LoRA 相关工具页，加入更多模型转换、合并、检查和数据集处理工具
- Windows 便携打包场景下，支持直接使用根目录准备好的 `python` 运行时
- 标签编辑器支持独立的 `python_tageditor` 运行时
- 当训练配置启用了 `xformers` 但当前环境未安装或显卡暂不支持时，会自动降级到 `sdpa`（若该训练器支持）

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

运行 `install.bash` 将创建虚拟环境并安装必要的依赖。

#### 训练

运行 `bash run_gui.sh`，程序将自动打开 [http://127.0.0.1:28000](http://127.0.0.1:28000)

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

## 通过手动运行脚本的传统训练方式

### Windows

#### 安装

运行 `install.ps1` 将自动为您创建虚拟环境并安装必要的依赖。

#### 训练

编辑 `train.ps1`，然后运行它。

### Linux

#### 安装

运行 `install.bash` 将创建虚拟环境并安装必要的依赖。

#### 训练

训练

脚本 `train.sh` **不会** 为您激活虚拟环境。您应该先激活虚拟环境。

```sh
source venv/bin/activate
```

编辑 `train.sh`，然后运行它。

#### TensorBoard

运行 `tensorboard.ps1` 将在 http://localhost:6006/ 启动 TensorBoard

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
