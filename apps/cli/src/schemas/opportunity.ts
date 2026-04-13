// Opportunity — HMW-framed question anchored to one or more objectives.
//
// Frontmatter: name, type, status, supports[] (design.md §8, schemas.md §Opportunity).

import { z } from 'zod';

import type { BodyDocument, SectionedBodyTemplate } from './types.js';
import { BodyDocumentSchema, LinkArraySchema, NameSchema } from './common.js';

export const OpportunityStatusSchema = z.enum([
  'active',
  'paused',
  'resolved',
  'abandoned',
]);

export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;

export const OpportunityFrontmatterSchema = z
  .object({
    name: NameSchema,
    type: z.literal('opportunity'),
    status: OpportunityStatusSchema,
    supports: LinkArraySchema,
  })
  .passthrough();

export type OpportunityFrontmatter = z.infer<typeof OpportunityFrontmatterSchema>;

/**
 * Known passthrough frontmatter keys that the M1-S5 drift detector should
 * NOT flag as `unknown_frontmatter_field`. Opportunity carries `hmw` — the
 * canonical "How Might We" question — as a free-form string alongside the
 * typed fields. It is not modeled in the schema (free text, not a slug or
 * enum) but it is expected and well-known. Add to this list whenever a new
 * convention emerges that we want to permit without typing.
 */
export const OPPORTUNITY_KNOWN_EXTRAS = ['hmw'] as const;

/**
 * Opportunity body template. Calibrated against
 * `docs/discovery/opportunities/solo-devs-blocked-by-team-tool-overhead.md`.
 * Description and Evidence are required; "Who Experiences This" appears in
 * the fixture but is modeled optional so opportunities without it don't
 * trigger a missing-required drift warning. "How we learned about it" from
 * `schemas.md` is not present in the fixture — omitted per design.md §8.
 */
export const OpportunityBodyTemplate: SectionedBodyTemplate = {
  kind: 'sectioned',
  sections: [
    { slug: 'description', name: 'Description', order: 1, required: true },
    { slug: 'evidence', name: 'Evidence', order: 2, required: true },
    {
      slug: 'who_experiences_this',
      name: 'Who Experiences This',
      order: 3,
      required: false,
    },
  ],
};

export interface Opportunity {
  readonly frontmatter: OpportunityFrontmatter;
  readonly body: BodyDocument;
}

export const OpportunitySchema = z.object({
  frontmatter: OpportunityFrontmatterSchema,
  body: BodyDocumentSchema,
});
