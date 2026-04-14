// `etak critique link <slug>` — add or remove typed links on a critique.
//
// Mixed scalar/array link shape (schemas/critique.ts):
//   - target (scalar)          : --target <slug> (replaces)
//   - personas_used (array)    : --add-persona-used / --remove-persona-used
//   - frameworks_used (array)  : --add-framework-used / --remove-framework-used
//   - artifacts_created (array): --add-artifact-created / --remove-artifact-created
//
// The scalar `target` case is the first concrete exercise of the adapter's
// scalar-link path (see adapters/interface.ts `link` doc comment and
// fs-adapter.ts `SCALAR_LINK_FIELDS`). We call `adapter.link(from,
// 'target', to)` and the adapter replaces the existing value. There is
// no `--remove-target` today — unlinking a scalar via this command
// group would leave `target: null` which then fails the critique schema
// on the next validated read. If a real use case emerges, follow-up
// work can add `--clear-target` or an equivalent that deletes the
// critique outright.
//
// Target is polymorphic (critique can target any artifact), so link
// dangling-ref probes walk every ArtifactType until one resolves. The
// adapter's own dangling probe only checks a single explicit type, which
// would emit a spurious warning on a perfectly valid cross-type link —
// we pre-resolve the type and then pass that to the adapter.

import type { Command } from 'commander';

import type { ChassisGlobals } from '../../cli-runtime.js';
import type { CommandContext, CommandContextFactory } from '../../context.js';
import type { ArtifactRef, DriftWarning } from '../../schemas/index.js';
import { runCommand } from '../../errors/boundary.js';
import { envelopeSuccess } from '../../output/envelope.js';
import type { Envelope } from '../../output/envelope.js';
import { ValidationError } from '../../adapters/errors.js';

import { collectStrings } from '../shared.js';
import { resolveArtifactType } from './shared.js';

export interface CritiqueLinkOptions {
  target?: string;
  addPersonaUsed?: string[];
  removePersonaUsed?: string[];
  addFrameworkUsed?: string[];
  removeFrameworkUsed?: string[];
  addArtifactCreated?: string[];
  removeArtifactCreated?: string[];
}

export interface CritiqueLinkResult {
  ref: ArtifactRef;
  added: Array<{ field: string; to: string }>;
  removed: Array<{ field: string; to: string }>;
}

export function registerLinkCommand(
  group: Command,
  globals: ChassisGlobals,
  factory: CommandContextFactory,
): Command {
  return group
    .command('link')
    .description('add or remove typed links on a critique')
    .argument('<slug>', 'slug of the critique to operate on')
    .option('--target <slug>', 'replace the scalar `target` link')
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
    .action(async (slug: string, cmdOpts: CritiqueLinkOptions) => {
      const code = await runCommand<CritiqueLinkResult>({
        command: 'critique link',
        mode: globals.mode,
        streams: globals.streams,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
        handler: () => runCritiqueLink(slug, cmdOpts, factory, globals),
        humanSummary: (data) => {
          const plus = data.added.map((a) => `+${a.field}=${a.to}`);
          const minus = data.removed.map((r) => `-${r.field}=${r.to}`);
          if (plus.length === 0 && minus.length === 0) {
            return `no link changes for critique \`${data.ref.slug}\``;
          }
          return `updated critique \`${data.ref.slug}\` links (${[...plus, ...minus].join(', ')})`;
        },
      });
      globals.exit(code);
    });
}

