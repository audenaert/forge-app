---
name: "Write edge case and error path tests"
type: task
status: todo
parent: integration-test-suite
workstream: graphql-api
---

Write integration tests for edge cases and error paths:
- Delete a connected node → verify relationships are removed, connected nodes survive
- Duplicate Domain slug → verify `CONSTRAINT_VIOLATION` error with code
- Invalid enum value in mutation → verify `VALIDATION_ERROR`
- Non-existent ID in connect operation → verify behavior (error or silent no-op)
- `opportunitySubgraph` with non-existent ID → returns null
- `untestedAssumptions` on empty domain → returns empty array
- `discoveryHealth` on empty domain → all zeros
- Two simultaneous creates with auto-generated IDs → no collision
