---
name: "Create schema.ts module"
type: task
status: todo
parent: discovery-type-definitions
workstream: graph-data-layer
---

Create `packages/graph/src/schema.ts`:
- `loadTypeDefs()` reads all `.graphql` files from `typeDefs/` directory via `readFileSync`
- `createSchema(driver: Driver)` creates `Neo4jGraphQL` instance with typeDefs and driver, returns executable schema via `getSchema()`
- Export both functions from `packages/graph/src/index.ts`
- Verify schema compiles without errors in a test
