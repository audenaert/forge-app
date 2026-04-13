# `@etak/cli`

Scaffold — implementation in progress.

The Etak CLI is the local-first interface for creating, updating, linking, and
listing discovery artifacts (objectives, opportunities, ideas, assumptions,
experiments, critiques) on a typed knowledge graph.

This package currently contains only the scaffold: `etak --version` and
`etak --help` work, and the command namespaces are declared as placeholders.
Command implementations land in subsequent stories on the `etak-cli-core`
workstream.

## Reference

- Design specification: [`docs/design.md`](./docs/design.md)
- Design brief: [`docs/design-brief.md`](./docs/design-brief.md)
- Milestone M1 (prove abstraction): see
  `docs/development/milestones/etak-cli-m1-prove-abstraction.md`

## Local use

```
# from the package root
npm run build       # tsup → dist/cli.js
node dist/cli.js --version
node dist/cli.js --help

# dev loop
npm run dev -- --help
```

## Tests

Vitest is configured with three project roots that map to the layers of the
CLI:

- `unit` — schema, formatter, slug, and other pure unit tests
- `adapter-contract` — the shared adapter contract suite run against every
  adapter implementation
- `cli-e2e` — end-to-end tests that spawn the built `dist/cli.js` binary

Run `npm test` to build and execute all three projects.
