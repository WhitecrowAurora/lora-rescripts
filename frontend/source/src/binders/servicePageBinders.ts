import {
  createCaptionBackup,
  listCaptionBackups,
  restoreCaptionBackup,
  applyCaptionCleanup,
  analyzeDataset,
  analyzeMaskedLossDataset,
  fetchInterrogators,
  fetchScripts,
  fetchTagEditorStatus,
  pickFile,
  previewCaptionCleanup,
  runInterrogate,
} from "../services/api";
import { setHtml, setText } from "../shared/domUtils";
import {
  renderCaptionBackupInventory,
  renderCaptionBackupRestoreReport,
  renderCaptionCleanupReport,
  renderDatasetAnalysisReport,
  renderMaskedLossAuditReport,
  renderToolsBrowser,
} from "../renderers/serviceInventoryRenderers";
import { runtimeUrl } from "../shared/runtime";
import { escapeHtml } from "../shared/textUtils";

type DatasetAnalyzerControls = {
  pathInput: HTMLInputElement;
  captionExtensionInput: HTMLInputElement;
  topTagsInput: HTMLInputElement;
  sampleLimitInput: HTMLInputElement;
  browseButton: HTMLButtonElement;
  runButton: HTMLButtonElement;
};

type BatchTaggerControls = {
  pathInput: HTMLInputElement;
  modelSelect: HTMLSelectElement;
  thresholdInput: HTMLInputElement;
  characterThresholdInput: HTMLInputElement;
  conflictSelect: HTMLSelectElement;
  additionalTagsInput: HTMLInputElement;
  backupNameInput: HTMLInputElement;
  excludeTagsInput: HTMLInputElement;
  recursiveInput: HTMLInputElement;
  replaceUnderscoreInput: HTMLInputElement;
  escapeTagInput: HTMLInputElement;
  addRatingTagInput: HTMLInputElement;
  addModelTagInput: HTMLInputElement;
  autoBackupInput: HTMLInputElement;
  browseButton: HTMLButtonElement;
  runButton: HTMLButtonElement;
};

type MaskedLossAuditControls = {
  pathInput: HTMLInputElement;
  sampleLimitInput: HTMLInputElement;
  recursiveInput: HTMLInputElement;
  browseButton: HTMLButtonElement;
  runButton: HTMLButtonElement;
};

type CaptionCleanupControls = {
  pathInput: HTMLInputElement;
  extensionInput: HTMLInputElement;
  removeTagsInput: HTMLInputElement;
  prependTagsInput: HTMLInputElement;
  appendTagsInput: HTMLInputElement;
  searchTextInput: HTMLInputElement;
  replaceTextInput: HTMLInputElement;
  backupNameInput: HTMLInputElement;
  sampleLimitInput: HTMLInputElement;
  recursiveInput: HTMLInputElement;
  collapseWhitespaceInput: HTMLInputElement;
  replaceUnderscoreInput: HTMLInputElement;
  dedupeTagsInput: HTMLInputElement;
  sortTagsInput: HTMLInputElement;
  useRegexInput: HTMLInputElement;
  autoBackupInput: HTMLInputElement;
  browseButton: HTMLButtonElement;
  previewButton: HTMLButtonElement;
  applyButton: HTMLButtonElement;
};

type CaptionBackupControls = {
  pathInput: HTMLInputElement;
  extensionInput: HTMLInputElement;
  nameInput: HTMLInputElement;
  selectInput: HTMLSelectElement;
  recursiveInput: HTMLInputElement;
  preRestoreInput: HTMLInputElement;
  browseButton: HTMLButtonElement;
  createButton: HTMLButtonElement;
  refreshButton: HTMLButtonElement;
  restoreButton: HTMLButtonElement;
};

export async function bindTagEditorData() {
  try {
    const status = await fetchTagEditorStatus();
    setText("tag-editor-status-title", `Current status: ${status.status}`);
    setHtml(
      "tag-editor-status-body",
      `
        <p>${escapeHtml(status.detail || "No extra detail returned.")}</p>
        <p><a class="text-link" href="${runtimeUrl("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `
    );
  } catch (error) {
    setText("tag-editor-status-title", "Tag editor status request failed");
    setText("tag-editor-status-body", error instanceof Error ? error.message : "Unknown error");
  }
}

