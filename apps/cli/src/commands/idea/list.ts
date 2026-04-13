// `etak idea list` — list ideas, with optional filters.
//
// Flags:
//   --status <value>      filter by status. Repeatable; any match wins.
//   --addresses <slug>    filter to ideas linking to this opportunity slug.
//   --format <fmt>        human-mode formatter: `table` (default) or `slugs`.
//
// JSON mode returns the full `ArtifactRef[]` plus compact summaries
// (name, status) so downstream consumers don't have to re-issue `get` calls
// to render a list UI. Human `table` mode prints a three-column layout;
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

export interface IdeaListOptions {
  status?: string[];
  addresses?: string;
  format?: string;
}

export interface IdeaListEntry {
  ref: ArtifactRef;
  name: string;
  status: string;
}

export interface IdeaListResult {
  items: IdeaListEntry[];
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
    .description('list idea artifacts')
    .option(
      '--status <value>',
      'filter by status (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option('--addresses <slug>', 'filter to ideas linking to this opportunity')
    .option('--format <fmt>', 'human output format: table|slugs', 'table')
    .action(async (cmdOpts: IdeaListOptions) => {
      const code = await runCommand<IdeaListResult>({
        command: 'idea list',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runIdeaList(cmdOpts, factory, globals),
        humanSummary: (data) =>
          formatListHuman(data.items, cmdOpts.format ?? 'table'),
      });
      globals.exit(code);
    });
}

export async function runIdeaList(
  opts: IdeaListOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<IdeaListResult>> {
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

  const refs = await ctx.adapter.list('idea', filter);

  // Hydrate each ref into a summary entry. Reading every idea on every
  // list is acceptable at M1 scale (<500 artifacts, §NFR "comfort target")
  // and is the only way to build the name/status columns the human table
  // needs. Drift from any individual read is silently dropped here —
  // `list` is a navigation command, not an integrity check; per-item drift
  // surfaces on `get`.
  const items: IdeaListEntry[] = [];
  for (const ref of refs) {
    try {
      const doc = await ctx.adapter.read(ref);
      const addresses = doc.frontmatter['addresses'];
      if (
        opts.addresses &&
        !(Array.isArray(addresses) && (addresses as string[]).includes(opts.addresses))
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
      // Skip unreadable entries rather than failing the entire list.
      continue;
    }
  }

  return envelopeSuccess('idea list', { items });
}

function formatListHuman(items: IdeaListEntry[], format: string): string {
  if (items.length === 0) return 'no ideas found';
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
