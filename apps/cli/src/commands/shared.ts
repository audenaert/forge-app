// Shared helpers lifted out of the per-type command groups (idea, objective)
// during M2 extract pass 1. Only character-identical duplicates and one
// small scaffolding helper live here — generic factories like
// `registerGetCommand` / `registerListCommand` and the update body-op
// assembly block are intentionally deferred until more concrete instances
// (opportunity, critique, assumption, experiment) land and the divergence
// shape is clear.
//
// The guiding rule: extract what IS duplicated, not what MIGHT be.

import { readFile } from 'node:fs/promises';

import { ValidationError } from '../adapters/errors.js';

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

/**
 * Commander-level collector for repeatable string options. Returns the
 * accumulated array so each additional `--addresses foo --addresses bar`
 * flag appends to the same list.
 */
export function collectStrings(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

/**
 * Split a `<slug>=<content>` flag value on the first `=`. Any additional
 * `=` characters are preserved in the content portion (so
 * `description=a=b=c` yields `{slug: 'description', value: 'a=b=c'}`).
 * An empty slug or a missing `=` is a ValidationError. Exported for
 * unit tests.
 */
export function splitKv(entry: string, flag: string): { slug: string; value: string } {
  const eq = entry.indexOf('=');
  if (eq === -1) {
    throw new ValidationError(
      `${flag} expects <slug>=<value>, got "${entry}"`,
    );
  }
  const slug = entry.slice(0, eq).trim();
  const value = entry.slice(eq + 1);
  if (slug.length === 0) {
    throw new ValidationError(
      `${flag} requires a non-empty section slug before "="`,
    );
  }
  return { slug, value };
}
