import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { RelationshipList, type RelationshipSection } from './RelationshipList';

async function renderWithRouter(sections: RelationshipSection[]) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <RelationshipList sections={sections} />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

describe('RelationshipList', () => {
  it('groups links into sections keyed by relationship name', async () => {
    await renderWithRouter([
      {
        label: 'Addresses',
        items: [
          { type: 'opportunity', id: 'o1', name: 'Opp One', status: 'ACTIVE' },
        ],
      },
      {
        label: 'Has assumptions',
        items: [
          { type: 'assumption', id: 'a1', name: 'Claim A', status: 'UNTESTED' },
          { type: 'assumption', id: 'a2', name: 'Claim B', status: 'VALIDATED' },
        ],
      },
    ]);

    const addresses = screen.getByRole('heading', { name: 'Addresses', level: 2 });
    const assumptions = screen.getByRole('heading', { name: 'Has assumptions', level: 2 });
    expect(addresses).toBeInTheDocument();
    expect(assumptions).toBeInTheDocument();

    const addressesSection = addresses.closest('[data-testid="relationship-section"]') as HTMLElement;
    expect(within(addressesSection).getAllByRole('link')).toHaveLength(1);
    expect(within(addressesSection).getByRole('link', { name: /opp one/i })).toBeInTheDocument();

    const assumptionsSection = assumptions.closest('[data-testid="relationship-section"]') as HTMLElement;
    expect(within(assumptionsSection).getAllByRole('link')).toHaveLength(2);
  });

  it('renders each section label as an h2 (page h1 is the artifact name)', async () => {
    await renderWithRouter([
      { label: 'Tested by', items: [] },
      { label: 'Assumed by', items: [] },
    ]);
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual(['Tested by', 'Assumed by']);
  });

  it('renders an empty placeholder for sections with zero items', async () => {
    await renderWithRouter([{ label: 'Tested by', items: [] }]);
    expect(screen.getByTestId('relationship-empty')).toBeInTheDocument();
  });

  it('returns nothing when given no sections', async () => {
    const { container } = await renderWithRouter([]);
    expect(container.querySelector('[data-testid="relationship-list"]')).toBeNull();
  });
});
