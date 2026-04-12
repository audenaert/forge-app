---
name: "Etak CLI M2: Expand to all discovery types"
type: epic
status: draft
parent: etak-cli
workstream: etak-cli-core
milestone: etak-cli-m2-expand-types
children:
  - etak-cli-m2-s1-objective-commands
  - etak-cli-m2-s2-opportunity-commands
  - etak-cli-m2-s3-assumption-commands
  - etak-cli-m2-s4-experiment-commands
  - etak-cli-m2-s5-critique-commands
---

## Description

Mechanical expansion of the M1 `idea` pattern to objective, opportunity, assumption, experiment, and critique. Parallelizable across stories. `experiment` and `critique` are canaries for the update contract — experiment has richer body structure, critique has no status field.

## Stories

Each story is "add the `etak <type>` command surface: create, get, list, update, link. Add body section schema. Add contract tests against fs adapter. Add one fixture-based schema test from a real `docs/discovery/` artifact of that type."

- **S1 — objective**
- **S2 — opportunity**
- **S3 — assumption**
- **S4 — experiment** (canary — richer body structure)
- **S5 — critique** (canary — no status field, may deviate from common pattern)

## Dependencies

All M2 stories depend on M1 completing. Within M2, stories are independent and can run in parallel.
