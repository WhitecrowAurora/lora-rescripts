Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("anima-lora").disabled().description("训练种类"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("Anima 主 DiT / transformer 权重路径（例如 `anima-preview.safetensors`）"),
        vae: Schema.string().role('filepicker', { type: "model-file" }).description("Qwen Image VAE 模型路径（Anima 训练必填，LoRA 与完整训练都需要）"),
        qwen3: Schema.string().role('filepicker', { type: "model-file" }).description("Qwen3 文本模型路径。可填写单个 safetensors / pt 文件，或完整本地模型目录"),
        llm_adapter_path: Schema.string().role('filepicker', { type: "model-file" }).description("单独的 LLM Adapter 权重路径（可选）。填写后会覆盖 Anima 主模型内置的 Adapter"),
        t5_tokenizer_path: Schema.string().role('filepicker', { type: "folder" }).description("T5 tokenizer 目录路径（可选）。留空时回退到项目内置 `configs/t5_old`"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
    }).description("训练用模型"),

    Schema.object({
        qwen3_max_token_length: Schema.number().step(1).default(512).description("Qwen3 最大 token 长度"),
        t5_max_token_length: Schema.number().step(1).default(512).description("T5 最大 token 长度"),
        timestep_sampling: Schema.union(["sigma", "uniform", "sigmoid", "shift", "flux_shift"]).default("shift").description("时间步采样。默认使用与官方 Anima 训练器一致的 shift"),
        sigmoid_scale: Schema.number().step(0.001).default(1.0).description("sigmoid 缩放"),
        discrete_flow_shift: Schema.number().step(0.001).default(3.0).description("Rectified Flow 位移。默认 3.0，与官方 Anima 训练器一致"),
        weighting_scheme: Schema.union(["sigma_sqrt", "logit_normal", "mode", "cosmap", "none", "uniform"]).default("uniform").description("时间步分布权重策略"),
        logit_mean: Schema.number().step(0.01).description("logit_normal 权重策略的均值"),
        logit_std: Schema.number().step(0.01).description("logit_normal 权重策略的标准差"),
        mode_scale: Schema.number().step(0.01).description("mode 权重策略的缩放系数"),
        attn_mode: Schema.union(["", "torch", "xformers", "sageattn", "flash"]).default("").description("Attention 实现。留空时按当前运行时自动选择；在 FlashAttention 运行时下，Anima 会优先尝试 FlashAttention 2。"),
        split_attn: Schema.boolean().default(false).description("拆分 attention 计算以降低显存占用，但通常会牺牲一定训练速度。显存充足时一般建议关闭。"),
        vae_chunk_size: Schema.number().min(2).description("VAE 编码/解码分块大小（需为偶数）"),
        vae_disable_cache: Schema.boolean().default(false).description("禁用内部 VAE 缓存机制"),
        unsloth_offload_checkpointing: Schema.boolean().default(false).description("使用更快的 CPU RAM activation offload（不能与 blocks_to_swap / cpu_offload_checkpointing 同时使用）"),
    }).description("Anima 专用参数"),

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
        train_batch_size: Schema.number().min(1).default(1).description("批量大小。单卡/单进程时就是实际 batch；多卡/分布式时按全局 batch 解释，启动时会自动换算成每卡。数值越高显存占用越高。"),
        gradient_checkpointing: Schema.boolean().default(true).description("梯度检查点"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累加步数"),
        network_train_unet_only: Schema.boolean().default(true).description("仅训练 DiT / U-Net"),
        network_train_text_encoder_only: Schema.boolean().default(false).description("仅训练文本编码器"),
    }).description("训练相关参数"),

    SHARED_SCHEMAS.LR_OPTIMIZER,

    Schema.intersect([
        Schema.object({
            lora_type: Schema.union(["lora", "tlora", "lokr"]).default("lora").description("适配器类型。LoRA 更轻量；T-LoRA 会按时间步动态 rank；LoKr 走内置线性层注入的实验路线"),
            network_weights: Schema.string().role('filepicker').description("从已有的 LoRA / LoKr 模型继续训练，填写路径"),
            network_dim: Schema.number().min(1).default(16).description("网络维度，常用 4~128，不是越大越好, 低 dim 可以降低显存占用"),
            network_alpha: Schema.number().min(1).default(16).description("常用值：等于 network_dim 或 network_dim*1/2 或 1。使用较小的 alpha 需要提升学习率"),
            dim_from_weights: Schema.boolean().default(false).description("从已有 network_weights 自动推断 rank / dim"),
            scale_weight_norms: Schema.number().step(0.01).min(0).description("最大范数正则化。如果使用，推荐为 1"),
            train_norm: Schema.boolean().default(false).description("额外训练带可学习权重的 Norm 层（如 RMSNorm / 有 affine 的 LayerNorm）。很多不带权重的 Norm 层本身没有可训练参数，因此不会被纳入。"),
            conv_dim: Schema.number().hidden(),
            conv_alpha: Schema.number().hidden(),
            network_args_custom: Schema.array(String).role('table').description("自定义 network_args，一行一个"),
            enable_base_weight: Schema.boolean().default(false).description("启用基础权重（差异炼丹）"),
        }).description("网络设置"),

        Schema.union([
            Schema.object({
                lora_type: Schema.const("lora").default("lora"),
                network_module: Schema.const("networks.lora_anima").default("networks.lora_anima").hidden(),
                network_dropout: Schema.number().step(0.01).default(0).description("LoRA dropout 概率"),
                pissa_init: Schema.boolean().default(false).description("启用 PiSSA 初始化（实验性，仅在 LoRA 适配器类型下生效）"),
                lycoris_algo: Schema.string().hidden(),
                lokr_factor: Schema.number().hidden(),
                dropout: Schema.number().hidden(),
            }),
            Schema.object({
                lora_type: Schema.const("tlora").required(),
                network_module: Schema.const("networks.tlora_anima").default("networks.tlora_anima").hidden(),
                network_dropout: Schema.number().step(0.01).default(0).description("T-LoRA dropout 概率"),
                tlora_min_rank: Schema.number().min(1).default(1).description("T-LoRA 最小动态 rank"),
                tlora_rank_schedule: Schema.union(["cosine", "linear"]).default("cosine").description("T-LoRA 动态 rank 调度"),
                tlora_orthogonal_init: Schema.boolean().default(false).description("T-LoRA 对 lora_down 使用正交初始化（实验性）"),
                lycoris_algo: Schema.string().hidden(),
                lokr_factor: Schema.number().hidden(),
                dropout: Schema.number().hidden(),
            }),
            Schema.object({
                lora_type: Schema.const("lokr").required(),
                network_module: Schema.const("networks.lora_anima").default("networks.lora_anima").hidden(),
                lycoris_algo: Schema.const("lokr").default("lokr").hidden(),
                lokr_factor: Schema.number().min(-1).default(8).description("LoKr 分解因子。当前 Anima LoKr 会自动回落到可整除的线性注入 factor"),
                dropout: Schema.number().step(0.01).default(0).description("LoKr dropout 概率（当前为线性层注入实现）"),
                network_dropout: Schema.number().hidden(),
            }),
            Schema.object({}),
        ]),
        Schema.union([
            Schema.object({
                lora_type: Schema.const("lora").required(),
                pissa_init: Schema.const(true).required(),
                pissa_method: Schema.union(["rsvd", "svd"]).default("rsvd").description("PiSSA 分解方式。推荐保持 rSVD 默认值"),
                pissa_niter: Schema.number().min(0).step(1).default(2).description("PiSSA rSVD 幂迭代次数（高级参数，通常保持默认）"),
                pissa_oversample: Schema.number().min(0).step(1).default(8).description("PiSSA rSVD 过采样维度（高级参数，通常保持默认）"),
                pissa_apply_conv2d: Schema.boolean().default(false).description("PiSSA 额外作用于 1x1 Conv（实验性，默认只初始化 Linear）"),
                pissa_export_mode: Schema.union(["LoRA无损兼容导出", "LoRA快速近似导出"]).default("LoRA无损兼容导出").description("PiSSA 模型保存为标准 LoRA 时的导出方式"),
            }),
            Schema.object({}),
        ]),
        SHARED_SCHEMAS.NETWORK_OPTION_BASEWEIGHT,
    ]),

    SHARED_SCHEMAS.LULYNX_EXPERIMENTAL_CORE_ANIMA,
    Schema.intersect([
        Schema.object({
            enable_preview: Schema.boolean().default(false).description("启用训练预览图"),
        }).description("训练预览图设置"),
        Schema.union([
            Schema.object({
                enable_preview: Schema.const(true).required(),
                sample_prompts: Schema.string().role('textarea').description("多提示词轮换，一行一个 prompt；也可以直接填写 `.txt / .json / .toml` 路径。填写后会优先于下方单提示词"),
                prompt_file: Schema.string().role('textarea').description("兼容字段：预览图 Prompt 文件路径。填写后将优先使用文件内容"),
                randomly_choice_prompt: Schema.boolean().default(false).description("随机选择预览图 Prompt"),
                positive_prompts: Schema.string().role('textarea').default("newest, safe, 1girl, masterpiece, best quality").description("单提示词模式（sample_prompt）。当上方多提示词不为空时，这里会被忽略"),
                negative_prompts: Schema.string().role('textarea').default("").description("Negative Prompt / 负面提示词"),
                sample_width: Schema.number().default(1024).description("预览图宽。填写 0 时按训练分辨率推断"),
                sample_height: Schema.number().default(1024).description("预览图高。填写 0 时按训练分辨率推断"),
                sample_cfg: Schema.number().min(1).max(30).default(4).description("CFG Scale"),
                sample_seed: Schema.number().default(0).description("预览图种子。0 表示每次随机"),
                sample_steps: Schema.number().min(1).max(300).default(25).description("推理步数"),
                sample_sampler: Schema.union(["euler", "k_euler"]).default("euler").description("预览采样器。当前 Anima 训练预览只支持 euler / k_euler；导入旧配置时会自动把不兼容值规范化"),
                sample_scheduler: Schema.union(["simple"]).default("simple").description("Anima 预览调度器。当前训练预览支持 simple"),
                sample_every_n_steps: Schema.number().min(1).description("每 N 步生成一次预览图"),
                sample_every_n_epochs: Schema.number().default(2).description("每 N 个 epoch 生成一次预览图"),
                sample_at_first: Schema.boolean().default(false).description("训练开始前先生成一次预览图"),
            }),
            Schema.object({
                enable_preview: Schema.const(true).required(),
                randomly_choice_prompt: Schema.const(true).required(),
                random_prompt_include_subdirs: Schema.boolean().default(false).description("从 train_data_dir 下所有子目录随机选择 Prompt（用于多子目录数据集）"),
            }),
            Schema.object({}),
        ]),
    ]),
    SHARED_SCHEMAS.LOG_SETTINGS,
    SHARED_SCHEMAS.VALIDATION_SETTINGS,
    Schema.intersect([
        Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS, {
            caption_extension: Schema.string().default(".txt").description("回退读取的 Tag 文件扩展名；当启用 JSON 优先且同名 JSON 不存在时，会继续查找这个扩展名"),
            shuffle_caption: Schema.boolean().default(false).description("训练时随机打乱 tokens；JSON 模式下会对 appearance / tags / environment 三组分别打乱"),
            keep_tokens: Schema.number().min(0).max(255).step(1).default(0).description("在随机打乱 tokens 时，保留前 N 个不变；仅 TXT / .caption 模式生效"),
            caption_tag_dropout_rate: Schema.number().min(0).step(0.01).description("按标签随机丢弃 tag 的概率；JSON 模式下会分别作用于 appearance / tags / environment"),
            prefer_json_caption: Schema.boolean().default(true).description("优先读取同名 JSON 标签文件；若不存在则回退到 TXT / .caption。适合 Anima 的结构化标签流程"),
        }, ["max_token_length"])).description("caption（Tag）选项"),
        Schema.union([
            Schema.object({
                prefer_json_caption: Schema.const(true).required(),
                json_caption_hint: Schema.string().role('textarea').default("推荐 JSON 结构顺序：quality / count / character / series / artist / appearance[] / tags[] / environment[] / nl。\n当启用 shuffle_caption 时，只会打乱 appearance / tags / environment 三组内部顺序，前面的固定字段顺序会保留。").disabled().description("Anima JSON 标签说明"),
            }),
            Schema.object({}),
        ]),
    ]),
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

    SHARED_SCHEMAS.THERMAL_MANAGEMENT,

    Schema.intersect([
        Schema.object({
            enable_debug_options: Schema.boolean().default(false).description("显示 Anima 调试选项。普通训练通常不需要开启"),
        }).description("调试选项"),
        Schema.union([
            Schema.object({
                enable_debug_options: Schema.const(true).required(),
                anima_profile_window: Schema.number().min(0).default(0).description("每 N 个优化 step 输出一次 Anima 训练耗时聚合日志。0 表示关闭 profiler"),
                anima_nan_check_interval: Schema.number().min(0).default(0).description("每 N 个训练 step 检查一次 Anima NaN。0 表示自动按运行环境决定"),
            }),
            Schema.object({}),
        ]),
    ]),

    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
