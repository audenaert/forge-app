// `etak idea link <slug>` — add or remove typed links on an idea.
//
// Flags (typed convenience, matching §2 "sugar over the same underlying
// set operation"):
//   --addresses <opp-slug>          add to addresses (repeatable)
//   --remove-addresses <opp-slug>   remove from addresses (repeatable)
//   --delivered-by <artifact-slug>  add to delivered_by (repeatable)
//   --remove-delivered-by <artifact-slug>
//
// Dangling-reference warnings surface via the adapter; `link` on a missing
// target is non-fatal per §2. Unlinking a link that wasn't there is a
// no-op with a `link_not_present` info warning.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ValidationError } from '../../adapters/errors.js';

import type { CommandContextFactory } from './shared.js';

export interface IdeaLinkOptions {
  addresses?: string[];
  removeAddresses?: string[];
  deliveredBy?: string[];
  removeDeliveredBy?: string[];
}

export interface IdeaLinkResult {
  ref: ArtifactRef;
  added: Array<{ field: string; to: string }>;
  removed: Array<{ field: string; to: string }>;
}

function collectStrings(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

export function registerLinkCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('link')
    .description('add or remove typed links on an idea')
    .argument('<slug>', 'slug of the idea to operate on')
    .option(
      '--addresses <slug>',
      'add to addresses (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-addresses <slug>',
      'remove from addresses (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--delivered-by <slug>',
      'add to delivered_by (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-delivered-by <slug>',
      'remove from delivered_by (repeatable)',
      collectStrings,
      [] as string[],
    )
    .action(async (slug: string, cmdOpts: IdeaLinkOptions) => {
      const code = await runCommand<IdeaLinkResult>({
        command: 'idea link',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runIdeaLink(slug, cmdOpts, factory, globals),
        humanSummary: (data) => {
          const plus = data.added.map((a) => `+${a.field}=${a.to}`);
          const minus = data.removed.map((r) => `-${r.field}=${r.to}`);
          if (plus.length === 0 && minus.length === 0) {
            return `no link changes for idea \`${data.ref.slug}\``;
          }
          return `updated idea \`${data.ref.slug}\` links (${[...plus, ...minus].join(', ')})`;
        },
      });
      globals.exit(code);
    });
}

export async function runIdeaLink(
  slug: string,
  opts: IdeaLinkOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<IdeaLinkResult>> {
  const ref: ArtifactRef = { type: 'idea', slug };

  const addAddresses = opts.addresses ?? [];
  const removeAddresses = opts.removeAddresses ?? [];
  const addDelivered = opts.deliveredBy ?? [];
  const removeDelivered = opts.removeDeliveredBy ?? [];

  if (
    addAddresses.length === 0 &&
    removeAddresses.length === 0 &&
    addDelivered.length === 0 &&
    removeDelivered.length === 0
  ) {
    throw new ValidationError(
      'no link operations specified — pass at least one --addresses / --delivered-by / --remove-* flag',
    );
  }

  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  // Trigger NotFoundError up front for a missing idea slug so failures
  // exit 2 before we issue partial link edits.
  await ctx.adapter.read(ref);

  const warnings: DriftWarning[] = [];
  const added: Array<{ field: string; to: string }> = [];
  const removed: Array<{ field: string; to: string }> = [];

  for (const oppSlug of addAddresses) {
    const to: ArtifactRef = { type: 'opportunity', slug: oppSlug };
    const result = await ctx.adapter.link(ref, 'addresses', to);
    warnings.push(...result.warnings);
    added.push({ field: 'addresses', to: oppSlug });
  }
  for (const oppSlug of removeAddresses) {
    const to: ArtifactRef = { type: 'opportunity', slug: oppSlug };
    const result = await ctx.adapter.unlink(ref, 'addresses', to);
    warnings.push(...result.warnings);
    removed.push({ field: 'addresses', to: oppSlug });
  }
  // delivered_by is polymorphic (idea → story/task/spec/...). We record
  // the type as `idea` since the adapter does not currently distinguish
  // delivery target types — the schema passthrough accepts either a
  // string or an array. Target resolution uses the same dangling warning
  // path as addresses.
  for (const targetSlug of addDelivered) {
    const to: ArtifactRef = { type: 'idea', slug: targetSlug };
    const result = await ctx.adapter.link(ref, 'delivered_by', to);
    warnings.push(...result.warnings);
    added.push({ field: 'delivered_by', to: targetSlug });
  }
  for (const targetSlug of removeDelivered) {
    const to: ArtifactRef = { type: 'idea', slug: targetSlug };
    const result = await ctx.adapter.unlink(ref, 'delivered_by', to);
    warnings.push(...result.warnings);
    removed.push({ field: 'delivered_by', to: targetSlug });
  }

  return envelopeSuccess(
    'idea link',
    { ref, added, removed },
    warnings,
  );
}
