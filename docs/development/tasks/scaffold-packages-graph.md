---
name: "Scaffold packages/graph package"
type: task
status: done
parent: graph-package-scaffolding
workstream: graph-data-layer
---

Create `packages/graph/`:
- `package.json`: name `@forge-workspace/graph`, type `module`, dependencies on `neo4j-driver`, `@neo4j/graphql`, `graphql`
- `tsconfig.json`: extends `../../tsconfig.base.json`, sets `outDir`, `rootDir: src`
- `src/` directory structure: `typeDefs/`, `index.ts` (barrel export)
- Verify `npm install` succeeds from monorepo root
- Verify `tsc --noEmit` passes with empty source files
