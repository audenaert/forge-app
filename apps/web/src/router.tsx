import { Suspense, useEffect, useMemo, type ReactNode } from 'react';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
  useRouterState,
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
import {
  UntestedAssumptionsView,
  filterToMinImportance,
  type ImportanceFilter,
} from './components/assumptions/UntestedAssumptionsView';
import { TreeRail } from './components/tree/TreeRail';
import {
  ObjectiveTreeView,
  OpportunityTreeView,
} from './components/tree/TreeRouteViews';
import { client as defaultApolloClient } from './lib/apollo';
import { DOMAIN_SLUG, getDomainSlug } from './lib/domain';
import { TreeRailProvider, useTreeRail } from './lib/treeRailContext';
import { allNodes } from './lib/treeProjection';
import {
  ObjectiveDetailDocument,
  ObjectiveSubgraphDocument,
  OpportunityDetailDocument,
  OpportunitySubgraphDocument,
  OrphanedOpportunitiesDocument,
  UnrootedIdeasDocument,
  IdeaDetailDocument,
  AssumptionDetailDocument,
  ExperimentDetailDocument,
  DiscoveryHealthDocument,
  ObjectivesWithOpportunitiesDocument,
  UnrootedAssumptionsDocument,
  UntestedAssumptionsDocument,
} from './lib/graphql/generated/graphql';

export interface RouterContext {
  apolloClient: ApolloClient<object>;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <TreeRailProvider>
      <RootShell />
    </TreeRailProvider>
  );
}

/**
 * Decides whether the AppShell renders its optional tree rail. The rail is
 * shown when:
 *   - the user is on a `/tree/...` route (the tree route always shows it), or
 *   - the user is on an artifact page whose id is part of the loaded
 *     subgraph (so navigating from a tree node to an artifact preserves
 *     orientation).
 *
 * Anywhere else — including artifact pages reached from outside a tree
 * projection — the rail collapses. This is the policy described in the
 * tree-projection-view AC and in the spec's "Tree projection" section.
 */
