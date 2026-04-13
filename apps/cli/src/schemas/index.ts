// Public entry point for @etak/cli schemas.
//
// Consumers import from here (or `../schemas` internally) and never reach
// into the per-type files. This lets the internal layout evolve without
// breaking downstream code.

export * from './types.js';
export * from './common.js';

export * from './objective.js';
export * from './opportunity.js';
export * from './idea.js';
export * from './assumption.js';
export * from './experiment.js';
export * from './critique.js';

// Convenience map of per-type body templates, keyed by artifact type. Used
// by the parser (M1-S4) and drift detector (M1-S5) to look up the template
// for a given artifact without importing every type module individually.
import type { ArtifactType, BodyTemplate } from './types.js';
import { ObjectiveBodyTemplate } from './objective.js';
import { OpportunityBodyTemplate } from './opportunity.js';
import { IdeaBodyTemplate } from './idea.js';
import { AssumptionBodyTemplate } from './assumption.js';
import { ExperimentBodyTemplate } from './experiment.js';
import { CritiqueBodyTemplate } from './critique.js';

export const BODY_TEMPLATES: Readonly<Record<ArtifactType, BodyTemplate>> = {
  objective: ObjectiveBodyTemplate,
  opportunity: OpportunityBodyTemplate,
  idea: IdeaBodyTemplate,
  assumption: AssumptionBodyTemplate,
  experiment: ExperimentBodyTemplate,
  critique: CritiqueBodyTemplate,
};
