---
name: "M2-S2: etak opportunity commands"
type: story
status: draft
parent: etak-cli-m2-expand-types
children: []
workstream: etak-cli-core
milestone: etak-cli-m2-expand-types
blocked_by:
  - etak-cli-m1-s6-idea-commands
acceptance_criteria:
  - "`etak opportunity create/get/list/update/link` all work against the fs adapter"
  - "Body section schema for opportunity matches the design spec and real fixtures under `docs/discovery/opportunities/`"
  - "`supports` and `hmw` fields work end-to-end"
  - "Contract tests pass; at least one fixture test loads a real opportunity"
---

## Description

Mechanical expansion for `opportunity`. Opportunities carry `supports` links and `hmw` framing — validate both.
