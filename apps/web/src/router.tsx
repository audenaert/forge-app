import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router';
import { AppShell } from './components/layout/AppShell';
import { EmptyState } from './components/layout/EmptyState';
import { RoutedSidebar } from './components/layout/Sidebar';

/*
 * Code-based router configuration. File-based routing is deferred — the
 * route tree is small enough that the extra build plugin isn't justified
 * yet. Later stories can migrate without changing URLs.
 *
 * The root route mounts the <AppShell>. Every page renders inside its
 * main region via <Outlet />. The tree rail is not yet provided by any
 * route — the rail slot stays empty until `tree-projection-view` (M1b)
 * lands and routes can declare the rail content as part of their layout.
 */
const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <AppShell sidebar={<RoutedSidebar />}>
      <Outlet />
    </AppShell>
  );
}

function IndexRoute() {
  // Placeholder dashboard content. The real discovery dashboard lands in
  // `discovery-dashboard-route` (M1b); until then the `/` route tells the
  // user where they are and how to populate the space.
  return (
    <EmptyState
      title="Discovery Explorer"
      description={
        <p>
          This is the discovery explorer for your Etak workspace. Discovery
          data — objectives, opportunities, ideas, assumptions, and
          experiments — is currently created via the API or Claude Code.
          Views for browsing that data arrive in upcoming milestones.
        </p>
      }
    />
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRoute,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export function createAppRouter(options?: { memory?: boolean }) {
  return createRouter({
    routeTree,
    history: options?.memory
      ? createMemoryHistory({ initialEntries: ['/'] })
      : undefined,
    defaultPreload: 'intent',
  });
}

export const router = createAppRouter();

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
