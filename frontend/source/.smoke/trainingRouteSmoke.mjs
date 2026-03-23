// <define:import.meta.env>
var define_import_meta_env_default = {};

// scripts/trainingRouteSmoke.ts
import assert from "node:assert/strict";

// src/renderers/render.ts
function createPageHero(kicker, title, lede) {
  return `
    <section class="page-hero panel">
      <p class="eyebrow">${kicker}</p>
      <h2>${title}</h2>
      <p class="lede">${lede}</p>
    </section>
  `;
}

// src/shared/runtime.ts
var explicitRuntimeBase = (define_import_meta_env_default.VITE_RUNTIME_BASE_URL || "").replace(/\/$/, "");
var runtimeBaseUrl = explicitRuntimeBase || (define_import_meta_env_default.DEV ? "http://127.0.0.1:28000" : "");
function runtimeUrl(path) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return `${runtimeBaseUrl}${path}`;
}

// src/pages/trainingPage.ts
function renderTrainingPage(config) {
  return `
    ${createPageHero(config.heroKicker, config.heroTitle, config.heroLede)}
    ${config.routeNotice ? `
          <section class="panel info-card training-route-notice">
            <p class="panel-kicker">${config.routeNotice.kicker}</p>
            <h3>${config.routeNotice.title}</h3>
            <p>${config.routeNotice.detail}</p>
          </section>
        ` : ""}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">schema target</p>
        <h3>${config.runnerTitle}</h3>
        <div class="schema-bridge-toolbar">
          <label class="field-label" for="${config.prefix}-schema-select">Schema</label>
          <select id="${config.prefix}-schema-select" class="field-input"></select>
          <button id="${config.prefix}-reset" class="action-button" type="button">Reset defaults</button>
        </div>
        <p id="${config.prefix}-summary">Loading ${config.heroTitle} schema...</p>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">runtime</p>
        <h3 id="${config.prefix}-runtime-title">Loading GPU runtime...</h3>
        <div id="${config.prefix}-runtime-body">Checking /api/graphic_cards</div>
      </article>
    </section>

    <section class="panel train-actions-panel">
      <div class="train-actions-grid">
        <div>
          <p class="panel-kicker">gpu selection</p>
          <div id="${config.prefix}-gpu-selector" class="gpu-selector loading">Loading GPU list...</div>
        </div>
        <div>
          <p class="panel-kicker">launch</p>
          <div class="launch-column">
            <button id="${config.prefix}-run-preflight" class="action-button action-button-ghost" type="button">Run preflight</button>
            <button id="${config.prefix}-start-train" class="action-button action-button-large" type="button">${config.startButtonLabel}</button>
            <p class="section-note">
              Preflight runs backend-aware checks first, then launch submits the current local config snapshot to <code>/api/run</code>.
            </p>
            <p><a class="text-link" href="${runtimeUrl(config.legacyPath)}" target="_blank" rel="noreferrer">${config.legacyLabel}</a></p>
          </div>
        </div>
      </div>
      <div class="train-status-grid">
        <div id="${config.prefix}-submit-status" class="submit-status">Waiting for schema and backend data.</div>
        <div id="${config.prefix}-validation-status" class="submit-status">Checking payload compatibility...</div>
      </div>
      <div id="${config.prefix}-preflight-report" class="submit-status">Training preflight has not run yet.</div>
    </section>

    <section class="panel training-utility-panel">
      <div class="training-toolbar">
        <button id="${config.prefix}-reset-all" class="action-button action-button-ghost" type="button">Reset all</button>
        <button id="${config.prefix}-save-params" class="action-button action-button-ghost" type="button">Save params</button>
        <button id="${config.prefix}-read-params" class="action-button action-button-ghost" type="button">Read params</button>
        <button id="${config.prefix}-clear-autosave" class="action-button action-button-ghost" type="button">Clear autosave</button>
        <button id="${config.prefix}-save-recipe" class="action-button action-button-ghost" type="button">Save recipe</button>
        <button id="${config.prefix}-read-recipes" class="action-button action-button-ghost" type="button">Recipes</button>
        <button id="${config.prefix}-import-recipe" class="action-button action-button-ghost" type="button">Import recipe</button>
        <button id="${config.prefix}-download-config" class="action-button action-button-ghost" type="button">Download config</button>
        <button id="${config.prefix}-export-preset" class="action-button action-button-ghost" type="button">Export preset</button>
        <button id="${config.prefix}-import-config" class="action-button action-button-ghost" type="button">Import config</button>
        <button id="${config.prefix}-load-presets" class="action-button action-button-ghost" type="button">Load presets</button>
        <button id="${config.prefix}-stop-train" class="action-button action-button-ghost" type="button">Stop train</button>
      </div>
      <p id="${config.prefix}-utility-note" class="section-note">Autosave and local recipe storage stay in this browser for this source route.</p>
      <div id="${config.prefix}-autosave-status" class="training-autosave-status"></div>
      <input id="${config.prefix}-config-file-input" type="file" accept=".toml" hidden />
      <input id="${config.prefix}-history-file-input" type="file" accept=".json" hidden />
      <input id="${config.prefix}-recipe-file-input" type="file" accept=".json,.toml" hidden />
      <section class="training-side-panel training-inline-workspace">
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">preview prompt</p>
            <h3>Sample prompt workspace</h3>
          </div>
          <div class="history-toolbar">
            <button id="${config.prefix}-pick-prompt-file" class="action-button action-button-ghost action-button-small" type="button">Pick prompt file</button>
            <button id="${config.prefix}-clear-prompt-file" class="action-button action-button-ghost action-button-small" type="button">Clear prompt file</button>
            <button id="${config.prefix}-refresh-sample-prompt" class="action-button action-button-ghost action-button-small" type="button">Refresh prompt</button>
            <button id="${config.prefix}-download-sample-prompt" class="action-button action-button-ghost action-button-small" type="button">Download txt</button>
          </div>
        </div>
        <p class="section-note">
          Inspect the effective sample prompt without launching training. This resolves <code>prompt_file</code>, generated prompt fields,
          and imported legacy <code>sample_prompts</code> values.
        </p>
        <div id="${config.prefix}-sample-prompt-workspace" class="submit-status">
          <div class="submit-status-box">
            <strong>Sample prompt workspace is waiting for refresh</strong>
            <p>Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.</p>
          </div>
        </div>
      </section>
      <section id="${config.prefix}-history-panel" class="training-side-panel" hidden></section>
      <section id="${config.prefix}-recipes-panel" class="training-side-panel" hidden></section>
      <section id="${config.prefix}-presets-panel" class="training-side-panel" hidden></section>
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Rendered sections</p>
        <h2>${config.renderedTitle}</h2>
      </div>
      <p class="section-note">The fields below come from evaluating the current training schema DSL, not from hand-written JSON.</p>
    </section>
    <section id="${config.prefix}-sections" class="schema-sections loading">Loading ${config.heroTitle} sections...</section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Payload preview</p>
        <h2>Request body preview</h2>
      </div>
      <p class="section-note">This mirrors the normalized object that will be sent to <code>/api/run</code>.</p>
    </section>
    <section class="panel preview-panel">
      <pre id="${config.prefix}-preview">{}</pre>
    </section>
  `;
}

// src/pages/animaTrainPage.ts
function renderAnimaTrainPage() {
  return renderTrainingPage({
    prefix: "anima",
    heroKicker: "anima lora",
    heroTitle: "Anima LoRA source training page",
    heroLede: "This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",
    runnerTitle: "Anima LoRA source-side runner",
    startButtonLabel: "Start Anima LoRA training",
    legacyPath: "/lora/anima.html",
    legacyLabel: "Open current shipped Anima LoRA page",
    renderedTitle: "Anima LoRA form bridge"
  });
}

// src/pages/dreamboothTrainPage.ts
function renderDreamboothTrainPage() {
  return renderTrainingPage({
    prefix: "dreambooth",
    heroKicker: "dreambooth train",
    heroTitle: "Dreambooth source training page",
    heroLede: "This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",
    runnerTitle: "Dreambooth source-side runner",
    startButtonLabel: "Start Dreambooth training",
    legacyPath: "/dreambooth/",
    legacyLabel: "Open current shipped Dreambooth page",
    renderedTitle: "Dreambooth form bridge"
  });
}

// src/pages/fluxTrainPage.ts
function renderFluxTrainPage() {
  return renderTrainingPage({
    prefix: "flux",
    heroKicker: "flux train",
    heroTitle: "Flux LoRA source training page",
    heroLede: "This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",
    runnerTitle: "Flux source-side runner",
    startButtonLabel: "Start Flux training",
    legacyPath: "/lora/flux.html",
    legacyLabel: "Open current shipped Flux page",
    renderedTitle: "Flux form bridge"
  });
}

// src/pages/sd3FinetuneTrainPage.ts
function renderSd3FinetuneTrainPage() {
  return renderTrainingPage({
    prefix: "sd3-finetune",
    heroKicker: "sd3 finetune",
    heroTitle: "SD3 finetune source training page",
    heroLede: "This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",
    runnerTitle: "SD3 finetune source-side runner",
    startButtonLabel: "Start SD3 finetune",
    legacyPath: "/lora/sd3-finetune.html",
    legacyLabel: "Open current shipped SD3 finetune page",
    renderedTitle: "SD3 finetune form bridge"
  });
}

// src/pages/sd3TrainPage.ts
function renderSd3TrainPage() {
  return renderTrainingPage({
    prefix: "sd3",
    heroKicker: "sd3 train",
    heroTitle: "SD3 LoRA source training page",
    heroLede: "This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",
    runnerTitle: "SD3 source-side runner",
    startButtonLabel: "Start SD3 training",
    legacyPath: "/lora/sd3.html",
    legacyLabel: "Open current shipped SD3 page",
    renderedTitle: "SD3 form bridge"
  });
}

