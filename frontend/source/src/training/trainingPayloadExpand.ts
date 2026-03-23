import {
  ARRAY_TEXTAREA_KEYS,
  NETWORK_ARG_DIRECT_KEYS,
  NETWORK_ARG_REVERSE_MAP,
  OPTIMIZER_ARG_IGNORED_KEYS,
} from "./trainingPayloadConstants";
import {
  cloneValues,
  parseBooleanish,
  splitArgPair,
  toStringValue,
} from "./trainingPayloadHelpers";
import { restoreManagedSchedulerSelection } from "./trainingOptionRegistry";

export function expandTrainingPayloadToEditableValues(rawPayload: Record<string, unknown>) {
  const payload = cloneValues(rawPayload);
  restoreManagedSchedulerSelection(payload);

  if (Array.isArray(payload.network_args)) {
    const networkArgsCustom: string[] = [];

    for (const entry of payload.network_args) {
      const { key, value, hasValue } = splitArgPair(toStringValue(entry));

      if (key === "train_norm") {
        payload.train_norm = hasValue ? parseBooleanish(value) : true;
        continue;
      }

      if (key === "down_lr_weight" || key === "mid_lr_weight" || key === "up_lr_weight" || key === "block_lr_zero_threshold") {
        payload.enable_block_weights = true;
      }

      if (NETWORK_ARG_DIRECT_KEYS.has(key)) {
        payload[key] = value;
        continue;
      }

      if (NETWORK_ARG_REVERSE_MAP[key]) {
        payload[NETWORK_ARG_REVERSE_MAP[key]] = value;
        continue;
      }

      networkArgsCustom.push(toStringValue(entry));
    }

    if (networkArgsCustom.length > 0) {
      payload.network_args_custom = networkArgsCustom;
    }

    delete payload.network_args;
  }

  if (Array.isArray(payload.optimizer_args)) {
    const optimizerArgsCustom: string[] = [];

    for (const entry of payload.optimizer_args) {
      const { key, value } = splitArgPair(toStringValue(entry));

      if (key === "d_coef") {
        payload.prodigy_d_coef = value;
        continue;
      }

      if (key === "d0") {
        payload.prodigy_d0 = value;
        continue;
      }

      if (OPTIMIZER_ARG_IGNORED_KEYS.has(key)) {
        continue;
      }

      optimizerArgsCustom.push(toStringValue(entry));
    }

    if (optimizerArgsCustom.length > 0) {
      payload.optimizer_args_custom = optimizerArgsCustom;
    }

    delete payload.optimizer_args;
  }

  for (const key of ARRAY_TEXTAREA_KEYS) {
    if (Array.isArray(payload[key])) {
      payload[key] = payload[key].map((entry) => toStringValue(entry)).join("\n");
      if (key === "base_weights") {
        payload.enable_base_weight = true;
      }
      if (key === "base_weights_multiplier") {
        payload.enable_base_weight = true;
      }
    }
  }

  if (Array.isArray(payload.gpu_ids)) {
    payload.gpu_ids = payload.gpu_ids.map((entry) => toStringValue(entry));
  }

  return payload;
}
