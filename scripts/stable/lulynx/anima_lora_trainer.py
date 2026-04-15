import argparse
import gc
from contextlib import nullcontext
import importlib
import json
import math
import os
import random
import sys
import time
from multiprocessing import Value
from typing import Any, Optional, Union

import torch
import torch.nn as nn
from accelerate import Accelerator
from accelerate.utils import set_seed
from tqdm import tqdm

from library.device_utils import init_ipex, clean_memory_on_device

init_ipex()

from library import (
    anima_models,
    anima_train_utils,
    anima_utils,
    config_util,
    flux_train_utils,
    huggingface_util,
    qwen_image_autoencoder_kl,
    sd3_train_utils,
    strategy_anima,
    strategy_base,
    train_util,
)
from library.config_util import BlueprintGenerator, ConfigSanitizer
from library.custom_train_functions import apply_masked_loss
from library.utils import setup_logging
import train_network
from lulynx.experimental_core import create_lulynx_core, normalize_lulynx_args

setup_logging()
import logging

logger = logging.getLogger(__name__)


DEEPSPEED_OPTION_DEFAULTS = {
    "deepspeed": False,
    "zero_stage": 2,
    "offload_optimizer_device": None,
    "offload_optimizer_nvme_path": None,
    "offload_param_device": None,
    "offload_param_nvme_path": None,
    "zero3_init_flag": False,
    "zero3_save_16bit_model": False,
    "fp16_master_weights_and_gradients": False,
}

DEEPSPEED_OPTION_STRINGS = (
    "--deepspeed",
    "--zero_stage",
    "--offload_optimizer_device",
    "--offload_optimizer_nvme_path",
    "--offload_param_device",
    "--offload_param_nvme_path",
    "--zero3_init_flag",
    "--zero3_save_16bit_model",
    "--fp16_master_weights_and_gradients",
)


def _remove_parser_options(parser: argparse.ArgumentParser, option_strings: tuple[str, ...]) -> None:
    removed_action_ids = set()

    for option_string in option_strings:
        action = parser._option_string_actions.get(option_string)
        if action is None:
            continue

        removed_action_ids.add(id(action))
        for action_option_string in list(action.option_strings):
            parser._option_string_actions.pop(action_option_string, None)

    if not removed_action_ids:
        return

    parser._actions = [action for action in parser._actions if id(action) not in removed_action_ids]
    for group in parser._action_groups:
        group._group_actions = [action for action in group._group_actions if id(action) not in removed_action_ids]
    for group in parser._mutually_exclusive_groups:
        group._group_actions = [action for action in group._group_actions if id(action) not in removed_action_ids]


