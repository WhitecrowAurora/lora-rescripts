import assert from "node:assert/strict";

import { renderAnimaTrainPage } from "../src/pages/animaTrainPage.ts";
import { renderDreamboothTrainPage } from "../src/pages/dreamboothTrainPage.ts";
import { renderFluxTrainPage } from "../src/pages/fluxTrainPage.ts";
import { renderSd3FinetuneTrainPage } from "../src/pages/sd3FinetuneTrainPage.ts";
import { renderSd3TrainPage } from "../src/pages/sd3TrainPage.ts";
import { renderSdxlControlNetTrainPage } from "../src/pages/sdxlControlNetTrainPage.ts";
import { renderSdxlTrainPage } from "../src/pages/sdxlTrainPage.ts";
import { appRoutes } from "../src/routing/router.ts";
import { buildTrainingOptionChoices, getVisibleTrainingOptionEntries } from "../src/training/trainingOptionRegistry.ts";
import { checkTrainingPayload, normalizeTrainingPayload } from "../src/training/trainingPayload.ts";
import { expandTrainingPayloadToEditableValues } from "../src/training/trainingPayloadExpand.ts";
import { trainingRouteConfigs } from "../src/training/trainingRouteConfig.ts";

type SmokeRouteCase = {
  routeId: string;
  renderer: () => string;
};

const smokeRouteCases: SmokeRouteCase[] = [
  { routeId: "sdxl-train", renderer: renderSdxlTrainPage },
  { routeId: "flux-train", renderer: renderFluxTrainPage },
  { routeId: "sd3-train", renderer: renderSd3TrainPage },
  { routeId: "sd3-finetune-train", renderer: renderSd3FinetuneTrainPage },
  { routeId: "dreambooth-train", renderer: renderDreamboothTrainPage },
  { routeId: "sdxl-controlnet-train", renderer: renderSdxlControlNetTrainPage },
  { routeId: "anima-train", renderer: renderAnimaTrainPage },
];

function expectIncludes(source: string, expected: string, label: string) {
  assert.ok(source.includes(expected), `${label} should include ${expected}`);
}

function runRouteMarkupSmoke() {
  for (const routeCase of smokeRouteCases) {
    const config = trainingRouteConfigs[routeCase.routeId];
    assert.ok(config, `Missing training route config for ${routeCase.routeId}`);

    const route = appRoutes.find((entry) => entry.id === routeCase.routeId);
    assert.ok(route, `Missing app route for ${routeCase.routeId}`);
    assert.equal(route?.hash, `#/${routeCase.routeId}`, `Unexpected route hash for ${routeCase.routeId}`);

    const html = routeCase.renderer();
    expectIncludes(html, `${config.prefix}-start-train`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-run-preflight`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-autosave-status`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-load-presets`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-clear-autosave`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-sections`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-preview`, `${routeCase.routeId} page`);
  }
}

