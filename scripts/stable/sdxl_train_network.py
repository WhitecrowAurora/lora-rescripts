import argparse
from typing import List, Optional, Union

import torch
from accelerate import Accelerator
from library.device_utils import init_ipex, clean_memory_on_device

init_ipex()

from library import sdxl_model_util, sdxl_train_util, strategy_base, strategy_sd, strategy_sdxl, train_util
from library.custom_train_functions import apply_masked_loss
import train_network
from library.utils import setup_logging

setup_logging()
import logging

logger = logging.getLogger(__name__)


def parse_boolish(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"", "0", "false", "no", "off", "none", "null"}:
            return False
        if normalized in {"1", "true", "yes", "on"}:
            return True
    return bool(value)


def preview_requested(args) -> bool:
    if parse_boolish(getattr(args, "enable_preview", False)):
        return True
    if parse_boolish(getattr(args, "sample_at_first", False)):
        return True
    for key in ("sample_every_n_steps", "sample_every_n_epochs"):
        raw_value = getattr(args, key, None)
        try:
            if raw_value is not None and int(raw_value) > 0:
                return True
        except (TypeError, ValueError):
            pass
    return False


class SdxlNetworkTrainer(train_network.NetworkTrainer):
    def __init__(self):
        super().__init__()
        self.vae_scale_factor = sdxl_model_util.VAE_SCALE_FACTOR
        self.is_sdxl = True
        self._preview_oom_downgrade_count = 0

    def configure_dataset_runtime_policy(self, args):
        mode = None
        target_edge = None
        if parse_boolish(getattr(args, "sdxl_low_vram_optimization", False)):
            mode = str(getattr(args, "sdxl_bucket_resolution_mode", "") or "").strip().lower()
            try:
                target_edge = int(getattr(args, "sdxl_bucket_target_edge", 0) or 0)
            except (TypeError, ValueError):
                target_edge = 0

        train_util.configure_bucket_runtime_policy(
            mode=mode,
            target_edge=target_edge if target_edge and target_edge > 0 else None,
        )

    def is_text_encoder_not_needed_for_training(self, args):
        return bool(args.cache_text_encoder_outputs) and bool(args.network_train_unet_only) and not preview_requested(args)

    def should_use_component_cpu_residency(self, args) -> bool:
        return parse_boolish(getattr(args, "sdxl_component_cpu_residency", False))

    def _get_fixed_block_swap_config(self, args) -> dict:
        swap_input_blocks = parse_boolish(getattr(args, "sdxl_fixed_block_swap_input_blocks", True))
        swap_middle_block = parse_boolish(getattr(args, "sdxl_fixed_block_swap_middle_block", True))
        swap_output_blocks = parse_boolish(getattr(args, "sdxl_fixed_block_swap_output_blocks", True))
        offload_after_backward = parse_boolish(getattr(args, "sdxl_fixed_block_swap_offload_after_backward", True))
        raw_threshold = getattr(args, "sdxl_fixed_block_swap_vram_threshold_ratio", 0.0)
        try:
            threshold_ratio = float(raw_threshold)
        except (TypeError, ValueError):
            threshold_ratio = 0.0
        if threshold_ratio > 1.0:
            threshold_ratio /= 100.0
        threshold_ratio = min(0.99, max(0.0, threshold_ratio))
        return {
            "enabled": parse_boolish(getattr(args, "sdxl_fixed_block_swap", False)),
            "swap_input_blocks": swap_input_blocks,
            "swap_middle_block": swap_middle_block,
            "swap_output_blocks": swap_output_blocks,
            "offload_after_backward": offload_after_backward,
            "vram_threshold_ratio": threshold_ratio,
        }

    def should_use_fixed_block_swap(self, args) -> bool:
        config = self._get_fixed_block_swap_config(args)
        return bool(config["enabled"] and (config["swap_input_blocks"] or config["swap_middle_block"] or config["swap_output_blocks"]))

    def _format_fixed_block_swap_scope(self, config: dict) -> str:
        scopes = []
        if config.get("swap_input_blocks"):
            scopes.append("input")
        if config.get("swap_middle_block"):
            scopes.append("middle")
        if config.get("swap_output_blocks"):
            scopes.append("output")
        return "/".join(scopes) if scopes else "none"

    def configure_model_runtime(self, args, accelerator, network, text_encoders, unet):
        config = self._get_fixed_block_swap_config(args)
        if not self.should_use_fixed_block_swap(args):
            return
        if accelerator.num_processes > 1 or parse_boolish(getattr(args, "deepspeed", False)):
            accelerator.print(
                "WARNING: SDXL fixed block swap currently supports only single-process non-Deepspeed runs. "
                "The current run will continue without block swap. "
                "/ 当前 SDXL 固定档 block swap 仅支持单进程且非 Deepspeed 训练，本次已自动跳过。"
            )
            args.sdxl_fixed_block_swap = False
            return

        target_unet = accelerator.unwrap_model(unet)
        if not hasattr(target_unet, "enable_fixed_block_swap"):
            accelerator.print(
                "WARNING: the current SDXL U-Net route does not expose fixed block swap support. "
                "The current run will continue without block swap. "
                "/ 当前 SDXL U-Net 路由不支持固定档 block swap，本次已自动跳过。"
            )
            args.sdxl_fixed_block_swap = False
            return

        target_unet.enable_fixed_block_swap(
            accelerator.device,
            swap_input_blocks=config["swap_input_blocks"],
            swap_middle_block=config["swap_middle_block"],
            swap_output_blocks=config["swap_output_blocks"],
            offload_after_backward=config["offload_after_backward"],
            vram_threshold_ratio=config["vram_threshold_ratio"],
        )
        clean_memory_on_device(accelerator.device)
        accelerator.print(
            "SDXL fixed block swap enabled. "
            f"scope={self._format_fixed_block_swap_scope(config)} | "
            f"offload_after_backward={'on' if config['offload_after_backward'] else 'off'} | "
            f"vram_threshold={config['vram_threshold_ratio'] * 100:.0f}% "
            "/ 已启用 SDXL 固定档 block swap，并按用户配置的 U-Net 范围执行分段搬运。"
        )

    def on_step_start(self, args, accelerator, network, text_encoders, unet, batch, weight_dtype, is_train: bool = True):
        config = self._get_fixed_block_swap_config(args)
        if not is_train or not self.should_use_fixed_block_swap(args):
            return
        target_unet = accelerator.unwrap_model(unet)
        if hasattr(target_unet, "enable_fixed_block_swap"):
            target_unet.enable_fixed_block_swap(
                accelerator.device,
                swap_input_blocks=config["swap_input_blocks"],
                swap_middle_block=config["swap_middle_block"],
                swap_output_blocks=config["swap_output_blocks"],
                offload_after_backward=config["offload_after_backward"],
                vram_threshold_ratio=config["vram_threshold_ratio"],
            )

    def assert_extra_args(
        self,
        args,
        train_dataset_group: Union[train_util.DatasetGroup, train_util.MinimalDataset],
        val_dataset_group: Optional[train_util.DatasetGroup],
    ):
        sdxl_train_util.verify_sdxl_training_args(args)

        if args.cache_text_encoder_outputs:
            assert (
                train_dataset_group.is_text_encoder_output_cacheable()
            ), "when caching Text Encoder output, either caption_dropout_rate, shuffle_caption, token_warmup_step or caption_tag_dropout_rate cannot be used / Text Encoderの出力をキャッシュするときはcaption_dropout_rate, shuffle_caption, token_warmup_step, caption_tag_dropout_rateは使えません"

        assert (
            args.network_train_unet_only or not args.cache_text_encoder_outputs
        ), "network for Text Encoder cannot be trained with caching Text Encoder outputs / Text Encoderの出力をキャッシュしながらText Encoderのネットワークを学習することはできません"

        train_dataset_group.verify_bucket_reso_steps(32)
        if val_dataset_group is not None:
            val_dataset_group.verify_bucket_reso_steps(32)

    def load_target_model(self, args, weight_dtype, accelerator):
        (
            load_stable_diffusion_format,
            text_encoder1,
            text_encoder2,
            vae,
            unet,
            logit_scale,
            ckpt_info,
        ) = sdxl_train_util.load_target_model(args, accelerator, sdxl_model_util.MODEL_VERSION_SDXL_BASE_V1_0, weight_dtype)

        self.load_stable_diffusion_format = load_stable_diffusion_format
        self.logit_scale = logit_scale
        self.ckpt_info = ckpt_info

        # モデルに xformers とか memory efficient attention を組み込む
        train_util.replace_unet_modules(
            unet,
            args.mem_eff_attn,
            args.xformers,
            args.sdpa,
            getattr(args, "sageattn", False),
            getattr(args, "flashattn", False),
            getattr(args, "cross_attn_fused_kv", False),
        )
        if torch.__version__ >= "2.0.0":  # PyTorch 2.0.0 以上対応のxformersなら以下が使える
            vae.set_use_memory_efficient_attention_xformers(args.xformers and not getattr(args, "flashattn", False))

        return sdxl_model_util.MODEL_VERSION_SDXL_BASE_V1_0, [text_encoder1, text_encoder2], vae, unet

    def get_tokenize_strategy(self, args):
        return strategy_sdxl.SdxlTokenizeStrategy(args.max_token_length, args.tokenizer_cache_dir)

    def get_tokenizers(self, tokenize_strategy: strategy_sdxl.SdxlTokenizeStrategy):
        return [tokenize_strategy.tokenizer1, tokenize_strategy.tokenizer2]

    def get_latents_caching_strategy(self, args):
        latents_caching_strategy = strategy_sd.SdSdxlLatentsCachingStrategy(
            False, args.cache_latents_to_disk, args.vae_batch_size, args.skip_cache_check
        )
        return latents_caching_strategy

    def get_text_encoding_strategy(self, args):
        return strategy_sdxl.SdxlTextEncodingStrategy(args.clip_skip)

    def get_models_for_text_encoding(self, args, accelerator, text_encoders):
        return text_encoders + [accelerator.unwrap_model(text_encoders[-1])]

    def get_text_encoder_outputs_caching_strategy(self, args):
        if args.cache_text_encoder_outputs:
            return strategy_sdxl.SdxlTextEncoderOutputsCachingStrategy(
                args.cache_text_encoder_outputs_to_disk, None, args.skip_cache_check, is_weighted=args.weighted_captions
            )
        else:
            return None

    def cache_text_encoder_outputs_if_needed(
        self, args, accelerator: Accelerator, unet, vae, text_encoders, dataset: train_util.DatasetGroup, weight_dtype
    ):
        if args.cache_text_encoder_outputs:
            if not args.lowram:
                # メモリ消費を減らす
                logger.info("move vae and unet to cpu to save memory")
                org_vae_device = vae.device
                org_unet_device = unet.device
                vae.to("cpu")
                unet.to("cpu")
                clean_memory_on_device(accelerator.device)

            # When TE is not be trained, it will not be prepared so we need to use explicit autocast
            text_encoders[0].to(accelerator.device, dtype=weight_dtype)
            text_encoders[1].to(accelerator.device, dtype=weight_dtype)
            with accelerator.autocast():
                dataset.new_cache_text_encoder_outputs(text_encoders + [accelerator.unwrap_model(text_encoders[-1])], accelerator)
            accelerator.wait_for_everyone()

            text_encoders[0].to("cpu", dtype=torch.float32)  # Text Encoder doesn't work with fp16 on CPU
            text_encoders[1].to("cpu", dtype=torch.float32)
            clean_memory_on_device(accelerator.device)

            if not args.lowram:
                logger.info("move vae and unet back to original device")
                vae.to(org_vae_device)
                unet.to(org_unet_device)
        else:
            if self.should_use_component_cpu_residency(args) and not self.is_train_text_encoder(args):
                text_encoders[0].to("cpu", dtype=torch.float32)
                text_encoders[1].to("cpu", dtype=torch.float32)
            else:
                # Text Encoderから毎回出力を取得するので、GPUに乗せておく
                text_encoders[0].to(accelerator.device, dtype=weight_dtype)
                text_encoders[1].to(accelerator.device, dtype=weight_dtype)

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
        is_train=True,
        train_text_encoder=True,
        train_unet=True,
        return_per_sample_loss: bool = False,
    ):
        component_cpu_residency = self.should_use_component_cpu_residency(args)
        use_cached_latents = "latents" in batch and batch["latents"] is not None

        try:
            with torch.no_grad():
                if use_cached_latents:
                    latents = batch["latents"].to(accelerator.device)
                else:
                    if component_cpu_residency and vae.device.type == "cpu":
                        vae.to(accelerator.device, dtype=vae_dtype)

                    if args.vae_batch_size is None or len(batch["images"]) <= args.vae_batch_size:
                        latents = self.encode_images_to_latents(args, vae, batch["images"].to(accelerator.device, dtype=vae_dtype))
                    else:
                        chunks = [
                            batch["images"][i : i + args.vae_batch_size] for i in range(0, len(batch["images"]), args.vae_batch_size)
                        ]
                        list_latents = []
                        for chunk in chunks:
                            with torch.no_grad():
                                chunk = self.encode_images_to_latents(args, vae, chunk.to(accelerator.device, dtype=vae_dtype))
                                list_latents.append(chunk)
                        latents = torch.cat(list_latents, dim=0)

                    if torch.any(torch.isnan(latents)):
                        accelerator.print("NaN found in latents, replacing with zeros")
                        latents = torch.nan_to_num(latents, 0, out=latents)

                    if component_cpu_residency and vae.device.type != "cpu":
                        vae.to("cpu")
                        clean_memory_on_device(accelerator.device)

                latents = self.shift_scale_latents(args, latents)

            text_encoder_conds = []
            text_encoder_outputs_list = batch.get("text_encoder_outputs_list", None)
            if text_encoder_outputs_list is not None:
                text_encoder_conds = text_encoder_outputs_list

            needs_text_encoding = len(text_encoder_conds) == 0 or text_encoder_conds[0] is None or train_text_encoder
            moved_text_encoders_for_step = False
            if needs_text_encoding and component_cpu_residency and not train_text_encoder:
                if any(t_enc.device.type == "cpu" for t_enc in text_encoders):
                    moved_text_encoders_for_step = True
                    for t_enc in text_encoders:
                        t_enc.to(accelerator.device, dtype=weight_dtype)

            if needs_text_encoding:
                with torch.set_grad_enabled(is_train and train_text_encoder), accelerator.autocast():
                    if args.weighted_captions:
                        input_ids_list, weights_list = tokenize_strategy.tokenize_with_weights(batch["captions"])
                        encoded_text_encoder_conds = text_encoding_strategy.encode_tokens_with_weights(
                            tokenize_strategy,
                            self.get_models_for_text_encoding(args, accelerator, text_encoders),
                            input_ids_list,
                            weights_list,
                        )
                    else:
                        input_ids = [ids.to(accelerator.device) for ids in batch["input_ids_list"]]
                        encoded_text_encoder_conds = text_encoding_strategy.encode_tokens(
                            tokenize_strategy,
                            self.get_models_for_text_encoding(args, accelerator, text_encoders),
                            input_ids,
                        )
                    if args.full_fp16:
                        encoded_text_encoder_conds = [c.to(weight_dtype) for c in encoded_text_encoder_conds]

                if len(text_encoder_conds) == 0:
                    text_encoder_conds = encoded_text_encoder_conds
                else:
                    for i in range(len(encoded_text_encoder_conds)):
                        if encoded_text_encoder_conds[i] is not None:
                            text_encoder_conds[i] = encoded_text_encoder_conds[i]

            if moved_text_encoders_for_step:
                for t_enc in text_encoders:
                    t_enc.to("cpu", dtype=torch.float32)
                clean_memory_on_device(accelerator.device)

            noise_pred, target, timesteps, weighting = self.get_noise_pred_and_target(
                args,
                accelerator,
                noise_scheduler,
                latents,
                batch,
                text_encoder_conds,
                unet,
                network,
                weight_dtype,
                train_unet,
                is_train=is_train,
            )

            huber_c = train_util.get_huber_threshold_if_needed(args, timesteps, noise_scheduler)
            loss = train_util.conditional_loss(noise_pred.float(), target.float(), args.loss_type, "none", huber_c)
            if weighting is not None:
                loss = loss * weighting
            if args.masked_loss or ("alpha_masks" in batch and batch["alpha_masks"] is not None):
                loss = apply_masked_loss(loss, batch)
            loss = loss.mean(dim=list(range(1, loss.ndim)))

            loss_weights = batch["loss_weights"]
            loss = loss * loss_weights

            loss = self.post_process_loss(loss, args, timesteps, noise_scheduler)
            mean_loss = loss.mean()
            if return_per_sample_loss:
                return mean_loss, loss
            return mean_loss
        except torch.OutOfMemoryError as exc:
            clean_memory_on_device(accelerator.device)
            if parse_boolish(getattr(args, "sdxl_low_vram_auto_protection", False)):
                raise RuntimeError(
                    "SDXL 训练步骤发生显存不足。当前自动保护已完成可热切换的低显存保护，但训练阶段 OOM 仍无法安全在线恢复。"
                    "建议优先改为 long_edge、降低 batch_size、减小 rank，或直接关闭预览后重启训练。"
                    " / SDXL training step ran out of memory. Auto protection already applied the safe hot-switch protections, "
                    "but a training-step OOM still requires structural changes such as long_edge mode, smaller batch size, or lower rank."
                ) from exc
            raise

    def get_text_cond(self, args, accelerator, batch, tokenizers, text_encoders, weight_dtype):
        if "text_encoder_outputs1_list" not in batch or batch["text_encoder_outputs1_list"] is None:
            input_ids1 = batch["input_ids"]
            input_ids2 = batch["input_ids2"]
            with torch.enable_grad():
                # Get the text embedding for conditioning
                # TODO support weighted captions
                # if args.weighted_captions:
                #     encoder_hidden_states = get_weighted_text_embeddings(
                #         tokenizer,
                #         text_encoder,
                #         batch["captions"],
                #         accelerator.device,
                #         args.max_token_length // 75 if args.max_token_length else 1,
                #         clip_skip=args.clip_skip,
                #     )
                # else:
                input_ids1 = input_ids1.to(accelerator.device)
                input_ids2 = input_ids2.to(accelerator.device)
                encoder_hidden_states1, encoder_hidden_states2, pool2 = train_util.get_hidden_states_sdxl(
                    args.max_token_length,
                    input_ids1,
                    input_ids2,
                    tokenizers[0],
                    tokenizers[1],
                    text_encoders[0],
                    text_encoders[1],
                    None if not args.full_fp16 else weight_dtype,
                    accelerator=accelerator,
                )
        else:
            encoder_hidden_states1 = batch["text_encoder_outputs1_list"].to(accelerator.device).to(weight_dtype)
            encoder_hidden_states2 = batch["text_encoder_outputs2_list"].to(accelerator.device).to(weight_dtype)
            pool2 = batch["text_encoder_pool2_list"].to(accelerator.device).to(weight_dtype)

            # # verify that the text encoder outputs are correct
            # ehs1, ehs2, p2 = train_util.get_hidden_states_sdxl(
            #     args.max_token_length,
            #     batch["input_ids"].to(text_encoders[0].device),
            #     batch["input_ids2"].to(text_encoders[0].device),
            #     tokenizers[0],
            #     tokenizers[1],
            #     text_encoders[0],
            #     text_encoders[1],
            #     None if not args.full_fp16 else weight_dtype,
            # )
            # b_size = encoder_hidden_states1.shape[0]
            # assert ((encoder_hidden_states1.to("cpu") - ehs1.to(dtype=weight_dtype)).abs().max() > 1e-2).sum() <= b_size * 2
            # assert ((encoder_hidden_states2.to("cpu") - ehs2.to(dtype=weight_dtype)).abs().max() > 1e-2).sum() <= b_size * 2
            # assert ((pool2.to("cpu") - p2.to(dtype=weight_dtype)).abs().max() > 1e-2).sum() <= b_size * 2
            # logger.info("text encoder outputs verified")

        return encoder_hidden_states1, encoder_hidden_states2, pool2

    def call_unet(
        self,
        args,
        accelerator,
        unet,
        noisy_latents,
        timesteps,
        text_conds,
        batch,
        weight_dtype,
        indices: Optional[List[int]] = None,
    ):
        noisy_latents = noisy_latents.to(weight_dtype)  # TODO check why noisy_latents is not weight_dtype

        # get size embeddings
        orig_size = batch["original_sizes_hw"]
        crop_size = batch["crop_top_lefts"]
        target_size = batch["target_sizes_hw"]
        embs = sdxl_train_util.get_size_embeddings(orig_size, crop_size, target_size, accelerator.device).to(weight_dtype)

        # concat embeddings
        encoder_hidden_states1, encoder_hidden_states2, pool2 = text_conds
        vector_embedding = torch.cat([pool2, embs], dim=1).to(weight_dtype)
        text_embedding = torch.cat([encoder_hidden_states1, encoder_hidden_states2], dim=2).to(weight_dtype)

        if indices is not None and len(indices) > 0:
            noisy_latents = noisy_latents[indices]
            timesteps = timesteps[indices]
            text_embedding = text_embedding[indices]
            vector_embedding = vector_embedding[indices]

        noise_pred = unet(noisy_latents, timesteps, text_embedding, vector_embedding)
        return noise_pred

    def sample_images(self, accelerator, args, epoch, global_step, device, vae, tokenizer, text_encoder, unet):
        try:
            sdxl_train_util.sample_images(accelerator, args, epoch, global_step, device, vae, tokenizer, text_encoder, unet)
        except torch.OutOfMemoryError:
            if not parse_boolish(getattr(args, "sdxl_low_vram_auto_protection", False)):
                raise

            self._preview_oom_downgrade_count += 1
            clean_memory_on_device(device)

            if self._preview_oom_downgrade_count == 1:
                args.sample_at_first = False
                if getattr(args, "sample_every_n_epochs", None) is None or int(getattr(args, "sample_every_n_epochs", 0) or 0) < 4:
                    args.enable_preview = True
                    args.sample_every_n_steps = None
                    args.sample_every_n_epochs = 4
                    accelerator.print(
                        "WARNING: SDXL low-VRAM preview OOM detected. Auto protection reduced preview frequency to every 4 epochs. "
                        "/ 检测到 SDXL 预览 OOM，已自动把预览频率降为每 4 个 epoch 一次。"
                    )
                    return

            args.enable_preview = False
            args.sample_at_first = False
            args.sample_every_n_steps = None
            args.sample_every_n_epochs = None
            accelerator.print(
                "WARNING: SDXL low-VRAM preview OOM detected again. Preview has been disabled for the rest of this run. "
                "/ 再次检测到 SDXL 预览 OOM，本次训练剩余阶段已自动关闭预览。"
            )


def setup_parser() -> argparse.ArgumentParser:
    parser = train_network.setup_parser()
    sdxl_train_util.add_sdxl_training_arguments(parser)
    return parser


if __name__ == "__main__":
    parser = setup_parser()

    args = parser.parse_args()
    train_util.verify_command_line_training_args(args)
    args = train_util.read_config_from_file(args, parser)

    trainer = SdxlNetworkTrainer()
    trainer.train(args)

