// `etak objective update <slug>` — update an existing objective artifact.
//
// The update command supports two parallel surfaces (design spec §3.4):
//
//   1. Frontmatter updates (always allowed, composable):
//        --name <string>         rename the human-readable name
//        --status <value>        change status
//
//   2. Body section replace (at most one form per call):
//        --section <slug=content>
//        --section-file <slug=path>
//        --section-stdin <slug>          (slug-keyed; content from stdin)
//
//   3. Whole-body replace (mutually exclusive with --section*):
//        --body <content>
//        --body-file <path>
//        --body-stdin
//
// Intentional divergence from idea: objective has NO typed link fields, so
// there are no `--add-addresses` / `--remove-addresses` /
// `--add-delivered-by` / `--remove-delivered-by` flags. The frontmatter
// flag surface is therefore minimal — just --name and --status. The
// body-update surface is identical to idea's.
//
// Combining --section* with --body* is a validation error (exit 1), matching
// the "exactly one body-update form" rule in §3.4. Combining frontmatter
// flags with any body form is allowed — frontmatter is a separate channel.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext } from '../../context.js';
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
import { ObjectiveStatusSchema } from '../../schemas/index.js';

import type { CommandContextFactory } from './shared.js';
import { readFileUtf8, readStdin } from './shared.js';

export interface ObjectiveUpdateOptions {
  name?: string;
  status?: string;
  section?: string[];
  sectionFile?: string[];
  sectionStdin?: string;
  body?: string;
  bodyFile?: string;
  bodyStdin?: boolean;
}

export interface ObjectiveUpdateResult {
  ref: ArtifactRef;
  applied: string[];
}

function collectStrings(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

export function registerUpdateCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  const cmd = group
    .command('update')
    .description('update an existing objective artifact')
    .argument('<slug>', 'slug of the objective to update')
    .option('--name <string>', 'rename the human-readable name')
    .option('--status <value>', 'change the status')
    // --section takes a single string of the form `<slug>=<content>` (split
    // on the first `=`). Repeatable.
    .option(
      '--section <slug=content>',
      'replace a section body: --section slug=content (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--section-file <slug=path>',
      'replace a section body from a file: --section-file slug=path (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--section-stdin <slug>',
      'replace a single section body from stdin',
    )
    .option('--body <content>', 'replace the whole body with the given string')
    .option('--body-file <path>', 'replace the whole body from a file')
    .option('--body-stdin', 'replace the whole body from stdin')
    .action(async (slug: string, cmdOpts: ObjectiveUpdateOptions) => {
      const code = await runCommand<ObjectiveUpdateResult>({
        command: 'objective update',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runObjectiveUpdate(slug, cmdOpts, factory, globals),
        humanSummary: (data) =>
          data.applied.length === 0
            ? `no changes applied to objective \`${data.ref.slug}\``
            : `updated objective \`${data.ref.slug}\` (${data.applied.join(', ')})`,
      });
      globals.exit(code);
    });
  return cmd;
}

export async function runObjectiveUpdate(
  slug: string,
  opts: ObjectiveUpdateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<ObjectiveUpdateResult>> {
  // Mutually exclusive body forms.
  const hasSection =
    (opts.section?.length ?? 0) > 0 ||
    (opts.sectionFile?.length ?? 0) > 0 ||
    opts.sectionStdin !== undefined;
  const hasWholeBody =
    opts.body !== undefined || opts.bodyFile !== undefined || opts.bodyStdin === true;
  if (hasSection && hasWholeBody) {
    throw new ValidationError(
      '--section* and --body* are mutually exclusive',
    );
  }
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

  const ref: ArtifactRef = { type: 'objective', slug };
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  // Read current so that a missing slug throws NotFoundError → exit 2
  // via the chassis before we try to patch anything. Objective has no
  // link-array merge semantics, so we don't actually need the existing
  // document for the patch itself — but the read proves existence.
  await ctx.adapter.read(ref);

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
  if (opts.status !== undefined) {
    const parsed = ObjectiveStatusSchema.safeParse(opts.status);
    if (!parsed.success) {
      throw parsed.error;
    }
    fmPatch['status'] = parsed.data;
    applied.push('status');
  }

  // --- body update -------------------------------------------------------
  // Build a single ordered list of body ops. body-replace comes first if
  // present (so subsequent section-replace ops apply to the replacement
  // body — matching the spec §3.4 "whole-body then sections" ordering).
  // One adapter.update() call with { frontmatter, body: ops[] } writes
  // everything atomically.
  const bodyOps: BodyUpdate[] = [];

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

  // Section updates. Each --section flag: "slug=content"; each
  // --section-file flag: "slug=path". --section-stdin is a single slug
  // whose content is read from stdin once.
  if (hasSection) {
    for (const entry of opts.section ?? []) {
      const { slug: sectionSlug, value } = splitKv(entry, '--section');
      bodyOps.push({ kind: 'section-replace', sectionSlug, content: value });
      applied.push(`section:${sectionSlug}`);
    }
    for (const entry of opts.sectionFile ?? []) {
      const { slug: sectionSlug, value: path } = splitKv(entry, '--section-file');
      let content: string;
      try {
        content = await readFileUtf8(path);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new ValidationError(
          `failed to read --section-file ${path}: ${message}`,
          { details: { path } },
        );
      }
      bodyOps.push({ kind: 'section-replace', sectionSlug, content });
      applied.push(`section:${sectionSlug}`);
    }
    if (opts.sectionStdin !== undefined) {
      const content = await readStdin();
      bodyOps.push({
        kind: 'section-replace',
        sectionSlug: opts.sectionStdin,
        content,
      });
      applied.push(`section:${opts.sectionStdin}`);
    }
  }

  if (applied.length === 0) {
    throw new ValidationError(
      'no updates specified — pass at least one --name / --status / --section* / --body* flag',
    );
  }

  // Single atomic adapter call. If neither frontmatter nor body changed
  // we would have errored above; here at least one slot is non-empty.
  const changes: UpdateChanges = {};
  if (Object.keys(fmPatch).length > 0) {
    changes.frontmatter = fmPatch;
  }
  if (bodyOps.length > 0) {
    changes.body = bodyOps;
  }
  const result = await ctx.adapter.update(ref, changes);
  const warnings: DriftWarning[] = [...result.warnings];

  return envelopeSuccess(
    'objective update',
    { ref, applied },
    warnings,
  );
}

/**
 * Split a `<slug>=<content>` flag value on the first `=`. Any additional
 * `=` characters are preserved in the content portion (so
 * `description=a=b=c` yields `{slug: 'description', value: 'a=b=c'}`).
 * An empty slug or a missing `=` is a ValidationError. Exported for
 * unit tests.
 */
export function splitKv(entry: string, flag: string): { slug: string; value: string } {
  const eq = entry.indexOf('=');
  if (eq === -1) {
    throw new ValidationError(
      `${flag} expects <slug>=<value>, got "${entry}"`,
    );
  }
  const slug = entry.slice(0, eq).trim();
  const value = entry.slice(eq + 1);
  if (slug.length === 0) {
    throw new ValidationError(
      `${flag} requires a non-empty section slug before "="`,
    );
  }
  return { slug, value };
}
