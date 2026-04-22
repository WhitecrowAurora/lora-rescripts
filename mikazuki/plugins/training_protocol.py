from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


TRAINING_EVENT_PROTOCOL_VERSION = "tier2.training.v1"

# Some training loops still emit a short internal route name. Keep the legacy
# route field intact for compatibility, but expose a stable resolved type too.
_LEGACY_ROUTE_ALIASES = {
    "anima": "anima-lora",
    "newbie": "newbie-lora",
}


@dataclass(frozen=True)
class TrainingPayloadFieldDefinition:
    name: str
    field_type: str
    required: bool
    description: str


@dataclass(frozen=True)
class TrainingEventProtocolDefinition:
    event: str
    description: str
    fields: tuple[TrainingPayloadFieldDefinition, ...]
    notes: tuple[str, ...] = ()


_COMMON_PROTOCOL_FIELDS: tuple[TrainingPayloadFieldDefinition, ...] = (
    TrainingPayloadFieldDefinition(
        name="protocol_version",
        field_type="string",
        required=True,
        description="Versioned Tier2 training hook payload schema identifier.",
    ),
    TrainingPayloadFieldDefinition(
        name="event",
        field_type="string",
        required=True,
        description="Event name for the emitted training lifecycle snapshot.",
    ),
    TrainingPayloadFieldDefinition(
        name="route",
        field_type="string",
        required=True,
        description="Legacy trainer route emitted by the callsite. Preserved for compatibility.",
    ),
    TrainingPayloadFieldDefinition(
        name="trainer_route",
        field_type="string",
        required=True,
        description="Normalized trainer-local route name.",
    ),
    TrainingPayloadFieldDefinition(
        name="training_type",
        field_type="string",
        required=True,
        description="Resolved training type used for stable cross-trainer matching.",
    ),
    TrainingPayloadFieldDefinition(
        name="declared_training_type",
        field_type="string",
        required=False,
        description="Normalized model_train_type before any fallback is applied.",
    ),
    TrainingPayloadFieldDefinition(
        name="training_type_source",
        field_type="string",
        required=True,
        description="How training_type was resolved: declared, route_alias, route_fallback, or unknown.",
    ),
    TrainingPayloadFieldDefinition(
        name="source",
        field_type="string",
        required=True,
        description="Core emitter identifier for the training loop that produced the event.",
    ),
    TrainingPayloadFieldDefinition(
        name="global_step",
        field_type="integer",
        required=True,
        description="Zero-based optimizer step index before the current step is committed.",
    ),
    TrainingPayloadFieldDefinition(
        name="next_optimizer_step",
        field_type="integer",
        required=True,
        description="One-based optimizer step number that will be reached if the step completes.",
    ),
    TrainingPayloadFieldDefinition(
        name="gradient_accumulation_steps",
        field_type="integer",
        required=True,
        description="Configured gradient accumulation factor.",
    ),
    TrainingPayloadFieldDefinition(
        name="sync_gradients",
        field_type="boolean",
        required=True,
        description="Whether this pass is at a gradient sync / optimizer boundary.",
    ),
    TrainingPayloadFieldDefinition(
        name="extra",
        field_type="object",
        required=True,
        description="Route-specific extension bag. Keys are intentionally open-ended.",
    ),
)

_MICRO_BATCH_FIELDS: tuple[TrainingPayloadFieldDefinition, ...] = (
    TrainingPayloadFieldDefinition(
        name="micro_batch_index",
        field_type="integer",
        required=True,
        description="Current micro-batch index within the step, starting from 1.",
    ),
    TrainingPayloadFieldDefinition(
        name="micro_batch_count",
        field_type="integer",
        required=True,
        description="Total micro-batch count for the current optimizer step.",
    ),
    TrainingPayloadFieldDefinition(
        name="micro_batch_size",
        field_type="integer",
        required=True,
        description="Sample count for the current micro-batch.",
    ),
)

