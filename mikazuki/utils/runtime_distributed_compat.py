from __future__ import annotations

import logging


logger = logging.getLogger(__name__)


def apply_torch_distributed_compat_shims() -> None:
    try:
        import torch
    except Exception:
        return

    dist = getattr(torch, "distributed", None)
    if dist is None:
        return

    patched_names: list[str] = []

    if not hasattr(dist, "is_available"):
        setattr(dist, "is_available", lambda: False)
        patched_names.append("is_available")

    if not hasattr(dist, "is_initialized"):
        setattr(dist, "is_initialized", lambda: False)
        patched_names.append("is_initialized")

    if not hasattr(dist, "destroy_process_group"):
        setattr(dist, "destroy_process_group", lambda group=None: None)
        patched_names.append("destroy_process_group")

    if not patched_names:
        return

    logger.info(
        "Applied torch.distributed compatibility shims for the current runtime: %s",
        ", ".join(patched_names),
    )
