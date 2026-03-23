import { apiInventory } from "../services/apiInventory";
import { routeInventory } from "../routing/routeInventory";
import { createInfoCard, createPageHero } from "../renderers/render";

export function renderWorkspacePage() {
  const routeCards = routeInventory
    .map(
      (route) => `
        <article class="panel route-card" data-status="${route.status}">
          <div class="panel-kicker">${route.section}</div>
          <h3>${route.title}</h3>
          <p class="route-path">${route.route}</p>
          <p>${route.notes}</p>
          ${
            route.schemaHints && route.schemaHints.length > 0
              ? `<p class="schema-linkline">Schema hints: ${route.schemaHints.map((name) => `<code>${name}</code>`).join(", ")}</p>`
              : ""
          }
          <div class="pill-row">
            <span class="pill ${route.status === "migrate-first" ? "pill-hot" : "pill-cool"}">${route.status}</span>
          </div>
        </article>
      `
    )
    .join("");

  const apiRows = apiInventory
    .map(
      (api) => `
        <tr>
          <td><span class="method method-${api.method.toLowerCase()}">${api.method}</span></td>
          <td><code>${api.path}</code></td>
          <td>${api.purpose}</td>
          <td>${api.migrationPriority}</td>
        </tr>
      `
    )
    .join("");

  return `
    ${createPageHero(
      "workspace",
      "Source migration dashboard",
      "This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks."
    )}

    <section class="section-head">
      <div>
        <p class="eyebrow">Live bridge</p>
        <h2>Backend diagnostics</h2>
      </div>
      <p class="section-note">
        These cards talk to the current FastAPI backend through proxied <code>/api</code> requests.
      </p>
    </section>
    <section class="diagnostic-grid">
      <article class="panel diagnostic-card">
        <div class="panel-kicker">schemas</div>
        <h3 id="diag-schemas-title">Loading schema hashes...</h3>
        <p id="diag-schemas-detail">Checking /api/schemas/hashes</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">presets</div>
        <h3 id="diag-presets-title">Loading presets...</h3>
        <p id="diag-presets-detail">Checking /api/presets</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">tasks</div>
        <h3 id="diag-tasks-title">Loading task manager...</h3>
        <p id="diag-tasks-detail">Checking /api/tasks</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">gpu</div>
        <h3 id="diag-gpu-title">Loading graphic cards...</h3>
        <p id="diag-gpu-detail">Checking /api/graphic_cards</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">tag editor</div>
        <h3 id="diag-tageditor-title">Loading tag editor status...</h3>
        <p id="diag-tageditor-detail">Checking /api/tageditor_status</p>
      </article>
    </section>

    <section class="panel callout">
      <h2>Phase 1 migration order</h2>
      <p>
        Low-risk first: <code>about</code>, <code>settings</code>, <code>tasks</code>,
        <code>tageditor</code>, <code>tensorboard</code>, <code>tools</code>.
      </p>
      <p>
        Harder later: schema-heavy training forms like <code>lora/sdxl.html</code>,
        <code>lora/flux.html</code> and <code>dreambooth/index.html</code>.
      </p>
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Training catalog</p>
        <h2>Source-side trainer coverage</h2>
      </div>
      <p class="section-note">
        This catalog tracks which trainer families already have source-side routes, schema coverage and preset coverage.
      </p>
    </section>
    <section class="panel coverage-panel">
      <div id="training-catalog" class="coverage-list loading">Preparing training route catalog...</div>
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Route inventory</p>
        <h2>Current UI surfaces</h2>
      </div>
      <p class="section-note">
        These records are the first source-controlled migration map, rather than hidden inside hashed JS.
      </p>
    </section>
    <section class="route-grid">
      ${routeCards}
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">API inventory</p>
        <h2>Backend contracts we need to preserve</h2>
      </div>
      <p class="section-note">
        The future frontend should stay schema-driven instead of hardcoding training forms wherever possible.
      </p>
    </section>
    <section class="panel api-panel">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Purpose</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${apiRows}
        </tbody>
      </table>
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Schema browser</p>
        <h2>Current form source inventory</h2>
      </div>
      <p class="section-note">
        These are the backend schema files that the legacy frontend currently turns into training forms.
      </p>
    </section>
    <section class="panel schema-panel">
      <div id="schema-browser" class="schema-browser loading">Loading schema inventory...</div>
    </section>
    <section class="panel coverage-panel">
      <div class="coverage-columns">
        <div>
          <p class="panel-kicker">mapped schema hints</p>
          <div id="schema-mapped" class="coverage-list loading">Waiting for schema inventory...</div>
        </div>
        <div>
          <p class="panel-kicker">unmapped schema names</p>
          <div id="schema-unmapped" class="coverage-list loading">Waiting for schema inventory...</div>
        </div>
      </div>
    </section>
  `;
}
