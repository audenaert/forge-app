// Registration entry for `etak opportunity *`. Wires the FIVE leaf handlers
// onto a commander `opportunity` subcommand group.
//
// Opportunity has a `supports` link field (arrays of objective slugs), so —
// unlike `objective` — it carries a `link` subcommand. It also has a
// first-class `--hmw` flag which threads the `hmw` known-extras passthrough
// field (see `OPPORTUNITY_KNOWN_EXTRAS` in schemas/opportunity.ts) through
// create/update as a typed convenience.

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

export interface RegisterOpportunityOptions {
  globals: ChassisGlobals;
  /**
   * Factory for the command context. Defaults to `createCommandContext`
   * from `../../context.js`. Tests can inject a fake to skip the real
   * walk-up and adapter instantiation.
   */
  createContext?: CommandContextFactory;
}

/**
 * Wire the full `etak opportunity` subcommand group onto the program. M2-S2
 * replaces the `opportunity` entry in the `not-implemented` loop.
 */
export function registerOpportunityCommands(
  program: Command,
  opts: RegisterOpportunityOptions,
): Command {
  const { globals } = opts;
  const factory: CommandContextFactory = opts.createContext ?? createCommandContext;

  const group = program
    .command('opportunity')
    .description('manage opportunity artifacts');

  // Bare `etak opportunity` → usage error.
  group.action(async () => {
    const code = await runCommand<never>({
      command: 'opportunity',
      mode: globals.mode,
      streams: globals.streams,
      ...(globals.color !== undefined ? { color: globals.color } : {}),
      handler: async () => {
        const { UsageError } = await import('../../errors/exit-codes.js');
        throw new UsageError(
          '`etak opportunity` requires a subcommand (create|get|list|update|link)',
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
