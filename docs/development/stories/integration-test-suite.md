---
name: "Integration test suite"
type: story
status: draft
parent: discovery-artifact-api
children: []
workstream: graphql-api
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "Tests run against a real Neo4j instance via @testcontainers/neo4j (no mocking)"
  - "Single container shared across the test suite (beforeAll/afterAll)"
  - "Each test uses a unique domain slug for data isolation — no cleanup between tests"
  - "Test categories covered: schema/constraints, CRUD for all 5 types, relationship connect/disconnect, all 3 traversal queries, constraint violations, error classification, empty domain edge cases"
  - "No test depends on execution order of other tests"
  - "Tests pass in CI (GitHub Actions) with Docker available"
  - "Vitest is configured as the test runner with TypeScript support"
---

## Description

Build the comprehensive integration test suite for M1. This is the verification story — it proves everything works end-to-end against a real Neo4j instance. Tests cover CRUD, relationships, traversals, error handling, and edge cases.

Test data isolation uses unique domain slugs per test (e.g., test-${randomUUID().slice(0,8)}), so tests are inherently independent without needing cleanup.
