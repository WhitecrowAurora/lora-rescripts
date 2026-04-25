Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("newbie-lora").disabled().description("训练种类"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "folder" }).description("Newbie 基座模型目录（必填，要求完整本地目录）"),
        transformer_path: Schema.string().role('filepicker', { type: "folder" }).description("单独指定 transformer 目录（可选）"),
        gemma_model_path: Schema.string().role('filepicker', { type: "folder" }).description("单独指定 Gemma 文本编码器目录（可选）"),
        clip_model_path: Schema.string().role('filepicker', { type: "folder" }).description("单独指定 Jina CLIP 目录（可选）"),
        vae_path: Schema.string().role('filepicker', { type: "folder" }).description("单独指定 VAE 目录（可选）"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从已有 checkpoint / save_state 路径继续训练（可选）"),
    }).description("训练用模型"),

    Schema.object({
        train_data_dir: Schema.string().role('filepicker', { type: "folder" }).description("训练图片目录"),
        resolution: Schema.string().default("1024,1024").description("训练分辨率，宽x高。当前建议 1024 起步。"),
        dataloader_num_workers: Schema.number().min(0).default(4).description("DataLoader 工作线程数。更贴近官方默认值。"),
        enable_bucket: Schema.boolean().default(true).description("启用 bucket 以适配不同宽高比素材"),
        min_bucket_reso: Schema.number().default(256).description("bucket 最小分辨率"),
        max_bucket_reso: Schema.number().default(2048).description("bucket 最大分辨率"),
        bucket_reso_steps: Schema.number().default(64).description("bucket 分辨率步长"),
        caption_extension: Schema.string().default(".txt").description("回退读取的 caption 扩展名"),
    }).description("数据集设置"),

    Schema.object({
        output_dir: Schema.string().role('filepicker', { type: "folder" }).default("./output/newbie").description("输出目录"),
        output_name: Schema.string().default("newbie-lora").description("输出名称"),
        save_every_n_epochs: Schema.number().default(0).description("每 N epoch（轮）自动保存一次模型。0 表示每个 epoch 都保存（与官方默认更接近）"),
        save_every_n_steps: Schema.number().min(0).default(0).description("每 N 步保存一次。0 表示仅在训练结束时保存"),
        max_train_epochs: Schema.number().min(1).default(50).description("最大训练 epoch"),
        max_train_steps: Schema.number().min(0).default(0).description("最大训练步数。0 表示按 epoch 推导"),
        train_batch_size: Schema.number().min(1).default(1).description("单卡 batch size"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累积步数"),
        gradient_checkpointing: Schema.boolean().default(true).description("启用梯度检查点"),
        mixed_precision: Schema.union(["bf16", "fp16", "fp32"]).default("bf16").description("训练精度"),
        seed: Schema.number().min(0).default(42).description("随机种子"),
    }).description("训练相关参数"),

    Schema.object({
        optimizer_type: Schema.union(["AdamW8bit", "AdamW"]).default("AdamW8bit").description("优化器"),
        learning_rate: Schema.number().step(0.000001).default(0.0001).description("学习率"),
        weight_decay: Schema.number().step(0.0001).default(0.01).description("权重衰减"),
        lr_scheduler: Schema.union(["cosine", "cosine_with_restarts", "linear", "constant"]).default("cosine").description("学习率调度器"),
        lr_warmup_steps: Schema.number().min(0).default(100).description("warmup 步数"),
        max_grad_norm: Schema.number().min(0).step(0.01).default(1.0).description("梯度裁剪"),
    }).description("优化器与学习率"),

    SHARED_SCHEMAS.PEAK_VRAM_CONTROL,

    Schema.object({
        adapter_type: Schema.union(["lora", "lora_fa", "vera", "lokr"]).default("lora").description("适配器类型。LoRA-FA 会冻结 LoRA-A / lora_down，仅训练 LoRA-B / lora_up；VeRA 使用共享随机投影，只训练每层缩放向量"),
        network_dim: Schema.number().min(1).default(32).description("LoRA / LoKr rank。VeRA 下表示共享投影 rank"),
        network_alpha: Schema.number().min(1).default(32).description("LoRA / LoKr alpha。VeRA 当前不使用该项"),
        network_dropout: Schema.number().min(0).step(0.01).default(0.05).description("LoRA / VeRA dropout"),
        newbie_target_modules: Schema.string().role('textarea').default("attention.qkv\nattention.out\nfeed_forward.w2\ntime_text_embed.1\nclip_text_pooled_proj.1").description("目标模块列表，一行一个"),
        lokr_rank: Schema.number().min(1).default(32).description("LoKr rank"),
        lokr_alpha: Schema.number().min(1).default(32).description("LoKr alpha"),
        lokr_factor: Schema.number().default(-1).description("LoKr factor。-1 表示自动"),
        lokr_dropout: Schema.number().min(0).step(0.01).default(0.05).description("LoKr dropout"),
        lokr_rank_dropout: Schema.number().min(0).step(0.01).default(0).description("LoKr rank dropout"),
        lokr_module_dropout: Schema.number().min(0).step(0.01).default(0).description("LoKr module dropout"),
        lokr_train_norm: Schema.boolean().default(false).description("LoKr 额外训练 Norm 参数"),
    }).description("适配器设置"),

    Schema.object({
        lulynx_lisa_enabled: Schema.boolean().default(false).description("启用实验性 LISA。周期性只激活一部分 Newbie 适配器模块参与下一阶段训练"),
        lulynx_lisa_active_ratio: Schema.number().min(0.05).max(1).step(0.01).default(0.2).description("每轮 LISA 激活的适配器模块比例"),
        lulynx_lisa_interval: Schema.number().min(1).default(1).description("每 N 个优化 step 重排一次 LISA 激活模块"),
    }).description("Lulynx LISA"),

    Schema.object({
        use_cache: Schema.boolean().default(true).description("启用缓存流程。当前强烈建议保持开启"),
        newbie_force_cache_only: Schema.boolean().default(true).description("只使用缓存完备样本进入正式训练"),
        newbie_rebuild_cache: Schema.boolean().default(false).description("强制重建已有缓存"),
        gemma3_prompt: Schema.string().role('textarea').default("You are an assistant designed to generate high-quality anime images with the highest degree of image-text alignment based on textual prompts. <Prompt Start>").description("Gemma3 系统提示词。默认与官方模板对齐。"),
        newbie_gemma_max_token_length: Schema.number().min(32).default(512).description("Gemma 最大 token 长度"),
        newbie_clip_max_token_length: Schema.number().min(32).default(2048).description("CLIP 最大 token 长度"),
        newbie_caption_length_bucket_size: Schema.number().min(0).default(0).description("caption 长度 bucket 大小。0 表示关闭，仅按分辨率 bucket，更贴近官方。"),
        blocks_to_swap: Schema.number().min(0).default(0).description("交换到 CPU 的 block 数量。0 表示关闭。属于显存兜底项，数值越大通常越慢；能正常跑就不要开"),
        newbie_auto_swap_release: Schema.boolean().default(false).description("自动 swap 释放。仅在已经启用 blocks_to_swap 时才有意义；开启后会在显存占用持续偏低时逐步减少 blocks_to_swap，以回收一部分训练速度"),
        cpu_offload_checkpointing: Schema.boolean().default(false).description("实验性显存兜底项：checkpointing 时把部分张量卸载到 CPU。通常会更慢，只在确实需要省显存时再开"),
        experimental_attention_profile_enabled: Schema.boolean().default(false).description("步骤耗时窗口统计开关。默认关闭，仅在诊断训练速度/瓶颈时建议开启"),
        experimental_attention_profile_window: Schema.number().min(1).default(50).description("步骤耗时窗口统计间隔（每 N 个优化步输出一次聚合耗时摘要）"),
        pytorch_cuda_expandable_segments: Schema.boolean().default(true).description("启用 PyTorch CUDA expandable_segments 以降低碎片化 OOM"),
        newbie_safe_fallback: Schema.boolean().default(true).description("OOM 时自动尝试更保守的 Newbie 安全回退。它是保底机制，不是性能开关；主要用于显存波动或临界显存环境"),
        trust_remote_code: Schema.boolean().default(true).description("允许 transformers / diffusers 加载远程自定义代码"),
        lulynx_experimental_core_enabled: Schema.boolean().default(true).hidden(),
    }).description("缓存与运行时"),

    SHARED_SCHEMAS.LOG_SETTINGS,
    SHARED_SCHEMAS.THERMAL_MANAGEMENT
]);

