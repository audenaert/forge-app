---
name: "M3-S3: README for @etak/cli"
type: story
status: draft
parent: etak-cli-m3-harden
children: []
workstream: etak-cli-core
milestone: etak-cli-m3-harden
blocked_by:
  - etak-cli-m3-s2-error-message-pass
acceptance_criteria:
  - "`apps/cli/README.md` exists"
  - "Covers install, `etak --help`, creating the first artifact, linking two artifacts, and switching to JSON output"
  - "Shows the `.etak/artifacts/` layout and explains walk-up discovery"
  - "Names the backend selection path (`ETAK_BACKEND`) and calls the graphql adapter 'not yet wired — see [graph-backed-artifact-store] project'"
  - "A new developer, following only the README, can create their first artifact in under five minutes"
---

## Description

The README is the first page a converting user sees. It has to be short, concrete, and accurate against the actual command surface after the M3-S2 error pass.
