---
name: "Test bidirectional relationship traversal"
type: task
status: done
parent: typed-relationship-edges
workstream: graph-data-layer
---

Write integration tests in `packages/graph/src/__tests__/relationships.test.ts`:
- Create an Objective, connect an Opportunity via SUPPORTS — verify `Objective.supportedBy` returns the Opportunity and `Opportunity.supports` returns the Objective
- Same pattern for ADDRESSES (Idea↔Opportunity), ASSUMED_BY (Assumption↔Idea), TESTS (Experiment↔Assumption)
- Test nested connect on create: create an Opportunity with `supports: { connect: ... }` in a single mutation
- Test disconnect: remove a SUPPORTS edge, verify both nodes still exist but relationship is gone
