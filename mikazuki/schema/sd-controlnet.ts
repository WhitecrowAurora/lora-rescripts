Schema.intersect([
    Schema.intersect([
        Schema.object({
            model_train_type: Schema.string().default("sd-controlnet").disabled().description("训练种类"),
            pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("底模文件路径"),
            controlnet_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).description("已有 ControlNet 模型路径（留空则从头训练）"),
            resume: Schema.string().role('filepicker', { type: "folder" }).description("从某个 `save_state` 保存的中断状态继续训练，填写文件路径"),
            vae: Schema.string().role('filepicker', { type: "model-file" }).description("(可选) VAE 模型文件路径"),
        }).description("训练用模型"),

        Schema.object({
            v2: Schema.boolean().default(false).description("底模为 SD2.x 时启用"),
        }),

        Schema.union([
            Schema.object({
                v2: Schema.const(true).required(),
                v_parameterization: Schema.boolean().default(false).description("v-parameterization 学习"),
            }),
            Schema.object({}),
        ]),
    ]),

    Schema.object(
        UpdateSchema(SHARED_SCHEMAS.RAW.DATASET_SETTINGS, {
            conditioning_data_dir: Schema.string().role('filepicker', { type: "folder" }).description("条件图数据集路径"),
        }, ["reg_data_dir", "prior_loss_weight"])
    ).description("数据集设置"),

    SHARED_SCHEMAS.SAVE_SETTINGS,

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
    Schema.object(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS).description("caption（Tag）选项"),
    SHARED_SCHEMAS.NOISE_SETTINGS,
    SHARED_SCHEMAS.DATA_ENCHANCEMENT,
    SHARED_SCHEMAS.OTHER,
    Schema.object(SHARED_SCHEMAS.RAW.PRECISION_CACHE_BATCH).description("速度优化选项"),
    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
