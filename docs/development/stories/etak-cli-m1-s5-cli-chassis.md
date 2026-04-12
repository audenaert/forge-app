---
name: "M1-S5: CLI chassis — command wiring, output formatter, exit codes"
type: story
status: draft
parent: etak-cli-m1-prove-abstraction
children: []
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
blocked_by:
  - etak-cli-m1-s1-design-spec
  - etak-cli-m1-s2-package-scaffold
  - etak-cli-m1-s3-zod-schemas
  - etak-cli-m1-s4-adapter-interface-and-fs
acceptance_criteria:
  - "Commander namespaces are wired for every discovery type from the design spec (idea implemented in S6; others stubbed to print 'not implemented in M1' and exit 4)"
  - "`--output json|human` flag works globally; default is TTY-based per the design spec (topic 4)"
  - "JSON envelope matches the spec shape (status, data, errors, warnings, schema version)"
  - "Human output is compact, skimmable, and colored (respecting `NO_COLOR`)"
  - "Errors route to stderr in both modes; structured JSON on stderr in JSON mode"
  - "Every exit-code path (0 success, 1 validation, 2 not found, 3 adapter/IO, 4 usage) is reachable and has at least one e2e test hitting it"
  - "Zod validation errors render via the helper from S3 and share the envelope shape with drift warnings"
  - "Drift warnings from the fs adapter surface in both human and JSON output per the spec"
  - "`etak --help` lists all commands; `etak <type> --help` lists subcommands per type"
  - "`etak init` command is implemented per design spec §6.1a: creates `.etak/artifacts/` with per-type subdirectory skeleton (objectives, opportunities, ideas, assumptions, experiments, critiques) including `.gitkeep` files; idempotent on re-run; `--root <path>` overrides cwd; `--with-config` optionally writes a minimal `etak.config.json`; by default no config file is written"
  - "Running any non-init command in an uninitialized project exits with code 3 and suggests `etak init`"
  - "`etak init` is implemented in the chassis layer using plain fs calls — it does not go through the ArtifactStoreAdapter interface"
---

## Description

The chassis that every command runs through. Once this lands, adding a command is just "write the handler and wire it up" — the formatter, exit codes, error routing, and JSON envelope are all done.
