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

    // The AppShell rail slot is mounted.
    await waitFor(() => {
      expect(screen.getByTestId('app-shell-tree-rail')).toBeInTheDocument();
    });

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

  it('serves the subgraph from the Apollo cache without firing a second network op', async () => {
    const onRequest = vi.fn();
    const { client } = await renderWithApp(null, {
      path: '/tree/objective/obj-1',
      mocks: [objectiveSubgraphMock, orphanedOppsMock, objectiveDetailMock],
      onRequest,
    });

    await waitFor(() => {
      expect(screen.getByTestId('tree-node-obj-1')).toBeInTheDocument();
    });

    // Three queries fire on the loader: subgraph, orphans, and the
    // objective detail. Each should run exactly once.
    const initialOps = onRequest.mock.calls.length;
    expect(initialOps).toBe(3);

    // Re-issue the subgraph query directly — Apollo's normalized cache
    // should return synchronously and never reach the (mock) network.
    await act(async () => {
      const result = await client.query({
        query: ObjectiveSubgraphDocument,
        variables: { objectiveId: 'obj-1', domainSlug: 'seed' },
      });
      expect(result.data.objectiveSubgraph?.id).toBe('obj-1');
    });

    expect(onRequest.mock.calls.length).toBe(initialOps);
  });
});
