---
name: "Task-agent registry"
type: idea
status: draft
addresses:
  - evolve-agent-execution-without-lock-in
  - run-safe-experiments-on-live-customers
delivered_by: null
---

## Description

A first-class concept in Etak's SaaS of "an agent that performs a specific task" — stored, versioned, and managed through a central registry that the rest of the platform (gateway, experimentation harness, UI, telemetry) reads from. Each entry in the registry is a *task-agent*: a named, versioned, independently-swappable unit that knows how to do one thing.

Concretely, a task-agent includes:

- **Identity.** A task tag (`draft-story`, `critique-opportunity`, `plan-tests`, `break-down-project`), a name, a version, and metadata (author, status, created-at, deprecated-at).
- **Definition.** The prompt scaffolding, tool definitions, expected input schema, expected output schema, any guardrails specific to this agent, and (optionally) imperative logic for agents that do more than a single model call.
- **Routing intent.** The model class the agent expects to run against (via the gateway — the registry does not pick providers), the required capabilities (tool use, structured output, streaming), and any provider restrictions.
- **Quality profile reference.** Which quality profile from idea D applies to this agent's runs. This is how the telemetry, the proxy model, and the agent definition stay in sync.
- **Lifecycle status.** Draft, staged, production, deprecated, retired. Only production agents can be routed to by default; staged agents can be targeted by experiments; draft agents are author-only.

The registry is the *unit of change* for Etak's team. When someone wants to improve how test-planning works, they don't grep through source code for "testPlanningPrompt" — they check out the test-plan task-agent, make a new version, stage it, run an experiment, and promote it if the experiment says it won. The rest of the platform never changes. The agent is the thing that moves.

## Strategic Rationale

The registry is the conceptual primitive that makes execution flexibility *usable*. Without it:

- **"Agents" are implicit.** Agent logic is scattered across whatever file somebody put it in, with no single place to find, audit, or version it. "Which prompt is used for test planning?" becomes an archaeology question. This is the state the Claude Code plugin skills live in today — and it's fine for skills, because the whole skill *is* the unit, but it won't survive the move to a SaaS where agents have internal state, composition, and versioning needs.
- **Experiments can't target anything.** The harness (idea E) declares experiments like "compare task-agent test-plan v3 to v4 on cohort C." Without a registry, there is no "v3" and no "v4" — there's just whatever code was deployed at the time. The harness can't route, can't attribute, can't even talk about what it's varying.
- **There's no path from dogfood to production.** Right now, improvements to the plugin's skills happen by editing files in the plugin repo. That's fine for skills Neal is the only user of. At SaaS scale, improvements need to go through a lifecycle — draft, review, stage, experiment, promote — and that lifecycle needs a unit to attach to. The agent is that unit.
- **Reuse and composition are blocked.** Some tasks are compositions of other tasks: a project breakdown task-agent might call an opportunity critique task-agent as a sub-step. If agents aren't first-class, composition becomes "import a function from another file" — which works but loses the properties (versioning, experimentation, telemetry) that the registry provides. First-class composition means the sub-agent is *also* a task-agent, discovered via the registry, and the whole chain is observable.

There's also a clarity rationale. Etak's product is, at its heart, a set of agents that do specific product-development tasks well. If that set is the core of the product, it should be a first-class concept in the system — not an emergent pattern hiding inside controller methods. Making agents first-class is how the product's structure shows up in the code's structure.

## How It Could Work

