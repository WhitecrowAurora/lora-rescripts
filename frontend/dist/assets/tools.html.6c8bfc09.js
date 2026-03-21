import { _ as l, o as t, c as r, a as e, b as o } from "./app.547295de.js";

const a = {};
const s = e("h1", { id: "工具", tabindex: "-1" }, [
  e("a", { class: "header-anchor", href: "#工具", "aria-hidden": "true" }, "#"),
  o(" 工具")
], -1);
const _ = e("p", null, "这一页现在不只是提取 LoRA，还补进了模型合并、格式转换、模型检查，以及常用的数据集预处理工具。现在也开始覆盖 SDXL/SVD 变体合并和旧格式模型互转。", -1);
const c = e("h2", { id: "已接入工具", tabindex: "-1" }, [
  e("a", { class: "header-anchor", href: "#已接入工具", "aria-hidden": "true" }, "#"),
  o(" 已接入工具")
], -1);
const n = e("ul", null, [
  e("li", null, [e("code", null, "networks/extract_lora_from_models.py"), o(" 从两个模型中近似提取 LoRA")]),
  e("li", null, [e("code", null, "networks/extract_lora_from_dylora.py"), o(" 从 DyLoRA 中提取普通 LoRA")]),
  e("li", null, [e("code", null, "networks/flux_extract_lora.py"), o(" 从两个 Flux 模型中提取 Flux LoRA")]),
  e("li", null, [e("code", null, "networks/resize_lora.py"), o(" 调整已有 LoRA 的 rank / conv rank")]),
  e("li", null, [e("code", null, "networks/lora_interrogator.py"), o(" 反推 LoRA 可能的触发词 / 关键词")]),
  e("li", null, [e("code", null, "networks/check_lora_weights.py"), o(" 检查 LoRA 权重键与统计信息")]),
  e("li", null, [e("code", null, "networks/merge_lora.py"), o(" 通用 LoRA 合并")]),
  e("li", null, [e("code", null, "networks/sdxl_merge_lora.py"), o(" SDXL LoRA 合并，支持 LBW 分层权重")]),
  e("li", null, [e("code", null, "networks/svd_merge_lora.py"), o(" SVD 方式压缩合并 LoRA，可重设 rank")]),
  e("li", null, [e("code", null, "networks/flux_merge_lora.py"), o(" Flux LoRA 合并")]),
  e("li", null, [e("code", null, "tools/merge_models.py"), o(" 通用底模合并")]),
  e("li", null, [e("code", null, "tools/merge_sd3_safetensors.py"), o(" SD3 / SD3.5 组件合并为单文件 safetensors")]),
  e("li", null, [e("code", null, "tools/convert_diffusers_to_flux.py"), o(" Flux diffusers 转单文件 safetensors")]),
  e("li", null, [e("code", null, "tools/convert_diffusers20_original_sd.py"), o(" Diffusers 与原版 SD checkpoint 双向转换")]),
  e("li", null, [e("code", null, "tools/show_metadata.py"), o(" 查看模型 metadata")]),
  e("li", null, [e("code", null, "tools/resize_images_to_resolution.py"), o(" 批量缩放数据集图片到指定分辨率集合")]),
  e("li", null, [e("code", null, "tools/canny.py"), o(" 批量生成 Canny 边缘图")]),
  e("li", null, [e("code", null, "tools/detect_face_rotate.py"), o(" 检测人脸、旋转对正并裁剪头像")]),
  e("li", null, [e("code", null, "tools/latent_upscaler.py"), o(" 使用 latent upscaler 批量放大图片")]),
  e("li", null, [e("code", null, "networks/convert_flux_lora.py"), o(" Flux LoRA 在 ai-toolkit 与 sd-scripts 之间转换")]),
  e("li", null, [e("code", null, "networks/convert_hunyuan_image_lora_to_comfy.py"), o(" HunyuanImage LoRA 与 Comfy 格式互转")]),
  e("li", null, [e("code", null, "networks/convert_anima_lora_to_comfy.py"), o(" Anima LoRA 与 Comfy 格式互转")])
], -1);
const i = e("div", { class: "custom-container tip" }, [
  e("p", { class: "custom-container-title" }, "TIP"),
  e("p", null, "带有多个模型路径或比例的参数，直接在表格里一行填一个即可；目录型参数现在也会直接调用文件夹选择器。")
], -1);
const d = [s, _, c, n, i];

function u(m, p) {
  return t(), r("div", null, d);
}

var h = l(a, [["render", u], ["__file", "tools.html.vue"]]);
export { h as default };
