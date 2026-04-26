import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, isApiReady } from '../api/bridge';
import { useEvent } from '../hooks/useEvent';
import { getTargetPageForApiResult } from '../utils/resultRouting';
import type {
  RuntimeStatus,
  RuntimeDef,
  Settings,
  PluginInfo,
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
} from '../api/types';

export type Theme = 'dark' | 'light';

interface InstallSummary {
  runtimeId: string;
  success: boolean;
  finishedAt: number;
}

interface AppState {
  ready: boolean;
  runtimes: Record<string, RuntimeStatus>;
  runtimeDefs: RuntimeDef[];
  selectedRuntime: string | null;
  settings: Settings;
  plugins: PluginInfo[];
  gpuStats: GpuStats;
  runtimeRecommendation: RuntimeRecommendation | null;
  runtimeCompatibility: RuntimeCompatibilityMatrix;
  launchPreflight: PreflightResult;
  launchPlan: TaskPlan | null;
  projectVersion: ProjectVersionInfo | null;
  healthReport: HealthReport | null;
  updateInfo: UpdateInfo | null;
  currentTaskState: TaskStateSnapshot;
  taskStageEvents: TaskStageEvent[];
  taskHistory: TaskResultRecord[];
  isCheckingUpdates: boolean;
  isRunning: boolean;
  isInstalling: boolean;
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
  selectRuntime: (id: string) => void;
  refreshRuntimes: () => void;
  refreshHealthReport: () => Promise<void>;
  updateSettings: (values: Partial<Settings>) => void;
  launch: (runtimeId: string) => Promise<ApiResult>;
  stop: () => void;
  installRuntime: (runtimeId: string) => Promise<ApiResult>;
  refreshUpdateInfo: (force?: boolean) => Promise<void>;
  runUpdater: () => Promise<ApiResult>;
  togglePlugin: (pluginId: string, enabled: boolean) => void;
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
  host: '127.0.0.1',
  port: 28000,
  listen: false,
  disable_tensorboard: false,
  disable_tageditor: false,
  disable_auto_mirror: false,
  dev_mode: false,
  update_channel: 'stable',
  theme: 'light',
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

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [runtimes, setRuntimes] = useState<Record<string, RuntimeStatus>>({});
  const [runtimeDefs, setRuntimeDefs] = useState<RuntimeDef[]>([]);
  const [selectedRuntime, setSelectedRuntime] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [gpuStats, setGpuStats] = useState<GpuStats>(defaultGpuStats);
  const [runtimeRecommendation, setRuntimeRecommendation] = useState<RuntimeRecommendation | null>(null);
  const [runtimeCompatibility, setRuntimeCompatibility] = useState<RuntimeCompatibilityMatrix>({});
  const [launchPreflight, setLaunchPreflight] = useState<PreflightResult>(defaultPreflight);
  const [launchPlan, setLaunchPlan] = useState<TaskPlan | null>(null);
  const [projectVersion, setProjectVersion] = useState<ProjectVersionInfo | null>(null);
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [currentTaskState, setCurrentTaskState] = useState<TaskStateSnapshot>(defaultTaskState);
  const [taskStageEvents, setTaskStageEvents] = useState<TaskStageEvent[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskResultRecord[]>([]);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
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

  // Apply theme attribute on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('launcher-theme', theme);
  }, [theme]);

  // Wait for pywebview API
  useEffect(() => {
    const check = () => {
      if (isApiReady()) {
        setReady(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    const onReady = () => setReady(true);
    window.addEventListener('pywebview-ready', onReady);
    const interval = setInterval(() => { check(); }, 300);

    return () => {
      window.removeEventListener('pywebview-ready', onReady);
      clearInterval(interval);
    };
  }, []);

  // Load initial data once API is ready
  useEffect(() => {
    if (!ready) return;

    const load = async () => {
      try {
        const [rt, defs, best, st, lang, trans, ver, plug, recommendation, compatibility, detectedProjectVersion, taskState, history] = await Promise.all([
          api.getRuntimes(),
          api.getRuntimeDefs(),
          api.getBestRuntime(),
          api.getSettings(),
          api.getLanguage(),
          api.getTranslations(),
          api.getAppVersion(),
          api.scanPlugins(),
          api.getRuntimeRecommendation(),
          api.getRuntimeCompatibility(),
          api.getProjectVersion(),
          api.getTaskState(),
          api.getTaskHistory(),
        ]);

        const storedTheme = localStorage.getItem('launcher-theme') as Theme | null;
        const effectiveTheme = storedTheme || st.theme || 'light';
        const normalizedSettings = { ...st, theme: effectiveTheme };

        setRuntimes(rt);
        setRuntimeDefs(defs);
        setSettings(normalizedSettings);
        settingsRef.current = normalizedSettings;
        setTheme(effectiveTheme);
        if (effectiveTheme !== st.theme) {
          pendingSettingsRef.current = { ...pendingSettingsRef.current, theme: effectiveTheme };
          void api.setSettings({ theme: effectiveTheme });
        }
        setLanguage(lang);
        setTranslations(trans);
        setVersion(ver);
        setPlugins(plug);
        setRuntimeRecommendation(recommendation);
        setRuntimeCompatibility(compatibility);
        setProjectVersion(detectedProjectVersion);
        projectVersionRef.current = detectedProjectVersion;
        setCurrentTaskState(taskState || defaultTaskState);
        setTaskHistory(history || []);

        // Use saved last_runtime or auto-detect
        const saved = st.last_runtime;
        if (saved && rt[saved]?.installed) {
          setSelectedRuntime(saved);
        } else if (recommendation.selected_runtime_id && rt[recommendation.selected_runtime_id]?.installed) {
          setSelectedRuntime(recommendation.selected_runtime_id);
        } else if (best && rt[best]?.installed) {
          setSelectedRuntime(best);
        }

        const selectedForHealth =
          (saved && rt[saved]?.installed && saved)
          || (recommendation.selected_runtime_id && rt[recommendation.selected_runtime_id]?.installed && recommendation.selected_runtime_id)
          || (best && rt[best]?.installed && best)
          || null;
        const health = await api.getHealthReport(selectedForHealth);
        setHealthReport(health);

        const initialPlan = await api.getLaunchPlan(
          selectedForHealth,
          normalizedSettings,
        );
        setLaunchPlan(initialPlan);

        // Check running state
        const running = await api.isRunning();
        setIsRunning(running);
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    };

    load();
  }, [ready]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    projectVersionRef.current = projectVersion;
  }, [projectVersion]);

  useEffect(() => {
    (window as any).__launcher_state = {
      getSettingsSnapshot: () => JSON.stringify(settingsRef.current),
    };
    return () => {
      delete (window as any).__launcher_state;
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
    if (!ready) return;
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
  }, [ready]);

  // Event subscriptions
  useEvent('console_line', (line: string) => {
    setConsoleLines((prev) => [...prev, line]);
  });

  useEvent('process_exit', (data: ProcessExitEvent) => {
    setIsRunning(false);
    setConsoleLines((prev) => [
      ...prev,
      `\nProcess exited (code: ${data.code})${data.result_code ? ` [${data.result_code}]` : ''}`,
    ]);
  });

  useEvent('install_log', (line: string) => {
    setConsoleLines((prev) => [...prev, line]);
  });

  useEvent('install_done', (data: InstallDoneEvent) => {
    void (async () => {
      setIsInstalling(false);
      setLastInstallSummary({
        runtimeId: data.runtime_id,
        success: data.success,
        finishedAt: Date.now(),
      });
      setConsoleLines((prev) => [
        ...prev,
        '',
        data.success
          ? `[Launcher] Runtime '${data.runtime_id}' installation completed successfully.${data.result_code ? ` [${data.result_code}]` : ''}`
          : `[Launcher] Runtime '${data.runtime_id}' installation failed. Check the log above and try again.${data.code ? ` [${data.code}]` : ''}`,
      ]);

      await refreshRuntimes(data.success ? data.runtime_id : null);
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
    setConsoleLines((prev) => [...prev, `[Launcher] [${data.task_type}] ${label}${resultSuffix}`]);
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

      // Update selected runtime if current one became invalid
      setSelectedRuntime((prev) => {
        if (preferredRuntimeId && rt[preferredRuntimeId]?.installed) {
          return preferredRuntimeId;
        }
        if (prev && rt[prev]?.installed) return prev;
        if (recommendation.selected_runtime_id && rt[recommendation.selected_runtime_id]?.installed) {
          return recommendation.selected_runtime_id;
        }
        if (best && rt[best]?.installed) return best;
        return null;
      });

      if (preferredRuntimeId && rt[preferredRuntimeId]?.installed) {
        setSettings((prev) => {
          const next = { ...prev, last_runtime: preferredRuntimeId };
          settingsRef.current = next;
          return next;
        });
        pendingSettingsRef.current = { ...pendingSettingsRef.current, last_runtime: preferredRuntimeId };
        try {
          await api.selectRuntime(preferredRuntimeId);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }, [selectedRuntime]);

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
      await api.selectRuntime(id);
    } catch {
      // ignore
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
    if (!ready) return;
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
  }, [ready, selectedRuntime, settings, runtimes]);

  useEffect(() => {
    if (!ready) return;
    void refreshHealthReport();
  }, [ready, selectedRuntime, refreshHealthReport]);

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

  useEffect(() => {
    if (!ready) return;
    void refreshUpdateInfo(false);
  }, [ready, settings.update_channel, refreshUpdateInfo]);

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
      setConsoleLines([]);
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }, [applyResultNavigation]);

  const stop = useCallback(async () => {
    try {
      await api.stop();
    } catch {
      // ignore
    }
  }, []);

  const installRuntimeAction = useCallback(async (runtimeId: string) => {
    setConsoleLines([]);
    setLastInstallSummary(null);
    try {
      const result = await api.installRuntime(runtimeId);
      applyResultNavigation(result);
      if (result.error) {
        return result;
      }
      setIsInstalling(true);
      return result;
    } catch (e: any) {
      setIsInstalling(false);
      return { error: e.message };
    }
  }, [applyResultNavigation]);

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
      setSettings((current) => {
        const next = { ...current, theme: nextTheme };
        settingsRef.current = next;
        return next;
      });
      pendingSettingsRef.current = { ...pendingSettingsRef.current, theme: nextTheme };
      if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
      settingsTimerRef.current = window.setTimeout(async () => {
        await flushSettingsNow();
      }, 250);
      return nextTheme;
    });
  }, [flushSettingsNow]);

  const clearConsole = useCallback(() => {
    setConsoleLines([]);
    setTaskStageEvents([]);
    setLastInstallSummary(null);
  }, []);

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
    runtimes,
    runtimeDefs,
    selectedRuntime,
    settings,
    plugins,
    gpuStats,
    runtimeRecommendation,
    runtimeCompatibility,
    launchPreflight,
    launchPlan,
    projectVersion,
    healthReport,
    updateInfo,
    currentTaskState,
    taskStageEvents,
    taskHistory,
    isCheckingUpdates,
    isRunning,
    isInstalling,
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
    installRuntime: installRuntimeAction,
    refreshUpdateInfo,
    runUpdater,
    togglePlugin,
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
