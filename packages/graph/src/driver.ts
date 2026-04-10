import neo4j, { type Driver } from 'neo4j-driver';

export type { Driver } from 'neo4j-driver';

export function createDriver(): Driver {
  return neo4j.driver(
    process.env.NEO4J_URI ?? 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER ?? 'neo4j',
      process.env.NEO4J_PASSWORD ?? 'forgedev'
    )
  );
}

/**
 * Verify Neo4j connectivity. Logs the URI on success, re-throws on failure.
 */
export async function verifyConnection(driver: Driver): Promise<void> {
  const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
  try {
    await driver.verifyConnectivity();
    console.log(`Connected to Neo4j at ${uri}`);
  } catch (error) {
    console.error(`Failed to connect to Neo4j at ${uri}`);
    throw error;
  }
}
