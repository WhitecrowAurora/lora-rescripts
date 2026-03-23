from __future__ import annotations

import importlib
import importlib.util
import sys
from importlib import metadata
from typing import Iterable


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
}

BUILTIN_LR_SCHEDULERS = {
    "linear",
    "cosine",
    "cosine_with_restarts",
    "polynomial",
    "constant",
    "constant_with_warmup",
}

CUSTOM_SCHEDULER_PREFIX = "__custom__:"


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


def _infer_environment_name() -> str:
    executable = sys.executable.replace("\\", "/").lower()
    if "/python_blackwell/" in executable:
        return "blackwell"
    if "/python_tageditor/" in executable or "/venv-tageditor/" in executable:
        return "tageditor"
    if "/venv/" in executable:
        return "venv"
    if "/python/" in executable:
        return "portable"
    return "system"


def inspect_runtime_package(module_name: str, probe_import: bool = True) -> dict:
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
    version = _metadata_version(package_name)
    spec = importlib.util.find_spec(module_name)
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
        "required_by_default": bool(package_info.get("required_by_default", False)),
        "installed": installed,
        "importable": importable,
        "version": version,
        "reason": reason,
    }


def build_runtime_status_payload(module_names: Iterable[str] | None = None, probe_import: bool = True) -> dict:
    tracked_modules = list(module_names or PACKAGE_REGISTRY.keys())
    packages = {
        module_name: inspect_runtime_package(module_name, probe_import=probe_import)
        for module_name in tracked_modules
    }
    required_ready = all(
        package["importable"]
        for package in packages.values()
        if package["required_by_default"]
    )
    return {
        "environment": _infer_environment_name(),
        "python_executable": sys.executable,
        "python_version": sys.version.split()[0],
        "required_ready": required_ready,
        "packages": packages,
    }


def _append_requirement(target: dict[str, list[str]], module_name: str, reason: str) -> None:
    if module_name not in target:
        target[module_name] = []
    if reason not in target[module_name]:
        target[module_name].append(reason)


def _add_optimizer_requirement(target: dict[str, list[str]], optimizer_type: str) -> None:
    if not optimizer_type:
        return

    normalized = optimizer_type.strip()
    lower_name = normalized.lower()

    if "." in normalized:
        module_name = normalized.split(".", 1)[0]
        _append_requirement(target, module_name, f"optimizer_type={normalized}")
        return

    if normalized == "Lion":
        _append_requirement(target, "lion_pytorch", f"optimizer_type={normalized}")
    elif normalized == "AdaFactor":
        _append_requirement(target, "transformers", f"optimizer_type={normalized}")
    elif lower_name.endswith("8bit"):
        _append_requirement(target, "bitsandbytes", f"optimizer_type={normalized}")
    elif lower_name.startswith("dadapt"):
        _append_requirement(target, "dadaptation", f"optimizer_type={normalized}")
    elif normalized == "Prodigy":
        _append_requirement(target, "prodigyopt", f"optimizer_type={normalized}")
    elif lower_name.endswith("schedulefree"):
        _append_requirement(target, "schedulefree", f"optimizer_type={normalized}")


def _add_scheduler_requirement(target: dict[str, list[str]], scheduler_type: str) -> None:
    normalized = scheduler_type.strip()
    if not normalized:
        return

    if normalized.startswith(CUSTOM_SCHEDULER_PREFIX):
        normalized = normalized[len(CUSTOM_SCHEDULER_PREFIX):]

    if normalized in BUILTIN_LR_SCHEDULERS:
        return

    if "." not in normalized:
        return

    module_name = normalized.split(".", 1)[0]
    _append_requirement(target, module_name, f"lr_scheduler_type={normalized}")


def collect_training_dependency_requirements(config: dict) -> dict[str, list[str]]:
    requirements: dict[str, list[str]] = {}
    _add_optimizer_requirement(requirements, str(config.get("optimizer_type", "")).strip())
    _add_scheduler_requirement(requirements, str(config.get("lr_scheduler_type", "")).strip())
    return requirements


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
