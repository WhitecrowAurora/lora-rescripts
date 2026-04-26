// TypeScript interfaces matching the Python API responses

export interface RuntimeStatus {
  runtime_id: string;
  python_exists: boolean;
  deps_installed: boolean;
  installed: boolean;
  python_path: string | null;
  env_dir: string | null;
  status_text: 'installed' | 'partial' | 'missing';
}

export interface RuntimeDef {
  id: string;
  name_zh: string;
  name_en: string;
  desc_zh: string;
  desc_en: string;
  category: 'nvidia' | 'intel' | 'amd';
  experimental: boolean;
  preferred_runtime: string;
  python_rel_path: string;
  install_scripts: string[];
  install_script_paths: string[];
  env_dir_names: string[];
  preferred_env_dirs: string[];
  legacy_env_dirs: string[];
  launch_entry: RuntimeLaunchEntry;
  runtime_env_vars: RuntimeEnvVarEntry[];
  capability_tags: RuntimeCapabilityTag[];
  recommended_models: RuntimeModelHint[];
  supported_models: RuntimeModelHint[];
  caution_models: RuntimeModelHint[];
  not_recommended_models: RuntimeModelHint[];
  notes_zh: string;
  notes_en: string;
}

export interface RuntimeCapabilityTag {
  id: string;
  label_zh: string;
  label_en: string;
  tone: 'success' | 'accent' | 'warning';
}

export interface RuntimeLaunchEntry {
  mode: string;
  script: string;
  cwd: string;
}

export interface RuntimeEnvVarEntry {
  key: string;
  value: string;
}

export interface RuntimeModelHint {
  model_id: string;
  label_zh: string;
  label_en: string;
}

export interface Settings {
  attention_policy: string;
  safe_mode: boolean;
  cn_mirror: boolean;
  host: string;
  port: number;
  listen: boolean;
  disable_tensorboard: boolean;
  disable_tageditor: boolean;
  disable_auto_mirror: boolean;
  dev_mode: boolean;
  update_channel: 'stable' | 'beta';
  theme: 'dark' | 'light';
  language: string;
  last_runtime: string | null;
  window_width?: number | null;
  window_height?: number | null;
  onboarding_dismissed: boolean;
}

export interface PluginInfo {
  plugin_id: string;
  name: string;
  version: string;
  description: string;
  dir_name: string;
  enabled: boolean;
  enabled_by_default: boolean;
  has_override: boolean;
  capabilities: string[];
  hooks: string[];
  error: string;
}

export interface GpuStats {
  available: boolean;
  gpu_load: number;
  vram_usage: number;
  vram_used_mb: number;
  vram_total_mb: number;
  gpu_name: string;
}

export interface ProjectVersionInfo {
  display: string;
  raw: string | null;
  normalized: string | null;
  source: string;
  is_beta: boolean | null;
}

export interface RuntimeRecommendation {
  preferred_runtime_id: string | null;
  selected_runtime_id: string | null;
  preferred_installed: boolean;
  gpu_name: string;
  gpu_vendor: string;
  reason_zh: string;
  reason_en: string;
  source: string;
  candidates: string[];
  adapters: Array<{
    name: string;
    vendor: string;
    driver_version: string;
  }>;
}

export interface RuntimeCompatibilityEntry {
  model_id: string;
  label_zh: string;
  label_en: string;
  status: 'recommended' | 'supported' | 'caution' | 'not_recommended';
  reason_zh: string;
  reason_en: string;
}

export type RuntimeCompatibilityMatrix = Record<string, RuntimeCompatibilityEntry[]>;

export interface PreflightIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  title_zh: string;
  title_en: string;
  message_zh: string;
  message_en: string;
  action_page?: PageId | null;
}

export interface PreflightResult {
  ready: boolean;
  runtime_id: string | null;
  issues: PreflightIssue[];
}

export interface UpdateInfo {
  channel: 'stable' | 'beta';
  current: ProjectVersionInfo;
  checked_at: string | null;
  has_update: boolean;
  latest: ProjectVersionInfo | null;
  release_url: string | null;
  release_notes: string;
  published_at: string | null;
  error: string | null;
}

export interface HealthCheckItem {
  code: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  title_zh: string;
  title_en: string;
  message_zh: string;
  message_en: string;
}

export interface HealthFinding {
  code: string;
  severity: 'critical' | 'warn' | 'info';
  title_zh: string;
  title_en: string;
  message_zh: string;
  message_en: string;
  next_step_zh: string;
  next_step_en: string;
  action_page?: PageId | null;
}

