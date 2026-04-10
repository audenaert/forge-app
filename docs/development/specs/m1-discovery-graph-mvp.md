---
name: "M1: Discovery graph MVP"
type: spec
status: complete
for: graph-backed-artifact-store
adrs:
  - adr-001-neo4j-as-graph-database
  - adr-002-neo4j-graphql-library
---

## Context

This spec covers Milestone 1 of the graph-backed artifact store project: the thinnest vertical slice that proves the architecture end-to-end. M1 delivers a running Neo4j instance, the 5 core discovery artifact types modeled as a graph, and a GraphQL API that supports CRUD and traversal queries.

M1 uses a single hard-coded Domain (no multi-org auth). The goal is to validate that @neo4j/graphql can express the Forge artifact taxonomy and that GraphQL can serve the traversal queries AI agents and UIs need.

**Related artifacts:**
- Project: `graph-backed-artifact-store`
- Opportunity: `no-computational-model-for-opportunity-exploration`
- ADR-001: Neo4j as graph database
- ADR-002: @neo4j/graphql for the API layer

## Current State

Greenfield. The monorepo has `apps/` and `packages/` directories with no application code. Neo4j, Apollo Server, and @neo4j/graphql are not yet installed. The artifact taxonomy is fully defined in the forge plugin's schema references (`/home/ec2-user/projects/forge/skills/discovery/references/schemas.md`).

## Proposed Approach

### Monorepo structure

```
packages/
  graph/
    src/
      typeDefs/
        discovery.graphql     # Objective, Opportunity, Idea, Assumption, Experiment
        common.graphql        # Shared enums, scalars, Domain node (placeholder)
      schema.ts               # Neo4jGraphQL setup, exports executable schema
      driver.ts               # Neo4j driver config, connection pooling
      seed.ts                 # Seed data for dev/testing
    package.json
    tsconfig.json

apps/
  api/
    src/
      server.ts               # Apollo Server setup, context, health check
      context.ts               # Request context (domain resolution)
    package.json
    tsconfig.json

docker-compose.yml              # Neo4j + (future: other services)
tsconfig.base.json              # Shared TypeScript config
```

`packages/graph` owns the schema and Neo4j integration. It exports the executable GraphQL schema and the Neo4j driver. `apps/api` is a thin HTTP shell — it imports the schema, mounts it on Apollo Server, and handles request context.

### Type definitions (SDL)

The 5 discovery types, plus a placeholder Domain node for future multi-tenancy. All types include `@node` for Neo4j label mapping, `@id` for auto-generated UUIDs (note: `@id` only generates IDs and removes the field from mutation inputs — it does **not** create database constraints; constraints are managed explicitly via Cypher), and `@timestamp` for audit fields.

```graphql
# common.graphql

type Domain @node {
  id: ID! @id
  slug: String!
  name: String!
  createdAt: DateTime! @timestamp(operations: [CREATE])
}
```

> **Note:** `slug` uniqueness is enforced via a database-level constraint (see Neo4j constraints section below), not via SDL directives. The `@unique` directive was removed in @neo4j/graphql v7.

