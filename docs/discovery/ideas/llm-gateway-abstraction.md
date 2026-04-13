---
name: "LLM gateway abstraction"
type: idea
status: draft
addresses:
  - evolve-agent-execution-without-lock-in
  - run-safe-experiments-on-live-customers
delivered_by: null
---

## Description

A single layer that sits between all of Etak's agents and any specific LLM provider API. Every model call any agent makes — chat completions, tool-use loops, structured outputs, embeddings — goes through the gateway. The agent tells the gateway *what kind of call it needs and for what task*; the gateway decides *which provider, which model, which config, with which tags* and executes it.

Today, if an agent wants to call Claude, it constructs an Anthropic SDK client and calls it directly. The model, provider, system prompt defaults, retry behavior, and timeout settings live inside the agent's own code. Changing any of them means editing the agent. There is no shared place to enforce telemetry, handle cost accounting, route experimentally, or swap providers. Every agent has reinvented the same wheel with slightly different choices.

With the gateway, an agent call looks more like:

```
const result = await etakLLM.complete({
  task: "draft-story",              // what the agent is doing
  messages: [...],                  // the conversation
  tools: [...],                     // tool definitions if needed
  schema: storySchema,              // structured output if needed
  context: { customerId, sessionId, agentVersion },
});
```

Everything else — which provider, which model, which system prompt scaffolding, which experimental config applies to this customer right now, which telemetry events get emitted, how retries and fallbacks work — is the gateway's job. The agent doesn't know or care.

## Strategic Rationale

The gateway is the one piece of infrastructure that unlocks almost every other idea in this set. Without it:

- **The experimentation harness has nothing to vary.** You can't route 10% of traffic to a candidate config if the config is hardcoded inside each agent.
- **The telemetry schema can't be enforced.** If each agent makes its own API calls, each agent emits (or fails to emit) its own events. A schema that isn't the only path through is a suggestion, not a contract.
- **Provider swaps remain multi-week projects.** Each agent has to be individually ported. The exact problem the objective says must stop being expensive.
- **Cost accounting stays per-agent-team-guesswork.** Nobody can answer "what did we spend on task T last month across all agents" without instrumenting every call site.

The gateway is also the one piece that makes the *quality* clause of the execution-flexibility opportunity possible: it's where guardrails (latency thresholds, error rate thresholds, cost ceilings) can be enforced automatically, with automatic rollback to a known-good config if a live variant misbehaves. That kind of safety can't live inside individual agents; it has to live in the thing all agents share.

This is a classic "thin waist" architecture move — concentrate the variation point at one layer and let everything above and below it stay simple. The cost of building it is a one-time investment; the cost of *not* building it grows linearly with every new agent and every new experiment.

## How It Could Work

Some shape choices that seem roughly right, but none of them are committed until the idea is validated:

- **Interface is task-oriented, not model-oriented.** Agents describe the *task* (a tag like `draft-story` or `critique-opportunity`) rather than the model. Routing decisions — which model, which prompt scaffolding, which experiment cohort — are looked up from the task tag plus the call context (customer, session, agent version).
- **Routing config is data, not code.** The mapping from (task, context) to (provider, model, prompt, parameters) lives in a routing table that can be updated without redeploying. This is what lets the experimentation harness change behavior without a code push.
- **Telemetry is not optional.** Every gateway call emits a structured event (schema covered by idea C) with tags for task, agent, config hash, experiment cohort, and outcome. Agents cannot opt out. If the gateway is the only path, the telemetry contract is enforced by construction.
- **Provider quirks are translated at the gateway boundary.** When provider X uses one tool-call format and provider Y uses another, the gateway normalizes to a single internal shape. Agents see a stable interface. Features that are genuinely provider-specific (prompt caching, provider-only tools, structured output enforcement) are exposed through explicit, named capability flags, so the agent opts in knowing what it's opting into.
- **Guardrails are enforced centrally.** Per-task guardrails (max latency, max cost, expected output shape) are declared in the routing config. The gateway enforces them and triggers rollback or fallback behavior on violation. This is where the customer-level safety bar from the experimentation opportunity gets operationalized.
- **Streaming is first-class.** Most interesting agent work streams. The gateway has to handle streaming without losing the telemetry and routing benefits — streaming events still need to be counted, timed, and tagged.
- **Fallbacks are explicit.** When a provider errors or a guardrail trips, the gateway can fall back to a designated safe variant. This is not "retry the same call" — it's "serve the customer the known-good version while logging the failure."

## Why This Could Work

- Several existing libraries (LiteLLM, LangChain, Portkey, Helicone) are in the neighborhood of this problem and can be studied (or used) to shortcut parts of the build. None of them quite match Etak's shape — they're mostly provider adapters without the experimentation and telemetry concerns — but they establish that the general direction is tractable.
- The abstraction is natural once you've decided you're going to have experimentation and content-free telemetry at all. Building both of those *without* a gateway means reinventing the same seams in every agent; building the gateway first gives you one place to add them.
- Etak's set of agent tasks is structured (draft story, critique opportunity, plan tests, break down a project, etc.) rather than open-ended. That structure makes task-oriented routing feasible — the task tags are a finite enumerable set that can be managed centrally, not a per-call free-for-all.

## Open Questions

- **Build vs. adopt.** Do we build the gateway from scratch, build on top of LiteLLM or Portkey, or start with a lighter wrapper and grow it? The experimentation and telemetry requirements are the hardest part; existing libraries mostly solve the easier parts (provider adapters). A hybrid — use an existing library for provider adaption, build the routing and telemetry layer ourselves — may be the right answer.
- **How much intelligence belongs in the gateway?** At one extreme, it's a dumb routing and translation layer; at the other, it handles retries, fallbacks, cost budgeting, caching, and guardrails. Starting dumb and adding is safer than starting smart and regretting, but the boundary matters because things that are *not* in the gateway end up reinvented in agents.
- **Streaming economics.** Streaming makes telemetry harder (when is the "run" done?), routing harder (can you switch providers mid-stream if the first one fails?), and guardrails harder (when do you decide to trip a latency guardrail on a slow-streaming response?). These are solvable but they shape the gateway's interface.
- **Customer-facing cost attribution.** If customers pay for usage, the gateway is where cost is known. Is the gateway responsible for attributing cost to customer sessions, or does it just emit the signals and some other system attributes? The answer affects how much billing logic ends up in the gateway.
- **Prompt ownership.** When prompts are part of the routing config (so they can be varied experimentally), who owns them, how are they versioned, and how do agents reason about what they're going to get? This is where "config is data, not code" runs into "prompts are code that shapes behavior" and we have to pick a workable discipline.
- **Customer-preferred-provider routing.** Some enterprise customers may want to specify which provider their data goes to. Does the gateway support per-customer routing policies as a first-class feature from day one, or is that a later addition?
- **How to migrate.** No agents exist yet in the SaaS — they live as skills in the Claude Code plugin today. Does the gateway idea inform how those skills get ported into SaaS agents in the first place, so the migration and the gateway adoption happen together? That seems cleaner than shipping agents-without-gateway and retrofitting later.
