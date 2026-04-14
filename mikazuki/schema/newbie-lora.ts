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
        enable_bucket: Schema.boolean().default(true).description("启用 bucket 以适配不同宽高比素材"),
        min_bucket_reso: Schema.number().default(256).description("bucket 最小分辨率"),
        max_bucket_reso: Schema.number().default(2048).description("bucket 最大分辨率"),
        bucket_reso_steps: Schema.number().default(64).description("bucket 分辨率步长"),
        caption_extension: Schema.string().default(".txt").description("回退读取的 caption 扩展名"),
    }).description("数据集设置"),

    Schema.object({
        output_dir: Schema.string().role('filepicker', { type: "folder" }).default("./output/newbie").description("输出目录"),
        output_name: Schema.string().default("newbie-lora").description("输出名称"),
        save_every_n_steps: Schema.number().min(0).default(0).description("每 N 步保存一次。0 表示仅在训练结束时保存"),
        max_train_epochs: Schema.number().min(1).default(10).description("最大训练 epoch"),
        max_train_steps: Schema.number().min(0).default(0).description("最大训练步数。0 表示按 epoch 推导"),
        train_batch_size: Schema.number().min(1).default(1).description("单卡 batch size"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累积步数"),
        gradient_checkpointing: Schema.boolean().default(true).description("启用梯度检查点"),
        mixed_precision: Schema.union(["bf16", "fp16", "fp32"]).default("bf16").description("训练精度"),
        seed: Schema.number().min(0).default(1337).description("随机种子"),
    }).description("训练相关参数"),

    Schema.object({
        optimizer_type: Schema.union(["AdamW8bit", "AdamW"]).default("AdamW8bit").description("优化器"),
        learning_rate: Schema.number().step(0.000001).default(0.0001).description("学习率"),
        weight_decay: Schema.number().step(0.0001).default(0.0).description("权重衰减"),
        lr_scheduler: Schema.union(["cosine", "cosine_with_restarts", "linear", "constant"]).default("cosine").description("学习率调度器"),
        lr_warmup_steps: Schema.number().min(0).default(0).description("warmup 步数"),
        max_grad_norm: Schema.number().min(0).step(0.01).default(1.0).description("梯度裁剪"),
    }).description("优化器与学习率"),

    Schema.object({
        adapter_type: Schema.union(["lora", "lokr"]).default("lora").description("适配器类型"),
        network_dim: Schema.number().min(1).default(16).description("LoRA / LoKr rank"),
        network_alpha: Schema.number().min(1).default(16).description("LoRA / LoKr alpha"),
        network_dropout: Schema.number().min(0).step(0.01).default(0).description("LoRA dropout"),
        newbie_target_modules: Schema.string().role('textarea').default("attention.qkv\nattention.out\nfeed_forward.w2\ntime_text_embed.1\nclip_text_pooled_proj.1").description("目标模块列表，一行一个"),
        lokr_rank: Schema.number().min(1).default(16).description("LoKr rank"),
        lokr_alpha: Schema.number().min(1).default(16).description("LoKr alpha"),
        lokr_factor: Schema.number().default(-1).description("LoKr factor。-1 表示自动"),
        lokr_dropout: Schema.number().min(0).step(0.01).default(0).description("LoKr dropout"),
        lokr_rank_dropout: Schema.number().min(0).step(0.01).default(0).description("LoKr rank dropout"),
        lokr_module_dropout: Schema.number().min(0).step(0.01).default(0).description("LoKr module dropout"),
        lokr_train_norm: Schema.boolean().default(false).description("LoKr 额外训练 Norm 参数"),
    }).description("适配器设置"),

    Schema.object({
        use_cache: Schema.boolean().default(true).description("启用缓存流程。当前强烈建议保持开启"),
        newbie_force_cache_only: Schema.boolean().default(true).description("只使用缓存完备样本进入正式训练"),
        newbie_rebuild_cache: Schema.boolean().default(false).description("强制重建已有缓存"),
        newbie_gemma_max_token_length: Schema.number().min(32).default(256).description("Gemma 最大 token 长度"),
        newbie_clip_max_token_length: Schema.number().min(32).default(256).description("CLIP 最大 token 长度"),
        newbie_caption_length_bucket_size: Schema.number().min(1).default(32).description("caption 长度 bucket 大小"),
        blocks_to_swap: Schema.number().min(0).default(0).description("交换到 CPU 的 block 数量。0 表示关闭"),
        cpu_offload_checkpointing: Schema.boolean().default(false).description("实验性：checkpointing 时把部分张量卸载到 CPU"),
        pytorch_cuda_expandable_segments: Schema.boolean().default(true).description("启用 PyTorch CUDA expandable_segments 以降低碎片化 OOM"),
        newbie_safe_fallback: Schema.boolean().default(true).description("OOM 时自动尝试更保守的 Newbie 安全回退"),
        trust_remote_code: Schema.boolean().default(true).description("允许 transformers / diffusers 加载远程自定义代码"),
        lulynx_experimental_core_enabled: Schema.boolean().default(true).hidden(),
    }).description("缓存与运行时"),

    SHARED_SCHEMAS.LOG_SETTINGS,
    SHARED_SCHEMAS.THERMAL_MANAGEMENT
]);
