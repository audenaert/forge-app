---
name: "Docker Compose with Neo4j"
type: story
status: draft
parent: infrastructure-and-connection
children:
  - create-docker-compose
  - create-env-example
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "Given a fresh checkout, when I run docker compose up, then Neo4j is accessible on bolt://localhost:7687 within 60 seconds"
  - "Given Neo4j is running, when I open http://localhost:7474, then the Neo4j browser is accessible"
  - "Given Neo4j is running, when I run docker compose down, then the container stops cleanly"
  - "Given Neo4j was previously running with data, when I run docker compose up again, then data persists via the named volume"
  - "The Neo4j image version is pinned to neo4j:5-community"
---

## Description

Create the Docker Compose configuration for local Neo4j development. This is the foundation — every other story depends on a running Neo4j instance.
