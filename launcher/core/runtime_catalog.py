"""Centralized runtime description layer for the launcher."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

from launcher.config import RUNTIMES, RuntimeDef, get_repo_root
from launcher.core.compatibility import (
    build_runtime_capability_tags,
    build_runtime_compatibility_matrix,
)


_RUNTIME_NOTES: Dict[str, Dict[str, str]] = {
    "standard": {
        "notes_zh": "适合作为保守基线，也是排障时最先回退的主线路。",
        "notes_en": "A conservative baseline and the first fallback path for troubleshooting.",
    },
    "sageattention": {
        "notes_zh": "偏向主线前向提速，但对 Anima / TLoRA 这类组合建议先做短跑验证。",
        "notes_en": "Focused on forward-side speedups for mainstream training. Validate first for Anima / TLoRA-style combos.",
    },
    "sageattention2": {
        "notes_zh": "较新的 Sage 路线，适合主线 NVIDIA 训练，但仍建议保留标准线作为回退。",
        "notes_en": "A newer Sage path for mainstream NVIDIA training. Keep Standard available as a fallback.",
    },
    "flashattention": {
        "notes_zh": "当前更适合作为 Anima 的高性能优先路线，也适合需要完整前后向加速的训练。",
        "notes_en": "Currently a strong high-performance path for Anima and for workloads that benefit from forward + backward acceleration.",
    },
    "blackwell": {
        "notes_zh": "面向 RTX 50 系列的主线路，优先追求匹配新架构的稳定与收益。",
        "notes_en": "Primary path for RTX 50 series, aiming for architecture-matched stability and performance.",
    },
    "sageattention-blackwell": {
        "notes_zh": "更激进的 Blackwell 组合线，适合愿意先做验证再投入长训的用户。",
        "notes_en": "A more aggressive Blackwell combination path for users willing to validate before long runs.",
    },
    "intel-xpu": {
        "notes_zh": "Intel XPU 仍属实验路线，建议优先保守参数并保留更多诊断信息。",
        "notes_en": "Intel XPU is still experimental. Start conservatively and keep more diagnostics enabled.",
    },
    "intel-xpu-sage": {
        "notes_zh": "Intel XPU + SageAttention 组合复杂度更高，更适合短跑验证而不是直接长训。",
        "notes_en": "Intel XPU + SageAttention is more complex and better suited for short validation runs than immediate long training.",
    },
    "rocm-amd": {
        "notes_zh": "AMD 路线仍处于实验阶段，建议先以兼容性稳定为目标。",
        "notes_en": "The AMD path is still experimental, so prioritize compatibility stability first.",
    },
}


def _summarize_models(entries: List[Dict[str, Any]], target_status: str) -> List[Dict[str, str]]:
    return [
        {
            "model_id": entry["model_id"],
            "label_zh": entry["label_zh"],
            "label_en": entry["label_en"],
        }
        for entry in entries
        if entry.get("status") == target_status
    ]


def describe_runtime(runtime_def: RuntimeDef, repo_root: Optional[Path] = None) -> Dict[str, Any]:
    """Return the centralized launcher-facing description for a runtime."""

    if repo_root is None:
        repo_root = get_repo_root()

    capability_tags = build_runtime_capability_tags().get(runtime_def.id, [])
    compatibility_entries = build_runtime_compatibility_matrix().get(runtime_def.id, [])
    notes = _RUNTIME_NOTES.get(runtime_def.id, {})
    install_script_paths = [str((repo_root / script_name).resolve()) for script_name in runtime_def.install_scripts]

    return {
        "id": runtime_def.id,
        "name_zh": runtime_def.name_zh,
        "name_en": runtime_def.name_en,
        "desc_zh": runtime_def.desc_zh,
        "desc_en": runtime_def.desc_en,
        "category": runtime_def.category,
        "experimental": runtime_def.experimental,
        "preferred_runtime": runtime_def.preferred_runtime,
        "python_rel_path": runtime_def.python_rel_path,
        "env_dir_names": list(runtime_def.env_dir_names),
        "preferred_env_dirs": [f".\\env\\{name}" for name in runtime_def.env_dir_names],
        "legacy_env_dirs": [f".\\{name}" for name in runtime_def.env_dir_names],
        "install_scripts": list(runtime_def.install_scripts),
        "install_script_paths": install_script_paths,
        "launch_entry": {
            "mode": "python-script",
            "script": "gui.py",
            "cwd": str(repo_root),
        },
        "runtime_env_vars": [
            {"key": key, "value": value}
            for key, value in sorted(runtime_def.env_vars.items())
        ],
        "capability_tags": capability_tags,
        "recommended_models": _summarize_models(compatibility_entries, "recommended"),
        "supported_models": _summarize_models(compatibility_entries, "supported"),
        "caution_models": _summarize_models(compatibility_entries, "caution"),
        "not_recommended_models": _summarize_models(compatibility_entries, "not_recommended"),
        "notes_zh": notes.get("notes_zh", ""),
        "notes_en": notes.get("notes_en", ""),
    }


def build_runtime_catalog(repo_root: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Return the runtime catalog used by launcher pages and planners."""

    if repo_root is None:
        repo_root = get_repo_root()

    return [describe_runtime(runtime_def, repo_root=repo_root) for runtime_def in RUNTIMES]

