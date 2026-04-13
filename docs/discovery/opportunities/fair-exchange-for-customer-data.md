---
name: "Make sharing content with Etak a fair deal customers actively choose"
type: opportunity
status: active
supports:
  - compound-a-quality-advantage-from-usage
hmw: "HMW create a relationship in which a customer who could benefit from sharing their content with Etak — prompts, responses, code, generated artifacts — actively wants to do so, because the deal is fair, the controls are real, and the value they get back is worth more to them than the data is to them?"
---

## Description

The other three opportunities under this objective are deliberately structured around *not* needing to see customer content. Behavioral telemetry, human-articulated gaps, and live experimentation can all run on content-free signals. That is the right default and it is enough to power most of the learning loop most of the time.

But it is not enough for everything. There are categories of learning Etak cannot do well — or in some cases at all — without access to actual content:

- **Model tuning and evaluation set construction.** Building task-specific evals that reflect how Etak's customers really work requires real examples of how customers really work. Synthetic data and curated examples can only approximate this.
- **Diagnosing hard failure cases.** When a quality proxy says "this configuration is regressing on something" but the proxy can't say *what*, the only way to find out is to look at examples. Without consented access, Etak is stuck inferring from shadows.
- **Identifying patterns in usage that telemetry can't see.** Some of the most valuable product insights come from noticing how customers phrase things, what they reach for first, what mental models they bring — none of which is in a clickstream.
- **Building features that require seeing prior work.** Cross-session memory, "agents that learn your style," personalized templates — anything where the value to the customer is *Etak having seen what they did before* — depends on customer content that Etak has been allowed to retain.

The customer data ownership stance is non-negotiable: Etak does not get to take any of this without explicit consent and fair compensation. So the opportunity is to design the *relationship* in which giving consent feels like a good deal — not a privacy concession the customer reluctantly tolerates in exchange for a discount, but a transaction the customer actively wants to enter into because what they get back is worth more to them than what they give up.

The outcome to aim for, in plain terms, is this: a customer who hears the words *"Etak buys your data"* should think *"that sounds reasonable and possibly worth doing"*, not *"that sounds extractive."* Today, in most products, that phrase would land badly. Etak's opportunity is to make it land differently — by getting the substance right, not just the marketing.

What makes this hard:

- **The deal has to be honestly fair.** Compensation has to be calibrated to the actual value of the data to Etak. Too small and customers see through it; too large and the program is unsustainable. The honest answer about what data is worth is something Etak will only learn over time, which means the deal has to be designed to evolve gracefully without feeling like a bait-and-switch.
- **Control has to be real and visible.** Granular scoping (per project? per task? per session?), clear audit trails, frictionless withdrawal — none of these are optional. A customer who consents but cannot easily see what they consented to, or cannot easily change their mind, will either never consent in the first place or will feel trapped after the fact.
- **What the customer gets back has to extend beyond the discount.** Cash discount alone is the weakest version of the deal. Stronger versions include: personalized features only available to customers whose data Etak has seen, visibility into what was learned from their data, early access to improvements their data informed, a sense of being a partner in Etak's improvement rather than a data source.
- **Some customers will never share, and that has to stay fine.** Regulated industries, security-conscious teams, and customers whose work *is* their IP will rationally decline. The opportunity is not to maximize the share of customers who opt in — it is to make opting in genuinely attractive to customers who would benefit, while preserving full product access for those who don't.
- **The reputational stakes are asymmetric.** A program that works well for years builds trust slowly. A single mishandled incident — a leak, an ambiguous use of shared data, a customer who feels they were tricked — destroys trust quickly and possibly permanently. Etak has to build the program assuming it will be scrutinized adversarially someday, not assuming goodwill will carry it.
- **The economics of the discount have to work for Etak too.** The data is worth something to Etak's learning loop, but quantifying that value early — when the loop hasn't yet produced the improvements that justify the discount — is hard. The opportunity may have to start with the discount calibrated on faith and refined as the value becomes measurable.

## Potential Directions

These are sketches; the idea-level work should explore which (or which combination, or which not-yet-thought-of alternative) is right.

- A tiered consent model: customers choose granularity (whole account, specific projects, specific task types, specific sessions) and see exactly what falls inside the scope they chose.
- Per-session "yes/no this one too" prompts for high-sensitivity work, in addition to standing scopes.
- An audit dashboard showing every piece of content Etak has retained on the customer's behalf, with one-click withdrawal.
- A visible accounting of how the customer's data has been used — not in a way that breaks confidentiality of other customers, but enough that the customer can see *what was learned from my contribution*.
- Discount structures that scale with the actual usefulness of the data, so customers contributing more useful content get larger discounts than customers contributing less useful content.
- A "design partner" tier where the deal is closer to a partnership than a transaction: the customer shares deeply, gets close access to the team and unreleased features, and helps shape what Etak builds.
- Public, plain-language commitments about what Etak will *never* do with shared data, made specific enough that they could be held to account.

## Evidence

- The dominant cultural posture among developer-tool customers right now is suspicion of any data-sharing arrangement, justifiably built on a long history of products that took more than they admitted and gave back less than they promised. Etak is operating in that climate; the opportunity has to clear a higher bar than it would have a decade ago.
- Counter-evidence: products that have managed to make data-sharing genuinely attractive (Replit's bounty programs for high-quality content, Scale AI's RLHF marketplace, certain medical research partnerships) all share the same shape — granular control, real compensation, visible accounting, honest framing. The pattern works when it is done with substance.
- The parent objective explicitly names the data partnership tier as the data-rich path that powers deeper model tuning and evaluation. If this opportunity is not solved well, that path is closed and Etak's learning loop is restricted to what content-free signals alone can produce — which is enough for many things but not for everything.
- The content-free measurement opportunity exists *precisely* so that this opportunity can be a genuinely opt-in upgrade and not a hidden default. If content-free signals weren't enough to run the product, "fair exchange" would be a fig leaf over coercion. They are, so it isn't, and the relationship can be honest.

## Who Experiences This

- **Customers who would benefit from sharing.** A meaningful fraction of customers have nothing in their workflows they consider precious IP, and would happily trade access for a real discount or for personalized features. These customers are leaving value on the table today (or rather, they would be, if Etak existed) because no product has made the deal honestly attractive. They are the primary population this opportunity serves.
- **Customers who will never share, and shouldn't.** Regulated industries, security-sensitive teams, customers whose competitive advantage is in the artifacts they produce. They benefit indirectly: from a clear, well-designed program that demonstrates Etak takes data ownership seriously across the board, even though they never use the partnership tier themselves.
- **Etak's team.** Beneficiaries of the deeper signal that consented content unlocks for model tuning, eval construction, and hard-case diagnosis. Also responsible for honoring the commitments the program is built on — this opportunity is as much about discipline as about design.
- **Enterprise buyers.** For whom the existence of a clear, honest, customer-controlled data-sharing program (whether they use it or not) is evidence that Etak takes data ownership seriously across the board. The program's existence shapes the trust posture; the program's specifics shape whether that posture survives a security review.
