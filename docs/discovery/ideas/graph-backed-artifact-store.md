---
name: "Graph-backed artifact store with GraphQL API"
type: idea
status: building
addresses:
  - no-computational-model-for-opportunity-exploration
delivered_by:
  - graph-backed-artifact-store
---

## Description

Build a persistent graph database as the canonical store for all Forge discovery and development artifacts, exposed through a GraphQL API that both AI agents and human-facing UIs use as their single source of truth.

The graph model maps directly to the existing Forge artifact taxonomy:

- **Nodes**: Objective, Opportunity, Idea, Assumption, Experiment, Evidence, Initiative, Project, Epic, Story, Task, Spec, ADR, and meta types (Interview, Discussion, Decision)
- **Edges**: Typed relationships — `supports`, `addresses`, `assumed-by`, `tests`, `evidenced-by`, `contradicted-by`, `related-to`, `depends-on`, etc.

Each node carries structured metadata (type, status, confidence, timestamps), rich body content (Markdown), and provenance. Each edge carries a relationship type, confidence score, source (human vs. AI-proposed), and attribution.

### Multi-tenancy model

- **Organization**: Top-level tenant. Maps to a company or team.
- **Domain**: A bounded product area within an organization. Contains all discovery and development artifacts for that product. Analogous to a Jira Project or Linear Team in scope — the space where a product team does their work.
- **User**: Belongs to an Organization, has access to one or more Domains (role-enforced).

Build Organization, Domain, and User into the graph schema from day one. Enforce access at the Domain level via API key per domain initially; defer RBAC, Teams, and OAuth to when the collaboration features demand them. The `MEMBER_OF` edge between User and Domain carries a `role` field (placeholder: `"member"`) ready for future enforcement.

### GraphQL API

- Node CRUD with typed schemas per artifact type
- Relationship traversal ("all untested assumptions for ideas addressing opportunity X")
- Graph queries (find paths, orphaned nodes, confidence propagation)
- Filtering, pagination, search hooks (for future vector/embedding integration)

Initial scope is the data store and API layer only — UIs, migration tooling, and real-time collaboration are out of scope.

## Why This Could Work

The Forge artifact model is already a typed property graph — the relationships are well-defined. Storing them in a native graph database makes the implicit structure explicit and queryable:

- Relationship traversal becomes a DB query instead of a file scan
- Referential integrity is enforced at write time
- AI agents get a structured API to read, write, and reason about the opportunity space
- Health checks and analytics ("which branches of the tree are thin?") run in milliseconds

GraphQL fits because the artifact space is deeply relational and callers have widely varying data needs — an AI agent surfacing assumptions needs a different subgraph than a UI rendering the tree sidebar.

More importantly, a computational graph model is the prerequisite for everything in the Forge Workspace vision: spatial arrangement with semantic interpretation, AI-assisted incremental formalization, collaborative knowledge building, and confidence propagation across the tree.

## Open Questions

- **Schema versioning**: The artifact taxonomy will evolve. How do we handle graph schema migrations without painful downtime?
- **Read model for agents**: GraphQL queries, subscriptions, or a separate event stream for agents that need to react to changes?
- **Embedding integration**: Where do vector embeddings live — as node properties in Neo4j, in a separate vector store, or both?
