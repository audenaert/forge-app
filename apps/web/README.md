# @forge-workspace/web

The Etak Discovery Explorer web client. Read-only today — layers CRUD on later.

Stack: Vite 6 + React 19 + TanStack Router + Tailwind v4 + shadcn/ui + Apollo Client + GraphQL codegen.

## Development

```bash
# From the repo root:
docker compose up -d neo4j           # start Neo4j
npm run dev --workspace=apps/api     # start the GraphQL API at http://localhost:4000/graphql
npm run seed                         # populate the `seed` domain (first time only)
npm run dev --workspace=apps/web     # start the web client
```

The client authenticates to `apps/api` via `VITE_API_KEY` (header: `x-api-key`). For local development against the `seed` domain, set:

```
# apps/web/.env.local
VITE_API_URL=http://localhost:4000/graphql
VITE_API_KEY=seed-dev-key
```

## GraphQL codegen

Typed operations are generated from the running API's schema into `src/lib/graphql/generated/`. Generated files are committed so the build does not depend on a running API server.

```bash
# From the repo root, with apps/api running and the seed domain populated:
npm run codegen --workspace=apps/web
```

The codegen config lives in `apps/web/codegen.ts`. It reads the schema from `http://localhost:4000/graphql` and authenticates with `seed-dev-key` by default. Override via environment variables if needed:

```bash
CODEGEN_API_URL=http://localhost:4001/graphql CODEGEN_API_KEY=my-key npm run codegen --workspace=apps/web
```

Re-run `codegen` whenever you add or modify a `.graphql` operation file in `apps/web/src/lib/graphql/`, or when the schema in `packages/graph` changes.
