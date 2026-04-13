
import logging
import math
import random
from typing import Iterable, List

import torch

logger = logging.getLogger(__name__)


class LulynxLisaScheduler:
    """Lightweight LISA scheduler for adapter modules."""

    def __init__(self, modules: Iterable[torch.nn.Module], active_ratio: float = 0.2, interval: int = 1):
        self.modules: List[torch.nn.Module] = []
        self.active_ratio = float(active_ratio)
        self.interval = max(1, int(interval))
        self._last_schedule_step = None

        seen = set()
        for module in modules:
            if module is None:
                continue
            module_id = id(module)
            if module_id in seen:
                continue
            if not any(True for _ in module.parameters(recurse=True)):
                continue
            self.modules.append(module)
            seen.add(module_id)

        if not self.modules:
            logger.warning("[LISA] No adapter modules were found. LISA will stay inactive.")
        else:
            logger.info(
                "[LISA] Initialized with %s adapter modules, active_ratio=%.2f, interval=%s step(s).",
                len(self.modules),
                self.active_ratio,
                self.interval,
            )

    def initialize(self) -> None:
        if self.modules:
            self._apply_schedule(step_marker=0, force=True)

    def schedule_after_optimizer_step(self, global_step: int) -> None:
        if not self.modules:
            return
        if global_step <= 0:
            return
        if global_step % self.interval != 0:
            return
        self._apply_schedule(step_marker=global_step, force=False)

    def reset(self) -> None:
        for module in self.modules:
            for param in module.parameters(recurse=True):
                if getattr(param, "_lulynx_force_frozen", False):
                    param.requires_grad_(False)
                    param.grad = None
                    continue
                param.requires_grad_(True)
        self._last_schedule_step = None

    def _apply_schedule(self, step_marker: int, force: bool) -> None:
        if not force and self._last_schedule_step == step_marker:
            return

        num_modules = len(self.modules)
        num_active = min(num_modules, max(1, int(math.ceil(num_modules * self.active_ratio))))
        active_indices = set(random.sample(range(num_modules), num_active))

        for index, module in enumerate(self.modules):
            is_active = index in active_indices
            for param in module.parameters(recurse=True):
                if getattr(param, "_lulynx_force_frozen", False):
                    param.requires_grad_(False)
                    param.grad = None
                    continue
                param.requires_grad_(is_active)
                if not is_active:
                    param.grad = None

        self._last_schedule_step = step_marker
        logger.info("[LISA] Activated %s/%s adapter modules for the next step window.", num_active, num_modules)
