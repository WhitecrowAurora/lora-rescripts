import { renderTrainingPage } from "./trainingPage";

export function renderLuminaTrainPage() {
  return renderTrainingPage({
    prefix: "lumina",
    heroKicker: "lumina lora",
    heroTitle: "Lumina LoRA source training page",
    heroLede:
      "This route exposes the Lumina LoRA schema on the shared bridge so newer trainer families are available without falling back to older UI entry points.",
    runnerTitle: "Lumina LoRA source-side runner",
    startButtonLabel: "Start Lumina LoRA training",
    legacyPath: "/lora/lumina.html",
    legacyLabel: "Open current shipped Lumina LoRA page",
    renderedTitle: "Lumina LoRA form bridge",
  });
}
