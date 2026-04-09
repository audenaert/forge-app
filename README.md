# Forge Workspace

A collaborative, mixed-initiative environment for AI-assisted product discovery and software development.

Forge Workspace combines a spatial canvas, a structured opportunity graph (based on Teresa Torres' Opportunity Solution Tree), and AI agents that work alongside human collaborators to create, refine, and challenge discovery artifacts.

## Repository Structure

```
forge-workspace/
├── apps/          # Individual applications
└── packages/      # Shared libraries and utilities
```

## Development

This is an npm workspaces monorepo. Local development uses git worktrees, stored in `.claude/worktrees/` (gitignored).

```bash
# Install all dependencies
npm install

# Run all apps in dev mode
npm run dev
```

## Background

See the [project proposal](../forge/planning/forge-workspace-proposal.md) for the full vision.
