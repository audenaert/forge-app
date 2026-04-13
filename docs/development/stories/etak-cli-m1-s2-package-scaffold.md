---
name: "M1-S2: Scaffold the @etak/cli package"
type: story
status: draft
parent: etak-cli-m1-prove-abstraction
children: []
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
blocked_by:
  - etak-cli-m1-s1-design-spec
acceptance_criteria:
  - "`apps/cli/` exists as an npm workspace member with `package.json` name `@etak/cli`, bin `etak`"
  - "TypeScript strict mode, Node 22 target, ESM"
  - "tsup configured to build to `dist/`; tsx configured for dev"
  - "vitest configured with three project roots (unit, adapter-contract, cli-e2e) per the design spec"
  - "Commander wired with a placeholder `etak --help` that lists the command namespaces from the spec"
  - "`etak --version` prints the package version"
  - "`npm run build` and `npm run test` pass with the empty test suite"
  - "Turbo pipeline entries added if `turbo.json` exists by then; otherwise noted as a follow-up"
  - "No command implementations yet — chassis-only scaffold"
---

## Description

Stand up the `@etak/cli` workspace package so the rest of M1 has something to build into. Scaffold only — no commands, no adapters, no schemas. Parallel work (S3, S4) starts as soon as this lands.
