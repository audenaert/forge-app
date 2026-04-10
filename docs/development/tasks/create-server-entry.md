---
name: "Create server.ts entry point"
type: task
status: todo
parent: apollo-server-scaffolding
workstream: graphql-api
---

Create `apps/api/src/server.ts`:
- Import `createDriver`, `createSchema`, `applyConstraints` from `@forge-workspace/graph`
- Call `driver.verifyConnectivity()` — fail fast with clear error
- Call `applyConstraints(driver)` — log results
- Build schema via `createSchema(driver)`
- Create `ApolloServer` with schema
- Start via `startStandaloneServer` on `PORT` env var (default 4000)
- Context returns `{ domainSlug: 'default' }` (hard-coded for M1)
- Wrap `main()` in `.catch()` that logs error and exits with code 1
- Add `"dev": "tsx src/server.ts"` script to package.json
