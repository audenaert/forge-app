---
name: "M1: Web discovery explorer"
type: milestone
milestone_type: integration
project: discovery-explorer-ui
status: planned
target_date: null
workstream_deliverables:
  - workstream: web-client
    delivers: "apps/web scaffold, design tokens + AppShell, Apollo + codegen, discovery dashboard, opportunity subgraph view, untested assumptions view, seed script."
  - workstream: graph-data-layer
    delivers: "Rewrite of untestedAssumptions @cypher query to return UntestedAssumptionWithContext (parent idea id + name)."
demo_criteria: "Run npm run dev. Open the web client pointed at the seed domain. See the discovery health bar with real counts and warning indicators. Click into an opportunity and see the full Opportunity → Idea → Assumption → Experiment tree. Click a tree node and see its full record with markdown body in the detail panel. Navigate to /assumptions and see untested high-importance assumptions with their parent idea context."
phases:
  - id: M1a
    name: "Foundation"
    scope: "apps/web scaffold, design tokens + AppShell, Apollo + codegen. Seed script and schema rewrite run in parallel on independent tracks."
    stories:
      - scaffold-apps-web
      - design-tokens-and-appshell
      - apollo-client-and-codegen
      - seed-script-and-seed-domain
      - untested-assumptions-schema-rewrite
    checkpoint: "Web client boots, hits the API, renders an empty AppShell with tokens applied. Seed domain exists. Schema rewrite merged."
  - id: M1b
    name: "Main views"
    scope: "Discovery dashboard and the opportunity subgraph view with detail panel."
    stories:
      - discovery-dashboard-route
      - opportunity-subgraph-view
    checkpoint: "Dashboard renders health + objectives from the seed domain. Opportunity tree expands and the detail panel shows full node records with markdown bodies."
  - id: M1c
    name: "Gaps view"
    scope: "Untested assumptions route consuming the rewritten schema with parent context."
    stories:
      - untested-assumptions-view
    checkpoint: "/assumptions lists untested high-importance assumptions with parent idea links. Dashboard warning navigates here."
---

## What this milestone proves

- The graph-backed artifact store produces a qualitatively different experience from flat artifact lists — you can see the full chain from objective to experiment result.
- The Etak design system renders correctly via Tailwind v4 `@theme` tokens and shadcn/ui (new-york) primitives.
- Apollo Client + route-level loaders + Suspense give responsive data loading without waterfalls.
- Schema changes in `packages/graph` propagate cleanly through codegen to typed Apollo operations in the client.

## What it enables

- A working product team can navigate and audit their own discovery space in the browser, not just via curl.
- Future CRUD work has a validated information architecture to build on.
- Future web surfaces (development explorer, canvas, wiki) can reuse the AppShell + tokens + Apollo + codegen stack.

## What it defers

- Any form of writing from the UI (mutations, editing, creation flows).
- Graph visualization beyond an expandable tree.
- Multi-domain switching in the client.
- Real typeface selection (system-font stack is the placeholder).
- Production hardening (CSP, telemetry, hosting).

## Known risks

- **Tailwind v4 + shadcn/ui friction.** Some shadcn/ui examples still assume v3 config. Mitigation: the `@tailwindcss/vite` plugin and `@theme` directive are well-documented; adapt components during installation if needed.
- **Schema rewrite unblocking M1c.** The untested assumptions view depends on the `packages/graph` rewrite. Mitigation: dispatch the schema rewrite in parallel with the scaffold in M1a so it lands before the view is started.
- **Seed data must exercise all visual states.** A thin seed dataset will produce an unrepresentative UI. Mitigation: the seed story explicitly requires mixed statuses, mixed importance levels, and both validated and untested assumptions.
