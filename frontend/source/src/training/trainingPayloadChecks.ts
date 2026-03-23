import { CONFLICT_PARAMS } from "./trainingPayloadConstants";
import {
  hasOwn,
  toNumber,
  toStringValue,
  valueIsTruthy,
} from "./trainingPayloadHelpers";
import type { TrainingCheckResult } from "./trainingPayloadTypes";

export function checkTrainingPayload(payload: Record<string, unknown>): TrainingCheckResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const optimizerType = toStringValue(payload.optimizer_type);
  const optimizerTypeLower = optimizerType.toLowerCase();
  const modelTrainType = toStringValue(payload.model_train_type);
  const modelType = toStringValue(payload.model_type).trim().toLowerCase();
  const conditioningDataDir = toStringValue(payload.conditioning_data_dir).trim();
  const regDataDir = toStringValue(payload.reg_data_dir).trim();
  const attnMode = toStringValue(payload.attn_mode).trim().toLowerCase();
  const cacheTextEncoderOutputs = valueIsTruthy(payload.cache_text_encoder_outputs);
  const trainTextEncoderLoRA = !valueIsTruthy(payload.network_train_unet_only);
  const sdxlTraining = modelTrainType.startsWith("sdxl");
  const sd3Finetune = modelTrainType === "sd3-finetune";
  const sd3LoraTraining = modelTrainType === "sd3-lora";
  const fluxLoraTraining = modelTrainType === "flux-lora";
  const animaTraining = modelTrainType === "anima-lora" || modelTrainType === "anima-finetune";
  const hunyuanImageTraining = modelTrainType === "hunyuan-image-lora";
  const controlnetTraining = modelTrainType.includes("controlnet");
  const textEncoderCacheConstrainedTraining =
    sdxlTraining || sd3LoraTraining || fluxLoraTraining || animaTraining || hunyuanImageTraining;
  const nonAnimaCachedTextEncoderTraining =
    sdxlTraining || sd3LoraTraining || fluxLoraTraining || hunyuanImageTraining;

  if (optimizerType.startsWith("DAdapt") && payload.lr_scheduler !== "constant") {
    warnings.push("DAdaptation works best with lr_scheduler set to constant.");
  }

  if (
    optimizerTypeLower.startsWith("prodigy") &&
    (hasOwn(payload, "unet_lr") || hasOwn(payload, "text_encoder_lr")) &&
    (toNumber(payload.unet_lr, 1) !== 1 || toNumber(payload.text_encoder_lr, 1) !== 1)
  ) {
    warnings.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1.");
  }

  if (payload.network_module === "networks.oft" && modelTrainType !== "sdxl-lora") {
    errors.push("OFT is currently only supported for SDXL LoRA.");
  }

  if (valueIsTruthy(payload.network_train_unet_only) && valueIsTruthy(payload.network_train_text_encoder_only)) {
    errors.push("network_train_unet_only and network_train_text_encoder_only cannot be enabled at the same time.");
  }

  if (
    sd3Finetune &&
    valueIsTruthy(payload.train_text_encoder) &&
    valueIsTruthy(payload.cache_text_encoder_outputs) &&
    !valueIsTruthy(payload.use_t5xxl_cache_only)
  ) {
    errors.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled.");
  }

  if (sd3Finetune && valueIsTruthy(payload.train_t5xxl) && !valueIsTruthy(payload.train_text_encoder)) {
    errors.push("train_t5xxl requires train_text_encoder to be enabled first.");
  }

  if (sd3Finetune && valueIsTruthy(payload.train_t5xxl) && valueIsTruthy(payload.cache_text_encoder_outputs)) {
    errors.push("train_t5xxl cannot be combined with cache_text_encoder_outputs.");
  }

  if (
    animaTraining &&
    valueIsTruthy(payload.unsloth_offload_checkpointing) &&
    valueIsTruthy(payload.cpu_offload_checkpointing)
  ) {
    errors.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing.");
  }

  if (
    animaTraining &&
    valueIsTruthy(payload.unsloth_offload_checkpointing) &&
    valueIsTruthy(payload.blocks_to_swap)
  ) {
    errors.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap.");
  }

  if (controlnetTraining && conditioningDataDir.length === 0) {
    errors.push("conditioning_data_dir is required for ControlNet training routes.");
  }

  if (controlnetTraining && regDataDir.length > 0) {
    warnings.push("reg_data_dir is usually ignored for ControlNet training routes. Use conditioning_data_dir pairs instead.");
  }

  if (controlnetTraining && hasOwn(payload, "prior_loss_weight")) {
    warnings.push("prior_loss_weight is not normally used by ControlNet training routes.");
  }

  if (regDataDir.length > 0 && toNumber(payload.prior_loss_weight, 1) <= 0) {
    warnings.push("reg_data_dir is set, but prior_loss_weight is 0 or lower, so regularization images may have no effect.");
  }

  if (valueIsTruthy(payload.cache_text_encoder_outputs_to_disk) && !valueIsTruthy(payload.cache_text_encoder_outputs)) {
    warnings.push("cache_text_encoder_outputs_to_disk will force cache_text_encoder_outputs on during training.");
  }

  if (fluxLoraTraining && modelType === "chroma" && !valueIsTruthy(payload.apply_t5_attn_mask)) {
    errors.push("FLUX Chroma requires apply_t5_attn_mask to stay enabled.");
  }

  if (textEncoderCacheConstrainedTraining && cacheTextEncoderOutputs && trainTextEncoderLoRA) {
    errors.push("cache_text_encoder_outputs cannot be combined with Text Encoder LoRA training on this route. Enable network_train_unet_only instead.");
  }

  if (nonAnimaCachedTextEncoderTraining && cacheTextEncoderOutputs && toNumber(payload.caption_dropout_rate, 0) > 0) {
    errors.push("cache_text_encoder_outputs cannot be combined with caption_dropout_rate on this route.");
  }

  if (
    textEncoderCacheConstrainedTraining &&
    cacheTextEncoderOutputs &&
    (valueIsTruthy(payload.shuffle_caption) || toNumber(payload.caption_tag_dropout_rate, 0) > 0 || toNumber(payload.token_warmup_step, 0) > 0)
  ) {
    errors.push("cache_text_encoder_outputs cannot be combined with shuffle_caption, caption_tag_dropout_rate, or token_warmup_step on this route.");
  }

  if (
    (fluxLoraTraining || sd3LoraTraining) &&
    cacheTextEncoderOutputs &&
    valueIsTruthy(payload.train_t5xxl)
  ) {
    errors.push("train_t5xxl cannot be combined with cache_text_encoder_outputs on this route.");
  }

  if (hunyuanImageTraining && !valueIsTruthy(payload.network_train_unet_only)) {
    errors.push("Hunyuan Image LoRA currently requires network_train_unet_only.");
  }

  if (sdxlTraining && !valueIsTruthy(payload.network_train_unet_only) && !valueIsTruthy(payload.network_train_text_encoder_only)) {
    warnings.push("SDXL LoRA usually behaves best with network_train_unet_only enabled unless you explicitly want Text Encoder LoRA training.");
  }

  if ((animaTraining || hunyuanImageTraining) && attnMode === "sageattn") {
    errors.push("sageattn is inference-only for this trainer and should not be selected for training.");
  }

  if ((animaTraining || hunyuanImageTraining) && attnMode === "xformers" && !valueIsTruthy(payload.split_attn)) {
    errors.push("attn_mode=xformers requires split_attn for this trainer.");
  }

  if (attnMode && (valueIsTruthy(payload.xformers) || valueIsTruthy(payload.sdpa))) {
    warnings.push("attn_mode is set, so the plain xformers/sdpa toggles may be ignored by this trainer.");
  }

  if (
    valueIsTruthy(payload.masked_loss) &&
    !valueIsTruthy(payload.alpha_mask) &&
    !valueIsTruthy(payload.conditioning_data_dir)
  ) {
    warnings.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op.");
  }

  if (sdxlTraining && valueIsTruthy(payload.clip_skip)) {
    warnings.push("SDXL clip_skip in this build is experimental. Use the same clip-skip behavior at inference time if you rely on it.");
  }

  for (const [left, right] of CONFLICT_PARAMS) {
    if (valueIsTruthy(payload[left]) && valueIsTruthy(payload[right])) {
      errors.push(`Parameters ${left} and ${right} conflict. Please enable only one of them.`);
    }
  }

  return { warnings, errors };
}
