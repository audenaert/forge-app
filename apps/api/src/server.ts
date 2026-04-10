import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createDriver, verifyConnection, createSchema, applyConstraints } from '@forge-workspace/graph';
import { errorClassificationPlugin } from './plugins/errorClassification.js';
import { queryTimingPlugin } from './plugins/queryTiming.js';

async function main(): Promise<void> {
  const driver = createDriver();

  // Fail fast if Neo4j is unreachable
  await verifyConnection(driver);

  // Apply database constraints and indexes
  await applyConstraints(driver);
  console.log('Database constraints applied');

  // Build executable GraphQL schema
  const schema = await createSchema(driver);
  console.log('GraphQL schema generated');

  const server = new ApolloServer({
    schema,
    plugins: [
      errorClassificationPlugin(),
      queryTimingPlugin(),
    ],
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT ?? 4000) },
    context: async () => ({
      // M1: hard-coded domain. M2+ will resolve from API key header.
      domainSlug: 'default',
    }),
  });

  console.log(`Forge API ready at ${url}`);
}

main().catch((err: unknown) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
