---
name: "Create test container setup"
type: task
status: todo
parent: integration-test-suite
workstream: graphql-api
---

Install `testcontainers` and `@testcontainers/neo4j` as root devDependencies.

Create shared test setup file (e.g., `test/setup.ts` or `test/neo4j-container.ts`):
- Export a `beforeAll` that starts `Neo4jContainer('neo4j:5-community')`
- Export the driver, bolt URI, and a `testDomain()` factory that returns `test-${randomUUID().slice(0,8)}`
- Export an `afterAll` that closes driver and stops container
- Container startup timeout: 60s
- Single container shared across all test files in a suite (Vitest `globalSetup` or shared module)
