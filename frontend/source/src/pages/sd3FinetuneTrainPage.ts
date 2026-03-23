import { renderTrainingPage } from "./trainingPage";

export function renderSd3FinetuneTrainPage() {
  return renderTrainingPage({
    prefix: "sd3-finetune",
    heroKicker: "sd3 finetune",
    heroTitle: "SD3 finetune source training page",
    heroLede:
      "This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",
    runnerTitle: "SD3 finetune source-side runner",
    startButtonLabel: "Start SD3 finetune",
    legacyPath: "/lora/sd3-finetune.html",
    legacyLabel: "Open current shipped SD3 finetune page",
    renderedTitle: "SD3 finetune form bridge",
  });
}
