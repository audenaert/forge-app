import { describe, it, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import {
  ObjectiveDetailDocument,
  OpportunityDetailDocument,
  IdeaDetailDocument,
  AssumptionDetailDocument,
  ExperimentDetailDocument,
} from '../../lib/graphql/generated/graphql';
import { renderWithApp } from '../../test/renderWithApp';

/**
 * End-to-end-ish tests against the router + Apollo cache for every
 * artifact type. Each test boots the real router with a MockLink-backed
 * Apollo client, navigates to the corresponding /<type>/:id route, and
 * verifies:
 *   - the right detail query fires (MockLink rejects unrecognised ops)
 *   - the header/body/relationships render from the fixture
 *   - relationship links point at the correct /<type>/:id target
 */

describe('Artifact routes', () => {
  it('Objective route: fires ObjectiveDetail, renders header / body / relationships', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: ObjectiveDetailDocument, variables: { id: 'obj-1' } },
        result: {
          data: {
            objectives: [
              {
                __typename: 'Objective',
                id: 'obj-1',
                name: 'Accelerate product discovery',
                status: 'ACTIVE',
                body: 'First paragraph.\n\nSecond paragraph.',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-02-01T00:00:00.000Z',
                supportedBy: [
                  {
                    __typename: 'Opportunity',
                    id: 'opp-9',
                    name: 'Teams lack a computational model',
                    status: 'ACTIVE',
                  },
                ],
              },
            ],
          },
        },
      },
    ];

    await renderWithApp(null, { path: '/objective/obj-1', mocks });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Accelerate product discovery', level: 1 }),
      ).toBeInTheDocument();
    });

    // Header shows the type label.
    const header = screen.getByTestId('artifact-header');
    expect(header.textContent).toMatch(/Objective/);

    // Markdown body has two paragraphs.
    const body = screen.getByTestId('artifact-body');
    expect(body.querySelectorAll('p').length).toBe(2);

    // Supported by section contains a link to the opportunity page.
    const section = screen.getByRole('heading', { name: 'Supported by', level: 2 });
    const sectionEl = section.closest('[data-testid="relationship-section"]') as HTMLElement;
    const oppLink = within(sectionEl).getByRole('link', {
      name: /opportunity: teams lack a computational model, status active/i,
    });
    expect(oppLink).toHaveAttribute('href', '/opportunity/opp-9');
  });

  it('Opportunity route: shows hmw in header metadata', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: OpportunityDetailDocument, variables: { id: 'opp-1' } },
        result: {
          data: {
            opportunities: [
              {
                __typename: 'Opportunity',
                id: 'opp-1',
                name: 'Teams have no computational model',
                status: 'ACTIVE',
                hmw: 'How might we give teams a computational model of their discovery work?',
                body: 'Body text.',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: null,
                supports: [],
                addressedBy: [
                  {
                    __typename: 'Idea',
                    id: 'idea-1',
                    name: 'Graph-backed artifact store',
                    status: 'BUILDING',
                  },
                ],
              },
            ],
          },
        },
      },
    ];

    await renderWithApp(null, { path: '/opportunity/opp-1', mocks });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /teams have no computational model/i, level: 1 }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('How might we')).toBeInTheDocument();
    expect(
      screen.getByText(/how might we give teams a computational model/i),
    ).toBeInTheDocument();

    // Addressed by has the idea link.
    const ideaLink = screen.getByRole('link', {
      name: /idea: graph-backed artifact store, status building/i,
    });
    expect(ideaLink).toHaveAttribute('href', '/idea/idea-1');
  });

  it('Idea route: groups relationships by name', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: IdeaDetailDocument, variables: { id: 'idea-1' } },
        result: {
          data: {
            ideas: [
              {
                __typename: 'Idea',
                id: 'idea-1',
                name: 'Graph-backed artifact store',
                status: 'BUILDING',
                body: '# Heading\n\nBody here.',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: null,
                addresses: [
                  {
                    __typename: 'Opportunity',
                    id: 'opp-1',
                    name: 'Teams have no computational model',
                    status: 'ACTIVE',
                  },
                ],
                assumptions: [
                  {
                    __typename: 'Assumption',
                    id: 'a1',
                    name: 'Neo4j handles the query patterns',
                    status: 'VALIDATED',
                    importance: 'HIGH',
                  },
                  {
                    __typename: 'Assumption',
                    id: 'a2',
                    name: 'Teams will adopt graph thinking',
                    status: 'UNTESTED',
                    importance: 'HIGH',
                  },
                ],
              },
            ],
          },
        },
      },
    ];

    await renderWithApp(null, { path: '/idea/idea-1', mocks });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Graph-backed artifact store', level: 1 }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Addresses', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Has assumptions', level: 2 })).toBeInTheDocument();

    const assumptionsHeading = screen.getByRole('heading', { name: 'Has assumptions', level: 2 });
    const section = assumptionsHeading.closest('[data-testid="relationship-section"]') as HTMLElement;
    expect(within(section).getAllByRole('link')).toHaveLength(2);
  });

  it('Assumption route: renders importance and evidence metadata', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: AssumptionDetailDocument, variables: { id: 'a-1' } },
        result: {
          data: {
            assumptions: [
              {
                __typename: 'Assumption',
                id: 'a-1',
                name: 'Teams will adopt graph thinking',
                status: 'UNTESTED',
                importance: 'HIGH',
                evidence: 'LOW',
                body: '',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: null,
                assumedBy: [],
                testedBy: [
                  {
                    __typename: 'Experiment',
                    id: 'x-1',
                    name: 'User interviews round 1',
                    status: 'COMPLETE',
                    method: 'USER_INTERVIEW',
                    result: 'VALIDATED',
                  },
                ],
              },
            ],
          },
        },
      },
    ];

    await renderWithApp(null, { path: '/assumption/a-1', mocks });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Teams will adopt graph thinking', level: 1 }),
      ).toBeInTheDocument();
    });

    // Enum values render as labels, not raw SCREAMING_SNAKE_CASE.
    const header = screen.getByTestId('artifact-header');
    expect(header.textContent).toContain('High'); // importance: HIGH
    expect(header.textContent).toContain('Low'); // evidence: LOW

    expect(screen.getByRole('heading', { name: 'Tested by', level: 2 })).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /experiment: user interviews round 1, status complete/i,
      }),
    ).toHaveAttribute('href', '/experiment/x-1');
  });

  it('Experiment route: renders method / successCriteria / duration / effort / result / learnings', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: ExperimentDetailDocument, variables: { id: 'x-1' } },
        result: {
          data: {
            experiments: [
              {
                __typename: 'Experiment',
                id: 'x-1',
                name: 'Fake door signup',
                status: 'COMPLETE',
                method: 'FAKE_DOOR',
                successCriteria: '>=10% signup rate',
                duration: '2 weeks',
                effort: 'LOW',
                result: 'VALIDATED',
                learnings: 'High interest in feature X.',
                body: '',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: null,
                tests: [
                  {
                    __typename: 'Assumption',
                    id: 'a-1',
                    name: 'Users want feature X',
                    status: 'VALIDATED',
                    importance: 'HIGH',
                  },
                ],
              },
            ],
          },
        },
      },
    ];

    await renderWithApp(null, { path: '/experiment/x-1', mocks });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Fake door signup', level: 1 }),
      ).toBeInTheDocument();
    });

    const header = screen.getByTestId('artifact-header');
    // Enum labels — NOT the raw values.
    expect(header.textContent).toContain('Fake Door');
    expect(header.textContent).toContain('Validated');
    expect(header.textContent).toContain('Low');
    expect(header.textContent).toContain('>=10% signup rate');
    expect(header.textContent).toContain('2 weeks');
    expect(header.textContent).toContain('High interest in feature X.');

    // "Tests" section points at the assumption.
    const link = screen.getByRole('link', {
      name: /assumption: users want feature x, status validated/i,
    });
    expect(link).toHaveAttribute('href', '/assumption/a-1');
  });

  it('renders a not-found EmptyState with a "Go to dashboard" link when the artifact id is unknown', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: IdeaDetailDocument, variables: { id: 'missing' } },
        result: { data: { ideas: [] } },
      },
    ];

    await renderWithApp(null, { path: '/idea/missing', mocks });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /idea not found/i, level: 2 }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('link', { name: /go to dashboard/i }),
    ).toHaveAttribute('href', '/');
  });
});
