---
name: "In-flow gap capture"
type: idea
status: draft
addresses:
  - capture-and-route-observed-gaps
delivered_by: null
---

## Description

A low-friction mechanism for a user to say "this wasn't what I expected" from directly inside an agent flow, in the moment, without leaving the flow they're in and without having to write a bug report. The mechanism captures enough structural context to be actionable by the team downstream, gives the user agency over what they share, acknowledges the flag in a way that feels respected rather than processed, and hands the flag off to the routing/pattern-detection system (idea I) for triage.

The core act is small: a user finishes — or abandons — an agent interaction, notices the outcome wasn't right, and flags it with a single gesture. A thumbs-down, a "not quite" button, an annotation gesture, a keyboard shortcut — the specific UX is less important than the property that it is as close to zero effort as possible. One click from "I noticed a problem" to "the team will see this."

Around that core act, the mechanism layers optional depth for users who want to say more:

- **Nothing more.** The default path is "I flagged this and moved on." The flag still carries everything the system can infer automatically — the run ID, the task tag, the agent version, the config hash, the experiment cohort, the timestamp, the structural quality proxies from the run. That's enough for the team to investigate without the user writing anything.
- **A single sentence.** An optional free-text field next to the flag that asks "what did you expect?" — not "describe the bug." The phrasing matters: it invites a snapshot of the user's intent, which is often the single most useful thing a human can add. Most users will skip this field; that's fine. The users who do fill it in are disproportionately contributing the kind of signal that changes what the team does next.
- **Permission to see the content.** A separate, explicit, defaults-off toggle: "it's okay to look at what I sent and what the agent returned, for this flag only." This is content-sharing in its narrowest possible form — scoped to one interaction, granted by the user in the moment, for the specific purpose of diagnosing this one gap. No retention beyond the investigation unless the user is already in the data partnership tier. This respects the customer data ownership stance while giving users who want help fixing their problem a way to offer the context that will actually let it be fixed.
- **A category tag.** Optional, from a small fixed list: "wrong answer," "missed the point," "too much/too little," "wouldn't let me do what I wanted," "other." Categories help routing without requiring the user to write. A handful of buckets is enough; a thirty-item taxonomy is worse than nothing because nobody reads taxonomies.

The flag is acknowledged immediately and specifically. Not "thanks for your feedback" — something closer to "noted, filed against the test-plan agent" or "we'll look at this; you'll see it in the backlog." The acknowledgement telegraphs that the flag is real, not theater, and signals that the user's effort was worth making.

## Strategic Rationale

The capture mechanism is the front door of the human-observed-gap loop. Without it:

- **Most gaps are lost.** The user who notices something went wrong moves on with their day. They don't write a bug report — not because they don't care, but because the effort is too high relative to the immediate payoff. The gap stays in their head and eventually turns into either a quiet churn decision or nothing at all.
- **The team only hears from the noisiest users.** Without a low-friction path, the only feedback that reaches the team comes from customers who will fight through whatever bug-reporting flow exists. These are rarely the same customers whose experience is most representative. Over-indexing on loud feedback is one of the most common ways product teams end up building for an unrepresentative minority.
- **The gap signal has no provenance.** Gaps reported through email, Slack, or word of mouth arrive stripped of the structural context — which run, which version, which config. Even if the team wants to act, they often can't, because they can't reproduce or attribute the problem. In-flow capture preserves the provenance automatically.
- **Users have no evidence their feedback matters.** A user who flags a gap and never hears anything learns, quickly, that flagging is pointless. The absence of an acknowledgement loop is the single most reliable way to kill a feedback mechanism. Building the acknowledgement into the capture — even before routing and resolution exist — is what keeps the mechanism alive long enough for the downstream loop to catch up.

The strategic payoff is compounded: good capture fills the front of the pipeline, and everything downstream (routing, pattern detection, resolution, loop closure) has something to work with. Bad capture leaves the downstream systems starved for input no matter how well they're built.

## How It Could Work

