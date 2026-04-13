// Critique — point-in-time record of an adversarial stress-test session.
//
// Intentional deviation from the per-type body-template pattern. Critique
// bodies are narrative and have no recurring canonical shape, so the drift
// detector skips them entirely and `--section` updates are disabled. See
// design.md §8 "Critique — body-as-opaque (intentional deviation)".
//
// Critique has no `status` field (schemas.md §Status Values Summary).

import { z } from 'zod';

import type { BodyDocument, OpaqueBodyTemplate } from './types.js';
import { BodyDocumentSchema, NameSchema, SlugSchema } from './common.js';

/**
 * `target` is a scalar link — required, non-null. A critique with no target
 * is meaningless; if a free-standing critique is ever needed, the author
 * should create the target artifact first and then point at it.
 */
export const CritiqueFrontmatterSchema = z
  .object({
    name: NameSchema,
    type: z.literal('critique'),
    target: SlugSchema,
    personas_used: z.array(z.string().min(1)).default([]),
    frameworks_used: z.array(z.string().min(1)).default([]),
    date: z.string().min(1),
    artifacts_created: z.array(SlugSchema).default([]),
  })
  .passthrough();

export type CritiqueFrontmatter = z.infer<typeof CritiqueFrontmatterSchema>;

/**
 * Known passthrough frontmatter keys. Companion to OPPORTUNITY_KNOWN_EXTRAS
 * in `opportunity.ts` — see that file for the broader rationale. Critique
 * has no known extras today; extend as conventions emerge.
 */
export const CRITIQUE_KNOWN_EXTRAS = [] as const;

/**
 * Critique body template — **opaque**, not sectioned. Declared explicitly
 * so consumers can branch on `kind` rather than checking for the presence
 * of a template. The parser still produces a `BodyDocument` for uniformity,
 * but every section is implicitly `status: "extra"` and no drift warnings
 * are emitted (design.md §8).
 */
export const CritiqueBodyTemplate: OpaqueBodyTemplate = {
  kind: 'opaque',
};

export interface Critique {
  readonly frontmatter: CritiqueFrontmatter;
  readonly body: BodyDocument;
}

export const CritiqueSchema = z.object({
  frontmatter: CritiqueFrontmatterSchema,
  body: BodyDocumentSchema,
});
