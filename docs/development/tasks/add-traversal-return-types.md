---
name: "Add traversal return types to SDL"
type: task
status: todo
parent: custom-traversal-queries
workstream: graph-data-layer
---

Add non-`@node` projection types to `discovery.graphql`:
- `ExperimentSummary` (id, name, status, method, result)
- `AssumptionWithExperiments` (id, name, status, importance, evidence, experiments)
- `IdeaWithAssumptions` (id, name, status, assumptions)
- `OpportunitySubgraph` (id, name, status, hmw, ideas)
- `DiscoveryHealth` (8 Int! count fields)
