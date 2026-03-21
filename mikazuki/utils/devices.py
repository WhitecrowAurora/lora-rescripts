from mikazuki.log import log
from packaging.version import Version

available_devices = []
printable_devices = []
xformers_status = {
    "checked": False,
    "installed": False,
    "supported": False,
    "reason": "Not checked yet.",
    "per_gpu": {},
}


def _short_exc_message(exc) -> str:
    message = str(exc).strip()
    if not message:
        return exc.__class__.__name__
    return message.splitlines()[0]


def refresh_xformers_status(torch_module=None):
    if torch_module is None:
        import torch as torch_module

    xformers_status["checked"] = True
    xformers_status["installed"] = False
    xformers_status["supported"] = False
    xformers_status["reason"] = "Not checked yet."
    xformers_status["per_gpu"] = {}

    if not torch_module.cuda.is_available():
        xformers_status["reason"] = "CUDA is not available."
        return xformers_status

    try:
        import xformers.ops as xops  # noqa: F401
    except Exception as exc:
        xformers_status["reason"] = f"xformers import failed: {_short_exc_message(exc)}"
        return xformers_status

    xformers_status["installed"] = True

    overall_supported = True
    first_reason = ""

    for gpu_index in range(torch_module.cuda.device_count()):
        device_name = torch_module.cuda.get_device_name(gpu_index)
        try:
            device = torch_module.device(f"cuda:{gpu_index}")
            # Use a tiny fp16 attention call to verify the installed xformers build
            # can actually execute on this GPU, not just import successfully.
            q = torch_module.randn((1, 32, 8, 64), device=device, dtype=torch_module.float16)
            k = torch_module.randn((1, 32, 8, 64), device=device, dtype=torch_module.float16)
            v = torch_module.randn((1, 32, 8, 64), device=device, dtype=torch_module.float16)

            import xformers.ops as xops

            xops.memory_efficient_attention(q, k, v, attn_bias=None)
            torch_module.cuda.synchronize(device)
            xformers_status["per_gpu"][gpu_index] = {
                "name": device_name,
                "supported": True,
                "reason": "ok",
            }
        except Exception as exc:
            reason = _short_exc_message(exc)
            xformers_status["per_gpu"][gpu_index] = {
                "name": device_name,
                "supported": False,
                "reason": reason,
            }
            overall_supported = False
            if not first_reason:
                first_reason = f"GPU {gpu_index} ({device_name}): {reason}"
        finally:
            if torch_module.cuda.is_available():
                torch_module.cuda.empty_cache()

    xformers_status["supported"] = overall_supported
    xformers_status["reason"] = "ok" if overall_supported else first_reason
    return xformers_status


def get_xformers_status(gpu_ids=None):
    if not xformers_status["checked"]:
        try:
            refresh_xformers_status()
        except Exception as exc:
            xformers_status["checked"] = True
            xformers_status["installed"] = False
            xformers_status["supported"] = False
            xformers_status["reason"] = f"xformers probe failed: {_short_exc_message(exc)}"
            xformers_status["per_gpu"] = {}

    selected_gpu_ids = []
    if gpu_ids:
        for gpu_id in gpu_ids:
            try:
                selected_gpu_ids.append(int(gpu_id))
            except (TypeError, ValueError):
                continue
    elif xformers_status["per_gpu"]:
        selected_gpu_ids = [min(xformers_status["per_gpu"].keys())]

    if not selected_gpu_ids:
        return {
            **xformers_status,
            "selected_gpu_ids": [],
        }

    selected_info = [
        xformers_status["per_gpu"].get(gpu_id, {
            "name": f"GPU {gpu_id}",
            "supported": False,
            "reason": "GPU status not found.",
        })
        for gpu_id in selected_gpu_ids
    ]

    selected_supported = all(info["supported"] for info in selected_info)
    reason = "ok" if selected_supported else next(
        f"GPU {gpu_id} ({info['name']}): {info['reason']}"
        for gpu_id, info in zip(selected_gpu_ids, selected_info)
        if not info["supported"]
    )

    return {
        **xformers_status,
        "selected_gpu_ids": selected_gpu_ids,
        "selected_supported": selected_supported,
        "reason": reason,
    }


def check_torch_gpu():
    try:
        import torch
        available_devices.clear()
        printable_devices.clear()
        log.info(f'Torch {torch.__version__}')
        if not torch.cuda.is_available():
            log.error("Torch is not able to use GPU, please check your torch installation.\n Use --skip-prepare-environment to disable this check")
            log.error("！！！Torch 无法使用 GPU，您无法正常开始训练！！！\n您的显卡可能并不支持，或是 torch 安装有误。请检查您的 torch 安装。")
            if "cpu" in torch.__version__:
                log.error("You are using torch CPU, please install torch GPU version by run install script again.")
                log.error("！！！您正在使用 CPU 版本的 torch，无法正常开始训练。请重新运行安装脚本！！！")
            return

        if Version(torch.__version__) < Version("2.3.0"):
            log.warning("Torch version is lower than 2.3.0, which may not be able to train FLUX model properly. Please re-run the installation script (install.ps1 or install.bash) to upgrade Torch.")
            log.warning("！！！Torch 版本低于 2.3.0，将无法正常训练 FLUX 模型。请考虑重新运行安装脚本以升级 Torch！！！")
            log.warning("！！！若您正在使用训练包，请直接下载最新训练包！！！")

        if torch.version.cuda:
            log.info(
                f'Torch backend: nVidia CUDA {torch.version.cuda} cuDNN {torch.backends.cudnn.version() if torch.backends.cudnn.is_available() else "N/A"}')
        elif torch.version.hip:
            log.info(f'Torch backend: AMD ROCm HIP {torch.version.hip}')

        devices = [torch.cuda.device(i) for i in range(torch.cuda.device_count())]

        for pos, device in enumerate(devices):
            name = torch.cuda.get_device_name(device)
            memory = torch.cuda.get_device_properties(device).total_memory
            available_devices.append(device)
            printable_devices.append(f"GPU {pos}: {name} ({round(memory / (1024**3))} GB)")
            log.info(
                f'Torch detected GPU: {name} VRAM {round(memory / 1024 / 1024)} Arch {torch.cuda.get_device_capability(device)} Cores {torch.cuda.get_device_properties(device).multi_processor_count}')

        status = refresh_xformers_status(torch)
        if not status["installed"]:
            log.warning(
                f"xformers is not available in the current environment: {status['reason']}"
            )
            log.warning(
                "When a training config enables xformers, Mikazuki will automatically fall back to SDPA when possible."
            )
            log.warning(
                f"当前环境不可用 xformers：{status['reason']}。若训练配置启用了 xformers，Mikazuki 会尽量自动降级到 sdpa。"
            )
        elif not status["supported"]:
            for gpu_index, gpu_status in status["per_gpu"].items():
                if gpu_status["supported"]:
                    continue
                log.warning(
                    f"xformers is not supported on GPU {gpu_index} ({gpu_status['name']}): {gpu_status['reason']}"
                )
                log.warning(
                    f"检测到 GPU {gpu_index}（{gpu_status['name']}）暂不支持 xformers：{gpu_status['reason']}"
                )
            log.warning(
                "Unsupported xformers setups will automatically fall back to SDPA when supported by the trainer."
            )
            log.warning(
                "对于不支持 xformers 的训练配置，启动训练时会自动改用 sdpa（若当前训练器支持）。"
            )
        else:
            log.info("xformers runtime probe passed on all detected GPUs.")
    except Exception as e:
        log.error(f'Could not load torch: {e}')
