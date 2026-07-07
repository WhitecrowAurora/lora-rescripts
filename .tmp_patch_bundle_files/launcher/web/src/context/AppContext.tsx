import React, { createContext, useContext, useState, useEffect, useCallback, useRef, startTransition } from 'react';
import { api, isApiReady } from '../api/bridge';
import { useEvent } from '../hooks/useEvent';
import { getTargetPageForApiResult } from '../utils/resultRouting';
import type {
  RuntimeStatus,
  RuntimeDef,
  Settings,
  PluginInfo,
  UiProfilesState,
  GpuStats,
  PageId,
  Translations,
  RuntimeRecommendation,
  RuntimeCompatibilityMatrix,
  PreflightResult,
  ProjectVersionInfo,
  HealthReport,
  TaskPlan,
  ApiResult,
  InstallDoneEvent,
  ProcessExitEvent,
  TaskStageEvent,
  TaskResultRecord,
  TaskStateSnapshot,
  UpdateInfo,
  ManagedCatalog,
  ManagedConnectionResult,
  ManagedImportState,
  RuntimeInstallQueueState,
  RuntimeDependencyCacheState,
  RuntimeDependencyCacheQueueState,
} from '../api/types';

export type Theme = 'dark' | 'light';
export type BootStage = 'waiting_api' | 'loading_config' | 'loading_runtime' | 'finalizing' | 'ready' | 'error';

interface InstallSummary {
  runtimeId: string;
  success: boolean;
  finishedAt: number;
}

interface AppState {
  ready: boolean;
  bootstrapped: boolean;
  bootStage: BootStage;
  bootError: string | null;
  runtimes: Record<string, RuntimeStatus>;
  runtimeDefs: RuntimeDef[];
  selectedRuntime: string | null;
  settings: Settings;
  plugins: PluginInfo[];
  uiProfiles: UiProfilesState | null;
  gpuStats: GpuStats;
  runtimeRecommendation: RuntimeRecommendation | null;
  runtimeCompatibility: RuntimeCompatibilityMatrix;
  launchPreflight: PreflightResult;
  launchPlan: TaskPlan | null;
  projectVersion: ProjectVersionInfo | null;
  healthReport: HealthReport | null;
  updateInfo: UpdateInfo | null;
  managedCatalog: ManagedCatalog | null;
  managedImportState: ManagedImportState | null;
  currentTaskState: TaskStateSnapshot;
  taskStageEvents: TaskStageEvent[];
  taskHistory: TaskResultRecord[];
  isCheckingUpdates: boolean;
  isRefreshingManagedCatalog: boolean;
  isRunning: boolean;
  isInstalling: boolean;
  installQueue: RuntimeInstallQueueState;
  dependencyCacheQueue: RuntimeDependencyCacheQueueState;
  dependencyCacheStates: Record<string, RuntimeDependencyCacheState>;
  lastInstallSummary: InstallSummary | null;
  consoleLines: string[];
  language: string;
  translations: Translations;
  activePage: PageId;
  version: string;
  theme: Theme;
}

interface AppContextValue extends AppState {
  setActivePage: (page: PageId) => void;
  selectRuntime: (id: string) => Promise<ApiResult>;
  refreshRuntimes: () => void;
  refreshHealthReport: () => Promise<void>;
  updateSettings: (values: Partial<Settings>) => void;
  launch: (runtimeId: string) => Promise<ApiResult>;
  stop: () => void;
  kill: () => Promise<ApiResult>;
  initializeRuntime: (runtimeId: string) => Promise<ApiResult>;
  installRuntime: (runtimeId: string) => Promise<ApiResult>;
  uninstallRuntime: (runtimeId: string) => Promise<ApiResult>;
  prefetchRuntimeDependencies: (runtimeId: string) => Promise<ApiResult>;
  prefetchRuntimeDependenciesBatch: (runtimeIds: string[]) => Promise<ApiResult>;
  clearRuntimeDependencyCache: (runtimeId: string) => Promise<ApiResult>;
  refreshDependencyCacheStates: () => Promise<void>;
  installRuntimeBatch: (runtimeIds: string[]) => Promise<ApiResult>;
  refreshUpdateInfo: (force?: boolean) => Promise<void>;
  refreshManagedCatalog: (force?: boolean) => Promise<void>;
  testManagedConnection: () => Promise<ManagedConnectionResult>;
  importManagedPreset: (presetId: string) => Promise<ManagedImportState>;
  revertManagedImport: () => Promise<ManagedImportState>;
  runUpdater: () => Promise<ApiResult>;
  togglePlugin: (pluginId: string, enabled: boolean) => void;
  refreshUiProfiles: () => Promise<void>;
  activateUiProfile: (profileId: string) => Promise<ApiResult>;
  installUiProfile: (repoUrl: string, replaceExisting?: boolean) => Promise<ApiResult>;
  uninstallUiProfile: (profileId: string) => Promise<ApiResult>;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  clearConsole: () => void;
  clearTaskHistory: () => Promise<ApiResult>;
  clearInstallSummary: () => void;
}

