const e = {
  key: "v-4441a302",
  path: "/lora/tools.html",
  title: "工具",
  lang: "en-US",
  frontmatter: {
    type: "tools",
    code: `Schema.intersect([
      Schema.object({
        script_name: Schema.union([
          "networks/extract_lora_from_models.py",
          "networks/extract_lora_from_dylora.py",
          "networks/flux_extract_lora.py",
          "networks/resize_lora.py",
          "networks/lora_interrogator.py",
          "networks/check_lora_weights.py",
          "networks/merge_lora.py",
          "networks/sdxl_merge_lora.py",
          "networks/svd_merge_lora.py",
          "networks/flux_merge_lora.py",
          "networks/convert_flux_lora.py",
          "networks/convert_hunyuan_image_lora_to_comfy.py",
          "networks/convert_anima_lora_to_comfy.py",
          "tools/merge_models.py",
          "tools/merge_sd3_safetensors.py",
          "tools/convert_diffusers_to_flux.py",
          "tools/convert_diffusers20_original_sd.py",
          "tools/show_metadata.py",
          "tools/resize_images_to_resolution.py",
          "tools/canny.py",
          "tools/detect_face_rotate.py",
          "tools/latent_upscaler.py"
        ]).description("脚本名称")
      }).description("参数设置"),

      Schema.union([
        Schema.object({
          script_name: Schema.const("networks/extract_lora_from_models.py").required(),
          v2: Schema.boolean().description("底模为 sd2.0 以后的版本需要启用"),
          model_org: Schema.string().role("textarea").description("底模路径"),
          model_tuned: Schema.string().role("textarea").description("微调后的模型路径"),
          save_to: Schema.string().description("保存名称"),
          dim: Schema.number().min(8).step(8).default(32).description("LoRA 网络维度"),
          conv_dim: Schema.number().min(1).step(1).description("LoRA Conv2d-3x3 网络维度，默认不使用"),
          save_precision: Schema.union(["fp16", "float", "bf16"]).default("fp16").description("模型保存精度"),
        }),

        Schema.object({
          script_name: Schema.const("networks/extract_lora_from_dylora.py").required(),
          model: Schema.string().role("textarea").description("DyLoRA 模型路径"),
          unit: Schema.number().description("rank 分割大小"),
          save_to: Schema.string().description("保存名称"),
        }),

        Schema.object({
          script_name: Schema.const("networks/flux_extract_lora.py").required(),
          save_precision: Schema.union(["float", "fp16", "bf16"]).description("保存精度，留空则按默认行为处理"),
          model_org: Schema.string().role("textarea").description("原始 Flux 模型路径"),
          model_tuned: Schema.string().role("textarea").description("微调后的 Flux 模型路径"),
          mem_eff_safe_open: Schema.boolean().default(false).description("使用更省内存的 safe_open"),
          save_to: Schema.string().role("textarea").description("输出 LoRA 路径"),
          dim: Schema.number().min(1).default(4).description("提取后的 LoRA rank"),
          device: Schema.string().description("计算设备，例如 cuda 或 cpu"),
          clamp_quantile: Schema.number().min(0).max(1).step(0.001).default(0.99).description("权重裁剪分位点"),
          no_metadata: Schema.boolean().default(false).description("不写入完整 metadata"),
        }),

        Schema.object({
          script_name: Schema.const("networks/resize_lora.py").required(),
          save_precision: Schema.union(["float", "fp16", "bf16"]).description("保存精度，留空则按默认行为处理"),
          new_rank: Schema.number().min(1).default(4).description("新的 LoRA rank"),
          new_conv_rank: Schema.number().min(1).description("新的 Conv2d 3x3 rank，留空则跟随 new_rank"),
          save_to: Schema.string().role("textarea").description("输出 LoRA 路径"),
          model: Schema.string().role("textarea").description("输入 LoRA 路径"),
          device: Schema.string().description("计算设备，例如 cuda 或 cpu"),
          verbose: Schema.boolean().default(false).description("输出详细缩放信息"),
          dynamic_method: Schema.union(["sv_ratio", "sv_fro", "sv_cumulative"]).description("动态缩放方法"),
          dynamic_param: Schema.number().step(0.001).description("动态缩放目标参数"),
        }),

        Schema.object({
          script_name: Schema.const("networks/lora_interrogator.py").required(),
          v2: Schema.boolean().default(false).description("按 SD2.x / 2.1 底模处理"),
          sd_model: Schema.string().role("filepicker", { type: "model-file" }).description("底模路径"),
          model: Schema.string().role("filepicker", { type: "model-file" }).description("要反推触发词的 LoRA 路径"),
          batch_size: Schema.number().min(1).default(64).description("Text Encoder 批处理大小"),
          clip_skip: Schema.number().min(1).default(1).description("使用倒数第 N 层文本编码器输出"),
        }),

        Schema.object({
          script_name: Schema.const("networks/check_lora_weights.py").required(),
          file: Schema.string().role("textarea").description("要检查的 LoRA 模型路径"),
          show_all_keys: Schema.boolean().default(false).description("显示全部权重键"),
        }),

        Schema.object({
          script_name: Schema.const("networks/merge_lora.py").required(),
          v2: Schema.boolean().default(false).description("加载 SD2.x 模型"),
          save_precision: Schema.union(["float", "fp16", "bf16"]).description("保存精度"),
          precision: Schema.union(["float", "fp16", "bf16"]).default("float").description("合并计算精度"),
          sd_model: Schema.string().role("textarea").description("底模路径，不填则只做 LoRA 之间的合并"),
          save_to: Schema.string().role("textarea").description("输出模型路径"),
          models: Schema.array(String).role("table").description("要合并的 LoRA 路径，一行一个"),
          ratios: Schema.array(String).role("table").description("每个 LoRA 的比例，一行一个"),
          no_metadata: Schema.boolean().default(false).description("不写入完整 metadata"),
          concat: Schema.boolean().default(false).description("拼接 LoRA 而不是直接 merge"),
          shuffle: Schema.boolean().default(false).description("对 LoRA 权重做 shuffle"),
        }),

        Schema.object({
          script_name: Schema.const("networks/sdxl_merge_lora.py").required(),
          save_precision: Schema.union(["float", "fp16", "bf16"]).description("保存精度"),
          precision: Schema.union(["float", "fp16", "bf16"]).default("float").description("合并计算精度"),
          sd_model: Schema.string().role("textarea").description("SDXL 底模路径，不填则只做 LoRA 之间的合并"),
          save_to: Schema.string().role("textarea").description("输出模型路径"),
          models: Schema.array(String).role("table").description("要合并的 LoRA 路径，一行一个"),
          ratios: Schema.array(String).role("table").description("每个 LoRA 的比例，一行一个"),
          lbws: Schema.array(String).role("table").description("每个 LoRA 的分层权重，一行一个"),
          no_metadata: Schema.boolean().default(false).description("不写入完整 metadata"),
          concat: Schema.boolean().default(false).description("拼接 LoRA 而不是直接 merge"),
          shuffle: Schema.boolean().default(false).description("对 LoRA 权重做 shuffle"),
        }),

        Schema.object({
          script_name: Schema.const("networks/svd_merge_lora.py").required(),
          save_precision: Schema.union(["float", "fp16", "bf16"]).description("保存精度"),
          precision: Schema.union(["float", "fp16", "bf16"]).default("float").description("合并计算精度"),
          save_to: Schema.string().role("textarea").description("输出 LoRA 路径"),
          models: Schema.array(String).role("table").description("要合并的 LoRA 路径，一行一个"),
          ratios: Schema.array(String).role("table").description("每个 LoRA 的比例，一行一个"),
          lbws: Schema.array(String).role("table").description("每个 LoRA 的分层权重，一行一个"),
          new_rank: Schema.number().min(1).default(4).description("输出 LoRA 的 rank"),
          new_conv_rank: Schema.number().min(1).description("输出 Conv2d 3x3 的 rank"),
          device: Schema.string().description("计算设备，例如 cuda 或 cpu"),
          no_metadata: Schema.boolean().default(false).description("不写入完整 metadata"),
        }),

        Schema.object({
          script_name: Schema.const("networks/flux_merge_lora.py").required(),
          save_precision: Schema.string().description("保存精度，例如 fp16 / bf16 / fp8"),
          precision: Schema.string().default("float").description("合并计算精度"),
          flux_model: Schema.string().role("textarea").description("Flux 底模路径，不填则只合并 LoRA"),
          clip_l: Schema.string().role("textarea").description("clip_l 路径"),
          t5xxl: Schema.string().role("textarea").description("t5xxl 路径"),
          mem_eff_load_save: Schema.boolean().default(false).description("使用更省内存的加载/保存方式"),
          loading_device: Schema.string().default("cpu").description("模型加载设备"),
          working_device: Schema.string().default("cpu").description("合并工作设备"),
          save_to: Schema.string().role("textarea").description("输出 Flux 模型路径"),
          clip_l_save_to: Schema.string().role("textarea").description("输出 clip_l 路径"),
          t5xxl_save_to: Schema.string().role("textarea").description("输出 t5xxl 路径"),
          models: Schema.array(String).role("table").description("要合并的 LoRA 路径，一行一个"),
          ratios: Schema.array(String).role("table").description("每个 LoRA 的比例，一行一个"),
          no_metadata: Schema.boolean().default(false).description("不写入完整 metadata"),
          concat: Schema.boolean().default(false).description("拼接 LoRA 而不是直接 merge"),
          shuffle: Schema.boolean().default(false).description("对 LoRA 权重做 shuffle"),
          diffusers: Schema.boolean().default(false).description("按 Diffusers LoRA 方式处理"),
        }),

        Schema.object({
          script_name: Schema.const("networks/convert_flux_lora.py").required(),
          src: Schema.union(["ai-toolkit", "sd-scripts"]).default("ai-toolkit").description("源格式"),
          dst: Schema.union(["ai-toolkit", "sd-scripts"]).default("sd-scripts").description("目标格式"),
          src_path: Schema.string().role("textarea").description("源模型路径"),
          dst_path: Schema.string().role("textarea").description("输出模型路径"),
        }),

        Schema.object({
          script_name: Schema.const("networks/convert_hunyuan_image_lora_to_comfy.py").required(),
          src_path: Schema.string().role("textarea").description("源 LoRA 路径"),
          dst_path: Schema.string().role("textarea").description("输出 LoRA 路径"),
          reverse: Schema.boolean().default(false).description("反向转换"),
        }),

        Schema.object({
          script_name: Schema.const("networks/convert_anima_lora_to_comfy.py").required(),
          src_path: Schema.string().role("textarea").description("源 LoRA 路径"),
          dst_path: Schema.string().role("textarea").description("输出 LoRA 路径"),
          reverse: Schema.boolean().default(false).description("反向转换"),
        }),

        Schema.object({
          script_name: Schema.const("tools/merge_models.py").required(),
          models: Schema.array(String).role("table").description("要合并的模型路径，一行一个"),
          output: Schema.string().role("textarea").description("输出模型路径"),
          ratios: Schema.array(String).role("table").description("每个模型的比例，一行一个"),
          unet_only: Schema.boolean().default(false).description("仅合并 U-Net"),
          device: Schema.string().default("cpu").description("运行设备"),
          precision: Schema.union(["float", "fp16", "bf16"]).default("float").description("合并计算精度"),
          saving_precision: Schema.union(["float", "fp16", "bf16"]).default("float").description("保存精度"),
          show_skipped: Schema.boolean().default(false).description("显示被跳过的权重键"),
        }),

        Schema.object({
          script_name: Schema.const("tools/merge_sd3_safetensors.py").required(),
          dit: Schema.string().role("textarea").description("DiT / MMDiT 模型路径"),
          vae: Schema.string().role("textarea").description("VAE 路径，可选"),
          clip_l: Schema.string().role("textarea").description("CLIP-L 路径，可选"),
          clip_g: Schema.string().role("textarea").description("CLIP-G 路径，可选"),
          t5xxl: Schema.string().role("textarea").description("T5-XXL 路径，可选"),
          output: Schema.string().default("merged_model.safetensors").description("输出模型路径"),
          device: Schema.string().default("cpu").description("加载设备"),
          save_precision: Schema.string().description("保存精度，例如 fp16 / bf16 / float16"),
        }),

        Schema.object({
          script_name: Schema.const("tools/convert_diffusers_to_flux.py").required(),
          diffusers_path: Schema.string().role("textarea").description("Flux diffusers 目录或分片 safetensors 路径"),
          save_to: Schema.string().role("textarea").description("输出 Flux safetensors 路径"),
          mem_eff_load_save: Schema.boolean().default(false).description("使用更省内存的加载/保存方式"),
          save_precision: Schema.string().description("保存精度，例如 fp16 / bf16 / fp8"),
        }),

        Schema.object({
          script_name: Schema.const("tools/convert_diffusers20_original_sd.py").required(),
          v1: Schema.boolean().default(false).description("按 SD1.x 模型处理"),
          v2: Schema.boolean().default(false).description("按 SD2.x 模型处理"),
          unet_use_linear_projection: Schema.boolean().default(false).description("保存为 Diffusers 时启用线性投影配置"),
          fp16: Schema.boolean().default(false).description("按 fp16 读取/保存"),
          bf16: Schema.boolean().default(false).description("按 bf16 保存"),
          float: Schema.boolean().default(false).description("按 float32 保存"),
          save_precision_as: Schema.union(["fp16", "bf16", "float"]).description("显式指定保存精度"),
          epoch: Schema.number().default(0).description("写入 checkpoint 的 epoch"),
          global_step: Schema.number().default(0).description("写入 checkpoint 的 global step"),
          metadata: Schema.string().role("textarea").description("写入模型的 metadata，填写 Python 字典字符串"),
          variant: Schema.string().description("读取 Diffusers 时使用的 variant，例如 fp16"),
          reference_model: Schema.string().role("textarea").description("保存为 Diffusers 时参考的基础模型"),
          use_safetensors: Schema.boolean().default(false).description("保存为 safetensors"),
          model_to_load: Schema.string().role("textarea").description("输入模型路径或 Diffusers 目录"),
          model_to_save: Schema.string().role("textarea").description("输出模型路径或 Diffusers 目录"),
        }),

        Schema.object({
          script_name: Schema.const("tools/show_metadata.py").required(),
          model: Schema.string().role("textarea").description("要查看 metadata 的模型路径"),
        }),

        Schema.object({
          script_name: Schema.const("tools/resize_images_to_resolution.py").required(),
          src_img_folder: Schema.string().role("filepicker", { type: "folder" }).description("原图文件夹"),
          dst_img_folder: Schema.string().role("filepicker", { type: "folder" }).description("输出文件夹"),
          max_resolution: Schema.string().default("512x512,384x384,256x256,128x128").description("目标分辨率列表，逗号分隔"),
          divisible_by: Schema.number().min(1).default(1).description("分辨率需被该数整除"),
          interpolation: Schema.union(["area", "cubic", "lanczos4", "nearest", "linear", "box"]).description("插值算法"),
          save_as_png: Schema.boolean().default(false).description("统一保存为 PNG"),
          copy_associated_files: Schema.boolean().default(false).description("复制同名标注等关联文件"),
        }),

        Schema.object({
          script_name: Schema.const("tools/canny.py").required(),
          input: Schema.string().role("textarea").description("输入图片或目录路径"),
          output: Schema.string().role("textarea").description("输出图片或目录路径"),
          thres1: Schema.number().default(32).description("Canny 阈值 1"),
          thres2: Schema.number().default(224).description("Canny 阈值 2"),
        }),

        Schema.object({
          script_name: Schema.const("tools/detect_face_rotate.py").required(),
          src_dir: Schema.string().role("filepicker", { type: "folder" }).description("输入图片文件夹"),
          dst_dir: Schema.string().role("filepicker", { type: "folder" }).description("输出图片文件夹"),
          rotate: Schema.boolean().default(false).description("自动旋转到人脸正向"),
          resize_fit: Schema.boolean().default(false).description("裁剪后按短边适配输出尺寸"),
          resize_face_size: Schema.number().min(1).description("裁剪前先把人脸缩放到指定大小"),
          crop_size: Schema.string().description("按 宽,高 裁剪，例如 512,512"),
          crop_ratio: Schema.string().description("按 脸宽倍率,脸高倍率 裁剪"),
          min_size: Schema.number().min(1).description("最小人脸尺寸"),
          max_size: Schema.number().min(1).description("最大人脸尺寸"),
          multiple_faces: Schema.boolean().default(false).description("检测到多张脸时分别输出"),
          debug: Schema.boolean().default(false).description("在输出图上标记人脸框"),
        }),

        Schema.object({
          script_name: Schema.const("tools/latent_upscaler.py").required(),
          vae_path: Schema.string().role("textarea").description("VAE 或带 vae 子目录的模型路径"),
          weights: Schema.string().role("textarea").description("latent upscaler 权重路径"),
          image_pattern: Schema.string().description("输入图片通配符，例如 E:/data/*.png"),
          output_dir: Schema.string().role("filepicker", { type: "folder" }).description("输出文件夹"),
          batch_size: Schema.number().min(1).default(4).description("主批大小"),
          vae_batch_size: Schema.number().min(1).default(1).description("VAE 编解码批大小"),
          debug: Schema.boolean().default(false).description("额外输出 Lanczos 对照图"),
        }),

        Schema.object({}),
      ]),
    ]);`
  },
  excerpt: "",
  headers: [],
  filePathRelative: "lora/tools.md"
};

export { e as data };
