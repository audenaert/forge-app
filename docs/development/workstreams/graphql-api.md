---
name: "GraphQL API"
type: workstream
project: graph-backed-artifact-store
owner: null
status: active
interface_contracts:
  - "GraphQL endpoint — typed queries and mutations for all artifact types, relationship management, traversal queries, and graph health. Domain-scoped via API key auth."
integration_points:
  - milestone: m1-discovery-graph-end-to-end
    description: "API server must expose CRUD + traversal for 5 discovery types. Depends on graph data layer delivering discovery types."
  - milestone: m2-full-artifact-taxonomy
    description: "CRUD + hierarchy queries for development types. Depends on graph data layer delivering development types."
  - milestone: m3-multi-tenant-auth
    description: "API key middleware + @authorization directives. Depends on graph data layer delivering tenancy schema."
---

## Scope

The GraphQL API server that exposes the graph data layer over HTTP. Handles schema definition, resolver implementation, auth middleware, and error handling.

Lives in `apps/api` within the monorepo.

### Includes

- Apollo Server with TypeScript
- GraphQL SDL schema + codegen for typed resolvers
- Resolvers for all artifact types (discovery + development + tenancy)
- Traversal and analytics query resolvers
- API key auth middleware (key-per-domain)
- Domain scoping on all queries
- Health check, error handling, logging

### Excludes

- Direct Neo4j/Cypher access (all through packages/graph)
- UI serving
- Real-time subscriptions (deferred)
