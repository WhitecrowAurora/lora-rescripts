import React from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { PageId } from '../api/types';

const pageLabelKeys: Record<PageId, string> = {
  launch: 'launch',
  runtime: 'runtime',
  managed: 'managed',
  advanced: 'advanced',
  install: 'install',
  extensions: 'extension',
  console: 'console',
  about: 'about',
};

export function Header() {
  const { activePage, setActivePage, gpuStats, isRunning, language, translations } = useApp();
  const { t } = useTranslation(translations, language);

  const gpuLoad = gpuStats.available ? gpuStats.gpu_load : 0;
  const vramUsage = gpuStats.available ? gpuStats.vram_usage : 0;

  return (
    <header className="h-20 flex items-center justify-between px-8 backdrop-blur-sm z-10" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {t(pageLabelKeys[activePage])}
        </h2>
        <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {activePage === 'launch' ? t('status_ready') : t(pageLabelKeys[activePage])}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* GPU Load */}
        {gpuStats.available && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>{t('gpu_load_label')}</span>
                <span className="text-sm font-mono" style={{ color: 'var(--accent-text)' }}>{gpuLoad}%</span>
              </div>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div
                  className="h-full transition-all duration-1000"
                  style={{ width: `${gpuLoad}%`, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>{t('vram_label')}</span>
                <span className="text-sm font-mono" style={{ color: 'var(--secondary-text)' }}>{vramUsage}%</span>
              </div>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div
                  className="h-full transition-all duration-1000"
                  style={{ width: `${vramUsage}%`, backgroundColor: 'var(--secondary)' }}
                />
              </div>
            </div>

            <div className="h-8 w-px mx-2" style={{ backgroundColor: 'var(--border)' }} />
          </>
        )}

        {/* Activity + status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('console')}
            className="p-2 transition-colors relative"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            title={t('console')}
          >
            <Activity size={18} />
            {isRunning && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
            )}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div
              className={`w-2 h-2 rounded-full ${isRunning ? '' : ''}`}
              style={isRunning ? {
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 8px var(--accent-glow)',
              } : {
                backgroundColor: 'var(--danger)',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
              }}
            />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              {isRunning ? t('status_running').toUpperCase() : t('status_stopped').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
