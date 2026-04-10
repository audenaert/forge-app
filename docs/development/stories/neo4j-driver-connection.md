---
name: "Neo4j driver with connection management"
type: story
status: complete
parent: infrastructure-and-connection
children:
  - create-driver-module
  - add-verify-connectivity
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "createDriver() returns a configured neo4j-driver instance using NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD env vars with localhost defaults"
  - "driver.verifyConnectivity() is called on startup — if Neo4j is unreachable, the process exits with a clear error message"
  - "The driver is exported from packages/graph for use by schema setup and tests"
  - "Given Neo4j is not running, when the driver attempts to connect, then the error message includes the URI it tried to connect to (not credentials)"
---

## Description

Create the Neo4j driver module in packages/graph/src/driver.ts. The driver is the single point of connection to Neo4j — all other code goes through it.
