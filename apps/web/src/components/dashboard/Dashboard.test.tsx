import { describe, it, expect, vi } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import {
  DiscoveryHealthDocument,
  ObjectivesWithOpportunitiesDocument,
  OrphanedOpportunitiesDocument,
  UnrootedIdeasDocument,
  UnrootedAssumptionsDocument,
} from '../../lib/graphql/generated/graphql';
import { renderWithApp } from '../../test/renderWithApp';

/**
 * End-to-end tests for the discovery dashboard route. Every test mounts
 * the real router + real Apollo client with a MockLink feed, so loaders
 * run, the cache warms, and `useSuspenseQuery` resolves against it —
 * exactly the production data flow with only the network mocked.
 *
 * Each AC in `discovery-dashboard-route.md` has at least one assertion
 * in this file.
 */

const DOMAIN = 'seed';
const variables = { domainSlug: DOMAIN };

interface HealthShape {
  totalObjectives: number;
  totalOpportunities: number;
  totalIdeas: number;
  totalAssumptions: number;
  totalExperiments: number;
  untestedHighImportanceAssumptions: number;
  ideasWithNoAssumptions: number;
  orphanedOpportunities: number;
}

function healthMock(health: HealthShape): MockedResponse {
  return {
    request: { query: DiscoveryHealthDocument, variables },
    result: {
      data: {
        discoveryHealth: { __typename: 'DiscoveryHealth', ...health },
      },
    },
  };
}

interface MockObjective {
  id: string;
  name: string;
  status: string;
  supportedBy: Array<{
    id: string;
    name: string;
    status: string;
    hmw: string | null;
  }>;
}

function objectivesMock(objectives: MockObjective[]): MockedResponse {
  return {
    request: {
      query: ObjectivesWithOpportunitiesDocument,
      variables,
    },
    result: {
      data: {
        objectives: objectives.map((o) => ({
          __typename: 'Objective',
          id: o.id,
          name: o.name,
          status: o.status,
          supportedBy: o.supportedBy.map((opp) => ({
            __typename: 'Opportunity',
            ...opp,
          })),
        })),
      },
    },
  };
}

function orphanedOppsMock(
  items: Array<{ id: string; name: string; status: string; hmw: string | null }>,
): MockedResponse {
  return {
    request: { query: OrphanedOpportunitiesDocument, variables },
    result: {
      data: {
        orphanedOpportunities: items.map((i) => ({
          __typename: 'Opportunity',
          ...i,
        })),
      },
    },
  };
}

function unrootedIdeasMock(
  items: Array<{ id: string; name: string; status: string }>,
): MockedResponse {
  return {
    request: { query: UnrootedIdeasDocument, variables },
    result: {
      data: {
        unrootedIdeas: items.map((i) => ({ __typename: 'Idea', ...i })),
      },
    },
  };
}

function unrootedAssumptionsMock(
  items: Array<{
    id: string;
    name: string;
    status: string;
    importance: string;
  }>,
): MockedResponse {
  return {
    request: { query: UnrootedAssumptionsDocument, variables },
    result: {
      data: {
        unrootedAssumptions: items.map((i) => ({
          __typename: 'Assumption',
          ...i,
        })),
      },
    },
  };
}

function defaultMocks(overrides: {
  health?: Partial<HealthShape>;
  objectives?: MockObjective[];
  orphanedOpps?: Array<{
    id: string;
    name: string;
    status: string;
    hmw: string | null;
  }>;
  unrootedIdeas?: Array<{ id: string; name: string; status: string }>;
  unrootedAssumptions?: Array<{
    id: string;
    name: string;
    status: string;
    importance: string;
  }>;
} = {}): MockedResponse[] {
  const health: HealthShape = {
    totalObjectives: 2,
    totalOpportunities: 3,
    totalIdeas: 5,
    totalAssumptions: 7,
    totalExperiments: 4,
    untestedHighImportanceAssumptions: 0,
    ideasWithNoAssumptions: 0,
    orphanedOpportunities: 0,
    ...overrides.health,
  };
  return [
    healthMock(health),
    objectivesMock(overrides.objectives ?? []),
    orphanedOppsMock(overrides.orphanedOpps ?? []),
    unrootedIdeasMock(overrides.unrootedIdeas ?? []),
    unrootedAssumptionsMock(overrides.unrootedAssumptions ?? []),
  ];
}

