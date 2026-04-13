// Shared types for @etak/cli schemas.
//
// These types are referenced both by the Zod schemas in this directory and by
// the future markdown parser (M1-S4) and filesystem adapter (M1-S5). Keeping
// them decoupled from Zod means consumers can depend on a pure structural
// contract without pulling Zod into every import path.
//
// Source of truth: `apps/cli/docs/design.md` §3 (update contract) and §8
// (per-type body section templates).

/**
 * The set of discovery artifact types understood by @etak/cli v1.
 *
 * Ordered to match the discovery workflow (objective → opportunity → idea →
 * assumption → experiment → critique) so downstream code that iterates over
 * all types produces stable, human-meaningful output.
 */
export const ARTIFACT_TYPES = [
  'objective',
  'opportunity',
  'idea',
  'assumption',
  'experiment',
  'critique',
] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

/**
 * Per-type link field names drawn from `schemas.md`. A given artifact type
 * only legally carries a subset of these (see `schemas.md` §Typed Links);
 * the full union exists so generic link-handling code has a single type.
 */
export type LinkFieldName =
  | 'supports'
  | 'addresses'
  | 'assumed_by'
  | 'tests'
  | 'result_informs'
  | 'delivered_by'
  | 'target';

// ---------------------------------------------------------------------------
// Body templates (design.md §3.3, §8)
// ---------------------------------------------------------------------------

/**
 * One canonical section in a type's body template. `slug` is the machine key
 * used by `--section <slug>` on update, `name` is the human-readable H2
 * heading text on disk, `order` is 1-based canonical position, and `required`
 * drives drift detection (missing required sections produce a warning, not
 * an error — see design.md §3.5 case (c)).
 */
export interface BodySectionTemplate {
  readonly slug: string;
  readonly name: string;
  readonly order: number;
  readonly required: boolean;
}

/**
 * Per-type body template. `kind: "sectioned"` means the section-drift logic
 * applies: the parser matches H2 headings against `sections` and emits drift
 * warnings for extras, renames, reorders, and missing required sections.
 */
export interface SectionedBodyTemplate {
  readonly kind: 'sectioned';
  readonly sections: readonly BodySectionTemplate[];
}

/**
 * `kind: "opaque"` is an intentional deviation for critique only
 * (design.md §8 "Critique — body-as-opaque"). The parser still reads the
 * critique body uniformly through remark, but the drift detector skips it
 * entirely and the `--section` update surface is disabled for critiques.
 */
export interface OpaqueBodyTemplate {
  readonly kind: 'opaque';
}

export type BodyTemplate = SectionedBodyTemplate | OpaqueBodyTemplate;

// ---------------------------------------------------------------------------
// Parsed body document (design.md §3.3)
// ---------------------------------------------------------------------------
//
// These types are declared here so M1-S4 / M1-S5 parser code can import them
// from `@etak/cli/schemas` without duplicating the contract. This story does
// NOT implement the parser — it only fixes the shape.

/**
 * Drift classification for a single parsed section. `canonical` means the
 * section matches the template exactly; `renamed` means the H2 text differs
 * from the canonical `name` but the position matches; `extra` means the
 * section is not in the template at all (design.md §3.5). `preamble` is the
 * synthetic status applied to content that appeared before the first H2,
 * preserved heading-less so round-trip doesn't lose it.
 */
export type BodySectionStatus = 'canonical' | 'extra' | 'renamed' | 'preamble';

/**
 * Body sections carry raw source content, not structured AST nodes.
 *
 * The adapter reads and writes each section as a byte-preserving slice of
 * the original file (captured via AST position offsets) so human-authored
 * formatting — whitespace, list markers, code fence indentation, line
 * endings — round-trips intact. Round-trip fidelity is a load-bearing
 * promise of the adapter (see the byte-preserving contract test); exposing
 * pre-parsed mdast nodes here would either compete with that promise or
 * drag the schemas package into the remark ecosystem. Consumers that need
 * structured content (e.g. a future web UI rendering markdown) parse
 * `content` on their own; the parse result is intentionally not cached on
 * the section because no in-repo consumer benefits from it today. A
 * forward-compatible `ast?` computed field can be added later without a
 * breaking change if a consumer ever needs it.
 *
 * Decision record: PR #7 (M1-S3 schemas), PR #8 (M1-S4 adapter), and the
 * schemas/adapter unification follow-up that resolved the `nodes` vs
 * `content` mismatch in favor of `content: string`.
 *
 * One `BodySection` as it appeared in the source document, after parsing.
 * `canonicalOrder` is set when `status === 'canonical'` (and for `renamed`
 * sections the parser promoted from an `extra` match). `status: 'preamble'`
 * marks content that appeared before the first H2 and is emitted
 * heading-less on round-trip.
 */
export interface BodySection {
  heading: string;
  slug: string;
  status: BodySectionStatus;
  canonicalOrder?: number;
  content: string;
}

/**
 * Parsed body of an artifact. `sections` is in the order they appeared in
 * the source (round-trip preservation — design.md §3.5), not canonical order.
 * `warnings` carries any drift detected during parsing.
 */
export interface BodyDocument {
  sections: BodySection[];
  warnings: DriftWarning[];
}

// ---------------------------------------------------------------------------
// Drift and error envelope shapes (design.md §3.6, §7)
// ---------------------------------------------------------------------------
//
// DriftWarning and StructuredError share a location/details shape so the
// rendering layer (topic 7) can handle both uniformly.

export type DriftWarningKind =
  | 'extra_section'
  | 'section_reordered'
  | 'missing_required_section'
  | 'section_renamed'
  | 'dangling_ref'
  | 'link_not_present'
  | 'unknown_frontmatter_field';

export type DriftSeverity = 'info' | 'warning';

export interface ArtifactRef {
  readonly type: ArtifactType;
  readonly slug: string;
}

export interface WarningLocation {
  readonly artifactRef?: ArtifactRef;
  readonly field?: string;
  readonly section?: string;
  readonly line?: number;
}

export interface DriftWarning {
  readonly kind: DriftWarningKind;
  readonly severity: DriftSeverity;
  readonly message: string;
  readonly location?: WarningLocation;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface StructuredError {
  readonly code: string;
  readonly message: string;
  readonly location?: WarningLocation;
  readonly details?: Readonly<Record<string, unknown>>;
}
