---
name: "@etak/cli v1 — design specification"
type: spec
status: draft
for: etak-cli
adrs: []
---

# `@etak/cli` v1 — Design Specification

## Context

Etak is a SaaS product for AI-assisted product discovery and software development. Its
go-to-market is product-led: a solo developer should be able to install a Claude Code
plugin, run `etak` against a local project, and get value in under five minutes with no
account, no server, and no cost. Only later do they convert into the SaaS tiers where
collaboration, the graph-backed artifact store, and the learning loop live.

`@etak/cli` is the funnel hook for that PLG motion. It is the single interface every
discovery skill calls to create, read, update, list, and link artifacts. Because skills
go through the CLI, they become backend-agnostic: the same `etak idea create` works
against a local filesystem today and against the hosted GraphQL graph store later, with
no skill rewrites when the user upgrades. That continuity — "no migration cliff" — is
the strategic bet. See `docs/discovery/objectives/grow-etak-via-local-first-plg.md` and
`docs/discovery/ideas/etak-cli-as-growth-onramp.md`.

This spec covers v1 only: discovery artifact types, filesystem adapter, and a stubbed
GraphQL adapter that exists solely to prove the shared contract test suite works across
adapter implementations. The goal is to unblock parallel developer work on M1-S2
(scaffold), M1-S3 (schemas), and M1-S4 (adapter interface) — not to resolve every edge
case. Open questions are flagged inline.

## Current State

- `apps/cli/` exists with only a `docs/` directory. No package.json, no source.
- Discovery artifacts currently live in-repo under `docs/discovery/{objectives,opportunities,ideas}/`
  as markdown with YAML frontmatter. Existing skills embed that path layout in their
  instructions — the CLI will break that coupling.
- `schemas.md` under `forge/plugins/discovery/skills/discovery/references/` is the source
  of truth for frontmatter shape, status enums, and typed link fields. Zod schemas in
  this package are hand-written from it (locked decision).
- No existing CLI package, no adapter interface, no shared contract test harness — this
  design is greenfield.
- `apps/api/` exists alongside `apps/cli/` in the npm workspace and gives us a second
  package to model publish/build conventions from, but is otherwise unrelated.

## Scope (v1)

**In scope**

- Package `@etak/cli` with bin `etak`, at `apps/cli`.
- Artifact types: `objective`, `opportunity`, `idea`, `assumption`, `experiment`, `critique`.
- Commands: `create`, `get`, `list`, `update`, `link`. No `delete`.
- Adapters: filesystem (full implementation); GraphQL (stub that throws `NotWiredError`,
  exercised by the shared contract test suite to prove the stub shape).
- Output modes: `human` (default on TTY) and `json` (default off-TTY, or explicit).
- Slug generation, Zod validation, drift detection, link creation/removal.

**Out of scope**

- `delete` command.
- Migration of existing `docs/discovery/*` artifacts into the new canonical location
  (flagged in topic 6, designed later).
- Development-tier artifact types (initiative, project, epic, story, task, spec, ADR).
- Dry-run / preview mode (listed in the idea as an open question; deferred).
- Skill rollout plan.

---

## 1. Storage adapter interface

The adapter is the only thing that knows where artifacts physically live. Above it,
commands and schema validation are backend-agnostic. Below it, each implementation has
freedom — the filesystem adapter walks directories and parses markdown; the future
GraphQL adapter issues mutations.

**Key shape decision.** The adapter exchanges **typed, validated domain objects**, not
raw markdown. Parsing, drift detection, and serialization live in a layer above the
adapter, inside the filesystem adapter implementation. The adapter interface never sees
markdown. This lets the GraphQL adapter accept the same typed inputs and route them to
mutations without any file-format concerns leaking in.

```ts
// Shape sketch — not binding on method names, but the directionality is.
interface ArtifactStoreAdapter {
  create(input: ArtifactCreateInput): Promise<ArtifactRecord>;
  get(ref: ArtifactRef): Promise<ArtifactRecord>;
  list(query: ArtifactListQuery): Promise<ArtifactRecord[]>;
  update(ref: ArtifactRef, patch: ArtifactUpdateInput): Promise<ArtifactUpdateResult>;
  link(from: ArtifactRef, field: LinkFieldName, to: ArtifactRef): Promise<void>;
  unlink(from: ArtifactRef, field: LinkFieldName, to: ArtifactRef): Promise<void>;
}
```

Shared types:

- `ArtifactRef`: `{ type: ArtifactType, slug: string }`.
- `ArtifactRecord`: `{ ref, frontmatter, body: BodyDocument, warnings: DriftWarning[] }`.
- `BodyDocument`: the typed-section structure produced by the parser, described in topic 3.
- `ArtifactUpdateInput`: a patch object with optional frontmatter field updates and
  optional body mutations (`{ sections: { [name]: string } }` or `{ wholeBody: BodyDocument }`).
