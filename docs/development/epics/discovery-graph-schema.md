---
name: "Discovery graph schema"
type: epic
status: draft
parent: graph-backed-artifact-store
children: []
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
---

## Scope

Model the 5 core discovery artifact types and their relationships in Neo4j, with a typed data access layer.

### Stories (initial)

- Objective, Opportunity, Idea, Assumption, Experiment nodes with all schema fields
- Typed edges — supports, addresses, assumed_by, tests, evidenced_by, contradicted_by, result_informs
- Traversal queries — opportunity subgraph, untested assumptions, evidence chains
