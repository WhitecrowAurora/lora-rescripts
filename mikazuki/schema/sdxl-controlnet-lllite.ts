Schema.intersect([
    Schema.object({
        model_train_type: Schema.string().default("sdxl-controlnet-lllite").disabled().description("训练种类"),
        pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("底模文件路径"),
        network_weights: Schema.string().role('filepicker', { type: "model-file" }).description("已有 LLLite 权重路径（留空则从头初始化）"),
        resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
        vae: Schema.string().role('filepicker', { type: "model-file" }).description("(可选) VAE 模型文件路径"),
    }).description("训练用模型"),

    Schema.object({
        conditioning_data_dir: Schema.string().role('filepicker', { type: "folder" }).description("条件图数据集路径"),
        cond_emb_dim: Schema.number().min(1).default(32).description("条件嵌入维度"),
        network_dim: Schema.number().min(1).default(64).description("LLLite 网络维度"),
        network_dropout: Schema.number().step(0.01).default(0).description("网络 dropout 概率"),
        no_half_vae: Schema.boolean().default(false).description("混合精度下也不使用半精度 VAE"),
    }).description("LLLite 专用参数"),

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.DATASET_SETTINGS, {
            conditioning_data_dir: Schema.string().role('filepicker', { type: "folder" }).description("条件图数据集路径"),
            resolution: Schema.string().default("1024,1024").description("训练图片分辨率，宽x高。支持非正方形，但必须是 64 倍数。"),
            bucket_reso_steps: Schema.number().default(32).description("arb 桶分辨率划分单位，SDXL LLLite 建议 32"),
        }, ["reg_data_dir", "prior_loss_weight"])
    ).description("数据集设置"),

    Schema.intersect([
        Schema.object({
            output_name: Schema.string().default("lllite").description("模型保存名称"),
            output_dir: Schema.string().role('filepicker', { type: "folder" }).default("./output").description("模型保存文件夹"),
            save_model_as: Schema.union(["ckpt", "pt", "safetensors"]).default("safetensors").description("模型保存格式"),
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
        gradient_checkpointing: Schema.boolean().default(false).description("梯度检查点"),
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
            min_snr_gamma: Schema.number().step(0.1).description("最小信噪比伽马值, 如果启用推荐为 5"),
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
    Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS, {}, ["caption_dropout_rate", "caption_dropout_every_n_epochs", "caption_tag_dropout_rate"])).description("caption（Tag）选项"),
    SHARED_SCHEMAS.NOISE_SETTINGS,
    SHARED_SCHEMAS.DATA_ENCHANCEMENT,
    SHARED_SCHEMAS.OTHER,
    Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.PRECISION_CACHE_BATCH, {}, ["cpu_offload_checkpointing"])).description("速度优化选项"),
    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
