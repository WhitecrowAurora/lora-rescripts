import { renderTrainingPage } from "./trainingPage";

export function renderSdxlControlNetTrainPage() {
  return renderTrainingPage({
    prefix: "sdxl-controlnet",
    heroKicker: "sdxl controlnet",
    heroTitle: "SDXL ControlNet source training page",
    heroLede:
      "This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",
    runnerTitle: "SDXL ControlNet source-side runner",
    startButtonLabel: "Start SDXL ControlNet training",
    legacyPath: "/lora/sdxl-controlnet.html",
    legacyLabel: "Open current shipped SDXL ControlNet page",
    renderedTitle: "SDXL ControlNet form bridge",
    routeNotice: {
      kicker: "experimental",
      title: "SDXL clip_skip remains experimental here as well",
      detail:
        "ControlNet still shares the SDXL text-encoding path. If you enable clip_skip on this route, keep your inference stack aligned with the same SDXL clip-skip behavior.",
    },
  });
}
