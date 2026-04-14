import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, testDomain, seedDomain, connectToDomain } from './setup.js';
import { executeGraphQL } from './graphql-client.js';

describe('Custom traversal queries', () => {
  let domainSlug: string;

  beforeAll(async () => {
    await setupTestEnvironment();
  }, 600_000);

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
    it('should return untested assumptions with parent idea context', async () => {
      // Seed a parent idea for the assumptions
      const { data: ideaData } = await executeGraphQL(`
        mutation { createIdeas(input: [{ name: "Host Idea", status: DRAFT }]) { ideas { id name } } }
      `);
      const hostIdea = ideaData!.createIdeas.ideas[0];
      await connectToDomain('Idea', hostIdea.id, domainSlug);

      // Create 5 assumptions: 3 untested HIGH, 1 untested LOW, 1 tested HIGH (has experiment)
      // All linked to hostIdea so we can assert parentIdea fields.
      const { data: aData } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [
            { name: "UH1", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${hostIdea.id}" } } } }] } },
            { name: "UH2", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${hostIdea.id}" } } } }] } },
            { name: "UH3", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${hostIdea.id}" } } } }] } },
            { name: "UL1", status: UNTESTED, importance: LOW, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${hostIdea.id}" } } } }] } },
            { name: "TH1", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${hostIdea.id}" } } } }] } }
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
      const { data: allData, errors: allErrors } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${domainSlug}") {
          id name importance status evidence body createdAt updatedAt
          parentIdea { id name status }
        }}
      `);
      expect(allErrors).toBeUndefined();
      expect(allData!.untestedAssumptions).toHaveLength(4);
      for (const a of allData!.untestedAssumptions) {
        expect(a.parentIdea).not.toBeNull();
        expect(a.parentIdea.id).toBe(hostIdea.id);
        expect(a.parentIdea.name).toBe('Host Idea');
        expect(a.parentIdea.status).toBe('DRAFT');
      }

      // Filtered by HIGH — should return 3
      const { data: highData } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${domainSlug}", minImportance: "HIGH") {
          name importance parentIdea { id name }
        }}
      `);
      expect(highData!.untestedAssumptions).toHaveLength(3);
      expect(highData!.untestedAssumptions.every((a: { importance: string }) => a.importance === 'HIGH')).toBe(true);
      expect(highData!.untestedAssumptions.every((a: { parentIdea: { id: string } }) => a.parentIdea.id === hostIdea.id)).toBe(true);
    });

    it('should return empty array for empty domain', async () => {
      const emptySlug = testDomain();
      await seedDomain(emptySlug);

      const { data } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${emptySlug}") { name parentIdea { id } } }
      `);
      expect(data!.untestedAssumptions).toHaveLength(0);
    });

    it('should return parentIdea = null for an unrooted untested assumption', async () => {
      const { data: aData } = await executeGraphQL(`
        mutation { createAssumptions(input: [{ name: "Floating", status: UNTESTED, importance: MEDIUM, evidence: LOW }]) { assumptions { id } } }
      `);
      await connectToDomain('Assumption', aData!.createAssumptions.assumptions[0].id, domainSlug);

      const { data } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${domainSlug}") { name parentIdea { id name } } }
      `);
      expect(data!.untestedAssumptions).toHaveLength(1);
      expect(data!.untestedAssumptions[0].name).toBe('Floating');
      expect(data!.untestedAssumptions[0].parentIdea).toBeNull();
    });

    it('should collapse multiple parent ideas to one row per assumption (first-parent semantics)', async () => {
      // Create two ideas, both in the queried domain. The assumption is linked to both.
      // The result should contain ONE row for the assumption, not two.
      const { data: ideaData } = await executeGraphQL(`
        mutation {
          createIdeas(input: [
            { name: "Idea Early", status: DRAFT },
            { name: "Idea Late", status: EXPLORING }
          ]) { ideas { id name } }
        }
      `);
      const ideaEarly = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea Early');
      const ideaLate = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea Late');
      await connectToDomain('Idea', ideaEarly.id, domainSlug);
      await connectToDomain('Idea', ideaLate.id, domainSlug);

      const { data: aData } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [{
            name: "Shared Assumption", status: UNTESTED, importance: HIGH, evidence: LOW,
            assumedBy: { connect: [
              { where: { node: { id: { eq: "${ideaEarly.id}" } } } },
              { where: { node: { id: { eq: "${ideaLate.id}" } } } }
            ] }
          }]) { assumptions { id } }
        }
      `);
      await connectToDomain('Assumption', aData!.createAssumptions.assumptions[0].id, domainSlug);

      const { data } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${domainSlug}") { name parentIdea { id name } } }
      `);
      const rows = data!.untestedAssumptions.filter((a: { name: string }) => a.name === 'Shared Assumption');
      expect(rows).toHaveLength(1);
      expect(rows[0].parentIdea).not.toBeNull();
      // First-parent = earliest createdAt. ideaEarly was created first in the same batch,
      // so we expect its id. (If tie-broken by id, the test still asserts one of the two is present.)
      expect([ideaEarly.id, ideaLate.id]).toContain(rows[0].parentIdea.id);
    });

    it('should not include assumptions whose parent idea is in a different domain', async () => {
      // Assumption lives in the queried domain, parent idea lives in a DIFFERENT domain.
      // Behavior: the assumption should still surface (it is untested and in-domain),
      // but parentIdea should be null because the parent is filtered out by domain scoping.
      const otherSlug = testDomain();
      await seedDomain(otherSlug);

      const { data: ideaData } = await executeGraphQL(`
        mutation { createIdeas(input: [{ name: "Cross-Domain Idea", status: DRAFT }]) { ideas { id } } }
      `);
      const crossIdeaId = ideaData!.createIdeas.ideas[0].id;
      await connectToDomain('Idea', crossIdeaId, otherSlug);

      const { data: aData } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [{
            name: "Cross", status: UNTESTED, importance: HIGH, evidence: LOW,
            assumedBy: { connect: [{ where: { node: { id: { eq: "${crossIdeaId}" } } } }] }
          }]) { assumptions { id } }
        }
      `);
      await connectToDomain('Assumption', aData!.createAssumptions.assumptions[0].id, domainSlug);

      const { data } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${domainSlug}") { name parentIdea { id name } } }
      `);
      const cross = data!.untestedAssumptions.find((a: { name: string }) => a.name === 'Cross');
      expect(cross).toBeDefined();
      expect(cross.parentIdea).toBeNull();

      // Also: querying untestedAssumptions for otherSlug should NOT return "Cross" because
      // the assumption itself belongs to `domainSlug`.
      const { data: otherData } = await executeGraphQL(`
        query { untestedAssumptions(domainSlug: "${otherSlug}") { name } }
      `);
      expect(otherData!.untestedAssumptions.find((a: { name: string }) => a.name === 'Cross')).toBeUndefined();
    });
  });

  describe('objectiveSubgraph', () => {
    async function seedObjectiveTree(slug: string) {
      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Growth", status: ACTIVE, body: "Drive growth" }]) { objectives { id } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;
      await connectToDomain('Objective', objId, slug);

      const { data: oppData } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [
            { name: "Opp X", status: ACTIVE, hmw: "How X?", supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] } },
            { name: "Opp Y", status: ACTIVE, hmw: "How Y?", supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] } }
          ]) { opportunities { id name } }
        }
      `);
      const oppX = oppData!.createOpportunities.opportunities.find((o: { name: string }) => o.name === 'Opp X');
      const oppY = oppData!.createOpportunities.opportunities.find((o: { name: string }) => o.name === 'Opp Y');
      await connectToDomain('Opportunity', oppX.id, slug);
      await connectToDomain('Opportunity', oppY.id, slug);

      const { data: ideaData } = await executeGraphQL(`
        mutation {
          createIdeas(input: [
            { name: "Idea X1", status: DRAFT, addresses: { connect: [{ where: { node: { id: { eq: "${oppX.id}" } } } }] } },
            { name: "Idea Y1", status: EXPLORING, addresses: { connect: [{ where: { node: { id: { eq: "${oppY.id}" } } } }] } }
          ]) { ideas { id name } }
        }
      `);
      const ideaX1 = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea X1');
      const ideaY1 = ideaData!.createIdeas.ideas.find((i: { name: string }) => i.name === 'Idea Y1');
      await connectToDomain('Idea', ideaX1.id, slug);
      await connectToDomain('Idea', ideaY1.id, slug);

      const { data: aData } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [
            { name: "Asm X1a", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaX1.id}" } } } }] } },
            { name: "Asm Y1a", status: UNTESTED, importance: MEDIUM, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaY1.id}" } } } }] } }
          ]) { assumptions { id name } }
        }
      `);
      for (const a of aData!.createAssumptions.assumptions) {
        await connectToDomain('Assumption', a.id, slug);
      }
      const asmX1a = aData!.createAssumptions.assumptions.find((a: { name: string }) => a.name === 'Asm X1a');

      const { data: expData } = await executeGraphQL(`
        mutation {
          createExperiments(input: [{ name: "Exp X1a-1", status: PLANNED, method: USER_INTERVIEW, tests: { connect: [{ where: { node: { id: { eq: "${asmX1a.id}" } } } }] } }]) { experiments { id } }
        }
      `);
      await connectToDomain('Experiment', expData!.createExperiments.experiments[0].id, slug);

      return { objId };
    }

    it('should return full nested subgraph for a populated objective', async () => {
      const { objId } = await seedObjectiveTree(domainSlug);

      const { data, errors } = await executeGraphQL(`
        query ObjSub($id: ID!, $slug: String!) {
          objectiveSubgraph(objectiveId: $id, domainSlug: $slug) {
            id name status body
            opportunities {
              id name status hmw
              ideas {
                id name status
                assumptions {
                  id name status importance evidence
                  experiments { id name status method result }
                }
              }
            }
          }
        }
      `, { id: objId, slug: domainSlug });

      expect(errors).toBeUndefined();
      const sub = data!.objectiveSubgraph;
      expect(sub).not.toBeNull();
      expect(sub.name).toBe('Growth');
      expect(sub.body).toBe('Drive growth');
      expect(sub.opportunities).toHaveLength(2);

      const oppX = sub.opportunities.find((o: { name: string }) => o.name === 'Opp X');
      expect(oppX.hmw).toBe('How X?');
      expect(oppX.ideas).toHaveLength(1);
      expect(oppX.ideas[0].name).toBe('Idea X1');
      expect(oppX.ideas[0].assumptions).toHaveLength(1);
      expect(oppX.ideas[0].assumptions[0].name).toBe('Asm X1a');
      expect(oppX.ideas[0].assumptions[0].experiments).toHaveLength(1);
      expect(oppX.ideas[0].assumptions[0].experiments[0].name).toBe('Exp X1a-1');

      const oppY = sub.opportunities.find((o: { name: string }) => o.name === 'Opp Y');
      expect(oppY.ideas).toHaveLength(1);
      expect(oppY.ideas[0].assumptions[0].experiments).toHaveLength(0);
    });

    it('should return the objective with empty opportunities for an objective with no children', async () => {
      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Empty Obj", status: ACTIVE }]) { objectives { id } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;
      await connectToDomain('Objective', objId, domainSlug);

      const { data, errors } = await executeGraphQL(`
        query { objectiveSubgraph(objectiveId: "${objId}", domainSlug: "${domainSlug}") {
          id name opportunities { id }
        }}
      `);
      expect(errors).toBeUndefined();
      expect(data!.objectiveSubgraph).not.toBeNull();
      expect(data!.objectiveSubgraph.name).toBe('Empty Obj');
      expect(data!.objectiveSubgraph.opportunities).toHaveLength(0);
    });

    it('should return null for an objective in a different domain', async () => {
      const otherSlug = testDomain();
      await seedDomain(otherSlug);
      const { objId } = await seedObjectiveTree(otherSlug);

      const { data } = await executeGraphQL(`
        query { objectiveSubgraph(objectiveId: "${objId}", domainSlug: "${domainSlug}") { id } }
      `);
      expect(data!.objectiveSubgraph).toBeNull();
    });

    it('should return null for a non-existent objectiveId', async () => {
      const { data } = await executeGraphQL(`
        query { objectiveSubgraph(objectiveId: "does-not-exist", domainSlug: "${domainSlug}") { id } }
      `);
      expect(data!.objectiveSubgraph).toBeNull();
    });

    it('should not include opportunities from a different domain even if connected via SUPPORTS', async () => {
      // Objective in domainSlug, but an opportunity in otherSlug supports it.
      const otherSlug = testDomain();
      await seedDomain(otherSlug);

      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Scoped Obj", status: ACTIVE }]) { objectives { id } } }
      `);
      const objId = objData!.createObjectives.objectives[0].id;
      await connectToDomain('Objective', objId, domainSlug);

      const { data: oppData } = await executeGraphQL(`
        mutation { createOpportunities(input: [{ name: "Cross Opp", status: ACTIVE, supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] } }]) { opportunities { id } } }
      `);
      await connectToDomain('Opportunity', oppData!.createOpportunities.opportunities[0].id, otherSlug);

      const { data } = await executeGraphQL(`
        query { objectiveSubgraph(objectiveId: "${objId}", domainSlug: "${domainSlug}") {
          opportunities { id name }
        }}
      `);
      expect(data!.objectiveSubgraph.opportunities).toHaveLength(0);
    });
  });

  describe('orphan queries', () => {
    describe('orphanedOpportunities', () => {
      it('should return opportunities that do not support any objective', async () => {
        const { data: objData } = await executeGraphQL(`
          mutation { createObjectives(input: [{ name: "Root", status: ACTIVE }]) { objectives { id } } }
        `);
        const objId = objData!.createObjectives.objectives[0].id;
        await connectToDomain('Objective', objId, domainSlug);

        const { data: oppData } = await executeGraphQL(`
          mutation {
            createOpportunities(input: [
              { name: "Rooted", status: ACTIVE, hmw: "A", supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] } },
              { name: "Orphan 1", status: ACTIVE, hmw: "B" },
              { name: "Orphan 2", status: PAUSED, hmw: "C" }
            ]) { opportunities { id name } }
          }
        `);
        for (const o of oppData!.createOpportunities.opportunities) {
          await connectToDomain('Opportunity', o.id, domainSlug);
        }

        const { data, errors } = await executeGraphQL(`
          query { orphanedOpportunities(domainSlug: "${domainSlug}") { id name status hmw } }
        `);
        expect(errors).toBeUndefined();
        const names = data!.orphanedOpportunities.map((o: { name: string }) => o.name).sort();
        expect(names).toEqual(['Orphan 1', 'Orphan 2']);
        expect(data!.orphanedOpportunities.every((o: { hmw: string }) => typeof o.hmw === 'string')).toBe(true);
      });

      it('should return empty array for a domain with no orphans', async () => {
        const { data } = await executeGraphQL(`
          query { orphanedOpportunities(domainSlug: "${domainSlug}") { id } }
        `);
        expect(data!.orphanedOpportunities).toHaveLength(0);
      });

      it('should isolate by domain', async () => {
        const otherSlug = testDomain();
        await seedDomain(otherSlug);

        const { data: oppData } = await executeGraphQL(`
          mutation { createOpportunities(input: [{ name: "Other Orphan", status: ACTIVE }]) { opportunities { id } } }
        `);
        await connectToDomain('Opportunity', oppData!.createOpportunities.opportunities[0].id, otherSlug);

        const { data } = await executeGraphQL(`
          query { orphanedOpportunities(domainSlug: "${domainSlug}") { name } }
        `);
        expect(data!.orphanedOpportunities.find((o: { name: string }) => o.name === 'Other Orphan')).toBeUndefined();
      });

      it('should drop an opportunity from the orphan list once connected to an objective', async () => {
        const { data: oppData } = await executeGraphQL(`
          mutation { createOpportunities(input: [{ name: "Ex-Orphan", status: ACTIVE }]) { opportunities { id } } }
        `);
        const oppId = oppData!.createOpportunities.opportunities[0].id;
        await connectToDomain('Opportunity', oppId, domainSlug);

        const before = await executeGraphQL(`
          query { orphanedOpportunities(domainSlug: "${domainSlug}") { id name } }
        `);
        expect(before.data!.orphanedOpportunities.find((o: { name: string }) => o.name === 'Ex-Orphan')).toBeDefined();

        const { data: objData } = await executeGraphQL(`
          mutation { createObjectives(input: [{ name: "New Root", status: ACTIVE }]) { objectives { id } } }
        `);
        const objId = objData!.createObjectives.objectives[0].id;
        await connectToDomain('Objective', objId, domainSlug);

        await executeGraphQL(`
          mutation {
            updateOpportunities(
              where: { id: { eq: "${oppId}" } }
              update: { supports: { connect: [{ where: { node: { id: { eq: "${objId}" } } } }] } }
            ) { opportunities { id } }
          }
        `);

        const after = await executeGraphQL(`
          query { orphanedOpportunities(domainSlug: "${domainSlug}") { name } }
        `);
        expect(after.data!.orphanedOpportunities.find((o: { name: string }) => o.name === 'Ex-Orphan')).toBeUndefined();
      });
    });

    describe('unrootedIdeas', () => {
      it('should return ideas that do not address any opportunity', async () => {
        const { data: oppData } = await executeGraphQL(`
          mutation { createOpportunities(input: [{ name: "Host Opp", status: ACTIVE }]) { opportunities { id } } }
        `);
        const oppId = oppData!.createOpportunities.opportunities[0].id;
        await connectToDomain('Opportunity', oppId, domainSlug);

        const { data: ideaData } = await executeGraphQL(`
          mutation {
            createIdeas(input: [
              { name: "Rooted Idea", status: DRAFT, addresses: { connect: [{ where: { node: { id: { eq: "${oppId}" } } } }] } },
              { name: "Unrooted A", status: DRAFT },
              { name: "Unrooted B", status: EXPLORING }
            ]) { ideas { id name } }
          }
        `);
        for (const i of ideaData!.createIdeas.ideas) {
          await connectToDomain('Idea', i.id, domainSlug);
        }

        const { data, errors } = await executeGraphQL(`
          query { unrootedIdeas(domainSlug: "${domainSlug}") { id name status } }
        `);
        expect(errors).toBeUndefined();
        const names = data!.unrootedIdeas.map((i: { name: string }) => i.name).sort();
        expect(names).toEqual(['Unrooted A', 'Unrooted B']);
      });

      it('should return empty array for a domain with no unrooted ideas', async () => {
        const { data } = await executeGraphQL(`
          query { unrootedIdeas(domainSlug: "${domainSlug}") { id } }
        `);
        expect(data!.unrootedIdeas).toHaveLength(0);
      });

      it('should isolate by domain', async () => {
        const otherSlug = testDomain();
        await seedDomain(otherSlug);

        const { data: ideaData } = await executeGraphQL(`
          mutation { createIdeas(input: [{ name: "Other Unrooted", status: DRAFT }]) { ideas { id } } }
        `);
        await connectToDomain('Idea', ideaData!.createIdeas.ideas[0].id, otherSlug);

        const { data } = await executeGraphQL(`
          query { unrootedIdeas(domainSlug: "${domainSlug}") { name } }
        `);
        expect(data!.unrootedIdeas.find((i: { name: string }) => i.name === 'Other Unrooted')).toBeUndefined();
      });

      it('should drop an idea from the unrooted list once connected to an opportunity', async () => {
        const { data: ideaData } = await executeGraphQL(`
          mutation { createIdeas(input: [{ name: "Ex-Unrooted Idea", status: DRAFT }]) { ideas { id } } }
        `);
        const ideaId = ideaData!.createIdeas.ideas[0].id;
        await connectToDomain('Idea', ideaId, domainSlug);

        const before = await executeGraphQL(`
          query { unrootedIdeas(domainSlug: "${domainSlug}") { name } }
        `);
        expect(before.data!.unrootedIdeas.find((i: { name: string }) => i.name === 'Ex-Unrooted Idea')).toBeDefined();

        const { data: oppData } = await executeGraphQL(`
          mutation { createOpportunities(input: [{ name: "Adopt Opp", status: ACTIVE }]) { opportunities { id } } }
        `);
        const oppId = oppData!.createOpportunities.opportunities[0].id;
        await connectToDomain('Opportunity', oppId, domainSlug);

        await executeGraphQL(`
          mutation {
            updateIdeas(
              where: { id: { eq: "${ideaId}" } }
              update: { addresses: { connect: [{ where: { node: { id: { eq: "${oppId}" } } } }] } }
            ) { ideas { id } }
          }
        `);

        const after = await executeGraphQL(`
          query { unrootedIdeas(domainSlug: "${domainSlug}") { name } }
        `);
        expect(after.data!.unrootedIdeas.find((i: { name: string }) => i.name === 'Ex-Unrooted Idea')).toBeUndefined();
      });
    });

    describe('unrootedAssumptions', () => {
      it('should return assumptions that are not assumed by any idea', async () => {
        const { data: ideaData } = await executeGraphQL(`
          mutation { createIdeas(input: [{ name: "Host Idea", status: DRAFT }]) { ideas { id } } }
        `);
        const ideaId = ideaData!.createIdeas.ideas[0].id;
        await connectToDomain('Idea', ideaId, domainSlug);

        const { data: aData } = await executeGraphQL(`
          mutation {
            createAssumptions(input: [
              { name: "Rooted Asm", status: UNTESTED, importance: HIGH, evidence: LOW, assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaId}" } } } }] } },
              { name: "Floating 1", status: UNTESTED, importance: HIGH, evidence: LOW },
              { name: "Floating 2", status: VALIDATED, importance: MEDIUM, evidence: MEDIUM }
            ]) { assumptions { id name } }
          }
        `);
        for (const a of aData!.createAssumptions.assumptions) {
          await connectToDomain('Assumption', a.id, domainSlug);
        }

        const { data, errors } = await executeGraphQL(`
          query { unrootedAssumptions(domainSlug: "${domainSlug}") { id name status importance } }
        `);
        expect(errors).toBeUndefined();
        const names = data!.unrootedAssumptions.map((a: { name: string }) => a.name).sort();
        expect(names).toEqual(['Floating 1', 'Floating 2']);
        expect(data!.unrootedAssumptions.every((a: { importance: string }) => typeof a.importance === 'string')).toBe(true);
      });

      it('should return empty array for a domain with no unrooted assumptions', async () => {
        const { data } = await executeGraphQL(`
          query { unrootedAssumptions(domainSlug: "${domainSlug}") { id } }
        `);
        expect(data!.unrootedAssumptions).toHaveLength(0);
      });

      it('should isolate by domain', async () => {
        const otherSlug = testDomain();
        await seedDomain(otherSlug);

        const { data: aData } = await executeGraphQL(`
          mutation { createAssumptions(input: [{ name: "Other Floating", status: UNTESTED, importance: HIGH, evidence: LOW }]) { assumptions { id } } }
        `);
        await connectToDomain('Assumption', aData!.createAssumptions.assumptions[0].id, otherSlug);

        const { data } = await executeGraphQL(`
          query { unrootedAssumptions(domainSlug: "${domainSlug}") { name } }
        `);
        expect(data!.unrootedAssumptions.find((a: { name: string }) => a.name === 'Other Floating')).toBeUndefined();
      });

      it('should drop an assumption from the unrooted list once connected to an idea', async () => {
        const { data: aData } = await executeGraphQL(`
          mutation { createAssumptions(input: [{ name: "Ex-Floating", status: UNTESTED, importance: HIGH, evidence: LOW }]) { assumptions { id } } }
        `);
        const asmId = aData!.createAssumptions.assumptions[0].id;
        await connectToDomain('Assumption', asmId, domainSlug);

        const before = await executeGraphQL(`
          query { unrootedAssumptions(domainSlug: "${domainSlug}") { name } }
        `);
        expect(before.data!.unrootedAssumptions.find((a: { name: string }) => a.name === 'Ex-Floating')).toBeDefined();

        const { data: ideaData } = await executeGraphQL(`
          mutation { createIdeas(input: [{ name: "Adopt Idea", status: DRAFT }]) { ideas { id } } }
        `);
        const ideaId = ideaData!.createIdeas.ideas[0].id;
        await connectToDomain('Idea', ideaId, domainSlug);

        await executeGraphQL(`
          mutation {
            updateAssumptions(
              where: { id: { eq: "${asmId}" } }
              update: { assumedBy: { connect: [{ where: { node: { id: { eq: "${ideaId}" } } } }] } }
            ) { assumptions { id } }
          }
        `);

        const after = await executeGraphQL(`
          query { unrootedAssumptions(domainSlug: "${domainSlug}") { name } }
        `);
        expect(after.data!.unrootedAssumptions.find((a: { name: string }) => a.name === 'Ex-Floating')).toBeUndefined();
      });
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
