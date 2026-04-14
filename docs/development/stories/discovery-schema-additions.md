---
name: "Discovery schema additions for the explorer UI"
type: story
status: ready
parent: discovery-explorer
workstream: graph-data-layer
milestone: m1-web-discovery-explorer
phase: M1a
acceptance_criteria:
  # objectiveSubgraph
  - "packages/graph/src/typeDefs/discovery.graphql defines a new ObjectiveSubgraphResult type that nests Objective → Opportunity → Idea → Assumption → Experiment, parallel to the existing OpportunitySubgraphResult"
  - "A new objectiveSubgraph(objectiveId: ID!, domainSlug: String!) @cypher query returns ObjectiveSubgraphResult — the Cypher projects each level explicitly so nested fields resolve without relying on @relationship auto-resolution"
  - "Domain scoping is preserved on objectiveSubgraph — the query only returns the subgraph if the objective belongs to the given domain, and only includes opportunities/ideas/assumptions/experiments from the same domain"
  - "objectiveSubgraph integration tests cover: happy-path with a fully populated objective, an objective with no opportunities, cross-domain isolation"
  # untestedAssumptions rewrite
  - "A new return type UntestedAssumptionWithContext is defined with fields: id, name, status, importance, evidence, body, createdAt, updatedAt, and a nested parentIdea { id, name, status }"
  - "The existing untestedAssumptions @cypher query is rewritten to return [UntestedAssumptionWithContext!]! — the Cypher projects the parent idea explicitly so the nested field resolves without relying on @relationship auto-resolution"
  - "Domain scoping and the minImportance filter argument are preserved with identical semantics"
  - "The Cypher uses CALL {} subqueries or OPTIONAL MATCH as needed to avoid cartesian product duplication when an assumption has multiple parent ideas — document the chosen behavior (first parent vs. one row per parent) in a Cypher comment and add a test for the chosen behavior"
  - "Existing untestedAssumptions integration tests are updated to assert on parentIdea.id and parentIdea.name in addition to the existing fields"
  - "For untestedAssumptions and every orphan/subgraph query in this story, any parent-child edge that crosses a domain boundary is treated as if it does not exist (cross-domain edges are invisible on read). An assumption whose ONLY parent idea is in a different domain must not appear in untestedAssumptions for the queried domain. An artifact whose only parent edge is cross-domain must appear in the relevant orphan query (orphanedOpportunities, unrootedIdeas, unrootedAssumptions). Subgraph traversals (opportunitySubgraph, objectiveSubgraph) must not include cross-domain nested artifacts. Tests cover each case."
  # Orphan queries
  - "Three new @cypher queries are added: orphanedOpportunities(domainSlug: String!) → [Opportunity!]!, unrootedIdeas(domainSlug: String!) → [Idea!]!, unrootedAssumptions(domainSlug: String!) → [Assumption!]!"
  - "Each orphan query returns artifacts of the relevant type that have no incoming parent relationship in the natural hierarchy: opportunities not supporting any objective, ideas not addressing any opportunity, assumptions not assumed by any idea"
  - "Each orphan query is domain-scoped — only returns artifacts belonging to the given domainSlug"
  - "Each orphan query returns the fields needed to render an ArtifactLink (id, name, status, plus type-specific badge fields like importance for assumptions and hmw for opportunities)"
  - "Integration tests for each orphan query cover: a domain with several orphans of the relevant type, a domain with none, cross-domain isolation, and verification that adding a parent edge removes the artifact from the orphan list"
  # Cross-cutting
  - "npm test in packages/graph passes; npm test at the repo root passes"
  - "No UI-side changes in this story — the rewrite is in packages/graph only. Regenerating codegen in apps/web happens in the consuming stories"
---

## Description

Three coordinated schema additions to `packages/graph/src/typeDefs/discovery.graphql` that the discovery explorer UI depends on:

1. **`objectiveSubgraph`** — a new traversal that returns Objective → Opportunity → Idea → Assumption → Experiment as a single nested response, parallel to the existing `opportunitySubgraph`. Required by the `/tree/objective/:id` route, which is the canonical tree projection (everything roots in business value).
2. **`untestedAssumptions` rewrite** — the current `@cypher` query returns raw `Assumption` nodes, but `@cypher` return types don't auto-resolve `@relationship` fields, so the UI cannot traverse `assumedBy` to show which idea an untested assumption belongs to. Rewriting to project a `UntestedAssumptionWithContext` type that includes the parent idea unblocks the assumptions list view.
3. **Orphan queries** — `orphanedOpportunities`, `unrootedIdeas`, `unrootedAssumptions`. These return artifacts that have no parent in the natural hierarchy, so the dashboard and tree rails can surface them. Disconnected pockets are a feature of the discovery space, not a data-quality bug — they signal missing structure that future discovery work can address.

The three changes are bundled into one story because they all live in the same schema file, are tested in the same suite, and are best reviewed together. They are dispatched in parallel with the web-client scaffold in M1a — `packages/graph` and `apps/web` cannot conflict.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — section "Schema work" lists all three changes and their rationale.
- Look at how `opportunitySubgraph` projects `IdeaWithAssumptions` in the existing `discovery.graphql` — mirror that pattern for both `ObjectiveSubgraphResult` and `UntestedAssumptionWithContext`.
- The existing integration tests for `untestedAssumptions` are the source of truth for current behavior. Read them before changing the Cypher.
- **Cartesian product risk:** if you write any of these traversals naively, an artifact linked to multiple parents will appear multiple times. Use `CALL {} WITH ... RETURN` subqueries to collapse, or explicitly document the chosen semantics.
- **Domain scoping:** every query must filter by `domainSlug` and never leak content across tenants. Tests must cover cross-domain isolation for each new query.
- **Orphan-query shape:** the spec leaves the choice between per-type queries and a single shared `unrooted(type:)` query open. The resolved decision is **per-type queries** — they read more clearly at the call site and each is a one-line `@cypher`.
- Do NOT change anything in `apps/web`. The web-side consumption happens in the dashboard, tree-projection-view, and untested-assumptions-view stories, which depend on this one.
