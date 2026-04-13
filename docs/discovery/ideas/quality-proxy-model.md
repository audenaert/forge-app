---
name: "Quality proxy model"
type: idea
status: draft
addresses:
  - measure-agent-quality-without-seeing-content
delivered_by: null
---

## Description

A defined model that takes the content-free telemetry events from idea C and turns them into usable "how good was that agent run" signals that Etak's team (and, eventually, the experimentation harness) can make decisions from. The model is not a single number. It is a structured set of named proxies, each with its own definition, its own confidence characteristics, and its own known relationship to the underlying thing we actually care about — customer-perceived quality.

The events tell Etak what happened. The quality proxy model tells Etak what the events *mean*. Without it, every analysis would have to reinvent the mapping from raw events to "was this good" — and would do it inconsistently, with different analyses arriving at different answers for the same data.

The model is defined per task type. "Good" for a story-drafting agent is not the same as "good" for a test-plan agent, and a single universal quality score would wash out the differences that actually matter. Each task type has its own *quality profile* — a weighted combination of the available proxies, calibrated against that task's ground truth, with its own known failure modes.

Broadly, the proxies fall into four families, each of which carries different signal and different risks:

- **Completion proxies.** Did the run finish? Did it return a well-formed result? How many tool calls did it take (versus the expected range)? How many retries did the agent self-trigger? High values here are negative signal: the agent struggled.
- **User reaction proxies.** Did the customer accept the output without edits, accept with edits, reject it, regenerate, or abandon the flow? How long between output and the customer's next action? Fast accepts are positive signal; fast rejects are negative; long pauses followed by accept are ambiguous and worth treating separately.
- **Survival proxies.** 24 hours later, 7 days later, 30 days later — does the artifact the agent produced still exist? Has it been linked to other artifacts (a sign it's load-bearing)? Has it been referenced in other work? Has it been deleted or replaced? Survival is the closest Etak gets to measuring *value* as opposed to *satisfaction*, because it's the signal that emerges after the customer has had time to actually use the thing.
- **Negative proxies.** Guardrail trips, errors, timeouts, rolled-back experiments. These aren't measurements of quality; they're measurements of *failure*, and they should suppress any positive signal the other proxies might produce for the same run.

Each proxy is computed as a rolling metric over a cohort — "accept rate per config hash per week," "median edit distance at accept per task per day," "7-day survival rate per agent version." The quality profile for a task is a weighted, bounded combination of these rolling metrics, where the weights come from calibration against ground truth.

## Strategic Rationale

The model is the bridge between *data* and *decisions*. Without it:

- **The experimentation harness has no scoring function.** The harness can route traffic and collect events, but "which variant won" is a question the harness can't answer on its own — it needs a quality profile to score against.
- **Every analysis is bespoke.** Without a defined model, every time the team wants to ask "is config B better than config A," the team reinvents the metric. Two analyses run a week apart disagree about what "better" means, and the decisions built on them are incoherent.
- **Proxies drift silently.** Any proxy that Etak relies on will eventually stop correlating with reality — a UI change makes a fast-accept signal meaningless, a new agent class breaks the assumptions the proxy was calibrated against. If the proxy isn't defined as a first-class artifact with its own validation story, the drift happens invisibly and decisions get worse without anyone noticing.
- **Ground truth can't be grounded.** The whole point of a proxy is that it stands in for something you can't directly observe. That only works if you periodically *validate* the stand-in against the thing it's supposed to represent. The model is where that validation lives.

There's also a less obvious rationale: the quality profile forces the team to make explicit decisions about what Etak considers "good." Weight survival more than accept rate, and you're saying you'd rather customers build things that last than build things that feel slick. Weight edit-distance low, and you're saying you'd rather the agent produce output the customer keeps as-is than output the customer improves. These are product decisions, not math, and making them explicit at the proxy layer forces them to be made deliberately instead of by accident.

## How It Could Work

- **A typed quality profile per task.** Each task tag in the gateway has an associated profile: a named set of proxies, a weighting function, and a declared confidence interval. Profiles are versioned and committed like any other product artifact.
- **Rolling metrics computed in the warehouse.** The warehouse (per idea C) stores raw events. A set of defined views computes the per-cohort rolling metrics — accept rates, edit rates, survival rates, negative-proxy rates — on some cadence (hourly, daily). Profiles read from these views.
- **Scores are bounded and include uncertainty.** A profile score is not "7.3." It is "7.3 ± 1.1 on a 0–10 scale, based on 142 runs, confidence interval high." The uncertainty is part of the score, not a footnote. Analyses that ignore the uncertainty are how teams convince themselves that small sample noise is real signal.
- **Ground-truth calibration is a recurring commitment.** Periodically — monthly, quarterly, whatever cadence makes sense — Etak runs a calibration study: a small sample of runs is evaluated by humans (ideally the customers themselves, opt-in, compensated) against the full content. The humans' ratings are joined to the proxies those runs produced, and the model's weights are updated based on the correlation that actually held up. If a proxy's correlation decays, it gets downweighted or removed. If a new proxy correlates, it gets added.
- **The model is conservative about new tasks.** When a new task tag shows up, the default profile is a minimal structural score (did it finish? did the customer accept it?) with high uncertainty, until enough data accumulates to calibrate a proper profile. Overconfident scoring on thin data is worse than no scoring.
- **The model is aware of heterogeneity.** Some customers edit everything; some accept everything. Some tasks are one-shot; others are iterative. The proxies are normalized against reasonable baselines so that a heavy-editor customer doesn't make every agent look bad for them, and a one-click accepter doesn't make every agent look good. Baselines are part of the profile definition.
- **Drift detection is automated.** Each proxy's correlation with ground truth is tracked over time. A proxy that was reliable and becomes unreliable triggers an alert, not a silent failure. This matters because the alternative — noticing drift during a quarterly review — has already meant months of decisions being made against a broken signal.

## Why This Could Work

- Every mature ML product team eventually converges on something structurally like this. Anthropic, OpenAI, GitHub Copilot, and Cursor all run versions of it — implicit or explicit, informal or formal. Etak doing it deliberately and from the start is not inventing something new; it is picking up a known pattern before the alternative (ad-hoc metrics diverging from ground truth) has a chance to take root.
- The model is just a function over the events the schema already defines. If idea C is solid, the cost of implementing idea D is mostly math, definitions, and discipline — not new infrastructure.
- Ground-truth calibration is tractable because Etak's customers are, mostly, people who care about the output quality and would reasonably agree to periodically rate a few runs in exchange for a small discount, early access, or just visibility into how Etak is using their feedback. The calibration program is itself a relationship, not a survey.

## Open Questions

- **Where is the line between signal and noise on edit-then-accept?** A customer who edits 5% of the output before accepting is probably polishing; a customer who edits 60% is probably fixing something that was wrong. The correlation between edit distance and quality is not linear and may not even be monotonic. Figuring out the curve is part of the calibration problem.
- **How does the model handle correlated proxies?** Accept rate, edit distance, and survival are not independent — they covary in complex ways, and a naive weighted sum double-counts signal. A principled model needs to account for correlation, which makes the weighting function more than "pick numbers."
- **What's the smallest cohort size where a score is meaningful?** Below some threshold, the uncertainty bars are larger than the range of plausible differences between variants, and the score is useless. The profile needs to know this threshold and refuse to score below it, rather than producing noisy nonsense.
- **How do we handle tasks where the customer never sees the output?** Some agents run in the background — an OST indexer, a periodic consistency check. They have completion proxies but no user reaction proxies. The model needs a path for tasks that are structurally different in this way.
- **How do we ground-truth the customer ratings themselves?** If the calibration study relies on customers rating their own runs, customers may rate differently than a neutral expert would — they may be biased by having invested time in producing the prompt, or by having already accepted the output. Some form of cross-rating or inter-rater calibration may be necessary.
- **What happens when a proxy is gamed?** Any proxy Etak optimizes against is a proxy that agents can be tuned to optimize for, sometimes in ways that look good on the score but are bad for customers. This is Goodhart's Law in action and it will happen. The model needs to include adversarial thinking — which proxies are most gameable, which are most robust, and how the team notices when optimization has drifted into gaming.
- **Who owns the weights?** Tuning the weights is part product decision, part statistical exercise. Does this live with the product team, the research team, or somewhere else? Whoever owns it owns a lot of de facto power over Etak's direction.
- **How does the model interact with the gap-capture loop?** Human-articulated gaps (opportunity #5, idea H) are another kind of quality signal — one that proxies can't produce. Does the quality profile incorporate "a human flagged this" as a negative signal, and if so with what weight? This is the point where the behavioral and articulated learning tributaries could join up, if we choose to let them.
