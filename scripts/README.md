# scripts/

Operator and developer utilities. These are **not** part of the app build and
are not published. They exist to make local development and demos tractable.

## `seed.ts` — populate the demo `seed` domain

Creates a dedicated `seed` domain with a representative catalogue of
discovery artifacts (objectives, opportunities, ideas, assumptions,
experiments) that the web UI discovery explorer demos against. The web UI
is useless against an empty graph, and the integration test suite tears
down its own data — so we need a persistent, idempotent dataset that lives
in its own domain.

### Why a separate domain (not `default`)

The `default` domain is used by `DISABLE_AUTH=true` for ad-hoc local
testing. Deliberately keeping the seed data in a separate `seed` domain
prevents the two workflows from colliding.

### Why this writes directly to Neo4j (deliberate exception)

This script is the **only** place in the repo that writes to Neo4j outside
of the GraphQL API. This is a deliberate exception to the "use the API,
not the data layer" guidance, scoped to this dev-only utility. The
rationale:

- The API authenticates every request against a domain via `x-api-key`
  (see `apps/api/src/auth.ts`).
- `Domain.apiKey` is `@selectable(onRead: false)` on the schema — nothing
  can read it back.
- There is no mechanism over GraphQL alone to mint a fresh domain and
  install a new api key.
- `DISABLE_AUTH=true` short-circuits to the `default` domain, which is
  the wrong target.

The deeper gap — that there is no operator surface for tenant provisioning
— is captured as a discovery opportunity at
[`docs/discovery/opportunities/domain-provisioning-has-no-admin-surface.md`](../docs/discovery/opportunities/domain-provisioning-has-no-admin-surface.md).
That's a product-level problem to solve properly later; for now, this
dev-only script is the pragmatic workaround.

### How to run

```bash
# 1. Start Neo4j
docker compose up neo4j -d

# 2. (Optional but recommended) run the API once so constraints get applied.
#    The seed script does not apply constraints — it assumes the API has
#    already done so. If you've never run the API against this Neo4j
#    instance, start it once:
npm run dev --workspace=apps/api
# Ctrl-C once you see "Forge API ready"

# 3. Seed
npm run seed
```

Running the seed is **idempotent**: the script deletes the `seed` domain
(cascading all artifacts that belong to it) and recreates everything from
scratch. Running it twice leaves the graph in the same state. It never
touches the `default` domain, any test fixtures, or any other domain.

### Using the seed data from the web client

Set:

```bash
# apps/web/.env.local
VITE_API_URL=http://localhost:4000/graphql
VITE_API_KEY=seed-dev-key
```

Then start the API and web client:

```bash
docker compose up neo4j -d
npm run dev --workspace=apps/api   # one terminal
npm run dev --workspace=apps/web   # another terminal
```

The web client will send `x-api-key: seed-dev-key` on every GraphQL
request, the API will resolve that to the `seed` domain, and every query
will be automatically scoped to the seed data.

### About the api key

The api key is the well-known dev-only constant `seed-dev-key`. It is
intentionally **not** a secret and is checked in to `apps/web/.env.example`.
Never reuse this value in a production domain — it exists solely so local
contributors and demo scripts can converge on a shared key without
generating per-run randomness.

The key is stored in Neo4j as its SHA-256 hash (matching the scheme in
`apps/api/src/auth.ts`). The seed script hashes `seed-dev-key` the same
way when creating the domain node, so authentication works end-to-end
against a local API.

### What the seed creates

Counts are asserted by `scripts/seed.test.ts`:

| Artifact     | Count | Notes                                                                 |
|--------------|-------|-----------------------------------------------------------------------|
| Objectives   | 3     | All ACTIVE; realistic multi-paragraph markdown bodies                 |
| Opportunities| 5     | 1 deliberately orphaned (no objective)                                |
| Ideas        | 7     | 1 deliberately unrooted (no opportunity) and has no assumptions       |
| Assumptions  | 12    | 1 unrooted; 3 untested HIGH-importance with no experiment; mixed state|
| Experiments  | 5     | 4 complete (mix of results), 1 planned                                |

Every artifact has a multi-paragraph markdown body with headings, lists,
and inline formatting — so the artifact-page renderer has realistic
content to validate against.

## `seed.test.ts` — end-to-end integration test

A Vitest suite that:

1. Spins up a Neo4j testcontainer
2. Starts an in-process Apollo server with the real schema
3. Runs `runSeed()` against the container
4. Queries `discoveryHealth(domainSlug: "seed")` **via GraphQL with the
   `x-api-key: seed-dev-key` header** — this is the end-to-end check that
   the api-key hashing is right
5. Asserts the counts match `EXPECTED_COUNTS`
6. Re-runs the seed and re-asserts (verifies idempotency)

Run with:

```bash
npx vitest run scripts/seed.test.ts
```

The test is part of the root `npm test` suite (via the
`scripts/**/*.test.ts` include in `vitest.config.ts`).
