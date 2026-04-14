// Registration entry for `etak critique *`. Wires the five leaf handlers
// onto a commander `critique` subcommand group.
//
// Critique diverges from idea/objective in three ways that matter at this
// registration layer:
//   1. There is no `--status` anywhere (critique has no status field).
//   2. There is no `--section` anywhere (critique bodies are opaque).
//   3. `create` requires `--target` — a critique with no target is
//      meaningless per the schema.
//
// The link command exists and handles the mixed scalar/array link shape:
// `target` (scalar) replaces on every call; `personas_used`,
// `frameworks_used`, `artifacts_created` (array) append/remove.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import { runCommand } from '../../errors/boundary.js';
import { createCommandContext } from '../../context.js';
import type { CommandContextFactory } from '../../context.js';

import { registerCreateCommand } from './create.js';
import { registerGetCommand } from './get.js';
import { registerListCommand } from './list.js';
import { registerUpdateCommand } from './update.js';
import { registerLinkCommand } from './link.js';

export interface RegisterCritiqueOptions {
  globals: ChassisGlobals;
  /**
   * Factory for the command context. Defaults to `createCommandContext`
   * from `../../context.js`. Tests can inject a fake to skip the real
   * walk-up and adapter instantiation.
   */
  createContext?: CommandContextFactory;
}

/**
 * Wire the full `etak critique` subcommand group onto the program. M2-S5
 * replaces the `critique` entry in the `not-implemented` loop.
 */
export function registerCritiqueCommands(
  program: Command,
  opts: RegisterCritiqueOptions,
): Command {
  const { globals } = opts;
  const factory: CommandContextFactory = opts.createContext ?? createCommandContext;

  const group = program
    .command('critique')
    .description('manage critique artifacts');

  // Bare `etak critique` → usage error.
  group.action(async () => {
    const code = await runCommand<never>({
      command: 'critique',
      mode: globals.mode,
      streams: globals.streams,
      ...(globals.color !== undefined ? { color: globals.color } : {}),
      handler: async () => {
        const { UsageError } = await import('../../errors/exit-codes.js');
        throw new UsageError(
          '`etak critique` requires a subcommand (create|get|list|update|link)',
        );
      },
    });
    globals.exit(code);
  });

  registerCreateCommand(group, globals, factory);
  registerGetCommand(group, globals, factory);
  registerListCommand(group, globals, factory);
  registerUpdateCommand(group, globals, factory);
  registerLinkCommand(group, globals, factory);

  return group;
}
