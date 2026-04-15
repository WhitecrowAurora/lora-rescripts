Schema.intersect([
    Schema.intersect([
        Schema.object({
            model_train_type: Schema.string().default("sdxl-lora").disabled().description("训练种类"),
            pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("SDXL 底模文件路径"),
            resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
            vae: Schema.string().role('filepicker', { type: "model-file" }).description("(可选) VAE 模型文件路径，使用外置 VAE 文件覆盖模型内本身的"),
            v_parameterization: Schema.boolean().default(false).description("v-parameterization 学习（训练 Illustrious 等 v-pred 模型时需要开启）"),
        }).description("训练用模型"),

        Schema.union([
            Schema.object({
                v_parameterization: Schema.const(true).required(),
                zero_terminal_snr: Schema.boolean().default(true).description("Zero Terminal SNR（v-pred 模型训练推荐开启）"),
            }),
            Schema.object({}),
        ]),

        Schema.union([
            Schema.object({
                v_parameterization: Schema.const(true).required(),
                scale_v_pred_loss_like_noise_pred: Schema.boolean().default(true).description("缩放 v-prediction 损失（v-pred 模型训练推荐开启）"),
            }),
            Schema.object({}),
        ]),
    ]),

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.DATASET_SETTINGS, {
            resolution: Schema.string().default("1024,1024").description("训练图片分辨率，宽x高。支持非正方形，但必须是 64 倍数。"),
            max_bucket_reso: Schema.number().default(2048).description("arb 桶最大分辨率"),
            bucket_reso_steps: Schema.number().default(32).description("arb 桶分辨率划分单位，SDXL 推荐 32"),
        })
    ).description("数据集设置"),

    SHARED_SCHEMAS.SAVE_SETTINGS,

    Schema.object({
        max_train_epochs: Schema.number().min(1).default(10).description("最大训练 epoch（轮数）"),
        train_batch_size: Schema.number().min(1).default(1).description("批量大小。单卡/单进程时就是实际 batch；多卡/分布式时按全局 batch 解释，启动时会自动换算成每卡。数值越高显存占用越高。"),
        gradient_checkpointing: Schema.boolean().default(true).description("梯度检查点"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累加步数"),
        network_train_unet_only: Schema.boolean().default(true).description("仅训练 U-Net，基础 SDXL LoRA 推荐开启"),
        network_train_text_encoder_only: Schema.boolean().default(false).description("仅训练文本编码器"),
    }).description("训练相关参数"),

    Schema.intersect([
        Schema.object({
            sdxl_low_vram_optimization: Schema.boolean().default(false).description("低显存优化（≤6GB）。开启后会按低显存预设自动调整缓存、预览和训练目标"),
        }).description("低显存优化（≤6GB）"),
        Schema.union([
            Schema.object({
                sdxl_low_vram_optimization: Schema.const(true).required(),
                sdxl_low_vram_resolution_mode: Schema.union(["long_edge", "short_edge"]).default("long_edge").description("分辨率规划模式。推荐 `long_edge`；`short_edge` 细节更强但更吃显存"),
                sdxl_low_vram_bucket_reso_steps: Schema.number().default(32).description("低显存模式 bucket 步长。推荐 32，可改为 64"),
                sdxl_low_vram_two_phase_cache: Schema.boolean().default(true).description("启用两阶段缓存流程。会优先把缓存阶段与正式训练阶段解耦"),
                sdxl_low_vram_component_cpu_residency: Schema.boolean().default(true).description("启用非训练组件 CPU 驻留。VAE / 文本编码器会尽量只在需要时临时上 GPU"),
                sdxl_low_vram_fixed_block_swap: Schema.boolean().default(true).description("启用 SDXL U-Net block swap。下面的子项可决定具体交换哪些区域、是否在反向后卸载，以及显存水线目标"),
                sdxl_low_vram_swap_input_blocks: Schema.boolean().default(false).description("交换 U-Net input blocks。显存收益较大，但通常会更慢"),
                sdxl_low_vram_swap_middle_block: Schema.boolean().default(true).description("交换 U-Net middle block。通常是比较划算的一档"),
                sdxl_low_vram_swap_output_blocks: Schema.boolean().default(true).description("交换 U-Net output blocks。通常建议优先尝试"),
                sdxl_low_vram_swap_offload_after_backward: Schema.boolean().default(true).description("反向传播结束后把已交换 block 立即移回 CPU。更省显存，但通常更慢"),
                sdxl_low_vram_swap_vram_threshold: Schema.number().min(0).max(99).step(1).default(0).description("block swap 的软显存水线（百分比）。`0` 表示始终尽快卸载；高于 0 时，低于该值会尽量少卸载，超过后会更积极地把已交换 block 移回 CPU"),
                sdxl_low_vram_preview_policy: Schema.union(["every_2_epochs", "every_4_epochs", "disable"]).default("every_4_epochs").description("低显存模式预览策略。默认每 4 个 epoch 生成一次，也可改成每 2 个 epoch 或完全关闭"),
                sdxl_low_vram_auto_protection: Schema.boolean().default(true).description("启用 OOM 自动保护。预览 OOM 时会先降频，再自动关闭预览；训练阶段会给出更明确的低显存建议"),
                sdxl_low_vram_auto_resolution_probe: Schema.boolean().default(true).description("启动前自动分辨率探测。会先用 3 步预跑检查专用显存与共享显存占用，必要时按 64 为单位自动下调目标边长"),
            }),
            Schema.object({}),
        ]),
    ]),

    Schema.intersect([
        Schema.object({
            enable_mixed_resolution_training: Schema.boolean().default(false).description("启用阶段分辨率训练（实验性，仅支持 SDXL）。1024 基准使用 512/768/1024；2048 基准使用 1024/1536/2048"),
        }).description("阶段分辨率训练"),
        Schema.union([
            Schema.object({
                enable_mixed_resolution_training: Schema.const(true).required(),
                staged_resolution_ratio_512: Schema.number().min(0).max(100).step(1).default(20).description("512 阶段占比（百分比）。当最终分辨率最大边小于 512 时会忽略"),
                staged_resolution_ratio_768: Schema.number().min(0).max(100).step(1).default(30).description("768 阶段占比（百分比）。当最终分辨率最大边小于 768 时会忽略"),
                staged_resolution_ratio_1024: Schema.number().min(0).max(100).step(1).default(50).description("1024 阶段占比（百分比）。1024 基准和 2048 基准都会用到"),
                staged_resolution_ratio_1536: Schema.number().min(0).max(100).step(1).default(30).description("1536 阶段占比（百分比）。仅 2048 基准会用到"),
                staged_resolution_ratio_2048: Schema.number().min(0).max(100).step(1).default(50).description("2048 阶段占比（百分比）。仅 2048 基准会用到"),
            }),
            Schema.object({}),
        ]),
    ]),

    SHARED_SCHEMAS.LR_OPTIMIZER,

    Schema.intersect([
        Schema.object({
            network_module: Schema.union(["networks.lora", "networks.tlora", "networks.dylora", "networks.oft", "lycoris.kohya"]).default("networks.lora").description("训练网络模块"),
            network_weights: Schema.string().role('filepicker').description("从已有的 LoRA 模型上继续训练，填写路径"),
            network_dim: Schema.number().min(1).default(32).description("网络维度，常用 4~128，不是越大越好, 低 dim 可以降低显存占用"),
            network_alpha: Schema.number().min(1).default(32).description("常用值：等于 network_dim 或 network_dim*1/2 或 1。使用较小的 alpha 需要提升学习率"),
            network_dropout: Schema.number().step(0.01).default(0).description("dropout 概率（与 lycoris 不兼容，需要用 lycoris 自带的）"),
            tlora_min_rank: Schema.number().min(1).default(1).description("T-LoRA 最小动态 rank。仅在 network_module=networks.tlora 时生效"),
            tlora_rank_schedule: Schema.union(["cosine", "linear"]).default("cosine").description("T-LoRA 动态 rank 调度。仅在 network_module=networks.tlora 时生效"),
            tlora_orthogonal_init: Schema.boolean().default(false).description("T-LoRA 对 lora_down 使用正交初始化（实验性，仅在 network_module=networks.tlora 时生效）"),
            pissa_init: Schema.boolean().default(false).description("启用 PiSSA 初始化（实验性，仅在 network_module=networks.lora 时生效）"),
            dim_from_weights: Schema.boolean().default(false).description("从已有 network_weights 自动推断 rank / dim"),
            scale_weight_norms: Schema.number().step(0.01).min(0).description("最大范数正则化。如果使用，推荐为 1"),
            dora_wd: Schema.boolean().default(false).description("启用 DoRA 训练"),
            network_args_custom: Schema.array(String).role('table').description("自定义 network_args，一行一个"),
            enable_block_weights: Schema.boolean().default(false).description("启用分层学习率训练（只支持网络模块 networks.lora）"),
            enable_base_weight: Schema.boolean().default(false).description("启用基础权重（差异炼丹）"),
        }).description("网络设置"),

        Schema.union([
            Schema.object({
                network_module: Schema.const("networks.lora").required(),
                pissa_init: Schema.const(true).required(),
                pissa_method: Schema.union(["rsvd", "svd"]).default("rsvd").description("PiSSA 分解方式。推荐保持 rSVD 默认值"),
                pissa_niter: Schema.number().min(0).step(1).default(2).description("PiSSA rSVD 幂迭代次数（高级参数，通常保持默认）"),
                pissa_oversample: Schema.number().min(0).step(1).default(8).description("PiSSA rSVD 过采样维度（高级参数，通常保持默认）"),
                pissa_apply_conv2d: Schema.boolean().default(false).description("PiSSA 额外作用于 1x1 Conv（实验性，默认只初始化 Linear）"),
                pissa_export_mode: Schema.union(["LoRA无损兼容导出", "LoRA快速近似导出"]).default("LoRA无损兼容导出").description("PiSSA 模型保存为标准 LoRA 时的导出方式"),
            }),
            Schema.object({}),
        ]),

        SHARED_SCHEMAS.LYCORIS_MAIN,
        SHARED_SCHEMAS.LYCORIS_LOKR,
        SHARED_SCHEMAS.NETWORK_OPTION_DYLORA,
        SHARED_SCHEMAS.NETWORK_OPTION_BLOCK_WEIGHTS,
        SHARED_SCHEMAS.NETWORK_OPTION_BASEWEIGHT,
    ]),

    Schema.intersect([
        SHARED_SCHEMAS.LULYNX_EXPERIMENTAL_CORE_SDXL,
    ]).description("Lulynx 实验核心"),
    SHARED_SCHEMAS.PREVIEW_IMAGE,
    SHARED_SCHEMAS.LOG_SETTINGS,
    SHARED_SCHEMAS.VALIDATION_SETTINGS,
    Schema.object(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS).description("caption（Tag）选项"),
    SHARED_SCHEMAS.NOISE_SETTINGS,
    SHARED_SCHEMAS.DATA_ENCHANCEMENT,
    SHARED_SCHEMAS.OTHER,

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.PRECISION_CACHE_BATCH, {
            sageattn: Schema.boolean().default(false).description("启用 SageAttention（实验性，需要 SageAttention 专用环境）"),
            flashattn: Schema.boolean().default(false).description("启用 FlashAttention 2（实验性，需要 FlashAttention 运行时）"),
            cross_attn_fused_kv: Schema.boolean().default(false).description("启用 SDXL cross-attn 的 fused K/V projection 实验开关"),
            sdpa: Schema.boolean().default(true).description("启用 sdpa"),
            cache_text_encoder_outputs: Schema.boolean().default(true).description("缓存文本编码器的输出，减少显存使用。使用时需要关闭 shuffle_caption"),
            cache_text_encoder_outputs_to_disk: Schema.boolean().default(false).description("缓存文本编码器的输出到磁盘"),
        })
    ).description("速度优化选项"),

    SHARED_SCHEMAS.THERMAL_MANAGEMENT,

    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);

