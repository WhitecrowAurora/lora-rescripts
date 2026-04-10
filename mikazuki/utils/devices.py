import importlib

from mikazuki.utils.device_attention_probe import (
    build_attention_backend_summary,
    probe_xformers_runtime,
    select_xformers_status,
    short_exc_message,
)
from mikazuki.log import log
from mikazuki.utils.runtime_mode import infer_attention_runtime_mode
from packaging.version import Version

available_devices = []
printable_devices = []
xformers_status = {
    "checked": False,
    "installed": False,
    "supported": False,
    "verified": False,
    "version": None,
    "reason": "Not checked yet.",
    "per_gpu": {},
}


def _is_xpu_available(torch_module) -> bool:
    try:
        xpu_module = getattr(torch_module, "xpu", None)
        is_available = getattr(xpu_module, "is_available", None)
        return bool(callable(is_available) and is_available())
    except Exception:
        return False


def get_attention_runtime_mode() -> str:
    return infer_attention_runtime_mode()




def refresh_xformers_status(torch_module=None):
    if torch_module is None:
        import torch as torch_module

    xformers_status["checked"] = True
    xformers_status["installed"] = False
    xformers_status["supported"] = False
    xformers_status["verified"] = False
    xformers_status["version"] = None
    xformers_status["reason"] = "Not checked yet."
    xformers_status["per_gpu"] = {}

    runtime_mode = infer_attention_runtime_mode()

    if runtime_mode in {"intel-xpu", "intel-xpu-sage"} or _is_xpu_available(torch_module):
        xformers_status["reason"] = "xformers is disabled for Intel XPU runtime."
        return xformers_status

    if runtime_mode == "rocm-amd" or bool(getattr(torch_module.version, "hip", None)):
        xformers_status["reason"] = "xformers is disabled for AMD ROCm runtime."
        return xformers_status

    if not torch_module.cuda.is_available():
        xformers_status["reason"] = "CUDA is not available."
        return xformers_status

    try:
        import xformers
        import xformers.ops as xops  # noqa: F401
    except Exception as exc:
        xformers_status["reason"] = f"xformers import failed: {short_exc_message(exc)}"
        return xformers_status

    xformers_status["installed"] = True
    xformers_status["version"] = getattr(xformers, "__version__", "unknown")

    overall_supported = True
    overall_verified = True
    first_reason = ""

    for gpu_index in range(torch_module.cuda.device_count()):
        device_name = torch_module.cuda.get_device_name(gpu_index)
        try:
            device = torch_module.device(f"cuda:{gpu_index}")
            probe_result = probe_xformers_runtime(torch_module, device)
            gpu_status = {
                "name": device_name,
                "supported": probe_result["supported"],
                "verified": probe_result["verified"],
                "reason": probe_result["reason"],
            }
            xformers_status["per_gpu"][gpu_index] = gpu_status

            if not gpu_status["supported"]:
                overall_supported = False
                overall_verified = False
                if not first_reason:
                    first_reason = f"GPU {gpu_index} ({device_name}): {gpu_status['reason']}"
            elif not gpu_status["verified"]:
                overall_verified = False
                if not first_reason:
                    first_reason = f"GPU {gpu_index} ({device_name}): {gpu_status['reason']}"
        except Exception as exc:
            reason = short_exc_message(exc)
            xformers_status["per_gpu"][gpu_index] = {
                "name": device_name,
                "supported": False,
                "verified": False,
                "reason": reason,
            }
            overall_supported = False
            overall_verified = False
            if not first_reason:
                first_reason = f"GPU {gpu_index} ({device_name}): {reason}"
        finally:
            if torch_module.cuda.is_available():
                torch_module.cuda.empty_cache()

    xformers_status["supported"] = overall_supported
    xformers_status["verified"] = overall_verified
    if overall_supported and overall_verified:
        xformers_status["reason"] = "ok"
    elif overall_supported:
        xformers_status["reason"] = first_reason or "xformers is available but runtime probe was inconclusive."
    else:
        xformers_status["reason"] = first_reason
    return xformers_status


def get_xformers_status(gpu_ids=None):
    if not xformers_status["checked"]:
        try:
            refresh_xformers_status()
        except Exception as exc:
            xformers_status["checked"] = True
            xformers_status["installed"] = False
            xformers_status["supported"] = False
            xformers_status["verified"] = False
            xformers_status["version"] = None
            xformers_status["reason"] = f"xformers probe failed: {short_exc_message(exc)}"
            xformers_status["per_gpu"] = {}
    return select_xformers_status(xformers_status, gpu_ids)


