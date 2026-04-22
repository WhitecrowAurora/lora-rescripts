from __future__ import annotations

from dataclasses import dataclass

from mikazuki.plugins.capabilities import get_capability
from mikazuki.plugins.hook_catalog import get_hook_definition
from mikazuki.plugins.manifest_schema import PluginManifest


@dataclass(frozen=True)
class PolicyDecision:
    enabled: bool
    activation_enabled: bool
    activation_reason: str
    required_tier: int
    requires_user_approval: bool
    requires_trust_verification: bool
    approved: bool
    trust_ok: bool
    reasons: tuple[str, ...]
    unknown_capabilities: tuple[str, ...]
    unknown_hooks: tuple[str, ...]


def infer_required_tier(manifest: PluginManifest) -> tuple[int, list[str], list[str]]:
    tier = 1
    unknown_capabilities: list[str] = []
    unknown_hooks: list[str] = []

    for capability_name in manifest.capabilities:
        capability = get_capability(capability_name)
        if capability is None:
            unknown_capabilities.append(capability_name)
            continue
        tier = max(tier, int(capability.tier))

    for hook in manifest.hooks:
        hook_definition = get_hook_definition(hook.event)
        if hook_definition is None:
            unknown_hooks.append(hook.event)
            continue
        tier = max(tier, int(hook_definition.tier))

    return tier, sorted(set(unknown_capabilities)), sorted(set(unknown_hooks))


def collect_required_capabilities(manifest: PluginManifest) -> list[str]:
    required = {item for item in manifest.capabilities if str(item).strip()}
    for hook in manifest.hooks:
        hook_definition = get_hook_definition(hook.event)
        if hook_definition is None:
            continue
        required.add(hook_definition.required_capability)
    return sorted(required)


def evaluate_policy(
    *,
    manifest: PluginManifest,
    approval_result: dict,
    trust_result: dict,
    developer_mode: bool,
    activation_enabled: bool = True,
    activation_reason: str = "",
) -> PolicyDecision:
    required_tier, unknown_capabilities, unknown_hooks = infer_required_tier(manifest)
    activation_enabled = bool(activation_enabled)
    activation_reason = str(activation_reason or "").strip()
    reasons: list[str] = []

    if unknown_capabilities:
        reasons.append("unknown_capabilities")
    if unknown_hooks:
        reasons.append("unknown_hooks")

    requires_user_approval = required_tier >= 2
    requires_trust_verification = required_tier >= 3
    approved = bool(approval_result.get("approved"))
    trust_ok = bool(trust_result.get("ok"))

    if requires_user_approval and not approved:
        reasons.append(str(approval_result.get("reason") or "approval_missing"))
    if requires_trust_verification and not trust_ok:
        reasons.append(str(trust_result.get("reason") or "trust_verification_failed"))

    if developer_mode:
        if reasons:
            reasons.append("developer_mode_bypass")
        enabled = True
    else:
        enabled = len(reasons) == 0

    if not activation_enabled and activation_reason:
        reasons.append(activation_reason)

    return PolicyDecision(
        enabled=enabled and activation_enabled,
        activation_enabled=activation_enabled,
        activation_reason=activation_reason,
        required_tier=required_tier,
        requires_user_approval=requires_user_approval,
        requires_trust_verification=requires_trust_verification,
        approved=approved,
        trust_ok=trust_ok,
        reasons=tuple(reasons),
        unknown_capabilities=tuple(unknown_capabilities),
        unknown_hooks=tuple(unknown_hooks),
    )
