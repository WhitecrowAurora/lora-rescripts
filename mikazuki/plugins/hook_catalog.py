from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class HookDefinition:
    event: str
    required_capability: str
    tier: int
    read_only_payload: bool
    allows_mutation: bool
    exclusive: bool
    default_priority: int
    description: str


HOOK_DEFINITIONS: tuple[HookDefinition, ...] = (
    HookDefinition(
        event="on_app_start",
        required_capability="read_runtime_stats",
        tier=1,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=0,
        description="Application startup completed.",
    ),
    HookDefinition(
        event="on_config_loaded",
        required_capability="read_train_config",
        tier=1,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=0,
        description="Training config is parsed and normalized.",
    ),
    HookDefinition(
        event="on_dataset_prepared",
        required_capability="read_dataset_meta",
        tier=1,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=0,
        description="Dataset preflight completed.",
    ),
    HookDefinition(
        event="on_train_launch",
        required_capability="read_train_config",
        tier=1,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=0,
        description="Training process has been launched.",
    ),
    HookDefinition(
        event="on_train_complete",
        required_capability="read_step_metrics",
        tier=1,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=0,
        description="Training process completed with final status.",
    ),
    HookDefinition(
        event="before_forward",
        required_capability="hook_before_forward",
        tier=2,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=100,
        description="Observe tensors before model forward.",
    ),
    HookDefinition(
        event="after_loss",
        required_capability="hook_after_loss",
        tier=2,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=100,
        description="Observe outputs after loss is computed.",
    ),
    HookDefinition(
        event="after_backward",
        required_capability="hook_after_backward",
        tier=2,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=100,
        description="Observe state after backward is completed.",
    ),
    HookDefinition(
        event="before_optimizer_step",
        required_capability="hook_before_optimizer_step",
        tier=2,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=100,
        description="Observe state before optimizer step.",
    ),
    HookDefinition(
        event="after_optimizer_step",
        required_capability="hook_after_optimizer_step",
        tier=2,
        read_only_payload=True,
        allows_mutation=False,
        exclusive=False,
        default_priority=100,
        description="Observe state after optimizer step phase completes.",
    ),
    HookDefinition(
        event="modify_loss",
        required_capability="modify_loss",
        tier=3,
        read_only_payload=False,
        allows_mutation=True,
        exclusive=True,
        default_priority=1000,
        description="High-risk hook that can replace or mutate final loss.",
    ),
    HookDefinition(
        event="modify_scheduler_step",
        required_capability="modify_scheduler_step",
        tier=3,
        read_only_payload=False,
        allows_mutation=True,
        exclusive=True,
        default_priority=1000,
        description="High-risk hook that can replace scheduler behavior.",
    ),
    HookDefinition(
        event="modify_optimizer_step",
        required_capability="modify_optimizer_step",
        tier=3,
        read_only_payload=False,
        allows_mutation=True,
        exclusive=True,
        default_priority=1000,
        description="High-risk hook that can replace optimizer stepping behavior.",
    ),
)

HOOK_INDEX: dict[str, HookDefinition] = {
    item.event: item for item in HOOK_DEFINITIONS
}


def get_hook_definition(event: str) -> HookDefinition | None:
    return HOOK_INDEX.get(str(event or "").strip())


def list_hooks() -> list[dict]:
    return [
        {
            "event": item.event,
            "required_capability": item.required_capability,
            "tier": item.tier,
            "read_only_payload": item.read_only_payload,
            "allows_mutation": item.allows_mutation,
            "exclusive": item.exclusive,
            "default_priority": item.default_priority,
            "description": item.description,
        }
        for item in HOOK_DEFINITIONS
    ]
