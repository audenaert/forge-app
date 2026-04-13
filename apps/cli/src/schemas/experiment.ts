// Experiment — a designed test of one or more assumptions.
//
// @provisional — seeded from schemas.md; no live fixture in `docs/discovery/`
// yet. Much of the experiment shape lives in frontmatter (method,
// success_criteria, interpretation_guide, action_plan) so the body template
// is deliberately lean. Recalibration tracked as an M3 chore story.

import { z } from 'zod';

import type { BodyDocument, SectionedBodyTemplate } from './types.js';
import { BodyDocumentSchema, LinkArraySchema, NameSchema } from './common.js';

export const ExperimentStatusSchema = z.enum([
  'planned',
  'running',
  'complete',
]);

export type ExperimentStatus = z.infer<typeof ExperimentStatusSchema>;

export const ExperimentMethodSchema = z.enum([
  'user_interview',
  'prototype_test',
  'fake_door',
  'concierge_mvp',
  'data_analysis',
  'ab_test',
  'survey',
]);

export const ExperimentEffortSchema = z.enum(['low', 'medium', 'high']);

export const ExperimentResultSchema = z
  .enum(['validated', 'invalidated', 'inconclusive'])
  .nullable();

/**
 * Structured action plan per schemas.md §Experiment. All three branches are
 * required strings so experiments commit to a plan on every outcome — this
 * is the whole point of the interpretation-guide pattern.
 */
export const ExperimentActionPlanSchema = z.object({
  if_validated: z.string().min(1),
  if_invalidated: z.string().min(1),
  if_inconclusive: z.string().min(1),
});

export const ExperimentFrontmatterSchema = z
  .object({
    name: NameSchema,
    type: z.literal('experiment'),
    status: ExperimentStatusSchema,
    tests: LinkArraySchema,
    result_informs: LinkArraySchema.optional(),
    method: ExperimentMethodSchema,
    success_criteria: z.string().min(1),
    duration: z.string().min(1),
    effort: ExperimentEffortSchema,
    result: ExperimentResultSchema.optional(),
    learnings: z.string().optional(),
    interpretation_guide: z.string().optional(),
    action_plan: ExperimentActionPlanSchema.optional(),
  })
  .passthrough();

export type ExperimentFrontmatter = z.infer<typeof ExperimentFrontmatterSchema>;

/**
 * Known passthrough frontmatter keys. Companion to OPPORTUNITY_KNOWN_EXTRAS
 * in `opportunity.ts` — see that file for the broader rationale. Experiment
 * has no known extras today; extend as conventions emerge.
 */
export const EXPERIMENT_KNOWN_EXTRAS = [] as const;

/**
 * Experiment body template.
 *
 * @provisional Seeded from schemas.md; no live experiment fixture exists
 * yet. M3-S5 will recalibrate against real experiments authored in-repo.
 */
export const ExperimentBodyTemplate: SectionedBodyTemplate = {
  kind: 'sectioned',
  sections: [
    { slug: 'plan', name: 'Plan', order: 1, required: true },
    { slug: 'participants', name: 'Participants', order: 2, required: false },
    { slug: 'protocol', name: 'Protocol', order: 3, required: false },
    { slug: 'materials', name: 'Materials', order: 4, required: false },
  ],
};

export interface Experiment {
  readonly frontmatter: ExperimentFrontmatter;
  readonly body: BodyDocument;
}

export const ExperimentSchema = z.object({
  frontmatter: ExperimentFrontmatterSchema,
  body: BodyDocumentSchema,
});
