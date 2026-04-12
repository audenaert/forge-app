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
acceptance_criteria:
  - "A route at '/' renders inside the AppShell and loads data via a TanStack Router route loader"
  - "The loader issues the DiscoveryHealth and ObjectivesWithOpportunities queries (as specified in the spec) using Apollo Client and warms the cache before the component mounts"
  - "A <HealthBar> component renders the five counts (objectives, opportunities, ideas, assumptions, experiments) followed by three warning indicators: untested high-importance assumptions, ideas with no assumptions, orphaned opportunities — exactly as laid out in the spec"
  - "Warning indicators use --sand background tint (warm attention, not red alarm) and each is a keyboard-activatable link; the untested-assumptions warning navigates to /assumptions (target view lands in M1c but the link is wired now)"
  - "An <ObjectiveList> component lists objectives with gravitational hierarchy (heavier weight for objective name, lighter for nested opportunities); each opportunity links to /opportunity/:id"
  - "When the domain has zero discovery data, the <EmptyState> component renders instead of a zeroed-out health bar, with copy explaining that data is created via the API or Claude Code and pointing to the seed script"
  - "The route wraps its content in a React <Suspense> boundary with an AppShell-aware loading state"
  - "The GraphQL operations for this route live as .graphql documents (or tagged template literals) under apps/web/src/lib/graphql/ and codegen produces the corresponding typed documents"
  - "All enum values shown in the UI (statuses, importance levels) are rendered via a lib/enums.ts lookup map, not as raw SCREAMING_SNAKE_CASE"
  - "Vitest component tests cover: health bar with real counts, health bar with warnings, empty state when no data, objective list rendering with linked opportunities"
  - "The route passes basic a11y: <nav> landmarks, link descriptions, focus styles, no color-only signalling (icons or text accompany every status)"
---

## Description

Implement the discovery dashboard — the first real route users see. A health bar summarizing the shape of the discovery space plus a list of objectives and their supporting opportunities. This is the story where the spec's information architecture becomes concrete for the first time.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Routes", "Discovery dashboard", "Information architecture", "GraphQL operations". The health bar layout and warning indicator semantics are spelled out.
- The seed domain has data that exercises every visual state — orphaned opportunities, ideas with no assumptions, untested high-importance assumptions. Verify the dashboard renders each case correctly against `npm run seed` + pointing the client at the `seed` domain.
- `lib/enums.ts` — create the lookup map if it doesn't exist. Map every enum value the dashboard surfaces. Example mappings in the spec's "Enum display" section.
- Warnings are navigation affordances. Wire the /assumptions link even though the assumptions view lands in M1c — the target can 404 for now (and it will be replaced in M1c).
- Do NOT build the opportunity subgraph view or the untested assumptions view here. Stay scoped to the dashboard.
