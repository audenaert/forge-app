---
name: "Web UI: Discovery Explorer"
type: spec
status: draft
for: graph-backed-artifact-store
adrs: []
---

## Context

The graph-backed artifact store now has a working API layer — Neo4j stores discovery and development artifacts, Apollo Server exposes them via GraphQL, and traversal queries like `opportunitySubgraph` and `discoveryHealth` return structured subgraphs. The data model works. No one can see it.

This spec covers the first web client: a read-only discovery explorer that makes the discovery graph visible and navigable. The goal is to prove that a graph-backed model produces a qualitatively different experience from flat artifact lists — you can read any artifact in context, follow typed relationships sideways across the graph, see the hierarchical chain from objective to experiment result, identify untested assumptions at a glance, and notice the disconnected pockets that signal missing structure.

The information architecture is built on **two complementary projections of one graph**:

1. **Hypertext navigation** is the primary read model. Every artifact has its own canonical URL, and every typed relationship in the artifact's body or metadata is a hyperlink that takes you to the related artifact. This is how the non-hierarchical graph is actually traversed: laterally, by clicking through implications and dependencies.
2. **The tree projection** is an orientation device. The Objective → Opportunity → Idea → Assumption → Experiment view maps onto familiar ticketing-system intuitions and makes hierarchy legible. It is one *projection* of the graph, not the graph itself, and it is one of several entry points into the artifact pages where most reading happens.

Read-only is a deliberate choice for this milestone. CRUD comes next, once the information architecture is validated by actual use. Editing will eventually be a mixed-initiative collaborative process — humans and AI agents proposing, reviewing, and accepting changes — with different interactions and different backend tools per artifact type. None of that is in scope here, but the foundation should not preclude it.

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
        DiscoveryDashboard.tsx # Health bar + objective list + orphan signals
        HealthBar.tsx          # Discovery health summary widget
        ObjectiveList.tsx      # Objectives for the domain (with orphan sections)
        TreeProjection.tsx     # Expandable tree rooted at an objective
        UntestedAssumptionsList.tsx # Filtered list view
      artifact/
        ArtifactPage.tsx       # Generic artifact route shell — header, body, relationships
        ArtifactHeader.tsx     # Type icon, name, status badge, type-specific metadata
        ArtifactBody.tsx       # Markdown body via react-markdown + remark-gfm
        RelationshipList.tsx   # Typed-relationship hyperlinks (the lateral nav surface)
        ArtifactLink.tsx       # Inline link primitive: type icon + name → /<type>/:id
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

The route table reflects the two-projection IA: artifact pages are first-class destinations with canonical URLs, the tree is one projection that gets you into them, and the dashboard plus filtered list views are additional entry points.

| Route | View | Data |
|---|---|---|
| `/` | Dashboard: health bar, objective list, orphan signals | `discoveryHealth`, `objectives`, orphan queries |
| `/objective/:id` | Objective artifact page | `ObjectiveDetail` |
| `/opportunity/:id` | Opportunity artifact page | `OpportunityDetail` |
| `/idea/:id` | Idea artifact page | `IdeaDetail` |
| `/assumption/:id` | Assumption artifact page | `AssumptionDetail` |
| `/experiment/:id` | Experiment artifact page | `ExperimentDetail` |
| `/tree/objective/:id` | Tree projection rooted at an objective | `objectiveSubgraph` (see Schema work) |
| `/tree/opportunity/:id` | Tree projection rooted at an opportunity | `opportunitySubgraph` |
| `/assumptions` | Untested assumptions list (filtered) | `untestedAssumptions` |

**Artifact pages are the primary read surface.** The tree projection routes are entry points into them. Clicking a node in the tree navigates to the artifact page; the tree itself remains visible as a persistent left rail when you're on an artifact page that's part of the same subgraph, so the tree's orientation value persists across lateral navigation.

**No breadcrumbs.** The graph is genuinely non-hierarchical — a single idea can be referenced by multiple opportunities, and many artifacts are not connected to a parent at all. A breadcrumb trail would imply a single canonical parent path that does not exist. Upward context is shown instead in the artifact page's `RelationshipList` under sections like "Supports", "Addresses", or "Tested by", and in the tree projection rail when one is open.

### Layout: AppShell

The shell has three regions: a fixed-width navigation sidebar on the far left, an optional tree-projection rail next to it, and the main content area on the right. The tree rail is visible only on routes that are inside a tree projection (`/tree/...`) or on an artifact page reached from within one — otherwise the main content area expands to fill its space.

