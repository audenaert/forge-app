---
name: "Web UI: Discovery Explorer"
type: spec
status: draft
for: graph-backed-artifact-store
adrs: []
---

## Context

The graph-backed artifact store now has a working API layer — Neo4j stores discovery and development artifacts, Apollo Server exposes them via GraphQL, and traversal queries like `opportunitySubgraph` and `discoveryHealth` return structured subgraphs. The data model works. No one can see it.

This spec covers the first web client: a read-only discovery explorer that makes the Opportunity Solution Tree visible and navigable. The goal is to prove that a graph-backed model produces a qualitatively different experience from flat artifact lists — you can see the full chain from objective to experiment result, identify untested assumptions at a glance, and understand the health of your discovery process.

Read-only is a deliberate choice. The first milestone validates the visualization and navigation thesis. CRUD comes next, once the information architecture is validated by actual use.

**Related artifacts:**
- Manifest: `docs/local/etak-manifest.md`
- Objective: `accelerate-product-discovery`
- Opportunity: `no-computational-model-for-opportunity-exploration`
- Idea: `graph-backed-artifact-store`
- Prior spec: `m1-discovery-graph-mvp` (the API this UI consumes)
- Design system: `.interface-design/system.md`

## Current State

### What exists

- **`apps/api`** — Apollo Server on Express, GraphQL endpoint at `:4000/graphql`. Supports CORS. Auth via `X-Api-Key` header resolved to a domain. Health check at `GET /health`.
- **`packages/graph`** — Neo4j data layer with typed SDL. Discovery types: Objective, Opportunity, Idea, Assumption, Experiment. Custom queries: `opportunitySubgraph` (full subgraph from an opportunity), `untestedAssumptions` (filtered list), `discoveryHealth` (aggregate stats). Development types also present but not targeted by this UI.
- **Design system** — Fully specified in `.interface-design/system.md`: color palette (ocean/teal/sand/deep), typography scale (14px base, geometric sans-serif pending), spacing (4px base), border radius (sharp-to-moderate), depth strategy (borders-only, no shadows), animation (120-150ms micro-interactions). No CSS implementation yet.
- **Component tooling** — shadcn/ui + Radix selected in `.forge/designer/`. Lucide icons likely. No components installed yet.
- **No web client** — `apps/` contains only `api/`.

### Patterns established in the codebase

- ESM throughout (`"type": "module"`)
- TypeScript strict mode
- Workspace packages reference each other via `"*"` version in dependencies
- Turborepo for `dev`, `build`, `test`, `lint`
- Vitest for testing
- Conventional commits

## Proposed Approach

### Application structure

```
apps/web/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  components.json              # shadcn/ui config
  src/
    main.tsx                   # React root, Apollo Provider, Router
    App.tsx                    # Route definitions
    lib/
      apollo.ts               # Apollo Client setup
      enums.ts                 # Human-readable labels for GraphQL enum values
      graphql/
        queries.ts             # Hand-written queries (typed via codegen)
        generated/             # GraphQL codegen output
    components/
      ui/                     # shadcn/ui primitives, themed to Etak
      layout/
        AppShell.tsx           # Sidebar + main content area
        Sidebar.tsx            # Navigation links
        EmptyState.tsx         # Zero-data state with guidance
      discovery/
        DiscoveryDashboard.tsx # Health stats + entry point
        ObjectiveList.tsx      # Top-level objectives for a domain
        OpportunityTree.tsx    # Expandable tree: Opp → Ideas → Assumptions → Experiments
        NodeDetail.tsx         # Right panel: full detail for selected node
        HealthBar.tsx          # Discovery health summary widget
    styles/
      app.css                 # Tailwind v4 @theme tokens + global styles
```

Note: Tailwind CSS v4 uses a CSS-first configuration model. There is no `tailwind.config.ts` or `postcss.config.js`. Tokens are defined via `@theme` directives in the CSS file, and Vite integration uses the `@tailwindcss/vite` plugin directly.

No `packages/ui` yet. Everything lives in `apps/web` until a second consumer needs shared components.

