---
name: "M3-S4: QE audit against the design spec"
type: story
status: draft
parent: etak-cli-m3-harden
children: []
workstream: etak-cli-core
milestone: etak-cli-m3-harden
owner: forge-development:quality-engineer
blocked_by:
  - etak-cli-m3-s1-cross-type-ops
acceptance_criteria:
  - "Quality-engineer reviews the full test suite against `apps/cli/docs/design.md` and files a report"
  - "Every design topic (1–8) has explicit test coverage mapped to it"
  - "Every exit-code path has at least one e2e test"
  - "Every Zod schema has positive and negative tests, and at least one fixture-loaded test from `docs/discovery/`"
  - "Every drift case (add section, reorder, delete required, rename required) has a test"
  - "Shared contract test suite is exercised against both the fs adapter and the graphql stub, and the stub's NotWiredError path is explicitly asserted"
  - "Gaps identified in the audit are either fixed in this story or filed as follow-up issues"
---

## Description

The final gate. QE reads the design spec and the test suite side by side and confirms coverage before the milestone is called done.
