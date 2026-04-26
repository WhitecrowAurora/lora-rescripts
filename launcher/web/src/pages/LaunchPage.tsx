import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
  Settings,
  Download,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { CompatibilitySummary } from '../components/CompatibilitySummary';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

export function LaunchPage() {
  const {
    runtimes,
    runtimeDefs,
    selectedRuntime,
    settings,
    updateSettings,
    isRunning,
    isInstalling,
    runtimeRecommendation,
    runtimeCompatibility,
    launchPreflight,
    launchPlan,
    healthReport,
    updateInfo,
    launch,
    stop,
    setActivePage,
    language,
    translations,
  } = useApp();
  const { t } = useTranslation(translations, language);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const currentDef = runtimeDefs.find((d) => d.id === selectedRuntime);
  const currentStatus = selectedRuntime ? runtimes[selectedRuntime] : null;
  const name = currentDef
    ? language === 'zh'
      ? currentDef.name_zh
      : currentDef.name_en
    : null;
  const installedRuntimeCount = useMemo(
    () => Object.values(runtimes).filter((status) => status.installed).length,
    [runtimes],
  );

  const noRuntimeAtAll = !selectedRuntime || !currentStatus?.installed;
  const recommendedRuntimeDef = useMemo(() => {
    const targetId = runtimeRecommendation?.selected_runtime_id;
    if (!targetId) return null;
    return runtimeDefs.find((item) => item.id === targetId) || null;
  }, [runtimeRecommendation, runtimeDefs]);
  const recommendedRuntimeName = useMemo(() => {
    if (!recommendedRuntimeDef) return runtimeRecommendation?.selected_runtime_id || null;
    return language === 'zh' ? recommendedRuntimeDef.name_zh : recommendedRuntimeDef.name_en;
  }, [recommendedRuntimeDef, runtimeRecommendation, language]);
  const recommendedRuntimePathHint = recommendedRuntimeDef?.env_dir_names?.length
    ? `.\\env\\${recommendedRuntimeDef.env_dir_names[0]}`
    : '.\\env';
  const showOnboarding = installedRuntimeCount === 0 && !settings.onboarding_dismissed;
  const selectedRuntimeCompatibility = selectedRuntime ? (runtimeCompatibility[selectedRuntime] || []) : [];
  const healthPrimaryFindings = healthReport?.primary_findings || [];

  useEffect(() => {
    setLaunchError(null);
  }, [selectedRuntime, settings, launchPreflight.ready]);

  const handleLaunch = async () => {
    if (noRuntimeAtAll) {
      setActivePage('runtime');
      return;
    }
    if (isRunning) {
      stop();
      return;
    }
    const result = await launch(selectedRuntime);
    if (result.error) {
      setLaunchError(result.error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in animate-slide-in-up">
      {showOnboarding && (
        <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent-border)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info size={18} style={{ color: 'var(--accent-text)' }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('onboarding_title')}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {t('onboarding_desc')}
                </div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ onboarding_dismissed: true })}
              className="btn-interactive px-3 py-2 rounded-lg text-xs"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              {t('onboarding_dismiss')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                1. {t('onboarding_step_runtime_title')}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('onboarding_step_runtime_desc', { runtime: recommendedRuntimeName || t('runtime_selection') })}
              </div>
            </div>
            <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                2. {t('onboarding_step_python_title')}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('onboarding_step_python_desc', { dir: recommendedRuntimePathHint })}
              </div>
            </div>
            <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                3. {t('onboarding_step_install_title')}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('onboarding_step_install_desc')}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActivePage('runtime')}
              className="btn-interactive btn-accent-glow px-4 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              <Settings size={14} />
              {t('onboarding_open_runtime')}
            </button>
            <button
              onClick={() => setActivePage('install')}
              className="btn-interactive px-4 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              <Download size={14} />
              {t('onboarding_open_install')}
            </button>
          </div>
        </div>
      )}

      {updateInfo?.has_update && updateInfo.latest && (
        <div
          className="rounded-2xl p-4 flex items-start justify-between gap-4"
          style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
        >
          <div className="flex items-start gap-3">
            <RefreshCw size={18} style={{ color: 'var(--accent-text)' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--accent-text)' }}>
                {t('update_available_banner', { version: updateInfo.latest.display })}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('update_available_banner_desc')}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActivePage('about')}
            className="btn-interactive btn-accent-glow px-3 py-2 rounded-lg text-xs font-medium"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            {t('view_updates')}
          </button>
        </div>
      )}

      <div
        className="relative overflow-hidden group rounded-2xl p-6 backdrop-blur-md"
        style={{ background: 'linear-gradient(135deg, var(--accent-subtle), var(--accent-subtle))', border: '1px solid var(--border-card)' }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: 'var(--accent)' }}>
          <Zap size={120} />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {name || t('no_runtime_selected')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isRunning
                ? t('status_running')
                : launchPreflight.ready && currentStatus?.installed
                ? t('status_ready')
                : currentStatus || selectedRuntime
                ? t('status_not_ready')
                : t('select_runtime_first')}
            </p>
          </div>
        </div>
        {currentDef && (
          <div className="flex gap-2">
            {currentDef.category === 'nvidia' && (
              <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success-text)', border: '1px solid var(--success-border)' }}>
                NVIDIA
              </span>
            )}
            {currentDef.experimental && (
              <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}>
                {t('experimental_badge')}
              </span>
            )}
            {currentStatus?.installed && (
              <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}>
                {t('status_installed')}
              </span>
            )}
          </div>
        )}
      </div>

      {runtimeRecommendation && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info size={18} style={{ color: 'var(--accent-text)' }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('runtime_recommendation_title')}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? runtimeRecommendation.reason_zh : runtimeRecommendation.reason_en}
                </div>
                {recommendedRuntimeName && (
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {t('runtime_recommendation_pick', { runtime: recommendedRuntimeName })}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setActivePage('runtime')}
              className="btn-interactive px-3 py-2 rounded-lg text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              {t('runtime_selection')}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selectedRuntimeCompatibility.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <CompatibilitySummary
            entries={selectedRuntimeCompatibility}
            language={language}
            translations={translations}
          />
        </div>
      )}

      {launchPlan && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {language === 'zh' ? launchPlan.title_zh : launchPlan.title_en}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? launchPlan.summary_zh : launchPlan.summary_en}
              </div>
            </div>
            <span
              className="px-2 py-1 text-[10px] rounded"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}
            >
              {launchPlan.action.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? '执行步骤' : 'Steps'}
              </div>
              <div className="space-y-2 mt-2">
                {launchPlan.steps.map((step) => (
                  <div key={step.id}>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? step.label_zh : step.label_en}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'zh' ? step.detail_zh : step.detail_en}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? '命令预览' : 'Command preview'}
              </div>
              <div className="space-y-2 mt-2">
                {launchPlan.commands.map((command, index) => (
                  <div key={`${command.executable}-${index}`}>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? command.label_zh : command.label_en}
                    </div>
                    <div className="text-[11px] font-mono mt-0.5 break-all" style={{ color: 'var(--text-secondary)' }}>
                      {command.command_preview}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {launchPlan.env_changes.length > 0 && (
            <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? '环境变量变更' : 'Environment changes'}
              </div>
              <div className="flex flex-wrap gap-2">
                {launchPlan.env_changes.slice(0, 10).map((change) => (
                  <span
                    key={`${change.mode}-${change.key}`}
                    className="text-[10px] px-2 py-1 rounded"
                    title={language === 'zh' ? change.source_zh : change.source_en}
                    style={{
                      backgroundColor: change.mode === 'set' ? 'var(--accent-subtle)' : 'var(--warning-subtle)',
                      color: change.mode === 'set' ? 'var(--accent-text)' : 'var(--warning-text)',
                      border: `1px solid ${change.mode === 'set' ? 'var(--accent-border)' : 'var(--warning-border)'}`,
                    }}
                  >
                    {change.mode === 'set' ? `${change.key}=${change.value}` : `clear ${change.key}`}
                  </span>
                ))}
              </div>
              {launchPlan.env_changes.length > 10 && (
                <div className="text-[11px] mt-2" style={{ color: 'var(--text-dim)' }}>
                  {language === 'zh'
                    ? `其余 ${launchPlan.env_changes.length - 10} 项变更已省略`
                    : `${launchPlan.env_changes.length - 10} more changes omitted`}
                </div>
              )}
            </div>
          )}

          {launchPlan.notes.length > 0 && (
            <div className="mt-3 space-y-2">
              {launchPlan.notes.map((note, index) => (
                <div
                  key={`${note.severity}-${index}`}
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: note.severity === 'warn' ? 'var(--warning-subtle)' : 'var(--accent-subtle)',
                    border: `1px solid ${note.severity === 'warn' ? 'var(--warning-border)' : 'var(--accent-border)'}`,
                  }}
                >
                  <div className="text-xs" style={{ color: note.severity === 'warn' ? 'var(--warning-text)' : 'var(--accent-text)' }}>
                    {language === 'zh' ? note.message_zh : note.message_en}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {healthPrimaryFindings.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('health_primary_findings')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {healthReport?.overall_status === 'critical' ? t('health_status_critical') : t('health_status_attention')}
              </div>
            </div>
            <button
              onClick={() => setActivePage('about')}
              className="btn-interactive px-3 py-2 rounded-lg text-xs"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              {t('runtime_open_health_report')}
            </button>
          </div>
          <div className="space-y-3">
            {healthPrimaryFindings.map((finding) => {
              const isCritical = finding.severity === 'critical';
              const isWarning = finding.severity === 'warn';
              const accentColor = isCritical ? 'var(--danger-text)' : isWarning ? 'var(--warning-text)' : 'var(--accent-text)';
              return (
                <div
                  key={finding.code}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: isCritical ? 'var(--danger-subtle)' : isWarning ? 'var(--warning-subtle)' : 'var(--accent-subtle)',
                    border: `1px solid ${isCritical ? 'var(--danger-border)' : isWarning ? 'var(--warning-border)' : 'var(--accent-border)'}`,
                  }}
                >
                  <div className="text-sm font-medium" style={{ color: accentColor }}>
                    {language === 'zh' ? finding.title_zh : finding.title_en}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'zh' ? finding.message_zh : finding.message_en}
                  </div>
                  <div className="text-xs mt-2" style={{ color: accentColor }}>
                    {language === 'zh' ? finding.next_step_zh : finding.next_step_en}
                  </div>
                  {finding.action_page && (
                    <button
                      onClick={() => setActivePage(finding.action_page!)}
                      className="btn-interactive mt-3 px-3 py-2 rounded-lg text-xs"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                    >
                      {t('open_related_page')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('launch_preflight_title')}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {launchPreflight.ready ? t('launch_preflight_ready') : t('launch_preflight_fix_required')}
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: launchPreflight.ready ? 'var(--success-subtle)' : 'var(--warning-subtle)',
              color: launchPreflight.ready ? 'var(--success-text)' : 'var(--warning-text)',
              border: `1px solid ${launchPreflight.ready ? 'var(--success-border)' : 'var(--warning-border)'}`,
            }}
          >
            {launchPreflight.ready ? t('status_ready') : t('status_not_ready')}
          </span>
        </div>
        {launchPreflight.issues.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--success-text)' }}>
            {t('launch_preflight_no_issues')}
          </div>
        ) : (
          <div className="space-y-3">
            {launchPreflight.issues.map((issue) => {
              const isError = issue.severity === 'error';
              const isWarning = issue.severity === 'warning';
              return (
                <div
                  key={issue.code}
                  className="rounded-xl p-4 flex items-start justify-between gap-4"
                  style={{
                    backgroundColor: isError ? 'var(--danger-subtle)' : isWarning ? 'var(--warning-subtle)' : 'var(--bg-input)',
                    border: `1px solid ${isError ? 'var(--danger-border)' : isWarning ? 'var(--warning-border)' : 'var(--border-card)'}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} style={{ color: isError ? 'var(--danger-text)' : isWarning ? 'var(--warning-text)' : 'var(--text-secondary)' }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: isError ? 'var(--danger-text)' : isWarning ? 'var(--warning-text)' : 'var(--text-primary)' }}>
                        {language === 'zh' ? issue.title_zh : issue.title_en}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {language === 'zh' ? issue.message_zh : issue.message_en}
                      </div>
                    </div>
                  </div>
                  {issue.action_page && (
                    <button
                      onClick={() => setActivePage(issue.action_page!)}
                      className="btn-interactive px-3 py-2 rounded-lg text-xs whitespace-nowrap"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                    >
                      {t('open_related_page')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {launchError && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)' }}>
          <XCircle size={18} style={{ color: 'var(--danger-text)' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--danger-text)' }}>
              {t('launch_failed')}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {launchError}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('host'), value: settings.host },
          { label: t('port'), value: String(settings.port) },
          { label: t('mode'), value: settings.safe_mode ? t('mode_safe') : t('mode_normal') },
        ].map((item) => (
          <div
            key={item.label}
            className="card-interactive rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
            <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center py-12 space-y-8">
        <button
          onClick={handleLaunch}
          disabled={isInstalling}
          className={`relative group w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
            isRunning ? 'scale-95' : 'hover:scale-105'
          } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {/* Breathing glow ring (idle, ready) */}
          {!isRunning && !noRuntimeAtAll && launchPreflight.ready && (
            <div
              className="absolute inset-[-12px] rounded-full launch-breathe-ring"
              style={{ border: `2px solid var(--accent)`, opacity: 0.25 }}
            />
          )}
          {/* Outer glow */}
          <div
            className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 ${
              isRunning ? 'animate-pulse' : ''
            }`}
            style={{ backgroundColor: isRunning ? 'var(--danger)' : noRuntimeAtAll || !launchPreflight.ready ? 'var(--danger)' : 'var(--accent)', opacity: 0.2 }}
          />
          <div className="absolute inset-0 rounded-full border-2 group-hover:border-white/20 transition-colors" style={{ borderColor: 'var(--border-card)' }} />

          <div
            className="z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden"
            style={{
              backgroundColor: isRunning
                ? 'var(--bg-card)'
                : noRuntimeAtAll || !launchPreflight.ready
                ? 'var(--danger-subtle)'
                : 'var(--accent)',
              color: isRunning
                ? 'var(--danger-text)'
                : noRuntimeAtAll || !launchPreflight.ready
                ? 'var(--danger-text)'
                : '#ffffff',
            }}
          >
            {/* Spinning ring when running */}
            {isRunning && (
              <div
                className="absolute inset-0 rounded-full launch-spinner-ring"
                style={{
                  border: '3px solid transparent',
                  borderTopColor: 'var(--danger)',
                  borderRightColor: 'var(--danger)',
                  opacity: 0.4,
                }}
              />
            )}
            {isRunning ? (
              <Activity size={48} className="animate-pulse" />
            ) : noRuntimeAtAll || !launchPreflight.ready ? (
              <XCircle size={48} />
            ) : (
              <Play size={48} fill="currentColor" />
            )}
            <span className="mt-4 font-bold tracking-widest text-lg">
              {isRunning ? t('btn_stop') : noRuntimeAtAll ? t('no_runtime_installed') : !launchPreflight.ready ? t('launch_blocked') : t('btn_launch')}
            </span>
          </div>
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setActivePage('runtime')}
            className="btn-interactive px-4 py-2 rounded-xl text-xs flex items-center gap-2"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Settings size={14} />
            {t('runtime_selection')}
          </button>
          <button
            onClick={() => setActivePage('install')}
            className="btn-interactive px-4 py-2 rounded-xl text-xs flex items-center gap-2"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Download size={14} />
            {t('install')}
          </button>
        </div>
      </div>
    </div>
  );
}
