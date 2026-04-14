/**
 * Seed script — populates a dedicated `seed` domain with representative
 * discovery data for the web UI discovery explorer milestone.
 *
 * IMPORTANT: this writes directly to Neo4j via packages/graph's driver helper.
 * This is a deliberate exception to the "use the API, not the data layer"
 * guidance, scoped to this dev-only utility. Rationale:
 *
 *   - The API authenticates every GraphQL request against a domain via the
 *     `x-api-key` header (see apps/api/src/auth.ts).
 *   - `Domain.apiKey` is `@selectable(onRead: false)`, and there is no
 *     mechanism to mint a fresh domain + key over GraphQL alone.
 *   - `DISABLE_AUTH=true` only resolves to the `default` domain, which is
 *     the wrong place for seed data (it collides with ad-hoc testing).
 *
 * The deeper gap — no operator surface for tenant provisioning — is
 * captured as a discovery opportunity at
 * `docs/discovery/opportunities/domain-provisioning-has-no-admin-surface.md`
 * and is intentionally out of scope for this milestone.
 *
 * Idempotency strategy: delete the seed domain and cascade-delete all its
 * nodes at the start of the script, then recreate from scratch. Simpler
 * than upsert and safer for a dev-only utility.
 *
 * Run with:
 *   docker compose up neo4j -d
 *   npm run seed
 *
 * Then point the web client at the seed domain by setting
 *   VITE_API_KEY=seed-dev-key
 * in apps/web/.env.local and starting the API with `npm run dev --workspace=apps/api`.
 */
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createDriver, verifyConnection } from '@forge-workspace/graph';
import { hashApiKey } from '../apps/api/src/auth.js';
import type { Driver, Session } from 'neo4j-driver';

export const SEED_DOMAIN_SLUG = 'seed';
export const SEED_DOMAIN_NAME = 'Seed Demo Domain';
export const SEED_ORG_SLUG = 'seed-org';
export const SEED_ORG_NAME = 'Seed Demo Organization';
export const SEED_API_KEY = 'seed-dev-key';

/**
 * Expected counts — the integration test asserts against these.
 * Keep in sync with the catalogue defined below.
 */
export const EXPECTED_COUNTS = {
  totalObjectives: 3,
  totalOpportunities: 5,
  totalIdeas: 7,
  totalAssumptions: 12,
  totalExperiments: 5,
  untestedHighImportanceAssumptions: 3,
  ideasWithNoAssumptions: 1,
  orphanedOpportunities: 1,
} as const;

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

interface SeedObjective {
  key: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ACHIEVED' | 'ABANDONED';
  body: string;
}

interface SeedOpportunity {
  key: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'RESOLVED' | 'ABANDONED';
  hmw: string;
  body: string;
  /** Objective keys this opportunity supports. Empty → orphaned. */
  supports: string[];
}

interface SeedIdea {
  key: string;
  name: string;
  status: 'DRAFT' | 'EXPLORING' | 'VALIDATED' | 'READY_FOR_BUILD' | 'BUILDING' | 'SHIPPED';
  body: string;
  /** Opportunity keys this idea addresses. Empty → unrooted. */
  addresses: string[];
}

interface SeedAssumption {
  key: string;
  name: string;
  status: 'UNTESTED' | 'VALIDATED' | 'INVALIDATED';
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: 'HIGH' | 'MEDIUM' | 'LOW';
  body: string;
  /** Idea keys this assumption belongs to. Empty → unrooted. */
  ideas: string[];
}

interface SeedExperiment {
  key: string;
  name: string;
  status: 'PLANNED' | 'RUNNING' | 'COMPLETE';
  method:
    | 'USER_INTERVIEW'
    | 'PROTOTYPE_TEST'
    | 'FAKE_DOOR'
    | 'CONCIERGE_MVP'
    | 'DATA_ANALYSIS'
    | 'AB_TEST'
    | 'SURVEY';
  successCriteria: string;
  duration: string;
  result?: 'VALIDATED' | 'INVALIDATED' | 'INCONCLUSIVE';
  learnings?: string;
  body: string;
  /** Assumption keys this experiment tests. */
  tests: string[];
}

