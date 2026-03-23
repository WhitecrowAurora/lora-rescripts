export type ApiEnvelope<T> = {
  status: string;
  message?: string;
  data?: T;
};

export type SchemaHashRecord = {
  name: string;
  hash: string;
};

export type SchemaRecord = {
  name: string;
  hash: string;
  schema: string;
};

export type PresetRecord = {
  name?: string;
  group?: string;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ConfigSummary = {
  last_path: string;
  saved_param_keys: string[];
  saved_param_count: number;
  config_path: string;
};

export type TaskRecord = {
  id?: string;
  task_id?: string;
  status?: string;
  message?: string;
  progress?: number;
  [key: string]: unknown;
};

export type GraphicCardRecord = {
  index?: number;
  id?: number;
  name: string;
  memory_total?: string | number;
  memory_free?: string | number;
  memory_used?: string | number;
  [key: string]: unknown;
};

export type GraphicCardEntry = GraphicCardRecord | string;

export type XformersStatus = {
  version?: string | null;
  installed: boolean;
  supported: boolean;
  reason: string;
};

export type RuntimePackageRecord = {
  module_name: string;
  package_name: string;
  display_name: string;
  required_by_default: boolean;
  installed: boolean;
  importable: boolean;
  version?: string | null;
  reason?: string;
};

export type RuntimeStatusRecord = {
  environment: string;
  python_executable: string;
  python_version: string;
  required_ready: boolean;
  packages: Record<string, RuntimePackageRecord>;
};

export type TagEditorStatus = {
  status: string;
  detail?: string;
};

export type ScriptRecord = {
  name: string;
  positional_args: string[];
  category: string;
};

export type NamedCountRecord = {
  name: string;
  count: number;
};

export type DatasetFolderRecord = {
  name: string;
  path: string;
  repeats?: number | null;
  image_count: number;
  effective_image_count: number;
  alpha_capable_image_count: number;
  caption_count: number;
  caption_file_count: number;
  caption_coverage: number;
  missing_caption_count: number;
  orphan_caption_count: number;
  empty_caption_count: number;
  broken_image_count: number;
};

export type DatasetSummaryRecord = {
  dataset_folder_count: number;
  image_count: number;
  effective_image_count: number;
  alpha_capable_image_count: number;
  caption_count: number;
  caption_file_count: number;
  caption_coverage: number;
  images_without_caption_count: number;
  orphan_caption_count: number;
  empty_caption_count: number;
  broken_image_count: number;
  unique_tag_count: number;
  average_tags_per_caption: number;
};

export type DatasetAnalysisRecord = {
  root_path: string;
  scan_mode: string;
  caption_extension: string;
  summary: DatasetSummaryRecord;
  folders: DatasetFolderRecord[];
  image_extensions: NamedCountRecord[];
  top_resolutions: NamedCountRecord[];
  orientation_counts: NamedCountRecord[];
  top_tags: NamedCountRecord[];
  warnings: string[];
  samples: {
    images_without_caption: string[];
    orphan_captions: string[];
    broken_images: string[];
  };
};

export type MaskedLossAuditRecord = {
  root_path: string;
  recursive: boolean;
  summary: {
    image_count: number;
    alpha_channel_image_count: number;
    usable_mask_image_count: number;
    soft_alpha_image_count: number;
    binary_alpha_image_count: number;
    fully_opaque_alpha_image_count: number;
    fully_transparent_image_count: number;
    no_alpha_image_count: number;
    broken_image_count: number;
    average_mask_coverage: number;
    average_alpha_weight: number;
  };
  samples: {
    usable_masks: string[];
    soft_alpha_masks: string[];
    fully_opaque_alpha: string[];
    no_alpha: string[];
    broken_images: string[];
  };
  warnings: string[];
  guidance: string[];
};

export type InterrogatorRecord = {
  name: string;
  kind: string;
  repo_id?: string | null;
  is_default?: boolean;
};

export type InterrogateLaunchRecord = {
  backup?: CaptionBackupRecord | null;
  warnings?: string[];
};

export type CaptionCleanupSummaryRecord = {
  file_count: number;
  changed_file_count: number;
  unchanged_file_count: number;
  empty_result_count: number;
  total_tags_before: number;
  total_tags_after: number;
  removed_tag_instances: number;
  added_tag_instances: number;
};

export type CaptionCleanupSampleRecord = {
  path: string;
  before: string;
  after: string;
  before_count: number;
  after_count: number;
  removed_tags: string[];
  added_tags: string[];
};

export type CaptionCleanupRecord = {
  mode: string;
  root_path: string;
  caption_extension: string;
  recursive: boolean;
  options: {
    collapse_whitespace: boolean;
    replace_underscore: boolean;
    dedupe_tags: boolean;
    sort_tags: boolean;
    remove_tags: string[];
    prepend_tags: string[];
    append_tags: string[];
    search_text: string;
    replace_text: string;
    use_regex: boolean;
  };
  summary: CaptionCleanupSummaryRecord;
  samples: CaptionCleanupSampleRecord[];
  warnings: string[];
  backup?: CaptionBackupRecord | null;
};

export type CaptionBackupRecord = {
  archive_name: string;
  archive_path: string;
  created_at?: string;
  snapshot_name: string;
  source_root: string;
  caption_extension?: string;
  recursive: boolean;
  file_count: number;
  archive_size: number;
};

export type CaptionBackupRestoreRecord = {
  archive_name: string;
  source_root: string;
  snapshot_name: string;
  restored_file_count: number;
  overwritten_file_count: number;
  created_file_count: number;
  pre_restore_backup?: CaptionBackupRecord | null;
  warnings: string[];
};

export type TrainingPreflightDatasetRecord = {
  path: string;
  scan_mode: string;
  image_count: number;
  effective_image_count: number;
  alpha_capable_image_count: number;
  caption_coverage: number;
  dataset_folder_count: number;
  images_without_caption_count: number;
  broken_image_count: number;
};

export type TrainingPreflightRecord = {
  training_type: string;
  can_start: boolean;
  errors: string[];
  warnings: string[];
  notes: string[];
  dependencies?: {
    ready: boolean;
    required: Array<RuntimePackageRecord & { required_for: string[] }>;
    missing: Array<RuntimePackageRecord & { required_for: string[] }>;
  };
  dataset?: TrainingPreflightDatasetRecord | null;
  conditioning_dataset?: TrainingPreflightDatasetRecord | null;
  sample_prompt?: {
    source: string;
    detail: string;
    preview: string;
  } | null;
};

export type TrainingSamplePromptRecord = {
  enabled: boolean;
  source: string;
  detail: string;
  preview: string;
  content: string;
  line_count: number;
  suggested_file_name: string;
  warnings: string[];
  notes: string[];
};
