---
name: "Measure agent quality without seeing customer content"
type: opportunity
status: active
supports:
  - compound-a-quality-advantage-from-usage
hmw: "HMW tell whether an agent run was good without reading the prompts, responses, or artifacts the customer worked with?"
---

## Description

The whole learning loop hinges on this: if Etak can't tell good agent runs from bad ones, no amount of experimentation infrastructure helps. And if the only way to tell is to read what the customer wrote, the data ownership stance collapses — every quality measurement becomes a privacy negotiation, and the default-private path stops being a real product.

The opportunity is to build a quality model out of *signals Etak already controls* — the things that happen around the content rather than the content itself. Candidates:

- **Completion structure.** Did the agent finish the task it was asked to do? Did it return without error? How many tool calls did it take? How many retries did the agent itself trigger?
- **User reaction.** Did the customer accept the agent's output? Edit it before accepting? Reject and regenerate? Abandon the flow partway through? How long between output and the customer's next action?
- **Downstream survival.** Does the artifact the agent produced still exist a week later, or did the customer delete it? Did it get linked to other artifacts (a sign it was load-bearing) or stay an orphan?
- **Cost and latency.** Tokens in, tokens out, wall-clock time, dollars. These are not quality on their own, but they're the denominator in every cost-of-quality decision.
- **Session shape.** How long did the customer spend in the flow? Did they switch agents mid-task? Did they come back to the same artifact later?

None of these require reading content. All of them are derivable from the SaaS's own event stream — *if* the SaaS is instrumented to capture them as first-class events from the start, instead of bolting them on later.

The hard part is not collecting the signals. It's defining a quality model that combines them into something Etak can actually make decisions from — and validating that the model correlates with what customers would themselves call "a good agent run." That validation is itself a research problem, and may require periodic, opt-in deeper studies with willing customers to ground-truth the proxies.

## Evidence

- Every mature ML product team eventually builds a quality proxy stack like this — Anthropic, OpenAI, GitHub Copilot, Cursor all rely heavily on accept/reject and edit-distance signals because they scale and don't require reading content. The pattern is well-established; the open question is which proxies map to *Etak's specific tasks* (discovery, design, OST work), not whether proxies work at all.
- The customer data ownership stance (see the parent objective) makes content-free measurement structurally necessary. Any quality story that depends on reading customer prompts or outputs by default would force Etak into a position it has already decided not to take.
- Behavioral proxies are noisier than direct content evaluation. Teams that rely on them have to invest in volume and statistical rigor to pull signal from noise. This means the proxies become more valuable as Etak's customer base grows — another reason to start instrumenting early.

## Who Experiences This

- **Etak's product and engineering team** — who today have no rigorous way to compare agent configurations beyond intuition and small hand-curated evals. This is the population whose problem this opportunity solves.
- **Customers** — indirectly. They benefit when Etak makes better agent decisions, but they never see this opportunity directly. Their only visible interaction with it is the *absence* of quality regressions and the *presence* of agents that get better over time without their content ever being inspected.
- **Enterprise buyers** — for whom "we measure quality without reading your data" is a concrete, demonstrable claim that supports the broader trust posture. The opportunity is a sales asset as well as an internal capability.
