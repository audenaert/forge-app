// Adapter operation types — the interface surface of the storage adapter.
//
// These types describe *how the adapter is called* and *what it returns*.
// They are distinct from the artifact-model types in `../schemas`, which
// describe the persistent shape of artifacts on disk. Both layers coexist:
//
//   - `../schemas` owns the cross-cutting contract: ArtifactType, ArtifactRef,
//     BodyTemplate, BodySection, BodyDocument, DriftWarning, StructuredError,
//     etc. Anything a future non-filesystem adapter (graphql, etc.) would
//     also need lives there.
//
//   - This file owns adapter-operation types: Document, WriteResult,
//     UpdateChanges, ListFilter. These are not validated against schemas —
//     they're runtime plumbing.
//
// Body sections are carried across this boundary as the schemas-package
// `BodyDocument` (a list of `BodySection`s whose `content` is raw markdown).
// See the comment block on `BodySection` in `../schemas/types.ts` for the
// decision record on why the section carries raw content rather than a
// pre-parsed mdast tree.

import type {
  ArtifactRef,
  ArtifactType,
  BodyDocument,
  DriftWarning,
} from '../schemas/index.js';

/**
 * Frontmatter as the adapter round-trips it. Keyed on string because the
 * adapter layer preserves unknown fields verbatim (drift detection classifies
 * them as `unknown_frontmatter_field` warnings rather than rejecting them).
 * Typed per-artifact frontmatter (ObjectiveFrontmatter, etc.) lives in the
 * schemas package and is used by validation layers above the adapter.
 */
export interface ArtifactFrontmatter {
  name: string;
  type: ArtifactType;
  status?: string;
  [key: string]: unknown;
}

/** A fully parsed artifact domain object that the adapter round-trips. */
export interface Document {
  ref: ArtifactRef;
  frontmatter: ArtifactFrontmatter;
  body: BodyDocument;
  /** Drift warnings gathered during read/write. */
  warnings: DriftWarning[];
}

/** Result of a write/update/link/unlink. */
export interface WriteResult {
  document: Document;
  warnings: DriftWarning[];
}

/** Per-section replace: rewrite the named section, preserving everything else. */
export interface SectionReplaceUpdate {
  kind: 'section-replace';
  /** Section slug (template slug or heading-derived slug for extras). */
  sectionSlug: string;
  /** New raw markdown content for the section body. */
  content: string;
}

/** Whole-body replace: new raw markdown for the entire body. */
export interface BodyReplaceUpdate {
  kind: 'body-replace';
  content: string;
}

export type BodyUpdate = SectionReplaceUpdate | BodyReplaceUpdate;

/**
 * Patch applied by `update`. Frontmatter fields and at most one body update
 * form per call (enforced at the command layer, but the adapter is defensive
 * about it).
 */
export interface UpdateChanges {
  frontmatter?: Partial<ArtifactFrontmatter>;
  body?: BodyUpdate;
}

/** Filter for `list`. Only fields the spec promises in §1 are supported. */
export interface ListFilter {
  status?: string;
  /** Match frontmatter fields by exact value. */
  frontmatter?: Record<string, unknown>;
}
