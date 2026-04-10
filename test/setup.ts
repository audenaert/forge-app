import { Neo4jContainer, type StartedNeo4jContainer } from '@testcontainers/neo4j';
import neo4j, { type Driver } from 'neo4j-driver';
import { randomUUID } from 'node:crypto';
import { ApolloServer } from '@apollo/server';
import { createSchema } from '@forge-workspace/graph';
import { applyConstraints } from '@forge-workspace/graph';
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

  container = await new Neo4jContainer('neo4j:5').withApoc().start();

  driver = neo4j.driver(
    container.getBoltUri(),
    neo4j.auth.basic(container.getUsername(), container.getPassword())
  );

  await driver.verifyConnectivity();
  await applyConstraints(driver);

  schema = await createSchema(driver);

  server = new ApolloServer({ schema });
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
