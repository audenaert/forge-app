// Per-type body templates, copied from design spec §8. Critique has no
// template (body-as-opaque, §8 Critique) and therefore receives an empty
// section list.
//
// TODO(M1-S3 integration): these templates will live alongside the Zod
// schemas in `src/schemas/` once that story lands. Delete this file when
// M1-S3 merges and re-export from the schemas package.

import type { ArtifactType, BodyTemplate } from './types.js';

const OBJECTIVE_TEMPLATE: BodyTemplate = {
  type: 'objective',
  sections: [
    { slug: 'description', name: 'Description', required: true, order: 1 },
    { slug: 'context', name: 'Context', required: false, order: 2 },
    { slug: 'success_criteria', name: 'Success Criteria', required: true, order: 3 },
    { slug: 'out_of_scope', name: 'Out of Scope', required: false, order: 4 },
  ],
};

const OPPORTUNITY_TEMPLATE: BodyTemplate = {
  type: 'opportunity',
  sections: [
    { slug: 'description', name: 'Description', required: true, order: 1 },
    { slug: 'evidence', name: 'Evidence', required: true, order: 2 },
    { slug: 'who_experiences_this', name: 'Who Experiences This', required: false, order: 3 },
  ],
};

const IDEA_TEMPLATE: BodyTemplate = {
  type: 'idea',
  sections: [
    { slug: 'description', name: 'Description', required: true, order: 1 },
    { slug: 'strategic_rationale', name: 'Strategic Rationale', required: false, order: 2 },
    { slug: 'why_this_could_work', name: 'Why This Could Work', required: true, order: 3 },
    { slug: 'open_questions', name: 'Open Questions', required: false, order: 4 },
  ],
};

const ASSUMPTION_TEMPLATE: BodyTemplate = {
  type: 'assumption',
  sections: [
    { slug: 'description', name: 'Description', required: true, order: 1 },
    { slug: 'why_this_matters', name: 'Why This Matters', required: true, order: 2 },
    { slug: 'evidence', name: 'Evidence', required: false, order: 3 },
  ],
};

const EXPERIMENT_TEMPLATE: BodyTemplate = {
  type: 'experiment',
  sections: [
    { slug: 'plan', name: 'Plan', required: true, order: 1 },
    { slug: 'participants', name: 'Participants', required: false, order: 2 },
    { slug: 'protocol', name: 'Protocol', required: false, order: 3 },
    { slug: 'materials', name: 'Materials', required: false, order: 4 },
  ],
};

/**
 * Critique is body-as-opaque (§8 Critique). Template is empty; the parser
 * short-circuits drift detection for this type.
 */
const CRITIQUE_TEMPLATE: BodyTemplate = {
  type: 'critique',
  sections: [],
};

const TEMPLATES: Record<ArtifactType, BodyTemplate> = {
  objective: OBJECTIVE_TEMPLATE,
  opportunity: OPPORTUNITY_TEMPLATE,
  idea: IDEA_TEMPLATE,
  assumption: ASSUMPTION_TEMPLATE,
  experiment: EXPERIMENT_TEMPLATE,
  critique: CRITIQUE_TEMPLATE,
};

export function getBodyTemplate(type: ArtifactType): BodyTemplate {
  return TEMPLATES[type];
}

/** True iff the type has body-as-opaque semantics (critique only in v1). */
export function isOpaqueBody(type: ArtifactType): boolean {
  return type === 'critique';
}
