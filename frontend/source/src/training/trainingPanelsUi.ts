import { setHtml } from "../shared/domUtils";
import { normalizeTrainingPayload } from "./trainingPayload";
import type { TrainingRecipeRecord, TrainingSnapshotRecord } from "./trainingStorage";
import type { TrainingRouteConfig } from "./trainingRouteConfig";
import type { PanelName, TrainingStateLike } from "./trainingUiTypes";
import type { PresetRecord } from "../shared/types";
import { cloneJson, escapeHtml } from "../shared/textUtils";

function renderPanelSummary(countLabel: string, detail: string) {
  return `
    <div class="training-library-meta">
      <span class="coverage-pill coverage-pill-muted">${escapeHtml(countLabel)}</span>
    </div>
    <p class="training-library-note">${escapeHtml(detail)}</p>
  `;
}

type LibraryCompatibility = {
  compatible: boolean;
  label: string;
  detail: string;
  tone: "default" | "muted" | "warning";
};

function getTrainTypeLabel(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function getPresetCompatibility(config: TrainingRouteConfig, preset: PresetRecord): LibraryCompatibility {
  const metadata = (preset.metadata ?? {}) as Record<string, unknown>;
  const trainType = getTrainTypeLabel(metadata.train_type);
  if (!trainType) {
    return {
      compatible: true,
      label: "generic preset",
      detail: "This preset does not declare a train_type, so review route-specific fields before launch.",
      tone: "muted",
    };
  }

  if (config.presetTrainTypes.includes(trainType)) {
    return {
      compatible: true,
      label: "route preset",
      detail: `Preset metadata matches this route via train_type = ${trainType}.`,
      tone: "default",
    };
  }

  return {
    compatible: false,
    label: "cross-route preset",
    detail: `Preset metadata targets ${trainType}, which does not match ${config.schemaName}.`,
    tone: "warning",
  };
}

export function getRecipeCompatibility(config: TrainingRouteConfig, recipe: TrainingRecipeRecord): LibraryCompatibility {
  const routeId = getTrainTypeLabel(recipe.route_id);
  const trainType = getTrainTypeLabel(recipe.train_type);

  if (routeId === config.routeId) {
    return {
      compatible: true,
      label: "route recipe",
      detail: "This recipe was saved from the same source-side route.",
      tone: "default",
    };
  }

  if (trainType && config.presetTrainTypes.includes(trainType)) {
    return {
      compatible: true,
      label: "family recipe",
      detail: `Recipe metadata matches this route family via train_type = ${trainType}.`,
      tone: "default",
    };
  }

  if (!routeId && !trainType) {
    return {
      compatible: true,
      label: "generic recipe",
      detail: "This recipe has no route metadata, so review route-specific fields before applying it.",
      tone: "muted",
    };
  }

  if (routeId) {
    return {
      compatible: false,
      label: "cross-route recipe",
      detail: `Recipe metadata says it came from ${routeId}, not ${config.routeId}.`,
      tone: "warning",
    };
  }

  return {
    compatible: false,
    label: "foreign train type",
    detail: `Recipe metadata targets ${trainType}, which does not match ${config.schemaName}.`,
    tone: "warning",
  };
}

export function getSnapshotName(config: TrainingRouteConfig, state: TrainingStateLike) {
  const outputName = state.values.output_name;
  if (typeof outputName === "string" && outputName.trim().length > 0) {
    return outputName.trim();
  }
  return `${config.modelLabel} snapshot`;
}

export function getTrainingHistoryPreview(snapshot: TrainingSnapshotRecord) {
  try {
    return JSON.stringify(normalizeTrainingPayload(cloneJson(snapshot.value)), null, 2);
  } catch (error) {
    return error instanceof Error ? error.message : "Unable to preview this snapshot.";
  }
}

export function renderHistoryPanel(prefix: string, entries: TrainingSnapshotRecord[]) {
  if (entries.length === 0) {
    setHtml(
      `${prefix}-history-panel`,
      `
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">history</p>
            <h3>History parameters</h3>
          </div>
          <div class="history-toolbar">
            <button class="action-button action-button-ghost action-button-small" data-history-export="${prefix}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-history-import="${prefix}" type="button">Import</button>
            <button class="action-button action-button-ghost action-button-small" data-history-close="${prefix}" type="button">Close</button>
          </div>
        </div>
        ${renderPanelSummary("0 snapshots", "Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
        <p>No saved parameter snapshots yet.</p>
      `
    );
    return;
  }

  const items = entries
    .map(
      (entry, index) => `
        <article class="history-card">
          <div class="history-card-head">
            <div>
              <h4>${escapeHtml(entry.name || "Unnamed snapshot")}</h4>
              <p class="history-card-meta">${escapeHtml(entry.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${escapeHtml((entry.gpu_ids ?? []).join(", ") || "default GPU")}</span>
          </div>
          <pre class="history-preview">${escapeHtml(getTrainingHistoryPreview(entry))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${index}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${index}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${index}" type="button">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  setHtml(
    `${prefix}-history-panel`,
    `
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">history</p>
          <h3>History parameters</h3>
        </div>
        <div class="history-toolbar">
          <button class="action-button action-button-ghost action-button-small" data-history-export="${prefix}" type="button">Export</button>
          <button class="action-button action-button-ghost action-button-small" data-history-import="${prefix}" type="button">Import</button>
          <button class="action-button action-button-ghost action-button-small" data-history-close="${prefix}" type="button">Close</button>
        </div>
      </div>
      ${renderPanelSummary(`${entries.length} snapshot${entries.length === 1 ? "" : "s"}`, "Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
      <div class="history-list">${items}</div>
    `
  );
}

export function renderPresetPanel(prefix: string, presets: PresetRecord[], config: TrainingRouteConfig) {
  if (presets.length === 0) {
    setHtml(
      `${prefix}-presets-panel`,
      `
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${prefix}" type="button">Close</button>
        </div>
        ${renderPanelSummary("0 presets", "Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
        <p>No presets matched this training route.</p>
      `
    );
    return;
  }

  const items = presets
    .map((preset, index) => {
      const metadata = (preset.metadata ?? {}) as Record<string, unknown>;
      const data = (preset.data ?? {}) as Record<string, unknown>;
      const compatibility = getPresetCompatibility(config, preset);
      const compatibilityClass = compatibility.tone === "warning" ? "coverage-pill-warning" : compatibility.tone === "muted" ? "coverage-pill-muted" : "";
      const trainType = getTrainTypeLabel(metadata.train_type);
      return `
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${escapeHtml(metadata.name || preset.name || `Preset ${index + 1}`)}</h4>
              <p class="preset-card-meta">
                ${escapeHtml(String(metadata.version || "unknown"))}
                · ${escapeHtml(String(metadata.author || "unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${escapeHtml(String(metadata.train_type || "shared"))}</span>
          </div>
          <p>${escapeHtml(String(metadata.description || "No description"))}</p>
          <div class="coverage-list training-card-compatibility">
            <span class="coverage-pill ${compatibilityClass}">${escapeHtml(compatibility.label)}</span>
            ${trainType ? `<span class="coverage-pill coverage-pill-muted">${escapeHtml(trainType)}</span>` : ""}
          </div>
          <p class="training-card-note">${escapeHtml(compatibility.detail)}</p>
          <pre class="preset-preview">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-save-recipe="${index}" type="button">Save recipe</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-merge="${index}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-replace="${index}" type="button">Replace</button>
          </div>
        </article>
      `;
    })
    .join("");

  setHtml(
    `${prefix}-presets-panel`,
    `
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">presets</p>
          <h3>Training presets</h3>
        </div>
        <button class="action-button action-button-ghost action-button-small" data-preset-close="${prefix}" type="button">Close</button>
      </div>
      ${renderPanelSummary(`${presets.length} preset${presets.length === 1 ? "" : "s"}`, "Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
      <div class="preset-list">${items}</div>
    `
  );
}

export function renderRecipePanel(prefix: string, recipes: TrainingRecipeRecord[], config: TrainingRouteConfig) {
  if (recipes.length === 0) {
    setHtml(
      `${prefix}-recipes-panel`,
      `
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">recipes</p>
            <h3>Local recipe library</h3>
          </div>
          <div class="history-toolbar">
            <button class="action-button action-button-ghost action-button-small" data-recipe-export-all="${prefix}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-import="${prefix}" type="button">Import</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-close="${prefix}" type="button">Close</button>
          </div>
        </div>
        ${renderPanelSummary("0 recipes", "Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
        <p>No saved recipes for this route yet.</p>
      `
    );
    return;
  }

  const items = recipes
    .map(
      (recipe, index) => {
        const compatibility = getRecipeCompatibility(config, recipe);
        const compatibilityClass = compatibility.tone === "warning" ? "coverage-pill-warning" : compatibility.tone === "muted" ? "coverage-pill-muted" : "";
        return `
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${escapeHtml(recipe.name)}</h4>
              <p class="preset-card-meta">
                ${escapeHtml(recipe.created_at)}
                ${recipe.train_type ? ` · ${escapeHtml(recipe.train_type)}` : ""}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${escapeHtml(recipe.route_id || "local")}</span>
          </div>
          <p>${escapeHtml(recipe.description || "No description")}</p>
          <div class="coverage-list training-card-compatibility">
            <span class="coverage-pill ${compatibilityClass}">${escapeHtml(compatibility.label)}</span>
            ${recipe.train_type ? `<span class="coverage-pill coverage-pill-muted">${escapeHtml(recipe.train_type)}</span>` : ""}
          </div>
          <p class="training-card-note">${escapeHtml(compatibility.detail)}</p>
          <pre class="preset-preview">${escapeHtml(JSON.stringify(normalizeTrainingPayload(cloneJson(recipe.value)), null, 2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-recipe-merge="${index}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-replace="${index}" type="button">Replace</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-export="${index}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-rename="${index}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-delete="${index}" type="button">Delete</button>
          </div>
        </article>
      `;
      }
    )
    .join("");

  setHtml(
    `${prefix}-recipes-panel`,
    `
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">recipes</p>
          <h3>Local recipe library</h3>
        </div>
        <div class="history-toolbar">
          <button class="action-button action-button-ghost action-button-small" data-recipe-export-all="${prefix}" type="button">Export</button>
          <button class="action-button action-button-ghost action-button-small" data-recipe-import="${prefix}" type="button">Import</button>
          <button class="action-button action-button-ghost action-button-small" data-recipe-close="${prefix}" type="button">Close</button>
        </div>
      </div>
      ${renderPanelSummary(`${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`, "Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
      <div class="preset-list">${items}</div>
    `
  );
}

export function filterPresetsForRoute(config: TrainingRouteConfig, presets: PresetRecord[]) {
  const allowed = new Set(config.presetTrainTypes);
  return presets.filter((preset) => {
    const metadata = (preset.metadata ?? {}) as Record<string, unknown>;
    const trainType = metadata.train_type;
    if (typeof trainType !== "string" || trainType.trim().length === 0) {
      return true;
    }
    return allowed.has(trainType);
  });
}

export function toggleTrainingPanel(prefix: string, panel: PanelName, open: boolean) {
  const historyPanel = document.querySelector<HTMLElement>(`#${prefix}-history-panel`);
  const recipesPanel = document.querySelector<HTMLElement>(`#${prefix}-recipes-panel`);
  const presetsPanel = document.querySelector<HTMLElement>(`#${prefix}-presets-panel`);

  if (historyPanel) {
    historyPanel.hidden = panel === "history" ? !open : true;
  }

  if (recipesPanel) {
    recipesPanel.hidden = panel === "recipes" ? !open : true;
  }

  if (presetsPanel) {
    presetsPanel.hidden = panel === "presets" ? !open : true;
  }
}
