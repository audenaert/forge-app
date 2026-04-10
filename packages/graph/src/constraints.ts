import type { Driver } from 'neo4j-driver';

const UNIQUENESS_CONSTRAINTS = [
  'CREATE CONSTRAINT domain_slug IF NOT EXISTS FOR (d:Domain) REQUIRE d.slug IS UNIQUE',
  'CREATE CONSTRAINT objective_id IF NOT EXISTS FOR (n:Objective) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT opportunity_id IF NOT EXISTS FOR (n:Opportunity) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT idea_id IF NOT EXISTS FOR (n:Idea) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT assumption_id IF NOT EXISTS FOR (n:Assumption) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT experiment_id IF NOT EXISTS FOR (n:Experiment) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT initiative_id IF NOT EXISTS FOR (n:Initiative) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT project_id IF NOT EXISTS FOR (n:Project) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT epic_id IF NOT EXISTS FOR (n:Epic) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT story_id IF NOT EXISTS FOR (n:Story) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT task_id IF NOT EXISTS FOR (n:Task) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT enhancement_id IF NOT EXISTS FOR (n:Enhancement) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT bug_id IF NOT EXISTS FOR (n:Bug) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT chore_id IF NOT EXISTS FOR (n:Chore) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT spike_id IF NOT EXISTS FOR (n:Spike) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT spec_id IF NOT EXISTS FOR (n:Spec) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT adr_id IF NOT EXISTS FOR (n:ADR) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT dev_workstream_id IF NOT EXISTS FOR (n:DevWorkstream) REQUIRE n.id IS UNIQUE',
  'CREATE CONSTRAINT dev_milestone_id IF NOT EXISTS FOR (n:DevMilestone) REQUIRE n.id IS UNIQUE',
];

const INDEXES = [
  'CREATE INDEX opp_domain_status IF NOT EXISTS FOR (n:Opportunity) ON (n.status)',
  'CREATE INDEX assumption_domain_status IF NOT EXISTS FOR (n:Assumption) ON (n.status, n.importance)',
];

/**
 * Apply all database constraints and indexes. Idempotent — safe to call on every startup.
 */
export async function applyConstraints(driver: Driver): Promise<void> {
  const session = driver.session();
  try {
    for (const statement of UNIQUENESS_CONSTRAINTS) {
      const result = await session.run(statement);
      const name = statement.match(/CONSTRAINT (\S+)/)?.[1] ?? 'unknown';
      console.log(`Constraint ${name}: applied (${result.summary.counters.updates().constraintsAdded > 0 ? 'created' : 'already exists'})`);
    }

    for (const statement of INDEXES) {
      const result = await session.run(statement);
      const name = statement.match(/INDEX (\S+)/)?.[1] ?? 'unknown';
      console.log(`Index ${name}: applied (${result.summary.counters.updates().indexesAdded > 0 ? 'created' : 'already exists'})`);
    }
  } finally {
    await session.close();
  }
}
