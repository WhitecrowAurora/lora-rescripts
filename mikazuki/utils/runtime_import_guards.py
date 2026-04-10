from __future__ import annotations

import importlib.abc
import importlib.metadata
import importlib.util
import logging
import os
import sys

from mikazuki.utils.runtime_mode import infer_attention_runtime_mode, is_amd_rocm_runtime, is_intel_xpu_runtime


logger = logging.getLogger(__name__)

_BLOCKED_EXPERIMENTAL_MODULE_PREFIXES = (
    "bitsandbytes",
    "pytorch_optimizer",
)
_IMPORT_GUARD_ENV = "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS"
_IMPORT_GUARD_PATCHED_ENV = "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED"
_IMPORT_GUARD_DEBUG_ENV = "MIKAZUKI_DEBUG_RUNTIME_GUARDS"
_ORIGINAL_FIND_SPEC = None
_ORIGINAL_METADATA_VERSION = None
_ORIGINAL_BACKPORT_METADATA_VERSION = None


def _log_guard_event(message: str, *args) -> None:
    if str(os.environ.get(_IMPORT_GUARD_DEBUG_ENV, "") or "").strip() == "1":
        logger.warning(message, *args)
        return
    logger.info(message, *args)


class _BlockedRuntimeModuleLoader(importlib.abc.Loader):
    def __init__(self, fullname: str, message: str) -> None:
        self.fullname = fullname
        self.message = message

    def create_module(self, spec):
        return None

    def exec_module(self, module) -> None:
        raise ImportError(self.message)


class _BlockedRuntimeModuleFinder(importlib.abc.MetaPathFinder):
    def __init__(self, prefixes: tuple[str, ...], message_factory) -> None:
        self.prefixes = prefixes
        self.message_factory = message_factory

    def find_spec(self, fullname, path=None, target=None):
        normalized = str(fullname or "").strip()
        if not normalized:
            return None
        for prefix in self.prefixes:
            if normalized == prefix or normalized.startswith(prefix + "."):
                import importlib.machinery

                return importlib.machinery.ModuleSpec(
                    normalized,
                    _BlockedRuntimeModuleLoader(normalized, self.message_factory(normalized)),
                )
        return None


def _normalize_distribution_name(name: str) -> str:
    return str(name or "").strip().lower().replace("-", "_")


def _is_blocked_module_name(name: str) -> bool:
    normalized = str(name or "").strip()
    if not normalized:
        return False
    for prefix in _BLOCKED_EXPERIMENTAL_MODULE_PREFIXES:
        if normalized == prefix or normalized.startswith(prefix + "."):
            return True
    return False


def _is_blocked_distribution_name(name: str) -> bool:
    normalized = _normalize_distribution_name(name)
    return normalized in {prefix.replace("-", "_") for prefix in _BLOCKED_EXPERIMENTAL_MODULE_PREFIXES}


def _install_package_probe_guards(runtime_label: str) -> None:
    global _ORIGINAL_FIND_SPEC, _ORIGINAL_METADATA_VERSION, _ORIGINAL_BACKPORT_METADATA_VERSION

    if _ORIGINAL_FIND_SPEC is None:
        _ORIGINAL_FIND_SPEC = importlib.util.find_spec

        def _guarded_find_spec(name, package=None):
            if _is_blocked_module_name(name):
                return None
            return _ORIGINAL_FIND_SPEC(name, package)

        importlib.util.find_spec = _guarded_find_spec

    if _ORIGINAL_METADATA_VERSION is None:
        _ORIGINAL_METADATA_VERSION = importlib.metadata.version

        def _guarded_metadata_version(distribution_name: str) -> str:
            if _is_blocked_distribution_name(distribution_name):
                raise importlib.metadata.PackageNotFoundError(distribution_name)
            return _ORIGINAL_METADATA_VERSION(distribution_name)

        importlib.metadata.version = _guarded_metadata_version

    backport_module = sys.modules.get("importlib_metadata")
    if backport_module is not None and _ORIGINAL_BACKPORT_METADATA_VERSION is None:
        original_backport_version = getattr(backport_module, "version", None)
        if callable(original_backport_version):
            _ORIGINAL_BACKPORT_METADATA_VERSION = original_backport_version

            def _guarded_backport_metadata_version(distribution_name: str) -> str:
                if _is_blocked_distribution_name(distribution_name):
                    raise backport_module.PackageNotFoundError(distribution_name)
                return _ORIGINAL_BACKPORT_METADATA_VERSION(distribution_name)

            backport_module.version = _guarded_backport_metadata_version

    os.environ[_IMPORT_GUARD_PATCHED_ENV] = "1"
    _log_guard_event(
        "Installed experimental runtime package-probe guards for %s: hidden=%s",
        runtime_label,
        ", ".join(_BLOCKED_EXPERIMENTAL_MODULE_PREFIXES),
    )


def _purge_preloaded_blocked_modules(prefixes: tuple[str, ...]) -> list[str]:
    removed: list[str] = []
    for module_name in list(sys.modules.keys()):
        normalized = str(module_name or "").strip()
        if not normalized:
            continue
        for prefix in prefixes:
            if normalized == prefix or normalized.startswith(prefix + "."):
                sys.modules.pop(module_name, None)
                removed.append(normalized)
                break
    return removed


def install_experimental_runtime_import_guards() -> None:
    runtime_mode = infer_attention_runtime_mode()
    if not (is_amd_rocm_runtime(runtime_mode) or is_intel_xpu_runtime(runtime_mode)):
        return

    runtime_label = "AMD ROCm" if is_amd_rocm_runtime(runtime_mode) else "Intel XPU"
    _install_package_probe_guards(runtime_label)

    def _build_message(module_name: str) -> str:
        return (
            f"{runtime_label} experimental runtime blocks import of '{module_name}'. "
            "This runtime does not support NVIDIA-only bitsandbytes optimizers or pytorch_optimizer extras."
        )

    finder = _BlockedRuntimeModuleFinder(_BLOCKED_EXPERIMENTAL_MODULE_PREFIXES, _build_message)
    removed_modules = _purge_preloaded_blocked_modules(_BLOCKED_EXPERIMENTAL_MODULE_PREFIXES)

    for existing in sys.meta_path:
        if isinstance(existing, _BlockedRuntimeModuleFinder):
            os.environ[_IMPORT_GUARD_ENV] = "1"
            if removed_modules:
                _log_guard_event(
                    "Purged preloaded experimental runtime modules for %s before reinstall skip: %s",
                    runtime_label,
                    ", ".join(removed_modules),
                )
            return

    sys.meta_path.insert(0, finder)
    os.environ[_IMPORT_GUARD_ENV] = "1"
    _log_guard_event(
        "Installed experimental runtime import guards for %s: %s",
        runtime_label,
        ", ".join(_BLOCKED_EXPERIMENTAL_MODULE_PREFIXES),
    )
    if removed_modules:
        _log_guard_event(
            "Purged preloaded experimental runtime modules for %s: %s",
            runtime_label,
            ", ".join(removed_modules),
        )
