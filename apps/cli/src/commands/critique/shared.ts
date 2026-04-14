// Local helpers for the `etak critique` command group.
//
// These stay module-private (not in `commands/shared.ts`) per the M2
// extract pass 1 rule: extract only character-identical duplicates. The
// opaque-body scaffold and "today" helpers are currently unique to
// critique; if opportunity or a future type needs them, extract pass 2
// will lift them.

import type { BodyDocument, DriftWarning } from '../../schemas/types.js';

/**
 * Placeholder for a scaffolded critique body. Critique bodies are opaque
 * (no section template), so a single preamble-style section carries the
 * entire body content. We reuse the `extra` status value the parser
 * assigns to freshly-read opaque bodies (see parser.ts §opaque branch) so
 * a round-trip of a freshly-scaffolded critique looks identical to a
 * round-trip of a user-authored one.
 */
export const OPAQUE_BODY_PLACEHOLDER = '_TODO: write critique content_' as const;

/**
 * Build an opaque `BodyDocument` for a critique scaffold.
 *
 * This is the opaque counterpart to `scaffoldCanonicalBody` in
 * `commands/shared.ts`. Kept local to critique because:
 *   1. Only critique has an `OpaqueBodyTemplate` today.
 *   2. `scaffoldCanonicalBody`'s signature takes `SectionedBodyTemplate`
 *      explicitly — critique cannot call it without an unsafe cast, and
 *      that's intentional per extract pass 1's brief.
 *
 * The section shape (`heading: ''`, `slug: 'body'`, `status: 'extra'`)
 * matches what the parser emits for opaque bodies, so a round-trip
 * through the adapter is stable.
 */
export function scaffoldOpaqueBody(): BodyDocument {
  return {
    sections: [
      {
        heading: '',
        slug: 'body',
        status: 'extra' as const,
        content: OPAQUE_BODY_PLACEHOLDER,
      },
    ],
    warnings: [] as DriftWarning[],
  };
}

/**
 * Today's date in `YYYY-MM-DD` (UTC). Critique frontmatter requires a
 * `date` field (schemas/critique.ts), stamped at creation time. Extracted
 * as a helper so tests can stub it if they ever need deterministic dates.
 */
export function todayIsoDate(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