- **The registry is backed by the database, not the filesystem.** Task-agents are rows (or documents, or whatever the persistence model ends up being), not files in a directory. This is the difference between the plugin world (filesystem-first, because skills are authored by humans editing markdown) and the SaaS world (database-first, because agents are authored through Etak's own tooling and versioned by the system). The registry still surfaces a filesystem view for local development, but the canonical store is the database.
- **Agents are data-first with a code escape hatch.** The most common shape is pure configuration: a prompt template, a tool list, an input schema, an output schema, a routing tag. These agents can be edited entirely through Etak's authoring tools without a code change. Some agents need imperative logic — a multi-step flow with branching, a tool-use loop with custom termination conditions, composition over multiple sub-agents. Those agents reference a named code module that implements the imperative part, and the registry tracks which module version the agent is bound to. The "all data" and "code-backed" paths coexist rather than being fought over.
- **Versions are immutable.** Once a version of a task-agent is published, it doesn't change. Edits create new versions. This is how experiments can safely reference "version 4" three months after it was created, and how rollback means "go back to version 3" rather than "try to remember what was in version 4 yesterday."
- **Authoring is through the product, not through code review.** Etak's team uses Etak itself to create and edit task-agents — this is the deepest form of dogfooding. The editing UI renders the agent definition, lets the author change prompts and tools, validates against the schema, and runs a quick sanity test before publishing a new version. Git-level access for advanced users stays available but is not the primary path.
- **The registry exposes a discovery API.** Given a task tag, any part of the platform can ask "what's the current production version of this agent?" — and, in an experimental context, "what version should customer X see right now?" The gateway uses this to route; the UI uses this to render; the experimentation harness uses this to define variants; the telemetry schema uses this to tag events.
- **Lifecycle is enforced.** Moving from draft to staged to production requires explicit steps, not just a flag flip. Staging may require that a minimum set of synthetic evals pass. Production promotion may require evidence from an experiment. The path is a product surface, not a policy document.
- **Access control is per-agent.** Some agents are shared across the team; some are authored by specific people or groups. The registry knows who can read, edit, and promote which agents — critical because the ability to change a production agent is, operationally, the ability to change production behavior for every customer who routes to it.
- **Composition is explicit.** A task-agent that calls another task-agent declares the dependency by name and version (or by "latest production"). The registry enforces that cycles don't form and that the referenced agent exists. This is how the learning loop stays legible when agents compose: the chain is visible, the versions are known, and telemetry can attribute outcomes along the chain.
- **Deprecation is a lifecycle event, not a deletion.** When a task-agent is superseded, the old version stays in the registry but is marked deprecated and stops being routed to by default. Its history — what experiments ran on it, what quality profile it had, what it looked like — stays available. The registry is a history, not just a current state.

## Why This Could Work

- First-class "agent" concepts are a pattern that's emerging across every AI platform that has to manage more than one or two agents. LangChain's agents, OpenAI's Assistants API, Anthropic's own skills framework, Vercel AI SDK's agents — all of them make the agent a named, describable, versioned thing. Etak adopting this pattern isn't speculative; it's joining the convergence.
- The existing Claude Code plugin skills are a natural input. Each skill is already a named unit that does a specific task with a specific prompt. The migration path is "take this skill, port its prompt and tool defs into a task-agent, publish version 1." This gives the registry a seed population from day one, rather than requiring agents to be invented from scratch.
- The registry is the piece that makes Etak's "learning at scale is a core capability" positioning concrete. A learning system needs a unit to learn *about*. The task-agent is that unit. Without it, "Etak gets better with use" is a sentiment; with it, "task-agent test-plan has had three experimental wins this quarter, each one promoted and measurable" is a fact.

## Open Questions

- **Where's the boundary between prompt engineering and agent design?** Some task-agents are mostly prompt; some are mostly flow logic. The registry needs to accommodate both without one being a second-class citizen. Do we end up with two registry shapes (data-only and code-backed) or one shape with optional code attachment? Both have costs.
- **How does the registry handle prompts that need to interpolate context?** A task-agent's prompt may depend on customer context ("the customer's current project has N open opportunities..."), runtime state, or user input. The interpolation layer needs to be defined so that prompts-as-data don't turn into prompts-as-templates-as-code-as-dependency-hell.
- **How do experiments compose with versions?** If task-agent `draft-story` has versions v3 (production), v4 (staged), and v5 (draft), and an experiment compares v4 to v3, what happens if someone publishes v5? Does the experiment care? Can a new version interrupt an ongoing experiment? Clarity here prevents a whole class of weird bugs.
- **What's the relationship between the registry and the discovery graph?** Discovery artifacts (opportunities, ideas, assumptions) live in `docs/discovery/` today and will eventually live in the graph-backed store. Task-agents are operational artifacts — should they also live in the graph, or in a separate operational store? There's an argument for one store (everything is a node) and an argument for two (operational vs. discovery have different lifecycle needs). Needs to be resolved before the SaaS architecture solidifies.
- **How is testing integrated?** An agent author wants to sanity-check a new version before publishing. Does the registry run a synthetic eval suite automatically? Offer a "playground mode" where the author can try a prompt on sample inputs? Require tests to pass before promotion? All three are reasonable; picking which is the default shapes the authoring workflow.
- **How does the registry interact with the Claude Code plugin?** If the plugin's skills are the primordial task-agents, and the SaaS is where the registry lives, is there a path from plugin-skills-as-markdown to registry-agents-as-data? Or do the two remain separate artifacts that happen to share DNA? The answer informs how painful the migration is when the SaaS comes online.
- **What does the registry expose to customers?** Enterprise customers may want to audit "which exact version of which agent processed my request, and what was in that agent's definition." Do we expose the registry (or a filtered view of it) to customers? The trust posture probably says yes eventually, but the specifics matter.
- **How do we prevent registry bloat?** Over time, the registry accumulates deprecated versions, experimental variants, and one-off agents. Deletion is dangerous (breaks history); infinite retention is expensive and noisy. Some form of archiving policy is going to be needed — probably not in v1, but before the registry gets big.
