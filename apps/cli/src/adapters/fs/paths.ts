// Filesystem path resolution for artifacts. Layout per §6.1:
//
//   <root>/<type>s/<slug>.md
//
// where <type> is the singular artifact type and the directory is the
// pluralized form. Plural forms are English-regular except `critique` →
// `critiques` and `opportunity` → `opportunities` (both handled by the
// table). The adapter constructor is passed the *artifact root* — typically
// `<project>/.etak/artifacts` — not the project root.

import { resolve } from 'node:path';
import type { ArtifactRef, ArtifactType } from '../types.js';

const PLURAL: Record<ArtifactType, string> = {
  objective: 'objectives',
  opportunity: 'opportunities',
  idea: 'ideas',
  assumption: 'assumptions',
  experiment: 'experiments',
  critique: 'critiques',
};

export function directoryForType(artifactRoot: string, type: ArtifactType): string {
  return resolve(artifactRoot, PLURAL[type]);
}

export function fileForRef(artifactRoot: string, ref: ArtifactRef): string {
  return resolve(directoryForType(artifactRoot, ref.type), `${ref.slug}.md`);
}

export function pluralOf(type: ArtifactType): string {
  return PLURAL[type];
}

export const ALL_PLURALS: ReadonlyArray<[ArtifactType, string]> = (
  Object.entries(PLURAL) as Array<[ArtifactType, string]>
).slice();
