---
name: "Create discovery.graphql"
type: task
status: todo
parent: discovery-type-definitions
workstream: graph-data-layer
---

Create `packages/graph/src/typeDefs/discovery.graphql`:
- All enums: `ObjectiveStatus`, `OpportunityStatus`, `IdeaStatus`, `AssumptionStatus`, `AssumptionImportance`, `AssumptionEvidence`, `ExperimentStatus`, `ExperimentMethod`, `ExperimentResult` — all UPPERCASE values
- 5 `@node` types: `Objective`, `Opportunity`, `Idea`, `Assumption`, `Experiment`
- Each type includes: `id: ID! @id`, `name: String!`, `status`, `body: String`, `createdAt`/`updatedAt` via `@timestamp`, nullable `domain: Domain @relationship`
- All relationship fields per spec: `supports/supportedBy`, `addresses/addressedBy`, `assumedBy/assumptions`, `tests/testedBy`
- Experiment includes: `method`, `successCriteria`, `duration`, `effort: EffortLevel`, `result`, `learnings`
