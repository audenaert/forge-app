import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { ArtifactLink, type ArtifactLinkProps } from './ArtifactLink';

/**
 * Render ArtifactLink inside a stand-alone test router. A single-route
 * test router keeps the component-level assertions pure — no Apollo, no
 * app loaders, just a live router context so TanStack's <Link> has
 * somewhere to resolve paths against.
 */
async function renderLink(props: ArtifactLinkProps) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <ArtifactLink {...props} />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

describe('ArtifactLink', () => {
  it('renders a link whose href points at /<type>/<id>', async () => {
    await renderLink({
      type: 'idea',
      id: 'idea-1',
      name: 'Graph-backed artifact store',
      status: 'BUILDING',
    });
    const link = screen.getByRole('link', {
      name: /idea: graph-backed artifact store, status building/i,
    });
    expect(link).toHaveAttribute('href', '/idea/idea-1');
    expect(link).toHaveAttribute('data-artifact-type', 'idea');
    expect(link).toHaveAttribute('data-artifact-id', 'idea-1');
  });

  it('exposes an accessible name that includes type + name + status', async () => {
    await renderLink({
      type: 'assumption',
      id: 'asm-7',
      name: 'Neo4j handles the query patterns',
      status: 'VALIDATED',
    });
    expect(
      screen.getByRole('link', {
        name: 'Assumption: Neo4j handles the query patterns, status Validated',
      }),
    ).toBeInTheDocument();
  });

  it('omits the status portion of the accessible name when no status is provided', async () => {
    await renderLink({
      type: 'experiment',
      id: 'exp-1',
      name: 'Spike',
    });
    const link = screen.getByRole('link', { name: 'Experiment: Spike' });
    expect(link.getAttribute('aria-label')).toBe('Experiment: Spike');
  });

  it('percent-encodes ids that contain URL-reserved characters', async () => {
    await renderLink({
      type: 'objective',
      id: 'foo/bar',
      name: 'Objective A',
      status: 'ACTIVE',
    });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/objective/foo%2Fbar');
  });

  it('renders the status label as visible text (color is not the only signal)', async () => {
    await renderLink({
      type: 'idea',
      id: 'x',
      name: 'y',
      status: 'READY_FOR_BUILD',
    });
    const badge = screen.getByTestId('status-badge');
    expect(badge.textContent).toBe('Ready for Build');
  });
});
