from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CapabilityDefinition:
    name: str
    tier: int
    description: str


CAPABILITY_DEFINITIONS: tuple[CapabilityDefinition, ...] = (
    CapabilityDefinition("read_runtime_stats", 1, "Read runtime summary and backend status."),
    CapabilityDefinition("read_step_metrics", 1, "Read train-step level metrics snapshots."),
    CapabilityDefinition("read_dataset_meta", 1, "Read dataset metadata and counts."),
    CapabilityDefinition("read_train_config", 1, "Read normalized training config snapshots."),
    CapabilityDefinition("hook_before_forward", 2, "Observe before forward pass hook."),
    CapabilityDefinition("hook_after_loss", 2, "Observe after loss computation hook."),
    CapabilityDefinition("hook_after_backward", 2, "Observe after backward pass hook."),
    CapabilityDefinition("hook_before_optimizer_step", 2, "Observe before optimizer step hook."),
    CapabilityDefinition("hook_after_optimizer_step", 2, "Observe after optimizer step hook."),
    CapabilityDefinition("write_aux_logs", 2, "Write plugin-owned logs and metrics artifacts."),
    CapabilityDefinition("modify_loss", 3, "Modify final loss tensor before backward."),
    CapabilityDefinition("modify_scheduler_step", 3, "Modify scheduler stepping behavior."),
    CapabilityDefinition("modify_optimizer_step", 3, "Modify optimizer stepping behavior."),
    CapabilityDefinition("replace_training_component", 3, "Replace model/scheduler/optimizer components."),
    CapabilityDefinition("write_checkpoint", 3, "Write or mutate checkpoint artifacts."),
    CapabilityDefinition("network_access", 3, "Open outbound network requests during training."),
)

CAPABILITY_INDEX: dict[str, CapabilityDefinition] = {
    item.name: item for item in CAPABILITY_DEFINITIONS
}


def list_capabilities() -> list[dict]:
    return [
        {
            "name": item.name,
            "tier": item.tier,
            "description": item.description,
        }
        for item in CAPABILITY_DEFINITIONS
    ]


def get_capability(name: str) -> CapabilityDefinition | None:
    return CAPABILITY_INDEX.get(str(name or "").strip())
