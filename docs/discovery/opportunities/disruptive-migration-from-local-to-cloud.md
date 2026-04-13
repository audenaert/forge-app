---
name: "Moving from local storage to cloud feels like a migration project"
type: opportunity
status: active
supports:
  - grow-etak-via-local-first-plg
hmw: "HMW let a user move from local filesystem storage to cloud storage without losing momentum or rewriting their artifacts?"
---

## Description

A user who has adopted Etak in local-first mode has accumulated real value: opportunity artifacts, idea drafts, assumptions, maybe experiments. When they decide to move to cloud storage — because the project has grown, because they want durability, because they want to share with a collaborator — that accumulated value becomes both an asset and a liability. It's the reason they're upgrading, but it's also the thing that has to move.

In traditional tools, moving storage is a migration project. Export the data, transform it, import it into the new system, verify, reconcile, discard the old copy. Each step is a chance for the user to lose confidence, hit a conflict, or simply decide the upgrade isn't worth it. The "migration cliff" is where most solo-to-team transitions die.

For Etak to deliver on its local-first PLG strategy, this transition has to feel continuous rather than disruptive. A user who upgrades should keep working on the same artifacts, in the same skill workflows, with the same CLI — the only visible change is that the artifacts now live somewhere more capable. The mechanism for that continuity is an open design question, which is why this is an opportunity rather than a single predetermined solution.

This is a sub-opportunity of `solo-devs-blocked-by-team-tool-overhead`. Where that opportunity asks how a solo user starts, this one asks how they grow.

## Evidence

- Product-led growth research consistently identifies data migration and re-onboarding as the top conversion killers in solo-to-team upgrades.
- The existing Forge skills already produce artifacts as structured markdown files. This means the "local state" is real data a user cares about, not a throwaway scratchpad — which makes the migration stakes higher, not lower.
- The graph-backed artifact store (captured as an existing idea in `building` status) explicitly provides the target backend. The remaining question is how a user gets there from where they are.

## Who Experiences This

- Solo users who started with the local filesystem tier and have decided to upgrade.
- Small teams adopting Etak where one member already has local artifacts the team wants to share.
- Users evaluating the cloud tier who want to "try it with my real data" rather than starting fresh — a common behavior in tool evaluation.
