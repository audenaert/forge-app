import { describe, it, expect } from 'vitest';
import { screen, within, fireEvent, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { UntestedAssumptionsDocument } from '../../lib/graphql/generated/graphql';
import { renderWithApp } from '../../test/renderWithApp';

/**
 * End-to-end tests for the `/assumptions` route. Each test mounts the
 * real router + real Apollo client with a MockLink feed so the route's
 * search-param validation, loader, cache-warming, and
 * `useSuspenseQuery`-driven render all run under realistic conditions —
 * exactly the production data flow with only the network mocked.
 *
 * Every AC in `untested-assumptions-view.md` has at least one assertion
 * in this file.
 */

const DOMAIN = 'seed';

interface MockAssumption {
  id: string;
  name: string;
  status: string;
  importance: string;
  evidence: string;
  body?: string | null;
  parentIdea?: { id: string; name: string; status: string } | null;
}

/**
 * Build a MockedResponse for the UntestedAssumptions query. `minImportance`
 * defaults to `null` (the "All" filter), matching the variables the loader
 * passes when the search param is absent.
 */
function untestedAssumptionsMock(
  items: MockAssumption[],
  minImportance: string | null = null,
): MockedResponse {
  return {
    request: {
      query: UntestedAssumptionsDocument,
      variables: { domainSlug: DOMAIN, minImportance: minImportance ?? undefined },
    },
    result: {
      data: {
        untestedAssumptions: items.map((i) => ({
          __typename: 'UntestedAssumptionWithContext',
          id: i.id,
          name: i.name,
          status: i.status,
          importance: i.importance,
          evidence: i.evidence,
          body: i.body ?? null,
          parentIdea: i.parentIdea
            ? { __typename: 'ParentIdeaRef', ...i.parentIdea }
            : null,
        })),
      },
    },
  };
}

const SAMPLE_ASSUMPTIONS: MockAssumption[] = [
  {
    id: 'a-1',
    name: 'Users will accept a 500ms interaction latency',
    status: 'UNTESTED',
    importance: 'HIGH',
    evidence: 'LOW',
    body: 'No measurement yet — gut feel based on similar tools.',
    parentIdea: {
      id: 'idea-1',
      name: 'Graph-backed artifact store',
      status: 'EXPLORING',
    },
  },
  {
    id: 'a-2',
    name: 'Designers will tolerate a keyboard-first canvas',
    status: 'UNTESTED',
    importance: 'MEDIUM',
    evidence: 'MEDIUM',
    body: null,
    parentIdea: {
      id: 'idea-2',
      name: 'Spatial canvas editor',
      status: 'DRAFT',
    },
  },
  {
    id: 'a-3',
    name: 'Teams want public sharing by default',
    status: 'UNTESTED',
    importance: 'LOW',
    evidence: 'LOW',
    body: null,
    parentIdea: null,
  },
];

describe('<UntestedAssumptionsView /> route', () => {
  it('loads data via the route loader and renders the list (AC: route + loader + list)', async () => {
    await renderWithApp(null, {
      path: '/assumptions',
      mocks: [untestedAssumptionsMock(SAMPLE_ASSUMPTIONS)],
    });

    // Rendered inside the AppShell, content committed without a fallback.
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(
      screen.getByTestId('untested-assumptions-view'),
    ).toBeInTheDocument();

    const list = screen.getByTestId('untested-assumptions-list');
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(3);

    // Each row carries its assumption name.
    expect(
      within(list).getByText(
        'Users will accept a 500ms interaction latency',
      ),
    ).toBeInTheDocument();
  });

  it('renders an importance badge and evidence label via lib/enums (AC: enum labels)', async () => {
    await renderWithApp(null, {
      path: '/assumptions',
      mocks: [untestedAssumptionsMock(SAMPLE_ASSUMPTIONS)],
    });

    // Row a-1: importance HIGH, evidence LOW. Row a-2: importance MEDIUM,
    // evidence MEDIUM. Scoping each assertion to a specific row (and to
    // the dedicated evidence-label test id) keeps this test honest — an
    // unscoped `getByText('Low')` would match either the importance badge
    // or the evidence label, so a regression that swapped one lookup for
    // the other could slip past.
    const rowA1 = screen.getByTestId('assumption-row-a-1');
    const badgeA1 = within(rowA1).getByTestId('importance-badge');
    expect(badgeA1).toHaveAttribute('data-importance', 'HIGH');
    expect(badgeA1).toHaveTextContent('High');
    expect(within(rowA1).getByText(/Evidence:/)).toBeInTheDocument();
    expect(within(rowA1).getByTestId('evidence-label')).toHaveTextContent('Low');

    const rowA2 = screen.getByTestId('assumption-row-a-2');
    const badgeA2 = within(rowA2).getByTestId('importance-badge');
    expect(badgeA2).toHaveAttribute('data-importance', 'MEDIUM');
    expect(badgeA2).toHaveTextContent('Medium');
    expect(within(rowA2).getByTestId('evidence-label')).toHaveTextContent('Medium');
  });

  it('renders both assumption and parent-idea ArtifactLinks with the right targets (AC: both links)', async () => {
    await renderWithApp(null, {
      path: '/assumptions',
      mocks: [untestedAssumptionsMock(SAMPLE_ASSUMPTIONS)],
    });

    const row = screen.getByTestId('assumption-row-a-1');
    const links = within(row).getAllByRole('link');

    const assumptionLink = links.find(
      (l) => l.getAttribute('data-artifact-type') === 'assumption',
    );
    const ideaLink = links.find(
      (l) => l.getAttribute('data-artifact-type') === 'idea',
    );

    expect(assumptionLink).toBeDefined();
    expect(assumptionLink).toHaveAttribute('href', '/assumption/a-1');
    expect(ideaLink).toBeDefined();
    expect(ideaLink).toHaveAttribute('href', '/idea/idea-1');
  });

  it('handles a parentless assumption without crashing (AC: semantic list, no dangling links)', async () => {
    await renderWithApp(null, {
      path: '/assumptions',
      mocks: [untestedAssumptionsMock(SAMPLE_ASSUMPTIONS)],
    });

    const row = screen.getByTestId('assumption-row-a-3');
    // No idea ArtifactLink — instead the "(unrooted)" marker.
    const ideaLinks = within(row)
      .getAllByRole('link')
      .filter((l) => l.getAttribute('data-artifact-type') === 'idea');
    expect(ideaLinks).toHaveLength(0);
    expect(within(row).getByText('(unrooted)')).toBeInTheDocument();
  });

  it('pre-applies the filter when the URL carries ?importance=HIGH (AC: dashboard deep-link)', async () => {
    await renderWithApp(null, {
      path: '/assumptions?importance=HIGH',
      mocks: [
        untestedAssumptionsMock(
          SAMPLE_ASSUMPTIONS.filter((a) => a.importance === 'HIGH'),
          'HIGH',
        ),
      ],
    });

    // Only the HIGH-importance row is present.
    const list = screen.getByTestId('untested-assumptions-list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(
      within(list).getByText(
        'Users will accept a 500ms interaction latency',
      ),
    ).toBeInTheDocument();

    // The HIGH filter button is aria-checked.
    const highButton = screen.getByTestId('importance-filter-HIGH');
    expect(highButton).toHaveAttribute('aria-checked', 'true');
    // The All button is not.
    expect(screen.getByTestId('importance-filter-all')).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('re-issues the GraphQL query (not client-side refiltering) when the filter changes (AC: loader re-runs)', async () => {
    // Count MockLink operations. The view has no local state store, so
    // the only way the HIGH-filtered list could appear after clicking
    // the HIGH button is if the loader re-ran and asked Apollo for new
    // data. If the filter were applied client-side, the hit count would
    // not increase on filter change.
    let requestCount = 0;
    const { router } = await renderWithApp(null, {
      path: '/assumptions',
      mocks: [
        untestedAssumptionsMock(SAMPLE_ASSUMPTIONS),
        untestedAssumptionsMock(
          SAMPLE_ASSUMPTIONS.filter((a) => a.importance === 'HIGH'),
          'HIGH',
        ),
      ],
      onRequest: () => {
        requestCount += 1;
      },
    });

    // Initial render fired exactly one query (loader warm-up + suspense
    // query share the cache, so it's a single network hit).
    expect(requestCount).toBe(1);

    fireEvent.click(screen.getByTestId('importance-filter-HIGH'));

    // Filter change navigates, which runs the loader again with the
    // new variables — a second network operation.
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ importance: 'HIGH' });
    });
    await waitFor(() => {
      expect(requestCount).toBe(2);
    });
  });

  it('round-trips the filter into the URL when the control changes (AC: filter updates URL)', async () => {
    const { router } = await renderWithApp(null, {
      path: '/assumptions',
      mocks: [
        // Initial "all" load.
        untestedAssumptionsMock(SAMPLE_ASSUMPTIONS),
        // After user clicks HIGH, a new loader query fires with minImportance=HIGH.
        untestedAssumptionsMock(
          SAMPLE_ASSUMPTIONS.filter((a) => a.importance === 'HIGH'),
          'HIGH',
        ),
      ],
    });

    // Activate the HIGH filter — simulates user click (keyboard-activatable
    // since <button> elements are used for the radio group).
    fireEvent.click(screen.getByTestId('importance-filter-HIGH'));

    // URL search param is updated.
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ importance: 'HIGH' });
    });

    // And the list now shows only the HIGH-importance row.
    await waitFor(() => {
      const list = screen.getByTestId('untested-assumptions-list');
      expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    });
  });

  it('drops the search param when switching back to All (AC: URL round-trip)', async () => {
    const { router } = await renderWithApp(null, {
      path: '/assumptions?importance=MEDIUM',
      mocks: [
        untestedAssumptionsMock(
          SAMPLE_ASSUMPTIONS.filter((a) => a.importance !== 'LOW'),
          'MEDIUM',
        ),
        untestedAssumptionsMock(SAMPLE_ASSUMPTIONS),
      ],
    });

    fireEvent.click(screen.getByTestId('importance-filter-all'));

    await waitFor(() => {
      // The "All" filter drops the search param entirely — user sees
      // `/assumptions`, not `/assumptions?importance=all`. validateSearch
      // returns `{}` in this case so the URL stays clean.
      expect(router.state.location.search).toEqual({});
      expect(router.state.location.href).toBe('/assumptions');
    });
  });

  it('renders the filter-aware empty state when no assumptions match (AC: empty state)', async () => {
    await renderWithApp(null, {
      path: '/assumptions?importance=HIGH',
      mocks: [untestedAssumptionsMock([], 'HIGH')],
    });

    expect(
      screen.queryByTestId('untested-assumptions-list'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/No HIGH-importance untested assumptions/),
    ).toBeInTheDocument();
  });

  it('renders the all-filter empty state when the domain has no untested assumptions', async () => {
    await renderWithApp(null, {
      path: '/assumptions',
      mocks: [untestedAssumptionsMock([])],
    });

    expect(screen.getByText('No untested assumptions')).toBeInTheDocument();
  });

  it('normalises unknown importance search params to "all" (robustness)', async () => {
    await renderWithApp(null, {
      path: '/assumptions?importance=nonsense',
      mocks: [untestedAssumptionsMock(SAMPLE_ASSUMPTIONS)],
    });

    // validateSearch should coerce unknown values to the "no filter"
    // case, which the view renders as the All-selected radio regardless
    // of how TanStack Router's internal `location.search` stores the
    // raw query string.
    expect(screen.getByTestId('importance-filter-all')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // And the full list (three rows) is visible — the nonsense param
    // did not get mapped onto the `minImportance` GraphQL argument.
    const list = screen.getByTestId('untested-assumptions-list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('uses semantic list markup for accessibility (AC: <ul>/<li>)', async () => {
    await renderWithApp(null, {
      path: '/assumptions',
      mocks: [untestedAssumptionsMock(SAMPLE_ASSUMPTIONS)],
    });

    const list = screen.getByTestId('untested-assumptions-list');
    expect(list.tagName).toBe('UL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);

    // Filter control exposes a radiogroup so assistive tech announces
    // the active filter.
    expect(
      screen.getByRole('radiogroup', { name: /filter by importance/i }),
    ).toBeInTheDocument();
  });
});