export async function bindToolsData() {
  bindDatasetAnalyzer();
  bindMaskedLossAudit();
  await bindBatchTagger();
  bindCaptionCleanup();
  bindCaptionBackup();

  try {
    const result = await fetchScripts();
    const scripts = result.data?.scripts ?? [];
    setText("tools-summary-title", `${scripts.length} launcher scripts available`);
    setHtml(
      "tools-summary-body",
      `
        <p>Categories: ${[...new Set(scripts.map((script) => script.category))].map((name) => `<code>${escapeHtml(name)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, masked-loss alpha inspection, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `
    );
    renderToolsBrowser(scripts);
  } catch (error) {
    setText("tools-summary-title", "Script inventory request failed");
    setText("tools-summary-body", error instanceof Error ? error.message : "Unknown error");
    setHtml("tools-browser", "<p>Tool inventory failed to load.</p>");
  }
}

function bindMaskedLossAudit() {
  const controls = getMaskedLossAuditControls();
  if (!controls) {
    return;
  }

  controls.browseButton.addEventListener("click", async () => {
    setText("masked-loss-audit-status", "Opening folder picker...");
    try {
      controls.pathInput.value = await pickFile("folder");
      setText("masked-loss-audit-status", "Folder selected. Ready to inspect alpha masks.");
    } catch (error) {
      setText("masked-loss-audit-status", error instanceof Error ? error.message : "Folder picker failed.");
    }
  });

  controls.runButton.addEventListener("click", () => {
    void runMaskedLossAudit(controls);
  });

  controls.pathInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    void runMaskedLossAudit(controls);
  });
}

function bindDatasetAnalyzer() {
  const controls = getDatasetAnalyzerControls();
  if (!controls) {
    return;
  }

  controls.browseButton.addEventListener("click", async () => {
    setText("dataset-analysis-status", "Opening folder picker...");
    try {
      controls.pathInput.value = await pickFile("folder");
      setText("dataset-analysis-status", "Folder selected. Ready to analyze.");
    } catch (error) {
      setText("dataset-analysis-status", error instanceof Error ? error.message : "Folder picker failed.");
    }
  });

  controls.runButton.addEventListener("click", () => {
    void runDatasetAnalysis(controls);
  });

  controls.pathInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    void runDatasetAnalysis(controls);
  });
}

async function bindBatchTagger() {
  const controls = getBatchTaggerControls();
  if (!controls) {
    return;
  }

  controls.browseButton.addEventListener("click", async () => {
    setText("batch-tagger-status", "Opening folder picker...");
    try {
      controls.pathInput.value = await pickFile("folder");
      setText("batch-tagger-status", "Folder selected. Ready to launch batch tagging.");
    } catch (error) {
      setText("batch-tagger-status", error instanceof Error ? error.message : "Folder picker failed.");
    }
  });

  controls.runButton.addEventListener("click", () => {
    void runBatchTagger(controls);
  });

  controls.pathInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    void runBatchTagger(controls);
  });

  try {
    const result = await fetchInterrogators();
    const interrogators = result.data?.interrogators ?? [];
    if (!interrogators.length) {
      throw new Error("No interrogator models returned.");
    }

    controls.modelSelect.innerHTML = interrogators
      .map((interrogator) => {
        const selected = interrogator.is_default || interrogator.name === result.data?.default ? " selected" : "";
        const suffix = interrogator.kind === "cl" ? "CL" : "WD";
        return `<option value="${escapeHtml(interrogator.name)}"${selected}>${escapeHtml(interrogator.name)} (${suffix})</option>`;
      })
      .join("");

    setText("batch-tagger-status", `Loaded ${interrogators.length} interrogator models.`);
  } catch (error) {
    controls.modelSelect.innerHTML = `<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>`;
    setText("batch-tagger-status", error instanceof Error ? error.message : "Failed to load interrogator inventory.");
    setHtml(
      "batch-tagger-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Failed to load interrogator inventory.")}</p></article>`
    );
  }
}

function bindCaptionCleanup() {
  const controls = getCaptionCleanupControls();
  if (!controls) {
    return;
  }

  controls.browseButton.addEventListener("click", async () => {
    setText("caption-cleanup-status", "Opening folder picker...");
    try {
      controls.pathInput.value = await pickFile("folder");
      setText("caption-cleanup-status", "Folder selected. Ready to preview cleanup.");
    } catch (error) {
      setText("caption-cleanup-status", error instanceof Error ? error.message : "Folder picker failed.");
    }
  });

  controls.previewButton.addEventListener("click", () => {
    void runCaptionCleanup(controls, "preview");
  });

  controls.applyButton.addEventListener("click", () => {
    void runCaptionCleanup(controls, "apply");
  });

  controls.pathInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    void runCaptionCleanup(controls, "preview");
  });
}

