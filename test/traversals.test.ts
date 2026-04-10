import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, testDomain, seedDomain, connectToDomain } from './setup.js';
import { executeGraphQL } from './graphql-client.js';

describe('Custom traversal queries', () => {
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

  /**
   * Seed a branching graph for opportunitySubgraph tests.
   * 1 Opportunity -> 2 Ideas -> 3 Assumptions (2 on idea1, 1 on idea2) -> 2 Experiments
   */
  async function seedBranchingGraph(slug: string) {
    const { data: oppData } = await executeGraphQL(`
      mutation { createOpportunities(input: [{ name: "Main Opp", status: ACTIVE, hmw: "How might we?" }]) { opportunities { id } } }
    `);
    const oppId = oppData!.createOpportunities.opportunities[0].id;
    await connectToDomain('Opportunity', oppId, slug);

    const { data: ideaData } = await executeGraphQL(`
      mutation {
        createIdeas(input: [
          { name: "Idea A", status: DRAFT, addresses: { connect: [{ where: { node: { id: { eq: "${oppId}" } } } }] } },
          { name: "Idea B", status: EXPLORING, addresses: { connect: [{ where: { node: { id: { eq: "${oppId}" } } } }] } }
        ]) { ideas { id name } }
      }
    `);
    const ideaA = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea A');
    const ideaB = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea B');
    await connectToDomain('Idea', ideaA.id, slug);
    await connectToDomain('Idea', ideaB.id, slug);

    const { data: aData } = await executeGraphQL(`
      mutation {
        createAssumptions(input: [
          { name: "Assumption 1", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaA.id}" } } } }] } },
          { name: "Assumption 2", status: VALIDATED, importance: MEDIUM, evidence: HIGH, assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaA.id}" } } } }] } },
          { name: "Assumption 3", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaB.id}" } } } }] } }
        ]) { assumptions { id name } }
      }
    `);
    const a1 = aData!.createAssumptions.assumptions.find((a: { name: string }) => a.name === 'Assumption 1');
    const a2 = aData!.createAssumptions.assumptions.find((a: { name: string }) => a.name === 'Assumption 2');
    for (const a of aData!.createAssumptions.assumptions) {
      await connectToDomain('Assumption', a.id, slug);
    }

    await executeGraphQL(`
      mutation {
        createExperiments(input: [
          { name: "Exp 1", status: COMPLETE, method: USER_INTERVIEW, result: VALIDATED, tests: { connect: [{ where: { node: { id: { eq: "${a1.id}" } } } }] } },
          { name: "Exp 2", status: RUNNING, method: SURVEY, tests: { connect: [{ where: { node: { id: { eq: "${a2.id}" } } } }] } }
        ]) { experiments { id name } }
      }
    `);

    return { oppId };
  }

  describe('opportunitySubgraph', () => {
    it('should return correct nested tree with no duplication', async () => {
      const { oppId } = await seedBranchingGraph(domainSlug);

      const { data, errors } = await executeGraphQL(`
        query OpSubgraph($oppId: ID!, $slug: String!) {
          opportunitySubgraph(opportunityId: $oppId, domainSlug: $slug) {
            id name status hmw
            ideas {
              id name status
              assumptions {
                id name status importance evidence
                experiments {
                  id name status method result
                }
              }
            }
          }
        }
      `, { oppId, slug: domainSlug });

      expect(errors).toBeUndefined();
      const subgraph = data!.opportunitySubgraph;
      expect(subgraph).not.toBeNull();
      expect(subgraph.name).toBe('Main Opp');
      expect(subgraph.hmw).toBe('How might we?');
      expect(subgraph.ideas).toHaveLength(2);

      const ideaA = subgraph.ideas.find((i: { name: string }) => i.name === 'Idea A');
      expect(ideaA).toBeDefined();
      expect(ideaA.assumptions).toHaveLength(2);

      const a1 = ideaA.assumptions.find((a: { name: string }) => a.name === 'Assumption 1');
      expect(a1.experiments).toHaveLength(1);
      expect(a1.experiments[0].name).toBe('Exp 1');
      expect(a1.experiments[0].result).toBe('VALIDATED');

      const ideaB = subgraph.ideas.find((i: { name: string }) => i.name === 'Idea B');
      expect(ideaB).toBeDefined();
      expect(ideaB.assumptions).toHaveLength(1);
      expect(ideaB.assumptions[0].experiments).toHaveLength(0);
    });

    it('should return null for non-existent opportunityId', async () => {
      const { data } = await executeGraphQL(`
        query { opportunitySubgraph(opportunityId: "non-existent", domainSlug: "${domainSlug}") { id } }
      `);
      expect(data!.opportunitySubgraph).toBeNull();
    });

    it('should return null for wrong domainSlug', async () => {
      const { oppId } = await seedBranchingGraph(domainSlug);

      const { data } = await executeGraphQL(`
        query { opportunitySubgraph(opportunityId: "${oppId}", domainSlug: "wrong-domain") { id } }
      `);
      expect(data!.opportunitySubgraph).toBeNull();
    });
  });

  describe('untestedAssumptions', () => {
    it('should return untested assumptions without experiments', async () => {
      // Create 5 assumptions: 3 untested HIGH, 1 untested LOW, 1 tested HIGH (has experiment)
      const { data: aData } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [
            { name: "UH1", status: UNTESTED, importance: HIGH, evidence: LOW },
            { name: "UH2", status: UNTESTED, importance: HIGH, evidence: LOW },
            { name: "UH3", status: UNTESTED, importance: HIGH, evidence: LOW },
            { name: "UL1", status: UNTESTED, importance: LOW, evidence: LOW },
            { name: "TH1", status: UNTESTED, importance: HIGH, evidence: LOW }
          ]) { assumptions { id name } }
        }
      `);

      for (const a of aData!.createAssumptions.assumptions) {
        await connectToDomain('Assumption', a.id, domainSlug);
      }

      const testedId = aData!.createAssumptions.assumptions.find((a: { name: string }) => a.name === 'TH1').id;

      // Add an experiment to TH1
      await executeGraphQL(`
        mutation {
          createExperiments(input: [{ name: "Test TH1", status: PLANNED, tests: { connect: [{ where: { node: { id: { eq: "${testedId}" } } } }] } }]) { experiments { id } }
        }
      `);

      // Unfiltered — should return 4 (all untested without experiments)
      const { data: allData } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${domainSlug}") { name importance } }
      `);
      expect(allData!.untestedAssumptions).toHaveLength(4);

      // Filtered by HIGH — should return 3
      const { data: highData } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${domainSlug}", minImportance: "HIGH") { name importance } }
      `);
      expect(highData!.untestedAssumptions).toHaveLength(3);
      expect(highData!.untestedAssumptions.every((a: { importance: string }) => a.importance === 'HIGH')).toBe(true);
    });

    it('should return empty array for empty domain', async () => {
      const emptySlug = testDomain();
      await seedDomain(emptySlug);

      const { data } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${emptySlug}") { name } }
      `);
      expect(data!.untestedAssumptions).toHaveLength(0);
    });
  });

  describe('discoveryHealth', () => {
    it('should return correct counts for a seeded graph', async () => {
      // Seed: 1 Obj, 2 Opps (1 orphaned), 2 Ideas (1 with no assumptions), 3 Assumptions (1 untested HIGH), 1 Experiment
      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Obj1", status: ACTIVE }]) { objectives { id } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;
      await connectToDomain('Objective', objId, domainSlug);

      // Opp1 supports Obj1 (not orphaned), Opp2 is orphaned
      const { data: oppData } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [
            { name: "Opp1", status: ACTIVE, supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] } },
            { name: "Opp2 Orphaned", status: ACTIVE }
          ]) { opportunities { id name } }
        }
      `);
      const opp1 = oppData!.createOpportunities.opportunities.find((o: { name: string }) => o.name === 'Opp1');
      const opp2 = oppData!.createOpportunities.opportunities.find((o: { name: string }) => o.name === 'Opp2 Orphaned');
      await connectToDomain('Opportunity', opp1.id, domainSlug);
      await connectToDomain('Opportunity', opp2.id, domainSlug);

      // Idea1 has assumptions, Idea2 has none
      const { data: ideaData } = await executeGraphQL(`
        mutation {
          createIdeas(input: [
            { name: "Idea1", status: DRAFT, addresses: { connect: [{ where: { node: { id: { eq: "${opp1.id}" } } } }] } },
            { name: "Idea2 NoAssumptions", status: DRAFT, addresses: { connect: [{ where: { node: { id: { eq: "${opp1.id}" } } } }] } }
          ]) { ideas { id name } }
        }
      `);
      const idea1 = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea1');
      const idea2 = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea2 NoAssumptions');
      await connectToDomain('Idea', idea1.id, domainSlug);
      await connectToDomain('Idea', idea2.id, domainSlug);

      // 3 assumptions: 1 untested HIGH (no experiment), 1 untested LOW, 1 validated HIGH
      const { data: aData } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [
            { name: "UH", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${idea1.id}" } } } }] } },
            { name: "UL", status: UNTESTED, importance: LOW, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${idea1.id}" } } } }] } },
            { name: "VH", status: VALIDATED, importance: HIGH, evidence: HIGH, assumedBy: { connect: [{ where: { node: { id: { eq: "${idea1.id}" } } } }] } }
          ]) { assumptions { id name } }
        }
      `);
      for (const a of aData!.createAssumptions.assumptions) {
        await connectToDomain('Assumption', a.id, domainSlug);
      }
      const vh = aData!.createAssumptions.assumptions.find((a: { name: string }) => a.name === 'VH');

      // 1 experiment testing VH
      const { data: expData } = await executeGraphQL(`
        mutation { createExperiments(input: [{ name: "Exp1", status: COMPLETE, tests: { connect: [{ where: { node: { id: { eq: "${vh.id}" } } } }] } }]) { experiments { id } } }
      `);
      await connectToDomain('Experiment', expData!.createExperiments.experiments[0].id, domainSlug);

      const { data, errors } = await executeGraphQL(`
        query { discoveryHealth(domainSlug: "${domainSlug}") {
          totalObjectives
          totalOpportunities
          totalIdeas
          totalAssumptions
          totalExperiments
          untestedHighImportanceAssumptions
          ideasWithNoAssumptions
          orphanedOpportunities
        }}
      `);

      expect(errors).toBeUndefined();
      const health = data!.discoveryHealth;
      expect(health.totalObjectives).toBe(1);
      expect(health.totalOpportunities).toBe(2);
      expect(health.totalIdeas).toBe(2);
      expect(health.totalAssumptions).toBe(3);
      expect(health.totalExperiments).toBe(1);
      expect(health.untestedHighImportanceAssumptions).toBe(1);
      expect(health.ideasWithNoAssumptions).toBe(1);
      expect(health.orphanedOpportunities).toBe(1);
    });

    it('should return all zeros for empty domain', async () => {
      const emptySlug = testDomain();
      await seedDomain(emptySlug);

      const { data } = await executeGraphQL(`
        query { discoveryHealth(domainSlug: "${emptySlug}") {
          totalObjectives totalOpportunities totalIdeas
          totalAssumptions totalExperiments
          untestedHighImportanceAssumptions ideasWithNoAssumptions orphanedOpportunities
        }}
      `);

      const health = data!.discoveryHealth;
      expect(health.totalObjectives).toBe(0);
      expect(health.totalOpportunities).toBe(0);
      expect(health.totalIdeas).toBe(0);
      expect(health.totalAssumptions).toBe(0);
      expect(health.totalExperiments).toBe(0);
      expect(health.untestedHighImportanceAssumptions).toBe(0);
      expect(health.ideasWithNoAssumptions).toBe(0);
      expect(health.orphanedOpportunities).toBe(0);
    });
  });
});
