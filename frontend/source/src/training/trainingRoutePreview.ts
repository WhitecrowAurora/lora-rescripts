import { setPreText } from "../shared/domUtils";
import type { SchemaBridgeState, SchemaEditorDomIds } from "../schema/schemaEditor";
import type { PreparedTrainingPayload } from "./trainingRouteState";
import type { TrainingRouteConfig } from "./trainingRouteConfig";
import { renderTrainValidationStatus } from "./trainingUi";

type PrepareTrainingPayload = (state: SchemaBridgeState) => PreparedTrainingPayload;
type PersistTrainingAutosave = (state: SchemaBridgeState) => void;
type AfterTrainingStateChange = () => void;

export function createTrainingStateChangeHandler(
  config: TrainingRouteConfig,
  domIds: SchemaEditorDomIds,
  prepareTrainingPayload: PrepareTrainingPayload,
  persistTrainingAutosave: PersistTrainingAutosave,
  afterTrainingStateChange?: AfterTrainingStateChange
) {
  return (state: SchemaBridgeState) => {
    try {
      const prepared = prepareTrainingPayload(state);
      const sorted = Object.fromEntries(
        Object.entries(prepared.payload).sort(([left], [right]) => left.localeCompare(right))
      );
      setPreText(domIds.previewId, JSON.stringify(sorted, null, 2));
      renderTrainValidationStatus(config.prefix, prepared.checks);
    } catch (error) {
      setPreText(domIds.previewId, "{}");
      renderTrainValidationStatus(
        config.prefix,
        { warnings: [], errors: [] },
        error instanceof Error ? error.message : "The current state could not be converted into a launch payload."
      );
    }

    persistTrainingAutosave(state);
    afterTrainingStateChange?.();
  };
}