```graphql
# discovery.graphql

enum ObjectiveStatus { ACTIVE PAUSED ACHIEVED ABANDONED }
enum OpportunityStatus { ACTIVE PAUSED RESOLVED ABANDONED }
enum IdeaStatus { DRAFT EXPLORING VALIDATED READY_FOR_BUILD BUILDING SHIPPED }
enum AssumptionStatus { UNTESTED VALIDATED INVALIDATED }
enum AssumptionImportance { HIGH MEDIUM LOW }
enum AssumptionEvidence { HIGH MEDIUM LOW }
enum ExperimentStatus { PLANNED RUNNING COMPLETE }
enum ExperimentMethod {
  USER_INTERVIEW PROTOTYPE_TEST FAKE_DOOR
  CONCIERGE_MVP DATA_ANALYSIS AB_TEST SURVEY
}
enum ExperimentResult { VALIDATED INVALIDATED INCONCLUSIVE }
enum EffortLevel { LOW MEDIUM HIGH }

type Objective @node {
  id: ID! @id
  name: String!
  status: ObjectiveStatus!
  body: String
  createdAt: DateTime! @timestamp(operations: [CREATE])
  updatedAt: DateTime! @timestamp(operations: [UPDATE])
  domain: Domain @relationship(type: "BELONGS_TO", direction: OUT)
  supportedBy: [Opportunity!]! @relationship(type: "SUPPORTS", direction: IN)
}

type Opportunity @node {
  id: ID! @id
  name: String!
  status: OpportunityStatus!
  hmw: String
  body: String
  createdAt: DateTime! @timestamp(operations: [CREATE])
  updatedAt: DateTime! @timestamp(operations: [UPDATE])
  domain: Domain @relationship(type: "BELONGS_TO", direction: OUT)
  supports: [Objective!]! @relationship(type: "SUPPORTS", direction: OUT)
  addressedBy: [Idea!]! @relationship(type: "ADDRESSES", direction: IN)
}

type Idea @node {
  id: ID! @id
  name: String!
  status: IdeaStatus!
  body: String
  createdAt: DateTime! @timestamp(operations: [CREATE])
  updatedAt: DateTime! @timestamp(operations: [UPDATE])
  domain: Domain @relationship(type: "BELONGS_TO", direction: OUT)
  addresses: [Opportunity!]! @relationship(type: "ADDRESSES", direction: OUT)
  assumptions: [Assumption!]! @relationship(type: "ASSUMED_BY", direction: IN)
}

type Assumption @node {
  id: ID! @id
  name: String!
  status: AssumptionStatus!
  importance: AssumptionImportance!
  evidence: AssumptionEvidence!
  body: String
  createdAt: DateTime! @timestamp(operations: [CREATE])
  updatedAt: DateTime! @timestamp(operations: [UPDATE])
  domain: Domain @relationship(type: "BELONGS_TO", direction: OUT)
  assumedBy: [Idea!]! @relationship(type: "ASSUMED_BY", direction: OUT)
  testedBy: [Experiment!]! @relationship(type: "TESTS", direction: IN)
}

type Experiment @node {
  id: ID! @id
  name: String!
  status: ExperimentStatus!
  method: ExperimentMethod
  successCriteria: String
  duration: String
  effort: EffortLevel
  result: ExperimentResult
  learnings: String
  body: String
  createdAt: DateTime! @timestamp(operations: [CREATE])
  updatedAt: DateTime! @timestamp(operations: [UPDATE])
  domain: Domain @relationship(type: "BELONGS_TO", direction: OUT)
  tests: [Assumption!]! @relationship(type: "TESTS", direction: OUT)
}
```

### Auto-generated operations

From these type definitions, @neo4j/graphql generates (per type):

**Queries:**
- `objectives(where: ObjectiveWhere, options: ObjectiveOptions): [Objective!]!`
- `objectivesConnection(where: ObjectiveWhere, ...): ObjectivesConnection!` (cursor pagination)
- Same pattern for all 5 types

**Mutations:**
- `createObjectives(input: [ObjectiveCreateInput!]!): CreateObjectivesMutationResponse!`
- `updateObjectives(where: ObjectiveWhere, update: ObjectiveUpdateInput): UpdateObjectivesMutationResponse!`
- `deleteObjectives(where: ObjectiveWhere): DeleteInfo!`
- Same pattern for all 5 types

**Relationship operations** (nested in create/update):
- `connect` / `disconnect` / `create` for each relationship field
- e.g., creating an Opportunity and connecting it to existing Objectives in a single mutation

**Filtering** (auto-generated `Where` types):
- Filter by any scalar field (`name_CONTAINS`, `status_IN`, `createdAt_GT`, etc.)
- Filter through relationships (`supports_SOME: { name_CONTAINS: "engagement" }`)

### Custom traversal queries

The auto-generated CRUD handles most operations. For complex graph traversals, we add custom queries via `@cypher` directives.

**Opportunity subgraph** — given an opportunity, return its full tree: ideas, their assumptions, which have experiments, and results.

> **Spike verified:** `@cypher` directives can return non-`@node` types (computed projections). `CALL {}` subqueries correctly prevent cartesian product duplication. Tested with branching data (1 Opp → 2 Ideas → 3 Assumptions). No custom resolvers needed.