const objectives: SeedObjective[] = [
  {
    key: 'obj-activation',
    name: 'Double new-team activation within 90 days',
    status: 'ACTIVE',
    body: `## Why this matters

Activation — the share of new teams that reach their first "aha" moment within two weeks of signup — is our strongest leading indicator of retention. Teams that activate retain at **3.2x** the rate of those that don't.

Today only ~18% of new teams activate. Moving that to 36% would:

- Lift six-month retention from 41% to a projected 58%
- Unlock a self-serve growth motion that currently stalls on hand-holding
- Reduce CS time-to-value burden by an estimated 40%

## Success metric

\`activation_rate_d14\` measured weekly, cohort-indexed to signup week. Target: **36% by end of Q3**.`,
  },
  {
    key: 'obj-enterprise',
    name: 'Unlock enterprise self-serve procurement',
    status: 'ACTIVE',
    body: `## Why this matters

Enterprise buyers keep telling us the same thing: they love the product but the procurement experience is "built for startups." We lose an estimated **$1.8M ARR / year** to deals that stall in security review or contract negotiation.

## What "unlocked" means

- SOC2 Type II report available without NDA
- Self-serve MSA + DPA that legal teams can redline
- SSO / SCIM available on the business tier (not gated to enterprise)
- Audit log API for compliance workflows

## Success metric

Enterprise self-serve close rate, measured as: _(deals closed without sales intervention) / (qualified enterprise signups)_. Current: 4%. Target: **25%**.`,
  },
  {
    key: 'obj-retention',
    name: 'Flatten the month-3 churn cliff',
    status: 'ACTIVE',
    body: `Our retention curve has a pronounced dropoff between months 2 and 3 — teams that cross that threshold tend to stick for 18+ months, but only **~55%** make it.

The month-3 churn cliff costs us roughly **$2.4M ARR / year** in lost expansion and new-logo revenue that never compounds.

## Working hypotheses

1. Teams lose momentum after initial setup because there's no "second milestone" pulling them forward
2. The product gets harder to use past 5-10 users without admin tooling we haven't built
3. Pricing friction kicks in at month 3 when trial credits expire

We don't know which of these is dominant — that's what the supporting opportunities below are meant to find out.`,
  },
];

const opportunities: SeedOpportunity[] = [
  {
    key: 'opp-onboarding-confusion',
    name: 'New users get lost in the first 10 minutes',
    status: 'ACTIVE',
    hmw: 'How might we help new users reach their first meaningful outcome without needing a call with CS?',
    body: `## Evidence

From analytics + session replays over the last 60 days:

- **62%** of new users drop off before completing the first workspace setup step
- Median time-to-first-value is **47 minutes** — but for users who *don't* churn, it's under 8 minutes
- Top three rage-click zones, in order:
  1. The "Add collaborators" modal (users click "skip" then can't find it again)
  2. The integrations picker (scroll fatigue, 40+ options)
  3. The empty-state graph canvas (no clear call to action)

## Who feels this

New workspace admins, typically the PM or engineering lead setting up for their team. They're evaluating on behalf of 5-15 colleagues, time-boxed, and will bounce to a competitor within the same session if stuck.

## Why now

Activation is the #1 input to our **"double new-team activation"** objective and this opportunity is the biggest contributor to the activation funnel drop.`,
    supports: ['obj-activation'],
  },
  {
    key: 'opp-integration-sprawl',
    name: 'Integrations feel like a directory, not a workflow',
    status: 'ACTIVE',
    hmw: 'How might we surface the *right* integration at the *right* moment instead of making users shop for one upfront?',
    body: `## The problem

We currently show a 40+ item integrations grid during onboarding. Users either:

1. Pick none and lose the "connected" value prop entirely, or
2. Pick too many and get a messy workspace they don't trust

Neither behavior correlates with retention. What **does** correlate: integrations added *after* the second week of use, in response to a specific workflow pain.

## What good looks like

- Zero integrations forced during onboarding
- Contextual prompts: "You just pasted a Figma link — want to connect Figma so previews auto-update?"
- A workspace that feels progressively richer, not pre-stuffed

## Risks

Integrations are a major driver of first-call sales conversations. If we hide the directory too aggressively, we lose a talk track. Mitigate by keeping a browsable view for teams that *want* one.`,
    supports: ['obj-activation'],
  },
  {
    key: 'opp-security-review-stall',
    name: 'Security review is where enterprise deals go to die',
    status: 'ACTIVE',
    hmw: 'How might we pre-answer security questions so buyers never have to ask?',
    body: `## Pattern

Every enterprise deal that stalls stalls in the same place: the security questionnaire. Average time from "we're interested" to "we've cleared legal" is **74 days**, and **41%** of deals never clear at all.

## What the questionnaires actually ask

Analyzing the last 30 questionnaires:

- 80% of questions are answerable from a SOC2 report we already have (under NDA)
- 15% are about data residency — answerable, but we don't publish it
- 5% are genuinely novel and deserve a human response

## Hypothesis

If we published a trust center with SOC2, DPA, subprocessors, data residency, and a pre-filled questionnaire, we could collapse the median from 74 days to something like 10-14 days.

Risk: some enterprises *want* the formal review process. A trust center doesn't replace that, but it lets the other 70% self-serve.`,
    supports: ['obj-enterprise'],
  },
  {
    key: 'opp-admin-scaling',
    name: 'Workspaces break down past 10 members',
    status: 'ACTIVE',
    hmw: 'How might we make the product stay *good* as teams grow, not just keep working?',
    body: `## The cliff

Workspaces with 10+ members retain dramatically worse than 5-9 member workspaces. Investigating further:

- Member management UX is designed for ~5 people
- No roles beyond admin/member (enterprise deals ask about this constantly)
- Audit history is query-only, no UI
- No way to group members by team or function

## Why it matters for retention

This opportunity supports the **month-3 churn cliff** objective because many of our month-3 churners are teams that *grew* during their trial — adoption is our problem, not just activation.

## Constraints

Whatever we build has to work for both our existing 5-person teams (who don't need any of this) and 50-person teams (who desperately need all of it). That's a product design problem as much as an engineering one.`,
    supports: ['obj-retention'],
  },
  {
    key: 'opp-orphaned-pricing',
    name: 'Pricing page bounces are accelerating',
    status: 'ACTIVE',
    hmw: 'How might we tell visitors what things cost before they have to imagine a fake scenario?',
    body: `## Signal

Pricing page bounce rate has climbed from 58% to 71% over the last two quarters. No specific objective claims this opportunity yet — it surfaced from analytics, not a strategic priority.

## What we know

- Our pricing is per-seat with usage tiers, hard to explain on a static page
- Competitors have moved to "starts at $X, talk to us for the rest" — we haven't
- Users in session replays scroll to the FAQ, don't find answers, and leave

## What we don't know

Whether pricing clarity is actually a growth lever or just a cosmetic concern. We'd need to test before committing to a redesign.

_(Deliberately orphaned in the seed data — exercises the "orphaned opportunities" dashboard surface.)_`,
    supports: [],
  },
];

