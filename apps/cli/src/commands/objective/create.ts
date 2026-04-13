// `etak objective create` — create a new objective artifact.
//
// Flag surface (design spec §3, §5; story ACs):
//   --name <string>         required. Human-readable name.
//   --slug <string>         optional override; otherwise derived from --name.
//   --status <enum>         one of the ObjectiveStatusSchema values; defaults active.
//   --from-file <path>      read the body from a file instead of scaffolding.
//   --body-stdin            read the body from stdin (body-only per §3.4).
//
// Intentional divergence from idea: objectives have NO typed link fields
// (no `addresses`, no `delivered_by`). Other types `supports` the
// objective — the objective itself points at nothing. There is no
// dangling-ref check on create.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import type { Document, ArtifactFrontmatter } from '../../adapters/operations.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ObjectiveFrontmatterSchema, ObjectiveBodyTemplate } from '../../schemas/index.js';
import { ValidationError } from '../../adapters/errors.js';

import type { CommandContextFactory } from './shared.js';
import { deriveSlug, readFileUtf8, readStdin } from './shared.js';

export interface ObjectiveCreateOptions {
  name?: string;
  slug?: string;
  status?: string;
  fromFile?: string;
  bodyStdin?: boolean;
}

export interface ObjectiveCreateResult {
  ref: ArtifactRef;
  created: {
    name: string;
    status: string;
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
    .description('create a new objective artifact')
    .requiredOption('--name <string>', 'human-readable name for the objective')
    .option('--slug <string>', 'explicit slug override (kebab-case)')
    .option('--status <value>', 'initial status', 'active')
    .option('--from-file <path>', 'read body content from a file')
    .option('--body-stdin', 'read body content from stdin')
    .action(async (cmdOpts: ObjectiveCreateOptions) => {
      const code = await runCommand<ObjectiveCreateResult>({
        command: 'objective create',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runObjectiveCreate(cmdOpts, factory, globals),
        humanSummary: (data) =>
          `created objective \`${data.ref.slug}\` (${data.created.status})`,
      });
      globals.exit(code);
    });
}

export async function runObjectiveCreate(
  opts: ObjectiveCreateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<ObjectiveCreateResult>> {
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
    type: 'objective' as const,
    status: opts.status ?? 'active',
  };
  const parsed = ObjectiveFrontmatterSchema.safeParse(frontmatterCandidate);
  if (!parsed.success) {
    // Let the boundary classifier render ZodError → exit 1.
    throw parsed.error;
  }
  const frontmatter: ArtifactFrontmatter = {
    name: parsed.data.name,
    type: 'objective',
    status: parsed.data.status,
  };

  const ref: ArtifactRef = { type: 'objective', slug: rawSlug };

  // Required sections scaffold with a placeholder TODO marker; optional
  // sections stay empty. Without a placeholder, the parser treats
  // empty-but-present as canonical and `create → get` reports zero
  // drift on a structurally-incomplete artifact, hiding the fact that
  // the author never filled it in.
  const REQUIRED_PLACEHOLDER = '_TODO: fill in_';
  const emptyBody = {
    sections: ObjectiveBodyTemplate.sections.map((s) => ({
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

  const filePath = `.etak/artifacts/objectives/${ref.slug}.md`;
  const result: ObjectiveCreateResult = {
    ref,
    created: {
      name: frontmatter.name,
      status: String(frontmatter['status']),
    },
    path: filePath,
  };
  return envelopeSuccess('objective create', result, warnings);
}
