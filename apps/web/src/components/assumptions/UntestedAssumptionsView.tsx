import { useSuspenseQuery } from '@apollo/client';
import { useNavigate } from '@tanstack/react-router';
import {
  UntestedAssumptionsDocument,
  type UntestedAssumptionsQuery,
  type UntestedAssumptionsQueryVariables,
} from '../../lib/graphql/generated/graphql';
import { DOMAIN_SLUG } from '../../lib/domain';
import { labelForImportance } from '../../lib/enums';
import { ArtifactLink } from '../artifact/ArtifactLink';
import { EmptyState } from '../layout/EmptyState';

/**
 * Valid values for the `importance` search param. `'all'` means the filter
 * is inactive and the query runs without a `minImportance` argument. The
 * three uppercase values map 1:1 onto the GraphQL `AssumptionImportance`
 * enum the API exposes — the server-side comparison is a greater-than-or-
 * equal filter, so `HIGH` returns only HIGH, `MEDIUM` returns HIGH + MEDIUM,
 * etc.
 */
export type ImportanceFilter = 'all' | 'HIGH' | 'MEDIUM' | 'LOW';

const IMPORTANCE_OPTIONS: Array<{ value: ImportanceFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

/**
 * Maps the UI filter value onto the `minImportance` GraphQL argument.
 * `'all'` becomes `undefined` so the field is omitted from the variables
 * object entirely — the API treats that as "no importance floor".
 */
export function filterToMinImportance(
  filter: ImportanceFilter,
): string | undefined {
  return filter === 'all' ? undefined : filter;
}

/**
 * Copy for the filter-aware empty state. Each filter has its own
 * encouragement: zero HIGH-importance untested assumptions is a good
 * thing, zero total is a different thing.
 */
function emptyStateCopy(filter: ImportanceFilter): {
  title: string;
  description: string;
} {
  switch (filter) {
    case 'HIGH':
      return {
        title: 'No HIGH-importance untested assumptions — nice work.',
        description:
          'Every high-stakes assumption in this domain has been validated or invalidated.',
      };
    case 'MEDIUM':
      return {
        title: 'No MEDIUM-or-higher untested assumptions remain.',
        description:
          'All assumptions at medium importance or above have been tested.',
      };
    case 'LOW':
      return {
        title: 'No untested assumptions at LOW importance or above.',
        description:
          'Every tracked assumption in this domain has been tested.',
      };
    case 'all':
      return {
        title: 'No untested assumptions',
        description:
          'This domain has no untested assumptions. Add one from an idea page, or run the seed script for a populated demo.',
      };
  }
}

interface UntestedAssumptionsViewProps {
  /**
   * Current filter value. Source of truth is the URL search param — the
   * route component reads it via `useSearch` and passes it in, which keeps
   * this component a pure view on the URL state.
   */
  filter: ImportanceFilter;
}

/**
 * `/assumptions` — filterable list of untested assumptions, each rendered
 * with its parent-idea context. The query is warmed by the route loader
 * (see `router.tsx`), so `useSuspenseQuery` reads the already-cached value
 * synchronously on the initial render and only suspends on filter changes
 * that have never been fetched before.
 *
 * Layout: a filter control at the top, then a semantic `<ul>` of rows.
 * Each row carries an ArtifactLink to the assumption, an importance badge
 * (text + border, not color-only), the evidence label, the assumption
 * body if present, and an ArtifactLink to the parent idea. When no parent
 * idea is attached, the row renders a short tertiary-text marker instead
 * of a dangling link.
 */
export function UntestedAssumptionsView({
  filter,
}: UntestedAssumptionsViewProps) {
  const navigate = useNavigate();
  const { data } = useSuspenseQuery<
    UntestedAssumptionsQuery,
    UntestedAssumptionsQueryVariables
  >(UntestedAssumptionsDocument, {
    variables: {
      domainSlug: DOMAIN_SLUG,
      minImportance: filterToMinImportance(filter),
    },
  });

  const assumptions = data.untestedAssumptions;

  const handleFilterChange = (next: ImportanceFilter) => {
    navigate({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to: '/assumptions' as any,
      search: (next === 'all' ? {} : { importance: next }) as never,
      replace: true,
    });
  };

  return (
    <div
      data-testid="untested-assumptions-view"
      className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10"
    >
      <header className="flex flex-col gap-2">
        <h1
          className="text-2xl"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Untested assumptions
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          What don&apos;t we know yet, and how important is it? Filter by
          importance to focus on the highest-stakes open questions.
        </p>
      </header>

      <ImportanceFilterControl
        value={filter}
        onChange={handleFilterChange}
      />

      {assumptions.length === 0 ? (
        (() => {
          const copy = emptyStateCopy(filter);
          return (
            <EmptyState title={copy.title} description={<p>{copy.description}</p>} />
          );
        })()
      ) : (
        <ul
          data-testid="untested-assumptions-list"
          className="flex flex-col"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          {assumptions.map((assumption) => (
            <li
              key={assumption.id}
              data-testid={`assumption-row-${assumption.id}`}
              className="flex flex-col gap-2 py-4"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <ArtifactLink
                  type="assumption"
                  id={assumption.id}
                  name={assumption.name}
                  status={assumption.status}
                />
                <ImportanceBadge importance={assumption.importance} />
              </div>
              <div
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--text-tertiary)' }}>Evidence: </span>
                <span>{labelForImportance(assumption.evidence)}</span>
              </div>
              {assumption.body && (
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {assumption.body}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs">
                <span style={{ color: 'var(--text-tertiary)' }}>
                  Parent idea:
                </span>
                {assumption.parentIdea ? (
                  <ArtifactLink
                    type="idea"
                    id={assumption.parentIdea.id}
                    name={assumption.parentIdea.name}
                    status={assumption.parentIdea.status}
                  />
                ) : (
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    (unrooted)
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ImportanceFilterControlProps {
  value: ImportanceFilter;
  onChange: (next: ImportanceFilter) => void;
}

/**
 * Segmented-button filter control. Rendered as a `role="radiogroup"` of
 * real `<button>` elements (not radio inputs — the buttons act like tabs,
 * triggering navigation rather than form submission). Each option carries
 * `aria-pressed` so screen readers announce the toggled state, and the
 * visual selection uses both a background tint and a visible border so
 * the signal isn't color-alone.
 */
function ImportanceFilterControl({
  value,
  onChange,
}: ImportanceFilterControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter by importance"
      className="flex flex-wrap items-center gap-2"
    >
      <span
        className="text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Importance:
      </span>
      {IMPORTANCE_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            data-testid={`importance-filter-${option.value}`}
            onClick={() => onChange(option.value)}
            className="rounded-sm border px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2"
            style={{
              color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: selected
                ? 'var(--border-focus)'
                : 'var(--border-default)',
              backgroundColor: selected
                ? 'var(--color-surface-raised)'
                : 'transparent',
              fontWeight: selected ? 600 : 400,
              ['--tw-ring-color' as never]: 'var(--border-focus)',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Importance badge for a row. Renders the human-readable label inside a
 * bordered pill; color is never the sole carrier — the label text itself
 * is always present. Kept local to this module because the visual
 * treatment is specific to this list (tighter than the generic status
 * badge in ArtifactLink).
 */
function ImportanceBadge({ importance }: { importance: string }) {
  const label = labelForImportance(importance);
  return (
    <span
      data-testid="importance-badge"
      data-importance={importance}
      className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs"
      style={{
        borderColor: 'var(--border-default)',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--color-surface-raised)',
      }}
    >
      {label}
    </span>
  );
}