TRAINING_EVENT_PROTOCOL_DEFINITIONS: tuple[TrainingEventProtocolDefinition, ...] = (
    TrainingEventProtocolDefinition(
        event="before_forward",
        description="Readonly snapshot emitted right before model forward.",
        fields=_COMMON_PROTOCOL_FIELDS + _MICRO_BATCH_FIELDS,
        notes=(
            "route keeps the trainer's legacy callsite name for backward compatibility.",
            "training_type is the preferred field for cross-trainer filtering.",
        ),
    ),
    TrainingEventProtocolDefinition(
        event="after_loss",
        description="Readonly snapshot emitted after loss is computed for a micro-batch.",
        fields=_COMMON_PROTOCOL_FIELDS
        + _MICRO_BATCH_FIELDS
        + (
            TrainingPayloadFieldDefinition(
                name="loss",
                field_type="number",
                required=True,
                description="Raw micro-batch loss value before external weighting is accumulated.",
            ),
            TrainingPayloadFieldDefinition(
                name="loss_scale",
                field_type="number",
                required=True,
                description="Scale factor applied to this micro-batch during backward.",
            ),
            TrainingPayloadFieldDefinition(
                name="weighted_loss",
                field_type="number",
                required=True,
                description="Accumulated weighted loss for the current optimizer step so far.",
            ),
        ),
        notes=(
            "weighted_loss may include previous micro-batches from the same step.",
        ),
    ),
    TrainingEventProtocolDefinition(
        event="modify_loss",
        description="Exclusive mutation hook emitted before backward to allow host-approved loss transforms.",
        fields=_COMMON_PROTOCOL_FIELDS
        + _MICRO_BATCH_FIELDS
        + (
            TrainingPayloadFieldDefinition(
                name="loss",
                field_type="number",
                required=True,
                description="Raw scalar loss value before any plugin-driven mutation is applied.",
            ),
            TrainingPayloadFieldDefinition(
                name="loss_scale",
                field_type="number",
                required=True,
                description="Host-side gradient accumulation scale that will be applied after loss mutation.",
            ),
            TrainingPayloadFieldDefinition(
                name="mutation",
                field_type="object",
                required=True,
                description="Mutable directive bag. MVP honors mutation.scale, mutation.bias, mutation.reason, and mutation.metadata.",
            ),
        ),
        notes=(
            "MVP only supports affine host transforms: final_loss = loss * mutation.scale + mutation.bias.",
            "Host ignores unrelated payload mutations and only reads the sanctioned mutation object.",
        ),
    ),
    TrainingEventProtocolDefinition(
        event="after_backward",
        description="Readonly snapshot emitted after backward completes for a micro-batch.",
        fields=_COMMON_PROTOCOL_FIELDS
        + _MICRO_BATCH_FIELDS
        + (
            TrainingPayloadFieldDefinition(
                name="loss",
                field_type="number",
                required=True,
                description="Raw micro-batch loss value that produced the backward pass.",
            ),
            TrainingPayloadFieldDefinition(
                name="loss_scale",
                field_type="number",
                required=True,
                description="Scale factor applied to this micro-batch during backward.",
            ),
            TrainingPayloadFieldDefinition(
                name="backward_loss",
                field_type="number",
                required=True,
                description="Effective loss value submitted into backward after scaling.",
            ),
            TrainingPayloadFieldDefinition(
                name="weighted_loss",
                field_type="number",
                required=True,
                description="Accumulated weighted loss for the current optimizer step so far.",
            ),
        ),
        notes=(
            "This event fires only after backward returns successfully.",
        ),
    ),
    TrainingEventProtocolDefinition(
        event="before_optimizer_step",
        description="Readonly snapshot emitted immediately before optimizer stepping.",
        fields=_COMMON_PROTOCOL_FIELDS
        + (
            TrainingPayloadFieldDefinition(
                name="current_loss",
                field_type="number",
                required=True,
                description="Current step loss value passed into the optimizer phase.",
            ),
            TrainingPayloadFieldDefinition(
                name="optimizer_type",
                field_type="string",
                required=True,
                description="Optimizer class name when available.",
            ),
            TrainingPayloadFieldDefinition(
                name="scheduler_type",
                field_type="string",
                required=True,
                description="LR scheduler class name when available.",
            ),
            TrainingPayloadFieldDefinition(
                name="learning_rates",
                field_type="number[]",
                required=True,
                description="Current optimizer learning rates for up to the first eight param groups.",
            ),
            TrainingPayloadFieldDefinition(
                name="scheduler_last_lr",
                field_type="number[]",
                required=True,
                description="Scheduler-reported learning rates for up to the first eight param groups.",
            ),
            TrainingPayloadFieldDefinition(
                name="max_grad_norm",
                field_type="number",
                required=True,
                description="Configured gradient clipping threshold.",
            ),
        ),
        notes=(
            "This event is emitted before optimizer.step() and scheduler.step() are executed.",
        ),
    ),
    TrainingEventProtocolDefinition(
        event="after_optimizer_step",
        description="Readonly snapshot emitted after the local optimizer phase completes.",
        fields=_COMMON_PROTOCOL_FIELDS
        + (
            TrainingPayloadFieldDefinition(
                name="current_loss",
                field_type="number",
                required=True,
                description="Current step loss value carried through the optimizer phase.",
            ),
            TrainingPayloadFieldDefinition(
                name="optimizer_type",
                field_type="string",
                required=True,
                description="Optimizer class name when available.",
            ),
            TrainingPayloadFieldDefinition(
                name="scheduler_type",
                field_type="string",
                required=True,
                description="LR scheduler class name when available.",
            ),
            TrainingPayloadFieldDefinition(
                name="learning_rates",
                field_type="number[]",
                required=True,
                description="Post-phase optimizer learning rates for up to the first eight param groups.",
            ),
            TrainingPayloadFieldDefinition(
                name="scheduler_last_lr",
                field_type="number[]",
                required=True,
                description="Post-phase scheduler learning rates for up to the first eight param groups.",
            ),
            TrainingPayloadFieldDefinition(
                name="max_grad_norm",
                field_type="number",
                required=True,
                description="Configured gradient clipping threshold.",
            ),
            TrainingPayloadFieldDefinition(
                name="optimizer_step_executed",
                field_type="boolean",
                required=True,
                description="Whether the training loop executed its optimizer step path for this event.",
            ),
            TrainingPayloadFieldDefinition(
                name="scheduler_step_executed",
                field_type="boolean",
                required=True,
                description="Whether the training loop executed its scheduler step path for this event.",
            ),
            TrainingPayloadFieldDefinition(
                name="zero_grad_called",
                field_type="boolean",
                required=True,
                description="Whether the training loop called zero_grad during this optimizer phase.",
            ),
        ),
        notes=(
            "Combine these booleans with sync_gradients when interpreting accelerated or fused optimizer paths.",
        ),
    ),
)

