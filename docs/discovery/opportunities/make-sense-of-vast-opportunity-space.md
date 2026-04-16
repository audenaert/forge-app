---
name: "Teams can't build or maintain a mental model of an opportunity space too large to hold in one head"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
specializes: curate-vast-opportunity-space
hmw: "HMW help a team make sense of an opportunity space too large to hold in any one person's head?"
---

## Description

Sensemaking is the first casualty of scale. Once the opportunity space passes the point where a single person can hold it in mind, everyone loses the working mental model — not just of the whole, but of their own corner of it. The symptom is the creeping feeling that you have forgotten something important, or that you are missing connections you would see if you could just hold it all at once. Read individual artifacts are fine; the *shape* is gone.

This is a constructive job, not a retrieval job. The user is not asking "where is X?" — they are asking "what is here, and how does it fit together?" The answer has to be built, in their head, from what the interface shows them. That makes the interface's job less about exposing every node and more about compressing the space into something the reader can actually form a picture from: thematic clusters, density, freshness, coverage gaps, who is working where.

At the scale [M1](../../development/specs/web-ui-discovery-explorer.md) targets, the tree projection and dashboard do this job adequately — you can read every objective, see every opportunity, and form a mental map by brute force. Past a few hundred nodes that strategy stops working. A full tree is a wall of text. The dashboard becomes an index with no shape. The team fragments into people who each have a private mental model of their slice and no shared picture of the whole. Leadership loses confidence that anyone actually has a handle on it.

Sensemaking is also continuous work, not a one-time onboarding task. A PM returns from a week off and has to rebuild the model of what moved while they were gone. A designer joining an existing initiative has to locate it inside a space they have never seen. A team lead preparing for a quarterly review needs a picture that was accurate yesterday, not three months ago. The job is *maintenance* of an accurate-enough mental model under constant change.

The outcome we want: anyone on the team can form and refresh a working picture of the opportunity space at a level of resolution that matches their current need — zoomed out for orientation, zoomed in for the corner they're working on — without having to read every artifact to get there.

## Evidence

- Etak dogfooding: returning to the opportunities directory after a few days away already requires re-reading filenames to reconstruct what is active and what is dormant. At one author, pre-team, the sensemaking pressure is already real.
- Teresa Torres' [Continuous Discovery Habits](https://www.producttalk.org/continuous-discovery-habits/) treats the Opportunity Solution Tree as a shared artifact the team maintains together; the implicit assumption is that everyone can see the same tree and mean the same thing by it. That assumption holds at small scale and quietly breaks at large scale.
- Spatial hypertext research on incremental formalization (Shipman and Marshall) shows people form mental models of large information spaces primarily by spatial and visual cues — proximity, color, density — long before they impose formal structure. Current OST tools rely on formal structure almost exclusively.
- Workshop facilitators routinely report that the first ten minutes of any session involve re-establishing shared context about what is in the space — a ritual that only exists because no interface carries the model between sessions.

## Potential directions (illustrative, non-exhaustive)

These are solution shapes that would answer the sensemaking job; they are not requirements and are not a backlog.

- Zoomable overview surfaces that compress the full space into thematic clusters before expanding any single artifact.
- Freshness and activity overlays so the reader can see which parts of the space are alive and which have gone quiet.
- Coverage heatmaps that make gaps legible (objectives with no opportunities, opportunities with no ideas, ideas with no assumptions) without requiring the reader to count.
- AI-generated "state of the space" summaries that refresh as the graph changes and let a returning user catch up in a few paragraphs.

## Relationship to other opportunities

- **Parent:** [`curate-vast-opportunity-space`](./curate-vast-opportunity-space.md) — the general editorial job of keeping a large space workable.
- **Sibling (findability):** [`find-relevant-work-in-vast-space`](./find-relevant-work-in-vast-space.md) — targeted retrieval once you already know what you are looking for. Sensemaking is the constructive predecessor: you need a model of the space before you can ask a specific question of it.
- **Sibling (navigation safety):** [`explore-without-getting-lost`](./explore-without-getting-lost.md) — sensemaking is about being oriented; navigation safety is about staying oriented while moving.
- **Related:** [`graph-needs-coherent-narrative`](./graph-needs-coherent-narrative.md) — narrative is one specific sensemaking affordance: reading a slice of the graph as prose rather than as a node-and-edge structure.
