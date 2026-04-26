import React from 'react';
import { Puzzle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { PluginInfo } from '../api/types';

export function ExtensionsPage() {
  const { plugins, togglePlugin, language, translations } = useApp();
  const { t } = useTranslation(translations, language);

  if (plugins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in" style={{ color: 'var(--text-muted)' }}>
        <Puzzle size={48} />
        <p>{t('extension_no_plugins')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('extension_title')}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('extension_note')}</p>
      </div>

      <div className="space-y-3">
        {plugins.map((plugin) => (
          <PluginCard
            key={plugin.plugin_id}
            plugin={plugin}
            onToggle={(enabled) => togglePlugin(plugin.plugin_id, enabled)}
          />
        ))}
      </div>
    </div>
  );
}

function PluginCard({
  plugin,
  onToggle,
}: {
  plugin: PluginInfo;
  onToggle: (enabled: boolean) => void;
}) {
  const { language, translations } = useApp();
  const { t } = useTranslation(translations, language);

  return (
    <div
      className="card-interactive rounded-xl p-4 flex items-center justify-between"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{plugin.name}</h4>
          {plugin.version && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}>
              {plugin.version}
            </span>
          )}
        </div>
        <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{plugin.description}</p>
        {plugin.error && (
          <p className="text-xs mt-1" style={{ color: 'var(--danger-text)' }}>{plugin.error}</p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4">
        <span className="text-[10px] font-medium" style={{ color: plugin.enabled ? 'var(--success-text)' : 'var(--text-dim)' }}>
          {plugin.enabled ? t('extension_enabled') : t('extension_disabled')}
        </span>
        <button
          onClick={() => onToggle(!plugin.enabled)}
          className="btn-interactive w-10 h-5 rounded-full relative transition-colors"
          style={{ backgroundColor: plugin.enabled ? 'var(--accent)' : 'var(--bg-input)' }}
        >
          <div
            className="absolute top-1 w-3 h-3 bg-white rounded-full transition-all"
            style={{ left: plugin.enabled ? 'auto' : '4px', right: plugin.enabled ? '4px' : 'auto' }}
          />
        </button>
      </div>
    </div>
  );
}