- **Every agent-produced artifact has a flag affordance.** Wherever the output of an agent is rendered — a drafted story, a test plan, a critique, a breakdown — the UI exposes a single-click flag next to it. The affordance is visible but unobtrusive. Not a modal, not a banner, not a pop-up; a small persistent affordance that's always available.
- **Keyboard shortcut for power users.** Dogfood and design-partner users live in flows and value speed. A keyboard shortcut (bound to something like `?` or `!`) that flags the most recently surfaced output is almost zero friction, and the users who would use it are disproportionately the ones whose flags are most valuable.
- **The flag is an event, not a form.** By default, flagging produces an event in the telemetry stream (with the event type that says "this is a human flag, not a behavioral signal") tagged with the run context and whatever metadata the user optionally added. That event is what routes downstream. The user doesn't wait for anything synchronous; the flag is persisted and acknowledged in one round-trip.
- **The free-text field is one line, optional, prompted with the right question.** "What did you expect?" beats "describe the issue." The former is a snapshot of intent; the latter is a bug report. Asking the right question is a tiny UX choice that shifts the quality of the response dramatically.
- **Content sharing for the flag is narrowly scoped.** If the user toggles "it's okay to look at this," the flag captures the run's input and output *for this flag only*, retained until the flag is resolved, then deleted — unless the user is in the data partnership tier, in which case the normal retention rules apply. The narrow-scoping is important because it makes the flag-level share categorically smaller than the partnership-tier share, so users who won't share in general are still willing to share for a specific problem.
- **The acknowledgement is honest about what comes next.** The flag produces an immediate response: confirmation that it was received, a short human-readable description of what the system captured, and a gesture at what happens next (e.g., "this will show up in our agent quality review this week"). If the acknowledgement is generic, the loop dies.
- **Flagged runs are traceable back to the user.** Not in a surveillance sense — in the sense that the user can see their own flagged gaps in their account, check status, add follow-up context, and eventually see what was done about them. This is how the loop visibly closes from the user's side.
- **The mechanism exists on both the SaaS UI and (opt-in) the plugin.** On the SaaS, flagging is always available and is the primary path. In the Claude Code plugin, where the telemetry blind spot is deliberate, flagging is offered as an explicit "share this with the Etak team" gesture that is always opt-in and always produces an audit trail. Plugin flags go to the same downstream routing as SaaS flags.
- **Flag frequency is monitored, not suppressed.** If a single user is flagging everything, that is signal — either the agent is badly broken for their workflow, or the user is frustrated and deserves attention. The system doesn't throttle or rate-limit flagging in a way that would dismiss the signal. It may batch acknowledgements to avoid a barrage, but every flag lands.

## Why This Could Work

- The mechanics of this are well understood. Thumbs-up/down on AI-generated outputs is the simplest version; almost every AI product has some form of it. Etak isn't inventing the UX — it's adopting it deliberately and pairing it with downstream infrastructure (idea I) that most products don't build.
- The friction-lowering move is the whole point. Products that make feedback easy get 10-100x more feedback than products that make it a form. The feedback quality is lower per item but the total signal is much higher, and the patterns (idea I) are what turn noise into insight. Volume beats precision at the capture layer.
- The data ownership story is respected by design. Default behavior captures only structural signal; content sharing is explicit, narrow, and user-initiated. This is one of the few ways a feedback mechanism can coexist with a strong privacy posture without being neutered.
- The acknowledgement loop is the most under-built part of every feedback system in existence. Building it from day one — even with a half-manual response mechanism in the early days — is a low-cost way to keep the flagging rate from collapsing.

## Open Questions

- **What's the right default gesture?** Thumbs-down is familiar but carries semantic baggage ("I dislike this") that doesn't quite match "this wasn't what I expected." A "not quite right" button is more accurate but less recognizable. An annotation gesture (select the part that's wrong) is richer but more effort. The right answer is probably "try several and see what people use."
- **How is the user identity attached?** Flagged gaps are inherently tied to a user — it's their perception that's being captured. But attaching identity has implications for review, access control, and potentially for retaliation in enterprise contexts where "who complained?" can be sensitive. Default should probably be identified within the account but not personally attributable to individual users at the team level.
- **How do we handle the user who flags everything?** Over-flagging is signal, but it's also noisy. The system should surface "this user has a lot of flags this week" so the team can reach out, rather than filtering those flags out of view. But the specifics of "reach out how" and "when" need thought.
- **What's the relationship between a flag and a regenerate?** If the user flags a run and then clicks "regenerate," is that one flag or two? Does the regenerated run inherit the flag? The answer affects how quality proxies interact with flags.
- **How do we prevent abuse?** In theory, a malicious user could flag every output to poison the signal. In practice, this is rare in developer tools and easy to detect (one user flagging 100% of their runs is obvious). But the threat model should be considered, and the downstream routing (idea I) should be robust to the shape of the noise.
- **Should the agent itself see the flag in the moment?** If a user flags an output and the agent is still in-session, the agent could, in principle, ask "what would you rather have seen?" — turning the flag into a conversation rather than a dead letter. This is a richer experience but adds complexity and changes the semantics of "the flag is an event, not a form." May or may not be desirable.
- **How do we handle flags from dogfood and internal users differently from customer flags?** Neal's flags are disproportionately valuable right now because he's the only one flagging anything. But they're also biased toward his specific use cases. The system should preserve the provenance (internal vs. customer) and weight the pattern detection accordingly — but that weighting is a judgment call, not a formula.
- **What does the acknowledgement do when the system has no idea what to say?** Early on, most flags will not have a meaningful automated response. The acknowledgement has to be honest about this ("we'll look at it, but we can't tell you when") without becoming boilerplate. The tone is harder than the mechanics.
