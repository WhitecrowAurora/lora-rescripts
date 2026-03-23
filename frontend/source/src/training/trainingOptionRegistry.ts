export type TrainingOptionKind = "optimizer" | "scheduler";

export type TrainingOptionEntry = {
  kind: TrainingOptionKind;
  value: string;
  label: string;
  description: string;
  source: string;
  sourceLabel: string;
  defaultVisible: boolean;
  featured?: boolean;
  packageName?: string;
  schedulerTypePath?: string;
  schedulerFallback?: string;
};

export type TrainingOptionChoice = {
  value: string;
  label: string;
  description: string;
  sourceLabel?: string;
  hiddenBySettings: boolean;
  selectionNote?: string;
  entry?: TrainingOptionEntry;
};

type TrainingOptionVisibilitySettings = Record<TrainingOptionKind, string[]>;

const TRAINING_OPTION_VISIBILITY_STORAGE_KEY = "source-training-option-visibility-v1";
const CUSTOM_SCHEDULER_PREFIX = "__custom__:";

const FEATURED_PYTORCH_OPTIMIZER_NAMES = new Set([
  "AdaBelief",
  "Adan",
  "CAME",
  "LaProp",
  "MADGRAD",
  "RAdam",
  "Ranger",
  "Ranger21",
  "ScheduleFreeAdamW",
  "SophiaH",
  "StableAdamW",
]);

const PYTORCH_OPTIMIZER_ALL_NAMES = [
  "LBFGS",
  "SGD",
  "Adam",
  "AdamW",
  "NAdam",
  "RMSprop",
  "A2Grad",
  "ADOPT",
  "APOLLO",
  "ASGD",
  "AccSGD",
  "AdEMAMix",
  "AdaBelief",
  "AdaBound",
  "AdaDelta",
  "AdaFactor",
  "AdaGC",
  "AdaGO",
  "AdaHessian",
  "AdaLOMO",
  "AdaMax",
  "AdaMod",
  "AdaMuon",
  "AdaNorm",
  "AdaPNM",
  "AdaShift",
  "AdaSmooth",
  "AdaTAM",
  "Adai",
  "Adalite",
  "AdamC",
  "AdamG",
  "AdamMini",
  "AdamP",
  "AdamS",
  "AdamWSN",
  "Adan",
  "AggMo",
  "Aida",
  "AliG",
  "Alice",
  "BCOS",
  "Amos",
  "Ano",
  "ApolloDQN",
  "AvaGrad",
  "BSAM",
  "CAME",
  "Conda",
  "DAdaptAdaGrad",
  "DAdaptAdam",
  "DAdaptAdan",
  "DAdaptLion",
  "DAdaptSGD",
  "DeMo",
  "DiffGrad",
  "DistributedMuon",
  "EXAdam",
  "EmoFact",
  "EmoLynx",
  "EmoNavi",
  "FAdam",
  "FOCUS",
  "FTRL",
  "Fira",
  "Fromage",
  "GaLore",
  "Grams",
  "Gravity",
  "GrokFastAdamW",
  "Kate",
  "Kron",
  "LARS",
  "LOMO",
  "LaProp",
  "Lamb",
  "Lion",
  "MADGRAD",
  "MARS",
  "MSVAG",
  "Muon",
  "Nero",
  "NovoGrad",
  "PAdam",
  "PID",
  "PNM",
  "Prodigy",
  "QHAdam",
  "QHM",
  "RACS",
  "RAdam",
  "Ranger",
  "Ranger21",
  "Ranger25",
  "SCION",
  "SCIONLight",
  "SGDP",
  "SGDSaI",
  "SGDW",
  "SM3",
  "SOAP",
  "SPAM",
  "SPlus",
  "SRMM",
  "SWATS",
  "ScalableShampoo",
  "ScheduleFreeAdamW",
  "ScheduleFreeRAdam",
  "ScheduleFreeSGD",
  "Shampoo",
  "SignSGD",
  "SimplifiedAdEMAMix",
  "SophiaH",
  "StableAdamW",
  "StableSPAM",
  "TAM",
  "Tiger",
  "VSGD",
  "Yogi",
  "SpectralSphere",
];

