import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import {
  ObjectiveDetailDocument,
  ObjectiveSubgraphDocument,
  OpportunityDetailDocument,
  OpportunitySubgraphDocument,
  OrphanedOpportunitiesDocument,
  UnrootedIdeasDocument,
} from '../../lib/graphql/generated/graphql';
import { renderWithApp } from '../../test/renderWithApp';

/**
 * Full-app integration coverage for the tree projection routes:
 *
 *   1. `/tree/objective/$id` mounts the AppShell with the tree rail
 *      visible, renders the objective's name in main content, and shows
 *      the orphaned-opportunities disclosure.
 *   2. `/tree/opportunity/$id` does the same for the opportunity root
 *      with the unrooted-ideas disclosure.
 *   3. The Apollo cache is hit when a query fired by the route loader
 *      is re-issued — verified by counting network ops via a tap link
 *      installed by `renderWithApp`.
 */

const objectiveSubgraphMock: MockedResponse = {
  request: {
    query: ObjectiveSubgraphDocument,
    variables: { objectiveId: 'obj-1', domainSlug: 'seed' },
  },
  result: {
    data: {
      objectiveSubgraph: {
        __typename: 'ObjectiveSubgraphResult',
        id: 'obj-1',
        name: 'Accelerate discovery',
        status: 'ACTIVE',
        opportunities: [
          {
            __typename: 'OpportunityWithIdeas',
            id: 'opp-1',
            name: 'Teams have no model',
            status: 'ACTIVE',
            hmw: 'How might we?',
            ideas: [
              {
                __typename: 'IdeaWithAssumptions',
                id: 'idea-1',
                name: 'Graph store',
                status: 'BUILDING',
                assumptions: [
                  {
                    __typename: 'AssumptionWithExperiments',
                    id: 'asm-1',
                    name: 'Adoption',
                    status: 'UNTESTED',
                    importance: 'HIGH',
                    evidence: 'LOW',
                    experiments: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
};

const orphanedOppsMock: MockedResponse = {
  request: {
    query: OrphanedOpportunitiesDocument,
    variables: { domainSlug: 'seed' },
  },
  result: {
    data: {
      orphanedOpportunities: [
        {
          __typename: 'Opportunity',
          id: 'opp-99',
          name: 'Floating opportunity',
          status: 'ACTIVE',
          hmw: null,
        },
      ],
    },
  },
};

const objectiveDetailMock: MockedResponse = {
  request: {
    query: ObjectiveDetailDocument,
    variables: { id: 'obj-1' },
  },
  result: {
    data: {
      objectives: [
        {
          __typename: 'Objective',
          id: 'obj-1',
          name: 'Accelerate discovery',
          status: 'ACTIVE',
          body: 'Body text.',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: null,
          supportedBy: [],
        },
      ],
    },
  },
};

const opportunitySubgraphMock: MockedResponse = {
  request: {
    query: OpportunitySubgraphDocument,
    variables: { opportunityId: 'opp-77', domainSlug: 'seed' },
  },
  result: {
    data: {
      opportunitySubgraph: {
        __typename: 'OpportunitySubgraph',
        id: 'opp-77',
        name: 'Standalone opportunity',
        status: 'ACTIVE',
        hmw: 'How might we?',
        ideas: [
          {
            __typename: 'IdeaWithAssumptions',
            id: 'idea-77',
            name: 'Sketch',
            status: 'DRAFT',
            assumptions: [],
          },
        ],
      },
    },
  },
};

const unrootedIdeasMock: MockedResponse = {
  request: {
    query: UnrootedIdeasDocument,
    variables: { domainSlug: 'seed' },
  },
  result: {
    data: {
      unrootedIdeas: [],
    },
  },
};

const opportunityDetailMock: MockedResponse = {
  request: {
    query: OpportunityDetailDocument,
    variables: { id: 'opp-77' },
  },
  result: {
    data: {
      opportunities: [
        {
          __typename: 'Opportunity',
          id: 'opp-77',
          name: 'Standalone opportunity',
          status: 'ACTIVE',
          hmw: 'How might we?',
          body: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: null,
          supports: [],
          addressedBy: [],
        },
      ],
    },
  },
};

describe('Tree projection routes', () => {
  it('renders the objective tree route with the rail and the objective artifact page', async () => {
    await renderWithApp(null, {
      path: '/tree/objective/obj-1',
      mocks: [objectiveSubgraphMock, orphanedOppsMock, objectiveDetailMock],
    });

    // Regression: the rail must be in the DOM on the first render pass of
    // the tree route, not after a reflow. Previously, `setActive` ran in a
    // plain `useEffect`, so the AppShell committed once without the rail
    // before the context update triggered a re-render — producing a
    // visible flash. The switch to `useLayoutEffect` pulls that second
    // render inside the same paint. Asserting synchronously (no waitFor)
    // pins the behaviour.
    expect(screen.getByTestId('app-shell-tree-rail')).toBeInTheDocument();

    // The tree projection inside the rail rendered the objective root.
    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-obj-1')).toBeInTheDocument();

    // The main content shows the objective artifact page (heading h1).
    expect(
      screen.getByRole('heading', { name: /accelerate discovery/i, level: 1 }),
    ).toBeInTheDocument();

    // The "Unrooted opportunities" disclosure rendered the orphan entry as
    // a navigable ArtifactLink.
    expect(
      screen.getByRole('link', { name: /opportunity: floating opportunity/i }),
    ).toHaveAttribute('href', '/opportunity/opp-99');
  });

  it('renders the opportunity tree route with the unrooted-ideas empty state', async () => {
    await renderWithApp(null, {
      path: '/tree/opportunity/opp-77',
      mocks: [opportunitySubgraphMock, unrootedIdeasMock, opportunityDetailMock],
    });

    await waitFor(() => {
      expect(screen.getByTestId('app-shell-tree-rail')).toBeInTheDocument();
    });
    expect(screen.getByTestId('tree-node-opp-77')).toBeInTheDocument();

    // The opportunity detail page rendered in main content.
    expect(
      screen.getByRole('heading', { name: /standalone opportunity/i, level: 1 }),
    ).toBeInTheDocument();

    // Empty state for the unrooted ideas disclosure.
    expect(screen.getByTestId('tree-unrooted-empty')).toBeInTheDocument();
  });

  it('serves the subgraph from cache on a full router navigation cycle', async () => {
    // Mirrors the pattern in `components/artifact/cache.test.tsx`: exercise
    // the full route lifecycle (router.navigate -> loader -> useSuspenseQuery)
    // by visiting the tree route, navigating away, and navigating back,
    // then asserting the operation count did not grow on the return visit.
    // This proves cache reuse across the real route surface, not via a
    // direct `client.query()` call that trivially hits the cache.
    //
    // Each mock has exactly one entry — if the cache fails and the loader
    // re-fires, MockLink starves and the test fails. That is belt-and-braces
    // alongside the explicit count assertion.
    const onRequest = vi.fn();
    const { router } = await renderWithApp(null, {
      // Start directly at the tree route. The dashboard index route ("/")
      // has its own loader that fires five queries, which would otherwise
      // pollute the operation count.
      path: '/tree/objective/obj-1',
      mocks: [objectiveSubgraphMock, orphanedOppsMock, objectiveDetailMock],
      onRequest,
    });

    await waitFor(() => {
      expect(screen.getByTestId('tree-node-obj-1')).toBeInTheDocument();
    });

    // Three queries fire on the loader: subgraph, orphans, and objective
    // detail. Each runs exactly once on first visit.
    expect(onRequest).toHaveBeenCalledTimes(3);

    // Navigate to the objective's own artifact page. Its loader fires
    // ObjectiveDetailDocument, which is already in the cache from the
    // tree loader — the tap link should see no new operation.
    await act(async () => {
      await router.navigate({
        to: '/objective/$id',
        params: { id: 'obj-1' },
      });
    });

    expect(onRequest).toHaveBeenCalledTimes(3);

    // Navigate back to the tree route — all three queries are cached.
    await act(async () => {
      await router.navigate({
        to: '/tree/objective/$id',
        params: { id: 'obj-1' },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('tree-node-obj-1')).toBeInTheDocument();
    });

    expect(onRequest).toHaveBeenCalledTimes(3);
  });
});
