---
name: "Create .env.example"
type: task
status: todo
parent: docker-compose-neo4j
workstream: graph-data-layer
---

Create `.env.example` at the monorepo root documenting all environment variables:
- `NEO4J_URI=bolt://localhost:7687`
- `NEO4J_USER=neo4j`
- `NEO4J_PASSWORD=forgedev`
- `PORT=4000`

Add `.env` to `.gitignore` (already has `.env` entry — verify).
