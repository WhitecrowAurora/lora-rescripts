import React, { useState } from 'react';
import { Download, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import { CompatibilitySummary } from '../components/CompatibilitySummary';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { CATEGORY_ORDER } from '../api/types';
import type { RuntimeCapabilityTag, RuntimeStatus } from '../api/types';

function StatusBadge({ status }: { status: RuntimeStatus }) {
  const { language, translations } = useApp();
  const { t } = useTranslation(translations, language);

  const statusConfig = {
    installed: { label: t('status_installed'), Icon: CheckCircle2 as React.FC<{ size?: number }> },
    partial: { label: t('status_partial'), Icon: AlertCircle as React.FC<{ size?: number }> },
    missing: { label: t('status_missing'), Icon: XCircle as React.FC<{ size?: number }> },
  }[status.status_text] ?? { label: status.status_text, Icon: XCircle as React.FC<{ size?: number }> };

  const colorMap: Record<string, { bg: string; text: string }> = {
    installed: { bg: 'var(--success-subtle)', text: 'var(--success-text)' },
    partial: { bg: 'var(--warning-subtle)', text: 'var(--warning-text)' },
    missing: { bg: 'var(--bg-card)', text: 'var(--text-muted)' },
  };
  const colors = colorMap[status.status_text] || colorMap.missing;

  const StatusIcon = statusConfig.Icon;

  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <StatusIcon size={10} />
      {statusConfig.label}
    </span>
  );
}

function CapabilityTagList({
  tags,
  language,
}: {
  tags: RuntimeCapabilityTag[];
  language: string;
}) {
  const toneMap: Record<RuntimeCapabilityTag['tone'], { bg: string; text: string; border: string }> = {
    success: { bg: 'var(--success-subtle)', text: 'var(--success-text)', border: 'var(--success-border)' },
    accent: { bg: 'var(--accent-subtle)', text: 'var(--accent-text)', border: 'var(--accent-border)' },
    warning: { bg: 'var(--warning-subtle)', text: 'var(--warning-text)', border: 'var(--warning-border)' },
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const colors = toneMap[tag.tone] || toneMap.accent;
        return (
          <span
            key={tag.id}
            className="text-[10px] px-2 py-1 rounded-full"
            style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {language === 'zh' ? tag.label_zh : tag.label_en}
          </span>
        );
      })}
    </div>
  );
}