function bindCaptionBackup() {
  const controls = getCaptionBackupControls();
  if (!controls) {
    return;
  }

  controls.browseButton.addEventListener("click", async () => {
    setText("caption-backup-status", "Opening folder picker...");
    try {
      controls.pathInput.value = await pickFile("folder");
      setText("caption-backup-status", "Folder selected. Refreshing snapshots...");
      await refreshCaptionBackups(controls);
    } catch (error) {
      setText("caption-backup-status", error instanceof Error ? error.message : "Folder picker failed.");
    }
  });

  controls.refreshButton.addEventListener("click", () => {
    void refreshCaptionBackups(controls);
  });

  controls.createButton.addEventListener("click", () => {
    void createCaptionBackupSnapshot(controls);
  });

  controls.restoreButton.addEventListener("click", () => {
    void restoreCaptionBackupSnapshot(controls);
  });

  controls.selectInput.addEventListener("change", () => {
    void refreshCaptionBackups(controls, controls.selectInput.value || null);
  });
}

function getDatasetAnalyzerControls(): DatasetAnalyzerControls | null {
  const pathInput = document.querySelector<HTMLInputElement>("#dataset-analysis-path");
  const captionExtensionInput = document.querySelector<HTMLInputElement>("#dataset-analysis-caption-extension");
  const topTagsInput = document.querySelector<HTMLInputElement>("#dataset-analysis-top-tags");
  const sampleLimitInput = document.querySelector<HTMLInputElement>("#dataset-analysis-sample-limit");
  const browseButton = document.querySelector<HTMLButtonElement>("#dataset-analysis-pick");
  const runButton = document.querySelector<HTMLButtonElement>("#dataset-analysis-run");

  if (!pathInput || !captionExtensionInput || !topTagsInput || !sampleLimitInput || !browseButton || !runButton) {
    return null;
  }

  return {
    pathInput,
    captionExtensionInput,
    topTagsInput,
    sampleLimitInput,
    browseButton,
    runButton,
  };
}

function getMaskedLossAuditControls(): MaskedLossAuditControls | null {
  const pathInput = document.querySelector<HTMLInputElement>("#masked-loss-audit-path");
  const sampleLimitInput = document.querySelector<HTMLInputElement>("#masked-loss-audit-sample-limit");
  const recursiveInput = document.querySelector<HTMLInputElement>("#masked-loss-audit-recursive");
  const browseButton = document.querySelector<HTMLButtonElement>("#masked-loss-audit-pick");
  const runButton = document.querySelector<HTMLButtonElement>("#masked-loss-audit-run");

  if (!pathInput || !sampleLimitInput || !recursiveInput || !browseButton || !runButton) {
    return null;
  }

  return {
    pathInput,
    sampleLimitInput,
    recursiveInput,
    browseButton,
    runButton,
  };
}

