export type TrainingSnapshotRecord = {
  time: string;
  name?: string;
  value: Record<string, unknown>;
  gpu_ids?: string[];
};

export type TrainingRecipeRecord = {
  created_at: string;
  name: string;
  description?: string;
  train_type?: string;
  route_id?: string;
  value: Record<string, unknown>;
};

export const MAX_TRAINING_HISTORY_ENTRIES = 80;
export const MAX_TRAINING_RECIPE_ENTRIES = 100;

function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}

function readJson<T>(key: string, fallback: T): T {
  const instance = safeWindow();
  if (!instance) {
    return fallback;
  }

  try {
    const raw = instance.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  const instance = safeWindow();
  if (!instance) {
    return;
  }
  instance.localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key: string) {
  const instance = safeWindow();
  if (!instance) {
    return;
  }
  instance.localStorage.removeItem(key);
}

export function getTrainingAutosaveKey(routeId: string) {
  return `source-training-autosave-${routeId}`;
}

export function getTrainingHistoryKey(routeId: string) {
  return `source-training-history-${routeId}`;
}

export function getTrainingRecipeKey(routeId: string) {
  return `source-training-recipes-${routeId}`;
}

export function loadTrainingAutosave(routeId: string) {
  return readJson<TrainingSnapshotRecord | null>(getTrainingAutosaveKey(routeId), null);
}

export function saveTrainingAutosave(routeId: string, value: TrainingSnapshotRecord) {
  writeJson(getTrainingAutosaveKey(routeId), value);
}

export function clearTrainingAutosave(routeId: string) {
  removeKey(getTrainingAutosaveKey(routeId));
}

export function loadTrainingHistory(routeId: string) {
  return readJson<TrainingSnapshotRecord[]>(getTrainingHistoryKey(routeId), []);
}

export function saveTrainingHistory(routeId: string, entries: TrainingSnapshotRecord[]) {
  writeJson(getTrainingHistoryKey(routeId), entries);
}

export function loadTrainingRecipes(routeId: string) {
  return readJson<TrainingRecipeRecord[]>(getTrainingRecipeKey(routeId), []);
}

export function saveTrainingRecipes(routeId: string, entries: TrainingRecipeRecord[]) {
  writeJson(getTrainingRecipeKey(routeId), entries);
}

export function trimTrainingHistoryEntries(entries: TrainingSnapshotRecord[]) {
  return entries.slice(0, MAX_TRAINING_HISTORY_ENTRIES);
}

export function trimTrainingRecipeEntries(entries: TrainingRecipeRecord[]) {
  return entries.slice(0, MAX_TRAINING_RECIPE_ENTRIES);
}

export function downloadTextFile(fileName: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const instance = safeWindow();
  if (!instance) {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = instance.document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
