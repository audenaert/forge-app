---
name: "Discovery Explorer web UI"
type: project
status: scoping
from_discovery: graph-backed-artifact-store
children:
  - discovery-explorer
workstreams:
  - web-client
milestones:
  - m1-web-discovery-explorer
---

## Overview

A read-only web client that makes the discovery graph stored in the graph-backed artifact store visible and navigable. The graph now works; no one can see it. This project delivers the first `apps/web` workspace, proves that a graph-backed model produces a qualitatively different experience from flat artifact lists, and validates the information architecture before CRUD is layered on.

The IA is built on two complementary projections of one graph: **hypertext navigation via per-artifact pages with clickable typed-relationship links** (the primary read model, suited to the non-hierarchical reality of the graph), and **a tree projection rooted at objectives** (an orientation device that maps to familiar ticketing-system intuitions). Disconnected artifacts and disconnected sub-trees are treated as a feature — they signal missing structure that future discovery work can fill in — not as a data-quality bug.

## Goals

1. Make the discovery graph directly visible and navigable — every artifact has a canonical URL, lateral navigation via typed relationships is the primary read model, and the objective-rooted tree projection provides hierarchical orientation when it helps.
2. Anchor everything in business value: objectives are the natural top of the dashboard and the canonical root of the tree projection. Every other artifact connects up to one (eventually).
3. Prove that disconnected pockets — orphan opportunities, unrooted ideas, free-floating assumptions — are first-class navigable signals, not noise to be filtered away.
4. Establish the `apps/web` workspace and the design-system → Tailwind v4 → shadcn/ui → Apollo Client stack as the baseline for all future Etak web surfaces.
5. Surface schema gaps the existing API has for UI consumers and resolve them in a single coordinated change (`objectiveSubgraph`, `untestedAssumptions` parent context, orphan queries).

## Constraints

- Read-only in this project — CRUD is out of scope until the IA is validated by use.
- Must consume the existing `apps/api` via GraphQL. No direct Neo4j access.
- Tailwind v4 CSS-first config (no `tailwind.config.ts`, no `postcss.config.js`).
- TypeScript strict mode throughout. ESM. Vitest for tests.
- Design system per `.interface-design/system.md` — ocean/teal/sand/deep palette, 14px base, sharp-to-moderate radius, borders-only depth strategy.
- API key determines the domain — no domain selector in the UI.

## Scope

### In scope

- `apps/web` workspace scaffolded with Vite + React 19 + TypeScript.
- Tailwind v4 tokens implementing the design system, shadcn/ui (new-york style) initialized.
- Apollo Client + GraphQL codegen wired to `apps/api`.
- TanStack Router with the routes defined in the spec: dashboard, per-type artifact pages (`/objective/:id`, `/opportunity/:id`, `/idea/:id`, `/assumption/:id`, `/experiment/:id`), tree projections (`/tree/objective/:id`, `/tree/opportunity/:id`), untested assumptions list.
- `AppShell` with sidebar + optional tree rail + main content area.
- Generic `ArtifactPage` shell (header, body, `RelationshipList`) with thin per-type wrappers that fire the appropriate detail query. Inline `ArtifactLink` is the primary lateral-navigation primitive.
- Discovery dashboard with health bar, objective list, and orphan sections.
- Tree projection components rooted at objective and at opportunity, with the "Unrooted at this level" disclosure.
- Untested assumptions list view consuming the rewritten schema with parent-idea context.
- Coordinated schema work in `packages/graph`: new `objectiveSubgraph`, rewritten `untestedAssumptions` with parent context, new orphan queries (`orphanedOpportunities`, `unrootedIdeas`, `unrootedAssumptions`).
- Seed script populating a dedicated `seed` domain with representative discovery data, including some intentionally unrooted artifacts so the orphan affordances can be exercised.
- Turborepo pipeline configuration (`turbo.json`) so `npm run dev` launches api + web together.

### Out of scope

