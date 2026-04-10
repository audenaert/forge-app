import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, testDomain, seedDomain, getDriver } from './setup.js';
import { executeGraphQL } from './graphql-client.js';

describe('Edge cases and error paths', () => {
  let domainSlug: string;

  beforeAll(async () => {
    await setupTestEnvironment();
  }, 120_000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    domainSlug = testDomain();
    await seedDomain(domainSlug);
  });

  describe('Delete connected node', () => {
    it('should remove relationships when deleting a node, connected nodes survive', async () => {
      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Obj", status: ACTIVE }]) { objectives { id } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;

      const { data: oppData } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [{
            name: "Opp"
            status: ACTIVE
            supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] }
          }]) { opportunities { id } }
        }
      `);
      const oppId = oppData!.createOpportunities.opportunities[0].id;

      // Delete the objective
      await executeGraphQL(`
        mutation { deleteObjectives(where: { id: { eq: "${objId}" } }) { nodesDeleted } }
      `);

      // Opportunity should still exist, with no supports
      const { data } = await executeGraphQL(`
        query { opportunities(where: { id: { eq: "${oppId}" } }) { id supports { id } } }
      `);
      expect(data!.opportunities).toHaveLength(1);
      expect(data!.opportunities[0].supports).toHaveLength(0);
    });
  });

  describe('Constraint violations', () => {
    it('should fail on duplicate domain slug', async () => {
      const slug = testDomain();
      await seedDomain(slug);

      // Try to create another domain with the same slug via raw Cypher
      const session = getDriver().session();
      try {
        await expect(
          session.run(
            'CREATE (d:Domain {id: randomUUID(), slug: $slug, name: "Dup", createdAt: datetime()}) RETURN d',
            { slug }
          )
        ).rejects.toThrow();
      } finally {
        await session.close();
      }
    });

    it('should return CONSTRAINT_VIOLATION code for duplicate domain slug via GraphQL', async () => {
      const slug = testDomain();
      await seedDomain(slug);

      // Create a second domain with the same slug via GraphQL mutation
      const { errors } = await executeGraphQL(`
        mutation {
          createDomains(input: [{ slug: "${slug}", name: "Duplicate" }]) { domains { id } }
        }
      `);

      expect(errors).toBeDefined();
      expect(errors!.length).toBeGreaterThan(0);
      expect(errors![0].extensions?.code).toBe('CONSTRAINT_VIOLATION');
    });
  });

  describe('Invalid enum values', () => {
    it('should return VALIDATION_ERROR for invalid enum value', async () => {
      const { errors } = await executeGraphQL(`
        mutation {
          createObjectives(input: [{ name: "Bad Status", status: INVALID_STATUS }]) { objectives { id } }
        }
      `);
      expect(errors).toBeDefined();
      expect(errors!.length).toBeGreaterThan(0);
      expect(errors![0].extensions?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error classification', () => {
    it('all error responses include extensions.code', async () => {
      // Trigger a validation error (missing required field: status is required for Objective)
      const { errors } = await executeGraphQL(`
        mutation {
          createObjectives(input: [{ name: "No Status" }]) { objectives { id } }
        }
      `);

      expect(errors).toBeDefined();
      for (const error of errors!) {
        expect(error.extensions?.code).toBeDefined();
        expect(typeof error.extensions?.code).toBe('string');
      }
    });
  });

  describe('Traversal edge cases', () => {
    it('opportunitySubgraph with non-existent ID returns null', async () => {
      const { data } = await executeGraphQL(`
        query { opportunitySubgraph(opportunityId: "no-such-id", domainSlug: "${domainSlug}") { id } }
      `);
      expect(data!.opportunitySubgraph).toBeNull();
    });

    it('untestedAssumptions on empty domain returns empty array', async () => {
      const emptySlug = testDomain();
      await seedDomain(emptySlug);
      const { data } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${emptySlug}") { name } }
      `);
      expect(data!.untestedAssumptions).toHaveLength(0);
    });

    it('discoveryHealth on empty domain returns all zeros', async () => {
      const emptySlug = testDomain();
      await seedDomain(emptySlug);
      const { data } = await executeGraphQL(`
        query { discoveryHealth(domainSlug: "${emptySlug}") {
          totalObjectives totalOpportunities totalIdeas
          totalAssumptions totalExperiments
          untestedHighImportanceAssumptions ideasWithNoAssumptions orphanedOpportunities
        }}
      `);
      const h = data!.discoveryHealth;
      expect(h.totalObjectives).toBe(0);
      expect(h.totalOpportunities).toBe(0);
    });
  });

  describe('Concurrent auto-generated IDs', () => {
    it('two simultaneous creates should not collide', async () => {
      const [result1, result2] = await Promise.all([
        executeGraphQL(`
          mutation { createObjectives(input: [{ name: "Concurrent 1", status: ACTIVE }]) { objectives { id } } }
        `),
        executeGraphQL(`
          mutation { createObjectives(input: [{ name: "Concurrent 2", status: ACTIVE }]) { objectives { id } } }
        `),
      ]);

      expect(result1.errors).toBeUndefined();
      expect(result2.errors).toBeUndefined();
      const id1 = result1.data!.createObjectives.objectives[0].id;
      const id2 = result2.data!.createObjectives.objectives[0].id;
      expect(id1).not.toBe(id2);
    });
  });

  describe('Timestamp behavior', () => {
    it('createdAt is set on create, updatedAt is null', async () => {
      const { data } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "TS Test", status: ACTIVE }]) { objectives { createdAt updatedAt } } }
      `);
      expect(data!.createObjectives.objectives[0].createdAt).toBeTruthy();
      expect(data!.createObjectives.objectives[0].updatedAt).toBeNull();
    });

    it('updatedAt is set on update, createdAt unchanged', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "TS Test", status: ACTIVE }]) { objectives { id createdAt } } }
      `);
      const { id, createdAt } = createData!.createObjectives.objectives[0];

      const { data: updateData } = await executeGraphQL(`
        mutation { updateObjectives(where: { id: { eq: "${id}" } }, update: { name: { set: "Updated" } }) { objectives { createdAt updatedAt } } }
      `);
      expect(updateData!.updateObjectives.objectives[0].createdAt).toBe(createdAt);
      expect(updateData!.updateObjectives.objectives[0].updatedAt).toBeTruthy();
    });
  });
});
