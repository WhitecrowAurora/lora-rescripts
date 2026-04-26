import React, { useState } from 'react';
import { Download, Puzzle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { FrontendProfile, PluginInfo } from '../api/types';

export function ExtensionsPage() {
  const {
    plugins,
    uiProfiles,
    togglePlugin,
    refreshUiProfiles,
    activateUiProfile,
    installUiProfile,
    uninstallUiProfile,
    language,
    translations,
  } = useApp();
  const { t } = useTranslation(translations, language);
  const isZh = language === 'zh';
  const [repoUrl, setRepoUrl] = useState('');
  const [uiMessage, setUiMessage] = useState('');
  const [uiError, setUiError] = useState('');
  const [busyProfileId, setBusyProfileId] = useState<string | null>(null);
  const [installBusy, setInstallBusy] = useState(false);

  const handleRefresh = async () => {
    setUiError('');
    setUiMessage('');
    await refreshUiProfiles();
    setUiMessage(isZh ? '已刷新前端界面列表。' : 'Frontend UI list refreshed.');
  };

  const handleActivate = async (profile: FrontendProfile) => {
    setBusyProfileId(profile.id);
    setUiError('');
    setUiMessage('');
    const result = await activateUiProfile(profile.id);
    if (result.error) {
      setUiError(result.error);
    } else {
      setUiMessage(
        isZh
          ? `已切换到 ${profile.name}。重新启动训练器后会使用这个界面。`
          : `Switched to ${profile.name}. Restart the trainer to use this UI.`,
      );
    }
    setBusyProfileId(null);
  };

  const handleInstall = async () => {
    const normalized = repoUrl.trim();
    if (!normalized) {
      setUiError(isZh ? '请先输入 GitHub 仓库链接。' : 'Enter a GitHub repository URL first.');
      setUiMessage('');
      return;
    }
    setInstallBusy(true);
    setUiError('');
    setUiMessage('');
    const result = await installUiProfile(normalized, false);
    if (result.error) {
      setUiError(result.error);
    } else {
      setRepoUrl('');
      setUiMessage(
        isZh
          ? '前端界面已下载完成。若需要使用它，请点击“启用 / 切换到此界面”。'
          : 'The frontend UI has been downloaded. Activate it below if you want to use it.',
      );
    }
    setInstallBusy(false);
  };

  const handleUninstall = async (profile: FrontendProfile) => {
    const confirmed = window.confirm(
      isZh
        ? `确定要移除 ${profile.name} 吗？`
        : `Are you sure you want to remove ${profile.name}?`,
    );
    if (!confirmed) {
      return;
    }
    setBusyProfileId(profile.id);
    setUiError('');
    setUiMessage('');
    const result = await uninstallUiProfile(profile.id);
    if (result.error) {
      setUiError(result.error);
    } else {
      setUiMessage(
        isZh
          ? `已移除 ${profile.name}。`
          : `${profile.name} has been removed.`,
      );
    }
    setBusyProfileId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('extension_title')}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('extension_note')}</p>
      </div>

      <section
        className="rounded-2xl p-5 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isZh ? '前端界面' : 'Frontend UIs'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {isZh
                ? '这里显示内置界面和社区界面。社区界面支持通过 GitHub 仓库链接直接安装。'
                : 'Built-in and community UIs are listed here. Community UIs can be installed directly from GitHub repository URLs.'}
            </p>
          </div>
          <button
            onClick={() => { void handleRefresh(); }}
            className="btn-interactive px-3 py-2 rounded-lg text-xs flex items-center gap-2"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
          >
            <RefreshCw size={14} />
            {isZh ? '刷新' : 'Refresh'}
          </button>
        </div>

        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
          <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isZh ? '从 GitHub 安装社区界面' : 'Install community UI from GitHub'}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder={isZh ? '例如：https://github.com/owner/repo' : 'Example: https://github.com/owner/repo'}
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => { void handleInstall(); }}
              disabled={installBusy}
              className="btn-interactive px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              <Download size={14} />
              {installBusy ? (isZh ? '安装中…' : 'Installing…') : (isZh ? '下载并安装' : 'Install')}
            </button>
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {isZh
              ? '当前仅支持标准 GitHub 仓库链接。安装后会出现在下面的界面列表中。'
              : 'Only standard GitHub repository URLs are supported right now. Installed UIs will appear in the list below.'}
          </div>
        </div>

        {uiMessage && (
          <div
            className="rounded-xl px-3 py-2 text-xs"
            style={{ backgroundColor: 'var(--success-subtle)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
          >
            {uiMessage}
          </div>
        )}

        {uiError && (
          <div
            className="rounded-xl px-3 py-2 text-xs"
            style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
          >
            {uiError}
          </div>
        )}

        <div className="space-y-3">
          {(uiProfiles?.profiles || []).map((profile) => (
            <FrontendProfileCard
              key={profile.id}
              profile={profile}
              activeProfileId={uiProfiles?.active_profile_id || ''}
              busy={busyProfileId === profile.id}
              language={language}
              onActivate={() => { void handleActivate(profile); }}
              onUninstall={() => { void handleUninstall(profile); }}
            />
          ))}
        </div>
      </section>

      <section
        className="rounded-2xl p-5 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isZh ? '后端插件' : 'Backend Plugins'}
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isZh
              ? '这里管理训练器后端的插件开关。'
              : 'Manage backend plugin enable/disable state here.'}
          </p>
        </div>

        {plugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4" style={{ color: 'var(--text-muted)' }}>
            <Puzzle size={40} />
            <p>{t('extension_no_plugins')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <PluginCard
                key={plugin.plugin_id}
                plugin={plugin}
                onToggle={(enabled) => togglePlugin(plugin.plugin_id, enabled)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FrontendProfileCard({
  profile,
  activeProfileId,
  busy,
  language,
  onActivate,
  onUninstall,
}: {
  profile: FrontendProfile;
  activeProfileId: string;
  busy: boolean;
  language: string;
  onActivate: () => void;
  onUninstall: () => void;
}) {
  const isZh = language === 'zh';
  const active = profile.id === activeProfileId;

  return (
    <div
      className="rounded-xl p-4 flex items-start justify-between gap-4"
      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {profile.name}
          </div>
          {profile.version && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
            >
              {profile.version}
            </span>
          )}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: active ? 'var(--success-subtle)' : 'var(--bg-card)',
              color: active ? 'var(--success-text)' : 'var(--text-secondary)',
              border: `1px solid ${active ? 'var(--success-border)' : 'var(--border-card)'}`,
            }}
          >
            {active ? (isZh ? '当前使用中' : 'Active') : (profile.kind === 'builtin' ? (isZh ? '内置' : 'Built-in') : (isZh ? '社区' : 'Community'))}
          </span>
        </div>

        <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
          {profile.source_path || profile.plugin_path || '—'}
        </div>

        {profile.source_url && (
          <div className="text-[11px] mt-1 break-all" style={{ color: 'var(--text-muted)' }}>
            {profile.source_url}
          </div>
        )}

        {!profile.removable && profile.remove_block_reason && (
          <div className="text-[11px] mt-2" style={{ color: 'var(--text-dim)' }}>
            {profile.remove_block_reason}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!active && profile.available && (
          <button
            onClick={onActivate}
            disabled={busy}
            className="btn-interactive px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            {isZh ? '启用' : 'Activate'}
          </button>
        )}
        {profile.removable && (
          <button
            onClick={onUninstall}
            disabled={busy}
            className="btn-interactive px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' }}
          >
            {isZh ? '移除' : 'Remove'}
          </button>
        )}
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
