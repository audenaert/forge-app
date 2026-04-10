---
name: "Test @timestamp behavior"
type: task
status: todo
parent: crud-mutations-discovery
workstream: graphql-api
---

Write integration tests verifying timestamp auto-generation:
- On create: `createdAt` is set to current time, `updatedAt` is null
- On update: `updatedAt` is set to current time, `createdAt` is unchanged from original
- `createdAt` cannot be manually set or overridden in create input
- `updatedAt` cannot be manually set in update input
