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
  postcss.config.js
  tailwind.config.ts
  components.json              # shadcn/ui config
  src/
    main.tsx                   # React root, Apollo Provider, Router
    App.tsx                    # Route definitions
    lib/
      apollo.ts               # Apollo Client setup
      graphql/
        queries.ts             # Hand-written queries (typed via codegen)
        generated/             # GraphQL codegen output
    components/
      ui/                     # shadcn/ui primitives, themed to Etak
      layout/
        AppShell.tsx           # Sidebar + main content area
        Sidebar.tsx            # Domain selector + navigation
      discovery/
        DiscoveryDashboard.tsx # Health stats + entry point
        ObjectiveList.tsx      # Top-level objectives for a domain
        OpportunityTree.tsx    # Expandable tree: Opp → Ideas → Assumptions → Experiments
        NodeDetail.tsx         # Right panel: full detail for selected node
        HealthBar.tsx          # Discovery health summary widget
    styles/
      tokens.css              # Etak design tokens as CSS custom properties
      globals.css              # Tailwind directives + token imports
```

No `packages/ui` yet. Everything lives in `apps/web` until a second consumer needs shared components.

### Tech stack

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| Build | Vite | 6.x | ESM-native, fast HMR, matches monorepo's module strategy |
| Framework | React | 19.x | Standard for dense interactive UIs. Concurrent features useful for tree rendering. |
| Routing | TanStack Router | 1.x | Type-safe route params. Route-level data loading via `loader`. Better TS integration than React Router. |
| GraphQL client | Apollo Client | 3.x | Matches Apollo Server in `apps/api`. Normalized cache handles graph data well. `useQuery`/`useSuspenseQuery` hooks. |
| GraphQL codegen | `@graphql-codegen/cli` | 5.x | Generates TypeScript types + typed document nodes from `.graphql` operations against the API schema. |
| Styling | Tailwind CSS | 4.x | Utility-first. Design tokens from `system.md` map directly to theme config. |
| Components | shadcn/ui + Radix | latest | Accessible primitives. Copy-paste model means full control over styling. Already selected in `.forge/designer/`. |
| Icons | Lucide React | latest | Pairs with shadcn/ui. Consistent stroke weight. |
| Testing | Vitest + Testing Library | latest | Matches monorepo test runner. Component tests via `@testing-library/react`. |

### Design token implementation

The design system in `.interface-design/system.md` defines tokens abstractly. The web client implements them as CSS custom properties consumed by Tailwind.

`styles/tokens.css`:
```css
:root {
  /* Brand */
  --ocean: 207 61% 28%;          /* #1B4F72 in HSL */
  --teal: 166 74% 32%;           /* #148F77 */
  --sand: 34 73% 87%;            /* #F5E6C8 */
  --deep: 213 52% 11%;           /* #0D1B2A */

  /* Surfaces */
  --surface-base: 0 0% 100%;
  --surface-raised: 210 14% 98%;
  --surface-overlay: 210 14% 97%;
  --surface-sunken: 214 10% 95%;

  /* Borders */
  --border-subtle: var(--deep) / 0.06;
  --border-default: var(--deep) / 0.12;
  --border-emphasis: var(--deep) / 0.20;
  --border-focus: var(--ocean) / 0.60;

  /* Text */
  --text-primary: var(--deep);
  --text-secondary: var(--deep) / 0.72;
  --text-tertiary: var(--deep) / 0.50;
  --text-muted: var(--deep) / 0.35;

  /* Spacing — consumed via Tailwind spacing scale */
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

Tailwind config extends the default theme with these tokens so utility classes like `bg-ocean`, `text-deep`, `border-border-default`, `rounded-sm` map to the Etak palette.

### Information architecture

The UI has three levels of navigation:

```
Domain selection → Discovery dashboard → Node detail
```

**Routes:**

| Route | View | Data |
|---|---|---|
| `/` | Redirect to first domain or domain picker | `domains` query |
| `/:domainSlug` | Discovery dashboard: health bar + objective list | `discoveryHealth`, `objectives` |
| `/:domainSlug/opportunity/:id` | Opportunity subgraph tree + selected node detail | `opportunitySubgraph` |
| `/:domainSlug/assumptions` | Untested assumptions list (filtered) | `untestedAssumptions` |

### Layout: AppShell

Two-region layout, not three. The sidebar is minimal — domain selector and top-level navigation links. The main content area handles all the detail work.

```
┌──────────┬────────────────────────────────────────────────────┐
│          │                                                    │
│ Sidebar  │  Main content area                                 │
│          │                                                    │
│ [Domain] │  ┌──────────────────────────────────────────────┐  │
│          │  │ Health bar (discovery health stats)           │  │
│ Discover │  └──────────────────────────────────────────────┘  │
│  ├ Tree  │  ┌──────────────────────┬───────────────────────┐  │
│  └ Gaps  │  │                      │                       │  │
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
                                    ⚠ 5 untested high-importance assumptions  ⚠ 2 orphaned opportunities
```

Warning indicators use `--sand` background tinting (warm attention, not red alarm) for items needing attention. The health bar is a navigation affordance — clicking "5 untested" navigates to the filtered assumptions view.

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
- **Body:** Markdown-rendered body text (read-only)
- **Relationships:** List of connected nodes, clickable to navigate. "Supports → Objective X", "Tested by → Experiment Y"

The detail panel uses the gravitational hierarchy principle: the node name and status are dominant, metadata is secondary, relationships are tertiary.

### Untested assumptions view (`/:domainSlug/assumptions`)

A focused list view powered by the `untestedAssumptions` query. Filterable by importance level. Each assumption links back to its parent idea and opportunity. This view answers the question: "What don't we know yet, and how important is it?"

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

query ObjectivesWithOpportunities($domainSlug: String!) {
  objectives(where: { domain: { slug: $domainSlug } }) {
    id
    name
    status
    body
    supportedBy {
      id
      name
      status
      hmw
    }
  }
}

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

query UntestedAssumptions($domainSlug: String!, $minImportance: String) {
  untestedAssumptions(domainSlug: $domainSlug, minImportance: $minImportance) {
    id
    name
    status
    importance
    evidence
    body
    assumedBy {
      id
      name
    }
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
    'X-Api-Key': import.meta.env.VITE_API_KEY ?? '',
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

API key is passed via environment variable. In development, `.env.local` holds the key for the default domain.

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

The existing `apps/api` already includes `cors` as a dependency. Verify it allows `localhost:5173` (Vite's default dev port). If not, update the CORS origin list.

### Development workflow

```bash
# Terminal 1: Neo4j
docker compose up neo4j

# Terminal 2: API server
npm run dev --workspace=apps/api

# Terminal 3: Web client
npm run dev --workspace=apps/web
```

Turborepo's `dev` script should start both `apps/api` and `apps/web` in parallel. The web client proxies GraphQL requests to the API in development (or uses the direct URL via env var).

### Seed data

The web UI is useless on an empty graph. The existing test suite creates data via GraphQL mutations but tears it down afterward. We need a persistent seed script that populates a domain with representative discovery data:

- 2-3 objectives
- 4-5 opportunities (some supporting objectives, some orphaned)
- 6-8 ideas across the opportunities
- 10-12 assumptions (mix of untested, validated, invalidated; mix of importance levels)
- 4-5 experiments (mix of complete with results and planned)

This seed data should exercise all the visual states the UI needs to render. A `seed.ts` script in `packages/graph` that runs via `tsx` and calls the GraphQL API.

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

3. **Semantic color values.** The design system defines semantic tokens (`--destructive`, `--warning`, `--success`, `--info`) as "to be refined during component development." The tree view needs at least `--warning` (for untested assumptions) and `--success` (for validated experiments). Propose deriving these from the existing palette during implementation.
   - **Suggested resolution:** Derive during component build, present to user for approval.

4. **API key management for development.** The current API uses a hashed API key per domain. The web client needs a key to authenticate. Options: (a) hard-code a dev key in `.env.local`, (b) add a "no-auth" mode for local dev, (c) add a key-creation CLI command.
   - **Suggested resolution:** (a) is simplest and sufficient. The seed script can create a domain with a known dev key.

## Risks

- **Design token mapping ambiguity.** The design system defines tokens conceptually. Translating them to Tailwind CSS 4's theme config (which uses CSS custom properties natively) requires decisions about HSL encoding, opacity handling, and color function syntax that may not perfectly match the spec'd values. Risk is cosmetic, not structural — iterate on the exact values during component development.

- **GraphQL codegen fragility.** Codegen requires a running API server to introspect the schema. If the server is down or the schema changes, codegen fails. Mitigation: check generated types into git so the build doesn't depend on a running server. Re-run codegen explicitly when the schema changes.

- **Tree rendering at scale.** The opportunity tree is simple at typical scale (tens of nodes) but could get unwieldy if a single opportunity has many ideas, each with many assumptions. Mitigation: tree nodes are collapsed by default; only the selected path is expanded. Virtualized rendering is overkill for now but available via `react-window` if needed.

- **Tailwind CSS 4 maturity.** Tailwind v4 is relatively new (released early 2025). Some ecosystem tools (IDE plugins, older PostCSS configs) may lag. Mitigation: Tailwind v3 is a fallback if v4 causes problems. The token structure is compatible with both.

- **Apollo Client bundle size.** Apollo Client is the heaviest option (~40KB gzipped). For a professional tool, this is acceptable. If load time becomes a concern, the `@apollo/client/core` import can reduce the footprint by excluding React-specific code that isn't needed.
