---
name: "Create driver.ts module"
type: task
status: done
parent: neo4j-driver-connection
workstream: graph-data-layer
---

Create `packages/graph/src/driver.ts`:
- Export `createDriver()` function returning a configured `neo4j.Driver`
- Read `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` from env with defaults (`bolt://localhost:7687`, `neo4j`, `forgedev`)
- Export the `Driver` type for consumers
- Re-export from `packages/graph/src/index.ts`
