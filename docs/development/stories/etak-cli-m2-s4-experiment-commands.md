---
name: "M2-S4: etak experiment commands (canary)"
type: story
status: draft
parent: etak-cli-m2-expand-types
children: []
workstream: etak-cli-core
milestone: etak-cli-m2-expand-types
blocked_by:
  - etak-cli-m1-s6-idea-commands
acceptance_criteria:
  - "`etak experiment create/get/list/update/link` all work against the fs adapter"
  - "Body section schema captures experiment's richer structure (hypothesis, method, result, interpretation, etc., per the design spec)"
  - "`tests` link field works end-to-end"
  - "Update-by-section works across every section the schema defines — experiment is the canary because its body has the most structure"
  - "Contract tests pass; fixture test loads a real experiment if available"
---

## Description

Canary for the update contract. Experiment has the richest body template of the six discovery types, so it's the best test that section-level update works across a complex schema.
