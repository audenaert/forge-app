import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, getDriver } from './setup.js';

describe('Health check', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  }, 120_000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should verify Neo4j connectivity with RETURN 1 query', async () => {
    const session = getDriver().session();
    try {
      const result = await session.run('RETURN 1 AS value');
      expect(result.records).toHaveLength(1);
      expect(result.records[0].get('value').toNumber()).toBe(1);
    } finally {
      await session.close();
    }
  });

  it('should return an error for an invalid query', async () => {
    const session = getDriver().session();
    try {
      await expect(session.run('INVALID CYPHER')).rejects.toThrow();
    } finally {
      await session.close();
    }
  });
});