export interface HealthReport {
  overall_status: 'healthy' | 'attention' | 'critical';
  summary_zh: string;
  summary_en: string;
  installed_runtime_count: number;
  prepared_runtime_count: number;
  recommended_runtime_id: string | null;
  selected_runtime_id: string | null;
  primary_findings: HealthFinding[];
  checks: HealthCheckItem[];
}

export interface TaskPlanStep {
  id: string;
  label_zh: string;
  label_en: string;
  detail_zh: string;
  detail_en: string;
}

export interface TaskPlanCommand {
  label_zh: string;
  label_en: string;
  executable: string;
  args: string[];
  cwd: string;
  command_preview: string;
}

export interface TaskPlanEnvChange {
  mode: 'set' | 'clear';
  key: string;
  value: string | null;
  source_zh: string;
  source_en: string;
}

export interface TaskPlanNote {
  severity: 'info' | 'warn' | 'error';
  message_zh: string;
  message_en: string;
}

export interface TaskPlan {
  action: 'launch' | 'install';
  runtime_id: string;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  steps: TaskPlanStep[];
  commands: TaskPlanCommand[];
  env_changes: TaskPlanEnvChange[];
  notes: TaskPlanNote[];
  metadata: Record<string, unknown>;
}

export interface ApiResult {
  ok?: boolean;
  error?: string;
  code?: string;
  result_code?: string;
  details?: Record<string, unknown>;
  preflight?: PreflightResult;
}

export interface InstallDoneEvent {
  runtime_id: string;
  success: boolean;
  code?: string;
  result_code?: string;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ProcessExitEvent {
  code: number;
  success?: boolean;
  result_code?: string;
}

export interface TaskStateSnapshot {
  task_id: string | null;
  task_type: string;
  state: 'idle' | 'pending' | 'running' | 'succeeded' | 'failed';
  runtime_id: string | null;
  stage_code: string;
  stage_label_zh: string;
  stage_label_en: string;
  started_at: string | null;
  updated_at: string;
  finished_at: string | null;
  code?: string | null;
  result_code?: string | null;
  error?: string | null;
  details?: Record<string, unknown>;
}

export interface TaskStageEvent {
  task_id: string | null;
  task_type: string;
  state: 'idle' | 'pending' | 'running' | 'succeeded' | 'failed';
  runtime_id: string | null;
  stage_code: string;
  stage_label_zh: string;
  stage_label_en: string;
  timestamp: string;
  code?: string | null;
  result_code?: string | null;
  error?: string | null;
  details?: Record<string, unknown>;
}

export interface TaskCommandRecord {
  label_zh: string;
  label_en: string;
  executable: string;
  args: string[];
  cwd: string;
  command_preview: string;
  index: number;
  total: number;
  command_kind: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'interrupted';
  started_at: string | null;
  finished_at: string | null;
  duration_ms?: number | null;
  exit_code?: number | null;
  pid?: number | null;
  error?: string | null;
}

export interface TaskLogSignal {
  code: string;
  severity: 'info' | 'warning' | 'error';
  title_zh: string;
  title_en: string;
  matched_line: string;
}

export interface TaskLogAnalysis {
  line_count: number;
  warning_count: number;
  error_count: number;
  signal_count: number;
  last_warning?: string | null;
  last_error?: string | null;
  signals: TaskLogSignal[];
}

export interface TaskResultRecord {
  task_id: string | null;
  task_type: string;
  runtime_id: string | null;
  state: 'succeeded' | 'failed' | 'interrupted' | 'pending' | 'running' | 'idle';
  stage_code: string;
  stage_label_zh: string;
  stage_label_en: string;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  code?: string | null;
  result_code?: string | null;
  error?: string | null;
  details?: Record<string, unknown>;
  stages?: TaskStageEvent[];
  commands?: TaskCommandRecord[];
  log_lines?: string[];
  log_analysis?: TaskLogAnalysis;
}

// Translations: flat key→string map
export type Translations = Record<string, string>;

// Category labels
export const CATEGORY_ORDER = ['nvidia', 'intel', 'amd'] as const;
export type RuntimeCategory = (typeof CATEGORY_ORDER)[number];

// Navigation page IDs
export type PageId = 'launch' | 'runtime' | 'advanced' | 'install' | 'extensions' | 'console' | 'about';