function RootShell() {
  const { active, setActive } = useTreeRail();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const params = useRouterState({ select: (s) => s.matches[s.matches.length - 1]?.params });

  const onTreeRoute = pathname.startsWith('/tree/');
  // The id of whatever artifact is currently being viewed in the main
  // content area. For `/tree/...` routes, it's the root id from the URL.
  // For `/idea/abc` etc., it's the id from the artifact route's params.
  //
  // Convention: every id-bearing route names its URL param `id` (see the
  // `createRoute` calls below — `$id` is used uniformly). Reading `params.id`
  // off the deepest matched route is therefore enough; if a future route
  // uses a different param name, destructure it explicitly there and pass
  // it up via a dedicated context instead of generalising this.
  const selectedId = (() => {
    const p = (params ?? {}) as Record<string, string>;
    return p.id ?? null;
  })();

  // Clear the active projection when the current route is neither a tree
  // route nor inside the loaded subgraph. Without this, `active` lives on
  // in React state for the whole session after the first tree visit —
  // `railNode` correctly hides the rail, but the full TreeNode subgraph
  // (which can be large) leaks memory until unmount. Gated on "not on a
  // tree route" so the tree view's own `setActive` on first mount isn't
  // raced into a clear-then-set cycle.
  useEffect(() => {
    if (!active || onTreeRoute) return;
    const ids = new Set(allNodes(active.root).map((n) => n.id));
    if (!selectedId || !ids.has(selectedId)) {
      setActive(null);
    }
  }, [active, onTreeRoute, selectedId, setActive]);

  // The rail is mounted (and the tree highlight tracks the selection) when
  // the active subgraph contains the currently-routed artifact OR when the
  // user is on the tree route itself.
  const railNode = useMemo(() => {
    if (!active) return null;
    if (!onTreeRoute) {
      // On a non-tree route — only keep the rail visible if the selected
      // artifact is actually inside the loaded subgraph.
      const ids = new Set(allNodes(active.root).map((n) => n.id));
      if (!selectedId || !ids.has(selectedId)) return null;
    }
    return (
      <TreeRail
        heading={
          active.rootType === 'objective' ? 'Tree: Objective' : 'Tree: Opportunity'
        }
        root={active.root}
        selectedId={selectedId}
        unrooted={active.unrooted}
        unrootedLabel={active.unrootedLabel}
        unrootedEmptyMessage={active.unrootedEmptyMessage}
      />
    );
  }, [active, onTreeRoute, selectedId]);

  return (
    <AppShell sidebar={<RoutedSidebar />} treeRail={railNode}>
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

/**
 * `/assumptions` — untested-assumption list with an importance filter.
 *
 * The URL is the source of truth for the filter: `?importance=HIGH`,
 * `MEDIUM`, `LOW`, or omitted for the unfiltered "All" view. The loader
 * issues `UntestedAssumptionsDocument` with `minImportance` derived from
 * the validated search, warming the Apollo cache before the suspense
 * query mounts. Changing the filter re-navigates, which re-runs the
 * loader with new variables — the cache keys on the variables object,
 * so each filter has its own entry.
 *
 * `importance` is modelled as optional so the All filter drops the
 * query string from the URL entirely; `validateSearch` returns `{}`
 * rather than `{ importance: 'all' }` for the unfiltered case.
 */
interface AssumptionsSearch {
  importance?: 'HIGH' | 'MEDIUM' | 'LOW';
}

const ASSUMPTIONS_ACTIVE_FILTERS = new Set(['HIGH', 'MEDIUM', 'LOW']);

const assumptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assumptions',
  validateSearch: (search: Record<string, unknown>): AssumptionsSearch => {
    const raw = search.importance;
    // Accept the literal strings only. Anything else — including
    // undefined, empty string, unknown values, or the 'all' sentinel —
    // collapses to "no filter", which is represented by an empty object
    // so the param is dropped from the URL.
    if (typeof raw === 'string' && ASSUMPTIONS_ACTIVE_FILTERS.has(raw)) {
      return { importance: raw as 'HIGH' | 'MEDIUM' | 'LOW' };
    }
    return {};
  },
  loaderDeps: ({ search }) => ({
    // Re-normalize here. `search` is the validated result, but when the
    // incoming URL has an unknown value TanStack Router still forwards
    // the raw record into loaderDeps rather than the validated shape —
    // so we defensively collapse anything that isn't one of the three
    // active filters back to 'all'.
    importance:
      typeof search.importance === 'string' &&
      ASSUMPTIONS_ACTIVE_FILTERS.has(search.importance)
        ? (search.importance as ImportanceFilter)
        : ('all' as ImportanceFilter),
  }),
  loader: async ({ context, deps }) => {
    await context.apolloClient.query({
      query: UntestedAssumptionsDocument,
      variables: {
        domainSlug: DOMAIN_SLUG,
        minImportance: filterToMinImportance(deps.importance),
      },
    });
    return null;
  },
  component: function AssumptionsRoute() {
    const search = assumptionsRoute.useSearch();
    // Defensive re-normalization — mirrors the loader. See the
    // comment on `loaderDeps` above.
    const raw = search.importance;
    const filter: ImportanceFilter =
      typeof raw === 'string' && ASSUMPTIONS_ACTIVE_FILTERS.has(raw)
        ? (raw as ImportanceFilter)
        : 'all';
    return (
      <ArtifactSuspense>
        <UntestedAssumptionsView filter={filter} />
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

/**
 * Tree-projection routes.
 *
 * Each route loader fires three queries in parallel: the subgraph traversal
 * (which warms the cache the rail consumes), the corresponding orphan
 * query (which feeds the "Unrooted at this level" disclosure), and the
 * artifact detail query for the root node (which warms the artifact-page
 * cache used by the main content area on the initial render). The route
 * component then projects the subgraph into a normalized TreeNode tree,
 * installs it into the TreeRailContext via an effect, and renders the
 * appropriate artifact page in the main content area. Subsequent
 * navigation to artifact pages whose id is in the loaded subgraph keeps
 * the rail visible — that policy lives in <RootShell />.
 */
const objectiveTreeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tree/objective/$id',
  loader: async ({ params, context }) => {
    const domainSlug = getDomainSlug();
    await Promise.all([
      context.apolloClient.query({
        query: ObjectiveSubgraphDocument,
        variables: { objectiveId: params.id, domainSlug },
      }),
      context.apolloClient.query({
        query: OrphanedOpportunitiesDocument,
        variables: { domainSlug },
      }),
      context.apolloClient.query({
        query: ObjectiveDetailDocument,
        variables: { id: params.id },
      }),
    ]);
    return null;
  },
  component: function ObjectiveTreeRoute() {
    const { id } = objectiveTreeRoute.useParams();
    return (
      <ArtifactSuspense>
        <ObjectiveTreeView id={id} />
      </ArtifactSuspense>
    );
  },
});

const opportunityTreeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tree/opportunity/$id',
  loader: async ({ params, context }) => {
    const domainSlug = getDomainSlug();
    await Promise.all([
      context.apolloClient.query({
        query: OpportunitySubgraphDocument,
        variables: { opportunityId: params.id, domainSlug },
      }),
      context.apolloClient.query({
        query: UnrootedIdeasDocument,
        variables: { domainSlug },
      }),
      context.apolloClient.query({
        query: OpportunityDetailDocument,
        variables: { id: params.id },
      }),
    ]);
    return null;
  },
  component: function OpportunityTreeRoute() {
    const { id } = opportunityTreeRoute.useParams();
    return (
      <ArtifactSuspense>
        <OpportunityTreeView id={id} />
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
  assumptionsRoute,
  objectiveTreeRoute,
  opportunityTreeRoute,
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
