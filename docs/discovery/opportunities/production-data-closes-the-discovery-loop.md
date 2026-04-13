---
name: "Production usage data doesn't flow back into the discovery graph to validate what was built"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW connect production system data (feature usage, adoption metrics, behavioral signals) back to the discovery artifacts that motivated what was built?"
---

## Description

Discovery produces ideas that become features. Features ship to production. But production data — who uses them, how, and whether the predicted value materializes — rarely flows back to the discovery graph. The loop stays open: assumptions that were "validated" by an experiment before launch are never checked against actual usage.

The opportunity is to close this loop by connecting production observability data (logs, analytics, feature flags, usage metrics) to the discovery and development artifacts that motivated the work. When an idea ships, its corresponding discovery branch should eventually show whether the predicted opportunity was real, the assumptions held, and the solution delivered value.

This is a broad, long-term opportunity — it touches data infrastructure, analytics, and potentially ML — but it's the ultimate feedback mechanism for product discovery. A team that can see "we built this because of assumption X, and here's what production data says about X" is fundamentally better at making the next decision.

## Evidence

- Most product teams track usage metrics but don't connect them back to the discovery reasoning that motivated the feature
- Feature flag systems (LaunchDarkly, GrowthBook) track rollout and adoption but aren't linked to product discovery artifacts
- The gap between "we shipped it" and "did it work?" is where product intuition either calibrates or decays
