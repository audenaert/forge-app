import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { MockedResponse } from '@apollo/client/testing';
import {
  DiscoveryHealthDocument,
  ObjectivesWithOpportunitiesDocument,
  OrphanedOpportunitiesDocument,
  UnrootedIdeasDocument,
  UnrootedAssumptionsDocument,
} from './lib/graphql/generated/graphql';
import { renderWithApp } from './test/renderWithApp';

/**
 * Smoke tests for the full app at the `/` route. Assertions focus on the
 * shell + nav landmarks the root layout is responsible for — the detailed
 * dashboard assertions live in `components/dashboard/Dashboard.test.tsx`.
 */

const variables = { domainSlug: 'seed' };

const zeroMocks: MockedResponse[] = [
  {
    request: { query: DiscoveryHealthDocument, variables },
    result: {
      data: {
        discoveryHealth: {
          __typename: 'DiscoveryHealth',
          totalObjectives: 0,
          totalOpportunities: 0,
          totalIdeas: 0,
          totalAssumptions: 0,
          totalExperiments: 0,
          untestedHighImportanceAssumptions: 0,
          ideasWithNoAssumptions: 0,
          orphanedOpportunities: 0,
        },
      },
    },
  },
  {
    request: { query: ObjectivesWithOpportunitiesDocument, variables },
    result: { data: { objectives: [] } },
  },
  {
    request: { query: OrphanedOpportunitiesDocument, variables },
    result: { data: { orphanedOpportunities: [] } },
  },
  {
    request: { query: UnrootedIdeasDocument, variables },
    result: { data: { unrootedIdeas: [] } },
  },
  {
    request: { query: UnrootedAssumptionsDocument, variables },
    result: { data: { unrootedAssumptions: [] } },
  },
];

describe('<App />', () => {
  it('renders the dashboard inside the AppShell with the Primary nav active', async () => {
    await renderWithApp(null, { path: '/', mocks: zeroMocks });

    // AppShell + sidebar mounted.
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('app-shell-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('app-shell-main')).toBeInTheDocument();

    // Primary nav landmark is labelled.
    expect(
      screen.getByRole('navigation', { name: /primary/i }),
    ).toBeInTheDocument();

    // Dashboard nav link is marked active.
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    // With zero discovery data the dashboard renders its empty state.
    expect(
      screen.getByRole('heading', { name: /no discovery data yet/i }),
    ).toBeInTheDocument();
  });
});
