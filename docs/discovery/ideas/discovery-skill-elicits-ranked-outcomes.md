---
name: "Discovery skill elicits ranked candidate outcomes in bottom-up mode"
type: idea
status: draft
addresses:
  - no-process-guidance-in-discovery-tools
  - support-divergent-convergent-rhythm-of-discovery
delivered_by: null
---

## Description

When a user enters the discovery skill in bottom-up mode (describing an idea without first specifying the opportunity or objective it serves), the skill should notice that the user has given a *solution framing* and respond with a structured elicitation: generate 3–5 candidate *outcomes* the idea might serve, offer them to the user, and ask the user to rank them.

The ranking is the value-adding move. Asking "what need does this address?" in the abstract produces weak answers because the user hasn't thought about it in those terms yet. Offering candidate outcomes gives the user something to react against. Asking for an ordering — not just a selection — forces the user to commit to a priority, which surfaces the hidden signal that neither an open question nor a multi-select would have produced.

The ranking then drives two downstream moves:

1. **Opportunity linking.** The top-ranked outcome is used to search for existing opportunities, propose new ones, or reframe a weak existing match. Lower-ranked outcomes might still be relevant and are captured as secondary links.
2. **Idea body structure.** The ranked outcomes get written into the idea body in order, so the resulting artifact leads with the priority the user committed to instead of presenting a flat list.

## How a user experiences it

1. User: *"I want to build a prioritization feature that scores ideas across multiple dimensions and gathers stakeholder input."*
2. Skill: *"That reads as a solution framing. Here are four outcomes I see this might serve — which order would you rank them in?"*
   - PMs prioritize confidently with evidence rather than argument
   - Multiple voices get weighted properly (not just the loudest in the room)
   - Prioritization decisions become traceable and auditable
   - Stakeholder input gathering is more structured
3. User ranks them: *"2, 3, 4, 1."*
4. Skill: searches for opportunities matching the top outcome. Finds one partial match, proposes reframing it, and identifies a sibling gap not currently in the backlog.
5. Skill writes the idea artifact with the ranked outcomes driving the structure of "Why this could work."

## Why this could work

This is not hypothetical — the whole session that produced this idea ran exactly this pattern. I offered four candidate outcomes, the user ranked them, and the ranking surfaced "multiple voices weighted properly" as the top priority. That was not the outcome I would have guessed first, and asking "what need does this address?" would not have revealed it. The ranking move made the user's actual mental model visible in a way an open question couldn't.

The deeper reason it works is that it rehearses the macro diverge→converge rhythm at micro scale within a single interaction turn. The candidate-generation step is divergent (opening the space of possible framings); the ranking step is convergent (committing to a priority). This is a fractal instance of `support-divergent-convergent-rhythm-of-discovery` — the same rhythm the opportunity describes, expressed inside a single user turn. A skill that internalizes this pattern is a worked example of the macro opportunity.

## What makes it different

- **Not "ask what need this addresses."** That's a single-step open question with no scaffolding. This pattern uses multi-candidate + ranking to force commitment.
- **Not a multi-select.** Multi-select ("check all that apply") loses the priority signal that ranking captures. The ordering is the payload.
- **Not AI-choosing.** The skill generates candidates but the user ranks. The value is in extracting the user's priority, not in the skill's guess.
- **Orthogonal to the idea's domain content.** This is a skill behavior — an interview move — not a new node type or a new artifact structure.

## Open questions

- **When to skip.** If the user has already specified an outcome in their initial framing, should the skill skip the elicitation? Probably yes — don't make the ritual mandatory when it isn't informative. But the threshold is worth thinking about (a user who says "I want X to help users do Y" has given an outcome, but is Y specific enough to skip?).
- **Candidate count.** 3–5 feels right. Fewer and the ranking is trivial ("obviously A over B"). More and the user balks at the cognitive load. But the right number probably varies with the domain and the user's familiarity.
- **Candidate generation.** How does the skill come up with good candidates? Pattern-matching against the existing opportunity space is part of it. Proposing generalizations of the user's solution is another. But "good" candidates have a quality bar — bad candidates waste the user's time and degrade trust in the pattern.
- **Handling reframing.** If the user rejects all candidates and writes their own, should the rejected candidates be recorded as signal? (They might be — "these are outcomes the user explicitly did not value" is data.)
- **Fractal application.** Does this pattern apply beyond bottom-up idea entry? Could it apply to opportunity framing? Experiment design? Persona selection? The divergent-then-rank move is generic — the skill might use it in several places.
