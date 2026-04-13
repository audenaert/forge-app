// `etak idea get <slug>` — read an idea by slug.
//
// Exit codes:
//   0 — success
//   2 — NotFoundError when the slug does not resolve (first command in
//       the CLI surface where exit 2 is reachable)
//
// Human mode: pretty prints frontmatter block then each section in
// authored order. JSON mode: the full Document in the envelope data,
// including any drift warnings from the adapter read.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef } from '../../schemas/index.js';
import type { Document } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';

export interface IdeaGetResult {
  document: Document;
}

export function registerGetCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('get')
    .description('fetch an idea artifact by slug')
    .argument('<slug>', 'slug of the idea to fetch')
    .action(async (slug: string) => {
      const code = await runCommand<IdeaGetResult>({
        command: 'idea get',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runIdeaGet(slug, factory, globals),
        humanSummary: (data) => formatGetHuman(data.document),
      });
      globals.exit(code);
    });
}

export async function runIdeaGet(
  slug: string,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<IdeaGetResult>> {
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  const ref: ArtifactRef = { type: 'idea', slug };
  const document = await ctx.adapter.read(ref);
  return envelopeSuccess('idea get', { document }, document.warnings);
}

/**
 * Human-mode summary for `get`. Multi-line: the idea name and slug on the
 * first line, then a short block of frontmatter fields, then each body
 * section as a `## heading` + indented content. The warnings block (yellow
 * drift lines) is handled by the envelope renderer; we only own the
 * success payload here.
 */
function formatGetHuman(doc: Document): string {
  const fm = doc.frontmatter;
  const lines: string[] = [];
  lines.push(`${fm.name} (idea/${doc.ref.slug})`);
  if (fm['status']) lines.push(`  status: ${String(fm['status'])}`);
  const addresses = fm['addresses'];
  if (Array.isArray(addresses) && addresses.length > 0) {
    lines.push(`  addresses: ${(addresses as string[]).join(', ')}`);
  }
  const deliveredBy = fm['delivered_by'];
  if (Array.isArray(deliveredBy) && deliveredBy.length > 0) {
    lines.push(`  delivered_by: ${(deliveredBy as string[]).join(', ')}`);
  }
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
