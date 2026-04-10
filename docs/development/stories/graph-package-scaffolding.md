---
name: "packages/graph package scaffolding"
type: story
status: draft
parent: infrastructure-and-connection
children:
  - create-tsconfig-base
  - scaffold-packages-graph
workstream: graph-data-layer
milestone: m1-discovery-graph-end-to-end
acceptance_criteria:
  - "packages/graph has a package.json with name @forge-workspace/graph"
  - "tsconfig.base.json exists at the monorepo root with strict mode, shared by all packages"
  - "packages/graph/tsconfig.json extends the base config"
  - "neo4j-driver ^6.x and @neo4j/graphql ^7.x are installed as dependencies"
  - "graphql ^16.x is installed as a dependency"
  - "The package builds and type-checks cleanly with tsc --noEmit"
---

## Description

Scaffold the packages/graph workspace package with TypeScript config, dependencies, and directory structure. This establishes the monorepo conventions that apps/api will also follow.
