---
name: "AI agents lose context between sessions and need the graph to reconstruct it"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW make the discovery graph rich enough that an agent starting a fresh session can reconstruct the context it needs to be useful — without the user having to re-explain?"
---

## Description

Humans carry context across sessions in their heads. AI agents start fresh every time. The discovery graph is the agent's institutional memory — but only if it's rich enough to reconstruct context. If artifact pages are terse summaries with relationships implied rather than explicit, the agent misses nuance every invocation and the user has to re-explain what they're working on and why.

This has two sides: the **data richness** side (body content, evidence, decision rationale, and critique history must be treated as load-bearing, not optional) and the **context clue** side (the UI should surface signals about what the user is doing — what they're viewing, what they recently changed, what's in focus — so agents can infer intent without being told).

## Evidence

- Current Forge CLI sessions require users to specify context manually ("look at idea X", "I'm working on project Y") — the tool doesn't know what the user cares about right now
- Products like Cursor and Copilot use open files, recent edits, and cursor position as implicit context signals — the same principle applies to a discovery workspace
- Rich artifact content is already the norm in the Forge discovery graph (the existing artifacts have substantial body text, evidence sections, and open questions)
