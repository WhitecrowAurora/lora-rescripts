import {
  fetchGraphicCards,
  fetchPresets,
  fetchSchemaHashes,
  fetchSchemasAll,
  fetchTagEditorStatus,
  fetchTasks,
} from "../services/api";
import { setHtml, setText } from "../shared/domUtils";
import { renderSchemaBrowser, renderSchemaCoverage, renderTrainingCatalog } from "../renderers/pageInventoryRenderers";
import { formatGpuList, formatTagEditor, formatTaskSummary } from "../shared/statusFormatters";
import type { RuntimePackageRecord } from "../shared/types";
import { appRoutes } from "../routing/router";
import { trainingRouteConfigs } from "../training/trainingRouteConfig";
import { loadTrainingAutosave, loadTrainingHistory, loadTrainingRecipes } from "../training/trainingStorage";

const WORKSPACE_RUNTIME_PACKAGES = [
  "pytorch_optimizer",
  "schedulefree",
  "bitsandbytes",
  "prodigyplus",
];

function formatRuntimePackages(packages?: Record<string, RuntimePackageRecord>) {
  if (!packages) {
    return "runtime packages unavailable";
  }

  const tracked = WORKSPACE_RUNTIME_PACKAGES
    .map((name) => packages[name])
    .filter((record): record is RuntimePackageRecord => Boolean(record));
  if (tracked.length === 0) {
    return "runtime packages unavailable";
  }

  return tracked
    .map((record) => `${record.display_name}:${record.importable ? "ready" : record.installed ? "broken" : "missing"}`)
    .join(" | ");
}

export async function bindWorkspaceData() {
  const results = await Promise.allSettled([
    fetchSchemaHashes(),
    fetchPresets(),
    fetchTasks(),
    fetchGraphicCards(),
    fetchTagEditorStatus(),
    fetchSchemasAll(),
  ]);

  const [schemaResult, presetResult, taskResult, gpuResult, tagEditorResult, schemaAllResult] = results;

  if (schemaResult.status === "fulfilled") {
    const schemas = schemaResult.value.data?.schemas ?? [];
    setText("diag-schemas-title", `${schemas.length} schema hashes loaded`);
    setText("diag-schemas-detail", schemas.slice(0, 4).map((schema) => schema.name).join(", ") || "No schema names returned.");
  } else {
    setText("diag-schemas-title", "Schema hash request failed");
    setText("diag-schemas-detail", schemaResult.reason instanceof Error ? schemaResult.reason.message : "Unknown error");
  }

  if (presetResult.status === "fulfilled") {
    const presets = presetResult.value.data?.presets ?? [];
    setText("diag-presets-title", `${presets.length} presets loaded`);
    setText("diag-presets-detail", "Source migration can reuse preset grouping later.");
  } else {
    setText("diag-presets-title", "Preset request failed");
    setText("diag-presets-detail", presetResult.reason instanceof Error ? presetResult.reason.message : "Unknown error");
  }

  if (taskResult.status === "fulfilled") {
    const tasks = taskResult.value.data?.tasks ?? [];
    setText("diag-tasks-title", "Task manager reachable");
    setText("diag-tasks-detail", formatTaskSummary(tasks));
  } else {
    setText("diag-tasks-title", "Task request failed");
    setText("diag-tasks-detail", taskResult.reason instanceof Error ? taskResult.reason.message : "Unknown error");
  }

  if (gpuResult.status === "fulfilled") {
    const cards = gpuResult.value.data?.cards ?? [];
    const xformers = gpuResult.value.data?.xformers;
    const runtime = gpuResult.value.data?.runtime;
    const xformersSummary = xformers
      ? `xformers: ${xformers.installed ? "installed" : "missing"}, ${xformers.supported ? "supported" : "fallback"}`
      : "xformers info unavailable";
    const runtimeSummary = runtime
      ? `${runtime.environment} Python ${runtime.python_version} | ${formatRuntimePackages(runtime.packages)}`
      : "runtime dependency status unavailable";
    setText("diag-gpu-title", `${cards.length} GPU entries reachable`);
    setText("diag-gpu-detail", `${formatGpuList(cards)} | ${xformersSummary} | ${runtimeSummary}`);
  } else {
    setText("diag-gpu-title", "GPU request failed");
    setText("diag-gpu-detail", gpuResult.reason instanceof Error ? gpuResult.reason.message : "Unknown error");
  }

  if (tagEditorResult.status === "fulfilled") {
    setText("diag-tageditor-title", "Tag editor status reachable");
    setText("diag-tageditor-detail", formatTagEditor(tagEditorResult.value));
  } else {
    setText("diag-tageditor-title", "Tag editor status request failed");
    setText("diag-tageditor-detail", tagEditorResult.reason instanceof Error ? tagEditorResult.reason.message : "Unknown error");
  }

  if (schemaAllResult.status === "fulfilled") {
    const schemas = schemaAllResult.value.data?.schemas ?? [];
    renderSchemaBrowser(schemas);
    renderSchemaCoverage(schemas);
    renderTrainingRouteCatalog(schemas, presetResult.status === "fulfilled" ? presetResult.value.data?.presets ?? [] : []);
  } else {
    setHtml("schema-browser", `<p>${schemaAllResult.reason instanceof Error ? schemaAllResult.reason.message : "Schema inventory request failed."}</p>`);
    renderTrainingRouteCatalog([], presetResult.status === "fulfilled" ? presetResult.value.data?.presets ?? [] : []);
  }
}

