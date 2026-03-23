import type {
  ApiEnvelope,
  CaptionBackupRecord,
  CaptionBackupRestoreRecord,
  CaptionCleanupRecord,
  DatasetAnalysisRecord,
  MaskedLossAuditRecord,
  ConfigSummary,
  GraphicCardEntry,
  InterrogatorRecord,
  InterrogateLaunchRecord,
  PresetRecord,
  SchemaRecord,
  SchemaHashRecord,
  ScriptRecord,
  TagEditorStatus,
  TaskRecord,
  TrainingPreflightRecord,
  TrainingSamplePromptRecord,
  RuntimeStatusRecord,
  XformersStatus,
} from "../shared/types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request<T>(path: string): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ApiEnvelope<T>;
}

async function requestPost<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ApiEnvelope<T>;
}

async function requestRaw<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function fetchSchemaHashes() {
  return request<{ schemas: SchemaHashRecord[] }>("/api/schemas/hashes");
}

export async function fetchSchemasAll() {
  return request<{ schemas: SchemaRecord[] }>("/api/schemas/all");
}

export async function fetchPresets() {
  return request<{ presets: PresetRecord[] }>("/api/presets");
}

export async function fetchSavedParams() {
  return request<Record<string, unknown>>("/api/config/saved_params");
}

export async function fetchConfigSummary() {
  return request<ConfigSummary>("/api/config/summary");
}

export async function fetchTasks() {
  return request<{ tasks: TaskRecord[] }>("/api/tasks");
}

export async function terminateTask(taskId: string) {
  return request<null>(`/api/tasks/terminate/${taskId}`);
}

export async function fetchGraphicCards() {
  return request<{ cards: GraphicCardEntry[]; xformers: XformersStatus; runtime: RuntimeStatusRecord }>("/api/graphic_cards");
}

export async function fetchTagEditorStatus() {
  return requestRaw<TagEditorStatus>("/api/tageditor_status");
}

export async function fetchScripts() {
  return request<{ scripts: ScriptRecord[] }>("/api/scripts");
}

export async function analyzeDataset(payload: {
  path: string;
  caption_extension: string;
  top_tags: number;
  sample_limit: number;
}) {
  return requestPost<DatasetAnalysisRecord>("/api/dataset/analyze", payload);
}

export async function analyzeMaskedLossDataset(payload: {
  path: string;
  recursive: boolean;
  sample_limit: number;
}) {
  return requestPost<MaskedLossAuditRecord>("/api/dataset/masked_loss_audit", payload);
}

export async function fetchInterrogators() {
  return request<{ default?: string; interrogators: InterrogatorRecord[] }>("/api/interrogators");
}

export async function pickFile(pickerType: string) {
  const result = await request<{ path?: string }>(`/api/pick_file?picker_type=${encodeURIComponent(pickerType)}`);
  if (result.status !== "success" || !result.data?.path) {
    throw new Error(result.message || "File picker did not return a path.");
  }
  return result.data.path;
}

export async function runInterrogate(payload: Record<string, unknown>) {
  return requestPost<InterrogateLaunchRecord>("/api/interrogate", payload);
}

export async function previewCaptionCleanup(payload: Record<string, unknown>) {
  return requestPost<CaptionCleanupRecord>("/api/captions/cleanup/preview", payload);
}

export async function applyCaptionCleanup(payload: Record<string, unknown>) {
  return requestPost<CaptionCleanupRecord>("/api/captions/cleanup/apply", payload);
}

export async function createCaptionBackup(payload: Record<string, unknown>) {
  return requestPost<CaptionBackupRecord>("/api/captions/backups/create", payload);
}

export async function listCaptionBackups(payload: Record<string, unknown>) {
  return requestPost<{ backups: CaptionBackupRecord[] }>("/api/captions/backups/list", payload);
}

export async function restoreCaptionBackup(payload: Record<string, unknown>) {
  return requestPost<CaptionBackupRestoreRecord>("/api/captions/backups/restore", payload);
}

export async function runScript(scriptName: string, payload: Record<string, unknown> = {}) {
  return requestPost<null>("/api/run_script", {
    script_name: scriptName,
    ...payload,
  });
}

export async function startTraining(payload: Record<string, unknown>) {
  return requestPost<{ task_id?: string; warnings?: string[] }>("/api/run", payload);
}

export async function runTrainingPreflight(payload: Record<string, unknown>) {
  return requestPost<TrainingPreflightRecord>("/api/train/preflight", payload);
}

export async function previewTrainingSamplePrompt(payload: Record<string, unknown>) {
  return requestPost<TrainingSamplePromptRecord>("/api/train/sample_prompt", payload);
}
