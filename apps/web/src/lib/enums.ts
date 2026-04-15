/**
 * Human-readable labels for GraphQL enum values surfaced in the UI.
 *
 * The API emits SCREAMING_SNAKE_CASE enum values (e.g. `READY_FOR_BUILD`,
 * `FAKE_DOOR`). Rendering them raw is unfriendly and design-review fails on
 * it. Every enum that shows up in a visible surface — a status badge, a
 * metadata field, a filter — passes through one of these lookups first.
 *
 * Adding a new enum: create a const lookup keyed by literal values and add a
 * typed accessor below. The accessor falls back to a title-cased version of
 * the raw key so a newly-added API enum is never rendered as raw upper case —
 * it just renders in a readable form until someone writes a nicer label.
 */

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

const OBJECTIVE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ACHIEVED: 'Achieved',
  ABANDONED: 'Abandoned',
};

const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  RESOLVED: 'Resolved',
  ABANDONED: 'Abandoned',
};

const IDEA_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  EXPLORING: 'Exploring',
  VALIDATED: 'Validated',
  READY_FOR_BUILD: 'Ready for Build',
  BUILDING: 'Building',
  SHIPPED: 'Shipped',
};

const ASSUMPTION_STATUS_LABELS: Record<string, string> = {
  UNTESTED: 'Untested',
  VALIDATED: 'Validated',
  INVALIDATED: 'Invalidated',
};

const ASSUMPTION_IMPORTANCE_LABELS: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const ASSUMPTION_EVIDENCE_LABELS: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const EXPERIMENT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planned',
  RUNNING: 'Running',
  COMPLETE: 'Complete',
};

const EXPERIMENT_METHOD_LABELS: Record<string, string> = {
  USER_INTERVIEW: 'User Interview',
  PROTOTYPE_TEST: 'Prototype Test',
  FAKE_DOOR: 'Fake Door',
  CONCIERGE_MVP: 'Concierge MVP',
  DATA_ANALYSIS: 'Data Analysis',
  AB_TEST: 'A/B Test',
  SURVEY: 'Survey',
};

const EXPERIMENT_RESULT_LABELS: Record<string, string> = {
  VALIDATED: 'Validated',
  INVALIDATED: 'Invalidated',
  INCONCLUSIVE: 'Inconclusive',
};

const EFFORT_LEVEL_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

/**
 * Every artifact type has a `status` enum; the set of valid values differs
 * per type but they all render through the same UI primitive. `labelForStatus`
 * takes the artifact type as the discriminator so the right lookup is used.
 */
export type ArtifactType =
  | 'objective'
  | 'opportunity'
  | 'idea'
  | 'assumption'
  | 'experiment';

export function labelForStatus(type: ArtifactType, value: string | null | undefined): string {
  if (!value) return '';
  const lookup =
    type === 'objective'
      ? OBJECTIVE_STATUS_LABELS
      : type === 'opportunity'
        ? OPPORTUNITY_STATUS_LABELS
        : type === 'idea'
          ? IDEA_STATUS_LABELS
          : type === 'assumption'
            ? ASSUMPTION_STATUS_LABELS
            : EXPERIMENT_STATUS_LABELS;
  return lookup[value] ?? humanize(value);
}

export function labelForImportance(value: string | null | undefined): string {
  if (!value) return '';
  return ASSUMPTION_IMPORTANCE_LABELS[value] ?? humanize(value);
}

export function labelForEvidence(value: string | null | undefined): string {
  if (!value) return '';
  return ASSUMPTION_EVIDENCE_LABELS[value] ?? humanize(value);
}

export function labelForExperimentMethod(value: string | null | undefined): string {
  if (!value) return '';
  return EXPERIMENT_METHOD_LABELS[value] ?? humanize(value);
}

export function labelForExperimentResult(value: string | null | undefined): string {
  if (!value) return '';
  return EXPERIMENT_RESULT_LABELS[value] ?? humanize(value);
}

export function labelForEffort(value: string | null | undefined): string {
  if (!value) return '';
  return EFFORT_LEVEL_LABELS[value] ?? humanize(value);
}

/**
 * Display label for an artifact type. Used in ArtifactLink's accessible name
 * ("Idea: Graph-backed artifact store, status Building") and anywhere else
 * the type needs to be visible to the user.
 */
const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  objective: 'Objective',
  opportunity: 'Opportunity',
  idea: 'Idea',
  assumption: 'Assumption',
  experiment: 'Experiment',
};

export function labelForArtifactType(type: ArtifactType): string {
  return ARTIFACT_TYPE_LABELS[type];
}