// src/pages/sdxlControlNetTrainPage.ts
function renderSdxlControlNetTrainPage() {
  return renderTrainingPage({
    prefix: "sdxl-controlnet",
    heroKicker: "sdxl controlnet",
    heroTitle: "SDXL ControlNet source training page",
    heroLede: "This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",
    runnerTitle: "SDXL ControlNet source-side runner",
    startButtonLabel: "Start SDXL ControlNet training",
    legacyPath: "/lora/sdxl-controlnet.html",
    legacyLabel: "Open current shipped SDXL ControlNet page",
    renderedTitle: "SDXL ControlNet form bridge",
    routeNotice: {
      kicker: "experimental",
      title: "SDXL clip_skip remains experimental here as well",
      detail: "ControlNet still shares the SDXL text-encoding path. If you enable clip_skip on this route, keep your inference stack aligned with the same SDXL clip-skip behavior."
    }
  });
}

// src/pages/sdxlTrainPage.ts
function renderSdxlTrainPage() {
  return renderTrainingPage({
    prefix: "sdxl",
    heroKicker: "sdxl train",
    heroTitle: "First source-side SDXL training page",
    heroLede: "This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",
    runnerTitle: "SDXL source-side runner",
    startButtonLabel: "Start SDXL training",
    legacyPath: "/lora/sdxl.html",
    legacyLabel: "Open current shipped SDXL page",
    renderedTitle: "SDXL form bridge",
    routeNotice: {
      kicker: "experimental",
      title: "SDXL clip_skip is now opt-in experimental support",
      detail: "This build can pass clip_skip through the SDXL training path, but it should be treated as experimental. If you rely on it, use matching SDXL clip-skip behavior at inference time too."
    }
  });
}

// src/routing/router.ts
var defaultRouteHash = "#/workspace";
var appRoutes = [
  {
    id: "overview",
    label: "Workspace",
    section: "overview",
    hash: defaultRouteHash,
    description: "Source migration dashboard and live backend diagnostics."
  },
  {
    id: "about",
    label: "About",
    section: "phase1",
    hash: "#/about",
    description: "Rebuild branding and release notes in source form."
  },
  {
    id: "settings",
    label: "Settings",
    section: "phase1",
    hash: "#/settings",
    description: "Read config summary and saved parameter state from the backend."
  },
  {
    id: "tasks",
    label: "Tasks",
    section: "phase1",
    hash: "#/tasks",
    description: "Inspect and manage task execution state."
  },
  {
    id: "tageditor",
    label: "Tag Editor",
    section: "phase1",
    hash: "#/tageditor",
    description: "Track startup status and future proxy behavior."
  },
  {
    id: "tensorboard",
    label: "TensorBoard",
    section: "phase1",
    hash: "#/tensorboard",
    description: "Prepare a cleaner source-side wrapper for TensorBoard access."
  },
  {
    id: "tools",
    label: "Tools",
    section: "phase1",
    hash: "#/tools",
    description: "Migrate script-launch and utility entry points from the legacy tools page."
  },
  {
    id: "schema-bridge",
    label: "Schema Bridge",
    section: "reference",
    hash: "#/schema-bridge",
    description: "Evaluate current schema DSL into a source-side explorer and prototype form renderer."
  },
  {
    id: "sdxl-train",
    label: "SDXL Train",
    section: "reference",
    hash: "#/sdxl-train",
    description: "First source-side training page powered by the schema bridge and current `/api/run` backend."
  },
  {
    id: "flux-train",
    label: "Flux Train",
    section: "reference",
    hash: "#/flux-train",
    description: "Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."
  },
  {
    id: "sd3-train",
    label: "SD3 Train",
    section: "reference",
    hash: "#/sd3-train",
    description: "Source-side SD3 LoRA training route using the same normalized payload workflow."
  },
  {
    id: "sd3-finetune-train",
    label: "SD3 Finetune",
    section: "reference",
    hash: "#/sd3-finetune-train",
    description: "Source-side SD3 finetune route on the shared training bridge."
  },
  {
    id: "dreambooth-train",
    label: "Dreambooth",
    section: "reference",
    hash: "#/dreambooth-train",
    description: "Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."
  },
  {
    id: "flux-finetune-train",
    label: "Flux Finetune",
    section: "reference",
    hash: "#/flux-finetune-train",
    description: "Source-side Flux full-finetune route using the shared launch workflow."
  },
  {
    id: "sd-controlnet-train",
    label: "SD ControlNet",
    section: "reference",
    hash: "#/sd-controlnet-train",
    description: "Source-side SD ControlNet training route using the shared launch flow."
  },
  {
    id: "sdxl-controlnet-train",
    label: "SDXL ControlNet",
    section: "reference",
    hash: "#/sdxl-controlnet-train",
    description: "Source-side SDXL ControlNet training route using the shared launch flow."
  },
  {
    id: "flux-controlnet-train",
    label: "Flux ControlNet",
    section: "reference",
    hash: "#/flux-controlnet-train",
    description: "Source-side Flux ControlNet training route using the shared launch flow."
  },
  {
    id: "sdxl-lllite-train",
    label: "SDXL LLLite",
    section: "reference",
    hash: "#/sdxl-lllite-train",
    description: "Source-side SDXL ControlNet-LLLite training route on the shared training bridge."
  },
  {
    id: "sd-ti-train",
    label: "SD TI",
    section: "reference",
    hash: "#/sd-ti-train",
    description: "Source-side SD textual inversion route on the shared training bridge."
  },
  {
    id: "xti-train",
    label: "SD XTI",
    section: "reference",
    hash: "#/xti-train",
    description: "Source-side SD XTI textual inversion route on the shared training bridge."
  },
  {
    id: "sdxl-ti-train",
    label: "SDXL TI",
    section: "reference",
    hash: "#/sdxl-ti-train",
    description: "Source-side SDXL textual inversion route on the shared training bridge."
  },
  {
    id: "anima-train",
    label: "Anima LoRA",
    section: "reference",
    hash: "#/anima-train",
    description: "Source-side Anima LoRA training route using the shared launch flow."
  },
  {
    id: "anima-finetune-train",
    label: "Anima Finetune",
    section: "reference",
    hash: "#/anima-finetune-train",
    description: "Source-side Anima finetune route using the shared launch flow."
  },
  {
    id: "lumina-train",
    label: "Lumina LoRA",
    section: "reference",
    hash: "#/lumina-train",
    description: "Source-side Lumina LoRA training route using the shared launch flow."
  },
  {
    id: "lumina-finetune-train",
    label: "Lumina Finetune",
    section: "reference",
    hash: "#/lumina-finetune-train",
    description: "Source-side Lumina finetune route using the shared launch flow."
  },
  {
    id: "hunyuan-image-train",
    label: "Hunyuan Image",
    section: "reference",
    hash: "#/hunyuan-image-train",
    description: "Source-side Hunyuan Image LoRA training route using the shared launch flow."
  }
];
var validRouteHashes = new Set(appRoutes.map((route) => route.hash));
var legacyPathAliasMap = {
  "/index.html": defaultRouteHash,
  "/index.md": defaultRouteHash,
  "/404.html": defaultRouteHash,
  "/404.md": defaultRouteHash,
  "/task.html": "#/tasks",
  "/task.md": "#/tasks",
  "/tageditor.html": "#/tageditor",
  "/tageditor.md": "#/tageditor",
  "/tagger.html": "#/tageditor",
  "/tagger.md": "#/tageditor",
  "/tensorboard.html": "#/tensorboard",
  "/tensorboard.md": "#/tensorboard",
  "/other/about.html": "#/about",
  "/other/about.md": "#/about",
  "/other/settings.html": "#/settings",
  "/other/settings.md": "#/settings",
  "/dreambooth/index.html": "#/dreambooth-train",
  "/dreambooth/index.md": "#/dreambooth-train",
  "/lora/index.html": "#/sdxl-train",
  "/lora/index.md": "#/sdxl-train"
};
var legacyPathAliases = Object.keys(legacyPathAliasMap).sort((left, right) => right.length - left.length);

