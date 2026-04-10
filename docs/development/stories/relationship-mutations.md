---
name: "Relationship mutations"
type: story
status: draft
parent: discovery-artifact-api
children:
  - test-relationship-mutations
workstream: graphql-api
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "Create a node and connect it to an existing node in a single mutation (e.g., create Opportunity with supports: {connect: {where: {node: {id: objId}}}})"
  - "Disconnect a relationship without deleting either node"
  - "Relationship filtering works: query Opportunities WHERE supports_SOME matches a specific Objective"
  - "Create a full chain in sequence: Objective → Opportunity → Idea → Assumption → Experiment, each connected via the appropriate relationship"
  - "Querying from any node in the chain traverses correctly in both directions"
---

## Description

Verify that relationship connect/disconnect operations and relationship-based filtering work correctly through the GraphQL API. Tests the full discovery chain creation and bidirectional traversal.