```
┌──────────┬───────────────┬─────────────────────────────────────┐
│          │               │                                     │
│ Sidebar  │  Tree rail    │  Main content                       │
│          │  (optional)   │                                     │
│ Dashboard│               │  ┌───────────────────────────────┐  │
│ Tree     │  ◆ Objective  │  │ Artifact page                  │  │
│ Gaps     │   ◇ Opp       │  │   (or dashboard, list view,    │  │
│          │    ⚪ Idea    │  │    or empty state)             │  │
│          │     ? Assum   │  │                                │  │
│          │      ⚗ Exp    │  │  Header   (type/name/status)   │  │
│          │   ⚪ Idea     │  │  Body     (markdown)           │  │
│          │  ◇ Opp        │  │  Relationships (links)         │  │
│          │               │  └───────────────────────────────┘  │
│          │  Unrooted ▾   │                                     │
└──────────┴───────────────┴─────────────────────────────────────┘
```

**Sidebar (fixed left).** Navigation links only — no domain selector; the API key determines the domain. Links: Dashboard, Tree, Gaps. Sidebar shares the canvas background per the design system, separated by `--border-default`.

**Tree rail (optional).** When the user is inside a tree projection or has navigated from one to a related artifact page, the rail stays visible so the projection doesn't collapse out of view as soon as you click into a node. Closing the rail (or navigating to an unrelated route) collapses it. The rail includes an "Unrooted" disclosure section listing artifacts of the current type that have no parent in the projection (see "Orphans as a feature" below).

**Main content.** Holds the dashboard, the artifact page, or a filtered list view, depending on the route. Artifact pages are the dominant surface — most reading happens here.

### Discovery dashboard (`/`)

The dashboard is the default landing route. It anchors the user in business value (objectives) and surfaces signals about the shape and health of the discovery space — including the disconnected pockets that point to missing structure.

**Health bar** — A compact row of stats from the `discoveryHealth` query. Not a dashboard of charts — a summary ribbon that communicates the shape of the discovery space at a glance:

```
Objectives: 3  |  Opportunities: 7  |  Ideas: 12  |  Assumptions: 24  |  Experiments: 8
⚠ 5 untested high-importance assumptions  ⚠ 3 ideas with no assumptions  ⚠ 2 orphaned opportunities
```

Warning indicators use `--sand` background tinting (warm attention, not red alarm) for items needing attention. The health signals surfaced are:
- **Untested high-importance assumptions** — the most critical signal; clicking navigates to `/assumptions?importance=HIGH`
- **Ideas with no assumptions** — ideas that haven't been decomposed into testable claims
- **Orphaned opportunities** — opportunities not linked to any objective
- **Unrooted ideas** — ideas not addressing any opportunity (added in this milestone — see "Orphans as a feature")

Each warning is a navigation affordance — clicking it navigates to the relevant filtered view or to the dashboard's orphans section.

**Empty state** — When a domain has zero discovery data, the dashboard shows an `EmptyState` instead of a zeroed-out health bar. It explains what the discovery space is for and that data is currently created via the API or Claude Code, with a pointer to the seed script.

**Objective list** — Below the health bar, objectives listed with their status and the opportunities supporting each. Each objective is a gravitational anchor (heavier typographic weight per the design system). Each objective name links to `/objective/:id`; each supporting opportunity links to `/opportunity/:id`, and a secondary "View tree" affordance opens `/tree/objective/:id`. Everything is rooted in business value: objectives are the top of the dashboard for a reason.

**Orphan sections** — Below the objective list, a disclosure section per artifact type lists artifacts that have no parent in the natural hierarchy: opportunities not supporting any objective, ideas not addressing any opportunity, assumptions not assumed by any idea. These are first-class entries, not warnings buried in a sidebar (see "Orphans as a feature" below for the rationale).

### Orphans as a feature

The graph is not a top-down structure. Ideas don't emerge from anyone's head fully formed; teams sketch opportunities, capture stray ideas, surface assumptions in conversation, and only later trace the connections back to business objectives. Disconnected artifacts and disconnected sub-trees are an expected and informative feature of the discovery space, not a data-quality bug.

The UI surfaces them rather than hiding them:

- **Dashboard orphan sections** list opportunities, ideas, and assumptions that have no parent in the natural hierarchy.
- **Tree projection rail** has an "Unrooted" disclosure under each tree, listing artifacts of the relevant type at that level that aren't connected to the current root.
- **Health bar warnings** treat large numbers of orphans as a signal worth surfacing — but the orphans themselves are navigable and readable, not hidden.

