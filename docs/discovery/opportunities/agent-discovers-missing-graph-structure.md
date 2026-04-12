---
name: "Agents can independently discover missing links and nodes through semantic analysis"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW let agents autonomously analyze the graph to discover missing connections between existing nodes and, more importantly, identify nodes that should exist but don't?"
---

## Description

The discovery graph will always be incomplete — humans forget to link artifacts, miss connections across branches, and leave implicit relationships unrecorded. Rather than relying on the UI to nag about missing links at creation time, agents can independently analyze the graph to find structural gaps.

This goes beyond link completion. The more interesting capability is discovering *missing nodes* — an idea that has no assumptions surfaced, an opportunity with no evidence, a branch of the tree that's thin relative to its importance. Agents can use semantic search (and eventually spatial representations) to find these gaps and propose additions.

This is a key capability for the autonomous agent work model — agents don't just respond to human requests but proactively maintain and enrich the graph.

## Evidence

- Knowledge graph completion is a well-studied problem in ML/AI with established techniques
- The Forge CLI skills already do a version of this interactively (`/surface-assumptions` analyzes an idea to find implicit assumptions) — the opportunity is to make this continuous and autonomous
- Semantic search over node embeddings can surface non-obvious connections that neither humans nor structural analysis would find