const ideas: SeedIdea[] = [
  {
    key: 'idea-guided-onboarding',
    name: 'Guided onboarding tour with skippable checkpoints',
    status: 'EXPLORING',
    body: `## What we'd build

A step-by-step onboarding overlay that walks new admins through four concrete checkpoints:

1. Create your first project
2. Invite one teammate (or skip — we'll remind you later)
3. Connect one integration (contextual, not a directory)
4. See your first dashboard come to life

## Why this shape

Unlike a traditional "product tour," the steps are **outcome checkpoints**, not UI pointers. Each step is a thing the user actually did, not a tooltip they dismissed.

Skippable at every step, but with gentle re-entry via a persistent "finish setup" pill in the top nav.

## Open questions

- What's the right number of steps? Too few feels thin, too many feels like homework.
- Does the re-entry pill annoy users who deliberately skipped? We'd want to A/B test this.`,
    addresses: ['opp-onboarding-confusion'],
  },
  {
    key: 'idea-contextual-integrations',
    name: 'Contextual integration prompts triggered by paste events',
    status: 'DRAFT',
    body: `## The core insight

Users already tell us which integrations they care about — they paste links. A Figma link, a Linear issue, a Loom video. Right now those links render as plain URLs. What if they triggered a gentle inline prompt: "Want rich previews? Connect Figma in one click."

## Why this is better than a directory

- Zero upfront choice paralysis
- Signal comes from real usage, not imagination
- The prompt arrives *when* the user has a reason to care, not before

## Rough architecture

- A paste middleware that detects known URL patterns
- An inline ghost-card component that renders a "connect" CTA
- Per-user dismissal tracking so we don't nag

## Why DRAFT

Need to validate that users will actually connect integrations from inline prompts vs. dismissing them as spam.`,
    addresses: ['opp-integration-sprawl'],
  },
  {
    key: 'idea-trust-center',
    name: 'Public trust center with self-serve SOC2 and DPA',
    status: 'READY_FOR_BUILD',
    body: `## What we'd ship

A \`/trust\` subdomain (or \`/trust\` route) with:

- **SOC2 Type II** report behind a click-through NDA (no back-and-forth email)
- **DPA** available as a downloadable PDF with our standard terms
- **Subprocessors list** — kept in sync with an internal source of truth
- **Data residency** page documenting which regions we host in
- **Security questionnaire** — pre-filled with answers to the top 50 questions we see

## Why this is ready

- Every component already exists internally — this is mostly about making it *public*
- Legal has signed off on the click-through NDA pattern in principle
- Design mockups exist and have been socialized

## Dependencies

Needs the SOC2 report public distribution rights from our auditor — already in motion, ETA two weeks.`,
    addresses: ['opp-security-review-stall'],
  },
  {
    key: 'idea-roles-and-groups',
    name: 'Roles beyond admin/member + member groups',
    status: 'EXPLORING',
    body: `## The ask, distilled

Enterprise deals consistently want three things on top of our current admin/member binary:

1. **Viewer** role — can see, can't edit
2. **Billing admin** role — decoupled from workspace admin
3. **Groups** — named sets of members you can permission against

## Why this matters for retention

Workspaces that grow past 10 members today have no way to express organizational structure. That's a big part of why they break down — everyone has the same permissions, which is either too permissive or too restrictive.

## Risk: over-building

If we ship a full RBAC system we'll spend six months on it and the 5-person teams will hate the complexity. Target: the **simplest thing that unblocks the top-3 enterprise asks**, nothing more.`,
    addresses: ['opp-admin-scaling'],
  },
  {
    key: 'idea-bulk-member-import',
    name: 'Bulk member import from CSV or directory sync',
    status: 'EXPLORING',
    body: `## What we'd build

A simple "Add many members at once" flow:

- Paste a CSV (email, name, role)
- Or connect SCIM / directory sync for enterprise workspaces
- Preview before commit, roll back on error

## Why this addresses admin scaling

One of the biggest friction points for 10+ member workspaces is the one-at-a-time invite flow. It's fine for inviting a co-founder; it's miserable for onboarding a team.

## Scope

V1: CSV paste only. SCIM is a much bigger effort and should be its own idea if it turns out to matter.`,
    addresses: ['opp-admin-scaling'],
  },
  {
    key: 'idea-empty-state-canvas',
    name: 'Redesign the empty-state graph canvas with a starter template',
    status: 'DRAFT',
    body: `## The problem

The graph canvas when first opened shows a pulsing "+ Add node" button and nothing else. Users don't know what to do. Session replays show most people click the button, add one node, stare at it, and leave.

## The idea

Seed the canvas with a starter template — pre-built graph of sample nodes that demonstrates what the tool is for. Users can delete it in one click if they want a blank canvas. But the default is *not* blank.

## Open questions

- Which template? A product discovery example? A sales pipeline? A research plan?
- Do we offer multiple templates and make users pick? (Risk: choice paralysis, again.)
- How do we make "delete all" feel safe?

## Why this is still DRAFT

Haven't validated whether template-first is actually better than blank-canvas-with-guidance. That's a testable assumption.`,
    addresses: ['opp-onboarding-confusion'],
  },
  {
    key: 'idea-ai-assistant-unrooted',
    name: 'AI assistant that generates structured artifacts from meeting notes',
    status: 'DRAFT',
    body: `## What it'd do

Paste in a block of free-form meeting notes. The assistant extracts:

- Potential objectives (what we're trying to achieve)
- Opportunities (what's blocking us)
- Ideas (what we might try)
- Assumptions (what we believe but haven't tested)

and turns them into draft graph nodes for the user to review and accept.

## Why this exists as a loose idea

It's not clear what opportunity this addresses — it's more of a capability we've been kicking around. Does it belong under onboarding (helps new users populate their canvas)? Under retention (helps teams keep their discovery work fresh)? Under something we haven't identified?

_(Deliberately unrooted in the seed data — exercises the "unrooted ideas" dashboard surface.)_`,
    addresses: [],
  },
];