const OPTIMIZER_DESCRIPTION_MAP: Record<string, string> = {
  AdaBelief: "Adam-like optimizer with variance tracking tuned by prediction belief.",
  Adan: "Fast adaptive optimizer that many diffusion users like for aggressive finetunes.",
  CAME: "Memory-conscious optimizer from pytorch-optimizer, already popular in diffusion training.",
  LaProp: "Adam and RMSProp style hybrid that some LoRA users prefer for stable convergence.",
  MADGRAD: "Momentumized dual averaging optimizer with a good track record on noisy training runs.",
  RAdam: "Rectified Adam variant that can behave more gently than plain AdamW early on.",
  Ranger: "RAdam plus Lookahead style optimizer from the Ranger family.",
  Ranger21: "Heavier Ranger-family optimizer with many training-time stabilizers built in.",
  ScheduleFreeAdamW: "Schedule-free AdamW variant that reduces dependence on a separate LR scheduler.",
  ScheduleFreeRAdam: "Schedule-free RAdam variant from pytorch-optimizer.",
  SophiaH: "Hessian-aware optimizer that some users test for large-batch training.",
  StableAdamW: "Stabilized AdamW implementation from pytorch-optimizer.",
};

const BUILTIN_OPTIMIZER_ENTRIES: TrainingOptionEntry[] = [
  {
    kind: "optimizer",
    value: "AdamW",
    label: "AdamW",
    description: "Standard torch AdamW optimizer.",
    source: "torch",
    sourceLabel: "torch.optim",
    defaultVisible: true,
    featured: true,
  },
  {
    kind: "optimizer",
    value: "AdamW8bit",
    label: "AdamW8bit",
    description: "bitsandbytes 8-bit AdamW for lower VRAM usage.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    featured: true,
    packageName: "bitsandbytes",
  },
  {
    kind: "optimizer",
    value: "PagedAdamW8bit",
    label: "PagedAdamW8bit",
    description: "Paged 8-bit AdamW from bitsandbytes.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes",
  },
  {
    kind: "optimizer",
    value: "RAdamScheduleFree",
    label: "RAdamScheduleFree",
    description: "Schedule-free RAdam from the schedulefree package.",
    source: "schedulefree",
    sourceLabel: "schedulefree",
    defaultVisible: true,
    featured: true,
    packageName: "schedulefree",
  },
  {
    kind: "optimizer",
    value: "Lion",
    label: "Lion",
    description: "Lion optimizer using the project's existing training bridge.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    featured: true,
    packageName: "lion_pytorch",
  },
  {
    kind: "optimizer",
    value: "Lion8bit",
    label: "Lion8bit",
    description: "bitsandbytes 8-bit Lion.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes",
  },
  {
    kind: "optimizer",
    value: "PagedLion8bit",
    label: "PagedLion8bit",
    description: "Paged 8-bit Lion from bitsandbytes.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes",
  },
  {
    kind: "optimizer",
    value: "SGDNesterov",
    label: "SGDNesterov",
    description: "Nesterov SGD handled by the project bridge.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
  },
  {
    kind: "optimizer",
    value: "SGDNesterov8bit",
    label: "SGDNesterov8bit",
    description: "bitsandbytes 8-bit Nesterov SGD.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes",
  },
  {
    kind: "optimizer",
    value: "DAdaptation",
    label: "DAdaptation",
    description: "Legacy DAdaptation bridge entry used by many existing configs.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation",
  },
  {
    kind: "optimizer",
    value: "DAdaptAdam",
    label: "DAdaptAdam",
    description: "DAdapt Adam bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation",
  },
  {
    kind: "optimizer",
    value: "DAdaptAdaGrad",
    label: "DAdaptAdaGrad",
    description: "DAdapt AdaGrad bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation",
  },
  {
    kind: "optimizer",
    value: "DAdaptAdanIP",
    label: "DAdaptAdanIP",
    description: "Existing Adan-IP flavored DAdapt bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation",
  },
  {
    kind: "optimizer",
    value: "DAdaptLion",
    label: "DAdaptLion",
    description: "DAdapt Lion bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation",
  },
  {
    kind: "optimizer",
    value: "DAdaptSGD",
    label: "DAdaptSGD",
    description: "DAdapt SGD bridge entry.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    packageName: "dadaptation",
  },
  {
    kind: "optimizer",
    value: "AdaFactor",
    label: "AdaFactor",
    description: "Transformers Adafactor bridge entry.",
    source: "transformers",
    sourceLabel: "transformers",
    defaultVisible: true,
    packageName: "transformers",
  },
  {
    kind: "optimizer",
    value: "Prodigy",
    label: "Prodigy",
    description: "Prodigy optimizer already supported by the training bridge.",
    source: "bridge",
    sourceLabel: "bridge built-in",
    defaultVisible: true,
    featured: true,
    packageName: "prodigyopt",
  },
  {
    kind: "optimizer",
    value: "prodigyplus.ProdigyPlusScheduleFree",
    label: "ProdigyPlusScheduleFree",
    description: "ProdigyPlus schedule-free optimizer entry.",
    source: "prodigyplus",
    sourceLabel: "prodigyplus",
    defaultVisible: true,
    packageName: "prodigyplus",
  },
  {
    kind: "optimizer",
    value: "pytorch_optimizer.CAME",
    label: "CAME",
    description: OPTIMIZER_DESCRIPTION_MAP.CAME,
    source: "pytorch-optimizer",
    sourceLabel: "pytorch-optimizer",
    defaultVisible: true,
    featured: true,
    packageName: "pytorch_optimizer",
  },
  {
    kind: "optimizer",
    value: "bitsandbytes.optim.AdEMAMix8bit",
    label: "AdEMAMix8bit",
    description: "bitsandbytes AdEMAMix 8-bit optimizer.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes",
  },
  {
    kind: "optimizer",
    value: "bitsandbytes.optim.PagedAdEMAMix8bit",
    label: "PagedAdEMAMix8bit",
    description: "Paged bitsandbytes AdEMAMix 8-bit optimizer.",
    source: "bitsandbytes",
    sourceLabel: "bitsandbytes",
    defaultVisible: true,
    packageName: "bitsandbytes",
  },
];

