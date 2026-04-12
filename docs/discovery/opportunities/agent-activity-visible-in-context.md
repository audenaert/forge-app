---
name: "Agent work must surface where humans are already looking, not in a separate inbox"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW weave agent contributions into the artifact pages and navigation so humans encounter them naturally while browsing?"
---

## Description

Agents will flag assumptions, propose connections, generate critiques, and surface gaps — often between sessions, working autonomously. If that work only appears in a separate "AI suggestions" panel or notification queue, humans won't see it. It needs to surface in context: on the artifact page they're reading, in the sidebar next to the node they're exploring.

This is distinct from provenance (labeling who authored what) and staging (review/triage of AI output). This is about placement — making sure agent activity appears where it's relevant, not where it's easy to ignore.

Two key scenarios:
- **In-session:** While a user is browsing an idea, surface related agent activity ("3 untested assumptions flagged by your agent")
- **Between-session:** When a user returns after autonomous agent work, show what changed and where ("since yesterday, your agent analyzed the assumption tree and flagged 3 weak spots") — scoped to the graph, including agent actions

## Evidence

- Notification fatigue is well-documented — separate inboxes for AI suggestions get ignored quickly
- GitHub's inline code review comments succeed because they appear in context, not in a separate list
- The between-session scenario is especially important for supporting autonomous agent work alongside interactive sessions
