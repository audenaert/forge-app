// `etak critique update <slug>` — update an existing critique artifact.
//
// Surface diverges from idea/objective in two important ways (design §8):
//
//   1. There is no `--status` — critique has no status field.
//   2. There is no `--section` — critique bodies are opaque. The entire
//      body is replaced via `--body`, `--body-file`, or `--body-stdin`.
//
// Both flags are simply undeclared here. Commander then rejects the
// unknown option with an exit-4 usage error before the handler runs —
// consistent with how `--status` would fare on any other critique
// command. Declaring `--section` with a throwing parser was considered
// (to emit a prettier "critique has no sections" message) but the
// thrown error escapes commander's invalid-argument wrapping and surfaces
// as E_INTERNAL — a chassis bug not worth litigating from this story.
// The canary result: "reject via no declaration" is the clean path;
// explicit rejection needs a different mechanism than a throw from the
// option parser callback (see PR notes for the canary finding).
//
// Frontmatter updates: --name, --target (scalar replace), and the three
// array-link add/remove pairs. The add/remove pattern mirrors idea/update
// so users get a consistent shape across types.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import type {
  ArtifactFrontmatter,
  BodyUpdate,
  UpdateChanges,
} from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ValidationError } from '../../adapters/errors.js';

import { collectStrings, readFileUtf8, readStdin } from '../shared.js';

export interface CritiqueUpdateOptions {
  name?: string;
  target?: string;
  addPersonaUsed?: string[];
  removePersonaUsed?: string[];
  addFrameworkUsed?: string[];
  removeFrameworkUsed?: string[];
  addArtifactCreated?: string[];
  removeArtifactCreated?: string[];
  body?: string;
  bodyFile?: string;
  bodyStdin?: boolean;
}

export interface CritiqueUpdateResult {
  ref: ArtifactRef;
  applied: string[];
}

export function registerUpdateCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  const cmd = group
    .command('update')
    .description('update an existing critique artifact')
    .argument('<slug>', 'slug of the critique to update')
    .option('--name <string>', 'rename the human-readable name')
    .option('--target <slug>', 'replace the critique target (scalar link)')
    .option(
      '--add-persona-used <string>',
      'append to personas_used (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-persona-used <string>',
      'remove from personas_used (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--add-framework-used <string>',
      'append to frameworks_used (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-framework-used <string>',
      'remove from frameworks_used (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--add-artifact-created <slug>',
      'append to artifacts_created (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-artifact-created <slug>',
      'remove from artifacts_created (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option('--body <content>', 'replace the whole body with the given string')
    .option('--body-file <path>', 'replace the whole body from a file')
    .option('--body-stdin', 'replace the whole body from stdin')
    // --section and --status are intentionally undeclared; commander
    // rejects them as unknown options (exit 4) before the handler runs.
    .action(async (slug: string, cmdOpts: CritiqueUpdateOptions) => {
      const code = await runCommand<CritiqueUpdateResult>({
        command: 'critique update',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runCritiqueUpdate(slug, cmdOpts, factory, globals),
        humanSummary: (data) =>
          data.applied.length === 0
            ? `no changes applied to critique \`${data.ref.slug}\``
            : `updated critique \`${data.ref.slug}\` (${data.applied.join(', ')})`,
      });
      globals.exit(code);
    });
  return cmd;
}

export async function runCritiqueUpdate(
  slug: string,
  opts: CritiqueUpdateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<CritiqueUpdateResult>> {
  // Only one --body* form at a time.
  const wholeBodyFlags = [
    opts.body !== undefined,
    opts.bodyFile !== undefined,
    opts.bodyStdin === true,
  ].filter(Boolean).length;
  if (wholeBodyFlags > 1) {
    throw new ValidationError(
      'only one of --body, --body-file, --body-stdin may be passed',
    );
  }

  const ref: ArtifactRef = { type: 'critique', slug };
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  // Read current so we can merge link-array changes. A missing slug
  // throws NotFoundError → exit 2 via the chassis.
  const existing = await ctx.adapter.read(ref);

  // --- frontmatter patch --------------------------------------------------
  const fmPatch: Partial<ArtifactFrontmatter> = {};
  const applied: string[] = [];

  if (opts.name !== undefined) {
    if (opts.name.trim().length === 0) {
      throw new ValidationError('--name must not be blank');
    }
    fmPatch.name = opts.name.trim();
    applied.push('name');
  }
  if (opts.target !== undefined) {
    if (opts.target.trim().length === 0) {
      throw new ValidationError('--target must not be blank');
    }
    fmPatch['target'] = opts.target.trim();
    applied.push('target');
  }

  if (
    (opts.addPersonaUsed?.length ?? 0) > 0 ||
    (opts.removePersonaUsed?.length ?? 0) > 0
  ) {
    fmPatch['personas_used'] = mergeArray(
      existing.frontmatter['personas_used'],
      opts.addPersonaUsed ?? [],
      opts.removePersonaUsed ?? [],
    );
    applied.push('personas_used');
  }
  if (
    (opts.addFrameworkUsed?.length ?? 0) > 0 ||
    (opts.removeFrameworkUsed?.length ?? 0) > 0
  ) {
    fmPatch['frameworks_used'] = mergeArray(
      existing.frontmatter['frameworks_used'],
      opts.addFrameworkUsed ?? [],
      opts.removeFrameworkUsed ?? [],
    );
    applied.push('frameworks_used');
  }
  if (
    (opts.addArtifactCreated?.length ?? 0) > 0 ||
    (opts.removeArtifactCreated?.length ?? 0) > 0
  ) {
    fmPatch['artifacts_created'] = mergeArray(
      existing.frontmatter['artifacts_created'],
      opts.addArtifactCreated ?? [],
      opts.removeArtifactCreated ?? [],
    );
    applied.push('artifacts_created');
  }

  // --- body update --------------------------------------------------------
  const bodyOps: BodyUpdate[] = [];
  const hasWholeBody = wholeBodyFlags > 0;
  if (hasWholeBody) {
    let content: string;
    if (opts.body !== undefined) {
      content = opts.body;
    } else if (opts.bodyFile !== undefined) {
      try {
        content = await readFileUtf8(opts.bodyFile);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new ValidationError(
          `failed to read --body-file ${opts.bodyFile}: ${message}`,
          { details: { path: opts.bodyFile } },
        );
      }
    } else {
      content = await readStdin();
    }
    bodyOps.push({ kind: 'body-replace', content });
    applied.push('body');
  }

  if (applied.length === 0) {
    throw new ValidationError(
      'no updates specified — pass at least one --name / --target / --add-* / --remove-* / --body* flag',
    );
  }

  const changes: UpdateChanges = {};
  if (Object.keys(fmPatch).length > 0) {
    changes.frontmatter = fmPatch;
  }
  if (bodyOps.length > 0) {
    changes.body = bodyOps;
  }
  const result = await ctx.adapter.update(ref, changes);
  const warnings: DriftWarning[] = [...result.warnings];

  return envelopeSuccess('critique update', { ref, applied }, warnings);
}

function mergeArray(current: unknown, adds: string[], removes: string[]): string[] {
  const base = toStringArray(current);
  const next = [...base];
  for (const v of adds) if (!next.includes(v)) next.push(v);
  return next.filter((v) => !removes.includes(v));
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).map(String) : [];
}