// src/training/trainingOptionRegistry.ts
var TRAINING_OPTION_VISIBILITY_STORAGE_KEY = "source-training-option-visibility-v1";
var CUSTOM_SCHEDULER_PREFIX = "__custom__:";
var FEATURED_PYTORCH_OPTIMIZER_NAMES = /* @__PURE__ */ new Set([
  "AdaBelief",
  "Adan",
  "CAME",
  "LaProp",
  "MADGRAD",
  "RAdam",
  "Ranger",
  "Ranger21",
  "ScheduleFreeAdamW",
  "SophiaH",
  "StableAdamW"
]);
var PYTORCH_OPTIMIZER_ALL_NAMES = [
  "LBFGS",
  "SGD",
  "Adam",
  "AdamW",
  "NAdam",
  "RMSprop",
  "A2Grad",
  "ADOPT",
  "APOLLO",
  "ASGD",
  "AccSGD",
  "AdEMAMix",
  "AdaBelief",
  "AdaBound",
  "AdaDelta",
  "AdaFactor",
  "AdaGC",
  "AdaGO",
  "AdaHessian",
  "AdaLOMO",
  "AdaMax",
  "AdaMod",
  "AdaMuon",
  "AdaNorm",
  "AdaPNM",
  "AdaShift",
  "AdaSmooth",
  "AdaTAM",
  "Adai",
  "Adalite",
  "AdamC",
  "AdamG",
  "AdamMini",
  "AdamP",
  "AdamS",
  "AdamWSN",
  "Adan",
  "AggMo",
  "Aida",
  "AliG",
  "Alice",
  "BCOS",
  "Amos",
  "Ano",
  "ApolloDQN",
  "AvaGrad",
  "BSAM",
  "CAME",
  "Conda",
  "DAdaptAdaGrad",
  "DAdaptAdam",
  "DAdaptAdan",
  "DAdaptLion",
  "DAdaptSGD",
  "DeMo",
  "DiffGrad",
  "DistributedMuon",
  "EXAdam",
  "EmoFact",
  "EmoLynx",
  "EmoNavi",
  "FAdam",
  "FOCUS",
  "FTRL",
  "Fira",
  "Fromage",
  "GaLore",
  "Grams",
  "Gravity",
  "GrokFastAdamW",
  "Kate",
  "Kron",
  "LARS",
  "LOMO",
  "LaProp",
  "Lamb",
  "Lion",
  "MADGRAD",
  "MARS",
  "MSVAG",
  "Muon",
  "Nero",
  "NovoGrad",
  "PAdam",
  "PID",
  "PNM",
  "Prodigy",
  "QHAdam",
  "QHM",
  "RACS",
  "RAdam",
  "Ranger",
  "Ranger21",
  "Ranger25",
  "SCION",
  "SCIONLight",
  "SGDP",
  "SGDSaI",
  "SGDW",
  "SM3",
  "SOAP",
  "SPAM",
  "SPlus",
  "SRMM",
  "SWATS",
  "ScalableShampoo",
  "ScheduleFreeAdamW",
  "ScheduleFreeRAdam",
  "ScheduleFreeSGD",
  "Shampoo",
  "SignSGD",
  "SimplifiedAdEMAMix",
  "SophiaH",
  "StableAdamW",
  "StableSPAM",
  "TAM",
  "Tiger",
  "VSGD",
  "Yogi",
  "SpectralSphere"
];
var OPTIMIZER_DESCRIPTION_MAP = {
  AdaBelief: "Adam-like optimizer with variance tracking tuned by prediction belief.",
  Adan: "Fast adaptive optimizer that many diffusion users like for aggressive finetunes.",
  CAME: "Memory-conscious optimizer from pytorch-optimizer, already popular in diffusion training.",
  LaProp: "Adam and RMSProp style hybrid that some LoRA users prefer for stable convergence.",
  MADGRAD: "Momentumized dual averaging optimizer with a good track record on noisy training runs.",
  RAdam: "Rectified Adam variant that can behave more gently than plain AdamW early on.",
  Ranger: "RAdam plus Lookahead style optimizer from the Ranger family.",
  Ranger21: "Heavier Ranger-family optimizer with many training-time stabilizers built in.",
  ScheduleFreeAdamW: "Schedule-free AdamW variant that reduces dependence on a separate LR scheduler.",
  ScheduleFreeRAdam: "Schedule-free RAdam variant from pytorch-optimizer.",
  SophiaH: "Hessian-aware optimizer that some users test for large-batch training.",
  StableAdamW: "Stabilized AdamW implementation from pytorch-optimizer."
};
var BUILTIN_OPTIMIZER_ENTRIES = [
  {
    kind: "optimizer",
    value: "AdamW",
    label: "AdamW",
    description: "Standard torch AdamW optimizer.",
    source: "torch",
    sourceLabel: "torch.optim",
    defaultVisible: true,
    featured: true
  },
  {
    kind: "optimizer",
    value: "AdamW8bit",
    label: "AdamW8bit",
    description: "bitsandbytes 8-bit AdamW for lower VRAM usage.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    featured: true,
    packageName: "bitsandbytes"
  },
  {
    kind: "optimizer",
    value: "PagedAdamW8bit",
    label: "PagedAdamW8bit",
    description: "Paged 8-bit AdamW from bitsandbytes.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes"
  },
  {
    kind: "optimizer",
    value: "RAdamScheduleFree",
    label: "RAdamScheduleFree",
    description: "Schedule-free RAdam from the schedulefree package.",
    source: "schedulefree",
    sourceLabel: "schedulefree",
    defaultVisible: true,
    featured: true,
    packageName: "schedulefree"
  },
  {
    kind: "optimizer",
    value: "Lion",
    label: "Lion",
    description: "Lion optimizer using the project's existing training bridge.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    featured: true,
    packageName: "lion_pytorch"
  },
  {
    kind: "optimizer",
    value: "Lion8bit",
    label: "Lion8bit",
    description: "bitsandbytes 8-bit Lion.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes"
  },
  {
    kind: "optimizer",
    value: "PagedLion8bit",
    label: "PagedLion8bit",
    description: "Paged 8-bit Lion from bitsandbytes.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes"
  },
  {
    kind: "optimizer",
    value: "SGDNesterov",
    label: "SGDNesterov",
    description: "Nesterov SGD handled by the project bridge.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true
  },
  {
    kind: "optimizer",
    value: "SGDNesterov8bit",
    label: "SGDNesterov8bit",
    description: "bitsandbytes 8-bit Nesterov SGD.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes"
  },
  {
    kind: "optimizer",
    value: "DAdaptation",
    label: "DAdaptation",
    description: "Legacy DAdaptation bridge entry used by many existing configs.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation"
  },
  {
    kind: "optimizer",
    value: "DAdaptAdam",
    label: "DAdaptAdam",
    description: "DAdapt Adam bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation"
  },
  {
    kind: "optimizer",
    value: "DAdaptAdaGrad",
    label: "DAdaptAdaGrad",
    description: "DAdapt AdaGrad bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation"
  },
  {
    kind: "optimizer",
    value: "DAdaptAdanIP",
    label: "DAdaptAdanIP",
    description: "Existing Adan-IP flavored DAdapt bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation"
  },
  {
    kind: "optimizer",
    value: "DAdaptLion",
    label: "DAdaptLion",
    description: "DAdapt Lion bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation"
  },
  {
    kind: "optimizer",
    value: "DAdaptSGD",
    label: "DAdaptSGD",
    description: "DAdapt SGD bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation"
  },
  {
    kind: "optimizer",
    value: "AdaFactor",
    label: "AdaFactor",
    description: "Transformers Adafactor bridge entry.",
    source: "transformers",
    sourceLabel: "transformers",
    defaultVisible: true,
    packageName: "transformers"
  },
  {
    kind: "optimizer",
    value: "Prodigy",
    label: "Prodigy",
    description: "Prodigy optimizer already supported by the training bridge.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    featured: true,
    packageName: "prodigyopt"
  },
  {
    kind: "optimizer",
    value: "prodigyplus.ProdigyPlusScheduleFree",
    label: "ProdigyPlusScheduleFree",
    description: "ProdigyPlus schedule-free optimizer entry.",
    source: "prodigyplus",
    sourceLabel: "prodigyplus",
    defaultVisible: true,
    packageName: "prodigyplus"
  },
  {
    kind: "optimizer",
    value: "pytorch_optimizer.CAME",
    label: "CAME",
    description: OPTIMIZER_DESCRIPTION_MAP.CAME,
    source: "pytorch-optimizer",
    sourceLabel: "pytorch-optimizer",
    defaultVisible: true,
    featured: true,
    packageName: "pytorch_optimizer"
  },
  {
    kind: "optimizer",
    value: "bitsandbytes.optim.AdEMAMix8bit",
    label: "AdEMAMix8bit",
    description: "bitsandbytes AdEMAMix 8-bit optimizer.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes"
  },
  {
    kind: "optimizer",
    value: "bitsandbytes.optim.PagedAdEMAMix8bit",
    label: "PagedAdEMAMix8bit",
    description: "Paged bitsandbytes AdEMAMix 8-bit optimizer.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes"
  }
];
function createCustomSchedulerValue(path) {
  return `${CUSTOM_SCHEDULER_PREFIX}${path}`;
}
function createSchedulerEntry(label, description, source, sourceLabel, schedulerTypePath, defaultVisible = false, featured = false) {
  return {
    kind: "scheduler",
    value: createCustomSchedulerValue(schedulerTypePath),
    label,
    description,
    source,
    sourceLabel,
    defaultVisible,
    featured,
    schedulerTypePath,
    schedulerFallback: "constant",
    packageName: source === "pytorch-optimizer" ? "pytorch_optimizer" : void 0
  };
}
var BUILTIN_SCHEDULER_ENTRIES = [
  {
    kind: "scheduler",
    value: "linear",
    label: "linear",
    description: "Built-in diffusers linear scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
    featured: true
  },
  {
    kind: "scheduler",
    value: "cosine",
    label: "cosine",
    description: "Built-in diffusers cosine scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
    featured: true
  },
  {
    kind: "scheduler",
    value: "cosine_with_restarts",
    label: "cosine_with_restarts",
    description: "Built-in diffusers cosine scheduler with restarts.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
    featured: true
  },
  {
    kind: "scheduler",
    value: "polynomial",
    label: "polynomial",
    description: "Built-in diffusers polynomial scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true
  },
  {
    kind: "scheduler",
    value: "constant",
    label: "constant",
    description: "Built-in constant scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true
  },
  {
    kind: "scheduler",
    value: "constant_with_warmup",
    label: "constant_with_warmup",
    description: "Built-in constant scheduler with warmup.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true
  }
];
var EXTRA_SCHEDULER_ENTRIES = [
  createSchedulerEntry(
    "CosineAnnealingLR",
    "Torch cosine annealing scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.CosineAnnealingLR",
    true,
    true
  ),
  createSchedulerEntry(
    "CosineAnnealingWarmRestarts",
    "Torch cosine annealing scheduler with warm restarts.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.CosineAnnealingWarmRestarts",
    true,
    true
  ),
  createSchedulerEntry(
    "OneCycleLR",
    "Torch one-cycle scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.OneCycleLR",
    true,
    true
  ),
  createSchedulerEntry(
    "StepLR",
    "Torch step scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.StepLR"
  ),
  createSchedulerEntry(
    "MultiStepLR",
    "Torch multi-step scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.MultiStepLR"
  ),
  createSchedulerEntry(
    "CyclicLR",
    "Torch cyclic scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.CyclicLR"
  ),
  createSchedulerEntry(
    "CosineAnnealingWarmupRestarts",
    "pytorch-optimizer warmup cosine scheduler.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.CosineAnnealingWarmupRestarts",
    true,
    true
  ),
  createSchedulerEntry(
    "REXScheduler",
    "pytorch-optimizer REX scheduler.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.REXScheduler",
    true,
    true
  ),
  createSchedulerEntry(
    "CosineScheduler",
    "pytorch-optimizer cosine scheduler helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.CosineScheduler"
  ),
  createSchedulerEntry(
    "LinearScheduler",
    "pytorch-optimizer linear scheduler helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.LinearScheduler"
  ),
  createSchedulerEntry(
    "PolyScheduler",
    "pytorch-optimizer polynomial scheduler helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.PolyScheduler"
  ),
  createSchedulerEntry(
    "ProportionScheduler",
    "pytorch-optimizer proportion scheduler.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.ProportionScheduler"
  ),
  createSchedulerEntry(
    "Chebyshev",
    "pytorch-optimizer chebyshev schedule helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.get_chebyshev_schedule"
  ),
  createSchedulerEntry(
    "WarmupStableDecay",
    "pytorch-optimizer warmup-stable-decay schedule helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.get_wsd_schedule"
  )
];
function createPytorchOptimizerEntry(name) {
  const description = OPTIMIZER_DESCRIPTION_MAP[name] ?? "Extra optimizer imported from pytorch-optimizer.";
  return {
    kind: "optimizer",
    value: `pytorch_optimizer.${name}`,
    label: name,
    description,
    source: "pytorch-optimizer",
    sourceLabel: "pytorch-optimizer",
    defaultVisible: FEATURED_PYTORCH_OPTIMIZER_NAMES.has(name),
    featured: FEATURED_PYTORCH_OPTIMIZER_NAMES.has(name),
    packageName: "pytorch_optimizer"
  };
}
function getOptimizerBaseName(value) {
  const trimmed = value.trim();
  const dotIndex = trimmed.lastIndexOf(".");
  return dotIndex === -1 ? trimmed.toLowerCase() : trimmed.slice(dotIndex + 1).toLowerCase();
}
var builtinOptimizerBaseNames = new Set(BUILTIN_OPTIMIZER_ENTRIES.map((entry) => getOptimizerBaseName(entry.value)));
var PYTORCH_OPTIMIZER_ENTRIES = PYTORCH_OPTIMIZER_ALL_NAMES.filter((name) => !builtinOptimizerBaseNames.has(name.toLowerCase())).map((name) => createPytorchOptimizerEntry(name));
var TRAINING_OPTION_ENTRIES = [
  ...BUILTIN_OPTIMIZER_ENTRIES,
  ...PYTORCH_OPTIMIZER_ENTRIES,
  ...BUILTIN_SCHEDULER_ENTRIES,
  ...EXTRA_SCHEDULER_ENTRIES
];
var CORE_VISIBLE_VALUES = {
  optimizer: BUILTIN_OPTIMIZER_ENTRIES.map((entry) => entry.value),
  scheduler: BUILTIN_SCHEDULER_ENTRIES.map((entry) => entry.value)
};
var ENTRY_MAP = new Map(TRAINING_OPTION_ENTRIES.map((entry) => [`${entry.kind}:${entry.value}`, entry]));
var SCHEDULER_TYPE_MAP = new Map(
  TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === "scheduler" && entry.schedulerTypePath).map((entry) => [entry.schedulerTypePath, entry])
);
function compareEntries(left, right) {
  if (left.defaultVisible !== right.defaultVisible) {
    return left.defaultVisible ? -1 : 1;
  }
  if (left.featured !== right.featured) {
    return left.featured ? -1 : 1;
  }
  if (left.sourceLabel !== right.sourceLabel) {
    return left.sourceLabel.localeCompare(right.sourceLabel);
  }
  return left.label.localeCompare(right.label);
}
function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}
function readVisibilitySettings() {
  const fallback = {
    optimizer: TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === "optimizer" && entry.defaultVisible).map((entry) => entry.value),
    scheduler: TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === "scheduler" && entry.defaultVisible).map((entry) => entry.value)
  };
  const instance = safeWindow();
  if (!instance) {
    return fallback;
  }
  try {
    const raw = instance.localStorage.getItem(TRAINING_OPTION_VISIBILITY_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return {
      optimizer: sanitizeVisibilityList("optimizer", parsed.optimizer, fallback.optimizer),
      scheduler: sanitizeVisibilityList("scheduler", parsed.scheduler, fallback.scheduler)
    };
  } catch {
    return fallback;
  }
}
function sanitizeVisibilityList(kind, value, fallback) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  const validValues = new Set(TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === kind).map((entry) => entry.value));
  return value.map((entry) => String(entry)).filter((entry, index, list) => validValues.has(entry) && list.indexOf(entry) === index);
}
function getTrainingOptionEntries(kind) {
  return TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === kind).slice().sort(compareEntries);
}
function getTrainingOptionEntry(kind, value) {
  return ENTRY_MAP.get(`${kind}:${value}`) ?? null;
}
function getTrainingOptionEntryBySchedulerType(path) {
  return SCHEDULER_TYPE_MAP.get(path) ?? null;
}
function getTrainingOptionVisibilitySettings() {
  return readVisibilitySettings();
}
function getVisibleTrainingOptionEntries(kind) {
  const visibleSet = new Set(readVisibilitySettings()[kind]);
  return getTrainingOptionEntries(kind).filter((entry) => visibleSet.has(entry.value));
}
function buildSelectionNote(entry, hiddenBySettings) {
  const notes = [];
  if (hiddenBySettings) {
    notes.push("Currently hidden in Settings, but kept because this value is already selected or imported.");
  }
  if (entry?.kind === "scheduler" && entry.schedulerTypePath) {
    notes.push(`Launch bridge writes lr_scheduler_type=${entry.schedulerTypePath}.`);
  }
  if (entry?.packageName) {
    notes.push(`Requires ${entry.packageName} in the active Python environment.`);
  }
  return notes.join(" ");
}
function createGenericChoice(value, hiddenBySettings) {
  return {
    value,
    label: hiddenBySettings ? `${value} [hidden/imported]` : value,
    description: "Imported value kept for compatibility.",
    hiddenBySettings,
    selectionNote: hiddenBySettings ? "This value is not in the current visible catalog, but it is preserved so older configs keep working." : void 0
  };
}
function buildTrainingOptionChoices(kind, schemaOptions, currentValue) {
  const visibleValues = new Set(getTrainingOptionVisibilitySettings()[kind]);
  const currentText = currentValue === void 0 || currentValue === null ? "" : String(currentValue);
  const choices = [];
  const seen = /* @__PURE__ */ new Set();
  const maybePushChoice = (value, schemaDeclared = false) => {
    if (seen.has(value)) {
      return;
    }
    const entry = getTrainingOptionEntry(kind, value);
    const hiddenBySettings = Boolean(entry) && !visibleValues.has(value);
    const shouldShow = schemaDeclared ? !hiddenBySettings || value === currentText || !entry : visibleValues.has(value) || value === currentText;
    if (!shouldShow) {
      return;
    }
    if (!entry) {
      choices.push(createGenericChoice(value, value === currentText && !schemaDeclared));
      seen.add(value);
      return;
    }
    choices.push({
      value,
      label: `${entry.label} [${entry.sourceLabel}]${hiddenBySettings ? " [hidden]" : ""}`,
      description: entry.description,
      sourceLabel: entry.sourceLabel,
      hiddenBySettings,
      selectionNote: buildSelectionNote(entry, hiddenBySettings),
      entry
    });
    seen.add(value);
  };
  for (const option of schemaOptions) {
    maybePushChoice(String(option), true);
  }
  for (const entry of getTrainingOptionEntries(kind)) {
    maybePushChoice(entry.value);
  }
  if (currentText.length > 0 && !seen.has(currentText)) {
    maybePushChoice(currentText);
  }
  return choices;
}
function stringValue(value) {
  return value === void 0 || value === null ? "" : String(value);
}
function restoreManagedSchedulerSelection(values) {
  const schedulerType = stringValue(values.lr_scheduler_type).trim();
  if (schedulerType.length === 0) {
    return values;
  }
  const matchedEntry = getTrainingOptionEntryBySchedulerType(schedulerType);
  if (matchedEntry) {
    values.lr_scheduler = matchedEntry.value;
  }
  return values;
}
function normalizeManagedSchedulerSelection(values) {
  const schedulerValue = stringValue(values.lr_scheduler);
  const selectedEntry = getTrainingOptionEntry("scheduler", schedulerValue);
  if (!selectedEntry?.schedulerTypePath) {
    return values;
  }
  values.lr_scheduler_type = selectedEntry.schedulerTypePath;
  values.lr_scheduler = selectedEntry.schedulerFallback ?? "constant";
  return values;
}

