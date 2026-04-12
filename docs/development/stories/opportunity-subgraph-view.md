---
name: "Opportunity subgraph view"
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
  - "A route at '/opportunity/:id' renders inside the AppShell with a two-panel layout: opportunity tree on the left, node detail panel on the right"
  - "A TanStack Router loader issues the OpportunitySubgraph query (opportunityId from the route param) and warms the Apollo cache before mount"
  - "The <OpportunityTree> component renders the subgraph as an indented, expandable tree: Opportunity → Ideas → Assumptions → Experiments, matching the visual encoding described in the spec"
  - "Node types are distinguished by a leading Lucide icon (filled diamond for Objective, lightbulb for Idea, help-circle for Assumption, flask-conical for Experiment) and by a text label — never color alone"
  - "Status is shown as a trailing badge with both color and text; untested HIGH-importance assumptions additionally get a warning indicator"
  - "Tree is keyboard-navigable: ArrowUp/Down move between visible nodes, ArrowRight/ArrowLeft expand/collapse, Enter/Space select; role=tree with role=treeitem and aria-expanded on each branch"
  - "The currently selected node id is stored in a URL search param (e.g., ?node=<id>) so deep links to a selected node round-trip correctly — refreshing or sharing the URL restores selection and expansion to that node"
  - "By default only the selected node's ancestor path is expanded; siblings are collapsed"
  - "Selecting a node in the tree does NOT steal focus from the tree; the detail panel is a separate focus zone reached via Tab"
  - "The <NodeDetail> panel fires a per-type detail query (ObjectiveDetail/OpportunityDetail/IdeaDetail/AssumptionDetail/ExperimentDetail as defined in the spec) based on the selected node's type, wrapped in its own Suspense boundary"
  - "NodeDetail renders: type icon + name + status header, type-specific metadata (hmw, importance, evidence, method, result, learnings as applicable), markdown body via react-markdown + remark-gfm, and a relationships list of clickable connected nodes"
  - "Enum values in NodeDetail are rendered via lib/enums.ts, not as raw SCREAMING_SNAKE_CASE"
  - "react-markdown and remark-gfm are installed as dependencies; markdown rendering sanitizes by default (react-markdown disallows raw HTML out of the box) — no additional sanitizer needed for read-only trusted content"
  - "The route handles the no-selection state (no ?node= param) by showing a zero-state message in the detail panel prompting the user to select a node"
  - "Apollo Client's normalized cache makes re-selecting a previously viewed node instant — verified by a Vitest test that counts network operations via mocked links"
  - "Vitest component tests cover: tree renders from a fixture subgraph, keyboard navigation expands/collapses and changes selection, URL search param round-trips, detail panel fires the correct per-type query, markdown body renders, enum labels display"
  - "Manual check against the seed domain: click through every node type in at least one full opportunity subgraph and confirm the detail panel renders each type's fields"
---

## Description

Build the core view of the product: an expandable opportunity tree on the left and a lazy-loading node detail panel on the right. This is the story that proves the graph-backed model produces a qualitatively different experience from flat artifact lists.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Opportunity subgraph view", "GraphQL operations" (the detail queries for each type are pre-written, use them verbatim), "Data loading strategy", "Accessibility".
- Selection state lives in the URL search param — this was explicitly decided so deep links to specific nodes are first-class. Do not use component state or localStorage.
- The subgraph query returns structural fields only (no body). Body and full metadata come from per-type detail queries fired lazily when a node is selected. Apollo's normalized cache handles re-selection.
- a11y is a hard requirement, not a stretch goal. role=tree / role=treeitem / aria-expanded; focus management that does NOT steal focus from the tree on selection; every status shows text + color, never color alone; prefers-reduced-motion respected.
- Keep markdown read-only and trust the source. No raw-HTML escape hatch.
- The seed data has realistic multi-paragraph markdown body fields — use it to validate rendering.
- Do NOT implement /assumptions here. That's M1c.
