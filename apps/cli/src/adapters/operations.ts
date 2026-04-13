// Adapter operation types — the interface surface of the storage adapter.
//
// These types describe *how the adapter is called* and *what it returns*.
// They are distinct from the artifact-model types in `../schemas`, which
// describe the persistent shape of artifacts on disk. Both layers coexist:
//
//   - `../schemas` owns the cross-cutting contract: ArtifactType, ArtifactRef,
//     BodyTemplate, DriftWarning, StructuredError, etc. Anything a future
//     non-filesystem adapter (graphql, etc.) would also need lives there.
//
//   - This file owns adapter-operation types: Document, WriteResult,
//     UpdateChanges, ListFilter, and the parser's internal body shape.
//     These are not validated against schemas — they're runtime plumbing.
//
// **Parser body shape — shape mismatch with schemas `BodySection`.**
// The schemas package declares `BodySection.nodes: readonly unknown[]` as
// a forward-looking placeholder: when M1-S3 landed, mdast nodes were the
// assumed representation. M1-S4's parser deliberately chose raw-content
// strings (`content: string`) so section bodies round-trip byte-for-byte
// through write/read cycles — the reviewer explicitly pinned this behavior
// in the byte-preserving round-trip contract test.
//
// Those two shapes are not compatible: `nodes: readonly unknown[]` cannot
// carry a `string`. Reconciling them is a design decision that does not
// belong in a cleanup PR — either schemas changes `BodySection` to carry
// raw content (simplest), or the adapter gains a dual representation
// (content + nodes), or the parser switches to mdast nodes and a
// serializer-round-trip test (largest change). Until that decision is made,
// the adapter keeps its raw-content `ParsedBodySection` type locally and
// the schemas types remain the future-facing contract exposed to
// non-adapter code.

import type {
  ArtifactRef,
  ArtifactType,
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

/**
 * One authored section as the parser captured it from the source. `content`
 * is raw markdown (verbatim between heading offsets), `status` classifies
 * the section against the type's body template, and `canonicalOrder` is set
 * when `status === 'canonical'`. The `preamble` kind marks content that
 * appeared before the first H2 and is emitted heading-less on round-trip.
 */
export interface ParsedBodySection {
  heading: string;
  slug: string;
  status: 'canonical' | 'extra' | 'renamed' | 'preamble';
  canonicalOrder?: number;
  content: string;
}

/**
 * The parser's body document: an ordered list of `ParsedBodySection`s in
 * source order, plus any drift warnings gathered during parsing. See the
 * shape-mismatch note at the top of this file for why this is not the
 * schemas-package `BodyDocument`.
 */
export interface ParsedBodyDocument {
  sections: ParsedBodySection[];
  warnings: DriftWarning[];
}

/** A fully parsed artifact domain object that the adapter round-trips. */
export interface Document {
  ref: ArtifactRef;
  frontmatter: ArtifactFrontmatter;
  body: ParsedBodyDocument;
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
