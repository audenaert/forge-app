---
name: "Rewrite untestedAssumptions to include parent idea context"
type: story
status: ready
parent: discovery-explorer
workstream: graph-data-layer
milestone: m1-web-discovery-explorer
phase: M1a
acceptance_criteria:
  - "packages/graph/src/typeDefs/discovery.graphql defines a new return type UntestedAssumptionWithContext with fields: id, name, status, importance, evidence, body, createdAt, updatedAt, and a nested parentIdea { id, name, status }"
  - "The existing untestedAssumptions @cypher query is rewritten to return [UntestedAssumptionWithContext!]! — the Cypher projects the parent idea explicitly so the nested field resolves without relying on @relationship auto-resolution"
  - "Domain scoping is preserved — the query still filters by domainSlug and only returns assumptions whose parent idea belongs to the given domain"
  - "The minImportance filter argument is preserved with identical semantics"
  - "The Cypher uses CALL {} subqueries or OPTIONAL MATCH as needed to avoid cartesian product duplication when an assumption has multiple parent ideas (take the first one or return each combination — document the choice in a Cypher comment and add a test for the chosen behavior)"
  - "Existing integration tests for untestedAssumptions are updated to assert on the new shape (parentIdea.id, parentIdea.name) in addition to the existing fields"
  - "A new integration test covers an assumption with a parent idea that is in a different domain — it must not appear in untestedAssumptions for the queried domain"
  - "A new integration test covers an assumption with an idea whose status makes it a legitimate untested high-importance flag — verifies parentIdea fields populate correctly"
  - "npm test in packages/graph passes; npm test at the repo root passes"
  - "No UI-side changes in this story — the rewrite is in packages/graph only. Regenerating codegen in apps/web happens in the consuming story (untested-assumptions-view)"
---

## Description

Rewrite the `untestedAssumptions` `@cypher` query in `packages/graph` so it returns a projection type (`UntestedAssumptionWithContext`) that includes the parent idea's id and name. The current implementation returns raw `Assumption` nodes, but `@cypher` return types don't auto-resolve `@relationship` fields, so the UI cannot traverse `assumedBy` to show which idea an untested assumption belongs to.

This unblocks the M1c untested-assumptions view. It is dispatched in parallel with the web-client scaffold in M1a because it's a `packages/graph` change with no web-client dependencies — the two tracks cannot conflict.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — section "Untested assumptions view" → "Schema prerequisite", and the open question on the same.
- Look at how `opportunitySubgraph` projects `IdeaWithAssumptions` in the existing `discovery.graphql` — mirror that pattern for `UntestedAssumptionWithContext`.
- The existing integration tests for untestedAssumptions are the source of truth for current behavior. Read them before changing the Cypher.
- Cartesian product risk: if you write the traversal naively, an assumption linked to two ideas will appear twice. Use a `CALL {} WITH ... RETURN` subquery pattern to collapse this, or explicitly document and test the chosen semantics. See the M1 discovery-graph spec for the pattern used by opportunitySubgraph.
- Domain scoping: ensure the WHERE clause still filters by the passed `domainSlug` — do not regress multi-tenant isolation.
- Do NOT change anything in apps/web. The web-side consumption happens in the `untested-assumptions-view` story, which depends on this one.