_TRAINING_EVENT_PROTOCOL_INDEX = {
    item.event: item for item in TRAINING_EVENT_PROTOCOL_DEFINITIONS
}


def _normalize_name(value: Any) -> str:
    return str(value or "").strip().lower()


def normalize_training_type_name(value: Any) -> str:
    normalized = _normalize_name(value)
    if not normalized:
        return ""
    return _LEGACY_ROUTE_ALIASES.get(normalized, normalized)


def _jsonish(value: Any, *, depth: int = 0) -> Any:
    if depth >= 4:
        return str(value)
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, dict):
        return {str(key): _jsonish(item, depth=depth + 1) for key, item in list(value.items())[:32]}
    if isinstance(value, (list, tuple, set)):
        return [_jsonish(item, depth=depth + 1) for item in list(value)[:32]]
    return str(value)


def _to_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _optimizer_learning_rates(optimizer) -> list[float]:
    lrs: list[float] = []
    for param_group in list(getattr(optimizer, "param_groups", []) or [])[:8]:
        lr = param_group.get("lr") if isinstance(param_group, dict) else None
        if lr is None:
            continue
        lrs.append(_to_float(lr, 0.0))
    return lrs


def _scheduler_last_lr(lr_scheduler) -> list[float]:
    getter = getattr(lr_scheduler, "get_last_lr", None)
    if not callable(getter):
        return []
    try:
        values = getter()
    except Exception:
        return []
    return [_to_float(item, 0.0) for item in list(values or [])[:8]]


