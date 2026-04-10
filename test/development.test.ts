import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, testDomain, seedDomain, getDriver } from './setup.js';
import { executeGraphQL } from './graphql-client.js';

describe('Development artifact types (M2)', () => {
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

  /** Connect an existing node to a pre-seeded domain via Cypher */
  async function connectToDomain(label: string, nodeId: string, slug: string): Promise<void> {
    const session = getDriver().session();
    try {
      await session.run(
        `MATCH (n:${label} {id: $nodeId}), (d:Domain {slug: $slug}) MERGE (n)-[:BELONGS_TO]->(d)`,
        { nodeId, slug }
      );
    } finally {
      await session.close();
    }
  }

  /** Connect two nodes via a relationship type using Cypher (for singular @relationship fields) */
  async function connectNodes(
    fromLabel: string, fromId: string,
    relType: string,
    toLabel: string, toId: string
  ): Promise<void> {
    const session = getDriver().session();
    try {
      await session.run(
        `MATCH (a:${fromLabel} {id: $fromId}), (b:${toLabel} {id: $toId}) MERGE (a)-[:${relType}]->(b)`,
        { fromId, toId }
      );
    } finally {
      await session.close();
    }
  }

  // =====================================================================
  // CRUD for all development types
  // =====================================================================

  describe('CRUD — Initiative', () => {
    it('should create with auto-generated UUID and createdAt', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createInitiatives(input: [{
            name: "Platform Auth Overhaul"
            status: PROPOSED
            body: "Strategic initiative"
          }]) { initiatives { id name status body createdAt updatedAt } }
        }
      `);
      expect(errors).toBeUndefined();
      const node = data!.createInitiatives.initiatives[0];
      expect(node.id).toBeTruthy();
      expect(node.name).toBe('Platform Auth Overhaul');
      expect(node.status).toBe('PROPOSED');
      expect(node.createdAt).toBeTruthy();
      expect(node.updatedAt).toBeNull();
    });

    it('should update status', async () => {
      const { data: cd } = await executeGraphQL(`
        mutation { createInitiatives(input: [{ name: "I", status: PROPOSED }]) { initiatives { id } } }
      `);
      const id = cd!.createInitiatives.initiatives[0].id;
      const { data } = await executeGraphQL(`
        mutation { updateInitiatives(where: { id: { eq: "${id}" } }, update: { status: { set: ACTIVE } }) { initiatives { status updatedAt } } }
      `);
      expect(data!.updateInitiatives.initiatives[0].status).toBe('ACTIVE');
      expect(data!.updateInitiatives.initiatives[0].updatedAt).toBeTruthy();
    });

    it('should delete', async () => {
      const { data: cd } = await executeGraphQL(`
        mutation { createInitiatives(input: [{ name: "Del", status: PROPOSED }]) { initiatives { id } } }
      `);
      const id = cd!.createInitiatives.initiatives[0].id;
      const { data } = await executeGraphQL(`
        mutation { deleteInitiatives(where: { id: { eq: "${id}" } }) { nodesDeleted } }
      `);
      expect(data!.deleteInitiatives.nodesDeleted).toBe(1);
    });
  });

  describe('CRUD — Project', () => {
    it('should create and read back', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createProjects(input: [{ name: "OAuth2 Migration", status: SCOPING, body: "Project body" }]) {
            projects { id name status body createdAt updatedAt }
          }
        }
      `);
      expect(errors).toBeUndefined();
      expect(data!.createProjects.projects[0].status).toBe('SCOPING');
      expect(data!.createProjects.projects[0].updatedAt).toBeNull();
    });
  });

  describe('CRUD — Epic', () => {
    it('should create and read back', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation { createEpics(input: [{ name: "Provider Integration", status: DRAFT }]) { epics { id name status createdAt updatedAt } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.createEpics.epics[0].status).toBe('DRAFT');
    });
  });

  describe('CRUD — Story', () => {
    it('should create with acceptance criteria', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createStories(input: [{
            name: "User can sign in with Google"
            status: DRAFT
            acceptanceCriteria: "Given an unauth user, when they click Sign in, then redirected to Google"
          }]) { stories { id name status acceptanceCriteria createdAt updatedAt } }
        }
      `);
      expect(errors).toBeUndefined();
      expect(data!.createStories.stories[0].acceptanceCriteria).toContain('Google');
    });
  });

  describe('CRUD — Task', () => {
    it('should create and update', async () => {
      const { data: cd } = await executeGraphQL(`
        mutation { createTasks(input: [{ name: "Implement callback", status: TODO }]) { tasks { id status } } }
      `);
      expect(cd!.createTasks.tasks[0].status).toBe('TODO');
      const id = cd!.createTasks.tasks[0].id;
      const { data } = await executeGraphQL(`
        mutation { updateTasks(where: { id: { eq: "${id}" } }, update: { status: { set: IN_PROGRESS } }) { tasks { status } } }
      `);
      expect(data!.updateTasks.tasks[0].status).toBe('IN_PROGRESS');
    });
  });

  describe('CRUD — Enhancement', () => {
    it('should create and read', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation { createEnhancements(input: [{ name: "Add spinner", status: TODO }]) { enhancements { id name status createdAt } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.createEnhancements.enhancements[0].name).toBe('Add spinner');
    });
  });

  describe('CRUD — Bug', () => {
    it('should create with severity', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createBugs(input: [{ name: "Token refresh fails", status: OPEN, severity: HIGH }]) {
            bugs { id name status severity createdAt }
          }
        }
      `);
      expect(errors).toBeUndefined();
      expect(data!.createBugs.bugs[0].severity).toBe('HIGH');
    });
  });

  describe('CRUD — Chore', () => {
    it('should create and read', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation { createChores(input: [{ name: "Update deps", status: TODO }]) { chores { id name status createdAt } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.createChores.chores[0].name).toBe('Update deps');
    });
  });

  describe('CRUD — Spike', () => {
    it('should create with all fields', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createSpikes(input: [{
            name: "Evaluate OAuth libs"
            status: PLANNED
            timeBox: "2 days"
            question: "Which lib for multi-provider?"
            decisionCriteria: "Supports 3 providers"
          }]) { spikes { id name status timeBox question decisionCriteria outcome result createdAt } }
        }
      `);
      expect(errors).toBeUndefined();
      const spike = data!.createSpikes.spikes[0];
      expect(spike.timeBox).toBe('2 days');
      expect(spike.outcome).toBeNull();
    });
  });

  describe('CRUD — Spec', () => {
    it('should create and read', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation { createSpecs(input: [{ name: "Token management design", status: DRAFT }]) { specs { id name status createdAt } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.createSpecs.specs[0].status).toBe('DRAFT');
    });
  });

  describe('CRUD — ADR', () => {
    it('should create and update', async () => {
      const { data: cd } = await executeGraphQL(`
        mutation { createAdrs(input: [{ name: "ADR-001: Use passport.js", status: PROPOSED }]) { adrs { id name status } } }
      `);
      expect(cd!.createAdrs.adrs[0].status).toBe('PROPOSED');
      const id = cd!.createAdrs.adrs[0].id;
      const { data } = await executeGraphQL(`
        mutation { updateAdrs(where: { id: { eq: "${id}" } }, update: { status: { set: ACCEPTED } }) { adrs { status updatedAt } } }
      `);
      expect(data!.updateAdrs.adrs[0].status).toBe('ACCEPTED');
    });
  });

  describe('CRUD — DevWorkstream', () => {
    it('should create with interface contracts', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createDevWorkstreams(input: [{
            name: "Backend Auth"
            status: ACTIVE
            owner: "alice"
            interfaceContracts: ["POST /auth/token — returns JWT"]
          }]) { devWorkstreams { id name status owner interfaceContracts createdAt } }
        }
      `);
      expect(errors).toBeUndefined();
      const ws = data!.createDevWorkstreams.devWorkstreams[0];
      expect(ws.interfaceContracts).toEqual(['POST /auth/token — returns JWT']);
    });
  });

  describe('CRUD — DevMilestone', () => {
    it('should create with all fields', async () => {
      const { data, errors } = await executeGraphQL(`
        mutation {
          createDevMilestones(input: [{
            name: "M1: Google OAuth E2E"
            status: PLANNED
            milestoneType: VALUE
            demoCriteria: "User can sign in with Google"
            workstreamDeliverables: ["Backend: Google OAuth endpoint", "Frontend: Login button"]
          }]) { devMilestones { id name status milestoneType demoCriteria workstreamDeliverables createdAt } }
        }
      `);
      expect(errors).toBeUndefined();
      const ms = data!.createDevMilestones.devMilestones[0];
      expect(ms.milestoneType).toBe('VALUE');
      expect(ms.workstreamDeliverables).toHaveLength(2);
    });
  });

  // =====================================================================
  // Parent/children hierarchy (singular @relationship uses Cypher MERGE)
  // =====================================================================

  describe('Parent/children hierarchy', () => {
    it('should create Initiative -> Project -> Epic -> Story -> Task chain', async () => {
      // Create all nodes
      const { data: initData } = await executeGraphQL(`
        mutation { createInitiatives(input: [{ name: "Init", status: ACTIVE }]) { initiatives { id } } }
      `);
      const initId = initData!.createInitiatives.initiatives[0].id;

      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "Proj", status: PLANNING }]) { projects { id } } }
      `);
      const projId = projData!.createProjects.projects[0].id;

      const { data: epicData } = await executeGraphQL(`
        mutation { createEpics(input: [{ name: "Epic", status: DRAFT }]) { epics { id } } }
      `);
      const epicId = epicData!.createEpics.epics[0].id;

      const { data: storyData } = await executeGraphQL(`
        mutation { createStories(input: [{ name: "Story", status: DRAFT }]) { stories { id } } }
      `);
      const storyId = storyData!.createStories.stories[0].id;

      const { data: taskData } = await executeGraphQL(`
        mutation { createTasks(input: [{ name: "Task", status: TODO }]) { tasks { id } } }
      `);
      const taskId = taskData!.createTasks.tasks[0].id;

      // Connect via PARENT_OF using Cypher (singular @relationship)
      await connectNodes('Initiative', initId, 'PARENT_OF', 'Project', projId);
      await connectNodes('Project', projId, 'PARENT_OF', 'Epic', epicId);
      await connectNodes('Epic', epicId, 'PARENT_OF', 'Story', storyId);
      await connectNodes('Story', storyId, 'PARENT_OF', 'Task', taskId);

      // Verify parent from Project
      const { data: projQuery } = await executeGraphQL(`
        query { projects(where: { id: { eq: "${projId}" } }) { parent { id name } } }
      `);
      expect(projQuery!.projects[0].parent.id).toBe(initId);

      // Verify full traversal from Initiative down
      const { data: initQuery } = await executeGraphQL(`
        query {
          initiatives(where: { id: { eq: "${initId}" } }) {
            name
            children {
              name
              children {
                name
                children {
                  name
                  children { name }
                }
              }
            }
          }
        }
      `);
      expect(initQuery!.initiatives[0].children[0].name).toBe('Proj');
      expect(initQuery!.initiatives[0].children[0].children[0].name).toBe('Epic');
      expect(initQuery!.initiatives[0].children[0].children[0].children[0].name).toBe('Story');
      expect(initQuery!.initiatives[0].children[0].children[0].children[0].children[0].name).toBe('Task');
    });
  });

  // =====================================================================
  // Workstream and milestone assignment
  // =====================================================================

  describe('Workstream and milestone assignment', () => {
    it('should assign workstream and milestone to project, epic', async () => {
      // Create project
      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "Proj", status: PLANNING }]) { projects { id } } }
      `);
      const projId = projData!.createProjects.projects[0].id;

      // Create workstream
      const { data: wsData } = await executeGraphQL(`
        mutation {
          createDevWorkstreams(input: [{
            name: "Backend"
            status: ACTIVE
            interfaceContracts: []
          }]) { devWorkstreams { id } }
        }
      `);
      const wsId = wsData!.createDevWorkstreams.devWorkstreams[0].id;

      // Create milestone
      const { data: msData } = await executeGraphQL(`
        mutation {
          createDevMilestones(input: [{
            name: "M1"
            status: PLANNED
            milestoneType: VALUE
            workstreamDeliverables: ["Backend delivers auth endpoint"]
          }]) { devMilestones { id } }
        }
      `);
      const msId = msData!.createDevMilestones.devMilestones[0].id;

      // Link workstream and milestone to project via Cypher
      await connectNodes('Project', projId, 'HAS_WORKSTREAM', 'DevWorkstream', wsId);
      await connectNodes('Project', projId, 'HAS_MILESTONE', 'DevMilestone', msId);

      // Verify project sees both
      const { data: projQuery } = await executeGraphQL(`
        query { projects(where: { id: { eq: "${projId}" } }) { workstreams { id name } milestones { id name } } }
      `);
      expect(projQuery!.projects[0].workstreams).toHaveLength(1);
      expect(projQuery!.projects[0].workstreams[0].name).toBe('Backend');
      expect(projQuery!.projects[0].milestones).toHaveLength(1);
      expect(projQuery!.projects[0].milestones[0].name).toBe('M1');

      // Verify reverse: workstream sees project
      const { data: wsQuery } = await executeGraphQL(`
        query { devWorkstreams(where: { id: { eq: "${wsId}" } }) { project { id } } }
      `);
      expect(wsQuery!.devWorkstreams[0].project.id).toBe(projId);

      // Create epic and assign to workstream + milestone via Cypher
      const { data: epicData } = await executeGraphQL(`
        mutation { createEpics(input: [{ name: "Epic", status: DRAFT }]) { epics { id } } }
      `);
      const epicId = epicData!.createEpics.epics[0].id;

      await connectNodes('Project', projId, 'PARENT_OF', 'Epic', epicId);
      await connectNodes('Epic', epicId, 'ASSIGNED_TO_WORKSTREAM', 'DevWorkstream', wsId);
      await connectNodes('Epic', epicId, 'ASSIGNED_TO_MILESTONE', 'DevMilestone', msId);

      const { data: epicQuery } = await executeGraphQL(`
        query { epics(where: { id: { eq: "${epicId}" } }) { workstream { id } milestone { id } } }
      `);
      expect(epicQuery!.epics[0].workstream.id).toBe(wsId);
      expect(epicQuery!.epics[0].milestone.id).toBe(msId);
    });
  });

  // =====================================================================
  // from_discovery cross-graph bridge
  // =====================================================================

  describe('FROM_DISCOVERY cross-graph bridge', () => {
    it('should link a Project to a discovery Idea', async () => {
      // Create a discovery Idea
      const { data: ideaData } = await executeGraphQL(`
        mutation { createIdeas(input: [{ name: "Modern Auth Flow", status: VALIDATED }]) { ideas { id } } }
      `);
      const ideaId = ideaData!.createIdeas.ideas[0].id;

      // Create a Project
      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "OAuth2 Migration", status: SCOPING }]) { projects { id } } }
      `);
      const projId = projData!.createProjects.projects[0].id;

      // Link via Cypher (singular @relationship)
      await connectNodes('Project', projId, 'FROM_DISCOVERY', 'Idea', ideaId);

      // Verify the link
      const { data, errors } = await executeGraphQL(`
        query { projects(where: { id: { eq: "${projId}" } }) { id fromDiscovery { id name status } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.projects[0].fromDiscovery.id).toBe(ideaId);
      expect(data!.projects[0].fromDiscovery.name).toBe('Modern Auth Flow');

      // Also test Initiative -> Idea bridge
      const { data: initData } = await executeGraphQL(`
        mutation { createInitiatives(input: [{ name: "Auth Overhaul", status: PROPOSED }]) { initiatives { id } } }
      `);
      const initId = initData!.createInitiatives.initiatives[0].id;
      await connectNodes('Initiative', initId, 'FROM_DISCOVERY', 'Idea', ideaId);

      const { data: initQuery } = await executeGraphQL(`
        query { initiatives(where: { id: { eq: "${initId}" } }) { fromDiscovery { id name } } }
      `);
      expect(initQuery!.initiatives[0].fromDiscovery.name).toBe('Modern Auth Flow');
    });
  });

  // =====================================================================
  // Spec and ADR linking
  // =====================================================================

  describe('Spec and ADR linking', () => {
    it('should link Spec to a Project via SPEC_FOR', async () => {
      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "Proj", status: PLANNING }]) { projects { id } } }
      `);
      const projId = projData!.createProjects.projects[0].id;

      const { data: specData } = await executeGraphQL(`
        mutation { createSpecs(input: [{ name: "Token Mgmt Design", status: DRAFT }]) { specs { id } } }
      `);
      const specId = specData!.createSpecs.specs[0].id;

      await connectNodes('Spec', specId, 'SPEC_FOR', 'Project', projId);

      const { data, errors } = await executeGraphQL(`
        query { specs(where: { id: { eq: "${specId}" } }) { specFor { id name } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.specs[0].specFor.id).toBe(projId);
    });

    it('should link ADR to a Project via ADR_FOR', async () => {
      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "Proj", status: PLANNING }]) { projects { id } } }
      `);
      const projId = projData!.createProjects.projects[0].id;

      const { data: adrData } = await executeGraphQL(`
        mutation { createAdrs(input: [{ name: "ADR-001: Use passport.js", status: PROPOSED }]) { adrs { id } } }
      `);
      const adrId = adrData!.createAdrs.adrs[0].id;

      await connectNodes('ADR', adrId, 'ADR_FOR', 'Project', projId);

      const { data, errors } = await executeGraphQL(`
        query { adrs(where: { id: { eq: "${adrId}" } }) { adrFor { id name } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.adrs[0].adrFor.id).toBe(projId);
    });

    it('should link ADR supersededBy another ADR', async () => {
      const { data: adr1Data } = await executeGraphQL(`
        mutation { createAdrs(input: [{ name: "ADR-001", status: ACCEPTED }]) { adrs { id } } }
      `);
      const adr1Id = adr1Data!.createAdrs.adrs[0].id;

      const { data: adr2Data } = await executeGraphQL(`
        mutation { createAdrs(input: [{ name: "ADR-002", status: PROPOSED }]) { adrs { id } } }
      `);
      const adr2Id = adr2Data!.createAdrs.adrs[0].id;

      // Link via Cypher and update status
      await connectNodes('ADR', adr1Id, 'SUPERSEDED_BY', 'ADR', adr2Id);
      await executeGraphQL(`
        mutation { updateAdrs(where: { id: { eq: "${adr1Id}" } }, update: { status: { set: SUPERSEDED } }) { adrs { id } } }
      `);

      const { data, errors } = await executeGraphQL(`
        query { adrs(where: { id: { eq: "${adr1Id}" } }) { status supersededBy { id name } } }
      `);
      expect(errors).toBeUndefined();
      expect(data!.adrs[0].status).toBe('SUPERSEDED');
      expect(data!.adrs[0].supersededBy.name).toBe('ADR-002');
    });
  });

  // =====================================================================
  // projectHierarchy traversal query
  // =====================================================================

  describe('projectHierarchy query', () => {
    it('should return nested project -> epics -> stories -> tasks', async () => {
      // Create a full hierarchy connected to domain
      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "Auth Project", status: IN_PROGRESS }]) { projects { id } } }
      `);
      const projId = projData!.createProjects.projects[0].id;
      await connectToDomain('Project', projId, domainSlug);

      // Create epics
      const { data: epicAData } = await executeGraphQL(`
        mutation { createEpics(input: [{ name: "Epic A", status: IN_PROGRESS }]) { epics { id } } }
      `);
      const epicAId = epicAData!.createEpics.epics[0].id;

      const { data: epicBData } = await executeGraphQL(`
        mutation { createEpics(input: [{ name: "Epic B", status: DRAFT }]) { epics { id } } }
      `);
      const epicBId = epicBData!.createEpics.epics[0].id;

      await connectNodes('Project', projId, 'PARENT_OF', 'Epic', epicAId);
      await connectNodes('Project', projId, 'PARENT_OF', 'Epic', epicBId);

      // Create stories under Epic A
      const { data: story1Data } = await executeGraphQL(`
        mutation { createStories(input: [{ name: "Story 1", status: READY, acceptanceCriteria: "AC1" }]) { stories { id } } }
      `);
      const story1Id = story1Data!.createStories.stories[0].id;

      const { data: story2Data } = await executeGraphQL(`
        mutation { createStories(input: [{ name: "Story 2", status: DRAFT }]) { stories { id } } }
      `);
      const story2Id = story2Data!.createStories.stories[0].id;

      await connectNodes('Epic', epicAId, 'PARENT_OF', 'Story', story1Id);
      await connectNodes('Epic', epicAId, 'PARENT_OF', 'Story', story2Id);

      // Create tasks under Story 1
      const { data: taskAData } = await executeGraphQL(`
        mutation { createTasks(input: [{ name: "Task A", status: TODO }]) { tasks { id } } }
      `);
      const { data: taskBData } = await executeGraphQL(`
        mutation { createTasks(input: [{ name: "Task B", status: IN_PROGRESS }]) { tasks { id } } }
      `);
      await connectNodes('Story', story1Id, 'PARENT_OF', 'Task', taskAData!.createTasks.tasks[0].id);
      await connectNodes('Story', story1Id, 'PARENT_OF', 'Task', taskBData!.createTasks.tasks[0].id);

      // Query the hierarchy
      const { data, errors } = await executeGraphQL(`
        query ProjectHierarchy($projId: ID!, $slug: String!) {
          projectHierarchy(projectId: $projId, domainSlug: $slug) {
            id name status
            epics {
              id name status
              stories {
                id name status acceptanceCriteria
                tasks { id name status }
              }
            }
          }
        }
      `, { projId, slug: domainSlug });

      expect(errors).toBeUndefined();
      const hierarchy = data!.projectHierarchy;
      expect(hierarchy).not.toBeNull();
      expect(hierarchy.name).toBe('Auth Project');
      expect(hierarchy.epics).toHaveLength(2);

      const epicA = hierarchy.epics.find((e: { name: string }) => e.name === 'Epic A');
      expect(epicA).toBeDefined();
      expect(epicA.stories).toHaveLength(2);

      const story1 = epicA.stories.find((s: { name: string }) => s.name === 'Story 1');
      expect(story1).toBeDefined();
      expect(story1.acceptanceCriteria).toBe('AC1');
      expect(story1.tasks).toHaveLength(2);

      const epicB = hierarchy.epics.find((e: { name: string }) => e.name === 'Epic B');
      expect(epicB).toBeDefined();
      expect(epicB.stories).toHaveLength(0);
    });

    it('should return null for non-existent project', async () => {
      const { data } = await executeGraphQL(`
        query { projectHierarchy(projectId: "no-such-id", domainSlug: "${domainSlug}") { id } }
      `);
      expect(data!.projectHierarchy).toBeNull();
    });

    it('should return null for wrong domain', async () => {
      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "P", status: SCOPING }]) { projects { id } } }
      `);
      const projId = projData!.createProjects.projects[0].id;
      await connectToDomain('Project', projId, domainSlug);

      const { data } = await executeGraphQL(`
        query { projectHierarchy(projectId: "${projId}", domainSlug: "wrong-domain") { id } }
      `);
      expect(data!.projectHierarchy).toBeNull();
    });
  });

  // =====================================================================
  // graphHealth query
  // =====================================================================

  describe('graphHealth query', () => {
    it('should return combined discovery + development counts and cross-graph stats', async () => {
      // Seed discovery artifacts
      const { data: objData } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Obj", status: ACTIVE }]) { objectives { id } } }
      `);
      await connectToDomain('Objective', objData!.createObjectives.objectives[0].id, domainSlug);

      const { data: oppData } = await executeGraphQL(`
        mutation { createOpportunities(input: [{ name: "Opp", status: ACTIVE }]) { opportunities { id } } }
      `);
      await connectToDomain('Opportunity', oppData!.createOpportunities.opportunities[0].id, domainSlug);

      // Idea — will be linked to a project (so NOT "no delivery")
      const { data: ideaData } = await executeGraphQL(`
        mutation { createIdeas(input: [{ name: "Idea", status: VALIDATED }]) { ideas { id } } }
      `);
      const ideaId = ideaData!.createIdeas.ideas[0].id;
      await connectToDomain('Idea', ideaId, domainSlug);

      // Seed development artifacts
      const { data: initData } = await executeGraphQL(`
        mutation { createInitiatives(input: [{ name: "Init", status: ACTIVE }]) { initiatives { id } } }
      `);
      await connectToDomain('Initiative', initData!.createInitiatives.initiatives[0].id, domainSlug);

      // Project with no discovery link
      const { data: projData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "Proj No Link", status: PLANNING }]) { projects { id } } }
      `);
      const projNoLinkId = projData!.createProjects.projects[0].id;
      await connectToDomain('Project', projNoLinkId, domainSlug);

      // Project with discovery link
      const { data: projLinkedData } = await executeGraphQL(`
        mutation { createProjects(input: [{ name: "Proj Linked", status: SCOPING }]) { projects { id } } }
      `);
      const projLinkedId = projLinkedData!.createProjects.projects[0].id;
      await connectToDomain('Project', projLinkedId, domainSlug);
      await connectNodes('Project', projLinkedId, 'FROM_DISCOVERY', 'Idea', ideaId);

      const { data: epicData } = await executeGraphQL(`
        mutation { createEpics(input: [{ name: "E1", status: DRAFT }]) { epics { id } } }
      `);
      await connectToDomain('Epic', epicData!.createEpics.epics[0].id, domainSlug);

      const { data: storyData } = await executeGraphQL(`
        mutation { createStories(input: [{ name: "S1", status: DRAFT }]) { stories { id } } }
      `);
      await connectToDomain('Story', storyData!.createStories.stories[0].id, domainSlug);

      const { data: story2Data } = await executeGraphQL(`
        mutation { createStories(input: [{ name: "S2", status: READY }]) { stories { id } } }
      `);
      await connectToDomain('Story', story2Data!.createStories.stories[0].id, domainSlug);

      const { data: taskData } = await executeGraphQL(`
        mutation { createTasks(input: [{ name: "T1", status: TODO }]) { tasks { id } } }
      `);
      await connectToDomain('Task', taskData!.createTasks.tasks[0].id, domainSlug);

      // Query graphHealth
      const { data, errors } = await executeGraphQL(`
        query { graphHealth(domainSlug: "${domainSlug}") {
          totalObjectives totalOpportunities totalIdeas totalAssumptions totalExperiments
          totalInitiatives totalProjects totalEpics totalStories totalTasks
          untestedHighImportanceAssumptions ideasWithNoAssumptions orphanedOpportunities
          ideasWithNoDelivery projectsWithNoDiscoveryLink
        }}
      `);

      expect(errors).toBeUndefined();
      const h = data!.graphHealth;
      expect(h.totalObjectives).toBe(1);
      expect(h.totalOpportunities).toBe(1);
      expect(h.totalIdeas).toBe(1);
      expect(h.totalAssumptions).toBe(0);
      expect(h.totalExperiments).toBe(0);
      expect(h.totalInitiatives).toBe(1);
      expect(h.totalProjects).toBe(2);
      expect(h.totalEpics).toBe(1);
      expect(h.totalStories).toBe(2);
      expect(h.totalTasks).toBe(1);
      // Cross-graph stats: idea has FROM_DISCOVERY link from projLinked, so ideasWithNoDelivery = 0
      expect(h.ideasWithNoDelivery).toBe(0);
      // One project has no discovery link
      expect(h.projectsWithNoDiscoveryLink).toBe(1);
      // Opp is orphaned (no SUPPORTS -> Objective)
      expect(h.orphanedOpportunities).toBe(1);
    });

    it('should return all zeros for empty domain', async () => {
      const emptySlug = testDomain();
      await seedDomain(emptySlug);

      const { data } = await executeGraphQL(`
        query { graphHealth(domainSlug: "${emptySlug}") {
          totalObjectives totalOpportunities totalIdeas totalAssumptions totalExperiments
          totalInitiatives totalProjects totalEpics totalStories totalTasks
          untestedHighImportanceAssumptions ideasWithNoAssumptions orphanedOpportunities
          ideasWithNoDelivery projectsWithNoDiscoveryLink
        }}
      `);

      const h = data!.graphHealth;
      expect(h.totalInitiatives).toBe(0);
      expect(h.totalProjects).toBe(0);
      expect(h.totalEpics).toBe(0);
      expect(h.totalStories).toBe(0);
      expect(h.totalTasks).toBe(0);
      expect(h.ideasWithNoDelivery).toBe(0);
      expect(h.projectsWithNoDiscoveryLink).toBe(0);
    });
  });
});
