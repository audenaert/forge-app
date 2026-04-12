---
name: "Without an evidence layer, every node in the tree is just an opinion with metadata"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW make evidence (interview snapshots, observations, experiment results) a first-class layer in the discovery graph so the tree is grounded in reality?"
---

## Description

The Opportunity Solution Tree has a layer below assumptions: evidence. Interview snapshots, observation notes, experiment results, usage data. This is what makes the tree credible — it's the difference between "we think users struggle with X" and "in 4 of 6 interviews, users described struggling with X."

Most discovery tools stop at the assumption level or treat evidence as unstructured attachments. Without structured evidence linked to the nodes it supports or contradicts, there's no way to assess confidence in any part of the tree, no way to see which branches are well-grounded vs. speculative, and no way for AI agents to reason about evidence quality.

## Evidence

- CDH explicitly requires interview snapshots as the foundation of the tree — opportunities should be grounded in observed customer behavior, not team speculation
- The Forge artifact taxonomy already defines evidence-related relationships (`evidenced-by`, `contradicted-by`) but the current ideas don't emphasize evidence as a first-class navigation and display concern
