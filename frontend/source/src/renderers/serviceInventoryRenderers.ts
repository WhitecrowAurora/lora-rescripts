import { setHtml } from "../shared/domUtils";
import type {
  CaptionBackupRecord,
  CaptionBackupRestoreRecord,
  CaptionCleanupRecord,
  DatasetAnalysisRecord,
  MaskedLossAuditRecord,
  NamedCountRecord,
  ScriptRecord,
  TaskRecord,
} from "../shared/types";
import { escapeHtml } from "../shared/textUtils";

export function renderTaskTable(tasks: TaskRecord[]) {
  if (tasks.length === 0) {
    setHtml("task-table-container", "<p>No tasks currently tracked.</p>");
    return;
  }

  const rows = tasks
    .map(
      (task) => `
        <tr>
          <td><code>${escapeHtml(task.id ?? task.task_id ?? "unknown")}</code></td>
          <td>${escapeHtml(task.status ?? "unknown")}</td>
          <td>
            <button class="action-button action-button-small" data-task-terminate="${escapeHtml(task.id ?? task.task_id ?? "")}" type="button">
              Terminate
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  setHtml(
    "task-table-container",
    `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `
  );
}

export function renderToolsBrowser(scripts: ScriptRecord[]) {
  if (scripts.length === 0) {
    setHtml("tools-browser", "<p>No scripts returned.</p>");
    return;
  }

  const items = scripts
    .map(
      (script) => `
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${escapeHtml(script.name)}</h3>
            <span class="coverage-pill ${script.category === "networks" ? "" : "coverage-pill-muted"}">${escapeHtml(script.category)}</span>
          </div>
          <p>${
            script.positional_args.length > 0
              ? `Positional args: ${script.positional_args.map((arg) => `<code>${escapeHtml(arg)}</code>`).join(", ")}`
              : "No positional args required."
          }</p>
        </article>
      `
    )
    .join("");

  setHtml("tools-browser", items);
}

export function renderDatasetAnalysisReport(report: DatasetAnalysisRecord) {
  const stats = [
    { label: "Images", value: report.summary.image_count },
    { label: "Effective images", value: report.summary.effective_image_count },
    { label: "Alpha-capable candidates", value: report.summary.alpha_capable_image_count },
    { label: "Caption coverage", value: formatPercent(report.summary.caption_coverage) },
    { label: "Unique tags", value: report.summary.unique_tag_count },
    { label: "Caption files", value: report.summary.caption_file_count },
    { label: "Avg tags / caption", value: report.summary.average_tags_per_caption.toFixed(2) },
  ];

  const warningBlock = report.warnings.length
    ? `
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${report.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}
        </ul>
      </article>
    `
    : "";

  const folders = report.folders.length
    ? report.folders
        .map(
          (folder) => `
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${escapeHtml(folder.name)}</h3>
                <span class="coverage-pill ${folder.caption_coverage >= 1 ? "" : "coverage-pill-muted"}">
                  ${formatPercent(folder.caption_coverage)}
                </span>
              </div>
              <p><code>${escapeHtml(folder.path)}</code></p>
              <p>
                Images: <strong>${folder.image_count}</strong>
                · Effective: <strong>${folder.effective_image_count}</strong>
                · Repeats: <strong>${folder.repeats ?? 1}</strong>
              </p>
              <p>Alpha-capable candidates: <strong>${folder.alpha_capable_image_count}</strong></p>
              <p>
                Missing captions: <strong>${folder.missing_caption_count}</strong>
                · Orphan captions: <strong>${folder.orphan_caption_count}</strong>
                · Empty captions: <strong>${folder.empty_caption_count}</strong>
              </p>
            </article>
          `
        )
        .join("")
    : "<p>No dataset folder summary returned.</p>";

  setHtml(
    "dataset-analysis-results",
    `
      ${warningBlock}
      <section class="dataset-analysis-grid">
        ${stats
          .map(
            (stat) => `
              <article class="dataset-analysis-stat">
                <span class="metric-label">${escapeHtml(stat.label)}</span>
                <strong class="dataset-analysis-stat-value">${escapeHtml(stat.value)}</strong>
              </article>
            `
          )
          .join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">scan</p>
          <h3>Dataset summary</h3>
          <p><code>${escapeHtml(report.root_path)}</code></p>
          <p>Mode: <code>${escapeHtml(report.scan_mode)}</code></p>
          <p>Caption extension: <code>${escapeHtml(report.caption_extension)}</code></p>
          <p>Dataset folders: <strong>${report.summary.dataset_folder_count}</strong></p>
          <p>Alpha-capable candidates: <strong>${report.summary.alpha_capable_image_count}</strong></p>
          <p>Images without captions: <strong>${report.summary.images_without_caption_count}</strong></p>
          <p>Broken images: <strong>${report.summary.broken_image_count}</strong></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">tags</p>
          <h3>Top tags</h3>
          ${renderNamedCountPills(report.top_tags, "No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${renderNamedCountList(report.top_resolutions, "No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${renderNamedCountList(report.orientation_counts, "No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${renderNamedCountList(report.image_extensions, "No image extension data.")}</div>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">folders</p>
          <h3>Per-folder coverage</h3>
          <div class="dataset-analysis-stack">${folders}</div>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Quick path samples</h3>
          <div class="dataset-analysis-sublist">
            <h4>Missing captions</h4>
            ${renderPathList(report.samples.images_without_caption, "No missing-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Orphan captions</h4>
            ${renderPathList(report.samples.orphan_captions, "No orphan-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Broken images</h4>
            ${renderPathList(report.samples.broken_images, "No broken-image samples.")}
          </div>
        </article>
      </section>
    `
  );
}

export function renderMaskedLossAuditReport(report: MaskedLossAuditRecord, targetId = "masked-loss-audit-results") {
  const stats = [
    { label: "Images", value: report.summary.image_count },
    { label: "Alpha channel images", value: report.summary.alpha_channel_image_count },
    { label: "Usable masks", value: report.summary.usable_mask_image_count },
    { label: "Soft alpha masks", value: report.summary.soft_alpha_image_count },
    { label: "Binary alpha masks", value: report.summary.binary_alpha_image_count },
    { label: "Avg masked area", value: formatPercent(report.summary.average_mask_coverage) },
    { label: "Avg alpha weight", value: formatPercent(report.summary.average_alpha_weight) },
  ];

  const warningBlock = report.warnings.length
    ? `
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${report.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}
        </ul>
      </article>
    `
    : "";

  setHtml(
    targetId,
    `
      ${warningBlock}
      <section class="dataset-analysis-grid">
        ${stats
          .map(
            (stat) => `
              <article class="dataset-analysis-stat">
                <span class="metric-label">${escapeHtml(stat.label)}</span>
                <strong class="dataset-analysis-stat-value">${escapeHtml(stat.value)}</strong>
              </article>
            `
          )
          .join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">dataset</p>
          <h3>Alpha mask readiness</h3>
          <p><code>${escapeHtml(report.root_path)}</code></p>
          <p>Recursive scan: <strong>${report.recursive ? "yes" : "no"}</strong></p>
          <p>No alpha channel: <strong>${report.summary.no_alpha_image_count}</strong></p>
          <p>Fully opaque alpha: <strong>${report.summary.fully_opaque_alpha_image_count}</strong></p>
          <p>Fully transparent: <strong>${report.summary.fully_transparent_image_count}</strong></p>
          <p>Broken images: <strong>${report.summary.broken_image_count}</strong></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">guidance</p>
          <h3>Training recommendations</h3>
          <ul class="dataset-analysis-list-plain">
            ${report.guidance.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Usable mask files</h3>
          ${renderPathList(report.samples.usable_masks, "No usable alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Soft alpha files</h3>
          ${renderPathList(report.samples.soft_alpha_masks, "No soft alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Opaque alpha files</h3>
          ${renderPathList(report.samples.fully_opaque_alpha, "No fully opaque alpha-channel samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>No alpha files</h3>
          ${renderPathList(report.samples.no_alpha, "No non-alpha samples were captured.")}
        </article>
      </section>
    `
  );
}

export function renderCaptionCleanupReport(report: CaptionCleanupRecord, targetId = "caption-cleanup-results") {
  const stats = [
    { label: "Caption files", value: report.summary.file_count },
    { label: "Changed", value: report.summary.changed_file_count },
    { label: "Unchanged", value: report.summary.unchanged_file_count },
    { label: "Tag instances removed", value: report.summary.removed_tag_instances },
    { label: "Tag instances added", value: report.summary.added_tag_instances },
    { label: "Empty results", value: report.summary.empty_result_count },
  ];

  const warningBlock = report.warnings.length
    ? `
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${report.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}
        </ul>
      </article>
    `
    : "";

  const sampleBlock = report.samples.length
    ? report.samples
        .map(
          (sample) => `
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${escapeHtml(sample.path)}</h3>
                <span class="coverage-pill ${sample.before !== sample.after ? "" : "coverage-pill-muted"}">
                  ${sample.before_count} -> ${sample.after_count}
                </span>
              </div>
              <div class="dataset-cleanup-diff">
                <div>
                  <p class="panel-kicker">before</p>
                  <pre>${escapeHtml(sample.before || "(empty)")}</pre>
                </div>
                <div>
                  <p class="panel-kicker">after</p>
                  <pre>${escapeHtml(sample.after || "(empty)")}</pre>
                </div>
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Removed tags</h4>
                ${renderPathList(sample.removed_tags, "No explicit tag removals in sample.")}
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Added tags</h4>
                ${renderPathList(sample.added_tags, "No explicit tag additions in sample.")}
              </div>
            </article>
          `
        )
        .join("")
    : "<p>No sample caption changes were captured.</p>";

  setHtml(
    targetId,
    `
      ${warningBlock}
      <section class="dataset-analysis-grid">
        ${stats
          .map(
            (stat) => `
              <article class="dataset-analysis-stat">
                <span class="metric-label">${escapeHtml(stat.label)}</span>
                <strong class="dataset-analysis-stat-value">${escapeHtml(stat.value)}</strong>
              </article>
            `
          )
          .join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">${escapeHtml(report.mode)}</p>
          <h3>Cleanup scope</h3>
          <p><code>${escapeHtml(report.root_path)}</code></p>
          <p>Caption extension: <code>${escapeHtml(report.caption_extension)}</code></p>
          <p>Recursive scan: <strong>${report.recursive ? "yes" : "no"}</strong></p>
          <p>Whitespace normalize: <strong>${report.options.collapse_whitespace ? "yes" : "no"}</strong></p>
          <p>Replace underscore: <strong>${report.options.replace_underscore ? "yes" : "no"}</strong></p>
          ${
            report.backup
              ? `<p>Auto backup: <code>${escapeHtml(report.backup.archive_name)}</code></p>`
              : ""
          }
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">rules</p>
          <h3>Rule summary</h3>
          ${renderNamedCountPills(
            [
              report.options.dedupe_tags ? { name: "dedupe tags", count: 1 } : null,
              report.options.sort_tags ? { name: "sort tags", count: 1 } : null,
              report.options.use_regex ? { name: "regex replace", count: 1 } : null,
            ].filter(Boolean) as NamedCountRecord[],
            "No boolean cleanup switches enabled."
          )}
          <div class="dataset-analysis-sublist">
            <h4>Remove tags</h4>
            ${renderPathList(report.options.remove_tags, "No exact tags configured for removal.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Prepend tags</h4>
            ${renderPathList(report.options.prepend_tags, "No prepend tags configured.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Append tags</h4>
            ${renderPathList(report.options.append_tags, "No append tags configured.")}
          </div>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">replace</p>
          <h3>Search and replace</h3>
          <p>Search: <code>${escapeHtml(report.options.search_text || "(none)")}</code></p>
          <p>Replace: <code>${escapeHtml(report.options.replace_text || "(empty)")}</code></p>
          <p>Mode: <strong>${report.options.use_regex ? "regex" : "literal"}</strong></p>
          <p>Total tags: <strong>${report.summary.total_tags_before}</strong> -> <strong>${report.summary.total_tags_after}</strong></p>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Previewed caption diffs</h3>
          <div class="dataset-analysis-stack">${sampleBlock}</div>
        </article>
      </section>
    `
  );
}

export function renderCaptionBackupInventory(
  backups: CaptionBackupRecord[],
  selectedArchiveName: string | null,
  targetId = "caption-backup-results"
) {
  if (!backups.length) {
    setHtml(
      targetId,
      `
        <article class="dataset-analysis-block">
          <p class="panel-kicker">snapshots</p>
          <h3>No caption snapshots found</h3>
          <p>Create the first backup for this folder to get a restore point before cleanup or tagging.</p>
        </article>
      `
    );
    return;
  }

  const items = backups
    .map(
      (backup) => `
        <article class="dataset-analysis-block ${backup.archive_name === selectedArchiveName ? "dataset-analysis-selected" : ""}">
          <div class="tool-card-head">
            <h3>${escapeHtml(backup.snapshot_name)}</h3>
            <span class="coverage-pill ${backup.archive_name === selectedArchiveName ? "" : "coverage-pill-muted"}">
              ${escapeHtml(backup.archive_name)}
            </span>
          </div>
          <p><code>${escapeHtml(backup.source_root)}</code></p>
          <p>Created: <strong>${escapeHtml(backup.created_at || "unknown")}</strong></p>
          <p>Caption files: <strong>${backup.file_count}</strong> · Archive size: <strong>${formatBytes(backup.archive_size)}</strong></p>
          <p>Extension: <code>${escapeHtml(backup.caption_extension || ".txt")}</code> · Recursive: <strong>${backup.recursive ? "yes" : "no"}</strong></p>
        </article>
      `
    )
    .join("");

  setHtml(targetId, `<div class="dataset-analysis-stack">${items}</div>`);
}

export function renderCaptionBackupRestoreReport(
  report: CaptionBackupRestoreRecord,
  targetId = "caption-backup-results"
) {
  const warningBlock = report.warnings.length
    ? `
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${report.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}
        </ul>
      </article>
    `
    : "";

  setHtml(
    targetId,
    `
      ${warningBlock}
      <section class="dataset-analysis-grid">
        <article class="dataset-analysis-stat">
          <span class="metric-label">Restored files</span>
          <strong class="dataset-analysis-stat-value">${report.restored_file_count}</strong>
        </article>
        <article class="dataset-analysis-stat">
          <span class="metric-label">Overwritten</span>
          <strong class="dataset-analysis-stat-value">${report.overwritten_file_count}</strong>
        </article>
        <article class="dataset-analysis-stat">
          <span class="metric-label">Created</span>
          <strong class="dataset-analysis-stat-value">${report.created_file_count}</strong>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">restored</p>
          <h3>${escapeHtml(report.snapshot_name)}</h3>
          <p><code>${escapeHtml(report.source_root)}</code></p>
          <p>Archive: <code>${escapeHtml(report.archive_name)}</code></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">safety</p>
          <h3>Pre-restore backup</h3>
          ${
            report.pre_restore_backup
              ? `<p>Created <code>${escapeHtml(report.pre_restore_backup.archive_name)}</code> before restore.</p>`
              : "<p>Pre-restore backup was not created for this restore operation.</p>"
          }
        </article>
      </section>
    `
  );
}

function renderNamedCountPills(items: NamedCountRecord[], emptyText: string) {
  if (!items.length) {
    return `<p>${escapeHtml(emptyText)}</p>`;
  }

  return `
    <div class="coverage-list">
      ${items
        .map((item) => `<span class="coverage-pill">${escapeHtml(item.name)} <strong>${item.count}</strong></span>`)
        .join("")}
    </div>
  `;
}

function renderNamedCountList(items: NamedCountRecord[], emptyText: string) {
  if (!items.length) {
    return `<p>${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ul class="dataset-analysis-list-plain">
      ${items
        .map((item) => `<li><code>${escapeHtml(item.name)}</code> <strong>${item.count}</strong></li>`)
        .join("")}
    </ul>
  `;
}

function renderPathList(items: string[], emptyText: string) {
  if (!items.length) {
    return `<p>${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ul class="dataset-analysis-list-plain">
      ${items.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join("")}
    </ul>
  `;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 ** 2) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  if (value < 1024 ** 3) {
    return `${(value / 1024 ** 2).toFixed(1)} MB`;
  }
  return `${(value / 1024 ** 3).toFixed(2)} GB`;
}
