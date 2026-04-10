---
name: "M1: Discovery graph end-to-end"
type: milestone
milestone_type: integration
project: graph-backed-artifact-store
status: planned
target_date: null
workstream_deliverables:
  - workstream: graph-data-layer
    delivers: "Docker Compose + Neo4j driver + constraints, 5 discovery types + typed edges, custom resolvers (opportunitySubgraph, untestedAssumptions, discoveryHealth)"
  - workstream: graphql-api
    delivers: "Apollo Server + error classification plugin, CRUD + relationship mutations + traversal queries for all 5 discovery types"
demo_criteria: "Create an objective, two opportunities, three ideas, and four assumptions via GraphQL. Run opportunitySubgraph and see the full tree. Run discoveryHealth and see that two assumptions are untested."
---

## What this milestone proves

- @neo4j/graphql works for the Forge artifact taxonomy
- The traversal queries (opportunitySubgraph, untestedAssumptions, discoveryHealth) deliver the graph power that justifies Neo4j over simpler storage
- The monorepo structure (packages/graph + apps/api) is sound
- Custom resolvers work alongside @neo4j/graphql's auto-generated CRUD
- Error classification gives callers actionable error codes

## What it enables

- M2 can proceed with confidence — the pattern is proven, adding more types is mechanical
- AI agents can begin querying the discovery graph (on localhost) for integration testing
- The team can seed real discovery data and validate that the graph model matches how they think about opportunity spaces

## What it defers

- Development artifact types (M2)
- Multi-tenancy and auth (M3)
- Deferred discovery fields: interpretation_guide, action_plan, result_informs, evidenced_by/contradicted_by, Critique type
- Vector embeddings and semantic search
- Real-time subscriptions

## Spike completed

**@cypher with non-@node return types: PASSED.** Verified that `@cypher` directives can return computed projection types (OpportunitySubgraph, DiscoveryHealth) and that `CALL {}` subqueries prevent cartesian product duplication. All traversal queries stay as `@cypher` in SDL — no custom resolvers needed.

**Additional finding:** Single `@relationship` fields must be nullable in @neo4j/graphql v7 (`domain: Domain`, not `domain: Domain!`). Spec updated.
