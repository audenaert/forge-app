---
name: "Set up Vitest configuration"
type: task
status: done
parent: integration-test-suite
workstream: graphql-api
---

Configure Vitest for the monorepo:
- Install `vitest` as root devDependency
- Create `vitest.config.ts` at monorepo root (or per-package if needed)
- Configure for TypeScript with `tsx` transform
- Set test timeout to 60s (testcontainers need time to start)
- Add `"test": "vitest run"` script to root `package.json`
- Verify `npm test` discovers and runs test files
