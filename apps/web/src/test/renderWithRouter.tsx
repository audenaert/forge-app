import type { ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';

/**
 * Lightweight router wrapper for component tests that need TanStack
 * Router's hooks (`useNavigate`, `useRouterState`) but do not need the
 * full app shell. The wrapper builds a throwaway router with a single
 * catch-all route and renders the supplied UI inside it. The router's
 * `navigate` function is observable via `router.state.location`.
 *
 * Use this for component-level tests of UI that calls `useNavigate()`.
 * For full-app integration tests (route loaders, Apollo cache, AppShell),
 * use `renderWithApp` from `./renderWithApp` instead.
 */
export async function renderWithRouter(ui: ReactElement) {
  const rootRoute = createRootRoute({
    component: function Root() {
      return <Outlet />;
    },
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => ui,
  });
  // A fallthrough route for any path the test navigates to. Returning
  // `null` keeps the page blank — tests assert against the router state
  // rather than rendered content for navigations.
  const splatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$',
    component: () => null,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, splatRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  const rendered = render(<RouterProvider router={router} />);
  // RouterProvider mounts asynchronously the first time; wait for it to
  // commit the index-route content before returning so callers can do
  // synchronous queries.
  await waitFor(() => {
    if (!rendered.container.firstChild) throw new Error('router not committed');
  });
  return { router, rendered };
}
