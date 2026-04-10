---
name: "Scaffold apps/api package"
type: task
status: done
parent: apollo-server-scaffolding
workstream: graphql-api
---

Create `apps/api/`:
- `package.json`: name `@forge-workspace/api`, type `module`, dependency on `@forge-workspace/graph` (workspace:*), `@apollo/server`
- `tsconfig.json`: extends `../../tsconfig.base.json`
- `src/` directory with empty `server.ts` and `context.ts`
- Verify `npm install` succeeds from monorepo root
