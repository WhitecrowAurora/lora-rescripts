import { renderTrainingPage } from "./trainingPage";

export function renderAnimaTrainPage() {
  return renderTrainingPage({
    prefix: "anima",
    heroKicker: "anima lora",
    heroTitle: "Anima LoRA source training page",
    heroLede:
      "This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",
    runnerTitle: "Anima LoRA source-side runner",
    startButtonLabel: "Start Anima LoRA training",
    legacyPath: "/lora/anima.html",
    legacyLabel: "Open current shipped Anima LoRA page",
    renderedTitle: "Anima LoRA form bridge",
  });
}
