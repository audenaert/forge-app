import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const apiKey = import.meta.env.VITE_API_KEY ?? '';
if (!apiKey) {
  // Warn loudly but don't throw — throwing at module load would crash the app
  // before any UI can render, which is a worse failure mode than a logged warning.
  console.warn(
    '[apollo] VITE_API_KEY is not set. GraphQL requests will be rejected by apps/api. ' +
      'Set VITE_API_KEY=seed-dev-key in apps/web/.env.local for local development.',
  );
}

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql',
  headers: {
    // Server reads headers['x-api-key'] (Express lowercases all header names).
    // Browser fetch is case-insensitive for HTTP/2, case-preserving for HTTP/1.1.
    // Using the canonical casing; works in both protocols.
    'x-api-key': apiKey,
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
