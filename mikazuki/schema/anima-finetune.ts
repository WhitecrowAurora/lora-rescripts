Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("anima-finetune").disabled().description("训练种类"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("Anima 模型路径"),
        vae: Schema.string().role('filepicker', { type: "model-file" }).description("Qwen Image VAE 模型路径"),
        qwen3: Schema.string().role('filepicker', { type: "model-file" }).description("Qwen3 文本模型路径"),
        llm_adapter_path: Schema.string().role('filepicker', { type: "model-file" }).description("单独的 LLM Adapter 权重路径（可选）"),
        t5_tokenizer_path: Schema.string().role('filepicker', { type: "folder" }).description("T5 tokenizer 目录路径（可选）"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
    }).description("训练用模型"),

    Schema.object({
        qwen3_max_token_length: Schema.number().step(1).default(512).description("Qwen3 最大 token 长度"),
        t5_max_token_length: Schema.number().step(1).default(512).description("T5 最大 token 长度"),
        timestep_sampling: Schema.union(["sigma", "uniform", "sigmoid", "shift", "flux_shift"]).default("sigmoid").description("时间步采样"),
        sigmoid_scale: Schema.number().step(0.001).default(1.0).description("sigmoid 缩放"),
        discrete_flow_shift: Schema.number().step(0.001).default(1.0).description("Rectified Flow 位移"),
        weighting_scheme: Schema.union(["sigma_sqrt", "logit_normal", "mode", "cosmap", "none", "uniform"]).default("uniform").description("时间步分布权重策略"),
        logit_mean: Schema.number().step(0.01).description("logit_normal 权重策略的均值"),
        logit_std: Schema.number().step(0.01).description("logit_normal 权重策略的标准差"),
        mode_scale: Schema.number().step(0.01).description("mode 权重策略的缩放系数"),
        attn_mode: Schema.union(["", "torch", "xformers", "flash", "sageattn"]).default("").description("Attention 实现，留空表示使用脚本默认值（torch）"),
        split_attn: Schema.boolean().default(false).description("拆分 attention 计算以降低显存占用"),
        vae_chunk_size: Schema.number().min(2).description("VAE 编码/解码分块大小（需为偶数）"),
        vae_disable_cache: Schema.boolean().default(false).description("禁用内部 VAE 缓存机制"),
        unsloth_offload_checkpointing: Schema.boolean().default(false).description("使用更快的 CPU RAM activation offload（不能与 blocks_to_swap / cpu_offload_checkpointing 同时使用）"),
    }).description("Anima 专用参数"),

    Schema.object({
        self_attn_lr: Schema.string().description("自注意力层学习率，留空则跟随基础学习率，0 表示冻结"),
        cross_attn_lr: Schema.string().description("交叉注意力层学习率，留空则跟随基础学习率，0 表示冻结"),
        mlp_lr: Schema.string().description("MLP 层学习率，留空则跟随基础学习率，0 表示冻结"),
        mod_lr: Schema.string().description("AdaLN 调制层学习率，留空则跟随基础学习率，0 表示冻结"),
        llm_adapter_lr: Schema.string().description("LLM Adapter 学习率，留空则跟随基础学习率，0 表示冻结"),
    }).description("Anima 分组学习率"),

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
            fp8_base: Schema.boolean().default(false).description("对基础模型使用 FP8 精度"),
            fp8_base_unet: Schema.boolean().default(false).description("仅对 DiT / U-Net 使用 FP8 精度"),
            cache_text_encoder_outputs: Schema.boolean().default(true).description("缓存文本编码器的输出，减少显存使用。使用时需要关闭 shuffle_caption"),
            cache_text_encoder_outputs_to_disk: Schema.boolean().default(true).description("缓存文本编码器的输出到磁盘"),
            text_encoder_batch_size: Schema.number().min(1).description("文本编码器缓存批量大小"),
            disable_mmap_load_safetensors: Schema.boolean().default(false).description("禁用 safetensors 的 mmap 加载"),
            blocks_to_swap: Schema.number().min(1).description("在 CPU/GPU 间交换的 Transformer block 数量，用于进一步省显存"),
            cpu_offload_checkpointing: Schema.boolean().default(false).description("实验性：梯度检查点时将部分张量卸载到 CPU"),
        }, ["xformers", "sdpa"])
    ).description("速度优化选项"),
    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
