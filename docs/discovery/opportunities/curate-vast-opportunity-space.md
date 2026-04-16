---
name: "Teams struggle to curate a vast opportunity space"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW help teams curate a vast opportunity space?"
---

## Description

The opportunity space is *always* vast. A mature product discovery practice in a real org — 7-10 PMs, 7 EMs, 5 designers, years of accumulated work, plus AI-assisted ideation — easily contains hundreds of opportunities and thousands of ideas. The graph that holds it all is shared, but any individual's attention is narrow: a few objectives, 5-10 active opportunities, maybe a few hundred ideas they care about right now. The interesting tension is not between "team knowledge" and "individual knowledge" — it is between the size of the space and the width of any one person's working memory at any one moment.

The [M1 Discovery Explorer](../../development/specs/web-ui-discovery-explorer.md) was shaped around an implicit assumption of dozens of artifacts. The dashboard lists objectives; the tree projection expands an objective into its descendants; orphan sections catch what doesn't root. That shape is correct for a seeded demo domain, and it is where M1 needs to be. But the assumptions break predictably as the space grows. The dashboard becomes an endless list. The tree becomes unusable past a few hundred nodes. Orphan sections turn into landfill. Lateral navigation through typed relationships still works mechanically but requires you to already know what you're looking for — and the people who most need help are the ones who don't.

The real job is editorial. **Curation** — selecting, pruning, shaping a view for a specific question, audience, or moment. Moving artifacts between "actively working on," "might come back to," and "not now." Letting teammates see what I'm focused on without losing my own frame. Surfacing the right 5% for the present moment without losing access to the other 95%. This is a different job from visualization: visualization shows what is there, curation decides what is worth looking at right now and frames it so the reader doesn't have to pay the cost of the whole graph to read one corner of it.

Curation is also not a single job. It fragments along the shape of the question the user is holding: *what is here?*, *where is the thing I'm looking for?*, *where am I and how do I get back?*, *what do we do with what we just generated together?* Each of these bends the interface differently, and a single "explore" surface that tries to answer all four collapses into a compromise that serves none. The four specializations below split the territory along those lines.

This opportunity is distinct from — and downstream of — [`no-computational-model-for-opportunity-exploration`](./no-computational-model-for-opportunity-exploration.md). That opportunity is about externalizing the team's shared opportunity space so it can be worked on collaboratively at all. This one assumes the space is externalized and asks whether the interface on top of it holds up when the space is large.

## Evidence

- The [M1 Discovery Explorer spec](../../development/specs/web-ui-discovery-explorer.md) is explicit that read-only hypertext is the primary surface and the tree is an orientation device. Both assume a scale where a single objective's subtree fits on screen — a reasonable bet for the milestone, not a durable one.
- Etak dogfooding already produces the symptom at small scale: the `docs/discovery/opportunities/` directory has grown past 30 files, and finding the right parent for a new opportunity already requires reading filenames rather than browsing. This is pre-GA, pre-team, pre-AI-assisted ideation — the pressure is already visible with one author.
- Discovery literature treats the opportunity space as something to be *cultivated*, not just captured — Teresa Torres' framing of the Opportunity Solution Tree emphasizes ongoing pruning and re-parenting as understanding deepens. Today's OST tooling (Productboard, Vistaly, Miro) supports capture much better than it supports that ongoing editorial work.
- Workshops that generate 100-200 ideas in an hour (design sprints, opportunity brainstorms) routinely end with a Miro board that nobody ever reopens. The editorial work of converging on the valuable material is where most of the session's value lives, and it is the step tools most consistently fail at.
- Adjacent opportunities in this repo — [`lateral-navigation-across-discovery-graph`](./lateral-navigation-across-discovery-graph.md), [`support-divergent-convergent-rhythm-of-discovery`](./support-divergent-convergent-rhythm-of-discovery.md), [`rejected-work-is-invisible-institutional-knowledge`](./rejected-work-is-invisible-institutional-knowledge.md) — each touch pieces of the same editorial job from different angles.

## Specializations

Curation is a cluster of related jobs rather than a single job. This opportunity is developed through four specializations, each pointing at a distinct shape of the question the user is holding:

- [`make-sense-of-vast-opportunity-space`](./make-sense-of-vast-opportunity-space.md) — **sensemaking**: constructing a working mental model of a space too big to hold in one head, so the team has a shared sense of where the work is and where it isn't.
- [`find-relevant-work-in-vast-space`](./find-relevant-work-in-vast-space.md) — **findability**: reaching the right pocket of the graph for a specific, already-held question without walking every edge.
- [`explore-without-getting-lost`](./explore-without-getting-lost.md) — **navigation safety**: wandering productively rather than anxiously — orientation, recovery, and the emotional affordance of "I can always get back."
- [`converge-live-workshop-output`](./converge-live-workshop-output.md) — **live convergence**: shaping raw, just-generated material in a synchronous, multi-author session without forcing premature structure or losing signal.

Ideas may cut across multiple specializations — a well-designed map view probably helps all four — and when they do they should be developed against this parent rather than one child. The split exists to keep the specific pressure points legible, not to carve the solution space into four disjoint lanes.
