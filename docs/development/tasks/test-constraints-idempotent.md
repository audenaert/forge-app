---
name: "Test constraint initialization is idempotent"
type: task
status: todo
parent: schema-constraint-initialization
workstream: graph-data-layer
---

Write integration test in `packages/graph/src/__tests__/constraints.test.ts`:
- Call `applyConstraints()` twice — second call should succeed with no errors
- Verify all 6 constraints exist via `SHOW CONSTRAINTS` Cypher
- Verify all indexes exist via `SHOW INDEXES` Cypher
- Uses shared testcontainer setup (see integration-test-suite story)
