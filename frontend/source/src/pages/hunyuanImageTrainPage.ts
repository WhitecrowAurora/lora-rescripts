import { renderTrainingPage } from "./trainingPage";

export function renderHunyuanImageTrainPage() {
  return renderTrainingPage({
    prefix: "hunyuan-image",
    heroKicker: "hunyuan image",
    heroTitle: "Hunyuan Image LoRA source training page",
    heroLede:
      "This route exposes the Hunyuan Image LoRA schema so newer image trainer families live on the same source-side bridge instead of staying legacy-only.",
    runnerTitle: "Hunyuan Image source-side runner",
    startButtonLabel: "Start Hunyuan Image training",
    legacyPath: "/lora/hunyuan.html",
    legacyLabel: "Open current shipped Hunyuan Image page",
    renderedTitle: "Hunyuan Image form bridge",
  });
}
