import { _ as p, o as e, c, a as s, b as n, e as r } from "./app.547295de.js";

var t = "/assets/icon.65fd68ba.webp";

const B = {};
const i = { align: "center" };
const y = s(
  "h1",
  { id: "sd-rescripts", tabindex: "-1" },
  [
    s("a", { class: "header-anchor", href: "#sd-rescripts", "aria-hidden": "true" }, "#"),
    n(" SD-reScripts"),
  ],
  -1
);
const C = s(
  "img",
  {
    src: t,
    width: "200",
    height: "200",
    alt: "SD-reScripts",
    style: { margin: "20px", "border-radius": "25px" },
  },
  null,
  -1
);
const E = s("p", null, "v1.4.6 Beta36", -1);
const h = r(
  `<p align="center"><strong>Fork from</strong> 秋葉 <a href="https://github.com/Akegarasu/lora-scripts" target="_blank" rel="noopener noreferrer">aaaki/lora-scripts</a></p><p align="center"><strong>Modify By</strong> <a href="https://github.com/WhitecrowAurora/lora-rescripts" target="_blank" rel="noopener noreferrer">Lulynx</a></p><h3 id="更新日志" tabindex="-1"><a class="header-anchor" href="#更新日志" aria-hidden="true">#</a> 更新日志</h3><h4 id="v1-4-6-beta36" tabindex="-1"><a class="header-anchor" href="#v1-4-6-beta36" aria-hidden="true">#</a> v1.4.6 Beta36</h4><ul><li>新增 Anima 诊断开关 <code>anima_debug_mode</code>，默认关闭，按需输出详细日志。</li><li>新增 RoPE 不匹配处理模式 <code>anima_rope_mismatch_mode</code>（<code>strict</code>/<code>resample</code>），默认严格模式。</li><li>新增 <code>anima_rope_max_seq_tokens</code> 分桶预检查，训练前拦截超长 token 桶配置。</li><li>修复 TLoRA 路径下 RoPE 长度断言导致训练中断的问题，提供可控 fallback。</li><li>新增通用 <code>weight_decay</code> 参数，可在 UI 中直接配置优化器权重衰减。</li></ul>`,
  5
);

function F(u, g) {
  return e(), c("div", null, [s("div", i, [y, C, E]), h]);
}

var b = p(B, [["render", F], ["__file", "index.html.vue"]]);

export { b as default };
