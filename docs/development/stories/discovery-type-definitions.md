---
name: "Discovery type definitions in SDL"
type: story
status: complete
parent: discovery-graph-schema
children:
  - create-common-graphql
  - create-discovery-graphql
  - create-schema-module
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "common.graphql defines Domain @node with id, slug, name, createdAt"
  - "common.graphql defines shared enums: EffortLevel"
  - "discovery.graphql defines Objective, Opportunity, Idea, Assumption, Experiment with all fields from the spec"
  - "All status/importance/evidence/method/result enums defined with UPPERCASE values"
  - "Single @relationship fields are nullable (domain: Domain, not Domain!) per v7 requirement"
  - "@id generates UUIDs, @timestamp sets createdAt on CREATE and updatedAt on UPDATE"
  - "Schema compiles via Neo4jGraphQL.getSchema() without errors"
  - "GraphQL introspection shows all expected types, enums, and fields"
---

## Description

Create the SDL type definition files in packages/graph/src/typeDefs/. These define the graph schema — @neo4j/graphql auto-generates all CRUD queries, mutations, filtering, and pagination from them.