def resolve_training_identity(*, route: Any, training_type: Any) -> dict[str, str]:
    normalized_route = _normalize_name(route)
    declared_training_type = _normalize_name(training_type)
    if declared_training_type:
        resolved_training_type = normalize_training_type_name(declared_training_type)
        training_type_source = "declared"
    else:
        aliased_training_type = normalize_training_type_name(normalized_route)
        if aliased_training_type:
            resolved_training_type = aliased_training_type
            training_type_source = "route_alias" if aliased_training_type != normalized_route else "route_fallback"
        else:
            resolved_training_type = "unknown"
            training_type_source = "unknown"
    return {
        "route": normalized_route,
        "trainer_route": normalized_route or "unknown",
        "training_type": resolved_training_type,
        "declared_training_type": declared_training_type,
        "training_type_source": training_type_source,
    }


def _build_common_payload(
    *,
    event: str,
    route: Any,
    training_type: Any,
    global_step: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None,
    source: str,
) -> dict:
    identity = resolve_training_identity(route=route, training_type=training_type)
    normalized_source = str(source or "").strip() or "unknown"
    current_global_step = _to_int(global_step, 0)
    return {
        "protocol_version": TRAINING_EVENT_PROTOCOL_VERSION,
        "event": str(event or "").strip(),
        "route": identity["route"],
        "trainer_route": identity["trainer_route"],
        "training_type": identity["training_type"],
        "declared_training_type": identity["declared_training_type"],
        "training_type_source": identity["training_type_source"],
        "source": normalized_source,
        "global_step": current_global_step,
        "next_optimizer_step": current_global_step + 1,
        "gradient_accumulation_steps": max(1, _to_int(gradient_accumulation_steps, 1)),
        "sync_gradients": bool(sync_gradients),
        "extra": _jsonish(extra or {}),
    }


