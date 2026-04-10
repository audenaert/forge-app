---
name: "Create common.graphql"
type: task
status: done
parent: discovery-type-definitions
workstream: graph-data-layer
---

Create `packages/graph/src/typeDefs/common.graphql`:
- `Domain @node` with `id: ID! @id`, `slug: String!`, `name: String!`, `createdAt: DateTime! @timestamp(operations: [CREATE])`
- `EffortLevel` enum: `LOW`, `MEDIUM`, `HIGH`
