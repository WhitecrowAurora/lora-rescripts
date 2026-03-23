import { renderTrainingPage } from "./trainingPage";

export function renderSdxlTextualInversionTrainPage() {
  return renderTrainingPage({
    prefix: "sdxl-ti",
    heroKicker: "sdxl textual inversion",
    heroTitle: "SDXL textual inversion source training page",
    heroLede:
      "This route exposes SDXL textual inversion through the same source-side training bridge, so embeddings, prompt helpers and launch safety checks stay unified.",
    runnerTitle: "SDXL textual inversion source-side runner",
    startButtonLabel: "Start SDXL textual inversion",
    legacyPath: "/lora/sdxl-ti.html",
    legacyLabel: "Open current shipped SDXL textual inversion page",
    renderedTitle: "SDXL textual inversion form bridge",
    routeNotice: {
      kicker: "experimental",
      title: "SDXL clip_skip support is experimental",
      detail:
        "This route can now carry clip_skip into the SDXL text encoding path, but it is still an experimental compatibility feature rather than a long-settled default.",
    },
  });
}