function inferTrainingFamily(schemaName: string) {
  if (schemaName.includes("controlnet")) {
    return "ControlNet";
  }
  if (schemaName.includes("textual-inversion") || schemaName.includes("xti")) {
    return "Textual Inversion";
  }
  if (schemaName.includes("finetune") || schemaName === "dreambooth") {
    return "Finetune";
  }
  return "LoRA";
}

function inferRouteCapabilities(config: { routeId: string; schemaName: string }, schemaSource: string, family: string) {
  const capabilities: string[] = ["preflight", "prompt workspace", "history", "recipes"];

  if (schemaSource.includes("resume:")) {
    capabilities.push("resume");
  }
  if (schemaSource.includes("prompt_file") || schemaSource.includes("positive_prompts")) {
    capabilities.push("sample prompts");
  }
  if (schemaSource.includes("validation_split")) {
    capabilities.push("validation");
  }
  if (schemaSource.includes("masked_loss")) {
    capabilities.push("masked loss");
  }
  if (schemaSource.includes("save_state")) {
    capabilities.push("save state");
  }
  if (schemaSource.includes("conditioning_data_dir")) {
    capabilities.push("conditioning");
  }
  if (family === "Textual Inversion") {
    capabilities.push("embeddings");
  }
  if (family === "ControlNet") {
    capabilities.push("controlnet");
  }
  if (config.routeId.startsWith("sdxl")) {
    capabilities.push("experimental clip-skip");
  }

  return [...new Set(capabilities)];
}

function renderTrainingRouteCatalog(
  schemas: Array<{ name: string; schema?: string }>,
  presets: Array<Record<string, unknown>>
) {
  const schemaMap = new Map(schemas.map((schema) => [schema.name, String(schema.schema ?? "")]));

  const records = Object.values(trainingRouteConfigs)
    .map((config) => {
      const route = appRoutes.find((entry) => entry.id === config.routeId);
      const family = inferTrainingFamily(config.schemaName);
      const schemaSource = schemaMap.get(config.schemaName) ?? "";
      const presetCount = presets.filter((preset) => {
        const metadata = (preset.metadata ?? {}) as Record<string, unknown>;
        const trainType = metadata.train_type;
        if (typeof trainType !== "string" || trainType.trim().length === 0) {
          return false;
        }
        return config.presetTrainTypes.includes(trainType);
      }).length;
      const localHistoryCount = loadTrainingHistory(config.routeId).length;
      const localRecipeCount = loadTrainingRecipes(config.routeId).length;
      const autosaveReady = Boolean(loadTrainingAutosave(config.routeId)?.value);

      return {
        routeId: config.routeId,
        title: route?.label ?? config.modelLabel,
        routeHash: route?.hash ?? "#/workspace",
        schemaName: config.schemaName,
        modelLabel: config.modelLabel,
        family,
        presetCount,
        localHistoryCount,
        localRecipeCount,
        autosaveReady,
        schemaAvailable: schemaMap.has(config.schemaName),
        capabilities: inferRouteCapabilities(config, schemaSource, family),
      };
    })
    .sort((left, right) => left.family.localeCompare(right.family) || left.title.localeCompare(right.title));

  renderTrainingCatalog(records);
}
