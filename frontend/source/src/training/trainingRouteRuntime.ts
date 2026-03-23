import { fetchGraphicCards, fetchSchemasAll } from "../services/api";
import { setHtml, setPreText, setText } from "../shared/domUtils";
import { evaluateSchemaCatalog } from "../schema/schemaRuntime";
import {
  buildSchemaBridgeState,
  getSchemaBridgeSelectableRecords,
  getTrainingDomIds,
  type SchemaBridgeState,
  type SchemaEditorDomIds,
} from "../schema/schemaEditor";
import { formatGpuList } from "../shared/statusFormatters";
import type { RuntimePackageRecord } from "../shared/types";
import type { TrainingRouteConfig } from "./trainingRouteConfig";
import { renderGpuSelector, renderTrainSubmitStatus } from "./trainingUi";
import { escapeHtml } from "../shared/textUtils";

const TRACKED_RUNTIME_PACKAGES = [
  "pytorch_optimizer",
  "schedulefree",
  "bitsandbytes",
  "prodigyplus",
  "prodigyopt",
  "lion_pytorch",
  "dadaptation",
  "transformers",
];

function formatRuntimePackageSummary(packages?: Record<string, RuntimePackageRecord>) {
  if (!packages) {
    return "runtime dependency status unavailable";
  }

  const tracked = TRACKED_RUNTIME_PACKAGES
    .map((name) => packages[name])
    .filter((record): record is RuntimePackageRecord => Boolean(record));

  if (tracked.length === 0) {
    return "runtime dependency status unavailable";
  }

  return tracked
    .map((record) => `${record.display_name}:${record.importable ? "ready" : record.installed ? "broken" : "missing"}`)
    .join(" | ");
}

export type TrainingRouteRuntimeContext = {
  domIds: SchemaEditorDomIds;
  createDefaultState: () => SchemaBridgeState;
};

export async function initializeTrainingRouteRuntime(config: TrainingRouteConfig): Promise<TrainingRouteRuntimeContext | null> {
  const domIds = getTrainingDomIds(config.prefix);
  const [schemaResult, gpuResult] = await Promise.allSettled([fetchSchemasAll(), fetchGraphicCards()]);

  if (gpuResult.status === "fulfilled") {
    const cards = gpuResult.value.data?.cards ?? [];
    const xformers = gpuResult.value.data?.xformers;
    const runtime = gpuResult.value.data?.runtime;
    renderGpuSelector(`${config.prefix}-gpu-selector`, cards);
    setText(
      `${config.prefix}-runtime-title`,
      `${cards.length} GPU entries reachable${runtime ? ` · ${runtime.environment} Python ${runtime.python_version}` : ""}`
    );
    setHtml(
      `${config.prefix}-runtime-body`,
      `
        <p>${escapeHtml(formatGpuList(cards))}</p>
        <p>${escapeHtml(
          xformers
            ? `xformers: ${xformers.installed ? "installed" : "missing"}, ${xformers.supported ? "supported" : "fallback"} (${xformers.reason})`
            : "xformers info unavailable"
        )}</p>
        <p>${escapeHtml(formatRuntimePackageSummary(runtime?.packages))}</p>
      `
    );
  } else {
    setText(`${config.prefix}-runtime-title`, "GPU runtime request failed");
    setText(`${config.prefix}-runtime-body`, gpuResult.reason instanceof Error ? gpuResult.reason.message : "Unknown error");
  }

  if (schemaResult.status !== "fulfilled") {
    setText(domIds.summaryId, `${config.modelLabel} schema request failed`);
    setHtml(domIds.sectionsId, `<p>${schemaResult.reason instanceof Error ? escapeHtml(schemaResult.reason.message) : "Unknown error"}</p>`);
    setPreText(domIds.previewId, "{}");
    renderTrainSubmitStatus(config.prefix, "Schema unavailable", `The ${config.modelLabel} training bridge could not load the backend schema.`, "error");
    return null;
  }

  const records = schemaResult.value.data?.schemas ?? [];
  const catalog = evaluateSchemaCatalog(records);
  const preferred = getSchemaBridgeSelectableRecords(catalog).find((record) => record.name === config.schemaName)?.name;

  if (!preferred) {
    setText(domIds.summaryId, `No ${config.schemaName} schema was returned.`);
    setHtml(domIds.sectionsId, `<p>The backend did not expose ${escapeHtml(config.schemaName)}.</p>`);
    renderTrainSubmitStatus(config.prefix, "Schema missing", `The backend did not expose the ${config.schemaName} schema.`, "error");
    return null;
  }

  return {
    domIds,
    createDefaultState: () => buildSchemaBridgeState(catalog, preferred)!,
  };
}
