---
name: "Create constraints initialization module"
type: task
status: todo
parent: schema-constraint-initialization
workstream: graph-data-layer
---

Create `packages/graph/src/constraints.ts`:
- Export `applyConstraints(driver: Driver)` function
- Run all 6 uniqueness constraints via `CREATE CONSTRAINT ... IF NOT EXISTS`:
  - `domain_slug`, `objective_id`, `opportunity_id`, `idea_id`, `assumption_id`, `experiment_id`
- Run 2 indexes: `opp_domain_status` (Opportunity.status), `assumption_domain_status` (Assumption.status, importance)
- Log each constraint/index result (created vs. already exists)
- Re-export from `packages/graph/src/index.ts`
