from __future__ import annotations

import importlib
import importlib.util
import sys
from importlib import metadata
from typing import Iterable

from mikazuki.utils.runtime_dependency_rules import collect_training_dependency_requirements
from mikazuki.utils.runtime_mode import infer_runtime_environment_name, is_amd_rocm_runtime, is_intel_xpu_runtime
from mikazuki.utils.sagebwd_runtime import is_sagebwd_nvidia_runtime, probe_runtime_sagebwd


PACKAGE_REGISTRY = {
    "accelerate": {
        "package_name": "accelerate",
        "display_name": "accelerate",
        "required_by_default": True,
    },
    "torch": {
        "package_name": "torch",
        "display_name": "PyTorch",
        "required_by_default": True,
    },
    "fastapi": {
        "package_name": "fastapi",
        "display_name": "FastAPI",
        "required_by_default": True,
    },
    "toml": {
        "package_name": "toml",
        "display_name": "toml",
        "required_by_default": True,
    },
    "lion_pytorch": {
        "package_name": "lion-pytorch",
        "display_name": "lion-pytorch",
        "required_by_default": True,
    },
    "dadaptation": {
        "package_name": "dadaptation",
        "display_name": "dadaptation",
        "required_by_default": True,
    },
    "schedulefree": {
        "package_name": "schedulefree",
        "display_name": "schedulefree",
        "required_by_default": True,
    },
    "prodigyopt": {
        "package_name": "prodigyopt",
        "display_name": "prodigyopt",
        "required_by_default": True,
    },
    "prodigyplus": {
        "package_name": "prodigy-plus-schedule-free",
        "display_name": "prodigyplus",
        "required_by_default": True,
    },
    "pytorch_optimizer": {
        "package_name": "pytorch-optimizer",
        "display_name": "pytorch-optimizer",
        "required_by_default": True,
    },
    "lycoris": {
        "package_name": "lycoris-lora",
        "display_name": "lycoris-lora",
        "required_by_default": False,
    },
    "safetensors": {
        "package_name": "safetensors",
        "display_name": "safetensors",
        "required_by_default": True,
    },
    "sentencepiece": {
        "package_name": "sentencepiece",
        "display_name": "sentencepiece",
        "required_by_default": False,
    },
    "sageattention": {
        "package_name": "sageattention",
        "display_name": "sageattention",
        "required_by_default": False,
    },
    "flash_attn": {
        "package_name": "flash-attn",
        "display_name": "flash-attn",
        "required_by_default": False,
    },
    "bitsandbytes": {
        "package_name": "bitsandbytes",
        "display_name": "bitsandbytes",
        "required_by_default": False,
    },
    "transformers": {
        "package_name": "transformers",
        "display_name": "transformers",
        "required_by_default": True,
    },
    "diffusers": {
        "package_name": "diffusers",
        "display_name": "diffusers",
        "required_by_default": True,
    },
    "requests": {
        "package_name": "requests",
        "display_name": "requests",
        "required_by_default": False,
    },
    "psutil": {
        "package_name": "psutil",
        "display_name": "psutil",
        "required_by_default": False,
    },
    "cv2": {
        "package_name": "opencv-python",
        "display_name": "opencv-python",
        "required_by_default": False,
    },
    "matplotlib": {
        "package_name": "matplotlib",
        "display_name": "matplotlib",
        "required_by_default": False,
    },
    "scipy": {
        "package_name": "scipy",
        "display_name": "scipy",
        "required_by_default": False,
    },
    "polars": {
        "package_name": "polars",
        "display_name": "polars",
        "required_by_default": False,
    },
    "torchvision": {
        "package_name": "torchvision",
        "display_name": "torchvision",
        "required_by_default": False,
    },
    "open_clip": {
        "package_name": "open-clip-torch",
        "display_name": "open-clip-torch",
        "required_by_default": False,
    },
    "timm": {
        "package_name": "timm",
        "display_name": "timm",
        "required_by_default": False,
    },
    "tqdm": {
        "package_name": "tqdm",
        "display_name": "tqdm",
        "required_by_default": False,
    },
    "yaml": {
        "package_name": "PyYAML",
        "display_name": "PyYAML",
        "required_by_default": False,
    },
    "PIL": {
        "package_name": "Pillow",
        "display_name": "Pillow",
        "required_by_default": False,
    },
    "thop": {
        "package_name": "ultralytics-thop",
        "display_name": "ultralytics-thop",
        "required_by_default": False,
    },
}


def _is_required_by_default(module_name: str, package_info: dict, runtime_name: str) -> bool:
    required_by_default = bool(package_info.get("required_by_default", False))
    if module_name == "pytorch_optimizer" and is_amd_rocm_runtime(runtime_name):
        return False
    if module_name in {"dadaptation", "schedulefree", "prodigyopt", "prodigyplus", "pytorch_optimizer"} and is_intel_xpu_runtime(runtime_name):
        return False
    return required_by_default

def _short_exc_message(exc: Exception) -> str:
    message = str(exc).strip()
    if not message:
        return exc.__class__.__name__
    return message.splitlines()[0]


def _metadata_version(package_name: str) -> str | None:
    try:
        return metadata.version(package_name)
    except metadata.PackageNotFoundError:
        return None
    except Exception:
        return None


