// Stub subcommand registration for artifact types that are not yet
// implemented. M1-S6 ships real handlers for `idea`; M2 replaces the
// registrations for the other five types (objective, opportunity,
// assumption, experiment, critique) with real handlers.
//
// Leaving the stubs visible in `--help` keeps the surface documented while
// the handlers remain empty. The stub shape is:
//
//   1. For an uninitialized project, `createCommandContext()` throws
//      `AdapterError{E_NOT_INITIALIZED}` — the boundary maps that to exit
//      3 with a "run etak init" suggestion.
//   2. For an initialized project, the handler proves the context is
//      wired, then throws `UsageError` to exit 4 with "not implemented in
//      M1".
//
// Drop-in replacement: when M2 implements (say) `opportunity`, delete the
// entry for `opportunity` from this file's iteration set and register its
// real commands alongside `registerIdeaCommands` in `cli.ts`.

import type { Command } from 'commander';
import type { ArtifactType } from '../schemas/index.js';
import type { ChassisGlobals } from '../cli-runtime.js';
import { runCommand } from '../errors/boundary.js';
import { UsageError } from '../errors/exit-codes.js';
import { createCommandContext } from '../context.js';

export interface StubSubcommandSpec {
  name: string;
  description: string;
}

/** The five leaf subcommands every non-idea type currently stubs. */
export const STUB_LEAVES: readonly StubSubcommandSpec[] = [
  { name: 'create', description: 'create a new artifact' },
  { name: 'get', description: 'fetch an artifact by slug' },
  { name: 'list', description: 'list artifacts of this type' },
  { name: 'update', description: 'update an existing artifact' },
  { name: 'link', description: 'add or remove typed links' },
];

/**
 * Wire a stub type-subcommand group. All leaves prove the context is wired
 * and then throw UsageError ("not implemented in M1"). `etak <type>` with
 * no subcommand is also a usage error.
 */
export function registerNotImplementedType(
  program: Command,
  type: ArtifactType,
  globals: ChassisGlobals,
): Command {
  const group = program
    .command(type)
    .description(`manage ${type} artifacts (not implemented in M1)`)
    .allowUnknownOption(false);

  for (const leaf of STUB_LEAVES) {
    group
      .command(leaf.name)
      .description(`${leaf.description} (not implemented in M1)`)
      .allowUnknownOption(true)
      .action(async () => {
        const commandName = `${type} ${leaf.name}`;
        const code = await runCommand<never>({
          command: commandName,
          mode: globals.mode,
          streams: globals.streams,
          ...(globals.color !== undefined ? { color: globals.color } : {}),
          handler: async () => {
            // Prove the project is initialized. An uninitialized project
            // throws AdapterError{E_NOT_INITIALIZED} (→ exit 3) before we
            // reach the stub message.
            const ctx = await createCommandContext({
              cwd: globals.cwd,
              env: globals.env,
              mode: globals.mode,
              streams: globals.streams,
            });
            void ctx;
            throw new UsageError(
              `\`etak ${commandName}\` is not implemented in M1`,
            );
          },
        });
        globals.exit(code);
      });
  }

  // `etak <type>` with no subcommand — usage error, exit 4.
  group.action(async () => {
    const code = await runCommand<never>({
      command: type,
      mode: globals.mode,
      streams: globals.streams,
      ...(globals.color !== undefined ? { color: globals.color } : {}),
      handler: async () => {
        throw new UsageError(
          `\`etak ${type}\` requires a subcommand (create|get|list|update|link)`,
        );
      },
    });
    globals.exit(code);
  });

  return group;
}
