// `etak critique create` — create a new critique artifact.
//
// Flag surface (schemas/critique.ts, design.md §8):
//   --name <string>                      required. Human-readable name.
//   --slug <string>                      optional override; otherwise derived.
//   --target <slug>                      required. Scalar link to the artifact
//                                        under critique. A critique with no
//                                        target is meaningless per the schema.
//   --personas-used <string>             repeatable. Personas consulted.
//   --frameworks-used <string>           repeatable. Frameworks applied.
//   --artifacts-created <slug>           repeatable. Slugs of artifacts the
//                                        critique spun off (typically
//                                        assumptions).
//   --from-file <path>                   body content from a file.
//   --body-stdin                         body content from stdin.
//
// Explicitly NOT supported (canary for body-as-opaque / statusless):
//   --status, --section — undeclared, so commander rejects with exit 4.
//
// The body is opaque: instead of a sectioned scaffold we write a single
// placeholder line ("_TODO: write critique content_") via the local
// `scaffoldOpaqueBody` helper. If the user supplies --from-file or
// --body-stdin, the placeholder is overwritten via a body-replace on the
// follow-up update, matching the idea/objective create flow.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import type { Document, ArtifactFrontmatter } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { CritiqueFrontmatterSchema } from '../../schemas/index.js';
import { ValidationError } from '../../adapters/errors.js';

import { collectStrings, deriveSlug, readFileUtf8, readStdin } from '../shared.js';
import { scaffoldOpaqueBody, todayIsoDate } from './shared.js';

export interface CritiqueCreateOptions {
  name?: string;
  slug?: string;
  target?: string;
  personasUsed?: string[];
  frameworksUsed?: string[];
  artifactsCreated?: string[];
  fromFile?: string;
  bodyStdin?: boolean;
}

export interface CritiqueCreateResult {
  ref: ArtifactRef;
  created: {
    name: string;
    target: string;
    personas_used: string[];
    frameworks_used: string[];
    artifacts_created: string[];
    date: string;
  };
  path: string;
}

export function registerCreateCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('create')
    .description('create a new critique artifact')
    .requiredOption('--name <string>', 'human-readable name for the critique')
    .requiredOption('--target <slug>', 'slug of the artifact being critiqued')
    .option('--slug <string>', 'explicit slug override (kebab-case)')
    .option(
      '--personas-used <string>',
      'persona consulted during the critique (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--frameworks-used <string>',
      'framework applied during the critique (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--artifacts-created <slug>',
      'slug of an artifact produced by the critique (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option('--from-file <path>', 'read body content from a file')
    .option('--body-stdin', 'read body content from stdin')
    .action(async (cmdOpts: CritiqueCreateOptions) => {
      const code = await runCommand<CritiqueCreateResult>({
        command: 'critique create',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runCritiqueCreate(cmdOpts, factory, globals),
        humanSummary: (data) =>
          `created critique \`${data.ref.slug}\` (target: ${data.created.target})`,
      });
      globals.exit(code);
    });
}

