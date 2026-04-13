import logging
import math
from dataclasses import dataclass
from typing import List, Optional, Sequence

import torch

logger = logging.getLogger(__name__)


@dataclass
class PCGradStepStats:
    sample_count: int = 0
    total_pairs: int = 0
    conflict_pairs: int = 0
    projections_applied: int = 0
    fallback_reason: Optional[str] = None

    @property
    def conflict_rate(self) -> float:
        if self.total_pairs <= 0:
            return 0.0
        return float(self.conflict_pairs) / float(self.total_pairs)


def _pair_metrics(
    grad_i: Sequence[Optional[torch.Tensor]], grad_j: Sequence[Optional[torch.Tensor]]
) -> tuple[float, float, float]:
    dot = 0.0
    norm_i = 0.0
    norm_j = 0.0

    for tensor_i, tensor_j in zip(grad_i, grad_j):
        if tensor_i is None or tensor_j is None:
            continue
        flat_i = tensor_i.detach().float().reshape(-1)
        flat_j = tensor_j.detach().float().reshape(-1)
        dot += float(torch.dot(flat_i, flat_j).item())
        norm_i += float(torch.dot(flat_i, flat_i).item())
        norm_j += float(torch.dot(flat_j, flat_j).item())

    if norm_i <= 0.0 or norm_j <= 0.0:
        return 0.0, norm_i, norm_j

    cosine = dot / max(math.sqrt(norm_i) * math.sqrt(norm_j), 1e-12)
    return float(cosine), norm_i, norm_j


def _project_gradients_onto_normal_plane(
    target_grads: List[Optional[torch.Tensor]], reference_grads: Sequence[Optional[torch.Tensor]]
) -> bool:
    dot = 0.0
    ref_norm_sq = 0.0

    for target_tensor, reference_tensor in zip(target_grads, reference_grads):
        if target_tensor is None or reference_tensor is None:
            continue
        flat_target = target_tensor.detach().float().reshape(-1)
        flat_reference = reference_tensor.detach().float().reshape(-1)
        dot += float(torch.dot(flat_target, flat_reference).item())
        ref_norm_sq += float(torch.dot(flat_reference, flat_reference).item())

    if ref_norm_sq <= 1e-12:
        return False

    scale = dot / ref_norm_sq
    changed = False
    for index, (target_tensor, reference_tensor) in enumerate(zip(target_grads, reference_grads)):
        if target_tensor is None or reference_tensor is None:
            continue
        target_grads[index] = target_tensor - reference_tensor.to(target_tensor.device, dtype=target_tensor.dtype) * scale
        changed = True

    return changed


def resolve_pcgrad(
    per_sample_grads: Sequence[Sequence[Optional[torch.Tensor]]],
    conflict_threshold: float = 0.0,
    reduction: str = "mean",
) -> tuple[List[Optional[torch.Tensor]], PCGradStepStats]:
    stats = PCGradStepStats(sample_count=len(per_sample_grads))
    if len(per_sample_grads) == 0:
        return [], stats

    mutable_grads: List[List[Optional[torch.Tensor]]] = [
        [tensor.detach().clone() if tensor is not None else None for tensor in grads]
        for grads in per_sample_grads
    ]

    for sample_i in range(len(mutable_grads)):
        for sample_j in range(sample_i + 1, len(mutable_grads)):
            stats.total_pairs += 1
            cosine, _, _ = _pair_metrics(mutable_grads[sample_i], mutable_grads[sample_j])
            if cosine >= conflict_threshold:
                continue
            stats.conflict_pairs += 1
            if _project_gradients_onto_normal_plane(mutable_grads[sample_j], mutable_grads[sample_i]):
                stats.projections_applied += 1

    aggregated: List[Optional[torch.Tensor]] = []
    for param_index in range(len(mutable_grads[0])):
        tensors = [sample[param_index] for sample in mutable_grads if sample[param_index] is not None]
        if not tensors:
            aggregated.append(None)
            continue
        stacked = torch.stack(tensors, dim=0)
        if reduction == "sum":
            aggregated.append(stacked.sum(dim=0))
        else:
            aggregated.append(stacked.mean(dim=0))

    return aggregated, stats
