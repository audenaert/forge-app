// `etak critique get <slug>` — read a critique by slug.
//
// Human-mode rendering differs from idea/objective in one way: the body
// has no section headings. Critique bodies are opaque (design.md §8), so
// the parser emits a single headless section and we print its raw
// content verbatim — no `##` lines.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef } from '../../schemas/index.js';
import type { Document } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';

export interface CritiqueGetResult {
  document: Document;
}

export function registerGetCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('get')
    .description('fetch a critique artifact by slug')
    .argument('<slug>', 'slug of the critique to fetch')
    .action(async (slug: string) => {
      const code = await runCommand<CritiqueGetResult>({
        command: 'critique get',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runCritiqueGet(slug, factory, globals),
        humanSummary: (data) => formatGetHuman(data.document),
      });
      globals.exit(code);
    });
}

export async function runCritiqueGet(
  slug: string,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<CritiqueGetResult>> {
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  const ref: ArtifactRef = { type: 'critique', slug };
  const document = await ctx.adapter.read(ref);
  return envelopeSuccess('critique get', { document }, document.warnings);
}

function formatGetHuman(doc: Document): string {
  const fm = doc.frontmatter;
  const lines: string[] = [];
  lines.push(`${fm.name} (critique/${doc.ref.slug})`);
  const target = fm['target'];
  if (target) lines.push(`  target: ${String(target)}`);
  const date = fm['date'];
  if (date) lines.push(`  date: ${String(date)}`);
  const personas = fm['personas_used'];
  if (Array.isArray(personas) && personas.length > 0) {
    lines.push(`  personas_used: ${(personas as string[]).join(', ')}`);
  }
  const frameworks = fm['frameworks_used'];
  if (Array.isArray(frameworks) && frameworks.length > 0) {
    lines.push(`  frameworks_used: ${(frameworks as string[]).join(', ')}`);
  }
  const created = fm['artifacts_created'];
  if (Array.isArray(created) && created.length > 0) {
    lines.push(`  artifacts_created: ${(created as string[]).join(', ')}`);
  }
  // Opaque body: no section headings. Print the raw content of the single
  // section (if any) after a blank line separator.
  for (const section of doc.body.sections) {
    if (section.content.trim().length > 0) {
      lines.push('');
      lines.push(section.content.trim());
    }
  }
  return lines.join('\n');
}