function getBatchTaggerControls(): BatchTaggerControls | null {
  const pathInput = document.querySelector<HTMLInputElement>("#batch-tagger-path");
  const modelSelect = document.querySelector<HTMLSelectElement>("#batch-tagger-model");
  const thresholdInput = document.querySelector<HTMLInputElement>("#batch-tagger-threshold");
  const characterThresholdInput = document.querySelector<HTMLInputElement>("#batch-tagger-character-threshold");
  const conflictSelect = document.querySelector<HTMLSelectElement>("#batch-tagger-conflict");
  const additionalTagsInput = document.querySelector<HTMLInputElement>("#batch-tagger-additional-tags");
  const backupNameInput = document.querySelector<HTMLInputElement>("#batch-tagger-backup-name");
  const excludeTagsInput = document.querySelector<HTMLInputElement>("#batch-tagger-exclude-tags");
  const recursiveInput = document.querySelector<HTMLInputElement>("#batch-tagger-recursive");
  const replaceUnderscoreInput = document.querySelector<HTMLInputElement>("#batch-tagger-replace-underscore");
  const escapeTagInput = document.querySelector<HTMLInputElement>("#batch-tagger-escape-tag");
  const addRatingTagInput = document.querySelector<HTMLInputElement>("#batch-tagger-add-rating-tag");
  const addModelTagInput = document.querySelector<HTMLInputElement>("#batch-tagger-add-model-tag");
  const autoBackupInput = document.querySelector<HTMLInputElement>("#batch-tagger-auto-backup");
  const browseButton = document.querySelector<HTMLButtonElement>("#batch-tagger-pick");
  const runButton = document.querySelector<HTMLButtonElement>("#batch-tagger-run");

  if (
    !pathInput ||
    !modelSelect ||
    !thresholdInput ||
    !characterThresholdInput ||
    !conflictSelect ||
    !additionalTagsInput ||
    !backupNameInput ||
    !excludeTagsInput ||
    !recursiveInput ||
    !replaceUnderscoreInput ||
    !escapeTagInput ||
    !addRatingTagInput ||
    !addModelTagInput ||
    !autoBackupInput ||
    !browseButton ||
    !runButton
  ) {
    return null;
  }

  return {
    pathInput,
    modelSelect,
    thresholdInput,
    characterThresholdInput,
    conflictSelect,
    additionalTagsInput,
    backupNameInput,
    excludeTagsInput,
    recursiveInput,
    replaceUnderscoreInput,
    escapeTagInput,
    addRatingTagInput,
    addModelTagInput,
    autoBackupInput,
    browseButton,
    runButton,
  };
}

function getCaptionCleanupControls(): CaptionCleanupControls | null {
  const pathInput = document.querySelector<HTMLInputElement>("#caption-cleanup-path");
  const extensionInput = document.querySelector<HTMLInputElement>("#caption-cleanup-extension");
  const removeTagsInput = document.querySelector<HTMLInputElement>("#caption-cleanup-remove-tags");
  const prependTagsInput = document.querySelector<HTMLInputElement>("#caption-cleanup-prepend-tags");
  const appendTagsInput = document.querySelector<HTMLInputElement>("#caption-cleanup-append-tags");
  const searchTextInput = document.querySelector<HTMLInputElement>("#caption-cleanup-search-text");
  const replaceTextInput = document.querySelector<HTMLInputElement>("#caption-cleanup-replace-text");
  const backupNameInput = document.querySelector<HTMLInputElement>("#caption-cleanup-backup-name");
  const sampleLimitInput = document.querySelector<HTMLInputElement>("#caption-cleanup-sample-limit");
  const recursiveInput = document.querySelector<HTMLInputElement>("#caption-cleanup-recursive");
  const collapseWhitespaceInput = document.querySelector<HTMLInputElement>("#caption-cleanup-collapse-whitespace");
  const replaceUnderscoreInput = document.querySelector<HTMLInputElement>("#caption-cleanup-replace-underscore");
  const dedupeTagsInput = document.querySelector<HTMLInputElement>("#caption-cleanup-dedupe-tags");
  const sortTagsInput = document.querySelector<HTMLInputElement>("#caption-cleanup-sort-tags");
  const useRegexInput = document.querySelector<HTMLInputElement>("#caption-cleanup-use-regex");
  const autoBackupInput = document.querySelector<HTMLInputElement>("#caption-cleanup-auto-backup");
  const browseButton = document.querySelector<HTMLButtonElement>("#caption-cleanup-pick");
  const previewButton = document.querySelector<HTMLButtonElement>("#caption-cleanup-preview");
  const applyButton = document.querySelector<HTMLButtonElement>("#caption-cleanup-apply");

  if (
    !pathInput ||
    !extensionInput ||
    !removeTagsInput ||
    !prependTagsInput ||
    !appendTagsInput ||
    !searchTextInput ||
    !replaceTextInput ||
    !backupNameInput ||
    !sampleLimitInput ||
    !recursiveInput ||
    !collapseWhitespaceInput ||
    !replaceUnderscoreInput ||
    !dedupeTagsInput ||
    !sortTagsInput ||
    !useRegexInput ||
    !autoBackupInput ||
    !browseButton ||
    !previewButton ||
    !applyButton
  ) {
    return null;
  }

  return {
    pathInput,
    extensionInput,
    removeTagsInput,
    prependTagsInput,
    appendTagsInput,
    searchTextInput,
    replaceTextInput,
    backupNameInput,
    sampleLimitInput,
    recursiveInput,
    collapseWhitespaceInput,
    replaceUnderscoreInput,
    dedupeTagsInput,
    sortTagsInput,
    useRegexInput,
    autoBackupInput,
    browseButton,
    previewButton,
    applyButton,
  };
}

