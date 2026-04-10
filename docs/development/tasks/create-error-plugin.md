---
name: "Create error classification Apollo plugin"
type: task
status: todo
parent: error-classification-plugin
workstream: graphql-api
---

Create `apps/api/src/plugins/errorClassification.ts`:
- Apollo Server plugin implementing `willSendResponse` or `formatError`
- Inspect original error and classify:
  - `Neo4jError` with constraint violation code → `CONSTRAINT_VIOLATION` + constraint name
  - GraphQL validation errors → `VALIDATION_ERROR`
  - Neo4j `EntityNotFound` or similar → `NOT_FOUND`
  - Everything else → `INTERNAL_ERROR`
- Attach `extensions.code` to every GraphQL error response
- Register plugin in `ApolloServer` constructor in `server.ts`
