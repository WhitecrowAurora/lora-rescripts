import { renderTrainingPage } from "./trainingPage";

export function renderLuminaFinetuneTrainPage() {
  return renderTrainingPage({
    prefix: "lumina-finetune",
    heroKicker: "lumina finetune",
    heroTitle: "Lumina finetune source training page",
    heroLede:
      "This route exposes Lumina finetune on the shared source-side bridge so finetune-specific payloads can use the same autosave, preflight and launch safety checks.",
    runnerTitle: "Lumina finetune source-side runner",
    startButtonLabel: "Start Lumina finetune",
    legacyPath: "/lora/lumina-finetune.html",
    legacyLabel: "Open current shipped Lumina finetune page",
    renderedTitle: "Lumina finetune form bridge",
  });
}
