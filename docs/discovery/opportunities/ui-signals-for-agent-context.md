---
name: "The UI captures interaction signals that could help agents understand user intent"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW capture the right interaction signals from the UI — what the user is viewing, editing, focusing on — so agents can infer context without being told?"
---

## Description

When a user navigates the discovery graph, their behavior carries signal: what they're looking at, how long they dwell, what they edit, what they search for. These signals could feed agent context — helping the agent understand what the user cares about right now without requiring explicit instruction.

This is a low-priority exploration for now, but worth thinking about as the collaboration model matures. The question isn't just "what signals does the UI emit" but "what signals actually help agents make better inferences" — there's a risk of collecting interaction data that looks useful but doesn't meaningfully improve agent behavior.

## Evidence

- Products like Cursor use open files, recent edits, and cursor position as implicit context — same principle applies to a discovery workspace
- The gap between "what the user is doing" and "what the agent knows" is the primary friction point in current Forge CLI sessions