const assumptions: SeedAssumption[] = [
  // idea-guided-onboarding — has several assumptions including a validated HIGH
  {
    key: 'asm-users-will-complete-tour',
    name: 'Users will complete a 4-step guided tour if skippable at each step',
    status: 'VALIDATED',
    importance: 'HIGH',
    evidence: 'HIGH',
    body: `## Result

Validated via a low-fidelity prototype test (see linked experiment). **67% of participants** completed all 4 steps without abandoning, comfortably above our 50% threshold.

## What we learned

- The "skip" option was a *trust signal*, not a bail-out — most users didn't skip, but knowing they *could* made them more willing to engage
- Step 3 (integrations) was the highest drop-off point and should be made the most skippable step in production
- Finishers were more likely to invite a teammate within 24 hours, hinting at a downstream conversion lift`,
    ideas: ['idea-guided-onboarding'],
  },
  {
    key: 'asm-re-entry-pill-not-annoying',
    name: 'A persistent "finish setup" pill in the top nav does not annoy users who skipped',
    status: 'UNTESTED',
    importance: 'HIGH',
    evidence: 'LOW',
    body: `## Why HIGH importance

If the re-entry mechanism is perceived as nagging, it poisons the otherwise-validated guided tour experience. Users who skipped deliberately will feel disrespected — exactly the opposite of the "trust signal" we're trying to reinforce.

## How we'd test

Prototype with the pill always visible vs. pill that hides on explicit dismiss. Measure rage-click patterns and post-session sentiment.

_No experiment attached yet — this is exactly the kind of HIGH-importance untested risk the dashboard should surface._`,
    ideas: ['idea-guided-onboarding'],
  },
  {
    key: 'asm-checkpoint-framing',
    name: 'Outcome-framed checkpoints feel less "homework-y" than UI tooltips',
    status: 'UNTESTED',
    importance: 'MEDIUM',
    evidence: 'LOW',
    body: `Our hypothesis is that framing tour steps as outcomes ("invite a teammate") rather than UI pointers ("click this button") will feel more respectful of the user's time. We have *no* evidence for this — it's a design intuition.

**Test idea:** split-test wording on a simplified version of the tour.`,
    ideas: ['idea-guided-onboarding'],
  },
  {
    key: 'asm-paste-detection-accuracy',
    name: 'We can reliably detect integration-worthy URL patterns on paste',
    status: 'VALIDATED',
    importance: 'HIGH',
    evidence: 'HIGH',
    body: `## Result

Validated via a 2-week dogfood test in our internal workspace. The paste middleware correctly identified **98.2%** of pasted Figma / Linear / Loom / Notion URLs, with fewer than 0.5% false positives.

## Methodology

Instrumented paste events across 40 internal users for 14 days. Manual review of every flagged paste + a random sample of non-flagged pastes.

## Caveats

Only tested for the top four URL patterns we care about. Broader coverage (e.g., Airtable, Miro) would need its own validation.`,
    ideas: ['idea-contextual-integrations'],
  },
  {
    key: 'asm-inline-prompts-not-spam',
    name: 'Users will perceive inline connect prompts as helpful, not spam',
    status: 'UNTESTED',
    importance: 'HIGH',
    evidence: 'LOW',
    body: `## Why this is the crux

If this assumption is wrong, the whole contextual integrations idea is dead. Users who experience the prompts as spam will train themselves to ignore them, and we'll have built a nag system.

## How we'd test

Prototype + unmoderated user test with 8-12 users. Prompts dismissed vs. acted-on. Qualitative feedback on whether the prompts felt useful or annoying.`,
    ideas: ['idea-contextual-integrations'],
  },
  {
    key: 'asm-trust-center-unblocks-deals',
    name: 'A public trust center will collapse enterprise security review time by >50%',
    status: 'VALIDATED',
    importance: 'HIGH',
    evidence: 'MEDIUM',
    body: `## Result

Validated indirectly via **competitor analysis** and **customer interviews**:

- Competitors with public trust centers close enterprise deals in a median of 14 days vs our 74
- 12 of 15 enterprise prospects we interviewed said "we'd fast-track a vendor with public SOC2"
- Our top 3 enterprise customers all cited "no public compliance info" as the single biggest friction point

## Confidence

Medium — this is indirect evidence, not a direct test. But it's consistent enough that we'd ship before running a direct test.`,
    ideas: ['idea-trust-center'],
  },
  {
    key: 'asm-legal-will-approve-click-nda',
    name: 'Our legal team will approve click-through NDA for SOC2 distribution',
    status: 'VALIDATED',
    importance: 'HIGH',
    evidence: 'HIGH',
    body: `Confirmed by legal in a working session last month. Template NDA drafted, approved, and ready to embed.

_One caveat: the auditor still needs to grant public distribution rights, which is a separate track._`,
    ideas: ['idea-trust-center'],
  },
  {
    key: 'asm-viewer-role-is-top-ask',
    name: 'The viewer role is the single most-requested enterprise feature',
    status: 'INVALIDATED',
    importance: 'MEDIUM',
    evidence: 'HIGH',
    body: `## What we originally assumed

That "viewer role" would be the top answer when we asked enterprise prospects what they were missing.

## What we found

After interviewing 22 enterprise prospects, the actual top ask was **SCIM / directory sync**, followed by **audit log API**, with viewer role landing **fourth**.

## Implication

We should still build viewer role — it's on the shortlist — but it's not the highest-leverage thing to start with. The roadmap order should be SCIM → audit log → groups → viewer.`,
    ideas: ['idea-roles-and-groups'],
  },
  {
    key: 'asm-simple-rbac-enough',
    name: 'Three roles (admin / member / viewer) is enough for the vast majority of workspaces',
    status: 'UNTESTED',
    importance: 'MEDIUM',
    evidence: 'MEDIUM',
    body: `Competitor analysis suggests this is true — most productivity tools we looked at converge on 3-5 roles and stop there. But we haven't validated it against our own enterprise pipeline.

**Test idea:** ask the top 10 enterprise deals in the pipeline which of their role needs a 3-role model would and wouldn't cover.`,
    ideas: ['idea-roles-and-groups'],
  },
  {
    key: 'asm-csv-import-is-dominant',
    name: 'CSV paste will cover >80% of bulk-import use cases',
    status: 'UNTESTED',
    importance: 'LOW',
    evidence: 'MEDIUM',
    body: `Most of the "I want to add a lot of members at once" asks we see are from teams of 10-30 people, which is easily handled by a CSV paste. SCIM is asked for, but mostly by teams that are 50+ and already on enterprise tier — a different segment.

Low importance because even if wrong, CSV paste is a cheap shippable step.`,
    ideas: ['idea-bulk-member-import'],
  },
  {
    key: 'asm-template-beats-blank',
    name: 'A seeded starter template converts better than a blank canvas with guidance',
    status: 'UNTESTED',
    importance: 'HIGH',
    evidence: 'LOW',
    body: `## Why HIGH importance

This is the crux of the empty-state canvas idea. If a blank canvas with better guidance works just as well, we should do *that* instead of maintaining templates.

## How we'd test

A/B test: half of new users see a seeded template, half see an enhanced blank state. Measure first-week engagement and D14 retention.

## Risk

A/B test on new signups is slow (needs ~4 weeks of data to reach significance at our current signup volume).`,
    ideas: ['idea-empty-state-canvas'],
  },
  {
    key: 'asm-orphan-assumption',
    name: 'Users prefer collaborative editing over solo drafting for discovery artifacts',
    status: 'UNTESTED',
    importance: 'MEDIUM',
    evidence: 'LOW',
    body: `A belief that's floated around internally — that discovery work is inherently collaborative and should default to multi-user editing rather than single-user drafting.

Not attached to any specific idea yet; it's a latent assumption we'd want to validate before committing to any real-time collaboration investment.

_(Deliberately unrooted in the seed data — exercises the "unrooted assumptions" dashboard surface.)_`,
    ideas: [],
  },
];

