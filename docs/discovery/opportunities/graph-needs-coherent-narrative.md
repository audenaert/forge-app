---
name: "The graph captures decisions but doesn't tell the story of how we got here"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW translate the graph's structure and history into a coherent narrative that explains the 'why' behind what was built and how thinking evolved?"
---

## Description

The discovery graph records what was decided — objectives, opportunities, ideas, assumptions, experiments, results. But the graph is a structure, not a story. Both humans and AI agents need to reconstruct the narrative: how did we get here? What did we try? What changed our minds? Why was this built this way?

This need shows up in multiple contexts:
- **A developer** picking up a story needs to understand the reasoning chain from objective through opportunity to idea to implementation — not just the current state, but the path that led there
- **A team member** approaching an existing feature wonders why it was built a particular way, but walks away because there's too much risk in changing something without understanding its history
- **An AI agent** starting a fresh session needs to reconstruct context from the graph alone
- **A new team member** onboarding needs to understand not just what the team believes now, but what they tried, what failed, and how their thinking evolved

Today, this narrative is too costly to both create and consume. Teams don't maintain it because writing decision histories is overhead, and even when they do, reading through scattered artifacts to piece together a story is prohibitive. But if the graph already contains the raw material (artifacts, status changes, relationships, timestamps), the narrative could be derived rather than manually authored.

## Evidence

- ADRs attempt to solve a narrow slice of this (why a specific technical decision was made) but they're point-in-time snapshots, not connected narratives
- Git blame and commit history capture what changed but not the product thinking behind it
- The cost of not having this history is real: teams avoid changing things they don't understand, leading to cruft accumulation and missed improvement opportunities
