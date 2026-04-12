---
name: "M3-S1: Cross-type operations"
type: story
status: draft
parent: etak-cli-m3-harden
children: []
workstream: etak-cli-core
milestone: etak-cli-m3-harden
blocked_by:
  - etak-cli-m2-s1-objective-commands
  - etak-cli-m2-s2-opportunity-commands
  - etak-cli-m2-s3-assumption-commands
  - etak-cli-m2-s4-experiment-commands
  - etak-cli-m2-s5-critique-commands
acceptance_criteria:
  - "`etak list` (no type) lists artifacts across all 6 discovery types with type badges"
  - "`etak link` as a top-level command accepts source and target by fully-qualified slug and infers the link field from the types involved (or errors clearly if ambiguous)"
  - "`etak get <slug>` without a type resolves across types (and errors clearly on collisions)"
  - "Shared helpers factored out so adding a future type needs only the type-specific bits"
---

## Description

Top-level ergonomics. By M3 the user should rarely have to type the artifact type when the slug is unambiguous.
