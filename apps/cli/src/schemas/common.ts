// Shared Zod fragments used by the per-type artifact schemas.
//
// Centralizing these means the slug regex, link-field shape, and
// non-empty-name constraint are defined exactly once — any change to the
// contract lands in one place and propagates to every type.

import { z } from 'zod';

import type { BodyDocument } from './types.js';

/**
 * Slug regex — kebab-case, must start and end with an alphanumeric.
 * Defined by design.md §5 (Slug generation). The same regex governs slugs
 * in link fields so a dangling reference can still be a well-formed slug.
 */
export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export const SlugSchema = z
  .string()
  .min(3, 'slug must be at least 3 characters')
  .max(80, 'slug must be at most 80 characters')
  .regex(SLUG_REGEX, 'slug must match ^[a-z0-9][a-z0-9-]*[a-z0-9]$');

/**
 * Human-readable name — used as the `name` frontmatter field on every type.
 * Non-empty after trim. Zod's `.min(1)` runs on the raw string, so we use a
 * refinement to catch whitespace-only names.
 */
export const NameSchema = z
  .string()
  .min(1, 'name is required')
  .refine((s) => s.trim().length > 0, 'name must not be blank');

/**
 * Typed link field: an array of slugs. Defaults to an empty array when the
 * field is absent from frontmatter, so downstream code never has to
 * distinguish "missing" from "empty".
 *
 * **Incremental formalism — design choice.** Several link fields across the
 * artifact types are *semantically* required (an idea should `addresses` an
 * opportunity, an assumption should be `assumed_by` an idea, an experiment
 * should `tests` an assumption, an opportunity should `support` an
 * objective). These schemas deliberately do **not** enforce non-empty
 * constraints on those fields. Etak embraces incremental formalism: the
 * Opportunity Solution Tree is built up over time and authors are free to
 * sketch a floating artifact today and link it tomorrow as the structure
 * emerges. Hard refusal at parse time would punish the natural mid-flight
 * state of discovery work.
 *
 * The "gap" — a floating artifact with no upstream link — is not silenced;
 * it is surfaced as a **drift signal** by the M1-S5 drift detector, which
 * treats unlinked semantically-required fields as an indicator that the
 * opportunity space needs further exploration rather than as a validation
 * error. See `apps/cli/docs/design.md` §3 (drift handling philosophy) for
 * the full rationale.
 *
 * If you find yourself wanting to add a `.refine()` here to forbid empty
 * arrays, stop and re-read this comment first.
 */
export const LinkArraySchema = z.array(SlugSchema).default([]);

/**
 * Scalar link field: a single slug, or `null`. Used for `target`
 * (critique → any) and `delivered_by` (idea → future spec/PR). The fixtures
 * show both `null` and a real slug, so both are accepted.
 */
export const ScalarLinkSchema = SlugSchema.nullable();

/**
 * Structural BodyDocument validator. Content drift (extra sections, renamed
 * headings, missing required sections) is the parser's job — this layer only
 * asserts that `body` has the right shape so Zod-validated round-trips can
 * carry a BodyDocument alongside validated frontmatter.
 */
export const BodyDocumentSchema = z.custom<BodyDocument>(
  (val) =>
    typeof val === 'object' &&
    val !== null &&
    Array.isArray((val as BodyDocument).sections) &&
    Array.isArray((val as BodyDocument).warnings),
  { message: 'body must be a BodyDocument' },
);