function getCaptionBackupControls(): CaptionBackupControls | null {
  const pathInput = document.querySelector<HTMLInputElement>("#caption-backup-path");
  const extensionInput = document.querySelector<HTMLInputElement>("#caption-backup-extension");
  const nameInput = document.querySelector<HTMLInputElement>("#caption-backup-name");
  const selectInput = document.querySelector<HTMLSelectElement>("#caption-backup-select");
  const recursiveInput = document.querySelector<HTMLInputElement>("#caption-backup-recursive");
  const preRestoreInput = document.querySelector<HTMLInputElement>("#caption-backup-pre-restore");
  const browseButton = document.querySelector<HTMLButtonElement>("#caption-backup-pick");
  const createButton = document.querySelector<HTMLButtonElement>("#caption-backup-create");
  const refreshButton = document.querySelector<HTMLButtonElement>("#caption-backup-refresh");
  const restoreButton = document.querySelector<HTMLButtonElement>("#caption-backup-restore");

  if (
    !pathInput ||
    !extensionInput ||
    !nameInput ||
    !selectInput ||
    !recursiveInput ||
    !preRestoreInput ||
    !browseButton ||
    !createButton ||
    !refreshButton ||
    !restoreButton
  ) {
    return null;
  }

  return {
    pathInput,
    extensionInput,
    nameInput,
    selectInput,
    recursiveInput,
    preRestoreInput,
    browseButton,
    createButton,
    refreshButton,
    restoreButton,
  };
}

async function runDatasetAnalysis(controls: DatasetAnalyzerControls) {
  const path = controls.pathInput.value.trim();
  if (!path) {
    setText("dataset-analysis-status", "Pick a dataset folder first.");
    setHtml("dataset-analysis-results", "<p class=\"dataset-analysis-empty\">No folder selected yet.</p>");
    return;
  }

  controls.browseButton.disabled = true;
  controls.runButton.disabled = true;
  setText("dataset-analysis-status", "Analyzing dataset...");
  setHtml("dataset-analysis-results", "<p class=\"dataset-analysis-empty\">Scanning images, captions, and tags...</p>");

  try {
    const result = await analyzeDataset({
      path,
      caption_extension: controls.captionExtensionInput.value.trim() || ".txt",
      top_tags: parsePositiveInt(controls.topTagsInput.value, 40),
      sample_limit: parsePositiveInt(controls.sampleLimitInput.value, 8),
    });

    if (result.status !== "success" || !result.data) {
      throw new Error(result.message || "Dataset analysis returned no data.");
    }

    setText(
      "dataset-analysis-status",
      `Scanned ${result.data.summary.image_count} images across ${result.data.summary.dataset_folder_count} dataset folder(s).`
    );
    renderDatasetAnalysisReport(result.data);
  } catch (error) {
    setText("dataset-analysis-status", error instanceof Error ? error.message : "Dataset analysis failed.");
    setHtml(
      "dataset-analysis-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Dataset analysis failed.")}</p></article>`
    );
  } finally {
    controls.browseButton.disabled = false;
    controls.runButton.disabled = false;
  }
}

async function runMaskedLossAudit(controls: MaskedLossAuditControls) {
  const path = controls.pathInput.value.trim();
  if (!path) {
    setText("masked-loss-audit-status", "Pick a dataset folder first.");
    setHtml("masked-loss-audit-results", "<p class=\"dataset-analysis-empty\">No dataset folder selected yet.</p>");
    return;
  }

  controls.browseButton.disabled = true;
  controls.runButton.disabled = true;
  setText("masked-loss-audit-status", "Inspecting alpha-channel masks...");
  setHtml("masked-loss-audit-results", "<p class=\"dataset-analysis-empty\">Opening images and checking their alpha channels...</p>");

  try {
    const result = await analyzeMaskedLossDataset({
      path,
      recursive: controls.recursiveInput.checked,
      sample_limit: parsePositiveInt(controls.sampleLimitInput.value, 8),
    });

    if (result.status !== "success" || !result.data) {
      throw new Error(result.message || "Masked-loss audit returned no data.");
    }

    setText(
      "masked-loss-audit-status",
      `Inspected ${result.data.summary.image_count} images. Found ${result.data.summary.usable_mask_image_count} image(s) with usable alpha masks.`
    );
    renderMaskedLossAuditReport(result.data);
  } catch (error) {
    setText("masked-loss-audit-status", error instanceof Error ? error.message : "Masked-loss audit failed.");
    setHtml(
      "masked-loss-audit-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Masked-loss audit failed.")}</p></article>`
    );
  } finally {
    controls.browseButton.disabled = false;
    controls.runButton.disabled = false;
  }
}

