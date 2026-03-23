import type { SchemaBridgeState } from "../schema/schemaEditor";
import { previewTrainingSamplePrompt, pickFile } from "../services/api";
import type { TrainingSamplePromptRecord } from "../shared/types";
import { setHtml } from "../shared/domUtils";
import { escapeHtml } from "../shared/textUtils";
import { downloadTextFile } from "./trainingStorage";
import { setTrainingUtilityNote } from "./trainingStatusUi";
import type { TrainingRouteConfig } from "./trainingRouteConfig";
import type { EditableRecordMode, PreparedTrainingPayload } from "./trainingRouteState";

type BuildPreparedTrainingPayload = (state: SchemaBridgeState) => PreparedTrainingPayload;

type ApplyEditableRecord = (
  record: Record<string, unknown>,
  gpuIds?: string[],
  mode?: EditableRecordMode
) => void;

function renderSamplePromptPlaceholder(prefix: string, title: string, detail: string) {
  setHtml(
    `${prefix}-sample-prompt-workspace`,
    `
      <div class="submit-status-box">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(detail)}</p>
      </div>
    `
  );
}

function formatPromptSource(source: string) {
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

export function invalidateTrainingSamplePromptWorkspace(prefix: string) {
  renderSamplePromptPlaceholder(
    prefix,
    "Sample prompt workspace is waiting for refresh",
    "Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used."
  );
}

export function renderTrainingSamplePromptWorkspace(
  prefix: string,
  record?: TrainingSamplePromptRecord | null,
  errorMessage?: string
) {
  if (errorMessage) {
    setHtml(
      `${prefix}-sample-prompt-workspace`,
      `
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${escapeHtml(errorMessage)}</p>
        </div>
      `
    );
    return;
  }

  if (!record) {
    invalidateTrainingSamplePromptWorkspace(prefix);
    return;
  }

  const lists = [
    record.warnings.length
      ? `
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${record.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `
      : "",
    record.notes.length
      ? `
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${record.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `
      : "",
  ]
    .filter(Boolean)
    .join("");

  const toneClass = record.warnings.length > 0 || !record.enabled ? "submit-status-warning" : "submit-status-success";
  const previewHint = record.line_count > 3
    ? `Showing the first 3 non-empty lines out of ${record.line_count}.`
    : `${record.line_count || 0} non-empty line${record.line_count === 1 ? "" : "s"} detected.`;

  setHtml(
    `${prefix}-sample-prompt-workspace`,
    `
      <div class="submit-status-box ${toneClass}">
        <strong>${record.enabled ? "Sample prompt resolved" : "Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${escapeHtml(formatPromptSource(record.source))}${record.detail ? ` · ${escapeHtml(record.detail)}` : ""}</p>
        <p class="training-preflight-meta">${escapeHtml(previewHint)} Download will use ${escapeHtml(record.suggested_file_name)}.</p>
        ${lists}
        <pre class="preset-preview">${escapeHtml(record.preview)}</pre>
      </div>
    `
  );
}

async function resolvePromptRecord(
  config: TrainingRouteConfig,
  getCurrentState: () => SchemaBridgeState | null,
  buildPreparedTrainingPayload: BuildPreparedTrainingPayload
) {
  const currentState = getCurrentState();
  if (!currentState) {
    throw new Error(`${config.modelLabel} editor is not ready yet.`);
  }

  const prepared = buildPreparedTrainingPayload(currentState);
  const result = await previewTrainingSamplePrompt(prepared.payload);
  if (result.status !== "success" || !result.data) {
    throw new Error(result.message || "Sample prompt preview failed.");
  }

  return result.data;
}

export function wireTrainingSamplePromptWorkspace(options: {
  config: TrainingRouteConfig;
  getCurrentState: () => SchemaBridgeState | null;
  buildPreparedTrainingPayload: BuildPreparedTrainingPayload;
  applyEditableRecord: ApplyEditableRecord;
}) {
  const { config, getCurrentState, buildPreparedTrainingPayload, applyEditableRecord } = options;

  document.querySelector<HTMLButtonElement>(`#${config.prefix}-refresh-sample-prompt`)?.addEventListener("click", async () => {
    try {
      const record = await resolvePromptRecord(config, getCurrentState, buildPreparedTrainingPayload);
      renderTrainingSamplePromptWorkspace(config.prefix, record);
      setTrainingUtilityNote(config.prefix, "Sample prompt preview refreshed.", "success");
    } catch (error) {
      renderTrainingSamplePromptWorkspace(
        config.prefix,
        null,
        error instanceof Error ? error.message : "Sample prompt preview failed."
      );
      setTrainingUtilityNote(
        config.prefix,
        error instanceof Error ? error.message : "Sample prompt preview failed.",
        "error"
      );
    }
  });

  document.querySelector<HTMLButtonElement>(`#${config.prefix}-download-sample-prompt`)?.addEventListener("click", async () => {
    try {
      const record = await resolvePromptRecord(config, getCurrentState, buildPreparedTrainingPayload);
      renderTrainingSamplePromptWorkspace(config.prefix, record);
      downloadTextFile(record.suggested_file_name || "sample-prompts.txt", record.content || "");
      setTrainingUtilityNote(config.prefix, `Sample prompt exported as ${record.suggested_file_name}.`, "success");
    } catch (error) {
      renderTrainingSamplePromptWorkspace(
        config.prefix,
        null,
        error instanceof Error ? error.message : "Sample prompt export failed."
      );
      setTrainingUtilityNote(
        config.prefix,
        error instanceof Error ? error.message : "Sample prompt export failed.",
        "error"
      );
    }
  });

  document.querySelector<HTMLButtonElement>(`#${config.prefix}-pick-prompt-file`)?.addEventListener("click", async () => {
    try {
      const path = await pickFile("text-file");
      applyEditableRecord({ prompt_file: path }, undefined, "merge");
      invalidateTrainingSamplePromptWorkspace(config.prefix);
      setTrainingUtilityNote(config.prefix, "Prompt file path inserted into the current form state.", "success");
    } catch (error) {
      setTrainingUtilityNote(config.prefix, error instanceof Error ? error.message : "Prompt file picker failed.", "error");
    }
  });

  document.querySelector<HTMLButtonElement>(`#${config.prefix}-clear-prompt-file`)?.addEventListener("click", () => {
    applyEditableRecord({ prompt_file: "" }, undefined, "merge");
    invalidateTrainingSamplePromptWorkspace(config.prefix);
    setTrainingUtilityNote(config.prefix, "prompt_file cleared from the current form state.", "warning");
  });
}
