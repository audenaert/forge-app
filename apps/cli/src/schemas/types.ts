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
 * section is not in the template at all (design.md §3.5).
 */
export type BodySectionStatus = 'canonical' | 'extra' | 'renamed';

/**
 * One section as it appeared in the source document, after parsing. `nodes`
 * holds the mdast child nodes for the section and is typed as `unknown[]`
 * here because the parser is not yet implemented — M1-S4 will tighten this
 * to an mdast node type once the remark dependency lands.
 */
export interface BodySection {
  readonly heading: string;
  readonly slug: string;
  readonly status: BodySectionStatus;
  readonly canonicalOrder?: number;
  readonly nodes: readonly unknown[];
}

/**
 * Parsed body of an artifact. `sections` is in the order they appeared in
 * the source (round-trip preservation — design.md §3.5), not canonical order.
 * `warnings` carries any drift detected during parsing.
 */
export interface BodyDocument {
  readonly sections: readonly BodySection[];
  readonly warnings: readonly DriftWarning[];
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
