---
name: "Stakeholder-weighted multi-dimensional scoring for prioritization"
type: idea
status: draft
addresses:
  - prioritize-exploration-of-opportunity-space
  - gather-structured-input-from-occasional-stakeholders
delivered_by: null
---

## Description

A prioritization feature that lets a PM select a set of items from the discovery graph (ideas, opportunities, sometimes assumptions), define a set of scoring dimensions (e.g., impact, effort, strategic fit, risk, customer pain), and issue a scoring request to a named list of stakeholders.

Stakeholders get a lightweight view — no full Etak onboarding — showing the items and the dimensions. They score independently, add rationale comments, and submit. Etak aggregates but doesn't flatten: the PM sees the distribution, not just the average. Variance and outliers are surfaced. Rationale comments are visible inline next to the scores that triggered them.

## How a user experiences it

1. PM selects items to score and opens the prioritization action.
2. PM chooses or defines dimensions (comes with sensible defaults: impact, effort, confidence, customer pain).
3. PM picks stakeholders from an address book or a link-share mode.
4. Stakeholders get an email/link/Slack prompt with a focused scoring view. They score and optionally explain.
5. PM sees the aggregated result: per-item scores with distributions, outliers highlighted, rationale threaded. Can pivot by dimension, by stakeholder, by score.
6. The scoring session is attached to the graph as a first-class artifact — a prioritization record linked to every item it touched and every stakeholder who contributed.

## Why this could work

Ranked by the outcomes it serves, in priority order:

1. **Multiple voices weighted properly.** The distribution is the primary view, not the average. Outliers are visible. Loudest-in-the-room dynamics break down when everyone sees the whole distribution before the meeting.
2. **Stakeholder needs transparent to all parties.** Rationale comments make each stakeholder's reasoning visible to the others. No more private DMs about why sales vetoed the roadmap. Scoring records are a byproduct of the process, so decisions become traceable without extra work.
3. **Structured, process-driven input gathering.** Scoring happens in a defined session, with defined dimensions, with defined aggregation. It's a workflow, not a vibe.
4. **Evidence over argument for the PM.** The PM walks into the prioritization meeting with data and distribution, not a preference.

## Where this sits in the discovery rhythm

This is a **convergent** activity (see `support-divergent-convergent-rhythm-of-discovery`). Its natural divergent pair is generating the candidate set of items in the first place — brainstorming ideas, surfacing opportunities, or opening up the space. A complete workflow would look like *diverge → converge* in sequence: generate candidates with stakeholder input, then score them with stakeholder input, then decide. This idea is one half of that pairing.

## What makes it different

- **Not RICE / ICE.** Those are single-scorer frameworks. This is multi-scorer by design.
- **Not a Google Form bolted on.** The input, the aggregation, and the decision all live on the discovery graph, so the scoring record is a persistent artifact linked to the items it informed.
- **Not a generic survey tool.** The dimensions, items, and aggregation are tuned for discovery work, and the output is queryable alongside the rest of the graph.

## Open questions

- **Weighting.** Do all stakeholders carry equal weight by default, or does the PM assign weights per stakeholder / per dimension? (Equal by default seems right, but the data might argue otherwise.)
- **Anonymity.** Should stakeholders see each other's scores before submitting? (Probably not — anchoring bias. But maybe after submitting?)
- **Async vs. sync.** Does this support live-session scoring or only async? Both modes might be needed for different team cultures.
- **Occasional-stakeholder auth.** Does the lightweight view need real auth, or is a signed link enough?
- **Session lifecycle.** What happens to a scoring session after it's "complete" — archived for audit, or still active for re-scoring when conditions change?
