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

A read-only web client that makes the Opportunity Solution Tree stored in the graph-backed artifact store visible and navigable. The graph now works; no one can see it. This project delivers the first `apps/web` workspace, proves that a graph-backed model produces a qualitatively different experience from flat artifact lists, and validates the information architecture before CRUD is layered on.

## Goals

1. Make the discovery graph directly visible — objective → opportunity → idea → assumption → experiment — in a way that a working product team would actually use.
2. Prove the visualization and navigation thesis: you can see the full chain, identify untested assumptions at a glance, and understand discovery health without cross-referencing flat lists.
3. Establish the `apps/web` workspace and the design-system → Tailwind v4 → shadcn/ui → Apollo Client stack as the baseline for all future Etak web surfaces.
4. Surface schema gaps the existing API has for UI consumers (starting with `untestedAssumptions` parent context).

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
- TanStack Router with three routes: dashboard, opportunity subgraph, untested assumptions.
- AppShell (sidebar + main area), discovery dashboard with health bar + objective list, opportunity tree with node detail panel, untested assumptions view.
- Schema rewrite in `packages/graph` so `untestedAssumptions` returns parent idea context.
- Seed script populating a dedicated `seed` domain with representative discovery data.
- Turborepo pipeline configuration (`turbo.json`) so `npm run dev` launches api + web together.

### Out of scope

- Any CRUD mutations from the UI — creating, editing, deleting artifacts.
- Force-directed graph visualization (tree view only).
- Real-time collaboration or subscriptions.
- Multi-domain switching in the client (single API key → single domain).
- Production deployment, CSP, telemetry.
- Typeface selection — system-font stack is the placeholder for this milestone.
- Development artifact types (projects, epics, stories) — discovery layer only.

## Specs and ADRs

- **Spec:** [Web UI: Discovery Explorer](../specs/web-ui-discovery-explorer.md)

## Open Questions

- **Typeface** — deferred. System-font stack for this milestone; real selection before external deployment.
- **Monospace for data values** — deferred alongside the sans-serif choice.
