import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, testDomain, seedDomain } from './setup.js';
import { executeGraphQL } from './graphql-client.js';

describe('Relationship operations', () => {
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

  function dc(slug?: string): string {
    return `domain: { create: { node: { slug: "${slug ?? testDomain()}", name: "D" } } }`;
  }

  describe('Bidirectional traversal', () => {
    it('SUPPORTS: Objective.supportedBy and Opportunity.supports', async () => {
      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Engagement", status: ACTIVE, ${dc()} }]) { objectives { id name } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;

      // Create opportunity connected to objective
      const { data: oppData, errors } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [{
            name: "Onboarding Pain"
            status: ACTIVE
            ${dc()}
            supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] }
          }]) { opportunities { id name supports { id name } } }
        }
      `);

      expect(errors).toBeUndefined();
      expect(oppData!.createOpportunities.opportunities[0].supports).toHaveLength(1);
      expect(oppData!.createOpportunities.opportunities[0].supports[0].name).toBe('Engagement');

      // Verify reverse traversal
      const { data: reverseData } = await executeGraphQL(`
        query { objectives(where: { id: { eq: "${objId}" } }) { name supportedBy { id name } } }
      `);
      expect(reverseData!.objectives[0].supportedBy).toHaveLength(1);
      expect(reverseData!.objectives[0].supportedBy[0].name).toBe('Onboarding Pain');
    });

    it('ADDRESSES: Idea.addresses and Opportunity.addressedBy', async () => {
      const { data: oppData } = await executeGraphQL(`
        mutation { createOpportunities(input: [{ name: "Opp", status: ACTIVE, ${dc()} }]) { opportunities { id } } }
      `);
      const oppId = oppData!.createOpportunities.opportunities[0].id;

      const { data: ideaData, errors } = await executeGraphQL(`
        mutation {
          createIdeas(input: [{
            name: "Idea"
            status: DRAFT
            ${dc()}
            addresses: { connect: [{ where: { node: { id: { eq: "${oppId}" } } } }] }
          }]) { ideas { id addresses { id } } }
        }
      `);
      expect(errors).toBeUndefined();
      expect(ideaData!.createIdeas.ideas[0].addresses).toHaveLength(1);

      const { data } = await executeGraphQL(`
        query { opportunities(where: { id: { eq: "${oppId}" } }) { addressedBy { id name } } }
      `);
      expect(data!.opportunities[0].addressedBy).toHaveLength(1);
      expect(data!.opportunities[0].addressedBy[0].name).toBe('Idea');
    });

    it('ASSUMED_BY: Assumption.assumedBy and Idea.assumptions', async () => {
      const { data: ideaData } = await executeGraphQL(`
        mutation { createIdeas(input: [{ name: "Idea", status: DRAFT }]) { ideas { id } } }
      `);
      const ideaId = ideaData!.createIdeas.ideas[0].id;

      const { data: aData, errors } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [{
            name: "Assumption"
            status: UNTESTED
            importance: HIGH
            evidence: LOW
            assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaId}" } } } }] }
          }]) { assumptions { id assumedBy { id } } }
        }
      `);
      expect(errors).toBeUndefined();
      expect(aData!.createAssumptions.assumptions[0].assumedBy).toHaveLength(1);

      const { data } = await executeGraphQL(`
        query { ideas(where: { id: { eq: "${ideaId}" } }) { assumptions { id name } } }
      `);
      expect(data!.ideas[0].assumptions).toHaveLength(1);
    });

    it('TESTS: Experiment.tests and Assumption.testedBy', async () => {
      const { data: aData } = await executeGraphQL(`
        mutation { createAssumptions(input: [{ name: "A", status: UNTESTED, importance: HIGH, evidence: LOW }]) { assumptions { id } } }
      `);
      const aId = aData!.createAssumptions.assumptions[0].id;

      const { data: expData, errors } = await executeGraphQL(`
        mutation {
          createExperiments(input: [{
            name: "Exp"
            status: PLANNED
            tests: { connect: [{ where: { node: { id: { eq: "${aId}" } } } }] }
          }]) { experiments { id tests { id } } }
        }
      `);
      expect(errors).toBeUndefined();
      expect(expData!.createExperiments.experiments[0].tests).toHaveLength(1);

      const { data } = await executeGraphQL(`
        query { assumptions(where: { id: { eq: "${aId}" } }) { testedBy { id name } } }
      `);
      expect(data!.assumptions[0].testedBy).toHaveLength(1);
    });
  });

  describe('Disconnect', () => {
    it('should remove relationship but keep both nodes', async () => {
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

      // Disconnect
      const { errors } = await executeGraphQL(`
        mutation {
          updateOpportunities(
            where: { id: { eq: "${oppId}" } }
            update: { supports: [{ disconnect: [{ where: { node: { id: { eq: "${objId}" } } } }] }] }
          ) { opportunities { id supports { id } } }
        }
      `);
      expect(errors).toBeUndefined();

      // Both nodes still exist
      const { data: objQuery } = await executeGraphQL(`
        query { objectives(where: { id: { eq: "${objId}" } }) { id supportedBy { id } } }
      `);
      expect(objQuery!.objectives).toHaveLength(1);
      expect(objQuery!.objectives[0].supportedBy).toHaveLength(0);

      const { data: oppQuery } = await executeGraphQL(`
        query { opportunities(where: { id: { eq: "${oppId}" } }) { id supports { id } } }
      `);
      expect(oppQuery!.opportunities).toHaveLength(1);
      expect(oppQuery!.opportunities[0].supports).toHaveLength(0);
    });
  });

  describe('Relationship filtering', () => {
    it('should filter through relationships', async () => {
      const ds = testDomain();
      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Engagement", status: ACTIVE, ${dc(ds + '-o')} }]) { objectives { id } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;

      await executeGraphQL(`
        mutation {
          createOpportunities(input: [
            { name: "Opp A", status: ACTIVE, ${dc(ds + '-a')}, supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] } },
            { name: "Opp B", status: ACTIVE, ${dc(ds + '-b')} }
          ]) { opportunities { id } }
        }
      `);

      // Filter opportunities that support an objective with "Engagement" in the name
      const { data } = await executeGraphQL(`
        query {
          opportunities(where: {
            supports: { some: { name: { contains: "Engagement" } } }
            domain: { slug: { startsWith: "${ds}" } }
          }) { name }
        }
      `);
      expect(data!.opportunities).toHaveLength(1);
      expect(data!.opportunities[0].name).toBe('Opp A');
    });
  });

  describe('Full chain traversal', () => {
    it('should build and traverse Objective -> Opportunity -> Idea -> Assumption -> Experiment', async () => {
      const ds = testDomain();

      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Goal", status: ACTIVE, ${dc(ds + '-obj')} }]) { objectives { id } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;

      const { data: oppData } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [{
            name: "Need"
            status: ACTIVE
            ${dc(ds + '-opp')}
            supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] }
          }]) { opportunities { id } }
        }
      `);
      const oppId = oppData!.createOpportunities.opportunities[0].id;

      const { data: ideaData } = await executeGraphQL(`
        mutation {
          createIdeas(input: [{
            name: "Solution"
            status: DRAFT
            ${dc(ds + '-idea')}
            addresses: { connect: [{ where: { node: { id: { eq: "${oppId}" } } } }] }
          }]) { ideas { id } }
        }
      `);
      const ideaId = ideaData!.createIdeas.ideas[0].id;

      const { data: aData } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [{
            name: "Risky Assumption"
            status: UNTESTED
            importance: HIGH
            evidence: LOW
            ${dc(ds + '-a')}
            assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaId}" } } } }] }
          }]) { assumptions { id } }
        }
      `);
      const aId = aData!.createAssumptions.assumptions[0].id;

      await executeGraphQL(`
        mutation {
          createExperiments(input: [{
            name: "Test It"
            status: PLANNED
            method: USER_INTERVIEW
            ${dc(ds + '-exp')}
            tests: { connect: [{ where: { node: { id: { eq: "${aId}" } } } }] }
          }]) { experiments { id } }
        }
      `);

      // Traverse from Experiment up to Objective
      const { data } = await executeGraphQL(`
        query {
          experiments(where: { domain: { slug: { eq: "${ds}-exp" } } }) {
            name
            tests {
              name
              assumedBy {
                name
                addresses {
                  name
                  supports { name }
                }
              }
            }
          }
        }
      `);

      expect(data!.experiments).toHaveLength(1);
      expect(data!.experiments[0].name).toBe('Test It');
      expect(data!.experiments[0].tests[0].name).toBe('Risky Assumption');
      expect(data!.experiments[0].tests[0].assumedBy[0].name).toBe('Solution');
      expect(data!.experiments[0].tests[0].assumedBy[0].addresses[0].name).toBe('Need');
      expect(data!.experiments[0].tests[0].assumedBy[0].addresses[0].supports[0].name).toBe('Goal');
    });
  });

  describe('BELONGS_TO domain scoping', () => {
    it('should isolate artifacts by domain', async () => {
      const domainA = testDomain();
      const domainB = testDomain();

      await executeGraphQL(`
        mutation {
          createObjectives(input: [
            { name: "Domain A Obj", status: ACTIVE, ${dc(domainA)} }
          ]) { objectives { id } }
        }
      `);
      await executeGraphQL(`
        mutation {
          createObjectives(input: [
            { name: "Domain B Obj", status: ACTIVE, ${dc(domainB)} }
          ]) { objectives { id } }
        }
      `);

      const { data } = await executeGraphQL(`
        query { objectives(where: { domain: { slug: { eq: "${domainA}" } } }) { name } }
      `);
      expect(data!.objectives).toHaveLength(1);
      expect(data!.objectives[0].name).toBe('Domain A Obj');
    });

    it('all 5 types link to Domain via BELONGS_TO', async () => {
      const slug = testDomain();

      await executeGraphQL(`mutation { createObjectives(input: [{ name: "O", status: ACTIVE, ${dc(slug + '-obj')} }]) { objectives { id } } }`);
      await executeGraphQL(`mutation { createOpportunities(input: [{ name: "O", status: ACTIVE, ${dc(slug + '-opp')} }]) { opportunities { id } } }`);
      await executeGraphQL(`mutation { createIdeas(input: [{ name: "I", status: DRAFT, ${dc(slug + '-idea')} }]) { ideas { id } } }`);
      await executeGraphQL(`mutation { createAssumptions(input: [{ name: "A", status: UNTESTED, importance: HIGH, evidence: LOW, ${dc(slug + '-a')} }]) { assumptions { id } } }`);
      await executeGraphQL(`mutation { createExperiments(input: [{ name: "E", status: PLANNED, ${dc(slug + '-exp')} }]) { experiments { id } } }`);

      for (const [type, q] of [
        ['objectives', `objectives(where: { domain: { slug: { eq: "${slug}-obj" } } }) { domain { slug } }`],
        ['opportunities', `opportunities(where: { domain: { slug: { eq: "${slug}-opp" } } }) { domain { slug } }`],
        ['ideas', `ideas(where: { domain: { slug: { eq: "${slug}-idea" } } }) { domain { slug } }`],
        ['assumptions', `assumptions(where: { domain: { slug: { eq: "${slug}-a" } } }) { domain { slug } }`],
        ['experiments', `experiments(where: { domain: { slug: { eq: "${slug}-exp" } } }) { domain { slug } }`],
      ] as const) {
        const { data } = await executeGraphQL(`query { ${q} }`);
        expect((data as Record<string, Array<{ domain: { slug: string } }>>)[type][0].domain.slug).toContain(slug);
      }
    });
  });
});