### Tech stack

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| Build | Vite | 6.x | ESM-native, fast HMR, matches monorepo's module strategy |
| Framework | React | 19.x | Standard for dense interactive UIs. Concurrent features useful for tree rendering. |
| Routing | TanStack Router | 1.x | Type-safe route params. Route-level data loading via `loader`. Better TS integration than React Router. |
| GraphQL client | Apollo Client | 3.x | Matches Apollo Server in `apps/api`. Normalized cache handles graph data well. `useQuery`/`useSuspenseQuery` hooks. |
| GraphQL codegen | `@graphql-codegen/cli` | 5.x | Generates TypeScript types + typed document nodes from `.graphql` operations against the API schema. |
| Styling | Tailwind CSS | 4.x | Utility-first. CSS-first config via `@theme` — no JS config file. Vite integration via `@tailwindcss/vite` plugin. |
| Components | shadcn/ui + Radix | latest | Accessible primitives. Copy-paste model means full control over styling. Already selected in `.forge/designer/`. |
| Icons | Lucide React | latest | Pairs with shadcn/ui. Consistent stroke weight. |
| Markdown | react-markdown + remark-gfm | latest | Renders body text in the detail panel. GFM support for tables, task lists, strikethrough. |
| Testing | Vitest + Testing Library | latest | Matches monorepo test runner. Component tests via `@testing-library/react`. |

### Design token implementation

The design system in `.interface-design/system.md` defines tokens abstractly. The web client implements them as CSS custom properties consumed by Tailwind.

`styles/app.css` — uses Tailwind v4's CSS-first `@theme` directive:

```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-ocean: #1B4F72;
  --color-teal: #148F77;
  --color-sand: #F5E6C8;
  --color-deep: #0D1B2A;

  /* Surfaces */
  --color-surface-base: #FFFFFF;
  --color-surface-raised: #FAFBFC;
  --color-surface-overlay: #F6F8FA;
  --color-surface-sunken: #F0F2F5;

  /* Semantic */
  --color-warning: #B7950B;        /* desaturated amber, warm-shifted */
  --color-success: #148F77;        /* teal — validated, complete */
  --color-destructive: #922B21;    /* desaturated red, warm-shifted */
  --color-info: #1B4F72;           /* ocean — informational */

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}

/* Borders — opacity-based, derived from --color-deep */
:root {
  --border-subtle: color-mix(in srgb, var(--color-deep) 6%, transparent);
  --border-default: color-mix(in srgb, var(--color-deep) 12%, transparent);
  --border-emphasis: color-mix(in srgb, var(--color-deep) 20%, transparent);
  --border-focus: color-mix(in srgb, var(--color-ocean) 60%, transparent);

  /* Text hierarchy */
  --text-primary: var(--color-deep);
  --text-secondary: color-mix(in srgb, var(--color-deep) 72%, transparent);
  --text-tertiary: color-mix(in srgb, var(--color-deep) 50%, transparent);
  --text-muted: color-mix(in srgb, var(--color-deep) 35%, transparent);
}
```

Tailwind v4 automatically generates utilities from `@theme` values — `bg-ocean`, `text-deep`, `rounded-sm` all work without a JS config file. The `@tailwindcss/vite` plugin in `vite.config.ts` replaces the PostCSS pipeline.

### Information architecture

The API key determines the domain — each key maps to exactly one domain via `resolveDomainFromApiKey` in `apps/api/src/auth.ts`. The client does not select or switch domains; the API key in the environment variable is the domain identity. This eliminates the domain selector entirely and simplifies the route structure.

The `domainSlug` resolved server-side from the API key is included in the Apollo context. All queries that require `domainSlug` receive it from this context. The client needs to know its own domain slug for constructing queries — it fetches this once on startup via a lightweight query (e.g., querying a single domain that the key has access to, or adding a `me` query to the API).

> **Note:** If multi-domain switching is needed later, it becomes a multi-key management layer in the client (store multiple API keys, switch between them). That is not this milestone.

**Routes:**

