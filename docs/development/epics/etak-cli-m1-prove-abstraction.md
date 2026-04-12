---
name: "Etak CLI M1: Prove the abstraction with idea end-to-end"
type: epic
status: draft
parent: etak-cli
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
children:
  - etak-cli-m1-s2-package-scaffold
  - etak-cli-m1-s3-zod-schemas
  - etak-cli-m1-s4-adapter-interface-and-fs
  - etak-cli-m1-s5-cli-chassis
  - etak-cli-m1-s6-idea-commands
---

## Description

Build the `@etak/cli` package from scaffold to a working `etak idea` command surface — create, get, list, update (frontmatter + body + section), link — against the filesystem adapter, with the graphql stub satisfying the shared contract test suite. M1 is the vertical slice that proves the abstraction works end-to-end for one type before fanning out in M2.

## Stories

- **S2 — Package scaffold.** `@etak/cli` workspace member, commander + tsup + tsx + vitest wiring, bin `etak`, `--help` / `--version`.
- **S3 — Zod schemas for all 6 discovery types.** Hand-written from `schemas.md` and real `docs/discovery/` artifacts. Includes body section schemas per the design spec. Positive + negative tests per type. At least one fixture test from a real artifact.
- **S4 — Storage adapter interface + fs adapter + graphql stub.** Shared contract test suite. fs adapter implements it; graphql stub raises `NotWiredError` per the contract.
- **S5 — CLI chassis.** Commander wiring, output formatter (human + JSON with shared envelope), exit code handling for all 5 codes, stderr routing, drift-warning rendering.
- **S6 — `etak idea` commands.** create, get, list, update (frontmatter + `--body`/`--body-file`/`--section`/stdin), link. All paths wired to the adapter and the formatter.

## Dependencies

- S2 (scaffold) blocks everything else.
- S3 (schemas) and S4 (adapters) can run in parallel after S2.
- S5 (chassis) can start after S2 but needs S3 and S4 to integrate meaningfully.
- S6 (idea commands) depends on S3, S4, and S5.
- All stories depend on the design spec (`etak-cli-m1-s1-design-spec`) landing first.
