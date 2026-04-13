// `etak init` — create the `.etak/artifacts/` skeleton in the current
// project root. Design spec §6.1a.
//
// Notable properties:
//   - Uses plain `node:fs/promises`. Does NOT go through StorageAdapter.
//     `etak init` runs BEFORE any adapter exists — its whole purpose is to
//     create the state the adapter later reads from.
//   - Idempotent: re-running against an already-initialized project is a
//     no-op (or fills in any missing subdirectories). Never overwrites.
//   - Reports what was created vs what already existed so callers can tell
//     the difference.
//
// Scope guardrail: do NOT design a config surface here. The only config
// file this command writes is a minimal `{ "schema": "etak/v1" }` stub,
// opt-in behind `--with-config`. A future story owns the real config
// schema.

import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { AdapterError, ValidationError } from '../adapters/errors.js';
import { ARTIFACT_TYPES } from '../schemas/index.js';
import type { Envelope } from '../output/envelope.js';
import { envelopeSuccess } from '../output/envelope.js';

export interface InitOptions {
  /** Target directory. Defaults to cwd. */
  root?: string;
  /** Write a minimal `etak.config.json` if true. */
  withConfig?: boolean;
}

export interface InitResult {
  /** Absolute project root that was initialized. */
  root: string;
  /** Paths (relative to `root`) that were created by this run. */
  created: string[];
  /** Paths (relative to `root`) that already existed and were left alone. */
  alreadyExisted: string[];
  /** Path to the written config file, if `--with-config` was passed. */
  configPath?: string;
}

// Per design spec §6.1a: subdirectories are the pluralized type names. The
// only irregular plural among the six discovery types is `opportunity` →
// `opportunities`; everything else is a suffix-`s`. Rather than pull in a
// pluralization library, we hand-code the mapping — the set of artifact
// types is small, stable, and already defined in one place.
const ARTIFACT_SUBDIR_BY_TYPE: Readonly<Record<(typeof ARTIFACT_TYPES)[number], string>> = {
  objective: 'objectives',
  opportunity: 'opportunities',
  idea: 'ideas',
  assumption: 'assumptions',
  experiment: 'experiments',
  critique: 'critiques',
};

const ARTIFACT_SUBDIRS: readonly string[] = ARTIFACT_TYPES.map(
  (t) => ARTIFACT_SUBDIR_BY_TYPE[t],
);

export async function runInit(
  opts: InitOptions = {},
  cwd: string = process.cwd(),
): Promise<Envelope<InitResult>> {
  const root = resolve(opts.root ?? cwd);

  // `--root` validation: if the user explicitly pointed at a path, it must
  // exist and be a directory. Missing paths are user-correctable — exit 1.
  // Without `--root`, cwd is implicitly valid (the process couldn't run
  // otherwise), so we skip the check.
  if (opts.root !== undefined) {
    await assertIsDirectory(root);
  }

  const etakDir = resolve(root, '.etak');
  const artifactsDir = resolve(etakDir, 'artifacts');

  const created: string[] = [];
  const alreadyExisted: string[] = [];

  await ensureDir(etakDir, '.etak', created, alreadyExisted);
  await ensureDir(artifactsDir, '.etak/artifacts', created, alreadyExisted);

  for (const sub of ARTIFACT_SUBDIRS) {
    const subPath = resolve(artifactsDir, sub);
    await ensureDir(subPath, `.etak/artifacts/${sub}`, created, alreadyExisted);
    const gitkeep = resolve(subPath, '.gitkeep');
    await ensureFile(gitkeep, `.etak/artifacts/${sub}/.gitkeep`, '', created, alreadyExisted);
  }

  const result: InitResult = { root, created, alreadyExisted };

  if (opts.withConfig) {
    const configPath = resolve(etakDir, 'etak.config.json');
    const minimal = `${JSON.stringify({ schema: 'etak/v1' }, null, 2)}\n`;
    const wrote = await ensureFile(
      configPath,
      '.etak/etak.config.json',
      minimal,
      created,
      alreadyExisted,
    );
    // Always report the path the user asked about, whether we wrote it or
    // left it alone.
    result.configPath = configPath;
    void wrote;
  }

  return envelopeSuccess('init', result);
}

