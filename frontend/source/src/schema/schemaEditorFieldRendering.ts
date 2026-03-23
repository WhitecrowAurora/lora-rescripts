import { setHtml, setPreText } from "../shared/domUtils";
import {
  buildPayloadFromSections,
  isSectionActive,
  RuntimeSchemaNode,
  type EvaluatedSchemaRecord,
  type SchemaField,
} from "./schemaRuntime";
import type { SchemaBridgeState } from "./schemaEditorTypes";
import { escapeHtml } from "../shared/textUtils";
import {
  buildTrainingOptionChoices,
  type TrainingOptionChoice,
  type TrainingOptionKind,
} from "../training/trainingOptionRegistry";

function pathToDomId(path: string) {
  return `field-${path.replaceAll(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function getEnumOptions(schema: RuntimeSchemaNode) {
  if (schema.kind !== "union") {
    return null;
  }

  const options = schema.options
    .filter((option) => option.kind === "const")
    .map((option) => option.literalValue)
    .filter((option) => typeof option === "string" || typeof option === "number" || typeof option === "boolean");

  if (options.length !== schema.options.length) {
    return null;
  }

  return options;
}

function getTrackedTrainingOptionKind(field: SchemaField): TrainingOptionKind | null {
  if (field.path === "optimizer_type") {
    return "optimizer";
  }

  if (field.path === "lr_scheduler") {
    return "scheduler";
  }

  return null;
}

function getEnumChoices(field: SchemaField, value: unknown): TrainingOptionChoice[] | null {
  const enumOptions = getEnumOptions(field.schema);
  if (!enumOptions) {
    return null;
  }

  const trackedKind = getTrackedTrainingOptionKind(field);
  if (!trackedKind) {
    return enumOptions.map((option) => ({
      value: String(option),
      label: String(option),
      description: "",
      hiddenBySettings: false,
    }));
  }

  return buildTrainingOptionChoices(trackedKind, enumOptions, value);
}

function renderEnumChoiceNote(choice: TrainingOptionChoice | undefined) {
  if (!choice?.selectionNote) {
    return "";
  }

  return `<p class="field-helper-note">${escapeHtml(choice.selectionNote)}</p>`;
}

function getRoleConfigValue(schema: RuntimeSchemaNode, key: string) {
  if (!schema.roleConfig || typeof schema.roleConfig !== "object" || Array.isArray(schema.roleConfig)) {
    return undefined;
  }

  const value = (schema.roleConfig as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

export function getTableRows(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? ""));
  }

  if (typeof value === "string" && value.length > 0) {
    return value.split(/\r?\n/);
  }

  return [];
}

function renderTableEditor(field: SchemaField, value: unknown, disabledAttr: string) {
  const rows = getTableRows(value);
  const initialRows = rows.length > 0 ? rows : [""];
  const baseDomId = pathToDomId(field.path);

  return `
    <div class="table-editor" data-table-path="${escapeHtml(field.path)}">
      <div class="table-editor-rows">
        ${initialRows
          .map(
            (rowValue, index) => `
              <div class="table-editor-row">
                <input
                  id="${index === 0 ? baseDomId : `${baseDomId}-${index}`}"
                  class="field-input"
                  data-field-path="${escapeHtml(field.path)}"
                  data-field-kind="table-row"
                  data-field-index="${index}"
                  type="text"
                  value="${escapeHtml(rowValue)}"
                  ${disabledAttr}
                />
                <button
                  class="action-button action-button-ghost action-button-small"
                  data-table-remove="${escapeHtml(field.path)}"
                  data-table-index="${index}"
                  type="button"
                  ${disabledAttr}
                >
                  Remove
                </button>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="table-editor-footer">
        <button
          class="action-button action-button-ghost action-button-small"
          data-table-add="${escapeHtml(field.path)}"
          type="button"
          ${disabledAttr}
        >
          Add row
        </button>
        <span class="table-editor-note">One argument per row.</span>
      </div>
    </div>
  `;
}

function renderSchemaFieldControl(field: SchemaField, value: unknown) {
  const schema = field.schema;
  const domId = pathToDomId(field.path);
  const escapedPath = escapeHtml(field.path);
  const enumChoices = getEnumChoices(field, value);
  const disabledAttr = schema.disabledFlag ? "disabled" : "";
  const roleName = schema.roleName || "";

  if (schema.kind === "boolean") {
    return `
      <label class="checkbox-row" for="${domId}">
        <input id="${domId}" data-field-path="${escapedPath}" data-field-kind="boolean" type="checkbox" ${value ? "checked" : ""} ${disabledAttr} />
        <span>${schema.defaultValue === true ? "default on" : "toggle"}</span>
      </label>
    `;
  }

  if (schema.kind === "array") {
    if (roleName === "table") {
      return renderTableEditor(field, value, disabledAttr);
    }

    const currentValue = Array.isArray(value) ? value.join("\n") : "";
    return `<textarea id="${domId}" class="field-input field-textarea" data-field-path="${escapedPath}" data-field-kind="array" ${disabledAttr}>${escapeHtml(currentValue)}</textarea>`;
  }

  if (enumChoices) {
    const selectedChoice = enumChoices.find((choice) => choice.value === String(value));
    const options = enumChoices
      .map(
        (choice) =>
          `<option value="${escapeHtml(choice.value)}" ${choice.value === String(value) ? "selected" : ""}>${escapeHtml(choice.label)}</option>`
      )
      .join("");
    return `
      <div class="enum-field-control">
        <select id="${domId}" class="field-input" data-field-path="${escapedPath}" data-field-kind="enum" ${disabledAttr}>${options}</select>
        ${renderEnumChoiceNote(selectedChoice)}
      </div>
    `;
  }

  if (schema.kind === "number") {
    const minAttr = schema.minValue !== undefined ? `min="${schema.minValue}"` : "";
    const maxAttr = schema.maxValue !== undefined ? `max="${schema.maxValue}"` : "";
    const stepAttr = schema.stepValue !== undefined ? `step="${schema.stepValue}"` : 'step="any"';

    if (roleName === "slider" && schema.minValue !== undefined && schema.maxValue !== undefined) {
      const sliderValue = value === "" || value === undefined || value === null ? schema.defaultValue ?? schema.minValue : value;
      return `
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${escapedPath}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${escapeHtml(sliderValue)}"
            ${minAttr}
            ${maxAttr}
            ${stepAttr}
            ${disabledAttr}
          />
          <div class="slider-editor-footer">
            <input
              id="${domId}"
              class="field-input slider-number-input"
              data-field-path="${escapedPath}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${escapeHtml(sliderValue)}"
              ${minAttr}
              ${maxAttr}
              ${stepAttr}
              ${disabledAttr}
            />
            <span class="slider-value" data-slider-value-for="${escapedPath}">${escapeHtml(sliderValue)}</span>
          </div>
        </div>
      `;
    }

    return `<input id="${domId}" class="field-input" data-field-path="${escapedPath}" data-field-kind="number" type="number" value="${escapeHtml(value)}" ${minAttr} ${maxAttr} ${stepAttr} ${disabledAttr} />`;
  }

  if (roleName === "textarea") {
    return `<textarea id="${domId}" class="field-input field-textarea" data-field-path="${escapedPath}" data-field-kind="string" ${disabledAttr}>${escapeHtml(value)}</textarea>`;
  }

  if (roleName === "filepicker") {
    const pickerType = getRoleConfigValue(schema, "type") ?? (field.path.endsWith("_dir") || field.path === "resume" ? "folder" : "model-file");
    return `
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${domId}"
            class="field-input"
            data-field-path="${escapedPath}"
            data-field-kind="string"
            type="text"
            value="${escapeHtml(value)}"
            ${disabledAttr}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${escapedPath}"
            data-picker-type="${escapeHtml(pickerType)}"
            type="button"
            ${disabledAttr}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${escapedPath}">
          Uses the backend native ${pickerType === "folder" ? "folder" : "file"} picker.
        </p>
      </div>
    `;
  }

  if (schema.kind === "const") {
    return `<div class="field-readonly"><code>${escapeHtml(schema.literalValue ?? value)}</code></div>`;
  }

  return `<input id="${domId}" class="field-input" data-field-path="${escapedPath}" data-field-kind="string" type="text" value="${escapeHtml(value)}" ${disabledAttr} />`;
}

function renderSchemaField(field: SchemaField, value: unknown) {
  const schema = field.schema;
  const badges = [
    `<span class="mini-badge">${escapeHtml(schema.kind)}</span>`,
    schema.roleName ? `<span class="mini-badge mini-badge-muted">${escapeHtml(schema.roleName)}</span>` : "",
    schema.requiredFlag ? `<span class="mini-badge mini-badge-accent">required</span>` : "",
    schema.disabledFlag ? `<span class="mini-badge mini-badge-muted">disabled</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  const constraints = [
    schema.minValue !== undefined ? `min ${schema.minValue}` : "",
    schema.maxValue !== undefined ? `max ${schema.maxValue}` : "",
    schema.stepValue !== undefined ? `step ${schema.stepValue}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return `
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${pathToDomId(field.path)}">${escapeHtml(field.name)}</label>
          <p class="field-path">${escapeHtml(field.path)}</p>
        </div>
        <div class="mini-badge-row">${badges}</div>
      </div>
      <p class="field-description">${escapeHtml(schema.descriptionText || "No description")}</p>
      ${renderSchemaFieldControl(field, value)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${escapeHtml(schema.defaultValue ?? "(none)")}</span>
        ${constraints ? `<span><strong>Constraints:</strong> ${escapeHtml(constraints)}</span>` : ""}
      </div>
    </article>
  `;
}

export function getVisibleSections(state: SchemaBridgeState) {
  return state.sections.filter((section) => isSectionActive(section, state.values));
}

export function getRenderedPayload(state: SchemaBridgeState) {
  return buildPayloadFromSections(state.sections, state.values);
}

export function renderSchemaSections(state: SchemaBridgeState, sectionsId: string) {
  const visibleSections = getVisibleSections(state);
  if (visibleSections.length === 0) {
    setHtml(sectionsId, "<p>No renderable sections extracted from this schema.</p>");
    return;
  }

  const html = visibleSections
    .map((section) => {
      const fields = section.fields.map((field) => renderSchemaField(field, state.values[field.path])).join("");
      const conditions = section.conditions.length
        ? `<div class="condition-list">${section.conditions.map((condition) => `<span class="coverage-pill coverage-pill-muted">${escapeHtml(condition)}</span>`).join("")}</div>`
        : "";
      return `
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${section.conditional ? "conditional section" : "section"}</p>
              <h3>${escapeHtml(section.title)}</h3>
            </div>
            <span class="coverage-pill">${section.fields.length} fields</span>
          </div>
          ${conditions}
          <div class="field-grid">
            ${fields}
          </div>
        </article>
      `;
    })
    .join("");

  setHtml(sectionsId, html);
}

export function renderSchemaPreview(state: SchemaBridgeState, previewId: string) {
  const sorted = Object.fromEntries(Object.entries(getRenderedPayload(state)).sort(([left], [right]) => left.localeCompare(right)));
  setPreText(previewId, JSON.stringify(sorted, null, 2));
}

export function getSchemaBridgeSelectableRecords(catalog: EvaluatedSchemaRecord[]) {
  return catalog.filter((record) => record.name !== "shared" && record.runtime instanceof RuntimeSchemaNode);
}
