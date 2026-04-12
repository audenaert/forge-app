---
name: "Users don't know when they've outgrown local storage"
type: opportunity
status: active
supports:
  - grow-etak-via-local-first-plg
hmw: "HMW help a user recognize when they've outgrown local storage and would benefit from the cloud tier — without nagging or gating?"
---

## Description

A user in the local tier is by definition happy with the local tier — until they're not. The moment of "I've outgrown this" is usually quiet and retrospective: they tried to share artifacts with a teammate and it was awkward, they wanted to query across projects and couldn't, they lost a laptop and panicked, they wanted a traversal view the filesystem can't support.

Etak's PLG pathway depends on users recognizing these moments and connecting them to a clear upgrade. If the signal is too subtle, users churn to other tools or stall in the local tier past the point of value. If the signal is too aggressive, Etak becomes the kind of nagging freemium tool developers resent and uninstall.

The opportunity is to design upgrade signals that feel like *the tool noticing what the user already wants*, not *the tool marketing itself*. For example, when a user tries an operation that would be much better in the cloud tier (cross-project traversal, shared access, durability against local loss), the CLI could surface the cloud path as a natural next step rather than an ad. When the user hits a scale threshold (artifact count, project count, cross-references) where the filesystem backend's ergonomics start to degrade, it could suggest the upgrade with context about *why now*.

This is a sub-opportunity of `solo-devs-blocked-by-team-tool-overhead`. Where that opportunity asks how a solo user starts and `disruptive-migration-from-local-to-cloud` asks how they move, this one asks how they know it's time.

## Evidence

- Developer tools that aggressively promote paid tiers (anti-pattern: auth walls, usage-gated features, modal prompts) have well-documented churn problems in the developer segment.
- Developer tools that successfully convert free users (Vercel, GitHub, Linear) tend to surface upgrade paths contextually at the moment the user tries to do something the free tier can't support, rather than on a timer or usage meter.
- The graph backend unlocks categorically different capabilities (traversal, cross-project queries, integrity checks) that the filesystem backend can't approximate. That means the value proposition for upgrading is *different capability*, not *more of the same* — a stronger PLG position.

## Who Experiences This

- Solo users in the local tier who are on the cusp of needing collaboration, durability, or query features but haven't recognized it yet.
- Power users who have built up enough artifacts locally that the filesystem backend's query limitations are starting to cost them time.
- Users who have lost local work to a machine failure, a misplaced repo, or a branch they accidentally deleted — and are now receptive to durability arguments they previously ignored.
