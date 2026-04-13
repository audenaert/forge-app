// Shared shape for every per-type subcommand group.
//
// In M1-S5 all six types are stubs. M1-S6 replaces the `idea` leaves with
// real handlers; M2 replaces the others. The chassis does NOT need to
// change for those swaps — they are drop-in replacements for the
// `action()` body below.
//
// The leaf-stub model does two things at once:
//
//   1. For an uninitialized project, the handler calls
//      `createCommandContext()` first, which walks up looking for `.etak/`.
//      If none is found, it throws `AdapterError{E_NOT_INITIALIZED}` and
//      the boundary maps that to exit 3 with a "run etak init" message —
//      per story AC "non-init command in an uninitialized project exits 3".
//
//   2. For an initialized project, the handler proceeds far enough to
//      prove the context is wired, then throws `UsageError` to exit 4
//      with the "not implemented in M1" envelope. M1-S6 replaces that
//      `throw` with `return envelopeSuccess(...)` from the real handler.
//
// `etak idea --help` (and the same for every other type) must still
// enumerate create/get/list/update/link so the surface stays documented
// while the handlers are empty.

import type { Command } from 'commander';
import type { ArtifactType } from '../schemas/index.js';
import type { ChassisGlobals } from '../cli-runtime.js';
import { runCommand } from '../errors/boundary.js';
import { UsageError } from '../errors/exit-codes.js';
import { createCommandContext } from '../context.js';

export interface TypeSubcommandSpec {
  name: string;
  description: string;
}

/** The five leaf subcommands every artifact type exposes (per §1, no delete). */
export const LEAF_SUBCOMMANDS: readonly TypeSubcommandSpec[] = [
  { name: 'create', description: 'create a new artifact' },
  { name: 'get', description: 'fetch an artifact by slug' },
  { name: 'list', description: 'list artifacts of this type' },
  { name: 'update', description: 'update an existing artifact' },
  { name: 'link', description: 'add or remove typed links' },
];

/**
 * Wire a type-subcommand group onto the root program. For M1-S5 every leaf
 * is a stub. M1-S6 replaces the `idea` group (and only that one) with real
 * handlers — this function signature is the integration point.
 */
export function registerTypeCommands(
  program: Command,
  type: ArtifactType,
  globals: ChassisGlobals,
): Command {
  const group = program
    .command(type)
    .description(`manage ${type} artifacts`)
    .allowUnknownOption(false);

  for (const leaf of LEAF_SUBCOMMANDS) {
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
            // Resolve the context first. This proves the project is
            // initialized; an uninitialized project throws
            // AdapterError{E_NOT_INITIALIZED} (→ exit 3) before the stub
            // message ever runs.
            //
            // TODO(M1-S6 / M2): use `ctx.adapter` to implement the real
            // handler. Currently we just prove the wiring and throw a
            // stub UsageError.
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
