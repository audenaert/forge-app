// Command context — the bundle of dependencies every non-init command
// receives from the chassis. Handlers (M1-S6 and onward) take a
// `CommandContext` and produce a success `Envelope`; they don't touch
// commander or the output layer directly.
//
// The context assembly order is:
//   1. Resolve backend / project root / artifact root from env + cwd
//      (this is where walk-up discovery happens).
//   2. Instantiate the storage adapter for the resolved backend.
//   3. Hand the chassis-detected output mode and streams back so handlers
//      can thread them into nested calls if needed.
//
// Failure: if there is no `.etak/` anywhere above cwd, walk-up throws
// `NotFoundError`. The chassis needs that to surface as exit 3 with a
// "run etak init" suggestion, not exit 2 — per story AC. We catch and
// re-throw as `AdapterError` with a dedicated code.

import { AdapterError, NotFoundError } from './adapters/errors.js';
import type { StorageAdapter } from './adapters/interface.js';
import { makeAdapter } from './config/adapter-factory.js';
import {
  resolveBackend,
  type ResolvedConfig,
} from './config/resolve-backend.js';
import type { OutputMode } from './output/tty.js';
import type { StreamPair } from './output/write.js';

export interface CommandContext {
  readonly adapter: StorageAdapter;
  readonly config: ResolvedConfig;
  readonly mode: OutputMode;
  readonly streams: StreamPair;
}

export interface CreateCommandContextOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  mode: OutputMode;
  streams: StreamPair;
}

/**
 * Factory signature every command-group registration accepts so tests can
 * inject a fake `CommandContext` without spinning up a real adapter.
 * Production code passes `createCommandContext` through, which walks up
 * for `.etak/` and instantiates the fs adapter. Shared across all leaf
 * handlers.
 */
export type CommandContextFactory = (
  opts: CreateCommandContextOptions,
) => Promise<CommandContext>;

export async function createCommandContext(
  opts: CreateCommandContextOptions,
): Promise<CommandContext> {
  let config: ResolvedConfig;
  try {
    const resolveOpts: { cwd?: string; env?: NodeJS.ProcessEnv } = {};
    if (opts.cwd !== undefined) resolveOpts.cwd = opts.cwd;
    if (opts.env !== undefined) resolveOpts.env = opts.env;
    config = await resolveBackend(resolveOpts);
  } catch (err) {
    if (err instanceof NotFoundError) {
      // No `.etak/` found walking up. This is an environmental problem,
      // not input validation or a missing artifact — map to exit 3 and
      // suggest `etak init`. Details carry the original walk-up metadata.
      throw new AdapterError(
        'no etak project found — run `etak init` to create one',
        {
          code: 'E_NOT_INITIALIZED',
          details: err.details ?? {},
        },
      );
    }
    throw err;
  }

  const adapter = makeAdapter(config);
  return {
    adapter,
    config,
    mode: opts.mode,
    streams: opts.streams,
  };
}