export async function runCritiqueCreate(
  opts: CritiqueCreateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<CritiqueCreateResult>> {
  if (!opts.name || opts.name.trim().length === 0) {
    throw new ValidationError('--name is required and must not be blank');
  }
  if (!opts.target || opts.target.trim().length === 0) {
    throw new ValidationError('--target is required and must not be blank');
  }

  // Slug: explicit override > derived from name.
  const rawSlug = opts.slug ?? deriveSlug(opts.name);
  if (rawSlug === null) {
    throw new ValidationError(
      `could not derive a slug from --name "${opts.name}"; pass --slug explicitly`,
      { details: { name: opts.name } },
    );
  }

  // Body source resolution. --from-file and --body-stdin are mutually
  // exclusive.
  if (opts.fromFile && opts.bodyStdin) {
    throw new ValidationError(
      '--from-file and --body-stdin are mutually exclusive',
    );
  }
  let bodyContent: string | null = null;
  if (opts.fromFile) {
    try {
      bodyContent = await readFileUtf8(opts.fromFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ValidationError(
        `failed to read --from-file ${opts.fromFile}: ${message}`,
        { details: { path: opts.fromFile } },
      );
    }
  } else if (opts.bodyStdin) {
    bodyContent = await readStdin();
  }

  const frontmatterCandidate = {
    name: opts.name.trim(),
    type: 'critique' as const,
    target: opts.target.trim(),
    personas_used: opts.personasUsed ?? [],
    frameworks_used: opts.frameworksUsed ?? [],
    date: todayIsoDate(),
    artifacts_created: opts.artifactsCreated ?? [],
  };
  const parsed = CritiqueFrontmatterSchema.safeParse(frontmatterCandidate);
  if (!parsed.success) {
    throw parsed.error;
  }

  // Preserve field order (name, type, target, personas_used,
  // frameworks_used, date, artifacts_created) so the serializer's
  // canonical key ordering (which handles name/type/target first)
  // emits the remaining fields in discovery-workflow order.
  const frontmatter: ArtifactFrontmatter = {
    name: parsed.data.name,
    type: 'critique',
    target: parsed.data.target,
    personas_used: parsed.data.personas_used,
    frameworks_used: parsed.data.frameworks_used,
    date: parsed.data.date,
    artifacts_created: parsed.data.artifacts_created,
  };

  const ref: ArtifactRef = { type: 'critique', slug: rawSlug };
  const emptyBody = scaffoldOpaqueBody();

  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  const document: Document = {
    ref,
    frontmatter,
    body: emptyBody,
    warnings: [],
  };

  const writeResult = await ctx.adapter.write(document);

  const warnings: DriftWarning[] = [...writeResult.warnings];
  if (bodyContent !== null) {
    const replaced = await ctx.adapter.update(ref, {
      body: { kind: 'body-replace', content: bodyContent },
    });
    warnings.push(...replaced.warnings);
  }

  // Post-write dangling-link check — matches idea/create semantics. The
  // scalar `target` field and the three array link fields all resolve
  // against the adapter; any unresolved ref emits a non-fatal warning.
  // target is polymorphic (critique can target any artifact), so we probe
  // against every known type until one matches. This mirrors the
  // "probe under a best-guess type" fallback idea/create uses for
  // delivered_by.
  if (!(await targetExistsAnyType(ctx, frontmatter['target'] as string))) {
    warnings.push({
      kind: 'dangling_ref',
      severity: 'warning',
      message: `link target ${frontmatter['target'] as string} does not resolve to any known artifact`,
      location: { artifactRef: ref, field: 'target' },
      details: { to: { slug: frontmatter['target'] }, field: 'target' },
    });
  }
  for (const artifactSlug of frontmatter['artifacts_created'] as string[]) {
    if (!(await targetExistsAnyType(ctx, artifactSlug))) {
      warnings.push({
        kind: 'dangling_ref',
        severity: 'warning',
        message: `artifacts_created entry ${artifactSlug} does not resolve to any known artifact`,
        location: { artifactRef: ref, field: 'artifacts_created' },
        details: { to: { slug: artifactSlug }, field: 'artifacts_created' },
      });
    }
  }

  const filePath = `.etak/artifacts/critiques/${ref.slug}.md`;
  const result: CritiqueCreateResult = {
    ref,
    created: {
      name: frontmatter.name,
      target: String(frontmatter['target']),
      personas_used: [...(frontmatter['personas_used'] as string[])],
      frameworks_used: [...(frontmatter['frameworks_used'] as string[])],
      artifacts_created: [...(frontmatter['artifacts_created'] as string[])],
      date: String(frontmatter['date']),
    },
    path: filePath,
  };
  return envelopeSuccess('critique create', result, warnings);
}

/**
 * Probe every known artifact type for a given slug. Returns true on the
 * first hit. Used for dangling-ref detection on critique's polymorphic
 * `target` and `artifacts_created` fields, which are not bound to a
 * specific artifact type.
 */
async function targetExistsAnyType(
  ctx: CommandContext,
  slug: string,
): Promise<boolean> {
  const { ARTIFACT_TYPES } = await import('../../schemas/index.js');
  for (const type of ARTIFACT_TYPES) {
    try {
      await ctx.adapter.read({ type, slug });
      return true;
    } catch {
      // Not this type — continue probing.
    }
  }
  return false;
}
