---
name: "Evolve agent execution without lock-in or quality regression"
type: opportunity
status: active
supports:
  - compound-a-quality-advantage-from-usage
hmw: "HMW freely change how Etak's agents execute their tasks — across models, prompts, context, and design — as both the model market and our own understanding evolve, without locking ourselves into any one technology and without regressing the quality customers already trust?"
---

## Description

Etak's value to customers comes from agents that perform specific, well-defined product-development tasks well — drafting a story, writing a test plan, critiquing an opportunity, breaking down a project. The way each of those tasks gets executed today is a bundle of choices: which model is called, what prompt is used, how much context is loaded, how the agent's output is parsed and validated. Today those choices are largely implicit, made once when the task was first built, and frozen in code.

The world around those choices is not frozen. New models ship every few months. Prices for equivalent capability drop in step changes. Smaller, cheaper, task-specific models close the gap on narrow workloads. Etak's own understanding of what works for a given task improves as more customers use the product and more telemetry accumulates. A product whose execution choices are baked in cannot respond to any of this — it stays where it started until somebody pays the cost of a manual rewrite, and even then has no rigorous way to know whether the rewrite was an improvement.

The opportunity is to put Etak in a position where execution choices are *fluid*: where the team can change how a task is executed — try a new model, a different prompt, more or less context, a redesigned agent, a different decomposition into sub-steps — as a routine, low-risk activity rather than a project. And where doing so doesn't put customer-perceived quality at risk, because changes can be tested in a way that catches regressions before the customer feels them.

This matters for three intertwined reasons:

- **Cost discipline.** The cost-per-task gap between frontier models and cheaper alternatives is large and widening for many task types. Etak's margins depend on routinely asking *is the cheapest sufficient option still sufficient?* — which is only possible if changing the answer is cheap.
- **Quality compounding.** Etak's defensibility (per the parent objective) comes from learning what works and shipping that knowledge into the product. That loop only closes if "shipping the knowledge" means "changing how the agent runs" — which has to be a routine action, not an event.
- **Avoiding strategic lock-in.** The model vendor landscape will keep moving. Etak shouldn't be in a position where moving with it requires a multi-week porting project, and shouldn't be in a position where any one vendor's pricing or policy changes can hold the product hostage.

What makes this hard is the *quality regression* clause. Making it technically easy to change agent execution without making it easy to *know whether the change was good* is a footgun — it accelerates Etak's ability to break things. Real progress on this opportunity requires that the freedom to change is paired with the ability to detect, before customers feel it, whether a change actually performed as well or better than what it replaced. That hands off naturally to the sibling opportunities about content-free quality measurement and safe production experimentation.

## Potential Directions

These are illustrative sketches, not commitments. The point of the opportunity layer is to keep the solution space open; the idea-level work should explore which of these (or others) is the right bet.

- A configuration layer that lets a single agent task be backed by different models, prompts, or context strategies depending on routing rules.
- A registry of task-specific agents that Etak's team can author, version, and swap out independently of each other.
- Per-task evaluation suites that can be re-run against any candidate configuration before it is released.
- Per-customer or per-cohort routing so that changes can be rolled out gradually and observed in production.
- Tooling that lets Etak's team express an experiment ("compare agent A vs agent B on this task across this cohort") declaratively rather than building each one from scratch.

The opportunity itself is the freedom-with-safety described above; which combination of these (or other) directions Etak ends up pursuing is something the idea-level work should figure out.

## Evidence

- The vendor landscape has already shifted twice in the lifetime of most current AI products. Teams that built tightly to one vendor's SDK have repeatedly found themselves blocked when a better or cheaper option appeared.
- Cost differences between frontier models and cheaper alternatives for the same task are now routinely 10x or more. Volume amplifies that into a structural margin difference.
- The parent objective explicitly names execution flexibility as one of three required conditions for the learning loop. If this opportunity doesn't get solved, the experimentation infrastructure built on top of it has nothing to vary.
- Some enterprise customers have policies about which model providers they will send data to, or contractual relationships with specific providers. A product that can be configured to honor those preferences is easier to sell into that segment.

## Who Experiences This

- **Etak's product and engineering team** — who today have no rigorous, low-risk way to evolve how an agent task is executed once it has shipped. This is the population whose problem the opportunity solves.
- **Customers** — indirectly. They benefit through a product that gets cheaper or better over time, and through agents that don't suddenly regress when Etak experiments. They never see the underlying mechanism.
- **Enterprise buyers with model preferences** — a smaller but real population whose procurement constraints become satisfiable if execution choices are fluid enough to honor them.
