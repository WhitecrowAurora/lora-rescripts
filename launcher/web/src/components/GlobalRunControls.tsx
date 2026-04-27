import React, { useEffect, useMemo, useState } from 'react';
import { Play, Square, OctagonAlert, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

const KILL_CONFIRM_WINDOW_MS = 8000;

export function GlobalRunControls() {
  const {
    selectedRuntime,
    runtimeDefs,
    runtimes,
    launchPreflight,
    isRunning,
    isInstalling,
    currentTaskState,
    launch,
    stop,
    kill,
    setActivePage,
    language,
    translations,
  } = useApp();
  const { t } = useTranslation(translations, language);
  const [killArmed, setKillArmed] = useState(false);
  const [killBusy, setKillBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedRuntimeDef = useMemo(
    () => runtimeDefs.find((item) => item.id === selectedRuntime) || null,
    [runtimeDefs, selectedRuntime],
  );
  const hasInstalledRuntime = Boolean(selectedRuntime && runtimes[selectedRuntime]?.installed);
  const isStoppingTask = currentTaskState.task_type === 'stop'
    && (currentTaskState.state === 'pending' || currentTaskState.state === 'running');

  useEffect(() => {
    if (!killArmed) return;
    const timer = window.setTimeout(() => setKillArmed(false), KILL_CONFIRM_WINDOW_MS);
    return () => window.clearTimeout(timer);
  }, [killArmed]);

  useEffect(() => {
    if (!isRunning) {
      setKillArmed(false);
      setKillBusy(false);
    }
  }, [isRunning]);

  const handleLaunch = async () => {
    setErrorMessage(null);
    if (!selectedRuntime || !hasInstalledRuntime) {
      setActivePage('runtime');
      return;
    }
    if (!launchPreflight.ready) {
      setActivePage('launch');
      return;
    }
    const result = await launch(selectedRuntime);
    if (result.error) {
      setErrorMessage(result.error);
      setActivePage('launch');
    }
  };

  const handleStop = () => {
    setErrorMessage(null);
    void stop();
  };

  const confirmKill = async () => {
    if (!isRunning) {
      return;
    }
    setKillBusy(true);
    setErrorMessage(null);
    const result = await kill();
    if (result.error) {
      setErrorMessage(result.error);
    }
    setKillBusy(false);
    setKillArmed(false);
  };

  const handleKill = async () => {
    if (!isRunning) {
      return;
    }
    if (!killArmed) {
      setKillArmed(true);
      return;
    }
    await confirmKill();
  };

  const helperText = (() => {
    if (isInstalling) return t('global_run_installing_hint');
    if (isStoppingTask) return language === 'zh' ? '正在请求训练器优雅停止…' : 'Requesting graceful trainer shutdown…';
    if (!selectedRuntimeDef) return t('global_run_select_runtime');
    if (!hasInstalledRuntime) return t('global_run_runtime_missing');
    if (!launchPreflight.ready) return t('global_run_preflight_blocked');
    return language === 'zh' ? selectedRuntimeDef.name_zh : selectedRuntimeDef.name_en;
  })();

  return (
    <div className="px-4 pb-4">
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('global_run_title')}
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {helperText}
            </div>
          </div>
          <span
            className="px-2 py-1 rounded-full text-[10px] font-semibold"
            style={{
              backgroundColor: isStoppingTask ? 'var(--warning-subtle)' : isRunning ? 'var(--success-subtle)' : 'var(--bg-input)',
              color: isStoppingTask ? 'var(--warning-text)' : isRunning ? 'var(--success-text)' : 'var(--text-secondary)',
              border: `1px solid ${isStoppingTask ? 'var(--warning-border)' : isRunning ? 'var(--success-border)' : 'var(--border-card)'}`,
            }}
          >
            {isStoppingTask
              ? (language === 'zh' ? '停止中' : 'Stopping')
              : isRunning ? t('status_running') : t('status_stopped')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={handleLaunch}
            disabled={isRunning || isInstalling}
            className="btn-interactive flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            <Play size={16} />
            {t('btn_launch')}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleStop}
              disabled={!isRunning || isStoppingTask}
              className="btn-interactive flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isStoppingTask ? 'var(--warning-subtle)' : 'var(--bg-input)',
                color: isStoppingTask ? 'var(--warning-text)' : 'var(--text-secondary)',
                border: `1px solid ${isStoppingTask ? 'var(--warning-border)' : 'var(--border-card)'}`,
              }}
            >
              <Square size={14} />
              {isStoppingTask
                ? (language === 'zh' ? '停止中…' : 'Stopping…')
                : t('btn_stop')}
            </button>
            <button
              onClick={() => { void handleKill(); }}
              disabled={!isRunning || killBusy}
              className="btn-interactive flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: killArmed ? 'var(--danger)' : 'var(--danger-subtle)',
                color: killArmed ? '#ffffff' : 'var(--danger-text)',
                border: `1px solid ${killArmed ? 'var(--danger)' : 'var(--danger-border)'}`,
              }}
            >
              <OctagonAlert size={14} />
              {killArmed ? t('global_run_kill_confirm') : t('global_run_kill')}
            </button>
          </div>
        </div>

        {killArmed && (
          <div
            className="rounded-xl px-3 py-2 text-[11px] space-y-3"
            style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{t('global_run_kill_warning')}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKillArmed(false)}
                disabled={killBusy}
                className="btn-interactive px-3 py-2 rounded-lg text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-secondary)',
                }}
              >
                {t('global_run_kill_cancel')}
              </button>
              <button
                type="button"
                onClick={() => { void confirmKill(); }}
                disabled={killBusy}
                className="btn-interactive px-3 py-2 rounded-lg text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--danger)',
                  border: '1px solid var(--danger)',
                  color: '#ffffff',
                }}
              >
                {t('global_run_kill_confirm_action')}
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div
            className="rounded-xl px-3 py-2 text-[11px]"
            style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
          >
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
