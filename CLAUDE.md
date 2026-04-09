# Forge Workspace — Project Guide

## What This Is

A collaborative, mixed-initiative tool for AI-assisted product discovery and software development. The core concept: a spatial canvas, a typed knowledge graph (Opportunity Solution Tree), and AI agents that work alongside human collaborators — all synchronized on the same underlying model.

See `../forge/planning/forge-workspace-proposal.md` for the full vision.

## Repository Layout

```
apps/          Individual applications (web client, API server, etc.)
packages/      Shared libraries (graph model, UI components, etc.)
.claude/
  settings.json    Plugin config (uses forge plugin from ../forge)
  worktrees/       Git worktrees for local dev (gitignored, run: git worktree add)
```

## Monorepo

- npm workspaces — all `apps/*` and `packages/*` are workspace members
- Add a new app: `mkdir apps/<name>` then add its `package.json`
- Worktrees for feature branches: `git worktree add .claude/worktrees/<branch> -b <branch>`

## Conventions

- TypeScript strict mode throughout
- Apps under `apps/`, shared code under `packages/`
- Conventional commits: `feat/fix/chore/docs/refactor`
- Never commit directly to `main`

## Current State

Early scaffolding — no apps exist yet. Start here when adding the first application.
