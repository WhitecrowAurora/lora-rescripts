import React, { useState } from 'react';
import { Info, ExternalLink, RefreshCw, Download, CheckCircle2, AlertTriangle, ShieldAlert, ClipboardCopy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

export function AboutPage() {
  const {
    version,
    projectVersion,
    healthReport,
    updateInfo,
    isCheckingUpdates,
    settings,
    updateSettings,
    refreshHealthReport,
    refreshUpdateInfo,
    runUpdater,
    setActivePage,
    language,
    translations,
  } = useApp();
  const { t } = useTranslation(translations, language);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCheckUpdates = async () => {
    setActionError(null);
    await refreshUpdateInfo(true);
  };

  const handleRunUpdater = async () => {
    setActionError(null);
    const result = await runUpdater();
    if (result.error) {
      setActionError(result.error);
    }
  };

  const handleRefreshHealth = async () => {
    setActionError(null);
    await refreshHealthReport();
  };

  const handleCopyHealth = async () => {
    if (!healthReport) return;
    const lines = [
      `Launcher: ${version || 'Unknown'}`,
      `Project: ${projectVersion?.display || 'Unknown'}`,
      `Overall: ${healthReport.overall_status}`,
      `Installed runtimes: ${healthReport.installed_runtime_count}`,
      `Prepared runtimes: ${healthReport.prepared_runtime_count}`,
      `Recommended runtime: ${healthReport.recommended_runtime_id || 'None'}`,
      `Selected runtime: ${healthReport.selected_runtime_id || 'None'}`,
      '',
      ...(healthReport.primary_findings || []).map((finding) => {
        const title = language === 'zh' ? finding.title_zh : finding.title_en;
        const message = language === 'zh' ? finding.message_zh : finding.message_en;
        const nextStep = language === 'zh' ? finding.next_step_zh : finding.next_step_en;
        return `[${finding.severity}] ${title}: ${message} -> ${nextStep}`;
      }),
      '',
      ...healthReport.checks.map((check) => {
        const title = language === 'zh' ? check.title_zh : check.title_en;
        const message = language === 'zh' ? check.message_zh : check.message_en;
        return `[${check.status}] ${title}: ${message}`;
      }),
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
  };

  const healthStatusColor = healthReport?.overall_status === 'healthy'
    ? { text: 'var(--success-text)', Icon: CheckCircle2 }
    : healthReport?.overall_status === 'critical'
      ? { text: 'var(--danger-text)', Icon: ShieldAlert }
      : { text: 'var(--warning-text)', Icon: AlertTriangle };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))', boxShadow: '0 8px 24px var(--accent-shadow)' }}>
          <Info size={40} className="text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>SD-reScripts</h2>
          <span className="text-sm font-mono mt-1 block" style={{ color: 'var(--text-muted)' }}>{t('about_version')}: {version || '—'}</span>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-3">
        <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('about_project')}</div>
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('about_fork')}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('launcher_version')}</div>
            <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{version || '—'}</div>
          </div>
          <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('project_version')}</div>
            <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{projectVersion?.display || 'Unknown'}</div>
          </div>
        </div>

        <div className="card-interactive rounded-xl p-4 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('update_channel')}</div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('update_channel_desc')}</div>
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-card)' }}>
              {(['stable', 'beta'] as const).map((channel) => {
                const active = settings.update_channel === channel;
                return (
                  <button
                    key={channel}
                    onClick={() => updateSettings({ update_channel: channel })}
                    className="btn-interactive px-3 py-2 text-xs"
                    style={{
                      backgroundColor: active ? 'var(--accent)' : 'var(--bg-input)',
                      color: active ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {t(`update_channel_${channel}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('update_status')}</div>
                <div className="text-sm font-medium" style={{ color: updateInfo?.has_update ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                  {updateInfo?.error
                    ? t('update_check_failed')
                    : updateInfo?.has_update && updateInfo.latest
                    ? t('update_available_status', { version: updateInfo.latest.display })
                    : t('update_latest_status')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckUpdates}
                  disabled={isCheckingUpdates}
                  className="btn-interactive px-3 py-2 rounded-lg text-xs disabled:opacity-50"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw size={14} className={isCheckingUpdates ? 'animate-spin' : ''} />
                    {t('check_updates_now')}
                  </span>
                </button>
                <button
                  onClick={handleRunUpdater}
                  className="btn-interactive btn-accent-glow px-3 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Download size={14} />
                    {t('run_updater')}
                  </span>
                </button>
              </div>
            </div>

            {updateInfo?.latest && (
              <div className="mt-3 text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div>{t('update_current_version', { version: updateInfo.current.display })}</div>
                <div>{t('update_latest_version', { version: updateInfo.latest.display })}</div>
                {updateInfo.checked_at && <div>{t('update_last_checked', { time: updateInfo.checked_at })}</div>}
              </div>
            )}

            {updateInfo?.error && (
              <div className="mt-3 text-xs" style={{ color: 'var(--danger-text)' }}>
                {updateInfo.error}
              </div>
            )}

            {actionError && (
              <div className="mt-3 text-xs" style={{ color: 'var(--danger-text)' }}>
                {actionError}
              </div>
            )}

            {updateInfo?.release_url && (
              <a
                href={updateInfo.release_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs"
                style={{ color: 'var(--accent-text)' }}
              >
                {t('view_release_page')}
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {healthReport && (
          <div className="card-interactive rounded-xl p-4 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <healthStatusColor.Icon size={18} style={{ color: healthStatusColor.text }} />
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('health_report_title')}</div>
                  <div className="text-sm font-medium" style={{ color: healthStatusColor.text }}>
                    {t(`health_status_${healthReport.overall_status}`)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'zh' ? healthReport.summary_zh : healthReport.summary_en}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshHealth}
                  className="btn-interactive px-3 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw size={14} />
                    {t('health_report_refresh')}
                  </span>
                </button>
                <button
                  onClick={handleCopyHealth}
                  className="btn-interactive px-3 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                >
                  <span className="inline-flex items-center gap-2">
                    <ClipboardCopy size={14} />
                    {t('health_report_copy')}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('health_installed_runtimes')}</div>
                <div className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{healthReport.installed_runtime_count}</div>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('health_prepared_runtimes')}</div>
                <div className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{healthReport.prepared_runtime_count}</div>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('health_recommended_runtime')}</div>
                <div className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{healthReport.recommended_runtime_id || '—'}</div>
              </div>
            </div>

            {(healthReport.primary_findings || []).length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {t('health_primary_findings')}
                </div>
                {(healthReport.primary_findings || []).map((finding) => {
                  const isCritical = finding.severity === 'critical';
                  const isWarning = finding.severity === 'warn';
                  const accentColor = isCritical ? 'var(--danger-text)' : isWarning ? 'var(--warning-text)' : 'var(--accent-text)';
                  return (
                    <div
                      key={finding.code}
                      className="rounded-xl p-3"
                      style={{
                        backgroundColor: isCritical ? 'var(--danger-subtle)' : isWarning ? 'var(--warning-subtle)' : 'var(--accent-subtle)',
                        border: `1px solid ${isCritical ? 'var(--danger-border)' : isWarning ? 'var(--warning-border)' : 'var(--accent-border)'}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium" style={{ color: accentColor }}>
                            {language === 'zh' ? finding.title_zh : finding.title_en}
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {language === 'zh' ? finding.message_zh : finding.message_en}
                          </div>
                          <div className="text-xs mt-2" style={{ color: accentColor }}>
                            {language === 'zh' ? finding.next_step_zh : finding.next_step_en}
                          </div>
                        </div>
                        {finding.action_page && (
                          <button
                            onClick={() => setActivePage(finding.action_page!)}
                            className="btn-interactive px-3 py-2 rounded-lg text-xs whitespace-nowrap"
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                          >
                            {t('open_related_page')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {healthReport.checks.map((check) => {
                const badgeColor = check.status === 'pass'
                  ? { bg: 'var(--success-subtle)', text: 'var(--success-text)', border: 'var(--success-border)' }
                  : check.status === 'fail'
                    ? { bg: 'var(--danger-subtle)', text: 'var(--danger-text)', border: 'var(--danger-border)' }
                    : check.status === 'warn'
                      ? { bg: 'var(--warning-subtle)', text: 'var(--warning-text)', border: 'var(--warning-border)' }
                      : { bg: 'var(--bg-card)', text: 'var(--text-secondary)', border: 'var(--border-card)' };
                return (
                  <div key={check.code} className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? check.title_zh : check.title_en}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? check.message_zh : check.message_en}
                        </div>
                      </div>
                      <span
                        className="text-[10px] px-2 py-1 rounded whitespace-nowrap"
                        style={{ backgroundColor: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}` }}
                      >
                        {t(`health_check_${check.status}`)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <a
          href="https://github.com/WhitecrowAurora/lora-rescripts"
          target="_blank"
          rel="noopener noreferrer"
          className="card-interactive rounded-xl p-4 flex items-center justify-between block"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
        >
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('about_github')}</div>
            <div className="text-sm" style={{ color: 'var(--accent-text)' }}>WhitecrowAurora/lora-rescripts</div>
          </div>
          <ExternalLink size={16} style={{ color: 'var(--text-muted)' }} />
        </a>
      </div>

      <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{t('about_footer')}</p>
    </div>
  );
}
