import React, { useMemo, useState } from 'react';
import { Download, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { CATEGORY_ORDER } from '../api/types';

export function InstallPage() {
  const { runtimes, runtimeDefs, runtimeRecommendation, initializeRuntime, installRuntime, isInstalling, currentTaskState, settings, setActivePage, language, translations } = useApp();
  const { t } = useTranslation(translations, language);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(true);

  const notInstalled = runtimeDefs.filter((d) => {
    const s = runtimes[d.id];
    return !s || !s.installed;
  });
  const isInitializingTask = currentTaskState.task_type === 'initialize';
  const recommendedRuntimeName = useMemo(() => {
    const targetId = runtimeRecommendation?.selected_runtime_id;
    if (!targetId) return null;
    const def = runtimeDefs.find((item) => item.id === targetId);
    if (!def) return targetId;
    return language === 'zh' ? def.name_zh : def.name_en;
  }, [runtimeRecommendation, runtimeDefs, language]);
  const recommendedRuntimePathHint = useMemo(() => {
    const targetId = runtimeRecommendation?.selected_runtime_id;
    if (!targetId) return '.\\env';
    const def = runtimeDefs.find((item) => item.id === targetId);
    if (!def || def.env_dir_names.length === 0) return '.\\env';
    return `.\\env\\${def.env_dir_names[0]}`;
  }, [runtimeRecommendation, runtimeDefs]);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: t(`category_${cat}`),
    defs: notInstalled.filter((d) => d.category === cat),
  })).filter((g) => g.defs.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('install_page_title')}</h2>

      {recommendedRuntimeName && (
        <div className="rounded-xl p-3 text-sm flex items-center gap-2" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)' }}>
          <AlertCircle size={16} />
          {t('install_recommended_runtime', { runtime: recommendedRuntimeName })}
        </div>
      )}

      {settings.cn_mirror && (
        <div className="rounded-xl p-3 text-sm flex items-center gap-2" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)' }}>
          <AlertCircle size={16} />
          {t('install_cn_mirror_note')}
        </div>
      )}

      {showInstallHelp && (
        <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('install_help_title')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {t('install_help_desc')}
              </div>
            </div>
            <button
              onClick={() => setShowInstallHelp(false)}
              className="btn-interactive w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}
              aria-label={t('btn_close')}
              title={t('btn_close')}
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>1. {t('install_help_step_runtime_title')}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('install_help_step_runtime_desc', { runtime: recommendedRuntimeName || t('runtime_selection') })}
              </div>
            </div>
            <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>2. {t('install_help_step_python_title')}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('install_help_step_python_desc', { dir: recommendedRuntimePathHint })}
              </div>
            </div>
            <div className="card-interactive rounded-xl p-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>3. {t('install_help_step_finish_title')}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('install_help_step_finish_desc')}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActivePage('runtime')}
              className="btn-interactive px-4 py-2 rounded-xl text-xs"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              {t('onboarding_open_runtime')}
            </button>
            <button
              onClick={() => setActivePage('launch')}
              className="btn-interactive btn-accent-glow px-4 py-2 rounded-xl text-xs"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              {t('install_open_launch')}
            </button>
          </div>
        </div>
      )}

      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('install_prerequisites')}</p>

      {actionError && (
        <div className="rounded-xl p-3 text-sm flex items-start gap-2" style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-12 h-12 mx-auto" style={{ color: 'var(--success)', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2">{language === 'zh' ? '所有运行时已安装' : 'All runtimes installed'}</p>
        </div>
      ) : (
      grouped.map((group) => (
        <div key={group.category}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            {group.label}
          </h3>
          <div className="space-y-3">
            {group.defs.map((def) => {
              const name = language === 'zh' ? def.name_zh : def.name_en;
              const desc = language === 'zh' ? def.desc_zh : def.desc_en;
              const status = runtimes[def.id];
              const isInitialized = status?.status_text === 'initialized';
              const isPartial = status?.status_text === 'partial';
              const runtimePathHint = def.env_dir_names.length > 0 ? `.\\env\\${def.env_dir_names[0]}` : '.\\env';
              const needsInitialize = !status?.python_exists;
              const actionLabel = isInstalling
                ? isInitializingTask
                  ? t('btn_initializing')
                  : t('btn_installing')
                : needsInitialize
                  ? t('btn_initialize')
                  : t('btn_install');
              const installHint = isInitialized
                ? t('install_ready_runtime_hint')
                : isPartial
                  ? t('install_incomplete_runtime_hint', { dir: runtimePathHint })
                  : t('install_prepare_runtime_hint', { dir: runtimePathHint });

              return (
                <div
                  key={def.id}
                  className="card-interactive rounded-xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</h4>
                      {def.experimental && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}>
                          {t('experimental_badge')}
                        </span>
                      )}
                      {(isInitialized || isPartial) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}>
                          {t(`status_${status?.status_text || 'partial'}`)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                    {installHint && (
                      <p className="text-xs mt-2" style={{ color: 'var(--warning-text)' }}>{installHint}</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      setActionError(null);
                      const result = needsInitialize
                        ? await initializeRuntime(def.id)
                        : await installRuntime(def.id);
                      if (result.error) {
                        setActionError(result.error);
                      }
                    }}
                    disabled={isInstalling}
                    className={`btn-interactive ${isInstalling ? 'btn-shimmer' : 'btn-accent-glow'} flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: 'var(--accent)' }}
                    onMouseEnter={(e) => { if (!isInstalling) e.currentTarget.style.backgroundColor = 'var(--accent-light)'; }}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                  >
                    <Download size={16} />
                    {actionLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))
      )}
    </div>
  );
}
