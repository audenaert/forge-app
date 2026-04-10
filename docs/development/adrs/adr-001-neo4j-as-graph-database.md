---
name: "ADR-001: Use Neo4j as the graph database"
type: adr
status: accepted
for: graph-backed-artifact-store
superseded_by: null
---

## Context

Forge Workspace needs a persistent store for a typed property graph of product discovery and development artifacts (~16 node types, ~15 edge types). The core operations are: CRUD on typed nodes, relationship traversal, subgraph extraction, and graph analytics (orphaned nodes, thin branches, confidence propagation). The data is inherently and deeply relational — the entire value proposition depends on efficiently traversing connections between artifacts.

## Decision

Use **Neo4j** (Community Edition, run via Docker for local development) as the graph database.

## Alternatives Considered

### PostgreSQL with Apache AGE extension

**What it is:** AGE adds openCypher graph query support to Postgres, letting you store graph data alongside relational data in a single database.

**Why it's viable:** Teams already familiar with Postgres. Single database to operate. SQL for non-graph queries. Mature backup/replication story.

**Why we didn't choose it:** AGE is relatively young and less battle-tested than Neo4j for graph-native workloads. The Cypher dialect support lags behind Neo4j's. Graph traversal performance degrades compared to a native graph store because the underlying storage is still relational (adjacency via joins, not pointer-based traversal). We'd also lose access to Neo4j's ecosystem — the @neo4j/graphql library, the JavaScript driver, the graph data science library, and the visualization tooling.

### Embedded/lightweight graph (e.g., Oxigraph, SQLite + manual graph layer)

**What it is:** An embedded graph store or a hand-rolled graph layer on top of SQLite, running in-process.

**Why it's viable:** Zero operational overhead. No Docker dependency. Simple deployment.

**Why we didn't choose it:** The multi-tenant, collaborative nature of Forge Workspace requires a server-accessible database, not an embedded one. Oxigraph is RDF/SPARQL-oriented (not a property graph). A hand-rolled layer on SQLite would require reimplementing traversal, indexing, and constraint logic that Neo4j provides natively.

### Amazon Neptune

**What it is:** AWS managed graph database service supporting both property graph (openCypher) and RDF (SPARQL).

**Why it's viable:** Fully managed, scales with AWS infrastructure, no operational overhead.

**Why we didn't choose it:** Vendor lock-in to AWS. Cannot run locally for development without a remote instance or a mock. Significantly more expensive for development and testing. The @neo4j/graphql library and driver ecosystem doesn't apply.

## Consequences

- **Positive:** Native graph storage with pointer-based traversal. Mature Cypher query language. Rich TypeScript driver (neo4j-driver v6). Direct integration with @neo4j/graphql for auto-generated GraphQL API. Large community, extensive documentation, GraphAcademy training resources.
- **Positive:** Docker Compose makes local development straightforward. Neo4j Community Edition is free and open source.
- **Negative:** Adds Docker as a development dependency. Teams unfamiliar with Cypher have a learning curve. Operational complexity increases when deploying to production (though Neo4j Aura provides a managed option).
- **Negative:** Neo4j Community Edition has limitations (single database, no clustering). Scaling to production will likely require Neo4j Aura or Enterprise Edition.
