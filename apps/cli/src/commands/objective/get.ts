// `etak objective get <slug>` — read an objective by slug.
//
// Exit codes:
//   0 — success
//   2 — NotFoundError when the slug does not resolve
//
// Human mode: pretty prints frontmatter block then each section in
// authored order. JSON mode: the full Document in the envelope data,
// including any drift warnings from the adapter read.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext } from '../../context.js';
import type { ArtifactRef } from '../../schemas/index.js';
import type { Document } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';

import type { CommandContextFactory } from './shared.js';

export interface ObjectiveGetResult {
  document: Document;
}

export function registerGetCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('get')
    .description('fetch an objective artifact by slug')
    .argument('<slug>', 'slug of the objective to fetch')
    .action(async (slug: string) => {
      const code = await runCommand<ObjectiveGetResult>({
        command: 'objective get',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runObjectiveGet(slug, factory, globals),
        humanSummary: (data) => formatGetHuman(data.document),
      });
      globals.exit(code);
    });
}

export async function runObjectiveGet(
  slug: string,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<ObjectiveGetResult>> {
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  const ref: ArtifactRef = { type: 'objective', slug };
  const document = await ctx.adapter.read(ref);
  return envelopeSuccess('objective get', { document }, document.warnings);
}

/**
 * Human-mode summary for `get`. Multi-line: the objective name and slug on
 * the first line, then a short block of frontmatter fields, then each body
 * section as a `## heading` + indented content. The warnings block (yellow
 * drift lines) is handled by the envelope renderer; we only own the
 * success payload here.
 */
function formatGetHuman(doc: Document): string {
  const fm = doc.frontmatter;
  const lines: string[] = [];
  lines.push(`${fm.name} (objective/${doc.ref.slug})`);
  if (fm['status']) lines.push(`  status: ${String(fm['status'])}`);
  for (const section of doc.body.sections) {
    lines.push('');
    if (section.heading) {
      lines.push(`## ${section.heading}`);
    }
    if (section.content.trim().length > 0) {
      lines.push(section.content.trim());
    }
  }
  return lines.join('\n');
}