async function runBatchTagger(controls: BatchTaggerControls) {
  const path = controls.pathInput.value.trim();
  if (!path) {
    setText("batch-tagger-status", "Pick an image folder first.");
    setHtml("batch-tagger-results", "<p class=\"dataset-analysis-empty\">No image folder selected yet.</p>");
    return;
  }

  controls.browseButton.disabled = true;
  controls.runButton.disabled = true;
  setText("batch-tagger-status", "Starting batch tagging...");
  setHtml("batch-tagger-results", "<p class=\"dataset-analysis-empty\">Submitting interrogator job to the backend...</p>");

  try {
    const threshold = parseBoundedNumber(controls.thresholdInput.value, 0.35, 0, 1);
    const characterThreshold = parseBoundedNumber(controls.characterThresholdInput.value, 0.6, 0, 1);
    const result = await runInterrogate({
      path,
      interrogator_model: controls.modelSelect.value,
      threshold,
      character_threshold: characterThreshold,
      batch_output_action_on_conflict: controls.conflictSelect.value,
      create_backup_before_write: controls.autoBackupInput.checked,
      backup_snapshot_name: controls.backupNameInput.value.trim(),
      additional_tags: controls.additionalTagsInput.value.trim(),
      exclude_tags: controls.excludeTagsInput.value.trim(),
      batch_input_recursive: controls.recursiveInput.checked,
      replace_underscore: controls.replaceUnderscoreInput.checked,
      escape_tag: controls.escapeTagInput.checked,
      add_rating_tag: controls.addRatingTagInput.checked,
      add_model_tag: controls.addModelTagInput.checked,
    });

    if (result.status !== "success") {
      throw new Error(result.message || "Batch tagging failed to start.");
    }

    setText("batch-tagger-status", result.message || "Batch tagging started.");
    setHtml(
      "batch-tagger-results",
      `
        <article class="dataset-analysis-block">
          <p class="panel-kicker">launched</p>
          <h3>Batch tagger job submitted</h3>
          <p><code>${escapeHtml(path)}</code></p>
          <p>Model: <code>${escapeHtml(controls.modelSelect.value)}</code></p>
          <p>
            Threshold: <strong>${escapeHtml(String(threshold))}</strong>
            · Character threshold: <strong>${escapeHtml(String(characterThreshold))}</strong>
            · Conflict mode: <strong>${escapeHtml(controls.conflictSelect.value)}</strong>
          </p>
          <p>
            Recursive: <strong>${controls.recursiveInput.checked ? "yes" : "no"}</strong>
            · Replace underscore: <strong>${controls.replaceUnderscoreInput.checked ? "yes" : "no"}</strong>
            · Escape tags: <strong>${controls.escapeTagInput.checked ? "yes" : "no"}</strong>
          </p>
          <p>
            Auto backup: <strong>${controls.autoBackupInput.checked ? "yes" : "no"}</strong>
            ${
              result.data?.backup
                ? `· Snapshot: <code>${escapeHtml(result.data.backup.archive_name)}</code>`
                : ""
            }
          </p>
          ${
            result.data?.warnings?.length
              ? `<p>${escapeHtml(result.data.warnings.join(" "))}</p>`
              : ""
          }
          <p>The backend runs this in the background. Watch the console output and inspect generated <code>.txt</code> files in the dataset folder.</p>
        </article>
      `
    );
  } catch (error) {
    setText("batch-tagger-status", error instanceof Error ? error.message : "Batch tagging failed.");
    setHtml(
      "batch-tagger-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Batch tagging failed.")}</p></article>`
    );
  } finally {
    controls.browseButton.disabled = false;
    controls.runButton.disabled = false;
  }
}

async function runCaptionCleanup(controls: CaptionCleanupControls, mode: "preview" | "apply") {
  const path = controls.pathInput.value.trim();
  if (!path) {
    setText("caption-cleanup-status", "Pick a caption folder first.");
    setHtml("caption-cleanup-results", "<p class=\"dataset-analysis-empty\">No caption folder selected yet.</p>");
    return;
  }

  const requestPayload = {
    path,
    caption_extension: controls.extensionInput.value.trim() || ".txt",
    recursive: controls.recursiveInput.checked,
    collapse_whitespace: controls.collapseWhitespaceInput.checked,
    replace_underscore: controls.replaceUnderscoreInput.checked,
    dedupe_tags: controls.dedupeTagsInput.checked,
    sort_tags: controls.sortTagsInput.checked,
    remove_tags: controls.removeTagsInput.value.trim(),
    prepend_tags: controls.prependTagsInput.value.trim(),
    append_tags: controls.appendTagsInput.value.trim(),
    search_text: controls.searchTextInput.value,
    replace_text: controls.replaceTextInput.value,
    use_regex: controls.useRegexInput.checked,
    create_backup_before_apply: controls.autoBackupInput.checked,
    backup_snapshot_name: controls.backupNameInput.value.trim(),
    sample_limit: parsePositiveInt(controls.sampleLimitInput.value, 8),
  };

  controls.browseButton.disabled = true;
  controls.previewButton.disabled = true;
  controls.applyButton.disabled = true;
  setText("caption-cleanup-status", mode === "preview" ? "Previewing caption cleanup..." : "Applying caption cleanup...");
  setHtml(
    "caption-cleanup-results",
    `<p class="dataset-analysis-empty">${mode === "preview" ? "Scanning caption files and building sample diffs..." : "Writing cleaned captions back to disk..."}</p>`
  );

  try {
    const result =
      mode === "preview"
        ? await previewCaptionCleanup(requestPayload)
        : await applyCaptionCleanup(requestPayload);

    if (result.status !== "success" || !result.data) {
      throw new Error(result.message || `Caption cleanup ${mode} failed.`);
    }

    setText(
      "caption-cleanup-status",
      result.message ||
        (mode === "preview"
          ? `Previewed ${result.data.summary.changed_file_count} caption file changes.`
          : `Applied cleanup to ${result.data.summary.changed_file_count} caption files.`)
    );
    renderCaptionCleanupReport(result.data);
  } catch (error) {
    setText("caption-cleanup-status", error instanceof Error ? error.message : "Caption cleanup failed.");
    setHtml(
      "caption-cleanup-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Caption cleanup failed.")}</p></article>`
    );
  } finally {
    controls.browseButton.disabled = false;
    controls.previewButton.disabled = false;
    controls.applyButton.disabled = false;
  }
}

