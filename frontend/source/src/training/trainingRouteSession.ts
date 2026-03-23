import {
  mountSchemaEditorState,
  type SchemaBridgeState,
  type SchemaEditorDomIds,
} from "../schema/schemaEditor";
import { expandTrainingPayloadToEditableValues } from "./trainingPayload";
import type { TrainingRouteConfig } from "./trainingRouteConfig";
import { persistTrainingAutosave, restoreTrainingAutosave } from "./trainingRouteAutosave";
import { createTrainingStateChangeHandler } from "./trainingRoutePreview";
import { invalidateTrainingSamplePromptWorkspace } from "./trainingPromptWorkspace";
import {
  buildPreparedTrainingPayload,
  buildTrainingStateWithImportedValues,
  mergeTrainingStateWithImportedValues,
  resolveImportedGpuIds,
  trainingRouteStates,
  type EditableRecordMode,
} from "./trainingRouteState";
import { applySelectedGpuIds } from "./trainingUi";

type CreateDefaultState = () => SchemaBridgeState;

export function createTrainingRouteSession(
  config: TrainingRouteConfig,
  domIds: SchemaEditorDomIds,
  createDefaultState: CreateDefaultState
) {
  const getCurrentState = () => trainingRouteStates[config.routeId];
  const prepareTrainingPayload = (state: SchemaBridgeState) => buildPreparedTrainingPayload(config.prefix, state);
  const onStateChange = createTrainingStateChangeHandler(
    config,
    domIds,
    prepareTrainingPayload,
    (state) => persistTrainingAutosave(config, state),
    () => invalidateTrainingSamplePromptWorkspace(config.prefix)
  );

  const mountTrainingState = (nextState: SchemaBridgeState | null) => {
    mountSchemaEditorState(
      nextState,
      domIds,
      (state) => {
        trainingRouteStates[config.routeId] = state;
      },
      onStateChange
    );
  };

  const applyEditableRecord = (
    record: Record<string, unknown>,
    gpuIds?: string[],
    mode: EditableRecordMode = "replace"
  ) => {
    const baseState = mode === "merge"
      ? getCurrentState() ?? createDefaultState()
      : createDefaultState();

    const expanded = expandTrainingPayloadToEditableValues(record);
    const nextState = mode === "merge"
      ? mergeTrainingStateWithImportedValues(baseState, expanded)
      : buildTrainingStateWithImportedValues(baseState, expanded);

    applySelectedGpuIds(config.prefix, resolveImportedGpuIds(expanded, gpuIds));
    mountTrainingState(nextState);
  };

  const restoreAutosave = () =>
    restoreTrainingAutosave({
      config,
      createDefaultState,
      mountTrainingState,
    });

  return {
    getCurrentState,
    prepareTrainingPayload,
    onStateChange,
    mountTrainingState,
    applyEditableRecord,
    restoreAutosave,
  };
}
