---
name: "Untested assumptions view"
type: story
status: blocked
parent: discovery-explorer
workstream: web-client
milestone: m1-web-discovery-explorer
phase: M1c
depends_on:
  - untested-assumptions-schema-rewrite
  - design-tokens-and-appshell
  - apollo-client-and-codegen
  - seed-script-and-seed-domain
acceptance_criteria:
  - "A route at '/assumptions' renders inside the AppShell and loads data via a TanStack Router route loader"
  - "The loader issues the UntestedAssumptions query against the rewritten schema (UntestedAssumptionWithContext) and warms the Apollo cache before mount"
  - "GraphQL codegen is regenerated in apps/web to pick up the new UntestedAssumptionWithContext type and the typed document reflects the new shape"
  - "The view renders a list of untested assumptions showing: assumption name, status badge, importance level (human-readable label), evidence text, and the parent idea's name as a clickable link to /opportunity/:id?node=<assumption-id> (or the opportunity containing that idea)"
  - "A filter control lets the user filter by importance: All, HIGH, MEDIUM, LOW; changing the filter updates the URL search param (e.g., ?importance=HIGH) and refetches or re-filters accordingly"
  - "Navigating from the dashboard warning 'untested high-importance assumptions' lands here with ?importance=HIGH pre-applied"
  - "Enum values for importance and status render via lib/enums.ts, not raw SCREAMING_SNAKE_CASE"
  - "Empty state: when the filter yields zero results, the <EmptyState> component renders with copy appropriate to the filter (e.g., 'No HIGH-importance untested assumptions — nice work.')"
  - "The view passes basic a11y: semantic list markup, visible focus, keyboard-activatable filter and links, no color-only signalling"
  - "Vitest component tests cover: list rendering from a fixture, importance filter applies, URL search param round-trips, parent idea link is wired correctly, empty state under each filter"
  - "Manual check against the seed domain confirms the untested high-importance assumptions seeded in story seed-script-and-seed-domain appear and link to their parent ideas"
---

## Description

Implement the `/assumptions` route — a focused list of untested assumptions filterable by importance, answering the question "what don't we know yet, and how important is it?" This is the M1c cap on the milestone. It depends on the schema rewrite landing first so parent idea context can be surfaced.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — section "Untested assumptions view". The schema rewrite prerequisite is explicit.
- The schema rewrite happens in the `untested-assumptions-schema-rewrite` story and MUST be merged before this story starts. Verify by checking that `UntestedAssumptionWithContext` is present in `packages/graph/src/typeDefs/discovery.graphql` and that codegen in apps/web regenerates cleanly against a running API.
- URL search param for the filter is required — matches the selection-state pattern from the subgraph view so deep links work.
- The dashboard's warning navigation already wires a link to /assumptions?importance=HIGH (from the discovery-dashboard-route story). This story must honor that incoming param.
- Parent idea link target: each assumption's `parentIdea` has an id, but routes go via opportunity. The simplest target is /opportunity/<opportunityId>?node=<assumption-id>. If the UntestedAssumptionWithContext projection does not already carry the grandparent opportunity id, extend the projection in the schema rewrite story OR fetch it on demand. Prefer extending the projection to avoid a waterfall — coordinate with the schema rewrite story if needed.
- No other views or routes in this story. Keep scope tight — this is the final feature story of the milestone.
