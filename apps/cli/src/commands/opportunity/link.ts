// `etak opportunity link <slug>` — add or remove the single typed link
// field on an opportunity: `supports`, which points at objective slugs.
//
// Flags:
//   --supports <obj-slug>         add to supports (repeatable)
//   --remove-supports <obj-slug>  remove from supports (repeatable)
//
// Dangling-reference warnings surface via the adapter; linking to a missing
// target is non-fatal per §2. Unlinking a link that wasn't there is a no-op
// with a `link_not_present` info warning.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ValidationError } from '../../adapters/errors.js';

import { collectStrings } from '../shared.js';

export interface OpportunityLinkOptions {
  supports?: string[];
  removeSupports?: string[];
}

export interface OpportunityLinkResult {
  ref: ArtifactRef;
  added: Array<{ field: string; to: string }>;
  removed: Array<{ field: string; to: string }>;
}

export function registerLinkCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('link')
    .description('add or remove typed links on an opportunity')
    .argument('<slug>', 'slug of the opportunity to operate on')
    .option(
      '--supports <slug>',
      'add to supports (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-supports <slug>',
      'remove from supports (repeatable)',
      collectStrings,
      [] as string[],
    )
    .action(async (slug: string, cmdOpts: OpportunityLinkOptions) => {
      const code = await runCommand<OpportunityLinkResult>({
        command: 'opportunity link',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runOpportunityLink(slug, cmdOpts, factory, globals),
        humanSummary: (data) => {
          const plus = data.added.map((a) => `+${a.field}=${a.to}`);
          const minus = data.removed.map((r) => `-${r.field}=${r.to}`);
          if (plus.length === 0 && minus.length === 0) {
            return `no link changes for opportunity \`${data.ref.slug}\``;
          }
          return `updated opportunity \`${data.ref.slug}\` links (${[...plus, ...minus].join(', ')})`;
        },
      });
      globals.exit(code);
    });
}

export async function runOpportunityLink(
  slug: string,
  opts: OpportunityLinkOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<OpportunityLinkResult>> {
  const ref: ArtifactRef = { type: 'opportunity', slug };

  const addSupports = opts.supports ?? [];
  const removeSupports = opts.removeSupports ?? [];

  if (addSupports.length === 0 && removeSupports.length === 0) {
    throw new ValidationError(
      'no link operations specified — pass at least one --supports / --remove-supports flag',
    );
  }

  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  // Trigger NotFoundError up front for a missing opportunity slug.
  await ctx.adapter.read(ref);

  const warnings: DriftWarning[] = [];
  const added: Array<{ field: string; to: string }> = [];
  const removed: Array<{ field: string; to: string }> = [];

  for (const objSlug of addSupports) {
    const to: ArtifactRef = { type: 'objective', slug: objSlug };
    const result = await ctx.adapter.link(ref, 'supports', to);
    warnings.push(...result.warnings);
    added.push({ field: 'supports', to: objSlug });
  }
  for (const objSlug of removeSupports) {
    const to: ArtifactRef = { type: 'objective', slug: objSlug };
    const result = await ctx.adapter.unlink(ref, 'supports', to);
    warnings.push(...result.warnings);
    removed.push({ field: 'supports', to: objSlug });
  }

  return envelopeSuccess(
    'opportunity link',
    { ref, added, removed },
    warnings,
  );
}