const defaultSettings: Settings = {
  attention_policy: 'default',
  safe_mode: false,
  cn_mirror: false,
  http_proxy: '',
  https_proxy: '',
  all_proxy: '',
  apply_proxy_to_trainer: false,
  host: '127.0.0.1',
  port: 28000,
  listen: false,
  disable_tensorboard: false,
  disable_tageditor: false,
  disable_auto_mirror: false,
  dev_mode: false,
  update_channel: 'stable',
  theme: 'light',
  managed_server_url: '',
  managed_api_key: '',
  language: 'zh',
  last_runtime: null,
  window_width: null,
  window_height: null,
  onboarding_dismissed: false,
};

const defaultGpuStats: GpuStats = {
  available: false,
  gpu_load: 0,
  vram_usage: 0,
  vram_used_mb: 0,
  vram_total_mb: 0,
  gpu_name: '',
};

const defaultPreflight: PreflightResult = {
  ready: false,
  runtime_id: null,
  issues: [],
};

const defaultTaskState: TaskStateSnapshot = {
  task_id: null,
  task_type: 'idle',
  state: 'idle',
  runtime_id: null,
  stage_code: 'idle',
  stage_label_zh: '空闲',
  stage_label_en: 'Idle',
  started_at: null,
  updated_at: new Date(0).toISOString(),
  finished_at: null,
  code: null,
  result_code: null,
  error: null,
  details: {},
};

const defaultInstallQueueState: RuntimeInstallQueueState = {
  active: false,
  current_runtime_id: null,
  current_action: null,
  pending_runtime_ids: [],
  completed_runtime_ids: [],
  failed_runtime_id: null,
  requested_runtime_ids: [],
};

const defaultDependencyCacheStates: Record<string, RuntimeDependencyCacheState> = {};
const defaultDependencyCacheQueueState: RuntimeDependencyCacheQueueState = {
  active: false,
  current_runtime_id: null,
  pending_runtime_ids: [],
  completed_runtime_ids: [],
  failed_runtime_id: null,
  requested_runtime_ids: [],
};

const CONSOLE_FLUSH_INTERVAL_MS = 75;
const CONSOLE_LINE_LIMIT = 1200;

