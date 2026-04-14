// `etak opportunity update <slug>` — update an existing opportunity.
//
// Frontmatter surface:
//   --name <string>            rename the human-readable name
//   --status <value>           change status
//   --add-supports <slug>      append to supports (repeatable)
//   --remove-supports <slug>   remove from supports (repeatable)
//   --hmw <string>             set the `hmw` passthrough field
//                              (see create.ts header for rationale)
//
// Body surface identical to idea/objective:
//   --section <slug=content>  /  --section-file <slug=path>  /
//   --section-stdin <slug>    (mutually exclusive with --body*)
//   --body <content>  /  --body-file <path>  /  --body-stdin
//
// All changes land as a single atomic `adapter.update()` call.

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
import { OpportunityStatusSchema } from '../../schemas/index.js';

import { collectStrings, readFileUtf8, readStdin, splitKv } from '../shared.js';

export interface OpportunityUpdateOptions {
  name?: string;
  status?: string;
  addSupports?: string[];
  removeSupports?: string[];
  hmw?: string;
  section?: string[];
  sectionFile?: string[];
  sectionStdin?: string;
  body?: string;
  bodyFile?: string;
  bodyStdin?: boolean;
}

export interface OpportunityUpdateResult {
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
    .description('update an existing opportunity artifact')
    .argument('<slug>', 'slug of the opportunity to update')
    .option('--name <string>', 'rename the human-readable name')
    .option('--status <value>', 'change the status')
    .option(
      '--add-supports <slug>',
      'append to supports (repeatable)',
      collectStrings,
      [] as string[],
    )
    .option(
      '--remove-supports <slug>',
      'remove from supports (repeatable)',
      collectStrings,
      [] as string[],
    )
    // Typed flag for the `hmw` known-extras passthrough field; see
    // create.ts header.
    .option('--hmw <string>', 'set the How Might We statement (free text)')
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
    .action(async (slug: string, cmdOpts: OpportunityUpdateOptions) => {
      const code = await runCommand<OpportunityUpdateResult>({
        command: 'opportunity update',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runOpportunityUpdate(slug, cmdOpts, factory, globals),
        humanSummary: (data) =>
          data.applied.length === 0
            ? `no changes applied to opportunity \`${data.ref.slug}\``
            : `updated opportunity \`${data.ref.slug}\` (${data.applied.join(', ')})`,
      });
      globals.exit(code);
    });
  return cmd;
}

export async function runOpportunityUpdate(
  slug: string,
  opts: OpportunityUpdateOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<OpportunityUpdateResult>> {
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

  const ref: ArtifactRef = { type: 'opportunity', slug };
  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  // Read current so we can merge the `supports` link-array change. A
  // missing slug throws NotFoundError → exit 2.
  const existing = await ctx.adapter.read(ref);

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
    const parsed = OpportunityStatusSchema.safeParse(opts.status);
    if (!parsed.success) {
      throw parsed.error;
    }
    fmPatch['status'] = parsed.data;
    applied.push('status');
  }
  if (opts.hmw !== undefined) {
    // `hmw` is a free-text passthrough, so no schema-parse needed beyond
    // what the adapter's own validation will do.
    fmPatch['hmw'] = opts.hmw;
    applied.push('hmw');
  }

  if ((opts.addSupports?.length ?? 0) > 0 || (opts.removeSupports?.length ?? 0) > 0) {
    const current = toStringArray(existing.frontmatter['supports']);
    const adds = opts.addSupports ?? [];
    const removes = opts.removeSupports ?? [];
    const next = [...current];
    for (const slugToAdd of adds) if (!next.includes(slugToAdd)) next.push(slugToAdd);
    const filtered = next.filter((s) => !removes.includes(s));
    fmPatch['supports'] = filtered;
    applied.push('supports');
  }

  // --- body update -------------------------------------------------------
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
      'no updates specified — pass at least one --name / --status / --hmw / --add-* / --remove-* / --section* / --body* flag',
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

  return envelopeSuccess(
    'opportunity update',
    { ref, applied },
    warnings,
  );
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).map(String) : [];
}
