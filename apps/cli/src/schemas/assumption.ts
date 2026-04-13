// Assumption — a belief an idea depends on, with importance and evidence.
//
// @provisional — seeded from schemas.md; no live fixture in `docs/discovery/`
// yet. Recalibration against the first real assumption is tracked as an M3
// chore (see design.md §8 "Provisional templates"). M3-S5 greps for the
// `@provisional` JSDoc tag on `AssumptionBodyTemplate` below.

import { z } from 'zod';

import type { BodyDocument, SectionedBodyTemplate } from './types.js';
import { BodyDocumentSchema, LinkArraySchema, NameSchema } from './common.js';

export const AssumptionStatusSchema = z.enum([
  'untested',
  'validated',
  'invalidated',
]);

export type AssumptionStatus = z.infer<typeof AssumptionStatusSchema>;

/**
 * `importance` answers "if this is wrong, does the idea fail?" and
 * `evidence` answers "how much do we actually know?" — both from
 * `schemas.md` §Assumption, both required.
 */
export const ImportanceLevelSchema = z.enum(['high', 'medium', 'low']);
export const EvidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export const AssumptionFrontmatterSchema = z
  .object({
    name: NameSchema,
    type: z.literal('assumption'),
    status: AssumptionStatusSchema,
    importance: ImportanceLevelSchema,
    evidence: EvidenceLevelSchema,
    assumed_by: LinkArraySchema,
  })
  .passthrough();

export type AssumptionFrontmatter = z.infer<typeof AssumptionFrontmatterSchema>;

/**
 * Assumption body template.
 *
 * @provisional Seeded from schemas.md; no live fixture exists in
 * `docs/discovery/assumptions/` that matches this section shape yet. M3-S5
 * (assumption/experiment/critique recalibration) will confirm or adjust the
 * section set against the first real-world assumption.
 */
export const AssumptionBodyTemplate: SectionedBodyTemplate = {
  kind: 'sectioned',
  sections: [
    { slug: 'description', name: 'Description', order: 1, required: true },
    {
      slug: 'why_this_matters',
      name: 'Why This Matters',
      order: 2,
      required: true,
    },
    { slug: 'evidence', name: 'Evidence', order: 3, required: false },
  ],
};

export interface Assumption {
  readonly frontmatter: AssumptionFrontmatter;
  readonly body: BodyDocument;
}

export const AssumptionSchema = z.object({
  frontmatter: AssumptionFrontmatterSchema,
  body: BodyDocumentSchema,
});
