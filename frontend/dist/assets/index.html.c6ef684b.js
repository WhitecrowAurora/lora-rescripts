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
const E = s("p", null, "v1.4.1", -1);
const h = r(
  `<p align="center"><strong>Fork from</strong> 秋葉 <a href="https://github.com/Akegarasu/lora-scripts" target="_blank" rel="noopener noreferrer">aaaki/lora-scripts</a></p><p align="center"><strong>Modify By</strong> <a href="https://github.com/WhitecrowAurora/lora-rescripts" target="_blank" rel="noopener noreferrer">Lulynx</a></p><h3 id="更新日志" tabindex="-1"><a class="header-anchor" href="#更新日志" aria-hidden="true">#</a> 更新日志</h3><h4 id="v1-4-1" tabindex="-1"><a class="header-anchor" href="#v1-4-1" aria-hidden="true">#</a> v1.4.1</h4><ul><li>新增 SDXL、Anima、Newbie 显存峰值控制。</li><li>新增 SDXL 独立 Block Swap 设置面板。</li><li>新增 SDXL、Anima、Newbie 的 LoRA-FA 训练支持。</li><li>新增 SDXL、Anima、Newbie 的 VeRA 训练支持。</li><li>新增 Lulynx 实验核心 LISA 调度支持。</li></ul>`,
  5
);

function F(u, g) {
  return e(), c("div", null, [s("div", i, [y, C, E]), h]);
}

var b = p(B, [["render", F], ["__file", "index.html.vue"]]);

export { b as default };
