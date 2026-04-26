import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Copy, Trash2, ArrowRight, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { colorizeLine } from '../utils/consoleColor';
import type { TaskCommandRecord, TaskLogSignal, TaskResultRecord } from '../api/types';

export function ConsolePage() {
  const {
    consoleLines,
    isRunning,
    currentTaskState,
    taskStageEvents,
    taskHistory,
    clearConsole,
    clearTaskHistory,
    lastInstallSummary,
    clearInstallSummary,
    runtimeDefs,
    setActivePage,
    language,
    translations,
  } = useApp();
  const { t } = useTranslation(translations, language);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const installedRuntimeName = useMemo(() => {
    if (!lastInstallSummary) return null;
    const matched = runtimeDefs.find((item) => item.id === lastInstallSummary.runtimeId);
    if (!matched) return lastInstallSummary.runtimeId;
    return language === 'zh' ? matched.name_zh : matched.name_en;
  }, [lastInstallSummary, runtimeDefs, language]);
  const recentTaskStages = useMemo(() => [...taskStageEvents].slice(-8).reverse(), [taskStageEvents]);
  const recentTaskHistory = useMemo(() => taskHistory.slice(0, 6), [taskHistory]);
  const selectedTask = useMemo(() => {
    if (recentTaskHistory.length === 0) return null;
    if (selectedTaskId) {
      const matched = recentTaskHistory.find((task) => getTaskSelectionId(task) === selectedTaskId);
      if (matched) return matched;
    }
    return recentTaskHistory[0];
  }, [recentTaskHistory, selectedTaskId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleLines]);

  useEffect(() => {
    if (recentTaskHistory.length === 0) {
      if (selectedTaskId !== null) {
        setSelectedTaskId(null);
      }
      return;
    }
    if (!selectedTaskId) {
      setSelectedTaskId(getTaskSelectionId(recentTaskHistory[0]));
      return;
    }
    const exists = recentTaskHistory.some((task) => getTaskSelectionId(task) === selectedTaskId);
    if (!exists) {
      setSelectedTaskId(getTaskSelectionId(recentTaskHistory[0]));
    }
  }, [recentTaskHistory, selectedTaskId]);

  const handleCopy = () => {
    const text = consoleLines.join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleCopyTask = () => {
    if (!selectedTask) return;
    navigator.clipboard.writeText(JSON.stringify(selectedTask, null, 2));
  };

  const handleCopyTaskLogs = () => {
    if (!selectedTask?.log_lines || selectedTask.log_lines.length === 0) return;
    navigator.clipboard.writeText(selectedTask.log_lines.join('\n'));
  };

  const handleExportTaskBundle = () => {
    if (!selectedTask) return;
    const runtimeDef = selectedTask.runtime_id
      ? runtimeDefs.find((item) => item.id === selectedTask.runtime_id) || null
      : null;
    const bundle = {
      schema_version: 'launcher-task-diagnostic-v1',
      exported_at: new Date().toISOString(),
      source: 'launcher.console_page',
      language,
      selected_task_id: getTaskSelectionId(selectedTask),
      runtime: runtimeDef
        ? {
            id: runtimeDef.id,
            name_zh: runtimeDef.name_zh,
            name_en: runtimeDef.name_en,
            preferred_runtime: runtimeDef.preferred_runtime,
            category: runtimeDef.category,
          }
        : {
            id: selectedTask.runtime_id,
          },
      selected_task: selectedTask,
      active_task_state: currentTaskState.task_id === selectedTask.task_id ? currentTaskState : null,
      global_console_excerpt: consoleLines.slice(-200),
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const taskId = sanitizeFileNamePart(selectedTask.task_id || selectedTask.task_type || 'task');
    const timestamp = formatExportTimestamp(new Date());
    anchor.href = url;
    anchor.download = `launcher-diagnostic-${taskId}-${timestamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col space-y-3 animate-fade-in">
      {currentTaskState.task_type !== 'idle' && (
        <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {language === 'zh' ? currentTaskState.stage_label_zh : currentTaskState.stage_label_en}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh'
                  ? `任务类型：${currentTaskState.task_type}`
                  : `Task type: ${currentTaskState.task_type}`}
                {currentTaskState.runtime_id ? ` · ${currentTaskState.runtime_id}` : ''}
              </div>
              {currentTaskState.error && (
                <div className="text-xs mt-2" style={{ color: 'var(--danger-text)' }}>
                  {currentTaskState.error}
                </div>
              )}
            </div>
            <TaskStateBadge state={currentTaskState.state} language={language} />
          </div>

          {recentTaskStages.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? '最近阶段' : 'Recent stages'}
              </div>
              {recentTaskStages.map((event, index) => (
                <div
                  key={`${event.task_id}-${event.stage_code}-${index}`}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {language === 'zh' ? event.stage_label_zh : event.stage_label_en}
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {event.timestamp}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
                      {event.result_code || event.code || event.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {recentTaskHistory.length > 0 && (
        <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {language === 'zh' ? '最近任务' : 'Recent tasks'}
            </div>
            {selectedTask && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportTaskBundle}
                  className="btn-interactive text-[10px] px-2 py-1 rounded flex items-center gap-1"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
                >
                  <Download size={10} /> {language === 'zh' ? '导出诊断包' : 'Export diagnostic bundle'}
                </button>
                <button
                  onClick={handleCopyTask}
                  className="btn-interactive text-[10px] px-2 py-1 rounded flex items-center gap-1"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
                >
                  <Copy size={10} /> {language === 'zh' ? '复制任务结果' : 'Copy task result'}
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {recentTaskHistory.map((task) => (
              <button
                key={task.task_id || `${task.task_type}-${task.finished_at || task.started_at}`}
                type="button"
                onClick={() => setSelectedTaskId(getTaskSelectionId(task))}
                className="w-full rounded-xl p-3 text-left btn-interactive"
                style={{
                  backgroundColor: selectedTask && getTaskSelectionId(selectedTask) === getTaskSelectionId(task)
                    ? 'var(--bg-card-hover)'
                    : 'var(--bg-input)',
                  border: `1px solid ${
                    selectedTask && getTaskSelectionId(selectedTask) === getTaskSelectionId(task)
                      ? 'var(--accent-border)'
                      : 'var(--border-card)'
                  }`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? task.stage_label_zh : task.stage_label_en}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {(language === 'zh' ? `任务类型：${task.task_type}` : `Task: ${task.task_type}`) + (task.runtime_id ? ` · ${task.runtime_id}` : '')}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>
                      {task.finished_at || task.started_at || '—'}
                      {typeof task.duration_ms === 'number' ? ` · ${Math.max(0.1, task.duration_ms / 1000).toFixed(1)}s` : ''}
                    </div>
                    {task.error && (
                      <div className="text-[11px] mt-1" style={{ color: 'var(--danger-text)' }}>
                        {task.error}
                      </div>
                    )}
                  </div>
                  <TaskResultCodeBadge state={task.state} text={task.result_code || task.code || task.state} />
                </div>
              </button>
            ))}
          </div>

          {selectedTask && (
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {language === 'zh' ? selectedTask.stage_label_zh : selectedTask.stage_label_en}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {(language === 'zh' ? `任务类型：${selectedTask.task_type}` : `Task: ${selectedTask.task_type}`) + (selectedTask.runtime_id ? ` · ${selectedTask.runtime_id}` : '')}
                  </div>
                </div>
                <TaskStateBadge state={selectedTask.state} language={language} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <TaskDetailField
                  label={language === 'zh' ? '开始时间' : 'Started'}
                  value={selectedTask.started_at || '—'}
                />
                <TaskDetailField
                  label={language === 'zh' ? '结束时间' : 'Finished'}
                  value={selectedTask.finished_at || '—'}
                />
                <TaskDetailField
                  label={language === 'zh' ? '耗时' : 'Duration'}
                  value={formatDuration(selectedTask.duration_ms)}
                />
                <TaskDetailField
                  label={language === 'zh' ? '阶段代码' : 'Stage code'}
                  value={selectedTask.stage_code || '—'}
                />
                <TaskDetailField
                  label={language === 'zh' ? '结果代码' : 'Result code'}
                  value={selectedTask.result_code || selectedTask.code || '—'}
                />
                <TaskDetailField
                  label={language === 'zh' ? '任务 ID' : 'Task ID'}
                  value={selectedTask.task_id || '—'}
                />
              </div>

              {selectedTask.error && (
                <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)' }}>
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--danger-text)' }}>
                    {language === 'zh' ? '错误信息' : 'Error'}
                  </div>
                  <div className="text-xs mt-2 whitespace-pre-wrap break-words" style={{ color: 'var(--danger-text)' }}>
                    {selectedTask.error}
                  </div>
                </div>
              )}

              {selectedTask.commands && selectedTask.commands.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {language === 'zh' ? '已执行命令' : 'Executed commands'}
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedTask.commands.map((command, index) => (
                      <div
                        key={`${command.command_preview}-${index}`}
                        className="rounded-xl p-3"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              {language === 'zh' ? command.label_zh : command.label_en}
                            </div>
                            <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh'
                                ? `命令 ${command.index}/${command.total} · ${command.command_kind}`
                                : `Command ${command.index}/${command.total} · ${command.command_kind}`}
                            </div>
                          </div>
                          <TaskResultCodeBadge
                            state={command.status}
                            text={formatCommandStateLabel(command.status, language)}
                          />
                        </div>
                        <div className="mt-2 rounded-lg px-3 py-2 font-mono text-[11px] break-all" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                          {command.command_preview}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <TaskDetailField
                            label={language === 'zh' ? '工作目录' : 'Working directory'}
                            value={command.cwd || '—'}
                          />
                          <TaskDetailField
                            label={language === 'zh' ? '耗时' : 'Duration'}
                            value={formatDuration(command.duration_ms)}
                          />
                          <TaskDetailField
                            label={language === 'zh' ? '开始时间' : 'Started'}
                            value={command.started_at || '—'}
                          />
                          <TaskDetailField
                            label={language === 'zh' ? '结束时间' : 'Finished'}
                            value={command.finished_at || '—'}
                          />
                          <TaskDetailField
                            label={language === 'zh' ? '退出码 / PID' : 'Exit code / PID'}
                            value={`${command.exit_code ?? '—'} / ${command.pid ?? '—'}`}
                          />
                        </div>
                        {command.error && (
                          <div className="text-[11px] mt-2 whitespace-pre-wrap break-words" style={{ color: 'var(--danger-text)' }}>
                            {command.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedTask.log_analysis || (selectedTask.log_lines && selectedTask.log_lines.length > 0)) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {language === 'zh' ? '执行日志分析' : 'Execution log analysis'}
                    </div>
                    {selectedTask.log_lines && selectedTask.log_lines.length > 0 && (
                      <button
                        onClick={handleCopyTaskLogs}
                        className="btn-interactive text-[10px] px-2 py-1 rounded flex items-center gap-1"
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                      >
                        <Copy size={10} /> {language === 'zh' ? '复制日志摘录' : 'Copy log excerpt'}
                      </button>
                    )}
                  </div>

                  {selectedTask.log_analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <TaskDetailField
                        label={language === 'zh' ? '日志行数' : 'Log lines'}
                        value={String(selectedTask.log_analysis.line_count)}
                      />
                      <TaskDetailField
                        label={language === 'zh' ? '警告数' : 'Warnings'}
                        value={String(selectedTask.log_analysis.warning_count)}
                      />
                      <TaskDetailField
                        label={language === 'zh' ? '错误数' : 'Errors'}
                        value={String(selectedTask.log_analysis.error_count)}
                      />
                      <TaskDetailField
                        label={language === 'zh' ? '命中信号' : 'Signals'}
                        value={String(selectedTask.log_analysis.signal_count)}
                      />
                    </div>
                  )}

                  {selectedTask.log_analysis && selectedTask.log_analysis.signals.length > 0 && (
                    <div className="space-y-2">
                      {selectedTask.log_analysis.signals.map((signal, index) => (
                        <div
                          key={`${signal.code}-${index}`}
                          className="rounded-xl p-3"
                          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              {language === 'zh' ? signal.title_zh : signal.title_en}
                            </div>
                            <TaskSeverityBadge signal={signal} language={language} />
                          </div>
                          <div className="text-[11px] mt-2 whitespace-pre-wrap break-words font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {signal.matched_line}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedTask.log_analysis && (
                    <div className="grid grid-cols-1 gap-2">
                      <TaskDetailField
                        label={language === 'zh' ? '最后一条警告' : 'Last warning'}
                        value={selectedTask.log_analysis.last_warning || '—'}
                      />
                      <TaskDetailField
                        label={language === 'zh' ? '最后一条错误' : 'Last error'}
                        value={selectedTask.log_analysis.last_error || '—'}
                      />
                    </div>
                  )}

                  {selectedTask.log_lines && selectedTask.log_lines.length > 0 && (
                    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                      <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {language === 'zh' ? '日志摘录' : 'Log excerpt'}
                      </div>
                      <div className="mt-2 rounded-lg px-3 py-2 font-mono text-[11px] whitespace-pre-wrap break-words max-h-72 overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                        {selectedTask.log_lines.join('\n')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTask.stages && selectedTask.stages.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {language === 'zh' ? '任务阶段轨迹' : 'Task timeline'}
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedTask.stages.map((event, index) => (
                      <div
                        key={`${event.task_id || 'task'}-${event.stage_code}-${index}`}
                        className="rounded-xl p-3"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              {language === 'zh' ? event.stage_label_zh : event.stage_label_en}
                            </div>
                            <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {event.timestamp}
                            </div>
                          </div>
                          <TaskResultCodeBadge state={event.state} text={event.result_code || event.code || event.stage_code} />
                        </div>
                        {event.error && (
                          <div className="text-[11px] mt-2 whitespace-pre-wrap break-words" style={{ color: 'var(--danger-text)' }}>
                            {event.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '结构化详情' : 'Structured details'}
                </div>
                {selectedTask.details && Object.keys(selectedTask.details).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(selectedTask.details).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl p-3"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
                      >
                        <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {key}
                        </div>
                        <div className="text-xs mt-2 whitespace-pre-wrap break-words font-mono" style={{ color: 'var(--text-primary)' }}>
                          {formatTaskDetailValue(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-dim)' }}>
                    {language === 'zh' ? '这个任务没有额外结构化详情。' : 'This task has no additional structured details.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {lastInstallSummary && (
        <div
          className="rounded-2xl p-4 flex items-start justify-between gap-4"
          style={{
            backgroundColor: lastInstallSummary.success ? 'var(--success-subtle)' : 'var(--warning-subtle)',
            border: `1px solid ${lastInstallSummary.success ? 'var(--success-border)' : 'var(--warning-border)'}`,
          }}
        >
          <div className="flex items-start gap-3">
            {lastInstallSummary.success ? (
              <CheckCircle2 size={18} style={{ color: 'var(--success-text)' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: 'var(--warning-text)' }} />
            )}
            <div>
              <div className="text-sm font-semibold" style={{ color: lastInstallSummary.success ? 'var(--success-text)' : 'var(--warning-text)' }}>
                {lastInstallSummary.success
                  ? t('install_summary_success_title', { runtime: installedRuntimeName || lastInstallSummary.runtimeId })
                  : t('install_summary_failed_title', { runtime: installedRuntimeName || lastInstallSummary.runtimeId })}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {lastInstallSummary.success
                  ? t('install_summary_success_desc')
                  : t('install_summary_failed_desc')}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearInstallSummary();
                setActivePage(lastInstallSummary.success ? 'launch' : 'runtime');
              }}
              className="btn-interactive px-3 py-2 rounded-lg text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
            >
              {lastInstallSummary.success ? t('install_summary_open_launch') : t('runtime_selection')}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex justify-between items-center px-1">
        <div className="flex gap-2 items-center text-xs" style={{ color: 'var(--text-muted)' }}>
          <span
            className={`w-2 h-2 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: isRunning ? 'var(--success)' : 'var(--text-dim)' }}
          />
          {isRunning ? t('status_running') : t('status_stopped')}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="btn-interactive text-[10px] px-2 py-1 rounded flex items-center gap-1"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
          >
            <Copy size={10} /> {t('console_copy')}
          </button>
          <button
            onClick={clearConsole}
            className="btn-interactive text-[10px] px-2 py-1 rounded"
            style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger-text)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-subtle)'}
          >
            <Trash2 size={10} /> {t('console_clear')}
          </button>
          {recentTaskHistory.length > 0 && (
            <button
              onClick={() => { void clearTaskHistory(); }}
              className="btn-interactive text-[10px] px-2 py-1 rounded"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
            >
              <Trash2 size={10} /> {language === 'zh' ? '清空任务历史' : 'Clear task history'}
            </button>
          )}
        </div>
      </div>

      {/* Console output */}
      <div
        ref={scrollRef}
        className="flex-1 rounded-2xl p-4 font-mono text-xs overflow-y-auto leading-relaxed shadow-inner custom-scrollbar"
        style={{ backgroundColor: 'var(--console-bg)', border: '1px solid var(--border)' }}
      >
        {consoleLines.length === 0 ? (
          <p className="italic" style={{ color: 'var(--text-dim)' }}>{t('console_empty')}</p>
        ) : (
          consoleLines.map((line, i) => (
            <Line key={i} text={line} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskStateBadge({ state, language }: { state: string; language: string }) {
  const config = state === 'succeeded'
    ? {
        label: language === 'zh' ? '已完成' : 'Succeeded',
        bg: 'var(--success-subtle)',
        text: 'var(--success-text)',
        border: 'var(--success-border)',
      }
    : state === 'interrupted'
      ? {
          label: language === 'zh' ? '已中断' : 'Interrupted',
          bg: 'var(--warning-subtle)',
          text: 'var(--warning-text)',
          border: 'var(--warning-border)',
        }
    : state === 'failed'
      ? {
          label: language === 'zh' ? '失败' : 'Failed',
          bg: 'var(--danger-subtle)',
          text: 'var(--danger-text)',
          border: 'var(--danger-border)',
        }
      : state === 'running'
        ? {
            label: language === 'zh' ? '运行中' : 'Running',
            bg: 'var(--accent-subtle)',
            text: 'var(--accent-text)',
            border: 'var(--accent-border)',
          }
        : {
            label: language === 'zh' ? '准备中' : 'Pending',
            bg: 'var(--warning-subtle)',
            text: 'var(--warning-text)',
            border: 'var(--warning-border)',
          };

  return (
    <span
      className="text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: config.bg, color: config.text, border: `1px solid ${config.border}` }}
    >
      {config.label}
    </span>
  );
}

function TaskResultCodeBadge({ state, text }: { state: string; text: string }) {
  const tone = state === 'succeeded'
    ? {
        bg: 'var(--success-subtle)',
        text: 'var(--success-text)',
        border: 'var(--success-border)',
      }
    : state === 'running'
      ? {
          bg: 'var(--accent-subtle)',
          text: 'var(--accent-text)',
          border: 'var(--accent-border)',
        }
    : state === 'pending'
      ? {
          bg: 'var(--warning-subtle)',
          text: 'var(--warning-text)',
          border: 'var(--warning-border)',
        }
    : state === 'interrupted'
      ? {
          bg: 'var(--warning-subtle)',
          text: 'var(--warning-text)',
          border: 'var(--warning-border)',
        }
      : {
          bg: 'var(--danger-subtle)',
          text: 'var(--danger-text)',
          border: 'var(--danger-border)',
        };

  return (
    <span
      className="text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: tone.bg, color: tone.text, border: `1px solid ${tone.border}` }}
    >
      {text}
    </span>
  );
}

function TaskSeverityBadge({ signal, language }: { signal: TaskLogSignal; language: string }) {
  const state = signal.severity === 'error' ? 'failed' : signal.severity === 'warning' ? 'interrupted' : 'pending';
  const text = signal.severity === 'error'
    ? (language === 'zh' ? '错误' : 'Error')
    : signal.severity === 'warning'
      ? (language === 'zh' ? '警告' : 'Warning')
      : (language === 'zh' ? '信息' : 'Info');
  return <TaskResultCodeBadge state={state} text={text} />;
}

function TaskDetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="text-xs mt-2 break-words" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function getTaskSelectionId(task: TaskResultRecord): string {
  return task.task_id || `${task.task_type}-${task.finished_at || task.started_at || 'unknown'}`;
}

function formatDuration(durationMs: number | null | undefined): string {
  if (typeof durationMs !== 'number') return '—';
  return `${Math.max(0.1, durationMs / 1000).toFixed(1)}s`;
}

function formatTaskDetailValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatCommandStateLabel(state: TaskCommandRecord['status'], language: string): string {
  if (state === 'succeeded') return language === 'zh' ? '成功' : 'Succeeded';
  if (state === 'running') return language === 'zh' ? '运行中' : 'Running';
  if (state === 'pending') return language === 'zh' ? '等待中' : 'Pending';
  if (state === 'interrupted') return language === 'zh' ? '已中断' : 'Interrupted';
  return language === 'zh' ? '失败' : 'Failed';
}

function sanitizeFileNamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'task';
}

function formatExportTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function Line({ text }: { text: string }) {
  const segments = colorizeLine(text);
  return (
    <p className="mb-1">
      {segments.map((seg, i) => (
        <span key={i} style={seg.style}>{seg.text}</span>
      ))}
    </p>
  );
}
