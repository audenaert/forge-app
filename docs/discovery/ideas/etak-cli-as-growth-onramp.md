---
name: "Etak CLI as local-to-cloud growth on-ramp"
type: idea
status: draft
addresses:
  - solo-devs-blocked-by-team-tool-overhead
delivered_by: null
---

## Description

A command-line tool (`etak`) that Claude skills invoke to create, read, update, and link discovery and development artifacts — instead of reading and writing markdown files directly.

The CLI hides the storage backend behind a single interface. Two implementations ship together:

- **Filesystem adapter** — reads and writes markdown with YAML frontmatter under `docs/discovery/` and `docs/development/`, matching today's skill conventions.
- **GraphQL adapter** — talks to the graph-backed artifact store via its GraphQL API.

A skill calls the same commands regardless of backend. Backend selection is environmental (`ETAK_BACKEND=fs|graphql`, or a project-level config file), so the same skill instructions work in a fresh filesystem-only project and in a project wired to the graph service.

Command surface mirrors the artifact taxonomy:

```
etak idea create --name "..." --addresses <opportunity-slug>
etak story list --parent <epic-slug> --status in-progress
etak assumption link --idea <slug> --assumption <slug>
```

A shared schema layer (likely Zod) validates artifacts on both paths, so filesystem frontmatter and GraphQL inputs stay aligned.

## Strategic Rationale

Etak's go-to-market is product-led: a developer installs the Claude Code plugin, runs `etak` against their local project, and gets immediate value with zero infrastructure. That free, local-first experience is the top of the funnel.

The CLI is what makes this possible, and it's also what makes the upgrade path frictionless. A three-stage evolution:

1. **Solo / local** — filesystem backend. Install the plugin, start capturing opportunities, ideas, and stories in-repo. No account, no server, no cost. Artifacts live as markdown the developer already owns.
2. **Cloud storage** — hosted graph backend, same CLI, same skills. The user signs up, points `ETAK_BACKEND` at the cloud, and their artifacts migrate into the graph. They get traversal, integrity, cross-project views, and durability — without changing how they work day-to-day.
3. **Team / collaboration** — multi-user domains, real-time workspace, shared opportunity graph, role-based access. Paid tier. The graph backend and skill surface they already use become the substrate for team collaboration.

Because the CLI is the single interface skills use at every stage, a user never has to re-learn Etak as they scale up. The same `etak story create` works on day one and on day one thousand. That continuity is the core PLG bet: removing the "migration cliff" that normally blocks solo tools from becoming team tools.

The filesystem backend is therefore not a legacy concession — it's a permanent product surface. It has to stay first-class even after the graph backend ships.

## Why This Could Work

Skills today embed filesystem layout knowledge (directory names, frontmatter shape, kebab-case slugs) in their instructions. That coupling blocks the graph backend from being adopted without rewriting every skill. A thin CLI breaks the coupling:

- Skills become backend-agnostic, and skill instructions get shorter (`etak story create ...` vs. "write a file to `docs/development/stories/<slug>.md` with frontmatter X").
- The filesystem backend keeps the "clone and go" onboarding story alive — no graph service required for solo or early-stage use.
- The GraphQL backend unlocks traversal, referential integrity, and multi-user collaboration once a project is ready for it.
- Schema validation moves from "read the reference file and hope" to enforced at write time, regardless of backend.

The CLI is also a natural home for cross-cutting concerns skills keep reinventing: slug generation, link validation, status transitions, and "what exists?" queries.

## Open Questions

- **Schema source of truth.** Hand-write Zod schemas in the CLI, or generate them from the GraphQL SDL? Codegen is cleaner long-term but slows v1.
- **Skill rollout.** Do we update every skill at once, or introduce the CLI opportunistically as skills are touched? The latter means both patterns coexist for a while.
- **Read-modify-write semantics.** Filesystem edits are whole-file today; the graph backend can support field-level updates. Does the CLI expose both, or force a lowest-common-denominator?
- **Offline / dry-run mode.** Should skills be able to preview what the CLI would do without committing, for human-in-the-loop review?
- **Initial scope.** All artifact types from day one, or start with a subset (e.g., discovery only) and expand?
