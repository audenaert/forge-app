// Filesystem path resolution for artifacts. Layout per §6.1:
//
//   <root>/<type>s/<slug>.md
//
// where <type> is the singular artifact type and the directory is the
// pluralized form. Plural forms are English-regular except `critique` →
// `critiques` and `opportunity` → `opportunities` (both handled by the
// table). The adapter constructor is passed the *artifact root* — typically
// `<project>/.etak/artifacts` — not the project root.
//
// Security: every path built here must resolve strictly under the artifact
// root. `assertUnderRoot` is the defense-in-depth boundary check that runs
// after every `resolve(...)` producing an artifact file path, so a slug that
// sneaks past input validation (or any future code path that builds a ref
// without running `validateRef`) still cannot escape the root.

import { resolve, sep } from 'node:path';
import type { ArtifactRef, ArtifactType } from '../../schemas/index.js';
import { AdapterError } from '../errors.js';

const PLURAL: Record<ArtifactType, string> = {
  objective: 'objectives',
  opportunity: 'opportunities',
  idea: 'ideas',
  assumption: 'assumptions',
  experiment: 'experiments',
  critique: 'critiques',
};

export function directoryForType(artifactRoot: string, type: ArtifactType): string {
  const root = resolve(artifactRoot);
  const dir = resolve(root, PLURAL[type]);
  assertUnderRoot(root, dir);
  return dir;
}

export function fileForRef(artifactRoot: string, ref: ArtifactRef): string {
  const root = resolve(artifactRoot);
  const file = resolve(directoryForType(root, ref.type), `${ref.slug}.md`);
  assertUnderRoot(root, file);
  return file;
}

export function pluralOf(type: ArtifactType): string {
  return PLURAL[type];
}

export const ALL_PLURALS: ReadonlyArray<[ArtifactType, string]> = (
  Object.entries(PLURAL) as Array<[ArtifactType, string]>
).slice();

/**
 * Defense-in-depth: assert that `candidate` resolves inside `root`. The
 * trailing-separator handling matters — `/tmp/foo-bar` must not be accepted
 * as "under" `/tmp/foo`, which a naive `startsWith(root)` would allow.
 *
 * We compare with `root + sep` as the prefix, and accept the exact-root case
 * explicitly. Any other shape throws an `AdapterError` (exit 3) rather than
 * a `ValidationError` — if we get here, something tried to construct a path
 * outside the root without going through input validation, which is a
 * system-level integrity failure, not a user-correctable one.
 */
export function assertUnderRoot(root: string, candidate: string): void {
  const normalizedRoot = resolve(root);
  const normalizedCandidate = resolve(candidate);
  if (normalizedCandidate === normalizedRoot) return;
  const prefix = normalizedRoot.endsWith(sep) ? normalizedRoot : normalizedRoot + sep;
  if (!normalizedCandidate.startsWith(prefix)) {
    throw new AdapterError(
      `path escape detected: ${normalizedCandidate} is not under ${normalizedRoot}`,
      { details: { root: normalizedRoot, candidate: normalizedCandidate } },
    );
  }
}
