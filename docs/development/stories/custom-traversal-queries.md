---
name: "Custom traversal queries"
type: story
status: draft
parent: discovery-graph-schema
children: []
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "opportunitySubgraph(opportunityId, domainSlug) returns nested tree: Opportunity → Ideas → Assumptions → Experiments"
  - "Given a branching graph (1 Opp → 2 Ideas → 3 Assumptions → 2 Experiments), the result contains no duplicates"
  - "Given a non-existent opportunityId, the query returns null"
  - "untestedAssumptions(domainSlug, minImportance?) returns Assumptions with status UNTESTED and no TESTS edges"
  - "untestedAssumptions filters correctly by minImportance when provided"
  - "Given an empty domain, untestedAssumptions returns an empty array"
  - "discoveryHealth(domainSlug) returns accurate counts for all 8 metrics"
  - "Given an empty domain, discoveryHealth returns all zeros"
  - "All traversal queries are scoped to the specified domain"
---

## Description

Implement the three custom @cypher traversal queries in the SDL: opportunitySubgraph, untestedAssumptions, and discoveryHealth. These use CALL {} subqueries to avoid cartesian product issues (validated in the spike).

Defines non-@node return types: OpportunitySubgraph, IdeaWithAssumptions, AssumptionWithExperiments, ExperimentSummary, DiscoveryHealth.
