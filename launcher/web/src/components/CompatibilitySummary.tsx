import React from 'react';
import type { RuntimeCompatibilityEntry } from '../api/types';
import { useTranslation } from '../hooks/useTranslation';
import type { Translations } from '../api/types';

const STATUS_ORDER: Array<RuntimeCompatibilityEntry['status']> = [
  'recommended',
  'supported',
  'caution',
  'not_recommended',
];

const STATUS_COLORS: Record<RuntimeCompatibilityEntry['status'], { bg: string; text: string; border: string }> = {
  recommended: {
    bg: 'var(--success-subtle)',
    text: 'var(--success-text)',
    border: 'var(--success-border)',
  },
  supported: {
    bg: 'var(--accent-subtle)',
    text: 'var(--accent-text)',
    border: 'var(--accent-border)',
  },
  caution: {
    bg: 'var(--warning-subtle)',
    text: 'var(--warning-text)',
    border: 'var(--warning-border)',
  },
  not_recommended: {
    bg: 'var(--danger-subtle)',
    text: 'var(--danger-text)',
    border: 'var(--danger-border)',
  },
};

interface CompatibilitySummaryProps {
  entries: RuntimeCompatibilityEntry[];
  language: string;
  translations: Translations;
  compact?: boolean;
}

export function CompatibilitySummary({
  entries,
  language,
  translations,
  compact = false,
}: CompatibilitySummaryProps) {
  const { t } = useTranslation(translations, language);

  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {t('runtime_model_compatibility')}
      </div>
      {STATUS_ORDER.map((status) => {
        const statusEntries = entries.filter((entry) => entry.status === status);
        if (statusEntries.length === 0) {
          return null;
        }
        const colors = STATUS_COLORS[status];
        return (
          <div key={status} className="flex items-start gap-2">
            <div className="text-[11px] min-w-[6.5rem] pt-1" style={{ color: 'var(--text-secondary)' }}>
              {t(`compatibility_status_${status}`)}
            </div>
            <div className="flex flex-wrap gap-2">
              {statusEntries.map((entry) => (
                <span
                  key={entry.model_id}
                  title={language === 'zh' ? entry.reason_zh : entry.reason_en}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {language === 'zh' ? entry.label_zh : entry.label_en}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
