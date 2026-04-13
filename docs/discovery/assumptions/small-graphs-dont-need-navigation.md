---
name: "Early discovery graphs are too small to need a dedicated navigator"
type: assumption
status: untested
importance: low
evidence: low
assumed_by:
  - wiki-style-discovery-navigator
---

## Description

A skeptical end-user might argue that discovery graphs start small — a handful of objectives, some opportunities, a few ideas — and at that scale the graph can be held in one's head. A dedicated navigation tool solves a problem that doesn't exist yet.

## Why this is likely wrong

Discovery-only artifacts may start small, but Forge combines discovery and development artifacts in the same graph. Once you add initiatives, projects, epics, stories, tasks, specs, and ADRs — all linked to the discovery artifacts they trace from — the graph grows quickly. Even a single project with a modest discovery tree can produce dozens of nodes across both sides.

## How to test

Track artifact counts as early users work through a real discovery-to-delivery cycle. If the graph exceeds ~30 nodes within the first project, the "too small to need navigation" concern doesn't hold.
