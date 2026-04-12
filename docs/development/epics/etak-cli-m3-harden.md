---
name: "Etak CLI M3: Harden for conversion surface"
type: epic
status: draft
parent: etak-cli
workstream: etak-cli-core
milestone: etak-cli-m3-harden
children:
  - etak-cli-m3-s1-cross-type-ops
  - etak-cli-m3-s2-error-message-pass
  - etak-cli-m3-s3-readme
  - etak-cli-m3-s4-qe-audit
---

## Description

Polish pass so the CLI works as a PLG conversion surface: cross-type operations, legible errors at every exit-code path, a README a brand-new user can follow, and a QE audit against the full design spec.

## Stories

- **S1 — Cross-type operations.** `etak list` without a type, `etak link` as a top-level command, shared helpers.
- **S2 — Error message pass.** Walk every exit-code path; ensure every user-facing error is specific, names the file/slug/section involved, and suggests a fix where possible.
- **S3 — README.** Package-level README at `apps/cli/README.md`. New-user onboarding path: install, `etak --help`, first artifact, first link, JSON mode.
- **S4 — QE audit.** quality-engineer reviews coverage against the design spec, flags gaps, confirms contract tests exercise all adapter paths.

## Dependencies

Depends on M2 completing. Stories within M3 mostly independent; the README (S3) benefits from the error-message pass (S2) landing first.
