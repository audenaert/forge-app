import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, testDomain, seedDomain } from './setup.js';
import { executeGraphQL } from './graphql-client.js';

describe('CRUD for all 5 discovery types', () => {
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

  /** Helper to create inline domain */
  function domainCreate(slug: string): string {
    return `domain: { create: { node: { slug: "${slug}", name: "D ${slug}" } } }`;
  }

  // --- Objective CRUD ---

  describe('Objective', () => {
    it('should create with auto-generated UUID and createdAt', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createObjectives(input: [{
            name: "Test Objective"
            status: ACTIVE
            ${domainCreate(testDomain())}
          }]) {
            objectives { id name status body createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const obj = data!.createObjectives.objectives[0];
      expect(obj.id).toBeTruthy();
      expect(obj.name).toBe('Test Objective');
      expect(obj.status).toBe('ACTIVE');
      expect(obj.createdAt).toBeTruthy();
      expect(obj.updatedAt).toBeNull();
    });

    it('should read by ID', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Read Test", status: ACTIVE }]) { objectives { id } } }
      `);
      const id = createData!.createObjectives.objectives[0].id;

      const { data, errors } = await executeGraphQL(`
        query { objectives(where: { id: { eq: "${id}" } }) { id name status createdAt updatedAt } }
      `);

      expect(errors).toBeUndefined();
      expect(data!.objectives).toHaveLength(1);
      expect(data!.objectives[0].id).toBe(id);
    });

    it('should filter with name contains and status in', async () => {
      const s = testDomain();
      await executeGraphQL(`
        mutation {
          createObjectives(input: [
            { name: "Alpha Goal", status: ACTIVE, ${domainCreate(s + '-a')} },
            { name: "Beta Goal", status: PAUSED, ${domainCreate(s + '-b')} },
            { name: "Alpha Target", status: ACHIEVED, ${domainCreate(s + '-c')} }
          ]) { objectives { id } }
        }
      `);

      const { data } = await executeGraphQL(`
        query { objectives(where: { name: { contains: "Alpha" }, domain: { slug: { startsWith: "${s}" } } }) { id name } }
      `);
      expect(data!.objectives).toHaveLength(2);

      const { data: data2 } = await executeGraphQL(`
        query { objectives(where: { status: { in: [ACTIVE, PAUSED] }, domain: { slug: { startsWith: "${s}" } } }) { id name status } }
      `);
      expect(data2!.objectives).toHaveLength(2);
    });

    it('should update fields and set updatedAt', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Before Update", status: ACTIVE }]) { objectives { id createdAt } } }
      `);
      const { id, createdAt } = createData!.createObjectives.objectives[0];

      const { data, errors } = await executeGraphQL(`
        mutation {
          updateObjectives(
            where: { id: { eq: "${id}" } }
            update: { name: { set: "After Update" }, status: { set: PAUSED } }
          ) {
            objectives { id name status createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const obj = data!.updateObjectives.objectives[0];
      expect(obj.name).toBe('After Update');
      expect(obj.status).toBe('PAUSED');
      expect(obj.createdAt).toBe(createdAt);
      expect(obj.updatedAt).toBeTruthy();
    });

    it('should delete a node', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "To Delete", status: ACTIVE }]) { objectives { id } } }
      `);
      const id = createData!.createObjectives.objectives[0].id;

      const { data, errors } = await executeGraphQL(`
        mutation { deleteObjectives(where: { id: { eq: "${id}" } }) { nodesDeleted } }
      `);

      expect(errors).toBeUndefined();
      expect(data!.deleteObjectives.nodesDeleted).toBe(1);

      const { data: queryData } = await executeGraphQL(`
        query { objectives(where: { id: { eq: "${id}" } }) { id } }
      `);
      expect(queryData!.objectives).toHaveLength(0);
    });
  });

  // --- Opportunity CRUD ---

  describe('Opportunity', () => {
    it('should create with all fields', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [{
            name: "User Onboarding Pain"
            status: ACTIVE
            hmw: "How might we reduce onboarding friction?"
            body: "Users drop off during onboarding"
            ${domainCreate(testDomain())}
          }]) {
            opportunities { id name status hmw body createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const opp = data!.createOpportunities.opportunities[0];
      expect(opp.id).toBeTruthy();
      expect(opp.hmw).toBe('How might we reduce onboarding friction?');
      expect(opp.createdAt).toBeTruthy();
      expect(opp.updatedAt).toBeNull();
    });

    it('should update and set updatedAt', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createOpportunities(input: [{ name: "Before", status: ACTIVE }]) { opportunities { id createdAt } } }
      `);
      const { id, createdAt } = createData!.createOpportunities.opportunities[0];

      const { data } = await executeGraphQL(`
        mutation {
          updateOpportunities(
            where: { id: { eq: "${id}" } }
            update: { name: { set: "After" }, status: { set: RESOLVED } }
          ) {
            opportunities { name status createdAt updatedAt }
          }
        }
      `);

      expect(data!.updateOpportunities.opportunities[0].name).toBe('After');
      expect(data!.updateOpportunities.opportunities[0].updatedAt).toBeTruthy();
      expect(data!.updateOpportunities.opportunities[0].createdAt).toBe(createdAt);
    });

    it('should delete', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createOpportunities(input: [{ name: "Delete Me", status: ACTIVE }]) { opportunities { id } } }
      `);
      const id = createData!.createOpportunities.opportunities[0].id;

      const { data } = await executeGraphQL(`
        mutation { deleteOpportunities(where: { id: { eq: "${id}" } }) { nodesDeleted } }
      `);
      expect(data!.deleteOpportunities.nodesDeleted).toBe(1);
    });
  });

  // --- Idea CRUD ---

  describe('Idea', () => {
    it('should create with auto-generated UUID', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createIdeas(input: [{ name: "Guided Tour", status: DRAFT, body: "Interactive walkthrough" }]) {
            ideas { id name status body createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      expect(data!.createIdeas.ideas[0].id).toBeTruthy();
      expect(data!.createIdeas.ideas[0].status).toBe('DRAFT');
    });

    it('should update status through lifecycle', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createIdeas(input: [{ name: "Lifecycle Idea", status: DRAFT }]) { ideas { id } } }
      `);
      const id = createData!.createIdeas.ideas[0].id;

      for (const status of ['EXPLORING', 'VALIDATED', 'READY_FOR_BUILD', 'BUILDING', 'SHIPPED']) {
        const { data } = await executeGraphQL(`
          mutation { updateIdeas(where: { id: { eq: "${id}" } }, update: { status: { set: ${status} } }) { ideas { status } } }
        `);
        expect(data!.updateIdeas.ideas[0].status).toBe(status);
      }
    });
  });

  // --- Assumption CRUD ---

  describe('Assumption', () => {
    it('should create with importance and evidence', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createAssumptions(input: [{
            name: "Users want guided tours"
            status: UNTESTED
            importance: HIGH
            evidence: LOW
          }]) {
            assumptions { id name status importance evidence createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const assumption = data!.createAssumptions.assumptions[0];
      expect(assumption.importance).toBe('HIGH');
      expect(assumption.evidence).toBe('LOW');
    });
  });

  // --- Experiment CRUD ---

  describe('Experiment', () => {
    it('should create with all optional fields', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createExperiments(input: [{
            name: "User Interview Round 1"
            status: PLANNED
            method: USER_INTERVIEW
            successCriteria: "5/5 users complete onboarding"
            duration: "1 week"
            effort: MEDIUM
          }]) {
            experiments { id name status method successCriteria duration effort result learnings createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const exp = data!.createExperiments.experiments[0];
      expect(exp.method).toBe('USER_INTERVIEW');
      expect(exp.successCriteria).toBe('5/5 users complete onboarding');
      expect(exp.effort).toBe('MEDIUM');
      expect(exp.result).toBeNull();
      expect(exp.learnings).toBeNull();
    });

    it('should update with result and learnings', async () => {
      const { data: createData } = await executeGraphQL(`
        mutation { createExperiments(input: [{ name: "Complete Me", status: RUNNING, method: SURVEY }]) { experiments { id } } }
      `);
      const id = createData!.createExperiments.experiments[0].id;

      const { data } = await executeGraphQL(`
        mutation {
          updateExperiments(
            where: { id: { eq: "${id}" } }
            update: {
              status: { set: COMPLETE }
              result: { set: VALIDATED }
              learnings: { set: "Users prefer step-by-step guidance" }
            }
          ) {
            experiments { status result learnings updatedAt }
          }
        }
      `);

      expect(data!.updateExperiments.experiments[0].status).toBe('COMPLETE');
      expect(data!.updateExperiments.experiments[0].result).toBe('VALIDATED');
      expect(data!.updateExperiments.experiments[0].learnings).toBe('Users prefer step-by-step guidance');
    });
  });

  // --- Cursor pagination ---

  describe('Pagination', () => {
    it('should support cursor-based pagination via Connection queries', async () => {
      const s = testDomain();
      await executeGraphQL(`
        mutation {
          createObjectives(input: [
            { name: "Page1", status: ACTIVE, ${domainCreate(s + '-1')} },
            { name: "Page2", status: ACTIVE, ${domainCreate(s + '-2')} },
            { name: "Page3", status: ACTIVE, ${domainCreate(s + '-3')} }
          ]) { objectives { id } }
        }
      `);

      const { data, errors } = await executeGraphQL(`
        query {
          objectivesConnection(where: { domain: { slug: { startsWith: "${s}" } } }, first: 2) {
            totalCount
            pageInfo { hasNextPage endCursor }
            edges { node { name } }
          }
        }
      `);

      expect(errors).toBeUndefined();
      expect(data!.objectivesConnection.totalCount).toBe(3);
      expect(data!.objectivesConnection.edges).toHaveLength(2);
      expect(data!.objectivesConnection.pageInfo.hasNextPage).toBe(true);
    });
  });
});
