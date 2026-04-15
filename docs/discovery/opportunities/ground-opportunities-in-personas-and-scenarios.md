---
name: "HMW ground opportunities in personas and scenarios rather than implicit customer archetypes?"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW ground opportunities in personas and scenarios rather than implicit customer archetypes?"
---

## Description

Opportunities in the graph today are framed against an implicit "the user" or "the team." The archetype is a convenience that erases variation: a single opportunity can't distinguish between a senior PM with three stakeholders and twenty years of experience, and a first-time solo founder trying to run their first discovery session. Those are different people with different goals in different contexts. Treating them as one archetype means the opportunity over-generalizes and the ideas that address it lose precision.

The IxD tradition has a long-standing answer: **personas** (named, characterized profiles) and **scenarios** (narrative accounts of a persona pursuing a goal in a specific context). Personas without scenarios are dead — abstract characters doing nothing. Scenarios without personas are ungrounded — actions without an actor. Together they force discovery to commit to *who* and *when* before committing to *what*, which is where most over-generalized opportunities fail.

The opportunity is to make persona, scenario, and user-goal first-class node types in the discovery graph, and to let opportunities link to the personas and scenarios they're grounded in. An opportunity should be able to say "this is for *this persona*, in *this scenario*, pursuing *this goal*" — and if it can't, that's a signal it needs sharpening or splitting into multiple opportunities.

## Evidence

- **Alan Cooper's *The Inmates Are Running the Asylum*** introduced personas explicitly as the antidote to "the user" handwaving. That was 1999. The lesson hasn't stuck in most discovery tools.
- **Kim Goodwin's *Designing for the Digital Age*** treats personas and scenarios as inseparable — the persona is a character, the scenario is a story, and the pairing is where design actually happens.
- **This repo's own backlog demonstrates the gap.** Look at any existing opportunity — they all say "PMs," "teams," or "users" in the abstract. None of them commit to a specific persona or scenario. The language is a tell.
- **CDH (Teresa Torres) uses interview-sourced opportunities** that implicitly ground in real customers, but the graph that results still loses the link between the opportunity and the specific customer context that surfaced it. The discovery gets flattened on the way into the tool.

## Where this sits in the discovery rhythm

Grounding in personas and scenarios is a **convergent** commitment — it narrows an abstract "the user" into a specific actor in a specific situation. But the personas and scenarios themselves come from divergent research activity: interviews, observations, field notes. The artifact is convergent; the raw material that feeds it is divergent. See `support-divergent-convergent-rhythm-of-discovery`.

## Related opportunities

- **Parent concept:** `no-process-guidance-in-discovery-tools` — the general "tool doesn't guide the thinking" gap. This opportunity specializes it to the IxD primitive layer.
- **Adjacent (raw material):** `research-artifacts-first-class-in-graph` — personas should be synthesized from research artifacts, not conjured from imagination. Without the raw material layer, personas become fictional again.
- **Adjacent (synthesis):** `evidence-and-insights-as-first-class-linked-artifacts` — insights about personas should be citable and reusable.
- **Sibling (rhythm):** `support-divergent-convergent-rhythm-of-discovery` — this opportunity is one commitment-point in the broader rhythm.
