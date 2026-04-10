---
name: "Development graph schema"
type: epic
status: complete
parent: graph-backed-artifact-store
children: []
workstream: graph-data-layer
milestone: m2-full-artifact-taxonomy
---

## Scope

Model all development work item types and their relationships in Neo4j, extending the data access layer.

### Stories (initial)

- Initiative, Project, Epic, Story, Task nodes (+ Enhancement, Bug, Chore, Spike)
- Spec, ADR, Workstream, Milestone nodes
- Hierarchical edges — parent/children, workstream/milestone assignment
- Cross-graph bridge — from_discovery linking between development items and discovery ideas