Return types (non-`@node` types — computed projections, not stored entities):

```graphql
type ExperimentSummary {
  id: ID!
  name: String!
  status: ExperimentStatus!
  method: ExperimentMethod
  result: ExperimentResult
}

type AssumptionWithExperiments {
  id: ID!
  name: String!
  status: AssumptionStatus!
  importance: AssumptionImportance!
  evidence: AssumptionEvidence!
  experiments: [ExperimentSummary!]!
}

type IdeaWithAssumptions {
  id: ID!
  name: String!
  status: IdeaStatus!
  assumptions: [AssumptionWithExperiments!]!
}

type OpportunitySubgraph {
  id: ID!
  name: String!
  status: OpportunityStatus!
  hmw: String
  ideas: [IdeaWithAssumptions!]!
}

type Query {
  opportunitySubgraph(opportunityId: ID!, domainSlug: String!): OpportunitySubgraph
    @cypher(
      statement: """
      MATCH (opp:Opportunity {id: $opportunityId})-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
      CALL {
        WITH opp
        OPTIONAL MATCH (opp)<-[:ADDRESSES]-(idea:Idea)
        CALL {
          WITH idea
          OPTIONAL MATCH (idea)<-[:ASSUMED_BY]-(assumption:Assumption)
          CALL {
            WITH assumption
            OPTIONAL MATCH (assumption)<-[:TESTS]-(exp:Experiment)
            RETURN collect(exp { .id, .name, .status, .method, .result }) AS experiments
          }
          RETURN collect(assumption { .id, .name, .status, .importance, .evidence, experiments: experiments }) AS assumptions
        }
        RETURN collect(idea { .id, .name, .status, assumptions: assumptions }) AS ideas
      }
      RETURN opp { .id, .name, .status, .hmw, ideas: ideas } AS result
      """
      columnName: "result"
    )
}
```

**Untested assumptions** — high-importance assumptions with no experiments:

```graphql
type Query {
  untestedAssumptions(domainSlug: String!, minImportance: String): [Assumption!]!
    @cypher(
      statement: """
      MATCH (a:Assumption)-[:BELONGS_TO]->(:Domain {slug: $domainSlug})
      WHERE a.status = 'UNTESTED'
        AND (CASE WHEN $minImportance IS NOT NULL THEN a.importance = $minImportance ELSE true END)
        AND NOT EXISTS { (a)<-[:TESTS]-(:Experiment) }
      RETURN a
      ORDER BY a.importance DESC, a.createdAt ASC
      """
      columnName: "a"
    )
}
```

**Discovery health** — summary statistics for a domain. Uses `CALL {}` subqueries to isolate each count (prevents cartesian product from multiple OPTIONAL MATCH clauses).

```graphql
type DiscoveryHealth {
  totalObjectives: Int!
  totalOpportunities: Int!
  totalIdeas: Int!
  totalAssumptions: Int!
  totalExperiments: Int!
  untestedHighImportanceAssumptions: Int!
  ideasWithNoAssumptions: Int!
  orphanedOpportunities: Int!
}

type Query {
  discoveryHealth(domainSlug: String!): DiscoveryHealth
    @cypher(
      statement: """
      MATCH (d:Domain {slug: $domainSlug})
      CALL { WITH d MATCH (n:Objective)-[:BELONGS_TO]->(d) RETURN count(n) AS totalObjectives }
      CALL { WITH d MATCH (n:Opportunity)-[:BELONGS_TO]->(d) RETURN count(n) AS totalOpportunities }
      CALL { WITH d MATCH (n:Idea)-[:BELONGS_TO]->(d) RETURN count(n) AS totalIdeas }
      CALL { WITH d MATCH (n:Assumption)-[:BELONGS_TO]->(d) RETURN count(n) AS totalAssumptions }
      CALL { WITH d MATCH (n:Experiment)-[:BELONGS_TO]->(d) RETURN count(n) AS totalExperiments }
      CALL {
        WITH d
        MATCH (a:Assumption)-[:BELONGS_TO]->(d)
        WHERE a.status = 'UNTESTED' AND a.importance = 'HIGH'
          AND NOT EXISTS { (a)<-[:TESTS]-(:Experiment) }
        RETURN count(a) AS untestedHighImportanceAssumptions
      }
      CALL {
        WITH d
        MATCH (i:Idea)-[:BELONGS_TO]->(d)
        WHERE NOT EXISTS { (i)<-[:ASSUMED_BY]-(:Assumption) }
        RETURN count(i) AS ideasWithNoAssumptions
      }
      CALL {
        WITH d
        MATCH (o:Opportunity)-[:BELONGS_TO]->(d)
        WHERE NOT EXISTS { (o)-[:SUPPORTS]->(:Objective) }
        RETURN count(o) AS orphanedOpportunities
      }
      RETURN {
        totalObjectives: totalObjectives,
        totalOpportunities: totalOpportunities,
        totalIdeas: totalIdeas,
        totalAssumptions: totalAssumptions,
        totalExperiments: totalExperiments,
        untestedHighImportanceAssumptions: untestedHighImportanceAssumptions,
        ideasWithNoAssumptions: ideasWithNoAssumptions,
        orphanedOpportunities: orphanedOpportunities
      } AS result
      """
      columnName: "result"
    )
}
```

