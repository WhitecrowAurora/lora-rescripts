import type { ApiResult, PageId } from '../api/types';

const PAGE_IDS: PageId[] = ['launch', 'runtime', 'advanced', 'install', 'extensions', 'console', 'about'];

function isPageId(value: unknown): value is PageId {
  return typeof value === 'string' && PAGE_IDS.includes(value as PageId);
}

function getActionPageFromResult(result: ApiResult): PageId | null {
  const detailActionPage = result.details?.action_page;
  if (isPageId(detailActionPage)) {
    return detailActionPage;
  }

  const firstIssueWithAction = result.preflight?.issues?.find((issue) => isPageId(issue.action_page));
  return firstIssueWithAction?.action_page || null;
}

export function getTargetPageForApiResult(result: ApiResult): PageId | null {
  const code = result.result_code || result.code || '';
  if (!code) {
    return null;
  }

  const directRules: Record<string, PageId> = {
    'trainer.launch_started': 'console',
    'trainer.already_running': 'console',
    'runtime_initialize.started': 'console',
    'runtime_install.started': 'console',
    'updater.started': 'about',
    'runtime.unknown': 'runtime',
    'runtime.not_installed': 'runtime',
    'runtime_install.already_running': 'install',
    'runtime_initialize.already_running': 'install',
    'runtime_install.powershell_missing': 'install',
    'runtime_install.scripts_missing': 'install',
    'runtime_install.python_missing': 'install',
    'updater.blocked_trainer_running': 'about',
    'updater.blocked_install_running': 'about',
    'updater.script_missing': 'about',
    'updater.start_failed': 'about',
  };

  if (directRules[code]) {
    return directRules[code];
  }

  if (code === 'launch.preflight_blocked') {
    return getActionPageFromResult(result) || 'launch';
  }

  if (code.startsWith('runtime_install.')) {
    return result.ok ? 'console' : 'install';
  }

  if (code.startsWith('runtime_initialize.')) {
    return result.ok ? 'console' : 'install';
  }

  if (code.startsWith('updater.')) {
    return 'about';
  }

  if (code.startsWith('launch.')) {
    return getActionPageFromResult(result) || 'launch';
  }

  if (code.startsWith('trainer.')) {
    return code.includes('launch') || code.includes('running') ? 'console' : 'launch';
  }

  return null;
}
