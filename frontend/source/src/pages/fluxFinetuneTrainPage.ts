import { renderTrainingPage } from "./trainingPage";

export function renderFluxFinetuneTrainPage() {
  return renderTrainingPage({
    prefix: "flux-finetune",
    heroKicker: "flux finetune",
    heroTitle: "Flux finetune source training page",
    heroLede:
      "This route exposes the dedicated Flux full-finetune schema on the same source-side training bridge so recipe shaping, preflight and launch behavior stay consistent.",
    runnerTitle: "Flux finetune source-side runner",
    startButtonLabel: "Start Flux finetune",
    legacyPath: "/lora/flux-finetune.html",
    legacyLabel: "Open current shipped Flux finetune page",
    renderedTitle: "Flux finetune form bridge",
  });
}
