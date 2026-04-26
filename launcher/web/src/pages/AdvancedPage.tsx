import React from 'react';
import { Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

const attentionOptions = [
  { key: 'default', labelKey: 'attention_default', descKey: 'attention_default_desc' },
  { key: 'prefer_sage', labelKey: 'attention_prefer_sage', descKey: 'attention_prefer_sage_desc' },
  { key: 'prefer_flash', labelKey: 'attention_prefer_flash', descKey: 'attention_prefer_flash_desc' },
  { key: 'force_sdpa', labelKey: 'attention_force_sdpa', descKey: 'attention_force_sdpa_desc' },
];

export function AdvancedPage() {
  const { settings, updateSettings, language, translations } = useApp();
  const { t } = useTranslation(translations, language);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Attention policy */}
      <section className="card-interactive rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
        <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <Zap size={16} style={{ color: 'var(--accent-text)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t('attention_policy')}</h3>
        </div>
        <div className="p-4 space-y-4">
          {attentionOptions.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-4 p-3 rounded-xl cursor-pointer group btn-interactive"
              onClick={() => updateSettings({ attention_policy: opt.key })}
            >
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors" style={{ borderColor: settings.attention_policy === opt.key ? 'var(--accent)' : 'var(--text-dim)' }}>
                {settings.attention_policy === opt.key && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                )}
              </div>
              <div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{t(opt.labelKey)}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t(opt.descKey)}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Toggles grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Network / safety toggles */}
        <div className="card-interactive rounded-2xl p-4 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <ToggleRow
            label={t('safe_mode')}
            checked={settings.safe_mode}
            onChange={(v) => updateSettings({ safe_mode: v })}
          />
          <ToggleRow
            label={t('cn_mirror')}
            checked={settings.cn_mirror}
            onChange={(v) => updateSettings({ cn_mirror: v })}
          />
          <ToggleRow
            label={t('listen')}
            checked={settings.listen}
            onChange={(v) => updateSettings({ listen: v })}
          />
        </div>

        {/* Feature toggles */}
        <div className="card-interactive rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            {language === 'zh' ? '外部依赖管理' : 'External dependencies'}
          </div>
          <CheckboxRow
            label={t('disable_tensorboard')}
            checked={settings.disable_tensorboard}
            onChange={(v) => updateSettings({ disable_tensorboard: v })}
          />
          <CheckboxRow
            label={t('disable_tageditor')}
            checked={settings.disable_tageditor}
            onChange={(v) => updateSettings({ disable_tageditor: v })}
          />
          <CheckboxRow
            label={t('disable_auto_mirror')}
            checked={settings.disable_auto_mirror}
            onChange={(v) => updateSettings({ disable_auto_mirror: v })}
          />
          <CheckboxRow
            label={t('dev_mode')}
            checked={settings.dev_mode}
            onChange={(v) => updateSettings({ dev_mode: v })}
          />
        </div>
      </div>

      {/* Host / Port */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-interactive rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <label className="text-xs block mb-2" style={{ color: 'var(--text-muted)' }}>{t('host')}</label>
          <input
            type="text"
            value={settings.host}
            onChange={(e) => updateSettings({ host: e.target.value })}
            className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-border)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-card)'}
          />
        </div>
        <div className="card-interactive rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <label className="text-xs block mb-2" style={{ color: 'var(--text-muted)' }}>{t('port')}</label>
          <input
            type="number"
            value={settings.port}
            onChange={(e) => updateSettings({ port: Number(e.target.value) || 28000 })}
            className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-border)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-card)'}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="btn-interactive w-10 h-5 rounded-full relative transition-colors"
        style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--bg-input)' }}
      >
        <div
          className="absolute top-1 w-3 h-3 bg-white rounded-full transition-all"
          style={{ left: checked ? 'auto' : '4px', right: checked ? '4px' : 'auto' }}
        />
      </button>
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer btn-interactive rounded px-1 py-0.5"
      onClick={() => onChange(!checked)}
    >
      <div
        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
        style={{
          backgroundColor: checked ? 'var(--accent)' : 'transparent',
          borderColor: checked ? 'var(--accent)' : 'var(--text-dim)',
        }}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}
