import { Link } from '@tanstack/react-router';
import type { DiscoveryHealthQuery } from '../../lib/graphql/generated/graphql';

type Health = NonNullable<DiscoveryHealthQuery['discoveryHealth']>;

interface HealthBarProps {
  health: Health;
  /**
   * Counts of in-dashboard orphan lists. The health bar's orphan warning
   * indicators scroll to these sections, so the counts here are the
   * authoritative numbers to surface to the user — they line up with the
   * length of each orphan list rendered below the objective list.
   */
  orphanOpportunityCount: number;
  unrootedIdeaCount: number;
}

/**
 * Compact summary ribbon communicating the shape of the discovery space.
 * Two rows:
 *   - Row 1: five artifact-type counts (objectives, opportunities, ideas,
 *     assumptions, experiments).
 *   - Row 2: warning indicators rendered with the `--sand` background
 *     tint (warm attention, not red alarm). Each is a keyboard-activatable
 *     link; clicking scrolls the dashboard to the relevant orphan section
 *     (for orphaned opportunities / unrooted ideas) or navigates to
 *     `/assumptions` for the untested-assumptions warning.
 *
 * Warnings never use color alone — each has a visible text label and an
 * icon-style prefix. The `--sand` tint is a visual emphasis on top of that,
 * not the sole signal.
 */
export function HealthBar({
  health,
  orphanOpportunityCount,
  unrootedIdeaCount,
}: HealthBarProps) {
  const counts: Array<{ label: string; value: number }> = [
    { label: 'Objectives', value: health.totalObjectives },
    { label: 'Opportunities', value: health.totalOpportunities },
    { label: 'Ideas', value: health.totalIdeas },
    { label: 'Assumptions', value: health.totalAssumptions },
    { label: 'Experiments', value: health.totalExperiments },
  ];

  return (
    <section
      aria-label="Discovery health"
      className="flex flex-col gap-3 px-8 py-6"
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      <nav aria-label="Discovery counts">
        <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
          {counts.map((c) => (
            <li key={c.label} className="flex items-baseline gap-2">
              <span style={{ color: 'var(--text-secondary)' }}>{c.label}:</span>
              <span
                data-testid={`health-count-${c.label.toLowerCase()}`}
                className="text-base"
                style={{ color: 'var(--text-primary)', fontWeight: 600 }}
              >
                {c.value}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Discovery warnings" className="flex flex-wrap gap-2">
        {health.untestedHighImportanceAssumptions > 0 && (
          <AssumptionsWarning
            count={health.untestedHighImportanceAssumptions}
          />
        )}
        {health.ideasWithNoAssumptions > 0 && (
          <IdeasNoAssumptionsWarning
            count={health.ideasWithNoAssumptions}
          />
        )}
        {orphanOpportunityCount > 0 && (
          <ScrollWarning
            targetId="orphan-opportunities"
            count={orphanOpportunityCount}
            label="orphaned opportunities"
            testId="warning-orphan-opportunities"
          />
        )}
        {unrootedIdeaCount > 0 && (
          <ScrollWarning
            targetId="orphan-ideas"
            count={unrootedIdeaCount}
            label="unrooted ideas"
            testId="warning-unrooted-ideas"
          />
        )}
      </nav>
    </section>
  );
}

/**
 * Warm-attention pill with the `--sand` background tint. Shared base for
 * both in-page scroll warnings and the cross-route assumptions warning;
 * the prefix glyph (`!`) plus the text label ensure the signal does not
 * depend on color.
 */
const warningPillClass =
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2';

// CSS custom property passthrough for the focus ring color. React's
// CSSProperties type allows custom-property keys when cast through a loose
// index; keeping the cast local keeps the rest of the module strict.
const warningPillStyle: React.CSSProperties = {
  backgroundColor: 'var(--sand)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
  ['--tw-ring-color' as string]: 'var(--border-focus)',
} as React.CSSProperties;

function WarningGlyph() {
  return (
    <span aria-hidden="true" className="font-bold">
      !
    </span>
  );
}

/**
 * In-page warning link. Renders as an anchor with a fragment href so
 * native keyboard activation works, and additionally intercepts click /
 * Enter to scroll the target section into view smoothly — plain fragment
 * navigation would jump without animation and also wouldn't move focus
 * into the target for screen reader users.
 */
function ScrollWarning({
  targetId,
  count,
  label,
  testId,
}: {
  targetId: string;
  count: number;
  label: string;
  testId: string;
}) {
  const handleActivate = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Move focus into the heading so assistive tech announces the
    // destination; the target heading has tabIndex={-1} for this.
    const heading = target.querySelector<HTMLElement>('[data-orphan-heading]');
    heading?.focus({ preventScroll: true });
  };

  return (
    <a
      href={`#${targetId}`}
      data-testid={testId}
      className={warningPillClass}
      style={warningPillStyle}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleActivate(e);
        }
      }}
    >
      <WarningGlyph />
      <span>
        {count} {label}
      </span>
    </a>
  );
}

/**
 * Navigates to the untested-assumptions list view with the HIGH filter
 * pre-applied. `/assumptions` is now a registered route with a typed
 * `importance` search param, so this is a plain typed router link — no
 * casts needed.
 */
function AssumptionsWarning({ count }: { count: number }) {
  return (
    <Link
      to="/assumptions"
      search={{ importance: 'HIGH' }}
      data-testid="warning-untested-high-importance"
      className={warningPillClass}
      style={warningPillStyle}
    >
      <WarningGlyph />
      <span>{count} untested high-importance assumptions</span>
    </Link>
  );
}

/**
 * Ideas-with-no-assumptions warning. Semantically distinct from the
 * unrooted-ideas list rendered inline on the dashboard — an idea with no
 * assumptions may still be rooted under an opportunity, so routing the
 * warning to the `#orphan-ideas` section would scroll users to a list
 * that may not contain the ideas they expected.
 *
 * TODO: point at `/ideas?filter=no-assumptions` once the ideas list route
 * (mirroring `/assumptions`) lands. The schema today exposes only a count
 * (`DiscoveryHealth.ideasWithNoAssumptions`) — there is no server query
 * yet that returns the ideas themselves — so adding a dedicated dashboard
 * section would require a new GraphQL query, which is out of scope here.
 * Until that route exists, this link is rendered as a typed-router link
 * to the not-yet-registered path, matching the pattern already used by
 * `AssumptionsWarning` above.
 */
function IdeasNoAssumptionsWarning({ count }: { count: number }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={'/ideas' as any}
      search={{ filter: 'no-assumptions' } as never}
      data-testid="warning-ideas-no-assumptions"
      className={warningPillClass}
      style={warningPillStyle}
    >
      <WarningGlyph />
      <span>{count} ideas with no assumptions</span>
    </Link>
  );
}
