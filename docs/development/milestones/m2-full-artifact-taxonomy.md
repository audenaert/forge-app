---
name: "M2: Full artifact taxonomy"
type: milestone
milestone_type: foundation
project: graph-backed-artifact-store
status: planned
target_date: null
workstream_deliverables:
  - workstream: graph-data-layer
    delivers: "Development types (Initiative through Task, Spec, ADR, Workstream, Milestone), cross-graph bridge (from_discovery linking)"
  - workstream: graphql-api
    delivers: "CRUD + hierarchy queries for all development types, graph health queries (orphaned nodes, thin branches, confidence gaps)"
demo_criteria: "Create a full discovery-to-development flow: objective through opportunities and ideas, then scope into a project with epics, stories, and tasks. Query the hierarchy from project down. Run graph health on the domain."
---

## What this milestone proves

- The pattern established in M1 scales to the full artifact taxonomy (~16 node types, ~15 edge types)
- The discovery-to-development bridge works (from_discovery linking)
- Graph health queries can detect structural issues across both layers

## What it enables

- The complete Forge artifact graph is queryable — both discovery and development layers
- AI agents can manage the full lifecycle: discovery through to task breakdown
- M3 can add multi-tenancy on top of the complete schema

## What it defers

- Multi-tenancy and auth (M3)
- Deferred discovery fields from M1 (may be addressed here if time permits)
- Vector embeddings, real-time subscriptions

## Notes

This milestone is mostly pattern replication. If M1 works, M2 is mechanical — same SDL patterns, same auto-generated CRUD, same testing approach applied to more types. The main new work is hierarchy queries (project → epics → stories → tasks) and the cross-graph bridge.
