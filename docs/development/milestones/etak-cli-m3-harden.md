---
name: "Etak CLI M3: Harden for conversion surface"
type: milestone
milestone_type: delivery
project: etak-cli
status: planned
target_date: null
workstream_deliverables:
  - workstream: etak-cli-core
    delivers: "Cross-type ops (e.g., `etak link` as a top-level command, list across types). Error message pass. README.md for the package. QE audit against the full spec. Open-question cleanup."
demo_criteria: "A new developer, with no prior context, can install the package, run `etak --help`, follow the README, and create+link their first artifact in under five minutes. Error messages at every exit-code path are legible and actionable. QE audit confirms test coverage against all spec topics."
---

## What this milestone proves

- The CLI is polished enough to convert a local-tier developer to an Etak SaaS prospect. This is the conversion surface — it has to feel solid, even if it's not where distinctive value lives.
- The test strategy laid down in M1 scales to the full type expansion.

## What it enables

- Discovery skills can migrate fully to calling the CLI.
- The graph-backed-artifact-store project has a concrete, tested contract to wire the graphql adapter against.

## What it defers

- GraphQL adapter implementation (belongs to the graph-backed-artifact-store project).
- Migration of existing `docs/discovery/` artifacts.
- Development artifact types.
