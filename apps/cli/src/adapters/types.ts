// Local type declarations for the storage adapter interface.
//
// TODO(M1-S3 integration): these types mirror the shapes that story M1-S3
// will export from `src/schemas/`. Once M1-S3 lands, the follow-up PR should
// delete the duplicated declarations here and re-export from `src/schemas`
// so the two branches unify on a single source of truth. Until then, every
// module under `src/adapters` imports from this file.

/** The six discovery artifact types in v1. */
export type ArtifactType =
  | 'objective'
  | 'opportunity'
  | 'idea'
  | 'assumption'
  | 'experiment'
  | 'critique';

export const ARTIFACT_TYPES: readonly ArtifactType[] = [
  'objective',
  'opportunity',
  'idea',
  'assumption',
  'experiment',
  'critique',
];

/** Kebab-case slug. Real validation lives in the schemas package (M1-S3). */
export type Slug = string;

/** A type-qualified reference to an artifact. */
export interface ArtifactRef {
  type: ArtifactType;
  slug: Slug;
}

/** One section definition in a per-type body template. */
export interface BodySectionTemplate {
  /** Canonical H2 heading text, e.g. "Open Questions". */
  name: string;
  /** Machine-safe key, e.g. "open_questions". */
  slug: string;
  /** Template section required on a valid document. */
  required: boolean;
  /** 1-based canonical position. */
  order: number;
}

/** A per-type body template. Critique templates carry an empty section list. */
export interface BodyTemplate {
  type: ArtifactType;
  sections: BodySectionTemplate[];
}

/**
 * One authored section inside a parsed body.
 *
 * `status` distinguishes canonical template sections, author-added extras,
 * and sections whose heading differs from the template (renamed).
 */
export interface BodySection {
  /** Heading text as authored (case and spacing preserved). */
  heading: string;
  /**
   * Matched template slug, or a slug derived from the heading if the section
   * is an extra or renamed from the canonical set.
   */
  slug: string;
  status: 'canonical' | 'extra' | 'renamed';
  /** Canonical template order, set when `status === "canonical"`. */
  canonicalOrder?: number;
  /**
   * Raw markdown content of the section body (everything after the heading
   * up to the next H2 or EOF). Preserved verbatim from the source for
   * round-trip fidelity.
   */
  content: string;
}

/**
 * The parsed body of an artifact: an ordered list of sections in the order
 * they appeared in the source, plus any drift warnings the parser produced
 * while matching against the template.
 */
export interface BodyDocument {
  sections: BodySection[];
  warnings: DriftWarning[];
}

/**
 * Structured warning kinds recognized by the v1 adapter surface. See design
 * spec §3.5 and §3.6.
 */
export type DriftWarningKind =
  | 'extra_section'
  | 'section_reordered'
  | 'missing_required_section'
  | 'section_renamed'
  | 'dangling_ref'
  | 'link_not_present'
  | 'unknown_frontmatter_field';

export interface DriftLocation {
  artifactRef?: ArtifactRef;
  section?: string;
  line?: number;
}

export interface DriftWarning {
  kind: DriftWarningKind;
  severity: 'info' | 'warning';
  message: string;
  location?: DriftLocation;
  details?: Record<string, unknown>;
}

/**
 * Structured error shape the CLI envelope renders. Error classes in
 * `errors.ts` subclass a common base that carries one of these as payload.
 */
export interface StructuredError {
  code: string;
  message: string;
  location?: DriftLocation;
  details?: Record<string, unknown>;
}

/**
 * Generic frontmatter for an artifact. v1's adapter layer treats frontmatter
 * as a typed record so it can preserve field order without imposing a
 * per-type union here — M1-S3 will supply the real discriminated union of
 * per-type frontmatter once it lands.
 */
export interface ArtifactFrontmatter {
  name: string;
  type: ArtifactType;
  status?: string;
  // Link fields and other scalars are carried as-is; the adapter does not
  // validate them (that is the schema layer's job in M1-S3).
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
