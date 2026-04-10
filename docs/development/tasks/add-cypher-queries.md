---
name: "Add @cypher traversal queries"
type: task
status: done
parent: custom-traversal-queries
workstream: graph-data-layer
---

Add three `@cypher` queries to the SDL (in `discovery.graphql` or a separate `queries.graphql`):

1. `opportunitySubgraph(opportunityId, domainSlug)` — nested CALL {} subqueries aggregating from leaves inward (Experiments → Assumptions → Ideas → Opportunity)
2. `untestedAssumptions(domainSlug, minImportance?)` — UNTESTED status, no TESTS edges, optional importance filter
3. `discoveryHealth(domainSlug)` — 8 isolated CALL {} subquery counts

All queries use `CALL {}` subqueries per the spike-validated pattern.