- `ArtifactUpdateResult`: `{ record, warnings: DriftWarning[] }`.
- `ArtifactListQuery`: `{ type, status?, parentRef? }` and similar simple filters. The
  filesystem adapter implements these as directory scans; the GraphQL adapter translates
  to server-side queries.

The **filesystem adapter** is responsible for:

1. Reading the file at `<root>/<type>/<slug>.md`.
2. Parsing YAML frontmatter.
3. Parsing the body to a `BodyDocument` using `remark`/`unified` (see topic 3).
4. Validating against the per-type Zod schema.
5. Applying updates and re-serializing canonically.
6. Surfacing drift warnings as structured output, never just log lines.

The **GraphQL stub adapter** implements the full interface, and every method throws
`NotWiredError`. Its purpose is to validate the shared contract test suite: the tests
check that the stub conforms to the interface at the type level and that calls raise
`NotWiredError` with a consistent shape, so the real implementation later has a known
target.

**`NotWiredError` shape.** A plain subclass of `Error`:

```ts
class NotWiredError extends Error {
  readonly code = "E_NOT_WIRED";
  constructor(
    readonly adapter: string,    // e.g. "graphql"
    readonly operation: string,  // e.g. "create"
  ) {
    super(`${adapter} adapter is not wired in v1 (operation: ${operation})`);
  }
}
```

It maps to exit code 3 (adapter / IO error) — the contract test suite asserts that.

---

## 2. Link semantics

`schemas.md` defines directional, typed link fields per artifact type (`supports`,
`addresses`, `assumed_by`, `tests`, `result_informs`, `delivered_by`, `target`). In v1,
these are represented as arrays of slug strings in frontmatter (except for scalar links
like `target` and `delivered_by`, which carry a single slug).

**CLI flag shape.** A single `etak link` subcommand, addressed by source node, so the
direction of the relationship is explicit in the command itself:

```
etak link add    --from <type/slug> --field <link-field> --to <type/slug>
etak link remove --from <type/slug> --field <link-field> --to <type/slug>
```

`--from` and `--to` are type-qualified (`idea/etak-cli-as-growth-onramp`) so the CLI can
resolve and validate both ends without ambiguity. `--field` must be one of the legal
link fields for the source type; the Zod schema declares them, and a bad field name
raises a validation error (exit 1). Where the field is a scalar (`target`,
`delivered_by`), `link add` replaces the existing value and `link remove` clears it.

Skills that find the subcommand form awkward can also set links at create time via
typed convenience flags (`--addresses <slug>`, `--supports <slug>`, etc.) — those
flags are sugar over the same underlying set operation.

**Dangling reference behavior.** Three options were considered:

- **Hard error on dangling refs** — safest but blocks legitimate workflows (e.g. pasting
  in a plan that references a slug not yet created).
- **Silent accept** — cheapest but lets broken graphs compound invisibly.
- **Warn, proceed** — accept the write, emit a structured `DriftWarning` of kind
  `dangling_ref`, non-zero exit only in a future `--strict` mode.

**Decision: warn, proceed.** Matches the user's drift-handling philosophy elsewhere in
this spec ("human retains authorial control") and aligns with the filesystem reality
that files can be created out of order. A future `--strict` flag can promote these
warnings to errors for CI use. The GraphQL backend may choose to enforce referential
integrity at its own layer; the CLI's rule is the permissive one.

Unlinking a ref that isn't present is a no-op with a `link_not_present` warning — not
an error. Symmetric with "remove the thing that isn't there is fine."

---

## 3. Update contract and body representation (critical)

This is the load-bearing decision in v1. It sets the shape of every artifact on disk,
the update surface every skill calls, the drift contract both the CLI and the web UI
will consume, and — via the forward-looking constraint below — what the graph backend
can and cannot do on write.

### 3.1 Options considered

#### Option A — Structured markdown with per-type section schemas *(selected)*

Each type's Zod schema declares its body sections by canonical name, order, and
required/optional flag. On disk, an artifact is markdown with YAML frontmatter plus
`## Section Name` H2 headings in canonical order and prose underneath. The CLI parses
the body into an AST keyed by heading, validates it against the schema, and
canonicalizes on round-trip.

**Strengths**
- Matches what the existing fixtures look like today (`objective`, `opportunity`, and
  `idea` artifacts under `docs/discovery/` all already use `## H2` section headings).
  No disruption to how humans already author.
- Markdown remains human-readable and Claude-editable — critical for the "just open it
  in the editor" escape hatch.
- Skills get a precise update surface: `etak idea update foo --section open_questions "..."`.
- Per-section validation is feasible (required sections present, body not empty on
  required sections, etc.).
- Graph backend can map sections to typed fields where appropriate.

**Weaknesses**
- Parser complexity (heading-aware AST, canonical ordering, drift detection).
- Ambiguity when humans add or rename sections — must be handled, not ignored
  (addressed below).
- Section-level updates are a narrower contract than "rewrite the whole body," which
  means skills need to know the section names.

#### Option B — YAML as canonical on-disk format