| Route | View | Data |
|---|---|---|
| `/` | Discovery dashboard: health bar + objective list | `discoveryHealth`, `objectives` |
| `/opportunity/:id` | Opportunity subgraph tree + selected node detail | `opportunitySubgraph`, lazy node detail |
| `/assumptions` | Untested assumptions list (filtered) | `untestedAssumptions` |

### Layout: AppShell

Two-region layout, not three. The sidebar is minimal — navigation links only (no domain selector; the API key determines the domain). The main content area handles all the detail work.

```
┌──────────┬────────────────────────────────────────────────────┐
│          │                                                    │
│ Sidebar  │  Main content area                                 │
│          │                                                    │
│ Discover │  ┌──────────────────────────────────────────────┐  │
│  ├ Tree  │  │ Health bar (discovery health stats)           │  │
│  └ Gaps  │  └──────────────────────────────────────────────┘  │
│          │  ┌──────────────────────┬───────────────────────┐  │
│          │  │                      │                       │  │
│          │  │  Opportunity tree     │  Node detail panel    │  │
│          │  │  (expandable)         │  (selected node)      │  │
│          │  │                      │                       │  │
│          │  └──────────────────────┴───────────────────────┘  │
│          │                                                    │
└──────────┴────────────────────────────────────────────────────┘
```

The sidebar shares the canvas background per the design system — separated by `--border-default`, not a different color. Active nav states use `--ocean` text with subtle background tint.

### Discovery dashboard (`/:domainSlug`)

**Health bar** — A compact row of stats from the `discoveryHealth` query. Not a dashboard of charts — a summary ribbon that communicates the shape of the discovery space at a glance:

```
Objectives: 3  |  Opportunities: 7  |  Ideas: 12  |  Assumptions: 24  |  Experiments: 8
⚠ 5 untested high-importance assumptions  ⚠ 3 ideas with no assumptions  ⚠ 2 orphaned opportunities
```

Warning indicators use `--sand` background tinting (warm attention, not red alarm) for items needing attention. All three health signals are surfaced:
- **Untested high-importance assumptions** — the most critical signal; clicking navigates to `/assumptions?importance=HIGH`
- **Ideas with no assumptions** — ideas that haven't been decomposed into testable claims
- **Orphaned opportunities** — opportunities not linked to any objective

Each warning is a navigation affordance — clicking it navigates to the relevant filtered view.

**Empty state** — When a domain has zero discovery data (new domain, freshly seeded), the dashboard shows an `EmptyState` component instead of a zeroed-out health bar. The empty state should communicate what the discovery space is for and what the first step would be (creating an objective). In the read-only version, it explains that data is created via the API or Claude Code and points to the seed script.

**Objective list** — Below the health bar, objectives listed with their status and the opportunities supporting each. Each objective is a gravitational anchor (heavier typographic weight per the design system). Opportunities nested beneath are lighter weight. Clicking an opportunity navigates to its subgraph view.

### Opportunity subgraph view (`/:domainSlug/opportunity/:id`)

This is the core view. Two panels:

**Left: Opportunity tree** — An expandable, indented tree rendering the `opportunitySubgraph` query result:

```
◆ Opportunity: "Teams have no computational model..."
  ├─ Idea: "Graph-backed artifact store"             [Building]
  │   ├─ Assumption: "Neo4j handles the query patterns" [Validated]
  │   │   └─ Experiment: "Spike: @cypher directives"     ✓ Validated
  │   ├─ Assumption: "Teams will adopt graph thinking"   [Untested] ⚠
  │   └─ Assumption: "GraphQL is the right API surface"  [Validated]
  │       └─ Experiment: "M1 integration tests"          ✓ Validated
  └─ Idea: "Server-side domain enforcement"          [Draft]
      └─ Assumption: "Current scoping is insufficient"   [Untested] ⚠
```

Visual encoding:
- **Node type** distinguished by leading icon (not color alone — WCAG compliance). Objective: filled diamond. Idea: lightbulb. Assumption: question mark. Experiment: beaker.
- **Status** shown as a trailing badge. Color-coded but always with text label.
- **Untested high-importance assumptions** get a warning indicator — the single most important signal for discovery health.
- **Depth** communicated by indentation + connector lines (standard tree UI pattern).

