import { Neo4jGraphQL } from '@neo4j/graphql';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Driver } from 'neo4j-driver';
import type { GraphQLSchema } from 'graphql';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function loadTypeDefs(): string {
  const dir = join(__dirname, 'typeDefs');
  const common = readFileSync(join(dir, 'common.graphql'), 'utf-8');
  const tenancy = readFileSync(join(dir, 'tenancy.graphql'), 'utf-8');
  const discovery = readFileSync(join(dir, 'discovery.graphql'), 'utf-8');
  const development = readFileSync(join(dir, 'development.graphql'), 'utf-8');
  return [common, tenancy, discovery, development].join('\n');
}

export async function createSchema(driver: Driver): Promise<GraphQLSchema> {
  const typeDefs = loadTypeDefs();
  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  return neoSchema.getSchema();
}
