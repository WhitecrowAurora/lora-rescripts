import {
  fetchConfigSummary,
  fetchGraphicCards,
  fetchSavedParams,
} from "../services/api";
import { setHtml, setText } from "../shared/domUtils";
import { escapeHtml } from "../shared/textUtils";
import type { RuntimePackageRecord } from "../shared/types";
import {
  getTrainingOptionEntries,
  getTrainingOptionVisibilitySettings,
  resetTrainingOptionVisibility,
  setAllTrainingOptionVisibility,
  setBuiltInTrainingOptionVisibility,
  setTrainingOptionVisibility,
  type TrainingOptionEntry,
  type TrainingOptionKind,
} from "../training/trainingOptionRegistry";

const TRACKED_OPTION_PACKAGES = [
  "pytorch_optimizer",
  "schedulefree",
  "bitsandbytes",
  "prodigyplus",
  "prodigyopt",
  "lion_pytorch",
  "dadaptation",
  "transformers",
];

function renderSourceCoverage(entries: TrainingOptionEntry[], visibleValues: Set<string>) {
  const counts = new Map<string, { total: number; visible: number }>();

  for (const entry of entries) {
    const record = counts.get(entry.sourceLabel) ?? { total: 0, visible: 0 };
    record.total += 1;
    if (visibleValues.has(entry.value)) {
      record.visible += 1;
    }
    counts.set(entry.sourceLabel, record);
  }

  return [...counts.entries()]
    .map(
      ([sourceLabel, record]) =>
        `<span class="coverage-pill ${record.visible > 0 ? "" : "coverage-pill-muted"}">${escapeHtml(sourceLabel)} <strong>${record.visible}/${record.total}</strong></span>`
    )
    .join("");
}

function renderPackageStatePill(record?: RuntimePackageRecord | null) {
  if (!record) {
    return "";
  }

  if (record.importable) {
    return `<span class="coverage-pill">${escapeHtml(record.version ? `${record.display_name} ${record.version}` : `${record.display_name} ready`)}</span>`;
  }

  if (record.installed) {
    return `<span class="coverage-pill coverage-pill-warning">${escapeHtml(`${record.display_name} import failed`)}</span>`;
  }

  return `<span class="coverage-pill coverage-pill-muted">${escapeHtml(`${record.display_name} missing`)}</span>`;
}

function renderOptionCard(
  kind: TrainingOptionKind,
  entry: TrainingOptionEntry,
  enabled: boolean,
  runtimePackages?: Record<string, RuntimePackageRecord>
) {
  const valueLabel = entry.schedulerTypePath
    ? `<strong>Bridge:</strong> <code>${escapeHtml(entry.schedulerTypePath)}</code>`
    : `<strong>Value:</strong> <code>${escapeHtml(entry.value)}</code>`;
  const runtimePackage = entry.packageName ? runtimePackages?.[entry.packageName] : undefined;
  const pills = [
    `<span class="coverage-pill ${enabled ? "" : "coverage-pill-muted"}">${enabled ? "visible" : "hidden"}</span>`,
    `<span class="coverage-pill coverage-pill-muted">${escapeHtml(entry.sourceLabel)}</span>`,
    entry.defaultVisible ? `<span class="coverage-pill">default</span>` : `<span class="coverage-pill coverage-pill-muted">extra</span>`,
    entry.packageName ? `<span class="coverage-pill coverage-pill-muted">${escapeHtml(entry.packageName)}</span>` : "",
    renderPackageStatePill(runtimePackage),
  ]
    .filter(Boolean)
    .join("");

  const runtimeNote = runtimePackage && !runtimePackage.importable
    ? `<p class="settings-option-runtime-note">${escapeHtml(runtimePackage.reason || "This package is not importable in the active runtime.")}</p>`
    : "";

  return `
    <label class="settings-option-card ${enabled ? "is-enabled" : "is-disabled"}">
      <div class="settings-option-card-head">
        <div class="settings-option-check">
          <input
            type="checkbox"
            data-training-option-toggle="${kind}"
            value="${escapeHtml(entry.value)}"
            ${enabled ? "checked" : ""}
          />
          <div>
            <strong>${escapeHtml(entry.label)}</strong>
            <p class="settings-option-meta">${valueLabel}</p>
          </div>
        </div>
        <div class="coverage-list">${pills}</div>
      </div>
      <p class="settings-option-description">${escapeHtml(entry.description)}</p>
      ${runtimeNote}
    </label>
  `;
}

function renderRuntimeSummary(runtimeLabel: string, runtimePackages?: Record<string, RuntimePackageRecord>) {
  setText("settings-runtime-title", runtimeLabel);

  if (!runtimePackages) {
    setText("settings-runtime-body", "No runtime package information was returned.");
    return;
  }

  const trackedRecords = TRACKED_OPTION_PACKAGES
    .map((name) => runtimePackages[name])
    .filter((record): record is RuntimePackageRecord => Boolean(record));
  if (trackedRecords.length === 0) {
    setHtml("settings-runtime-body", "<p>No tracked runtime package records were returned.</p>");
    return;
  }
  const readyCount = trackedRecords.filter((record) => record.importable).length;

  setHtml(
    "settings-runtime-body",
    `
      <p>${escapeHtml(`${readyCount}/${trackedRecords.length} tracked training packages are importable in the active runtime.`)}</p>
      <div class="coverage-list">
        ${trackedRecords
          .map((record) => renderPackageStatePill(record))
          .join("")}
      </div>
      <div class="settings-runtime-grid">
        ${trackedRecords
          .map(
            (record) => `
              <article class="settings-runtime-card">
                <strong>${escapeHtml(record.display_name)}</strong>
                <p class="settings-option-meta"><code>${escapeHtml(record.module_name)}</code></p>
                <p class="settings-option-description">
                  ${escapeHtml(
                    record.importable
                      ? `Ready${record.version ? ` (${record.version})` : ""}`
                      : record.reason || "Package is not importable in the active runtime."
                  )}
                </p>
              </article>
            `
          )
          .join("")}
      </div>
    `
  );
}

