// `etak idea update <slug>` — update an existing idea artifact.
//
// The update command supports three parallel surfaces (design spec §3.4):
//
//   1. Frontmatter updates (always allowed, composable):
//        --name <string>         rename the human-readable name
//        --status <value>        change status
//        --add-addresses <slug>  append to addresses (repeatable)
//        --remove-addresses <slug>
//        --add-delivered-by <slug>
//        --remove-delivered-by <slug>
//
//   2. Body section replace (at most one form per call):
//        --section <name> <content>
//        --section-file <name> <path>
//        --section-stdin <name>          (slug-keyed; content from stdin)
//
//   3. Whole-body replace (mutually exclusive with --section*):
//        --body <content>
//        --body-file <path>
//        --body-stdin
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
import { IdeaStatusSchema } from '../../schemas/index.js';

import type { CommandContextFactory } from './shared.js';
import { readFileUtf8, readStdin } from '../shared.js';

export interface IdeaUpdateOptions {
  name?: string;
  status?: string;
  addAddresses?: string[];
  removeAddresses?: string[];
  addDeliveredBy?: string[];
  removeDeliveredBy?: string[];
  section?: string[]; // pairs passed as ["slug", "content", "slug", "content", ...] or single
  sectionFile?: string[];
  sectionStdin?: string;
  body?: string;
  bodyFile?: string;
  bodyStdin?: boolean;
}

export interface IdeaUpdateResult {
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
    .description('update an existing idea artifact')
    .argument('<slug>', 'slug of the idea to update')
    .option('--name <string>', 'rename the human-readable name')
    .option('--status <value>', 'change the status')
    .option(
      '--add-addresses <slug>',
      'append to addresses (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-addresses <slug>',
      'remove from addresses (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--add-delivered-by <slug>',
      'append to delivered_by (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-delivered-by <slug>',
      'remove from delivered_by (repeatable)',
      collectStrings,
      [] as string[],
    )
    // --section takes two values: <slug> <content>. Commander's
    // variadic-argument story doesn't cover paired args directly, so we
    // accept a single string of the form `<slug>=<content>` (split on the
    // first `=`). Repeatable.
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
    .action(async (slug: string, cmdOpts: IdeaUpdateOptions) => {
      const code = await runCommand<IdeaUpdateResult>({
        command: 'idea update',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runIdeaUpdate(slug, cmdOpts, factory, globals),
        humanSummary: (data) =>
          data.applied.length === 0
            ? `no changes applied to idea \`${data.ref.slug}\``
            : `updated idea \`${data.ref.slug}\` (${data.applied.join(', ')})`,
      });
      globals.exit(code);
    });
  return cmd;
}

export async function runIdeaUpdate(
  slug: string,
  opts: IdeaUpdateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<IdeaUpdateResult>> {
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

  const ref: ArtifactRef = { type: 'idea', slug };
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
  if (opts.status !== undefined) {
    const parsed = IdeaStatusSchema.safeParse(opts.status);
    if (!parsed.success) {
      throw parsed.error;
    }
    fmPatch['status'] = parsed.data;
    applied.push('status');
  }

  if ((opts.addAddresses?.length ?? 0) > 0 || (opts.removeAddresses?.length ?? 0) > 0) {
    const current = toStringArray(existing.frontmatter['addresses']);
    const adds = opts.addAddresses ?? [];
    const removes = opts.removeAddresses ?? [];
    const next = [...current];
    for (const slugToAdd of adds) if (!next.includes(slugToAdd)) next.push(slugToAdd);
    const filtered = next.filter((s) => !removes.includes(s));
    fmPatch['addresses'] = filtered;
    applied.push('addresses');
  }
  if ((opts.addDeliveredBy?.length ?? 0) > 0 || (opts.removeDeliveredBy?.length ?? 0) > 0) {
    const current = toStringArray(existing.frontmatter['delivered_by']);
    const adds = opts.addDeliveredBy ?? [];
    const removes = opts.removeDeliveredBy ?? [];
    const next = [...current];
    for (const slugToAdd of adds) if (!next.includes(slugToAdd)) next.push(slugToAdd);
    const filtered = next.filter((s) => !removes.includes(s));
    fmPatch['delivered_by'] = filtered;
    applied.push('delivered_by');
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
      'no updates specified — pass at least one --name / --status / --add-* / --remove-* / --section* / --body* flag',
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
    'idea update',
    { ref, applied },
    warnings,
  );
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).map(String) : [];
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
