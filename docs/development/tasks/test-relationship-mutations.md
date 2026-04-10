---
name: "Test relationship mutations via GraphQL"
type: task
status: done
parent: relationship-mutations
workstream: graphql-api
---

Write integration tests for relationship operations through the GraphQL API:
- Create Opportunity with nested `supports: { connect: { where: { node: { id: objId } } } }` — verify both node and relationship created
- Disconnect a SUPPORTS relationship — verify both nodes survive, relationship gone
- Query `opportunities(where: { supports_SOME: { name_CONTAINS: "engagement" } })` — verify relationship filtering works
- Build full chain: Objective → Opportunity → Idea → Assumption → Experiment, each connected via the correct typed relationship
- Query from Experiment, traverse up the full chain via relationships — verify correct data at each level
