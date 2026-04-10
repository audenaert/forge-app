---
name: "ADR-002: Use @neo4j/graphql for the API layer"
type: adr
status: accepted
for: graph-backed-artifact-store
superseded_by: null
---

## Context

The project needs a GraphQL API exposing ~16 node types and ~15 edge types with CRUD, relationship management, traversal queries, and domain-scoped authorization. We need to choose between building the GraphQL layer manually (with full control) or using a library that auto-generates it from schema definitions.

## Decision

Use **@neo4j/graphql** (v7.x) with Apollo Server 4 as the GraphQL API layer. Define the artifact schema in SDL with Neo4j directives (`@node`, `@relationship`, `@cypher`, `@authorization`). The library auto-generates CRUD queries, mutations, filtering, sorting, and pagination from the type definitions. Custom traversal queries use `@cypher` directives with hand-written Cypher.

### Graph modeling approach

Each artifact type maps to a distinct Neo4j label via `@node` (one label per type, not a generic `Artifact` node). This follows naturally from @neo4j/graphql's design — each GraphQL type with `@node` becomes a Neo4j label with its own property set.

```graphql
type Opportunity @node {
  id: ID! @id
  name: String!
  status: OpportunityStatus!
  hmw: String
  supports: [Objective!]! @relationship(type: "SUPPORTS", direction: OUT)
  addressedBy: [Idea!]! @relationship(type: "ADDRESSES", direction: IN)
  domain: Domain! @relationship(type: "BELONGS_TO", direction: OUT)
}
```

From this definition, the library generates: `opportunities` query (with filtering on any field, including through relationships), `opportunitiesConnection` (cursor-based pagination), `createOpportunities`, `updateOpportunities`, `deleteOpportunities`, and relationship connect/disconnect operations.

### Domain scoping

All artifact types include a `domain: Domain! @relationship(type: "BELONGS_TO", direction: OUT)` relationship. Domain scoping is enforced via `@authorization(filter: ...)` directives that match the authenticated domain from the request context, ensuring queries only return artifacts belonging to the caller's domain.

## Alternatives Considered

### Pothos GraphQL (code-first) + neo4j-driver

**What it is:** A TypeScript-first GraphQL schema builder where types are defined programmatically. The data layer wraps neo4j-driver directly, encapsulating all Cypher in a repository pattern. Two packages: `packages/graph` (data access) and `apps/api` (Pothos resolvers).

**Why it's viable:** Full type inference with zero codegen. Complete control over every resolver. Clean separation between data access and API layer. Strong TypeScript ergonomics — Pothos is used at Airbnb and Netflix. The data layer would be reusable by non-GraphQL consumers.

**Why we didn't choose it:** The Forge artifact taxonomy has ~16 node types, each needing CRUD + relationship + filtering operations. Writing these manually means ~2000+ lines of resolver code and ~1500+ lines of Cypher queries that @neo4j/graphql generates from ~500 lines of SDL. The "reusable data layer" benefit is speculative — the primary consumers (AI agents and UIs) all use GraphQL. If a non-GraphQL consumer emerges later, it can be a GraphQL client or the data layer can be extracted then.

### SDL-first + graphql-codegen + neo4j-driver

**What it is:** Write GraphQL SDL manually, generate TypeScript types with graphql-codegen, write resolvers that call neo4j-driver through a data access layer.

**Why it's viable:** Industry-standard approach. Schema is human-readable. Generated types keep SDL and resolvers in sync. Full control over Cypher queries.

**Why we didn't choose it:** Same code volume problem as Pothos — every CRUD operation must be manually implemented. Codegen adds a build step and introduces sync issues between SDL and implementation. @neo4j/graphql already IS an SDL-first approach, but with auto-generated resolvers.

## Consequences

- **Positive:** Dramatic reduction in boilerplate. ~500 lines of SDL replaces ~3000+ lines of manual resolver and Cypher code for M1. Auto-generated CRUD with filtering, pagination, and sorting for all types.
- **Positive:** `@cypher` directives give us full Cypher power for custom traversal queries while keeping them co-located with the type definitions.
- **Positive:** `@authorization` handles domain scoping declaratively, preparing for RBAC without custom middleware.
- **Positive:** Built-in Neo4j query optimization (batching, efficient Cypher generation).
- **Negative:** Coupling to @neo4j/graphql's abstraction. If the library's auto-generated API doesn't match a specific need, we work around it with `@cypher` or escape to the driver level.
- **Negative:** Less separation between data and API layers. The SDL is both the GraphQL schema and the Neo4j schema. This is a feature for this use case but reduces flexibility if non-GraphQL access is needed.
- **Negative:** If @neo4j/graphql is deprecated or changes direction, migration would be significant. Mitigated by the library being actively maintained (v7.x, managed GraphQL service launched on Neo4j Aura in 2025).
- **Risk:** The library's `@authorization` directives must cleanly handle our multi-tenant domain scoping pattern. If they don't, we fall back to context-level middleware — still viable, just less elegant.
