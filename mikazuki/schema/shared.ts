(function () {
    const SAMPLE_PROMPTS_DEFAULT = "(masterpiece, best quality:1.2), 1girl, solo, --n lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts,signature, watermark, username, blurry,  --w 512  --h 768  --l 7  --s 24  --d 1337"
    const SAMPLE_PROMPTS_DESCRIPTION = "预览图生成参数。可填写直接填写参数，或单独写入txt文件填写路径<br>`--n` 后方为反向提示词<br>`--w`宽，`--h`高<br>`--l`: CFG Scale<br>`--s`: 迭代步数<br>`--d`: 种子"

    const LULYNX_ANIMA_BLOCK_WEIGHTS_DEFAULT = Array(28).fill("1").join(",")

    const LULYNX_EXPERIMENTAL_CORE_COMMON = Schema.intersect([
        Schema.object({
            lulynx_experimental_core_enabled: Schema.boolean().default(false).description("启用 Lulynx 实验核心。集中管理 SafeGuard、EMA、ResourceManager、BlockWeightManager、SmartRank、AutoController、LISA、PCGrad、Pause、Prodigy Guard 与轻量监控"),
        }),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_safeguard_enabled: Schema.boolean().default(false).description("启用 Lulynx SafeGuard。桥接到当前训练器的轻量安全防护"),
                lulynx_ema_enabled: Schema.boolean().default(false).description("启用 Lulynx EMA。桥接到当前训练器现有的 EMA 实现"),
                lulynx_resource_manager_enabled: Schema.boolean().default(false).description("启用 Lulynx ResourceManager。监控显存占用并按设定节奏清理缓存"),
                lulynx_block_weight_enabled: Schema.boolean().default(false).description("启用 Lulynx BlockWeightManager。按模型结构分配分层学习率"),
                lulynx_smart_rank_enabled: Schema.boolean().default(false).description("启用 Lulynx SmartRank。周期性压缩低能量 rank 通道"),
                lulynx_auto_controller_enabled: Schema.boolean().default(false).description("启用 Lulynx AutoController。根据 loss 平台自动控速、降学习率或提前停止"),
                lulynx_lisa_enabled: Schema.boolean().default(false).description("启用实验性 LISA。周期性只激活一部分适配器模块参与下一阶段训练"),
                lulynx_pcgrad_enabled: Schema.boolean().default(false).description("启用实验性 PCGrad。对逐样本 loss 做冲突梯度投影"),
                lulynx_pause_enabled: Schema.boolean().default(false).description("启用 Lulynx Pause。桥接到现有 cooldown 逻辑，在 epoch 之间做散热暂停"),
                lulynx_prodigy_guard_enabled: Schema.boolean().default(false).description("启用 Prodigy 专用护栏参数与学习率钳制"),
                lulynx_advanced_stats_enabled: Schema.boolean().default(false).description("启用轻量监控项与 SVD 采样统计"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_safeguard_enabled: Schema.const(true).required(),
                lulynx_safeguard_nan_check_interval: Schema.number().min(1).default(1).description("每 N 个优化 step 检查一次 NaN / Inf loss"),
                lulynx_safeguard_max_nan_count: Schema.number().min(1).default(3).description("连续触发多少次 NaN / Inf 后直接停止训练"),
                lulynx_safeguard_loss_spike_threshold: Schema.number().min(1).step(0.1).default(5.0).description("当前 loss 超过滚动平均值多少倍时判定为 spike"),
                lulynx_safeguard_loss_window_size: Schema.number().min(2).default(20).description("判定 loss spike 的滚动窗口大小"),
                lulynx_safeguard_auto_reduce_lr: Schema.boolean().default(false).description("SafeGuard 触发时自动降低学习率"),
                lulynx_safeguard_lr_reduction_factor: Schema.number().min(0.01).max(1).step(0.01).default(0.5).description("自动降低学习率时使用的倍率"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_ema_enabled: Schema.const(true).required(),
                lulynx_ema_decay: Schema.number().min(0).max(0.99999).step(0.0001).default(0.999).description("EMA 衰减率。越接近 1 越平滑"),
                lulynx_ema_update_every: Schema.number().min(1).default(1).description("每 N 个优化 step 更新一次 EMA"),
                lulynx_ema_update_after_step: Schema.number().min(0).default(0).description("从第几个优化 step 开始更新 EMA"),
                lulynx_ema_use_warmup: Schema.boolean().default(false).description("对 EMA 衰减率启用 warmup"),
                lulynx_ema_inv_gamma: Schema.number().min(0.0001).step(0.01).default(1.0).description("EMA warmup 的 inverse gamma"),
                lulynx_ema_power: Schema.number().min(0.0001).step(0.01).default(0.75).description("EMA warmup 的 power"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_resource_manager_enabled: Schema.const(true).required(),
                lulynx_resource_log_interval: Schema.number().min(1).default(25).description("每 N 个优化 step 输出一次资源日志"),
                lulynx_resource_warn_vram_ratio: Schema.number().min(0.1).max(0.999).step(0.01).default(0.90).description("显存保留占比达到该阈值时告警"),
                lulynx_resource_critical_vram_ratio: Schema.number().min(0.1).max(0.9999).step(0.01).default(0.96).description("显存保留占比达到该阈值时执行紧急缓存清理"),
                lulynx_resource_clear_cache_every_n_steps: Schema.number().min(0).default(50).description("每 N 个优化 step 主动清理一次缓存。0 表示关闭"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_smart_rank_enabled: Schema.const(true).required(),
                lulynx_smart_rank_keep_ratio: Schema.number().min(0.05).max(1).step(0.01).default(0.75).description("保留多少比例的 rank 通道。数值越低越激进"),
                lulynx_smart_rank_update_every: Schema.number().min(1).default(100).description("每 N 个优化 step 重新应用一次 SmartRank"),
                lulynx_smart_rank_start_step: Schema.number().min(0).default(200).description("从第几个优化 step 开始启用 SmartRank"),
                lulynx_smart_rank_min_active_rank: Schema.number().min(1).default(1).description("每个 LoRA 模块至少保留多少个 rank"),
                lulynx_smart_rank_scope: Schema.union(["all", "unet", "text_encoder"]).default("all").description("SmartRank 作用范围"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_auto_controller_enabled: Schema.const(true).required(),
                lulynx_auto_check_every: Schema.number().min(1).default(50).description("每 N 个优化 step 做一次 AutoController 判断"),
                lulynx_auto_plateau_window: Schema.number().min(2).default(30).description("用于判定平台期的 loss 窗口大小"),
                lulynx_auto_plateau_tolerance: Schema.number().min(0).max(1).step(0.001).default(0.01).description("认定为有效改善所需的相对 loss 降幅"),
                lulynx_auto_lr_decay_factor: Schema.number().min(0.01).max(1).step(0.01).default(0.85).description("平台期触发降学习率时使用的倍率"),
                lulynx_auto_lr_patience: Schema.number().min(1).default(2).description("连续多少次平台期后执行一次降学习率"),
                lulynx_auto_early_stop_patience: Schema.number().min(1).default(6).description("连续多少次平台期后提前停止训练"),
                lulynx_auto_min_lr: Schema.number().min(0).step(0.0000001).default(0.0000001).description("自动降学习率时的最小学习率下限"),
                lulynx_auto_freeze_text_encoder_on_plateau: Schema.boolean().default(false).description("平台期持续时自动冻结文本编码器侧 LoRA 参数"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_lisa_enabled: Schema.const(true).required(),
                lulynx_lisa_active_ratio: Schema.number().min(0.05).max(1).step(0.01).default(0.2).description("每轮 LISA 激活的适配器模块比例"),
                lulynx_lisa_interval: Schema.number().min(1).default(1).description("每 N 个优化 step 重排一次 LISA 激活模块"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_pcgrad_enabled: Schema.const(true).required(),
                lulynx_pcgrad_conflict_threshold: Schema.number().min(-1).max(1).step(0.01).default(0).description("PCGrad 判定梯度冲突的余弦阈值。低于该值时执行投影"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_pause_enabled: Schema.const(true).required(),
                lulynx_pause_every_n_epochs: Schema.number().min(1).description("每 N 个 epoch 在保存与预览后暂停一次。会桥接到 cooldown_every_n_epochs"),
                lulynx_pause_minutes: Schema.number().min(0).step(0.5).description("每次暂停至少等待多少分钟。会桥接到 cooldown_minutes"),
                lulynx_pause_until_temp_c: Schema.number().min(1).description("暂停时等待显卡温度降到多少摄氏度以下。会桥接到 cooldown_until_temp_c"),
                lulynx_pause_poll_seconds: Schema.number().min(1).default(15).description("温度轮询间隔（秒）。会桥接到 cooldown_poll_seconds"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_prodigy_guard_enabled: Schema.const(true).required(),
                lulynx_prodigy_decouple: Schema.boolean().default(false).description("若当前 Prodigy 版本支持，则注入 decouple 参数"),
                lulynx_prodigy_use_bias_correction: Schema.boolean().default(false).description("若当前 Prodigy 版本支持，则注入 use_bias_correction 参数"),
                lulynx_prodigy_safeguard_warmup: Schema.boolean().default(false).description("若当前 Prodigy 版本支持，则注入 safeguard_warmup 参数"),
                lulynx_prodigy_growth_rate: Schema.number().min(0).step(0.0001).description("若当前 Prodigy 版本支持，则注入 growth_rate 参数"),
                lulynx_prodigy_lr_min: Schema.number().min(0).step(0.0000001).description("Prodigy 运行时学习率下限钳制"),
                lulynx_prodigy_lr_max: Schema.number().min(0).step(0.0000001).description("Prodigy 运行时学习率上限钳制"),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_advanced_stats_enabled: Schema.const(true).required(),
                lulynx_svd_sample_interval: Schema.number().min(1).default(100).description("每 N 个优化 step 采样一次轻量高级统计与 SVD 指标"),
            }),
            Schema.object({}),
        ]),
    ])

    const LULYNX_EXPERIMENTAL_CORE_SDXL = Schema.intersect([
        LULYNX_EXPERIMENTAL_CORE_COMMON,
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_block_weight_enabled: Schema.const(true).required(),
                lulynx_down_lr_weight: Schema.string().default("1,1,1,1,1,1,1,1,1").description("SDXL Encoder 分层学习率权重，共 9 段"),
                lulynx_mid_lr_weight: Schema.string().default("1,1,1").description("SDXL Mid 分层学习率权重，共 3 段"),
                lulynx_up_lr_weight: Schema.string().default("1,1,1,1,1,1,1,1,1").description("SDXL Decoder 分层学习率权重，共 9 段"),
                lulynx_block_lr_zero_threshold: Schema.number().step(0.01).default(0).description("低于该阈值的 block 权重按 0 处理"),
            }),
            Schema.object({}),
        ]),
    ])

    const LULYNX_EXPERIMENTAL_CORE_ANIMA = Schema.intersect([
        LULYNX_EXPERIMENTAL_CORE_COMMON,
        Schema.union([
            Schema.object({
                lulynx_experimental_core_enabled: Schema.const(true).required(),
                lulynx_block_weight_enabled: Schema.const(true).required(),
                lulynx_anima_block_lr_weights: Schema.string().role('textarea').default(LULYNX_ANIMA_BLOCK_WEIGHTS_DEFAULT).description("Anima 主 transformer blocks 分层学习率权重，共 28 层，顺序对应 blocks.0 到 blocks.27"),
                lulynx_anima_llm_adapter_lr_weight: Schema.number().step(0.01).default(1.0).description("LLM Adapter 学习率倍率"),
                lulynx_anima_final_layer_lr_weight: Schema.number().step(0.01).default(1.0).description("final_layer 学习率倍率"),
                lulynx_anima_norm_lr_weight: Schema.number().step(0.01).default(1.0).description("匹配 norm 层的学习率倍率"),
            }),
            Schema.object({}),
        ]),
    ])

    let data = {
        RAW: {
            DATASET_SETTINGS: {
                train_data_dir: Schema.string().role('filepicker', { type: "folder", internal: "train-dir" }).default("./train/aki").description("训练数据集路径"),
                reg_data_dir: Schema.string().role('filepicker', { type: "folder", internal: "train-dir" }).description("正则化数据集路径。默认留空，不使用正则化图像"),
                prior_loss_weight: Schema.number().step(0.1).default(1.0).description("正则化 - 先验损失权重"),
                resolution: Schema.string().default("512,512").description("训练图片分辨率，宽x高。支持非正方形，但必须是 64 倍数。"),
                enable_bucket: Schema.boolean().default(true).description("启用 arb 桶以允许非固定宽高比的图片"),
                min_bucket_reso: Schema.number().default(256).description("arb 桶最小分辨率"),
                max_bucket_reso: Schema.number().default(1024).description("arb 桶最大分辨率"),
                bucket_reso_steps: Schema.number().default(64).description("arb 桶分辨率划分单位，SDXL 可以使用 32 (SDXL低于32时失效)"),
                bucket_no_upscale: Schema.boolean().default(true).description("arb 桶不放大图片"),
                bucket_selection_mode: Schema.union(["legacy", "nearest_only", "custom_only"]).default("legacy").description("分桶策略：`legacy` 为原始穷举桶，`nearest_only` 会根据训练集实际宽高比生成就近桶，`custom_only` 只允许命中你指定的桶列表"),
                bucket_custom_resos: Schema.string().role('textarea').description("自定义桶列表。一行一个，支持 `1024x1024`、`1024,1536`。仅在 `custom_only` 时生效"),
            },
            CAPTION_SETTINGS: {
                caption_extension: Schema.string().default(".txt").description("Tag 文件扩展名"),
                shuffle_caption: Schema.boolean().default(false).description("训练时随机打乱 tokens"),
                weighted_captions: Schema.boolean().description("使用带权重的 token，不推荐与 shuffle_caption 一同开启"),
                keep_tokens: Schema.number().min(0).max(255).step(1).default(0).description("在随机打乱 tokens 时，保留前 N 个不变"),
                keep_tokens_separator: Schema.string().description("保留 tokens 时使用的分隔符"),
                max_token_length: Schema.number().default(255).description("最大 token 长度"),
                caption_dropout_rate: Schema.number().min(0).step(0.01).description("丢弃全部标签的概率，对一个图片概率不使用 caption 或 class token"),
                caption_dropout_every_n_epochs: Schema.number().min(0).max(100).step(1).description("每 N 个 epoch 丢弃全部标签"),
                caption_tag_dropout_rate: Schema.number().min(0).step(0.01).description("按逗号分隔的标签来随机丢弃 tag 的概率"),
                caption_tag_dropout_targets: Schema.string().role('textarea').description("指定要处理的 tag 列表。一行一个，也支持逗号分隔"),
                caption_tag_dropout_target_mode: Schema.union(["drop_all", "random_n"]).default("drop_all").description("指定 tag 的处理方式：`drop_all` 为全部移除，`random_n` 为仅在命中的 tag 中随机丢弃 N 个"),
                caption_tag_dropout_target_count: Schema.number().min(1).step(1).default(1).description("当指定 tag 处理方式为 `random_n` 时，每张图随机丢弃多少个命中 tag"),
            },
            PRECISION_CACHE_BATCH: {
                mixed_precision: Schema.union(["no", "fp16", "bf16"]).default("bf16").description("训练混合精度, RTX30系列以后也可以指定`bf16`"),
                full_fp16: Schema.boolean().description("完全使用 FP16 精度"),
                full_bf16: Schema.boolean().description("完全使用 BF16 精度"),
                no_half_vae: Schema.boolean().description("不使用半精度 VAE"),
                torch_compile: Schema.boolean().default(false).description("实验性：启用 PyTorch `torch.compile`，部分环境可提升训练吞吐，但首次编译会更慢"),
                dynamo_backend: Schema.union([
                    "eager",
                    "aot_eager",
                    "inductor",
                    "aot_ts_nvfuser",
                    "nvprims_nvfuser",
                    "cudagraphs",
                    "ofi",
                    "fx2trt",
                    "onnxrt",
                    "tensort",
                    "ipex",
                    "tvm",
                ]).default("inductor").description("`torch.compile` 后端，通常保持 `inductor` 即可；仅在启用 torch.compile 时生效"),
                opt_channels_last: Schema.boolean().default(false).description("实验性：将卷积型模型切换到 `channels_last` 内存格式。更适合 SD1.5 / SDXL / ControlNet 等 U-Net 路线"),
                mem_eff_attn: Schema.boolean().description("启用省显存 attention（比 xformers 更兼容，但通常更慢）"),
                xformers: Schema.boolean().default(true).description("启用 xformers"),
                sdpa: Schema.boolean().description("启用 sdpa"),
                lowram: Schema.boolean().default(false).description("低内存模式 该模式下会将 U-net、文本编码器、VAE 直接加载到显存中"),
                cache_latents: Schema.boolean().default(true).description("缓存图像 latent, 缓存 VAE 输出以减少 VRAM 使用"),
                cache_latents_to_disk: Schema.boolean().default(true).description("缓存图像 latent 到磁盘"),
                cache_text_encoder_outputs: Schema.boolean().description("缓存文本编码器的输出，减少显存使用。使用时需要关闭 shuffle_caption"),
                cache_text_encoder_outputs_to_disk: Schema.boolean().description("缓存文本编码器的输出到磁盘"),
                persistent_data_loader_workers: Schema.boolean().default(true).description("保留加载训练集的worker，减少每个 epoch 之间的停顿。"),
                vae_batch_size: Schema.number().min(1).description("vae 编码批量大小"),
                cpu_offload_checkpointing: Schema.boolean().default(false).description("实验性：梯度检查点时将部分张量卸载到 CPU，节省显存"),
                pytorch_cuda_expandable_segments: Schema.boolean().default(true).description("训练前自动设置 `PYTORCH_ALLOC_CONF=expandable_segments:True`，缓解显存碎片导致的 OOM。一般对速度影响很小；如需排查兼容性或自行管理 allocator，可关闭"),
            }
        },

        LYCORIS_MAIN: Schema.union([
            Schema.object({
                network_module: Schema.const('lycoris.kohya').required(),
                lycoris_algo: Schema.union(["locon", "loha", "lokr", "ia3", "dylora", "glora", "diag-oft", "boft"]).default("locon").description('LyCORIS 网络算法'),
                conv_dim: Schema.number().default(4),
                conv_alpha: Schema.number().default(1),
                dropout: Schema.number().step(0.01).default(0).description('dropout 概率。推荐 0~0.5，LoHa/LoKr/(IA)^3暂不支持'),
                train_norm: Schema.boolean().default(false).description('训练 Norm 层，不支持 (IA)^3'),
            }),
            Schema.object({}),
        ]),

        LYCORIS_LOKR: Schema.union([
            Schema.object({
                lycoris_algo: Schema.const('lokr').required(),
                lokr_factor: Schema.number().min(-1).default(-1).description('常用 `4~无穷`（填写 -1 为无穷）'),
            }),
            Schema.object({}),
        ]),

        NETWORK_OPTION_DYLORA: Schema.union([
            Schema.object({
                network_module: Schema.const('networks.dylora').required(),
                dylora_unit: Schema.number().min(1).default(4).description(' dylora 分割块数单位，最小 1 也最慢。一般 4、8、12、16 这几个选'),
            }),
            Schema.object({}),
        ]),

        NETWORK_OPTION_BASEWEIGHT: Schema.union([
            Schema.object({
                enable_base_weight: Schema.const(true).required(),
                base_weights: Schema.string().role('textarea').description("合并入底模的 LoRA 路径，一行一个路径"),
                base_weights_multiplier: Schema.string().role('textarea').description("合并入底模的 LoRA 权重，一行一个数字"),
            }),
            Schema.object({}),
        ]),

        NETWORK_OPTION_BLOCK_WEIGHTS: Schema.union([
            Schema.object({
                enable_block_weights: Schema.const(true).required(),
                down_lr_weight: Schema.string().role('folder').default("1,1,1,1,1,1,1,1,1,1,1,1").description("U-Net 的 Encoder 层分层学习率权重，共 12 层"),
                mid_lr_weight: Schema.string().role('folder').default("1").description("U-Net 的 Mid 层分层学习率权重，共 1 层"),
                up_lr_weight: Schema.string().role('folder').default("1,1,1,1,1,1,1,1,1,1,1,1").description("U-Net 的 Decoder 层分层学习率权重，共 12 层"),
                block_lr_zero_threshold: Schema.number().step(0.01).default(0).description("分层学习率置 0 阈值"),
            }),
            Schema.object({}),
        ]),

        LULYNX_EXPERIMENTAL_CORE_SDXL,
        LULYNX_EXPERIMENTAL_CORE_ANIMA,

        SAVE_SETTINGS: Schema.intersect([
            Schema.object({
                output_name: Schema.string().default("aki").description("模型保存名称"),
                output_dir: Schema.string().role('filepicker', { type: "folder" }).default("./output").description("模型保存文件夹"),
                save_model_as: Schema.union(["safetensors", "pt", "ckpt"]).default("safetensors").description("模型保存格式"),
                save_precision: Schema.union(["fp16", "float", "bf16"]).default("fp16").description("模型保存精度"),
                save_every_n_epochs: Schema.number().default(2).description("每 N epoch（轮）自动保存一次模型"),
                save_every_n_steps: Schema.number().min(1).description("每 N 步自动保存一次模型"),
                save_n_epoch_ratio: Schema.number().min(1).description("按 epoch 比例保存，保证整个训练阶段至少保存 N 份模型"),
                save_last_n_epochs: Schema.number().min(1).description("仅保留最近 N 个按 epoch 保存的模型"),
                save_last_n_steps: Schema.number().min(1).description("仅保留最近 N 步范围内的按 step 保存模型"),
                save_state: Schema.boolean().default(false).description("保存训练状态 配合 `resume` 参数可以继续从某个状态训练"),
                save_state_on_train_end: Schema.boolean().default(false).description("训练结束时额外保存一次训练状态"),
            }).description("保存设置"),
            Schema.union([
                Schema.object({
                    save_state: Schema.const(true).required(),
                    save_last_n_epochs_state: Schema.number().min(1).description("仅保存最后 n epoch 的训练状态"),
                    save_last_n_steps_state: Schema.number().min(1).description("仅保留最近 N 步范围内的训练状态"),
                }),
                Schema.object({})
            ])
        ]),

        THERMAL_MANAGEMENT: Schema.object({
            cooldown_every_n_epochs: Schema.number().min(1).description("每 N 个 epoch 在该轮保存与预览完成后暂停一次训练。留空表示关闭"),
            cooldown_minutes: Schema.number().min(0).step(0.5).description("每次冷却至少暂停多少分钟。留空或 0 表示不按固定时长等待"),
            cooldown_until_temp_c: Schema.number().min(1).description("冷却时等待到本机训练显卡温度降到多少摄氏度以下再继续。留空表示不按温度等待"),
            cooldown_poll_seconds: Schema.number().min(1).default(15).description("温度轮询间隔（秒）。仅在按温度等待时生效"),
            gpu_power_limit_w: Schema.number().min(1).description("训练开始前尝试设置整张训练显卡的功率墙，单位瓦。该限制作用于整张显卡，不是单个训练进程"),
        }).description("散热与功耗管理"),

        LR_OPTIMIZER: Schema.intersect([
            Schema.object({
                learning_rate: Schema.string().default("1e-4").description("总学习率, 在分开设置 U-Net 与文本编码器学习率后这个值失效。"),
                unet_lr: Schema.string().default("1e-4").description("U-Net 学习率"),
                text_encoder_lr: Schema.string().default("1e-5").description("文本编码器学习率"),
                lr_scheduler: Schema.union([
                    "linear",
                    "cosine",
                    "cosine_with_restarts",
                    "polynomial",
                    "constant",
                    "constant_with_warmup",
                ]).default("cosine_with_restarts").description("学习率调度器设置"),
                lr_scheduler_type: Schema.string().description("自定义学习率调度器类路径。填写后会优先于上方调度器，例如 `torch.optim.lr_scheduler.CosineAnnealingLR`"),
                lr_scheduler_args: Schema.array(String).role('table').description("自定义学习率调度器参数，一行一个 `key=value`，例如 `T_max=1000`"),
                lr_warmup_steps: Schema.number().default(0).description('学习率预热步数'),
                loss_type: Schema.union(["l1", "l2", "huber", "smooth_l1"]).description("损失函数类型"),
            }).description("学习率与优化器设置"),

            Schema.union([
                Schema.object({
                    lr_scheduler: Schema.const('cosine_with_restarts'),
                    lr_scheduler_num_cycles: Schema.number().default(1).description('重启次数'),
                }),
                Schema.object({}),
            ]),

            Schema.object({
                optimizer_type: Schema.union([
                    "AdamW",
                    "AdamW8bit",
                    "PagedAdamW8bit",
                    "RAdamScheduleFree",
                    "Lion",
                    "Lion8bit",
                    "PagedLion8bit",
                    "SGDNesterov",
                    "SGDNesterov8bit",
                    "DAdaptation",
                    "DAdaptAdam",
                    "DAdaptAdaGrad",
                    "DAdaptAdanIP",
                    "DAdaptLion",
                    "DAdaptSGD",
                    "AdaFactor",
                    "Prodigy",
                    "prodigyplus.ProdigyPlusScheduleFree",
                    "pytorch_optimizer.CAME",
                    "bitsandbytes.optim.AdEMAMix8bit",
                    "bitsandbytes.optim.PagedAdEMAMix8bit"
                ]).default("AdamW8bit").description("优化器设置"),
                min_snr_gamma: Schema.number().step(0.1).description("最小信噪比伽马值, 如果启用推荐为 5"),
            }),

            Schema.union([
                Schema.object({
                    optimizer_type: Schema.const('Prodigy').required(),
                    prodigy_d0: Schema.string(),
                    prodigy_d_coef: Schema.string().default("2.0"),
                }),
                Schema.object({}),
            ]),

            Schema.object({
                optimizer_args_custom: Schema.array(String).role('table').description('自定义 optimizer_args，一行一个'),
            })
        ]),

        PREVIEW_IMAGE: Schema.intersect([
            Schema.object({
                enable_preview: Schema.boolean().default(false).description('启用训练预览图'),
            }).description('训练预览图设置'),

            Schema.union([
                Schema.object({
                    enable_preview: Schema.const(true).required(),
                    randomly_choice_prompt: Schema.boolean().default(false).description('随机选择预览图 Prompt'),
                    prompt_file: Schema.string().role('textarea').description('预览图 Prompt 文件路径。填写后将采用文件内的 prompt，而下方的选项将失效。'),
                    positive_prompts: Schema.string().role('textarea').default('masterpiece, best quality, 1girl, solo').description("Prompt"),
                    negative_prompts: Schema.string().role('textarea').default('lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts,signature, watermark, username, blurry').description("Negative Prompt"),
                    sample_width: Schema.number().default(512).description('预览图宽'),
                    sample_height: Schema.number().default(512).description('预览图高'),
                    sample_cfg: Schema.number().min(1).max(30).default(7).description('CFG Scale'),
                    sample_seed: Schema.number().default(2333).description('种子'),
                    sample_steps: Schema.number().min(1).max(300).default(24).description('迭代步数'),
                    sample_sampler: Schema.union(["ddim", "pndm", "lms", "euler", "euler_a", "heun", "dpm_2", "dpm_2_a", "dpmsolver", "dpmsolver++", "dpmsingle", "k_lms", "k_euler", "k_euler_a", "k_dpm_2", "k_dpm_2_a"]).default("euler_a").description("生成预览图所用采样器"),
                    sample_every_n_steps: Schema.number().min(1).description("每 N 步生成一次预览图"),
                    sample_every_n_epochs: Schema.number().default(2).description("每 N 个 epoch 生成一次预览图"),
                    sample_at_first: Schema.boolean().default(false).description("训练开始前先生成一次预览图"),
                }),
                Schema.object({
                    enable_preview: Schema.const(true).required(),
                    randomly_choice_prompt: Schema.const(true).required(),
                    random_prompt_include_subdirs: Schema.boolean().default(false).description('从 train_data_dir 下所有子目录随机选择 Prompt（用于多子目录数据集）'),
                }),
                Schema.object({}),
            ]),
        ]),

        LOG_SETTINGS: Schema.intersect([
            Schema.object({
                log_with: Schema.union(["tensorboard", "wandb"]).default("tensorboard").description("日志模块"),
                log_prefix: Schema.string().description("日志前缀"),
                log_tracker_name: Schema.string().description("日志追踪器名称"),
                wandb_run_name: Schema.string().description("wandb 单次运行显示名称"),
                log_tracker_config: Schema.string().role('filepicker', { type: "model-file" }).description("日志追踪器配置文件路径"),
                logging_dir: Schema.string().default("./logs").description("日志保存文件夹"),
            }).description('日志设置'),

            Schema.union([
                Schema.object({
                    log_with: Schema.const("wandb").required(),
                    wandb_api_key: Schema.string().required().description("wandb 的 api 密钥"),
                }),
                Schema.object({}),
            ]),
        ]),

        VALIDATION_SETTINGS: Schema.object({
            validation_split: Schema.number().min(0).max(1).step(0.01).default(0).description("验证集划分比例。会从训练集中自动切出一部分做验证"),
            validation_seed: Schema.number().description("验证集切分随机种子。不填写时沿用训练随机种子"),
            validate_every_n_steps: Schema.number().min(1).description("每 N 步执行一次验证"),
            validate_every_n_epochs: Schema.number().min(1).description("每 N 个 epoch 执行一次验证"),
            max_validation_steps: Schema.number().min(1).description("每次验证最多处理多少个验证批次"),
        }).description("验证设置"),

        NOISE_SETTINGS: Schema.object({
            noise_offset: Schema.number().step(0.01).description("在训练中添加噪声偏移来改良生成非常暗或者非常亮的图像，如果启用推荐为 0.1"),
            noise_offset_random_strength: Schema.boolean().default(false).description("噪声偏移强度在 0 到 noise_offset 间随机变化"),
            multires_noise_iterations: Schema.number().step(1).description("多分辨率（金字塔）噪声迭代次数 推荐 6-10。无法与 noise_offset 一同启用"),
            multires_noise_discount: Schema.number().step(0.01).description("多分辨率（金字塔）衰减率 推荐 0.3-0.8，须同时与上方参数 multires_noise_iterations 一同启用"),
            ip_noise_gamma: Schema.number().step(0.01).description("输入扰动噪声强度，常用于正则化"),
            ip_noise_gamma_random_strength: Schema.boolean().default(false).description("输入扰动噪声强度在 0 到 ip_noise_gamma 间随机变化"),
            adaptive_noise_scale: Schema.number().step(0.01).description("自适应噪声缩放，会按 latent 平均绝对值动态追加 noise_offset"),
            min_timestep: Schema.number().min(0).description("训练时允许的最小 timestep"),
            max_timestep: Schema.number().min(1).description("训练时允许的最大 timestep"),
            huber_schedule: Schema.union(["constant", "exponential", "snr"]).description("Huber / Smooth L1 损失调度方式"),
            huber_c: Schema.number().step(0.01).description("Huber / Smooth L1 的衰减参数"),
            huber_scale: Schema.number().step(0.01).description("Huber / Smooth L1 的缩放参数"),
        }).description("噪声设置"),

        DATA_ENCHANCEMENT: Schema.object({
            color_aug: Schema.boolean().description("颜色改变"),
            flip_aug: Schema.boolean().description("图像翻转"),
            random_crop: Schema.boolean().description("随机剪裁"),
        }).description("数据增强"),

        OTHER: Schema.intersect([
            Schema.object({
                seed: Schema.number().default(1337).description("随机种子"),
                clip_skip: Schema.number().role("slider").min(0).max(12).step(1).default(2).description("CLIP 跳过层数 *玄学*"),
                masked_loss: Schema.boolean().default(false).description("启用 Masked Loss。训练带透明蒙版 / alpha 的图像时可用"),
                alpha_mask: Schema.boolean().default(false).description("读取训练图像的 alpha 通道作为 loss mask。做透明背景 / 抠图训练时通常要和 masked loss 一起检查"),
                ema_enabled: Schema.boolean().default(false).description("启用 EMA（指数滑动平均）。会额外复制一份训练参数，保存模型时自动写出 EMA 权重"),
                safeguard_enabled: Schema.boolean().default(false).description("启用轻量版 SafeGuard。可拦截 NaN / Inf loss 与异常 loss spike，并按配置自动降学习率"),
                no_metadata: Schema.boolean().default(false).description("不向输出模型写入完整训练元数据"),
                training_comment: Schema.string().role('textarea').description("写入模型元数据的训练备注"),
                initial_epoch: Schema.number().min(1).description("从指定 epoch 编号开始计数"),
                initial_step: Schema.number().min(0).description("从指定 step 编号开始计数，会覆盖 initial_epoch"),
                skip_until_initial_step: Schema.boolean().default(false).description("配合 initial_step 使用，真正跳过前面的训练步数"),
                ui_custom_params: Schema.string().role('textarea').description("**危险** 自定义参数，请输入 TOML 格式，将会直接覆盖当前界面内任何参数。实时更新，推荐写完后再粘贴过来"),
            }),
            Schema.union([
                Schema.object({
                    ema_enabled: Schema.const(true).required(),
                    ema_decay: Schema.number().min(0).max(0.99999).step(0.0001).default(0.999).description("EMA 衰减率。越接近 1 越平滑，常用 0.999~0.9999"),
                    ema_update_every: Schema.number().min(1).default(1).description("每 N 个优化 step 更新一次 EMA"),
                    ema_update_after_step: Schema.number().min(0).default(0).description("从第几个优化 step 开始更新 EMA"),
                    ema_use_warmup: Schema.boolean().default(false).description("对 EMA 衰减率启用 warmup，前期更快跟随当前权重"),
                    ema_inv_gamma: Schema.number().min(0.0001).step(0.01).default(1.0).description("EMA warmup 的 inverse gamma"),
                    ema_power: Schema.number().min(0.0001).step(0.01).default(0.75).description("EMA warmup 的 power"),
                }),
                Schema.object({}),
            ]),
            Schema.union([
                Schema.object({
                    safeguard_enabled: Schema.const(true).required(),
                    safeguard_nan_check_interval: Schema.number().min(1).default(1).description("每 N 个优化 step 检查一次 NaN / Inf loss"),
                    safeguard_max_nan_count: Schema.number().min(1).default(3).description("连续触发多少次 NaN / Inf 后直接停止训练"),
                    safeguard_loss_spike_threshold: Schema.number().min(1).step(0.1).default(5.0).description("当前 loss 超过滚动平均值多少倍时，判定为 spike 并跳过该 step"),
                    safeguard_loss_window_size: Schema.number().min(2).default(20).description("用于判定 loss spike 的滚动窗口大小"),
                    safeguard_auto_reduce_lr: Schema.boolean().default(false).description("SafeGuard 触发时自动降低学习率"),
                    safeguard_lr_reduction_factor: Schema.number().min(0.01).max(1).step(0.01).default(0.5).description("自动降低学习率时使用的倍率"),
                }),
                Schema.object({}),
            ]),
        ]).description("其他设置"),

        DISTRIBUTED_TRAINING: Schema.object({
            enable_distributed_training: Schema.boolean().default(false).description("启用分布式启动。当前为最小实现，支持多进程 / 多机拉起，以及 worker 最小配置与缺失资源同步"),
            num_processes: Schema.number().min(1).description("每台机器启动的训练进程数。留空时会优先按所选 GPU 数量自动推断"),
            num_machines: Schema.number().min(1).default(1).description("参与训练的机器总数"),
            machine_rank: Schema.number().min(0).default(0).description("当前机器编号，从 0 开始；主节点为 0"),
            main_process_ip: Schema.string().description("主节点 IP 地址。多机训练时必填"),
            main_process_port: Schema.number().min(1).max(65535).default(29500).description("主节点 rendezvous 端口"),
            nccl_socket_ifname: Schema.string().description("可选。NCCL 使用的网卡名，例如 Ethernet"),
            gloo_socket_ifname: Schema.string().description("可选。Gloo 使用的网卡名，例如 Ethernet"),
            sync_config_from_main: Schema.boolean().default(true).description("仅 worker 使用。从主节点同步训练配置"),
            sync_config_keys_from_main: Schema.string().default("*").description("要从主节点同步的顶层配置键，逗号分隔。填写 * 表示尽可能同步全部训练配置；worker 本地分布式字段会自动跳过"),
            sync_missing_assets_from_main: Schema.boolean().default(true).description("仅 worker 使用。按需从主节点补齐缺失模型、数据集、resume 等路径"),
            sync_asset_keys: Schema.string().default("pretrained_model_name_or_path,train_data_dir,reg_data_dir,vae,resume").description("要从主节点补齐的资源键，逗号分隔"),
            sync_main_repo_dir: Schema.string().description("主节点项目根目录。优先填写 worker 可直接访问的共享路径 / UNC 路径"),
            sync_main_toml: Schema.string().default("./config/autosave/distributed-main-latest.toml").description("主节点用于同步的 TOML 路径"),
            sync_ssh_user: Schema.string().description("远程同步时使用的 SSH 用户名。留空则直接使用 main_process_ip"),
            sync_ssh_port: Schema.number().min(1).max(65535).default(22).description("远程同步使用的 SSH 端口"),
            sync_use_password_auth: Schema.boolean().default(false).description("远程同步时启用密码认证。若开启且未走共享路径，需要本机可用 sshpass"),
            sync_ssh_password: Schema.string().description("远程同步密码。更推荐改用环境变量或共享路径"),
            clear_dataset_npz_before_train: Schema.boolean().default(false).description("worker 在启动训练前清空 train/reg 数据集中的 .npz 缓存和 metadata_cache.json。多机共享数据集发生变化时可开启"),
            ddp_timeout: Schema.number().min(0).description("分布式训练超时时间"),
            ddp_gradient_as_bucket_view: Schema.boolean(),
            ddp_static_graph: Schema.boolean().description("启用 DDP static_graph 优化"),
        }).description("分布式训练"),

    }

    return data
})()
