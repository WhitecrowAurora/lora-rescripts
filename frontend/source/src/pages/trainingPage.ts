import { createPageHero } from "../renderers/render";
import { runtimeUrl } from "../shared/runtime";

export type TrainingPageConfig = {
  prefix: string;
  heroKicker: string;
  heroTitle: string;
  heroLede: string;
  runnerTitle: string;
  startButtonLabel: string;
  legacyPath: string;
  legacyLabel: string;
  renderedTitle: string;
  routeNotice?: {
    kicker: string;
    title: string;
    detail: string;
  };
};

export function renderTrainingPage(config: TrainingPageConfig) {
  return `
    ${createPageHero(config.heroKicker, config.heroTitle, config.heroLede)}
    ${
      config.routeNotice
        ? `
          <section class="panel info-card training-route-notice">
            <p class="panel-kicker">${config.routeNotice.kicker}</p>
            <h3>${config.routeNotice.title}</h3>
            <p>${config.routeNotice.detail}</p>
          </section>
        `
        : ""
    }
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
