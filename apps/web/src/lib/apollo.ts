import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql',
  headers: {
    // Server reads headers['x-api-key'] (Express lowercases all header names).
    // Browser fetch is case-insensitive for HTTP/2, case-preserving for HTTP/1.1.
    // Using the canonical casing; works in both protocols.
    'x-api-key': import.meta.env.VITE_API_KEY ?? '',
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
