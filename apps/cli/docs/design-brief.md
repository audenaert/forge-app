---
name: "Design brief for @etak/cli v1"
type: design-brief
status: open
target_spec: apps/cli/docs/design.md
dispatched_by: tech-lead
dispatched_to: forge-development:architect
project: etak-cli
---

# Architect dispatch brief — `@etak/cli` v1

This brief tells the architect agent what to produce, what is already decided, and what is explicitly left open. The user has already reviewed and approved the shape of the project and has made several binding rulings (marked **LOCKED** below). The architect must honor them and document them in the spec.

## Deliverable

A single design document at `apps/cli/docs/design.md` (create the directory if needed). Target length 4 to 6 pages — longer than a typical spec because the body-parsing topic is load-bearing and needs real treatment. Do not write code. The spec is the only deliverable.

## Scope

- Package: `@etak/cli`, bin `etak`, lives at `apps/cli` in this monorepo.
- Artifact types: discovery only (objective, opportunity, idea, assumption, experiment, critique).
- Adapters: filesystem only. GraphQL adapter is a stubbed class that throws `NotWiredError` and is exercised by the shared contract test suite to confirm the stub shape.
- Commands: `create`, `get`, `list`, `update`, `link`. No `delete` in v1.

## Locked technical decisions (do not re-derive)

- Branch `feat/etak-cli`, worktree `.claude/worktrees/feat-etak-cli`.
- Commander + tsup + tsx + vitest + Zod.
- Hand-written Zod schemas, seeded from `/home/ec2-user/projects/forge/plugins/discovery/skills/discovery/references/schemas.md`.
- Shared contract test suite that any adapter must pass (unit / adapter contract / CLI e2e three-layer strategy). Every exit code path tested. Every Zod schema has a positive and a negative test. At least one schema test parses a real fixture from `docs/discovery/` to catch drift from actual usage.

## Strategic framing (read first)

The product is **Etak**. The SaaS tier is where customers live — that's where costs and distinctive value sit (collaborative OST, SDLC support, learning loop, experimentation). The local-tier CLI is a **funnel hook**, not a customer tier: its job is to get a developer onboarded with zero friction, then convert them to the SaaS. "Customer" means "has a SaaS account." Don't model local-tier users as customers. Don't resolve the local/SaaS split as product tension — they serve different roles in the funnel.

Polish level implication: the fs adapter needs to work and be delightful enough to convert, but investment priorities live on the SaaS side. It's the conversion surface, so it has to be solid, but it's not a product in its own right.

"Forge" is legacy placeholder naming throughout the codebase. The product/CLI/system is Etak. Do not rename code paths yet. Use Etak in all new artifacts and designs.

## Required reading (discovery artifacts)

These contain the strategic framing and will be the fixtures for your schema tests:

- `docs/discovery/objectives/grow-etak-via-local-first-plg.md`
- `docs/discovery/opportunities/solo-devs-blocked-by-team-tool-overhead.md`
- `docs/discovery/ideas/etak-cli-as-growth-onramp.md` (draft — the main idea)
- `docs/discovery/ideas/graph-backed-artifact-store.md` (building — related, shapes the forward-looking graph-backend constraint)

Use real artifact files under `docs/discovery/` as your reference for "what does an artifact of each type look like today" when defining body section schemas. Treat the existing artifacts as the de-facto vocabulary and match them rather than inventing.

## Topics to cover, in this order

### 1. Storage adapter interface

Method signatures, input and output types, and whether the adapter sees parsed documents or raw markdown. The interface must accommodate both the fs adapter (wants parsed docs) and the future graphql adapter (wants typed inputs) without leaking either concern into the other. Document the shape `NotWiredError` takes so the stub adapter passes the contract tests cleanly.

### 2. Link semantics

`schemas.md` defines directional link fields per type (`supports`, `addresses`, `assumed_by`, `tests`, `target`, etc.). Propose a CLI flag shape for creating and removing links. Define dangling-reference behavior — hard error, warn, or accept as dangling. Pick one and justify.

### 3. Update contract and body representation — CRITICAL, most load-bearing section

**Document all three options considered**, including the trade-offs for each. The user explicitly asked that this decision record survive — do not just document the chosen answer.

- **Option A — Structured markdown with per-type section schemas.** Each type's Zod schema declares its body sections by name. On disk: markdown with frontmatter + `## Section Name` headings in canonical order + prose inside. The CLI parses sections by heading and serializes back canonically. The graph backend stores each section as a typed field. Skill calls `etak idea update foo --section open_questions "..."`.
- **Option B — YAML as canonical on-disk format.** Every field (metadata + content) in one typed YAML file, multiline strings for prose.
- **Option C — Markdown with body as one opaque field.** Simplest parsing but pushes full-body composition onto the skill.

**Select Option A.** This is the user's ruling.

Then, for Option A, define:

