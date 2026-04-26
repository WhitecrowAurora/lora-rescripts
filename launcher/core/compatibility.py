"""Static runtime compatibility hints for common training model families."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

from launcher.config import RUNTIMES


CompatibilityStatus = str

TAG_LIBRARY: Dict[str, Dict[str, str]] = {
    "stable": {"label_zh": "稳定优先", "label_en": "Stability-first", "tone": "success"},
    "high_performance": {"label_zh": "高性能", "label_en": "High performance", "tone": "accent"},
    "experimental": {"label_zh": "实验性", "label_en": "Experimental", "tone": "warning"},
    "anima_friendly": {"label_zh": "Anima 友好", "label_en": "Anima-friendly", "tone": "success"},
    "anima_caution": {"label_zh": "Anima 谨慎", "label_en": "Anima caution", "tone": "warning"},
    "tlora_caution": {"label_zh": "TLoRA 谨慎", "label_en": "TLoRA caution", "tone": "warning"},
    "low_risk": {"label_zh": "低排障成本", "label_en": "Low troubleshooting cost", "tone": "success"},
    "nvidia_mainline": {"label_zh": "NVIDIA 主线", "label_en": "NVIDIA mainline", "tone": "accent"},
    "xpu_path": {"label_zh": "XPU 路线", "label_en": "XPU path", "tone": "warning"},
    "amd_path": {"label_zh": "AMD 路线", "label_en": "AMD path", "tone": "warning"},
}

MODEL_PROFILES: Tuple[Dict[str, str], ...] = (
    {"id": "sdxl", "label_zh": "SDXL", "label_en": "SDXL"},
    {"id": "newbie", "label_zh": "Newbie", "label_en": "Newbie"},
    {"id": "anima", "label_zh": "Anima", "label_en": "Anima"},
    {"id": "tlora", "label_zh": "TLoRA", "label_en": "TLoRA"},
)


def _rule(status: CompatibilityStatus, reason_zh: str, reason_en: str) -> Dict[str, str]:
    return {
        "status": status,
        "reason_zh": reason_zh,
        "reason_en": reason_en,
    }


_RUNTIME_RULES: Dict[str, Dict[str, Dict[str, str]]] = {
    "standard": {
        "sdxl": _rule("recommended", "默认主线，兼容性最好，适合作为首选基线。", "Default mainline path with the broadest compatibility. A good baseline choice."),
        "newbie": _rule("recommended", "默认主线，兼容性和排障成本都更友好。", "Default mainline path with easier compatibility and troubleshooting."),
        "anima": _rule("recommended", "当前更推荐用标准或 FlashAttention 路线运行 Anima。", "Standard or FlashAttention is currently the preferred path for Anima."),
        "tlora": _rule("supported", "可以使用，适合作为稳定保守路线。", "Usable and a good conservative path when stability matters most."),
    },
    "sageattention": {
        "sdxl": _rule("recommended", "SageAttention 1.x 对 SDXL / LoRA 主线通常是高收益路线。", "SageAttention 1.x is usually a high-value path for mainstream SDXL / LoRA training."),
        "newbie": _rule("recommended", "Newbie 主线通常能吃到 SageAttention 的前向收益。", "Newbie usually benefits from SageAttention's forward-side speedup."),
        "anima": _rule("not_recommended", "Anima 当前不建议优先走 SageAttention，建议改用 FlashAttention 2 或标准线路。", "Anima is currently not a preferred SageAttention path. FlashAttention 2 or Standard is recommended instead."),
        "tlora": _rule("caution", "可尝试，但组合稳定性与收益仍需更多验证。", "You can try it, but this combination still needs more validation for stability and benefit."),
    },
    "sageattention2": {
        "sdxl": _rule("recommended", "SageAttention 2.x 对主线 SDXL 往往是更优先的 NVIDIA 加速路线。", "SageAttention 2.x is often the preferred NVIDIA acceleration path for mainstream SDXL."),
        "newbie": _rule("recommended", "Newbie 通常适合这条较新的 SageAttention 路线。", "Newbie usually fits this newer SageAttention path well."),
        "anima": _rule("not_recommended", "Anima 暂不建议优先走 SageAttention 2.x，优先考虑 FlashAttention 2 或标准线路。", "Anima is not currently preferred on SageAttention 2.x. Prefer FlashAttention 2 or Standard."),
        "tlora": _rule("caution", "可尝试，但仍建议先做小样本验证。", "You can try it, but a small validation run is still recommended first."),
    },
    "flashattention": {
        "sdxl": _rule("recommended", "FlashAttention 2 是主流 NVIDIA 卡上比较稳的高性能路线。", "FlashAttention 2 is a strong and stable high-performance path on mainstream NVIDIA GPUs."),
        "newbie": _rule("recommended", "Newbie 通常适合 FlashAttention 2。", "Newbie usually fits FlashAttention 2 well."),
        "anima": _rule("recommended", "Anima 当前更推荐 FlashAttention 2 路线。", "Anima is currently best matched with the FlashAttention 2 path."),
        "tlora": _rule("supported", "可以使用，通常比保守标准线更激进一些。", "Usable and typically a bit more aggressive than the conservative standard path."),
    },
    "blackwell": {
        "sdxl": _rule("recommended", "Blackwell 专用线适合 RTX 50 系列上的主流训练。", "The dedicated Blackwell path is well suited for mainstream training on RTX 50 series GPUs."),
        "newbie": _rule("recommended", "Newbie 主线通常适合 Blackwell 专用运行时。", "Newbie usually fits the dedicated Blackwell runtime."),
        "anima": _rule("recommended", "Anima 可优先尝试 Blackwell 专用线。", "Anima can be tried first on the dedicated Blackwell path."),
        "tlora": _rule("supported", "可以使用，但建议先做小步验证。", "Usable, but a short validation run is still recommended."),
    },
    "sageattention-blackwell": {
        "sdxl": _rule("recommended", "Blackwell + SageAttention 组合适合追求更激进的主线优化。", "Blackwell + SageAttention is a strong option when pushing more aggressive mainstream optimizations."),
        "newbie": _rule("recommended", "Newbie 主线通常适合这条组合线路。", "Newbie usually fits this combined path."),
        "anima": _rule("not_recommended", "Anima 当前不建议优先使用 Blackwell SageAttention 组合。", "Anima is currently not a preferred fit for the Blackwell SageAttention combination."),
        "tlora": _rule("caution", "可尝试，但更建议先做短跑测试。", "You can try it, but a short test run is strongly recommended first."),
    },
    "intel-xpu": {
        "sdxl": _rule("supported", "可尝试，但整体仍属于实验线路。", "Usable, but the overall path is still experimental."),
        "newbie": _rule("supported", "可尝试，建议优先保守配置。", "Usable, with conservative settings recommended first."),
        "anima": _rule("caution", "可尝试，但当前验证样本较少。", "You can try it, but validation coverage is still limited."),
        "tlora": _rule("caution", "可尝试，但建议先做兼容性验证。", "Tryable, but a compatibility validation run is recommended first."),
    },
    "intel-xpu-sage": {
        "sdxl": _rule("caution", "Intel XPU + SageAttention 组合仍偏实验，建议先小样本测试。", "Intel XPU + SageAttention is still experimental. Start with a small test run."),
        "newbie": _rule("caution", "可尝试，但请预期更多兼容性波动。", "You can try it, but expect more compatibility variance."),
        "anima": _rule("caution", "目前不建议直接大规模投入，先做短跑验证。", "Not recommended for large runs yet. Validate with a short run first."),
        "tlora": _rule("caution", "组合复杂度较高，先做小样本检查更稳。", "The combination is complex enough that a short validation run is recommended first."),
    },
    "rocm-amd": {
        "sdxl": _rule("supported", "可尝试，但当前仍属于实验性 AMD 线路。", "Usable, but this AMD path is still experimental."),
        "newbie": _rule("supported", "可尝试，建议优先保守配置。", "Usable, with conservative settings recommended first."),
        "anima": _rule("caution", "可尝试，但当前验证样本偏少。", "You can try it, but validation coverage is still limited."),
        "tlora": _rule("caution", "可尝试，但先做兼容性验证更稳。", "Tryable, but a compatibility validation run is recommended first."),
    },
}

_RUNTIME_TAGS: Dict[str, Tuple[str, ...]] = {
    "standard": ("stable", "low_risk", "anima_friendly", "nvidia_mainline"),
    "sageattention": ("high_performance", "nvidia_mainline", "anima_caution", "tlora_caution"),
    "sageattention2": ("high_performance", "nvidia_mainline", "anima_caution", "tlora_caution"),
    "flashattention": ("high_performance", "nvidia_mainline", "anima_friendly"),
    "blackwell": ("high_performance", "stable", "anima_friendly", "nvidia_mainline"),
    "sageattention-blackwell": ("high_performance", "nvidia_mainline", "anima_caution", "tlora_caution"),
    "intel-xpu": ("experimental", "xpu_path", "tlora_caution"),
    "intel-xpu-sage": ("experimental", "xpu_path", "anima_caution", "tlora_caution"),
    "rocm-amd": ("experimental", "amd_path", "anima_caution", "tlora_caution"),
}


def build_runtime_capability_tags() -> Dict[str, List[Dict[str, str]]]:
    """Return lightweight capability tags keyed by runtime id."""

    result: Dict[str, List[Dict[str, str]]] = {}
    for runtime in RUNTIMES:
        tags: List[Dict[str, str]] = []
        for tag_id in _RUNTIME_TAGS.get(runtime.id, ()):
            tag_info = TAG_LIBRARY.get(tag_id)
            if not tag_info:
                continue
            tags.append(
                {
                    "id": tag_id,
                    "label_zh": tag_info["label_zh"],
                    "label_en": tag_info["label_en"],
                    "tone": tag_info["tone"],
                }
            )
        result[runtime.id] = tags
    return result


def build_runtime_compatibility_matrix() -> Dict[str, List[Dict[str, Any]]]:
    """Return a static compatibility matrix keyed by runtime id."""

    matrix: Dict[str, List[Dict[str, Any]]] = {}
    for runtime in RUNTIMES:
        runtime_rules = _RUNTIME_RULES.get(runtime.id, {})
        entries: List[Dict[str, Any]] = []
        for model in MODEL_PROFILES:
            model_id = model["id"]
            rule = runtime_rules.get(
                model_id,
                _rule(
                    "supported",
                    "当前没有单独标记为风险项，默认按可用处理。",
                    "No special risk flag is recorded for this pairing right now. Treating it as generally usable.",
                ),
            )
            entries.append(
                {
                    "model_id": model_id,
                    "label_zh": model["label_zh"],
                    "label_en": model["label_en"],
                    "status": rule["status"],
                    "reason_zh": rule["reason_zh"],
                    "reason_en": rule["reason_en"],
                }
            )
        matrix[runtime.id] = entries
    return matrix
