import { renderTrainingPage } from "./trainingPage";

export function renderXtiTrainPage() {
  return renderTrainingPage({
    prefix: "xti",
    heroKicker: "sd xti",
    heroTitle: "SD XTI source training page",
    heroLede:
      "This route exposes the SD XTI schema on the shared source-side bridge so more specialized embedding workflows are no longer hidden behind the legacy page only.",
    runnerTitle: "SD XTI source-side runner",
    startButtonLabel: "Start SD XTI training",
    legacyPath: "/lora/xti.html",
    legacyLabel: "Open current shipped SD XTI page",
    renderedTitle: "SD XTI form bridge",
  });
}