The tree is keyboard-navigable: arrow keys to move, Enter/Space to expand/collapse, Tab to move to the detail panel.

**Right: Node detail panel** — Shows the full record for whichever node is selected in the tree:

- **Header:** Type icon + name + status badge
- **Metadata:** Created/updated timestamps, type-specific fields (e.g., `hmw` for Opportunity, `importance`/`evidence` for Assumption, `method`/`result`/`learnings` for Experiment)
- **Body:** Markdown-rendered body text (read-only), rendered via `react-markdown` with `remark-gfm` for GFM support
- **Relationships:** List of connected nodes, clickable to navigate. "Supports → Objective X", "Tested by → Experiment Y"

**Data loading strategy:** The subgraph query returns structural fields only (id, name, status, type-specific enums) — no `body` text. When a node is selected in the tree, the detail panel fires a separate query for that node's full record (including `body`, `createdAt`, `updatedAt`, and relationship details). This keeps the tree query lean and avoids fetching potentially large markdown bodies for nodes the user never inspects. Apollo Client's normalized cache ensures subsequent selections of the same node are instant.

**Enum display:** GraphQL enums (`FAKE_DOOR`, `USER_INTERVIEW`, `READY_FOR_BUILD`, etc.) are rendered as human-readable labels via a lookup map in `lib/enums.ts`. Example: `FAKE_DOOR` → "Fake Door", `READY_FOR_BUILD` → "Ready for Build", `AB_TEST` → "A/B Test". The map covers all enum types used in the discovery schema.

The detail panel uses the gravitational hierarchy principle: the node name and status are dominant, metadata is secondary, relationships are tertiary.

### Untested assumptions view (`/assumptions`)

A focused list view powered by the `untestedAssumptions` query. Filterable by importance level. Each assumption links back to its parent idea and opportunity. This view answers the question: "What don't we know yet, and how important is it?"

**Schema prerequisite:** The current `untestedAssumptions` `@cypher` query returns raw `Assumption` nodes. `@cypher` return types do not automatically resolve `@relationship` fields, so the `assumedBy` traversal (needed to show "which idea depends on this assumption") will not work as a nested field on the result. Before this view can show parent context, the `@cypher` query in `packages/graph/src/typeDefs/discovery.graphql` must be rewritten to explicitly traverse and return parent idea data in the projection — similar to how `opportunitySubgraph` returns nested `IdeaWithAssumptions`. This requires a new return type (e.g., `UntestedAssumptionWithContext`) that includes the parent idea's `id` and `name`.

### GraphQL operations

Hand-written `.graphql` operations, typed via codegen:

