---
name: "M1-S4: Storage adapter interface + filesystem adapter + GraphQL stub"
type: story
status: draft
parent: etak-cli-m1-prove-abstraction
children: []
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
blocked_by:
  - etak-cli-m1-s1-design-spec
  - etak-cli-m1-s2-package-scaffold
acceptance_criteria:
  - "`StorageAdapter` interface defined per the design spec (topic 1)"
  - "`FsAdapter` implements the interface against `.etak/artifacts/` (or the spec's final location)"
  - "`FsAdapter` parses artifacts with remark/unified (or the spec's chosen parser), preserves human drift (extra sections, reordering), and surfaces structured warnings for deleted or renamed required sections"
  - "`FsAdapter` round-trips a real artifact from `docs/discovery/` with no content loss and no structural churn"
  - "`GraphqlAdapter` stub class implements the interface and raises `NotWiredError` for every write/read call, matching the contract-test expectation"
  - "Shared adapter contract test suite exists and runs against both adapters; fs passes real tests, graphql stub passes by raising the expected error"
  - "Config resolution (walk-up discovery, `ETAK_BACKEND`, `ETAK_ROOT`/`ETAK_ARTIFACTS`) works per the design spec (topic 6)"
  - "Slug collision behavior matches the spec (topic 5)"
---

## Description

The storage abstraction. This is where the central design bet of the CLI lives. The fs adapter does the real work (markdown parsing, drift handling, round-trip preservation). The graphql stub exists only to prove that the contract tests will catch a future graphql adapter that violates the interface.
