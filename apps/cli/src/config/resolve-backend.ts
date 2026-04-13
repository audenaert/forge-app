// Backend and root resolution from env vars + walk-up discovery.
//
// Precedence (spec §6.3):
//   ETAK_BACKEND       (default: "fs")
//   ETAK_ROOT          (absolute project root; overrides walk-up discovery)
//   ETAK_ARTIFACTS     (absolute artifact dir; overrides `<root>/.etak/artifacts`)
//
// This module does not read a config file. v1 ships `etak init --with-config`
// as the only path that writes `etak.config.json` (§6.4), and the chassis
// story (M1-S5) owns reading it. resolve-backend's contract is "given
// process.env and a cwd, produce a ResolvedConfig".

import { resolve } from 'node:path';
import { discoverProjectRoot } from './discover-root.js';
import { ValidationError } from '../adapters/errors.js';

export type BackendKind = 'fs' | 'graphql';

export interface ResolvedConfig {
  backend: BackendKind;
  /** Absolute project root (contains `.etak/` or was pinned via ETAK_ROOT). */
  projectRoot: string;
  /** Absolute artifact root (`<projectRoot>/.etak/artifacts` by default). */
  artifactRoot: string;
}

export interface ResolveBackendOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export async function resolveBackend(opts: ResolveBackendOptions = {}): Promise<ResolvedConfig> {
  const env = opts.env ?? process.env;
  const cwd = resolve(opts.cwd ?? process.cwd());

  const backend = parseBackend(env['ETAK_BACKEND']);

  const projectRoot = env['ETAK_ROOT']
    ? resolve(env['ETAK_ROOT'])
    : await discoverProjectRoot({ cwd });

  const artifactRoot = env['ETAK_ARTIFACTS']
    ? resolve(env['ETAK_ARTIFACTS'])
    : resolve(projectRoot, '.etak', 'artifacts');

  return { backend, projectRoot, artifactRoot };
}

function parseBackend(raw: string | undefined): BackendKind {
  if (!raw) return 'fs';
  if (raw === 'fs' || raw === 'graphql') return raw;
  throw new ValidationError(
    `ETAK_BACKEND must be "fs" or "graphql"; got "${raw}"`,
    { details: { received: raw } },
  );
}
