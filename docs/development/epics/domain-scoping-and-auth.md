---
name: "Domain scoping & auth"
type: epic
status: draft
parent: graph-backed-artifact-store
children: []
workstream: graphql-api
milestone: m3-multi-tenant-auth
---

## Scope

API key authentication and domain-scoped query enforcement.

### Stories (initial)

- API key middleware — key-per-domain, passed in request header
- All queries scoped to the authenticated domain