export function RuntimePage() {
  const {
    runtimes,
    runtimeDefs,
    selectedRuntime,
    selectRuntime,
    installRuntime,
    isInstalling,
    runtimeRecommendation,
    runtimeCompatibility,
    language,
    translations,
  } = useApp();
  const { t } = useTranslation(translations, language);
  const [actionError, setActionError] = useState<string | null>(null);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: t(`category_${cat}`),
    defs: runtimeDefs.filter((d) => d.category === cat),
  })).filter((g) => g.defs.length > 0);
  const selectedDef = selectedRuntime ? runtimeDefs.find((item) => item.id === selectedRuntime) || null : null;
  const selectedStatus = selectedRuntime ? runtimes[selectedRuntime] || null : null;
  const selectedRuntimeName = selectedDef
    ? (language === 'zh' ? selectedDef.name_zh : selectedDef.name_en)
    : null;

  return (
    <div className="space-y-6 animate-fade-in animate-slide-in-right">
      {actionError && (
        <div className="rounded-xl p-3 text-sm flex items-start gap-2" style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {runtimeRecommendation && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start gap-3">
            <Sparkles size={18} style={{ color: 'var(--accent-text)' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('runtime_recommendation_title')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? runtimeRecommendation.reason_zh : runtimeRecommendation.reason_en}
              </div>
              {runtimeRecommendation.gpu_name && (
                <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('runtime_detected_gpu', { gpu: runtimeRecommendation.gpu_name })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedDef && selectedStatus && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('runtime_details_title')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {selectedRuntimeName || selectedRuntime}
              </div>
            </div>
            <StatusBadge status={selectedStatus} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('runtime_status_label')}</div>
              <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{t(`status_${selectedStatus.status_text}`)}</div>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('runtime_expected_dirs')}</div>
              <div className="text-xs font-mono mt-1 break-all" style={{ color: 'var(--text-primary)' }}>
                {selectedDef.env_dir_names.map((name) => `.\\env\\${name}`).join(', ')}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('runtime_env_dir')}</div>
              <div className="text-xs font-mono mt-1 break-all" style={{ color: 'var(--text-primary)' }}>
                {selectedStatus.env_dir || t('runtime_details_missing')}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('runtime_python_path')}</div>
              <div className="text-xs font-mono mt-1 break-all" style={{ color: 'var(--text-primary)' }}>
                {selectedStatus.python_path || t('runtime_details_missing')}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? '启动入口' : 'Launch entry'}
              </div>
              <div className="text-xs font-mono mt-1 break-all" style={{ color: 'var(--text-primary)' }}>
                {`${selectedDef.launch_entry.script} (${selectedDef.launch_entry.mode})`}
              </div>
            </div>
            <div className="rounded-xl p-3 col-span-2" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('runtime_install_scripts')}</div>
              <div className="text-xs font-mono mt-1 break-all" style={{ color: 'var(--text-primary)' }}>
                {selectedDef.install_scripts.length > 0 ? selectedDef.install_scripts.join(', ') : t('runtime_details_missing')}
              </div>
            </div>
            {selectedDef.runtime_env_vars.length > 0 && (
              <div className="rounded-xl p-3 col-span-2" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '运行时默认环境变量' : 'Runtime default env vars'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDef.runtime_env_vars.map((entry) => (
                    <span
                      key={entry.key}
                      className="text-[10px] px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}
                    >
                      {`${entry.key}=${entry.value}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(selectedDef.capability_tags || []).length > 0 && (
              <div className="rounded-xl p-3 col-span-2" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>{t('runtime_capability_tags')}</div>
                <CapabilityTagList tags={selectedDef.capability_tags || []} language={language} />
              </div>
            )}
            {(language === 'zh' ? selectedDef.notes_zh : selectedDef.notes_en) && (
              <div className="rounded-xl p-3 col-span-2" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '运行时备注' : 'Runtime note'}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'zh' ? selectedDef.notes_zh : selectedDef.notes_en}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {grouped.map((group) => (
        <div key={group.category}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            {group.label}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {group.defs.map((def) => {
              const status = runtimes[def.id];
              const isSelected = selectedRuntime === def.id;
              const name = language === 'zh' ? def.name_zh : def.name_en;
              const desc = language === 'zh' ? def.desc_zh : def.desc_en;
              const compatibilityEntries = runtimeCompatibility[def.id] || [];
              const capabilityTags = def.capability_tags || [];
              const runtimePathHint = def.env_dir_names.length > 0 ? `.\\env\\${def.env_dir_names[0]}` : '.\\env';
              const canInstall = !!status?.python_exists && !isInstalling;
              const installHint = status?.installed
                ? null
                : status?.python_exists
                ? null
                : status?.env_dir
                ? t('install_incomplete_runtime_hint', { dir: runtimePathHint })
                : t('install_prepare_runtime_hint', { dir: runtimePathHint });

              return (
                <div
                  key={def.id}
                  onClick={() => status?.installed && selectRuntime(def.id)}
                  className={`card-interactive p-5 rounded-2xl cursor-pointer`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-card)',
                    border: isSelected ? '1px solid var(--accent-border)' : '1px solid var(--border-card)',
                    boxShadow: isSelected ? '0 0 0 1px var(--accent-ring)' : 'none',
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold border" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent-text)', borderColor: 'var(--border-card)' }}>
                      {name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-2">
                      {status && <StatusBadge status={status} />}
                      {status && !status.installed && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setActionError(null);
                            const result = await installRuntime(def.id);
                            if (result.error) {
                              setActionError(result.error);
                            }
                          }}
                          disabled={!canInstall}
                          className={`btn-interactive ${isInstalling ? 'btn-shimmer' : 'btn-accent-glow'} flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40`}
                          style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
                          onMouseEnter={(e) => { if (canInstall && !isInstalling) e.currentTarget.style.backgroundColor = 'var(--accent-light)'; }}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                        >
                          <Download size={14} />
                          {canInstall ? t('btn_install') : t('install_prepare_first')}
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {name}
                    {def.experimental && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}>
                        {t('experimental_badge')}
                      </span>
                    )}
                    {runtimeRecommendation?.selected_runtime_id === def.id && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}>
                        {t('runtime_recommended_badge')}
                      </span>
                    )}
                    {runtimeRecommendation?.preferred_runtime_id === def.id && runtimeRecommendation.selected_runtime_id !== def.id && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success-text)', border: '1px solid var(--success-border)' }}>
                        {t('runtime_preferred_badge')}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  {capabilityTags.length > 0 && (
                    <div className="mt-3">
                      <CapabilityTagList tags={capabilityTags} language={language} />
                    </div>
                  )}
                  {installHint && (
                    <p className="text-xs mt-2" style={{ color: 'var(--warning-text)' }}>{installHint}</p>
                  )}
                  {compatibilityEntries.length > 0 && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-card)' }}>
                      <CompatibilitySummary
                        entries={compatibilityEntries}
                        language={language}
                        translations={translations}
                        compact
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
