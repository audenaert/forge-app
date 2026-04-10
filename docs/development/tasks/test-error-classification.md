---
name: "Test error classification"
type: task
status: done
parent: error-classification-plugin
workstream: graphql-api
---

Write integration tests for error responses:
- Create two Domains with the same slug → verify `CONSTRAINT_VIOLATION` code and constraint name in response
- Send mutation with missing required `name` field → verify `VALIDATION_ERROR`
- Send mutation with invalid enum value → verify `VALIDATION_ERROR`
- Verify all error responses include `extensions.code`
