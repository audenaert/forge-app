// `etak opportunity create` — create a new opportunity artifact.
//
// Flag surface (design spec §3, §5; story ACs):
//   --name <string>         required. Human-readable name.
//   --slug <string>         optional override; otherwise derived from --name.
//   --status <enum>         one of OpportunityStatusSchema; defaults active.
//   --supports <slug>       repeatable. Links to objective slugs.
//   --hmw <string>          typed convenience for the `hmw` known-extras
//                           passthrough field. See `OPPORTUNITY_KNOWN_EXTRAS`
//                           in schemas/opportunity.ts — `hmw` is free text,
//                           not modeled in the Zod schema, but well-known
//                           enough to deserve a first-class flag (same
//                           treatment as idea's `--delivered-by`).
//   --from-file <path>      read the body from a file instead of scaffolding.
//   --body-stdin            read the body from stdin (body-only per §3.4).
//
// Dangling-link handling mirrors idea/create: after the initial write, each
// `--supports` slug is resolved against the adapter; a missing target
// surfaces a `dangling_ref` warning rather than failing the create.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import type { Document, ArtifactFrontmatter } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import {
  OpportunityFrontmatterSchema,
  OpportunityBodyTemplate,
} from '../../schemas/index.js';
import { ValidationError } from '../../adapters/errors.js';

import {
  collectStrings,
  deriveSlug,
  readFileUtf8,
  readStdin,
  scaffoldCanonicalBody,
} from '../shared.js';

export interface OpportunityCreateOptions {
  name?: string;
  slug?: string;
  status?: string;
  supports?: string[];
  hmw?: string;
  fromFile?: string;
  bodyStdin?: boolean;
}

export interface OpportunityCreateResult {
  ref: ArtifactRef;
  created: {
    name: string;
    status: string;
    supports: string[];
    hmw?: string;
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
    .description('create a new opportunity artifact')
    .requiredOption('--name <string>', 'human-readable name for the opportunity')
    .option('--slug <string>', 'explicit slug override (kebab-case)')
    .option('--status <value>', 'initial status', 'active')
    .option(
      '--supports <slug>',
      'objective slug the opportunity supports (repeatable)',
      collectStrings,
      [] as string[],
    )
    // `hmw` is a typed flag for a known-extras allowlist field; see file
    // header for the rationale.
    .option('--hmw <string>', 'How Might We statement (free text)')
    .option('--from-file <path>', 'read body content from a file')
    .option('--body-stdin', 'read body content from stdin')
    .action(async (cmdOpts: OpportunityCreateOptions) => {
      const code = await runCommand<OpportunityCreateResult>({
        command: 'opportunity create',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runOpportunityCreate(cmdOpts, factory, globals),
        humanSummary: (data) =>
          `created opportunity \`${data.ref.slug}\` (${data.created.status})`,
      });
      globals.exit(code);
    });
}

export async function runOpportunityCreate(
  opts: OpportunityCreateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<OpportunityCreateResult>> {
  if (!opts.name || opts.name.trim().length === 0) {
    throw new ValidationError('--name is required and must not be blank');
  }

  // Slug: explicit override > derived from name.
  const rawSlug = opts.slug ?? deriveSlug(opts.name);
  if (rawSlug === null) {
    throw new ValidationError(
      `could not derive a slug from --name "${opts.name}"; pass --slug explicitly`,
      { details: { name: opts.name } },
    );
  }

  // Body content resolution. --from-file and --body-stdin are
  // mutually exclusive body sources; combining them is a validation error.
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

  // Build and validate frontmatter against the Zod schema. `hmw`, if
  // provided, rides through the passthrough — the schema's `.passthrough()`
  // accepts it and the drift detector's known-extras allowlist won't flag
  // it as `unknown_frontmatter_field`.
  const frontmatterCandidate: Record<string, unknown> = {
    name: opts.name.trim(),
    type: 'opportunity' as const,
    status: opts.status ?? 'active',
    supports: opts.supports ?? [],
  };
  if (opts.hmw !== undefined) {
    frontmatterCandidate['hmw'] = opts.hmw;
  }
  const parsed = OpportunityFrontmatterSchema.safeParse(frontmatterCandidate);
  if (!parsed.success) {
    // Let the boundary classifier render ZodError → exit 1.
    throw parsed.error;
  }
  const frontmatter: ArtifactFrontmatter = {
    name: parsed.data.name,
    type: 'opportunity',
    status: parsed.data.status,
    supports: parsed.data.supports,
  };
  if (opts.hmw !== undefined) {
    frontmatter['hmw'] = opts.hmw;
  }

  const ref: ArtifactRef = { type: 'opportunity', slug: rawSlug };

  // Required sections scaffold with a TODO placeholder so `create → get`
  // surfaces drift on a structurally-incomplete artifact instead of
  // hiding it. See `scaffoldCanonicalBody` for the rules.
  const emptyBody = scaffoldCanonicalBody(OpportunityBodyTemplate);

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

  // If the user supplied --from-file / --body-stdin, replace the whole
  // body after the initial write. Matches idea/objective.
  const warnings: DriftWarning[] = [...writeResult.warnings];
  if (bodyContent !== null) {
    const replaced = await ctx.adapter.update(ref, {
      body: { kind: 'body-replace', content: bodyContent },
    });
    warnings.push(...replaced.warnings);
  }

  // Post-write dangling-link check for `supports`: each slug is resolved
  // against the adapter under `type: 'objective'`. Missing targets produce
  // a warning; the create still succeeds per §2.
  for (const objSlug of frontmatter['supports'] as string[]) {
    const targetRef: ArtifactRef = { type: 'objective', slug: objSlug };
    if (!(await refExists(ctx, targetRef))) {
      warnings.push({
        kind: 'dangling_ref',
        severity: 'warning',
        message: `link target objective/${objSlug} does not exist yet`,
        location: { artifactRef: ref, field: 'supports' },
        details: { to: targetRef, field: 'supports' },
      });
    }
  }

  const filePath = `.etak/artifacts/opportunities/${ref.slug}.md`;
  const created: OpportunityCreateResult['created'] = {
    name: frontmatter.name,
    status: String(frontmatter['status']),
    supports: [...(frontmatter['supports'] as string[])],
  };
  if (opts.hmw !== undefined) {
    created.hmw = opts.hmw;
  }
  const result: OpportunityCreateResult = {
    ref,
    created,
    path: filePath,
  };
  return envelopeSuccess('opportunity create', result, warnings);
}

async function refExists(ctx: CommandContext, ref: ArtifactRef): Promise<boolean> {
  try {
    await ctx.adapter.read(ref);
    return true;
  } catch {
    return false;
  }
}
