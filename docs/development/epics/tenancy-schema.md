---
name: "Tenancy schema"
type: epic
status: draft
parent: graph-backed-artifact-store
children: []
workstream: graph-data-layer
milestone: m3-multi-tenant-auth
---

## Scope

Model the multi-tenancy structure in Neo4j and ensure all artifact queries are domain-scoped.

### Stories (initial)

- Organization, Domain, User nodes with all schema fields
- Membership edges — MEMBER_OF with role field, domain scoping on all data access queries
