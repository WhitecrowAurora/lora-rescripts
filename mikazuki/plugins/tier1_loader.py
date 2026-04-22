from __future__ import annotations

import builtins
import inspect
from pathlib import Path
from typing import Any, Callable

from mikazuki.plugins.tier1_api import Tier1PluginContext


SAFE_IMPORT_MODULES = {
    "collections",
    "collections.abc",
    "dataclasses",
    "datetime",
    "decimal",
    "functools",
    "itertools",
    "json",
    "math",
    "operator",
    "re",
    "statistics",
    "string",
    "typing",
    "mikazuki.plugins.tier1_api",
}


def _is_safe_import(name: str) -> bool:
    normalized = str(name or "").strip()
    if not normalized:
        return False
    if normalized in SAFE_IMPORT_MODULES:
        return True
    for candidate in SAFE_IMPORT_MODULES:
        if normalized.startswith(candidate + "."):
            return True
    return False


def build_guarded_import() -> Callable:
    original_import = builtins.__import__

    def guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
        if level not in {0, None}:
            raise ImportError("Relative imports are not allowed in Tier1 plugins.")
        normalized = str(name or "").strip()
        if not _is_safe_import(normalized):
            raise ImportError(f"Import is not allowed in Tier1 plugins: {normalized}")
        return original_import(name, globals, locals, fromlist, 0)

    return guarded_import


def build_tier1_builtins(
    *,
    context: Tier1PluginContext,
) -> dict[str, Any]:
    guarded_import = build_guarded_import()
    return {
        "__build_class__": builtins.__build_class__,
        "__import__": guarded_import,
        "abs": abs,
        "all": all,
        "any": any,
        "AttributeError": AttributeError,
        "BaseException": BaseException,
        "bool": bool,
        "callable": callable,
        "chr": chr,
        "classmethod": classmethod,
        "dict": dict,
        "enumerate": enumerate,
        "Exception": Exception,
        "filter": filter,
        "float": float,
        "format": format,
        "frozenset": frozenset,
        "hasattr": hasattr,
        "hash": hash,
        "hex": hex,
        "IndexError": IndexError,
        "int": int,
        "isinstance": isinstance,
        "issubclass": issubclass,
        "KeyError": KeyError,
        "len": len,
        "list": list,
        "map": map,
        "max": max,
        "min": min,
        "NameError": NameError,
        "next": next,
        "NotImplementedError": NotImplementedError,
        "object": object,
        "ord": ord,
        "pow": pow,
        "print": context.logger.info,
        "property": property,
        "range": range,
        "repr": repr,
        "reversed": reversed,
        "round": round,
        "RuntimeError": RuntimeError,
        "set": set,
        "slice": slice,
        "sorted": sorted,
        "staticmethod": staticmethod,
        "str": str,
        "sum": sum,
        "super": super,
        "tuple": tuple,
        "TypeError": TypeError,
        "ValueError": ValueError,
        "zip": zip,
    }


def load_tier1_plugin_source(
    *,
    entry_path: Path,
    context: Tier1PluginContext,
) -> dict[str, Any]:
    source = entry_path.read_text(encoding="utf-8")
    plugin_globals: dict[str, Any] = {
        "__file__": str(entry_path),
        "__name__": f"_tier1_plugin_{context.plugin_id.replace('.', '_').replace(':', '_')}",
        "__package__": "",
        "__builtins__": build_tier1_builtins(context=context),
        "PLUGIN_CONTEXT": context,
        "plugin_context": context,
        "plugin_logger": context.logger,
    }
    code = compile(source, str(entry_path), "exec")
    exec(code, plugin_globals, plugin_globals)
    return plugin_globals


def invoke_plugin_callable(
    fn: Callable,
    *,
    payload: Any | None,
    context: Tier1PluginContext,
    phase: str,
) -> Any:
    signature = inspect.signature(fn)
    positional_params = [
        item
        for item in signature.parameters.values()
        if item.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
    ]
    has_varargs = any(
        item.kind == inspect.Parameter.VAR_POSITIONAL for item in signature.parameters.values()
    )

    if phase == "setup":
        if has_varargs or len(positional_params) >= 1:
            return fn(context)
        return fn()

    if has_varargs or len(positional_params) >= 2:
        return fn(payload, context)
    if len(positional_params) == 1:
        return fn(payload)
    return fn()
