---
name: "Discovery dashboard route"
type: story
status: blocked
parent: discovery-explorer
workstream: web-client
milestone: m1-web-discovery-explorer
phase: M1b
depends_on:
  - design-tokens-and-appshell
  - apollo-client-and-codegen
  - seed-script-and-seed-domain
  - discovery-schema-additions
  - artifact-page-routes
acceptance_criteria:
  - "A route at '/' renders inside the AppShell and loads data via a TanStack Router route loader"
  - "The loader issues the DiscoveryHealth, ObjectivesWithOpportunities, OrphanedOpportunities, UnrootedIdeas, and UnrootedAssumptions queries (as specified in the spec) using Apollo Client and warms the cache before the component mounts"
  - "A <HealthBar> component renders the five counts (objectives, opportunities, ideas, assumptions, experiments) followed by warning indicators: untested high-importance assumptions, ideas with no assumptions, orphaned opportunities, unrooted ideas — exactly as laid out in the spec"
  - "Warning indicators use --sand background tint (warm attention, not red alarm); each is a keyboard-activatable link that scrolls to the relevant section of the dashboard or navigates to /assumptions for the assumptions warning"
  - "An <ObjectiveList> component lists objectives with gravitational hierarchy (heavier weight for objective name, lighter for nested supporting opportunities). The objective name links to /objective/:id; each supporting opportunity links to /opportunity/:id via an <ArtifactLink>. A secondary 'View tree' affordance on each objective links to /tree/objective/:id"
  - "Below the objective list, three orphan sections render as collapsible disclosures using the orphan query results: 'Opportunities not supporting an objective', 'Ideas not addressing an opportunity', 'Assumptions not assumed by any idea'. Each entry is an <ArtifactLink>. Empty sections render a one-line 'None' state instead of disappearing, so the affordance is discoverable"
  - "When the domain has zero discovery data, the <EmptyState> component renders instead of a zeroed-out health bar, with copy explaining that data is created via the API or Claude Code and pointing to the seed script"
  - "The route wraps its content in a React <Suspense> boundary with an AppShell-aware loading state"
  - "The GraphQL operations for this route live as .graphql documents (or tagged template literals) under apps/web/src/lib/graphql/ and codegen produces the corresponding typed documents"
  - "All enum values shown in the UI render via lib/enums.ts, not as raw SCREAMING_SNAKE_CASE"
  - "Vitest component tests cover: health bar with real counts, health bar with each warning, empty state when no data, objective list rendering with linked artifacts and the 'View tree' affordance, each orphan section rendering populated and empty"
  - "The route passes basic a11y: <nav> landmarks, link descriptions, focus styles, no color-only signalling, disclosure sections use button + aria-expanded"
---

## Description

Implement the discovery dashboard — the first real route users see, and the place that anchors everything in business value. A health bar summarizes the shape of the discovery space, an objective list connects users to the canonical roots of the graph, and orphan sections surface the disconnected pockets that signal missing structure.

This is the story where the spec's information architecture becomes concrete for the first time. It depends on `artifact-page-routes` because it links to artifact pages via `ArtifactLink`, and on `discovery-schema-additions` for the orphan queries.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Routes", "Discovery dashboard", "Orphans as a feature", "GraphQL operations". The health bar layout, warning indicator semantics, and orphan section rationale are spelled out.
- The seed domain has data that exercises every visual state — orphaned opportunities, unrooted ideas, ideas with no assumptions, untested high-importance assumptions. Verify the dashboard renders each case correctly against `npm run seed` + pointing the client at the `seed` domain.
- `lib/enums.ts` — extend the lookup map (created in `artifact-page-routes`) for any enum the dashboard surfaces.
- Use `<ArtifactLink>` (delivered by `artifact-page-routes`) for every link to an artifact. Do not hand-roll anchors.
- Orphan sections are first-class navigable affordances, not warnings to hide. Render them even when populated, with empty-state copy when there are none — the affordance must be discoverable so users learn to look there.
- The "View tree" affordance per objective is a small secondary link (icon + label) next to the objective name that goes to `/tree/objective/:id`. The objective name itself links to the artifact page, not the tree.
- Do NOT build artifact pages, the tree projection, or the untested assumptions view here. Stay scoped to the dashboard.