const experiments: SeedExperiment[] = [
  {
    key: 'exp-onboarding-prototype',
    name: 'Low-fidelity prototype test of the 4-step guided tour',
    status: 'COMPLETE',
    method: 'PROTOTYPE_TEST',
    successCriteria: '>50% of participants complete all 4 steps without abandoning',
    duration: '2 weeks',
    result: 'VALIDATED',
    learnings: `**67% of participants completed all 4 steps** — comfortably above the 50% threshold.

Key qualitative findings:

- The "skip for now" option was a *trust signal*, not a bail-out. Most users didn't skip, but they reported feeling more willing to engage because they knew they could.
- Step 3 (integrations) was the highest drop-off point (19% of all drops). Recommend making this step the most skippable.
- Users who finished the tour self-reported higher confidence and were more likely to invite a teammate within 24 hours.`,
    body: `## Setup

A clickable Figma prototype of the 4-step tour shown to 15 recruited participants matching our new-admin ICP. Think-aloud protocol, recorded sessions.

## Results

See "learnings" above. Net: the guided tour concept is validated. The contextual integrations step needs rework.`,
    tests: ['asm-users-will-complete-tour'],
  },
  {
    key: 'exp-paste-detection-dogfood',
    name: 'Internal dogfood of paste-event URL detection',
    status: 'COMPLETE',
    method: 'DATA_ANALYSIS',
    successCriteria: '>95% accurate URL pattern detection with <1% false-positive rate',
    duration: '2 weeks',
    result: 'VALIDATED',
    learnings: `**98.2% accuracy, 0.4% false-positive rate** across ~1,200 paste events from 40 internal users.

The main surprise: users pasted a lot of *non-integration* URLs (GitHub, Slack threads, Google Docs) that we didn't have handlers for. That's a follow-up opportunity, not a failure.`,
    body: `## Setup

Deployed the paste middleware to internal staff only for 14 days. Logged every paste event (URL domain + path prefix, never full URLs for privacy).

## Results

See "learnings". The detection layer is solid enough to ship to external users for the actual contextual-prompts test.`,
    tests: ['asm-paste-detection-accuracy'],
  },
  {
    key: 'exp-trust-center-interviews',
    name: 'Customer interview series on trust-center impact',
    status: 'COMPLETE',
    method: 'USER_INTERVIEW',
    successCriteria: '>=10 of 15 prospects cite public compliance info as a gating factor',
    duration: '3 weeks',
    result: 'VALIDATED',
    learnings: `**12 of 15** enterprise prospects cited public compliance info as a dealbreaker or near-dealbreaker. Three of them offered to be reference customers if we ship it.

Unexpected signal: **four** prospects independently mentioned that the *absence* of a trust center was a trust signal in itself — "if they don't publish it, I assume they don't have it."`,
    body: `## Methodology

15 semi-structured interviews with enterprise security reviewers at prospect accounts. Sample pulled from stalled-deal list + current pipeline. 30-45 min each, recorded + transcribed.

## Results

See "learnings". Clear validation. Trust center is the single highest-leverage unlock for enterprise.`,
    tests: ['asm-trust-center-unblocks-deals'],
  },
  {
    key: 'exp-role-interviews',
    name: 'Role-needs interview series with enterprise prospects',
    status: 'COMPLETE',
    method: 'USER_INTERVIEW',
    successCriteria: 'Identify the top 3 role needs by frequency',
    duration: '4 weeks',
    result: 'INVALIDATED',
    learnings: `The top 3 role needs we found — SCIM, audit log API, groups — did **not** match our internal priors. "Viewer role" we expected to rank first landed fourth.

The experiment result is marked INVALIDATED because our original hypothesis (viewer role = top ask) was falsified. But the experiment itself was highly valuable — it reshaped the roadmap.`,
    body: `## Methodology

22 structured interviews. Asked "what's the one permission-related feature you wish we had?" before showing any options, then let participants rank a list.

## Results

Complete re-ordering of our internal priorities. Viewer role is still valuable, just not first.`,
    tests: ['asm-viewer-role-is-top-ask'],
  },
  {
    key: 'exp-inline-prompts-prototype',
    name: 'Unmoderated prototype test of inline integration connect prompts',
    status: 'PLANNED',
    method: 'PROTOTYPE_TEST',
    successCriteria:
      '>=40% of participants click "connect" on at least one prompt AND <=20% report the experience as "intrusive" or "spammy"',
    duration: '2 weeks',
    body: `## Why now

The paste-detection layer is validated, so we know *technically* we can show the right prompt at the right moment. This experiment tests whether users actually want the prompts when they appear.

## Planned setup

- Unmoderated usertesting.com task: "explore this workspace and do some typical paste operations"
- 8-12 participants recruited from the ICP
- Measure click-through rate + post-task sentiment

## Why PLANNED

Blocked on the prototype build. Design is ready, eng capacity is the gate.

_Note: this experiment is not yet wired up to any specific assumption in the graph. Once it runs, it would formally test \`asm-inline-prompts-not-spam\` — but for now it's scoped as a planned exploratory test._`,
    tests: [],
  },
];

