Schema.intersect([
    Schema.intersect([
        Schema.object({
            model_train_type: Schema.string().default("sd-textual-inversion").disabled().description("训练种类"),
            pretrained_model_name_or_path: Schema.string().role('filepicker', { type: "model-file" }).default("./sd-models/model.safetensors").description("底模文件路径"),
            weights: Schema.string().role('filepicker', { type: "model-file" }).description("初始化 embedding 的已有权重路径"),
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

    Schema.object({
        token_string: Schema.string().description("训练用 token 字符串，必须是 tokenizer 中不存在的新 token"),
        init_word: Schema.string().description("用于初始化向量的词"),
        num_vectors_per_token: Schema.number().min(1).default(1).description("每个 token 对应的向量数量"),
        use_object_template: Schema.boolean().default(false).description("忽略 caption，改用物体模板训练"),
        use_style_template: Schema.boolean().default(false).description("忽略 caption，改用风格模板训练"),
    }).description("Textual Inversion 专用参数"),

    Schema.object(SHARED_SCHEMAS.RAW.DATASET_SETTINGS).description("数据集设置"),

    Schema.intersect([
        Schema.object({
            output_name: Schema.string().default("embedding").description("模型保存名称"),
            output_dir: Schema.string().role('filepicker', { type: "folder" }).default("./output").description("模型保存文件夹"),
            save_model_as: Schema.union(["pt", "safetensors", "ckpt"]).default("pt").description("模型保存格式"),
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
            learning_rate: Schema.string().default("5e-4").description("学习率"),
            lr_scheduler: Schema.union([
                "linear",
                "cosine",
                "cosine_with_restarts",
                "polynomial",
                "constant",
                "constant_with_warmup",
            ]).default("constant").description("学习率调度器设置"),
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
    Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.CAPTION_SETTINGS, {}, [
        "caption_dropout_rate",
        "caption_dropout_every_n_epochs",
        "caption_tag_dropout_rate"
    ])).description("caption（Tag）选项"),
    SHARED_SCHEMAS.NOISE_SETTINGS,
    SHARED_SCHEMAS.DATA_ENCHANCEMENT,
    SHARED_SCHEMAS.OTHER,
    Schema.object(UpdateSchema(SHARED_SCHEMAS.RAW.PRECISION_CACHE_BATCH, {}, [
        "cache_text_encoder_outputs",
        "cache_text_encoder_outputs_to_disk",
        "text_encoder_batch_size",
        "cpu_offload_checkpointing",
    ])).description("速度优化选项"),
    SHARED_SCHEMAS.DISTRIBUTED_TRAINING
]);
