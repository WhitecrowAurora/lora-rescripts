import { renderTrainingPage } from "./trainingPage";

export function renderAnimaFinetuneTrainPage() {
  return renderTrainingPage({
    prefix: "anima-finetune",
    heroKicker: "anima finetune",
    heroTitle: "Anima finetune source training page",
    heroLede:
      "This route exposes the Anima finetune schema so the source-side bridge covers both LoRA and full finetune variants for that trainer family.",
    runnerTitle: "Anima finetune source-side runner",
    startButtonLabel: "Start Anima finetune",
    legacyPath: "/lora/anima-finetune.html",
    legacyLabel: "Open current shipped Anima finetune page",
    renderedTitle: "Anima finetune form bridge",
  });
}
