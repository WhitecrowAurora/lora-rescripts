export type TrainingRouteConfig = {
  routeId: string;
  schemaName: string;
  prefix: string;
  modelLabel: string;
  presetTrainTypes: string[];
};

export const trainingRouteConfigs: Record<string, TrainingRouteConfig> = {
  "sdxl-train": {
    routeId: "sdxl-train",
    schemaName: "sdxl-lora",
    prefix: "sdxl",
    modelLabel: "SDXL",
    presetTrainTypes: ["sdxl-lora"],
  },
  "flux-train": {
    routeId: "flux-train",
    schemaName: "flux-lora",
    prefix: "flux",
    modelLabel: "Flux",
    presetTrainTypes: ["flux-lora"],
  },
  "sd3-train": {
    routeId: "sd3-train",
    schemaName: "sd3-lora",
    prefix: "sd3",
    modelLabel: "SD3",
    presetTrainTypes: ["sd3-lora"],
  },
  "sd3-finetune-train": {
    routeId: "sd3-finetune-train",
    schemaName: "sd3-finetune",
    prefix: "sd3-finetune",
    modelLabel: "SD3 Finetune",
    presetTrainTypes: ["sd3-finetune"],
  },
  "dreambooth-train": {
    routeId: "dreambooth-train",
    schemaName: "dreambooth",
    prefix: "dreambooth",
    modelLabel: "Dreambooth",
    presetTrainTypes: ["dreambooth", "sd-dreambooth", "sdxl-finetune"],
  },
  "flux-finetune-train": {
    routeId: "flux-finetune-train",
    schemaName: "flux-finetune",
    prefix: "flux-finetune",
    modelLabel: "Flux Finetune",
    presetTrainTypes: ["flux-finetune"],
  },
  "sd-controlnet-train": {
    routeId: "sd-controlnet-train",
    schemaName: "sd-controlnet",
    prefix: "sd-controlnet",
    modelLabel: "SD ControlNet",
    presetTrainTypes: ["sd-controlnet"],
  },
  "sdxl-controlnet-train": {
    routeId: "sdxl-controlnet-train",
    schemaName: "sdxl-controlnet",
    prefix: "sdxl-controlnet",
    modelLabel: "SDXL ControlNet",
    presetTrainTypes: ["sdxl-controlnet"],
  },
  "flux-controlnet-train": {
    routeId: "flux-controlnet-train",
    schemaName: "flux-controlnet",
    prefix: "flux-controlnet",
    modelLabel: "Flux ControlNet",
    presetTrainTypes: ["flux-controlnet"],
  },
  "sdxl-lllite-train": {
    routeId: "sdxl-lllite-train",
    schemaName: "sdxl-controlnet-lllite",
    prefix: "sdxl-lllite",
    modelLabel: "SDXL LLLite",
    presetTrainTypes: ["sdxl-controlnet-lllite"],
  },
  "sd-ti-train": {
    routeId: "sd-ti-train",
    schemaName: "sd-textual-inversion",
    prefix: "sd-ti",
    modelLabel: "SD Textual Inversion",
    presetTrainTypes: ["sd-textual-inversion"],
  },
  "xti-train": {
    routeId: "xti-train",
    schemaName: "sd-textual-inversion-xti",
    prefix: "xti",
    modelLabel: "SD XTI",
    presetTrainTypes: ["sd-textual-inversion-xti"],
  },
  "sdxl-ti-train": {
    routeId: "sdxl-ti-train",
    schemaName: "sdxl-textual-inversion",
    prefix: "sdxl-ti",
    modelLabel: "SDXL Textual Inversion",
    presetTrainTypes: ["sdxl-textual-inversion"],
  },
  "anima-train": {
    routeId: "anima-train",
    schemaName: "anima-lora",
    prefix: "anima",
    modelLabel: "Anima LoRA",
    presetTrainTypes: ["anima-lora"],
  },
  "anima-finetune-train": {
    routeId: "anima-finetune-train",
    schemaName: "anima-finetune",
    prefix: "anima-finetune",
    modelLabel: "Anima Finetune",
    presetTrainTypes: ["anima-finetune"],
  },
  "lumina-train": {
    routeId: "lumina-train",
    schemaName: "lumina-lora",
    prefix: "lumina",
    modelLabel: "Lumina LoRA",
    presetTrainTypes: ["lumina-lora"],
  },
  "lumina-finetune-train": {
    routeId: "lumina-finetune-train",
    schemaName: "lumina-finetune",
    prefix: "lumina-finetune",
    modelLabel: "Lumina Finetune",
    presetTrainTypes: ["lumina-finetune"],
  },
  "hunyuan-image-train": {
    routeId: "hunyuan-image-train",
    schemaName: "hunyuan-image-lora",
    prefix: "hunyuan-image",
    modelLabel: "Hunyuan Image LoRA",
    presetTrainTypes: ["hunyuan-image-lora"],
  },
};
