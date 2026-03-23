import { setHtml } from "../shared/domUtils";
import type { GraphicCardEntry, GraphicCardRecord } from "../shared/types";
import { escapeHtml } from "../shared/textUtils";

function isGraphicCardRecord(card: GraphicCardEntry): card is GraphicCardRecord {
  return typeof card === "object" && card !== null;
}

function normalizeGpuCard(card: GraphicCardEntry, index: number) {
  if (!isGraphicCardRecord(card)) {
    const match = card.match(/GPU\s+(\d+):/i);
    const value = match ? match[1] : String(index);
    return {
      value,
      label: card,
    };
  }

  const label = card.index ?? card.id ?? index;
  const value = String(label);
  return {
    value,
    label: `GPU ${value}: ${card.name}`,
  };
}

export function renderGpuSelector(containerId: string, cards: GraphicCardEntry[]) {
  if (cards.length === 0) {
    setHtml(containerId, "<p>No GPUs reported. Training will use the backend default environment.</p>");
    return;
  }

  const items = cards
    .map((card, index) => {
      const normalized = normalizeGpuCard(card, index);
      return `
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${escapeHtml(normalized.value)}" />
          <span>${escapeHtml(normalized.label)}</span>
        </label>
      `;
    })
    .join("");

  setHtml(containerId, `<div class="gpu-chip-grid">${items}</div>`);
}

export function readSelectedGpuIds(containerId: string) {
  return [...document.querySelectorAll<HTMLInputElement>(`#${containerId} input[data-gpu-id]:checked`)]
    .map((input) => input.dataset.gpuId)
    .filter((value): value is string => Boolean(value));
}

export function applySelectedGpuIds(prefix: string, gpuIds: string[] = []) {
  const selected = new Set(gpuIds.map((entry) => String(entry)));
  document.querySelectorAll<HTMLInputElement>(`#${prefix}-gpu-selector input[data-gpu-id]`).forEach((input) => {
    const gpuId = input.dataset.gpuId ?? "";
    input.checked = selected.has(gpuId);
  });
}
