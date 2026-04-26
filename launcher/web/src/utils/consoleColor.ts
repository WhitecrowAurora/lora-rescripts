// ANSI escape code parser and console line colorizer

interface StyledSegment {
  text: string;
  style: React.CSSProperties;
}

// ANSI foreground color map (30-37, 90-97)
const ANSI_FG: Record<number, string> = {
  30: '#000000', 31: '#cd3131', 32: '#0dbc79', 33: '#e5e510',
  34: '#2472c8', 35: '#bc3fbc', 36: '#11a8cd', 37: '#e5e5e5',
  90: '#666666', 91: '#f14c4c', 92: '#23d18b', 93: '#f5f543',
  94: '#3b8eea', 95: '#d670d6', 96: '#29b8db', 97: '#ffffff',
};

// Parse ANSI escape sequences from a string, return styled segments
export function parseAnsi(input: string): StyledSegment[] {
  const segments: StyledSegment[] = [];
  // Match ANSI escape sequences: \x1b[ ... m or \033[ ... m
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let currentFg: string | undefined;
  let currentBold = false;

  let match: RegExpExecArray | null;
  while ((match = ansiRegex.exec(input)) !== null) {
    // Push text before this escape
    if (match.index > lastIndex) {
      const text = input.slice(lastIndex, match.index);
      if (text) {
        segments.push({ text, style: buildStyle(currentFg, currentBold) });
      }
    }

    // Parse the SGR parameters
    const params = match[1].split(';').map(Number);
    for (const code of params) {
      if (code === 0) {
        currentFg = undefined;
        currentBold = false;
      } else if (code === 1) {
        currentBold = true;
      } else if (code >= 30 && code <= 37) {
        currentFg = ANSI_FG[code];
      } else if (code >= 90 && code <= 97) {
        currentFg = ANSI_FG[code];
      } else if (code === 39) {
        currentFg = undefined;
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last escape
  if (lastIndex < input.length) {
    const text = input.slice(lastIndex);
    if (text) {
      segments.push({ text, style: buildStyle(currentFg, currentBold) });
    }
  }

  // If no ANSI codes found, return empty array (caller will use keyword matching)
  if (segments.length === 0) return [];

  return segments;
}

function buildStyle(fg: string | undefined, bold: boolean): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (fg) style.color = fg;
  if (bold) style.fontWeight = 'bold';
  return style;
}

// Check if a string contains ANSI escape codes
export function hasAnsi(input: string): boolean {
  return /\x1b\[[0-9;]*m/.test(input);
}

// Keyword-based line classification
type LineClass = 'error' | 'warning' | 'success' | 'info' | 'muted' | 'dim' | 'default';

interface LineRule {
  pattern: RegExp;
  cls: LineClass;
}

const LINE_RULES: LineRule[] = [
  // Python tracebacks and exceptions
  { pattern: /^Traceback \(most recent call last\)/, cls: 'error' },
  { pattern: /^\s+File "/, cls: 'error' },
  { pattern: /^\s+File "</, cls: 'error' },
  { pattern: /^[A-Za-z]+Error:/, cls: 'error' },
  { pattern: /^Exception:/, cls: 'error' },
  { pattern: /^KeyboardInterrupt/, cls: 'warning' },

  // Common error indicators
  { pattern: /\[ERROR\]/i, cls: 'error' },
  { pattern: /\bCRITICAL\b/, cls: 'error' },
  { pattern: /\bFATAL\b/, cls: 'error' },
  { pattern: /failed\b/i, cls: 'error' },
  { pattern: /not found\b/i, cls: 'error' },
  { pattern: /could not\b/i, cls: 'error' },
  { pattern: /no such file/i, cls: 'error' },
  { pattern: /permission denied/i, cls: 'error' },

  // Warnings
  { pattern: /\[WARNING\]/i, cls: 'warning' },
  { pattern: /WARNING\s*[-:]/, cls: 'warning' },
  { pattern: /UserWarning:/, cls: 'warning' },
  { pattern: /FutureWarning:/, cls: 'warning' },
  { pattern: /DeprecationWarning:/, cls: 'warning' },

  // Success indicators
  { pattern: /\[SUCCESS\]/i, cls: 'success' },
  { pattern: /successfully\b/i, cls: 'success' },
  { pattern: /complete\b/i, cls: 'success' },
  { pattern: /finished\b/i, cls: 'success' },
  { pattern: /installed successfully/i, cls: 'success' },

  // Python logging INFO
  { pattern: /\bINFO\s*[-:]/, cls: 'info' },

  // Process exit
  { pattern: /^Process exited/, cls: 'muted' },

  // Progress bars and spinner lines (tqdm, pip)
  { pattern: /^\s*\d+%/, cls: 'dim' },
  { pattern: /\|[# ]+\|/, cls: 'dim' },

  // Dim lines: empty, whitespace-only
  { pattern: /^\s*$/, cls: 'dim' },
];

// Map line class to CSS variable color
function classToStyle(cls: LineClass): React.CSSProperties {
  switch (cls) {
    case 'error':
      return { color: 'var(--danger-text)', opacity: 0.9 };
    case 'warning':
      return { color: 'var(--warning-text)', opacity: 0.85 };
    case 'success':
      return { color: 'var(--success-text)', opacity: 0.85 };
    case 'info':
      return { color: 'var(--accent-text)' };
    case 'muted':
      return { color: 'var(--text-muted)' };
    case 'dim':
      return { color: 'var(--text-dim)' };
    default:
      return { color: 'var(--text-secondary)' };
  }
}

// Classify a line by keyword matching
export function classifyLine(text: string): { cls: LineClass; style: React.CSSProperties } {
  for (const rule of LINE_RULES) {
    if (rule.pattern.test(text)) {
      return { cls: rule.cls, style: classToStyle(rule.cls) };
    }
  }
  return { cls: 'default', style: classToStyle('default') };
}

// Process a console line: if it has ANSI codes, parse them;
// otherwise, apply keyword-based classification
export function colorizeLine(text: string): StyledSegment[] {
  // Strip ANSI codes for keyword matching but preserve them for ANSI rendering
  if (hasAnsi(text)) {
    const parsed = parseAnsi(text);
    if (parsed.length > 0) return parsed;
  }

  // Keyword-based: return single segment with classified style
  const { style } = classifyLine(text);
  return [{ text, style }];
}
