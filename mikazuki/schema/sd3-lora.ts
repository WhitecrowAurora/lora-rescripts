Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("sd3-lora").disabled().description("训练种类"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("SD3 模型路径"),
        clip_l: Schema.string().role('filepicker', { type: "model-file" }).description("clip_l 模型文件路径"),
        clip_g: Schema.string().role('filepicker', { type: "model-file" }).description("clip_g 模型文件路径"),
        t5xxl: Schema.string().role('filepicker', { type: "model-file" }).description("t5xxl 模型文件路径"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
    }).description("训练用模型"),

    Schema.object({
        t5xxl_max_token_length: Schema.number().step(1).description("T5XXL 最大 token 长度（不填写使用自动）"),
        train_t5xxl: Schema.boolean().default(false).description("训练 T5XXL（不推荐）"),
        weighting_scheme: Schema.union(["sigma_sqrt", "logit_normal", "mode", "cosmap", "none", "uniform"]).default("uniform").description("时间步分布权重策略"),
        logit_mean: Schema.number().step(0.01).description("logit_normal 权重策略的均值"),
        logit_std: Schema.number().step(0.01).description("logit_normal 权重策略的标准差"),
        mode_scale: Schema.number().step(0.01).description("mode 权重策略的缩放系数"),
        apply_lg_attn_mask: Schema.boolean().default(false).description("对 CLIP-L / CLIP-G 应用注意力掩码"),
        clip_l_dropout_rate: Schema.number().min(0).max(1).step(0.01).description("CLIP-L dropout 概率"),
        clip_g_dropout_rate: Schema.number().min(0).max(1).step(0.01).description("CLIP-G dropout 概率"),
        t5_dropout_rate: Schema.number().min(0).max(1).step(0.01).description("T5XXL dropout 概率"),
        pos_emb_random_crop_rate: Schema.number().min(0).max(1).step(0.01).description("位置编码随机裁切概率"),
        enable_scaled_pos_embed: Schema.boolean().default(false).description("启用缩放位置编码"),
    }).description("SD3 专用参数"),

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.DATASET_SETTINGS, {
            resolution: Schema.string().default("768,768").description("训练图片分辨率，宽x高。支持非正方形，但必须是 64 倍数。"),
            enable_bucket: Schema.boolean().default(true).description("启用 arb 桶以允许非固定宽高比的图片"),
            min_bucket_reso: Schema.number().default(256).description("arb 桶最小分辨率"),
            max_bucket_reso: Schema.number().default(2048).description("arb 桶最大分辨率"),
            bucket_reso_steps: Schema.number().default(64).description("arb 桶分辨率划分单位"),
        })
    ).description("数据集设置"),

    // 保存设置
    SHARED_SCHEMAS.SAVE_SETTINGS,

    Schema.object({
        max_train_epochs: Schema.number().min(1).default(20).description("最大训练 epoch（轮数）"),
        train_batch_size: Schema.number().min(1).default(1).description("批量大小, 越高显存占用越高"),
        gradient_checkpointing: Schema.boolean().default(true).description("梯度检查点"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累加步数"),
        network_train_unet_only: Schema.boolean().default(true).description("仅训练 U-Net"),
        network_train_text_encoder_only: Schema.boolean().default(false).description("仅训练文本编码器"),
    }).description("训练相关参数"),

    // 学习率&优化器设置
    SHARED_SCHEMAS.LR_OPTIMIZER,

    Schema.intersect([
        Schema.object({
            network_module: Schema.union(["networks.lora_sd3", "lycoris.kohya"]).default("networks.lora_sd3").description("训练网络模块"),
            network_weights: Schema.string().role('filepicker').description("从已有的 LoRA 模型上继续训练，填写路径"),
            network_dim: Schema.number().min(1).default(4).description("网络维度，常用 4~128，不是越大越好, 低dim可以降低显存占用"),
            network_alpha: Schema.number().min(1).default(1).description("常用值：等于 network_dim 或 network_dim*1/2 或 1。使用较小的 alpha 需要提升学习率"),
            dim_from_weights: Schema.boolean().default(false).description("从已有 network_weights 自动推断 rank / dim"),
            network_args_custom: Schema.array(String).role('table').description('自定义 network_args，一行一个'),
            enable_base_weight: Schema.boolean().default(false).description('启用基础权重（差异炼丹）'),
        }).description("网络设置"),

        // lycoris 参数
        SHARED_SCHEMAS.LYCORIS_MAIN,
        SHARED_SCHEMAS.LYCORIS_LOKR,

        SHARED_SCHEMAS.NETWORK_OPTION_BASEWEIGHT,
    ]),

    // 预览图设置
    SHARED_SCHEMAS.PREVIEW_IMAGE,

    // 日志设置
    SHARED_SCHEMAS.LOG_SETTINGS,

    // caption 选项
    // FLUX 去除 max_token_length
    Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS, {}, ["max_token_length"])).description("caption（Tag）选项"),

    // 噪声设置
    SHARED_SCHEMAS.NOISE_SETTINGS,

    // 数据增强
    SHARED_SCHEMAS.DATA_ENCHANCEMENT,

    // 其他选项
    SHARED_SCHEMAS.OTHER,

    // 速度优化选项
    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.PRECISION_CACHE_BATCH, {
            fp8_base: Schema.boolean().default(true).description("对基础模型使用 FP8 精度"),
            fp8_base_unet: Schema.boolean().description("仅对 U-Net 使用 FP8 精度（CLIP-L不使用）"),
            sdpa: Schema.boolean().default(true).description("启用 sdpa"),
            cache_text_encoder_outputs: Schema.boolean().default(true).description("缓存文本编码器的输出，减少显存使用。使用时需要关闭 shuffle_caption"),
            cache_text_encoder_outputs_to_disk: Schema.boolean().default(true).description("缓存文本编码器的输出到磁盘"),
            text_encoder_batch_size: Schema.number().min(1).description("文本编码器缓存批量大小"),
            disable_mmap_load_safetensors: Schema.boolean().default(false).description("禁用 safetensors 的 mmap 加载"),
            blocks_to_swap: Schema.number().min(1).description("在 CPU/GPU 间交换的 Transformer block 数量，用于进一步省显存"),
        }, ["xformers"])
    ).description("速度优化选项"),

    // 分布式训练
    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
