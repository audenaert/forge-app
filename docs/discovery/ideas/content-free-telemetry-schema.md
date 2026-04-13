---
name: "Content-free telemetry event schema"
type: idea
status: draft
addresses:
  - measure-agent-quality-without-seeing-content
  - run-safe-experiments-on-live-customers
delivered_by: null
---

## Description

A defined, versioned, enforced schema of events that Etak emits about agent runs and customer interactions with them — capturing every signal needed for quality measurement and experimentation, and *deliberately* capturing no customer content. The schema is the contract that makes "measure quality without seeing content" real at the code level: not a guideline in a design doc, but the actual shape of the events that get written.

The schema covers three broad categories of signal, each of which the gateway and the agent runtime emit automatically as calls flow through them:

- **Run-level events** — one per agent invocation. Who ran what task, with which agent version and config hash, for which customer and session, against which experiment cohort. Start time, end time, provider, model, input/output token counts, cost in dollars, completion status (success/error/guardrail-tripped/rolled-back), and a content-free structural summary (number of tool calls, number of retries, depth of the tool-call loop).
- **User reaction events** — one per user action on the output of a run. Accept, reject, regenerate, edit-then-accept, abandon-mid-session, time-since-output-to-action. These come from the UI layer and are tied back to the run they're reacting to via run ID.
- **Downstream survival events** — fired on delayed signals that only become knowable after time passes. Did the artifact the agent produced still exist 24 hours later? 7 days later? Was it linked to other artifacts (a load-bearing indicator) or left orphaned? Did the customer come back to it? These are periodic background jobs emitting events that join back to the original run.

Every event carries the same tagging spine: task tag, agent identity, agent version, config hash, experiment cohort, customer ID, session ID, provider, model. This spine is what makes any event useful for joining back to a decision — "did config B accept-rates hold up against config A on task T last week?" is a query against this spine, not a bespoke report.

## Strategic Rationale

The schema is the measurement substrate everything else sits on. Without it:

- **Quality proxies have nothing to measure.** The quality proxy model (idea D) is a function over these events. If the events don't exist, the model is vaporware.
- **Experiments have no way to score themselves.** The experimentation harness (idea E) declares "compare config A to config B" — but "compare" only works if both configs emit the same, well-defined, comparable events.
- **Ad-hoc telemetry inevitably creeps in content.** If each agent defines its own events, some of them will end up including "the prompt that was sent" or "a snippet of the response" because it seemed useful in the moment. A schema that explicitly enumerates what fields exist — and pointedly does not include any content-carrying field — makes the customer data ownership stance *structural* instead of *aspirational*.
- **The learning loop decays over time.** Without a single contract, different events get emitted by different agents with different field names and different semantics, and any analysis has to reconcile the mess. Two years in, the team is debugging "why does task T report different accept rates in dashboard A vs dashboard B" instead of making product decisions. This pattern is visible in most organizations that let telemetry grow organically, and it is avoidable if the schema is the contract from day one.

The schema is also the thing that makes the customer trust story legible under scrutiny. When an enterprise customer's security team asks "what do you capture about our usage?", the answer is "exactly the fields in this schema, and here they are" — not "it depends, let me ask the engineering team." That precision is itself a trust asset.

## How It Could Work

