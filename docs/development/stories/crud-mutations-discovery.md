---
name: "CRUD mutations for discovery types"
type: story
status: draft
parent: discovery-artifact-api
children:
  - test-crud-all-types
  - test-timestamp-behavior
workstream: graphql-api
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "createObjectives, createOpportunities, createIdeas, createAssumptions, createExperiments mutations all work"
  - "Read queries work: by ID (where: {id}), list with filtering (name_CONTAINS, status_IN, createdAt_GT)"
  - "updateObjectives (etc.) mutations update specified fields and set updatedAt"
  - "deleteObjectives (etc.) mutations remove nodes and their relationships"
  - "createdAt is set automatically on create, not changeable on update"
  - "updatedAt is set automatically on update, not set on create"
  - "@id generates a UUID for each new node, not present in create mutation input"
  - "Cursor-based pagination works via objectivesConnection (etc.) queries"
---

## Description

Verify that @neo4j/graphql's auto-generated CRUD operations work correctly for all 5 discovery types. This story is primarily integration testing — the mutations are generated from the SDL, not hand-written.
