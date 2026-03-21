Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("sd3-finetune").disabled().description("训练种类"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("SD3 模型路径"),
        vae: Schema.string().role('filepicker', { type: "model-file" }).description("VAE 模型文件路径（可选，不填则尝试从底模中读取）"),
        clip_l: Schema.string().role('filepicker', { type: "model-file" }).description("clip_l 模型文件路径"),
        clip_g: Schema.string().role('filepicker', { type: "model-file" }).description("clip_g 模型文件路径"),
        t5xxl: Schema.string().role('filepicker', { type: "model-file" }).description("t5xxl 模型文件路径"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
    }).description("训练用模型"),

    Schema.object({
        t5xxl_max_token_length: Schema.number().step(1).default(256).description("T5XXL 最大 token 长度"),
        apply_lg_attn_mask: Schema.boolean().default(false).description("对 CLIP-L / CLIP-G 应用注意力掩码"),
        apply_t5_attn_mask: Schema.boolean().default(false).description("对 T5-XXL 应用注意力掩码"),
        clip_l_dropout_rate: Schema.number().min(0).max(1).step(0.01).description("CLIP-L dropout 概率"),
        clip_g_dropout_rate: Schema.number().min(0).max(1).step(0.01).description("CLIP-G dropout 概率"),
        t5_dropout_rate: Schema.number().min(0).max(1).step(0.01).description("T5XXL dropout 概率"),
        pos_emb_random_crop_rate: Schema.number().min(0).max(1).step(0.01).description("位置编码随机裁切概率"),
        enable_scaled_pos_embed: Schema.boolean().default(false).description("启用缩放位置编码"),
        training_shift: Schema.number().step(0.001).default(1.0).description("训练时的离散流位移"),
        weighting_scheme: Schema.union(["sigma_sqrt", "logit_normal", "mode", "cosmap", "none", "uniform"]).default("uniform").description("时间步分布权重策略"),
        logit_mean: Schema.number().step(0.01).description("logit_normal 权重策略的均值"),
        logit_std: Schema.number().step(0.01).description("logit_normal 权重策略的标准差"),
        mode_scale: Schema.number().step(0.01).description("mode 权重策略的缩放系数"),
        train_text_encoder: Schema.boolean().default(false).description("训练 CLIP-L / CLIP-G"),
        train_t5xxl: Schema.boolean().default(false).description("训练 T5XXL（启用时会同时训练 CLIP-L / CLIP-G）"),
        use_t5xxl_cache_only: Schema.boolean().default(false).description("仅缓存 T5XXL 输出"),
        num_last_block_to_freeze: Schema.number().min(1).description("冻结 MM-DiT 最后 N 个 block"),
        blockwise_fused_optimizers: Schema.boolean().default(false).description("启用 blockwise fused optimizer"),
    }).description("SD3 专用参数"),

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.DATASET_SETTINGS, {
            resolution: Schema.string().default("1024,1024").description("训练图片分辨率，宽x高。支持非正方形，但必须是 64 倍数。"),
            enable_bucket: Schema.boolean().default(true).description("启用 arb 桶以允许非固定宽高比的图片"),
            min_bucket_reso: Schema.number().default(256).description("arb 桶最小分辨率"),
            max_bucket_reso: Schema.number().default(2048).description("arb 桶最大分辨率"),
            bucket_reso_steps: Schema.number().default(64).description("arb 桶分辨率划分单位"),
        })
    ).description("数据集设置"),

    SHARED_SCHEMAS.SAVE_SETTINGS,

    Schema.object({
        max_train_epochs: Schema.number().min(1).default(10).description("最大训练 epoch（轮数）"),
        train_batch_size: Schema.number().min(1).default(1).description("批量大小"),
        gradient_checkpointing: Schema.boolean().default(true).description("梯度检查点"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累加步数"),
        max_grad_norm: Schema.number().min(0).step(0.1).default(1.0).description("梯度裁剪上限，0 表示不裁剪"),
    }).description("训练相关参数"),

    Schema.intersect([
        Schema.object({
            learning_rate: Schema.string().default("2e-6").description("学习率"),
            learning_rate_te1: Schema.string().description("CLIP-L 学习率，留空则跟随基础学习率"),
            learning_rate_te2: Schema.string().description("CLIP-G 学习率，留空则跟随基础学习率"),
            learning_rate_te3: Schema.string().description("T5XXL 学习率，留空则跟随基础学习率"),
            lr_scheduler: Schema.union([
                "linear",
                "cosine",
                "cosine_with_restarts",
                "polynomial",
                "constant",
                "constant_with_warmup",
            ]).default("cosine_with_restarts").description("学习率调度器设置"),
            lr_scheduler_type: Schema.string().description("自定义学习率调度器类路径"),
            lr_scheduler_args: Schema.array(String).role('table').description("自定义学习率调度器参数，一行一个 `key=value`"),
            lr_warmup_steps: Schema.number().default(0).description("学习率预热步数"),
            min_snr_gamma: Schema.number().step(0.1).description("最小信噪比伽马值，如果启用推荐为 5"),
            loss_type: Schema.union(["l1", "l2", "huber", "smooth_l1"]).default("l2").description("损失函数类型"),
        }).description("学习率与优化器设置"),
        Schema.union([
            Schema.object({
                lr_scheduler: Schema.const("cosine_with_restarts"),
                lr_scheduler_num_cycles: Schema.number().default(1).description("重启次数"),
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
        }),
        Schema.object({
            optimizer_args_custom: Schema.array(String).role('table').description("自定义 optimizer_args，一行一个"),
        }),
    ]),

    SHARED_SCHEMAS.PREVIEW_IMAGE,
    SHARED_SCHEMAS.LOG_SETTINGS,
    SHARED_SCHEMAS.VALIDATION_SETTINGS,
    Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS, {}, ["max_token_length"])).description("caption（Tag）选项"),
    SHARED_SCHEMAS.NOISE_SETTINGS,
    SHARED_SCHEMAS.DATA_ENCHANCEMENT,
    SHARED_SCHEMAS.OTHER,
    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.PRECISION_CACHE_BATCH, {
            fp8_base: Schema.boolean().default(true).description("对基础模型使用 FP8 精度"),
            fp8_base_unet: Schema.boolean().description("仅对 U-Net / DiT 使用 FP8 精度"),
            cache_text_encoder_outputs: Schema.boolean().default(true).description("缓存文本编码器的输出"),
            cache_text_encoder_outputs_to_disk: Schema.boolean().default(true).description("缓存文本编码器输出到磁盘"),
            text_encoder_batch_size: Schema.number().min(1).description("文本编码器缓存批量大小"),
            disable_mmap_load_safetensors: Schema.boolean().default(false).description("禁用 safetensors 的 mmap 加载"),
            blocks_to_swap: Schema.number().min(1).description("在 CPU/GPU 间交换的 Transformer block 数量"),
            cpu_offload_checkpointing: Schema.boolean().default(false).description("实验性：梯度检查点时将部分张量卸载到 CPU"),
        }, ["xformers"])
    ).description("速度优化选项"),
    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
