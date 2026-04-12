---
name: "Untested assumptions view"
type: story
status: blocked
parent: discovery-explorer
workstream: web-client
milestone: m1-web-discovery-explorer
phase: M1c
depends_on:
  - discovery-schema-additions
  - design-tokens-and-appshell
  - apollo-client-and-codegen
  - seed-script-and-seed-domain
  - artifact-page-routes
acceptance_criteria:
  - "A route at '/assumptions' renders inside the AppShell and loads data via a TanStack Router route loader"
  - "The loader issues the UntestedAssumptions query against the rewritten schema (UntestedAssumptionWithContext) and warms the Apollo cache before mount"
  - "GraphQL codegen is regenerated in apps/web to pick up the new UntestedAssumptionWithContext type and the typed document reflects the new shape"
  - "The view renders a list of untested assumptions. Each row shows: an <ArtifactLink> to /assumption/:id (the assumption itself), the importance level as a badge (human-readable label), the evidence text, and an <ArtifactLink> to /idea/:id for the parent idea"
  - "A filter control lets the user filter by importance: All, HIGH, MEDIUM, LOW; changing the filter updates the URL search param (e.g., ?importance=HIGH) and re-issues or re-filters the query accordingly. The filter value maps onto the query's `minImportance` argument (HIGH → `minImportance: HIGH`, MEDIUM → `minImportance: MEDIUM`, LOW → `minImportance: LOW`, All → argument omitted / null)"
  - "Navigating from the dashboard warning 'untested high-importance assumptions' lands here with ?importance=HIGH pre-applied"
  - "Enum values for importance and status render via lib/enums.ts, not raw SCREAMING_SNAKE_CASE"
  - "Empty state: when the filter yields zero results, the <EmptyState> component renders with copy appropriate to the filter (e.g., 'No HIGH-importance untested assumptions — nice work.')"
  - "The view passes basic a11y: semantic list markup (<ul>/<li>), visible focus, keyboard-activatable filter and links, no color-only signalling"
  - "Vitest component tests cover: list rendering from a fixture, importance filter applies, URL search param round-trips, both ArtifactLinks (assumption and parent idea) navigate correctly, empty state under each filter"
  - "Manual check against the seed domain confirms the untested high-importance assumptions seeded in story seed-script-and-seed-domain appear, link to their assumption pages, and link to their parent idea pages"
---

## Description

Implement the `/assumptions` route — a focused list of untested assumptions filterable by importance, answering the question "what don't we know yet, and how important is it?" This is the M1c cap on the milestone. Each row uses `ArtifactLink` for both the assumption itself and its parent idea, so the list integrates cleanly with the hypertext navigation model.

Depends on `discovery-schema-additions` for the rewritten `untestedAssumptions` query that includes parent idea context, and on `artifact-page-routes` for the `ArtifactLink` primitive and the target artifact pages.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — section "Untested assumptions view" and "Schema work".
- The schema rewrite happens in `discovery-schema-additions` and MUST be merged before this story starts. Verify by checking that `UntestedAssumptionWithContext` is present in `packages/graph/src/typeDefs/discovery.graphql` and that codegen in `apps/web` regenerates cleanly against a running API.
- URL search param for the filter is required — matches the dashboard's deep-link affordance.
- The dashboard's warning navigation already wires a link to `/assumptions?importance=HIGH` — this story must honor that incoming param.
- Both link targets are simple now: the assumption row links to `/assumption/:id` (the artifact page), and the parent-idea link goes to `/idea/:id`. No synthetic `?node=` URLs are needed — that pattern was a workaround from the earlier draft of the spec and is gone.
- Use `<ArtifactLink>` (delivered by `artifact-page-routes`) for every link. Do not hand-roll anchors.
- No other views or routes in this story. Keep scope tight — this is the final feature story of the milestone.
