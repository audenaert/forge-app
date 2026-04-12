---
name: "Web client"
type: workstream
project: discovery-explorer-ui
owner: null
status: active
interface_contracts:
  - "Web client — reads the discovery graph via the GraphQL API using an API key. Renders the Opportunity Solution Tree and discovery health for a single domain. No writes in this milestone."
integration_points:
  - milestone: m1-web-discovery-explorer
    description: "First read-only client. Depends on apps/api exposing the discovery queries (opportunitySubgraph, discoveryHealth, untestedAssumptions) and on packages/graph rewriting untestedAssumptions to return parent idea context."
---

## Scope

The web client workspace that renders the discovery graph for human collaborators. Lives in `apps/web` within the monorepo and consumes `apps/api` via GraphQL.

### Includes

- `apps/web` Vite + React 19 + TypeScript workspace
- Tailwind CSS v4 with CSS-first `@theme` tokens implementing the Etak design system
- shadcn/ui (new-york style) + Radix primitives + Lucide icons
- Apollo Client + GraphQL codegen against the live `apps/api` schema
- TanStack Router with type-safe routes and route-level loaders
- AppShell, discovery dashboard, opportunity subgraph view, untested assumptions view
- Seed script for a dedicated `seed` domain

### Excludes

- Mutations / CRUD UI (read-only for this milestone)
- Graph visualization (force-directed layouts, canvas)
- Shared `packages/ui` — premature with a single consumer
- Production hosting, CSP, telemetry