describe('<Dashboard /> route', () => {
  it('warms the cache via a loader and renders inside the AppShell', async () => {
    const onRequest = vi.fn();
    await renderWithApp(null, {
      path: '/',
      mocks: defaultMocks(),
      onRequest,
    });

    // The AppShell is mounted.
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    // The dashboard content is present without ever showing the fallback.
    expect(screen.getByTestId('discovery-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument();
    // All five queries were fired by the loader (one per document).
    expect(onRequest).toHaveBeenCalledTimes(5);
  });

  it('renders the five artifact counts in the health bar', async () => {
    await renderWithApp(null, {
      path: '/',
      mocks: defaultMocks({
        health: {
          totalObjectives: 3,
          totalOpportunities: 7,
          totalIdeas: 12,
          totalAssumptions: 24,
          totalExperiments: 8,
        },
      }),
    });
    expect(screen.getByTestId('health-count-objectives')).toHaveTextContent(
      '3',
    );
    expect(screen.getByTestId('health-count-opportunities')).toHaveTextContent(
      '7',
    );
    expect(screen.getByTestId('health-count-ideas')).toHaveTextContent('12');
    expect(screen.getByTestId('health-count-assumptions')).toHaveTextContent(
      '24',
    );
    expect(screen.getByTestId('health-count-experiments')).toHaveTextContent(
      '8',
    );
  });

  it('renders each warning indicator when its count is non-zero', async () => {
    await renderWithApp(null, {
      path: '/',
      mocks: defaultMocks({
        health: {
          untestedHighImportanceAssumptions: 5,
          ideasWithNoAssumptions: 3,
          orphanedOpportunities: 2,
        },
        orphanedOpps: [
          { id: 'o1', name: 'Unlinked Opp 1', status: 'ACTIVE', hmw: null },
          { id: 'o2', name: 'Unlinked Opp 2', status: 'ACTIVE', hmw: null },
        ],
        unrootedIdeas: [
          { id: 'i1', name: 'Wandering Idea', status: 'DRAFT' },
        ],
      }),
    });

    // Untested assumptions warning navigates to /assumptions per AC.
    const untested = screen.getByTestId('warning-untested-high-importance');
    expect(untested).toHaveAttribute('href', expect.stringContaining('/assumptions'));
    expect(untested).toHaveTextContent('5');

    // Ideas with no assumptions warning scrolls in-page.
    const noAssumptions = screen.getByTestId('warning-ideas-no-assumptions');
    expect(noAssumptions).toHaveAttribute('href', '#orphan-ideas');
    expect(noAssumptions).toHaveTextContent('3');

    // Orphan opps warning scrolls in-page.
    const orphanOpps = screen.getByTestId('warning-orphan-opportunities');
    expect(orphanOpps).toHaveAttribute('href', '#orphan-opportunities');
    expect(orphanOpps).toHaveTextContent('2');

    // Unrooted ideas warning scrolls in-page.
    const unrooted = screen.getByTestId('warning-unrooted-ideas');
    expect(unrooted).toHaveAttribute('href', '#orphan-ideas');
    expect(unrooted).toHaveTextContent('1');
  });

  it('omits warning indicators when their counts are zero', async () => {
    await renderWithApp(null, { path: '/', mocks: defaultMocks() });
    expect(
      screen.queryByTestId('warning-untested-high-importance'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('warning-ideas-no-assumptions'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('warning-orphan-opportunities'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('warning-unrooted-ideas'),
    ).not.toBeInTheDocument();
  });

  it('renders the EmptyState when the domain has zero discovery data', async () => {
    await renderWithApp(null, {
      path: '/',
      mocks: defaultMocks({
        health: {
          totalObjectives: 0,
          totalOpportunities: 0,
          totalIdeas: 0,
          totalAssumptions: 0,
          totalExperiments: 0,
        },
      }),
    });
    // Empty state is rendered, not a zeroed-out ribbon.
    expect(
      screen.getByRole('heading', { name: /no discovery data yet/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('discovery-dashboard')).not.toBeInTheDocument();
    // Seed pointer is in the copy per the AC.
    expect(screen.getByText(/npm run seed/)).toBeInTheDocument();
  });

  it('renders the objective list with artifact links and a View tree affordance', async () => {
    await renderWithApp(null, {
      path: '/',
      mocks: defaultMocks({
        objectives: [
          {
            id: 'obj-1',
            name: 'Accelerate product discovery',
            status: 'ACTIVE',
            supportedBy: [
              {
                id: 'opp-1',
                name: 'Teams have no computational model',
                status: 'ACTIVE',
                hmw: 'How might we',
              },
              {
                id: 'opp-2',
                name: 'Ideas evaporate in Slack',
                status: 'ACTIVE',
                hmw: null,
              },
            ],
          },
        ],
      }),
    });

    // Objective name is a link to /objective/:id.
    const objectiveLink = screen.getByTestId('objective-link-obj-1');
    expect(objectiveLink).toHaveAttribute('href', '/objective/obj-1');
    expect(objectiveLink).toHaveTextContent('Accelerate product discovery');

    // "View tree" affordance links to /tree/objective/:id.
    const viewTree = screen.getByTestId('objective-view-tree-obj-1');
    expect(viewTree).toHaveAttribute('href', '/tree/objective/obj-1');
    expect(viewTree).toHaveTextContent(/view tree/i);

    // Supporting opportunities render via ArtifactLink (href /opportunity/:id).
    const opp1 = screen.getByRole('link', {
      name: /opportunity: teams have no computational model/i,
    });
    expect(opp1).toHaveAttribute('href', '/opportunity/opp-1');
    const opp2 = screen.getByRole('link', {
      name: /opportunity: ideas evaporate in slack/i,
    });
    expect(opp2).toHaveAttribute('href', '/opportunity/opp-2');

    // Status renders through the enum label map, not as SCREAMING_SNAKE_CASE.
    expect(
      screen.getByTestId('objective-status-obj-1'),
    ).toHaveTextContent('Active');
  });

  it('renders all three orphan disclosure sections populated with ArtifactLink entries', async () => {
    await renderWithApp(null, {
      path: '/',
      mocks: defaultMocks({
        orphanedOpps: [
          {
            id: 'opp-x',
            name: 'Floating Opportunity',
            status: 'ACTIVE',
            hmw: null,
          },
        ],
        unrootedIdeas: [
          { id: 'idea-x', name: 'Stray Idea', status: 'DRAFT' },
        ],
        unrootedAssumptions: [
          {
            id: 'asm-x',
            name: 'Untethered Assumption',
            status: 'UNTESTED',
            importance: 'HIGH',
          },
        ],
      }),
    });

    const oppSection = screen
      .getByText(/opportunities not supporting an objective/i)
      .closest('section')!;
    expect(
      within(oppSection).getByRole('link', {
        name: /opportunity: floating opportunity/i,
      }),
    ).toHaveAttribute('href', '/opportunity/opp-x');

    const ideaSection = screen
      .getByText(/ideas not addressing an opportunity/i)
      .closest('section')!;
    expect(
      within(ideaSection).getByRole('link', {
        name: /idea: stray idea/i,
      }),
    ).toHaveAttribute('href', '/idea/idea-x');

    const asmSection = screen
      .getByText(/assumptions not assumed by any idea/i)
      .closest('section')!;
    expect(
      within(asmSection).getByRole('link', {
        name: /assumption: untethered assumption/i,
      }),
    ).toHaveAttribute('href', '/assumption/asm-x');
  });

  it('renders "None" inline for empty orphan sections instead of hiding them', async () => {
    await renderWithApp(null, { path: '/', mocks: defaultMocks() });
    // All three orphan sections are visible with their headings...
    expect(
      screen.getByText(/opportunities not supporting an objective/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ideas not addressing an opportunity/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/assumptions not assumed by any idea/i),
    ).toBeInTheDocument();
    // ...each with a "None" state, not a hidden block.
    expect(
      screen.getByTestId('orphan-empty-orphan-opportunities'),
    ).toHaveTextContent(/none/i);
    expect(
      screen.getByTestId('orphan-empty-orphan-ideas'),
    ).toHaveTextContent(/none/i);
    expect(
      screen.getByTestId('orphan-empty-orphan-assumptions'),
    ).toHaveTextContent(/none/i);
  });

  it('uses button + aria-expanded for each disclosure and toggles on click', async () => {
    await renderWithApp(null, { path: '/', mocks: defaultMocks() });
    const toggle = screen.getByTestId('orphan-toggle-orphan-opportunities');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('exposes named landmarks and a Primary nav for a11y', async () => {
    await renderWithApp(null, { path: '/', mocks: defaultMocks() });
    // Primary sidebar nav from AppShell.
    expect(
      screen.getByRole('navigation', { name: /primary/i }),
    ).toBeInTheDocument();
    // Dashboard-owned health/warnings landmarks.
    expect(
      screen.getByRole('navigation', { name: /discovery counts/i }),
    ).toBeInTheDocument();
    // Discovery warnings nav is always rendered (empty when counts are 0).
    expect(
      screen.getByRole('navigation', { name: /discovery warnings/i }),
    ).toBeInTheDocument();
  });
});