function renderVisibilityPanel(kind: TrainingOptionKind, runtimePackages?: Record<string, RuntimePackageRecord>) {
  const entries = getTrainingOptionEntries(kind);
  const visibleValues = new Set(getTrainingOptionVisibilitySettings()[kind]);
  const titleId = `settings-${kind}-title`;
  const bodyId = `settings-${kind}-body`;
  const visibleCount = entries.filter((entry) => visibleValues.has(entry.value)).length;
  const noun = kind === "optimizer" ? "optimizers" : "schedulers";
  const helperText =
    kind === "optimizer"
      ? "Curate what appears in optimizer_type across the rebuilt training routes."
      : "Custom scheduler entries are converted into lr_scheduler_type automatically when you launch training.";

  setText(titleId, `${visibleCount}/${entries.length} ${noun} visible`);
  setHtml(
    bodyId,
    `
      <p>${escapeHtml(helperText)}</p>
      <div class="settings-option-toolbar">
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${kind}:defaults" type="button">Reset defaults</button>
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${kind}:builtins" type="button">Built-ins only</button>
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${kind}:all" type="button">Show all</button>
      </div>
      <div class="coverage-list settings-option-coverage">
        <span class="coverage-pill">${visibleCount} enabled</span>
        ${renderSourceCoverage(entries, visibleValues)}
      </div>
      <div class="settings-option-grid">
        ${entries.map((entry) => renderOptionCard(kind, entry, visibleValues.has(entry.value), runtimePackages)).join("")}
      </div>
    `
  );
}

function bindVisibilityPanel(kind: TrainingOptionKind, runtimePackages?: Record<string, RuntimePackageRecord>) {
  const body = document.querySelector<HTMLElement>(`#settings-${kind}-body`);
  if (!body) {
    return;
  }

  body.querySelectorAll<HTMLInputElement>(`[data-training-option-toggle="${kind}"]`).forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const nextVisible = body.querySelectorAll<HTMLInputElement>(`[data-training-option-toggle="${kind}"]:checked`);
      setTrainingOptionVisibility(
        kind,
        [...nextVisible].map((input) => input.value)
      );
      renderVisibilityPanel(kind, runtimePackages);
      bindVisibilityPanel(kind, runtimePackages);
    });
  });

  body.querySelectorAll<HTMLButtonElement>(`[data-training-option-action^="${kind}:"]`).forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.trainingOptionAction?.split(":")[1];
      if (action === "defaults") {
        resetTrainingOptionVisibility(kind);
      } else if (action === "builtins") {
        setBuiltInTrainingOptionVisibility(kind);
      } else if (action === "all") {
        setAllTrainingOptionVisibility(kind, true);
      }

      renderVisibilityPanel(kind, runtimePackages);
      bindVisibilityPanel(kind, runtimePackages);
    });
  });
}

function renderTrainingOptionPanels(runtimePackages?: Record<string, RuntimePackageRecord>) {
  renderVisibilityPanel("optimizer", runtimePackages);
  renderVisibilityPanel("scheduler", runtimePackages);
  bindVisibilityPanel("optimizer", runtimePackages);
  bindVisibilityPanel("scheduler", runtimePackages);
}

export async function bindSettingsData() {
  const [summaryResult, paramsResult, runtimeResult] = await Promise.allSettled([
    fetchConfigSummary(),
    fetchSavedParams(),
    fetchGraphicCards(),
  ]);

  if (summaryResult.status === "fulfilled") {
    const data = summaryResult.value.data;
    setText("settings-summary-title", `${data?.saved_param_count ?? 0} remembered param groups`);
    setHtml(
      "settings-summary-body",
      `
        <p><strong>Config file:</strong> <code>${escapeHtml(data?.config_path ?? "unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${escapeHtml(data?.last_path || "(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${(data?.saved_param_keys ?? []).map((key) => `<code>${escapeHtml(key)}</code>`).join(", ") || "none"}</p>
      `
    );
  } else {
    setText("settings-summary-title", "Config summary request failed");
    setText("settings-summary-body", summaryResult.reason instanceof Error ? summaryResult.reason.message : "Unknown error");
  }

  if (paramsResult.status === "fulfilled") {
    const data = paramsResult.value.data ?? {};
    const keys = Object.keys(data);
    setText("settings-params-title", `${keys.length} saved param entries`);
    setHtml(
      "settings-params-body",
      keys.length
        ? `<div class="coverage-list">${keys.map((key) => `<span class="coverage-pill coverage-pill-muted">${escapeHtml(key)}</span>`).join("")}</div>`
        : "<p>No saved params returned.</p>"
    );
  } else {
    setText("settings-params-title", "Saved params request failed");
    setText("settings-params-body", paramsResult.reason instanceof Error ? paramsResult.reason.message : "Unknown error");
  }

  if (runtimeResult.status === "fulfilled") {
    const runtime = runtimeResult.value.data?.runtime;
    renderRuntimeSummary(
      runtime
        ? `${runtime.environment} runtime · Python ${runtime.python_version}`
        : "Runtime dependency status unavailable",
      runtime?.packages
    );
    renderTrainingOptionPanels(runtime?.packages);
    return;
  }

  setText("settings-runtime-title", "Runtime dependency request failed");
  setText("settings-runtime-body", runtimeResult.reason instanceof Error ? runtimeResult.reason.message : "Unknown error");
  renderTrainingOptionPanels();
}
