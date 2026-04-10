---
name: "Test CRUD for all 5 discovery types"
type: task
status: done
parent: crud-mutations-discovery
workstream: graphql-api
---

Write integration tests for auto-generated CRUD operations:

For each of the 5 types (Objective, Opportunity, Idea, Assumption, Experiment):
- **Create**: verify node is created with auto-generated UUID, createdAt is set, updatedAt is not set
- **Read by ID**: verify `where: { id }` returns the correct node
- **Read with filter**: verify `name_CONTAINS`, `status_IN`, `createdAt_GT` filters work
- **Update**: verify field updates, updatedAt is set, createdAt is unchanged
- **Delete**: verify node is removed

Also test:
- `@id` field is not present in create mutation input
- Cursor-based pagination via `*Connection` queries returns correct `totalCount` and `pageInfo`
