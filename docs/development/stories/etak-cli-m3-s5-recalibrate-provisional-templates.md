---
name: "M3-S5: Recalibrate provisional body templates (assumption, experiment)"
type: chore
status: draft
parent: etak-cli-m3-harden
children: []
workstream: etak-cli-core
milestone: etak-cli-m3-harden
blocked_by:
  - etak-cli-m2-s3-assumption-commands
  - etak-cli-m2-s4-experiment-commands
acceptance_criteria:
  - "At least one real assumption fixture and one real experiment fixture exist under `.etak/artifacts/` (or a repo the CLI is being used against) at the time this story runs"
  - "The assumption body template in the Zod schema is reviewed against the fixture(s): section names, required/optional flags, and canonical order adjusted to match what authors actually write"
  - "The experiment body template in the Zod schema is reviewed against the fixture(s): same adjustments; confirm whether the body should remain lean given how much lives in frontmatter"
  - "The provisional marker (comment or schema-level flag) is removed from both templates"
  - "Design spec §8 is updated to reflect the recalibrated templates and drop the 'provisional' language"
  - "Any existing assumption/experiment fixtures still validate cleanly after recalibration (no missing_required_section warnings unless genuinely intentional)"
---

## Description

The M1 spec ruling accepted `assumption` and `experiment` body templates as provisional — seeded from `schemas.md` with no live fixtures to calibrate against. Once real fixtures exist in-repo (after M2 lands the create/update commands for these types and they see real use), this chore recalibrates the templates to match actual authorial practice.

Cheap to execute: read the fixtures, adjust section names/required flags in the Zod schemas, update the spec section in §8. No adapter or command changes.

## Notes

- Trigger condition: at least one real fixture of each type exists in `.etak/artifacts/`. If only one of the two has a fixture by M3, do the recalibration for that type and split this story (leave the other as carry-over).
- Not a blocker for anything — the provisional templates are already shipping from M1.
