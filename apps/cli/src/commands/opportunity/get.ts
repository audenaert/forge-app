// `etak opportunity get <slug>` — read an opportunity by slug.
//
// Exit codes:
//   0 — success
//   2 — NotFoundError when the slug does not resolve
//
// Human mode: pretty prints frontmatter (including the `hmw` passthrough
// field) then each body section in authored order. JSON mode: the full
// Document in the envelope data, including any drift warnings from the
// adapter read.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef } from '../../schemas/index.js';
import type { Document } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';

export interface OpportunityGetResult {
  document: Document;
}

export function registerGetCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('get')
    .description('fetch an opportunity artifact by slug')
    .argument('<slug>', 'slug of the opportunity to fetch')
    .action(async (slug: string) => {
      const code = await runCommand<OpportunityGetResult>({
        command: 'opportunity get',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runOpportunityGet(slug, factory, globals),
        humanSummary: (data) => formatGetHuman(data.document),
      });
      globals.exit(code);
    });
}

export async function runOpportunityGet(
  slug: string,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<OpportunityGetResult>> {
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  const ref: ArtifactRef = { type: 'opportunity', slug };
  const document = await ctx.adapter.read(ref);
  return envelopeSuccess('opportunity get', { document }, document.warnings);
}

function formatGetHuman(doc: Document): string {
  const fm = doc.frontmatter;
  const lines: string[] = [];
  lines.push(`${fm.name} (opportunity/${doc.ref.slug})`);
  if (fm['status']) lines.push(`  status: ${String(fm['status'])}`);
  const supports = fm['supports'];
  if (Array.isArray(supports) && supports.length > 0) {
    lines.push(`  supports: ${(supports as string[]).join(', ')}`);
  }
  // Render the `hmw` known-extras passthrough as a first-class field.
  if (typeof fm['hmw'] === 'string' && fm['hmw'].length > 0) {
    lines.push(`  hmw: ${fm['hmw']}`);
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
