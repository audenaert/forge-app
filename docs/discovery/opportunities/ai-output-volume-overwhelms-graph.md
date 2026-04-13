---
name: "AI agents generate high-volume output that can flood the graph with unreviewed content"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW give AI agents room to generate freely while keeping the human-curated graph signal-rich and trustworthy?"
---

## Description

When an agent surfaces assumptions for an idea, it might produce 8-12. A brainstorming session might generate 15 opportunities. If every AI-generated artifact enters the graph at the same level as human-authored ones, the graph quickly fills with unreviewed content. The noise drowns the signal, and the graph stops being a reliable map of what the team actually believes.

The opportunity is a staging concept — AI-proposed artifacts that are visible and accessible but clearly not yet accepted into the canonical graph. This implies a review/triage flow: humans (or other agents) can accept, reject, merge, or refine AI proposals before they become part of the shared model.

## Evidence

- The Forge CLI skills already generate multiple artifacts per invocation (`/surface-assumptions` routinely produces 5-10 assumptions) — this volume problem exists today at the file level
- Content moderation and review workflows are well-established patterns (GitHub PRs, Wikipedia's pending changes, editorial review queues)
- Without staging, teams will either stop using AI generation (too noisy) or stop trusting the graph (too much unvetted content)
