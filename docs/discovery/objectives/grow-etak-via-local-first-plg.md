---
name: "Grow Etak via local-first, product-led adoption"
type: objective
status: active
---

## Description

Etak's go-to-market is product-led. A developer should be able to install Etak as a Claude Code plugin, run it against their local project, and get immediate value with zero infrastructure, zero account creation, and zero cost. That free, local-first experience is the top of the adoption funnel.

From there, Etak grows with the user. As a project scales, the same tool moves through three stages:

1. **Solo / local** — filesystem-backed artifacts, in-repo, no server.
2. **Cloud storage** — hosted graph backend, single user, durable and queryable.
3. **Team / collaboration** — multi-user domains, shared workspace, paid tier.

The strategic commitment is that the user should never hit a migration cliff when moving between stages. The same CLI, the same skills, and the same artifacts carry forward. Continuity across the funnel is the core bet: it removes the friction that normally blocks solo tools from becoming team tools, and it means every solo user is a latent team customer.

## Context

This objective sits alongside `accelerate-product-discovery` — that objective describes the *user outcome* Etak delivers (teams make better product decisions). This objective describes *how Etak reaches those teams and grows as a business*. Both are active and mutually reinforcing: better product-led adoption means more teams benefit from the discovery capability, and a stronger discovery capability means more users want to upgrade.

The PLG framing also informs product decisions that would otherwise look like infrastructure choices. For example, the filesystem backend is not a legacy concession — it's a permanent product surface and a first-class adoption channel that has to stay supported even after the graph backend ships.

## Success Criteria

This objective is on track when:

- A new developer can go from "heard about Etak" to "captured their first opportunity artifact" in under five minutes, with no account and no network dependency.
- Upgrading from local to cloud storage is a single-command, same-session action — not a migration project.
- Upgrading from cloud-solo to team collaboration preserves all existing artifacts, history, and skill workflows with no re-learning.
- Power users who started solo become advocates inside their teams when the team tier launches — the solo tier is the wedge.

## Out of Scope

- Marketing, pricing, and billing mechanics — this objective is about the product pathway, not the commercial surface.
- The underlying graph store and GraphQL API (covered under `accelerate-product-discovery` via the `graph-backed-artifact-store` idea). This objective depends on that infrastructure but doesn't duplicate it.