def build_before_forward_payload(
    *,
    route: Any,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    payload = _build_common_payload(
        event="before_forward",
        route=route,
        training_type=training_type,
        global_step=global_step,
        gradient_accumulation_steps=gradient_accumulation_steps,
        sync_gradients=sync_gradients,
        extra=extra,
        source=source,
    )
    payload.update(
        {
            "micro_batch_index": max(1, _to_int(micro_batch_index, 1)),
            "micro_batch_count": max(1, _to_int(micro_batch_count, 1)),
            "micro_batch_size": max(1, _to_int(micro_batch_size, 1)),
        }
    )
    return payload


def build_after_loss_payload(
    *,
    route: Any,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    loss_value: Any,
    loss_scale: Any,
    weighted_loss: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    payload = _build_common_payload(
        event="after_loss",
        route=route,
        training_type=training_type,
        global_step=global_step,
        gradient_accumulation_steps=gradient_accumulation_steps,
        sync_gradients=sync_gradients,
        extra=extra,
        source=source,
    )
    payload.update(
        {
            "micro_batch_index": max(1, _to_int(micro_batch_index, 1)),
            "micro_batch_count": max(1, _to_int(micro_batch_count, 1)),
            "micro_batch_size": max(1, _to_int(micro_batch_size, 1)),
            "loss": _to_float(loss_value, 0.0),
            "loss_scale": _to_float(loss_scale, 1.0),
            "weighted_loss": _to_float(weighted_loss, 0.0),
        }
    )
    return payload


def build_modify_loss_payload(
    *,
    route: Any,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    loss_value: Any,
    loss_scale: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    payload = _build_common_payload(
        event="modify_loss",
        route=route,
        training_type=training_type,
        global_step=global_step,
        gradient_accumulation_steps=gradient_accumulation_steps,
        sync_gradients=sync_gradients,
        extra=extra,
        source=source,
    )
    payload.update(
        {
            "micro_batch_index": max(1, _to_int(micro_batch_index, 1)),
            "micro_batch_count": max(1, _to_int(micro_batch_count, 1)),
            "micro_batch_size": max(1, _to_int(micro_batch_size, 1)),
            "loss": _to_float(loss_value, 0.0),
            "loss_scale": _to_float(loss_scale, 1.0),
            "mutation": {
                "scale": 1.0,
                "bias": 0.0,
                "reason": "",
                "metadata": {},
            },
        }
    )
    return payload


def build_after_backward_payload(
    *,
    route: Any,
    training_type: Any,
    global_step: Any,
    micro_batch_index: Any,
    micro_batch_count: Any,
    micro_batch_size: Any,
    loss_value: Any,
    loss_scale: Any,
    backward_loss: Any,
    weighted_loss: Any,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    payload = _build_common_payload(
        event="after_backward",
        route=route,
        training_type=training_type,
        global_step=global_step,
        gradient_accumulation_steps=gradient_accumulation_steps,
        sync_gradients=sync_gradients,
        extra=extra,
        source=source,
    )
    payload.update(
        {
            "micro_batch_index": max(1, _to_int(micro_batch_index, 1)),
            "micro_batch_count": max(1, _to_int(micro_batch_count, 1)),
            "micro_batch_size": max(1, _to_int(micro_batch_size, 1)),
            "loss": _to_float(loss_value, 0.0),
            "loss_scale": _to_float(loss_scale, 1.0),
            "backward_loss": _to_float(backward_loss, 0.0),
            "weighted_loss": _to_float(weighted_loss, 0.0),
        }
    )
    return payload


def build_before_optimizer_step_payload(
    *,
    route: Any,
    training_type: Any,
    global_step: Any,
    current_loss: Any,
    optimizer,
    lr_scheduler,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    max_grad_norm: Any,
    extra: dict | None = None,
    source: str,
) -> dict:
    payload = _build_common_payload(
        event="before_optimizer_step",
        route=route,
        training_type=training_type,
        global_step=global_step,
        gradient_accumulation_steps=gradient_accumulation_steps,
        sync_gradients=sync_gradients,
        extra=extra,
        source=source,
    )
    payload.update(
        {
            "current_loss": _to_float(current_loss, 0.0),
            "optimizer_type": optimizer.__class__.__name__ if optimizer is not None else "",
            "scheduler_type": lr_scheduler.__class__.__name__ if lr_scheduler is not None else "",
            "learning_rates": _optimizer_learning_rates(optimizer),
            "scheduler_last_lr": _scheduler_last_lr(lr_scheduler),
            "max_grad_norm": _to_float(max_grad_norm, 0.0),
        }
    )
    return payload


def build_after_optimizer_step_payload(
    *,
    route: Any,
    training_type: Any,
    global_step: Any,
    current_loss: Any,
    optimizer,
    lr_scheduler,
    gradient_accumulation_steps: Any,
    sync_gradients: bool,
    max_grad_norm: Any,
    optimizer_step_executed: bool,
    scheduler_step_executed: bool,
    zero_grad_called: bool,
    extra: dict | None = None,
    source: str,
) -> dict:
    payload = _build_common_payload(
        event="after_optimizer_step",
        route=route,
        training_type=training_type,
        global_step=global_step,
        gradient_accumulation_steps=gradient_accumulation_steps,
        sync_gradients=sync_gradients,
        extra=extra,
        source=source,
    )
    payload.update(
        {
            "current_loss": _to_float(current_loss, 0.0),
            "optimizer_type": optimizer.__class__.__name__ if optimizer is not None else "",
            "scheduler_type": lr_scheduler.__class__.__name__ if lr_scheduler is not None else "",
            "learning_rates": _optimizer_learning_rates(optimizer),
            "scheduler_last_lr": _scheduler_last_lr(lr_scheduler),
            "max_grad_norm": _to_float(max_grad_norm, 0.0),
            "optimizer_step_executed": bool(optimizer_step_executed),
            "scheduler_step_executed": bool(scheduler_step_executed),
            "zero_grad_called": bool(zero_grad_called),
        }
    )
    return payload


def get_training_event_protocol(event: str) -> dict | None:
    protocol = _TRAINING_EVENT_PROTOCOL_INDEX.get(str(event or "").strip())
    if protocol is None:
        return None
    return {
        "event": protocol.event,
        "protocol_version": TRAINING_EVENT_PROTOCOL_VERSION,
        "description": protocol.description,
        "fields": [
            {
                "name": field.name,
                "type": field.field_type,
                "required": field.required,
                "description": field.description,
            }
            for field in protocol.fields
        ],
        "notes": list(protocol.notes),
    }


def list_training_event_protocols() -> list[dict]:
    return [get_training_event_protocol(item.event) for item in TRAINING_EVENT_PROTOCOL_DEFINITIONS]