// src/training/trainingPayloadToml.ts
function splitTomlArray(inner) {
  const items = [];
  let current = "";
  let quote = null;
  let bracketDepth = 0;
  for (let index = 0; index < inner.length; index += 1) {
    const char = inner[index];
    const previous = index > 0 ? inner[index - 1] : "";
    if (quote) {
      current += char;
      if (char === quote && previous !== "\\") {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      current += char;
      continue;
    }
    if (char === "]") {
      bracketDepth -= 1;
      current += char;
      continue;
    }
    if (char === "," && bracketDepth === 0) {
      items.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim().length > 0) {
    items.push(current.trim());
  }
  return items;
}
function stripTomlComment(line) {
  let quote = null;
  let escaped = false;
  let result = "";
  for (const char of line) {
    if (quote) {
      result += char;
      if (quote === '"' && char === "\\" && !escaped) {
        escaped = true;
        continue;
      }
      if (char === quote && !escaped) {
        quote = null;
      }
      escaped = false;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      result += char;
      continue;
    }
    if (char === "#") {
      break;
    }
    result += char;
  }
  return result.trim();
}
function parseTomlString(rawValue) {
  if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
    return rawValue.slice(1, -1).replaceAll('\\"', '"').replaceAll("\\n", "\n").replaceAll("\\t", "	").replaceAll("\\\\", "\\");
  }
  if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
    return rawValue.slice(1, -1);
  }
  return rawValue;
}
function parseTomlValue(rawValue) {
  const value = rawValue.trim();
  if (value.length === 0) {
    return "";
  }
  if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
    return parseTomlString(value);
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    return splitTomlArray(value.slice(1, -1)).map((item) => parseTomlValue(item));
  }
  if (/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(value)) {
    return Number(value.replaceAll("_", ""));
  }
  return value;
}
function splitTomlKeyPath(keySource) {
  return keySource.split(".").map((part) => part.trim()).filter(Boolean).map((part) => parseTomlString(part));
}
function assignNestedValue(target, path, value) {
  let cursor = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    const current = cursor[segment];
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }
  cursor[path[path.length - 1]] = value;
}
function parseLooseTomlObject(source) {
  const result = {};
  let currentTablePath = [];
  for (const rawLine of source.split(/\r?\n/)) {
    const line = stripTomlComment(rawLine);
    if (!line) {
      continue;
    }
    if (line.startsWith("[[") && line.endsWith("]]")) {
      throw new Error("Array-of-table syntax is not supported in custom params yet.");
    }
    if (line.startsWith("[") && line.endsWith("]")) {
      currentTablePath = splitTomlKeyPath(line.slice(1, -1));
      continue;
    }
    const equalIndex = line.indexOf("=");
    if (equalIndex === -1) {
      throw new Error(`Invalid TOML line: ${rawLine}`);
    }
    const keyPath = splitTomlKeyPath(line.slice(0, equalIndex));
    if (keyPath.length === 0) {
      throw new Error(`Invalid TOML key: ${rawLine}`);
    }
    assignNestedValue(result, [...currentTablePath, ...keyPath], parseTomlValue(line.slice(equalIndex + 1)));
  }
  return result;
}

