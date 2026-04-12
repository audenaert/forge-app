---
name: "M2-S3: etak assumption commands"
type: story
status: draft
parent: etak-cli-m2-expand-types
children: []
workstream: etak-cli-core
milestone: etak-cli-m2-expand-types
blocked_by:
  - etak-cli-m1-s6-idea-commands
acceptance_criteria:
  - "`etak assumption create/get/list/update/link` all work against the fs adapter"
  - "Body section schema for assumption matches the design spec"
  - "`assumed_by` and related link fields work end-to-end"
  - "Contract tests pass; fixture test loads a real assumption if one exists, or uses a synthesized one noted in the test"
---

## Description

Mechanical expansion for `assumption`.
