---
name: "Discovery explorer"
type: epic
status: draft
parent: discovery-explorer-ui
children:
  - scaffold-apps-web
  - design-tokens-and-appshell
  - apollo-client-and-codegen
  - seed-script-and-seed-domain
  - discovery-schema-additions
  - artifact-page-routes
  - discovery-dashboard-route
  - tree-projection-view
  - untested-assumptions-view
workstream: web-client
milestone: m1-web-discovery-explorer
---

## Scope

The full read-only discovery explorer web client: workspace scaffold, design tokens, data layer, artifact-page routes (the primary read surface), the dashboard, the tree projection (rooted at objective and at opportunity), and the untested assumptions list. Plus the coordinated schema additions and seed data needed to make the views useful.

### Stories

- **Foundation (M1a)** — `apps/web` scaffold, design tokens + AppShell, Apollo + codegen. In parallel: seed script + seed domain, and `discovery-schema-additions` (objectiveSubgraph, untestedAssumptions rewrite, orphan queries) on the graph-data-layer track.
- **Hypertext + projections (M1b)** — Artifact page routes (the generic ArtifactPage shell, RelationshipList, ArtifactLink, and per-type wrappers), the discovery dashboard with orphan sections, and the tree projection rooted at objective or opportunity.
- **Gaps view (M1c)** — Untested assumptions list view, consuming the rewritten schema and using ArtifactLink for both the assumption and parent-idea links.

See the spec for full architectural context: [Web UI: Discovery Explorer](../specs/web-ui-discovery-explorer.md).
