// Idea — a proposed solution addressing one or more opportunities.

import { z } from 'zod';

import type { BodyDocument, SectionedBodyTemplate } from './types.js';
import { BodyDocumentSchema, LinkArraySchema, NameSchema } from './common.js';

export const IdeaStatusSchema = z.enum([
  'draft',
  'exploring',
  'validated',
  'ready_for_build',
  'building',
  'shipped',
]);

export type IdeaStatus = z.infer<typeof IdeaStatusSchema>;

/**
 * Idea frontmatter. `delivered_by` is an array link field: an idea may be
 * delivered by multiple stories or tasks, and that traceability is key for
 * tracking back from implementations to business requirements. Defaults to
 * an empty array per the incremental-formalism design choice documented on
 * `LinkArraySchema` in `common.ts` — an unlinked idea is a drift signal,
 * not a parse error.
 */
export const IdeaFrontmatterSchema = z
  .object({
    name: NameSchema,
    type: z.literal('idea'),
    status: IdeaStatusSchema,
    addresses: LinkArraySchema,
    delivered_by: LinkArraySchema,
  })
  .passthrough();

export type IdeaFrontmatter = z.infer<typeof IdeaFrontmatterSchema>;

/**
 * Known passthrough frontmatter keys. Companion to OPPORTUNITY_KNOWN_EXTRAS
 * in `opportunity.ts` — see that file for the broader rationale. Idea has
 * no known extras today; extend as conventions emerge.
 */
export const IDEA_KNOWN_EXTRAS = [] as const;

/**
 * Idea body template. Calibrated against `etak-cli-as-growth-onramp.md` and
 * `graph-backed-artifact-store.md`. "Strategic Rationale" is present in the
 * first and absent in the second, so it is modeled optional — both fixtures
 * must round-trip cleanly without a missing-required warning.
 *
 * "Why This Could Work" is the canonical heading name from design.md §8;
 * authors who write "How It Works" or similar will hit the `section_renamed`
 * drift path rather than a hard failure.
 */
export const IdeaBodyTemplate: SectionedBodyTemplate = {
  kind: 'sectioned',
  sections: [
    { slug: 'description', name: 'Description', order: 1, required: true },
    {
      slug: 'strategic_rationale',
      name: 'Strategic Rationale',
      order: 2,
      required: false,
    },
    {
      slug: 'why_this_could_work',
      name: 'Why This Could Work',
      order: 3,
      required: true,
    },
    { slug: 'open_questions', name: 'Open Questions', order: 4, required: false },
  ],
};

export interface Idea {
  readonly frontmatter: IdeaFrontmatter;
  readonly body: BodyDocument;
}

export const IdeaSchema = z.object({
  frontmatter: IdeaFrontmatterSchema,
  body: BodyDocumentSchema,
});
