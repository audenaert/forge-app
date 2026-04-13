---
name: "Users need their discovery data to be accessible and portable, not locked in a database"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW ensure users always have access to their discovery data in open, portable formats — so adopting Forge doesn't mean risking data lock-in?"
---

## Description

If discovery artifacts live only in a Neo4j database behind a GraphQL API, users have a reasonable fear: what happens if I stop using this tool? Teams that have been burned by vendor lock-in (Jira migrations, Confluence exports) are especially wary of putting their thinking into a system they can't easily leave.

The opportunity is to make the data layer transparent and portable — exports, open formats, API access — so that using Forge is a choice teams make continuously because it's valuable, not because switching costs are high.

## Evidence

- Data portability is a top concern in tool adoption for technical teams
- The current Forge workflow stores artifacts as Markdown files in a git repo — users already expect that level of ownership
- Competitors like Notion offer CSV/Markdown export as table stakes