```graphql
# queries.ts (as tagged template literals or .graphql files)

query DiscoveryHealth($domainSlug: String!) {
  discoveryHealth(domainSlug: $domainSlug) {
    totalObjectives
    totalOpportunities
    totalIdeas
    totalAssumptions
    totalExperiments
    untestedHighImportanceAssumptions
    ideasWithNoAssumptions
    orphanedOpportunities
  }
}

# Note: @neo4j/graphql requires { eq: } wrapper for scalar filters
query ObjectivesWithOpportunities($domainSlug: String!) {
  objectives(where: { domain: { slug: { eq: $domainSlug } } }) {
    id
    name
    status
    supportedBy {
      id
      name
      status
      hmw
    }
  }
}

# Subgraph query returns structural fields only — no body text.
# Body is lazy-loaded per node via NodeDetail queries (see below).
query OpportunitySubgraph($opportunityId: ID!, $domainSlug: String!) {
  opportunitySubgraph(opportunityId: $opportunityId, domainSlug: $domainSlug) {
    id
    name
    status
    hmw
    ideas {
      id
      name
      status
      assumptions {
        id
        name
        status
        importance
        evidence
        experiments {
          id
          name
          status
          method
          result
        }
      }
    }
  }
}

# Untested assumptions — returns raw nodes only.
# Parent idea context requires schema-side @cypher rewrite (see Schema Prerequisite
# in the Untested Assumptions section). Until then, parent context is omitted.
query UntestedAssumptions($domainSlug: String!, $minImportance: String) {
  untestedAssumptions(domainSlug: $domainSlug, minImportance: $minImportance) {
    id
    name
    status
    importance
    evidence
  }
}

# Node detail queries — fired when a node is selected in the tree.
# Each type has its own query to fetch full fields including body.
query ObjectiveDetail($id: ID!) {
  objectives(where: { id: { eq: $id } }) {
    id name status body createdAt updatedAt
    supportedBy { id name status }
  }
}

query OpportunityDetail($id: ID!) {
  opportunities(where: { id: { eq: $id } }) {
    id name status hmw body createdAt updatedAt
    supports { id name status }
    addressedBy { id name status }
  }
}

query IdeaDetail($id: ID!) {
  ideas(where: { id: { eq: $id } }) {
    id name status body createdAt updatedAt
    addresses { id name status }
    assumptions { id name status importance }
  }
}

query AssumptionDetail($id: ID!) {
  assumptions(where: { id: { eq: $id } }) {
    id name status importance evidence body createdAt updatedAt
    assumedBy { id name status }
    testedBy { id name status method result }
  }
}

query ExperimentDetail($id: ID!) {
  experiments(where: { id: { eq: $id } }) {
    id name status method successCriteria duration effort result learnings body createdAt updatedAt
    tests { id name status importance }
  }
}
```

### Apollo Client setup

```typescript
// lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql',
  headers: {
    // Server reads headers['x-api-key'] (Express lowercases all header names).
    // Browser fetch is case-insensitive for HTTP/2, case-preserving for HTTP/1.1.
    // Using the canonical casing; works in both protocols.
    'x-api-key': import.meta.env.VITE_API_KEY ?? '',
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

API key is passed via environment variable. In development, `.env.local` holds the key for the default domain. With `DISABLE_AUTH=true` on the API server, any key (or empty string) resolves to the `default` domain — no key management needed for local dev.

### Data loading strategy

Route-level data loading uses TanStack Router's `loader` functions with Apollo Client's `useSuspenseQuery`:

1. **Route loaders** initiate the primary query for each route (e.g., `discoveryHealth` + `objectives` for the dashboard, `opportunitySubgraph` for the tree view). The loader calls `client.query()` to warm the Apollo cache.
2. **React Suspense boundaries** in the component tree handle loading states. Each route wraps its content in a `<Suspense fallback={...}>` boundary.
3. **Detail panel** uses `useSuspenseQuery` with the selected node's ID. When the user clicks a tree node, the detail query fires and the panel shows a loading state via its own Suspense boundary. Apollo's normalized cache means re-selecting a previously viewed node is instant.

This avoids the render-then-fetch waterfall: the route loader starts fetching before the component mounts, and Suspense handles the loading UI declaratively.

### GraphQL codegen

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['src/**/*.{ts,tsx,graphql}'],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      config: {
        documentMode: 'documentNode',
      },
    },
  },
};

export default config;
```

Run `npx graphql-codegen` to regenerate types. The `client` preset generates typed document nodes that Apollo Client consumes directly — no separate type imports needed.

### API CORS configuration

The existing `apps/api` uses `cors()` with no origin restriction (allows all origins). This is fine for local development. When the app is deployed beyond localhost, CORS should be restricted to the web client's origin.

### Development workflow

```bash
# Terminal 1: Neo4j
docker compose up neo4j

# Terminal 2: API server
npm run dev --workspace=apps/api

# Terminal 3: Web client
npm run dev --workspace=apps/web
```

The root `package.json` has `"dev": "turbo dev"`, but no `turbo.json` exists yet. A `turbo.json` must be created as part of scaffolding to configure the pipeline (at minimum: `dev`, `build`, `lint` tasks). Once configured, `npm run dev` at the root will start both `apps/api` and `apps/web` in parallel.

### Seed data

The web UI is useless on an empty graph. The existing test suite creates data via GraphQL mutations but tears it down afterward. We need a persistent seed script that populates a domain with representative discovery data:

