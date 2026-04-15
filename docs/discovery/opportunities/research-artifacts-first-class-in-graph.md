---
name: "HMW make research artifacts first-class in the discovery graph?"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW make research artifacts (interview transcripts, recordings, observation notes) first-class in the discovery graph?"
---

## Description

Discovery produces a lot of raw material: interview recordings, transcripts, field notes, survey exports, diary studies, usability test sessions, support ticket corpora, competitive teardowns. Today this material lives outside the discovery graph — in Otter, Rev, Notion, Drive, Dovetail, or whichever specialized tool the researcher happens to use. The discovery tool has zero handle on it.

The cost shows up in three ways:

- **Broken traceability.** When an insight is drawn from a research session, the link back to the source is typically lost — or at best, a body comment saying "from user interview 3." Six months later, nobody can re-ground the insight in the raw material. The quote that made it real is gone.
- **No reuse.** One hour-long interview might inform five different insights, three different personas, and two different opportunities. The one-to-many chain is invisible — the researcher remembers it, nobody else does.
- **Stale-by-design failure mode.** The moment research artifacts live outside the graph, the graph becomes a synthesis layer for something it can't actually read. Teams stop updating it because the cost of keeping it in sync with the raw material exceeds the value of having it current. The graph decays into a second-order filing cabinet.

The opportunity is to make research artifacts first-class node types in the discovery graph — with structure, queryability, and typed links to the insights and opportunities they inform. Not necessarily storing gigabytes of video in the graph itself (that might live in specialized storage) but at minimum: a node that represents the artifact, has a source reference, has metadata (participant, date, method), and can be linked from insights, personas, assumptions, and opportunities.

## Evidence

- **Dovetail is an entire product built around this gap.** It treats research artifacts (they call them "sessions") and atomic findings ("highlights") as queryable, searchable, linkable first-class objects. Teams adopt it *because* no discovery tool provides this layer.
- **EnjoyHQ, Condens, Marvin, Notably** are all competing in the same space. The category exists because the gap exists.
- **Every PM researcher maintains a manual spreadsheet.** "Which interview said what, when, why it matters, which insight it fed." This spreadsheet is the research-artifact-to-insight graph that the discovery tool should provide natively.
- **The pattern breaks down beyond ~15 research sessions.** At that scale, nobody remembers. Teams either stop doing research or stop citing it.
- **Etak's current backlog implicitly assumes this gap.** `evidence-layer-missing-from-discovery-tools` (an existing opportunity) names one side of this problem; the research-artifact layer is the ground truth that makes an evidence layer meaningful in the first place.

## Where this sits in the discovery rhythm

This opportunity is firmly on the **divergent** side of the rhythm. Research artifacts are raw material — they're what the discovery process produces during its generative phases and synthesizes during its convergent phases. A tool that represents them without bias toward "we're almost ready to ship" lets teams accumulate raw material across a long time horizon and draw on it when they converge. See `support-divergent-convergent-rhythm-of-discovery`.

A companion convergent opportunity is `evidence-and-insights-as-first-class-linked-artifacts` — how the raw material gets synthesized into actionable claims.

## Related opportunities

- **Parent concept:** `no-place-for-discovery-activities` — the general "activities happen outside the tool" gap. This opportunity specializes it to the artifacts that activities produce.
- **Adjacent (synthesis):** `evidence-and-insights-as-first-class-linked-artifacts` — the convergent synthesis layer that consumes research artifacts.
- **Adjacent (personas):** `ground-opportunities-in-personas-and-scenarios` — personas built from research artifacts stay grounded; personas built from imagination drift.
- **Adjacent (memory):** `graph-must-serve-as-agent-institutional-memory` — raw research is the institutional memory the graph should preserve.
- **Sibling (rhythm):** `support-divergent-convergent-rhythm-of-discovery` — this opportunity is about the divergent raw material layer.