// src/training/trainingPayloadConstants.ts
var PATH_PARAMS = [
  "pretrained_model_name_or_path",
  "train_data_dir",
  "reg_data_dir",
  "output_dir",
  "network_weights",
  "conditioning_data_dir",
  "controlnet_model_name_or_path",
  "weights",
  "vae",
  "text_encoder",
  "byt5",
  "qwen3",
  "llm_adapter_path",
  "t5_tokenizer_path",
  "ae",
  "clip_l",
  "clip_g",
  "t5xxl",
  "gemma2"
];
var FLOAT_PARAMS = [
  "learning_rate",
  "unet_lr",
  "text_encoder_lr",
  "learning_rate_te",
  "learning_rate_te1",
  "learning_rate_te2",
  "learning_rate_te3",
  "sigmoid_scale",
  "guidance_scale",
  "training_shift",
  "control_net_lr",
  "self_attn_lr",
  "cross_attn_lr",
  "mlp_lr",
  "mod_lr",
  "llm_adapter_lr"
];
var NEED_DELETE_PARAMS = [
  "lycoris_algo",
  "conv_dim",
  "conv_alpha",
  "dropout",
  "dylora_unit",
  "lokr_factor",
  "train_norm",
  "down_lr_weight",
  "mid_lr_weight",
  "up_lr_weight",
  "block_lr_zero_threshold",
  "enable_block_weights",
  "enable_preview",
  "network_args_custom",
  "optimizer_args_custom",
  "enable_base_weight",
  "prodigy_d0",
  "prodigy_d_coef",
  "ui_custom_params"
];
var TEST_NONE_PARAMS = [
  "vae",
  "reg_data_dir",
  "network_weights",
  "conditioning_data_dir",
  "controlnet_model_name_or_path",
  "weights",
  "init_word",
  "text_encoder",
  "byt5",
  "qwen3",
  "llm_adapter_path",
  "t5_tokenizer_path",
  "ae",
  "clip_l",
  "clip_g",
  "t5xxl",
  "gemma2",
  "noise_offset",
  "multires_noise_iterations",
  "multires_noise_discount",
  "caption_dropout_rate",
  "network_dropout",
  "scale_weight_norms",
  "gpu_ids"
];
var SD12_EXCLUSIVE_PARAMS = [
  "v2",
  "v_parameterization",
  "scale_v_pred_loss_like_noise_pred",
  "clip_skip",
  "learning_rate_te",
  "stop_text_encoder_training"
];
var SDXL_EXCLUSIVE_PARAMS = ["learning_rate_te1", "learning_rate_te2"];
var CONFLICT_PARAMS = [
  ["cache_text_encoder_outputs", "shuffle_caption"],
  ["noise_offset", "multires_noise_iterations"],
  ["cache_latents", "color_aug"],
  ["cache_latents", "random_crop"]
];
var NETWORK_ARG_REVERSE_MAP = {
  algo: "lycoris_algo",
  unit: "dylora_unit",
  factor: "lokr_factor"
};
var NETWORK_ARG_DIRECT_KEYS = /* @__PURE__ */ new Set([
  "conv_dim",
  "conv_alpha",
  "dropout",
  "down_lr_weight",
  "mid_lr_weight",
  "up_lr_weight",
  "block_lr_zero_threshold"
]);
var OPTIMIZER_ARG_IGNORED_KEYS = /* @__PURE__ */ new Set([
  "decouple",
  "weight_decay",
  "use_bias_correction",
  "safeguard_warmup"
]);
var ARRAY_TEXTAREA_KEYS = /* @__PURE__ */ new Set(["base_weights", "base_weights_multiplier"]);
var BASIC_LORA_DEFAULTS = {
  pretrained_model_name_or_path: "./sd-models/model.safetensors",
  train_data_dir: "./train/aki",
  resolution: "512,512",
  enable_bucket: true,
  min_bucket_reso: 256,
  max_bucket_reso: 1024,
  output_name: "aki",
  output_dir: "./output",
  save_model_as: "safetensors",
  save_every_n_epochs: 2,
  max_train_epochs: 10,
  train_batch_size: 1,
  network_train_unet_only: false,
  network_train_text_encoder_only: false,
  learning_rate: 1e-4,
  unet_lr: 1e-4,
  text_encoder_lr: 1e-5,
  lr_scheduler: "cosine_with_restarts",
  optimizer_type: "AdamW8bit",
  lr_scheduler_num_cycles: 1,
  network_module: "networks.lora",
  network_dim: 32,
  network_alpha: 32,
  logging_dir: "./logs",
  caption_extension: ".txt",
  shuffle_caption: true,
  keep_tokens: 0,
  max_token_length: 255,
  seed: 1337,
  prior_loss_weight: 1,
  clip_skip: 2,
  mixed_precision: "fp16",
  save_precision: "fp16",
  xformers: true,
  cache_latents: true,
  persistent_data_loader_workers: true
};

