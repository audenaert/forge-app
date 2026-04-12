---
name: "M1: Web discovery explorer"
type: milestone
milestone_type: integration
project: discovery-explorer-ui
status: planned
target_date: null
workstream_deliverables:
  - workstream: web-client
    delivers: "apps/web scaffold, design tokens + AppShell, Apollo + codegen, artifact page routes (one per type), tree projection rooted at objective and at opportunity, discovery dashboard with orphan sections, untested assumptions view, seed script."
  - workstream: graph-data-layer
    delivers: "Three coordinated schema additions in packages/graph: a new objectiveSubgraph traversal, the untestedAssumptions rewrite with parent idea context, and orphan queries (orphanedOpportunities, unrootedIdeas, unrootedAssumptions)."
demo_criteria: "Run npm run dev. Open the web client pointed at the seed domain. The dashboard shows a health bar with real counts, the objective list anchored in business value, and orphan sections listing the disconnected pockets. Click an objective to land on its artifact page; follow a typed-relationship link sideways to a related idea, then to one of its assumptions, then to the experiment that tested it — every navigation is a hyperlink, no detail panel. Open the tree projection from the objective to see the same content as a hierarchical projection in the rail; click a tree node and watch the artifact page update while the rail stays in place. Navigate to /assumptions and see untested high-importance assumptions with their parent idea context, each row linking to both the assumption and its parent idea."
phases:
  - id: M1a
    name: "Foundation"
    scope: "apps/web scaffold, design tokens + AppShell, Apollo + codegen. Seed script and the bundled discovery-schema-additions run in parallel on independent tracks."
    stories:
      - scaffold-apps-web
      - design-tokens-and-appshell
      - apollo-client-and-codegen
      - seed-script-and-seed-domain
      - discovery-schema-additions
    checkpoint: "Web client boots, hits the API, renders an empty AppShell with tokens applied. Seed domain exists with intentional orphans. Schema additions merged: objectiveSubgraph, rewritten untestedAssumptions, and per-type orphan queries are all available."
  - id: M1b
    name: "Hypertext + projections"
    scope: "Artifact page routes (the primary read surface), the dashboard, and the tree projection. Artifact page routes land first because dashboard and tree projection both link into them."
    stories:
      - artifact-page-routes
      - discovery-dashboard-route
      - tree-projection-view
    checkpoint: "Every artifact type has a working canonical route with header, markdown body, and clickable typed-relationship links. The dashboard renders health, objectives, and orphan sections from the seed domain. The tree projection renders in the AppShell rail rooted at objective or opportunity, clicks navigate to artifact pages, and the unrooted disclosure surfaces orphans."
  - id: M1c
    name: "Gaps view"
    scope: "Untested assumptions list view consuming the rewritten schema and using ArtifactLink for both assumption and parent-idea links."
    stories:
      - untested-assumptions-view
    checkpoint: "/assumptions lists untested high-importance assumptions, each row links to /assumption/:id and /idea/:id. Dashboard warning navigates here with the importance filter pre-applied."
---

## What this milestone proves

- The graph-backed artifact store produces a qualitatively different experience from flat artifact lists. Hypertext navigation lets you walk the graph laterally; the tree projection makes the hierarchy legible when it helps; the dashboard anchors everything in business value.
- Disconnected pockets in the discovery space are a feature, not noise — surfacing them gives teams the signal they need to fill in missing structure over time.
- The Etak design system renders correctly via Tailwind v4 `@theme` tokens and shadcn/ui (new-york) primitives.
- Apollo Client + route-level loaders + Suspense give responsive data loading without waterfalls, even when the user is walking the graph one artifact at a time.
- Schema changes in `packages/graph` propagate cleanly through codegen to typed Apollo operations in the client.

## What it enables

- A working product team can navigate and audit their own discovery space in the browser, not just via curl.
- Future CRUD work — which will be a mixed-initiative collaborative process with per-artifact-type interactions — has a validated information architecture and a per-type artifact-page seam to build on.
- Future web surfaces (development explorer, canvas) can reuse the AppShell, tokens, Apollo + codegen stack, ArtifactPage shell, and ArtifactLink primitive.

## What it defers

- Any form of writing from the UI (mutations, editing, creation flows). Editing is a mixed-initiative concern with per-artifact-type interactions and is intentionally out of scope.
- Spatial / canvas / force-directed graph rendering — the long-term direction in ADR-003, not this milestone.
- Multi-domain switching in the client.
- Real typeface selection (system-font stack is the placeholder).
- Production hardening (CSP, telemetry, hosting).
- The 14 critique opportunities and 2 assumptions surfaced during discovery — see the project file's "Deferred — tracked in discovery" section.

## Known risks

- **Tailwind v4 + shadcn/ui friction.** Some shadcn/ui examples still assume v3 config. Mitigation: the `@tailwindcss/vite` plugin and `@theme` directive are well-documented; adapt components during installation if needed.
- **Schema additions unblocking M1b and M1c.** Multiple stories depend on `discovery-schema-additions`. Mitigation: dispatch the schema story in parallel with the scaffold in M1a so it lands before the view stories start.
- **Seed data must exercise all visual states including orphans.** A thin seed dataset will produce an unrepresentative UI and an empty orphan section will hide the affordance. Mitigation: the seed story explicitly requires deliberate orphans of every type plus mixed statuses and importance levels.
- **Artifact-page-routes is on the critical path for M1b.** Both the dashboard and the tree projection link into artifact pages via ArtifactLink. Mitigation: artifact-page-routes is dispatched first in M1b and the other M1b stories are blocked on it; it has no inter-story dependencies of its own beyond the M1a foundation.
