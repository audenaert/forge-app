---
name: "M1-S1: Produce the @etak/cli v1 design spec"
type: story
status: complete
parent: etak-cli-design
children: []
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
owner: forge-development:architect
acceptance_criteria:
  - "`apps/cli/docs/design.md` exists and is 4–6 pages long"
  - "Topic 1: Storage adapter interface — method signatures, parsed-doc vs. raw-markdown decision, stub adapter shape (NotWiredError)"
  - "Topic 2: Link semantics — CLI flag shape for create/remove link, dangling-reference behavior picked and justified"
  - "Topic 3: Update contract and body representation — all three options (A/B/C) documented with trade-offs; Option A selected; per-type body template shape in Zod defined; full update surface defined (--section, --body, --body-file, stdin, frontmatter fields); drift handling rules defined (accept add/reorder, flag delete/rename); structured drift reporting defined for human+JSON; parser choice documented (remark/unified or justified alternative); forward-looking graph-backend round-trip constraint called out"
  - "Topic 4: Output contract — JSON envelope shape (status, data, errors, warnings, schema version), human output style, stderr routing, exit code table recorded verbatim (0=success, 1=validation, 2=not found, 3=adapter/IO, 4=usage)"
  - "Topic 5: Slug generation — kebab-case rules, collision behavior picked, override flag decision"
  - "Topic 6: Config resolution and artifact location — canonical artifact directory proposed and justified (.etak/artifacts/ is the user's suggestion); walk-up discovery; ETAK_BACKEND and ETAK_ROOT/ETAK_ARTIFACTS env vars; config file decision; migration of docs/discovery/ acknowledged as deferred"
  - "Topic 7: Zod validation error rendering — flattening rules for human + JSON, shared envelope with drift warnings"
  - "Topic 8: Body section schemas — enumerated for all 6 discovery types (objective, opportunity, idea, assumption, experiment, critique), required/optional flags, canonical order, calibrated against real docs/discovery/ artifacts, critique called out as canary (no status field)"
  - "Open questions section present — remaining uncertainty is flagged, not hidden"
  - "Spec does not include code; does not rename legacy `forge` paths; does not design the docs/discovery migration"
---

## Description

The architect agent produces the single design document for `@etak/cli` v1. The spec is the gate for M1 developer work — once it lands, M1-S2 (scaffold), M1-S3 (schemas), and M1-S4 (adapter interface) can run in parallel.

The detailed dispatch brief lives at `apps/cli/docs/design-brief.md`. That brief is the source of truth for what the spec must cover, which decisions are locked, and which decisions are open.

## Notes

- **Locked decisions** (do not re-derive): exit code table (0–4), filesystem adapter only, GraphQL stub, discovery types only, commander/tsup/tsx/vitest/Zod, hand-written Zod schemas, Option A for the update contract, no `delete` command.
- **Most load-bearing topic:** body parsing and drift handling (topic 3). The user specifically called this out as the place where the CLI does a lot of work.
- **Forward-looking constraint:** the graph-backend project must be told that its schema cannot be purely canonical-sections-as-typed-fields, because the fs adapter preserves human drift (extra sections, reordering). The spec should call this out explicitly.

## Completion notes (2026-04-12)

Spec landed at `apps/cli/docs/design.md`. All five architect-flagged open questions were ruled by the user and applied to the spec (see the Changelog section of the spec):

- 6.A — `etak init` ships in v1 (new §6.1a).
- 6.B — `etak init` is explicit and required; no auto-create on first run.
- 3.A — `--body-stdin` carries body only; frontmatter stays flag-driven.
- 8.C — Critique is body-as-opaque, intentional deviation from the per-type section pattern.
- 8.A/B — Assumption and experiment templates are provisional (user-approved); recalibration tracked as an M3 chore.

Affected downstream stories updated: M1-S3 (critique opaque, assumption/experiment provisional), M1-S5 (now owns `etak init`). A new M3 chore story was added for template recalibration.