class AnimaNetworkTrainer:
    def __init__(self):
        self.sample_prompts_te_outputs = None
        self.is_swapping_blocks = False
        self._use_unsloth_offload_checkpointing = False

    def normalize_conflicting_network_target_flags(self, args):
        train_unet_only = bool(getattr(args, "network_train_unet_only", False))
        train_text_encoder_only = bool(getattr(args, "network_train_text_encoder_only", False))
        if train_unet_only and train_text_encoder_only:
            args.network_train_unet_only = False
            args.network_train_text_encoder_only = False
            logger.warning(
                "Both network_train_unet_only and network_train_text_encoder_only were enabled. "
                "Automatically switching to train both targets."
            )

        if self.is_train_text_encoder(args):
            disabled_cache_flags = []
            if bool(getattr(args, "cache_text_encoder_outputs", False)):
                args.cache_text_encoder_outputs = False
                disabled_cache_flags.append("cache_text_encoder_outputs")
            if bool(getattr(args, "cache_text_encoder_outputs_to_disk", False)):
                args.cache_text_encoder_outputs_to_disk = False
                disabled_cache_flags.append("cache_text_encoder_outputs_to_disk")

            if disabled_cache_flags:
                logger.warning(
                    "Disabled %s automatically because text encoder training is active."
                    % ", ".join(disabled_cache_flags)
                )

    def is_train_text_encoder(self, args):
        return not bool(getattr(args, "network_train_unet_only", False))

    def get_text_encoders_train_flags(self, args, text_encoders):
        return [True] * len(text_encoders) if self.is_train_text_encoder(args) else [False] * len(text_encoders)

    def get_network_target_module_counts(self, network) -> dict[str, int]:
        counts: dict[str, int] = {}
        if hasattr(network, "text_encoder_loras"):
            counts["text_encoder"] = len(getattr(network, "text_encoder_loras"))
        if hasattr(network, "text_encoder_norms"):
            counts["text_encoder"] = counts.get("text_encoder", 0) + len(getattr(network, "text_encoder_norms"))
        if hasattr(network, "unet_loras"):
            counts["unet"] = len(getattr(network, "unet_loras"))
        if hasattr(network, "unet_norms"):
            counts["unet"] = counts.get("unet", 0) + len(getattr(network, "unet_norms"))
        return counts

    def validate_network_target_modules(self, args, network, train_text_encoder: bool, train_unet: bool):
        counts = self.get_network_target_module_counts(network)
        if not counts:
            return

        missing_targets: list[str] = []
        if train_text_encoder and counts.get("text_encoder", 0) == 0:
            missing_targets.append("text encoder")
        if train_unet and counts.get("unet", 0) == 0:
            missing_targets.append("DiT / U-Net")

        if missing_targets:
            raise ValueError(
                "The selected network route did not attach any trainable modules to the active training target(s): "
                + ", ".join(missing_targets)
                + ". "
                + f"(network_module={getattr(args, 'network_module', 'unknown')})"
            )

    def assert_extra_args(
        self,
        args,
        train_dataset_group: Union[train_util.DatasetGroup, train_util.MinimalDataset],
        val_dataset_group: Optional[train_util.DatasetGroup],
    ):
        if getattr(args, "fp8_base", False) or getattr(args, "fp8_base_unet", False):
            logger.warning("fp8_base and fp8_base_unet are not supported for Anima LoRA. Disabling them.")
            args.fp8_base = False
            args.fp8_base_unet = False

        args.fp8_scaled = False
        args.attn_mode = anima_train_utils.normalize_anima_attn_mode(getattr(args, "attn_mode", None))

        if args.cache_text_encoder_outputs_to_disk and not args.cache_text_encoder_outputs:
            if self.is_train_text_encoder(args):
                logger.warning(
                    "Disabled cache_text_encoder_outputs_to_disk automatically because text encoder training is active."
                )
                args.cache_text_encoder_outputs_to_disk = False
            else:
                logger.warning("cache_text_encoder_outputs_to_disk is enabled, so cache_text_encoder_outputs is also enabled")
                args.cache_text_encoder_outputs = True

        if args.cache_text_encoder_outputs:
            assert train_dataset_group.is_text_encoder_output_cacheable(
                cache_supports_dropout=True
            ), "when caching Text Encoder output, shuffle_caption, token_warmup_step or caption_tag_dropout_rate cannot be used"

        assert (
            args.blocks_to_swap is None or args.blocks_to_swap == 0
        ) or not args.cpu_offload_checkpointing, "blocks_to_swap is not supported with cpu_offload_checkpointing"

        if args.unsloth_offload_checkpointing:
            if not args.gradient_checkpointing:
                logger.warning("unsloth_offload_checkpointing is enabled, so gradient_checkpointing is also enabled")
                args.gradient_checkpointing = True
            assert (
                not args.cpu_offload_checkpointing
            ), "Cannot use both --unsloth_offload_checkpointing and --cpu_offload_checkpointing"
            assert (
                args.blocks_to_swap is None or args.blocks_to_swap == 0
            ), "blocks_to_swap is not supported with unsloth_offload_checkpointing"

        anima_train_utils.validate_anima_resolution_settings(args)
        train_dataset_group.verify_bucket_reso_steps(64)
        if val_dataset_group is not None:
            val_dataset_group.verify_bucket_reso_steps(64)

    def get_tokenize_strategy(self, args, qwen3_tokenizer, t5_tokenizer):
        return strategy_anima.AnimaTokenizeStrategy(
            qwen3_tokenizer=qwen3_tokenizer,
            t5_tokenizer=t5_tokenizer,
            qwen3_max_length=args.qwen3_max_token_length,
            t5_max_length=args.t5_max_token_length,
        )

    def cache_text_encoder_outputs_if_needed(
        self,
        args,
        accelerator: Accelerator,
        text_encoders: list[nn.Module],
        dataset: train_util.DatasetGroup,
        tokenize_strategy,
        text_encoding_strategy,
    ):
        if not args.cache_text_encoder_outputs:
            return

        text_encoders[0].to(accelerator.device)
        text_encoders[0].eval()

        with accelerator.autocast():
            dataset.new_cache_text_encoder_outputs(text_encoders, accelerator)

        if args.sample_prompts is not None:
            logger.info(f"cache Text Encoder outputs for sample prompts: {args.sample_prompts}")
            prompts = anima_train_utils.load_sample_prompts_flexible(args.sample_prompts)
            cache = {}
            with accelerator.autocast(), torch.no_grad():
                for prompt_dict in prompts:
                    for prompt_text in [prompt_dict.get("prompt", ""), prompt_dict.get("negative_prompt", "")]:
                        if prompt_text not in cache:
                            tokens_and_masks = tokenize_strategy.tokenize(prompt_text)
                            cache[prompt_text] = text_encoding_strategy.encode_tokens(
                                tokenize_strategy, text_encoders, tokens_and_masks
                            )
            self.sample_prompts_te_outputs = cache

        accelerator.wait_for_everyone()
        text_encoders[0].to("cpu")
        clean_memory_on_device(accelerator.device)

    def sample_images(
        self,
        accelerator,
        args,
        epoch,
        global_step,
        vae,
        text_encoder,
        dit,
        tokenize_strategy,
        text_encoding_strategy,
        network=None,
    ):
        unwrapped_dit = accelerator.unwrap_model(dit)
        unwrapped_network = accelerator.unwrap_model(network) if network is not None else None

        text_encoder_modules = []
        if isinstance(text_encoder, (list, tuple)):
            text_encoder_modules = [accelerator.unwrap_model(module) for module in text_encoder if module is not None]
        elif text_encoder is not None:
            text_encoder_modules = [accelerator.unwrap_model(text_encoder)]

        restore_states = []

        def push_mode(module):
            if module is None:
                return
            restore_states.append((module, module.training))
            module.eval()

        push_mode(unwrapped_dit)
        push_mode(unwrapped_network)
        push_mode(vae)
        for module in text_encoder_modules:
            push_mode(module)

        try:
            anima_train_utils.sample_images(
                accelerator,
                args,
                epoch,
                global_step,
                dit,
                vae,
                text_encoder,
                tokenize_strategy,
                text_encoding_strategy,
                self.sample_prompts_te_outputs,
            )
        finally:
            for module, was_training in reversed(restore_states):
                module.train(was_training)

    def get_noise_scheduler(self, args: argparse.Namespace, device: torch.device) -> Any:
        return sd3_train_utils.FlowMatchEulerDiscreteScheduler(num_train_timesteps=1000, shift=args.discrete_flow_shift)

    def get_noise_pred_and_target(
        self,
        args,
        accelerator,
        noise_scheduler,
        latents,
        text_encoder_conds,
        unet,
        network,
        weight_dtype,
        is_train=True,
        profiler: Optional[anima_train_utils.AnimaStepTimingProfiler] = None,
        run_nan_check: bool = True,
    ):
        anima: anima_models.Anima = unet
        prompt_embeds, attn_mask, t5_input_ids, t5_attn_mask = text_encoder_conds

        with (profiler.step_section("noise_prepare") if profiler is not None else nullcontext()):
            if latents.ndim == 5:
                latents = latents.squeeze(2)
            noise = torch.randn_like(latents)

            noisy_model_input, timesteps, sigmas = flux_train_utils.get_noisy_model_input_and_timesteps(
                args, noise_scheduler, latents, noise, accelerator.device, weight_dtype
            )
            timesteps = timesteps / 1000.0

            if run_nan_check and torch.any(torch.isnan(noisy_model_input)):
                accelerator.print("NaN found in noisy_model_input, replacing with zeros")
                noisy_model_input = torch.nan_to_num(noisy_model_input, 0, out=noisy_model_input)

            if args.gradient_checkpointing:
                noisy_model_input.requires_grad_(True)
                for tensor in text_encoder_conds:
                    if tensor is not None and tensor.dtype.is_floating_point:
                        tensor.requires_grad_(True)

            bs = latents.shape[0]
            h_latent = latents.shape[-2]
            w_latent = latents.shape[-1]
            padding_mask = anima_train_utils.get_cached_anima_padding_mask(
                bs,
                h_latent,
                w_latent,
                device=accelerator.device,
                dtype=weight_dtype,
                use_channels_last=bool(getattr(args, "opt_channels_last", False)),
            )

        with (profiler.step_section("dit_forward") if profiler is not None else nullcontext()):
            noisy_model_input = noisy_model_input.unsqueeze(2)
            noisy_model_input = anima_train_utils.maybe_apply_anima_channels_last(args, noisy_model_input)
            with torch.set_grad_enabled(is_train), accelerator.autocast():
                try:
                    if network is not None and hasattr(network, "set_current_timestep"):
                        network.set_current_timestep(timesteps)
                    model_pred = anima(
                        noisy_model_input,
                        timesteps,
                        prompt_embeds,
                        padding_mask=padding_mask,
                        target_input_ids=t5_input_ids,
                        target_attention_mask=t5_attn_mask,
                        source_attention_mask=attn_mask,
                    )
                finally:
                    if network is not None and hasattr(network, "clear_current_timestep"):
                        network.clear_current_timestep()
            model_pred = model_pred.squeeze(2)

        target = noise - latents
        weighting = anima_train_utils.compute_loss_weighting_for_anima(weighting_scheme=args.weighting_scheme, sigmas=sigmas)
        return model_pred, target, timesteps, weighting

    def process_batch(
        self,
        batch,
        text_encoders,
        unet,
        network,
        vae,
        noise_scheduler,
        vae_dtype,
        weight_dtype,
        accelerator,
        args,
        text_encoding_strategy,
        tokenize_strategy,
        train_text_encoder=True,
        profiler: Optional[anima_train_utils.AnimaStepTimingProfiler] = None,
        use_non_blocking: bool = False,
        run_nan_check: bool = True,
        return_per_sample_loss: bool = False,
    ):
        component_cpu_offload = anima_train_utils.should_use_anima_component_cpu_offload(args)
        released_component_vram = False
        with (profiler.step_section("data/latents") if profiler is not None else nullcontext()):
            with torch.no_grad():
                if "latents" in batch and batch["latents"] is not None:
                    latents = anima_train_utils.move_anima_tensor(
                        batch["latents"],
                        accelerator.device,
                        dtype=weight_dtype,
                        non_blocking=use_non_blocking,
                    )
                else:
                    if component_cpu_offload and vae is not None:
                        anima_train_utils.move_anima_module(
                            vae,
                            accelerator.device,
                            dtype=vae_dtype,
                            non_blocking=use_non_blocking,
                        )
                    images = anima_train_utils.move_anima_tensor(
                        batch["images"],
                        accelerator.device,
                        dtype=vae_dtype,
                        non_blocking=use_non_blocking,
                    )
                    images = anima_train_utils.maybe_apply_anima_channels_last(args, images)
                    latents = vae.encode_pixels_to_latents(images).to(
                        accelerator.device, dtype=weight_dtype, non_blocking=use_non_blocking
                    )
                    if component_cpu_offload and vae is not None:
                        anima_train_utils.move_anima_module(vae, "cpu", dtype=vae_dtype)
                        released_component_vram = True
                    if run_nan_check and torch.any(torch.isnan(latents)):
                        accelerator.print("NaN found in latents, replacing with zeros")
                        latents = torch.nan_to_num(latents, 0, out=latents)
                latents = anima_train_utils.maybe_apply_anima_channels_last(args, latents)

        with (profiler.step_section("text_encoder_or_cached_text") if profiler is not None else nullcontext()):
            text_encoder_conds = []
            text_encoder_outputs_list = batch.get("text_encoder_outputs_list", None)
            if text_encoder_outputs_list is not None:
                caption_dropout_rates = text_encoder_outputs_list[-1]
                text_encoder_outputs_list = text_encoder_outputs_list[:-1]
                text_encoder_outputs_list = text_encoding_strategy.drop_cached_text_encoder_outputs(
                    *text_encoder_outputs_list, caption_dropout_rates=caption_dropout_rates
                )
                text_encoder_conds = list(text_encoder_outputs_list)

            if len(text_encoder_conds) == 0 or text_encoder_conds[0] is None or train_text_encoder:
                if text_encoders is None or len(text_encoders) == 0 or text_encoders[0] is None:
                    raise RuntimeError(
                        "Text encoder outputs must be encoded on-the-fly, but no active Anima text encoder model is available."
                    )
                if component_cpu_offload and not train_text_encoder:
                    for encoder in text_encoders:
                        anima_train_utils.move_anima_module(
                            encoder,
                            accelerator.device,
                            dtype=weight_dtype,
                            non_blocking=use_non_blocking,
                        )
                with torch.set_grad_enabled(train_text_encoder), accelerator.autocast():
                    input_ids = [
                        anima_train_utils.move_anima_tensor(
                            ids,
                            accelerator.device,
                            non_blocking=use_non_blocking,
                        )
                        for ids in batch["input_ids_list"]
                    ]
                    encoded = text_encoding_strategy.encode_tokens(
                        tokenize_strategy,
                        text_encoders,
                        input_ids,
                    )
                    if args.full_fp16:
                        encoded = [tensor.to(weight_dtype) if tensor is not None else None for tensor in encoded]
                if component_cpu_offload and not train_text_encoder:
                    for encoder in text_encoders:
                        anima_train_utils.move_anima_module(encoder, "cpu", dtype=weight_dtype)
                    released_component_vram = True

                if len(text_encoder_conds) == 0:
                    text_encoder_conds = list(encoded)
                else:
                    for index, tensor in enumerate(encoded):
                        if tensor is not None:
                            text_encoder_conds[index] = tensor

            prompt_embeds, attn_mask, t5_input_ids, t5_attn_mask = text_encoder_conds
            text_encoder_conds = [
                anima_train_utils.move_anima_tensor(
                    prompt_embeds,
                    accelerator.device,
                    dtype=weight_dtype,
                    non_blocking=use_non_blocking,
                ),
                anima_train_utils.move_anima_tensor(
                    attn_mask,
                    accelerator.device,
                    non_blocking=use_non_blocking,
                ),
                anima_train_utils.move_anima_tensor(
                    t5_input_ids,
                    accelerator.device,
                    dtype=torch.long,
                    non_blocking=use_non_blocking,
                ),
                anima_train_utils.move_anima_tensor(
                    t5_attn_mask,
                    accelerator.device,
                    non_blocking=use_non_blocking,
                ),
            ]

        if released_component_vram and accelerator.device.type == "cuda":
            clean_memory_on_device(accelerator.device)

        model_pred, target, timesteps, weighting = self.get_noise_pred_and_target(
            args,
            accelerator,
            noise_scheduler,
            latents,
            text_encoder_conds,
            unet,
            network,
            weight_dtype,
            profiler=profiler,
            run_nan_check=run_nan_check,
        )

        with (profiler.step_section("loss") if profiler is not None else nullcontext()):
            huber_c = train_util.get_huber_threshold_if_needed(args, timesteps, None)
            loss = train_util.conditional_loss(model_pred.float(), target.float(), args.loss_type, "none", huber_c)
            if weighting is not None:
                loss = loss * weighting
            if args.masked_loss or ("alpha_masks" in batch and batch["alpha_masks"] is not None):
                loss = apply_masked_loss(loss, batch)
            loss = loss.mean(dim=list(range(1, loss.ndim)))
            loss = loss * batch["loss_weights"]
            mean_loss = loss.mean()
            if return_per_sample_loss:
                return mean_loss, loss
            return mean_loss

    def prepare_text_encoder_grad_ckpt_workaround(self, text_encoder):
        first_param = next(text_encoder.parameters())
        first_param.requires_grad_(True)

    def prepare_unet_with_accelerator(self, args: argparse.Namespace, accelerator: Accelerator, unet: torch.nn.Module) -> torch.nn.Module:
        if self._use_unsloth_offload_checkpointing and args.gradient_checkpointing:
            unet.enable_gradient_checkpointing(unsloth_offload=True)

        if not self.is_swapping_blocks:
            return accelerator.prepare(unet)

        model = accelerator.prepare(unet, device_placement=[False])
        accelerator.unwrap_model(model).move_to_device_except_swap_blocks(accelerator.device)
        accelerator.unwrap_model(model).prepare_block_swap_before_forward()
        return model

    def all_reduce_network(self, accelerator, network):
        for param in network.parameters():
            if param.grad is not None:
                param.grad = accelerator.reduce(param.grad, reduction="mean")

    def build_metadata(self, args, session_id, training_started_at, optimizer_name, optimizer_args):
        metadata = {
            "ss_session_id": str(session_id),
            "ss_training_started_at": str(training_started_at),
            "ss_output_name": str(args.output_name),
            "ss_learning_rate": str(args.learning_rate),
            "ss_text_encoder_lr": str(args.text_encoder_lr),
            "ss_unet_lr": str(args.unet_lr),
            "ss_network_module": str(args.network_module),
            "ss_network_dim": str(args.network_dim),
            "ss_network_alpha": str(args.network_alpha),
            "ss_network_dropout": str(args.network_dropout),
            "ss_mixed_precision": str(args.mixed_precision),
            "ss_cache_latents": str(bool(args.cache_latents)),
            "ss_seed": str(args.seed),
            "ss_optimizer": optimizer_name + (f"({optimizer_args})" if len(optimizer_args) > 0 else ""),
            "ss_loss_type": str(args.loss_type),
            "ss_weighting_scheme": str(args.weighting_scheme),
            "ss_discrete_flow_shift": str(args.discrete_flow_shift),
            "ss_attn_mode": str(args.attn_mode),
            "ss_attention_backend": str(train_util.resolve_attention_backend(args)),
        }
        if args.pretrained_model_name_or_path is not None:
            metadata["ss_sd_model_name"] = str(args.pretrained_model_name_or_path)
        if args.vae is not None:
            metadata["ss_vae_name"] = str(args.vae)

        minimum_metadata = {}
        for key in train_util.SS_METADATA_MINIMUM_KEYS:
            if key in metadata:
                minimum_metadata[key] = metadata[key]
        return metadata, minimum_metadata

    def train(self, args):
        session_id = random.randint(0, 2**32)
        training_started_at = time.time()

        train_util.verify_training_args(args)
        train_util.prepare_dataset_args(args, True)
        setup_logging(args, reset=True)

        self.normalize_conflicting_network_target_flags(args)
        args.attn_mode = anima_train_utils.normalize_anima_attn_mode(getattr(args, "attn_mode", None))

        args.skip_cache_check = bool(getattr(args, "skip_cache_check", False))
        if not args.skip_cache_check:
            args.skip_cache_check = bool(getattr(args, "skip_latents_validity_check", False))

        args.cache_text_encoder_outputs = bool(getattr(args, "cache_text_encoder_outputs", False))
        args.cache_text_encoder_outputs_to_disk = bool(getattr(args, "cache_text_encoder_outputs_to_disk", False))
        args.cache_latents_to_disk = bool(getattr(args, "cache_latents_to_disk", False))
        args.persistent_data_loader_workers = bool(getattr(args, "persistent_data_loader_workers", False))
        args.cpu_offload_checkpointing = bool(getattr(args, "cpu_offload_checkpointing", False))
        args.unsloth_offload_checkpointing = bool(getattr(args, "unsloth_offload_checkpointing", False))
        args.blocks_to_swap = getattr(args, "blocks_to_swap", None)
        args.split_attn = bool(getattr(args, "split_attn", False))
        args.sample_prompts = getattr(args, "sample_prompts", None)
        args.text_encoder_batch_size = getattr(args, "text_encoder_batch_size", None)
        args.vae_batch_size = getattr(args, "vae_batch_size", None)
        args.qwen3_max_token_length = int(getattr(args, "qwen3_max_token_length", 512) or 512)
        args.t5_max_token_length = int(getattr(args, "t5_max_token_length", 512) or 512)
        args.discrete_flow_shift = float(getattr(args, "discrete_flow_shift", 3.0) or 3.0)
        args.timestep_sampling = str(getattr(args, "timestep_sampling", "shift") or "shift")
        args.sigmoid_scale = float(getattr(args, "sigmoid_scale", 1.0) or 1.0)
        args.vae_chunk_size = getattr(args, "vae_chunk_size", None)
        args.vae_disable_cache = bool(getattr(args, "vae_disable_cache", False))
        args.sample_scheduler = str(getattr(args, "sample_scheduler", "simple") or "simple")
        args.t5_tokenizer_path = getattr(args, "t5_tokenizer_path", None)
        args.llm_adapter_path = getattr(args, "llm_adapter_path", None)
        args.llm_adapter_lr = getattr(args, "llm_adapter_lr", None)
        args.self_attn_lr = getattr(args, "self_attn_lr", None)
        args.cross_attn_lr = getattr(args, "cross_attn_lr", None)
        args.mlp_lr = getattr(args, "mlp_lr", None)
        args.mod_lr = getattr(args, "mod_lr", None)
        args.loss_type = str(getattr(args, "loss_type", "l2") or "l2")
        args.weighting_scheme = str(getattr(args, "weighting_scheme", "uniform") or "uniform")
        args.logit_mean = float(getattr(args, "logit_mean", 0.0) or 0.0)
        args.logit_std = float(getattr(args, "logit_std", 1.0) or 1.0)
        args.mode_scale = float(getattr(args, "mode_scale", 1.29) or 1.29)
        args.huber_schedule = str(getattr(args, "huber_schedule", "snr") or "snr")
        args.huber_c = float(getattr(args, "huber_c", 0.1) or 0.1)
        args.huber_scale = float(getattr(args, "huber_scale", 1.0) or 1.0)
        args.text_encoder_lr = getattr(args, "text_encoder_lr", getattr(args, "learning_rate", None))
        args.unet_lr = getattr(args, "unet_lr", getattr(args, "learning_rate", None))
        args.network_dropout = getattr(args, "network_dropout", None)
        args.validation_split = float(getattr(args, "validation_split", 0.0) or 0.0)
        args.torch_compile = bool(getattr(args, "torch_compile", False))
        args.dynamo_backend = str(getattr(args, "dynamo_backend", "inductor") or "inductor")
        args.opt_channels_last = bool(getattr(args, "opt_channels_last", False))
        normalize_lulynx_args(
            args,
            route_label="Anima LoRA",
            route_kind="anima",
        )

        if os.name == "nt" and int(getattr(args, "max_data_loader_n_workers", 0) or 0) > 0:
            logger.warning(
                "max_data_loader_n_workers > 0 can crash on Windows for Anima training due to multiprocessing spawn issues. "
                "Forcing it to 0 to match the safer official behavior."
            )
            args.max_data_loader_n_workers = 0
            if bool(getattr(args, "persistent_data_loader_workers", False)):
                logger.warning(
                    "persistent_data_loader_workers was also disabled because Anima max_data_loader_n_workers was forced to 0 on Windows."
                )
                args.persistent_data_loader_workers = False

        if args.cpu_offload_checkpointing and not args.gradient_checkpointing:
            logger.warning("cpu_offload_checkpointing is enabled, so gradient_checkpointing is also enabled")
            args.gradient_checkpointing = True

        anima_train_utils.log_anima_runtime_summary(args, route_label="Anima LoRA")

        if args.seed is None:
            args.seed = random.randint(0, 2**32)
        set_seed(args.seed)

        cache_latents = args.cache_latents
        use_dreambooth_method = args.in_json is None

        if args.dataset_class is None:
            blueprint_generator = BlueprintGenerator(ConfigSanitizer(True, True, args.masked_loss, True))
            if args.dataset_config is not None:
                logger.info(f"Load dataset config from {args.dataset_config}")
                user_config = config_util.load_user_config(args.dataset_config)
            else:
                if use_dreambooth_method:
                    logger.info("Using DreamBooth method.")
                    user_config = {
                        "datasets": [
                            {
                                "subsets": config_util.generate_dreambooth_subsets_config_by_subdirs(
                                    args.train_data_dir, args.reg_data_dir
                                )
                            }
                        ]
                    }
                else:
                    logger.info("Training with captions.")
                    user_config = {
                        "datasets": [
                            {
                                "subsets": [
                                    {
                                        "image_dir": args.train_data_dir,
                                        "metadata_file": args.in_json,
                                    }
                                ]
                            }
                        ]
                    }

            blueprint = blueprint_generator.generate(user_config, args)
            train_dataset_group, val_dataset_group = config_util.generate_dataset_group_by_blueprint(blueprint.dataset_group)
        else:
            train_dataset_group = train_util.load_arbitrary_dataset(args)
            val_dataset_group = None

        current_epoch = Value("i", 0)
        current_step = Value("i", 0)
        ds_for_collator = train_dataset_group if args.max_data_loader_n_workers == 0 else None
        collator = train_util.collator_class(current_epoch, current_step, ds_for_collator)

        if args.debug_dataset:
            strategy_base.LatentsCachingStrategy.set_strategy(
                strategy_anima.AnimaLatentsCachingStrategy(args.cache_latents_to_disk, args.vae_batch_size, args.skip_cache_check)
            )
            if args.cache_text_encoder_outputs:
                strategy_base.TextEncoderOutputsCachingStrategy.set_strategy(
                    strategy_anima.AnimaTextEncoderOutputsCachingStrategy(
                        args.cache_text_encoder_outputs_to_disk, args.text_encoder_batch_size, False, False
                    )
                )
            train_dataset_group.set_current_strategies()
            train_util.debug_dataset(train_dataset_group, True)
            return

        if len(train_dataset_group) == 0:
            logger.error("No data found. Please verify the metadata file and train_data_dir option.")
            return

        if cache_latents:
            assert train_dataset_group.is_latent_cacheable(), "when caching latents, either color_aug or random_crop cannot be used"

        strategy_base.LatentsCachingStrategy.set_strategy(
            strategy_anima.AnimaLatentsCachingStrategy(args.cache_latents_to_disk, args.vae_batch_size, args.skip_cache_check)
        )
        self.assert_extra_args(args, train_dataset_group, val_dataset_group)

        path_bases = anima_train_utils._get_anima_path_bases(args)
        args.pretrained_model_name_or_path = anima_train_utils.resolve_required_anima_transformer_path(args, "anima-lora")
        args.qwen3 = anima_train_utils.resolve_required_anima_qwen3_path(args, "anima-lora")
        args.vae = anima_train_utils.resolve_required_anima_vae_path(args, "anima-lora")
        args.llm_adapter_path = anima_train_utils.resolve_optional_anima_path(
            getattr(args, "llm_adapter_path", None),
            label="Anima LLM adapter",
            allow_file=True,
            allow_directory=False,
            base_dirs=path_bases,
        )
        args.t5_tokenizer_path = anima_train_utils.resolve_optional_anima_path(
            getattr(args, "t5_tokenizer_path", None),
            label="Anima T5 tokenizer",
            allow_file=False,
            allow_directory=True,
            base_dirs=path_bases,
        )

        logger.info("prepare accelerator")
        accelerator = train_util.prepare_accelerator(args)
        is_main_process = accelerator.is_main_process

        weight_dtype, save_dtype = train_util.prepare_dtype(args)
        vae_dtype = torch.float32 if args.no_half_vae else weight_dtype

        logger.info("Loading tokenizers...")
        qwen3_text_encoder, qwen3_tokenizer = anima_utils.load_qwen3_text_encoder(args.qwen3, dtype=weight_dtype, device="cpu")
        qwen3_text_encoder.eval()
        t5_tokenizer = anima_utils.load_t5_tokenizer(args.t5_tokenizer_path)

        tokenize_strategy = self.get_tokenize_strategy(args, qwen3_tokenizer, t5_tokenizer)
        strategy_base.TokenizeStrategy.set_strategy(tokenize_strategy)
        text_encoding_strategy = strategy_anima.AnimaTextEncodingStrategy()
        strategy_base.TextEncodingStrategy.set_strategy(text_encoding_strategy)
        train_dataset_group.set_current_strategies()
        if val_dataset_group is not None:
            val_dataset_group.set_current_strategies()

        if args.cache_text_encoder_outputs:
            strategy_base.TextEncoderOutputsCachingStrategy.set_strategy(
                strategy_anima.AnimaTextEncoderOutputsCachingStrategy(
                    args.cache_text_encoder_outputs_to_disk, args.text_encoder_batch_size, args.skip_cache_check, False
                )
            )
            train_dataset_group.set_current_strategies()
            if val_dataset_group is not None:
                val_dataset_group.set_current_strategies()

        text_encoders = [qwen3_text_encoder]
        self.cache_text_encoder_outputs_if_needed(
            args, accelerator, text_encoders, train_dataset_group, tokenize_strategy, text_encoding_strategy
        )

        logger.info("Loading Anima VAE...")
        vae = qwen_image_autoencoder_kl.load_vae(
            args.vae, device="cpu", disable_mmap=True, spatial_chunk_size=args.vae_chunk_size, disable_cache=args.vae_disable_cache
        )
        vae.to(vae_dtype)
        vae.eval()
        anima_train_utils.apply_opt_channels_last_for_anima(args, ("Anima VAE", vae))

        anima_train_utils.run_vae_roundtrip_self_check(args, accelerator, vae, train_dataset_group, vae_dtype)

        if cache_latents:
            vae.to(accelerator.device, dtype=vae_dtype)
            vae.requires_grad_(False)
            train_dataset_group.new_cache_latents(vae, accelerator)
            vae.to("cpu")
            clean_memory_on_device(accelerator.device)
            accelerator.wait_for_everyone()

        logger.info(f"Loading Anima DiT model with attn_mode={args.attn_mode}, split_attn: {args.split_attn}...")
        self.is_swapping_blocks = args.blocks_to_swap is not None and args.blocks_to_swap > 0
        loading_device = "cpu" if self.is_swapping_blocks else accelerator.device
        dit = anima_utils.load_anima_model(
            accelerator.device,
            args.pretrained_model_name_or_path,
            args.attn_mode,
            args.split_attn,
            loading_device,
            weight_dtype,
            False,
            llm_adapter_path=args.llm_adapter_path,
        )
        anima_train_utils.apply_opt_channels_last_for_anima(args, ("Anima DiT", dit))
        self._use_unsloth_offload_checkpointing = args.unsloth_offload_checkpointing

        if self.is_swapping_blocks:
            logger.info(f"enable block swap: blocks_to_swap={args.blocks_to_swap}")
            dit.enable_block_swap(args.blocks_to_swap, accelerator.device)

        text_encoder = text_encoders
        stable_scripts_dir = os.path.dirname(os.path.dirname(__file__))
        if stable_scripts_dir not in sys.path:
            sys.path.append(stable_scripts_dir)
        accelerator.print("import network module:", args.network_module)
        network_module = importlib.import_module(args.network_module)

        if args.base_weights is not None:
            for index, weight_path in enumerate(args.base_weights):
                multiplier = 1.0
                if args.base_weights_multiplier is not None and len(args.base_weights_multiplier) > index:
                    multiplier = args.base_weights_multiplier[index]
                accelerator.print(f"merging module: {weight_path} with multiplier {multiplier}")
                module, weights_sd = network_module.create_network_from_weights(
                    multiplier, weight_path, vae, text_encoder, dit, for_inference=True
                )
                module.merge_to(text_encoder, dit, weights_sd, weight_dtype, accelerator.device if args.lowram else "cpu")

        net_kwargs = {}
        if args.network_args is not None:
            for net_arg in args.network_args:
                key, value = net_arg.split("=", 1)
                net_kwargs[key] = value

        if args.dim_from_weights:
            network, _ = network_module.create_network_from_weights(1, args.network_weights, vae, text_encoder, dit, **net_kwargs)
        else:
            if "dropout" not in net_kwargs:
                net_kwargs["dropout"] = args.network_dropout
            network = network_module.create_network(
                1.0,
                args.network_dim,
                args.network_alpha,
                vae,
                text_encoder,
                dit,
                neuron_dropout=args.network_dropout,
                **net_kwargs,
            )

        if network is None:
            return
        if hasattr(network, "prepare_network"):
            network.prepare_network(args)
        if args.scale_weight_norms and not hasattr(network, "apply_max_norm_regularization"):
            logger.warning("scale_weight_norms is specified but the network does not support it")
            args.scale_weight_norms = False

        lulynx_core = create_lulynx_core(args, route_kind="anima", route_label="Anima LoRA")
        if lulynx_core is not None:
            lulynx_core.apply_pre_optimizer_settings(network)

        train_unet = not args.network_train_text_encoder_only
        train_text_encoder = self.is_train_text_encoder(args)
        if not train_unet and not train_text_encoder:
            raise ValueError("No training target is enabled for this network route.")

        network.apply_to(text_encoder, dit, train_text_encoder, train_unet)
        self.validate_network_target_modules(args, network, train_text_encoder, train_unet)

        if args.network_weights is not None:
            info = network.load_weights(args.network_weights)
            accelerator.print(f"load network weights from {args.network_weights}: {info}")

        if args.gradient_checkpointing:
            dit.enable_gradient_checkpointing(
                cpu_offload=args.cpu_offload_checkpointing,
                unsloth_offload=args.unsloth_offload_checkpointing,
            )
            if train_text_encoder and hasattr(qwen3_text_encoder, "gradient_checkpointing_enable"):
                qwen3_text_encoder.gradient_checkpointing_enable()
            if hasattr(network, "enable_gradient_checkpointing"):
                network.enable_gradient_checkpointing()

        accelerator.print("prepare optimizer, data loader etc.")
        support_multiple_lrs = hasattr(network, "prepare_optimizer_params_with_multiple_te_lrs")
        if support_multiple_lrs:
            text_encoder_lr = args.text_encoder_lr
        elif args.text_encoder_lr is None or isinstance(args.text_encoder_lr, (float, int)):
            text_encoder_lr = args.text_encoder_lr
        else:
            text_encoder_lr = None if len(args.text_encoder_lr) == 0 else args.text_encoder_lr[0]

        try:
            if support_multiple_lrs:
                results = network.prepare_optimizer_params_with_multiple_te_lrs(text_encoder_lr, args.unet_lr, args.learning_rate)
            else:
                results = network.prepare_optimizer_params(text_encoder_lr, args.unet_lr, args.learning_rate)
            if isinstance(results, tuple):
                trainable_params = results[0]
                lr_descriptions = results[1]
            else:
                trainable_params = results
                lr_descriptions = None
        except TypeError:
            trainable_params = network.prepare_optimizer_params(text_encoder_lr, args.unet_lr)
            lr_descriptions = None

        if trainable_params is None or len(trainable_params) == 0:
            raise ValueError(
                "No trainable parameters were collected for the selected Anima network route. "
                "Please check the active training target flags, effective learning rates, and the network module compatibility."
            )

        optimizer_name, optimizer_args, optimizer = train_util.get_optimizer(args, trainable_params)
        optimizer_train_fn, optimizer_eval_fn = train_util.get_optimizer_train_eval_fn(optimizer, args)

        train_dataset_group.set_current_strategies()
        n_workers = min(args.max_data_loader_n_workers, os.cpu_count())
        use_pinned_memory = anima_train_utils.should_use_anima_pinned_memory(accelerator)
        prefetch_factor = anima_train_utils.resolve_anima_dataloader_prefetch_factor(args, n_workers)
        train_dataloader_kwargs = {
            "batch_size": 1,
            "shuffle": True,
            "collate_fn": collator,
            "num_workers": n_workers,
            "persistent_workers": bool(args.persistent_data_loader_workers and n_workers > 0),
            "pin_memory": use_pinned_memory,
        }
        if prefetch_factor is not None:
            train_dataloader_kwargs["prefetch_factor"] = prefetch_factor
        train_dataloader = torch.utils.data.DataLoader(
            train_dataset_group,
            **train_dataloader_kwargs,
        )

        if args.max_train_epochs is not None:
            args.max_train_steps = args.max_train_epochs * math.ceil(
                len(train_dataloader) / accelerator.num_processes / args.gradient_accumulation_steps
            )
            accelerator.print(
                f"override steps. steps for {args.max_train_epochs} epochs is / 指定エポックまでのステップ数: {args.max_train_steps}"
            )

        train_dataset_group.set_max_train_steps(args.max_train_steps)
        lr_scheduler = train_util.get_scheduler_fix(args, optimizer, accelerator.num_processes)

        if args.full_fp16:
            assert args.mixed_precision == "fp16", "full_fp16 requires mixed precision='fp16'"
            accelerator.print("enable full fp16 training.")
            network.to(weight_dtype)
        elif args.full_bf16:
            assert args.mixed_precision == "bf16", "full_bf16 requires mixed precision='bf16'"
            accelerator.print("enable full bf16 training.")
            network.to(weight_dtype)

        dit.requires_grad_(False)
        dit.to(dtype=weight_dtype)
        for encoder in text_encoders:
            encoder.requires_grad_(False)

        if train_unet:
            dit = self.prepare_unet_with_accelerator(args, accelerator, dit)
        else:
            dit.to(accelerator.device, dtype=weight_dtype)

        if train_text_encoder:
            text_encoders = [
                accelerator.prepare(encoder) if flag else encoder
                for encoder, flag in zip(text_encoders, self.get_text_encoders_train_flags(args, text_encoders))
            ]
        else:
            if not args.cache_text_encoder_outputs:
                text_encoder_target_device = "cpu" if anima_train_utils.should_use_anima_component_cpu_offload(args) else accelerator.device
                for encoder in text_encoders:
                    anima_train_utils.move_anima_module(encoder, text_encoder_target_device, dtype=weight_dtype)

        qwen3_text_encoder = text_encoders[0]
        network, optimizer, train_dataloader, lr_scheduler = accelerator.prepare(
            network, optimizer, train_dataloader, lr_scheduler
        )
        training_model = network

        if args.gradient_checkpointing:
            dit.train()
            for encoder, flag in zip(text_encoders, self.get_text_encoders_train_flags(args, text_encoders)):
                encoder.train()
                if flag:
                    self.prepare_text_encoder_grad_ckpt_workaround(encoder)
        else:
            dit.eval()
            for encoder in text_encoders:
                encoder.eval()

        qwen3_text_encoder = text_encoders[0] if len(text_encoders) > 0 else None
        text_encoder = text_encoders
        accelerator.unwrap_model(network).prepare_grad_etc(text_encoder, dit)

        if not cache_latents:
            vae.requires_grad_(False)
            vae.eval()
            vae_target_device = "cpu" if anima_train_utils.should_use_anima_component_cpu_offload(args) else accelerator.device
            anima_train_utils.move_anima_module(vae, vae_target_device, dtype=vae_dtype)

        if args.full_fp16:
            train_util.patch_accelerator_for_fp16_training(accelerator)

        steps_from_state = None

        def save_model_hook(models, weights, output_dir):
            if accelerator.is_main_process:
                remove_indices = []
                for index, model in enumerate(models):
                    if not isinstance(model, type(accelerator.unwrap_model(network))):
                        remove_indices.append(index)
                for index in reversed(remove_indices):
                    if len(weights) > index:
                        weights.pop(index)

            train_state_file = os.path.join(output_dir, "train_state.json")
            mixed_resolution_phase_start_epoch = int(getattr(args, "mixed_resolution_phase_start_epoch", 0) or 0)
            effective_current_epoch = int(current_epoch.value) + mixed_resolution_phase_start_epoch
            logger.info(
                f"save train state to {train_state_file} at epoch {effective_current_epoch} step {current_step.value+1}"
            )
            state_payload = {
                "current_epoch": effective_current_epoch,
                "current_step": current_step.value + 1,
            }
            if mixed_resolution_phase_start_epoch > 0:
                state_payload["mixed_resolution_local_epoch"] = int(current_epoch.value)
            mixed_resolution_plan_id = str(getattr(args, "mixed_resolution_plan_id", "") or "").strip()
            if mixed_resolution_plan_id:
                state_payload["mixed_resolution_plan_id"] = mixed_resolution_plan_id
            mixed_phase_index = getattr(args, "mixed_resolution_phase_index", None)
            if mixed_phase_index is not None:
                state_payload["mixed_resolution_phase_index"] = mixed_phase_index
            mixed_phase_target_step = getattr(args, "mixed_resolution_phase_target_step", None)
            if mixed_phase_target_step is not None:
                state_payload["mixed_resolution_phase_target_step"] = mixed_phase_target_step
            mixed_phase_target_epoch = getattr(args, "mixed_resolution_phase_target_epoch", None)
            if mixed_phase_target_epoch is not None:
                state_payload["mixed_resolution_phase_target_epoch"] = mixed_phase_target_epoch
            logging_run_dir = str(getattr(args, "logging_run_dir", "") or "").strip()
            if not logging_run_dir:
                logging_run_dir = str(getattr(accelerator, "project_dir", "") or "").strip()
            if logging_run_dir:
                state_payload["logging_run_dir"] = logging_run_dir
                state_payload["logging_dir"] = logging_run_dir
            with open(train_state_file, "w", encoding="utf-8") as handle:
                json.dump(state_payload, handle)

        def load_model_hook(models, input_dir):
            remove_indices = []
            for index, model in enumerate(models):
                if not isinstance(model, type(accelerator.unwrap_model(network))):
                    remove_indices.append(index)
            for index in reversed(remove_indices):
                models.pop(index)

            nonlocal steps_from_state
            train_state_file = os.path.join(input_dir, "train_state.json")
            if os.path.exists(train_state_file):
                with open(train_state_file, "r", encoding="utf-8") as handle:
                    data = json.load(handle)
                steps_from_state = data["current_step"]
                logger.info(f"load train state from {train_state_file}: {data}")

        accelerator.register_save_state_pre_hook(save_model_hook)
        accelerator.register_load_state_pre_hook(load_model_hook)

        train_util.resume_from_local_or_hf_if_specified(accelerator, args)
        safeguard = train_util.create_training_safeguard(args)
        ema_named_models = [("network", accelerator.unwrap_model(network))]
        if hasattr(accelerator.unwrap_model(network), "get_extra_ema_modules"):
            ema_named_models.extend(accelerator.unwrap_model(network).get_extra_ema_modules())
        ema_model = train_util.create_model_ema(args, ema_named_models)
        if lulynx_core is not None:
            lulynx_core.attach_runtime(train_text_encoder=train_text_encoder, network=accelerator.unwrap_model(network))

        num_update_steps_per_epoch = math.ceil(len(train_dataloader) / args.gradient_accumulation_steps)
        num_train_epochs = math.ceil(args.max_train_steps / num_update_steps_per_epoch)
        if (args.save_n_epoch_ratio is not None) and (args.save_n_epoch_ratio > 0):
            args.save_every_n_epochs = math.floor(num_train_epochs / args.save_n_epoch_ratio) or 1

        mixed_resolution_epoch_display_offset = int(getattr(args, "mixed_resolution_epoch_display_offset", 0) or 0)
        mixed_resolution_phase_target_epoch = int(getattr(args, "mixed_resolution_phase_target_epoch", 0) or 0)
        mixed_resolution_phase_start_epoch = int(getattr(args, "mixed_resolution_phase_start_epoch", 0) or 0)
        displayed_num_train_epochs = (
            mixed_resolution_phase_target_epoch if mixed_resolution_phase_target_epoch > 0 else num_train_epochs
        )

        def get_effective_epoch_no(epoch_index: int) -> int:
            return max(1, epoch_index + 1 + mixed_resolution_epoch_display_offset)

        metadata, minimum_metadata = self.build_metadata(args, session_id, training_started_at, optimizer_name, optimizer_args)
        if lulynx_core is not None:
            metadata.update(lulynx_core.get_metadata())
            minimum_metadata.update(lulynx_core.get_metadata())

        initial_step = 0
        if args.initial_epoch is not None or args.initial_step is not None:
            if steps_from_state is not None:
                logger.warning("steps from the state is ignored because initial_step is specified")
            if args.initial_step is not None:
                initial_step = args.initial_step
            else:
                initial_step = (args.initial_epoch - 1) * math.ceil(
                    len(train_dataloader) / accelerator.num_processes / args.gradient_accumulation_steps
                )
        elif steps_from_state is not None:
            initial_step = steps_from_state

        epoch_to_start = 0
        progress_start_step = 0
        steps_per_epoch_for_resume = math.ceil(len(train_dataloader) / args.gradient_accumulation_steps)
        if initial_step > 0:
            if args.skip_until_initial_step:
                logger.info(f"skipping {initial_step} steps")
                initial_step *= args.gradient_accumulation_steps
                epoch_to_start = initial_step // steps_per_epoch_for_resume
                progress_start_step = initial_step
            else:
                epoch_to_start = initial_step // steps_per_epoch_for_resume
                progress_start_step = initial_step
                initial_step = 0

        global_step = progress_start_step
        noise_scheduler = self.get_noise_scheduler(args, accelerator.device)
        train_util.init_trackers(accelerator, args, "anima_network_train")
        loss_recorder = train_util.LossRecorder()
        anima_step_profiler = anima_train_utils.AnimaStepTimingProfiler(args, accelerator, route_label="Anima LoRA")
        use_non_blocking = anima_train_utils.should_use_anima_non_blocking(accelerator)

        def save_model(ckpt_name, unwrapped_nw, steps, epoch_no, force_sync_upload=False):
            os.makedirs(args.output_dir, exist_ok=True)
            ckpt_file = os.path.join(args.output_dir, ckpt_name)
            accelerator.print(f"\nsaving checkpoint: {ckpt_file}")

            metadata["ss_training_finished_at"] = str(time.time())
            metadata["ss_steps"] = str(steps)
            metadata["ss_epoch"] = str(epoch_no)
            metadata_to_save = dict(minimum_metadata if args.no_metadata else metadata)
            metadata_to_save.update(
                train_util.get_sai_model_spec_dataclass(None, args, False, True, False, anima="preview").to_metadata_dict()
            )

            if ema_model is not None:
                with ema_model.apply_to_models():
                    unwrapped_nw.save_weights(ckpt_file, save_dtype, metadata_to_save)
            else:
                unwrapped_nw.save_weights(ckpt_file, save_dtype, metadata_to_save)

            if args.huggingface_repo_id is not None:
                huggingface_util.upload(args, ckpt_file, "/" + ckpt_name, force_sync_upload=force_sync_upload)

        def remove_model(old_ckpt_name):
            old_ckpt_file = os.path.join(args.output_dir, old_ckpt_name)
            if os.path.exists(old_ckpt_file):
                accelerator.print(f"removing old checkpoint: {old_ckpt_file}")
                os.remove(old_ckpt_file)

        accelerator.print("running training / 学習開始")
        accelerator.print(f"  num train images * repeats / 学習画像の数×繰り返し回数: {train_dataset_group.num_train_images}")
        accelerator.print(f"  num reg images / 正則化画像の数: {train_dataset_group.num_reg_images}")
        accelerator.print(f"  num batches per epoch / 1epochのバッチ数: {len(train_dataloader)}")
        accelerator.print(f"  num epochs / epoch数: {displayed_num_train_epochs}")
        if mixed_resolution_phase_target_epoch > 0:
            accelerator.print(
                f"  mixed-resolution epoch window / 阶段分辨率连续 epoch 区间: "
                f"{mixed_resolution_phase_start_epoch + 1} -> {mixed_resolution_phase_target_epoch}"
            )
        accelerator.print(
            f"  batch size per device / バッチサイズ: {', '.join([str(dataset.batch_size) for dataset in train_dataset_group.datasets])}"
        )
        accelerator.print(f"  gradient accumulation steps / 勾配を合計するステップ数 = {args.gradient_accumulation_steps}")
        accelerator.print(f"  total optimization steps / 学習ステップ数: {args.max_train_steps}")

        optimizer_eval_fn()
        self.sample_images(
            accelerator,
            args,
            0,
            global_step,
            vae,
            qwen3_text_encoder,
            dit,
            tokenize_strategy,
            text_encoding_strategy,
            network=network,
        )
        optimizer_train_fn()
        if len(accelerator.trackers) > 0:
            accelerator.log({}, step=0)

        progress_bar = tqdm(
            range(args.max_train_steps - progress_start_step),
            smoothing=0,
            disable=not accelerator.is_local_main_process,
            desc="steps",
        )
        lulynx_stop_reason = None

        if self.is_swapping_blocks:
            accelerator.unwrap_model(dit).prepare_block_swap_before_forward()

        if initial_step > 0:
            for skip_epoch in range(epoch_to_start):
                logger.info(f"skipping epoch {skip_epoch + 1} because initial_step (multiplied) is {initial_step}")
                initial_step -= len(train_dataloader)
            global_step = progress_start_step

        for epoch in range(epoch_to_start, num_train_epochs):
            effective_epoch_no = get_effective_epoch_no(epoch)
            accelerator.print(f"\nepoch {effective_epoch_no}/{displayed_num_train_epochs}\n")
            current_epoch.value = max(1, effective_epoch_no - mixed_resolution_phase_start_epoch)
            accelerator.unwrap_model(network).on_epoch_start(text_encoder, dit)

            skipped_dataloader = None
            if initial_step > 0:
                skipped_dataloader = accelerator.skip_first_batches(train_dataloader, initial_step - 1)
                initial_step = 1

            for step, batch in enumerate(skipped_dataloader or train_dataloader):
                current_step.value = global_step
                if initial_step > 0:
                    initial_step -= 1
                    continue

                nan_check_step = epoch * len(train_dataloader) + step + 1
                run_nan_check = anima_train_utils.should_run_anima_nan_check(args, nan_check_step)
                lulynx_step_logs = {}
                anima_step_profiler.begin_micro_step()
                try:
                    with accelerator.accumulate(training_model):
                        return_per_sample_loss = lulynx_core is not None and lulynx_core.requires_per_sample_losses()
                        per_sample_losses = None
                        batch_result = self.process_batch(
                            batch,
                            text_encoders,
                            dit,
                            network,
                            vae,
                            noise_scheduler,
                            vae_dtype,
                            weight_dtype,
                            accelerator,
                            args,
                            text_encoding_strategy,
                            tokenize_strategy,
                            train_text_encoder=train_text_encoder,
                            profiler=anima_step_profiler,
                            use_non_blocking=use_non_blocking,
                            run_nan_check=run_nan_check,
                            return_per_sample_loss=return_per_sample_loss,
                        )
                        if return_per_sample_loss:
                            loss, per_sample_losses = batch_result
                        else:
                            loss = batch_result

                        current_loss = loss.detach().item()
                        if safeguard is not None:
                            safeguard_decision = safeguard.inspect_loss(current_loss, global_step + 1, optimizer)
                            if safeguard_decision.reason:
                                logger.warning(safeguard_decision.reason)
                            if safeguard_decision.stop_training:
                                raise RuntimeError(safeguard_decision.reason)
                            if safeguard_decision.skip_step:
                                optimizer.zero_grad(set_to_none=True)
                                anima_step_profiler.discard_current_step()
                                continue

                        with anima_step_profiler.step_section("backward"):
                            if lulynx_core is not None:
                                lulynx_core.backward(
                                    loss=loss,
                                    accelerator=accelerator,
                                    optimizer=optimizer,
                                    network=accelerator.unwrap_model(network),
                                    per_sample_losses=per_sample_losses,
                                )
                            else:
                                accelerator.backward(loss)

                        with anima_step_profiler.step_section("optimizer_step"):
                            if accelerator.sync_gradients:
                                self.all_reduce_network(accelerator, network)
                                if args.max_grad_norm != 0.0:
                                    params_to_clip = accelerator.unwrap_model(network).get_trainable_params()
                                    accelerator.clip_grad_norm_(params_to_clip, args.max_grad_norm)

                            optimizer.step()
                            lr_scheduler.step()
                            optimizer.zero_grad(set_to_none=True)
                finally:
                    anima_step_profiler.end_micro_step()

                keys_scaled, mean_norm, maximum_norm = None, None, None
                max_mean_logs = {}
                if args.scale_weight_norms:
                    with anima_step_profiler.step_section("optimizer_step"):
                        keys_scaled, mean_norm, maximum_norm = accelerator.unwrap_model(network).apply_max_norm_regularization(
                            args.scale_weight_norms, accelerator.device
                        )
                    max_mean_logs = {"Keys Scaled": keys_scaled, "Average key norm": mean_norm}

                if accelerator.sync_gradients:
                    progress_bar.update(1)
                    global_step += 1
                    if ema_model is not None:
                        ema_model.update(global_step)

                    optimizer_eval_fn()
                    with anima_step_profiler.step_section("preview", wall_only=True):
                        self.sample_images(
                            accelerator,
                            args,
                            None,
                            global_step,
                            vae,
                            qwen3_text_encoder,
                            dit,
                            tokenize_strategy,
                            text_encoding_strategy,
                            network=network,
                        )

                    if args.save_every_n_steps is not None and global_step % args.save_every_n_steps == 0:
                        accelerator.wait_for_everyone()
                        if accelerator.is_main_process:
                            with anima_step_profiler.step_section("save", wall_only=True):
                                ckpt_name = train_util.get_step_ckpt_name(args, "." + args.save_model_as, global_step)
                                save_model(
                                    ckpt_name,
                                    accelerator.unwrap_model(network),
                                    global_step,
                                    max(0, effective_epoch_no - 1),
                                )
                                if args.save_state:
                                    train_util.save_and_remove_state_stepwise(args, accelerator, global_step)
                                remove_step_no = train_util.get_remove_step_no(args, global_step)
                                if remove_step_no is not None:
                                    remove_ckpt_name = train_util.get_step_ckpt_name(args, "." + args.save_model_as, remove_step_no)
                                    remove_model(remove_ckpt_name)
                    optimizer_train_fn()
                    if lulynx_core is not None:
                        lulynx_decision = lulynx_core.on_optimizer_step(
                            global_step=global_step,
                            current_loss=current_loss,
                            average_loss=loss_recorder.moving_average,
                            optimizer=optimizer,
                            lr_scheduler=lr_scheduler,
                            accelerator=accelerator,
                            network=accelerator.unwrap_model(network),
                        )
                        lulynx_step_logs = dict(lulynx_decision.logs or {})
                        if lulynx_decision.stop_training and lulynx_stop_reason is None:
                            lulynx_stop_reason = lulynx_decision.reason or "Lulynx experimental core requested stop."
                    anima_step_profiler.finalize_optimizer_step(global_step)

                if safeguard is not None:
                    safeguard.record_loss(current_loss)
                loss_recorder.add(epoch=epoch, step=step, loss=current_loss)
                logs = {"avr_loss": loss_recorder.moving_average}
                progress_bar.set_postfix(**{**max_mean_logs, **logs}, refresh=False)

                if len(accelerator.trackers) > 0:
                    step_logs = {"loss": current_loss}
                    if keys_scaled is not None:
                        step_logs["max_norm/keys_scaled"] = keys_scaled
                        step_logs["max_norm/max_key_norm"] = maximum_norm
                    if mean_norm is not None:
                        step_logs["norm/avg_key_norm"] = mean_norm
                    train_util.append_lr_to_logs_with_names(step_logs, lr_scheduler, args.optimizer_type, lr_descriptions or [])
                    if lulynx_step_logs:
                        step_logs.update(lulynx_step_logs)
                    accelerator.log(step_logs, step=global_step)

                if lulynx_stop_reason is not None:
                    break
                if global_step >= args.max_train_steps:
                    break

            if lulynx_stop_reason is not None:
                break

            if len(accelerator.trackers) > 0:
                accelerator.log({"loss/epoch_average": loss_recorder.moving_average}, step=global_step)

            accelerator.wait_for_everyone()
            optimizer_eval_fn()
            if args.save_every_n_epochs is not None and args.save_every_n_epochs > 0:
                saving = (
                    effective_epoch_no % args.save_every_n_epochs == 0
                    and effective_epoch_no < displayed_num_train_epochs
                )
                if is_main_process and saving:
                    with anima_step_profiler.window_section("save", wall_only=True):
                        ckpt_name = train_util.get_epoch_ckpt_name(args, "." + args.save_model_as, effective_epoch_no)
                        save_model(ckpt_name, accelerator.unwrap_model(network), global_step, effective_epoch_no)
                        remove_epoch_no = train_util.get_remove_epoch_no(args, effective_epoch_no)
                        if remove_epoch_no is not None:
                            remove_ckpt_name = train_util.get_epoch_ckpt_name(args, "." + args.save_model_as, remove_epoch_no)
                            remove_model(remove_ckpt_name)
                        if args.save_state:
                            train_util.save_and_remove_state_on_epoch_end(args, accelerator, effective_epoch_no)

            with anima_step_profiler.window_section("preview", wall_only=True):
                self.sample_images(
                    accelerator,
                    args,
                    effective_epoch_no,
                    global_step,
                    vae,
                    qwen3_text_encoder,
                    dit,
                    tokenize_strategy,
                    text_encoding_strategy,
                    network=network,
                )
            optimizer_train_fn()
            train_util.maybe_run_epoch_cooldown(
                args,
                accelerator,
                effective_epoch_no,
                displayed_num_train_epochs,
                context_label="anima network training",
            )

            if lulynx_stop_reason is not None:
                break
            if global_step >= args.max_train_steps:
                break

        accelerator.end_training()
        optimizer_eval_fn()

        if is_main_process and (args.save_state or args.save_state_on_train_end):
            train_util.save_state_on_train_end(args, accelerator)

        if is_main_process:
            network = accelerator.unwrap_model(network)
            ckpt_name = train_util.get_last_ckpt_name(args, "." + args.save_model_as)
            with anima_step_profiler.window_section("save", wall_only=True):
                save_model(ckpt_name, network, global_step, displayed_num_train_epochs, force_sync_upload=True)
            anima_step_profiler.flush_remaining(global_step)
            logger.info("model saved.")


def setup_parser() -> argparse.ArgumentParser:
    parser = train_network.setup_parser()
    _remove_parser_options(parser, DEEPSPEED_OPTION_STRINGS)
    parser.set_defaults(**DEEPSPEED_OPTION_DEFAULTS)
    train_util.add_dit_training_arguments(parser)
    anima_train_utils.add_anima_training_arguments(parser)
    parser.add_argument(
        "--unsloth_offload_checkpointing",
        action="store_true",
        help="offload activations to CPU RAM using async non-blocking transfers (faster than --cpu_offload_checkpointing). "
        "Cannot be used with --cpu_offload_checkpointing or --blocks_to_swap.",
    )
    parser.add_argument(
        "--skip_latents_validity_check",
        action="store_true",
        help="[Deprecated] use 'skip_cache_check' instead",
    )
    return parser











