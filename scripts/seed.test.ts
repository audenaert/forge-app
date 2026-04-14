/**
 * Integration test for the seed script.
 *
 * This spins up a Neo4j testcontainer, creates an in-process Apollo
 * server with the real schema, runs `runSeed()` against the container,
 * and then verifies two things:
 *
 *   1. `discoveryHealth(domainSlug: "seed")` returns the expected counts
 *      — the core AC is that the seed produces the artifact catalogue the
 *      dashboard expects.
 *
 *   2. The seed domain is reachable via the GraphQL API using
 *      `x-api-key: seed-dev-key` — this is the end-to-end check that the
 *      api-key hashing in the seed script matches the hashing in
 *      `apps/api/src/auth.ts`. We simulate the real server's auth middleware
 *      by resolving the raw key through `resolveDomainFromApiKey` and
 *      passing the returned slug as the Apollo context, exactly as the
 *      production server does.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Neo4jContainer, type StartedNeo4jContainer } from '@testcontainers/neo4j';
import neo4j, { type Driver } from 'neo4j-driver';
import { ApolloServer } from '@apollo/server';
import { applyConstraints, createSchema } from '@forge-workspace/graph';
import type { GraphQLSchema } from 'graphql';
import { resolveDomainFromApiKey } from '../apps/api/src/auth.js';
import { EXPECTED_COUNTS, SEED_API_KEY, SEED_DOMAIN_SLUG, runSeed } from './seed.js';

let container: StartedNeo4jContainer;
let driver: Driver;
let schema: GraphQLSchema;
let server: ApolloServer;

beforeAll(async () => {
  container = await new Neo4jContainer('neo4j:5')
    .withApoc()
    .withStartupTimeout(600_000)
    .start();
  driver = neo4j.driver(
    container.getBoltUri(),
    neo4j.auth.basic(container.getUsername(), container.getPassword())
  );
  await driver.verifyConnectivity();
  await applyConstraints(driver);

  schema = await createSchema(driver);
  server = new ApolloServer({ schema });
  await server.start();
}, 600_000);

afterAll(async () => {
  await server?.stop();
  await driver?.close();
  await container?.stop();
});

/**
 * Run a GraphQL operation against the in-process server, resolving the
 * context exactly the way the real server does — look up the raw api key
 * via `resolveDomainFromApiKey` (which hashes + queries Neo4j), then pass
 * the resolved slug as `contextValue`. If the hash doesn't match, the
 * lookup returns null and downstream queries will see a nonexistent domain.
 */
async function runQueryWithApiKey<T = Record<string, unknown>>(
  query: string,
  apiKey: string
): Promise<{ data?: T; errors?: readonly unknown[]; domainSlug: string | null }> {
  const domainSlug = await resolveDomainFromApiKey(driver, apiKey);
  const response = await server.executeOperation(
    { query },
    { contextValue: { domainSlug: domainSlug ?? '__unresolved__' } }
  );
  if (response.body.kind !== 'single') throw new Error('Unexpected incremental response');
  return {
    data: response.body.singleResult.data as T | undefined,
    errors: response.body.singleResult.errors,
    domainSlug,
  };
}