What an orphan signals depends on context: it might be a stray idea waiting to be connected, an opportunity that needs an objective, an assumption that should be linked to multiple ideas, or genuinely standalone work. Surfacing them is what enables that interpretation.

### Artifact pages (`/<type>/:id`)

Artifact pages are the primary read surface and the destination of nearly every navigation action in the app. Every artifact type — Objective, Opportunity, Idea, Assumption, Experiment — has its own canonical route and renders with the same `ArtifactPage` shell:

- **Header.** Type icon + name + status badge. Type-specific metadata (e.g., `hmw` for Opportunity, `importance` / `evidence` for Assumption, `method` / `successCriteria` / `result` / `learnings` for Experiment, `createdAt` / `updatedAt` on every type). The header uses the gravitational hierarchy principle: name and status dominate, metadata is secondary.
- **Body.** Markdown-rendered body text via `react-markdown` with `remark-gfm`. Read-only in this milestone.
- **Relationships.** A `RelationshipList` of every typed connection on the artifact, grouped by relationship name (e.g., for an Idea: "Addresses", "Has assumptions"; for an Assumption: "Assumed by", "Tested by"). Each relationship entry is an `ArtifactLink` — type icon + name + status badge — that navigates to the related artifact's page. **This is the primary lateral navigation surface.** Clicking an "Addresses" link on an Idea page takes you to the Opportunity. Clicking a "Tested by" link on an Assumption takes you to the Experiment. The user walks the graph by following these links.

`ArtifactPage` is generic — the type-specific differences live in the metadata block of the header and the set of relationship sections rendered. Each type has a thin per-type wrapper (`ObjectiveArtifactPage`, `OpportunityArtifactPage`, etc.) that fires the appropriate detail query and passes the result into `ArtifactPage`. This keeps the page shell uniform while leaving room to specialize per type as the mixed-initiative editing phase introduces type-specific interactions.

**Enum display.** GraphQL enums (`FAKE_DOOR`, `USER_INTERVIEW`, `READY_FOR_BUILD`, etc.) are rendered as human-readable labels via a lookup map in `lib/enums.ts` (`FAKE_DOOR` → "Fake Door", `READY_FOR_BUILD` → "Ready for Build", `AB_TEST` → "A/B Test", and so on for every enum used in the discovery schema).

**No parent breadcrumbs.** The artifact page does not render a single hierarchical breadcrumb path, because there isn't necessarily one — an idea may be addressed by multiple opportunities, an assumption may be referenced by multiple ideas, and many artifacts are orphaned. Upward context lives in the `RelationshipList`'s upward sections ("Supports", "Addresses", "Assumed by") and, when the user is inside an active tree projection, in the persistent tree rail.

### Tree projection (`/tree/objective/:id`, `/tree/opportunity/:id`)

The tree projection is one *projection* of the graph: a hierarchical slice rooted at a selected node. It is not the app, but it is a familiar and valuable orientation device — it maps directly to the ticketing-system intuitions teams already have, and it makes hierarchy legible in a way that a force-directed graph render does not.

**Roots.** Objectives are the natural top of the discovery hierarchy — everything is rooted in business value, eventually — so `/tree/objective/:id` is the canonical tree route. `/tree/opportunity/:id` is supported because not every opportunity has yet been connected to an objective, and because direct opportunity-rooted exploration is useful when you're working bottom-up.

**Layout.** The tree renders in the optional left rail of the AppShell. The main content area shows whichever artifact page corresponds to the current selection — defaulting to the root artifact when the user lands on the route, switching to a related artifact when the user clicks a tree node.

```
◆ Objective: "Accelerate product discovery"            [Active]
  ◇ Opportunity: "Teams have no computational model..." [Active]
    ⚪ Idea: "Graph-backed artifact store"               [Building]
      ? Assumption: "Neo4j handles the query patterns"  [Validated]
        ⚗ Experiment: "Spike: @cypher directives"       ✓ Validated
      ? Assumption: "Teams will adopt graph thinking"   [Untested] ⚠
      ? Assumption: "GraphQL is the right API surface"  [Validated]
        ⚗ Experiment: "M1 integration tests"            ✓ Validated
    ⚪ Idea: "Server-side domain enforcement"            [Draft]
      ? Assumption: "Current scoping is insufficient"   [Untested] ⚠
  ◇ Opportunity: "(another opportunity supporting this objective)"
    ...

Unrooted at this level ▾
  ⚪ Idea: "Standalone wiki concept"  (no opportunity)
  ? Assumption: "..."                  (no idea)
```

