// `etak critique list` — list critiques, with optional filters.
//
// Flags:
//   --target <slug>       filter to critiques whose target matches.
//   --format <fmt>        human-mode formatter: `table` (default) or `slugs`.
//
// Explicitly NOT supported: `--status`. Critique has no status field; a
// `--status` filter would always match zero (or always match all,
// depending on interpretation), both of which are confusing. We omit the
// option declaration entirely so commander rejects `--status` with an
// unknown-option error → exit 4.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef } from '../../schemas/index.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ValidationError } from '../../adapters/errors.js';

export interface CritiqueListOptions {
  target?: string;
  format?: string;
}

export interface CritiqueListEntry {
  ref: ArtifactRef;
  name: string;
  target: string;
  date: string;
}

export interface CritiqueListResult {
  items: CritiqueListEntry[];
}

export function registerListCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('list')
    .description('list critique artifacts')
    .option('--target <slug>', 'filter to critiques whose target matches')
    .option('--format <fmt>', 'human output format: table|slugs', 'table')
    .action(async (cmdOpts: CritiqueListOptions) => {
      const code = await runCommand<CritiqueListResult>({
        command: 'critique list',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runCritiqueList(cmdOpts, factory, globals),
        humanSummary: (data) =>
          formatListHuman(data.items, cmdOpts.format ?? 'table'),
      });
      globals.exit(code);
    });
}

export async function runCritiqueList(
  opts: CritiqueListOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<CritiqueListResult>> {
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

  // No typed status filter — critique has no status. The adapter's
  // ListFilter is unused here.
  const refs = await ctx.adapter.list('critique');

  const items: CritiqueListEntry[] = [];
  for (const ref of refs) {
    try {
      const doc = await ctx.adapter.read(ref);
      const target = String(doc.frontmatter['target'] ?? '');
      if (opts.target && target !== opts.target) continue;
      items.push({
        ref,
        name: doc.frontmatter.name,
        target,
        date: String(doc.frontmatter['date'] ?? ''),
      });
    } catch {
      // Skip unreadable entries rather than failing the whole list.
      continue;
    }
  }

  return envelopeSuccess('critique list', { items });
}

function formatListHuman(items: CritiqueListEntry[], format: string): string {
  if (items.length === 0) return 'no critiques found';
  if (format === 'slugs') {
    return items.map((i) => i.ref.slug).join('\n');
  }
  const slugW = Math.max(...items.map((i) => i.ref.slug.length), 4);
  const targetW = Math.max(...items.map((i) => i.target.length), 6);
  const dateW = Math.max(...items.map((i) => i.date.length), 4);
  const lines: string[] = [];
  lines.push(
    `${'SLUG'.padEnd(slugW)}  ${'TARGET'.padEnd(targetW)}  ${'DATE'.padEnd(dateW)}  NAME`,
  );
  for (const i of items) {
    lines.push(
      `${i.ref.slug.padEnd(slugW)}  ${i.target.padEnd(targetW)}  ${i.date.padEnd(dateW)}  ${i.name}`,
    );
  }
  return lines.join('\n');
}
