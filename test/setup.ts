import { Neo4jContainer, type StartedNeo4jContainer } from '@testcontainers/neo4j';
import neo4j, { type Driver } from 'neo4j-driver';
import { randomUUID } from 'node:crypto';
import { ApolloServer } from '@apollo/server';
import { createSchema } from '@forge-workspace/graph';
import { applyConstraints } from '@forge-workspace/graph';
import { errorClassificationPlugin } from '../apps/api/src/plugins/errorClassification.js';
import { hashApiKey } from '../apps/api/src/auth.js';
import type { GraphQLSchema } from 'graphql';

let container: StartedNeo4jContainer | undefined;
let driver: Driver | undefined;
let schema: GraphQLSchema | undefined;
let server: ApolloServer | undefined;
let refCount = 0;

/**
 * Generate a unique domain slug for test isolation.
 */
export function testDomain(): string {
  return `test-${randomUUID().slice(0, 8)}`;
}

export function getDriver(): Driver {
  if (!driver) throw new Error('Test environment not initialized');
  return driver;
}

export function getServer(): ApolloServer {
  if (!server) throw new Error('Test environment not initialized');
  return server;
}

export function getSchema(): GraphQLSchema {
  if (!schema) throw new Error('Test environment not initialized');
  return schema;
}

/**
 * Start a shared Neo4j testcontainer and initialize the schema.
 * Reference-counted: multiple suites share the same container.
 */
export async function setupTestEnvironment(): Promise<void> {
  refCount++;
  if (container) return; // Already started

  container = await new Neo4jContainer('neo4j:5').withApoc().withStartupTimeout(600_000).start();

  driver = neo4j.driver(
    container.getBoltUri(),
    neo4j.auth.basic(container.getUsername(), container.getPassword())
  );

  await driver.verifyConnectivity();
  await applyConstraints(driver);

  schema = await createSchema(driver);

  server = new ApolloServer({ schema, plugins: [errorClassificationPlugin()] });
  await server.start();
}

/**
 * Clean up the testcontainer and driver.
 * Only actually tears down when the last suite finishes.
 */
export async function teardownTestEnvironment(): Promise<void> {
  refCount--;
  if (refCount > 0) return;

  await server?.stop();
  server = undefined;
  await driver?.close();
  driver = undefined;
  await container?.stop();
  container = undefined;
}

/**
 * Create a Domain node for test isolation. Returns the domain slug.
 */
export async function seedDomain(slug: string, name?: string): Promise<string> {
  const d = getDriver();
  const session = d.session();
  try {
    await session.run(
      'CREATE (d:Domain {id: randomUUID(), slug: $slug, name: $name, createdAt: datetime()}) RETURN d',
      { slug, name: name ?? `Test Domain ${slug}` }
    );
    return slug;
  } finally {
    await session.close();
  }
}

/**
 * Generate a unique API key for testing.
 */
export function generateApiKey(): string {
  return `fk_${randomUUID()}`;
}

/**
 * Seed a complete tenant: Organization + Domain (with API key) + User.
 * Returns all created identifiers for use in tests.
 */
export async function seedTenant(options?: {
  orgSlug?: string;
  orgName?: string;
  domainSlug?: string;
  domainName?: string;
  apiKey?: string;
  userEmail?: string;
  userDisplayName?: string;
  userRole?: string;
}): Promise<{
  orgId: string;
  orgSlug: string;
  domainId: string;
  domainSlug: string;
  apiKey: string;
  userId: string;
  userEmail: string;
}> {
  const d = getDriver();
  const session = d.session();

  const orgSlug = options?.orgSlug ?? `org-${randomUUID().slice(0, 8)}`;
  const domainSlug = options?.domainSlug ?? testDomain();
  const rawApiKey = options?.apiKey ?? generateApiKey();
  const hashedKey = hashApiKey(rawApiKey);
  const userEmail = options?.userEmail ?? `user-${randomUUID().slice(0, 8)}@test.com`;

  try {
    const result = await session.run(
      `
      CREATE (org:Organization {
        id: randomUUID(),
        slug: $orgSlug,
        name: $orgName,
        createdAt: datetime()
      })
      CREATE (dom:Domain {
        id: randomUUID(),
        slug: $domainSlug,
        name: $domainName,
        apiKey: $apiKey,
        createdAt: datetime()
      })
      CREATE (usr:User {
        id: randomUUID(),
        email: $userEmail,
        displayName: $userDisplayName,
        createdAt: datetime()
      })
      CREATE (dom)-[:BELONGS_TO_ORG]->(org)
      CREATE (usr)-[:BELONGS_TO_ORG]->(org)
      CREATE (usr)-[:MEMBER_OF {role: $userRole, joinedAt: datetime()}]->(dom)
      RETURN org.id AS orgId, org.slug AS orgSlug,
             dom.id AS domainId, dom.slug AS domainSlug,
             usr.id AS userId, usr.email AS userEmail
      `,
      {
        orgSlug,
        orgName: options?.orgName ?? `Org ${orgSlug}`,
        domainSlug,
        domainName: options?.domainName ?? `Domain ${domainSlug}`,
        apiKey: hashedKey,
        userEmail,
        userDisplayName: options?.userDisplayName ?? `Test User`,
        userRole: options?.userRole ?? 'admin',
      }
    );

    const record = result.records[0];
    // Return the raw (unhashed) API key — callers use it for auth headers
    return {
      orgId: record.get('orgId'),
      orgSlug: record.get('orgSlug'),
      domainId: record.get('domainId'),
      domainSlug: record.get('domainSlug'),
      apiKey: rawApiKey,
      userId: record.get('userId'),
      userEmail: record.get('userEmail'),
    };
  } finally {
    await session.close();
  }
}

/**
 * Create a Domain node with an API key for auth testing.
 * Simpler than seedTenant when you just need a domain with a key.
 */
/**
 * Connect an existing node to a domain via BELONGS_TO relationship.
 */
export async function connectToDomain(label: string, nodeId: string, slug: string): Promise<void> {
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

/**
 * Connect two nodes with a typed relationship via Cypher.
 * Used for singular @relationship fields that don't support connect in mutations.
 */
export async function connectNodes(
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

export async function seedDomainWithApiKey(
  slug: string,
  apiKey: string,
  name?: string
): Promise<string> {
  const d = getDriver();
  const session = d.session();
  const hashedKey = hashApiKey(apiKey);
  try {
    await session.run(
      'CREATE (d:Domain {id: randomUUID(), slug: $slug, name: $name, apiKey: $apiKey, createdAt: datetime()}) RETURN d',
      { slug, name: name ?? `Test Domain ${slug}`, apiKey: hashedKey }
    );
    return slug;
  } finally {
    await session.close();
  }
}
