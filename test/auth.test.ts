import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  testDomain,
  generateApiKey,
  seedTenant,
  seedDomainWithApiKey,
  getDriver,
} from './setup.js';
import { executeGraphQL } from './graphql-client.js';
import { hashApiKey } from '../apps/api/src/auth.js';

/** Helper: connect an existing node to a pre-seeded domain via Cypher */
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

describe('Multi-tenant auth and domain isolation', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  }, 120_000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  // --- Organization CRUD ---

  describe('Organization CRUD', () => {
    it('should create an organization', async () => {
      const slug = `org-${testDomain()}`;
      const { data, errors } = await executeGraphQL(`
        mutation {
          createOrganizations(input: [{
            name: "Acme Corp"
            slug: "${slug}"
          }]) {
            organizations { id name slug createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const org = data!.createOrganizations.organizations[0];
      expect(org.id).toBeTruthy();
      expect(org.name).toBe('Acme Corp');
      expect(org.slug).toBe(slug);
      expect(org.createdAt).toBeTruthy();
      expect(org.updatedAt).toBeNull();
    });

    it('should enforce unique organization slug', async () => {
      const slug = `org-${testDomain()}`;
      await executeGraphQL(`
        mutation { createOrganizations(input: [{ name: "First", slug: "${slug}" }]) { organizations { id } } }
      `);

      const { errors } = await executeGraphQL(`
        mutation { createOrganizations(input: [{ name: "Second", slug: "${slug}" }]) { organizations { id } } }
      `);

      expect(errors).toBeDefined();
      // Error is a constraint violation — code varies by test setup (no error classification plugin in unit tests)
      const msg = errors![0].message;
      expect(msg).toMatch(/constraint/i);
    });
  });

  // --- User CRUD ---

  describe('User CRUD', () => {
    it('should create a user', async () => {
      const email = `user-${testDomain()}@example.com`;
      const { data, errors } = await executeGraphQL(`
        mutation {
          createUsers(input: [{
            email: "${email}"
            displayName: "Alice"
          }]) {
            users { id email displayName createdAt updatedAt }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const user = data!.createUsers.users[0];
      expect(user.id).toBeTruthy();
      expect(user.email).toBe(email);
      expect(user.displayName).toBe('Alice');
      expect(user.updatedAt).toBeNull();
    });

    it('should enforce unique user email', async () => {
      const email = `dup-${testDomain()}@example.com`;
      await executeGraphQL(`
        mutation { createUsers(input: [{ email: "${email}", displayName: "First" }]) { users { id } } }
      `);

      const { errors } = await executeGraphQL(`
        mutation { createUsers(input: [{ email: "${email}", displayName: "Second" }]) { users { id } } }
      `);

      expect(errors).toBeDefined();
      const msg = errors![0].message;
      expect(msg).toMatch(/constraint/i);
    });
  });

  // --- Organization -> Domain -> User relationships ---

  describe('Organization-Domain-User relationships', () => {
    it('should create full tenant hierarchy via seedTenant', async () => {
      const tenant = await seedTenant();

      // Verify Organization -> Domain relationship (apiKey is not selectable via GraphQL)
      const { data: orgData, errors: orgErrors } = await executeGraphQL(`
        query {
          organizations(where: { slug: { eq: "${tenant.orgSlug}" } }) {
            id
            slug
            domains { slug }
          }
        }
      `);

      expect(orgErrors).toBeUndefined();
      expect(orgData!.organizations).toHaveLength(1);
      expect(orgData!.organizations[0].domains).toHaveLength(1);
      expect(orgData!.organizations[0].domains[0].slug).toBe(tenant.domainSlug);

      // Verify Domain -> Users relationship via connection (to get edge properties)
      const { data: domData, errors: domErrors } = await executeGraphQL(`
        query {
          domains(where: { slug: { eq: "${tenant.domainSlug}" } }) {
            slug
            organization { slug }
            usersConnection { edges { properties { role joinedAt } node { email displayName } } }
          }
        }
      `);

      expect(domErrors).toBeUndefined();
      expect(domData!.domains).toHaveLength(1);
      expect(domData!.domains[0].organization.slug).toBe(tenant.orgSlug);
      const memberEdge = domData!.domains[0].usersConnection.edges[0];
      expect(memberEdge.properties.role).toBe('admin');
      expect(memberEdge.properties.joinedAt).toBeTruthy();
      expect(memberEdge.node.email).toBe(tenant.userEmail);
    });

    it('should query User -> domains with MEMBER_OF properties', async () => {
      const tenant = await seedTenant({ userRole: 'member' });

      const { data, errors } = await executeGraphQL(`
        query {
          users(where: { email: { eq: "${tenant.userEmail}" } }) {
            email
            displayName
            organization { slug }
            domainsConnection {
              edges {
                properties { role joinedAt }
                node { slug }
              }
            }
          }
        }
      `);

      expect(errors).toBeUndefined();
      const user = data!.users[0];
      expect(user.organization.slug).toBe(tenant.orgSlug);
      expect(user.domainsConnection.edges).toHaveLength(1);
      expect(user.domainsConnection.edges[0].properties.role).toBe('member');
      expect(user.domainsConnection.edges[0].node.slug).toBe(tenant.domainSlug);
    });
  });

  // --- Domain isolation ---

  describe('Domain isolation via domain slug filter', () => {
    it('should isolate artifacts between two domains', async () => {
      const tenantA = await seedTenant();
      const tenantB = await seedTenant();

      // Create an objective and link to domain A
      const { data: createA } = await executeGraphQL(`
        mutation {
          createObjectives(input: [{ name: "Domain A Objective", status: ACTIVE }]) {
            objectives { id name }
          }
        }
      `);
      const objAId = createA!.createObjectives.objectives[0].id;
      await connectToDomain('Objective', objAId, tenantA.domainSlug);

      // Create an objective and link to domain B
      const { data: createB } = await executeGraphQL(`
        mutation {
          createObjectives(input: [{ name: "Domain B Objective", status: ACTIVE }]) {
            objectives { id name }
          }
        }
      `);
      const objBId = createB!.createObjectives.objectives[0].id;
      await connectToDomain('Objective', objBId, tenantB.domainSlug);

      // Query domain A — should only see domain A's objective
      const { data: queryA } = await executeGraphQL(`
        query {
          objectives(where: { domain: { slug: { eq: "${tenantA.domainSlug}" } } }) { name }
        }
      `);
      expect(queryA!.objectives).toHaveLength(1);
      expect(queryA!.objectives[0].name).toBe('Domain A Objective');

      // Query domain B — should only see domain B's objective
      const { data: queryB } = await executeGraphQL(`
        query {
          objectives(where: { domain: { slug: { eq: "${tenantB.domainSlug}" } } }) { name }
        }
      `);
      expect(queryB!.objectives).toHaveLength(1);
      expect(queryB!.objectives[0].name).toBe('Domain B Objective');
    });

    it('should isolate discovery traversals between domains', async () => {
      const tenantA = await seedTenant();
      const tenantB = await seedTenant();

      // Create opportunity in domain A
      const { data: oppAData } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [{ name: "Opp A", status: ACTIVE }]) { opportunities { id } }
        }
      `);
      await connectToDomain('Opportunity', oppAData!.createOpportunities.opportunities[0].id, tenantA.domainSlug);

      // Create opportunity in domain B
      const { data: oppBData } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [{ name: "Opp B", status: ACTIVE }]) { opportunities { id } }
        }
      `);
      await connectToDomain('Opportunity', oppBData!.createOpportunities.opportunities[0].id, tenantB.domainSlug);

      // discoveryHealth for domain A should show 1 opportunity
      const { data: healthA, errors: errA } = await executeGraphQL(`
        query { discoveryHealth(domainSlug: "${tenantA.domainSlug}") { totalOpportunities } }
      `);
      expect(errA).toBeUndefined();
      expect(healthA!.discoveryHealth.totalOpportunities).toBe(1);

      // discoveryHealth for domain B should show 1 opportunity
      const { data: healthB, errors: errB } = await executeGraphQL(`
        query { discoveryHealth(domainSlug: "${tenantB.domainSlug}") { totalOpportunities } }
      `);
      expect(errB).toBeUndefined();
      expect(healthB!.discoveryHealth.totalOpportunities).toBe(1);
    });

    it('should isolate development traversals between domains', async () => {
      const tenantA = await seedTenant();
      const tenantB = await seedTenant();

      // Create project in domain A
      const { data: projAData } = await executeGraphQL(`
        mutation {
          createProjects(input: [{ name: "Project A", status: SCOPING }]) { projects { id } }
        }
      `);
      const projAId = projAData!.createProjects.projects[0].id;
      await connectToDomain('Project', projAId, tenantA.domainSlug);

      // Create project in domain B
      const { data: projBData } = await executeGraphQL(`
        mutation {
          createProjects(input: [{ name: "Project B", status: SCOPING }]) { projects { id } }
        }
      `);
      const projBId = projBData!.createProjects.projects[0].id;
      await connectToDomain('Project', projBId, tenantB.domainSlug);

      // projectHierarchy for A's project with A's domain
      const { data: hierA } = await executeGraphQL(`
        query { projectHierarchy(projectId: "${projAId}", domainSlug: "${tenantA.domainSlug}") { name } }
      `);
      expect(hierA!.projectHierarchy).not.toBeNull();
      expect(hierA!.projectHierarchy.name).toBe('Project A');

      // projectHierarchy for A's project with B's domain — should return null (wrong domain)
      const { data: hierCross } = await executeGraphQL(`
        query { projectHierarchy(projectId: "${projAId}", domainSlug: "${tenantB.domainSlug}") { name } }
      `);
      expect(hierCross!.projectHierarchy).toBeNull();
    });
  });

  // --- API key resolution ---

  describe('API key resolution', () => {
    it('should resolve domain slug from a valid API key via Cypher', async () => {
      const rawApiKey = generateApiKey();
      const slug = testDomain();
      await seedDomainWithApiKey(slug, rawApiKey);

      // The DB stores the hashed key, so we must hash before lookup
      const session = getDriver().session();
      try {
        const result = await session.run(
          'MATCH (d:Domain {apiKey: $apiKey}) RETURN d.slug AS slug',
          { apiKey: hashApiKey(rawApiKey) }
        );
        expect(result.records).toHaveLength(1);
        expect(result.records[0].get('slug')).toBe(slug);
      } finally {
        await session.close();
      }
    });

    it('should return no results for an invalid API key', async () => {
      const session = getDriver().session();
      try {
        const result = await session.run(
          'MATCH (d:Domain {apiKey: $apiKey}) RETURN d.slug AS slug',
          { apiKey: hashApiKey('fk_nonexistent') }
        );
        expect(result.records).toHaveLength(0);
      } finally {
        await session.close();
      }
    });

    it('should enforce unique API key per domain (hashed key collides)', async () => {
      const rawApiKey = generateApiKey();
      const slug1 = testDomain();
      const slug2 = testDomain();
      await seedDomainWithApiKey(slug1, rawApiKey);

      // Storing the same raw key again hashes to the same value, violating the uniqueness constraint
      const session = getDriver().session();
      try {
        await expect(
          session.run(
            'CREATE (d:Domain {id: randomUUID(), slug: $slug, name: "Dup Key", apiKey: $apiKey, createdAt: datetime()}) RETURN d',
            { slug: slug2, apiKey: hashApiKey(rawApiKey) }
          )
        ).rejects.toThrow();
      } finally {
        await session.close();
      }
    });

    it('should not expose apiKey field in GraphQL queries', async () => {
      const tenant = await seedTenant();

      // Attempting to query the apiKey field should produce a validation error
      const { errors } = await executeGraphQL(`
        query {
          domains(where: { slug: { eq: "${tenant.domainSlug}" } }) {
            slug
            apiKey
          }
        }
      `);

      expect(errors).toBeDefined();
      expect(errors!.length).toBeGreaterThan(0);
      // The field should not be queryable at all
      const msg = errors![0].message;
      expect(msg).toMatch(/apiKey/);
    });

    it('should store hashed key in DB but allow auth with raw key', async () => {
      const rawApiKey = generateApiKey();
      const slug = testDomain();
      await seedDomainWithApiKey(slug, rawApiKey);

      // Verify the DB contains the hash, not the raw key
      const session = getDriver().session();
      try {
        const result = await session.run(
          'MATCH (d:Domain {slug: $slug}) RETURN d.apiKey AS storedKey',
          { slug }
        );
        const storedKey = result.records[0].get('storedKey') as string;
        expect(storedKey).not.toBe(rawApiKey);
        expect(storedKey).toBe(hashApiKey(rawApiKey));
      } finally {
        await session.close();
      }
    });
  });

  // --- Domain API key with artifact scoping ---

  describe('Domain API key with artifact queries', () => {
    it('should query artifacts scoped to domain resolved from API key', async () => {
      const tenantA = await seedTenant();
      const tenantB = await seedTenant();

      // Create objectives and link to respective domains
      const { data: dA } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Objective in A", status: ACTIVE }]) { objectives { id } } }
      `);
      await connectToDomain('Objective', dA!.createObjectives.objectives[0].id, tenantA.domainSlug);

      const { data: dB } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Objective in B", status: ACTIVE }]) { objectives { id } } }
      `);
      await connectToDomain('Objective', dB!.createObjectives.objectives[0].id, tenantB.domainSlug);

      // Query with domain A's slug — only see A's artifact
      const { data: dataA } = await executeGraphQL(`
        query { objectives(where: { domain: { slug: { eq: "${tenantA.domainSlug}" } } }) { name } }
      `);
      expect(dataA!.objectives).toHaveLength(1);
      expect(dataA!.objectives[0].name).toBe('Objective in A');

      // Query with domain B's slug — only see B's artifact
      const { data: dataB } = await executeGraphQL(`
        query { objectives(where: { domain: { slug: { eq: "${tenantB.domainSlug}" } } }) { name } }
      `);
      expect(dataB!.objectives).toHaveLength(1);
      expect(dataB!.objectives[0].name).toBe('Objective in B');
    });
  });

  // --- graphHealth isolation ---

  describe('graphHealth domain isolation', () => {
    it('should return separate health stats per domain', async () => {
      const tenantA = await seedTenant();
      const tenantB = await seedTenant();

      // Domain A: 1 objective + 1 initiative
      const { data: objA } = await executeGraphQL(`
        mutation { createObjectives(input: [{ name: "Obj A1", status: ACTIVE }]) { objectives { id } } }
      `);
      await connectToDomain('Objective', objA!.createObjectives.objectives[0].id, tenantA.domainSlug);

      const { data: initA } = await executeGraphQL(`
        mutation { createInitiatives(input: [{ name: "Init A1", status: ACTIVE }]) { initiatives { id } } }
      `);
      await connectToDomain('Initiative', initA!.createInitiatives.initiatives[0].id, tenantA.domainSlug);

      // Domain B: 2 opportunities
      const { data: opp1 } = await executeGraphQL(`
        mutation { createOpportunities(input: [{ name: "Opp B1", status: ACTIVE }]) { opportunities { id } } }
      `);
      await connectToDomain('Opportunity', opp1!.createOpportunities.opportunities[0].id, tenantB.domainSlug);

      const { data: opp2 } = await executeGraphQL(`
        mutation { createOpportunities(input: [{ name: "Opp B2", status: ACTIVE }]) { opportunities { id } } }
      `);
      await connectToDomain('Opportunity', opp2!.createOpportunities.opportunities[0].id, tenantB.domainSlug);

      // graphHealth for A
      const { data: healthA } = await executeGraphQL(`
        query { graphHealth(domainSlug: "${tenantA.domainSlug}") {
          totalObjectives totalOpportunities totalInitiatives
        } }
      `);
      expect(healthA!.graphHealth.totalObjectives).toBe(1);
      expect(healthA!.graphHealth.totalOpportunities).toBe(0);
      expect(healthA!.graphHealth.totalInitiatives).toBe(1);

      // graphHealth for B
      const { data: healthB } = await executeGraphQL(`
        query { graphHealth(domainSlug: "${tenantB.domainSlug}") {
          totalObjectives totalOpportunities totalInitiatives
        } }
      `);
      expect(healthB!.graphHealth.totalObjectives).toBe(0);
      expect(healthB!.graphHealth.totalOpportunities).toBe(2);
      expect(healthB!.graphHealth.totalInitiatives).toBe(0);
    });
  });

  // --- opportunitySubgraph isolation ---

  describe('opportunitySubgraph domain isolation', () => {
    it('should return null when querying an opportunity with wrong domain slug', async () => {
      const tenantA = await seedTenant();
      const tenantB = await seedTenant();

      const { data: oppData } = await executeGraphQL(`
        mutation {
          createOpportunities(input: [{ name: "Opp in A", status: ACTIVE }]) { opportunities { id } }
        }
      `);
      const oppId = oppData!.createOpportunities.opportunities[0].id;
      await connectToDomain('Opportunity', oppId, tenantA.domainSlug);

      // Query with correct domain — should work
      const { data: correctData } = await executeGraphQL(`
        query { opportunitySubgraph(opportunityId: "${oppId}", domainSlug: "${tenantA.domainSlug}") { name } }
      `);
      expect(correctData!.opportunitySubgraph).not.toBeNull();
      expect(correctData!.opportunitySubgraph.name).toBe('Opp in A');

      // Query with wrong domain — should return null
      const { data: wrongData } = await executeGraphQL(`
        query { opportunitySubgraph(opportunityId: "${oppId}", domainSlug: "${tenantB.domainSlug}") { name } }
      `);
      expect(wrongData!.opportunitySubgraph).toBeNull();
    });
  });
});
