// `etak objective list` — list objectives, with optional filters.
//
// Flags:
//   --status <value>      filter by status. Repeatable; any match wins.
//   --format <fmt>        human-mode formatter: `table` (default) or `slugs`.
//
// Intentional divergence from idea: objective has no typed link fields, so
// no `--addresses` filter is meaningful here. Filtering by linked children
// (opportunities/ideas/etc. that support the objective) is a future concern
// that lives on the other types, not here.
//
// JSON mode returns the full `ArtifactRef[]` plus compact summaries
// (name, status). Human `table` mode prints a three-column layout;
// `slugs` prints one slug per line for piping.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext } from '../../context.js';
import type { ArtifactRef } from '../../schemas/index.js';
import type { ListFilter } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ValidationError } from '../../adapters/errors.js';

import type { CommandContextFactory } from './shared.js';

export interface ObjectiveListOptions {
  status?: string[];
  format?: string;
}

export interface ObjectiveListEntry {
  ref: ArtifactRef;
  name: string;
  status: string;
}

export interface ObjectiveListResult {
  items: ObjectiveListEntry[];
}

function collectStrings(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

export function registerListCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('list')
    .description('list objective artifacts')
    .option(
      '--status <value>',
      'filter by status (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option('--format <fmt>', 'human output format: table|slugs', 'table')
    .action(async (cmdOpts: ObjectiveListOptions) => {
      const code = await runCommand<ObjectiveListResult>({
        command: 'objective list',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runObjectiveList(cmdOpts, factory, globals),
        humanSummary: (data) =>
          formatListHuman(data.items, cmdOpts.format ?? 'table'),
      });
      globals.exit(code);
    });
}

export async function runObjectiveList(
  opts: ObjectiveListOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<ObjectiveListResult>> {
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

  // A single-status filter goes through the adapter's typed ListFilter.
  // Multi-status filters are applied in-memory after a base list — the
  // adapter doesn't model an `in (...)` filter in v1.
  const filter: ListFilter = {};
  const statuses = opts.status ?? [];
  if (statuses.length === 1) {
    filter.status = statuses[0]!;
  }

  const refs = await ctx.adapter.list('objective', filter);

  // Hydrate each ref into a summary entry. Reading every objective on
  // every list is acceptable at M1 scale. Drift from any individual read
  // is silently dropped here — `list` is a navigation command; per-item
  // drift surfaces on `get`.
  const items: ObjectiveListEntry[] = [];
  for (const ref of refs) {
    try {
      const doc = await ctx.adapter.read(ref);
      if (statuses.length > 1) {
        if (!statuses.includes(String(doc.frontmatter['status']))) continue;
      }
      items.push({
        ref,
        name: doc.frontmatter.name,
        status: String(doc.frontmatter['status'] ?? ''),
      });
    } catch {
      // Skip unreadable entries rather than failing the entire list.
      continue;
    }
  }

  return envelopeSuccess('objective list', { items });
}

function formatListHuman(items: ObjectiveListEntry[], format: string): string {
  if (items.length === 0) return 'no objectives found';
  if (format === 'slugs') {
    return items.map((i) => i.ref.slug).join('\n');
  }
  // table
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