- **The schema is a typed artifact, not a document.** It lives as a set of TypeScript types (or Zod schemas, or a language-agnostic definition like JSON Schema or Protobuf) that the runtime imports and enforces. Emitting an event that doesn't conform is a type error, not a code review comment.
- **Content fields do not exist.** The schema has no `prompt`, no `response`, no `code_snippet`, no `diff`. Not as optional fields that are usually empty — as fields that are *not in the type*. This matters because the absence is verifiable: Etak can point at the schema and say "no field in our event stream has ever held this." An optional field that is "usually null" gives no such guarantee.
- **Every field is explicit about its privacy commitment.** Token counts are fine. Tool call counts are fine. An embedding of the prompt is not fine (it leaks content back out). The schema is annotated so that adding a new field forces a decision about whether it carries content — and whether it should.
- **The schema is versioned.** Events include a schema version. New versions add fields or deprecate old ones explicitly; consumers negotiate against version. This prevents the "we added a field and broke every dashboard" failure mode.
- **Emission is centralized.** The gateway (idea A) is the sole path for agent-run events. The UI layer (wherever it lives) is the sole path for user-reaction events. A background job is the sole path for survival events. Each has a single emitter, so each has a single place to enforce the contract.
- **Events are immutable and append-only.** Once emitted, events are never updated. Corrections are new events that reference the original. This is standard event-sourcing discipline but it matters extra here because experiment analysis depends on being able to trust that yesterday's events are the same today.
- **The transport is boring.** Some queue (Kafka, SQS, Kinesis, or whatever Etak's stack ends up using) into some warehouse (Snowflake, BigQuery, ClickHouse, Postgres-with-timescale). The choice of transport and warehouse are details; the schema is the interesting part. Picking boring technology means the team's energy goes to the schema and the analyses, not to the plumbing.
- **Retention is scoped by category.** Run-level events and reaction events retained for the minimum period needed to compute rolling quality metrics. Aggregated metrics (accept rate per config per week) retained indefinitely. Raw events beyond the retention window are dropped — they're already summarized into the metrics that matter.

## Why This Could Work

- The schema is not speculative. The categories of events — runs, reactions, survival — are the categories that every AI product with a learning loop has ended up with, in some form. Etak is picking them up deliberately rather than evolving into them.
- Defining the schema *before* building the thing that emits against it is cheap. Once agents and UI exist, retrofitting a schema is painful; defining the schema first means each component is built to emit against it from day one.
- Content-free measurement is structurally compatible with the customer data ownership stance. The schema is where that stance gets teeth — it is the mechanism by which "we don't retain your content" becomes something provable, not something promised.

## Open Questions

- **Where is the boundary between "content" and "signal"?** Token count is obviously signal. An embedding of the response is obviously content leaking through a vector. What about "number of code blocks in the response"? "Length of the longest function generated"? "Whether the response contained the word 'test'"? There is a real line here and Etak has to draw it explicitly. The default should be conservative — structural counts yes, keyword flags no — but the specific line needs discussion.
- **How are user reaction events tied to runs?** The UI has to pass the run ID through to reaction events. This sounds simple but gets complicated when reactions happen asynchronously (the user comes back tomorrow and deletes the artifact the agent made yesterday). The run has to be identifiable by something durable.
- **How is "session" defined?** Sessions are a natural unit for joining related runs and reactions, but "session" means different things in different UI flows. Etak needs a session model that works for both real-time interactive flows and long-running background agent tasks.
- **How does experiment cohort get assigned and propagated?** Cohort assignment has to be stable per customer (so they don't flip between variants mid-session) and has to flow through to every event in the session. Where does the assignment happen, and who carries it through the stack?
- **Schema evolution under live experiments.** If an experiment is running when the schema version changes, what happens? Ideally the experiment is scoped to a schema version and old analyses still work; but this needs to be designed in from the start, not patched in later.
- **Derived vs. raw storage.** Do we keep raw events forever, or compute rolling aggregates and drop the raw? The answer affects storage cost and retroactive analysis capability. Probably: keep raw for a short window, aggregate for the long term — but the specifics matter.
- **How do we handle the Claude Code plugin flows?** The plugin is the growth on-ramp, not where the learning loop lives, but customers who use both the plugin and the SaaS are a reasonable population. Does the plugin emit any events into this schema (anonymized? opt-in?), or is it deliberately a telemetry blind spot? The answer should probably be "blind spot by default, with an explicit opt-in channel later if it matters" — but worth calling out.
- **Who can query the warehouse?** This affects both velocity (the team wants to run ad-hoc analyses) and risk (broad query access increases the blast radius if credentials leak). Access control on the warehouse is part of the data ownership story and needs a clear answer before the schema goes live.
