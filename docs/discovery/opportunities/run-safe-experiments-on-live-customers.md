---
name: "Run experiments on live customers without harming them"
type: opportunity
status: active
supports:
  - compound-a-quality-advantage-from-usage
hmw: "HMW compare different ways of running an agent task against real customer workloads — and learn from the comparison with statistical confidence — without any individual customer experiencing the worse variant as a degradation, a surprise, or a betrayal of trust?"
---

## Description

The two sibling opportunities cover the *what* of learning from usage: behavioral signals that don't require reading customer content, and human-articulated gaps captured through deliberate channels. This opportunity covers the *how* of turning those signals into decisions. Specifically: when Etak has two candidate ways of executing the same agent task and wants to know which is better, the answer almost always has to come from running both against real workloads. Curated evals are necessary and useful, but they cannot capture the long tail of how customers actually use the product. Real learning requires real traffic.

The problem is that real traffic means real customers. Every experiment, by definition, involves serving a variant Etak isn't yet confident in to someone whose work depends on the result. And the variant has to run for long enough, on enough customers, to produce a statistically meaningful answer — which means a non-trivial population is exposed to a non-trivial possibility of getting a worse result than they would have. If Etak gets this wrong, the cost is not abstract: it is customers who lost time, customers who lost trust, and customers who churn.

The opportunity is to create a position where Etak can routinely compare candidate configurations against each other on live workloads, learn from the comparison with confidence, and *not damage any individual customer's experience while doing so*. The phrase *any individual* is doing real work in that sentence: it is not enough for the average outcome across the experiment to be neutral or positive. Even an experiment that improves things on average is unacceptable if a meaningful fraction of customers experiences a noticeable regression. The unit Etak owes its safety guarantee to is the individual customer, not the cohort.

What "harm" means here is broader than "the agent produced a worse output." It also includes:

- **Inconsistency.** A customer who got result X yesterday and result Y today for the same kind of task experiences that as the product being unreliable, even if Y is technically better.
- **Latency surprises.** A variant that is qualitatively as good but takes twice as long is a degradation in practice.
- **Cost that gets passed through.** If customers pay by usage and the variant is more expensive, cost is part of harm.
- **Trust erosion.** A customer who later finds out they were silently in an experiment may experience that as a betrayal even if the experiment was harmless. The relationship between *being experimented on* and *consenting to it* is something Etak has to take a position on, not duck.

The other dimension that makes this hard is statistical. Doing this well at small scale (Etak's likely starting condition) means running experiments on small populations where noise dominates signal. Most experiments will be inconclusive. The discipline of *not* over-interpreting an inconclusive result — and not shipping a config because it looked slightly better in 30 sessions — is part of what this opportunity has to build into the practice, not just into the tooling.

The hand-off from the sibling opportunities is direct. *Evolve agent execution without lock-in* is the precondition: Etak must be able to run two variants at all. *Measure agent quality without seeing customer content* is the measurement substrate: experiments need a way to score outcomes. *This* opportunity is what those two enable when combined with discipline about cohorts, consent, and the customer-level safety bar.

## Potential Directions

These are sketches of where the opportunity might lead — not the opportunity itself, and not a commitment to any of them.

- Experiments that route a small fraction of traffic to a candidate variant, with automated rollback if a quality proxy crosses a threshold.
- Per-customer (not just per-request) cohort assignment so no individual experiences inconsistency within a session or across closely-related work.
- Holdout cohorts that never see experimental variants, to provide a stable baseline and a clean comparison group.
- Shadow execution — running the candidate variant alongside the production one but only serving the production result, comparing the two offline for confidence-building before any customer is exposed to the candidate.
- Explicit opt-in for higher-risk experiments, with the customer's awareness and consent as part of the experimental design.
- Statistical guardrails baked into the tooling so experiments cannot be declared "won" before they actually have the power to be conclusive.
- Customer-facing transparency about the fact that Etak runs experiments at all, and what its safety commitments are, so the relationship is honest from the start rather than retroactively.

## Evidence

- Every mature product organization that runs experiments at scale has had to learn some version of these lessons the hard way — typically after an incident where an "average positive" experiment harmed a vocal minority of users badly enough to make the news. The patterns (cohort stability, automatic rollback, statistical discipline, holdouts) are well-established; the open question for Etak is how to bring them in early enough that the muscle is built before the volume is large.
- The combination of small initial customer base and high per-customer stakes (Etak's customers are doing real product-development work) makes Etak's experimentation problem *harder* than the canonical web-scale A/B testing case, not easier. Lower volume means longer experiments and noisier results; higher stakes means a smaller acceptable harm budget.
- The customer data ownership stance (parent objective) shapes this opportunity: experiments cannot rely on inspecting customer content to evaluate variants, so the experimental scoring has to use the same content-free quality proxies as the rest of the learning loop. This is a constraint, but also a forcing function for solving the measurement problem properly.
- Anti-evidence to take seriously: many companies have built sophisticated experimentation platforms and *still* shipped harmful experiments because the tooling outran the discipline. The opportunity is not solved by infrastructure alone; the practice around it matters as much as the mechanism.

## Who Experiences This

- **Etak's team** — who need to be able to make agent and configuration decisions from real-world evidence, and who today have no path to doing so that meets the objective's customer safety bar.
- **Customers** — who are the population whose experience the safety guarantee protects. They benefit from a product that improves through real-world learning; they are also the ones who pay the price if experimentation is done badly.
- **Customers in opt-in higher-risk experiments** — a special case. There may be customers (likely design partners or power users) who actively want to be part of more experimental cohorts in exchange for closer access to upcoming improvements. The opportunity should leave room for this group without making it the default for everyone.
- **Enterprise buyers** — for whom "we run experiments responsibly and here is exactly what that means" is part of the trust posture, and for whom *quietly experimenting on production traffic without disclosure* would be a procurement-blocking issue.
