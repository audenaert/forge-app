import { useSuspenseQuery } from '@apollo/client';
import {
  DiscoveryHealthDocument,
  ObjectivesWithOpportunitiesDocument,
  OrphanedOpportunitiesDocument,
  UnrootedIdeasDocument,
  UnrootedAssumptionsDocument,
  type DiscoveryHealthQuery,
  type DiscoveryHealthQueryVariables,
  type ObjectivesWithOpportunitiesQuery,
  type ObjectivesWithOpportunitiesQueryVariables,
  type OrphanedOpportunitiesQuery,
  type OrphanedOpportunitiesQueryVariables,
  type UnrootedIdeasQuery,
  type UnrootedIdeasQueryVariables,
  type UnrootedAssumptionsQuery,
  type UnrootedAssumptionsQueryVariables,
} from '../../lib/graphql/generated/graphql';
import { DOMAIN_SLUG } from '../../lib/domain';
import { EmptyState } from '../layout/EmptyState';
import { HealthBar } from './HealthBar';
import { ObjectiveList } from './ObjectiveList';
import { OrphanSection } from './OrphanSection';

/**
 * Discovery dashboard — the default landing surface. Anchors the user in
 * business value (objectives), surfaces a summary ribbon of health signals,
 * and exposes orphan pockets as first-class navigable sections.
 *
 * Data is warmed by the route loader in `router.tsx` before this component
 * mounts, so `useSuspenseQuery` resolves synchronously from the Apollo
 * cache and the <Suspense> fallback only runs on true cold-loads. Queries
 * are fired in parallel by the loader; this component only reads them.
 *
 * Shape comes from the spec's "Discovery dashboard" section: health bar at
 * the top, objective list in the middle, three orphan disclosures below.
 */
export function Dashboard() {
  const { data: healthData } = useSuspenseQuery<
    DiscoveryHealthQuery,
    DiscoveryHealthQueryVariables
  >(DiscoveryHealthDocument, { variables: { domainSlug: DOMAIN_SLUG } });

  const { data: objectivesData } = useSuspenseQuery<
    ObjectivesWithOpportunitiesQuery,
    ObjectivesWithOpportunitiesQueryVariables
  >(ObjectivesWithOpportunitiesDocument, {
    variables: { domainSlug: DOMAIN_SLUG },
  });

  const { data: orphanedOppsData } = useSuspenseQuery<
    OrphanedOpportunitiesQuery,
    OrphanedOpportunitiesQueryVariables
  >(OrphanedOpportunitiesDocument, {
    variables: { domainSlug: DOMAIN_SLUG },
  });

  const { data: unrootedIdeasData } = useSuspenseQuery<
    UnrootedIdeasQuery,
    UnrootedIdeasQueryVariables
  >(UnrootedIdeasDocument, { variables: { domainSlug: DOMAIN_SLUG } });

  const { data: unrootedAssumptionsData } = useSuspenseQuery<
    UnrootedAssumptionsQuery,
    UnrootedAssumptionsQueryVariables
  >(UnrootedAssumptionsDocument, {
    variables: { domainSlug: DOMAIN_SLUG },
  });

  const health = healthData.discoveryHealth;
  const objectives = objectivesData.objectives;
  const orphanedOpportunities = orphanedOppsData.orphanedOpportunities;
  const unrootedIdeas = unrootedIdeasData.unrootedIdeas;
  const unrootedAssumptions = unrootedAssumptionsData.unrootedAssumptions;

  // Zero-data empty state — render instead of a zeroed-out ribbon. The
  // domain still needs the affordance to learn what this space is for.
  const totalArtifacts =
    (health?.totalObjectives ?? 0) +
    (health?.totalOpportunities ?? 0) +
    (health?.totalIdeas ?? 0) +
    (health?.totalAssumptions ?? 0) +
    (health?.totalExperiments ?? 0);

  if (!health || totalArtifacts === 0) {
    return (
      <EmptyState
        title="No discovery data yet"
        description={
          <p>
            This workspace doesn&apos;t have any objectives, opportunities,
            ideas, assumptions, or experiments yet. Discovery data is
            currently created via the API or through Claude Code — for a
            populated demo, run the seed script (<code>npm run seed</code>).
          </p>
        }
      />
    );
  }

  return (
    <div data-testid="discovery-dashboard" className="flex flex-col">
      <HealthBar
        health={health}
        orphanOpportunityCount={orphanedOpportunities.length}
        unrootedIdeaCount={unrootedIdeas.length}
      />
      <ObjectiveList objectives={objectives} />
      <OrphanSection
        anchorId="orphan-opportunities"
        title="Opportunities not supporting an objective"
        type="opportunity"
        entries={orphanedOpportunities}
        description="Opportunities that haven't been linked to a business objective yet."
      />
      <OrphanSection
        anchorId="orphan-ideas"
        title="Ideas not addressing an opportunity"
        type="idea"
        entries={unrootedIdeas}
        description="Ideas waiting to be connected to an opportunity."
      />
      <OrphanSection
        anchorId="orphan-assumptions"
        title="Assumptions not assumed by any idea"
        type="assumption"
        entries={unrootedAssumptions}
        description="Assumptions floating free of any decomposed idea."
      />
    </div>
  );
}