Visual encoding:
- **Node type** distinguished by a leading icon (not color alone — WCAG compliance). Objective: filled diamond ◆. Opportunity: open diamond ◇. Idea: lightbulb / circle ⚪. Assumption: question mark `?`. Experiment: beaker / flask ⚗.
- **Status** shown as a trailing badge. Color-coded but always with text label.
- **Untested high-importance assumptions** get a warning indicator — the single most important signal for discovery health.
- **Depth** communicated by indentation + connector lines (standard tree UI pattern).

**Click behavior.** Clicking a tree node navigates to the corresponding artifact page (`/idea/:id`, etc.). The tree rail stays visible. The currently selected node is highlighted in the rail to maintain orientation.

**Keyboard navigation.** Arrow keys to move within the tree, Enter to navigate to the focused node's artifact page, Space to toggle expand/collapse, Tab to move focus from the tree rail to the main content area.

**Unrooted section.** Each tree projection includes an "Unrooted at this level" disclosure listing artifacts of the appropriate type that are not part of the current tree — orphan opportunities when looking at an objective tree, orphan ideas when looking at an opportunity tree, etc. These are first-class navigable entries (see "Orphans as a feature" above).

**Data loading strategy.** The subgraph query returns structural fields only (id, name, status, type-specific enums for badges) — no `body` text. The selected node's artifact page fires a separate detail query for the full record (including `body`, `createdAt`, `updatedAt`, and relationship details). This keeps the tree query lean and avoids fetching potentially large markdown bodies for nodes the user never inspects. Apollo Client's normalized cache ensures revisiting a previously loaded artifact is instant.

**Schema work.** The current `opportunitySubgraph` query is a good start but does not cover the `objectiveSubgraph` case. A new `objectiveSubgraph` traversal is needed that returns Objective → Opportunity → Idea → Assumption → Experiment in a single nested response, parallel to the existing query. See "Schema work" below.

### Untested assumptions view (`/assumptions`)

A focused list view powered by the `untestedAssumptions` query. Filterable by importance level. Each row shows the assumption name, importance, and an `ArtifactLink` to its parent idea (and through that idea, its opportunity). Each row is also itself an `ArtifactLink` to `/assumption/:id`. This view answers the question: "What don't we know yet, and how important is it?"

The schema rewrite required to surface parent-idea context is described in "Schema work" below.

### Schema work

This milestone introduces three schema changes in `packages/graph/src/typeDefs/discovery.graphql`. They are all in service of the UI but they belong on the data layer side of the boundary, and they should be reviewed alongside the UI work, not assumed.

**1. `objectiveSubgraph` traversal** — A new `@cypher` query that returns Objective → Opportunity → Idea → Assumption → Experiment as a single nested response. Parallels the existing `opportunitySubgraph`. Required by `/tree/objective/:id`.

**2. `untestedAssumptions` rewrite for parent context** — The current `@cypher` query returns raw `Assumption` nodes. `@cypher` return types do not automatically resolve `@relationship` fields, so the `assumedBy` traversal needed to show "which idea depends on this assumption" does not work as a nested field on the result. The query must be rewritten to explicitly traverse and return parent idea data in the projection — similar to how `opportunitySubgraph` returns nested `IdeaWithAssumptions`. This requires a new return type (`UntestedAssumptionWithContext`) that includes the parent idea's `id` and `name`.

**3. Orphan queries** — `orphanedOpportunities`, `unrootedIdeas`, `unrootedAssumptions`. Each returns artifacts of the given type that have no incoming parent edge in the natural hierarchy. `orphanedOpportunities` already exists as a count in `discoveryHealth`; the new queries return the full nodes so the dashboard and tree rails can list them. These can be implemented as `@cypher` queries on each type or as a single shared `unrooted(type: ArtifactType!)` query — the spec leaves the shape to the implementer, but each must return enough fields for an `ArtifactLink` (id, name, status, plus type-specific badge fields).

All three changes propagate through GraphQL codegen to typed Apollo operations on the client. The rewrite of `untestedAssumptions` is a breaking change for any current consumers; given that the only current consumer is the test suite and the assumptions view doesn't exist yet, this is a clean change to make now.

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

# Subgraph queries return structural fields only — no body text.
# Body is lazy-loaded per node via the Detail queries below (fired by ArtifactPage).
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

