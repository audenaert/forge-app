---
name: "Teams have no shared, externalized opportunity space they can actively build on together"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW give a team a shared, externalized opportunity space they can discover, frame, and ideate on together?"
---

## Description

Every product team already has an opportunity space. It exists — it always has — in the heads of the people doing the work: the PM's running list of things to investigate, the designer's mental map of user friction, the engineer's sense of what's fragile, the founder's bets about where the market is going. The mental model is not missing. What is missing is the externalization that lets a team work on that model *together*.

Today, the parts of the space that get externalized at all end up in sticky notes, Miro boards, Notion pages, Slack threads, and a PM's private doc. Each of these captures a snapshot of one person's framing at one moment. None of them hold the *shared* model — the one where my opportunity is your constraint, where two ideas turn out to address the same assumption, where an experiment result invalidates three things at once. The model stays in people's heads because the surfaces available for externalizing it all destroy the relationships that make it valuable.

The outcome we want is a shared opportunity space a team can actively build on together — one where discovering, framing, and ideating are first-class collaborative moves, not ceremonies performed on a private doc and then announced to the group. That means the externalized space has to hold enough structure to be worked on together (typed artifacts, typed relationships, queryable, navigable), and it has to stay close enough to the raw material of discovery that people actually externalize into it rather than around it.

The Opportunity Solution Tree from Continuous Discovery Habits is the structure most teams reach for when they try. It is a good structure. But CDH treats the OST as a shared artifact the team maintains together, and the tools available for that maintenance are almost all single-player under the hood — one person shapes, others comment. The graph never becomes a thing the team *builds on* in the same way a codebase is a thing engineers build on together.

An externalized, structured, queryable model also unlocks participation the team currently cannot get at all: AI agents that can read the shared space, propose additions, challenge framings, surface gaps, and trace evidence chains. That kind of participation is impossible against sticky notes and prose documents, and it is the participation pattern Etak is built to support.

## Evidence

- The Forge artifact taxonomy already defines the node and relationship types for this graph and has been dogfooded as flat files in `docs/discovery/`. The structure works as a thinking framework; the collaborative surface is what's missing.
- Continuous Discovery Habits is widely adopted, but teams doing it end up in Miro/FigJam for workshops (visual debris, no structure) or Productboard/Vistaly for the clean tree (no process support, no evidence chains, no collaborative shaping). Neither is a surface the team builds on together in the way the method assumes.
- Three decades of spatial hypertext research (Shipman, Marshall, and the Hypertext community) point at incremental formalization as the necessary middle ground: structure earned as understanding deepens, not imposed up front. LLMs make the "system-assisted structure recognizer" role from that research practical for the first time, but only if there is a structured, shared model for them to read and write against.
- The Forge Workspace proposal identifies the shared knowledge graph as the core architectural element precisely because the collaborative job — humans and AI agents working on the same model — is impossible without it.

## Relationship to other opportunities

- **Adjacent:** [`curate-vast-opportunity-space`](./curate-vast-opportunity-space.md) — the complementary opportunity, one step downstream. *This* opportunity is about externalizing the space so it can be worked on collaboratively at all; `curate-vast-opportunity-space` is about the interface on top of that externalized space holding up once the space is large. You need this one solved before the curation problem becomes the bottleneck; you need the curation one solved before the externalized space stays workable at real team scale.
- **Related:** [`no-process-guidance-in-discovery-tools`](./no-process-guidance-in-discovery-tools.md) — the complementary gap on the method side: even with a shared model, teams need the tool to guide the thinking that fills it.
- **Related:** [`graph-needs-coherent-narrative`](./graph-needs-coherent-narrative.md) — once the space is externalized, reading it as narrative is one of the first jobs a collaborative surface has to support.
