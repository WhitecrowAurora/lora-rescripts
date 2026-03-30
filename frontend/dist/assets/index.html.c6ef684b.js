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
const E = s("p", null, "v1.1.5 Beta10", -1);
const h = r(
  `<p align="center"><strong>Fork from</strong> 秋葉 <a href="https://github.com/Akegarasu/lora-scripts" target="_blank" rel="noopener noreferrer">aaaki/lora-scripts</a></p><p align="center"><strong>Modify By</strong> <a href="https://github.com/WhitecrowAurora/lora-rescripts" target="_blank" rel="noopener noreferrer">Lulynx</a></p><h3 id="更新日志" tabindex="-1"><a class="header-anchor" href="#更新日志" aria-hidden="true">#</a> 更新日志</h3><h4 id="v1-1-5-beta10" tabindex="-1"><a class="header-anchor" href="#v1-1-5-beta10" aria-hidden="true">#</a> v1.1.5 Beta10</h4><ul><li>改进 Anima 训练吞吐与运行时稳定性，优化缓存处理、张量传输路径与运行诊断输出。</li><li>强化 Anima 在 SageAttention 下的性能可见性，新增步骤级 profiler 与更清晰的后端摘要日志。</li><li>修复多项 Anima 边界问题，包括预览 Prompt、空 Token 路径、旧版文本缓存重建，以及按 epoch 保存为 0 时的异常。</li><li>新增 Anima 高级调试选项，支持 profiler 统计窗口与 NaN 检查间隔调节。</li></ul>`,
  5
);

function F(u, g) {
  return e(), c("div", null, [s("div", i, [y, C, E]), h]);
}

var b = p(B, [["render", F], ["__file", "index.html.vue"]]);

export { b as default };