Every field (metadata and content) in one typed YAML file, with multiline strings for
prose sections.

**Strengths**
- One file format, one parser, uniform validation.
- Zero ambiguity — the schema is the file.

**Weaknesses**
- Writing multi-paragraph prose in YAML multiline strings is hostile. Code blocks,
  backticks, lists, and block quotes all require careful quoting and escaping; every
  author will hit foot-guns.
- Diffs are worse than markdown diffs.
- The existing fixtures are all markdown-bodied; adopting YAML would force a
  migration of human content, not just a CLI rewrite.
- Loses the "just open the file and edit" property that underpins the local-first
  onboarding story.

#### Option C — Markdown with body as one opaque field

Frontmatter plus a single body string the CLI never parses.

**Strengths**
- Trivial parser.
- Zero drift — the body is just a blob.

**Weaknesses**
- Pushes section composition onto every skill. Skills end up hand-assembling
  `## Description\n\n...\n\n## Open Questions\n\n...` strings, which is exactly the
  embedded filesystem layout coupling the CLI is meant to remove.
- No validation of required sections — a skill could easily ship an idea with no
  "Description" section.
- No update surface narrower than "replace the entire body." Every edit becomes a
  read-modify-write of the whole body string, which encourages skills to regenerate
  prose they didn't mean to touch.
- Graph backend loses the typed-field shape entirely and becomes a blob store.

### 3.2 Decision: Option A

Select Option A. The user's ruling. Recording trade-offs for the decision record.

### 3.3 Per-type body template in the Zod schema

Each type's schema exports, alongside frontmatter validation, a `bodyTemplate` of the
form:

```ts
interface BodySectionTemplate {
  name: string;          // canonical heading text, e.g. "Open Questions"
  slug: string;          // machine-safe key, e.g. "open_questions"
  required: boolean;
  order: number;         // canonical position (1-based)
}

interface BodyTemplate {
  sections: BodySectionTemplate[];
}
```

The parsed body document is:

```ts
interface BodyDocument {
  sections: BodySection[];          // in the order they appeared in the source
  warnings: DriftWarning[];         // any drift from the template
}

interface BodySection {
  heading: string;                  // as authored
  slug: string;                     // matched to template.slug if known, else derived
  status: "canonical" | "extra" | "renamed";
  canonicalOrder?: number;          // template order if canonical
  nodes: MdastNode[];               // remark/unified child nodes for the section
}
```

Section 8 lists the actual templates for all six discovery types.

### 3.4 Full update surface

The `update` command accepts, in priority order:

- `--section <name> <content>` — replace the body of a single section in place. `<name>`
  is matched against template section slugs first, then canonical heading text
  (case-insensitive), then verbatim heading text from the document. Multiple
  `--section` flags can be passed in one call.
- `--section-file <name> <path>` — same, but body read from a file (for content longer
  than a shell line).
- `--body <content>` — replace the entire body. The content is parsed, validated, and
  may itself produce drift warnings.
- `--body-file <path>` — same, reading from a file. Use for large content.
- `--body-stdin` — read full body from stdin. Skills running inside Claude Code use
  this path when the body is generated inline in the session. **Body only — stdin
  never carries frontmatter.** Frontmatter updates remain flag-driven
  (`--status`, `--addresses`, ...) in every form of the update command. This keeps
  the two channels (structured metadata vs. prose) cleanly separated and avoids a
  second parse path that would have to re-run Zod on piped content.
- `--<frontmatter-field> <value>` — simple scalar or array frontmatter updates, e.g.
  `--status validated`, `--addresses opportunity-x` (repeatable for array fields).

Exactly one body-update flag form is permitted per call (`--section` family is one
form, `--body*` is another). Combining forms is a usage error (exit 4).

Large content handling: `--section-file`, `--body-file`, and `--body-stdin` exist
precisely because shell argv is not a viable channel for multi-paragraph prose. The
skill-facing convention is: small edits inline, large edits via file or stdin.

### 3.5 Drift handling rule

When the parser walks a document, it compares its section structure to the template.
The four drift categories and their handling are:

| Case | Description | Handling |
|------|-------------|----------|
| (a) Added section | Author added a `## My New Section` not in the template | **Accept as-is.** Mark the section with `status: "extra"`. Preserve it on round-trip in its authored position. Emit a `DriftWarning` of kind `extra_section` at severity `info`. |
| (b) Reordered sections | Canonical sections appear in a non-canonical order | **Accept as-is.** Preserve the authored order on round-trip — do not re-sort. Emit a `DriftWarning` of kind `section_reordered` at severity `info`. |
| (c) Deleted required section | A template section marked `required: true` is absent | **Proceed, flag loudly.** Emit a `DriftWarning` of kind `missing_required_section` at severity `warning`. The command does not refuse to operate. |
| (d) Renamed heading | A heading exists in the canonical position but with different text | **Proceed, flag.** Emit a `DriftWarning` of kind `section_renamed` at severity `warning`, carrying both the authored heading and the nearest canonical match. Mark the section `status: "renamed"` so serialization preserves the author's wording. |