- 2-3 objectives
- 4-5 opportunities (some supporting objectives, some orphaned)
- 6-8 ideas across the opportunities
- 10-12 assumptions (mix of untested, validated, invalidated; mix of importance levels)
- 4-5 experiments (mix of complete with results and planned)

This seed data should exercise all the visual states the UI needs to render. A `scripts/seed.ts` at the repo root (or in `apps/api/`) that runs via `tsx` and calls the GraphQL API via HTTP. The seed script belongs near the API layer, not in `packages/graph`, since it uses GraphQL mutations (the API surface) rather than the data layer directly.

## Non-Functional Requirements

### Performance

- **Initial load:** Under 2 seconds to first meaningful paint on localhost. Vite's dev server handles this. Production build should target under 1 second.
- **Subgraph query:** The `opportunitySubgraph` query should return in under 200ms for typical discovery spaces (< 100 nodes). The existing Cypher is efficient for this scale.
- **Tree rendering:** The tree should handle 50-100 visible nodes without jank. React 19's concurrent features help if needed, but at this scale, simple rendering is fine.

No pagination needed in the initial version. Discovery spaces are typically small (tens to low hundreds of nodes). If a domain grows beyond this, pagination can be added to the objectives list.

### Accessibility

- WCAG 2.1 AA compliance as the baseline.
- Keyboard navigation throughout: arrow keys for tree traversal, Tab between panels, Enter to select.
- Node types distinguished by icon + text label, not color alone.
- Status badges include text, not just color.
- Focus management: selecting a tree node should not steal focus from the tree. Detail panel is a separate focus zone.
- `prefers-reduced-motion` respected: micro-interactions reduce to instant transitions.
- Semantic HTML: tree uses `role="tree"` / `role="treeitem"` with `aria-expanded`.

### Security

- API key stored in environment variable, not committed to git. `.env.local` is gitignored.
- No user-generated content rendering concerns in the read-only version (body text is authored by trusted users via Claude Code). When CRUD is added, body rendering must sanitize HTML.
- CSP headers should be configured to prevent XSS if the app is ever deployed beyond localhost.

### Observability

- Browser console errors are the debugging tool for the initial version. No telemetry or error reporting.
- Apollo Client DevTools (browser extension) provides query inspection and cache visibility.
- Network tab shows GraphQL requests and response times.

No production observability in this milestone. Add when the app is deployed beyond localhost.

## Alternatives Considered

### Force-directed graph visualization instead of tree

A force-directed graph rendering all discovery nodes with edges between them. Visually striking and directly represents the graph model.

**Why not:** Force-directed layouts are notoriously difficult to make navigable for working purposes. They look good in demos but are hard to read when the graph has more than ~20 nodes. The tree view provides the same structural information in a more immediately usable form. Graph visualization is a strong second interaction paradigm to add later, not the foundation.

### Next.js instead of Vite + React

Full-stack framework with SSR, file-based routing, and API routes.

**Why not:** The API already exists in `apps/api`. SSR adds complexity with no benefit — this is a single-user tool hitting a local API, not a public site that needs SEO or fast first-byte times. Vite is lighter, faster in dev, and more appropriate for a dense client-side application.

### urql instead of Apollo Client

Lighter GraphQL client with a simpler mental model and smaller bundle.

**Why not chosen:** Apollo Client's normalized cache is a genuine advantage for graph data — updating a node in one query automatically updates it everywhere. The server already uses Apollo. The ecosystem familiarity reduces context switching. The bundle size difference is negligible for a professional tool.

### Relay instead of Apollo Client

Facebook's GraphQL client with compiler-driven data fetching and fragment co-location.

**Why not:** Relay requires specific server conventions (Node interface, connection-based pagination, `clientMutationId`) that the @neo4j/graphql-generated schema doesn't follow. Adapting would require significant server changes. Apollo Client works with any valid GraphQL schema.

### Putting components in `packages/ui` from the start

Extracting shared components into a workspace package for reuse across future apps.

**Why not yet:** Premature extraction. There's one consumer (`apps/web`). When a second app needs shared components, extraction is straightforward. Starting with extraction adds build complexity (component library bundling, exports config) without a consumer to validate the API.