function runPayloadGuardSmoke() {
  const visibleOptimizers = getVisibleTrainingOptionEntries("optimizer");
  assert.ok(
    visibleOptimizers.some((entry) => entry.value === "pytorch_optimizer.Adan"),
    "Curated pytorch-optimizer entries should be visible by default"
  );

  const hiddenOptimizerChoices = buildTrainingOptionChoices("optimizer", ["AdamW", "AdamW8bit"], "pytorch_optimizer.Shampoo");
  assert.ok(
    hiddenOptimizerChoices.some((choice) => choice.value === "pytorch_optimizer.Shampoo"),
    "Hidden imported optimizer values should still be preserved in the selector"
  );

  const managedSchedulerEntry = getVisibleTrainingOptionEntries("scheduler").find(
    (entry) => entry.schedulerTypePath === "pytorch_optimizer.CosineAnnealingWarmupRestarts"
  );
  assert.ok(managedSchedulerEntry, "Expected a visible managed scheduler entry for pytorch-optimizer");

  const managedSchedulerNormalized = normalizeTrainingPayload({
    model_train_type: "sdxl-lora",
    lr_scheduler: managedSchedulerEntry?.value,
    optimizer_type: "AdamW8bit",
  });
  assert.equal(
    managedSchedulerNormalized.lr_scheduler_type,
    "pytorch_optimizer.CosineAnnealingWarmupRestarts",
    "Managed scheduler entries should map into lr_scheduler_type"
  );
  assert.equal(
    managedSchedulerNormalized.lr_scheduler,
    "constant",
    "Managed scheduler entries should leave a safe builtin lr_scheduler fallback behind"
  );

  const managedSchedulerExpanded = expandTrainingPayloadToEditableValues({
    lr_scheduler: "constant",
    lr_scheduler_type: "pytorch_optimizer.CosineAnnealingWarmupRestarts",
  });
  assert.equal(
    managedSchedulerExpanded.lr_scheduler,
    managedSchedulerEntry?.value,
    "Imported custom scheduler payloads should round-trip back into the managed selector value"
  );

  const sdxlNormalized = normalizeTrainingPayload({
    model_train_type: "sdxl-lora",
    clip_skip: 2,
    optimizer_type: "AdamW8bit",
  });
  assert.equal(sdxlNormalized.clip_skip, 2, "SDXL clip_skip should survive normalization in this build");
  assert.ok(
    checkTrainingPayload(sdxlNormalized).warnings.some((item) => item.includes("SDXL clip_skip")),
    "SDXL clip_skip should produce an experimental warning"
  );

  const sd3FinetuneNormalized = normalizeTrainingPayload({
    model_train_type: "sd3-finetune",
    clip_skip: 2,
    optimizer_type: "AdamW8bit",
  });
  assert.equal("clip_skip" in sd3FinetuneNormalized, false, "SD3 finetune should still drop clip_skip during normalization");

  const controlnetChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-controlnet",
      conditioning_data_dir: "",
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    controlnetChecks.errors.some((item) => item.includes("conditioning_data_dir")),
    "ControlNet smoke case should fail without conditioning_data_dir"
  );

  const controlnetWarningChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-controlnet",
      conditioning_data_dir: "./conditioning",
      reg_data_dir: "./reg",
      prior_loss_weight: 1,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    controlnetWarningChecks.warnings.some((item) => item.includes("reg_data_dir is usually ignored")),
    "ControlNet smoke case should warn about reg_data_dir"
  );

  const sd3FinetuneChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sd3-finetune",
      train_text_encoder: true,
      cache_text_encoder_outputs: true,
      train_t5xxl: true,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(sd3FinetuneChecks.errors.length >= 2, "SD3 finetune invalid text-encoder mix should surface hard errors");

  const animaXformersChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "anima-lora",
      attn_mode: "xformers",
      split_attn: false,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    animaXformersChecks.errors.some((item) => item.includes("split_attn")),
    "Anima xformers smoke case should require split_attn"
  );

  const animaCacheChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "anima-lora",
      cache_text_encoder_outputs: true,
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    animaCacheChecks.errors.some((item) => item.includes("Text Encoder LoRA training")),
    "Anima cache smoke case should fail when Text Encoder LoRA training is still enabled"
  );

  const animaSageChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "anima-lora",
      attn_mode: "sageattn",
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    animaSageChecks.errors.some((item) => item.includes("inference-only")),
    "Anima sageattn smoke case should fail"
  );

  const hunyuanXformersChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "hunyuan-image-lora",
      attn_mode: "xformers",
      split_attn: false,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    hunyuanXformersChecks.errors.some((item) => item.includes("split_attn")),
    "Hunyuan Image xformers smoke case should require split_attn"
  );

  const hunyuanUnetOnlyChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "hunyuan-image-lora",
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    hunyuanUnetOnlyChecks.errors.some((item) => item.includes("requires network_train_unet_only")),
    "Hunyuan Image smoke case should require network_train_unet_only"
  );

  const fluxCacheChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "flux-lora",
      cache_text_encoder_outputs: true,
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    fluxCacheChecks.errors.some((item) => item.includes("Text Encoder LoRA training")),
    "Flux cache smoke case should fail when Text Encoder LoRA training is still enabled"
  );

  const fluxT5Checks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "flux-lora",
      cache_text_encoder_outputs: true,
      train_t5xxl: true,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    fluxT5Checks.errors.some((item) => item.includes("train_t5xxl")),
    "Flux smoke case should fail when train_t5xxl is combined with cache_text_encoder_outputs"
  );

  const fluxChromaChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "flux-lora",
      model_type: "chroma",
      apply_t5_attn_mask: false,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    fluxChromaChecks.errors.some((item) => item.includes("apply_t5_attn_mask")),
    "Flux Chroma smoke case should require apply_t5_attn_mask"
  );

  const sdxlCacheChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-lora",
      cache_text_encoder_outputs: true,
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    sdxlCacheChecks.errors.some((item) => item.includes("Text Encoder LoRA training")),
    "SDXL cache smoke case should fail when Text Encoder LoRA training is still enabled"
  );

  const sdxlCaptionDropChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-lora",
      cache_text_encoder_outputs: true,
      caption_dropout_rate: 0.2,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    sdxlCaptionDropChecks.errors.some((item) => item.includes("caption_dropout_rate")),
    "SDXL cache smoke case should fail when caption_dropout_rate is enabled"
  );

  const hunyuanCaptionDropChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "hunyuan-image-lora",
      cache_text_encoder_outputs: true,
      caption_dropout_rate: 0.2,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    hunyuanCaptionDropChecks.errors.some((item) => item.includes("caption_dropout_rate")),
    "Hunyuan Image cache smoke case should fail when caption_dropout_rate is enabled"
  );

  const mixedTargetChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "dreambooth",
      network_train_unet_only: true,
      network_train_text_encoder_only: true,
      optimizer_type: "AdamW8bit",
    })
  );
  assert.ok(
    mixedTargetChecks.errors.some((item) => item.includes("network_train_unet_only")),
    "Mutually exclusive train-target flags should fail"
  );
}

function main() {
  runRouteMarkupSmoke();
  runPayloadGuardSmoke();
  console.log(`[smoke:training] ${smokeRouteCases.length} route markup cases and payload guard checks passed.`);
}

main();
