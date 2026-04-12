---
name: "M3-S2: Error message pass across every exit-code path"
type: story
status: draft
parent: etak-cli-m3-harden
children: []
workstream: etak-cli-core
milestone: etak-cli-m3-harden
blocked_by:
  - etak-cli-m3-s1-cross-type-ops
acceptance_criteria:
  - "Every validation error names the field, the invalid value, and the expected shape"
  - "Every not-found error names the slug and suggests `etak <type> list` to see what exists"
  - "Every adapter/IO error names the file and the underlying OS error cleanly (no raw stack traces in human mode)"
  - "Every usage error links to the relevant `--help` subcommand"
  - "Drift warnings name the section, the drift type (added/reordered/deleted/renamed), and whether round-trip will preserve it"
  - "Error text is reviewed for tone — specific, actionable, not snarky"
---

## Description

Walk the CLI end to end and rewrite every user-facing error to pass the "would a new developer understand this without reading the source?" test. This is the polish pass that makes the conversion surface feel solid.
