import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router';

/*
 * Code-based router configuration. File-based routing is deferred — the
 * placeholder route tree is small enough that the extra build plugin isn't
 * justified yet. Later stories can migrate without changing URLs.
 */
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

function IndexRoute() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Discovery Explorer</h1>
      <p className="mt-2 text-sm">
        Placeholder scaffold. Real discovery views land in later stories.
      </p>
    </main>
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
