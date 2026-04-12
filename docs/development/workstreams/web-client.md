---
name: "Web client"
type: workstream
project: discovery-explorer-ui
owner: null
status: active
interface_contracts:
  - "Web client — reads the discovery graph via the GraphQL API using an API key. Renders artifact pages with hypertext navigation, the tree projection (rooted at objective or opportunity), the dashboard, and the untested assumptions list, all for a single domain. No writes in this milestone."
integration_points:
  - milestone: m1-web-discovery-explorer
    description: "First read-only client. Depends on apps/api exposing the discovery queries (objectiveSubgraph, opportunitySubgraph, discoveryHealth, untestedAssumptions, orphan queries) and on packages/graph delivering the discovery-schema-additions story (new objectiveSubgraph, rewritten untestedAssumptions, per-type orphan queries)."
---

## Scope

The web client workspace that renders the discovery graph for human collaborators. Lives in `apps/web` within the monorepo and consumes `apps/api` via GraphQL.

### Includes

- `apps/web` Vite + React 19 + TypeScript workspace
- Tailwind CSS v4 with CSS-first `@theme` tokens implementing the Etak design system
- shadcn/ui (new-york style) + Radix primitives + Lucide icons
- Apollo Client + GraphQL codegen against the live `apps/api` schema
- TanStack Router with type-safe routes and route-level loaders
- AppShell with sidebar + optional tree rail + main content area
- Generic ArtifactPage shell and per-type wrappers for all five discovery types
- ArtifactLink primitive (the lateral-navigation surface) and RelationshipList
- Tree projection rooted at objective and at opportunity, with the "Unrooted at this level" disclosure
- Discovery dashboard with health bar, objective list, and orphan sections
- Untested assumptions list view
- Seed script for a dedicated `seed` domain

### Excludes

- Mutations / CRUD UI (read-only for this milestone)
- Spatial / canvas / force-directed graph visualization (long-term direction in ADR-003, not this milestone)
- Shared `packages/ui` — premature with a single consumer
- Production hosting, CSP, telemetry
