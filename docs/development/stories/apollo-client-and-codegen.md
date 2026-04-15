---
name: "Apollo Client and GraphQL codegen"
type: story
status: complete
parent: discovery-explorer
workstream: web-client
milestone: m1-web-discovery-explorer
phase: M1a
depends_on:
  - scaffold-apps-web
acceptance_criteria:
  - "@apollo/client ^3.x is installed in apps/web"
  - "apps/web/src/lib/apollo.ts exports a configured ApolloClient using createHttpLink with uri from VITE_API_URL (default http://localhost:4000/graphql) and x-api-key from VITE_API_KEY"
  - "apps/web/src/main.tsx wraps <App /> in <ApolloProvider client={client} />"
  - "@graphql-codegen/cli ^5.x and @graphql-codegen/client-preset are installed as devDependencies"
  - "apps/web/codegen.ts configures the client preset against the running API schema at http://localhost:4000/graphql with documentMode: documentNode, outputting to src/lib/graphql/generated/"
  - "apps/web/package.json has a `codegen` script (`graphql-codegen`) and the generated directory is added to .gitignore's allowlist so codegen output IS committed"
  - "`npm run codegen --workspace=apps/web` runs successfully against a locally-running apps/api and writes typed documents into src/lib/graphql/generated/ — this proves the schema introspection + output pipeline end to end (no hand-rolled smoke query required)"
  - "Vitest tests for apps/web/src/lib/apollo.ts verify the client is constructed with the expected uri and header wiring, using a mocked environment"
  - "A README section or apps/web/README.md snippet documents the codegen workflow (start api, run npm run codegen --workspace=apps/web)"
---

## Description

Wire the web client's data layer: Apollo Client configured against `apps/api`, GraphQL codegen configured to produce typed document nodes from hand-written `.graphql` operations. No real queries yet — those arrive with their feature stories.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Apollo Client setup", "GraphQL codegen".
- The API reads `x-api-key` (Express lowercases header names). Use that canonical casing.
- `DISABLE_AUTH=true` on the API lets any key resolve to a default-ish domain in dev, but this story should not hard-code that — the client just forwards whatever `VITE_API_KEY` is set to.
- Generated files are committed to git so CI does not need a running API server to build. Update `.gitignore` if needed to NOT ignore `src/lib/graphql/generated/`.
- Do NOT add feature queries yet (objectives, discoveryHealth, opportunitySubgraph). Those live in the dashboard and subgraph view stories.
