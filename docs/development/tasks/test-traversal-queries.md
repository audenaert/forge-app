---
name: "Test traversal queries"
type: task
status: done
parent: custom-traversal-queries
workstream: graph-data-layer
---

Write integration tests in `packages/graph/src/__tests__/traversals.test.ts`:

**opportunitySubgraph:**
- Seed branching graph: 1 Opp → 2 Ideas → 3 Assumptions → 2 Experiments
- Verify correct nested tree with no duplication (cartesian product regression)
- Verify non-existent opportunityId returns null
- Verify wrong domainSlug returns null

**untestedAssumptions:**
- Seed 5 Assumptions: 3 untested HIGH, 1 untested LOW, 1 tested HIGH
- Verify unfiltered returns 4 (all untested)
- Verify minImportance: HIGH returns 3
- Verify empty domain returns empty array

**discoveryHealth:**
- Seed known graph, verify all 8 counts match
- Verify empty domain returns all zeros
- Verify orphaned Opportunities detected (no SUPPORTS edge)
- Verify Ideas with no Assumptions detected
