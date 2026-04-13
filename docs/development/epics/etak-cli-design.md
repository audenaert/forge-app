---
name: "Etak CLI design"
type: epic
status: in-progress
parent: etak-cli
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
children:
  - etak-cli-m1-s1-design-spec
---

## Description

Produce the single design document for `@etak/cli` v1 at `apps/cli/docs/design.md`. Covers storage adapter interface, link semantics, update contract and body representation (with Option A locked and all three options documented), output contract, slug rules, config resolution and artifact location, Zod error rendering, and body section schemas per artifact type. Target 4 to 6 pages. The architect has been dispatched with a detailed brief at `apps/cli/docs/design-brief.md`.

## Why this is an epic, not just a story

The design spec is single-authored (one architect, one document), but it's the gate for all other M1 work. Treating it as a small epic makes the dependency structure explicit in the backlog and gives the architect a clean anchor.
