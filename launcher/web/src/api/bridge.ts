// Typed wrapper around window.pywebview.api + event system for streaming data

import type {
  RuntimeStatus,
  RuntimeDef,
  Settings,
  PluginInfo,
  GpuStats,
  ProjectVersionInfo,
  RuntimeRecommendation,
  RuntimeCompatibilityMatrix,
  PreflightResult,
  HealthReport,
  TaskPlan,
  UpdateInfo,
  ApiResult,
  InstallDoneEvent,
  ProcessExitEvent,
  TaskStageEvent,
  TaskResultRecord,
  TaskStateSnapshot,
  Translations,
} from './types';

// ---------------------------------------------------------------------------
// Event system — Python calls window.emit() or window.evaluate_js() to push
// events to the frontend. We support both mechanisms for compatibility.
// ---------------------------------------------------------------------------

type EventHandler = (data: any) => void;
const eventHandlers: Record<string, EventHandler[]> = {};

function emit(event: string, data: any) {
  (eventHandlers[event] || []).forEach((h) => h(data));
}

// Global callback that Python can invoke via window.evaluate_js()
// This is the most reliable way to send events from background threads,
// since window.emit() may not work when called from a non-main thread.
(window as any).__launcher_event = (event: string, data: any) => {
  emit(event, data);
};

// Also support the direct __launcher_events handlers for backwards compat
(window as any).__launcher_events = {
  onConsoleLine: (line: string) => emit('console_line', line),
  onProcessExit: (data: ProcessExitEvent) => emit('process_exit', data),
  onInstallLog: (line: string) => emit('install_log', line),
  onInstallDone: (data: InstallDoneEvent) => emit('install_done', data),
};

function setupEventListener() {
  // pywebview dispatches CustomEvents via window.emit()
  // This works when emit is called from the main thread
  const eventNames = ['console_line', 'process_exit', 'install_log', 'install_done', 'task_state', 'task_stage', 'task_result', 'task_history_cleared'];
  eventNames.forEach((name) => {
    window.addEventListener(name, ((e: CustomEvent) => {
      emit(name, e.detail);
    }) as EventListener);
  });
}

export function on(event: string, handler: EventHandler): () => void {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
  return () => {
    eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler);
  };
}

// ---------------------------------------------------------------------------
// API wrapper — calls window.pywebview.api.method_name()
// ---------------------------------------------------------------------------

interface PywebviewApi {
  get_runtimes: () => Promise<Record<string, RuntimeStatus>>;
  get_runtime_defs: () => Promise<RuntimeDef[]>;
  get_best_runtime: () => Promise<string | null>;
  select_runtime: (id: string) => Promise<ApiResult>;
  get_settings: () => Promise<Settings>;
  set_settings: (values: Partial<Settings>) => Promise<ApiResult>;
  scan_plugins: () => Promise<PluginInfo[]>;
  set_plugin_enabled: (id: string, enabled: boolean) => Promise<ApiResult>;
  get_language: () => Promise<string>;
  set_language: (lang: string) => Promise<ApiResult>;
  get_translations: () => Promise<Translations>;
  get_app_version: () => Promise<string>;
  get_project_version: () => Promise<ProjectVersionInfo>;
  get_runtime_recommendation: () => Promise<RuntimeRecommendation>;
  get_runtime_compatibility: () => Promise<RuntimeCompatibilityMatrix>;
  get_launch_preflight: (runtimeId: string | null, settings: Partial<Settings>) => Promise<PreflightResult>;
  get_launch_plan: (runtimeId: string | null, settings: Partial<Settings>) => Promise<TaskPlan | null>;
  get_install_plan: (runtimeId: string | null) => Promise<TaskPlan | null>;
  get_health_report: (selectedRuntimeId?: string | null) => Promise<HealthReport>;
  check_for_updates: (force?: boolean, channel?: 'stable' | 'beta') => Promise<UpdateInfo>;
  run_updater: () => Promise<ApiResult>;
  get_gpu_stats: () => Promise<GpuStats>;
  get_task_state: () => Promise<TaskStateSnapshot>;
  get_task_history: () => Promise<TaskResultRecord[]>;
  clear_task_history: () => Promise<ApiResult>;
  is_running: () => Promise<boolean>;
  is_installing: () => Promise<boolean>;
  launch: (runtimeId: string) => Promise<ApiResult>;
  stop: () => Promise<ApiResult>;
  install_runtime: (runtimeId: string) => Promise<ApiResult>;
}

