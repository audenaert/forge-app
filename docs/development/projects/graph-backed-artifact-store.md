---
name: "Graph-backed artifact store with GraphQL API"
type: project
status: scoping
from_discovery: graph-backed-artifact-store
children:
  - infrastructure-and-connection
  - discovery-graph-schema
  - development-graph-schema
  - tenancy-schema
  - api-foundation
  - discovery-artifact-api
  - development-artifact-api
  - domain-scoping-and-auth
workstreams:
  - graph-data-layer
  - graphql-api
milestones:
  - m1-discovery-graph-end-to-end
  - m2-full-artifact-taxonomy
  - m3-multi-tenant-auth
---

## Overview

Build a persistent graph database (Neo4j) as the canonical store for all Forge discovery and development artifacts, exposed through a GraphQL API. This is the computational substrate that everything else in Forge Workspace builds on — UIs, AI agent integration, collaborative features, and analytics all depend on a queryable, traversable graph model.

## Goals

1. Model the full Forge artifact taxonomy as a typed property graph with enforced relationships
2. Expose the graph through a GraphQL API that supports CRUD, relationship traversal, and graph queries
3. Build multi-tenancy (Organization → Domain → User) into the schema from day one
4. Provide a foundation that AI agents and human UIs can both build against

## Constraints

- Neo4j as the graph database (run via Docker for local dev)
- TypeScript strict mode for all application code
- GraphQL API — not REST
- Multi-tenant data model from the start; auth enforcement can be simple (API key per domain) initially
- Must live in the monorepo under `apps/` and `packages/`

## Scope

### In scope

- Neo4j graph schema for all artifact types (discovery + development layers)
- Organization, Domain, and User nodes with membership edges
- GraphQL API server with typed schemas per artifact type
- CRUD mutations for all node and edge types
- Relationship traversal queries (e.g., "all untested assumptions for ideas under opportunity X")
- Graph health queries (orphaned nodes, thin branches, confidence gaps)
- API key auth at the Domain level
- Docker Compose for local Neo4j

### Out of scope

- Human-facing UIs (canvas, tree sidebar, wiki)
- Real-time collaboration / subscriptions
- Vector embeddings and semantic search
- RBAC, Teams, OAuth/SSO
- Migration tooling from Markdown files
- CI/CD and deployment infrastructure

## MVP Slice (Milestone 1)

The thinnest vertical slice that proves the architecture end-to-end:

- Neo4j running via Docker Compose
- Graph schema for the **5 core discovery types**: Objective, Opportunity, Idea, Assumption, Experiment
- Typed relationships between them: `supports`, `addresses`, `assumed_by`, `tests`
- GraphQL API with queries and mutations for these 5 types
- At least one traversal query demonstrating graph power: "given an opportunity, return all ideas, their assumptions, and which assumptions have been tested"
- Single hard-coded Domain (no multi-org auth yet)
- Tests proving the schema, API, and traversal work

This proves the graph model fits the artifact taxonomy, GraphQL can express the queries agents need, and the architecture is sound — before investing in the full 16-type schema and multi-tenancy.

## Specs and ADRs

- **Spec:** [M1: Discovery graph MVP](../specs/m1-discovery-graph-mvp.md)
- **ADR-001:** [Use Neo4j as the graph database](../adrs/adr-001-neo4j-as-graph-database.md)
- **ADR-002:** [Use @neo4j/graphql for the API layer](../adrs/adr-002-neo4j-graphql-library.md)

## Open Questions

- **Schema versioning**: How do we handle graph schema migrations as the artifact taxonomy evolves?
- **Agent read model**: Polling via GraphQL queries, or will agents eventually need subscriptions/event streams?
- **Embedding integration**: Node properties in Neo4j, separate vector store, or both? (Deferred — not in initial scope.)
