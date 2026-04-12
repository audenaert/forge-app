---
name: "Etak CLI (@etak/cli)"
type: project
status: scoping
from_discovery: etak-cli-as-growth-onramp
children:
  - etak-cli-design
  - etak-cli-m1-prove-abstraction
  - etak-cli-m2-expand-types
  - etak-cli-m3-harden
workstreams:
  - etak-cli-core
milestones:
  - etak-cli-m1-prove-abstraction
  - etak-cli-m2-expand-types
  - etak-cli-m3-harden
---

## Overview

A new workspace package `apps/cli` — the `etak` CLI — that becomes the single interface Claude Code skills use to create, read, update, and link Etak artifacts. Today, the discovery and development skills read and write markdown-with-frontmatter directly. The CLI replaces that direct access with a storage adapter abstraction, so the same skill instructions work against either the local filesystem (day one) or the graph-backed artifact store (later).

The CLI is the conversion surface for Etak's product-led-growth funnel: a developer installs the Claude Code plugin, runs `etak` against a local project, and gets immediate value with zero account, zero infrastructure, zero cost. Etak itself — the SaaS product — is where customers live, costs are incurred, and the distinctive value lives (collaborative OST development, SDLC support, learning loop, experimentation). The local tier is a funnel hook, not a customer tier, but it has to work well enough to convert.

## Goals

1. Break the coupling between skill instructions and filesystem layout — skills become backend-agnostic.
2. Prove the storage adapter interface end-to-end with one artifact type (`idea`) before fanning out.
3. Preserve human authorial control over artifact content — the CLI serves skill edits without overwriting human-authored structure.
4. Establish a test pattern (shared contract tests) that any future adapter (graphql, remote) must pass.

## Constraints

- TypeScript strict mode, Node 22, vitest (aligned with project-wide tooling).
- npm workspaces; package name `@etak/cli`, bin `etak`, lives at `apps/cli`.
- Filesystem adapter only for v1. GraphQL adapter stubbed as a class that throws `NotWiredError`.
- Commander for CLI parsing, Zod for schema validation, tsup for build, tsx for dev, remark/unified for markdown parsing (parser choice finalized in the design spec).
- Discovery artifact types only: objective, opportunity, idea, assumption, experiment, critique.
- Commands: `create`, `get`, `list`, `update`, `link`. No `delete` in v1.
- Legacy naming: do not rename `../forge/plugins/*` paths or the `forge-workspace` package yet. Use "Etak" in all new artifacts.

## Scope

### In scope

- `@etak/cli` package scaffold with commander + tsup + tsx + vitest
- Zod schemas (hand-written, seeded from `schemas.md`) for all 6 discovery types
- Storage adapter interface + filesystem adapter + GraphQL stub adapter
- CLI chassis: command wiring, output formatter (human + JSON), exit codes
- `etak idea` command surface (CRUD + link) — the M1 canary
- Mechanical expansion to the other 5 discovery types in M2
- Shared adapter contract test suite (runs against fs; graphql stub passes by raising NotWiredError)
- Three-layer test strategy: unit, adapter contract, CLI end-to-end
- Drift-aware markdown body parsing (add/reorder preserved; delete/rename flagged) with structured validation output
- Artifacts stored under `.etak/artifacts/` (or whatever the design spec lands on) — not under `docs/`

### Out of scope

- GraphQL adapter implementation (stub only)
- Development artifact types (story, task, etc.)
- `delete` command
- Migration of existing `docs/discovery/` artifacts to the new location (acknowledged, not designed)
- `etak login` / account creation / upload flows
- Any web UI work, though the design must leave room for the web UI to consume the same drift/validation output

## Milestones

- **M1 — Prove the abstraction with one type (`idea`) end-to-end.** Full CRUD + link on `idea` with human/JSON output, drift-aware body parsing, passing contract tests.
- **M2 — Mechanical expansion to the other 5 discovery types.** Parallelizable. `experiment`/`critique` are canaries for the update contract.
- **M3 — Harden.** Cross-type ops, error message pass, README, QE audit, open-question cleanup.

## Specs and ADRs

- **Spec:** `apps/cli/docs/design.md` (pending — architect dispatched)

## Open Questions

Tracked in the design spec. Known open items going in:
- Exact canonical artifact directory (`.etak/artifacts/` suggested; architect to finalize).
- Remark vs. alternate markdown AST parser (architect to decide and document).
- Whether `critique` deviates from the common body template (treat as canary).
- Migration strategy for existing `docs/discovery/` artifacts (deferred — out of scope for v1).
