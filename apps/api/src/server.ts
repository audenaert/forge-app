import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createDriver, verifyConnection, createSchema, applyConstraints } from '@forge-workspace/graph';
import { errorClassificationPlugin } from './plugins/errorClassification.js';
import { queryTimingPlugin } from './plugins/queryTiming.js';
import { resolveDomainFromApiKey, extractApiKey } from './auth.js';
import { GraphQLError } from 'graphql';

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

  const isDevelopment = process.env.NODE_ENV === 'development';

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT ?? 4000) },
    context: async ({ req }) => {
      const apiKey = extractApiKey({
        authorization: req.headers.authorization,
        'x-api-key': req.headers['x-api-key'] as string | undefined,
      });

      if (!apiKey) {
        // In development mode, fall back to 'default' domain when no key is provided
        if (isDevelopment) {
          return { domainSlug: 'default' };
        }
        throw new GraphQLError('Missing API key. Provide Authorization: Bearer <key> or X-API-Key: <key> header.', {
          extensions: { code: 'UNAUTHORIZED' },
        });
      }

      const domainSlug = await resolveDomainFromApiKey(driver, apiKey);
      if (!domainSlug) {
        throw new GraphQLError('Invalid API key.', {
          extensions: { code: 'UNAUTHORIZED' },
        });
      }

      return { domainSlug };
    },
  });

  console.log(`Forge API ready at ${url}`);
}

main().catch((err: unknown) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
