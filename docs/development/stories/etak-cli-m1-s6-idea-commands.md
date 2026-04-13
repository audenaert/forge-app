---
name: "M1-S6: etak idea commands — create, get, list, update, link"
type: story
status: draft
parent: etak-cli-m1-prove-abstraction
children: []
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
blocked_by:
  - etak-cli-m1-s1-design-spec
  - etak-cli-m1-s3-zod-schemas
  - etak-cli-m1-s4-adapter-interface-and-fs
  - etak-cli-m1-s5-cli-chassis
acceptance_criteria:
  - "`etak idea create --name \"...\"` creates a new artifact on disk with correct frontmatter, the canonical body template, and a generated kebab-case slug; exits 0"
  - "`etak idea create` supports link flags from the design spec (e.g., `--addresses <slug>`) and validates target existence per the spec's dangling-reference rule"
  - "`etak idea get <slug>` prints the artifact (human or JSON); exits 2 if the slug doesn't exist"
  - "`etak idea list` prints all ideas; supports filtering per the spec"
  - "`etak idea update <slug> --section <section-slug>=<content>` replaces one section and round-trips unrelated sections cleanly, including any human drift"
  - "`etak idea update <slug> --body <content>` and `--body-file <path>` replace the whole body; stdin input works for large content"
  - "`etak idea update <slug> --<frontmatter-field> <value>` updates frontmatter fields"
  - "`etak idea link <slug> --addresses <opportunity-slug>` adds a link; removing a link works per the spec's flag shape"
  - "Every command path has an e2e test; drift-warning paths are explicitly covered"
  - "Validation failures exit 1; not-found exits 2; IO/permission errors exit 3; unknown subcommand exits 4"
  - "`etak idea create` with an already-used slug exits 1 (validation error) — slug collision is user-correctable (rename the artifact), distinct from IO/permission errors (exit 3). Rationale: exit 3 is reserved for conditions the user cannot fix by changing their input (broken filesystem, disk full, permission denied); a colliding slug is fixed by picking a different name, which is the definition of a validation error."
---

## Description

The M1 canary — the first real command surface wired through the chassis and the adapter. When this lands, the milestone demo criteria are met: a user can create, read, list, update, and link an `idea` end-to-end with both output modes.