The philosophy: the human is the author of record for their content. The CLI validates,
warns, and preserves — but never rewrites or refuses. Skills running against drifted
artifacts still succeed and still see structured signals they can surface to the human.

**Round-trip preservation.** On serialization, the canonical template order is used
*only for sections the template owns and the author hasn't moved*. Extra sections and
author-reordered sections are written back in their authored positions. This is what
forces the forward-looking constraint on the graph backend — see §3.8.

### 3.6 Drift reporting format

Drift is structured data, not log output. Every `DriftWarning` has the shape:

```ts
interface DriftWarning {
  kind:
    | "extra_section"
    | "section_reordered"
    | "missing_required_section"
    | "section_renamed"
    | "dangling_ref"
    | "link_not_present"
    | "unknown_frontmatter_field";
  severity: "info" | "warning";
  message: string;                      // human-readable one-liner
  location?: {
    artifactRef: ArtifactRef;
    section?: string;                   // heading text, if applicable
    line?: number;                      // 1-based, if applicable
  };
  details?: Record<string, unknown>;    // kind-specific structured payload
}
```

In `human` output mode, drift warnings render as a compact, colored block after the
primary command output — yellow for `warning`, gray for `info`. In `json` output mode,
warnings are a first-class field on the response envelope (see topic 4). Both modes
emit the same `DriftWarning` shape underneath; only the renderer differs.

This matters because the same validation and drift logic will run in the future web
UI against the graph backend. One shape, three consumers: human CLI, JSON CLI,
web UI. The web UI should be able to display drift inline on an artifact view without
re-inventing what "drift" means.

### 3.7 Parser choice

Use `remark` + `unified` for heading-aware markdown AST parsing. Specifically:

- `unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]).use(remarkStringify)` for
  round-trip.
- Walk the AST to extract frontmatter, then slice the body into H2-bounded sections by
  scanning top-level nodes between `heading[depth=2]` markers.
- `remark-stringify` with fixed options (`bullet: "-", fences: true, rule: "-"`) to
  produce a deterministic canonical serialization.

Hand-rolled regex on `^## ` is rejected: it fails on code fences containing `##`, on
HTML blocks, on setext headings, and on any nested structure. `remark` handles all of
these by virtue of being a real markdown parser, and the ecosystem (`remark-frontmatter`,
`remark-stringify`) gives us the round-trip property we need.

Other parsers considered:
- **markdown-it** — great parser, but its AST is flatter and harder to edit in place.
- **micromark (raw)** — too low-level; we'd be rebuilding remark.
- **mdast-util-from-markdown + to-markdown directly** — this is what remark is built
  on. Equivalent. Using remark for its plugin ecosystem and familiarity.

### 3.8 Forward-looking constraint on the graph backend

Because Option A preserves extra sections and author-reordered canonical sections on
round-trip, the graph backend cannot model a discovery node as *purely* a set of typed
fields corresponding to canonical template sections. If it did, a round-trip through
the graph would silently delete any extra section the human added in their local
editor, which defeats the drift-handling rule and breaks the local-to-cloud upgrade
path ("same artifacts carry forward").

**Constraint to flag for the `graph-backed-artifact-store` project:** each discovery
node's body must be modeled as an **ordered list of sections**, each carrying its
heading, its optional canonical slug, and its content. Canonical template sections can
still surface as typed fields in the GraphQL API for convenience queries (e.g.
`idea.openQuestions`), but those must be derived views over the underlying ordered
section list, not the storage shape itself.

Equivalently: the graph backend stores what a `BodyDocument` stores. Typed-field queries
are projections.

This constraint is inbound from the CLI spec, not a binding decision on the graph store
design — but baking canonical-sections-as-fields into the graph schema would be
incompatible with this CLI's drift contract, and therefore with the PLG continuity
promise.

---

## 4. Output contract

Two output modes: `human` and `json`, selected by `--output` or `-o`. Default: `human`
when stdout is a TTY, `json` otherwise. This matches standard CLI ergonomics and lets
skills run the CLI non-interactively without having to pass the flag.

### 4.1 JSON envelope

Every JSON-mode command emits exactly one JSON object on stdout, followed by a newline.
Errors go to stderr (see below), but the shape is the same envelope.

```jsonc
{
  "schema": "etak-cli.v1",            // envelope version, bumped on breaking change
  "status": "ok" | "error",
  "command": "idea update",           // canonical subcommand path
  "data": { /* command-specific result */ } | null,
  "warnings": [ /* DriftWarning[] */ ],
  "errors": [ /* StructuredError[] */ ]
}
```

- `schema` lets downstream consumers version-gate parsing.
- `data` is null when `status` is `error`.
- `warnings` is always present; empty array when there are none. This is load-bearing
  for drift — it means every consumer can unconditionally read `warnings` without
  optional-chaining.
