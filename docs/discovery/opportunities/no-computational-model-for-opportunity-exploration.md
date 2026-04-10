---
name: "Teams have no computational model for exploring and evolving their opportunity space"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW support creative exploration of the opportunity space for a given product domain?"
---

## Description

Product teams doing continuous discovery build a complex, evolving graph of knowledge: objectives, opportunities, ideas, assumptions, experiments, evidence. This graph has rich typed relationships (ideas address opportunities, assumptions underlie ideas, experiments test assumptions, evidence supports or contradicts).

Today, this graph has no computational representation. It lives in sticky notes, Miro boards, Notion pages, and people's heads. Teams can't query it ("which assumptions haven't been tested?"), can't traverse it ("what's the evidence chain behind this idea?"), can't share it across sessions without decay, and can't let AI agents participate in building or challenging it.

CDH (Continuous Discovery Habits) provides a proven structure for this knowledge — the Opportunity Solution Tree. But without a computational substrate, the structure remains a thinking framework rather than a living, queryable, collaborative model.

The opportunity is to give teams a real graph-backed model of their opportunity space — one that preserves the full topology of relationships, supports multiple interaction paradigms (spatial, hierarchical, narrative, graph), and lets both humans and AI agents read, write, traverse, and reason about the shared model.

## Evidence

- The forge artifact taxonomy already defines the node types and relationship types for this graph. It's well-specified but stored as flat files with no traversal, no integrity enforcement, and no query capability.
- Teresa Torres' CDH is widely adopted but poorly served by existing tools — teams use Miro/FigJam for workshops (visual debris, no structure) or Productboard/Vistaly for the clean tree (no process support, no evidence chains).
- The Forge Workspace proposal identifies the knowledge graph as the core architectural element, citing three decades of spatial hypertext research on incremental formalization.
- LLMs can now serve as the "system-assisted structure recognizer" that Shipman and Marshall envisioned — but only if there's a structured model for them to read and write against.
