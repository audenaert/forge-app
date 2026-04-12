---
name: "Discovery explorer"
type: epic
status: draft
parent: discovery-explorer-ui
children:
  - scaffold-apps-web
  - design-tokens-and-appshell
  - apollo-client-and-codegen
  - discovery-dashboard-route
  - opportunity-subgraph-view
  - seed-script-and-seed-domain
  - untested-assumptions-schema-rewrite
  - untested-assumptions-view
workstream: web-client
milestone: m1-web-discovery-explorer
---

## Scope

The full read-only discovery explorer web client: workspace scaffold, design tokens, data layer, three routes, and the seed data + schema work needed to make the views useful.

### Stories

- **Foundation (M1a)** — `apps/web` scaffold, design tokens + AppShell, Apollo + codegen. In parallel: seed script + seed domain, and the `untestedAssumptions` schema rewrite.
- **Main views (M1b)** — Discovery dashboard and the opportunity subgraph view with detail panel.
- **Gaps view (M1c)** — Untested assumptions route, consuming the rewritten schema.

See the spec for full architectural context: [Web UI: Discovery Explorer](../specs/web-ui-discovery-explorer.md).
