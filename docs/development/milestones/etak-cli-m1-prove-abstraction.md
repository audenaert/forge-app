---
name: "Etak CLI M1: Prove the abstraction with idea end-to-end"
type: milestone
milestone_type: integration
project: etak-cli
status: planned
target_date: null
workstream_deliverables:
  - workstream: etak-cli-core
    delivers: "Design spec at apps/cli/docs/design.md. Package scaffold (@etak/cli, commander, tsup, tsx, vitest). Zod schemas for all 6 discovery types. Storage adapter interface + fs adapter + graphql stub (NotWiredError). CLI chassis: command wiring, output formatter (human/JSON), exit codes (0-4). Drift-aware markdown body parser (remark/unified, per design spec). `etak idea` full command surface: create, get, list, update (frontmatter + body + section), link. Passing shared contract test suite."
demo_criteria: "From a freshly scaffolded project directory, run: `etak idea create --name \"Test idea\" --addresses some-opportunity`, `etak idea get test-idea --output json`, `etak idea list`, `etak idea update test-idea --section description \"...\"`, `etak idea update test-idea --body-file draft.md`, `etak idea link test-idea --addresses other-opportunity`. Each command returns the correct exit code, human and JSON output render cleanly, drift warnings surface in both modes when an artifact has structural deviation, and the shared contract test suite passes against the fs adapter and the graphql stub (which raises NotWiredError as expected)."
---

## What this milestone proves

- The storage adapter abstraction is the right shape — fs and graphql stub both satisfy it without leaking backend-specific concerns.
- Drift-aware body parsing works: human-authored extra sections and reordering round-trip cleanly, while deleted and renamed required sections surface as structured warnings.
- The JSON output envelope is consumable by tooling (drift warnings, Zod errors, success data all share one shape).
- Exit codes map cleanly to the locked table and every path is tested.
- The chassis (commander, output formatter, exit handling) is solid enough that adding the other 5 discovery types in M2 is mechanical.

## What it enables

- M2 can proceed in parallel: each of objective, opportunity, assumption, experiment, critique is a mechanical expansion of the `idea` pattern.
- Discovery skills can be updated to call `etak idea ...` instead of writing files directly, one type at a time.
- The forward-looking constraint on the graph backend (round-trip drift, preserve extra sections) is documented and communicated to the `graph-backed-artifact-store` project.

## What it defers

- The other 5 discovery types (M2).
- Hardening: cross-type ops, error message pass, README, QE audit (M3).
- GraphQL adapter implementation — stub only.
- Development artifact types (out of scope for this project entirely).
- Migration of existing `docs/discovery/` artifacts to `.etak/artifacts/`.
- `delete` command.
- `etak login` / account flows.
