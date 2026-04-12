---
name: "AI tooling will bring PM and developer roles closer together"
type: assumption
status: untested
importance: high
evidence: medium
assumed_by:
  - wiki-style-discovery-navigator
---

## Description

A foundational assumption behind Forge's design: AI tooling is collapsing the gap between product management and development work. The roles will likely remain distinct, but they'll overlap significantly more and require much closer collaboration. Developers will engage more with discovery artifacts (opportunities, assumptions, evidence), and PMs will engage more with technical implementation decisions.

This assumption shapes the navigator's design — rather than building separate "PM view" and "dev view" experiences, we're building a single tool that serves both audiences. If this assumption is wrong and the roles remain siloed, the navigator might need to translate between vocabularies more aggressively.

## Why we believe this

- AI coding assistants (Cursor, Copilot, Claude Code) are already shifting developer work toward higher-level guidance and away from line-by-line implementation
- The Forge vision explicitly targets teams where "the developer's role is increasingly to guide agentic builders toward the right deliverables rather than write all the code themselves"
- Cross-functional collaboration patterns in continuous discovery (CDH) already blur these boundaries — AI tooling accelerates that trend

## How to test

Observe how developers and PMs interact with early Forge prototypes. Do developers engage with discovery artifacts when they're accessible? Do they find the vocabulary barrier significant or natural?
