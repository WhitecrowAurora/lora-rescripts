from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping


def _normalize_training_type(training_type: str | None) -> str:
    return str(training_type or "").strip().lower()


def _boolish(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return bool(value)
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _route_family_for_type(training_type: str) -> str:
    normalized = _normalize_training_type(training_type)
    if normalized.startswith("newbie"):
        return "newbie"
    if normalized.startswith("anima"):
        return "anima"
    if normalized.startswith("sdxl"):
        return "sdxl"
    if normalized.startswith("sd3"):
        return "sd3"
    if normalized.startswith("flux"):
        return "flux"
    if normalized.startswith("lumina2"):
        return "lumina2"
    if normalized.startswith("lumina"):
        return "lumina"
    if normalized.startswith("hunyuan-image"):
        return "hunyuan-image"
    if normalized.startswith("sd"):
        return "stable"
    return "generic"


def _route_label_for_type(training_type: str) -> str:
    normalized = _normalize_training_type(training_type)
    if normalized == "newbie-lora":
        return "Newbie LoRA"
    if normalized == "anima-lora":
        return "Anima LoRA"
    if normalized == "anima-finetune":
        return "Anima finetune"
    if normalized == "sdxl-lora":
        return "SDXL LoRA"
    if normalized == "sdxl-finetune":
        return "SDXL finetune"
    if normalized == "sd-lora":
        return "Stable LoRA"
    if normalized == "sd-dreambooth":
        return "Stable DreamBooth"
    if normalized == "flux-lora":
        return "Flux LoRA"
    if normalized == "flux-finetune":
        return "Flux finetune"
    if normalized == "sd3-lora":
        return "SD3 LoRA"
    if normalized == "sd3-finetune":
        return "SD3 finetune"
    if normalized == "lumina-lora":
        return "Lumina LoRA"
    if normalized == "lumina2-lora":
        return "Lumina2 LoRA"
    if normalized == "hunyuan-image-lora":
        return "Hunyuan Image LoRA"
    if normalized:
        return normalized.replace("-", " ").title()
    return "Generic Training"


@dataclass(frozen=True)
class TrainingRouteContract:
    training_type: str
    route_kind: str
    route_label: str
    route_family: str
    runtime_contract_version: str
    source_contract_version: str
    uses_shared_lulynx_contract: bool
    contract_tags: tuple[str, ...]
    capability_flags: tuple[str, ...]
    capability_summary: str

    def as_metadata_fields(self) -> dict[str, str]:
        return {
            "lulynx_route_training_type": self.training_type,
            "lulynx_route_kind": self.route_kind,
            "lulynx_route_label": self.route_label,
            "lulynx_route_family": self.route_family,
            "lulynx_route_runtime_contract": self.runtime_contract_version,
            "lulynx_route_source_contract": self.source_contract_version,
            "lulynx_route_shared_contract": "true" if self.uses_shared_lulynx_contract else "false",
            "lulynx_route_contract_tags": ",".join(self.contract_tags),
            "lulynx_route_capabilities": ",".join(self.capability_flags),
            "lulynx_route_capability_summary": self.capability_summary,
        }


def _build_capabilities(training_type: str, config: Mapping[str, Any] | None = None) -> tuple[tuple[str, ...], str]:
    normalized = _normalize_training_type(training_type)
    config = config or {}
    flags: list[str] = ["shared-contract", "shared-metadata", "shared-banner"]

    if normalized.startswith("newbie"):
        flags.extend(
            [
                "newbie-bridge",
                "newbie-cache-phase",
                "newbie-preview-pipeline",
                "newbie-memory-runtime",
                "newbie-state-save",
            ]
        )
        if _boolish(config.get("newbie_two_phase_execution", True)):
            flags.append("two-phase-execution")
        if _boolish(config.get("use_cache", True)):
            flags.append("persistent-cache")
        else:
            flags.append("transient-cache")
        try:
            blocks_to_swap_count = int(config.get("blocks_to_swap", 0) or 0)
        except (TypeError, ValueError):
            blocks_to_swap_count = 0
        if blocks_to_swap_count > 0:
            flags.append("block-swap")
        summary = "Newbie pipeline ties planning, cache, preview, memory runtime, and save-state contracts together."
        return tuple(flags), summary

    if normalized.startswith("anima"):
        flags.extend(
            [
                "anima-route-normalization",
                "anima-runtime-summary",
                "anima-metadata-contract",
            ]
        )
        if _boolish(config.get("dora_wd")):
            flags.append("dora")
        if _boolish(config.get("pissa_init")):
            flags.append("pissa")
        if _boolish(config.get("network_swap_to_ram")):
            flags.append("vram-swap-to-ram")
        try:
            blocks_to_swap_count = int(config.get("blocks_to_swap", 0) or 0)
        except (TypeError, ValueError):
            blocks_to_swap_count = 0
        if blocks_to_swap_count > 0:
            flags.append("block-swap")
        summary = "Anima route couples adapter normalization, runtime policy, and export metadata through shared Lulynx contracts."
        return tuple(flags), summary

    if normalized.startswith("sdxl"):
        flags.extend(
            [
                "sdxl-route-normalization",
                "sdxl-low-vram-guard",
                "sdxl-text-cache-contract",
                "sdxl-metadata-contract",
            ]
        )
        if _boolish(config.get("sdxl_low_vram_optimization")):
            flags.append("low-vram-optimization")
        if _boolish(config.get("sdxl_fixed_block_swap")) or _boolish(config.get("sdxl_block_swap_enabled")):
            flags.append("block-swap")
        if _boolish(config.get("cache_text_encoder_outputs")):
            flags.append("text-encoder-cache")
        summary = "SDXL route couples low-VRAM policy, text-cache semantics, and export metadata through shared Lulynx contracts."
        return tuple(flags), summary

    summary = "Generic route participates in the shared Lulynx training contract surface."
    return tuple(flags), summary


def resolve_training_route_contract(
    training_type: str | None,
    *,
    config: Mapping[str, Any] | None = None,
    route_kind_override: str | None = None,
    route_label_override: str | None = None,
) -> TrainingRouteContract:
    normalized = _normalize_training_type(training_type)
    route_family = _route_family_for_type(normalized)
    route_kind = str(route_kind_override or route_family or "generic").strip().lower() or "generic"
    route_label = str(route_label_override or _route_label_for_type(normalized)).strip() or "Generic Training"
    capability_flags, capability_summary = _build_capabilities(normalized, config=config)
    contract_tags = (
        "lulynx",
        route_family,
        "shared-runtime",
        "shared-metadata",
        "shared-summary",
    )
    return TrainingRouteContract(
        training_type=normalized or "generic",
        route_kind=route_kind,
        route_label=route_label,
        route_family=route_family,
        runtime_contract_version="lulynx-runtime-contract-v1",
        source_contract_version="lulynx-route-source-v1",
        uses_shared_lulynx_contract=True,
        contract_tags=contract_tags,
        capability_flags=capability_flags,
        capability_summary=capability_summary,
    )


def attach_route_contract_to_config(
    config: dict[str, Any],
    *,
    training_type: str | None = None,
    route_kind_override: str | None = None,
    route_label_override: str | None = None,
) -> TrainingRouteContract:
    resolved_training_type = _normalize_training_type(training_type or config.get("model_train_type"))
    contract = resolve_training_route_contract(
        resolved_training_type,
        config=config,
        route_kind_override=route_kind_override,
        route_label_override=route_label_override,
    )
    config["_lulynx_route_contract"] = contract.as_metadata_fields()
    config["_lulynx_route_capabilities"] = list(contract.capability_flags)
    config["_lulynx_route_label"] = contract.route_label
    config["_lulynx_route_kind"] = contract.route_kind
    return contract


def extract_route_contract_metadata(config_or_mapping: Mapping[str, Any] | None) -> dict[str, str]:
    if not isinstance(config_or_mapping, Mapping):
        return {}
    contract_value = config_or_mapping.get("_lulynx_route_contract")
    if isinstance(contract_value, Mapping):
        return {str(key): str(value) for key, value in contract_value.items()}
    return {}


def get_route_label(config_or_mapping: Mapping[str, Any] | None, default: str) -> str:
    metadata = extract_route_contract_metadata(config_or_mapping)
    if metadata:
        label = str(metadata.get("lulynx_route_label", "") or "").strip()
        if label:
            return label
    if isinstance(config_or_mapping, Mapping):
        direct_value = str(config_or_mapping.get("_lulynx_route_label", "") or "").strip()
        if direct_value:
            return direct_value
    return str(default or "").strip() or "Generic Training"


def get_route_kind(config_or_mapping: Mapping[str, Any] | None, default: str) -> str:
    metadata = extract_route_contract_metadata(config_or_mapping)
    if metadata:
        kind = str(metadata.get("lulynx_route_kind", "") or "").strip().lower()
        if kind:
            return kind
    if isinstance(config_or_mapping, Mapping):
        direct_value = str(config_or_mapping.get("_lulynx_route_kind", "") or "").strip().lower()
        if direct_value:
            return direct_value
    return str(default or "").strip().lower() or "generic"


__all__ = [
    "TrainingRouteContract",
    "attach_route_contract_to_config",
    "extract_route_contract_metadata",
    "get_route_kind",
    "get_route_label",
    "resolve_training_route_contract",
]
