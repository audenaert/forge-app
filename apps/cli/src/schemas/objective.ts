// Objective — top-level outcome a team is trying to achieve.
//
// Frontmatter: name, type, status (design.md §8, schemas.md §Objective).
// Body template: description, context, success criteria, out of scope.

import { z } from 'zod';

import type { BodyDocument, SectionedBodyTemplate } from './types.js';
import { BodyDocumentSchema, NameSchema } from './common.js';

export const ObjectiveStatusSchema = z.enum([
  'active',
  'paused',
  'achieved',
  'abandoned',
]);

export type ObjectiveStatus = z.infer<typeof ObjectiveStatusSchema>;

/**
 * Objective frontmatter. Unknown fields are passed through — they produce
 * an `unknown_frontmatter_field` drift warning at parse time rather than a
 * hard validation error, consistent with design.md §3.5 drift handling.
 */
export const ObjectiveFrontmatterSchema = z
  .object({
    name: NameSchema,
    type: z.literal('objective'),
    status: ObjectiveStatusSchema,
  })
  .passthrough();

export type ObjectiveFrontmatter = z.infer<typeof ObjectiveFrontmatterSchema>;

/**
 * Known passthrough frontmatter keys. Companion to OPPORTUNITY_KNOWN_EXTRAS
 * in `opportunity.ts` — see that file for the broader rationale. Objective
 * has no known extras today; extend as conventions emerge.
 */
export const OBJECTIVE_KNOWN_EXTRAS = [] as const;

/**
 * Objective body template. Calibrated against
 * `docs/discovery/objectives/grow-etak-via-local-first-plg.md` — Description
 * and Success Criteria are both universally present and mandatory, Context
 * appears on some objectives and not others, and Out of Scope is optional
 * per design.md §8.
 */
export const ObjectiveBodyTemplate: SectionedBodyTemplate = {
  kind: 'sectioned',
  sections: [
    { slug: 'description', name: 'Description', order: 1, required: true },
    { slug: 'context', name: 'Context', order: 2, required: false },
    { slug: 'success_criteria', name: 'Success Criteria', order: 3, required: true },
    { slug: 'out_of_scope', name: 'Out of Scope', order: 4, required: false },
  ],
};

export interface Objective {
  readonly frontmatter: ObjectiveFrontmatter;
  readonly body: BodyDocument;
}

export const ObjectiveSchema = z.object({
  frontmatter: ObjectiveFrontmatterSchema,
  body: BodyDocumentSchema,
});
