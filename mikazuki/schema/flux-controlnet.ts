Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("flux-controlnet").disabled().description("训练种类"),
        model_type: Schema.union(["flux", "chroma"]).default("flux").description("FLUX 模型类型"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("Flux 模型路径"),
        controlnet_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).description("已有 ControlNet 模型路径（留空则从头训练）"),
        ae: Schema.string().role('filepicker', { type: "model-file" }).description("AE 模型文件路径"),
        clip_l: Schema.string().role('filepicker', { type: "model-file" }).description("clip_l 模型文件路径"),
        t5xxl: Schema.string().role('filepicker', { type: "model-file" }).description("t5xxl 模型文件路径"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
    }).description("训练用模型"),

    Schema.object({
        t5xxl_max_token_length: Schema.number().step(1).description("T5XXL 最大 token 长度（不填写使用脚本默认值）"),
        apply_t5_attn_mask: Schema.boolean().default(false).description("对 T5-XXL 编码和 FLUX 双流块应用注意力掩码"),
        guidance_scale: Schema.number().step(0.01).default(3.5).description("CFG 引导缩放"),
        timestep_sampling: Schema.union(["sigma", "uniform", "sigmoid", "shift", "flux_shift"]).default("sigma").description("时间步采样"),
        sigmoid_scale: Schema.number().step(0.001).default(1.0).description("sigmoid 缩放"),
        model_prediction_type: Schema.union(["raw", "additive", "sigma_scaled"]).default("sigma_scaled").description("模型预测类型"),
        discrete_flow_shift: Schema.number().step(0.001).default(3.0).description("Euler 调度器离散流位移"),
        weighting_scheme: Schema.union(["sigma_sqrt", "logit_normal", "mode", "cosmap", "none", "uniform"]).default("uniform").description("时间步分布权重策略"),
        logit_mean: Schema.number().step(0.01).description("logit_normal 权重策略的均值"),
        logit_std: Schema.number().step(0.01).description("logit_normal 权重策略的标准差"),
        mode_scale: Schema.number().step(0.01).description("mode 权重策略的缩放系数"),
        mem_eff_save: Schema.boolean().default(false).description("实验性：使用更省内存的保存方式"),
        blockwise_fused_optimizers: Schema.boolean().default(false).description("启用 blockwise fused optimizer"),
    }).description("Flux ControlNet 专用参数"),

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.DATASET_SETTINGS, {
            conditioning_data_dir: Schema.string().role('filepicker', { type: "folder" }).description("条件图数据集路径"),
            resolution: Schema.string().default("768,768").description("训练图片分辨率，宽x高。支持非正方形，但必须是 64 倍数。"),
            min_bucket_reso: Schema.number().default(256).description("arb 桶最小分辨率"),
            max_bucket_reso: Schema.number().default(2048).description("arb 桶最大分辨率"),
            bucket_reso_steps: Schema.number().default(64).description("arb 桶分辨率划分单位"),
        }, ["reg_data_dir", "prior_loss_weight"])
    ).description("数据集设置"),

    Schema.intersect([
        Schema.object({
            output_name: Schema.string().default("controlnet").description("模型保存名称"),
            output_dir: Schema.string().role('filepicker', { type: "folder" }).default("./output").description("模型保存文件夹"),
            save_model_as: Schema.union(["ckpt", "safetensors", "diffusers", "diffusers_safetensors"]).default("safetensors").description("模型保存格式"),
            save_precision: Schema.union(["fp16", "float", "bf16"]).default("fp16").description("模型保存精度"),
            save_every_n_epochs: Schema.number().default(2).description("每 N epoch（轮）自动保存一次模型"),
            save_every_n_steps: Schema.number().min(1).description("每 N 步自动保存一次模型"),
            save_n_epoch_ratio: Schema.number().min(1).description("按 epoch 比例保存，保证整个训练阶段至少保存 N 份模型"),
            save_last_n_epochs: Schema.number().min(1).description("仅保留最近 N 个按 epoch 保存的模型"),
            save_last_n_steps: Schema.number().min(1).description("仅保留最近 N 步范围内的按 step 保存模型"),
            save_state: Schema.boolean().default(false).description("保存训练状态"),
            save_state_on_train_end: Schema.boolean().default(false).description("训练结束时额外保存一次训练状态"),
        }).description("保存设置"),
        Schema.union([
            Schema.object({
                save_state: Schema.const(true).required(),
                save_last_n_epochs_state: Schema.number().min(1).description("仅保存最后 N 个 epoch 的训练状态"),
                save_last_n_steps_state: Schema.number().min(1).description("仅保留最近 N 步范围内的训练状态"),
            }),
            Schema.object({}),
        ]),
    ]),

    Schema.object({
        max_train_epochs: Schema.number().min(1).default(10).description("最大训练 epoch（轮数）"),
        train_batch_size: Schema.number().min(1).default(1).description("批量大小"),
        gradient_checkpointing: Schema.boolean().default(true).description("梯度检查点"),
        gradient_accumulation_steps: Schema.number().min(1).default(1).description("梯度累加步数"),
        max_grad_norm: Schema.number().min(0).step(0.1).default(1.0).description("梯度裁剪上限，0 表示不裁剪"),
    }).description("训练相关参数"),

    Schema.intersect([
        Schema.object({
            learning_rate: Schema.string().default("1e-4").description("学习率"),
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
    Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS, {}, ["max_token_length"])).description("caption（Tag）选项"),
    SHARED_SCHEMAS.NOISE_SETTINGS,
    SHARED_SCHEMAS.DATA_ENCHANCEMENT,
    Schema.object({
        seed: Schema.number().default(1337).description("随机种子"),
        masked_loss: Schema.boolean().default(false).description("启用 Masked Loss。训练带透明蒙版 / alpha 的图像时可用"),
        no_metadata: Schema.boolean().default(false).description("不向输出模型写入完整训练元数据"),
        training_comment: Schema.string().role('textarea').description("写入模型元数据的训练备注"),
        initial_epoch: Schema.number().min(1).description("从指定 epoch 编号开始计数"),
        initial_step: Schema.number().min(0).description("从指定 step 编号开始计数，会覆盖 initial_epoch"),
        skip_until_initial_step: Schema.boolean().default(false).description("配合 initial_step 使用，真正跳过前面的训练步数"),
        ui_custom_params: Schema.string().role('textarea').description("**危险** 自定义参数，请输入 TOML 格式，将会直接覆盖当前界面内任何参数。实时更新，推荐写完后再粘贴过来"),
    }).description("其他设置"),
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
