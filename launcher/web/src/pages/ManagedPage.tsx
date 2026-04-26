import React, { useEffect, useMemo, useState } from 'react';
import {
  Cloud,
  KeyRound,
  RefreshCw,
  Settings2,
  Download,
  RotateCcw,
  Server,
  Clock3,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { ManagedConnectionResult, ManagedPresetItem } from '../api/types';

function formatTime(value: string | null, language: string) {
  if (!value) return language === 'zh' ? '未同步' : 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function ManagedPage() {
  const {
    settings,
    updateSettings,
    managedCatalog,
    managedImportState,
    isRefreshingManagedCatalog,
    refreshManagedCatalog,
    testManagedConnection,
    importManagedPreset,
    revertManagedImport,
    language,
    translations,
  } = useApp();
  const { t } = useTranslation(translations, language);
  const [showSettings, setShowSettings] = useState(false);
  const [draftServerUrl, setDraftServerUrl] = useState(settings.managed_server_url || '');
  const [draftApiKey, setDraftApiKey] = useState(settings.managed_api_key || '');
  const [connectionResult, setConnectionResult] = useState<ManagedConnectionResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ManagedPresetItem | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [busyPresetId, setBusyPresetId] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  useEffect(() => {
    setDraftServerUrl(settings.managed_server_url || '');
    setDraftApiKey(settings.managed_api_key || '');
  }, [settings.managed_server_url, settings.managed_api_key]);

  const stats = useMemo(() => {
    const items = managedCatalog?.items || [];
    const trainerTypes = new Set(items.map((item) => item.trainer_type).filter(Boolean));
    return {
      itemCount: items.length,
      trainerTypeCount: trainerTypes.size,
    };
  }, [managedCatalog]);

  const handleSaveSettings = async () => {
    updateSettings({
      managed_server_url: draftServerUrl.trim(),
      managed_api_key: draftApiKey.trim(),
    });
    setConnectionResult(null);
    setShowSettings(false);
    await refreshManagedCatalog(true);
  };

  const handleTestConnection = async () => {
    updateSettings({
      managed_server_url: draftServerUrl.trim(),
      managed_api_key: draftApiKey.trim(),
    });
    setIsTestingConnection(true);
    try {
      const result = await testManagedConnection();
      setConnectionResult(result);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleImport = async (preset: ManagedPresetItem) => {
    setBusyPresetId(preset.preset_id);
    setImportMessage(null);
    try {
      const result = await importManagedPreset(preset.preset_id);
      setImportMessage(
        t('managed_import_success', {
          name: result.current_name || 'launcher-managed-current',
        }),
      );
      setSelectedPreset(null);
    } catch (error: any) {
      setImportMessage(error?.message || String(error));
    } finally {
      setBusyPresetId(null);
    }
  };

  const handleRevert = async () => {
    setIsReverting(true);
    setImportMessage(null);
    try {
      const result = await revertManagedImport();
      setImportMessage(
        t('managed_revert_success', {
          name: result.current_name || 'launcher-managed-current',
        }),
      );
    } catch (error: any) {
      setImportMessage(error?.message || String(error));
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in animate-slide-in-up">
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--accent-subtle), var(--bg-card))', border: '1px solid var(--border-card)' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 p-5 opacity-10 pointer-events-none select-none"
          style={{ color: 'var(--accent)' }}
        >
          <Cloud size={120} />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              {t('managed')}
            </div>
            <h2 className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
              {t('managed_title')}
            </h2>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {t('managed_desc')}
            </p>
          </div>
          <div className="relative z-10 flex gap-2 shrink-0">
            <button
              onClick={() => { void refreshManagedCatalog(true); }}
              className="btn-interactive px-4 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              <RefreshCw size={14} className={isRefreshingManagedCatalog ? 'animate-spin' : ''} />
              {t('managed_refresh_now')}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-interactive px-4 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              <Settings2 size={14} />
              {t('managed_settings')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('managed_server_label')}</div>
            <div className="text-sm font-medium mt-1 truncate" style={{ color: 'var(--text-primary)' }}>
              {managedCatalog?.server_url || settings.managed_server_url || '—'}
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('managed_cached_items')}</div>
            <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
              {stats.itemCount}
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('managed_trainer_types')}</div>
            <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
              {stats.trainerTypeCount}
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('managed_last_sync')}</div>
            <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
              {formatTime(managedCatalog?.fetched_at || null, language)}
            </div>
          </div>
        </div>
      </div>

      {(managedCatalog?.error || importMessage) && (
        <div
          className="rounded-2xl p-4 text-sm"
          style={{
            backgroundColor: managedCatalog?.error ? 'var(--warning-subtle)' : 'var(--success-subtle)',
            border: `1px solid ${managedCatalog?.error ? 'var(--warning-border)' : 'var(--success-border)'}`,
            color: managedCatalog?.error ? 'var(--warning-text)' : 'var(--success-text)',
          }}
        >
          {managedCatalog?.error || importMessage}
        </div>
      )}

      {managedImportState?.current_name && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('managed_last_import_title')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('managed_last_import_desc', {
                  name: managedImportState.current_name,
                  title: managedImportState.preset_title || '—',
                })}
              </div>
              <div className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                {t('managed_last_import_time', {
                  time: formatTime(managedImportState.imported_at, language),
                })}
              </div>
            </div>
            <button
              onClick={() => { void handleRevert(); }}
              disabled={!managedImportState.backup_name || isReverting}
              className="btn-interactive px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              <RotateCcw size={14} />
              {t('managed_revert')}
            </button>
          </div>
        </div>
      )}

      {!managedCatalog?.configured ? (
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <Server size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('managed_not_configured')}
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {t('managed_not_configured_desc')}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="btn-interactive mt-5 px-4 py-2 rounded-xl text-sm"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            {t('managed_open_settings')}
          </button>
        </div>
      ) : managedCatalog.items.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <Cloud size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('managed_empty')}
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {t('managed_empty_desc')}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {managedCatalog.items.map((preset) => (
            <div
              key={preset.preset_id}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
            >
              <div
                className="h-36 flex items-center justify-center"
                style={{
                  background: preset.cover_url
                    ? `linear-gradient(rgba(10,10,10,0.18), rgba(10,10,10,0.28)), url(${preset.cover_url}) center/cover`
                    : 'linear-gradient(135deg, var(--accent-subtle), var(--secondary-subtle))',
                }}
              >
                {!preset.cover_url && <Cloud size={34} style={{ color: 'var(--accent-text)' }} />}
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {preset.title}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {preset.author || t('managed_unknown_author')}
                    </div>
                  </div>
                  {preset.trainer_type && (
                    <span
                      className="px-2 py-1 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}
                    >
                      {preset.trainer_type}
                    </span>
                  )}
                </div>

                <div className="text-sm min-h-[40px]" style={{ color: 'var(--text-secondary)' }}>
                  {preset.summary || t('managed_no_summary')}
                </div>

                <div className="flex flex-wrap gap-2">
                  {preset.base_model && (
                    <span className="px-2 py-1 rounded-full text-[10px]" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
                      {preset.base_model}
                    </span>
                  )}
                  {preset.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-full text-[10px]" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Clock3 size={12} />
                    {formatTime(preset.updated_at, language)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPreset(preset)}
                      className="btn-interactive px-3 py-2 rounded-xl text-xs"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                    >
                      {t('managed_preview')}
                    </button>
                    <button
                      onClick={() => { void handleImport(preset); }}
                      disabled={busyPresetId === preset.preset_id}
                      className="btn-interactive px-3 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
                    >
                      <Download size={12} />
                      {t('managed_import')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-card)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('managed_settings')}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {t('managed_settings_desc')}
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="btn-interactive p-2 rounded-xl"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <label className="block">
                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{t('managed_server_label')}</div>
                <input
                  value={draftServerUrl}
                  onChange={(e) => setDraftServerUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                />
              </label>

              <label className="block">
                <div className="text-xs mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <KeyRound size={12} />
                  {t('managed_api_key_label')}
                </div>
                <input
                  type="password"
                  value={draftApiKey}
                  onChange={(e) => setDraftApiKey(e.target.value)}
                  placeholder={t('managed_api_key_placeholder')}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                />
              </label>
            </div>

            {connectionResult && (
              <div
                className="rounded-xl p-3 mt-4 text-sm"
                style={{
                  backgroundColor: connectionResult.ok ? 'var(--success-subtle)' : 'var(--warning-subtle)',
                  border: `1px solid ${connectionResult.ok ? 'var(--success-border)' : 'var(--warning-border)'}`,
                  color: connectionResult.ok ? 'var(--success-text)' : 'var(--warning-text)',
                }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} />
                  <span>{connectionResult.message}</span>
                </div>
                {connectionResult.username && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('managed_connected_as', { name: connectionResult.username })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => { void handleTestConnection(); }}
                className="btn-interactive px-4 py-2 rounded-xl text-sm flex items-center gap-2"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
              >
                <Server size={14} />
                {isTestingConnection ? t('managed_testing') : t('managed_test_connection')}
              </button>
              <button
                onClick={() => { void handleSaveSettings(); }}
                className="btn-interactive px-4 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
              >
                {t('btn_save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-card)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedPreset.title}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {selectedPreset.summary || t('managed_no_summary')}
                </div>
              </div>
              <button
                onClick={() => setSelectedPreset(null)}
                className="btn-interactive p-2 rounded-xl"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('managed_detail_trainer_type')}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{selectedPreset.trainer_type || '—'}</div>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('managed_detail_base_model')}</div>
                <div className="text-sm mt-1 break-all" style={{ color: 'var(--text-primary)' }}>{selectedPreset.base_model || '—'}</div>
              </div>
            </div>

            <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('managed_detail_preview')}
              </div>
              <div className="space-y-2 mt-3">
                {Object.entries(selectedPreset.config_preview || {}).length > 0 ? (
                  Object.entries(selectedPreset.config_preview || {}).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[180px_1fr] gap-3 text-xs">
                      <div style={{ color: 'var(--text-muted)' }}>{key}</div>
                      <div className="break-all" style={{ color: 'var(--text-primary)' }}>{String(value)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {t('managed_preview_unavailable')}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }}>
              <div className="text-sm font-semibold" style={{ color: 'var(--accent-text)' }}>
                {t('managed_import_notice_title')}
              </div>
              <div className="text-xs mt-2">
                {t('managed_import_notice_desc')}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedPreset(null)}
                className="btn-interactive px-4 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
              >
                {t('managed_cancel')}
              </button>
              <button
                onClick={() => { void handleImport(selectedPreset); }}
                disabled={busyPresetId === selectedPreset.preset_id}
                className="btn-interactive px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
              >
                <Download size={14} />
                {t('managed_confirm_import')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
