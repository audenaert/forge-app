---
name: "Artifact page routes"
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
  - "Five routes are added under TanStack Router, one per artifact type: /objective/:id, /opportunity/:id, /idea/:id, /assumption/:id, /experiment/:id"
  - "Each route's loader fires the corresponding per-type detail query (ObjectiveDetail / OpportunityDetail / IdeaDetail / AssumptionDetail / ExperimentDetail) using the queries pre-defined in the spec, and warms the Apollo cache before mount"
  - "A generic <ArtifactPage> component renders inside the AppShell main content area with three regions: <ArtifactHeader>, <ArtifactBody>, <RelationshipList>"
  - "<ArtifactHeader> renders type icon + name (h1) + status badge, plus type-specific metadata: hmw for Opportunity, importance/evidence for Assumption, method/successCriteria/duration/effort/result/learnings for Experiment, createdAt/updatedAt for every type"
  - "<ArtifactBody> renders the markdown body via react-markdown + remark-gfm; raw HTML is disallowed by default (no extra sanitizer needed for read-only trusted content)"
  - "<RelationshipList> groups connected artifacts by relationship name (e.g., Idea: 'Addresses', 'Has assumptions'; Assumption: 'Assumed by', 'Tested by') and renders each entry as an <ArtifactLink>"
  - "<ArtifactLink> is a generic primitive that renders a semantic <a> with type icon + name + status badge, navigates to /<type>/:id via TanStack Router's Link component, and exposes an accessible name like 'Idea: Graph-backed artifact store, status Building' for screen readers"
  - "Per-type wrappers exist for each artifact type (ObjectiveArtifactPage, OpportunityArtifactPage, IdeaArtifactPage, AssumptionArtifactPage, ExperimentArtifactPage) that fire the appropriate detail query and pass the result into the generic ArtifactPage shell — the shell stays type-agnostic"
  - "Enum values (status, importance, experiment method, etc.) render via lib/enums.ts, not as raw SCREAMING_SNAKE_CASE — extend the lookup map as needed for any enum the artifact pages surface"
  - "react-markdown and remark-gfm are installed as dependencies; markdown body renders multi-paragraph content from the seed domain correctly (paragraphs, lists, code blocks, tables, links)"
  - "No breadcrumbs are rendered — upward context lives in RelationshipList sections (the spec is explicit about this; a single canonical parent path does not exist for a non-hierarchical graph)"
  - "Each route handles the not-found case (artifact id does not exist or is in a different domain) by rendering an EmptyState with a 'Go to dashboard' link"
  - "Each route wraps its content in a React <Suspense> boundary with an AppShell-aware loading state"
  - "The Apollo normalized cache makes navigating between artifact pages instant when the target is already cached (e.g., loaded from a tree subgraph query) — verified by a Vitest test that counts network operations via mocked links"
  - "Vitest component tests cover: each per-type wrapper fires the right detail query, ArtifactPage renders header/body/relationships from a fixture, ArtifactLink navigates with the right route, RelationshipList groups by relationship name, markdown body renders, enum labels display, not-found state renders correctly"
  - "Manual check against the seed domain: navigate directly to one artifact of each type by URL, follow at least one relationship link from each page to confirm lateral navigation works end to end"
---

## Description

Implement the artifact pages — the primary read surface of the explorer and the destination of nearly every navigation action. Every artifact type gets its own canonical route (`/objective/:id`, `/opportunity/:id`, `/idea/:id`, `/assumption/:id`, `/experiment/:id`), and each renders through a generic `ArtifactPage` shell with type-specific metadata. The `RelationshipList` is the lateral navigation surface: every typed connection is a clickable `ArtifactLink` that takes the user to the related artifact's page.

This is the story that makes hypertext navigation real. It can be built and validated independently of the tree projection (which just becomes one entry point into these pages once it lands).

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Artifact pages", "Application structure" (the `artifact/` component layout), "GraphQL operations" (the detail queries are pre-written, use them verbatim), "Accessibility".
- The detail queries already cover all five types in the spec — copy them as-is into `apps/web/src/lib/graphql/`. Codegen will produce the typed documents.
- Generic vs. per-type: the `ArtifactPage` shell stays type-agnostic. Per-type variation (which metadata fields to show, which relationship sections to render) lives in the per-type wrappers, which know how to project a typed query result into the props the shell expects.
- `ArtifactLink` is the primitive every other component should use to render a link to an artifact. Do not hard-code anchors anywhere else.
- **No breadcrumbs.** The graph is non-hierarchical; many artifacts have multiple parents or none. Upward context is shown via the upward sections of `RelationshipList` ("Supports", "Addresses", "Assumed by") — do not add a breadcrumb component.
- a11y is a hard requirement: artifact name is the page `h1`, relationship section labels are `h2`, every `ArtifactLink` has a descriptive accessible name that includes type and status, focus styles are visible, no color-only signalling.
- Markdown rendering: read-only and trusted source. No raw-HTML escape hatch, no extra sanitizer.
- Do NOT implement the tree projection here — that's a separate story. Do NOT implement editing affordances of any kind — v1 is read-only.
- The seed domain has multi-paragraph markdown bodies and a representative set of relationships for every artifact type. Use it to validate rendering and lateral navigation end to end.
