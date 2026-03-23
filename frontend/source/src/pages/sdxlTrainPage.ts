import { renderTrainingPage } from "./trainingPage";

export function renderSdxlTrainPage() {
  return renderTrainingPage({
    prefix: "sdxl",
    heroKicker: "sdxl train",
    heroTitle: "First source-side SDXL training page",
    heroLede:
      "This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",
    runnerTitle: "SDXL source-side runner",
    startButtonLabel: "Start SDXL training",
    legacyPath: "/lora/sdxl.html",
    legacyLabel: "Open current shipped SDXL page",
    renderedTitle: "SDXL form bridge",
    routeNotice: {
      kicker: "experimental",
      title: "SDXL clip_skip is now opt-in experimental support",
      detail:
        "This build can pass clip_skip through the SDXL training path, but it should be treated as experimental. If you rely on it, use matching SDXL clip-skip behavior at inference time too.",
    },
  });
}
