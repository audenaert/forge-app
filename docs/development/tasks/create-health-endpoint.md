---
name: "Create health check endpoint"
type: task
status: done
parent: health-check-and-logging
workstream: graphql-api
---

Add a health check to `apps/api/src/server.ts`:
- Since `startStandaloneServer` doesn't support custom routes, either:
  (a) Use `expressMiddleware` instead of `startStandaloneServer` to add a `/health` route, or
  (b) Add a `health` query to the GraphQL schema that runs `RETURN 1` via @cypher
- Health check should verify actual Neo4j connectivity (execute a simple Cypher), not just that the process is running
- Return `200 {status: 'ok'}` or `503 {status: 'error', message: ...}`