function createCustomSchedulerValue(path: string) {
  return `${CUSTOM_SCHEDULER_PREFIX}${path}`;
}

function createSchedulerEntry(
  label: string,
  description: string,
  source: string,
  sourceLabel: string,
  schedulerTypePath: string,
  defaultVisible = false,
  featured = false
): TrainingOptionEntry {
  return {
    kind: "scheduler",
    value: createCustomSchedulerValue(schedulerTypePath),
    label,
    description,
    source,
    sourceLabel,
    defaultVisible,
    featured,
    schedulerTypePath,
    schedulerFallback: "constant",
    packageName: source === "pytorch-optimizer" ? "pytorch_optimizer" : undefined,
  };
}

const BUILTIN_SCHEDULER_ENTRIES: TrainingOptionEntry[] = [
  {
    kind: "scheduler",
    value: "linear",
    label: "linear",
    description: "Built-in diffusers linear scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
    featured: true,
  },
  {
    kind: "scheduler",
    value: "cosine",
    label: "cosine",
    description: "Built-in diffusers cosine scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
    featured: true,
  },
  {
    kind: "scheduler",
    value: "cosine_with_restarts",
    label: "cosine_with_restarts",
    description: "Built-in diffusers cosine scheduler with restarts.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
    featured: true,
  },
  {
    kind: "scheduler",
    value: "polynomial",
    label: "polynomial",
    description: "Built-in diffusers polynomial scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
  },
  {
    kind: "scheduler",
    value: "constant",
    label: "constant",
    description: "Built-in constant scheduler.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
  },
  {
    kind: "scheduler",
    value: "constant_with_warmup",
    label: "constant_with_warmup",
    description: "Built-in constant scheduler with warmup.",
    source: "diffusers",
    sourceLabel: "diffusers",
    defaultVisible: true,
  },
];

