---
name: "HMW make the divergent/convergent rhythm of discovery explicit, paced, and supported in the tool?"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW make the divergent/convergent rhythm of discovery explicit, paced, and supported in the tool?"
---

## Description

Discovery isn't a single mode of thinking. It alternates between two:

- **Divergent** — generating possibilities, opening up the space, exploring. Brainstorming opportunities, surfacing assumptions, gathering research, proposing solutions.
- **Convergent** — narrowing down, selecting, synthesizing, deciding. Prioritizing, critiquing, choosing what to test, synthesizing insights from raw material.

This rhythm is well-established in the design and discovery literature: the double-diamond (British Design Council), Teresa Torres' generate-then-test cadence in Continuous Discovery Habits, Tim Brown's "flaring and focusing." It has vocabulary and ritual. But discovery *tools* rarely model it explicitly.

The result is predictable failure modes:

- **Tools that start with "rank these" force premature convergence.** Most roadmap and prioritization tools land here — they imagine a world where the ideas are already on the table, and the only job is to score them.
- **Tools that only diverge leave discovery adrift.** Miro boards with 300 stickies and no exit ritual. Brainstorm sessions whose output decays in a week.
- **Tools that don't mark mode transitions lose the ritual.** The moment "we've been diverging, time to converge" is where most value lives in a facilitated session — it's where the group commits. If the tool is silent at that moment, the transition happens in side conversations, if at all.
- **Tools that converge without preserving divergent residue** (see `rejected-work-is-invisible-institutional-knowledge`) throw away the context that made the convergent decision legible. Six months later, nobody remembers which ideas were on the table, and the same conversation happens again.

The opportunity is a tool that knows which mode the team is in, paces the transitions, pairs divergent and convergent activities explicitly, and preserves the residue of both. That vocabulary — *diverge, converge, transition* — should be first-class in both the tool and the discovery skill that drives it.

## Evidence

- **Double-diamond (Design Council, 2005)** is the canonical framing: diverge on the problem → converge on the problem → diverge on the solution → converge on the solution. Widely taught; almost no tool enforces it.
- **Continuous Discovery Habits (Teresa Torres)** treats generation and test as alternating phases. Teams that skip generation over-invest in the first idea. Teams that skip convergence never ship.
- **Design Sprint (Google Ventures)** bakes divergent/convergent moves into every day of the week, with explicit rituals for each transition. It works because the ritual is the method.
- **Existing discovery tools fail predictably.** Productboard, Vistaly, Linear's project docs all model the *artifacts* of discovery (objectives, opportunities, ideas) but not the *rhythm* that produces them. Teresa Torres' OST mapping workshops happen in Miro because no tool supports the rhythm natively.
- **This repo's own backlog already names adjacent pieces** — `no-process-guidance-in-discovery-tools` is the parent concept; `prioritize-exploration-of-opportunity-space` names one recurring convergent activity; `rejected-work-is-invisible-institutional-knowledge` names the divergent-residue failure mode.

## Possible directions for solution ideas

These aren't scoped yet — they're the territory this opportunity opens up:

- Tag every activity in the discovery skill and the tool as divergent, convergent, or neutral; make the tag visible.
- Visualize the team's current mode and the time spent in it ("you've been diverging for 4 sessions — ready to converge?").
- Pair divergent and convergent activities explicitly (brainstorm → prioritize is one canonical pairing; surface-assumptions → design-experiment is another).
- Make mode transitions ritual moments with a defined affordance — "we're done diverging, here's the candidate set, now converge."
- Preserve divergent residue when converging so the rejected work isn't lost; link it to the convergent decision that dropped it so it's traceable later.
- Give the discovery skill a `mode` awareness so when it invokes sub-activities, it knows whether the user is diverging or converging and can pace accordingly.

## Related opportunities

- **Parent concept:** `no-process-guidance-in-discovery-tools` — the general "tool doesn't guide the thinking" gap. This opportunity specializes it to the diverge/converge rhythm specifically.
- **Sibling (convergent specialization):** `prioritize-exploration-of-opportunity-space` — one specific recurring convergent activity.
- **Sibling (divergent residue):** `rejected-work-is-invisible-institutional-knowledge` — the failure mode where convergent work loses the divergent history.
- **Related (stakeholder input):** `gather-structured-input-from-occasional-stakeholders` — stakeholder input can happen on either side of the rhythm (gathering ideas vs. scoring them), and the tool should know which.
