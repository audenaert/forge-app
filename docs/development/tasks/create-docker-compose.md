---
name: "Create docker-compose.yml"
type: task
status: done
parent: docker-compose-neo4j
workstream: graph-data-layer
---

Create `docker-compose.yml` at the monorepo root with Neo4j service:
- Image: `neo4j:5-community`
- Ports: 7474 (browser), 7687 (bolt)
- Environment: `NEO4J_AUTH=neo4j/forgedev`
- Named volume `neo4j_data` for persistence
- Health check: `neo4j status` with 10s interval, 5 retries
