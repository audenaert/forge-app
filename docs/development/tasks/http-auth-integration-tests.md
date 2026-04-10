---
name: "HTTP-level auth integration tests"
type: task
status: todo
parent: domain-scoping-and-auth
workstream: graphql-api
---

Add end-to-end HTTP tests that exercise the full auth flow through Express:
- Start the Express server in tests, make actual HTTP requests
- Missing API key → 401 UNAUTHORIZED
- Invalid API key → 401 UNAUTHORIZED
- Valid API key → 200 with domain-scoped response
- DISABLE_AUTH=true → falls back to default domain
- Verify the Express context function wiring (header → extractApiKey → resolveDomainFromApiKey → context.domainSlug)

Deferred until the full auth layer is built. The individual pieces (extractApiKey, resolveDomainFromApiKey, domain isolation) are unit/integration tested; the gap is the Express glue code (~10 lines).
