---
name: "Typed relationship edges"
type: story
status: draft
parent: discovery-graph-schema
children:
  - test-relationship-traversal
  - test-belongs-to-domain
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "SUPPORTS relationship: Opportunity → Objective, traversable in both directions (Opportunity.supports, Objective.supportedBy)"
  - "ADDRESSES relationship: Idea → Opportunity, traversable in both directions (Idea.addresses, Opportunity.addressedBy)"
  - "ASSUMED_BY relationship: Assumption → Idea, traversable in both directions (Assumption.assumedBy, Idea.assumptions)"
  - "TESTS relationship: Experiment → Assumption, traversable in both directions (Experiment.tests, Assumption.testedBy)"
  - "BELONGS_TO relationship: all 5 types → Domain"
  - "Relationship connect/disconnect operations work in create and update mutations"
  - "Creating a node with nested connect in a single mutation works atomically"
---

## Description

Verify that all typed relationships defined in the SDL work correctly — bidirectional traversal, connect/disconnect, and nested creation. This story is primarily testing/verification since the relationships are defined in the SDL from the previous story.
