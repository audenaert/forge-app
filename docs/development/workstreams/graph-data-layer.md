---
name: "Graph Data Layer"
type: workstream
project: graph-backed-artifact-store
owner: null
status: active
interface_contracts:
  - "ArtifactRepository — typed TypeScript API for CRUD, relationship management, and traversal queries over Neo4j. All methods domain-scoped. No Cypher leaks to consumers."
integration_points:
  - milestone: m1-discovery-graph-end-to-end
    description: "Data layer must support 5 discovery node types + typed edges + custom resolvers (opportunitySubgraph, untestedAssumptions, discoveryHealth) before API workstream can integrate"
  - milestone: m2-full-artifact-taxonomy
    description: "Development types + cross-graph bridge ready for API workstream"
  - milestone: m3-multi-tenant-auth
    description: "Organization, Domain, User nodes + membership edges ready for auth middleware"
---

## Scope

Everything below the API layer: Neo4j connection management, graph schema (constraints, indexes), and a typed TypeScript data access layer that encapsulates all Cypher queries.

Lives in `packages/graph` within the monorepo.

### Includes

- Docker Compose for local Neo4j
- Neo4j TypeScript driver with connection pooling
- Schema constraint and index management
- Node CRUD for all artifact types (discovery + development + tenancy)
- Edge CRUD for all relationship types
- Traversal queries (opportunity subgraph, untested assumptions, evidence chains, graph health)
- Domain scoping baked into all queries

### Excludes

- HTTP/GraphQL concerns
- Auth middleware
- Any UI or CLI tooling
