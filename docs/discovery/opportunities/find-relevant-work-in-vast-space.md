---
name: "Teams can't find the right pocket of the opportunity space for the question they're holding"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
specializes: curate-vast-opportunity-space
hmw: "HMW help a team find the right pocket of the opportunity space for the question they're holding?"
---

## Description

Findability at scale is a different job from sensemaking. Here the person arrives with a specific question already formed — *what assumptions do we have about onboarding friction?*, *which ideas did we defer last quarter for revisit?*, *have we explored anything adjacent to this?* — and they need to reach the relevant pocket of the graph without walking every edge. The model is in their head; the goal is to pull the matching slice out of the shared space quickly enough that the question is still live.

Browsing breaks first. The [M1 Discovery Explorer](../../development/specs/web-ui-discovery-explorer.md) gives the reader hyperlinks to follow and a tree to expand — both useful when you already know roughly where to look. Neither helps a PM who remembers there was something about activation friction six months ago but has no idea which objective it hangs off of, or a new designer who has never seen the space and doesn't know what pockets even exist.

Search is necessary but not sufficient. A keyword match on *onboarding* returns dozens of weakly-related artifacts; what the user actually wants is a curated slice — by topic, by time window, by owner, by artifact type, by state ("still under active discussion"), by graph relationship ("ideas that address this opportunity and have untested assumptions"). The query language in the user's head is usually richer than any single menu can expose, and the richness is the point: a team lead running quarterly review wants something a PM investigating a new customer complaint doesn't.

Findability also has to degrade gracefully when the question is fuzzy. "I remember we talked about this, but I can't remember what we called it" is a common entry point, and it does not match any exact string. The outcome we want is that a person holding a real question — precise or fuzzy — can reach the relevant pocket of the space in seconds, not in a scavenger hunt across tabs.

Findability is distinct from sensemaking (building a model of the whole) and from exploration (wandering without a target). Here the target exists; the interface's job is to close the gap between the question in the user's head and the artifacts that answer it.

## Evidence

- Etak dogfooding: locating the right parent for a new opportunity already requires `ls docs/discovery/opportunities/` and reading filenames. The working solution is "I remember what I named it," which does not survive a team or a year.
- Discovery literature treats the OST as a browsing structure; it is largely silent on retrieval. Teams that outgrow browsing end up in confluence-style search or in "ask the PM who worked on it" — neither is durable.
- Workshop facilitators routinely field the question "didn't we already think about this?" mid-session, and the answer is almost always "probably, but we can't find it fast enough to matter." The cost of the lookup failure is that the team regenerates work they already did.
- Graph databases like the Neo4j backend targeted by [`no-computational-model-for-opportunity-exploration`](./no-computational-model-for-opportunity-exploration.md) are well-suited to exactly the kind of faceted, relationship-aware retrieval this opportunity needs — but the value only lands if the surface exposes it.

## Potential directions (illustrative, non-exhaustive)

These are solution shapes, not requirements. Ideas addressing this opportunity may mix and match.

- Faceted filters across the dimensions people actually hold questions in (topic, time, owner, state, artifact type, relationship).
- Saved views that capture a recurring question as a named slice the user — or the team — can return to.
- Natural-language query that maps a question in the user's words onto a graph query, with the result shown as a slice rather than a ranked list of documents.
- Semantic search over artifact bodies that tolerates fuzzy recall ("that thing about activation friction") without requiring an exact keyword match.

## Relationship to other opportunities

- **Parent:** [`curate-vast-opportunity-space`](./curate-vast-opportunity-space.md) — the general editorial job.
- **Sibling (sensemaking):** [`make-sense-of-vast-opportunity-space`](./make-sense-of-vast-opportunity-space.md) — constructive model-building. Findability presupposes some sensemaking; you need to know the space has pockets before you can ask for one.
- **Sibling (navigation safety):** [`explore-without-getting-lost`](./explore-without-getting-lost.md) — exploration is the complementary case where the user does *not* yet have a target. Findability is targeted; exploration is non-goal-directed.
- **Related:** [`lateral-navigation-across-discovery-graph`](./lateral-navigation-across-discovery-graph.md) — once the user reaches the right pocket, lateral navigation is how they pivot from one artifact to the adjacent ones.
