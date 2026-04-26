import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PageRouter } from './components/PageRouter';
import { AppProvider, useApp } from './context/AppContext';
import { useTranslation } from './hooks/useTranslation';

function AppFooter() {
  const { language, translations } = useApp();
  const { t } = useTranslation(translations, language);

  return (
    <footer className="px-8 py-3 text-[10px] flex justify-end items-center" style={{ color: 'var(--text-dim)', borderTop: '1px solid var(--border)' }}>
      <a
        href="https://github.com/WhitecrowAurora/lora-rescripts"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        {t('about_github')}
      </a>
    </footer>
  );
}

function AppLayout() {
  const { ready } = useApp();

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-slate-400" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans select-none" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col relative">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" style={{ backgroundColor: 'var(--accent)', opacity: 0.03 }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" style={{ backgroundColor: 'var(--secondary)', opacity: 0.03 }} />

        <Header />

        <section className="flex-1 overflow-y-auto p-8 pb-16 z-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto h-full">
            <PageRouter />
          </div>
        </section>

        <AppFooter />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