### Neo4j constraints and indexes

Applied on schema initialization via the neo4j-driver directly (not managed by @neo4j/graphql):

```
// Uniqueness constraints (also create indexes)
CREATE CONSTRAINT domain_slug IF NOT EXISTS FOR (d:Domain) REQUIRE d.slug IS UNIQUE
CREATE CONSTRAINT objective_id IF NOT EXISTS FOR (n:Objective) REQUIRE n.id IS UNIQUE
CREATE CONSTRAINT opportunity_id IF NOT EXISTS FOR (n:Opportunity) REQUIRE n.id IS UNIQUE
CREATE CONSTRAINT idea_id IF NOT EXISTS FOR (n:Idea) REQUIRE n.id IS UNIQUE
CREATE CONSTRAINT assumption_id IF NOT EXISTS FOR (n:Assumption) REQUIRE n.id IS UNIQUE
CREATE CONSTRAINT experiment_id IF NOT EXISTS FOR (n:Experiment) REQUIRE n.id IS UNIQUE

// Composite indexes for common query patterns
CREATE INDEX opp_domain_status IF NOT EXISTS FOR (n:Opportunity) ON (n.status)
CREATE INDEX assumption_domain_status IF NOT EXISTS FOR (n:Assumption) ON (n.status, n.importance)
```

Note: `@id` only auto-generates UUIDs and removes the field from mutation inputs — it does **not** create database constraints. The `@unique` directive was removed in v7. We manage all constraints explicitly via Cypher for clarity and migration control.

### Docker Compose

```yaml
services:
  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"  # HTTP (browser)
      - "7687:7687"  # Bolt (driver)
    environment:
      NEO4J_AUTH: neo4j/forgedev
      NEO4J_PLUGINS: '[]'
    volumes:
      - neo4j_data:/data
    healthcheck:
      test: ["CMD", "neo4j", "status"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  neo4j_data:
```

### packages/graph

```typescript
// driver.ts
import neo4j, { Driver } from 'neo4j-driver';

export function createDriver(): Driver {
  return neo4j.driver(
    process.env.NEO4J_URI ?? 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER ?? 'neo4j',
      process.env.NEO4J_PASSWORD ?? 'forgedev'
    )
  );
}

// schema.ts
import { Neo4jGraphQL } from '@neo4j/graphql';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Driver } from 'neo4j-driver';

function loadTypeDefs(): string {
  const dir = join(__dirname, 'typeDefs');
  const common = readFileSync(join(dir, 'common.graphql'), 'utf-8');
  const discovery = readFileSync(join(dir, 'discovery.graphql'), 'utf-8');
  return [common, discovery].join('\n');
}

export async function createSchema(driver: Driver) {
  const typeDefs = loadTypeDefs();
  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  return neoSchema.getSchema();
}
```

### Error classification

All GraphQL errors include a `code` extension so callers can programmatically distinguish error types. Implemented as an Apollo Server plugin that inspects the original error and maps it:

