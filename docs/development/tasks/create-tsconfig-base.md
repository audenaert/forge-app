---
name: "Create tsconfig.base.json"
type: task
status: todo
parent: graph-package-scaffolding
workstream: graph-data-layer
---

Create `tsconfig.base.json` at the monorepo root:
- `strict: true`
- `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`
- `esModuleInterop: true`, `skipLibCheck: true`
- `declaration: true`, `declarationMap: true`, `sourceMap: true`
- `outDir` and `rootDir` left to individual packages
