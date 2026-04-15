import { useLayoutEffect, useMemo } from 'react';
import { useSuspenseQuery } from '@apollo/client';
import { ObjectiveArtifactPage } from '../artifact/ObjectiveArtifactPage';
import { OpportunityArtifactPage } from '../artifact/OpportunityArtifactPage';
import { ArtifactNotFound } from '../artifact/NotFound';
import { getDomainSlug } from '../../lib/domain';
import {
  projectObjectiveSubgraph,
  projectOpportunitySubgraph,
  type UnrootedEntry,
} from '../../lib/treeProjection';
import { useTreeRail } from '../../lib/treeRailContext';
import {
  ObjectiveSubgraphDocument,
  OpportunitySubgraphDocument,
  OrphanedOpportunitiesDocument,
  UnrootedIdeasDocument,
} from '../../lib/graphql/generated/graphql';

/**
 * Tree-route view for `/tree/objective/$id`.
 *
 * Reads the cache-warmed subgraph + orphan responses, projects them into
 * the normalized TreeNode shape, installs the result into the
 * TreeRailContext (so <RootShell /> can render the rail), and finally
 * renders the objective's artifact page as the main content for the
 * landing case.
 *
 * The artifact page rendered in the main content area swaps when the user
 * navigates to a different node: clicking a node leaves this route for
 * `/idea/...`, the rail stays visible (because the id is in the loaded
 * subgraph), and the artifact-page route renders the new content.
 */
export function ObjectiveTreeView({ id }: { id: string }) {
  const domainSlug = getDomainSlug();
  const { data: subgraphData } = useSuspenseQuery(ObjectiveSubgraphDocument, {
    variables: { objectiveId: id, domainSlug },
  });
  const { data: orphansData } = useSuspenseQuery(OrphanedOpportunitiesDocument, {
    variables: { domainSlug },
  });
  const { setActive } = useTreeRail();

  // Project query data -> tree once per data identity. useMemo keeps the
  // tree reference stable across re-renders so the context value's equality
  // check in TreeRailProvider doesn't trip a rerender storm.
  const projection = useMemo(
    () => projectObjectiveSubgraph(subgraphData),
    [subgraphData],
  );

  const unrooted = useMemo<UnrootedEntry[]>(
    () =>
      orphansData.orphanedOpportunities.map((opp) => ({
        type: 'opportunity' as const,
        id: opp.id,
        name: opp.name,
        status: opp.status,
      })),
    [orphansData],
  );

  // useLayoutEffect (not useEffect) so the rail's `setActive` commit runs
  // before the browser paints the tree route. With a plain useEffect the
  // tree view commits once without a rail, then the effect fires, then
  // <RootShell /> re-renders with the rail — producing a visible one-frame
  // flash / reflow on the first paint. useLayoutEffect pulls the second
  // render into the same paint.
  useLayoutEffect(() => {
    if (!projection) {
      setActive(null);
      return;
    }
    setActive({
      rootType: 'objective',
      rootId: projection.id,
      root: projection,
      unrooted,
      unrootedLabel: 'Unrooted opportunities',
      unrootedEmptyMessage: 'No orphaned opportunities in this domain.',
    });
  }, [projection, unrooted, setActive]);

  if (!projection) {
    return <ArtifactNotFound type="objective" id={id} />;
  }
  return <ObjectiveArtifactPage id={id} />;
}

/**
 * Tree-route view for `/tree/opportunity/$id`. Mirrors the objective view
 * but rooted one level lower. Uses `unrootedIdeas` for the disclosure list
 * — at the opportunity level, the natural "missing children" type is
 * orphan ideas (ideas that don't address any opportunity).
 */
export function OpportunityTreeView({ id }: { id: string }) {
  const domainSlug = getDomainSlug();
  const { data: subgraphData } = useSuspenseQuery(OpportunitySubgraphDocument, {
    variables: { opportunityId: id, domainSlug },
  });
  const { data: orphansData } = useSuspenseQuery(UnrootedIdeasDocument, {
    variables: { domainSlug },
  });
  const { setActive } = useTreeRail();

  const projection = useMemo(
    () => projectOpportunitySubgraph(subgraphData),
    [subgraphData],
  );

  const unrooted = useMemo<UnrootedEntry[]>(
    () =>
      orphansData.unrootedIdeas.map((idea) => ({
        type: 'idea' as const,
        id: idea.id,
        name: idea.name,
        status: idea.status,
      })),
    [orphansData],
  );

  // useLayoutEffect (not useEffect) so the rail's `setActive` commit runs
  // before the browser paints the tree route. With a plain useEffect the
  // tree view commits once without a rail, then the effect fires, then
  // <RootShell /> re-renders with the rail — producing a visible one-frame
  // flash / reflow on the first paint. useLayoutEffect pulls the second
  // render into the same paint.
  useLayoutEffect(() => {
    if (!projection) {
      setActive(null);
      return;
    }
    setActive({
      rootType: 'opportunity',
      rootId: projection.id,
      root: projection,
      unrooted,
      unrootedLabel: 'Unrooted ideas',
      unrootedEmptyMessage: 'No unrooted ideas in this domain.',
    });
  }, [projection, unrooted, setActive]);

  if (!projection) {
    return <ArtifactNotFound type="opportunity" id={id} />;
  }
  return <OpportunityArtifactPage id={id} />;
}
