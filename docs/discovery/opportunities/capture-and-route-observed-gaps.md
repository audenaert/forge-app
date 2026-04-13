---
name: "Capture and route observed gaps into framework improvements"
type: opportunity
status: active
supports:
  - compound-a-quality-advantage-from-usage
hmw: "HMW ensure that every gap between what someone expected from Etak and what they got is captured, routed to the right part of the framework, and turned into a concrete improvement — at every scale from one person dogfooding to thousands of customers using the SaaS in production?"
---

## Description

There are two ways Etak can learn that something isn't working. The first is behavioral and statistical: telemetry shows that customers are retrying more often, abandoning a flow earlier, editing outputs more heavily. Sibling opportunities cover that path. The second is direct and articulated: someone using Etak notices that what they got isn't what they expected, can put the gap into words, and *that articulation itself is a learning signal*. This opportunity is about the second path.

Right now, this loop is running at the scale of one person — Neal, dogfooding the plugin against this project. The loop looks like:

1. Use a skill (or agent, or workflow).
2. Notice that the outcome falls short of what was expected.
3. Articulate the gap in conversation.
4. Capture the gap somewhere durable so it doesn't get lost.
5. Improve the relevant skill, prompt, agent, or config.
6. Next interaction is better.

This loop *works*. It is producing real improvements right now. But it works because the person running it is also the person building the product and the person responsible for capturing the gap — three roles in one head, with no friction between them. None of those alignments survive contact with thousands of customers using a SaaS product. At scale, the person who notices the gap is not the person who can fix it, doesn't know where the gap should be routed, and has no incentive to write it up in a way that makes it actionable. Most observed gaps will simply be lost — turning into churn, low NPS, or word-of-mouth complaints — unless Etak builds a way to catch them.

The opportunity is to design Etak so that the *human-observed-gap loop scales*. Concretely, that means:

- It is **easy** for someone using the product to flag that something was off, in the moment, without leaving the flow they're in.
- The flag captures **enough context** to be actionable later — what the person was trying to do, what happened, what they expected — without requiring them to write a bug report.
- Captured gaps are **routed** to the right part of the framework: a skill, an agent, a prompt, a config, a model choice, a docs gap, a UX flow, or a genuinely new thing nobody anticipated.
- The team (or, eventually, the system itself) can **see patterns** across captured gaps — "twelve customers have flagged the same kind of shortfall in the test-planning flow this month" is a different kind of signal than telemetry can produce, and points at something specific to fix.
- The loop **closes**: the person who flagged the gap eventually finds out (or just experiences) that something was done about it. Without closure, the incentive to flag the next gap erodes.

This opportunity sits in deliberate tension with frictionless UX: every flag mechanism is, by definition, asking the user to do extra work in the middle of getting their actual job done. Solving the opportunity well means making that ask feel small, valuable, and respected — not extracting feedback for its own sake.

## Relationship to Sibling Opportunities

This is the *human-articulated* tributary of the broader learning capability. The behavioral and statistical tributary is covered by `measure-agent-quality-without-seeing-content` and `run-safe-experiments-on-live-customers`. The two are complementary: telemetry catches what users wouldn't think to mention (subtle drift in completion rates); human-observed gaps catch what telemetry can't see (the user knows the output was wrong even though they accepted it because they didn't have time to fight with it). A learning system that has only one of the two is half-blind.

## Evidence

- Every successful developer-tool company that publishes about their learning practices describes some version of this: GitHub's user research feeding Copilot, Linear's customer-direct-feedback culture, Cursor's tight loop with power users. None of them rely on telemetry alone.
- The dogfood loop running on this very project is itself evidence: in the last hour, three improvements to the framework (memory captures, a skill-refinement backlog, a sharper opportunity-framing principle) have been made on the strength of human-observed gaps that no telemetry could have surfaced.
- Anti-evidence: most products that try to solve this end up with feedback widgets that nobody clicks, or bug-report flows so heavy that only the most motivated users complete them. The mechanism design is hard, and the failure mode is "we built it and nobody used it."
- The asymmetry between dogfood-scale and at-scale is large enough that the design Etak builds for this needs to be informed by *thinking about scale from the start* — even though the only customer today is Neal. Designing for one person and hoping it generalizes is the path to a feedback widget nobody clicks.

## Who Experiences This

- **Etak's team** — who today have no systematic way to catch gaps observed by anyone other than the person currently using the product. At scale this is the dominant concern; if customer-observed gaps don't reach the team, the team is flying blind on a whole class of signals.
- **Customers** — who experience an Etak that either gets noticeably better at the things they cared enough to flag (good outcome) or feels static and unresponsive to their feedback (bad outcome). The opportunity directly shapes which of those they get.
- **Power users and design partners** — a special case worth naming. Early customers of any product have disproportionately high willingness to articulate gaps, *if* they believe the team will act on them. The mechanism Etak builds here will either harvest that willingness or squander it. Squandering it is one of the most expensive mistakes an early-stage product can make.
