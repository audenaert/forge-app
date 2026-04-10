import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createDriver, verifyConnection, createSchema, applyConstraints } from '@forge-workspace/graph';
import { errorClassificationPlugin } from './plugins/errorClassification.js';
import { queryTimingPlugin } from './plugins/queryTiming.js';
import { resolveDomainFromApiKey, extractApiKey } from './auth.js';
import { GraphQLError } from 'graphql';
import type { Driver } from 'neo4j-driver';

// Module-level driver so the health check route can access it
let driver: Driver;

async function main(): Promise<void> {
  driver = createDriver();

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

  await server.start();

  const disableAuth = process.env.DISABLE_AUTH === 'true';
  const port = Number(process.env.PORT ?? 4000);

  const app = express();

  // Health check — verify actual Neo4j connectivity
  app.get('/health', async (_req, res) => {
    const session = driver.session();
    try {
      await session.run('RETURN 1');
      res.json({ status: 'ok' });
    } catch (err) {
      res.status(503).json({ status: 'error', message: 'Neo4j unreachable' });
    } finally {
      await session.close();
    }
  });

  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const apiKey = extractApiKey({
          authorization: req.headers.authorization,
          'x-api-key': req.headers['x-api-key'] as string | undefined,
        });

        if (!apiKey) {
          // Only skip auth when explicitly disabled (local dev)
          if (disableAuth) {
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
    })
  );

  app.listen(port, () => {
    console.log(`Forge API ready at http://localhost:${port}/graphql`);
  });
}

main().catch((err: unknown) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
