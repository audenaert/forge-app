---
name: "Infrastructure & connection"
type: epic
status: draft
parent: graph-backed-artifact-store
children: []
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
---

## Scope

Stand up Neo4j for local development and build the TypeScript connection layer that all other epics depend on.

### Stories (initial)

- Docker Compose with Neo4j + health check
- TypeScript Neo4j driver with connection pooling
- Schema constraint and index management (migration-friendly)
