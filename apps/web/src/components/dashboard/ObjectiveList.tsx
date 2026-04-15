import { Link } from '@tanstack/react-router';
import type { ObjectivesWithOpportunitiesQuery } from '../../lib/graphql/generated/graphql';
import { ArtifactLink } from '../artifact/ArtifactLink';
import { labelForStatus } from '../../lib/enums';

type Objective = ObjectivesWithOpportunitiesQuery['objectives'][number];

// CSS custom property passthrough for the focus ring color. React's
// CSSProperties type allows custom-property keys only when cast through a
// loose index; keeping the cast local (and shared within the module) keeps
// the rest of the file strict and avoids inline `@ts-expect-error` noise.
const objectiveLinkStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  ['--tw-ring-color' as string]: 'var(--border-focus)',
} as React.CSSProperties;

const viewTreeLinkStyle: React.CSSProperties = {
  color: 'var(--text-tertiary)',
  ['--tw-ring-color' as string]: 'var(--border-focus)',
} as React.CSSProperties;

interface ObjectiveListProps {
  objectives: readonly Objective[];
}

/**
 * Renders objectives as gravitational anchors, each with its supporting
 * opportunities nested beneath. Per the spec:
 *   - Objective name is the dominant typographic anchor and links to the
 *     objective's artifact page (`/objective/:id`).
 *   - A secondary "View tree" link next to the name routes to
 *     `/tree/objective/:id` — the tree projection is one valid way to
 *     explore the objective, the artifact page is the primary one.
 *   - Each supporting opportunity renders via `<ArtifactLink>` so the
 *     type icon + name + status badge are consistent everywhere.
 *
 * When an objective has no supporting opportunities the list still shows
 * a short "No supporting opportunities yet" line so the affordance is
 * discoverable — hiding it would leave a silent gap.
 */
export function ObjectiveList({ objectives }: ObjectiveListProps) {
  if (objectives.length === 0) {
    return (
      <section aria-labelledby="objectives-heading" className="px-8 py-6">
        <h2
          id="objectives-heading"
          className="text-lg"
          style={{ color: 'var(--text-primary)', fontWeight: 600 }}
        >
          Objectives
        </h2>
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          No objectives yet.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="objectives-heading" className="px-8 py-6">
      <h2
        id="objectives-heading"
        className="text-lg"
        style={{ color: 'var(--text-primary)', fontWeight: 600 }}
      >
        Objectives
      </h2>
      <ul className="mt-4 flex flex-col gap-6">
        {objectives.map((objective) => (
          <ObjectiveRow key={objective.id} objective={objective} />
        ))}
      </ul>
    </section>
  );
}

function ObjectiveRow({ objective }: { objective: Objective }) {
  const statusLabel = labelForStatus('objective', objective.status);
  return (
    <li>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {/* Objective name — heaviest weight, links to artifact page. */}
        <Link
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to={`/objective/${encodeURIComponent(objective.id)}` as any}
          data-testid={`objective-link-${objective.id}`}
          className="text-base underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2"
          style={objectiveLinkStyle}
        >
          {objective.name}
        </Link>
        {statusLabel && (
          <span
            data-testid={`objective-status-${objective.id}`}
            className="rounded-sm border px-1.5 py-0.5 text-xs"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--color-surface-raised)',
            }}
          >
            {statusLabel}
          </span>
        )}
        {/* Secondary "View tree" affordance — small, offset, explicit. */}
        <Link
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to={`/tree/objective/${encodeURIComponent(objective.id)}` as any}
          data-testid={`objective-view-tree-${objective.id}`}
          aria-label={`View tree for ${objective.name}`}
          className="text-xs underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2"
          style={viewTreeLinkStyle}
        >
          View tree
        </Link>
      </div>

      {/* Supporting opportunities — lighter gravitational weight. */}
      {objective.supportedBy.length > 0 ? (
        <ul className="mt-2 ml-4 flex flex-col gap-1">
          {objective.supportedBy.map((opp) => (
            <li key={opp.id}>
              <ArtifactLink
                type="opportunity"
                id={opp.id}
                name={opp.name}
                status={opp.status}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p
          className="mt-2 ml-4 text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          No supporting opportunities yet.
        </p>
      )}
    </li>
  );
}