function getApi(): PywebviewApi | null {
  return (window as any).pywebview?.api ?? null;
}

async function callApi<T>(method: string, ...args: any[]): Promise<T> {
  const api = getApi();
  if (!api || !(api as any)[method]) {
    throw new Error(`API method "${method}" not available — is pywebview ready?`);
  }
  return (api as any)[method](...args);
}

export const api = {
  getRuntimes: () => callApi<Record<string, RuntimeStatus>>('get_runtimes'),
  getRuntimeDefs: () => callApi<RuntimeDef[]>('get_runtime_defs'),
  getBestRuntime: () => callApi<string | null>('get_best_runtime'),
  selectRuntime: (id: string) => callApi<ApiResult>('select_runtime', id),
  getSettings: () => callApi<Settings>('get_settings'),
  setSettings: (values: Partial<Settings>) => callApi<ApiResult>('set_settings', values),
  scanPlugins: () => callApi<PluginInfo[]>('scan_plugins'),
  setPluginEnabled: (id: string, enabled: boolean) => callApi<ApiResult>('set_plugin_enabled', id, enabled),
  getLanguage: () => callApi<string>('get_language'),
  setLanguage: (lang: string) => callApi<ApiResult>('set_language', lang),
  getTranslations: () => callApi<Translations>('get_translations'),
  getAppVersion: () => callApi<string>('get_app_version'),
  getProjectVersion: () => callApi<ProjectVersionInfo>('get_project_version'),
  getRuntimeRecommendation: () => callApi<RuntimeRecommendation>('get_runtime_recommendation'),
  getRuntimeCompatibility: () => callApi<RuntimeCompatibilityMatrix>('get_runtime_compatibility'),
  getLaunchPreflight: (runtimeId: string | null, settings: Partial<Settings>) =>
    callApi<PreflightResult>('get_launch_preflight', runtimeId, settings),
  getLaunchPlan: (runtimeId: string | null, settings: Partial<Settings>) =>
    callApi<TaskPlan | null>('get_launch_plan', runtimeId, settings),
  getInstallPlan: (runtimeId: string | null) => callApi<TaskPlan | null>('get_install_plan', runtimeId),
  getHealthReport: (selectedRuntimeId?: string | null) => callApi<HealthReport>('get_health_report', selectedRuntimeId),
  checkForUpdates: (force = false, channel?: 'stable' | 'beta') => callApi<UpdateInfo>('check_for_updates', force, channel),
  runUpdater: () => callApi<ApiResult>('run_updater'),
  getGpuStats: () => callApi<GpuStats>('get_gpu_stats'),
  getTaskState: () => callApi<TaskStateSnapshot>('get_task_state'),
  getTaskHistory: () => callApi<TaskResultRecord[]>('get_task_history'),
  clearTaskHistory: () => callApi<ApiResult>('clear_task_history'),
  isRunning: () => callApi<boolean>('is_running'),
  isInstalling: () => callApi<boolean>('is_installing'),
  launch: (runtimeId: string) => callApi<ApiResult>('launch', runtimeId),
  stop: () => callApi<ApiResult>('stop'),
  installRuntime: (runtimeId: string) => callApi<ApiResult>('install_runtime', runtimeId),
};

// Check if pywebview API is available
export function isApiReady(): boolean {
  return !!(window as any).pywebview?.api;
}

// Initialize event listeners
setupEventListener();
