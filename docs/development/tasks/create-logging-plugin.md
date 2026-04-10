---
name: "Create query timing and startup logging"
type: task
status: done
parent: health-check-and-logging
workstream: graphql-api
---

Add structured logging:

**Startup logging** in `server.ts`:
- Log Neo4j URI (not credentials) on connection
- Log constraint creation results
- Log schema generation completion
- Log server URL and port

**Query timing** as an Apollo Server plugin in `apps/api/src/plugins/queryTiming.ts`:
- Record start time in `requestDidStart`
- Log operation name and duration in ms in `willSendResponse`
- Do NOT log query variables (may contain user data)

**Error logging:**
- Log error code, message, and operation name on errors
- Do NOT log Neo4j credentials
