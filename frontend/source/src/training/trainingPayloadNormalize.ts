import {
  BASIC_LORA_DEFAULTS,
  FLOAT_PARAMS,
  NEED_DELETE_PARAMS,
  PATH_PARAMS,
  SD12_EXCLUSIVE_PARAMS,
  SDXL_EXCLUSIVE_PARAMS,
  TEST_NONE_PARAMS,
} from "./trainingPayloadConstants";
import {
  cloneValues,
  hasOwn,
  isSd3Finetune,
  isSdxlModel,
  normalizeLineList,
  normalizePath,
  toNumber,
  toStringValue,
  valueIsTruthy,
} from "./trainingPayloadHelpers";
import { parseLooseTomlObject } from "./trainingPayloadToml";
import { normalizeManagedSchedulerSelection } from "./trainingOptionRegistry";

export function normalizeTrainingPayload(rawValues: Record<string, unknown>, trainType = String(rawValues.model_train_type ?? "")) {
  const payload = trainType === "lora-basic"
    ? { ...BASIC_LORA_DEFAULTS, ...cloneValues(rawValues) }
    : cloneValues(rawValues);

  normalizeManagedSchedulerSelection(payload);

  const networkArgs: string[] = [];
  const optimizerArgs: string[] = [];

  const sdxlModel = isSdxlModel(payload);
  const sd3Finetune = isSd3Finetune(payload);

  if (
    (sdxlModel || sd3Finetune) &&
    [
      payload.learning_rate_te1,
      payload.learning_rate_te2,
      payload.learning_rate_te3,
    ].some(valueIsTruthy)
  ) {
    payload.train_text_encoder = true;
  }

  const exclusiveKeys = sdxlModel
    ? SD12_EXCLUSIVE_PARAMS.filter((key) => key !== "clip_skip")
    : sd3Finetune
      ? SD12_EXCLUSIVE_PARAMS
      : SDXL_EXCLUSIVE_PARAMS;

  for (const key of exclusiveKeys) {
    if (hasOwn(payload, key)) {
      delete payload[key];
    }
  }

  if (payload.network_module === "lycoris.kohya") {
    networkArgs.push(
      `conv_dim=${toStringValue(payload.conv_dim)}`,
      `conv_alpha=${toStringValue(payload.conv_alpha)}`,
      `dropout=${toStringValue(payload.dropout)}`,
      `algo=${toStringValue(payload.lycoris_algo)}`
    );

    if (valueIsTruthy(payload.lokr_factor)) {
      networkArgs.push(`factor=${toStringValue(payload.lokr_factor)}`);
    }

    if (valueIsTruthy(payload.train_norm)) {
      networkArgs.push("train_norm=True");
    }
  } else if (payload.network_module === "networks.dylora") {
    networkArgs.push(`unit=${toStringValue(payload.dylora_unit)}`);
  }

  const optimizerType = toStringValue(payload.optimizer_type);
  const optimizerTypeLower = optimizerType.toLowerCase();

  if (optimizerTypeLower.startsWith("dada")) {
    if (optimizerType === "DAdaptation" || optimizerType === "DAdaptAdam") {
      optimizerArgs.push("decouple=True", "weight_decay=0.01");
    }

    payload.learning_rate = 1;
    payload.unet_lr = 1;
    payload.text_encoder_lr = 1;
  } else if (optimizerTypeLower === "prodigy") {
    optimizerArgs.push(
      "decouple=True",
      "weight_decay=0.01",
      "use_bias_correction=True",
      `d_coef=${toStringValue(payload.prodigy_d_coef)}`
    );

    if (valueIsTruthy(payload.lr_warmup_steps)) {
      optimizerArgs.push("safeguard_warmup=True");
    }

    if (valueIsTruthy(payload.prodigy_d0)) {
      optimizerArgs.push(`d0=${toStringValue(payload.prodigy_d0)}`);
    }
  }

  if (valueIsTruthy(payload.enable_block_weights)) {
    networkArgs.push(
      `down_lr_weight=${toStringValue(payload.down_lr_weight)}`,
      `mid_lr_weight=${toStringValue(payload.mid_lr_weight)}`,
      `up_lr_weight=${toStringValue(payload.up_lr_weight)}`,
      `block_lr_zero_threshold=${toStringValue(payload.block_lr_zero_threshold)}`
    );
    delete payload.block_lr_zero_threshold;
  }

  if (valueIsTruthy(payload.enable_base_weight)) {
    payload.base_weights = normalizeLineList(payload.base_weights);
    payload.base_weights_multiplier = normalizeLineList(payload.base_weights_multiplier).map((entry) => toNumber(entry));
  } else {
    delete payload.base_weights;
    delete payload.base_weights_multiplier;
  }

  for (const customArg of normalizeLineList(payload.network_args_custom)) {
    networkArgs.push(customArg);
  }

  for (const customArg of normalizeLineList(payload.optimizer_args_custom)) {
    optimizerArgs.push(customArg);
  }

  if (!valueIsTruthy(payload.enable_preview)) {
    delete payload.sample_prompts;
    delete payload.sample_sampler;
    delete payload.sample_every_n_epochs;
  }

  for (const key of FLOAT_PARAMS) {
    if (hasOwn(payload, key)) {
      payload[key] = toNumber(payload[key]);
    }
  }

  for (const key of TEST_NONE_PARAMS) {
    if (!hasOwn(payload, key)) {
      continue;
    }

    const value = payload[key];
    if (value === 0 || value === "" || (Array.isArray(value) && value.length === 0)) {
      delete payload[key];
    }
  }

  for (const key of PATH_PARAMS) {
    if (hasOwn(payload, key) && payload[key]) {
      payload[key] = normalizePath(payload[key]);
    }
  }

  if (networkArgs.length > 0) {
    payload.network_args = networkArgs;
  } else {
    delete payload.network_args;
  }

  if (optimizerArgs.length > 0) {
    payload.optimizer_args = optimizerArgs;
  } else {
    delete payload.optimizer_args;
  }

  if (valueIsTruthy(payload.ui_custom_params)) {
    const customParams = parseLooseTomlObject(toStringValue(payload.ui_custom_params));
    Object.assign(payload, customParams);
  }

  for (const key of NEED_DELETE_PARAMS) {
    if (hasOwn(payload, key)) {
      delete payload[key];
    }
  }

  if (Array.isArray(payload.gpu_ids)) {
    payload.gpu_ids = payload.gpu_ids.map((entry) => {
      const value = toStringValue(entry);
      const match = value.match(/GPU\s+(\d+):/);
      return match ? match[1] : value;
    });
  }

  return payload;
}