// ---------------------------------------------------------------------------
// Seeding logic
// ---------------------------------------------------------------------------

async function deleteSeedDomain(session: Session): Promise<void> {
  // Delete every artifact BELONGS_TO the seed domain (cascading detach).
  // This is already scoped by domain slug, so sibling domains under the
  // same organization are untouched.
  await session.run(
    `
    MATCH (n)-[:BELONGS_TO]->(d:Domain {slug: $slug})
    DETACH DELETE n
    `,
    { slug: SEED_DOMAIN_SLUG }
  );
  // Delete the seed domain itself and any users that are members only of
  // this domain. We do NOT unconditionally delete the Organization — if a
  // future fixture or test attaches another Domain to `seed-org`, blowing
  // away the org would orphan it. Instead, delete the org only when this
  // is its last remaining domain.
  await session.run(
    `
    MATCH (d:Domain {slug: $slug})
    OPTIONAL MATCH (u:User)-[:MEMBER_OF]->(d)
    WHERE NOT EXISTS {
      MATCH (u)-[:MEMBER_OF]->(other:Domain)
      WHERE other.slug <> $slug
    }
    DETACH DELETE u, d
    `,
    { slug: SEED_DOMAIN_SLUG }
  );
  await session.run(
    `
    MATCH (o:Organization {slug: $orgSlug})
    WHERE NOT EXISTS { MATCH (:Domain)-[:BELONGS_TO_ORG]->(o) }
    DETACH DELETE o
    `,
    { orgSlug: SEED_ORG_SLUG }
  );
}

