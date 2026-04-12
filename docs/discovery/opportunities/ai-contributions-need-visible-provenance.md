---
name: "Users can't distinguish AI-proposed content from human-authored content in the graph"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW make the origin and review status of every artifact visible so users can calibrate their trust appropriately?"
---

## Description

When AI agents create assumptions, propose connections, or generate ideas, that content enters the same graph as human-authored artifacts. If there's no visible distinction, users face a trust problem: they either distrust everything (assuming the AI wrote it and nobody vetted it) or trust everything (assuming a human reviewed it). Both are dangerous.

Provenance — who created it, whether it's been reviewed, who endorsed it — needs to be a first-class visible element in the reading experience, not buried in metadata. This applies to the UI (how artifact pages render attribution) and to the data model (provenance fields on every node and edge).

## Evidence

- The graph-backed artifact store idea already specifies `source` (human vs AI-proposed) and `attribution` on edges — the data model supports this, but the display layer hasn't been designed
- Research on human-AI collaboration consistently shows that trust calibration depends on transparency about AI involvement
- Tools like GitHub Copilot and Cursor surface AI-generated code differently from human-written code for the same reason
