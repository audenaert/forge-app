// Registration entry for `etak idea *`. Wires the five leaf handlers onto
// a commander `idea` subcommand group. Each leaf lives in its own file so
// M1-S6 commits can land incrementally; this module only threads options
// and the context factory into them.
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
import { registerLinkCommand } from './link.js';

export interface RegisterIdeaOptions {
  globals: ChassisGlobals;
  /**
   * Factory for the command context. Defaults to `createCommandContext`
   * from `../../context.js`. Tests can inject a fake to skip the real
   * walk-up and adapter instantiation.
   */
  createContext?: CommandContextFactory;
}

/**
 * Wire the full `etak idea` subcommand group onto the program. This is the
 * M1-S6 replacement for the legacy idea-in-`type-stub` registration.
 */
export function registerIdeaCommands(
  program: Command,
  opts: RegisterIdeaOptions,
): Command {
  const { globals } = opts;
  const factory: CommandContextFactory = opts.createContext ?? createCommandContext;

  const group = program
    .command('idea')
    .description('manage idea artifacts');

  // Bare `etak idea` → usage error.
  group.action(async () => {
    const code = await runCommand<never>({
      command: 'idea',
      mode: globals.mode,
      streams: globals.streams,
      ...(globals.color !== undefined ? { color: globals.color } : {}),
      handler: async () => {
        const { UsageError } = await import('../../errors/exit-codes.js');
        throw new UsageError(
          '`etak idea` requires a subcommand (create|get|list|update|link)',
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