- Any CRUD mutations from the UI — creating, editing, deleting artifacts. Editing is deferred until a mixed-initiative collaborative editing model is designed (see "Deferred — tracked in discovery" below).
- Force-directed or spatial graph visualization. The long-term canvas vision is in ADR-003 but not in this project.
- Real-time collaboration or subscriptions.
- Multi-domain switching in the client (single API key → single domain).
- Production deployment, CSP, telemetry.
- Typeface selection — system-font stack is the placeholder for this milestone.
- Development artifact types (projects, epics, stories) — discovery layer only.

## Deferred — tracked in discovery

The discovery work that produced this project surfaced a number of opportunities and assumptions about what the explorer eventually needs to do. They are intentionally not in scope for this milestone — the whole point of mapping the OST is to model the space and explore/build in a prioritized way over time. Listed here so the link from project back to discovery is explicit:

| Artifact | Disposition for v1 |
|---|---|
| [lateral-navigation-across-discovery-graph](../../discovery/opportunities/lateral-navigation-across-discovery-graph.md) | **Partially addressed** — hypertext navigation via typed relationships is the primary read model. |
| [graph-needs-coherent-narrative](../../discovery/opportunities/graph-needs-coherent-narrative.md) | Deferred — future project. |
| [no-process-guidance-in-discovery-tools](../../discovery/opportunities/no-process-guidance-in-discovery-tools.md) | Deferred — v1 is read-only and doesn't yet participate in the discovery process. |
| [evidence-layer-missing-from-discovery-tools](../../discovery/opportunities/evidence-layer-missing-from-discovery-tools.md) | Deferred — needs schema work to make evidence first-class. |
| [rejected-work-is-invisible-institutional-knowledge](../../discovery/opportunities/rejected-work-is-invisible-institutional-knowledge.md) | Deferred — status lifecycle data exists; making it visible is later work. |
| [ai-contributions-need-visible-provenance](../../discovery/opportunities/ai-contributions-need-visible-provenance.md) | Deferred — needs data-model support for `source` / `attribution` fields. |
| [ai-output-volume-overwhelms-graph](../../discovery/opportunities/ai-output-volume-overwhelms-graph.md) | Deferred — needs a staging/triage workflow. |
| [agent-activity-visible-in-context](../../discovery/opportunities/agent-activity-visible-in-context.md) | Deferred — depends on agent contributions being a thing in the data model. |
| [no-place-for-discovery-activities](../../discovery/opportunities/no-place-for-discovery-activities.md) | Long-term — depends on CRUD plus an activity model. |
| [discovery-data-must-be-accessible-and-portable](../../discovery/opportunities/discovery-data-must-be-accessible-and-portable.md) | Already addressed by GraphQL API + existing markdown tooling; no UI work needed in v1. |
| [graph-must-serve-as-agent-institutional-memory](../../discovery/opportunities/graph-must-serve-as-agent-institutional-memory.md) | API-layer concern, not UI. |
| [agent-discovers-missing-graph-structure](../../discovery/opportunities/agent-discovers-missing-graph-structure.md) | Agent / API concern, not UI. |
| [production-data-closes-the-discovery-loop](../../discovery/opportunities/production-data-closes-the-discovery-loop.md) | Long-term. |
| [ui-signals-for-agent-context](../../discovery/opportunities/ui-signals-for-agent-context.md) | Deferred. |
| [pm-dev-role-convergence](../../discovery/assumptions/pm-dev-role-convergence.md) | Foundational assumption — tracked in discovery, no project action. |
| [small-graphs-dont-need-navigation](../../discovery/assumptions/small-graphs-dont-need-navigation.md) | Assumption — tracked in discovery, will be revisited as the seed dataset grows. |

## Specs and ADRs

- **Spec:** [Web UI: Discovery Explorer](../specs/web-ui-discovery-explorer.md)

## Open Questions

- **Typeface** — deferred. System-font stack for this milestone; real selection before external deployment.
- **Monospace for data values** — deferred alongside the sans-serif choice.
