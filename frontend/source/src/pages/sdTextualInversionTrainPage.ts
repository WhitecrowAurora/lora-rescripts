import { renderTrainingPage } from "./trainingPage";

export function renderSdTextualInversionTrainPage() {
  return renderTrainingPage({
    prefix: "sd-ti",
    heroKicker: "sd textual inversion",
    heroTitle: "SD textual inversion source training page",
    heroLede:
      "This route exposes the standard SD textual inversion schema through the shared training bridge, so embeddings can use the same source-side autosave, preflight and launch workflow.",
    runnerTitle: "SD textual inversion source-side runner",
    startButtonLabel: "Start SD textual inversion",
    legacyPath: "/lora/ti.html",
    legacyLabel: "Open current shipped SD textual inversion page",
    renderedTitle: "SD textual inversion form bridge",
  });
}