- `errors` is empty on success, non-empty on error.

`StructuredError` reuses the same shape as `DriftWarning` for location/details where
possible, with an added `code` field drawn from the exit-code table (topic 4.3).

### 4.2 Human mode

- Compact, skimmable, colored when stderr/stdout is a TTY and `NO_COLOR` is not set.
- Success output: one line with the affected artifact ref and action
  (`created idea/etak-cli-as-growth-onramp`), optionally followed by a short block of
  key fields.
- Warnings: yellow/gray block after the primary output, one line per warning.
- Errors: red block on stderr, one line per error, with suggestions where available.

Human-mode rendering is a thin layer on top of the envelope — the JSON envelope is
always built first, then rendered. This guarantees the two modes can never drift from
each other.

### 4.3 Exit codes (locked)

```
0 = success
1 = validation error (input failed Zod)
2 = not found (slug doesn't exist)
3 = adapter / IO error (filesystem permission, disk, future network)
4 = unknown command / usage error
```

Drift warnings alone do not alter the exit code — a command that succeeds with
warnings exits 0. A future `--strict` flag may promote `warning`-severity drift to
exit 1; that's out of scope for v1 but the envelope shape supports it without
breaking change.

`NotWiredError` from the stub GraphQL adapter maps to exit 3 with
`errors[0].code == "E_NOT_WIRED"`. The contract test suite asserts that.

### 4.4 stderr vs stdout

- `stdout`: primary command output (success JSON envelope, success human output).
- `stderr`: error output when `status == "error"`, and nothing else. The JSON envelope
  is still a single object, just written to stderr. This preserves pipe-ability
  (`etak idea list -o json | jq ...` never sees errors mixed in) and matches the
  convention of `jq`, `gh`, and other pipeable CLIs.

---

## 5. Slug generation

Slugs are kebab-case, derived from `--name` by:

1. Lowercasing.
2. Replacing any run of characters outside `[a-z0-9]` with a single `-`.
3. Trimming leading/trailing `-`.
4. Truncating to 80 characters at the last safe `-` boundary.

A slug must match `^[a-z0-9][a-z0-9-]*[a-z0-9]$` and be between 3 and 80 characters.
A name that would produce a slug shorter than 3 characters is a validation error
(exit 1) with a suggestion to pass `--slug` explicitly.

**User override.** A `--slug <value>` flag bypasses derivation entirely, subject to
the same regex. This exists because naming is often more prose-y than the skill wants
the slug to be, and giving the author a handle is cheap.

**Collision behavior.** On `create`, if the resolved slug already exists:

- **Default:** error and exit 1, with the existing slug surfaced in the error and a
  suggestion to pass `--slug` or `--force-suffix`.
- **`--force-suffix`:** append `-2`, `-3`, ... until a free slug is found.

Rationale for erroring by default: silent suffixing is a foot-gun — skills can end up
creating `opportunity-x-2` without the user realizing it, and then later writes land
against the wrong artifact. The default makes collisions visible; `--force-suffix` is
available for scripts that genuinely want best-effort creation (e.g. batch imports).

---

## 6. Config resolution and artifact location

### 6.1 Canonical artifact location

**Canonical v1 location: `.etak/artifacts/<type>s/<slug>.md`** at the project root,
where `<type>` is the singular form (`objective`, `idea`, ...) and the directory is
pluralized (`objectives`, `ideas`) to match existing fixture conventions.

Rationale:

- `.etak/` is tool-managed state. It sits alongside `.git/`, `.vscode/`, `.cargo/`,
  `.turbo/` — all directories that communicate "this is infrastructure a tool owns,
  not content a human owns."
- It keeps `docs/` free for genuinely human-authored documentation (READMEs,
  architectural docs, tutorials) that is not artifact-managed and should not be
  validated, drift-detected, or touched by the CLI.
- It makes the boundary between "structured artifact the CLI owns the shape of" and
  "free-form doc the human owns the shape of" physically visible in the tree.
- It forces the migration of existing `docs/discovery/*` artifacts to be a concrete,
  visible step rather than an accidental in-place mutation.

The `.etak/` dotfile directory is **checked in**, not gitignored. The artifacts are
the project's knowledge, not ephemeral state. The CLI does not create a `.gitignore`
entry. Skills should not treat `.etak/` as disposable.

**Migration of existing `docs/discovery/` artifacts is out of scope for v1** and is
flagged for a follow-up. When it happens, it is a one-time move plus a rewrite of any
skill instructions that still reference the old path. The CLI does not read from
`docs/discovery/` — M1 stories that need existing fixtures for tests should copy them
into a test-fixtures directory rather than pointing the adapter at the legacy path.

### 6.1a `etak init` (ships in v1, required)

v1 ships `etak init`. It is **required** — the CLI does not auto-create `.etak/` on
first `etak <cmd>` invocation. Running a command in a project without an initialized
`.etak/` directory is an error (exit 3) with a suggestion to run `etak init`.

