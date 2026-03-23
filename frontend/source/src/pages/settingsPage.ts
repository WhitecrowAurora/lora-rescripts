import { createPageHero } from "../renderers/render";
import { runtimeUrl } from "../shared/runtime";

export function renderSettingsPage() {
  return `
    ${createPageHero(
      "settings",
      "Settings and Training Catalog Controls",
      "Tune what the rebuilt source-side trainer surfaces by default, including curated optimizer and scheduler visibility."
    )}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">config summary</p>
        <h3 id="settings-summary-title">Loading config summary...</h3>
        <div id="settings-summary-body">Checking /api/config/summary</div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">saved params</p>
        <h3 id="settings-params-title">Loading saved params...</h3>
        <div id="settings-params-body">Checking /api/config/saved_params</div>
      </article>
    </section>
    <section class="panel prose-panel settings-callout">
      <h3>Training option visibility</h3>
      <p>
        The source-side training forms can now expose a curated set of optimizers and schedulers by default.
        Hidden items stay available in Settings so you can turn them back on without touching schema files.
      </p>
      <p>
        External scheduler selections are bridged into <code>lr_scheduler_type</code> automatically.
        External optimizer selections still require the matching Python package in the active environment.
      </p>
      <p><a class="text-link" href="${runtimeUrl("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
    <section class="panel info-card">
      <p class="panel-kicker">runtime packages</p>
      <h3 id="settings-runtime-title">Loading runtime dependency status...</h3>
      <div id="settings-runtime-body">Checking /api/graphic_cards</div>
    </section>
    <section class="two-column settings-option-sections">
      <article class="panel info-card">
        <p class="panel-kicker">optimizer catalog</p>
        <h3 id="settings-optimizer-title">Loading optimizer visibility...</h3>
        <div id="settings-optimizer-body">Preparing optimizer registry</div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">scheduler catalog</p>
        <h3 id="settings-scheduler-title">Loading scheduler visibility...</h3>
        <div id="settings-scheduler-body">Preparing scheduler registry</div>
      </article>
    </section>
  `;
}