const EXTRA_SCHEDULER_ENTRIES: TrainingOptionEntry[] = [
  createSchedulerEntry(
    "CosineAnnealingLR",
    "Torch cosine annealing scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.CosineAnnealingLR",
    true,
    true
  ),
  createSchedulerEntry(
    "CosineAnnealingWarmRestarts",
    "Torch cosine annealing scheduler with warm restarts.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.CosineAnnealingWarmRestarts",
    true,
    true
  ),
  createSchedulerEntry(
    "OneCycleLR",
    "Torch one-cycle scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.OneCycleLR",
    true,
    true
  ),
  createSchedulerEntry(
    "StepLR",
    "Torch step scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.StepLR"
  ),
  createSchedulerEntry(
    "MultiStepLR",
    "Torch multi-step scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.MultiStepLR"
  ),
  createSchedulerEntry(
    "CyclicLR",
    "Torch cyclic scheduler.",
    "torch",
    "torch lr_scheduler",
    "torch.optim.lr_scheduler.CyclicLR"
  ),
  createSchedulerEntry(
    "CosineAnnealingWarmupRestarts",
    "pytorch-optimizer warmup cosine scheduler.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.CosineAnnealingWarmupRestarts",
    true,
    true
  ),
  createSchedulerEntry(
    "REXScheduler",
    "pytorch-optimizer REX scheduler.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.REXScheduler",
    true,
    true
  ),
  createSchedulerEntry(
    "CosineScheduler",
    "pytorch-optimizer cosine scheduler helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.CosineScheduler"
  ),
  createSchedulerEntry(
    "LinearScheduler",
    "pytorch-optimizer linear scheduler helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.LinearScheduler"
  ),
  createSchedulerEntry(
    "PolyScheduler",
    "pytorch-optimizer polynomial scheduler helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.PolyScheduler"
  ),
  createSchedulerEntry(
    "ProportionScheduler",
    "pytorch-optimizer proportion scheduler.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.ProportionScheduler"
  ),
  createSchedulerEntry(
    "Chebyshev",
    "pytorch-optimizer chebyshev schedule helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.get_chebyshev_schedule"
  ),
  createSchedulerEntry(
    "WarmupStableDecay",
    "pytorch-optimizer warmup-stable-decay schedule helper.",
    "pytorch-optimizer",
    "pytorch-optimizer",
    "pytorch_optimizer.get_wsd_schedule"
  ),
];

function createPytorchOptimizerEntry(name: string): TrainingOptionEntry {
  const description =
    OPTIMIZER_DESCRIPTION_MAP[name] ?? "Extra optimizer imported from pytorch-optimizer.";

  return {
    kind: "optimizer",
    value: `pytorch_optimizer.${name}`,
    label: name,
    description,
    source: "pytorch-optimizer",
    sourceLabel: "pytorch-optimizer",
    defaultVisible: FEATURED_PYTORCH_OPTIMIZER_NAMES.has(name),
    featured: FEATURED_PYTORCH_OPTIMIZER_NAMES.has(name),
    packageName: "pytorch_optimizer",
  };
}

function getOptimizerBaseName(value: string) {
  const trimmed = value.trim();
  const dotIndex = trimmed.lastIndexOf(".");
  return dotIndex === -1 ? trimmed.toLowerCase() : trimmed.slice(dotIndex + 1).toLowerCase();
}

const builtinOptimizerBaseNames = new Set(BUILTIN_OPTIMIZER_ENTRIES.map((entry) => getOptimizerBaseName(entry.value)));

const PYTORCH_OPTIMIZER_ENTRIES: TrainingOptionEntry[] = PYTORCH_OPTIMIZER_ALL_NAMES
  .filter((name) => !builtinOptimizerBaseNames.has(name.toLowerCase()))
  .map((name) => createPytorchOptimizerEntry(name));

const TRAINING_OPTION_ENTRIES: TrainingOptionEntry[] = [
  ...BUILTIN_OPTIMIZER_ENTRIES,
  ...PYTORCH_OPTIMIZER_ENTRIES,
  ...BUILTIN_SCHEDULER_ENTRIES,
  ...EXTRA_SCHEDULER_ENTRIES,
];

const CORE_VISIBLE_VALUES: Record<TrainingOptionKind, string[]> = {
  optimizer: BUILTIN_OPTIMIZER_ENTRIES.map((entry) => entry.value),
  scheduler: BUILTIN_SCHEDULER_ENTRIES.map((entry) => entry.value),
};

const ENTRY_MAP = new Map(TRAINING_OPTION_ENTRIES.map((entry) => [`${entry.kind}:${entry.value}`, entry]));
const SCHEDULER_TYPE_MAP = new Map(
  TRAINING_OPTION_ENTRIES
    .filter((entry) => entry.kind === "scheduler" && entry.schedulerTypePath)
    .map((entry) => [entry.schedulerTypePath as string, entry])
);

function compareEntries(left: TrainingOptionEntry, right: TrainingOptionEntry) {
  if (left.defaultVisible !== right.defaultVisible) {
    return left.defaultVisible ? -1 : 1;
  }
  if (left.featured !== right.featured) {
    return left.featured ? -1 : 1;
  }
  if (left.sourceLabel !== right.sourceLabel) {
    return left.sourceLabel.localeCompare(right.sourceLabel);
  }
  return left.label.localeCompare(right.label);
}

