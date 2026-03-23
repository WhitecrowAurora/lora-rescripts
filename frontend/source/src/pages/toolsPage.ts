import { createPageHero } from "../renderers/render";
import { runtimeUrl } from "../shared/runtime";

export function renderToolsPage() {
  return `
    ${createPageHero(
      "tools",
      "Tools workspace",
      "This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder."
    )}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">scripts</p>
        <h3 id="tools-summary-title">Loading tool scripts...</h3>
        <div id="tools-summary-body">Checking /api/scripts</div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">launcher</p>
        <h3>Current backend contract</h3>
        <div>
          <p>Tools are launched through <code>POST /api/run_script</code>.</p>
          <p>The backend already validates script names and resolves them from <code>scripts/stable</code> or <code>scripts/dev</code>.</p>
        </div>
      </article>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">dataset</p>
          <h2>Dataset analyzer</h2>
          <p class="section-note">Scan a training folder before launch and surface missing captions, folder coverage, top tags, resolution mix, and alpha-capable image candidates for masked-loss workflows.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Dataset folder</span>
          <div class="tool-inline-actions">
            <input id="dataset-analysis-path" class="field-input" type="text" placeholder="Select a dataset folder" />
            <button id="dataset-analysis-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="dataset-analysis-run" class="action-button" type="button">Analyze</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Caption extension</span>
          <input id="dataset-analysis-caption-extension" class="field-input" type="text" value=".txt" />
        </label>
        <label class="tool-field">
          <span>Top tags</span>
          <input id="dataset-analysis-top-tags" class="field-input" type="number" value="40" min="1" max="200" step="1" />
        </label>
        <label class="tool-field">
          <span>Sample paths</span>
          <input id="dataset-analysis-sample-limit" class="field-input" type="number" value="8" min="1" max="50" step="1" />
        </label>
      </div>
      <p id="dataset-analysis-status" class="section-note">Ready to scan a training folder.</p>
      <div id="dataset-analysis-results" class="dataset-analysis-empty">
        Pick a folder to preview image count, caption coverage, repeat-weighted size, tag frequency, alpha-capable image candidates, and a few problem samples.
      </div>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">alpha</p>
          <h2>Masked loss assistant</h2>
          <p class="section-note">Inspect whether your dataset actually contains usable alpha masks, and get concrete guidance on when to enable <code>alpha_mask</code> versus <code>masked_loss</code>.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Dataset folder</span>
          <div class="tool-inline-actions">
            <input id="masked-loss-audit-path" class="field-input" type="text" placeholder="Select a dataset folder to inspect alpha masks" />
            <button id="masked-loss-audit-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="masked-loss-audit-run" class="action-button" type="button">Inspect</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Sample paths</span>
          <input id="masked-loss-audit-sample-limit" class="field-input" type="number" value="8" min="1" max="50" step="1" />
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="masked-loss-audit-recursive" type="checkbox" checked /> Recursive scan subfolders</label>
      </div>
      <p id="masked-loss-audit-status" class="section-note">Check whether alpha-channel images in this dataset would really contribute to masked-loss training.</p>
      <div id="masked-loss-audit-results" class="dataset-analysis-empty">
        This audit looks past file extensions and checks whether images actually carry useful alpha values instead of fully opaque channels.
      </div>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">tagger</p>
          <h2>Batch auto tagging</h2>
          <p class="section-note">Run the built-in WD / CL taggers directly from the workspace for fast dataset bootstrapping before fine edits in the full tag editor.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Image folder</span>
          <div class="tool-inline-actions">
            <input id="batch-tagger-path" class="field-input" type="text" placeholder="Select an image folder for batch tagging" />
            <button id="batch-tagger-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="batch-tagger-run" class="action-button" type="button">Start tagging</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Model</span>
          <select id="batch-tagger-model" class="field-input">
            <option>Loading models...</option>
          </select>
        </label>
        <label class="tool-field">
          <span>Threshold</span>
          <input id="batch-tagger-threshold" class="field-input" type="number" value="0.35" min="0" max="1" step="0.01" />
        </label>
        <label class="tool-field">
          <span>Character threshold</span>
          <input id="batch-tagger-character-threshold" class="field-input" type="number" value="0.6" min="0" max="1" step="0.01" />
        </label>
        <label class="tool-field">
          <span>Existing caption files</span>
          <select id="batch-tagger-conflict" class="field-input">
            <option value="ignore" selected>Ignore existing</option>
            <option value="copy">Overwrite / copy</option>
            <option value="prepend">Prepend to existing</option>
          </select>
        </label>
        <label class="tool-field">
          <span>Additional tags</span>
          <input id="batch-tagger-additional-tags" class="field-input" type="text" placeholder="comma, separated, tags" />
        </label>
        <label class="tool-field">
          <span>Auto-backup snapshot name</span>
          <input id="batch-tagger-backup-name" class="field-input" type="text" placeholder="pre-batch-tagger" />
        </label>
        <label class="tool-field tool-field-wide">
          <span>Exclude tags</span>
          <input id="batch-tagger-exclude-tags" class="field-input" type="text" placeholder="tags to remove from the output" />
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="batch-tagger-recursive" type="checkbox" /> Recursive scan subfolders</label>
        <label class="tool-toggle"><input id="batch-tagger-replace-underscore" type="checkbox" checked /> Replace underscore with space</label>
        <label class="tool-toggle"><input id="batch-tagger-escape-tag" type="checkbox" checked /> Escape brackets in output tags</label>
        <label class="tool-toggle"><input id="batch-tagger-add-rating-tag" type="checkbox" /> Keep rating tags</label>
        <label class="tool-toggle"><input id="batch-tagger-add-model-tag" type="checkbox" /> Keep model tags</label>
        <label class="tool-toggle"><input id="batch-tagger-auto-backup" type="checkbox" checked /> Auto-create snapshot before modifying existing captions</label>
      </div>
      <p id="batch-tagger-status" class="section-note">Loading interrogator inventory...</p>
      <div id="batch-tagger-results" class="dataset-analysis-empty">
        Choose a folder and model to launch background tag generation. Use the full tag editor for manual review and batch text surgery afterward.
      </div>
      <p><a class="text-link" href="${runtimeUrl("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">caption</p>
          <h2>Batch caption cleanup</h2>
          <p class="section-note">Preview and apply cleanup rules across caption files before training, without opening the full tag editor for simple bulk normalization work.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Caption folder</span>
          <div class="tool-inline-actions">
            <input id="caption-cleanup-path" class="field-input" type="text" placeholder="Select a folder that contains caption files" />
            <button id="caption-cleanup-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="caption-cleanup-preview" class="action-button" type="button">Preview</button>
            <button id="caption-cleanup-apply" class="action-button action-button-ghost" type="button">Apply</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Caption extension</span>
          <input id="caption-cleanup-extension" class="field-input" type="text" value=".txt" />
        </label>
        <label class="tool-field">
          <span>Remove exact tags</span>
          <input id="caption-cleanup-remove-tags" class="field-input" type="text" placeholder="lowres, text, signature" />
        </label>
        <label class="tool-field">
          <span>Prepend tags</span>
          <input id="caption-cleanup-prepend-tags" class="field-input" type="text" placeholder="masterpiece, best quality" />
        </label>
        <label class="tool-field">
          <span>Append tags</span>
          <input id="caption-cleanup-append-tags" class="field-input" type="text" placeholder="solo, white background" />
        </label>
        <label class="tool-field">
          <span>Search text</span>
          <input id="caption-cleanup-search-text" class="field-input" type="text" placeholder="blue_hair" />
        </label>
        <label class="tool-field">
          <span>Replace text</span>
          <input id="caption-cleanup-replace-text" class="field-input" type="text" placeholder="blue hair" />
        </label>
        <label class="tool-field">
          <span>Sample diffs</span>
          <input id="caption-cleanup-sample-limit" class="field-input" type="number" value="8" min="1" max="50" step="1" />
        </label>
        <label class="tool-field">
          <span>Auto-backup snapshot name</span>
          <input id="caption-cleanup-backup-name" class="field-input" type="text" placeholder="pre-caption-cleanup" />
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="caption-cleanup-recursive" type="checkbox" checked /> Recursive scan subfolders</label>
        <label class="tool-toggle"><input id="caption-cleanup-collapse-whitespace" type="checkbox" checked /> Normalize repeated whitespace</label>
        <label class="tool-toggle"><input id="caption-cleanup-replace-underscore" type="checkbox" /> Replace underscore with space</label>
        <label class="tool-toggle"><input id="caption-cleanup-dedupe-tags" type="checkbox" checked /> Remove duplicate tags</label>
        <label class="tool-toggle"><input id="caption-cleanup-sort-tags" type="checkbox" /> Sort tags alphabetically</label>
        <label class="tool-toggle"><input id="caption-cleanup-use-regex" type="checkbox" /> Use regex for search and replace</label>
        <label class="tool-toggle"><input id="caption-cleanup-auto-backup" type="checkbox" checked /> Auto-create snapshot before apply</label>
      </div>
      <p id="caption-cleanup-status" class="section-note">Configure cleanup rules and preview the diff before applying changes.</p>
      <div id="caption-cleanup-results" class="dataset-analysis-empty">
        Preview first when possible. The tool shows before/after diffs for a few sample files so you can catch bad rules before writing them into the dataset.
      </div>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">backup</p>
          <h2>Caption snapshot restore</h2>
          <p class="section-note">Create restore points for caption files before large edits, then restore a snapshot later if auto-tagging or cleanup rules went sideways.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Caption folder</span>
          <div class="tool-inline-actions">
            <input id="caption-backup-path" class="field-input" type="text" placeholder="Select a folder that contains caption files" />
            <button id="caption-backup-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="caption-backup-create" class="action-button" type="button">Create snapshot</button>
            <button id="caption-backup-refresh" class="action-button action-button-ghost" type="button">Refresh list</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Caption extension</span>
          <input id="caption-backup-extension" class="field-input" type="text" value=".txt" />
        </label>
        <label class="tool-field">
          <span>Snapshot name</span>
          <input id="caption-backup-name" class="field-input" type="text" placeholder="before-cleanup, before-tagging" />
        </label>
        <label class="tool-field">
          <span>Available snapshots</span>
          <select id="caption-backup-select" class="field-input">
            <option value="">Refresh snapshots for this folder</option>
          </select>
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="caption-backup-recursive" type="checkbox" checked /> Include subfolders when creating snapshots</label>
        <label class="tool-toggle"><input id="caption-backup-pre-restore" type="checkbox" checked /> Backup current captions again before restore</label>
      </div>
      <div class="tool-inline-actions">
        <button id="caption-backup-restore" class="action-button" type="button">Restore selected snapshot</button>
      </div>
      <p id="caption-backup-status" class="section-note">Choose a folder and refresh its snapshots, or create a new one before bulk edits.</p>
      <div id="caption-backup-results" class="dataset-analysis-empty">
        Restoring a snapshot overwrites matching caption files from that backup, but it does not delete newer extra files. By default the tool makes one more safety backup before restoring.
      </div>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">scripts</p>
          <h2>Script inventory</h2>
          <p class="section-note">Raw launchers still matter for edge cases, so the full backend inventory stays visible here.</p>
        </div>
      </div>
      <p><a class="text-link" href="${runtimeUrl("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `;
}