async function createSeedTenant(session: Session): Promise<void> {
  const hashedKey = hashApiKey(SEED_API_KEY);
  await session.run(
    `
    CREATE (org:Organization {
      id: randomUUID(),
      slug: $orgSlug,
      name: $orgName,
      createdAt: datetime()
    })
    CREATE (dom:Domain {
      id: randomUUID(),
      slug: $domainSlug,
      name: $domainName,
      apiKey: $hashedKey,
      createdAt: datetime()
    })
    CREATE (usr:User {
      id: randomUUID(),
      email: 'seed-admin@etak.local',
      displayName: 'Seed Admin',
      createdAt: datetime()
    })
    CREATE (dom)-[:BELONGS_TO_ORG]->(org)
    CREATE (usr)-[:BELONGS_TO_ORG]->(org)
    CREATE (usr)-[:MEMBER_OF {role: 'admin', joinedAt: datetime()}]->(dom)
    `,
    {
      orgSlug: SEED_ORG_SLUG,
      orgName: SEED_ORG_NAME,
      domainSlug: SEED_DOMAIN_SLUG,
      domainName: SEED_DOMAIN_NAME,
      hashedKey,
    }
  );
}

async function createArtifacts(session: Session): Promise<void> {
  // Objectives
  for (const obj of objectives) {
    await session.run(
      `
      MATCH (d:Domain {slug: $domainSlug})
      CREATE (n:Objective {
        id: randomUUID(),
        name: $name,
        status: $status,
        body: $body,
        createdAt: datetime(),
        _seedKey: $key
      })-[:BELONGS_TO]->(d)
      `,
      { domainSlug: SEED_DOMAIN_SLUG, ...obj }
    );
  }

  // Opportunities
  for (const opp of opportunities) {
    await session.run(
      `
      MATCH (d:Domain {slug: $domainSlug})
      CREATE (n:Opportunity {
        id: randomUUID(),
        name: $name,
        status: $status,
        hmw: $hmw,
        body: $body,
        createdAt: datetime(),
        _seedKey: $key
      })-[:BELONGS_TO]->(d)
      `,
      { domainSlug: SEED_DOMAIN_SLUG, ...opp }
    );
    for (const objKey of opp.supports) {
      await session.run(
        `
        MATCH (o:Opportunity {_seedKey: $oppKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MATCH (t:Objective {_seedKey: $objKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MERGE (o)-[:SUPPORTS]->(t)
        `,
        { domainSlug: SEED_DOMAIN_SLUG, oppKey: opp.key, objKey }
      );
    }
  }

  // Ideas
  for (const idea of ideas) {
    await session.run(
      `
      MATCH (d:Domain {slug: $domainSlug})
      CREATE (n:Idea {
        id: randomUUID(),
        name: $name,
        status: $status,
        body: $body,
        createdAt: datetime(),
        _seedKey: $key
      })-[:BELONGS_TO]->(d)
      `,
      { domainSlug: SEED_DOMAIN_SLUG, ...idea }
    );
    for (const oppKey of idea.addresses) {
      await session.run(
        `
        MATCH (i:Idea {_seedKey: $ideaKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MATCH (o:Opportunity {_seedKey: $oppKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MERGE (i)-[:ADDRESSES]->(o)
        `,
        { domainSlug: SEED_DOMAIN_SLUG, ideaKey: idea.key, oppKey }
      );
    }
  }

  // Assumptions
  for (const asm of assumptions) {
    await session.run(
      `
      MATCH (d:Domain {slug: $domainSlug})
      CREATE (n:Assumption {
        id: randomUUID(),
        name: $name,
        status: $status,
        importance: $importance,
        evidence: $evidence,
        body: $body,
        createdAt: datetime(),
        _seedKey: $key
      })-[:BELONGS_TO]->(d)
      `,
      { domainSlug: SEED_DOMAIN_SLUG, ...asm }
    );
    for (const ideaKey of asm.ideas) {
      // Relationship direction: Assumption -[:ASSUMED_BY]-> Idea
      // (so Idea has `assumptions: @relationship(type: "ASSUMED_BY", direction: IN)`)
      await session.run(
        `
        MATCH (a:Assumption {_seedKey: $asmKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MATCH (i:Idea {_seedKey: $ideaKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MERGE (a)-[:ASSUMED_BY]->(i)
        `,
        { domainSlug: SEED_DOMAIN_SLUG, asmKey: asm.key, ideaKey }
      );
    }
  }

  // Experiments
  for (const exp of experiments) {
    await session.run(
      `
      MATCH (d:Domain {slug: $domainSlug})
      CREATE (n:Experiment {
        id: randomUUID(),
        name: $name,
        status: $status,
        method: $method,
        successCriteria: $successCriteria,
        duration: $duration,
        result: $result,
        learnings: $learnings,
        body: $body,
        createdAt: datetime(),
        _seedKey: $key
      })-[:BELONGS_TO]->(d)
      `,
      {
        domainSlug: SEED_DOMAIN_SLUG,
        key: exp.key,
        name: exp.name,
        status: exp.status,
        method: exp.method,
        successCriteria: exp.successCriteria,
        duration: exp.duration,
        result: exp.result ?? null,
        learnings: exp.learnings ?? null,
        body: exp.body,
      }
    );
    for (const asmKey of exp.tests) {
      // Relationship direction: Experiment -[:TESTS]-> Assumption
      // (Assumption has `testedBy: @relationship(type: "TESTS", direction: IN)`)
      await session.run(
        `
        MATCH (e:Experiment {_seedKey: $expKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MATCH (a:Assumption {_seedKey: $asmKey})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
        MERGE (e)-[:TESTS]->(a)
        `,
        { domainSlug: SEED_DOMAIN_SLUG, expKey: exp.key, asmKey }
      );
    }
  }

  // Clean up the temporary _seedKey marker so nothing leaks to the API layer.
  // (The property isn't in the GraphQL schema so it's ignored on reads anyway,
  // but stripping it keeps the graph clean.)
  await session.run(
    `
    MATCH (n)-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
    WHERE n._seedKey IS NOT NULL
    REMOVE n._seedKey
    `,
    { domainSlug: SEED_DOMAIN_SLUG }
  );
}

