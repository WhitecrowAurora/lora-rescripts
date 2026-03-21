Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("hunyuan-image-lora").disabled().description("训练种类"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("HunyuanImage 模型路径"),
        text_encoder: Schema.string().role('filepicker', { type: "model-file" }).description("Qwen2.5-VL 文本编码器路径"),
        byt5: Schema.string().role('filepicker', { type: "model-file" }).description("ByT5 模型路径"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
    }).description("训练用模型"),

    Schema.object({
        timestep_sampling: Schema.union(["sigma", "uniform", "sigmoid", "shift", "flux_shift"]).default("sigma").description("时间步采样"),
        sigmoid_scale: Schema.number().step(0.001).default(1.0).description("sigmoid 缩放"),
        model_prediction_type: Schema.union(["raw", "additive", "sigma_scaled"]).default("raw").description("模型预测类型"),
        discrete_flow_shift: Schema.number().step(0.001).default(5.0).description("Euler 调度器离散流位移"),
        weighting_scheme: Schema.union(["sigma_sqrt", "logit_normal", "mode", "cosmap", "none", "uniform"]).default("uniform").description("时间步分布权重策略"),
        logit_mean: Schema.number().step(0.01).description("logit_normal 权重策略的均值"),
        logit_std: Schema.number().step(0.01).description("logit_normal 权重策略的标准差"),
        mode_scale: Schema.number().step(0.01).description("mode 权重策略的缩放系数"),
        attn_mode: Schema.union(["", "torch", "xformers", "flash", "sageattn"]).default("").description("Attention 实现，留空表示使用脚本默认值（torch）"),
        split_attn: Schema.boolean().default(false).description("拆分 attention 计算以降低显存占用"),
        text_encoder_cpu: Schema.boolean().default(false).description("让文本编码器在 CPU 上推理"),
        vae_chunk_size: Schema.number().min(1).description("VAE 解码分块大小，用于降低显存占用"),
    }).description("HunyuanImage 专用参数"),

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
        train_batch_size: Schema.number().min(1).default(1).description("批量大小, 越高显存占用越高"),
        gradient_checkpointing: Schema.boolean().default(true).description("梯度检查点"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累加步数"),
        network_train_unet_only: Schema.boolean().default(true).description("仅训练 DiT / U-Net"),
        network_train_text_encoder_only: Schema.boolean().default(false).description("仅训练文本编码器"),
    }).description("训练相关参数"),

    SHARED_SCHEMAS.LR_OPTIMIZER,

    Schema.intersect([
        Schema.object({
            network_module: Schema.union(["networks.lora_hunyuan_image", "lycoris.kohya"]).default("networks.lora_hunyuan_image").description("训练网络模块"),
            network_weights: Schema.string().role('filepicker').description("从已有的 LoRA 模型上继续训练，填写路径"),
            network_dim: Schema.number().min(1).default(16).description("网络维度，常用 4~128，不是越大越好, 低 dim 可以降低显存占用"),
            network_alpha: Schema.number().min(1).default(16).description("常用值：等于 network_dim 或 network_dim*1/2 或 1。使用较小的 alpha 需要提升学习率"),
            network_dropout: Schema.number().step(0.01).default(0).description("dropout 概率（与 LyCORIS 不兼容，需要用 LyCORIS 自带的）"),
            dim_from_weights: Schema.boolean().default(false).description("从已有 network_weights 自动推断 rank / dim"),
            scale_weight_norms: Schema.number().step(0.01).min(0).description("最大范数正则化。如果使用，推荐为 1"),
            network_args_custom: Schema.array(String).role('table').description("自定义 network_args，一行一个"),
            enable_base_weight: Schema.boolean().default(false).description("启用基础权重（差异炼丹）"),
        }).description("网络设置"),

        SHARED_SCHEMAS.LYCORIS_MAIN,
        SHARED_SCHEMAS.LYCORIS_LOKR,
        SHARED_SCHEMAS.NETWORK_OPTION_BASEWEIGHT,
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
            fp8_scaled: Schema.boolean().default(false).description("启用 scaled FP8"),
            fp8_vl: Schema.boolean().default(false).description("对 VLM 文本编码器使用 FP8"),
            cache_text_encoder_outputs: Schema.boolean().default(true).description("缓存文本编码器的输出，减少显存使用。使用时需要关闭 shuffle_caption"),
            cache_text_encoder_outputs_to_disk: Schema.boolean().default(true).description("缓存文本编码器的输出到磁盘"),
            text_encoder_batch_size: Schema.number().min(1).description("文本编码器缓存批量大小"),
            disable_mmap_load_safetensors: Schema.boolean().default(false).description("禁用 safetensors 的 mmap 加载"),
            blocks_to_swap: Schema.number().min(1).description("在 CPU/GPU 间交换的 Transformer block 数量，用于进一步省显存"),
        }, ["xformers", "sdpa"])
    ).description("速度优化选项"),

    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
