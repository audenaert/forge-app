---
name: "M1-S3: Hand-write Zod schemas for all 6 discovery types"
type: story
status: draft
parent: etak-cli-m1-prove-abstraction
children: []
workstream: etak-cli-core
milestone: etak-cli-m1-prove-abstraction
blocked_by:
  - etak-cli-m1-s1-design-spec
  - etak-cli-m1-s2-package-scaffold
acceptance_criteria:
  - "Zod schemas exist for objective, opportunity, idea, assumption, experiment, critique"
  - "Schemas are seeded from `/home/ec2-user/projects/forge/plugins/discovery/skills/discovery/references/schemas.md` and cross-checked against real artifacts under `docs/discovery/`"
  - "Each type's schema includes a body section template per the design spec: section names, canonical order, required/optional flags"
  - "critique correctly models the absence of a status field AND is body-as-opaque per design spec §8 — critique schema declares no bodyTemplate (or an empty one) and the drift detector skips critique bodies; --section update surface is disabled for critiques"
  - "assumption and experiment schemas are seeded from schemas.md and marked provisional in source (comment or schema-level flag); recalibration is tracked as an M3 chore, not a blocker for M1"
  - "Each schema has at least one positive test (a real fixture parses cleanly) and one negative test (a known-bad input is rejected)"
  - "At least one positive test per type loads an actual file from `docs/discovery/` as the fixture, so schema drift from real usage is caught"
  - "Zod validation errors surface through the rendering helper defined in the design spec (topic 7), not raw ZodError dumps"
---

## Description

Hand-write the Zod schemas that validate every write through the CLI, regardless of adapter. Body section templates are part of the schema — they drive the drift-aware body parser in later stories.
