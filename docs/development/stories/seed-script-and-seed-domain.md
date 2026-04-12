---
name: "Seed script and seed domain"
type: story
status: ready
parent: discovery-explorer
workstream: web-client
milestone: m1-web-discovery-explorer
phase: M1a
acceptance_criteria:
  - "A dedicated domain with slug 'seed' exists in the graph, created idempotently by the seed script (not the 'default' domain used by DISABLE_AUTH)"
  - "scripts/seed.ts (at the repo root) runs via tsx and is invokable via `npm run seed` at the repo root"
  - "The seed script calls the GraphQL API over HTTP at http://localhost:4000/graphql using fetch — it does NOT import from packages/graph directly"
  - "The script is idempotent: running it twice leaves the seed domain in the same state (delete-then-create or upsert semantics — either is acceptable, delete-then-create is simpler)"
  - "Seeded data includes at least: 2-3 objectives, 4-5 opportunities (with at least one orphaned opportunity not linked to any objective), 6-8 ideas (with at least one unrooted idea not addressing any opportunity), 10-12 assumptions (with at least one unrooted assumption not linked to any idea), 4-5 experiments"
  - "Assumption mix exercises all visual states: at least 3 untested HIGH-importance assumptions, at least 2 validated, at least 1 invalidated, a range of importance levels"
  - "Experiment mix includes at least 2 completed experiments with result + learnings and at least 1 planned experiment with no result"
  - "At least one idea is deliberately left with no assumptions (exercises the 'ideas with no assumptions' health warning)"
  - "Orphans are deliberate, not accidental — at least one orphaned opportunity, one unrooted idea, and one unrooted assumption so that every dashboard orphan section and every tree-rail 'Unrooted at this level' disclosure has content to display"
  - "All markdown body fields contain realistic multi-paragraph content that exercises headings, lists, and inline formatting — so the artifact page's markdown renderer has something to show"
  - "README or scripts/README.md documents how to run the seed (docker compose up neo4j, npm run dev --workspace=apps/api, npm run seed)"
  - "A Vitest or plain tsx integration test in scripts/ verifies the seed runs end-to-end against a local API and that discoveryHealth returns the expected counts"
---

## Description

Create a persistent, idempotent seed script that populates a dedicated `seed` domain with representative discovery data. The web UI is useless against an empty graph, and the existing integration test suite tears its data down. This story delivers the data the UI milestone demos against.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — section "Seed data" and the demo criteria in the M1 web discovery explorer milestone.
- The domain is 'seed' — not 'default'. This was a deliberate product decision: the seed dataset should not collide with the DISABLE_AUTH default domain used for ad-hoc testing.
- Use the GraphQL API (HTTP) not packages/graph directly. The script belongs near the API layer, not the data layer — it exercises the public API surface the real UI uses.
- Idempotency: the simplest approach is to delete the seed domain (cascading all its nodes) at the start of the script, then recreate from scratch. That avoids upsert complexity.
- The seed MUST exercise every visual state the dashboard, artifact pages, and tree views need: orphaned opportunities, unrooted ideas, unrooted assumptions, ideas with no assumptions, untested high-importance assumptions, validated and invalidated assumptions, completed and planned experiments. Disconnected pockets are first-class — the IA explicitly surfaces them, so the seed must include them.
- Markdown body content matters — every artifact page renders it with react-markdown + remark-gfm. Use realistic content with headings, bullet lists, and inline code or emphasis so the M1b stories have something to validate against.
- Do NOT modify any web-client code. This story is pure scripting + API calls.