## Open Questions

1. **Typeface selection.** The design system specifies a geometric sans-serif "in the ABC Diatype / Neue Haas Grotesk register" but defers the specific choice. For the initial build, we can use the system font stack or a placeholder like `Inter` (despite the design system explicitly rejecting it for production). The typeface should be selected before any external-facing deployment.
   - **Who decides:** Design direction (user).
   - **Impact:** Affects the feel of the UI significantly but not the architecture. Can be swapped via a single token change.

2. **Monospace font for data values.** The type scale includes a "Data" level (14px mono) for numbers, IDs, and code. Need to select a monospace face that pairs with the chosen sans-serif.
   - **Impact:** Low — any quality monospace works. JetBrains Mono, IBM Plex Mono, or Geist Mono are safe choices.

3. **shadcn/ui `components.json` configuration.** The `components.json` file controls base color scheme, CSS variable prefix, and component style ("default" vs "new-york"). The "new-york" style is sharper and denser — likely a better match for the Etak aesthetic than "default". This should be decided during scaffolding; the choice affects every installed component.
   - **Suggested resolution:** Use "new-york" style, CSS variables enabled, no prefix (tokens are already namespaced).

4. **`untestedAssumptions` schema rewrite.** The current `@cypher` query returns raw nodes that can't resolve `@relationship` fields. A new return type (`UntestedAssumptionWithContext`) and updated Cypher are needed before the assumptions view can show parent idea context. This is a schema change in `packages/graph`, not a UI-only concern.
   - **Suggested resolution:** Implement as part of the first implementation story for the assumptions view. The schema change is small and testable independently.

### Resolved Questions

- **Semantic color values** — Derived from the existing palette and included in the `@theme` block: `--warning` (desaturated amber), `--success` (teal), `--destructive` (desaturated red), `--info` (ocean).
- **API key management for development** — The API supports `DISABLE_AUTH=true` which falls back to the `default` domain. No key management needed for local dev.
- **Domain selector** — Eliminated. The API key determines the domain. Routes no longer include `/:domainSlug`.

## Risks

- **Design token mapping ambiguity.** The design system defines tokens conceptually. Tailwind v4's `@theme` directive uses hex values directly (simpler than v3's HSL-with-opacity pattern), but `color-mix()` for opacity-based borders/text may not work in all browsers. Mitigation: all target browsers (modern Chrome/Firefox/Safari) support `color-mix()`; the approach is sound. Iterate on exact values during component development.

- **GraphQL codegen fragility.** Codegen requires a running API server to introspect the schema. If the server is down or the schema changes, codegen fails. Mitigation: check generated types into git so the build doesn't depend on a running server. Re-run codegen explicitly when the schema changes.

- **Tree rendering at scale.** The opportunity tree is simple at typical scale (tens of nodes) but could get unwieldy if a single opportunity has many ideas, each with many assumptions. Mitigation: tree nodes are collapsed by default; only the selected path is expanded. Virtualized rendering is overkill for now but available via `react-window` if needed.

- **Tailwind CSS 4 maturity.** Tailwind v4 has been stable since early 2025 but uses a fundamentally different config model (CSS-first, no JS config). Some shadcn/ui documentation and examples may still reference v3 patterns. Mitigation: the `@tailwindcss/vite` plugin and `@theme` directive are well-documented. If specific shadcn/ui components assume v3 config, adapt during installation. Tailwind v3 is a fallback if v4 causes problems — the token values are portable.

- **Apollo Client bundle size.** Apollo Client is the heaviest option (~40KB gzipped). For a professional tool, this is acceptable. If load time becomes a concern, the `@apollo/client/core` import can reduce the footprint by excluding React-specific code that isn't needed.

- **Detail query waterfall.** Lazy-loading node detail on selection means the user sees a brief loading state when clicking a tree node for the first time. Mitigation: Apollo's normalized cache makes re-selections instant. The detail query targets a single node by ID — response times should be under 50ms. If the flash is distracting, prefetch on hover.
