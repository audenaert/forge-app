---
name: "M3: Multi-tenant & auth"
type: milestone
milestone_type: value
project: graph-backed-artifact-store
status: in_progress
target_date: null
workstream_deliverables:
  - workstream: graph-data-layer
    delivers: "Organization, Domain, User nodes + membership edges (MEMBER_OF with role field)"
  - workstream: graphql-api
    delivers: "API key middleware (key-per-domain), @authorization directives or middleware fallback, all queries scoped to authenticated domain"
demo_criteria: "Two domains with different artifact sets. Query from domain A's API key — see only domain A's artifacts. Query from domain B — see only domain B's."
---

## What this milestone proves

- Multiple domains can use the API independently with data isolation
- API key auth works for both AI agents and future UI clients
- The MEMBER_OF edge with role field is in place for future RBAC

## What it enables

- The API is usable beyond localhost — external consumers can authenticate
- Multiple product teams within an organization can each have their own domain
- The foundation for RBAC, Teams, and OAuth/SSO is laid (schema is ready, enforcement deferred)

## What it defers

- RBAC enforcement (role field exists but isn't checked beyond domain membership)
- Teams within organizations
- OAuth/SSO (API key is sufficient for initial multi-tenant use)
- User management UI

## Notes

This is the first milestone where someone other than a localhost developer can use the API. It's the gate to real multi-user collaboration. The Organization → Domain → User model with MEMBER_OF edges was designed from the start (see project spec), so this milestone is implementing a planned schema extension, not retrofitting.