**Minimal v1 behavior:**

1. Resolves the project root. Default: the current working directory. `--root <path>`
   overrides.
2. Creates `.etak/artifacts/` with the per-type subdirectory skeleton:
   `objectives/`, `opportunities/`, `ideas/`, `assumptions/`, `experiments/`,
   `critiques/`. Empty directories (tracked via `.gitkeep`) so the tree is visible
   on a fresh checkout.
3. Does **not** write an `etak.config.json` by default. v1 does not need one — env
   vars and built-in defaults cover every documented case. A `--with-config` flag
   writes a minimal `etak.config.json` for authors who want to pin choices; this is
   the only thing that ever produces a config file in v1.
4. If `.etak/` already exists, `etak init` is idempotent: it fills in any missing
   subdirectories and re-prints the confirmation. It never overwrites existing
   content.
5. Prints a one-line confirmation in human mode
   (`initialized .etak/artifacts/ at <path>`) and a normal envelope in JSON mode.

`etak init` adds a new top-level command to the CLI surface. It does not change any
adapter contract — init is a CLI-layer operation that uses plain `fs` calls directly,
not the `ArtifactStoreAdapter` interface. Its implementation belongs in the chassis
story (M1-S5) because it has no artifact-type dependency and must work before any
adapter is reachable.

The rationale for "explicit, not auto-create": the CLI writes to the repo.
Implicit first-run scaffolding would be a foot-gun for users who run `etak` in the
wrong directory by accident. A one-time explicit step is cheap and makes the
filesystem footprint a deliberate choice the user consents to.

### 6.2 Root discovery

The filesystem adapter finds the project root by walking upward from the current
working directory, stopping at the first directory containing a `.etak/` directory,
a `.etak.json`, or (fallback) a `package.json` colocated with a user-configured
artifact root. On finding none, it errors with exit 3 and suggests `etak init` (once
that exists) or setting `ETAK_ROOT`.

### 6.3 Environment variables

- **`ETAK_BACKEND`** — `fs` | `graphql`. Defaults to `fs`. Selects which adapter the
  CLI instantiates. The stub `graphql` value exists so skills can be tested against
  `NotWiredError` behavior in v1.
- **`ETAK_ROOT`** — absolute path to the project root. Overrides walk-up discovery.
  Useful in CI and for skills that want to pin the root.
- **`ETAK_ARTIFACTS`** — absolute path to the artifact directory. Overrides the
  default `<root>/.etak/artifacts`. Useful for tests and for projects that want to
  keep artifacts outside `.etak/` for organizational reasons.
- **`NO_COLOR`** — respected; disables ANSI colors in human-mode output.

Environment variables take precedence over config file values, which take precedence
over defaults. CLI flags take precedence over everything.

### 6.4 Project-level config

A `etak.config.json` at the project root is **optional in v1**. If present, it may
carry:

```json
{
  "backend": "fs",
  "root": ".",
  "artifacts": ".etak/artifacts"
}
```

No other keys are recognized in v1. Unknown keys emit a warning (not an error).

The config file exists for projects that want to pin choices without relying on env
vars. v1 does not require it. It is only ever created by `etak init --with-config`
(see §6.1a); normal command invocation never creates or modifies `etak.config.json`.

---

## 7. Zod validation error rendering

Zod produces nested error trees keyed by path (`["frontmatter", "addresses", 0]`). The
CLI flattens these to the same `StructuredError`/`DriftWarning` shape the envelope
already uses, so consumers render one shape everywhere.

```ts
interface StructuredError {
  code: string;                           // e.g. "E_VALIDATION", "E_NOT_FOUND", "E_IO", "E_USAGE", "E_NOT_WIRED"
  message: string;                        // human-readable one-liner
  location?: {
    artifactRef?: ArtifactRef;
    field?: string;                       // dotted path: "frontmatter.addresses[0]"
    section?: string;
    line?: number;
  };
  details?: Record<string, unknown>;      // e.g. { expected: "string", received: "number" }
}
```

Mapping rules:

- Each leaf Zod issue becomes one `StructuredError` with `code: "E_VALIDATION"`.
- `location.field` is the dotted/bracketed path joined from the Zod issue's `path`.
- `message` is the Zod issue's `message`, optionally prefixed with the field path in
  human mode for legibility.
- `details.expected` / `details.received` carry Zod's type metadata when available,
  so a web UI can render form-style inline errors.

**Human mode rendering:**

```
error: validation failed for idea/etak-cli-as-growth-onramp
  frontmatter.status          expected one of: draft, exploring, validated,
                              ready_for_build, building, shipped; got "drafy"
  frontmatter.addresses[0]    slug must match ^[a-z0-9][a-z0-9-]*[a-z0-9]$
```

**JSON mode rendering:** the same `StructuredError[]` array under `errors` in the
envelope. Consumers parse once, render per their UI.

Using the same shape for validation errors and drift warnings is deliberate: the web
UI will eventually surface both on an artifact view, and re-inventing a second shape
for each would guarantee the two renderers drift.