| Code | When | Example |
|---|---|---|
| `VALIDATION_ERROR` | Invalid input (missing required field, bad enum value) | `name` is required |
| `CONSTRAINT_VIOLATION` | Database uniqueness constraint violated | Duplicate domain slug |
| `NOT_FOUND` | Referenced node doesn't exist | Connect to non-existent Objective |
| `INTERNAL_ERROR` | Unexpected database or server failure | Neo4j connection lost |

Error response shape:

```json
{
  "errors": [{
    "message": "Domain with slug 'default' already exists",
    "extensions": {
      "code": "CONSTRAINT_VIOLATION",
      "constraint": "domain_slug"
    }
  }]
}
```

The plugin catches Neo4j errors (constraint violations throw `Neo4jError` with specific codes), GraphQL validation errors (already classified by Apollo), and wraps everything else as `INTERNAL_ERROR`. This lets AI agents decide: retry on `INTERNAL_ERROR`, fix input on `VALIDATION_ERROR`, and surface `CONSTRAINT_VIOLATION` to the user.

### apps/api

```typescript
// server.ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createDriver } from '@forge-workspace/graph/driver';
import { createSchema } from '@forge-workspace/graph/schema';

async function main() {
  const driver = createDriver();

  // Fail fast if Neo4j is unreachable
  await driver.verifyConnectivity();
  console.log('Connected to Neo4j');

  const schema = await createSchema(driver);

  const server = new ApolloServer({ schema });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT ?? 4000) },
    context: async ({ req }) => ({
      // M1: hard-coded domain. M2+ will resolve from API key header.
      domainSlug: 'default',
    }),
  });

  console.log(`Forge API ready at ${url}`);
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
```

### Testing strategy

**Integration tests against a real Neo4j instance** using `@testcontainers/neo4j`. No mocking the database — the graph queries are the critical path and must be tested against the real engine.

```typescript
// Example test structure
import { Neo4jContainer } from '@testcontainers/neo4j';

describe('Discovery graph', () => {
  let container: StartedNeo4jContainer;
  let driver: Driver;

  beforeAll(async () => {
    container = await new Neo4jContainer('neo4j:5-community').start();
    driver = neo4j.driver(container.getBoltUri(), neo4j.auth.basic('neo4j', 'neo4j'));
  }, 60_000);

  afterAll(async () => {
    await driver.close();
    await container.stop();
  });

  // Each test creates its own domain with a unique slug for isolation.
  // No cleanup needed — domain scoping keeps tests independent.
  function testDomain() {
    return `test-${randomUUID().slice(0, 8)}`;
  }

  // Test CRUD via GraphQL
  // Test relationship creation
  // Test traversal queries
  // Test filtering
});
```

**Test categories:**

1. **Schema tests** — verify constraints are created, type definitions compile, schema generates without errors
2. **CRUD tests** — create/read/update/delete each discovery type via GraphQL mutations and queries
3. **Relationship tests** — connect/disconnect nodes, verify bidirectional traversal
4. **Traversal tests** — opportunitySubgraph, untestedAssumptions, discoveryHealth with known seed data
5. **Edge cases** — delete a node with relationships, create duplicate slugs (expect constraint violation), empty graph health

**Test runner:** Vitest (fast, TypeScript-native, good monorepo support).

### Package dependencies

```
packages/graph:
  @neo4j/graphql: ^7.x
  neo4j-driver: ^6.x
  graphql: ^16.x

apps/api:
  @apollo/server: ^4.x
  @forge-workspace/graph (workspace dependency)

devDependencies (root):
  typescript: ^5.x
  tsx: ^4.x
  vitest: ^3.x
  @testcontainers/neo4j: ^11.x
  testcontainers: ^11.x
```

## Deferred Fields (intentionally excluded from M1)

The following fields and types from the source discovery schema are excluded from M1 to keep scope thin. They will be added in later milestones.