# New traversal — Objective → Opportunity → Idea → Assumption → Experiment.
# Parallels opportunitySubgraph but rooted one level higher. Required by the
# /tree/objective/:id route. See "Schema work" below.
query ObjectiveSubgraph($objectiveId: ID!, $domainSlug: String!) {
  objectiveSubgraph(objectiveId: $objectiveId, domainSlug: $domainSlug) {
    id
    name
    status
    opportunities {
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
          experiments { id name status method result }
        }
      }
    }
  }
}

# Orphan queries — drive the dashboard orphan sections and the
# "Unrooted at this level" disclosure in tree projection rails.
# Each returns artifacts of the given type that have no parent
# in the natural hierarchy.
query OrphanedOpportunities($domainSlug: String!) {
  orphanedOpportunities(domainSlug: $domainSlug) {
    id name status hmw
  }
}

query UnrootedIdeas($domainSlug: String!) {
  unrootedIdeas(domainSlug: $domainSlug) {
    id name status
  }
}

query UnrootedAssumptions($domainSlug: String!) {
  unrootedAssumptions(domainSlug: $domainSlug) {
    id name status importance
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

1. **Route loaders** initiate the primary query for each route. The loader calls `client.query()` to warm the Apollo cache before the component mounts.
   - `/` → `discoveryHealth`, `objectives`, orphan queries
   - `/tree/objective/:id` → `objectiveSubgraph`
   - `/tree/opportunity/:id` → `opportunitySubgraph`
   - `/<type>/:id` → the corresponding `<Type>Detail` query
   - `/assumptions` → `untestedAssumptions`
2. **React Suspense boundaries** in the component tree handle loading states. Each route wraps its content in a `<Suspense fallback={...}>` boundary.
3. **`ArtifactPage`** uses `useSuspenseQuery` with the artifact's ID. The detail query fires on mount; Apollo's normalized cache means navigating back to a previously visited artifact is instant.
4. **Tree rail** persists across navigations within the same projection. The subgraph query is fetched once when the user enters `/tree/...`, and subsequent navigation to artifact pages within that projection does not re-fetch it. The rail's selected-node highlight updates from the route params.

This avoids the render-then-fetch waterfall: the route loader starts fetching before the component mounts, and Suspense handles the loading UI declaratively. The hypertext model means most lateral navigation is between artifact pages of similar size, so the loading state is small and brief.

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
- Keyboard navigation throughout: arrow keys for tree traversal, Tab between focus zones (sidebar / tree rail / artifact page), Enter to navigate.
- Node types distinguished by icon + text label, not color alone, in both the tree rail and inline `ArtifactLink` components.
- Status badges include text, not just color.
- Focus management: navigating from a tree node to its artifact page moves focus to the artifact page heading; tree rail retains its selection highlight. Pressing Escape from the artifact page returns focus to the tree node it came from (when applicable).
- Inline `ArtifactLink` components are rendered as semantic `<a>` elements with descriptive accessible names ("Idea: Graph-backed artifact store, status Building") so that screen readers announce both the type and the status, not just the title.
- `prefers-reduced-motion` respected: micro-interactions reduce to instant transitions.
- Semantic HTML: tree rail uses `role="tree"` / `role="treeitem"` with `aria-expanded`. Artifact pages use heading hierarchy (`h1` for the artifact name, `h2` for relationship section labels).

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

### Tree projection as the primary view (instead of hypertext + tree)

A version of the explorer where the expandable tree is the primary view, with a node-detail side panel for the currently selected node. (This was the shape of the spec's first draft.)

**Why not:** The tree projection is one *projection* of a non-hierarchical graph, not the graph itself. Many of the interesting traversals are lateral — "this assumption is referenced by these three ideas," "this experiment invalidated assumptions in two different opportunities" — and a sidebar tree pushes those traversals into a detail panel that's neither linkable nor the primary surface. The hypertext model (artifact pages with clickable typed-relationship links) directly represents lateral navigation; the tree becomes one entry point alongside the dashboard and filtered list views. See the [wiki-style discovery navigator idea](../../discovery/ideas/wiki-style-discovery-navigator.md) and its [critique](../../discovery/critiques/critique-of-wiki-style-discovery-navigator.md) for the discovery thinking that informed this choice.

### Force-directed graph visualization instead of tree

A force-directed graph rendering all discovery nodes with edges between them. Visually striking and directly represents the graph model.

**Why not:** Force-directed layouts are notoriously difficult to make navigable for working purposes. They look good in demos but are hard to read when the graph has more than ~20 nodes. The hypertext + tree-projection combination provides the same structural information in a more immediately usable form. A spatial / canvas rendering of the graph is a long-term direction (see ADR-003), not the foundation for the first read-only milestone.

### Wiki-style editing as v1

A wiki-style editor where users edit artifact pages in place, Notion-style, as the v1 experience.

**Why not in this milestone:** Editing in a graph context is necessarily a mixed-initiative collaborative process with per-artifact-type interactions and backend tools. Building a generic wiki editor first would lock in editing affordances that turn out to be wrong once the agent collaboration model is in place. v1 is read-only on purpose, validating the IA before committing to any editing model. The "wiki" framing was useful for thinking about navigational hypertext — which we adopted — but the editing affordances it implies are deliberately deferred.

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

4. **Tree rail persistence across artifact navigation.** The spec says the tree rail stays open when the user navigates from a tree projection to an artifact page reached from within it. The exact rule for "reached from within it" — same browser session? same project? same artifact type? — needs to be pinned down during implementation. Initial proposal: the rail stays open as long as the user is on an artifact whose ID is present in the currently loaded subgraph; navigating to an artifact outside the subgraph closes the rail (with a "Show in tree" affordance on the artifact page when applicable).
   - **Impact:** Navigation feel. Worth getting right but reversible.

5. **Orphan-query implementation shape.** The schema work calls for `orphanedOpportunities`, `unrootedIdeas`, and `unrootedAssumptions` queries but leaves the choice between per-type queries and a single shared `unrooted(type:)` query open.
   - **Suggested resolution:** Per-type queries. Each can be a one-line `@cypher` that's easy to read in the schema, and the call sites are explicit about what they're asking for.

### Resolved Questions

- **Semantic color values** — Derived from the existing palette and included in the `@theme` block: `--warning` (desaturated amber), `--success` (teal), `--destructive` (desaturated red), `--info` (ocean).
- **API key management for development** — The API supports `DISABLE_AUTH=true` which falls back to the `default` domain. No key management needed for local dev.
- **Domain selector** — Eliminated. The API key determines the domain. Routes no longer include `/:domainSlug`.
- **Hierarchical breadcrumbs** — Rejected. The graph is non-hierarchical and orphan-tolerant; a single canonical parent path does not exist. Upward context is shown via `RelationshipList` sections and the optional tree rail.
- **`untestedAssumptions` schema rewrite** — Moved into "Schema work" as one of three coordinated schema changes for this milestone, alongside `objectiveSubgraph` and the orphan queries.

## Risks

- **Design token mapping ambiguity.** The design system defines tokens conceptually. Tailwind v4's `@theme` directive uses hex values directly (simpler than v3's HSL-with-opacity pattern), but `color-mix()` for opacity-based borders/text may not work in all browsers. Mitigation: all target browsers (modern Chrome/Firefox/Safari) support `color-mix()`; the approach is sound. Iterate on exact values during component development.

- **GraphQL codegen fragility.** Codegen requires a running API server to introspect the schema. If the server is down or the schema changes, codegen fails. Mitigation: check generated types into git so the build doesn't depend on a running server. Re-run codegen explicitly when the schema changes.

- **Tree rendering at scale.** The opportunity tree is simple at typical scale (tens of nodes) but could get unwieldy if a single opportunity has many ideas, each with many assumptions. Mitigation: tree nodes are collapsed by default; only the selected path is expanded. Virtualized rendering is overkill for now but available via `react-window` if needed.

- **Tailwind CSS 4 maturity.** Tailwind v4 has been stable since early 2025 but uses a fundamentally different config model (CSS-first, no JS config). Some shadcn/ui documentation and examples may still reference v3 patterns. Mitigation: the `@tailwindcss/vite` plugin and `@theme` directive are well-documented. If specific shadcn/ui components assume v3 config, adapt during installation. Tailwind v3 is a fallback if v4 causes problems — the token values are portable.

- **Apollo Client bundle size.** Apollo Client is the heaviest option (~40KB gzipped). For a professional tool, this is acceptable. If load time becomes a concern, the `@apollo/client/core` import can reduce the footprint by excluding React-specific code that isn't needed.

- **Detail query waterfall.** Lazy-loading node detail on selection means the user sees a brief loading state when clicking a tree node for the first time. Mitigation: Apollo's normalized cache makes re-selections instant. The detail query targets a single node by ID — response times should be under 50ms. If the flash is distracting, prefetch on hover.
