---
name: "Error classification plugin"
type: story
status: complete
parent: api-foundation
children:
  - create-error-plugin
  - test-error-classification
workstream: graphql-api
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "All GraphQL errors include an extensions.code field"
  - "Neo4j constraint violations → code: CONSTRAINT_VIOLATION with constraint name in extensions"
  - "GraphQL validation errors (missing required field, bad enum) → code: VALIDATION_ERROR"
  - "References to non-existent nodes (e.g., connect to missing Objective) → code: NOT_FOUND"
  - "Unexpected database or server failures → code: INTERNAL_ERROR"
  - "Error messages are actionable — they tell the caller what went wrong, not just that something failed"
  - "Given a duplicate Domain slug, the error response includes the constraint name and conflicting value"
---

## Description

Create an Apollo Server plugin that classifies errors by inspecting the underlying error type (Neo4jError with specific codes, GraphQL validation errors, etc.) and attaches a structured code extension. This lets AI agents programmatically distinguish bad input from infrastructure failures.