| Field / Type | Source location | Reason for deferral |
|---|---|---|
| `Experiment.interpretation_guide` | String field describing how to read results | Not needed for M1 graph validation |
| `Experiment.action_plan` | Structured object (`if_validated`, `if_invalidated`, `if_inconclusive`) | Requires a design decision on how to model structured sub-objects in Neo4j (nested map vs. separate nodes) |
| `result_informs` relationship | Experiment → Ideas/Opportunities | Cross-cutting feedback loop — important but not needed for the core tree structure in M1 |
| `evidenced_by` / `contradicted_by` relationships | Evidence → Opportunity/Assumption | Requires an Evidence node type not yet defined |
| `Critique` type | Full type with `target`, `personas_used`, `frameworks_used` | Polymorphic `target` relationship (can point to any node type) needs design work for @neo4j/graphql |
| `Idea.delivered_by` | Link to specs/PRs | Development-layer bridge — deferred to the development graph schema epic |

## Spike Results

**Spike: `@cypher` with non-`@node` return types and `CALL {}` subqueries** — **PASSED**

Tested against @neo4j/graphql 7.x + Neo4j 5-community with branching data (1 Opportunity → 2 Ideas → 3 Assumptions):

- `@cypher` directives can return non-`@node` types (computed projections like `OpportunitySubgraph`, `DiscoveryHealth`). No custom resolvers needed.
- `CALL {}` subqueries correctly prevent cartesian product duplication in nested aggregation.
- `discoveryHealth` with isolated `CALL {}` counts returns correct results.

**Additional finding:** @neo4j/graphql v7 requires single (non-list) `@relationship` fields to be **nullable**. `domain: Domain!` is rejected; must be `domain: Domain`. This is because Neo4j cannot guarantee a node will always have exactly one outbound relationship. SDL updated throughout this spec.

## Open Questions

1. **`@authorization` context variable injection:** The planned domain scoping pattern requires `@authorization(filter: [{ where: { node: { domain: { slug: { eq: "$context.domainSlug" } } } } }])`. Need to verify that context variables (not just JWT claims) can be used in authorization filters. This determines whether M3 domain scoping uses `@authorization` directives or custom middleware.

2. **Seed data strategy:** Should seed data be Cypher scripts, GraphQL mutations, or a TypeScript seed function? Cypher scripts are simplest for dev; GraphQL mutations test the API path. Recommend Cypher scripts for M1, with a TypeScript wrapper that runs them via the driver.

3. **~~`.graphql` file loading in builds~~** — Resolved: use `tsx` as the runtime for the API server (no pre-compilation step). The `readFileSync` pattern works fine with `tsx`. If a compiled build is needed later (e.g., Docker image optimization), add a copy step then.

## Risks

- **Enum casing:** SDL uses UPPERCASE per GraphQL convention (`UNTESTED`, `HIGH`, `ACTIVE`, etc.). @neo4j/graphql stores the value exactly as defined in the SDL, so Neo4j properties will contain uppercase strings. The source Markdown schemas use lowercase (`untested`, `high`). Any future migration tooling must transform case. The `@cypher` queries in this spec use uppercase string literals to match.
- **Input validation:** M1 does not enforce max field lengths or body sanitization — the primary callers are AI agents and a future UI we control. Convention: `null` means "not set"; empty strings are not valid for optional string fields. Validation will be added when user-facing UIs introduce untrusted input. Body sanitization (XSS) belongs in the rendering layer, not the API.
- **Deletion behavior:** Neo4j's default delete silently removes all relationships on the deleted node. For M1, we accept this — deletion should be rare. The canonical way to retire artifacts is via status transitions (e.g., `ABANDONED`, `RESOLVED`). The `discoveryHealth` query detects orphaned nodes as a safety net. If deletion-related data integrity problems emerge, we'll add soft-delete (`deletedAt` timestamp, filter deleted nodes from all queries) in a later milestone.
- **@neo4j/graphql abstraction leaks:** If the auto-generated mutations don't match our needs (e.g., creating a node + its relationships in a single atomic operation), we may need to drop to raw Cypher for some operations. The library supports `@cypher` on mutations as an escape hatch.
- **Testcontainers startup time:** Neo4j containers take 15-30 seconds to start. Test suites should share a single container across all tests (beforeAll at the suite level, not per-test). A GitHub Actions workflow will need to account for this.
- **GraphQL schema size:** With 16+ types, the auto-generated schema will be large (hundreds of generated input/where/connection types). This is standard for @neo4j/graphql but can make schema exploration noisy. GraphQL Playground filtering helps.