---

## 8. Body section schemas per artifact type

Drawn from `schemas.md` and calibrated against the real fixtures under
`docs/discovery/`. Only `objective`, `opportunity`, and `idea` have live fixtures in
this repo today; the other three are seeded from `schemas.md` and are flagged as
"calibrate-against-real-use" open questions. Section slugs are machine keys used by
`--section <slug>`; heading text is the canonical H2 text on disk.

Required sections are marked `*`. Canonical order is top-to-bottom.

### Objective

Fixture: `docs/discovery/objectives/grow-etak-via-local-first-plg.md`.

| # | Slug | Heading | Required |
|---|---|---|---|
| 1 | `description` | Description | * |
| 2 | `context` | Context | |
| 3 | `success_criteria` | Success Criteria | * |
| 4 | `out_of_scope` | Out of Scope | |

`schemas.md` also mentions "how we'd measure it" — folded into Success Criteria
based on the live fixture.

### Opportunity

Fixture: `docs/discovery/opportunities/solo-devs-blocked-by-team-tool-overhead.md`.

| # | Slug | Heading | Required |
|---|---|---|---|
| 1 | `description` | Description | * |
| 2 | `evidence` | Evidence | * |
| 3 | `who_experiences_this` | Who Experiences This | |

`schemas.md` also mentions "how we learned about it" — not present in the live
fixture; omitted from canonical template. Authors who want to capture it add an
extra section and the drift handler preserves it (case (a)).

### Idea

Fixtures: `docs/discovery/ideas/etak-cli-as-growth-onramp.md`,
`docs/discovery/ideas/graph-backed-artifact-store.md`.

| # | Slug | Heading | Required |
|---|---|---|---|
| 1 | `description` | Description | * |
| 2 | `strategic_rationale` | Strategic Rationale | |
| 3 | `why_this_could_work` | Why This Could Work | * |
| 4 | `open_questions` | Open Questions | |

Note: one fixture has "Strategic Rationale" and the other omits it. The template
marks it optional so both round-trip cleanly without a missing-required warning.

### Assumption

Seeded from `schemas.md`. **Provisional — user-approved to proceed.** No live
fixture exists; the template below is seeded from `schemas.md` and is flagged for
recalibration against the first real `assumption` authored in-repo. Recalibration
is tracked as an M3 chore story, not a v1 blocker.

| # | Slug | Heading | Required |
|---|---|---|---|
| 1 | `description` | Description | * |
| 2 | `why_this_matters` | Why This Matters | * |
| 3 | `evidence` | Evidence | |

### Experiment

Seeded from `schemas.md`. **Provisional — user-approved to proceed.** No live
fixture; much of the experiment shape lives in frontmatter (`method`,
`success_criteria`, `interpretation_guide`, `action_plan`) so the body template is
deliberately lean. Flagged for recalibration against the first real `experiment`
authored in-repo. Recalibration is tracked as an M3 chore story, not a v1 blocker.

| # | Slug | Heading | Required |
|---|---|---|---|
| 1 | `plan` | Plan | * |
| 2 | `participants` | Participants | |
| 3 | `protocol` | Protocol | |
| 4 | `materials` | Materials | |

### Critique — body-as-opaque (intentional deviation)

Critiques have no `status` field (per `schemas.md`), and their body is a narrative
point-in-time record of an adversarial session with no recurring canonical shape
from one critique to the next. The section-template system does not fit.

**Decision: critique is body-as-opaque.** The critique Zod schema declares **no
`bodyTemplate`** — or equivalently, an empty one. The parser still reads the body
as a `BodyDocument` (so round-trip through `remark` remains uniform across types),
but the drift detector skips critique bodies entirely: every section is implicitly
`status: "extra"`, no section is ever `missing_required_section` or
`section_renamed`, and no canonical ordering is enforced on serialization. The
`--section` update surface is disabled for critiques — only `--body`, `--body-file`,
and `--body-stdin` apply. Calling `etak critique update --section ...` raises a
usage error (exit 4).

This is an **intentional deviation** from the per-type section schema pattern, not
an inconsistency to fix later. Critiques are the one discovery type whose value
comes from narrative shape the author chooses, and forcing them into a recurring
template would either constrain authorship or produce constant spurious drift
warnings. Locally adopting Option C for this one type is the right trade.

The other five types retain Option A unchanged. The adapter interface, envelope
shape, drift reporting format, and round-trip guarantees are all unaffected —
critique simply short-circuits the section-drift logic.

### Provisional templates (recalibration tracked as M3 chore)

- **Assumption** and **experiment** templates are seeded from `schemas.md` and are
  provisional (user-approved to ship in M1). The first real fixture of each type
  triggers a recalibration pass — tracked as an M3 chore story, not a v1 blocker.
- **Critique** is resolved as body-as-opaque (see above). No recalibration needed.

---

## Non-Functional Requirements

