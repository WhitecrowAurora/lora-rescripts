import { createInfoCard, createPageHero } from "../renderers/render";
import { runtimeUrl } from "../shared/runtime";

export function renderAboutPage() {
  return `
    ${createPageHero(
      "about",
      "A clean source-side replacement for the current about page",
      "This page is one of the safest migration targets because it is mostly branding, release context and ownership notes."
    )}
    <section class="two-column">
      ${createInfoCard(
        "Project identity",
        `
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,
        "brand"
      )}
      ${createInfoCard(
        "Why migrate this page first",
        `
          <p>It lets us establish the new source-side design system without risking training logic.</p>
          <p>It is also where release notes, maintainer links and project positioning can become readable source instead of hashed text chunks.</p>
        `,
        "migration"
      )}
    </section>
    <section class="panel prose-panel">
      <h3>Recommended source-side content blocks</h3>
      <p>The future rebuilt About page should eventually hold:</p>
      <ul>
        <li>project branding and maintainer links</li>
        <li>fork lineage and compatibility expectations</li>
        <li>release notes for v1.0.2 and later</li>
        <li>known runtime constraints such as separate tag-editor Python support</li>
      </ul>
      <p><a class="text-link" href="${runtimeUrl("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `;
}
