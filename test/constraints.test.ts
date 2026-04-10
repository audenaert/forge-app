import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, getDriver } from './setup.js';
import { applyConstraints } from '@forge-workspace/graph';

describe('Constraint initialization', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  }, 120_000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should be idempotent — calling applyConstraints twice succeeds', async () => {
    // Constraints were already applied in setupTestEnvironment.
    // Calling again should not throw.
    await expect(applyConstraints(getDriver())).resolves.not.toThrow();
  });

  it('should have all 6 uniqueness constraints', async () => {
    const session = getDriver().session();
    try {
      const result = await session.run('SHOW CONSTRAINTS');
      const constraints = result.records.map((r) => r.toObject());
      const uniqueConstraintNames = constraints
        .filter((c) => c.type === 'UNIQUENESS')
        .map((c) => c.name);

      expect(uniqueConstraintNames).toContain('domain_slug');
      expect(uniqueConstraintNames).toContain('objective_id');
      expect(uniqueConstraintNames).toContain('opportunity_id');
      expect(uniqueConstraintNames).toContain('idea_id');
      expect(uniqueConstraintNames).toContain('assumption_id');
      expect(uniqueConstraintNames).toContain('experiment_id');
    } finally {
      await session.close();
    }
  });

  it('should have all indexes', async () => {
    const session = getDriver().session();
    try {
      const result = await session.run('SHOW INDEXES');
      const indexes = result.records.map((r) => r.toObject());
      const indexNames = indexes.map((i) => i.name);

      expect(indexNames).toContain('opp_domain_status');
      expect(indexNames).toContain('assumption_domain_status');
    } finally {
      await session.close();
    }
  });
});