function trimConsoleLines(lines: string[]): string[] {
  if (lines.length <= CONSOLE_LINE_LIMIT) {
    return lines;
  }
  return lines.slice(-CONSOLE_LINE_LIMIT);
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [bootStage, setBootStage] = useState<BootStage>('waiting_api');
  const [bootError, setBootError] = useState<string | null>(null);
  const [runtimes, setRuntimes] = useState<Record<string, RuntimeStatus>>({});
  const [runtimeDefs, setRuntimeDefs] = useState<RuntimeDef[]>([]);
  const [selectedRuntime, setSelectedRuntime] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [uiProfiles, setUiProfiles] = useState<UiProfilesState | null>(null);
  const [gpuStats, setGpuStats] = useState<GpuStats>(defaultGpuStats);
  const [runtimeRecommendation, setRuntimeRecommendation] = useState<RuntimeRecommendation | null>(null);
  const [runtimeCompatibility, setRuntimeCompatibility] = useState<RuntimeCompatibilityMatrix>({});
  const [launchPreflight, setLaunchPreflight] = useState<PreflightResult>(defaultPreflight);
  const [launchPlan, setLaunchPlan] = useState<TaskPlan | null>(null);
  const [projectVersion, setProjectVersion] = useState<ProjectVersionInfo | null>(null);
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [managedCatalog, setManagedCatalog] = useState<ManagedCatalog | null>(null);
  const [managedImportState, setManagedImportState] = useState<ManagedImportState | null>(null);
  const [currentTaskState, setCurrentTaskState] = useState<TaskStateSnapshot>(defaultTaskState);
  const [taskStageEvents, setTaskStageEvents] = useState<TaskStageEvent[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskResultRecord[]>([]);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isRefreshingManagedCatalog, setIsRefreshingManagedCatalog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installQueue, setInstallQueue] = useState<RuntimeInstallQueueState>(defaultInstallQueueState);
  const [dependencyCacheQueue, setDependencyCacheQueue] = useState<RuntimeDependencyCacheQueueState>(defaultDependencyCacheQueueState);
  const [dependencyCacheStates, setDependencyCacheStates] = useState<Record<string, RuntimeDependencyCacheState>>(defaultDependencyCacheStates);
  const [lastInstallSummary, setLastInstallSummary] = useState<InstallSummary | null>(null);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [language, setLanguage] = useState('zh');
  const [translations, setTranslations] = useState<Translations>({});
  const [activePage, setActivePage] = useState<PageId>('launch');
  const [version, setVersion] = useState('');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('launcher-theme') as Theme) || 'light';
  });

  const settingsTimerRef = useRef<number | null>(null);
  const pendingSettingsRef = useRef<Partial<Settings>>({});
  const settingsRef = useRef<Settings>(defaultSettings);
  const projectVersionRef = useRef<ProjectVersionInfo | null>(null);
  const apiReadyHandledRef = useRef(false);
  const consoleLineBufferRef = useRef<string[]>([]);
  const consoleFlushTimerRef = useRef<number | null>(null);

  // Apply theme attribute on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('launcher-theme', theme);
  }, [theme]);

  // Wait for pywebview API
  useEffect(() => {
    let active = true;

    const markApiReady = () => {
      if (!active || apiReadyHandledRef.current) {
        return true;
      }
      if (isApiReady()) {
        apiReadyHandledRef.current = true;
        setReady(true);
        setBootStage((current) => (current === 'waiting_api' ? 'loading_config' : current));
        return true;
      }
      return false;
    };

    if (markApiReady()) {
      return () => {
        active = false;
      };
    }

    const onReady = () => {
      void markApiReady();
    };
    window.addEventListener('pywebview-ready', onReady);
    const interval = window.setInterval(() => {
      void markApiReady();
    }, 300);

    return () => {
      active = false;
      window.removeEventListener('pywebview-ready', onReady);
      clearInterval(interval);
    };
  }, []);

  // Load initial data once API is ready
  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    const applyIfActive = <T,>(setter: (value: T) => void, value: T) => {
      if (!cancelled) {
        setter(value);
      }
    };

    const load = async () => {
      setBootError(null);
      setBootstrapped(false);
      setBootStage('loading_config');

      try {
        const [st, trans, lang, ver] = await Promise.all([
          api.getSettings(),
          api.getTranslations(),
          api.getLanguage(),
          api.getAppVersion(),
        ]);

        const storedTheme = localStorage.getItem('launcher-theme') as Theme | null;
        const effectiveTheme = storedTheme || st.theme || 'light';
        const normalizedSettings = { ...st, theme: effectiveTheme };

        applyIfActive(setSettings, normalizedSettings);
        settingsRef.current = normalizedSettings;
        applyIfActive(setTheme, effectiveTheme);
        if (effectiveTheme !== st.theme) {
          pendingSettingsRef.current = { ...pendingSettingsRef.current, theme: effectiveTheme };
          void api.setSettings({ theme: effectiveTheme });
        }
        applyIfActive(setLanguage, lang);
        applyIfActive(setTranslations, trans);
        applyIfActive(setVersion, ver);

        setBootStage('loading_runtime');

        const [rt, defs, dependencyCaches, best, recommendation, compatibility, detectedProjectVersion, taskState, history] = await Promise.all([
          api.getRuntimes(),
          api.getRuntimeDefs(),
          api.getDependencyCacheStates(),
          api.getBestRuntime(),
          api.getRuntimeRecommendation(),
          api.getRuntimeCompatibility(),
          api.getProjectVersion(),
          api.getTaskState(),
          api.getTaskHistory(),
        ]);

        applyIfActive(setRuntimes, rt);
        applyIfActive(setRuntimeDefs, defs);
        applyIfActive(setDependencyCacheStates, dependencyCaches);
        applyIfActive(setRuntimeRecommendation, recommendation);
        applyIfActive(setRuntimeCompatibility, compatibility);
        applyIfActive(setProjectVersion, detectedProjectVersion);
        projectVersionRef.current = detectedProjectVersion;
        applyIfActive(setCurrentTaskState, taskState || defaultTaskState);
        applyIfActive(setTaskHistory, history || []);

        // Use saved last_runtime or auto-detect
        const saved = st.last_runtime;
        let resolvedRuntimeId: string | null = null;
        if (saved && rt[saved]?.installed) {
          resolvedRuntimeId = saved;
        } else if (recommendation.selected_runtime_id && rt[recommendation.selected_runtime_id]?.installed) {
          resolvedRuntimeId = recommendation.selected_runtime_id;
        } else if (best && rt[best]?.installed) {
          resolvedRuntimeId = best;
        }
        applyIfActive(setSelectedRuntime, resolvedRuntimeId);

        setBootStage('finalizing');

        const selectedForHealth = resolvedRuntimeId;
        const [health, initialPlan, running] = await Promise.all([
          api.getHealthReport(selectedForHealth),
          api.getLaunchPlan(selectedForHealth, normalizedSettings),
          api.isRunning(),
        ]);

        applyIfActive(setHealthReport, health);
        applyIfActive(setLaunchPlan, initialPlan);
        applyIfActive(setIsRunning, running);

        if (!cancelled) {
          setBootstrapped(true);
          setBootStage('ready');
        }

        void Promise.allSettled([
          api.scanPlugins(),
          api.getUiProfiles(),
          api.getManagedCatalog(false),
          api.getManagedImportState(),
        ]).then(([plugResult, uiProfilesResult, managedResult, managedImportResult]) => {
          if (cancelled) {
            return;
          }
          if (plugResult.status === 'fulfilled') {
            setPlugins(plugResult.value);
          }
          if (uiProfilesResult.status === 'fulfilled') {
            setUiProfiles(uiProfilesResult.value);
          }
          if (managedResult.status === 'fulfilled') {
            setManagedCatalog(managedResult.value);
          }
          if (managedImportResult.status === 'fulfilled') {
            setManagedImportState(managedImportResult.value);
          }
        });
      } catch (e) {
        console.error('Failed to load initial data:', e);
        if (!cancelled) {
          const message = e instanceof Error ? e.message : String(e);
          setBootError(message || 'Unknown startup error');
          setBootStage('error');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    projectVersionRef.current = projectVersion;
  }, [projectVersion]);

  const flushConsoleLineBuffer = useCallback(() => {
    if (consoleFlushTimerRef.current !== null) {
      clearTimeout(consoleFlushTimerRef.current);
      consoleFlushTimerRef.current = null;
    }
    if (consoleLineBufferRef.current.length === 0) {
      return;
    }
    const pendingLines = consoleLineBufferRef.current;
    consoleLineBufferRef.current = [];
    startTransition(() => {
      setConsoleLines((prev) => trimConsoleLines([...prev, ...pendingLines]));
    });
  }, []);

  const queueConsoleLines = useCallback((lines: string | string[]) => {
    const nextLines = Array.isArray(lines) ? lines : [lines];
    if (nextLines.length === 0) {
      return;
    }
    consoleLineBufferRef.current.push(...nextLines);
    if (consoleFlushTimerRef.current !== null) {
      return;
    }
    consoleFlushTimerRef.current = window.setTimeout(() => {
      flushConsoleLineBuffer();
    }, CONSOLE_FLUSH_INTERVAL_MS);
  }, [flushConsoleLineBuffer]);

  const resetConsoleLines = useCallback(() => {
    if (consoleFlushTimerRef.current !== null) {
      clearTimeout(consoleFlushTimerRef.current);
      consoleFlushTimerRef.current = null;
    }
    consoleLineBufferRef.current = [];
    setConsoleLines([]);
  }, []);

  useEffect(() => {
    (window as any).__launcher_state = {
      getSettingsSnapshot: () => JSON.stringify(settingsRef.current),
    };
    return () => {
      delete (window as any).__launcher_state;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (consoleFlushTimerRef.current !== null) {
        clearTimeout(consoleFlushTimerRef.current);
      }
      consoleLineBufferRef.current = [];
    };
  }, []);

  const flushSettingsNow = useCallback(async (override?: Partial<Settings>) => {
    if (settingsTimerRef.current) {
      clearTimeout(settingsTimerRef.current);
      settingsTimerRef.current = null;
    }
    const payload = override ?? pendingSettingsRef.current;
    if (!payload || Object.keys(payload).length === 0) {
      return;
    }
    pendingSettingsRef.current = {};
    try {
      await api.setSettings(payload);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      const payload = pendingSettingsRef.current;
      if (!payload || Object.keys(payload).length === 0) {
        return;
      }
      pendingSettingsRef.current = {};
      if (settingsTimerRef.current) {
        clearTimeout(settingsTimerRef.current);
        settingsTimerRef.current = null;
      }
      void api.setSettings(payload);
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, []);

  // GPU stats polling
  useEffect(() => {
    if (!bootstrapped) return;
    const poll = async () => {
      try {
        const stats = await api.getGpuStats();
        setGpuStats(stats);
      } catch {
        // ignore
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [bootstrapped]);

  // Event subscriptions
  useEvent('console_line', (line: string) => {
    queueConsoleLines(line);
  });

  useEvent('process_exit', (data: ProcessExitEvent) => {
    setIsRunning(false);
    queueConsoleLines([
      `\nProcess exited (code: ${data.code})${data.result_code ? ` [${data.result_code}]` : ''}`,
    ]);
  });

  useEvent('install_log', (line: string) => {
    queueConsoleLines(line);
  });

  useEvent('install_done', (data: InstallDoneEvent) => {
    void (async () => {
      const action = data.action || (data.result_code?.startsWith('runtime_initialize.') ? 'initialize' : 'install');
      setIsInstalling(false);
      setInstallQueue((prev) => {
        if (!prev.active) {
          return prev;
        }
        if (action === 'initialize') {
          if (!data.success) {
            return {
              ...prev,
              active: false,
              current_runtime_id: null,
              current_action: null,
              failed_runtime_id: data.runtime_id,
            };
          }
          return {
            ...prev,
            current_runtime_id: data.runtime_id,
            current_action: 'install',
          };
        }
        if (action !== 'install') {
          return prev;
        }
        const completed = data.success && data.runtime_id
          ? [...prev.completed_runtime_ids, data.runtime_id]
          : prev.completed_runtime_ids;
        const remaining = prev.pending_runtime_ids.filter((item) => item !== data.runtime_id);
        if (!data.success) {
          return {
            ...prev,
            active: false,
            current_runtime_id: null,
            current_action: null,
            pending_runtime_ids: remaining,
            completed_runtime_ids: completed,
            failed_runtime_id: data.runtime_id,
          };
        }
        if (remaining.length === 0) {
          return {
            ...prev,
            active: false,
            current_runtime_id: null,
            current_action: null,
            pending_runtime_ids: [],
            completed_runtime_ids: completed,
            failed_runtime_id: null,
          };
        }
        return {
          ...prev,
          active: true,
          current_runtime_id: null,
          current_action: null,
          pending_runtime_ids: remaining,
          completed_runtime_ids: completed,
          failed_runtime_id: null,
        };
      });
      if (action === 'install' || action === 'cache') {
        setLastInstallSummary({
          runtimeId: data.runtime_id,
          success: data.success,
          finishedAt: Date.now(),
        });
      } else {
        setLastInstallSummary(null);
      }
      queueConsoleLines([
        '',
        data.success
          ? action === 'initialize'
            ? `[Launcher] Runtime '${data.runtime_id}' initialization completed successfully.${data.result_code ? ` [${data.result_code}]` : ''}`
            : action === 'uninstall'
              ? `[Launcher] Runtime '${data.runtime_id}' dependency uninstall completed successfully.${data.result_code ? ` [${data.result_code}]` : ''}`
              : action === 'cache'
                ? `[Launcher] Runtime '${data.runtime_id}' dependency cache completed successfully.${data.result_code ? ` [${data.result_code}]` : ''}`
              : `[Launcher] Runtime '${data.runtime_id}' installation completed successfully.${data.result_code ? ` [${data.result_code}]` : ''}`
          : action === 'initialize'
            ? `[Launcher] Runtime '${data.runtime_id}' initialization failed. Check the log above and try again.${data.code ? ` [${data.code}]` : ''}`
            : action === 'uninstall'
              ? `[Launcher] Runtime '${data.runtime_id}' dependency uninstall failed. Check the log above and try again.${data.code ? ` [${data.code}]` : ''}`
              : action === 'cache'
                ? `[Launcher] Runtime '${data.runtime_id}' dependency cache failed. Check the log above and try again.${data.code ? ` [${data.code}]` : ''}`
              : `[Launcher] Runtime '${data.runtime_id}' installation failed. Check the log above and try again.${data.code ? ` [${data.code}]` : ''}`,
      ]);

      if (action === 'cache') {
        setDependencyCacheQueue((prev) => {
          if (!prev.active) {
            return prev;
          }
          const completed = data.success && data.runtime_id
            ? [...prev.completed_runtime_ids, data.runtime_id]
            : prev.completed_runtime_ids;
          const remaining = prev.pending_runtime_ids.filter((item) => item !== data.runtime_id);
          if (!data.success) {
            return {
              ...prev,
              active: false,
              current_runtime_id: null,
              pending_runtime_ids: remaining,
              completed_runtime_ids: completed,
              failed_runtime_id: data.runtime_id,
            };
          }
          if (remaining.length === 0) {
            return {
              ...prev,
              active: false,
              current_runtime_id: null,
              pending_runtime_ids: [],
              completed_runtime_ids: completed,
              failed_runtime_id: null,
            };
          }
          return {
            ...prev,
            active: true,
            current_runtime_id: null,
            pending_runtime_ids: remaining,
            completed_runtime_ids: completed,
            failed_runtime_id: null,
          };
        });
      }

      await refreshRuntimes(data.success ? data.runtime_id : null);
      await refreshDependencyCacheStates();
    })();
  });

  useEvent('task_state', (data: TaskStateSnapshot) => {
    setCurrentTaskState(data);
  });

  useEvent('task_stage', (data: TaskStageEvent) => {
    setTaskStageEvents((prev) => {
      const sameTask = prev.length > 0 && prev[prev.length - 1]?.task_id === data.task_id;
      const next = sameTask ? [...prev, data] : [data];
      return next.slice(-24);
    });
    const label = language === 'zh' ? data.stage_label_zh : data.stage_label_en;
    const resultSuffix = data.result_code ? ` [${data.result_code}]` : data.code ? ` [${data.code}]` : '';
    queueConsoleLines(`[Launcher] [${data.task_type}] ${label}${resultSuffix}`);
  });

  useEvent('task_result', (data: TaskResultRecord) => {
    setTaskHistory((prev) => {
      const next = [data, ...prev.filter((item) => item.task_id !== data.task_id)];
      return next.slice(0, 20);
    });
  });

  useEvent('task_history_cleared', () => {
    setTaskHistory([]);
  });

  const refreshRuntimes = useCallback(async (preferredRuntimeId?: string | null) => {
    try {
      const [rt, plug, best, recommendation, health] = await Promise.all([
        api.getRuntimes(),
        api.scanPlugins(),
        api.getBestRuntime(),
        api.getRuntimeRecommendation(),
        api.getHealthReport(preferredRuntimeId || selectedRuntime || settingsRef.current.last_runtime || null),
      ]);
      setRuntimes(rt);
      setPlugins(plug);
      setRuntimeRecommendation(recommendation);
      setHealthReport(health);

      let resolvedRuntimeId: string | null = null;
      if (preferredRuntimeId && rt[preferredRuntimeId]?.installed) {
        resolvedRuntimeId = preferredRuntimeId;
      } else if (selectedRuntime && rt[selectedRuntime]?.installed) {
        resolvedRuntimeId = selectedRuntime;
      } else if (settingsRef.current.last_runtime && rt[settingsRef.current.last_runtime]?.installed) {
        resolvedRuntimeId = settingsRef.current.last_runtime;
      } else if (recommendation.selected_runtime_id && rt[recommendation.selected_runtime_id]?.installed) {
        resolvedRuntimeId = recommendation.selected_runtime_id;
      } else if (best && rt[best]?.installed) {
        resolvedRuntimeId = best;
      }

      setSelectedRuntime(resolvedRuntimeId);

      if (resolvedRuntimeId && settingsRef.current.last_runtime !== resolvedRuntimeId) {
        setSettings((prev) => {
          const next = { ...prev, last_runtime: resolvedRuntimeId };
          settingsRef.current = next;
          return next;
        });
        pendingSettingsRef.current = { ...pendingSettingsRef.current, last_runtime: resolvedRuntimeId };
        try {
          await api.selectRuntime(resolvedRuntimeId);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }, [selectedRuntime]);

  const refreshDependencyCacheStates = useCallback(async () => {
    try {
      const states = await api.getDependencyCacheStates();
      setDependencyCacheStates(states);
    } catch {
      // ignore
    }
  }, []);

  const applyResultNavigation = useCallback((result: ApiResult) => {
    const targetPage = getTargetPageForApiResult(result);
    if (targetPage) {
      setActivePage(targetPage);
    }
  }, []);

  const refreshHealthReport = useCallback(async () => {
    try {
      const report = await api.getHealthReport(selectedRuntime || settingsRef.current.last_runtime || null);
      setHealthReport(report);
    } catch {
      // ignore
    }
  }, [selectedRuntime]);

  const selectRuntime = useCallback(async (id: string) => {
    setSelectedRuntime(id);
    setSettings((prev) => {
      const next = { ...prev, last_runtime: id };
      settingsRef.current = next;
      return next;
    });
    try {
      return await api.selectRuntime(id);
    } catch {
      return { error: 'Failed to select runtime.' };
    }
  }, []);

  const updateSettings = useCallback((values: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...values };
      settingsRef.current = next;
      return next;
    });
    pendingSettingsRef.current = { ...pendingSettingsRef.current, ...values };

    // Debounced save (250ms)
    if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
    settingsTimerRef.current = window.setTimeout(async () => {
      await flushSettingsNow();
    }, 250);
  }, [flushSettingsNow]);

  useEffect(() => {
    if (!bootstrapped) return;
    let active = true;

    const run = async () => {
      try {
        const [preflight, plan] = await Promise.all([
          api.getLaunchPreflight(selectedRuntime, settingsRef.current),
          api.getLaunchPlan(selectedRuntime, settingsRef.current),
        ]);
        if (active) {
          setLaunchPreflight(preflight);
          setLaunchPlan(plan);
        }
      } catch {
        if (active) {
          setLaunchPreflight(defaultPreflight);
          setLaunchPlan(null);
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [bootstrapped, selectedRuntime, settings, runtimes]);

  useEffect(() => {
    if (!bootstrapped) return;
    void refreshHealthReport();
  }, [bootstrapped, selectedRuntime, refreshHealthReport]);

  const refreshUpdateInfo = useCallback(async (force = false) => {
    setIsCheckingUpdates(true);
    try {
      const info = await api.checkForUpdates(force, settingsRef.current.update_channel);
      setUpdateInfo(info);
      setProjectVersion(info.current);
      projectVersionRef.current = info.current;
    } catch (e: any) {
      const currentProjectVersion = projectVersionRef.current || {
        display: 'Unknown',
        raw: null,
        normalized: null,
        source: 'unknown',
        is_beta: null,
      };
      setUpdateInfo((prev) => ({
        channel: settingsRef.current.update_channel,
        current: currentProjectVersion,
        checked_at: new Date().toISOString(),
        has_update: false,
        latest: null,
        release_url: null,
        release_notes: '',
        published_at: null,
        error: e?.message || 'Failed to check for updates.',
        ...(prev || {}),
      }));
    } finally {
      setIsCheckingUpdates(false);
    }
  }, []);

  const refreshManagedCatalog = useCallback(async (force = false) => {
    setIsRefreshingManagedCatalog(true);
    try {
      await flushSettingsNow();
      const catalog = await api.getManagedCatalog(force);
      setManagedCatalog(catalog);
    } finally {
      setIsRefreshingManagedCatalog(false);
    }
  }, [flushSettingsNow]);

  useEffect(() => {
    if (!bootstrapped) return;
    void refreshUpdateInfo(false);
  }, [bootstrapped, settings.update_channel, refreshUpdateInfo]);

  const testManagedConnection = useCallback(async () => {
    await flushSettingsNow();
    return api.testManagedConnection();
  }, [flushSettingsNow]);

  const importManagedPreset = useCallback(async (presetId: string) => {
    const state = await api.importManagedPreset(presetId);
    setManagedImportState(state);
    return state;
  }, []);

  const revertManagedImport = useCallback(async () => {
    const state = await api.revertManagedImport();
    setManagedImportState(state);
    return state;
  }, []);

  const launch = useCallback(async (runtimeId: string) => {
    try {
      const result = await api.launch(runtimeId);
      applyResultNavigation(result);
      if (result.error) {
        if (result.code === 'trainer.already_running') {
          setIsRunning(true);
        }
        return result;
      }
      setIsRunning(true);
      resetConsoleLines();
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, [applyResultNavigation, resetConsoleLines]);

  const stop = useCallback(async () => {
    try {
      await api.stop();
    } catch {
      // ignore
    }
  }, []);

  const kill = useCallback(async () => {
    try {
      return await api.kill();
    } catch (e: any) {
      return { error: e.message };
    }
  }, []);

  const startInstallRuntime = useCallback(async (
    runtimeId: string,
    options?: {
      preserveConsole?: boolean;
      preserveSummary?: boolean;
    },
  ) => {
    if (!options?.preserveConsole) {
      resetConsoleLines();
    }
    if (!options?.preserveSummary) {
      setLastInstallSummary(null);
    }
    setIsInstalling(true);
    try {
      const result = await api.installRuntime(runtimeId);
      applyResultNavigation(result);
      if (result.error) {
        setIsInstalling(false);
        return result;
      }
      return result;
    } catch (e: any) {
      setIsInstalling(false);
      return { error: e.message };
    }
  }, [applyResultNavigation, resetConsoleLines]);

  const installRuntimeAction = useCallback(async (runtimeId: string) => {
    return startInstallRuntime(runtimeId);
  }, [startInstallRuntime]);

  const initializeRuntimeAction = useCallback(async (runtimeId: string) => {
    resetConsoleLines();
    setLastInstallSummary(null);
    setIsInstalling(true);
    try {
      const result = await api.initializeRuntime(runtimeId);
      applyResultNavigation(result);
      if (result.error) {
        setIsInstalling(false);
        return result;
      }
      return result;
    } catch (e: any) {
      setIsInstalling(false);
      return { error: e.message };
    }
  }, [applyResultNavigation, resetConsoleLines]);

  const uninstallRuntimeAction = useCallback(async (runtimeId: string) => {
    resetConsoleLines();
    setLastInstallSummary(null);
    setIsInstalling(true);
    try {
      const result = await api.uninstallRuntime(runtimeId);
      applyResultNavigation(result);
      if (result.error) {
        setIsInstalling(false);
        return result;
      }
      return result;
    } catch (e: any) {
      setIsInstalling(false);
      return { error: e.message };
    }
  }, [applyResultNavigation, resetConsoleLines]);

  const prefetchRuntimeDependenciesAction = useCallback(async (runtimeId: string) => {
    resetConsoleLines();
    setLastInstallSummary(null);
    setIsInstalling(true);
    try {
      const result = await api.prefetchRuntimeDependencies(runtimeId);
      applyResultNavigation(result);
      if (result.error) {
        setIsInstalling(false);
        return result;
      }
      return result;
    } catch (e: any) {
      setIsInstalling(false);
      return { error: e.message };
    }
  }, [applyResultNavigation, resetConsoleLines]);

  const prefetchRuntimeDependenciesBatch = useCallback(async (runtimeIds: string[]) => {
    const normalized = runtimeIds.filter((item, index, arr) => !!item && arr.indexOf(item) === index);
    if (normalized.length === 0) {
      return { error: language === 'zh' ? '没有可缓存的运行时。' : 'No runtimes were selected for dependency caching.' };
    }
    if (isInstalling || dependencyCacheQueue.active) {
      return { error: language === 'zh' ? '已有缓存或安装任务正在进行中。' : 'Another cache or install task is already in progress.' };
    }
    setDependencyCacheQueue({
      active: true,
      current_runtime_id: null,
      pending_runtime_ids: normalized,
      completed_runtime_ids: [],
      failed_runtime_id: null,
      requested_runtime_ids: normalized,
    });
    return { ok: true, result_code: 'dependency_cache.batch_queued' };
  }, [dependencyCacheQueue.active, isInstalling, language]);

  const clearRuntimeDependencyCacheAction = useCallback(async (runtimeId: string) => {
    try {
      const result = await api.clearRuntimeDependencyCache(runtimeId);
      applyResultNavigation(result);
      await refreshDependencyCacheStates();
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, [applyResultNavigation, refreshDependencyCacheStates]);

  const installRuntimeBatch = useCallback(async (runtimeIds: string[]) => {
    const normalized = runtimeIds.filter((item, index, arr) => !!item && arr.indexOf(item) === index);
    if (normalized.length === 0) {
      return { error: language === 'zh' ? '没有可安装的运行时。' : 'No runtimes were selected for installation.' };
    }
    if (isInstalling || installQueue.active) {
      return { error: language === 'zh' ? '已有安装任务正在进行中。' : 'Another installation task is already in progress.' };
    }
    setInstallQueue({
      active: true,
      current_runtime_id: null,
      current_action: null,
      pending_runtime_ids: normalized,
      completed_runtime_ids: [],
      failed_runtime_id: null,
      requested_runtime_ids: normalized,
    });
    return { ok: true, result_code: 'runtime_install.batch_queued' };
  }, [installQueue.active, isInstalling, language]);

  useEffect(() => {
    if (!installQueue.active) {
      return;
    }
    if (isInstalling) {
      return;
    }
    if (installQueue.current_runtime_id && installQueue.current_action) {
      const runtimeId = installQueue.current_runtime_id;
      const promise = installQueue.current_action === 'initialize'
        ? initializeRuntimeAction(runtimeId)
        : startInstallRuntime(runtimeId, {
            preserveConsole: installQueue.completed_runtime_ids.length > 0,
            preserveSummary: installQueue.completed_runtime_ids.length > 0,
          });
      void promise.then((result) => {
        if (result.error) {
          setInstallQueue((prev) => ({
            ...prev,
            active: false,
            current_runtime_id: null,
            current_action: null,
            failed_runtime_id: runtimeId,
          }));
        }
      });
      return;
    }
    const remaining = installQueue.pending_runtime_ids.filter((item) => !installQueue.completed_runtime_ids.includes(item));
    if (remaining.length === 0) {
      return;
    }
    const nextRuntimeId = remaining[0];
    const runtimeStatus = runtimes[nextRuntimeId];
    const nextAction = runtimeStatus?.python_exists && runtimeStatus.bootstrap_ready && runtimeStatus.integrity_ok ? 'install' : 'initialize';
    setInstallQueue((prev) => ({ ...prev, current_runtime_id: nextRuntimeId, current_action: nextAction }));
  }, [initializeRuntimeAction, installQueue.active, installQueue.completed_runtime_ids.length, installQueue.current_action, installQueue.current_runtime_id, installQueue.pending_runtime_ids, isInstalling, runtimes, startInstallRuntime]);

  useEffect(() => {
    if (!dependencyCacheQueue.active) {
      return;
    }
    if (isInstalling) {
      return;
    }
    if (dependencyCacheQueue.current_runtime_id) {
      const runtimeId = dependencyCacheQueue.current_runtime_id;
      void prefetchRuntimeDependenciesAction(runtimeId).then((result) => {
        if (result.error) {
          setDependencyCacheQueue((prev) => ({
            ...prev,
            active: false,
            current_runtime_id: null,
            failed_runtime_id: runtimeId,
          }));
        }
      });
      return;
    }
    const remaining = dependencyCacheQueue.pending_runtime_ids.filter((item) => !dependencyCacheQueue.completed_runtime_ids.includes(item));
    if (remaining.length === 0) {
      return;
    }
    const nextRuntimeId = remaining[0];
    setDependencyCacheQueue((prev) => ({ ...prev, current_runtime_id: nextRuntimeId }));
  }, [dependencyCacheQueue.active, dependencyCacheQueue.completed_runtime_ids.length, dependencyCacheQueue.current_runtime_id, dependencyCacheQueue.pending_runtime_ids, isInstalling, prefetchRuntimeDependenciesAction]);

  const runUpdater = useCallback(async () => {
    try {
      await flushSettingsNow();
      const result = await api.runUpdater();
      applyResultNavigation(result);
      if (result.error) {
        return result;
      }
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, [applyResultNavigation, flushSettingsNow]);

  const togglePlugin = useCallback(async (pluginId: string, enabled: boolean) => {
    try {
      await api.setPluginEnabled(pluginId, enabled);
      const plug = await api.scanPlugins();
      setPlugins(plug);
    } catch {
      // ignore
    }
  }, []);

  const refreshUiProfiles = useCallback(async () => {
    try {
      const state = await api.getUiProfiles();
      setUiProfiles(state);
    } catch {
      // ignore
    }
  }, []);

  const activateUiProfile = useCallback(async (profileId: string) => {
    try {
      const result = await api.activateUiProfile(profileId);
      if (!result.error) {
        await refreshUiProfiles();
      }
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, [refreshUiProfiles]);

  const installUiProfile = useCallback(async (repoUrl: string, replaceExisting = false) => {
    try {
      const result = await api.installUiProfile(repoUrl, replaceExisting);
      if (!result.error) {
        await refreshUiProfiles();
      }
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, [refreshUiProfiles]);

  const uninstallUiProfile = useCallback(async (profileId: string) => {
    try {
      const result = await api.uninstallUiProfile(profileId);
      if (!result.error) {
        await refreshUiProfiles();
      }
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, [refreshUiProfiles]);

  const toggleLanguage = useCallback(async () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    try {
      await api.setLanguage(newLang);
      const trans = await api.getTranslations();
      setLanguage(newLang);
      setTranslations(trans);
      setSettings((prev) => {
        const next = { ...prev, language: newLang };
        settingsRef.current = next;
        return next;
      });
    } catch (e) {
      console.error('Failed to toggle language:', e);
    }
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme: Theme = prev === 'dark' ? 'light' : 'dark';
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    setSettings((current) => {
      const next = { ...current, theme };
      settingsRef.current = next;
      return next;
    });
    pendingSettingsRef.current = { ...pendingSettingsRef.current, theme };
    if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
    settingsTimerRef.current = window.setTimeout(async () => {
      await flushSettingsNow();
    }, 250);
  }, [theme, flushSettingsNow]);

  const clearConsole = useCallback(() => {
    resetConsoleLines();
    setTaskStageEvents([]);
    setLastInstallSummary(null);
  }, [resetConsoleLines]);

  const clearTaskHistory = useCallback(async () => {
    try {
      const result = await api.clearTaskHistory();
      if (!result.error) {
        setTaskHistory([]);
      }
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, []);

  const clearInstallSummary = useCallback(() => {
    setLastInstallSummary(null);
  }, []);

  const value: AppContextValue = {
    ready,
    bootstrapped,
    bootStage,
    bootError,
    runtimes,
    runtimeDefs,
    selectedRuntime,
    settings,
    plugins,
    uiProfiles,
    gpuStats,
    runtimeRecommendation,
    runtimeCompatibility,
    launchPreflight,
    launchPlan,
    projectVersion,
    healthReport,
    updateInfo,
    managedCatalog,
    managedImportState,
    currentTaskState,
    taskStageEvents,
    taskHistory,
    isCheckingUpdates,
    isRefreshingManagedCatalog,
    isRunning,
    isInstalling,
    installQueue,
    dependencyCacheQueue,
    dependencyCacheStates,
    lastInstallSummary,
    consoleLines,
    language,
    translations,
    activePage,
    version,
    theme,
    setActivePage,
    selectRuntime,
    refreshRuntimes,
    refreshHealthReport,
    updateSettings,
    launch,
    stop,
    kill,
    initializeRuntime: initializeRuntimeAction,
    installRuntime: installRuntimeAction,
    uninstallRuntime: uninstallRuntimeAction,
    prefetchRuntimeDependencies: prefetchRuntimeDependenciesAction,
    prefetchRuntimeDependenciesBatch,
    clearRuntimeDependencyCache: clearRuntimeDependencyCacheAction,
    refreshDependencyCacheStates,
    installRuntimeBatch,
    refreshUpdateInfo,
    refreshManagedCatalog,
    testManagedConnection,
    importManagedPreset,
    revertManagedImport,
    runUpdater,
    togglePlugin,
    refreshUiProfiles,
    activateUiProfile,
    installUiProfile,
    uninstallUiProfile,
    toggleLanguage,
    toggleTheme,
    clearConsole,
    clearTaskHistory,
    clearInstallSummary,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
