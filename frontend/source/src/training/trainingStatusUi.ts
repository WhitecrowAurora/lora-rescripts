import { setHtml } from "../shared/domUtils";
import type { TrainingCheckResult } from "./trainingPayload";
import type { UtilityTone } from "./trainingUiTypes";
import type { TrainingPreflightRecord } from "../shared/types";
import { escapeHtml } from "../shared/textUtils";
import type { TrainingSnapshotRecord } from "./trainingStorage";

function formatPromptSourceLabel(source: string) {
  switch (source) {
    case "prompt_file":
      return "Prompt file";
    case "generated":
      return "Generated from current fields";
    case "random_dataset_prompt_preview":
      return "Random dataset-derived prompt";
    case "legacy_sample_prompts_file":
      return "Legacy sample_prompts file";
    case "legacy_sample_prompts_inline":
      return "Legacy sample_prompts text";
    default:
      return source;
  }
}

function formatDependencyStatus(report: TrainingPreflightRecord["dependencies"]) {
  if (!report || report.required.length === 0) {
    return "";
  }

  return `
    <div>
      <strong>Runtime dependencies</strong>
      <ul class="status-list">
        ${report.required
          .map((dependency) => {
            const requirement = dependency.required_for.join(", ");
            const status = dependency.importable
              ? `${dependency.display_name} ready${dependency.version ? ` (${dependency.version})` : ""}`
              : `${dependency.display_name} unavailable${dependency.reason ? `: ${dependency.reason}` : ""}`;
            return `<li>${escapeHtml(`${status} · ${requirement}`)}</li>`;
          })
          .join("")}
      </ul>
    </div>
  `;
}

export function renderTrainSubmitStatus(
  prefix: string,
  title: string,
  detail: string,
  tone: UtilityTone = "idle"
) {
  setHtml(
    `${prefix}-submit-status`,
    `
      <div class="submit-status-box submit-status-${tone}">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(detail)}</p>
      </div>
    `
  );
}

export function renderTrainValidationStatus(prefix: string, checks: TrainingCheckResult, preparationError?: string) {
  if (preparationError) {
    setHtml(
      `${prefix}-validation-status`,
      `
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${escapeHtml(preparationError)}</p>
        </div>
      `
    );
    return;
  }

  const rows = [
    checks.errors.length > 0
      ? `
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${checks.errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `
      : "",
    checks.warnings.length > 0
      ? `
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${checks.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `
      : "",
  ]
    .filter(Boolean)
    .join("");

  if (!rows) {
    setHtml(
      `${prefix}-validation-status`,
      `
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `
    );
    return;
  }

  setHtml(
    `${prefix}-validation-status`,
    `
      <div class="submit-status-box ${checks.errors.length > 0 ? "submit-status-error" : "submit-status-warning"}">
        <strong>${checks.errors.length > 0 ? "Action needed before launch" : "Review before launch"}</strong>
        ${rows}
      </div>
    `
  );
}

export function setTrainingUtilityNote(prefix: string, message: string, tone: UtilityTone = "idle") {
  const element = document.querySelector<HTMLElement>(`#${prefix}-utility-note`);
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove("utility-note-success", "utility-note-warning", "utility-note-error");
  if (tone === "success") {
    element.classList.add("utility-note-success");
  } else if (tone === "warning") {
    element.classList.add("utility-note-warning");
  } else if (tone === "error") {
    element.classList.add("utility-note-error");
  }
}

export function renderTrainingAutosaveStatus(prefix: string, autosaveRecord?: TrainingSnapshotRecord | null) {
  if (!autosaveRecord?.value) {
    setHtml(
      `${prefix}-autosave-status`,
      `
        <div class="coverage-list">
          <span class="coverage-pill coverage-pill-muted">No local autosave stored yet</span>
        </div>
      `
    );
    return;
  }

  const selectedGpuCount = Array.isArray(autosaveRecord.gpu_ids) ? autosaveRecord.gpu_ids.length : 0;
  setHtml(
    `${prefix}-autosave-status`,
    `
      <div class="coverage-list">
        <span class="coverage-pill">Autosave ready</span>
        <span class="coverage-pill coverage-pill-muted">${escapeHtml(autosaveRecord.time)}</span>
        <span class="coverage-pill coverage-pill-muted">${selectedGpuCount > 0 ? `${selectedGpuCount} GPU${selectedGpuCount === 1 ? "" : "s"}` : "default GPU selection"}</span>
      </div>
      <p class="training-autosave-note">${escapeHtml(autosaveRecord.name || "Unnamed autosave snapshot")}</p>
    `
  );
}

export function renderTrainingPreflightReport(prefix: string, report?: TrainingPreflightRecord | null, errorMessage?: string) {
  if (errorMessage) {
    setHtml(
      `${prefix}-preflight-report`,
      `
        <div class="submit-status-box submit-status-error">
          <strong>Preflight request failed</strong>
          <p>${escapeHtml(errorMessage)}</p>
        </div>
      `
    );
    return;
  }

  if (!report) {
    setHtml(
      `${prefix}-preflight-report`,
      `
        <div class="submit-status-box">
          <strong>Training preflight has not run yet</strong>
          <p>Run preflight to verify dataset, model, resume path, prompt preview, and runtime fallback expectations before launch.</p>
        </div>
      `
    );
    return;
  }

  const sections = [
    report.errors.length
      ? `
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${report.errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `
      : "",
    report.warnings.length
      ? `
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${report.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `
      : "",
    report.notes.length
      ? `
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${report.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `
      : "",
    formatDependencyStatus(report.dependencies),
    report.dataset
      ? `
          <div>
            <strong>Dataset</strong>
            <ul class="status-list">
              <li>${escapeHtml(report.dataset.path)}</li>
              <li>${report.dataset.image_count} images · ${report.dataset.effective_image_count} effective images</li>
              <li>${report.dataset.alpha_capable_image_count} alpha-capable candidates</li>
              <li>${(report.dataset.caption_coverage * 100).toFixed(1)}% caption coverage</li>
              <li>${report.dataset.images_without_caption_count} without captions · ${report.dataset.broken_image_count} broken images</li>
            </ul>
          </div>
        `
      : "",
    report.conditioning_dataset
      ? `
          <div>
            <strong>Conditioning dataset</strong>
            <ul class="status-list">
              <li>${escapeHtml(report.conditioning_dataset.path)}</li>
              <li>${report.conditioning_dataset.image_count} images · ${(report.conditioning_dataset.caption_coverage * 100).toFixed(1)}% caption coverage</li>
            </ul>
          </div>
        `
      : "",
    report.sample_prompt
      ? `
          <div>
            <strong>Sample prompt preview</strong>
            <p class="training-preflight-meta">${escapeHtml(formatPromptSourceLabel(report.sample_prompt.source))}${report.sample_prompt.detail ? ` · ${escapeHtml(report.sample_prompt.detail)}` : ""}</p>
            <pre class="preset-preview">${escapeHtml(report.sample_prompt.preview)}</pre>
          </div>
        `
      : "",
  ]
    .filter(Boolean)
    .join("");

  setHtml(
    `${prefix}-preflight-report`,
    `
      <div class="submit-status-box ${report.errors.length > 0 ? "submit-status-error" : report.can_start ? "submit-status-success" : "submit-status-warning"}">
        <strong>${report.can_start ? "Backend preflight passed" : "Backend preflight found launch blockers"}</strong>
        <p>Training type: ${escapeHtml(report.training_type)}</p>
        ${sections}
      </div>
    `
  );
}
