---
name: "Domain isolation: write-side enforcement"
type: story
status: ready
parent: api-foundation
workstream: graph-data-layer
milestone: m2-full-artifact-taxonomy
acceptance_criteria:
  - "Creating or connecting any OST relationship (SUPPORTS, ADDRESSES, ASSUMED_BY, TESTS) via the GraphQL API is rejected when the two endpoints belong to different domains. Rejection surfaces as a user-facing GraphQL error, not a silent no-op."
  - "The same enforcement applies to every discovery-layer edge above: Opportunity↔Objective (SUPPORTS), Idea↔Opportunity (ADDRESSES), Assumption↔Idea (ASSUMED_BY), Experiment↔Assumption (TESTS)."
  - "The same enforcement applies to every development-layer edge in packages/graph/src/typeDefs/development.graphql that connects two OST artifacts across the natural hierarchy (audit the file and enumerate them in the implementation — e.g., Epic→Project, Story→Epic, Task→Story, Bug→Story, etc.)."
  - "A node's BELONGS_TO → Domain edge can only be assigned once. Once an artifact is attached to a domain, reassigning its BELONGS_TO edge to a different domain is rejected. Creating an artifact without a BELONGS_TO → Domain edge is rejected at commit time (or immediately after, before any cross-domain edge can reference it)."
  - "Rejection happens at the write boundary — mutation resolvers, Neo4j GraphQL @authorization rules, a pre-commit constraint, or a mutation middleware. The architect chooses the mechanism; read-side traversal queries are not responsible for enforcement."
  - "Integration tests exist for every guarded edge type. Each test attempts to create a cross-domain edge via the GraphQL API and asserts the mutation is rejected. Each test also asserts that the same-domain form of the mutation still succeeds."
  - "A test verifies that an existing cross-domain edge in the database (if any are somehow created outside the API, e.g. seed scripts bypassing the guard) does not crash the read-side queries — the read-side keeps behaving per the 'cross-domain edges are invisible' rule. This is defense in depth."
  - "Read-side traversal Cypher in packages/graph/src/typeDefs/discovery.graphql and development.graphql is NOT reverted or simplified as part of this story. The defense-in-depth from PR #20 stays — write-side enforcement and read-side filtering are complementary layers."
  - "apps/api auth contract is unchanged (x-api-key → domainSlug). The enforcement is implemented inside packages/graph or at the resolver layer, not in apps/api middleware."
  - "Documentation: the chosen enforcement mechanism is recorded as a short note in the spec or as an ADR (architect's call). If an ADR, place it under docs/development/adrs/ with a descriptive slug."
  - "npm run test:integration passes at the repo root; npm run typecheck passes for packages/graph and apps/api."
---

## Description

Enforce at the write boundary that every OST relationship connects two endpoints in the same domain. Cross-domain edges must be impossible to create through the GraphQL API. This closes a customer-data-isolation gap surfaced during PR #20 review.

## Context

### Why this exists

The Etak graph is multi-tenant — each customer's discovery and development artifacts live in their own `Domain`. The product invariant is: **OST relationships must belong within a single domain**. This is the core of tenant isolation in the OST model.

PR #20 review revealed that **this invariant is not enforced anywhere today.** `packages/graph/src/constraints.ts` only has uniqueness constraints on `Domain.slug` and `Domain.apiKey`. The mutation API will happily create an `ASSUMED_BY` edge between an assumption in domain A and an idea in domain B. Read-side queries filter these out (after PR #20), but that is defense in depth, not enforcement. An attacker who finds a way to bypass the read-side filters — or a future query that forgets to apply them — could exfiltrate cross-customer data.

The user has framed this as a potential data leak between customers. The read-side filtering shipped in PR #20 is the interim mitigation; this story is the proper fix.

### Scope

Every edge that connects two OST artifacts (not a BELONGS_TO → Domain edge) must pass a same-domain check before it can be committed. The enforcement lives in `packages/graph` (or immediately above it at the resolver layer) — not in `apps/api` — so every consumer of the graph library gets it for free.

Audit both schema files to enumerate the guarded edge types:

- `packages/graph/src/typeDefs/discovery.graphql` — SUPPORTS, ADDRESSES, ASSUMED_BY, TESTS.
- `packages/graph/src/typeDefs/development.graphql` — all parent/child edges between initiatives, projects, epics, stories, tasks, bugs, chores, enhancements, spikes. Enumerate them in the design pass; do not hard-code a list now.

### Explicitly out of scope

- Reverting or simplifying the read-side domain filtering introduced in PR #20. Defense in depth is intentional: write-side enforcement is the primary guarantee, read-side filtering is the backstop.
- Cross-organization isolation (Organization → Domain → Org). Orgs own multiple domains; cross-domain-within-same-org is still forbidden.
- Per-user or per-role authorization inside a domain (that's a different story).
- Bulk import / migration tooling. If bulk tooling needs to cross domains for a legitimate reason, that's a separate escape-hatch design.

## Context for the agent

- **Start with an architect/spike pass** — the implementation mechanism is not obvious. Options: Neo4j GraphQL `@authorization` rules, a custom mutation middleware in `apps/api` that wraps every OST mutation, a pre-commit Cypher constraint (limited — Neo4j's built-in constraints don't express "edge endpoints must share a scalar property"), or a thin resolver wrapper in `packages/graph`. Pick the one that's idiomatic for the Neo4j GraphQL library version in use.
- Read `packages/graph/src/typeDefs/discovery.graphql` and `packages/graph/src/typeDefs/development.graphql` to enumerate the guarded edges.
- Read `packages/graph/src/constraints.ts` for the existing constraint pattern.
- Read `apps/api/src/auth.ts` to understand how `domainSlug` is established per-request — whatever enforcement mechanism you pick needs access to the authenticated domain.
- **Do not** revert or modify read-side Cypher in `discovery.graphql` or `development.graphql`. Those filters stay in place as defense in depth.
- **Do not** modify the `BELONGS_TO → Domain` edge shape — that's the anchor the enforcement reads off.
- Test every guarded edge type. An untested edge is a future data leak waiting to happen.
- The user's data-leak framing means this story has a low tolerance for "good enough" — err toward more tests, clearer errors, and a written rationale.

## Related

- **PR #20** (`feat/discovery-schema-additions`) — introduced the read-side filtering that this story complements.
- The discovery explorer project (`docs/development/projects/discovery-explorer-ui.md`) consumes these queries; this story makes its data-isolation guarantees stronger.
- A latent issue in `packages/graph/src/typeDefs/discovery.graphql` around `DiscoveryHealth.orphanedOpportunities` and the `minImportance` argument semantics was noted in PR #20 review as technical debt. Those are not blockers for this story but can be cleaned up in the same area.
