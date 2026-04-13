// Output mode detection.
//
// Rule (design §4): `--output` flag wins if explicit. Otherwise default to
// `human` when stdout is a TTY, `json` when piped. Skills running inside
// Claude Code end up in the non-TTY branch and get JSON automatically
// without passing `--output json` — the ergonomic default that lets the
// same command work interactively and non-interactively.

export type OutputMode = 'human' | 'json';

export interface DetectOutputModeOptions {
  /** Explicit `--output` flag, if the user passed one. */
  explicit?: OutputMode;
  /** The stream whose TTY-ness determines the default. */
  stdout: Pick<NodeJS.WriteStream, 'isTTY'>;
}

export function detectOutputMode(opts: DetectOutputModeOptions): OutputMode {
  if (opts.explicit) return opts.explicit;
  return opts.stdout.isTTY ? 'human' : 'json';
}

/** Parse a user-supplied `--output` flag value. Throws on unknown. */
export function parseOutputMode(raw: string): OutputMode {
  if (raw === 'human' || raw === 'json') return raw;
  throw new Error(
    `invalid --output value: "${raw}" (expected "human" or "json")`,
  );
}
