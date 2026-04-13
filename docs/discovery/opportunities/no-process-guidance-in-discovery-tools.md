---
name: "Discovery tools display artifacts but don't guide the thinking process"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW embed discovery process guidance into the tool so teams do the right thinking at the right time — not just file artifacts after the fact?"
---

## Description

CDH and similar discovery frameworks are structured cognitive processes — surface assumptions after writing an idea, prioritize by risk, design experiments for the riskiest ones. But discovery tools typically present artifacts as static pages without process support.

The result: teams that already know the process use the tool as a filing cabinet (low value), and teams learning the process get no guidance from the tool at all. The opportunity is a tool that actively participates in the discovery process — prompting next steps, surfacing gaps ("you have 12 untested assumptions — which are riskiest?"), and making the methodology concrete rather than requiring teams to internalize it separately.

## Evidence

- Teresa Torres' CDH framework defines specific activities and their sequencing, but no tool encodes this as workflow guidance
- Existing tools (Productboard, Vistaly) display the OST but don't prompt users through the process
- The Forge CLI skills (`/surface-assumptions`, `/prioritize`, `/design-experiment`) already encode process knowledge — but only for CLI users