export async function runCritiqueLink(
  slug: string,
  opts: CritiqueLinkOptions,
  factory: CommandContextFactory,
  globals: ChassisGlobals,
): Promise<Envelope<CritiqueLinkResult>> {
  const ref: ArtifactRef = { type: 'critique', slug };

  const newTarget = opts.target;
  const addPersonas = opts.addPersonaUsed ?? [];
  const removePersonas = opts.removePersonaUsed ?? [];
  const addFrameworks = opts.addFrameworkUsed ?? [];
  const removeFrameworks = opts.removeFrameworkUsed ?? [];
  const addArtifacts = opts.addArtifactCreated ?? [];
  const removeArtifacts = opts.removeArtifactCreated ?? [];

  if (
    newTarget === undefined &&
    addPersonas.length === 0 &&
    removePersonas.length === 0 &&
    addFrameworks.length === 0 &&
    removeFrameworks.length === 0 &&
    addArtifacts.length === 0 &&
    removeArtifacts.length === 0
  ) {
    throw new ValidationError(
      'no link operations specified — pass at least one --target / --add-* / --remove-* flag',
    );
  }

  const ctx: CommandContext = await factory({
    cwd: globals.cwd,
    env: globals.env,
    mode: globals.mode,
    streams: globals.streams,
  });

  // Trigger NotFoundError up front for a missing critique slug so failures
  // exit 2 before we issue partial link edits.
  await ctx.adapter.read(ref);

  const warnings: DriftWarning[] = [];
  const added: Array<{ field: string; to: string }> = [];
  const removed: Array<{ field: string; to: string }> = [];

  // Scalar `target` — replaces whatever was there. Resolve the target's
  // type by probing every artifact type; if nothing resolves we still
  // call link() with a best-guess type so the adapter emits a single
  // dangling_ref warning (rather than double-warning).
  if (newTarget !== undefined) {
    const resolvedType = await resolveArtifactType(ctx, newTarget);
    const to: ArtifactRef = { type: resolvedType ?? 'opportunity', slug: newTarget };
    const result = await ctx.adapter.link(ref, 'target', to);
    warnings.push(...result.warnings);
    added.push({ field: 'target', to: newTarget });
  }

  // Array fields. personas_used and frameworks_used hold free-form
  // strings (persona names, framework names) not artifact slugs, so
  // the adapter's dangling_ref probe is not meaningful for them — but
  // the adapter calls link() with an ArtifactRef regardless. To avoid
  // spurious dangling-ref warnings on string-valued arrays, we reach
  // into the adapter with a synthetic ref whose type is 'critique'
  // (guaranteed to miss, triggering the warning) — that's wrong. The
  // cleanest fix is to suppress adapter-level dangling warnings for
  // string arrays. Instead we mutate frontmatter directly via update()
  // for personas_used/frameworks_used, bypassing link() entirely.
  //
  // For artifacts_created (slug-valued) we DO want the dangling probe,
  // so we call link() with a resolved type like `target`.

  // personas_used / frameworks_used: frontmatter-direct.
  if (addPersonas.length > 0 || removePersonas.length > 0) {
    await mutateArrayField(
      ctx,
      ref,
      'personas_used',
      addPersonas,
      removePersonas,
    );
    for (const p of addPersonas) added.push({ field: 'personas_used', to: p });
    for (const p of removePersonas) removed.push({ field: 'personas_used', to: p });
  }
  if (addFrameworks.length > 0 || removeFrameworks.length > 0) {
    await mutateArrayField(
      ctx,
      ref,
      'frameworks_used',
      addFrameworks,
      removeFrameworks,
    );
    for (const f of addFrameworks) added.push({ field: 'frameworks_used', to: f });
    for (const f of removeFrameworks) removed.push({ field: 'frameworks_used', to: f });
  }

  // artifacts_created: slug-valued, use link()/unlink() so the adapter
  // performs the dangling probe. Resolve type per slug.
  for (const artifactSlug of addArtifacts) {
    const resolvedType = await resolveArtifactType(ctx, artifactSlug);
    const to: ArtifactRef = { type: resolvedType ?? 'idea', slug: artifactSlug };
    const result = await ctx.adapter.link(ref, 'artifacts_created', to);
    warnings.push(...result.warnings);
    added.push({ field: 'artifacts_created', to: artifactSlug });
  }
  for (const artifactSlug of removeArtifacts) {
    // For unlink, the adapter just matches on slug — the type doesn't
    // participate in equality — so we can pass any type here.
    const to: ArtifactRef = { type: 'idea', slug: artifactSlug };
    const result = await ctx.adapter.unlink(ref, 'artifacts_created', to);
    warnings.push(...result.warnings);
    removed.push({ field: 'artifacts_created', to: artifactSlug });
  }

  return envelopeSuccess('critique link', { ref, added, removed }, warnings);
}

/**
 * In-place add/remove on a string-valued frontmatter array. Used for
 * personas_used and frameworks_used, which carry free-form strings
 * rather than artifact slugs — so the adapter's link/unlink dangling
 * probe is semantically wrong for them.
 */
async function mutateArrayField(
  ctx: CommandContext,
  ref: ArtifactRef,
  field: string,
  adds: string[],
  removes: string[],
): Promise<void> {
  const existing = await ctx.adapter.read(ref);
  const current = existing.frontmatter[field];
  const base = Array.isArray(current) ? (current as unknown[]).map(String) : [];
  const next = [...base];
  for (const v of adds) if (!next.includes(v)) next.push(v);
  const filtered = next.filter((v) => !removes.includes(v));
  await ctx.adapter.update(ref, { frontmatter: { [field]: filtered } });
}
