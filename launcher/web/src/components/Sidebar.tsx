import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Layers,
  Cloud,
  Settings,
  Download,
  Puzzle,
  Terminal,
  Info,
  Globe,
  HardDrive,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { PageId } from '../api/types';
import { GlobalRunControls } from './GlobalRunControls';

const navItems: { id: PageId; icon: React.ElementType; labelKey: string }[] = [
  { id: 'launch', icon: Play, labelKey: 'launch' },
  { id: 'runtime', icon: Layers, labelKey: 'runtime' },
  { id: 'managed', icon: Cloud, labelKey: 'managed' },
  { id: 'advanced', icon: Settings, labelKey: 'advanced' },
  { id: 'install', icon: Download, labelKey: 'install' },
  { id: 'extensions', icon: Puzzle, labelKey: 'extension' },
  { id: 'console', icon: Terminal, labelKey: 'console' },
  { id: 'about', icon: Info, labelKey: 'about' },
];

export function Sidebar() {
  const { activePage, setActivePage, language, translations, toggleLanguage, toggleTheme, theme, version } = useApp();
  const { t } = useTranslation(translations, language);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Partial<Record<PageId, HTMLButtonElement | null>>>({});
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [indicatorHeight, setIndicatorHeight] = useState(48);

  useEffect(() => {
    const syncIndicator = () => {
      const activeButton = buttonRefs.current[activePage];
      if (!navRef.current || !activeButton) return;
      const offsetTop = activeButton.offsetTop;
      const height = activeButton.offsetHeight;
      setIndicatorTop(offsetTop + 4);
      setIndicatorHeight(Math.max(24, height - 8));
    };

    syncIndicator();
    window.addEventListener('resize', syncIndicator);
    return () => window.removeEventListener('resize', syncIndicator);
  }, [activePage]);

  return (
    <aside className="w-64 h-screen min-h-0 flex flex-col border-r backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Logo */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, var(--accent), var(--secondary))`, boxShadow: `0 4px 12px var(--accent-shadow)` }}>
              <HardDrive size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>SD-reScripts</h1>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-widest" style={{ color: 'var(--text-muted)', marginLeft: '44px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            {version || '—'}
          </span>
        </div>

        {/* Navigation with sliding indicator */}
        <nav className="px-4 space-y-1 relative" ref={navRef}>
          {/* Sliding indicator bar */}
          <div
            className="sidebar-indicator absolute left-0 w-1 rounded-r-full"
            style={{
              top: `${indicatorTop}px`,
              height: `${indicatorHeight}px`,
              backgroundColor: 'var(--accent)',
              boxShadow: `0 0 12px var(--accent-glow)`,
            }}
          />

          {navItems.map((item) => {
            const active = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                ref={(node) => { buttonRefs.current[item.id] = node; }}
                onClick={() => setActivePage(item.id)}
                className={`btn-interactive w-full flex items-center gap-3 px-4 py-3 rounded-xl group ${active ? '' : ''}`}
                style={active ? {
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  boxShadow: `0 4px 12px var(--accent-shadow)`,
                } : {
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = ''; }}
              >
                <Icon
                  size={18}
                  style={{ color: active ? '#ffffff' : 'var(--text-muted)', transition: 'color 0.2s ease' }}
                  className="group-hover:[color:var(--accent-text)]"
                />
                <span className="text-sm font-medium">{t(item.labelKey)}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-glow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 pb-4">
          <GlobalRunControls />
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="shrink-0 p-4 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={toggleTheme}
          className="btn-interactive flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === 'dark' ? t('theme_light') : t('theme_dark')}</span>
        </button>
        <button
          onClick={toggleLanguage}
          className="btn-interactive flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
        >
          <Globe size={14} />
          <span>{language === 'zh' ? 'EN' : '中'}</span>
        </button>
      </div>
    </aside>
  );
}