def check_torch_gpu():
    try:
        import torch
        available_devices.clear()
        printable_devices.clear()
        log.info(f'Torch {torch.__version__}')
        cuda_available = bool(torch.cuda.is_available())
        xpu_available = _is_xpu_available(torch)
        if not cuda_available and not xpu_available:
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
        elif xpu_available:
            log.info("Torch backend: Intel XPU")

        if xpu_available and not cuda_available:
            devices = [torch.device(f"xpu:{i}") for i in range(torch.xpu.device_count())]
            for pos, device in enumerate(devices):
                name = torch.xpu.get_device_name(pos)
                properties = torch.xpu.get_device_properties(pos)
                memory = properties.total_memory
                available_devices.append(device)
                printable_devices.append(f"GPU {pos}: {name} ({round(memory / (1024**3))} GB)")
                bf16_supported = getattr(torch.xpu, "is_bf16_supported", lambda *args, **kwargs: None)()
                log.info(
                    f"Torch detected Intel XPU: {name} VRAM {round(memory / 1024 / 1024)} BF16 {bf16_supported}"
                )
        else:
            devices = [torch.cuda.device(i) for i in range(torch.cuda.device_count())]
            for pos, device in enumerate(devices):
                name = torch.cuda.get_device_name(device)
                memory = torch.cuda.get_device_properties(device).total_memory
                available_devices.append(device)
                printable_devices.append(f"GPU {pos}: {name} ({round(memory / (1024**3))} GB)")
                log.info(
                    f'Torch detected GPU: {name} VRAM {round(memory / 1024 / 1024)} Arch {torch.cuda.get_device_capability(device)} Cores {torch.cuda.get_device_properties(device).multi_processor_count}')

        status = refresh_xformers_status(torch)
        attention_summary = build_attention_backend_summary(torch, status, _is_xpu_available)
        log.info(f"Preferred training attention backend: {attention_summary['preferred_backend']}")
        log.info(f"当前检测到的训练优先注意力后端：{attention_summary['preferred_backend']}")
        log.info(
            "Attention backend summary: "
            f"preferred={attention_summary['preferred_backend']} | "
            f"runtime={attention_summary['runtime_mode']} | "
            f"flashattn={'ready' if attention_summary['flashattention']['symbols_ok'] else 'unavailable'} | "
            f"xformers={'ready' if status.get('supported') else 'unavailable'} | "
            f"sdpa={'ready' if attention_summary['sdpa_available'] else 'unavailable'} | "
            f"sageattn={'ready' if attention_summary['sageattention']['symbols_ok'] else 'unavailable'}"
        )
        log.info(attention_summary["detail"])
        log.info(f"注意力后端摘要：当前优先后端={attention_summary['preferred_backend']}。{attention_summary['detail_zh']}")

        if not status["installed"]:
            if attention_summary["runtime_mode"] == "flashattention" and attention_summary["flashattention"]["symbols_ok"]:
                log.info(
                    f"xformers is not installed in this FlashAttention runtime: {status['reason']}"
                )
                log.info(
                    "This is expected for the dedicated FlashAttention runtime. Supported SDXL routes can still use flash-attn here, and unsupported xformers-style configs will fall back to SDPA when possible."
                )
                log.info(
                    f"FlashAttention 专用运行时中未安装 xformers：{status['reason']}。这属于预期行为；支持的 SDXL 路线仍可使用 flash-attn，不兼容的 xformers 配置会尽量回退到 sdpa。"
                )
            elif attention_summary["runtime_mode"] in {"sageattention", "sageattention2"} and attention_summary["sageattention"]["symbols_ok"]:
                log.info(
                    f"xformers is not installed in this SageAttention runtime: {status['reason']}"
                )
                log.info(
                    "This is expected for the dedicated SageAttention runtime. xformers-style configs will fall back to SDPA here."
                )
                log.info(
                    f"SageAttention 专用运行时中未安装 xformers：{status['reason']}。这属于预期行为；若训练配置仍启用了 xformers，这里会回退到 sdpa。"
                )
            elif attention_summary["runtime_mode"] in {"intel-xpu", "intel-xpu-sage"}:
                log.info(
                    f"xformers stays disabled in Intel XPU runtime: {status['reason']}"
                )
                log.info(
                    "Intel XPU 运行时默认不启用 xformers，将直接优先使用 SDPA / torch attention。"
                )
            else:
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
            if status.get("version"):
                log.warning(f"xformers version detected: {status['version']}")
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
        elif not status.get("verified", False):
            if status.get("version"):
                log.warning(f"xformers version detected: {status['version']}")
            for gpu_index, gpu_status in status["per_gpu"].items():
                if not gpu_status["supported"] or gpu_status.get("verified", False):
                    continue
                log.warning(
                    f"xformers runtime probe is inconclusive on GPU {gpu_index} ({gpu_status['name']}): {gpu_status['reason']}"
                )
                log.warning(
                    f"检测到 GPU {gpu_index}（{gpu_status['name']}）上的 xformers 运行探测结果未确认：{gpu_status['reason']}"
                )
            log.warning(
                "Keeping xformers enabled for these GPUs. If a specific training run still fails, switch that config to SDPA manually."
            )
            log.warning(
                "此类 GPU 仍会保留 xformers 可用状态；若某个训练器实际运行仍报错，请再手动切换到 sdpa。"
            )
        else:
            version_suffix = f" (xformers {status['version']})" if status.get("version") else ""
            log.info(f"xformers runtime probe passed on all detected GPUs.{version_suffix}")
    except Exception as e:
        log.error(f'Could not load torch: {e}')
