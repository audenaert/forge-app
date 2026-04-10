---
name: "Apollo Server scaffolding"
type: story
status: draft
parent: api-foundation
children:
  - scaffold-apps-api
  - create-server-entry
workstream: graphql-api
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "apps/api has package.json with name @forge-workspace/api and workspace dependency on @forge-workspace/graph"
  - "apps/api/tsconfig.json extends the base config"
  - "@apollo/server ^4.x is installed"
  - "Server starts via npx tsx src/server.ts, connects to Neo4j, and serves GraphQL on port 4000 (configurable via PORT env var)"
  - "Server calls driver.verifyConnectivity() on startup — fails fast with clear error if Neo4j is unreachable"
  - "GraphQL Playground is accessible at http://localhost:4000 for development"
  - "Context includes hard-coded domainSlug: 'default' (forward-compatible with future auth)"
---

## Description

Scaffold the apps/api workspace package with Apollo Server 4 mounting the schema from packages/graph. This is a thin HTTP shell — it imports the compiled schema, sets up the request context, and starts the server.