- **Performance.** `list` against a project with 500 artifacts completes in under
  500ms on a warm cache on a developer laptop. `create`/`update`/`get` complete in
  under 100ms. These are comfort targets, not SLAs.
- **Observability.** `DEBUG=etak:*` enables verbose trace logging to stderr. Commands
  are traceable via the structured envelope — `command` field on every response.
- **Security.** The filesystem adapter runs with user permissions only; no privileged
  operations. Env-var overrides (`ETAK_ROOT`, `ETAK_ARTIFACTS`) are resolved relative
  to the CWD the user launched from and are not followed into paths outside the
  project root unless explicitly absolute. No network access in v1.
- **Reliability.** Writes are atomic: the filesystem adapter writes to a temp file in
  the same directory and renames into place, so a concurrent reader never sees a
  torn file. On rename failure, the temp file is cleaned up; the original is
  untouched.
- **Accessibility.** Human-mode output respects `NO_COLOR`. All error messages are
  also present in the JSON envelope, so screen-reader users running with `-o json`
  get the same information.

## Adjacent Opportunities

- **Graph-backed artifact store project.** The forward-looking constraint in §3.8
  should be pulled into that project's spec as an input, so its schema doesn't bake
  in a shape that silently deletes drift on write.
- **Web UI validation surface.** The `StructuredError` / `DriftWarning` shapes are
  designed so the web UI can reuse them to render artifact validation inline. That
  saves the web UI from inventing a second shape.
- **Development-tier artifact types.** The adapter interface, output contract, slug
  rules, config resolution, and body-template mechanism all apply unchanged to
  development artifacts (project, epic, story, task, spec, ADR). v1 scopes to
  discovery; v2 extends by adding schemas and templates, no architectural changes.

## Migration & Evolution

- Existing `docs/discovery/*` artifacts are **not migrated in v1**. The CLI reads
  from `.etak/artifacts/` only. A later, explicit migration step will move them.
- The envelope `schema` field (`etak-cli.v1`) lets consumers handle a future v2
  breaking change without guesswork.
- Adding a new artifact type means adding a Zod schema, a body template, and a route
  in the command router. No changes to the adapter interface.
- Adding a new adapter (real GraphQL) means implementing `ArtifactStoreAdapter`
  against the GraphQL client. The shared contract test suite is the acceptance
  criterion.

## Risks

- **Parser complexity underestimated.** remark gives us AST, not section slicing —
  the section walker, drift detector, and canonical serializer are novel code.
  *Mitigation:* M1-S5 should scope this as its own story (it may already) and the
  shared contract test suite should exercise round-trip on real fixtures early.
- **Round-trip is never exactly stable.** `remark-stringify` is deterministic but
  opinionated; it will normalize some whitespace and bullet styles even on
  unmodified reads. *Mitigation:* accept canonical reformatting as a property of
  round-trip; document it; don't chase byte-equality.
- **Skills adopt the CLI without reading the drift contract.** A skill that assumes
  "update succeeded means no warnings" will miss real signals. *Mitigation:* the
  envelope forces `warnings` to always be present, and skill documentation should
  explicitly call out that warnings can coexist with exit 0.
- **Option A locks us into section names early.** Renaming a canonical section later
  requires a migration across all existing artifacts. *Mitigation:* get section
  names right by calibrating against real fixtures now (topic 8); for types without
  fixtures, mark the template as provisional.
- **`.etak/` location will confuse some users** who expect artifacts under `docs/`.
  *Mitigation:* `ETAK_ARTIFACTS` exists as an escape hatch; the dotfile convention
  is consistent with `.git`/`.vscode`/`.cargo` that developers already accept.

## Open Questions (consolidated)

All five architect-flagged open questions are now resolved (see Changelog). The
only remaining open question is:

- **Dangling refs and `--strict`** — when does `--strict` land? Not v1; flagged for
  follow-up.

### Resolved

- **3.A** — `--body-stdin` carries body only. Frontmatter stays flag-driven. See §3.4.
- **6.A** — v1 ships `etak init`. See §6.1a.
- **6.B** — `etak init` is required and explicit; no auto-create on first run. See §6.1a.
- **8.A** — Assumption template is provisional, seeded from `schemas.md`; recalibration
  tracked as an M3 chore. See §8 (Assumption).
- **8.B** — Experiment template is provisional, seeded from `schemas.md`; recalibration
  tracked as an M3 chore. See §8 (Experiment).
- **8.C** — Critique is body-as-opaque (intentional deviation). See §8 (Critique).

## Changelog

- **2026-04-12** — Applied user rulings on the five architect-flagged open questions
  (6.A, 6.B, 3.A, 8.C, 8.A/B). `etak init` now ships in v1 as an explicit, required
  initialization command (§6.1a). `--body-stdin` is body-only (§3.4). Critique is
  resolved as body-as-opaque with the section-drift logic skipping it (§8, Critique).
  Assumption and experiment templates are marked provisional with recalibration
  tracked as an M3 chore.
