---
name: "Discovery artifact API"
type: epic
status: draft
parent: graph-backed-artifact-store
children:
  - crud-mutations-discovery
  - relationship-mutations
  - integration-test-suite
workstream: graphql-api
milestone: m1-discovery-graph-end-to-end
---

## Scope

GraphQL queries and mutations for the 5 core discovery artifact types and their relationships.

### Stories (initial)

- CRUD mutations for Objective, Opportunity, Idea, Assumption, Experiment
- Relationship mutations — link/unlink nodes with typed edges
- Traversal queries — opportunity tree, assumption coverage, evidence chains
