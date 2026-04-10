---
name: "Health check and logging"
type: story
status: draft
parent: api-foundation
children:
  - create-health-endpoint
  - create-logging-plugin
workstream: graphql-api
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "GET /health returns 200 with {status: 'ok'} when Neo4j is reachable (verified via a simple Cypher query)"
  - "GET /health returns 503 with {status: 'error'} when Neo4j is unreachable"
  - "On startup, logs: Neo4j URI (not credentials), constraint creation results, schema generation, server URL and port"
  - "On each GraphQL request, logs: query/mutation operation name and duration in milliseconds"
  - "On errors, logs: error code, message, and operation name — does NOT log full query variables (may contain user data)"
  - "Neo4j credentials are never logged"
---

## Description

Add a health check endpoint and structured logging to the API server. The health check verifies actual Neo4j connectivity (not just that the server process is running). Query timing is implemented as an Apollo Server plugin.
