---
name: "M2-S5: etak critique commands (canary)"
type: story
status: draft
parent: etak-cli-m2-expand-types
children: []
workstream: etak-cli-core
milestone: etak-cli-m2-expand-types
blocked_by:
  - etak-cli-m1-s6-idea-commands
acceptance_criteria:
  - "`etak critique create/get/list/update/link` all work against the fs adapter"
  - "Body section schema matches the design spec"
  - "Critique's absence of a `status` field does not break the frontmatter-update path — schema correctly enforces it"
  - "`target` link field works end-to-end"
  - "Contract tests pass; fixture test loads a real critique if available"
---

## Description

Canary for schema shape. Critique deviates from the common pattern (no status), so it's the best test that the Zod schemas and frontmatter-update code handle type-specific variation cleanly.