function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}

function readVisibilitySettings(): TrainingOptionVisibilitySettings {
  const fallback = {
    optimizer: TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === "optimizer" && entry.defaultVisible).map((entry) => entry.value),
    scheduler: TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === "scheduler" && entry.defaultVisible).map((entry) => entry.value),
  } satisfies TrainingOptionVisibilitySettings;

  const instance = safeWindow();
  if (!instance) {
    return fallback;
  }

  try {
    const raw = instance.localStorage.getItem(TRAINING_OPTION_VISIBILITY_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<TrainingOptionVisibilitySettings>;
    return {
      optimizer: sanitizeVisibilityList("optimizer", parsed.optimizer, fallback.optimizer),
      scheduler: sanitizeVisibilityList("scheduler", parsed.scheduler, fallback.scheduler),
    };
  } catch {
    return fallback;
  }
}

function sanitizeVisibilityList(
  kind: TrainingOptionKind,
  value: unknown,
  fallback: string[]
) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const validValues = new Set(TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === kind).map((entry) => entry.value));
  return value
    .map((entry) => String(entry))
    .filter((entry, index, list) => validValues.has(entry) && list.indexOf(entry) === index);
}

function writeVisibilitySettings(settings: TrainingOptionVisibilitySettings) {
  const instance = safeWindow();
  if (!instance) {
    return;
  }
  instance.localStorage.setItem(TRAINING_OPTION_VISIBILITY_STORAGE_KEY, JSON.stringify(settings));
}

export function getTrainingOptionEntries(kind: TrainingOptionKind) {
  return TRAINING_OPTION_ENTRIES
    .filter((entry) => entry.kind === kind)
    .slice()
    .sort(compareEntries);
}

export function getTrainingOptionEntry(kind: TrainingOptionKind, value: string) {
  return ENTRY_MAP.get(`${kind}:${value}`) ?? null;
}

export function getTrainingOptionEntryBySchedulerType(path: string) {
  return SCHEDULER_TYPE_MAP.get(path) ?? null;
}

export function getTrainingOptionVisibilitySettings() {
  return readVisibilitySettings();
}

export function setTrainingOptionVisibility(kind: TrainingOptionKind, visibleValues: string[]) {
  const current = readVisibilitySettings();
  current[kind] = sanitizeVisibilityList(kind, visibleValues, []);
  writeVisibilitySettings(current);
}

export function resetTrainingOptionVisibility(kind?: TrainingOptionKind) {
  if (!kind) {
    writeVisibilitySettings({
      optimizer: TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === "optimizer" && entry.defaultVisible).map((entry) => entry.value),
      scheduler: TRAINING_OPTION_ENTRIES.filter((entry) => entry.kind === "scheduler" && entry.defaultVisible).map((entry) => entry.value),
    });
    return;
  }

  const defaults = getTrainingOptionEntries(kind)
    .filter((entry) => entry.defaultVisible)
    .map((entry) => entry.value);
  const current = readVisibilitySettings();
  current[kind] = defaults;
  writeVisibilitySettings(current);
}

export function setAllTrainingOptionVisibility(kind: TrainingOptionKind, visible: boolean) {
  const nextValues = visible ? getTrainingOptionEntries(kind).map((entry) => entry.value) : [];
  const current = readVisibilitySettings();
  current[kind] = nextValues;
  writeVisibilitySettings(current);
}

export function setBuiltInTrainingOptionVisibility(kind: TrainingOptionKind) {
  const current = readVisibilitySettings();
  current[kind] = [...CORE_VISIBLE_VALUES[kind]];
  writeVisibilitySettings(current);
}

export function getVisibleTrainingOptionEntries(kind: TrainingOptionKind) {
  const visibleSet = new Set(readVisibilitySettings()[kind]);
  return getTrainingOptionEntries(kind).filter((entry) => visibleSet.has(entry.value));
}