/**
 * Run the seed end-to-end against a given driver. Exposed as a function
 * so the integration test can drive it without spawning a subprocess.
 */
export async function runSeed(driver: Driver): Promise<void> {
  const session = driver.session();
  try {
    console.log(`Deleting existing '${SEED_DOMAIN_SLUG}' domain (if any)...`);
    await deleteSeedDomain(session);

    console.log(`Creating '${SEED_DOMAIN_SLUG}' domain + organization + user...`);
    await createSeedTenant(session);

    console.log('Creating seed artifacts...');
    await createArtifacts(session);

    console.log('Seed complete.');
    console.log('');
    console.log(`  Domain slug: ${SEED_DOMAIN_SLUG}`);
    console.log(`  API key:     ${SEED_API_KEY}`);
    console.log('');
    console.log('  Point the web client at the seed domain with:');
    console.log(`    VITE_API_KEY=${SEED_API_KEY}`);
    console.log('  in apps/web/.env.local');
  } finally {
    await session.close();
  }
}

async function main(): Promise<void> {
  const driver = createDriver();
  try {
    await verifyConnection(driver);
    await runSeed(driver);
  } finally {
    await driver.close();
  }
}

// Only invoke main() when run as a script — allows the integration test
// to import runSeed without triggering a second execution. Compare the
// resolved path of this module against process.argv[1] using the standard
// ESM idiom, which avoids false positives for any path that merely ends
// with "seed.ts"/"seed.js".
const isMain =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
