---
name: "Test BELONGS_TO domain scoping"
type: task
status: done
parent: typed-relationship-edges
workstream: graph-data-layer
---

Write integration tests verifying domain scoping:
- Create artifacts in domain A and domain B
- Query with domain filter — verify only domain A's artifacts returned
- Traversal queries (opportunitySubgraph, untestedAssumptions, discoveryHealth) respect domain boundaries
- All 5 types correctly link to Domain via BELONGS_TO