function buildSelectionNote(entry: TrainingOptionEntry | null, hiddenBySettings: boolean) {
  const notes: string[] = [];

  if (hiddenBySettings) {
    notes.push("Currently hidden in Settings, but kept because this value is already selected or imported.");
  }

  if (entry?.kind === "scheduler" && entry.schedulerTypePath) {
    notes.push(`Launch bridge writes lr_scheduler_type=${entry.schedulerTypePath}.`);
  }

  if (entry?.packageName) {
    notes.push(`Requires ${entry.packageName} in the active Python environment.`);
  }

  return notes.join(" ");
}

function createGenericChoice(value: string, hiddenBySettings: boolean): TrainingOptionChoice {
  return {
    value,
    label: hiddenBySettings ? `${value} [hidden/imported]` : value,
    description: "Imported value kept for compatibility.",
    hiddenBySettings,
    selectionNote: hiddenBySettings
      ? "This value is not in the current visible catalog, but it is preserved so older configs keep working."
      : undefined,
  };
}

export function buildTrainingOptionChoices(
  kind: TrainingOptionKind,
  schemaOptions: readonly (string | number | boolean)[],
  currentValue: unknown
) {
  const visibleValues = new Set(getTrainingOptionVisibilitySettings()[kind]);
  const currentText = currentValue === undefined || currentValue === null ? "" : String(currentValue);
  const choices: TrainingOptionChoice[] = [];
  const seen = new Set<string>();

  const maybePushChoice = (value: string, schemaDeclared = false) => {
    if (seen.has(value)) {
      return;
    }

    const entry = getTrainingOptionEntry(kind, value);
    const hiddenBySettings = Boolean(entry) && !visibleValues.has(value);
    const shouldShow = schemaDeclared
      ? !hiddenBySettings || value === currentText || !entry
      : visibleValues.has(value) || value === currentText;

    if (!shouldShow) {
      return;
    }

    if (!entry) {
      choices.push(createGenericChoice(value, value === currentText && !schemaDeclared));
      seen.add(value);
      return;
    }

    choices.push({
      value,
      label: `${entry.label} [${entry.sourceLabel}]${hiddenBySettings ? " [hidden]" : ""}`,
      description: entry.description,
      sourceLabel: entry.sourceLabel,
      hiddenBySettings,
      selectionNote: buildSelectionNote(entry, hiddenBySettings),
      entry,
    });
    seen.add(value);
  };

  for (const option of schemaOptions) {
    maybePushChoice(String(option), true);
  }

  for (const entry of getTrainingOptionEntries(kind)) {
    maybePushChoice(entry.value);
  }

  if (currentText.length > 0 && !seen.has(currentText)) {
    maybePushChoice(currentText);
  }

  return choices;
}

function stringValue(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

export function syncManagedSchedulerFields(values: Record<string, unknown>, changedPath: string) {
  if (changedPath === "lr_scheduler") {
    const schedulerValue = stringValue(values.lr_scheduler);
    const selectedEntry = getTrainingOptionEntry("scheduler", schedulerValue);
    if (selectedEntry?.schedulerTypePath) {
      values.lr_scheduler_type = selectedEntry.schedulerTypePath;
      return;
    }

    const currentType = stringValue(values.lr_scheduler_type).trim();
    if (currentType.length > 0 && SCHEDULER_TYPE_MAP.has(currentType)) {
      values.lr_scheduler_type = "";
    }
    return;
  }

  if (changedPath === "lr_scheduler_type") {
    const schedulerType = stringValue(values.lr_scheduler_type).trim();
    const matchedEntry = getTrainingOptionEntryBySchedulerType(schedulerType);
    if (matchedEntry) {
      values.lr_scheduler = matchedEntry.value;
    }
  }
}

export function restoreManagedSchedulerSelection(values: Record<string, unknown>) {
  const schedulerType = stringValue(values.lr_scheduler_type).trim();
  if (schedulerType.length === 0) {
    return values;
  }

  const matchedEntry = getTrainingOptionEntryBySchedulerType(schedulerType);
  if (matchedEntry) {
    values.lr_scheduler = matchedEntry.value;
  }
  return values;
}

export function normalizeManagedSchedulerSelection(values: Record<string, unknown>) {
  const schedulerValue = stringValue(values.lr_scheduler);
  const selectedEntry = getTrainingOptionEntry("scheduler", schedulerValue);
  if (!selectedEntry?.schedulerTypePath) {
    return values;
  }

  values.lr_scheduler_type = selectedEntry.schedulerTypePath;
  values.lr_scheduler = selectedEntry.schedulerFallback ?? "constant";
  return values;
}
