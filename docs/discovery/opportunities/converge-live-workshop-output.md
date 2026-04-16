---
name: "Teams lose signal when converging the output of a live collaborative workshop"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
specializes: curate-vast-opportunity-space
hmw: "HMW let a team shape the output of a live collaborative workshop without losing signal?"
---

## Description

Workshops — design sprints, opportunity brainstorms, assumption-surfacing sessions — produce a lot of material very fast. A one-hour ideation session with eight people can put 200+ raw ideas on the table. The generation step is usually fine; facilitators have thirty years of ritual for it. The step that routinely fails is the one that follows: converging the raw pile into something the team can actually carry forward.

Convergence in a live session is a real-time editorial act. It is curation under time pressure, with many authors, in front of a live audience. The material is raw, partially formed, sometimes duplicative, sometimes contradictory. Half of it is worth keeping. A quarter of it will reveal its value only after it is clustered with something adjacent. Some of it should be dropped now but not erased, because the convergent decision has to be legible six months from now. And all of this has to happen in the last fifteen minutes of a session that has already spent an hour on generation.

Tools today fail at both ends. Sticky-note surfaces (Miro, FigJam) hold the raw output beautifully but have no affordance for carrying the shaped result forward — the board is a graveyard the team never reopens. Structured discovery tools (Productboard, Vistaly) demand clean artifacts and force premature formalization, which destroys the raw context that made each sticky meaningful in the moment. Neither surface lets the team *hold* the material in its raw form while progressively shaping it — merging duplicates, clustering themes, promoting the clearest items to first-class artifacts, deferring the ambiguous ones for follow-up — in a way that preserves both the shaped output and the residue behind it.

Etak sits in an interesting middle position. The graph is structured enough to hold the shaped output once it exists. [M1](../../development/specs/web-ui-discovery-explorer.md) is read-only and does not try to catch live workshop input at all, which is correct for the milestone but points at the gap: when the team does turn to the authoring surface, the job will not be "type each idea into a form." It will be "receive a pile of raw material and help us shape it together, live, without losing anything valuable and without forcing structure we haven't earned yet."

The outcome we want: a team leaving a live workshop has a shaped, navigable slice of the opportunity space that reflects what they actually decided, the raw material behind those decisions is preserved and linked rather than thrown away, and the convergence act itself was fast enough to fit inside the session that produced the raw material.

## Evidence

- Facilitator experience reports (design sprints, discovery workshops, assumption-surfacing sessions) consistently identify the convergence step as the highest-value and most-skipped part of the session. "We ran out of time to cluster" is a near-universal postmortem.
- Teresa Torres' opportunity-mapping workshops explicitly pair divergent and convergent moves and stress that the convergent move is where the OST actually gets built. Most tools support the divergent move (stickies) and the final artifact (the tree) but not the live transition between them.
- Etak dogfooding cannot yet speak to this directly — the authoring surface doesn't exist — but the symptom already shows up in asynchronous terms: batches of AI-generated opportunities land in the repo and require hours of manual merging, renaming, and re-parenting. That async-convergence load is the same job this opportunity names in its synchronous form.
- The divergent/convergent rhythm is the subject of [`support-divergent-convergent-rhythm-of-discovery`](./support-divergent-convergent-rhythm-of-discovery.md); this opportunity is the specific case where the two phases collide in a single live session with many authors.

## Potential directions (illustrative, non-exhaustive)

These are solution shapes, not requirements.

- A staging surface that holds raw workshop output in a lightweight form — not yet full artifacts — and supports clustering, merging, and promotion without round-tripping through the authoring flow for each item.
- Merge and cluster affordances that preserve the originals as residue linked to the shaped result, so six months later a reader can still see what was on the table.
- Mixed-initiative convergence where an AI agent proposes clusters, duplicates, and candidate themes for human review in-session — turning convergence into a curation act rather than a typing act.
- Explicit session boundaries so a workshop's convergence can be held as a unit ("this is what we shaped on 2026-04-15") rather than diffusing silently into the rest of the graph.

## Relationship to other opportunities

- **Parent:** [`curate-vast-opportunity-space`](./curate-vast-opportunity-space.md) — the general editorial job. Live convergence is curation under time pressure with many authors and just-generated material.
- **Sibling (sensemaking):** [`make-sense-of-vast-opportunity-space`](./make-sense-of-vast-opportunity-space.md) — sensemaking is the solo, retrospective case; live convergence is the multi-author, real-time case. The cognitive and social dynamics are different.
- **Related (rhythm):** [`support-divergent-convergent-rhythm-of-discovery`](./support-divergent-convergent-rhythm-of-discovery.md) — the general framing of diverge/converge transitions. This opportunity names the specific pressure point where the transition happens inside a single session.
- **Related (residue):** [`rejected-work-is-invisible-institutional-knowledge`](./rejected-work-is-invisible-institutional-knowledge.md) — the failure mode where convergent work loses the divergent residue. Live convergence is where that residue is most vulnerable.
