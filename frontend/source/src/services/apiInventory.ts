export type ApiRecord = {
  method: "GET" | "POST";
  path: string;
  purpose: string;
  migrationPriority: "high" | "medium" | "low";
};

export const apiInventory: ApiRecord[] = [
  {
    method: "GET",
    path: "/api/schemas/all",
    purpose: "Fetch all schema definitions used to render training forms.",
    migrationPriority: "high",
  },
  {
    method: "GET",
    path: "/api/schemas/hashes",
    purpose: "Hot-reload check for schema changes.",
    migrationPriority: "medium",
  },
  {
    method: "GET",
    path: "/api/presets",
    purpose: "Fetch preset configs for pages and tools.",
    migrationPriority: "high",
  },
  {
    method: "GET",
    path: "/api/config/saved_params",
    purpose: "Load stored UI parameter choices.",
    migrationPriority: "medium",
  },
  {
    method: "GET",
    path: "/api/config/summary",
    purpose: "Read app config summary for the rebuilt settings page.",
    migrationPriority: "medium",
  },
  {
    method: "GET",
    path: "/api/graphic_cards",
    purpose: "List GPUs plus runtime dependency and xformers support state.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/run",
    purpose: "Start schema-driven training jobs.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/train/preflight",
    purpose: "Run backend-aware training preflight checks before launch.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/train/sample_prompt",
    purpose: "Resolve and preview the effective training sample prompt text without launching a run.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/dataset/masked_loss_audit",
    purpose: "Inspect alpha-channel mask readiness for masked-loss training workflows.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/run_script",
    purpose: "Run utility scripts from the tools page.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/interrogate",
    purpose: "Run the built-in tagger/interrogator flow.",
    migrationPriority: "high",
  },
  {
    method: "GET",
    path: "/api/interrogators",
    purpose: "List available batch tagger/interrogator models for the rebuilt tools workspace.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/captions/cleanup/preview",
    purpose: "Preview bulk caption cleanup rules before touching files.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/captions/cleanup/apply",
    purpose: "Apply bulk caption cleanup rules to caption files.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/captions/backups/create",
    purpose: "Create a snapshot archive of caption files for later restore.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/captions/backups/list",
    purpose: "List caption snapshots associated with a folder.",
    migrationPriority: "high",
  },
  {
    method: "POST",
    path: "/api/captions/backups/restore",
    purpose: "Restore caption files from a saved snapshot archive.",
    migrationPriority: "high",
  },
  {
    method: "GET",
    path: "/api/pick_file",
    purpose: "Open native file/folder pickers where supported.",
    migrationPriority: "medium",
  },
  {
    method: "GET",
    path: "/api/get_files",
    purpose: "List model, output or train directories for file pickers.",
    migrationPriority: "high",
  },
  {
    method: "GET",
    path: "/api/tasks",
    purpose: "Fetch active and historical task state.",
    migrationPriority: "high",
  },
  {
    method: "GET",
    path: "/api/tasks/terminate/{task_id}",
    purpose: "Terminate a running task.",
    migrationPriority: "high",
  },
  {
    method: "GET",
    path: "/api/tageditor_status",
    purpose: "Poll tag-editor startup/proxy status.",
    migrationPriority: "medium",
  },
  {
    method: "GET",
    path: "/api/scripts",
    purpose: "List backend-approved utility scripts and positional args for the rebuilt tools page.",
    migrationPriority: "high",
  },
];
