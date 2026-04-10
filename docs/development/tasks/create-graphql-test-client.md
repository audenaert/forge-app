---
name: "Create GraphQL test client helper"
type: task
status: todo
parent: integration-test-suite
workstream: graphql-api
---

Create `test/graphql-client.ts`:
- Export a helper that executes GraphQL operations against the Apollo Server instance (using `server.executeOperation()` — no HTTP needed)
- Accept typed query/mutation strings and variables
- Return typed response data or errors
- Include a `seedDomain(driver, slug)` helper that creates a Domain node for test isolation
- Include common GraphQL fragments for the 5 discovery types (reduces test boilerplate)