async function refreshCaptionBackups(
  controls: CaptionBackupControls,
  selectedArchiveName?: string | null,
  renderInventory = true
) {
  const path = controls.pathInput.value.trim();
  if (!path) {
    setText("caption-backup-status", "Pick a caption folder first.");
    setHtml("caption-backup-results", "<p class=\"dataset-analysis-empty\">No caption folder selected yet.</p>");
    controls.selectInput.innerHTML = `<option value="">Refresh snapshots for this folder</option>`;
    return;
  }

  controls.browseButton.disabled = true;
  controls.createButton.disabled = true;
  controls.refreshButton.disabled = true;
  controls.restoreButton.disabled = true;
  setText("caption-backup-status", "Loading caption snapshots...");

  try {
    const result = await listCaptionBackups({ path });
    const backups = result.data?.backups ?? [];
    const fallbackSelectedValue = controls.selectInput.value || (backups[0]?.archive_name ?? "");
    const selectedValue = selectedArchiveName ?? fallbackSelectedValue;

    controls.selectInput.innerHTML = backups.length
      ? backups
          .map((backup) => {
            const selected = backup.archive_name === selectedValue ? " selected" : "";
            return `<option value="${escapeHtml(backup.archive_name)}"${selected}>${escapeHtml(backup.snapshot_name)} · ${escapeHtml(backup.archive_name)}</option>`;
          })
          .join("")
      : `<option value="">No snapshots for this folder yet</option>`;

    if (backups.length && selectedValue) {
      controls.selectInput.value = selectedValue;
    }

    setText("caption-backup-status", backups.length ? `Loaded ${backups.length} caption snapshots.` : "No caption snapshots found for this folder.");
    if (renderInventory) {
      renderCaptionBackupInventory(backups, backups.length ? selectedValue : null);
    }
  } catch (error) {
    setText("caption-backup-status", error instanceof Error ? error.message : "Failed to load caption snapshots.");
    setHtml(
      "caption-backup-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Failed to load caption snapshots.")}</p></article>`
    );
  } finally {
    controls.browseButton.disabled = false;
    controls.createButton.disabled = false;
    controls.refreshButton.disabled = false;
    controls.restoreButton.disabled = false;
  }
}

async function createCaptionBackupSnapshot(controls: CaptionBackupControls) {
  const path = controls.pathInput.value.trim();
  if (!path) {
    setText("caption-backup-status", "Pick a caption folder first.");
    setHtml("caption-backup-results", "<p class=\"dataset-analysis-empty\">No caption folder selected yet.</p>");
    return;
  }

  controls.browseButton.disabled = true;
  controls.createButton.disabled = true;
  controls.refreshButton.disabled = true;
  controls.restoreButton.disabled = true;
  setText("caption-backup-status", "Creating caption snapshot...");

  try {
    const result = await createCaptionBackup({
      path,
      caption_extension: controls.extensionInput.value.trim() || ".txt",
      recursive: controls.recursiveInput.checked,
      snapshot_name: controls.nameInput.value.trim(),
    });

    if (result.status !== "success" || !result.data) {
      throw new Error(result.message || "Caption snapshot creation failed.");
    }

    setText("caption-backup-status", result.message || `Created ${result.data.archive_name}`);
    controls.nameInput.value = "";
    await refreshCaptionBackups(controls, result.data.archive_name);
  } catch (error) {
    setText("caption-backup-status", error instanceof Error ? error.message : "Caption snapshot creation failed.");
    setHtml(
      "caption-backup-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Caption snapshot creation failed.")}</p></article>`
    );
  } finally {
    controls.browseButton.disabled = false;
    controls.createButton.disabled = false;
    controls.refreshButton.disabled = false;
    controls.restoreButton.disabled = false;
  }
}

