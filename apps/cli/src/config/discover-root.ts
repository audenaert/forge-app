// Walk-up project-root discovery for the filesystem adapter.
//
// The project root is the nearest ancestor directory that contains either
// a `.etak/` directory or an `etak.config.json` file. Env-var overrides
// (`ETAK_ROOT`, `ETAK_ARTIFACTS`) take precedence over walk-up discovery;
// this module implements the walk-up, not the env-var step — that lives in
// `resolve-backend.ts`.
//
// Errors: throws NotFoundError (exit 2) when no root is found. The caller
// is expected to wrap this into a user-facing "run etak init" suggestion.

import { stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { NotFoundError } from '../adapters/errors.js';

export interface DiscoverRootOptions {
  /** Directory to start the walk from. Defaults to `process.cwd()`. */
  cwd?: string;
  /**
   * Markers to look for at each ancestor. A directory containing ANY of
   * these is treated as the project root. Order does not matter.
   */
  markers?: readonly string[];
}

const DEFAULT_MARKERS: readonly string[] = ['.etak', 'etak.config.json'];

export async function discoverProjectRoot(opts: DiscoverRootOptions = {}): Promise<string> {
  const start = resolve(opts.cwd ?? process.cwd());
  const markers = opts.markers ?? DEFAULT_MARKERS;

  let current = start;
  // Walk up until we hit filesystem root (dirname returns the same path).
  while (true) {
    for (const marker of markers) {
      const probe = resolve(current, marker);
      if (await pathExists(probe)) {
        return current;
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new NotFoundError(
    `no etak project root found walking up from ${start} (looked for: ${markers.join(', ')})`,
    { details: { start: start, markers: markers.slice() } },
  );
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: unknown }).code === 'ENOENT'
    ) {
      return false;
    }
    throw err;
  }
}
