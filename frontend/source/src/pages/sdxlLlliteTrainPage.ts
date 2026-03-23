import { renderTrainingPage } from "./trainingPage";

export function renderSdxlLlliteTrainPage() {
  return renderTrainingPage({
    prefix: "sdxl-lllite",
    heroKicker: "sdxl lllite",
    heroTitle: "SDXL LLLite source training page",
    heroLede:
      "This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",
    runnerTitle: "SDXL LLLite source-side runner",
    startButtonLabel: "Start SDXL LLLite training",
    legacyPath: "/lora/sdxl-lllite.html",
    legacyLabel: "Open current shipped SDXL LLLite page",
    renderedTitle: "SDXL LLLite form bridge",
    routeNotice: {
      kicker: "experimental",
      title: "SDXL clip_skip is experimental on LLLite too",
      detail:
        "The SDXL-side text encoding path is shared here, so clip_skip support is available but still experimental. Keep training and inference behavior matched if you use it.",
    },
  });
}
