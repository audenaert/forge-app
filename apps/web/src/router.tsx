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
import { RoutedSidebar } from './components/layout/Sidebar';
import { ObjectiveArtifactPage } from './components/artifact/ObjectiveArtifactPage';
import { OpportunityArtifactPage } from './components/artifact/OpportunityArtifactPage';
import { IdeaArtifactPage } from './components/artifact/IdeaArtifactPage';
import { AssumptionArtifactPage } from './components/artifact/AssumptionArtifactPage';
import { ExperimentArtifactPage } from './components/artifact/ExperimentArtifactPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { client as defaultApolloClient } from './lib/apollo';
import { DOMAIN_SLUG } from './lib/domain';
import {
  ObjectiveDetailDocument,
  OpportunityDetailDocument,
  IdeaDetailDocument,
  AssumptionDetailDocument,
  ExperimentDetailDocument,
  DiscoveryHealthDocument,
  ObjectivesWithOpportunitiesDocument,
  OrphanedOpportunitiesDocument,
  UnrootedIdeasDocument,
  UnrootedAssumptionsDocument,
} from './lib/graphql/generated/graphql';

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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: async ({ context }) => {
    const variables = { domainSlug: DOMAIN_SLUG };
    await Promise.all([
      context.apolloClient.query({ query: DiscoveryHealthDocument, variables }),
      context.apolloClient.query({
        query: ObjectivesWithOpportunitiesDocument,
        variables,
      }),
      context.apolloClient.query({
        query: OrphanedOpportunitiesDocument,
        variables,
      }),
      context.apolloClient.query({ query: UnrootedIdeasDocument, variables }),
      context.apolloClient.query({
        query: UnrootedAssumptionsDocument,
        variables,
      }),
    ]);
    return null;
  },
  component: function IndexRoute() {
    return (
      <Suspense
        fallback={
          <div
            role="status"
            aria-live="polite"
            data-testid="dashboard-loading"
            className="mx-auto max-w-3xl px-8 py-10 text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Loading dashboard…
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    );
  },
});

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
