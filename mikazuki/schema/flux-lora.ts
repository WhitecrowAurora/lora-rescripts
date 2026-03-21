Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("flux-lora").disabled().description("训练种类"),
        model_type: Schema.union(["flux", "chroma"]).default("flux").description("FLUX 模型类型 (支持 Chroma)"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("Flux 模型路径"),
        ae: Schema.string().role('filepicker', { type: "model-file" }).description("AE 模型文件路径"),
        clip_l: Schema.string().role('filepicker', { type: "model-file" }).description("clip_l 模型文件路径"),
        t5xxl: Schema.string().role('filepicker', { type: "model-file" }).description("t5xxl 模型文件路径"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
    }).description("训练用模型"),

    Schema.object({
        timestep_sampling: Schema.union(["sigma", "uniform", "sigmoid", "shift"]).default("sigmoid").description("时间步采样"),
        sigmoid_scale: Schema.number().step(0.001).default(1.0).description("sigmoid 缩放"),
        model_prediction_type: Schema.union(["raw", "additive", "sigma_scaled"]).default("raw").description("模型预测类型"),
        discrete_flow_shift: Schema.number().step(0.001).default(1.0).description("Euler 调度器离散流位移"),
        weighting_scheme: Schema.union(["sigma_sqrt", "logit_normal", "mode", "cosmap", "none", "uniform"]).default("uniform").description("时间步分布权重策略"),
        logit_mean: Schema.number().step(0.01).description("logit_normal 权重策略的均值"),
        logit_std: Schema.number().step(0.01).description("logit_normal 权重策略的标准差"),
        mode_scale: Schema.number().step(0.01).description("mode 权重策略的缩放系数"),
        loss_type: Schema.union(["l1", "l2", "huber", "smooth_l1"]).default("l2").description("损失函数类型"),
        guidance_scale: Schema.number().step(0.01).default(1.0).description("CFG 引导缩放"),
        t5xxl_max_token_length: Schema.number().step(1).description("T5XXL 最大 token 长度（不填写使用自动）"),
        train_t5xxl: Schema.boolean().default(false).description("训练 T5XXL（不推荐）"),
        // apply attention mask to T5-XXL encode and FLUX double blocks
        apply_t5_attn_mask: Schema.boolean().default(true).description("对 T5-XXL 编码器和 FLUX double块 应用注意力掩码"),
    }).description("Flux 专用参数"),

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.DATASET_SETTINGS, {
            resolution: Schema.string().default("768,768").description("训练图片分辨率，宽x高。支持非正方形，但必须是 64 倍数。"),
            enable_bucket: Schema.boolean().default(true).description("启用 arb 桶以允许非固定宽高比的图片"),
            min_bucket_reso: Schema.number().default(256).description("arb 桶最小分辨率"),
            max_bucket_reso: Schema.number().default(2048).description("arb 桶最大分辨率"),
            bucket_reso_steps: Schema.number().default(64).description("arb 桶分辨率划分单位，FLUX 需大于 64"),
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
            network_module: Schema.union(["networks.lora_flux", "networks.oft_flux", "lycoris.kohya"]).default("networks.lora_flux").description("训练网络模块"),
            network_weights: Schema.string().role('filepicker').description("从已有的 LoRA 模型上继续训练，填写路径"),
            network_dim: Schema.number().min(1).default(2).description("网络维度，常用 4~128，不是越大越好, 低dim可以降低显存占用"),
            network_alpha: Schema.number().min(1).default(16).description("常用值：等于 network_dim 或 network_dim*1/2 或 1。使用较小的 alpha 需要提升学习率"),
            network_dropout: Schema.number().step(0.01).default(0).description('dropout 概率 （与 lycoris 不兼容，需要用 lycoris 自带的）'),
            dim_from_weights: Schema.boolean().default(false).description("从已有 network_weights 自动推断 rank / dim"),
            scale_weight_norms: Schema.number().step(0.01).min(0).description("最大范数正则化。如果使用，推荐为 1"),
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
