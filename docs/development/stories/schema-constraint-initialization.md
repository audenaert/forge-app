---
name: "Schema constraint initialization"
type: story
status: draft
parent: infrastructure-and-connection
children:
  - create-constraints-module
  - test-constraints-idempotent
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "On startup, 6 uniqueness constraints are created: domain_slug, objective_id, opportunity_id, idea_id, assumption_id, experiment_id"
  - "On startup, 2 indexes are created: opp_domain_status, assumption_domain_status"
  - "All constraint/index statements use IF NOT EXISTS — running twice is idempotent with no errors"
  - "Given a running Neo4j instance after initialization, when I run SHOW CONSTRAINTS, then all 6 constraints are listed"
  - "Given a running Neo4j instance after initialization, when I run SHOW INDEXES, then all indexes are listed (including constraint-backed indexes)"
  - "Constraint creation results are logged (created or already exists)"
---

## Description

Create a schema initialization module in packages/graph that applies Neo4j constraints and indexes via Cypher. This runs on server startup before the GraphQL schema is built. Constraints are managed explicitly (not via @neo4j/graphql directives) for migration control.
