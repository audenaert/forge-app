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
          <ScrollWarning
            targetId="orphan-ideas"
            count={health.ideasWithNoAssumptions}
            label="ideas with no assumptions"
            testId="warning-ideas-no-assumptions"
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
 * Navigates to the untested-assumptions list view. The route itself
 * (`/assumptions`) is not built in this story — but the health bar must
 * still link to it per the AC, so this renders as a typed router link so
 * the target is registered the moment that route lands.
 */
function AssumptionsWarning({ count }: { count: number }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={'/assumptions' as any}
      search={{ importance: 'HIGH' } as never}
      data-testid="warning-untested-high-importance"
      className={warningPillClass}
      style={warningPillStyle}
    >
      <WarningGlyph />
      <span>{count} untested high-importance assumptions</span>
    </Link>
  );
}
