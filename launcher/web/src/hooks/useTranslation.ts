import { useCallback } from 'react';
import type { Translations } from '../api/types';

const BUILTIN_FALLBACKS: Record<string, { zh: string; en: string }> = {
  managed: {
    zh: '托管',
    en: 'Managed',
  },
  global_run_title: {
    zh: '运行控制',
    en: 'Run Controls',
  },
  global_run_select_runtime: {
    zh: '请先选择一个可用运行时',
    en: 'Select a usable runtime first.',
  },
  global_run_runtime_missing: {
    zh: '当前运行时未安装，先去安装页准备环境',
    en: 'The selected runtime is not installed yet. Prepare it from the Install page first.',
  },
  global_run_preflight_blocked: {
    zh: '当前还有启动前问题，请先回到启动页修复',
    en: 'Preflight checks are still blocking launch. Resolve them on the Launch page first.',
  },
  global_run_installing_hint: {
    zh: '安装任务进行中，暂时不能启动训练器',
    en: 'A runtime install task is in progress, so the trainer cannot be launched right now.',
  },
  global_run_kill: {
    zh: '杀死',
    en: 'Kill',
  },
  global_run_kill_confirm: {
    zh: '再次杀死',
    en: 'Confirm kill',
  },
  global_run_kill_warning: {
    zh: '再次点击会强制结束训练器及其子进程。若只是普通停止，请优先使用“停止”。',
    en: 'Click again to force-kill the trainer and its child processes. Use Stop first if a normal shutdown is enough.',
  },
  global_run_kill_cancel: {
    zh: '取消',
    en: 'Cancel',
  },
  global_run_kill_confirm_action: {
    zh: '确认杀死',
    en: 'Kill now',
  },
  managed_title: {
    zh: '托管参数与一键导入',
    en: 'Hosted Presets and One-Click Import',
  },
  managed_desc: {
    zh: '连接你的在线参数站后，启动器会缓存最近 24 小时内同步到的训练参数，并支持导入到本地已保存参数。',
    en: 'Connect your preset server to cache hosted training presets for 24 hours and import them into your local saved configs.',
  },
  managed_settings: {
    zh: '托管设置',
    en: 'Managed Settings',
  },
  managed_settings_desc: {
    zh: '填写托管服务器地址与 API Key。保存后会尝试刷新远端参数目录。',
    en: 'Enter the hosted preset server URL and API key. Saving will trigger a refresh attempt.',
  },
  managed_refresh_now: {
    zh: '立即刷新',
    en: 'Refresh Now',
  },
  managed_server_label: {
    zh: '服务器地址',
    en: 'Server URL',
  },
  managed_api_key_label: {
    zh: 'API Key / 访问令牌',
    en: 'API Key / Access Token',
  },
  managed_api_key_placeholder: {
    zh: '粘贴你的访问令牌',
    en: 'Paste your access token',
  },
  managed_cached_items: {
    zh: '已缓存参数',
    en: 'Cached Presets',
  },
  managed_trainer_types: {
    zh: '训练类型数',
    en: 'Trainer Types',
  },
  managed_last_sync: {
    zh: '上次同步',
    en: 'Last Sync',
  },
  managed_testing: {
    zh: '测试中…',
    en: 'Testing…',
  },
  managed_test_connection: {
    zh: '测试连接',
    en: 'Test Connection',
  },
  managed_connected_as: {
    zh: '当前身份：{name}',
    en: 'Connected as: {name}',
  },
  managed_not_configured: {
    zh: '还没有配置托管服务器',
    en: 'No hosted preset server is configured yet.',
  },
  managed_not_configured_desc: {
    zh: '先填写服务器地址和 API Key，之后这里就会显示在线参数目录。',
    en: 'Add a server URL and API key first. Hosted presets will appear here afterwards.',
  },
  managed_open_settings: {
    zh: '打开托管设置',
    en: 'Open Settings',
  },
  managed_empty: {
    zh: '当前还没有可用参数',
    en: 'No presets are available right now.',
  },
  managed_empty_desc: {
    zh: '如果服务器已经配置完成，可能是远端暂时没有公开的训练参数，或者接口还没接好。',
    en: 'If the server is configured, the remote side may not have any public training presets yet, or the API is still missing.',
  },
  managed_unknown_author: {
    zh: '未知作者',
    en: 'Unknown author',
  },
  managed_no_summary: {
    zh: '暂无简介',
    en: 'No summary provided.',
  },
  managed_preview: {
    zh: '查看',
    en: 'Preview',
  },
  managed_import: {
    zh: '导入',
    en: 'Import',
  },
  managed_confirm_import: {
    zh: '确认导入',
    en: 'Confirm Import',
  },
  managed_cancel: {
    zh: '取消',
    en: 'Cancel',
  },
  managed_preview_unavailable: {
    zh: '这个参数没有附带可预览的配置片段。',
    en: 'This preset did not include a previewable config snippet.',
  },
  managed_detail_trainer_type: {
    zh: '训练类型',
    en: 'Trainer Type',
  },
  managed_detail_base_model: {
    zh: '基础模型',
    en: 'Base Model',
  },
  managed_detail_preview: {
    zh: '配置预览',
    en: 'Config Preview',
  },
  managed_import_notice_title: {
    zh: '导入说明',
    en: 'Import Notice',
  },
  managed_import_notice_desc: {
    zh: '确认导入后，启动器会把它保存到本地已保存参数，并保留上一份托管导入备份，方便你反悔回滚。',
    en: 'Importing saves the preset into your local saved configs and keeps the previous managed import as a rollback backup.',
  },
  managed_import_success: {
    zh: '托管参数已导入到本地保存项：{name}',
    en: 'Hosted preset imported into local saved config: {name}',
  },
  managed_last_import_title: {
    zh: '最近一次托管导入',
    en: 'Latest Managed Import',
  },
  managed_last_import_desc: {
    zh: '当前托管导入槽位：{name}，来源参数：{title}',
    en: 'Current managed slot: {name}. Source preset: {title}',
  },
  managed_last_import_time: {
    zh: '导入时间：{time}',
    en: 'Imported at: {time}',
  },
  managed_revert: {
    zh: '回滚上次导入',
    en: 'Revert Last Import',
  },
  managed_revert_success: {
    zh: '已回滚到上一份托管导入备份：{name}',
    en: 'Reverted to the previous managed import backup: {name}',
  },
};

export function useTranslation(translations: Translations, language: string) {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = translations[key];
      if (!text) {
        const fallback = BUILTIN_FALLBACKS[key];
        if (fallback) {
          text = language === 'zh' ? fallback.zh : fallback.en;
        }
      }
      if (!text) {
        text = key;
      }
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return text;
    },
    [translations, language], // language dep ensures re-render on lang change
  );

  const isZh = language === 'zh';

  return { t, isZh };
}
