---
name: "Etak CLI M2: Expand to all discovery types"
type: milestone
milestone_type: delivery
project: etak-cli
status: planned
target_date: null
workstream_deliverables:
  - workstream: etak-cli-core
    delivers: "Command surface (create/get/list/update/link) for objective, opportunity, assumption, experiment, critique. Body section schemas per type. Shared contract tests pass for all 6 types."
demo_criteria: "Full CRUD + link works for all 6 discovery types with human and JSON output. `experiment` and `critique` validate the update contract under types that deviate from the common pattern — critique has no status field, experiment has richer body structure."
---

## What this milestone proves

- The M1 pattern is mechanical enough to replicate without architectural changes.
- `experiment` and `critique` are canaries: if the update contract and drift handling work for them, it works for any discovery type.
- The shared contract test suite catches regressions across the type expansion.

## What it enables

- Discovery skills can be updated to route through the CLI for all types, not just `idea`.
- M3 hardening pass can begin.

## What it defers

- Cross-type operations, README, error message pass, QE audit (M3).
