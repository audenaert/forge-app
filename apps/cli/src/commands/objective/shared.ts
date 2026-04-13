// Shared helpers for the `etak objective *` command group.
//
// Deliberately duplicated from `../idea/shared.ts` for M2 Round 1. An
// extraction pass after the second type lands will consolidate the pure
// helpers (slug derivation, stdin, file read) into a single cross-type
// module — but only once the duplication is real, not guessed. Until then,
// each command group keeps its own copy so the extract pass can compare two
// concrete call sites rather than one concrete and one abstraction.

import { readFile } from 'node:fs/promises';

import type { CommandContext, CreateCommandContextOptions } from '../../context.js';

/**
 * Factory signature the objective registration accepts so tests can inject a
 * fake `CommandContext` without spinning up a real adapter. Production code
 * passes `createCommandContext` through, which walks up for `.etak/` and
 * instantiates the fs adapter.
 */
export type CommandContextFactory = (
  opts: CreateCommandContextOptions,
) => Promise<CommandContext>;

/**
 * Kebab-case slug derivation per design spec §5. Matches the slug regex
 * `^[a-z0-9][a-z0-9-]*[a-z0-9]$`:
 *   1. Lowercase the input.
 *   2. Replace any run of non `[a-z0-9]` characters with a single `-`.
 *   3. Trim leading/trailing `-`.
 *   4. Truncate to 80 characters at the last safe `-` boundary.
 *
 * Returns `null` for inputs that collapse to fewer than 3 characters — the
 * caller raises a ValidationError suggesting `--slug`.
 */
export function deriveSlug(name: string): string | null {
  const lowered = name.toLowerCase();
  const replaced = lowered.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (replaced.length === 0) return null;
  let candidate = replaced;
  if (candidate.length > 80) {
    const truncated = candidate.slice(0, 80);
    const lastDash = truncated.lastIndexOf('-');
    candidate = lastDash > 0 ? truncated.slice(0, lastDash) : truncated;
    candidate = candidate.replace(/-+$/g, '');
  }
  if (candidate.length < 3) return null;
  if (!/^[a-z0-9]/.test(candidate)) return null;
  if (!/[a-z0-9]$/.test(candidate)) return null;
  return candidate;
}

/**
 * Read all of stdin as a utf-8 string. Used by body/section flags that
 * accept `--body-stdin` or `--stdin`. Returns an empty string when stdin is
 * a TTY to avoid a hang; the command handler surfaces that as a validation
 * error so interactive misuse fails fast.
 */
export async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

/** Read a file and return its contents as utf-8. Bubbles up ENOENT etc. */
export async function readFileUtf8(path: string): Promise<string> {
  return readFile(path, 'utf8');
}