- **Per-type body template in the Zod schema** — expected section names, canonical order, required vs. optional flag per section.
- **Full update surface** — `--section <name> <content>` for individual section replace, `--body <content>` or `--body-file <path>` for whole-body replace, `--from-file` and stdin support for large content, and frontmatter-field updates for metadata.
- **Drift handling** — how the parser behaves when the human has:
  - (a) added extra sections not in the template,
  - (b) reordered sections from canonical order,
  - (c) deleted required sections,
  - (d) renamed section headings.

  **Rule from the user:** accept (a) and (b) as-is and preserve them on round-trip. Flag (c) and (d) as structured warnings but do not refuse to operate. The human retains authorial control.

- **How drift is reported** — structured output emitted in both human and JSON modes, designed so the forthcoming web UI can consume the same validation data. Not just console warnings. The user explicitly noted: "we'll need this in the web-ui as well" — meaning the same validation/drift logic has to apply when the graph backend is consulted, not just when reading a file.
- **Parser choice** — recommend `remark` / `unified` for heading-aware markdown AST parsing. If you prefer another approach, justify. Hand-rolled heading regex is probably not acceptable (will fail on code blocks containing `##`, HTML, nested headings, etc.). Document the decision.
- **Forward-looking constraint on the graph backend** — it has to round-trip the same drift (extra sections, reordering), so the graph schema cannot be purely canonical-sections-as-typed-fields. Flag this for the `graph-backed-artifact-store` project so that design doesn't bake in a shape that loses drift on write.

### 4. Output contract

`--output json|human` with TTY-based default. Define the JSON envelope shape (wrapper with `status`, `data`, `errors`, `warnings`, `schema` version field). Human output is compact, skimmable, colored. Errors go to stderr in both modes — structured JSON in JSON mode, formatted in human mode.

**Exit code table — LOCKED, do not re-derive:**

```
0 = success
1 = validation error (input failed Zod)
2 = not found (slug doesn't exist)
3 = adapter / IO error (filesystem permission, disk, future network)
4 = unknown command / usage error
```

### 5. Slug generation rules

Kebab-case from `--name`. Collision behavior (error or auto-suffix — pick and justify). Whether slug can be user-overridden with a flag.

### 6. Config resolution and artifact location

**User direction:** artifacts should NOT live under `docs/` (where they are today). Their suggestion is `.etak/artifacts/` as a dotfile-style tool-managed directory, analogous to `.git`, `.vscode`, `.cargo`. Think this through, propose the canonical location, and justify. Cover:

- Default fs adapter root location
- Walk-up discovery to find the project root
- `ETAK_BACKEND` env var for backend selection
- `ETAK_ROOT` or `ETAK_ARTIFACTS` env override
- Whether a project-level `etak.config.json` is needed in v1

Acknowledge that the existing artifacts under `docs/discovery/` will need a migration step later. Do not design the migration — just flag it. Migration is out of scope for v1.

Reasoning to weigh:
- `.etak/` as a dotfile directory follows `.git`, `.vscode`, `.cargo` — implies "tool-managed state" which matches what the CLI is doing.
- Keeps `docs/` free for human-authored documentation that isn't artifact-managed.
- Makes migration of existing `docs/discovery/` artifacts a concrete, visible step.

### 7. Zod validation error rendering

How nested Zod errors are flattened into legible human output and structured JSON output. Should use the same envelope shape as drift warnings where possible, so consumers (CLI in both modes, future web UI) have one shape to render.

### 8. Body section schemas per artifact type

Enumerate the expected sections for each of the six discovery types (objective, opportunity, idea, assumption, experiment, critique), drawn from the current conventions in `schemas.md` and the real artifacts in `docs/discovery/`. Treat the existing artifacts as the de-facto vocabulary. Mark each section required or optional. Note the canonical order. Note: `critique` has no status field and may deviate from the common pattern — it's the canary for schema shape.

Use these fixtures to calibrate:

- `docs/discovery/ideas/etak-cli-as-growth-onramp.md` — sections: Description, Strategic Rationale, Why This Could Work, Open Questions
- `docs/discovery/ideas/graph-backed-artifact-store.md` — sections: Description, Why This Could Work, Open Questions
- `docs/discovery/opportunities/solo-devs-blocked-by-team-tool-overhead.md` — sections: Description, Evidence, Who Experiences This
- `docs/discovery/objectives/grow-etak-via-local-first-plg.md` — sections: Description, Context, Success Criteria, Out of Scope

## Scope rules

- Open questions are allowed. Flag them in the spec and keep moving. Goal is to unblock parallel developer work on M1 scaffold, schemas, and adapter interface — not to resolve every edge case.
- Do not write code. The spec is the only deliverable.
- Do not create the worktree. That happens later, after developer dispatch.
- Do not rename legacy "forge" paths.

## What happens after you finish

The tech-lead will:

1. Review the spec for coverage of all topics and for a clear Option A decision record.
2. Run readiness checks on M1 stories against the finalized spec.
3. Dispatch developers for M1-S2 (scaffold), M1-S3 (schemas), and M1-S4 (adapter interface) in parallel.
4. Dispatch developers for M1-S5 and M1-S6 once scaffold is in place.

Stories are already seeded speculatively in `docs/development/stories/etak-cli-*.md`. They'll be refined against this spec once it lands.
