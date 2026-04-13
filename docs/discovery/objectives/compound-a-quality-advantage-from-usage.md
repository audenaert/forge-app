---
name: "Compound a quality advantage from usage"
type: objective
status: active
---

## Description

The underlying LLMs are commoditizing. Within a year or two, every serious product in this space will have access to the same frontier models at similar prices. The thing that won't commoditize is *knowing which agent design, prompt structure, model, and configuration produces the best outcome for a given user task in a given context*. That knowledge only accumulates if Etak is instrumented to learn from its own use — and it has to start early enough that the dataset and the experimentation muscle compound before competitors notice.

This objective is about Etak the SaaS — the product surface where customers have accounts, where Etak hosts data and runs cloud agents, and where the distinctive value lives (collaborative OST development, SDLC support, agent-mediated discovery and design flows). Every SaaS interaction is a chance to learn. Three things have to be true for the loop to work:

1. **The LLM layer is exchangeable.** Agents call models through an abstraction Etak controls, not through a hard dependency on one vendor. Etak can swap providers, route by task, run two configurations side by side, and chase the cost/quality frontier as the market moves.
2. **Etak can tell good from bad without retaining customer content.** Customer prompts, responses, generated artifacts, and code are private by default. Quality and cost are inferred from behavioral and structural signals — task completion, retries, accept/reject/edit actions, latency, tokens, downstream artifact survival — or, where ephemeral content-aware comparison is useful (e.g., shadow execution scoring a candidate variant against production), from processing that does not retain the content beyond the scoring itself. The commitment is that Etak does not retain or train on customer content without consent; it is not that Etak cannot process it.
3. **Experimentation is a first-class capability.** Agent configurations are tagged, traffic is routed between them, and outcomes join back to configs without one-off plumbing. Decisions about which agent or model to ship are made from evidence, not intuition.

The three conditions above are the preconditions for one important tributary of the learning loop: behavioral telemetry feeding agent and model decisions. But the loop is broader than that one tributary. Etak also learns from *human-observed gaps* — moments where someone using the product expected one thing and got another, articulated the gap, and turned it into a framework improvement. Today this happens at the scale of one person dogfooding the plugin against this very project. Tomorrow it has to happen at the scale of thousands of customers, with Etak itself doing more of the noticing, routing, and proposing. And further out, the loop will extend to agents that notice their own regressions and propose fixes for human review. Telemetry is one source of signal; human-observed gaps are another; eventually agent self-observation will be a third. The objective is the *capability* — Etak gets demonstrably better the more it is used — not any one signal stream.

## Customer Data Ownership

Layered on top of the default-private path, an opt-in **data partnership tier** lets customers share their actual content (prompts, responses, code, artifacts) in exchange for a pricing discount. This is the data-rich path that powers deeper model tuning and evaluation work.

Customer data ownership is a core Etak value, not a compliance posture. The principles:

- **Customers own their data.** Etak never retains customer content for its own internal use without explicit, granular consent.
- **If Etak retains it, Etak pays for it.** Customer data has real value to Etak's learning loop. When customers opt in, they get a real pricing discount — it's positioned as *Etak buys your data*, not as a buried clause in a privacy policy.
- **Etak guards the security of shared data.** Encryption, access control, no leakage to third parties, no use of customer ideas to compete with the customer.
- **The default-private path is fully featured.** Customers who never share content still get the full product. Sharing unlocks a discount, not access.

In practice, the InfoSec risk to customers from sharing this kind of data is low — Etak handles it securely and has no interest in their ideas as ideas. But customer *perception* of control matters as much as actual risk, especially in enterprise sales. The only way to earn that trust over time is to make customer ownership a non-negotiable design principle from day one, visible in every feature that touches customer content.

## Target User

Internal — this objective is about Etak's own product and engineering team. The "users" of the learning loop are the people inside Etak deciding which agent designs, prompts, and models to ship next. Customers are upstream of the loop (they generate the signals) and downstream of it (they get better agents over time), but the objective itself is operational: build the muscle.

## Key Result

Etak builds a durable competitive advantage from the data its customers generate and the gaps its users observe — leveraging behavioral signals from the SaaS, opt-in customer content, and human-articulated shortfalls to make the product measurably better with use. As the underlying models commoditize, the moat is the institutional capability of *observing what doesn't work and routing that back into improvements at every layer of the platform*.