def _safe_find_spec(module_name: str):
    try:
        return importlib.util.find_spec(module_name)
    except Exception:
        return None


def inspect_runtime_package(module_name: str, probe_import: bool = True) -> dict:
    runtime_name = infer_runtime_environment_name()
    package_info = PACKAGE_REGISTRY.get(
        module_name,
        {
            "package_name": module_name.replace("_", "-"),
            "display_name": module_name,
            "required_by_default": False,
        },
    )
    package_name = package_info["package_name"]
    display_name = package_info["display_name"]
    required_by_default = _is_required_by_default(module_name, package_info, runtime_name)
    try:
        if module_name == "sageattention" and is_sagebwd_nvidia_runtime():
            probe = probe_runtime_sagebwd()
            reason = "SageBwd pre-prepared runtime: current build keeps Sage/SageBwd disabled here until the official SageBwd code is released."
            if probe.get("importable"):
                reason = (
                    f"{reason} Probe source={probe.get('source', '') or 'unknown'}; "
                    f"native_backward={bool(probe.get('native_backward'))}."
                )
            return {
                "module_name": module_name,
                "package_name": package_name,
                "display_name": display_name,
                "required_by_default": required_by_default,
                "installed": bool(probe.get("importable")),
                "importable": bool(probe.get("importable")),
                "version": _metadata_version(package_name),
                "reason": reason,
            }
        if module_name == "pytorch_optimizer" and (is_amd_rocm_runtime(runtime_name) or is_intel_xpu_runtime(runtime_name)):
            version = _metadata_version(package_name)
            spec = _safe_find_spec(module_name)
            installed = spec is not None or version is not None
            runtime_label = "AMD Windows ROCm" if is_amd_rocm_runtime(runtime_name) else "Intel XPU"
            return {
                "module_name": module_name,
                "package_name": package_name,
                "display_name": display_name,
                "required_by_default": required_by_default,
                "installed": installed,
                "importable": False,
                "version": version,
                "reason": f"{runtime_label} 实验运行时当前不把 pytorch-optimizer 作为可用基线；该包在此运行时的兼容性不完整，已交由运行时守卫自动回退。",
            }

        if module_name == "bitsandbytes" and (is_amd_rocm_runtime(runtime_name) or is_intel_xpu_runtime(runtime_name)):
            version = _metadata_version(package_name)
            spec = _safe_find_spec(module_name)
            installed = spec is not None or version is not None
            runtime_label = "AMD Windows ROCm" if is_amd_rocm_runtime(runtime_name) else "Intel XPU"
            return {
                "module_name": module_name,
                "package_name": package_name,
                "display_name": display_name,
                "required_by_default": required_by_default,
                "installed": installed,
                "importable": False,
                "version": version,
                "reason": f"{runtime_label} 实验运行时当前不把 bitsandbytes 作为可用基线；8bit / Paged 优化器已在该运行时隐藏并自动回退。",
            }

        version = _metadata_version(package_name)
        spec = _safe_find_spec(module_name)
        installed = spec is not None or version is not None
        importable = False
        reason = ""

        if not installed:
            reason = "Package is not installed in the active runtime."
        elif not probe_import:
            importable = True
        else:
            try:
                importlib.import_module(module_name)
                importable = True
            except Exception as exc:  # pragma: no cover - import failure depends on local runtime
                reason = _short_exc_message(exc)

        return {
            "module_name": module_name,
            "package_name": package_name,
            "display_name": display_name,
            "required_by_default": required_by_default,
            "installed": installed,
            "importable": importable,
            "version": version,
            "reason": reason,
        }
    except Exception as exc:
        return {
            "module_name": module_name,
            "package_name": package_name,
            "display_name": display_name,
            "required_by_default": required_by_default,
            "installed": False,
            "importable": False,
            "version": None,
            "reason": f"runtime package inspection failed: {_short_exc_message(exc)}",
        }


def build_runtime_status_payload(module_names: Iterable[str] | None = None, probe_import: bool = True) -> dict:
    tracked_modules = list(module_names or PACKAGE_REGISTRY.keys())
    packages = {
        module_name: inspect_runtime_package(module_name, probe_import=probe_import)
        for module_name in tracked_modules
    }
    inspection_errors = [
        f"{module_name}: {package['reason']}"
        for module_name, package in packages.items()
        if str(package.get("reason", "")).startswith("runtime package inspection failed:")
    ]
    required_ready = all(
        package["importable"]
        for package in packages.values()
        if package["required_by_default"]
    )
    return {
        "environment": infer_runtime_environment_name(),
        "python_executable": sys.executable,
        "python_version": sys.version.split()[0],
        "required_ready": required_ready,
        "packages": packages,
        "inspection_errors": inspection_errors,
    }


def analyze_training_runtime_dependencies(config: dict) -> dict:
    requirements = collect_training_dependency_requirements(config)
    if not requirements:
        return {
            "ready": True,
            "required": [],
            "missing": [],
        }

    required_records = []
    missing_records = []
    for module_name, required_for in requirements.items():
        package_status = inspect_runtime_package(module_name, probe_import=True)
        record = {
            **package_status,
            "required_for": required_for,
        }
        required_records.append(record)
        if not package_status["importable"]:
            missing_records.append(record)

    return {
        "ready": len(missing_records) == 0,
        "required": required_records,
        "missing": missing_records,
    }
