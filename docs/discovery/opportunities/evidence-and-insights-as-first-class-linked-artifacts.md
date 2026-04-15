---
name: "HMW make evidence and insights first-class, citable, reusable artifacts in the discovery graph?"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW make evidence and its synthesis into insights first-class, citable, reusable artifacts in the discovery graph?"
---

## Description

Discovery depends on a ground truth layer that today barely exists in the graph: the observations, quotes, data points, and patterns that justify every opportunity, idea, and assumption. This layer lives today in prose body sections ("Evidence:" paragraphs) and in ordinal labels (`evidence: high | medium | low`). Neither is queryable, reusable, or citable. The ordinal label is especially telling — it's the schema admitting it knows evidence matters but hasn't modeled it.

The missing concept is actually **two linked node types**, which this opportunity bundles because they're two granularities of the same gap:

- **Evidence** — an atomic, citable claim with a source. "In user interview 7, participant said they gave up after 3 failed attempts." "Retention at day 7 is 23% across cohorts X, Y, Z." "Support ticket #4231 reports the same error as tickets #3119 and #2876." Each evidence node has a strength grade and a source reference. Source might be a research artifact, a dashboard, a ticket, an external report, a sales call note.
- **Insight** — a synthesized higher-order claim that aggregates multiple pieces of evidence into something actionable. "Users abandon the flow at the retry step because the error messaging is indistinguishable from a transient failure." Insights cite evidence. An insight's confidence is a function of the evidence it rests on.

A mature discovery graph makes both first-class and links them both ways:

- **Evidence → Insight** — one piece of evidence can support multiple insights
- **Insight → Evidence** — one insight can cite multiple pieces of evidence
- **Evidence → anywhere** — evidence can directly support or contradict any opportunity, idea, or assumption without necessarily going through an insight
- **Insight → anywhere** — insights ground the OST's higher-level artifacts

This layer solves three problems the current model can't:

1. **Reusability.** One interview quote might inform three different insights which inform five different opportunities. Today, that chain is invisible — the quote gets pasted into three body sections and the connection is only in the researcher's head. Modeled as a node with typed edges, the reuse is automatic.
2. **Traceability.** A claim in the graph should be traceable back to the observations that justify it. Today, traceability lives in prose ("we saw this in interviews"); tomorrow, it's a graph walk.
3. **Confidence propagation.** Assumptions have an `evidence: high | medium | low` ordinal today — but the label is divorced from any actual evidence. With linked evidence nodes, confidence becomes a property of the graph structure: an assumption with five strong pieces of evidence is observably more confident than one with a single anecdote, and the graph can surface that directly.

## Evidence

- **Jira Product Discovery** has "insights" as first-class nodes, linkable to Jira issues and to external sources. Explicitly modeled because their users kept asking for it.
- **Dovetail** distinguishes "highlights" (atomic evidence extracted from research artifacts) from "insights" (synthesized claims). The two-granularity model is the design pattern here.
- **Notably** (a newer competitor) does the same split.
- **Etak's own assumption schema has `evidence: high | medium | low`** as an ordinal field with no linked content. That's a design smell pointing directly at this gap — we know we need the concept, we just haven't modeled it.
- **PMs in the wild maintain a separate evidence spreadsheet** for exactly this reason. Every one I've talked to has one. The tool should provide it.

## Where this sits in the discovery rhythm

This opportunity **spans the transition** between divergent and convergent. Evidence is on the divergent side — atomic raw observations accumulate over time as the team gathers ground truth. Insights are on the convergent side — they collapse multiple pieces of evidence into a single actionable claim. The evidence/insight split is itself a diverge→converge move in miniature: gather many atoms, synthesize them into something load-bearing.

The pairing with `research-artifacts-first-class-in-graph` is the full chain: **research artifact → evidence → insight → opportunity/idea/assumption**. Each step is a progressive synthesis. A mature graph would let you walk that chain in either direction.

See `support-divergent-convergent-rhythm-of-discovery` for the overall framing.

## Related opportunities

- **Upstream (raw material):** `research-artifacts-first-class-in-graph` — research artifacts are one important source of evidence (but not the only one).
- **Parallel (existing framing):** `evidence-layer-missing-from-discovery-tools` — an earlier opportunity that names the same gap less specifically. If this opportunity is accepted, consider merging or superseding the earlier one.
- **Downstream (who it grounds):** `ground-opportunities-in-personas-and-scenarios` — personas should be synthesized from evidence, not imagination.
- **Related (memory):** `graph-must-serve-as-agent-institutional-memory` — the evidence/insight layer is the load-bearing memory of institutional knowledge.
- **Related (rhythm):** `support-divergent-convergent-rhythm-of-discovery` — this opportunity explicitly spans divergent and convergent modes.
