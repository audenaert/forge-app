// Registration entry for `etak objective *`. Wires the FOUR leaf handlers
// onto a commander `objective` subcommand group. There is no `link`
// subcommand — objectives have no typed link fields in the schema, so
// there is nothing for a link command to manipulate. Other artifact types
// (opportunity, idea, etc.) `supports` an objective; the objective itself
// points at nothing.
//
// Test hook: the registration accepts a `CommandContextFactory` so
// integration tests can inject a fake adapter without going through env
// walk-up. Production `cli.ts` passes `createCommandContext` directly.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import { runCommand } from '../../errors/boundary.js';
import { createCommandContext } from '../../context.js';
import type { CommandContextFactory } from '../../context.js';

import { registerCreateCommand } from './create.js';
import { registerGetCommand } from './get.js';
import { registerListCommand } from './list.js';
import { registerUpdateCommand } from './update.js';

export interface RegisterObjectiveOptions {
  globals: ChassisGlobals;
  /**
   * Factory for the command context. Defaults to `createCommandContext`
   * from `../../context.js`. Tests can inject a fake to skip the real
   * walk-up and adapter instantiation.
   */
  createContext?: CommandContextFactory;
}

/**
 * Wire the full `etak objective` subcommand group onto the program. M2-S1
 * replaces the `objective` entry in the `not-implemented` loop.
 */
export function registerObjectiveCommands(
  program: Command,
  opts: RegisterObjectiveOptions,
): Command {
  const { globals } = opts;
  const factory: CommandContextFactory = opts.createContext ?? createCommandContext;

  const group = program
    .command('objective')
    .description('manage objective artifacts');

  // Bare `etak objective` → usage error.
  group.action(async () => {
    const code = await runCommand<never>({
      command: 'objective',
      mode: globals.mode,
      streams: globals.streams,
      ...(globals.color !== undefined ? { color: globals.color } : {}),
      handler: async () => {
        const { UsageError } = await import('../../errors/exit-codes.js');
        throw new UsageError(
          '`etak objective` requires a subcommand (create|get|list|update)',
        );
      },
    });
    globals.exit(code);
  });

  registerCreateCommand(group, globals, factory);
  registerGetCommand(group, globals, factory);
  registerListCommand(group, globals, factory);
  registerUpdateCommand(group, globals, factory);

  return group;
}
