---
name: "Customers accept ephemeral processing as categorically different from retention"
type: assumption
status: untested
importance: high
evidence: low
assumed_by:
  - shadow-execution-runner
---

## Description

Etak's data ownership stance draws a line between *ephemeral processing* of customer content (running it through multiple agents, models, judges, or comparisons for the purpose of producing or evaluating an output) and *retention or training* (persisting content beyond the immediate session, or using it to shape models for future use). Etak's position is that ephemeral processing is unrestricted by default; the privacy surface is retention and training.

This assumption is that customers — especially enterprise buyers and security-conscious developers — will accept this distinction when they encounter it. That they will read "we process your content to produce outputs, including by running candidates and comparing them, but we don't retain it or train on it without your consent" as a reasonable and defensible position, rather than as a loophole or a fig leaf.

If the assumption holds, shadow execution (and other ideas that rely on ephemeral content-aware analysis — LLM judges, comparison-based quality scoring, multi-candidate production agents that pick the best output) are unblocked and genuinely useful. If it doesn't hold — if a meaningful fraction of customers reject the distinction and require a stricter "our content is never processed by anything except the production agent" guarantee — then those ideas have to be restricted, and Etak's ability to learn from real workloads is substantially reduced.

## Why This Matters

- **Shadow execution depends on it directly.** Without the ephemeral-processing carve-out, shadow mode either can't run content-aware comparisons at all (making it much weaker as a signal source) or requires opt-in per customer (making it unavailable for most traffic).
- **LLM-as-judge approaches depend on it.** Many of the most useful quality measurements for AI systems involve asking one model to evaluate another model's output. If that kind of processing is categorically off-limits, large swaths of the learning loop become unworkable.
- **Production agents with internal candidate selection depend on it.** An agent that internally drafts three options and picks the best does so by processing all three. This pattern is increasingly common in high-quality agent designs. If customers reject the distinction, this design pattern is off the table too.
- **It shapes how Etak talks about privacy generally.** If the assumption holds, Etak can frame its privacy story as "we don't retain, we don't train" — clean, defensible, and compatible with deep learning loop capabilities. If it doesn't, Etak has to frame it as "we don't process," which is a stronger commitment that forecloses a lot of product design space.

## What We Know (or Don't)

- **Reasoning in favor.** The distinction is the one that matters from an actual privacy-risk standpoint: the harm customers fear from data-sharing is almost always about retention (their data leaks, their data ends up in a model that someone else queries) or training (their IP shapes a model that competes with them). Ephemeral processing during the production of their own output is the same thing they're already paying Etak to do. Framed this way, the distinction is not a loophole — it's a precise description of where the risk actually lives.
- **Reasoning against.** Some customers — especially in regulated industries, or with strong absolute positions on data sovereignty — don't draw this line cleanly. For them, "our data is processed by a judge model" and "our data is sent to a judge model for evaluation purposes" feel materially different from "our production agent runs," even if the technical reality is the same. These customers may require a stricter guarantee that doesn't differentiate.
- **No direct customer research yet.** Etak has not yet asked any real customer how they feel about this distinction. The position is based on reasoning about the actual privacy risk surface, not on validated customer sentiment. That is the specific gap this assumption exists to call out.
- **Analogies from adjacent products.** Most AI products today process customer content through multiple components without explicit per-component consent (tool-use loops, retrieval augmentation, safety classifiers, etc.). The market has broadly accepted this, at least for now. That is weak positive evidence that the distinction Etak is drawing is defensible. But "broadly accepted" is not "universally accepted," and Etak's positioning aims at the enterprise segment where the bar is higher.

## How We Could Test This

- **Direct customer conversations.** In early design-partner conversations, explicitly describe the ephemeral-processing carve-out (using shadow execution as the concrete example) and ask whether it feels acceptable. Watch for friction, questions, and whether the customer's security team would sign off. A small number of clear negative reactions from enterprise-shaped customers would substantially weaken the assumption.
- **Review with security-conscious reviewers.** Show the framing to people who professionally assess data-handling policies (security consultants, procurement reviewers, compliance officers). Ask whether it would clear a typical enterprise security review as written. Their feedback is a proxy for how the real customer security team will react.
- **Public framing test.** Once Etak has a public privacy page or equivalent, the specific phrasing of "we process but do not retain or train on your content" is a testable artifact. Watch for how it lands in developer communities, social media, and sales conversations. Early negative reactions would be signal to refine.
- **Segmentation analysis.** The assumption may hold for most of Etak's target market but fail for specific segments (healthcare, finance, legal, defense). If so, Etak may need a stricter tier for those segments while preserving the default position for everyone else. Testing which segments accept the distinction informs whether this is a universal position or a tiered one.

## What Would Invalidate This

- A meaningful fraction of target customers in design-partner conversations explicitly push back on the distinction, saying they need a guarantee that customer content is *never* processed by anything other than the production agent.
- Enterprise security reviews repeatedly flag the ephemeral-processing carve-out as a concern, even after explanation.
- A competing product adopts and publicizes a stricter "no processing beyond production" commitment and customers start citing it as a reason to prefer the competitor.
- Regulatory or legal guidance emerges that treats ephemeral processing by downstream components (judges, comparators, shadow runners) as a form of use that requires the same consent as retention.

If any of these happen, the ideas that depend on this assumption (shadow execution, LLM-as-judge quality scoring, multi-candidate production agents) need to be revisited and potentially restricted to opt-in customers only.