// src/training/trainingPayloadHelpers.ts
function cloneValues(values) {
  return JSON.parse(JSON.stringify(values ?? {}));
}
function normalizeLineList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  return String(value ?? "").split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
}
function hasOwn(payload, key) {
  return Object.prototype.hasOwnProperty.call(payload, key);
}
function isSdxlModel(payload) {
  return String(payload.model_train_type ?? "").startsWith("sdxl");
}
function isSd3Finetune(payload) {
  return String(payload.model_train_type ?? "") === "sd3-finetune";
}
function toStringValue(value) {
  return value === void 0 || value === null ? "" : String(value);
}
function normalizePath(value) {
  return toStringValue(value).replaceAll("\\", "/");
}
function toNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(toStringValue(value));
  return Number.isNaN(parsed) ? fallback : parsed;
}
function valueIsTruthy(value) {
  return Boolean(value);
}
function splitArgPair(source) {
  const separatorIndex = source.indexOf("=");
  if (separatorIndex === -1) {
    return {
      key: source.trim(),
      value: "",
      hasValue: false
    };
  }
  return {
    key: source.slice(0, separatorIndex).trim(),
    value: source.slice(separatorIndex + 1).trim(),
    hasValue: true
  };
}
function parseBooleanish(value) {
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = toStringValue(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

// src/training/trainingPayloadNormalize.ts
function normalizeTrainingPayload(rawValues, trainType = String(rawValues.model_train_type ?? "")) {
  const payload = trainType === "lora-basic" ? { ...BASIC_LORA_DEFAULTS, ...cloneValues(rawValues) } : cloneValues(rawValues);
  normalizeManagedSchedulerSelection(payload);
  const networkArgs = [];
  const optimizerArgs = [];
  const sdxlModel = isSdxlModel(payload);
  const sd3Finetune = isSd3Finetune(payload);
  if ((sdxlModel || sd3Finetune) && [
    payload.learning_rate_te1,
    payload.learning_rate_te2,
    payload.learning_rate_te3
  ].some(valueIsTruthy)) {
    payload.train_text_encoder = true;
  }
  const exclusiveKeys = sdxlModel ? SD12_EXCLUSIVE_PARAMS.filter((key) => key !== "clip_skip") : sd3Finetune ? SD12_EXCLUSIVE_PARAMS : SDXL_EXCLUSIVE_PARAMS;
  for (const key of exclusiveKeys) {
    if (hasOwn(payload, key)) {
      delete payload[key];
    }
  }
  if (payload.network_module === "lycoris.kohya") {
    networkArgs.push(
      `conv_dim=${toStringValue(payload.conv_dim)}`,
      `conv_alpha=${toStringValue(payload.conv_alpha)}`,
      `dropout=${toStringValue(payload.dropout)}`,
      `algo=${toStringValue(payload.lycoris_algo)}`
    );
    if (valueIsTruthy(payload.lokr_factor)) {
      networkArgs.push(`factor=${toStringValue(payload.lokr_factor)}`);
    }
    if (valueIsTruthy(payload.train_norm)) {
      networkArgs.push("train_norm=True");
    }
  } else if (payload.network_module === "networks.dylora") {
    networkArgs.push(`unit=${toStringValue(payload.dylora_unit)}`);
  }
  const optimizerType = toStringValue(payload.optimizer_type);
  const optimizerTypeLower = optimizerType.toLowerCase();
  if (optimizerTypeLower.startsWith("dada")) {
    if (optimizerType === "DAdaptation" || optimizerType === "DAdaptAdam") {
      optimizerArgs.push("decouple=True", "weight_decay=0.01");
    }
    payload.learning_rate = 1;
    payload.unet_lr = 1;
    payload.text_encoder_lr = 1;
  } else if (optimizerTypeLower === "prodigy") {
    optimizerArgs.push(
      "decouple=True",
      "weight_decay=0.01",
      "use_bias_correction=True",
      `d_coef=${toStringValue(payload.prodigy_d_coef)}`
    );
    if (valueIsTruthy(payload.lr_warmup_steps)) {
      optimizerArgs.push("safeguard_warmup=True");
    }
    if (valueIsTruthy(payload.prodigy_d0)) {
      optimizerArgs.push(`d0=${toStringValue(payload.prodigy_d0)}`);
    }
  }
  if (valueIsTruthy(payload.enable_block_weights)) {
    networkArgs.push(
      `down_lr_weight=${toStringValue(payload.down_lr_weight)}`,
      `mid_lr_weight=${toStringValue(payload.mid_lr_weight)}`,
      `up_lr_weight=${toStringValue(payload.up_lr_weight)}`,
      `block_lr_zero_threshold=${toStringValue(payload.block_lr_zero_threshold)}`
    );
    delete payload.block_lr_zero_threshold;
  }
  if (valueIsTruthy(payload.enable_base_weight)) {
    payload.base_weights = normalizeLineList(payload.base_weights);
    payload.base_weights_multiplier = normalizeLineList(payload.base_weights_multiplier).map((entry) => toNumber(entry));
  } else {
    delete payload.base_weights;
    delete payload.base_weights_multiplier;
  }
  for (const customArg of normalizeLineList(payload.network_args_custom)) {
    networkArgs.push(customArg);
  }
  for (const customArg of normalizeLineList(payload.optimizer_args_custom)) {
    optimizerArgs.push(customArg);
  }
  if (!valueIsTruthy(payload.enable_preview)) {
    delete payload.sample_prompts;
    delete payload.sample_sampler;
    delete payload.sample_every_n_epochs;
  }
  for (const key of FLOAT_PARAMS) {
    if (hasOwn(payload, key)) {
      payload[key] = toNumber(payload[key]);
    }
  }
  for (const key of TEST_NONE_PARAMS) {
    if (!hasOwn(payload, key)) {
      continue;
    }
    const value = payload[key];
    if (value === 0 || value === "" || Array.isArray(value) && value.length === 0) {
      delete payload[key];
    }
  }
  for (const key of PATH_PARAMS) {
    if (hasOwn(payload, key) && payload[key]) {
      payload[key] = normalizePath(payload[key]);
    }
  }
  if (networkArgs.length > 0) {
    payload.network_args = networkArgs;
  } else {
    delete payload.network_args;
  }
  if (optimizerArgs.length > 0) {
    payload.optimizer_args = optimizerArgs;
  } else {
    delete payload.optimizer_args;
  }
  if (valueIsTruthy(payload.ui_custom_params)) {
    const customParams = parseLooseTomlObject(toStringValue(payload.ui_custom_params));
    Object.assign(payload, customParams);
  }
  for (const key of NEED_DELETE_PARAMS) {
    if (hasOwn(payload, key)) {
      delete payload[key];
    }
  }
  if (Array.isArray(payload.gpu_ids)) {
    payload.gpu_ids = payload.gpu_ids.map((entry) => {
      const value = toStringValue(entry);
      const match = value.match(/GPU\s+(\d+):/);
      return match ? match[1] : value;
    });
  }
  return payload;
}

// src/training/trainingPayloadChecks.ts
function checkTrainingPayload(payload) {
  const warnings = [];
  const errors = [];
  const optimizerType = toStringValue(payload.optimizer_type);
  const optimizerTypeLower = optimizerType.toLowerCase();
  const modelTrainType = toStringValue(payload.model_train_type);
  const modelType = toStringValue(payload.model_type).trim().toLowerCase();
  const conditioningDataDir = toStringValue(payload.conditioning_data_dir).trim();
  const regDataDir = toStringValue(payload.reg_data_dir).trim();
  const attnMode = toStringValue(payload.attn_mode).trim().toLowerCase();
  const cacheTextEncoderOutputs = valueIsTruthy(payload.cache_text_encoder_outputs);
  const trainTextEncoderLoRA = !valueIsTruthy(payload.network_train_unet_only);
  const sdxlTraining = modelTrainType.startsWith("sdxl");
  const sd3Finetune = modelTrainType === "sd3-finetune";
  const sd3LoraTraining = modelTrainType === "sd3-lora";
  const fluxLoraTraining = modelTrainType === "flux-lora";
  const animaTraining = modelTrainType === "anima-lora" || modelTrainType === "anima-finetune";
  const hunyuanImageTraining = modelTrainType === "hunyuan-image-lora";
  const controlnetTraining = modelTrainType.includes("controlnet");
  const textEncoderCacheConstrainedTraining = sdxlTraining || sd3LoraTraining || fluxLoraTraining || animaTraining || hunyuanImageTraining;
  const nonAnimaCachedTextEncoderTraining = sdxlTraining || sd3LoraTraining || fluxLoraTraining || hunyuanImageTraining;
  if (optimizerType.startsWith("DAdapt") && payload.lr_scheduler !== "constant") {
    warnings.push("DAdaptation works best with lr_scheduler set to constant.");
  }
  if (optimizerTypeLower.startsWith("prodigy") && (hasOwn(payload, "unet_lr") || hasOwn(payload, "text_encoder_lr")) && (toNumber(payload.unet_lr, 1) !== 1 || toNumber(payload.text_encoder_lr, 1) !== 1)) {
    warnings.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1.");
  }
  if (payload.network_module === "networks.oft" && modelTrainType !== "sdxl-lora") {
    errors.push("OFT is currently only supported for SDXL LoRA.");
  }
  if (valueIsTruthy(payload.network_train_unet_only) && valueIsTruthy(payload.network_train_text_encoder_only)) {
    errors.push("network_train_unet_only and network_train_text_encoder_only cannot be enabled at the same time.");
  }
  if (sd3Finetune && valueIsTruthy(payload.train_text_encoder) && valueIsTruthy(payload.cache_text_encoder_outputs) && !valueIsTruthy(payload.use_t5xxl_cache_only)) {
    errors.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled.");
  }
  if (sd3Finetune && valueIsTruthy(payload.train_t5xxl) && !valueIsTruthy(payload.train_text_encoder)) {
    errors.push("train_t5xxl requires train_text_encoder to be enabled first.");
  }
  if (sd3Finetune && valueIsTruthy(payload.train_t5xxl) && valueIsTruthy(payload.cache_text_encoder_outputs)) {
    errors.push("train_t5xxl cannot be combined with cache_text_encoder_outputs.");
  }
  if (animaTraining && valueIsTruthy(payload.unsloth_offload_checkpointing) && valueIsTruthy(payload.cpu_offload_checkpointing)) {
    errors.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing.");
  }
  if (animaTraining && valueIsTruthy(payload.unsloth_offload_checkpointing) && valueIsTruthy(payload.blocks_to_swap)) {
    errors.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap.");
  }
  if (controlnetTraining && conditioningDataDir.length === 0) {
    errors.push("conditioning_data_dir is required for ControlNet training routes.");
  }
  if (controlnetTraining && regDataDir.length > 0) {
    warnings.push("reg_data_dir is usually ignored for ControlNet training routes. Use conditioning_data_dir pairs instead.");
  }
  if (controlnetTraining && hasOwn(payload, "prior_loss_weight")) {
    warnings.push("prior_loss_weight is not normally used by ControlNet training routes.");
  }
  if (regDataDir.length > 0 && toNumber(payload.prior_loss_weight, 1) <= 0) {
    warnings.push("reg_data_dir is set, but prior_loss_weight is 0 or lower, so regularization images may have no effect.");
  }
  if (valueIsTruthy(payload.cache_text_encoder_outputs_to_disk) && !valueIsTruthy(payload.cache_text_encoder_outputs)) {
    warnings.push("cache_text_encoder_outputs_to_disk will force cache_text_encoder_outputs on during training.");
  }
  if (fluxLoraTraining && modelType === "chroma" && !valueIsTruthy(payload.apply_t5_attn_mask)) {
    errors.push("FLUX Chroma requires apply_t5_attn_mask to stay enabled.");
  }
  if (textEncoderCacheConstrainedTraining && cacheTextEncoderOutputs && trainTextEncoderLoRA) {
    errors.push("cache_text_encoder_outputs cannot be combined with Text Encoder LoRA training on this route. Enable network_train_unet_only instead.");
  }
  if (nonAnimaCachedTextEncoderTraining && cacheTextEncoderOutputs && toNumber(payload.caption_dropout_rate, 0) > 0) {
    errors.push("cache_text_encoder_outputs cannot be combined with caption_dropout_rate on this route.");
  }
  if (textEncoderCacheConstrainedTraining && cacheTextEncoderOutputs && (valueIsTruthy(payload.shuffle_caption) || toNumber(payload.caption_tag_dropout_rate, 0) > 0 || toNumber(payload.token_warmup_step, 0) > 0)) {
    errors.push("cache_text_encoder_outputs cannot be combined with shuffle_caption, caption_tag_dropout_rate, or token_warmup_step on this route.");
  }
  if ((fluxLoraTraining || sd3LoraTraining) && cacheTextEncoderOutputs && valueIsTruthy(payload.train_t5xxl)) {
    errors.push("train_t5xxl cannot be combined with cache_text_encoder_outputs on this route.");
  }
  if (hunyuanImageTraining && !valueIsTruthy(payload.network_train_unet_only)) {
    errors.push("Hunyuan Image LoRA currently requires network_train_unet_only.");
  }
  if (sdxlTraining && !valueIsTruthy(payload.network_train_unet_only) && !valueIsTruthy(payload.network_train_text_encoder_only)) {
    warnings.push("SDXL LoRA usually behaves best with network_train_unet_only enabled unless you explicitly want Text Encoder LoRA training.");
  }
  if ((animaTraining || hunyuanImageTraining) && attnMode === "sageattn") {
    errors.push("sageattn is inference-only for this trainer and should not be selected for training.");
  }
  if ((animaTraining || hunyuanImageTraining) && attnMode === "xformers" && !valueIsTruthy(payload.split_attn)) {
    errors.push("attn_mode=xformers requires split_attn for this trainer.");
  }
  if (attnMode && (valueIsTruthy(payload.xformers) || valueIsTruthy(payload.sdpa))) {
    warnings.push("attn_mode is set, so the plain xformers/sdpa toggles may be ignored by this trainer.");
  }
  if (valueIsTruthy(payload.masked_loss) && !valueIsTruthy(payload.alpha_mask) && !valueIsTruthy(payload.conditioning_data_dir)) {
    warnings.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op.");
  }
  if (sdxlTraining && valueIsTruthy(payload.clip_skip)) {
    warnings.push("SDXL clip_skip in this build is experimental. Use the same clip-skip behavior at inference time if you rely on it.");
  }
  for (const [left, right] of CONFLICT_PARAMS) {
    if (valueIsTruthy(payload[left]) && valueIsTruthy(payload[right])) {
      errors.push(`Parameters ${left} and ${right} conflict. Please enable only one of them.`);
    }
  }
  return { warnings, errors };
}

// src/training/trainingPayloadExpand.ts
function expandTrainingPayloadToEditableValues(rawPayload) {
  const payload = cloneValues(rawPayload);
  restoreManagedSchedulerSelection(payload);
  if (Array.isArray(payload.network_args)) {
    const networkArgsCustom = [];
    for (const entry of payload.network_args) {
      const { key, value, hasValue } = splitArgPair(toStringValue(entry));
      if (key === "train_norm") {
        payload.train_norm = hasValue ? parseBooleanish(value) : true;
        continue;
      }
      if (key === "down_lr_weight" || key === "mid_lr_weight" || key === "up_lr_weight" || key === "block_lr_zero_threshold") {
        payload.enable_block_weights = true;
      }
      if (NETWORK_ARG_DIRECT_KEYS.has(key)) {
        payload[key] = value;
        continue;
      }
      if (NETWORK_ARG_REVERSE_MAP[key]) {
        payload[NETWORK_ARG_REVERSE_MAP[key]] = value;
        continue;
      }
      networkArgsCustom.push(toStringValue(entry));
    }
    if (networkArgsCustom.length > 0) {
      payload.network_args_custom = networkArgsCustom;
    }
    delete payload.network_args;
  }
  if (Array.isArray(payload.optimizer_args)) {
    const optimizerArgsCustom = [];
    for (const entry of payload.optimizer_args) {
      const { key, value } = splitArgPair(toStringValue(entry));
      if (key === "d_coef") {
        payload.prodigy_d_coef = value;
        continue;
      }
      if (key === "d0") {
        payload.prodigy_d0 = value;
        continue;
      }
      if (OPTIMIZER_ARG_IGNORED_KEYS.has(key)) {
        continue;
      }
      optimizerArgsCustom.push(toStringValue(entry));
    }
    if (optimizerArgsCustom.length > 0) {
      payload.optimizer_args_custom = optimizerArgsCustom;
    }
    delete payload.optimizer_args;
  }
  for (const key of ARRAY_TEXTAREA_KEYS) {
    if (Array.isArray(payload[key])) {
      payload[key] = payload[key].map((entry) => toStringValue(entry)).join("\n");
      if (key === "base_weights") {
        payload.enable_base_weight = true;
      }
      if (key === "base_weights_multiplier") {
        payload.enable_base_weight = true;
      }
    }
  }
  if (Array.isArray(payload.gpu_ids)) {
    payload.gpu_ids = payload.gpu_ids.map((entry) => toStringValue(entry));
  }
  return payload;
}

// src/training/trainingRouteConfig.ts
var trainingRouteConfigs = {
  "sdxl-train": {
    routeId: "sdxl-train",
    schemaName: "sdxl-lora",
    prefix: "sdxl",
    modelLabel: "SDXL",
    presetTrainTypes: ["sdxl-lora"]
  },
  "flux-train": {
    routeId: "flux-train",
    schemaName: "flux-lora",
    prefix: "flux",
    modelLabel: "Flux",
    presetTrainTypes: ["flux-lora"]
  },
  "sd3-train": {
    routeId: "sd3-train",
    schemaName: "sd3-lora",
    prefix: "sd3",
    modelLabel: "SD3",
    presetTrainTypes: ["sd3-lora"]
  },
  "sd3-finetune-train": {
    routeId: "sd3-finetune-train",
    schemaName: "sd3-finetune",
    prefix: "sd3-finetune",
    modelLabel: "SD3 Finetune",
    presetTrainTypes: ["sd3-finetune"]
  },
  "dreambooth-train": {
    routeId: "dreambooth-train",
    schemaName: "dreambooth",
    prefix: "dreambooth",
    modelLabel: "Dreambooth",
    presetTrainTypes: ["dreambooth", "sd-dreambooth", "sdxl-finetune"]
  },
  "flux-finetune-train": {
    routeId: "flux-finetune-train",
    schemaName: "flux-finetune",
    prefix: "flux-finetune",
    modelLabel: "Flux Finetune",
    presetTrainTypes: ["flux-finetune"]
  },
  "sd-controlnet-train": {
    routeId: "sd-controlnet-train",
    schemaName: "sd-controlnet",
    prefix: "sd-controlnet",
    modelLabel: "SD ControlNet",
    presetTrainTypes: ["sd-controlnet"]
  },
  "sdxl-controlnet-train": {
    routeId: "sdxl-controlnet-train",
    schemaName: "sdxl-controlnet",
    prefix: "sdxl-controlnet",
    modelLabel: "SDXL ControlNet",
    presetTrainTypes: ["sdxl-controlnet"]
  },
  "flux-controlnet-train": {
    routeId: "flux-controlnet-train",
    schemaName: "flux-controlnet",
    prefix: "flux-controlnet",
    modelLabel: "Flux ControlNet",
    presetTrainTypes: ["flux-controlnet"]
  },
  "sdxl-lllite-train": {
    routeId: "sdxl-lllite-train",
    schemaName: "sdxl-controlnet-lllite",
    prefix: "sdxl-lllite",
    modelLabel: "SDXL LLLite",
    presetTrainTypes: ["sdxl-controlnet-lllite"]
  },
  "sd-ti-train": {
    routeId: "sd-ti-train",
    schemaName: "sd-textual-inversion",
    prefix: "sd-ti",
    modelLabel: "SD Textual Inversion",
    presetTrainTypes: ["sd-textual-inversion"]
  },
  "xti-train": {
    routeId: "xti-train",
    schemaName: "sd-textual-inversion-xti",
    prefix: "xti",
    modelLabel: "SD XTI",
    presetTrainTypes: ["sd-textual-inversion-xti"]
  },
  "sdxl-ti-train": {
    routeId: "sdxl-ti-train",
    schemaName: "sdxl-textual-inversion",
    prefix: "sdxl-ti",
    modelLabel: "SDXL Textual Inversion",
    presetTrainTypes: ["sdxl-textual-inversion"]
  },
  "anima-train": {
    routeId: "anima-train",
    schemaName: "anima-lora",
    prefix: "anima",
    modelLabel: "Anima LoRA",
    presetTrainTypes: ["anima-lora"]
  },
  "anima-finetune-train": {
    routeId: "anima-finetune-train",
    schemaName: "anima-finetune",
    prefix: "anima-finetune",
    modelLabel: "Anima Finetune",
    presetTrainTypes: ["anima-finetune"]
  },
  "lumina-train": {
    routeId: "lumina-train",
    schemaName: "lumina-lora",
    prefix: "lumina",
    modelLabel: "Lumina LoRA",
    presetTrainTypes: ["lumina-lora"]
  },
  "lumina-finetune-train": {
    routeId: "lumina-finetune-train",
    schemaName: "lumina-finetune",
    prefix: "lumina-finetune",
    modelLabel: "Lumina Finetune",
    presetTrainTypes: ["lumina-finetune"]
  },
  "hunyuan-image-train": {
    routeId: "hunyuan-image-train",
    schemaName: "hunyuan-image-lora",
    prefix: "hunyuan-image",
    modelLabel: "Hunyuan Image LoRA",
    presetTrainTypes: ["hunyuan-image-lora"]
  }
};

// scripts/trainingRouteSmoke.ts
var smokeRouteCases = [
  { routeId: "sdxl-train", renderer: renderSdxlTrainPage },
  { routeId: "flux-train", renderer: renderFluxTrainPage },
  { routeId: "sd3-train", renderer: renderSd3TrainPage },
  { routeId: "sd3-finetune-train", renderer: renderSd3FinetuneTrainPage },
  { routeId: "dreambooth-train", renderer: renderDreamboothTrainPage },
  { routeId: "sdxl-controlnet-train", renderer: renderSdxlControlNetTrainPage },
  { routeId: "anima-train", renderer: renderAnimaTrainPage }
];
function expectIncludes(source, expected, label) {
  assert.ok(source.includes(expected), `${label} should include ${expected}`);
}
function runRouteMarkupSmoke() {
  for (const routeCase of smokeRouteCases) {
    const config = trainingRouteConfigs[routeCase.routeId];
    assert.ok(config, `Missing training route config for ${routeCase.routeId}`);
    const route = appRoutes.find((entry) => entry.id === routeCase.routeId);
    assert.ok(route, `Missing app route for ${routeCase.routeId}`);
    assert.equal(route?.hash, `#/${routeCase.routeId}`, `Unexpected route hash for ${routeCase.routeId}`);
    const html = routeCase.renderer();
    expectIncludes(html, `${config.prefix}-start-train`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-run-preflight`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-autosave-status`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-load-presets`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-clear-autosave`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-sections`, `${routeCase.routeId} page`);
    expectIncludes(html, `${config.prefix}-preview`, `${routeCase.routeId} page`);
  }
}
function runPayloadGuardSmoke() {
  const visibleOptimizers = getVisibleTrainingOptionEntries("optimizer");
  assert.ok(
    visibleOptimizers.some((entry) => entry.value === "pytorch_optimizer.Adan"),
    "Curated pytorch-optimizer entries should be visible by default"
  );
  const hiddenOptimizerChoices = buildTrainingOptionChoices("optimizer", ["AdamW", "AdamW8bit"], "pytorch_optimizer.Shampoo");
  assert.ok(
    hiddenOptimizerChoices.some((choice) => choice.value === "pytorch_optimizer.Shampoo"),
    "Hidden imported optimizer values should still be preserved in the selector"
  );
  const managedSchedulerEntry = getVisibleTrainingOptionEntries("scheduler").find(
    (entry) => entry.schedulerTypePath === "pytorch_optimizer.CosineAnnealingWarmupRestarts"
  );
  assert.ok(managedSchedulerEntry, "Expected a visible managed scheduler entry for pytorch-optimizer");
  const managedSchedulerNormalized = normalizeTrainingPayload({
    model_train_type: "sdxl-lora",
    lr_scheduler: managedSchedulerEntry?.value,
    optimizer_type: "AdamW8bit"
  });
  assert.equal(
    managedSchedulerNormalized.lr_scheduler_type,
    "pytorch_optimizer.CosineAnnealingWarmupRestarts",
    "Managed scheduler entries should map into lr_scheduler_type"
  );
  assert.equal(
    managedSchedulerNormalized.lr_scheduler,
    "constant",
    "Managed scheduler entries should leave a safe builtin lr_scheduler fallback behind"
  );
  const managedSchedulerExpanded = expandTrainingPayloadToEditableValues({
    lr_scheduler: "constant",
    lr_scheduler_type: "pytorch_optimizer.CosineAnnealingWarmupRestarts"
  });
  assert.equal(
    managedSchedulerExpanded.lr_scheduler,
    managedSchedulerEntry?.value,
    "Imported custom scheduler payloads should round-trip back into the managed selector value"
  );
  const sdxlNormalized = normalizeTrainingPayload({
    model_train_type: "sdxl-lora",
    clip_skip: 2,
    optimizer_type: "AdamW8bit"
  });
  assert.equal(sdxlNormalized.clip_skip, 2, "SDXL clip_skip should survive normalization in this build");
  assert.ok(
    checkTrainingPayload(sdxlNormalized).warnings.some((item) => item.includes("SDXL clip_skip")),
    "SDXL clip_skip should produce an experimental warning"
  );
  const sd3FinetuneNormalized = normalizeTrainingPayload({
    model_train_type: "sd3-finetune",
    clip_skip: 2,
    optimizer_type: "AdamW8bit"
  });
  assert.equal("clip_skip" in sd3FinetuneNormalized, false, "SD3 finetune should still drop clip_skip during normalization");
  const controlnetChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-controlnet",
      conditioning_data_dir: "",
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    controlnetChecks.errors.some((item) => item.includes("conditioning_data_dir")),
    "ControlNet smoke case should fail without conditioning_data_dir"
  );
  const controlnetWarningChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-controlnet",
      conditioning_data_dir: "./conditioning",
      reg_data_dir: "./reg",
      prior_loss_weight: 1,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    controlnetWarningChecks.warnings.some((item) => item.includes("reg_data_dir is usually ignored")),
    "ControlNet smoke case should warn about reg_data_dir"
  );
  const sd3FinetuneChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sd3-finetune",
      train_text_encoder: true,
      cache_text_encoder_outputs: true,
      train_t5xxl: true,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(sd3FinetuneChecks.errors.length >= 2, "SD3 finetune invalid text-encoder mix should surface hard errors");
  const animaXformersChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "anima-lora",
      attn_mode: "xformers",
      split_attn: false,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    animaXformersChecks.errors.some((item) => item.includes("split_attn")),
    "Anima xformers smoke case should require split_attn"
  );
  const animaCacheChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "anima-lora",
      cache_text_encoder_outputs: true,
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    animaCacheChecks.errors.some((item) => item.includes("Text Encoder LoRA training")),
    "Anima cache smoke case should fail when Text Encoder LoRA training is still enabled"
  );
  const animaSageChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "anima-lora",
      attn_mode: "sageattn",
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    animaSageChecks.errors.some((item) => item.includes("inference-only")),
    "Anima sageattn smoke case should fail"
  );
  const hunyuanXformersChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "hunyuan-image-lora",
      attn_mode: "xformers",
      split_attn: false,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    hunyuanXformersChecks.errors.some((item) => item.includes("split_attn")),
    "Hunyuan Image xformers smoke case should require split_attn"
  );
  const hunyuanUnetOnlyChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "hunyuan-image-lora",
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    hunyuanUnetOnlyChecks.errors.some((item) => item.includes("requires network_train_unet_only")),
    "Hunyuan Image smoke case should require network_train_unet_only"
  );
  const fluxCacheChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "flux-lora",
      cache_text_encoder_outputs: true,
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    fluxCacheChecks.errors.some((item) => item.includes("Text Encoder LoRA training")),
    "Flux cache smoke case should fail when Text Encoder LoRA training is still enabled"
  );
  const fluxT5Checks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "flux-lora",
      cache_text_encoder_outputs: true,
      train_t5xxl: true,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    fluxT5Checks.errors.some((item) => item.includes("train_t5xxl")),
    "Flux smoke case should fail when train_t5xxl is combined with cache_text_encoder_outputs"
  );
  const fluxChromaChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "flux-lora",
      model_type: "chroma",
      apply_t5_attn_mask: false,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    fluxChromaChecks.errors.some((item) => item.includes("apply_t5_attn_mask")),
    "Flux Chroma smoke case should require apply_t5_attn_mask"
  );
  const sdxlCacheChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-lora",
      cache_text_encoder_outputs: true,
      network_train_unet_only: false,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    sdxlCacheChecks.errors.some((item) => item.includes("Text Encoder LoRA training")),
    "SDXL cache smoke case should fail when Text Encoder LoRA training is still enabled"
  );
  const sdxlCaptionDropChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "sdxl-lora",
      cache_text_encoder_outputs: true,
      caption_dropout_rate: 0.2,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    sdxlCaptionDropChecks.errors.some((item) => item.includes("caption_dropout_rate")),
    "SDXL cache smoke case should fail when caption_dropout_rate is enabled"
  );
  const hunyuanCaptionDropChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "hunyuan-image-lora",
      cache_text_encoder_outputs: true,
      caption_dropout_rate: 0.2,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    hunyuanCaptionDropChecks.errors.some((item) => item.includes("caption_dropout_rate")),
    "Hunyuan Image cache smoke case should fail when caption_dropout_rate is enabled"
  );
  const mixedTargetChecks = checkTrainingPayload(
    normalizeTrainingPayload({
      model_train_type: "dreambooth",
      network_train_unet_only: true,
      network_train_text_encoder_only: true,
      optimizer_type: "AdamW8bit"
    })
  );
  assert.ok(
    mixedTargetChecks.errors.some((item) => item.includes("network_train_unet_only")),
    "Mutually exclusive train-target flags should fail"
  );
}
function main() {
  runRouteMarkupSmoke();
  runPayloadGuardSmoke();
  console.log(`[smoke:training] ${smokeRouteCases.length} route markup cases and payload guard checks passed.`);
}
main();