async function restoreCaptionBackupSnapshot(controls: CaptionBackupControls) {
  const path = controls.pathInput.value.trim();
  const archiveName = controls.selectInput.value;

  if (!path) {
    setText("caption-backup-status", "Pick a caption folder first.");
    setHtml("caption-backup-results", "<p class=\"dataset-analysis-empty\">No caption folder selected yet.</p>");
    return;
  }

  if (!archiveName) {
    setText("caption-backup-status", "Select a snapshot to restore.");
    return;
  }

  const confirmed = window.confirm(
    `Restore caption snapshot ${archiveName} into this folder?\n\nThis overwrites matching caption files from the snapshot.`
  );
  if (!confirmed) {
    return;
  }

  controls.browseButton.disabled = true;
  controls.createButton.disabled = true;
  controls.refreshButton.disabled = true;
  controls.restoreButton.disabled = true;
  setText("caption-backup-status", "Restoring caption snapshot...");
  setHtml("caption-backup-results", "<p class=\"dataset-analysis-empty\">Writing snapshot files back to the folder...</p>");

  try {
    const result = await restoreCaptionBackup({
      path,
      archive_name: archiveName,
      make_restore_backup: controls.preRestoreInput.checked,
    });

    if (result.status !== "success" || !result.data) {
      throw new Error(result.message || "Caption snapshot restore failed.");
    }

    setText("caption-backup-status", result.message || `Restored ${result.data.restored_file_count} caption files.`);
    renderCaptionBackupRestoreReport(result.data);
    await refreshCaptionBackups(controls, archiveName, false);
  } catch (error) {
    setText("caption-backup-status", error instanceof Error ? error.message : "Caption snapshot restore failed.");
    setHtml(
      "caption-backup-results",
      `<article class="dataset-analysis-block dataset-analysis-warning"><p>${escapeHtml(error instanceof Error ? error.message : "Caption snapshot restore failed.")}</p></article>`
    );
  } finally {
    controls.browseButton.disabled = false;
    controls.createButton.disabled = false;
    controls.refreshButton.disabled = false;
    controls.restoreButton.disabled = false;
  }
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function parseBoundedNumber(value: string, fallback: number, min: number, max: number) {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}
