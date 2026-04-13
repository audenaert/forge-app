---
name: "M2-S1: etak objective commands"
type: story
status: draft
parent: etak-cli-m2-expand-types
children: []
workstream: etak-cli-core
milestone: etak-cli-m2-expand-types
blocked_by:
  - etak-cli-m1-s6-idea-commands
acceptance_criteria:
  - "`etak objective create/get/list/update/link` all work against the fs adapter"
  - "Body section schema for objective matches the design spec and real fixtures under `docs/discovery/objectives/`"
  - "Contract tests pass for objective against fs adapter and graphql stub"
  - "At least one fixture-based schema test loads a real objective from `docs/discovery/objectives/`"
  - "Drift handling verified: an objective with an extra human-added section round-trips cleanly"
---

## Description

Mechanical expansion of the M1 `idea` command pattern to `objective`. Adds the type's body schema, wires the commander namespace, reuses the chassis and adapter unchanged.
