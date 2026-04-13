// `etak idea create` — create a new idea artifact.
//
// Flag surface (design spec §3, §5; story ACs):
//   --name <string>         required. Human-readable name.
//   --slug <string>         optional override; otherwise derived from --name.
//   --status <enum>         one of the IdeaStatusSchema values; defaults draft.
//   --addresses <slug>      repeatable. Links to opportunity slugs.
//   --delivered-by <slug>   repeatable. Links to delivery artifact slugs.
//   --from-file <path>      read the body from a file instead of scaffolding.
//   --body-stdin            read the body from stdin (body-only per §3.4).
//
// Dangling-link handling: we compose the frontmatter directly and call
// `adapter.write()` once (option (a) in the story). After the write lands,
// we post-resolve each linked slug against the adapter to produce
// `dangling_ref` drift warnings. This avoids per-link adapter round-trips
// on the hot path while still honoring the warn-and-proceed rule from §2.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import type { Document, ArtifactFrontmatter } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { IdeaFrontmatterSchema, IdeaBodyTemplate } from '../../schemas/index.js';
import { ValidationError } from '../../adapters/errors.js';

import type { CommandContextFactory } from './shared.js';
import { deriveSlug, readFileUtf8, readStdin } from './shared.js';

export interface IdeaCreateOptions {
  name?: string;
  slug?: string;
  status?: string;
  addresses?: string[];
  deliveredBy?: string[];
  fromFile?: string;
  bodyStdin?: boolean;
}

export interface IdeaCreateResult {
  ref: ArtifactRef;
  created: {
    name: string;
    status: string;
    addresses: string[];
    delivered_by: string[];
  };
  path: string;
}

/**
 * Commander-level collector for repeatable string options. Returns the
 * accumulated array so each additional `--addresses foo --addresses bar`
 * flag appends to the same list.
 */
function collectStrings(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

export function registerCreateCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('create')
    .description('create a new idea artifact')
    .requiredOption('--name <string>', 'human-readable name for the idea')
    .option('--slug <string>', 'explicit slug override (kebab-case)')
    .option('--status <value>', 'initial status', 'draft')
    .option(
      '--addresses <slug>',
      'opportunity slug the idea addresses (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--delivered-by <slug>',
      'delivery artifact slug (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option('--from-file <path>', 'read body content from a file')
    .option('--body-stdin', 'read body content from stdin')
    .action(async (cmdOpts: IdeaCreateOptions) => {
      const code = await runCommand<IdeaCreateResult>({
        command: 'idea create',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runIdeaCreate(cmdOpts, factory, globals),
        humanSummary: (data) =>
          `created idea \`${data.ref.slug}\` (${data.created.status})`,
      });
      globals.exit(code);
    });
}

export async function runIdeaCreate(
  opts: IdeaCreateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<IdeaCreateResult>> {
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

  // Build and validate frontmatter against the Zod schema.
  const frontmatterCandidate = {
    name: opts.name.trim(),
    type: 'idea' as const,
    status: opts.status ?? 'draft',
    addresses: opts.addresses ?? [],
    delivered_by: opts.deliveredBy ?? [],
  };
  const parsed = IdeaFrontmatterSchema.safeParse(frontmatterCandidate);
  if (!parsed.success) {
    // Let the boundary classifier render ZodError → exit 1.
    throw parsed.error;
  }
  const frontmatter: ArtifactFrontmatter = {
    name: parsed.data.name,
    type: 'idea',
    status: parsed.data.status,
    addresses: parsed.data.addresses,
    delivered_by: parsed.data.delivered_by,
  };

  const ref: ArtifactRef = { type: 'idea', slug: rawSlug };

  // Build the canonical body document. If body content came from
  // --from-file or --body-stdin we apply it as a body-replace via
  // serializing an intermediate Document; simplest path is to write the
  // empty template first and then update. Instead: synthesize the body
  // directly by placing the content into a single "description" section
  // if it lacks H2 headings, or pass through as a body-replace after
  // write. The clean approach is to start with the canonical template and
  // then issue a body-replace update for file/stdin sources.

  // Required sections scaffold with a placeholder TODO marker; optional
  // sections stay empty. Without a placeholder, the parser treats
  // empty-but-present as canonical and `create → get` reports zero
  // drift on a structurally-incomplete artifact, hiding the fact that
  // the author never filled it in.
  const REQUIRED_PLACEHOLDER = '_TODO: fill in_';
  const emptyBody = {
    sections: IdeaBodyTemplate.sections.map((s) => ({
      heading: s.name,
      slug: s.slug,
      status: 'canonical' as const,
      canonicalOrder: s.order,
      content: s.required ? REQUIRED_PLACEHOLDER : '',
    })),
    warnings: [] as DriftWarning[],
  };

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
  // body after the initial write. This keeps the canonical scaffold for
  // the default case while letting authored content land verbatim.
  const warnings: DriftWarning[] = [...writeResult.warnings];
  if (bodyContent !== null) {
    const replaced = await ctx.adapter.update(ref, {
      body: { kind: 'body-replace', content: bodyContent },
    });
    warnings.push(...replaced.warnings);
  }

  // Post-write dangling-link check: each --addresses and --delivered-by
  // slug is resolved against the adapter. A missing target is a warning,
  // not an error, per §2. `delivered_by` is polymorphic (idea → story /
  // task / spec / ...); v1 does not disambiguate by type, so we probe
  // under `type: 'idea'` — matching the shape `link.ts:152-154` uses.
  for (const oppSlug of frontmatter['addresses'] as string[]) {
    const targetRef: ArtifactRef = { type: 'opportunity', slug: oppSlug };
    if (!(await refExists(ctx, targetRef))) {
      warnings.push({
        kind: 'dangling_ref',
        severity: 'warning',
        message: `link target opportunity/${oppSlug} does not exist yet`,
        location: { artifactRef: ref, field: 'addresses' },
        details: { to: targetRef, field: 'addresses' },
      });
    }
  }
  for (const targetSlug of frontmatter['delivered_by'] as string[]) {
    const targetRef: ArtifactRef = { type: 'idea', slug: targetSlug };
    if (!(await refExists(ctx, targetRef))) {
      warnings.push({
        kind: 'dangling_ref',
        severity: 'warning',
        message: `link target delivered_by/${targetSlug} does not exist yet`,
        location: { artifactRef: ref, field: 'delivered_by' },
        details: { to: targetRef, field: 'delivered_by' },
      });
    }
  }

  const filePath = `.etak/artifacts/ideas/${ref.slug}.md`;
  const result: IdeaCreateResult = {
    ref,
    created: {
      name: frontmatter.name,
      status: String(frontmatter['status']),
      addresses: [...(frontmatter['addresses'] as string[])],
      delivered_by: [...(frontmatter['delivered_by'] as string[])],
    },
    path: filePath,
  };
  return envelopeSuccess('idea create', result, warnings);
}

async function refExists(ctx: CommandContext, ref: ArtifactRef): Promise<boolean> {
  try {
    await ctx.adapter.read(ref);
    return true;
  } catch {
    return false;
  }
}
