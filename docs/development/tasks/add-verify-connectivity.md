---
name: "Add connectivity verification"
type: task
status: todo
parent: neo4j-driver-connection
workstream: graph-data-layer
---

Export a `verifyConnection(driver: Driver)` helper from `packages/graph/src/driver.ts`:
- Calls `driver.verifyConnectivity()`
- Logs the Neo4j URI (not credentials) on success
- On failure, logs a clear error message with the URI and re-throws
- This will be called from `apps/api/src/server.ts` on startup