// ---------------------------------------------------------------------------
// fs helpers — all wrap raw errors into AdapterError/ValidationError so the
// boundary can classify them cleanly. These never throw plain Error.
// ---------------------------------------------------------------------------

async function ensureDir(
  abs: string,
  rel: string,
  created: string[],
  alreadyExisted: string[],
): Promise<void> {
  try {
    await mkdir(abs, { recursive: false });
    created.push(rel);
  } catch (err) {
    if (isErrnoCode(err, 'EEXIST')) {
      alreadyExisted.push(rel);
      return;
    }
    if (isErrnoCode(err, 'ENOENT')) {
      // Parent directory missing. Fall through to recursive mkdir so that
      // e.g. a `--root` pointing at a newly-minted subdir still succeeds.
      try {
        await mkdir(abs, { recursive: true });
        created.push(rel);
        return;
      } catch (nested) {
        throw wrapFsError(nested, `failed to create ${rel}`);
      }
    }
    throw wrapFsError(err, `failed to create ${rel}`);
  }
}

async function ensureFile(
  abs: string,
  rel: string,
  contents: string,
  created: string[],
  alreadyExisted: string[],
): Promise<boolean> {
  try {
    // `wx` flag: fail if exists, create otherwise.
    await writeFile(abs, contents, { flag: 'wx' });
    created.push(rel);
    return true;
  } catch (err) {
    if (isErrnoCode(err, 'EEXIST')) {
      alreadyExisted.push(rel);
      return false;
    }
    if (isErrnoCode(err, 'ENOENT')) {
      // Parent dir missing — recover by creating it, then retry once.
      try {
        await mkdir(dirname(abs), { recursive: true });
        await writeFile(abs, contents, { flag: 'wx' });
        created.push(rel);
        return true;
      } catch (nested) {
        if (isErrnoCode(nested, 'EEXIST')) {
          alreadyExisted.push(rel);
          return false;
        }
        throw wrapFsError(nested, `failed to write ${rel}`);
      }
    }
    throw wrapFsError(err, `failed to write ${rel}`);
  }
}

async function assertIsDirectory(abs: string): Promise<void> {
  let stats;
  try {
    stats = await stat(abs);
  } catch (err) {
    if (isErrnoCode(err, 'ENOENT')) {
      throw new ValidationError(
        `--root path does not exist: ${abs}`,
        { details: { path: abs } },
      );
    }
    throw wrapFsError(err, `failed to stat --root path ${abs}`);
  }
  if (!stats.isDirectory()) {
    throw new ValidationError(
      `--root path is not a directory: ${abs}`,
      { details: { path: abs } },
    );
  }
}

function isErrnoCode(err: unknown, code: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === code
  );
}

function wrapFsError(err: unknown, message: string): AdapterError {
  const errno =
    typeof err === 'object' && err !== null && 'code' in err
      ? (err as { code: unknown }).code
      : undefined;
  const details: Record<string, unknown> = {};
  if (errno !== undefined) details['errno'] = errno;
  if (err instanceof Error) details['cause'] = err.message;
  return new AdapterError(message, {
    code: errno === 'EACCES' || errno === 'EPERM' ? 'E_PERMISSION' : 'E_IO',
    details,
  });
}

/** Human-mode one-line summary used by the chassis when rendering init. */
export function initHumanSummary(data: InitResult): string {
  if (data.created.length === 0) {
    return `etak project already initialized at ${data.root}`;
  }
  const n = data.created.length;
  const noun = n === 1 ? 'path' : 'paths';
  return `initialized etak project at ${data.root} (+${n} ${noun})`;
}
