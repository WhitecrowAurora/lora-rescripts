import { pickFile } from "../services/api";
import { syncManagedSchedulerFields } from "../training/trainingOptionRegistry";
import type { SchemaField } from "./schemaRuntime";
import { getTableRows, renderSchemaPreview } from "./schemaEditorFieldRendering";
import type { SchemaBridgeState, SchemaEditorDomIds } from "./schemaEditorTypes";

function coerceFieldValue(field: SchemaField, rawValue: string | boolean) {
  const schema = field.schema;
  if (schema.kind === "boolean") {
    return Boolean(rawValue);
  }

  if (schema.kind === "number") {
    const text = String(rawValue).trim();
    if (text === "") {
      return "";
    }

    const parsed = Number(text);
    return Number.isNaN(parsed) ? "" : parsed;
  }

  if (schema.kind === "array") {
    return String(rawValue)
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return rawValue;
}

function getFieldByPath(state: SchemaBridgeState, path: string) {
  return state.sections.flatMap((section) => section.fields).find((field) => field.path === path);
}

function collectTableEditorValues(container: HTMLElement, path: string) {
  return [...container.querySelectorAll<HTMLInputElement>('[data-field-kind="table-row"]')]
    .filter((input) => input.dataset.fieldPath === path)
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function syncFieldMirrorInputs(
  container: HTMLElement,
  path: string,
  nextValue: unknown,
  sourceElement?: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  const nextValueText = String(nextValue ?? "");

  container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-field-path]").forEach((element) => {
    if (element === sourceElement || element.dataset.fieldPath !== path || element.dataset.fieldKind === "table-row") {
      return;
    }

    if (element instanceof HTMLInputElement && element.type === "checkbox") {
      element.checked = Boolean(nextValue);
      return;
    }

    element.value = nextValueText;
  });

  container.querySelectorAll<HTMLElement>("[data-slider-value-for]").forEach((element) => {
    if (element.dataset.sliderValueFor === path) {
      element.textContent = nextValueText;
    }
  });
}

function setPickerStatus(container: HTMLElement, path: string, message: string, tone: "idle" | "success" | "error" = "idle") {
  container.querySelectorAll<HTMLElement>("[data-picker-status-for]").forEach((element) => {
    if (element.dataset.pickerStatusFor !== path) {
      return;
    }

    element.textContent = message;
    element.classList.remove("is-success", "is-error");
    if (tone === "success") {
      element.classList.add("is-success");
    } else if (tone === "error") {
      element.classList.add("is-error");
    }
  });
}

export function attachSchemaEditorFieldListeners(
  state: SchemaBridgeState,
  domIds: SchemaEditorDomIds,
  onStateChange: (state: SchemaBridgeState) => void,
  remountState: (state: SchemaBridgeState) => void
) {
  const container = document.querySelector<HTMLElement>(`#${domIds.sectionsId}`);
  if (!container) {
    return;
  }

  const conditionalKeys = new Set(state.sections.flatMap((section) => (section.conditional ? Object.keys(section.constants) : [])));

  container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-field-path]").forEach((element) => {
    const fieldKind = element.dataset.fieldKind;
    const eventName =
      element instanceof HTMLInputElement && element.type === "checkbox"
        ? "change"
        : element instanceof HTMLSelectElement
          ? "change"
          : "input";
    element.addEventListener(eventName, () => {
      const path = element.dataset.fieldPath;
      if (!path) {
        return;
      }

      const sectionField = getFieldByPath(state, path);
      if (!sectionField) {
        return;
      }

      if (fieldKind === "table-row") {
        state.values[path] = collectTableEditorValues(container, path);
      } else {
        const rawValue =
          element instanceof HTMLInputElement && element.type === "checkbox" ? element.checked : element.value;
        state.values[path] = coerceFieldValue(sectionField, rawValue);
        syncManagedSchedulerFields(state.values, path);
        syncFieldMirrorInputs(container, path, state.values[path], element);
        if (path === "lr_scheduler") {
          syncFieldMirrorInputs(container, "lr_scheduler_type", state.values.lr_scheduler_type);
        } else if (path === "lr_scheduler_type") {
          syncFieldMirrorInputs(container, "lr_scheduler", state.values.lr_scheduler);
        }
      }

      if (conditionalKeys.has(path)) {
        remountState({ ...state, values: { ...state.values } });
        return;
      }

      renderSchemaPreview(state, domIds.previewId);
      onStateChange(state);
    });
  });

  container.querySelectorAll<HTMLButtonElement>("[data-table-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const path = button.dataset.tableAdd;
      if (!path) {
        return;
      }

      state.values[path] = [...getTableRows(state.values[path]), ""];
      remountState({ ...state, values: { ...state.values } });
    });
  });

  container.querySelectorAll<HTMLButtonElement>("[data-table-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const path = button.dataset.tableRemove;
      const index = Number(button.dataset.tableIndex ?? "-1");
      if (!path || index < 0) {
        return;
      }

      const nextRows = getTableRows(state.values[path]).filter((_, rowIndex) => rowIndex !== index);
      state.values[path] = nextRows;
      remountState({ ...state, values: { ...state.values } });
    });
  });

  container.querySelectorAll<HTMLButtonElement>("[data-picker-path]").forEach((button) => {
    button.addEventListener("click", async () => {
      const path = button.dataset.pickerPath;
      const pickerType = button.dataset.pickerType || "model-file";
      if (!path) {
        return;
      }

      const sectionField = getFieldByPath(state, path);
      if (!sectionField) {
        return;
      }

      button.setAttribute("disabled", "true");
      setPickerStatus(container, path, "Waiting for native picker...", "idle");

      try {
        const pickedPath = await pickFile(pickerType);
        state.values[path] = coerceFieldValue(sectionField, pickedPath);
        syncFieldMirrorInputs(container, path, state.values[path]);
        setPickerStatus(container, path, pickedPath, "success");

        if (conditionalKeys.has(path)) {
          remountState({ ...state, values: { ...state.values } });
          return;
        }

        renderSchemaPreview(state, domIds.previewId);
        onStateChange(state);
      } catch (error) {
        setPickerStatus(
          container,
          path,
          error instanceof Error ? error.message : "The picker failed to return a value.",
          "error"
        );
      } finally {
        button.removeAttribute("disabled");
      }
    });
  });
}