describe('seed script', () => {
  beforeAll(async () => {
    // Seed once for all tests in this suite; the idempotency test will
    // run it again and re-verify.
    await runSeed(driver);
  }, 120_000);

  it('creates the seed domain with the expected artifact counts', async () => {
    const { data, errors, domainSlug } = await runQueryWithApiKey<{
      discoveryHealth: Record<string, number>;
    }>(
      `query { discoveryHealth(domainSlug: "${SEED_DOMAIN_SLUG}") {
        totalObjectives
        totalOpportunities
        totalIdeas
        totalAssumptions
        totalExperiments
        untestedHighImportanceAssumptions
        ideasWithNoAssumptions
        orphanedOpportunities
      } }`,
      SEED_API_KEY
    );

    // The raw seed-dev-key must resolve to the seed domain — this is the
    // end-to-end verification that the api-key hash in the seed matches
    // the hash in auth.ts.
    expect(domainSlug).toBe(SEED_DOMAIN_SLUG);

    expect(errors).toBeUndefined();
    expect(data?.discoveryHealth).toEqual(EXPECTED_COUNTS);
  });

  it('is idempotent — running twice leaves the graph in the same state', async () => {
    // Already seeded once in beforeAll; run it again to verify idempotency.
    await runSeed(driver);

    const { data, errors, domainSlug } = await runQueryWithApiKey<{
      discoveryHealth: Record<string, number>;
    }>(
      `query { discoveryHealth(domainSlug: "${SEED_DOMAIN_SLUG}") {
        totalObjectives
        totalOpportunities
        totalIdeas
        totalAssumptions
        totalExperiments
        untestedHighImportanceAssumptions
        ideasWithNoAssumptions
        orphanedOpportunities
      } }`,
      SEED_API_KEY
    );

    expect(domainSlug).toBe(SEED_DOMAIN_SLUG);
    expect(errors).toBeUndefined();
    expect(data?.discoveryHealth).toEqual(EXPECTED_COUNTS);
  });

  it('populates realistic multi-paragraph markdown bodies on every artifact', async () => {
    const session = driver.session();
    try {
      // Every artifact labelled Objective/Opportunity/Idea/Assumption/Experiment
      // in the seed domain must have a non-empty body. We then structurally
      // verify the Idea bodies — picked as a representative type — contain
      // the markdown features the UI actually renders:
      //
      //   - every Idea body has at least one markdown heading
      //   - the Idea corpus collectively contains at least one bullet list item
      //   - the Idea corpus collectively contains at least one inline
      //     formatting marker (**bold**, _italics_, or `code`)
      //
      // A body stripped of these features should fail this test. Asserting
      // the same shape on every artifact type is noisy (assumption/experiment
      // bodies are legitimately prose-heavy), so we scope the structural
      // checks to Ideas and leave a baseline non-empty assertion on the rest.
      const result = await session.run(
        `
        MATCH (n)-[:BELONGS_TO]->(:Domain {slug: $slug})
        WHERE any(l IN labels(n) WHERE l IN ['Objective','Opportunity','Idea','Assumption','Experiment'])
        RETURN labels(n) AS labels, n.name AS name, n.body AS body
        `,
        { slug: SEED_DOMAIN_SLUG }
      );
      expect(result.records.length).toBeGreaterThan(0);

      const headingRe = /^#{1,6} /m;
      const bulletRe = /^[-*+] /m;
      // Inline: **bold**, _italics_, or `code`. We intentionally avoid a
      // single-asterisk italics pattern because it collides with bullets.
      const inlineRe = /\*\*[^*]+\*\*|_[^_]+_|`[^`]+`/;

      const ideaBodies: string[] = [];
      for (const record of result.records) {
        const labels = record.get('labels') as string[];
        const name = record.get('name') as string;
        const body = record.get('body') as string | null;
        expect(body, `artifact "${name}" has no body`).toBeTruthy();
        if (labels.includes('Idea')) {
          expect(body, `idea "${name}" body has no markdown heading`).toMatch(headingRe);
          ideaBodies.push(body!);
        }
      }

      expect(ideaBodies.length, 'no Idea artifacts found in seed').toBeGreaterThan(0);
      expect(
        ideaBodies.some((b) => bulletRe.test(b)),
        'no Idea body contains a bullet list item'
      ).toBe(true);
      expect(
        ideaBodies.some((b) => inlineRe.test(b)),
        'no Idea body contains inline formatting (bold/italic/code)'
      ).toBe(true);
    } finally {
      await session.close();
    }
  });

  it('rejects an invalid api key (returns null from resolver)', async () => {
    const domainSlug = await resolveDomainFromApiKey(driver, 'not-a-real-key');
    expect(domainSlug).toBeNull();
  });
});
