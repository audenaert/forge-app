import { Suspense, type ReactNode } from 'react';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router';
import type { ApolloClient } from '@apollo/client';
import { AppShell } from './components/layout/AppShell';
import { EmptyState } from './components/layout/EmptyState';
import { RoutedSidebar } from './components/layout/Sidebar';
import { ObjectiveArtifactPage } from './components/artifact/ObjectiveArtifactPage';
import { OpportunityArtifactPage } from './components/artifact/OpportunityArtifactPage';
import { IdeaArtifactPage } from './components/artifact/IdeaArtifactPage';
import { AssumptionArtifactPage } from './components/artifact/AssumptionArtifactPage';
import { ExperimentArtifactPage } from './components/artifact/ExperimentArtifactPage';
import { client as defaultApolloClient } from './lib/apollo';
import {
  ObjectiveDetailDocument,
  OpportunityDetailDocument,
  IdeaDetailDocument,
  AssumptionDetailDocument,
  ExperimentDetailDocument,
} from './lib/graphql/generated/graphql';

/*
 * Code-based router configuration. File-based routing is deferred — the
 * route tree is small enough that the extra build plugin isn't justified
 * yet.
 *
 * Artifact routes are declared one-per-type. Each one has a loader that
 * warms the Apollo cache with the corresponding detail query before the
 * component mounts, so the per-type wrapper's useSuspenseQuery resolves
 * synchronously when the cache is populated. Every artifact route wraps
 * its content in a Suspense boundary with a shell-aware fallback.
 *
 * Loaders read the Apollo client from the typed router context, which
 * `createAppRouter` populates with either the production client or a
 * test-supplied mock. This keeps DI explicit and per-router-isolated
 * rather than relying on a module-level binding.
 */

// Router context type. Loaders read the Apollo client off `context`
// rather than reaching for a module-level binding — this is the idiomatic
// TanStack Router DI surface, and it gives us per-router isolation so
// tests don't share global state across cases.
export interface RouterContext {
  apolloClient: ApolloClient<object>;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
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
  // `discovery-dashboard-route`; until then the `/` route tells the user
  // where they are and how to populate the space.
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

/**
 * Suspense wrapper with a shell-aware fallback. Reused by every artifact
 * route so the loading state is consistent across types. The role="status"
 * + aria-live="polite" pair announces loading to assistive tech without
 * interrupting whatever the user is currently doing.
 */
function ArtifactSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          className="mx-auto max-w-3xl px-8 py-10 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Loading artifact…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const objectiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/objective/$id',
  loader: async ({ params, context }) => {
    await context.apolloClient.query({
      query: ObjectiveDetailDocument,
      variables: { id: params.id },
    });
    return null;
  },
  component: function ObjectiveRoute() {
    const { id } = objectiveRoute.useParams();
    return (
      <ArtifactSuspense>
        <ObjectiveArtifactPage id={id} />
      </ArtifactSuspense>
    );
  },
});

const opportunityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/opportunity/$id',
  loader: async ({ params, context }) => {
    await context.apolloClient.query({
      query: OpportunityDetailDocument,
      variables: { id: params.id },
    });
    return null;
  },
  component: function OpportunityRoute() {
    const { id } = opportunityRoute.useParams();
    return (
      <ArtifactSuspense>
        <OpportunityArtifactPage id={id} />
      </ArtifactSuspense>
    );
  },
});

const ideaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/idea/$id',
  loader: async ({ params, context }) => {
    await context.apolloClient.query({
      query: IdeaDetailDocument,
      variables: { id: params.id },
    });
    return null;
  },
  component: function IdeaRoute() {
    const { id } = ideaRoute.useParams();
    return (
      <ArtifactSuspense>
        <IdeaArtifactPage id={id} />
      </ArtifactSuspense>
    );
  },
});

const assumptionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assumption/$id',
  loader: async ({ params, context }) => {
    await context.apolloClient.query({
      query: AssumptionDetailDocument,
      variables: { id: params.id },
    });
    return null;
  },
  component: function AssumptionRoute() {
    const { id } = assumptionRoute.useParams();
    return (
      <ArtifactSuspense>
        <AssumptionArtifactPage id={id} />
      </ArtifactSuspense>
    );
  },
});

const experimentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/experiment/$id',
  loader: async ({ params, context }) => {
    await context.apolloClient.query({
      query: ExperimentDetailDocument,
      variables: { id: params.id },
    });
    return null;
  },
  component: function ExperimentRoute() {
    const { id } = experimentRoute.useParams();
    return (
      <ArtifactSuspense>
        <ExperimentArtifactPage id={id} />
      </ArtifactSuspense>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  objectiveRoute,
  opportunityRoute,
  ideaRoute,
  assumptionRoute,
  experimentRoute,
]);

export function createAppRouter(options?: {
  memory?: boolean;
  initialEntries?: string[];
  apolloClient?: ApolloClient<object>;
}) {
  const apolloClient = options?.apolloClient ?? defaultApolloClient;
  return createRouter({
    routeTree,
    context: { apolloClient },
    history:
      options?.memory || options?.initialEntries
        ? createMemoryHistory({
            initialEntries: options?.initialEntries ?? ['/'],
          })
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
