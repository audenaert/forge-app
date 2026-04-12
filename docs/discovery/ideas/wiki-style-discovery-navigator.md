---
name: "Wiki-style discovery navigator"
type: idea
status: exploring
addresses:
  - no-computational-model-for-opportunity-exploration
delivered_by: null
---

## Description

A web UI for navigating and editing the discovery graph, modeled as a wiki rather than a graph visualization. Each artifact (objective, opportunity, idea, assumption, experiment) is a page you read and edit — not a node you drag. The design sits at the intersection of Notion's clean, content-first document editing and Jira's structured ticket management.

### Core design choices

**Wiki-style navigation, not graph visualization.** The discovery graph's value is in the content and relationships, not in seeing nodes and edges spatially. Users navigate by clicking through typed links — the way you'd click through wiki pages — rather than manipulating a node-and-edge layout.

**Content-first, minimal chrome (from Notion).** Each artifact page renders its Markdown body cleanly, with inline editing. The UI gets out of the way and lets the content breathe. Structure is present but not dominant — it frames the content rather than competing with it.

**Typed metadata and structured workflows (from Jira).** Every artifact carries typed metadata — status, importance, evidence level, relationships — displayed as first-class elements. Users can filter artifact lists by type, status, or relationship. Status workflows are visible and navigable. Relationships are clickable links that take you to the related artifact's page.

**Tree as navigation, not layout.** The Opportunity Solution Tree appears as sidebar navigation and breadcrumbs — showing where you are in the hierarchy and what's nearby — rather than as a spatial diagram. This supports both top-down exploration (drilling from objective → opportunity → idea) and bottom-up browsing (filtered lists of all untested assumptions).

### Key interaction patterns

- **Artifact page**: Full document view with metadata panel, rendered Markdown body, and relationship links to parent/child/sibling artifacts
- **List views**: Filtered, sortable tables of artifacts by type — "all ideas in exploring status", "untested assumptions sorted by importance"
- **Sidebar tree**: Hierarchical navigation showing the OST structure, collapsible, with status indicators
- **Breadcrumbs**: Show the path from objective → opportunity → idea → assumption so you always know where you are in the tree
- **Inline editing**: Edit artifact content and metadata in place, Notion-style

## Why This Could Work

The discovery graph already has well-defined artifact types, relationships, and metadata schemas. A wiki-style interface maps naturally to this structure — each artifact type becomes a page template, each typed relationship becomes a navigable link, and the tree hierarchy becomes a navigation structure.

This approach avoids the biggest pitfall of graph visualization tools: they look impressive but become unusable as the graph grows. Wikis scale — Wikipedia has millions of pages and remains navigable because the interface is content-first with links, not a force-directed layout.

The Notion-meets-Jira framing resolves a tension in existing tools: Notion is great for reading and writing but weak on structured metadata and workflows; Jira is great for tracking status and relationships but hostile to long-form thinking. Discovery needs both — the content depth of a wiki and the structural rigor of a project tracker.

This idea complements the graph-backed artifact store (Neo4j + GraphQL). That idea provides the computational substrate — storage, traversal, integrity. This idea provides the human-facing layer — reading, writing, navigating, and understanding the graph through its content.

## Decisions

- **Editing model**: Modal for v1 — clean read view with an "edit" action that opens a structured form for metadata and a Markdown editor for body content. Inline contenteditable (Notion-style) is a future upgrade; the data model doesn't change.
- **Real-time collaboration**: Out of scope for v1. Single-user. Discovery is a low-contention workspace — people aren't typically editing the same artifact simultaneously.
- **Data source**: GraphQL API from the artifact store — no file-based mode. The backend will be stood up before the UI is ready to build. This keeps the architecture simple: one data source, no file parsing or local server workarounds.
- **Search**: Deferred. Filtered list views (by type, status, relationship) cover the "find something" use case at the current graph scale. Add full-text search when the content outgrows list views.

## Open Questions

- **Markdown rendering**: Which renderer? Need to support frontmatter stripping and potentially custom extensions for artifact links.
- **Graph navigation queries**: What GraphQL queries does the navigator need beyond basic CRUD? Ancestry paths (for breadcrumbs), subtree fetches (for sidebar), filtered lists with relationship joins?
