---
name: "Tree projection view"
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
  - "Two routes are added: '/tree/objective/:id' and '/tree/opportunity/:id', both rendering inside the AppShell"
  - "Each route's TanStack Router loader issues the corresponding subgraph query (ObjectiveSubgraph or OpportunitySubgraph) and warms the Apollo cache before mount"
  - "The AppShell shows the tree in the optional left rail when a tree route is active; the main content area shows the artifact page for the currently selected node (defaulting to the root artifact when the user lands on the route)"
  - "The <TreeProjection> component renders the subgraph as an indented, expandable tree with the visual encoding from the spec: leading type icon (filled diamond Objective, open diamond Opportunity, lightbulb Idea, help-circle Assumption, flask-conical Experiment), trailing status badge with text + color, warning indicator on untested HIGH-importance assumptions, indentation + connector lines for depth"
  - "Type icons and status badges always combine icon+text — never color alone (WCAG)"
  - "Clicking a tree node navigates to the corresponding artifact page (e.g., /idea/:id) using TanStack Router; the tree rail stays visible and updates its highlight to the new selection"
  - "Keyboard navigation: ArrowUp/Down move focus between visible tree nodes, ArrowRight/ArrowLeft expand/collapse the focused branch, Enter activates the focused node (navigates to its artifact page), Tab moves focus from the tree rail to the main content area"
  - "Tree uses semantic ARIA: role=tree on the container, role=treeitem on each node, aria-expanded on each branch, aria-selected on the currently selected node"
  - "By default only the selected node's ancestor path is expanded; siblings are collapsed. Expansion state is preserved across navigations within the same projection"
  - "An 'Unrooted at this level' disclosure section renders below the tree, listing artifacts of the relevant type that are not part of the current root's subgraph (using the orphan queries from discovery-schema-additions). Each entry is an ArtifactLink to the corresponding artifact page"
  - "The tree rail persists when the user navigates from a tree node to an artifact page whose ID is present in the loaded subgraph; navigating to an artifact outside the subgraph collapses the rail (a 'Show in tree' affordance on artifact pages reached this way is OUT OF SCOPE for this story)"
  - "Apollo Client's normalized cache makes navigating back to a previously-visited artifact within the same subgraph instant — verified by a Vitest test that counts network operations via mocked links"
  - "Vitest component tests cover: tree renders from a fixture subgraph for both objective root and opportunity root, keyboard navigation expands/collapses and moves focus, clicking a node calls navigate() with the right route, unrooted disclosure renders entries from a fixture orphan response, ARIA roles and aria-expanded are correct"
  - "Manual check against the seed domain: open /tree/objective/:id, walk through every artifact type via tree clicks, confirm each artifact page renders correctly and that the tree rail stays visible and highlighted"
---

## Description

Build the tree projection view: an expandable hierarchical tree rooted at either an objective or an opportunity, rendered in the AppShell's optional left rail. Clicking a tree node navigates to the corresponding artifact page; the tree stays visible to maintain orientation. The "Unrooted at this level" disclosure surfaces orphan artifacts as first-class navigable entries.

The tree projection is one *projection* of a non-hierarchical graph — not the app itself. Artifact pages (delivered by the `artifact-page-routes` story) are the main reading surface; this story is what gets the user into them via a familiar hierarchical orientation device.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Tree projection", "Layout: AppShell", "Orphans as a feature", "Data loading strategy", "Accessibility".
- This story depends on `artifact-page-routes` because clicking a tree node navigates to an artifact page route. Verify those routes are wired before starting.
- The schema additions from `discovery-schema-additions` are also a hard dependency — `objectiveSubgraph` and the orphan queries must be available.
- a11y is a hard requirement, not a stretch goal. role=tree / role=treeitem / aria-expanded / aria-selected; focus management on click and keyboard nav; every status shows text + color; prefers-reduced-motion respected.
- The selection highlight in the tree rail comes from the route params, not component state — when the route is `/idea/abc`, the rail highlights the node with id `abc` if it's in the loaded subgraph.
- Do NOT implement the artifact page itself here. That's the `artifact-page-routes` story. This story owns the tree component and the two `/tree/...` routes.
- Do NOT implement a "Show in tree" affordance on artifact pages reached from outside a tree projection — that's a follow-up.
- The seed domain has both connected and intentionally unrooted artifacts (per the seed-script story). Use it to validate both the tree and the unrooted disclosure.
