import { fetchTasks, runTrainingPreflight, startTraining, terminateTask } from "../services/api";
import type { SchemaBridgeState } from "../schema/schemaEditor";
import type { TrainingRouteConfig } from "./trainingRouteConfig";
import type { PreparedTrainingPayload } from "./trainingRouteState";
import {
  renderTrainSubmitStatus,
  renderTrainValidationStatus,
  renderTrainingPreflightReport,
  setTrainingUtilityNote,
} from "./trainingUi";

type BuildPreparedTrainingPayload = (state: SchemaBridgeState) => PreparedTrainingPayload;

async function performTrainingPreflight(
  config: TrainingRouteConfig,
  payload: Record<string, unknown>
) {
  try {
    const result = await runTrainingPreflight(payload);
    if (result.status !== "success") {
      throw new Error(result.message || "Training preflight failed.");
    }
    renderTrainingPreflightReport(config.prefix, result.data ?? null);
    return result.data ?? null;
  } catch (error) {
    renderTrainingPreflightReport(
      config.prefix,
      null,
      error instanceof Error ? error.message : "Training preflight failed."
    );
    throw error;
  }
}

export function wireTrainingStopControl(config: TrainingRouteConfig) {
  document.querySelector<HTMLButtonElement>(`#${config.prefix}-stop-train`)?.addEventListener("click", async () => {
    try {
      const result = await fetchTasks();
      const runningTask = (result.data?.tasks ?? []).find((task) => String(task.status).toUpperCase() === "RUNNING");
      if (!runningTask) {
        setTrainingUtilityNote(config.prefix, "No running training task was found.", "warning");
        return;
      }

      const taskId = String(runningTask.id ?? runningTask.task_id ?? "");
      if (!taskId) {
        setTrainingUtilityNote(config.prefix, "The running task does not expose an id.", "error");
        return;
      }

      if (!window.confirm(`Stop running task ${taskId}?`)) {
        return;
      }

      await terminateTask(taskId);
      renderTrainSubmitStatus(config.prefix, "Training stop requested", `Sent terminate request for task ${taskId}.`, "warning");
      setTrainingUtilityNote(config.prefix, `Terminate requested for task ${taskId}.`, "warning");
    } catch (error) {
      setTrainingUtilityNote(config.prefix, error instanceof Error ? error.message : "Failed to stop training.", "error");
    }
  });
}

export function wireTrainingStartControl(
  config: TrainingRouteConfig,
  getCurrentState: () => SchemaBridgeState | null,
  buildPreparedTrainingPayload: BuildPreparedTrainingPayload
) {
  document.querySelector<HTMLButtonElement>(`#${config.prefix}-run-preflight`)?.addEventListener("click", async () => {
    const currentState = getCurrentState();
    if (!currentState) {
      renderTrainSubmitStatus(config.prefix, "Editor not ready", `The ${config.modelLabel} schema editor state is not initialized yet.`, "error");
      return;
    }

    try {
      const prepared = buildPreparedTrainingPayload(currentState);
      renderTrainValidationStatus(config.prefix, prepared.checks);
      await performTrainingPreflight(config, prepared.payload);
      setTrainingUtilityNote(config.prefix, "Training preflight completed.", "success");
    } catch (error) {
      setTrainingUtilityNote(config.prefix, error instanceof Error ? error.message : "Training preflight failed.", "error");
    }
  });

  const startButton = document.querySelector<HTMLButtonElement>(`#${config.prefix}-start-train`);
  startButton?.addEventListener("click", async () => {
    const currentState = getCurrentState();
    if (!currentState) {
      renderTrainSubmitStatus(config.prefix, "Editor not ready", `The ${config.modelLabel} schema editor state is not initialized yet.`, "error");
      return;
    }

    startButton.setAttribute("disabled", "true");
    renderTrainSubmitStatus(config.prefix, "Submitting training job...", "Sending the current payload to /api/run.", "idle");
    try {
      const prepared = buildPreparedTrainingPayload(currentState);

      if (prepared.checks.errors.length > 0) {
        renderTrainSubmitStatus(config.prefix, "Fix parameter conflicts first", prepared.checks.errors.join(" "), "error");
        renderTrainValidationStatus(config.prefix, prepared.checks);
        return;
      }

      const preflight = await performTrainingPreflight(config, prepared.payload);
      if (preflight && !preflight.can_start) {
        renderTrainSubmitStatus(
          config.prefix,
          "Resolve preflight errors first",
          preflight.errors.join(" "),
          "error"
        );
        return;
      }

      const result = await startTraining(prepared.payload);
      if (result.status === "success") {
        const warningParts = [...prepared.checks.warnings, ...(preflight?.warnings ?? []), ...(result.data?.warnings ?? [])];
        const warnings = warningParts.join(" ");
        renderTrainSubmitStatus(
          config.prefix,
          "Training request accepted",
          `${result.message || "Training started."}${warnings ? ` ${warnings}` : ""}`,
          warnings ? "warning" : "success"
        );
      } else {
        renderTrainSubmitStatus(config.prefix, "Training request failed", result.message || "Unknown backend failure.", "error");
      }
    } catch (error) {
      renderTrainSubmitStatus(config.prefix, "Training request failed", error instanceof Error ? error.message : "Unknown network error.", "error");
    } finally {
      startButton.removeAttribute("disabled");
    }
  });
}
