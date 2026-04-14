// `etak opportunity list` — list opportunities, with optional filters.
//
// Flags:
//   --status <value>      filter by status. Repeatable; any match wins.
//   --supports <slug>     filter to opportunities supporting this objective.
//   --format <fmt>        human-mode formatter: `table` (default) or `slugs`.
//
// JSON mode returns the full `ArtifactRef[]` plus compact summaries
// (name, status). Human `table` mode prints a three-column layout;
// `slugs` prints one slug per line for piping.
//
// No `--hmw` filter: `hmw` is free text and not a useful list filter.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef } from '../../schemas/index.js';
import type { ListFilter } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ValidationError } from '../../adapters/errors.js';

import { collectStrings } from '../shared.js';

export interface OpportunityListOptions {
  status?: string[];
  supports?: string;
  format?: string;
}

export interface OpportunityListEntry {
  ref: ArtifactRef;
  name: string;
  status: string;
}

export interface OpportunityListResult {
  items: OpportunityListEntry[];
}

export function registerListCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('list')
    .description('list opportunity artifacts')
    .option(
      '--status <value>',
      'filter by status (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option('--supports <slug>', 'filter to opportunities supporting this objective')
    .option('--format <fmt>', 'human output format: table|slugs', 'table')
    .action(async (cmdOpts: OpportunityListOptions) => {
      const code = await runCommand<OpportunityListResult>({
        command: 'opportunity list',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runOpportunityList(cmdOpts, factory, globals),
        humanSummary: (data) =>
          formatListHuman(data.items, cmdOpts.format ?? 'table'),
      });
      globals.exit(code);
    });
}

export async function runOpportunityList(
  opts: OpportunityListOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<OpportunityListResult>> {
  if (opts.format && opts.format !== 'table' && opts.format !== 'slugs') {
    throw new ValidationError(
      `--format must be "table" or "slugs"; got "${opts.format}"`,
    );
  }
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  const filter: ListFilter = {};
  const statuses = opts.status ?? [];
  if (statuses.length === 1) {
    filter.status = statuses[0]!;
  }

  const refs = await ctx.adapter.list('opportunity', filter);

  const items: OpportunityListEntry[] = [];
  for (const ref of refs) {
    try {
      const doc = await ctx.adapter.read(ref);
      const supports = doc.frontmatter['supports'];
      if (
        opts.supports &&
        !(Array.isArray(supports) && (supports as string[]).includes(opts.supports))
      ) {
        continue;
      }
      if (statuses.length > 1) {
        if (!statuses.includes(String(doc.frontmatter['status']))) continue;
      }
      items.push({
        ref,
        name: doc.frontmatter.name,
        status: String(doc.frontmatter['status'] ?? ''),
      });
    } catch {
      continue;
    }
  }

  return envelopeSuccess('opportunity list', { items });
}

function formatListHuman(items: OpportunityListEntry[], format: string): string {
  if (items.length === 0) return 'no opportunities found';
  if (format === 'slugs') {
    return items.map((i) => i.ref.slug).join('\n');
  }
  const slugW = Math.max(...items.map((i) => i.ref.slug.length), 4);
  const statusW = Math.max(...items.map((i) => i.status.length), 6);
  const lines: string[] = [];
  lines.push(
    `${'SLUG'.padEnd(slugW)}  ${'STATUS'.padEnd(statusW)}  NAME`,
  );
  for (const i of items) {
    lines.push(
      `${i.ref.slug.padEnd(slugW)}  ${i.status.padEnd(statusW)}  ${i.name}`,
    );
  }
  return lines.join('\n');
}
